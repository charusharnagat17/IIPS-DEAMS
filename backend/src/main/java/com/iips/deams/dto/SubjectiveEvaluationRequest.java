package com.iips.deams.dto;

import java.util.List;

public record SubjectiveEvaluationRequest(
    String attemptId, List<EvaluationItem> evaluations, String facultyRemarks
) {
    public String getAttemptId() { return attemptId; }
    public List<EvaluationItem> getEvaluations() { return evaluations != null ? evaluations : List.of(); }
    public String getFacultyRemarks() { return facultyRemarks; }

    public record EvaluationItem(String questionId, double marksAwarded, String facultyComment) {
        public String getQuestionId() { return questionId; }
        public double getMarksAwarded() { return marksAwarded; }
        public String getFacultyComment() { return facultyComment; }
    }
}
