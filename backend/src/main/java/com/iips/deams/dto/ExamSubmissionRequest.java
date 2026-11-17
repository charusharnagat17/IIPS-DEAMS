package com.iips.deams.dto;

import com.iips.deams.model.ExamAttempt;
import java.util.List;

public record ExamSubmissionRequest(
    String examId, List<ExamAttempt.StudentAnswer> answers,
    int tabSwitchCount, int windowBlurCount, int fullscreenExitCount,
    List<ExamAttempt.ProctorLog> proctorLogs
) {
    public String getExamId() { return examId; }
    public List<ExamAttempt.StudentAnswer> getAnswers() { return answers != null ? answers : List.of(); }
    public int getTabSwitchCount() { return tabSwitchCount; }
    public int getWindowBlurCount() { return windowBlurCount; }
    public int getFullscreenExitCount() { return fullscreenExitCount; }
    public List<ExamAttempt.ProctorLog> getProctorLogs() { return proctorLogs != null ? proctorLogs : List.of(); }
}
