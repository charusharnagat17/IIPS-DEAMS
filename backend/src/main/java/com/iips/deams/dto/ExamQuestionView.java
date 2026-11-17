package com.iips.deams.dto;

import java.util.List;

public record ExamQuestionView(
    String id, String subjectId, String topic, String type, String difficulty,
    String questionText, String codeSnippet, List<StudentOption> options,
    List<StudentSampleIo> sampleIo, double marks, double negativeMarks
) {
    public String getId() { return id; }
    public record StudentOption(String id, String text) {}
    public record StudentSampleIo(String input, String expectedOutput) {}
}
