package com.iips.deams.strategy;

public interface GradingStrategy {
    GradingResult evaluateGrade(double score, double maxMarks);

    record GradingResult(double percentage, String letterGrade, double gradePoint, boolean passed) {
        public double getPercentage() { return percentage; }
        public String getLetterGrade() { return letterGrade; }
        public double getGradePoint() { return gradePoint; }
        public boolean isPassed() { return passed; }
    }
}
