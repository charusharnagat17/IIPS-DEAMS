package com.iips.deams.model;

import com.iips.deams.model.enums.AttemptStatus;
import com.iips.deams.model.enums.ProctorEventType;
import com.iips.deams.strategy.GradingStrategy;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "exam_attempts")
public class ExamAttempt {
    @Id
    private String id;
    private String examId;
    private String examTitle;
    private String subjectCode;
    private String subjectName;
    private String studentId;
    private String studentName;
    private String rollNo;
    private String courseId;
    private int semester;
    private LocalDateTime startTime = LocalDateTime.now();
    private LocalDateTime submissionTime;
    private String status = AttemptStatus.IN_PROGRESS.name();
    private int tabSwitchCount = 0;
    private int windowBlurCount = 0;
    private int fullscreenExitCount = 0;
    private List<ProctorLog> proctorLogs = new ArrayList<>();
    private List<String> shuffledQuestionIds = new ArrayList<>();
    private List<StudentAnswer> answers = new ArrayList<>();
    private double objectiveScore = 0.0;
    private double subjectiveScore = 0.0;
    private double totalScore = 0.0;
    private double maxMarks = 50.0;
    private double percentage = 0.0;
    private String grade = "PENDING";
    private boolean passed = false;
    private String facultyRemarks;
    private String evaluatedByFacultyId;
    private LocalDateTime evaluatedAt;

    public ExamAttempt() {}

    public int getTotalInfractions() { return this.tabSwitchCount + this.windowBlurCount + this.fullscreenExitCount; }

    public boolean isFinalized() {
        return AttemptStatus.SUBMITTED.name().equalsIgnoreCase(this.status) ||
               AttemptStatus.EVALUATED.name().equalsIgnoreCase(this.status) ||
               AttemptStatus.TERMINATED_CHEATING.name().equalsIgnoreCase(this.status);
    }

    public boolean recordInfraction(ProctorEventType eventType, String details, int maxAllowed) {
        switch (eventType) {
            case TAB_SWITCH -> this.tabSwitchCount++;
            case WINDOW_BLUR -> this.windowBlurCount++;
            case FULLSCREEN_EXIT -> this.fullscreenExitCount++;
            case COPY_ATTEMPT -> this.tabSwitchCount++;
        }
        this.proctorLogs.add(new ProctorLog(eventType.name(), details));
        if (getTotalInfractions() >= maxAllowed) {
            this.status = AttemptStatus.TERMINATED_CHEATING.name();
            this.submissionTime = LocalDateTime.now();
            this.facultyRemarks = "Auto-terminated due to multiple anti-cheating violations (" + getTotalInfractions() + " infractions recorded).";
            return true;
        }
        return false;
    }

    public void submitAnswers(List<StudentAnswer> newAnswers) {
        if (isFinalized()) throw new IllegalStateException("Attempt is already finalized.");
        this.answers = newAnswers;
        this.submissionTime = LocalDateTime.now();
        this.status = AttemptStatus.SUBMITTED.name();
    }

    public void finalizeEvaluation(double objScore, double subjScore, GradingStrategy gradingStrategy, String remarks, String facultyId) {
        this.objectiveScore = objScore;
        this.subjectiveScore = subjScore;
        this.totalScore = Math.max(0.0, objScore + subjScore);
        GradingStrategy.GradingResult result = gradingStrategy.evaluateGrade(this.totalScore, this.maxMarks);
        this.percentage = result.getPercentage();
        this.grade = result.getLetterGrade();
        this.passed = result.isPassed();
        this.facultyRemarks = remarks;
        this.evaluatedByFacultyId = facultyId;
        this.evaluatedAt = LocalDateTime.now();
        this.status = AttemptStatus.EVALUATED.name();
    }

    public static class ProctorLog {
        private String eventType;
        private LocalDateTime timestamp = LocalDateTime.now();
        private String details;
        public ProctorLog() {}
        public ProctorLog(String eventType, String details) { this.eventType = eventType; this.details = details; this.timestamp = LocalDateTime.now(); }
        public String getEventType() { return eventType; } public void setEventType(String e) { this.eventType = e; }
        public LocalDateTime getTimestamp() { return timestamp; } public void setTimestamp(LocalDateTime t) { this.timestamp = t; }
        public String getDetails() { return details; } public void setDetails(String d) { this.details = d; }
    }

    public static class StudentAnswer {
        private String questionId;
        private String questionType;
        private String selectedOptionId;
        private String descriptiveText;
        private String codeSnippet;
        private boolean isAttempted = false;
        private boolean isMarkedForReview = false;
        private boolean isCorrect = false;
        private double marksAwarded = 0.0;
        private String facultyComment;
        private boolean evaluated = false;

        public StudentAnswer() {}
        public String getQuestionId() { return questionId; } public void setQuestionId(String qId) { this.questionId = qId; }
        public String getQuestionType() { return questionType; } public void setQuestionType(String qt) { this.questionType = qt; }
        public String getSelectedOptionId() { return selectedOptionId; } public void setSelectedOptionId(String opt) { this.selectedOptionId = opt; }
        public String getDescriptiveText() { return descriptiveText; } public void setDescriptiveText(String txt) { this.descriptiveText = txt; }
        public String getCodeSnippet() { return codeSnippet; } public void setCodeSnippet(String cs) { this.codeSnippet = cs; }
        public boolean isAttempted() { return isAttempted; } public void setAttempted(boolean a) { this.isAttempted = a; }
        public boolean isMarkedForReview() { return isMarkedForReview; } public void setMarkedForReview(boolean m) { this.isMarkedForReview = m; }
        public boolean isCorrect() { return isCorrect; } public void setCorrect(boolean c) { this.isCorrect = c; }
        public double getMarksAwarded() { return marksAwarded; } public void setMarksAwarded(double m) { this.marksAwarded = m; }
        public String getFacultyComment() { return facultyComment; } public void setFacultyComment(String fc) { this.facultyComment = fc; }
        public boolean isEvaluated() { return evaluated; } public void setEvaluated(boolean e) { this.evaluated = e; }
    }

    public String getId() { return id; } public void setId(String id) { this.id = id; }
    public String getExamId() { return examId; } public void setExamId(String examId) { this.examId = examId; }
    public String getExamTitle() { return examTitle; } public void setExamTitle(String examTitle) { this.examTitle = examTitle; }
    public String getSubjectCode() { return subjectCode; } public void setSubjectCode(String sc) { this.subjectCode = sc; }
    public String getSubjectName() { return subjectName; } public void setSubjectName(String sn) { this.subjectName = sn; }
    public String getStudentId() { return studentId; } public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; } public void setStudentName(String sn) { this.studentName = sn; }
    public String getRollNo() { return rollNo; } public void setRollNo(String rollNo) { this.rollNo = rollNo; }
    public String getCourseId() { return courseId; } public void setCourseId(String courseId) { this.courseId = courseId; }
    public int getSemester() { return semester; } public void setSemester(int semester) { this.semester = semester; }
    public LocalDateTime getStartTime() { return startTime; } public void setStartTime(LocalDateTime st) { this.startTime = st; }
    public LocalDateTime getSubmissionTime() { return submissionTime; } public void setSubmissionTime(LocalDateTime st) { this.submissionTime = st; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public int getTabSwitchCount() { return tabSwitchCount; } public void setTabSwitchCount(int c) { this.tabSwitchCount = c; }
    public int getWindowBlurCount() { return windowBlurCount; } public void setWindowBlurCount(int c) { this.windowBlurCount = c; }
    public int getFullscreenExitCount() { return fullscreenExitCount; } public void setFullscreenExitCount(int c) { this.fullscreenExitCount = c; }
    public List<ProctorLog> getProctorLogs() { return proctorLogs; } public void setProctorLogs(List<ProctorLog> l) { this.proctorLogs = l; }
    public List<String> getShuffledQuestionIds() { return shuffledQuestionIds; } public void setShuffledQuestionIds(List<String> ids) { this.shuffledQuestionIds = ids; }
    public List<StudentAnswer> getAnswers() { return answers; } public void setAnswers(List<StudentAnswer> answers) { this.answers = answers; }
    public double getObjectiveScore() { return objectiveScore; } public void setObjectiveScore(double s) { this.objectiveScore = s; }
    public double getSubjectiveScore() { return subjectiveScore; } public void setSubjectiveScore(double s) { this.subjectiveScore = s; }
    public double getTotalScore() { return totalScore; } public void setTotalScore(double s) { this.totalScore = s; }
    public double getMaxMarks() { return maxMarks; } public void setMaxMarks(double m) { this.maxMarks = m; }
    public double getPercentage() { return percentage; } public void setPercentage(double p) { this.percentage = p; }
    public String getGrade() { return grade; } public void setGrade(String grade) { this.grade = grade; }
    public boolean isPassed() { return passed; } public void setPassed(boolean p) { this.passed = p; }
    public String getFacultyRemarks() { return facultyRemarks; } public void setFacultyRemarks(String r) { this.facultyRemarks = r; }
    public String getEvaluatedByFacultyId() { return evaluatedByFacultyId; } public void setEvaluatedByFacultyId(String f) { this.evaluatedByFacultyId = f; }
    public LocalDateTime getEvaluatedAt() { return evaluatedAt; } public void setEvaluatedAt(LocalDateTime t) { this.evaluatedAt = t; }
}
