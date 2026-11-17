package com.iips.deams.service;

import com.iips.deams.dto.PaperGenerationRequest;
import com.iips.deams.dto.SubjectiveEvaluationRequest;
import com.iips.deams.model.*;
import com.iips.deams.model.enums.ExamStatus;
import com.iips.deams.repository.*;
import com.iips.deams.strategy.GradingStrategy;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FacultyService {

    private final QuestionRepository questionRepo;
    private final ExamScheduleRepository examRepo;
    private final ExamAttemptRepository attemptRepo;
    private final SubjectRepository subjectRepo;
    private final CourseRepository courseRepo;
    private final AuditService auditService;
    private final GradingStrategy gradingStrategy;

    public FacultyService(QuestionRepository questionRepo, ExamScheduleRepository examRepo,
                          ExamAttemptRepository attemptRepo, SubjectRepository subjectRepo,
                          CourseRepository courseRepo, AuditService auditService, GradingStrategy gradingStrategy) {
        this.questionRepo = questionRepo; this.examRepo = examRepo; this.attemptRepo = attemptRepo;
        this.subjectRepo = subjectRepo; this.courseRepo = courseRepo;
        this.auditService = auditService; this.gradingStrategy = gradingStrategy;
    }

    public List<Course> getAllCourses() { return courseRepo.findAll(); }

    public List<Subject> getAllSubjects(String courseId) {
        if (courseId != null && !courseId.isBlank()) return subjectRepo.findByCourseId(courseId);
        return subjectRepo.findAll();
    }

    public List<Question> getAllQuestions(String courseId, String subjectId, String type, String difficulty) {
        return questionRepo.findAll().stream()
                .filter(q -> courseId == null || courseId.isBlank() || (q.getCourseId() != null && q.getCourseId().equalsIgnoreCase(courseId)))
                .filter(q -> subjectId == null || subjectId.isBlank() || (q.getSubjectId() != null && q.getSubjectId().equalsIgnoreCase(subjectId)))
                .filter(q -> type == null || type.isBlank() || (q.getType() != null && q.getType().equalsIgnoreCase(type)))
                .filter(q -> difficulty == null || difficulty.isBlank() || (q.getDifficulty() != null && q.getDifficulty().equalsIgnoreCase(difficulty)))
                .toList();
    }

    public Question createQuestion(Question question, String faculty) {
        Question saved = questionRepo.save(question);
        auditService.log(saved.getId(), faculty, "ROLE_FACULTY", "CREATE_QUESTION", "FACULTY", "Added " + saved.getType() + " for " + saved.getSubjectId(), "127.0.0.1");
        return saved;
    }

    public Question updateQuestion(String id, Question updated, String faculty) {
        Question existing = questionRepo.findById(id).orElseThrow(() -> new RuntimeException("Question not found"));
        existing.setCourseId(updated.getCourseId());
        existing.setSubjectId(updated.getSubjectId()); existing.setTopic(updated.getTopic());
        existing.setType(updated.getType()); existing.setDifficulty(updated.getDifficulty());
        existing.setQuestionText(updated.getQuestionText()); existing.setCodeSnippet(updated.getCodeSnippet());
        existing.setOptions(updated.getOptions()); existing.setModelAnswer(updated.getModelAnswer());
        existing.setTestCases(updated.getTestCases()); existing.setMarks(updated.getMarks());
        existing.setNegativeMarks(updated.getNegativeMarks());
        Question saved = questionRepo.save(existing);
        auditService.log(saved.getId(), faculty, "ROLE_FACULTY", "UPDATE_QUESTION", "FACULTY", "Updated question " + saved.getId(), "127.0.0.1");
        return saved;
    }

    public void deleteQuestion(String id, String faculty) {
        questionRepo.deleteById(id);
        auditService.log(id, faculty, "ROLE_FACULTY", "DELETE_QUESTION", "FACULTY", "Deleted question " + id, "127.0.0.1");
    }

    public ExamSchedule generateRandomizedPaper(PaperGenerationRequest req, String faculty) {
        List<Question> all = questionRepo.findBySubjectId(req.getSubjectId());
        String diff = req.getDifficulty();
        List<Question> mcqs = new ArrayList<>(all.stream().filter(Question::isObjective).filter(q -> "ANY".equalsIgnoreCase(diff) || q.getDifficulty().equalsIgnoreCase(diff)).toList());
        List<Question> desc = new ArrayList<>(all.stream().filter(q -> "DESCRIPTIVE".equalsIgnoreCase(q.getType())).filter(q -> "ANY".equalsIgnoreCase(diff) || q.getDifficulty().equalsIgnoreCase(diff)).toList());
        List<Question> code = new ArrayList<>(all.stream().filter(q -> "CODE".equalsIgnoreCase(q.getType())).filter(q -> "ANY".equalsIgnoreCase(diff) || q.getDifficulty().equalsIgnoreCase(diff)).toList());

        if (req.isRandomize()) {
            Collections.shuffle(mcqs, new Random()); Collections.shuffle(desc, new Random()); Collections.shuffle(code, new Random());
        }

        List<String> qIds = new ArrayList<>();
        mcqs.stream().limit(req.getMcqCount()).forEach(q -> qIds.add(q.getId()));
        desc.stream().limit(req.getDescriptiveCount()).forEach(q -> qIds.add(q.getId()));
        code.stream().limit(req.getCodeCount()).forEach(q -> qIds.add(q.getId()));

        Subject subject = subjectRepo.findByCode(req.getSubjectId()).orElse(null);
        ExamSchedule schedule = new ExamSchedule();
        schedule.setTitle(req.getExamTitle() != null ? req.getExamTitle() : "Automated Exam - " + req.getSubjectId());
        schedule.setSubjectId(req.getSubjectId());
        schedule.setSubjectName(subject != null ? subject.getName() : req.getSubjectId());
        schedule.setCourseId(subject != null ? subject.getCourseId() : "BCA");
        schedule.setSemester(subject != null ? subject.getSemester() : 1);
        schedule.setCreatedByFacultyId(faculty);
        schedule.setDurationMinutes(req.getDurationMinutes()); schedule.setTotalMarks(req.getTotalMarks());
        schedule.setPassingMarks(req.getPassingMarks()); schedule.setNegativeMarkingEnabled(req.isNegativeMarking());
        schedule.setDefaultNegativeFactor(req.getNegativeFactor());
        schedule.setStartTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0));
        schedule.setEndTime(LocalDateTime.now().plusDays(1).withHour(12).withMinute(0));
        schedule.setStatus(ExamStatus.SCHEDULED.name()); schedule.setQuestionIds(qIds);

        ExamSchedule saved = examRepo.save(schedule);
        auditService.log(saved.getId(), faculty, "ROLE_FACULTY", "GENERATE_PAPER_RANDOM", "FACULTY", "Generated paper: " + saved.getTitle(), "127.0.0.1");
        return saved;
    }

    public List<ExamAttempt> getSubmissionsForEvaluation(String examId) {
        return (examId != null && !examId.isBlank()) ? attemptRepo.findByExamId(examId) : attemptRepo.findAll();
    }

    public ExamAttempt evaluateSubjectiveSubmission(SubjectiveEvaluationRequest req, String faculty) {
        ExamAttempt attempt = attemptRepo.findById(req.getAttemptId()).orElseThrow(() -> new RuntimeException("Attempt not found"));
        Map<String, SubjectiveEvaluationRequest.EvaluationItem> evalMap = new HashMap<>();
        req.getEvaluations().forEach(e -> evalMap.put(e.getQuestionId(), e));

        double subjectiveTotal = 0.0;
        for (ExamAttempt.StudentAnswer ans : attempt.getAnswers()) {
            if ("DESCRIPTIVE".equalsIgnoreCase(ans.getQuestionType()) || "CODE".equalsIgnoreCase(ans.getQuestionType())) {
                SubjectiveEvaluationRequest.EvaluationItem item = evalMap.get(ans.getQuestionId());
                if (item != null) {
                    ans.setMarksAwarded(item.getMarksAwarded()); ans.setFacultyComment(item.getFacultyComment());
                    ans.setEvaluated(true); subjectiveTotal += item.getMarksAwarded();
                }
            }
        }
        attempt.finalizeEvaluation(attempt.getObjectiveScore(), subjectiveTotal, gradingStrategy, req.getFacultyRemarks(), faculty);
        ExamAttempt saved = attemptRepo.save(attempt);
        auditService.log(saved.getId(), faculty, "ROLE_FACULTY", "EVALUATE_SUBJECTIVE", "FACULTY", "Evaluated " + saved.getStudentName(), "127.0.0.1");
        return saved;
    }

    public Map<String, Object> getExamAnalytics(String examId) {
        List<ExamAttempt> attempts = attemptRepo.findByExamId(examId);
        if (attempts.isEmpty()) return Map.of("totalAttempts", 0, "passCount", 0, "failCount", 0, "passPercentage", 0.0, "averageScore", 0.0, "highestScore", 0.0, "lowestScore", 0.0, "gradeDistribution", Map.of());
        int total = attempts.size();
        long passedCount = attempts.stream().filter(ExamAttempt::isPassed).count();
        DoubleSummaryStatistics stats = attempts.stream().mapToDouble(ExamAttempt::getTotalScore).summaryStatistics();
        Map<String, Long> gradeDist = attempts.stream().collect(Collectors.groupingBy(ExamAttempt::getGrade, Collectors.counting()));
        return Map.of(
            "totalAttempts", total, "passCount", passedCount, "failCount", total - passedCount,
            "passPercentage", Math.round(((double) passedCount / total) * 1000.0) / 10.0,
            "averageScore", Math.round(stats.getAverage() * 10.0) / 10.0,
            "highestScore", stats.getMax(), "lowestScore", stats.getMin(),
            "gradeDistribution", gradeDist
        );
    }
}
