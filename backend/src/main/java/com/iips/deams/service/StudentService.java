package com.iips.deams.service;

import com.iips.deams.dto.ExamQuestionView;
import com.iips.deams.dto.ExamSubmissionRequest;
import com.iips.deams.dto.ProctorAlertRequest;
import com.iips.deams.event.ProctorInfractionEvent;
import com.iips.deams.model.*;
import com.iips.deams.model.enums.AttemptStatus;
import com.iips.deams.model.enums.ProctorEventType;
import com.iips.deams.repository.*;
import com.iips.deams.strategy.GradingStrategy;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final ExamScheduleRepository examRepo;
    private final ExamAttemptRepository attemptRepo;
    private final QuestionRepository questionRepo;
    private final UserRepository userRepo;
    private final ExamEngineService engineService;
    private final AuditService auditService;
    private final GradingStrategy gradingStrategy;
    private final ApplicationEventPublisher eventPublisher;

    public StudentService(ExamScheduleRepository examRepo, ExamAttemptRepository attemptRepo,
                          QuestionRepository questionRepo, UserRepository userRepo,
                          ExamEngineService engineService, AuditService auditService,
                          GradingStrategy gradingStrategy, ApplicationEventPublisher eventPublisher) {
        this.examRepo = examRepo; this.attemptRepo = attemptRepo; this.questionRepo = questionRepo;
        this.userRepo = userRepo; this.engineService = engineService; this.auditService = auditService;
        this.gradingStrategy = gradingStrategy; this.eventPublisher = eventPublisher;
    }

    public List<ExamSchedule> getAvailableExamsForStudent(String username) {
        userRepo.findByUsername(username).orElseThrow(() -> new RuntimeException("Student not found"));
        return examRepo.findAll();
    }

    public Map<String, Object> startExam(String examId, String username, String ip) {
        User student = userRepo.findByUsername(username).orElseThrow(() -> new RuntimeException("Student not found"));
        ExamSchedule exam = examRepo.findById(examId).orElseThrow(() -> new RuntimeException("Exam not found"));
        Optional<ExamAttempt> existing = attemptRepo.findByExamIdAndStudentId(examId, student.getId());
        ExamAttempt attempt;
        List<Question> rawQuestions = questionRepo.findAllById(exam.getQuestionIds());

        if (existing.isPresent()) {
            attempt = existing.get();
            if (attempt.isFinalized()) throw new RuntimeException("You have already submitted this exam.");
        } else {
            attempt = new ExamAttempt();
            attempt.setExamId(examId); attempt.setExamTitle(exam.getTitle());
            attempt.setSubjectCode(exam.getSubjectId()); attempt.setSubjectName(exam.getSubjectName());
            attempt.setStudentId(student.getId()); attempt.setStudentName(student.getFullName());
            attempt.setRollNo(student.getRollNoOrFacultyId()); attempt.setCourseId(student.getCourseId());
            attempt.setSemester(student.getSemester() != null ? student.getSemester() : 1);
            attempt.setMaxMarks(exam.getTotalMarks()); attempt.setStartTime(LocalDateTime.now());
            attempt.setStatus(AttemptStatus.IN_PROGRESS.name());

            List<String> shuffledIds = new ArrayList<>(exam.getQuestionIds());
            Collections.shuffle(shuffledIds, new Random());
            attempt.setShuffledQuestionIds(shuffledIds);

            List<ExamAttempt.StudentAnswer> initialAnswers = rawQuestions.stream().map(q -> {
                ExamAttempt.StudentAnswer sa = new ExamAttempt.StudentAnswer();
                sa.setQuestionId(q.getId()); sa.setQuestionType(q.getType());
                return sa;
            }).toList();
            attempt.setAnswers(initialAnswers);
            attempt = attemptRepo.save(attempt);
            auditService.log(student.getId(), student.getUsername(), "ROLE_STUDENT", "EXAM_STARTED", "STUDENT", "Started " + exam.getTitle(), ip);
        }

        List<ExamQuestionView> studentQuestions = engineService.prepareStudentQuestions(rawQuestions, true, true);
        Map<String, Integer> orderMap = new HashMap<>();
        for (int i = 0; i < attempt.getShuffledQuestionIds().size(); i++) orderMap.put(attempt.getShuffledQuestionIds().get(i), i);
        studentQuestions.sort(Comparator.comparingInt(q -> orderMap.getOrDefault(q.getId(), 999)));

        return Map.of(
            "attemptId", attempt.getId(), "exam", exam, "questions", studentQuestions,
            "existingAnswers", attempt.getAnswers(), "durationMinutes", exam.getDurationMinutes(),
            "tabSwitchCount", attempt.getTabSwitchCount(), "windowBlurCount", attempt.getWindowBlurCount()
        );
    }

    public ExamAttempt saveProgress(String attemptId, List<ExamAttempt.StudentAnswer> answers) {
        ExamAttempt attempt = attemptRepo.findById(attemptId).orElseThrow(() -> new RuntimeException("Attempt not found"));
        if (attempt.isFinalized()) throw new RuntimeException("Exam is already finalized or terminated.");
        attempt.setAnswers(answers);
        return attemptRepo.save(attempt);
    }

    public Map<String, Object> recordProctorAlert(String attemptId, ProctorAlertRequest alertReq, String username, String ip) {
        ExamAttempt attempt = attemptRepo.findById(attemptId).orElseThrow(() -> new RuntimeException("Attempt not found"));
        ProctorEventType eventType = ProctorEventType.fromString(alertReq.getEventType());
        boolean autoSubmitted = attempt.recordInfraction(eventType, alertReq.getDetails(), 3);
        attemptRepo.save(attempt);

        eventPublisher.publishEvent(new ProctorInfractionEvent(attempt.getId(), attempt.getStudentId(), username,
                attempt.getStudentName(), attempt.getExamId(), eventType, alertReq.getDetails(), attempt.getTotalInfractions(), autoSubmitted));

        return Map.of("totalInfractions", attempt.getTotalInfractions(), "autoSubmitted", autoSubmitted,
                "message", autoSubmitted ? "Exam automatically terminated due to security violations." : "Security warning logged.");
    }

    public ExamAttempt submitExam(String attemptId, ExamSubmissionRequest subReq, String username, String ip) {
        ExamAttempt attempt = attemptRepo.findById(attemptId).orElseThrow(() -> new RuntimeException("Attempt not found"));
        ExamSchedule exam = examRepo.findById(attempt.getExamId()).orElseThrow(() -> new RuntimeException("Exam schedule not found"));
        if (attempt.isFinalized()) return attempt;

        attempt.submitAnswers(subReq.getAnswers());
        List<Question> questions = questionRepo.findAllById(exam.getQuestionIds());
        Map<String, Question> questionMap = questions.stream().collect(Collectors.toMap(Question::getId, Function.identity()));

        double objScore = engineService.evaluateObjectiveAnswers(attempt.getAnswers(), questionMap, exam.isNegativeMarkingEnabled(), exam.getDefaultNegativeFactor());
        attempt.setObjectiveScore(objScore);

        if (questions.stream().noneMatch(Question::isSubjective)) {
            attempt.finalizeEvaluation(objScore, 0.0, gradingStrategy, "Automated objective grading complete", "SYSTEM");
        } else {
            attempt.setStatus(AttemptStatus.SUBMITTED.name()); attempt.setTotalScore(objScore); attempt.setGrade("PENDING");
        }

        ExamAttempt saved = attemptRepo.save(attempt);
        auditService.log(attempt.getStudentId(), username, "ROLE_STUDENT", "EXAM_SUBMITTED", "STUDENT", "Submitted " + exam.getTitle(), ip);
        return saved;
    }

    public ExamAttempt getAttemptResult(String attemptId) {
        return attemptRepo.findById(attemptId).orElseThrow(() -> new RuntimeException("Result not found"));
    }

    public List<ExamAttempt> getStudentResults(String username) {
        User student = userRepo.findByUsername(username).orElseThrow(() -> new RuntimeException("Student not found"));
        return attemptRepo.findByStudentId(student.getId());
    }
}
