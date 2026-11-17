package com.iips.deams.dto;

public record PaperGenerationRequest(
    String subjectId, String examTitle, int mcqCount, int descriptiveCount,
    int codeCount, String difficulty, boolean randomize, double totalMarks,
    double passingMarks, int durationMinutes, boolean negativeMarking, double negativeFactor
) {
    public String getSubjectId() { return subjectId; }
    public String getExamTitle() { return examTitle; }
    public int getMcqCount() { return mcqCount; }
    public int getDescriptiveCount() { return descriptiveCount; }
    public int getCodeCount() { return codeCount; }
    public String getDifficulty() { return difficulty != null ? difficulty : "ANY"; }
    public boolean isRandomize() { return randomize; }
    public double getTotalMarks() { return totalMarks > 0 ? totalMarks : 50.0; }
    public double getPassingMarks() { return passingMarks > 0 ? passingMarks : 20.0; }
    public int getDurationMinutes() { return durationMinutes > 0 ? durationMinutes : 60; }
    public boolean isNegativeMarking() { return negativeMarking; }
    public double getNegativeFactor() { return negativeFactor > 0 ? negativeFactor : 0.25; }
}
