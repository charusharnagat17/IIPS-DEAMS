package com.iips.deams.model.enums;

public enum GradeLetter {
    O("Outstanding", 10.0, 90.0, true),
    A_PLUS("Excellent", 9.0, 80.0, true),
    A("Very Good", 8.0, 70.0, true),
    B_PLUS("Good", 7.0, 60.0, true),
    B("Above Average", 6.0, 50.0, true),
    C("Pass", 5.0, 40.0, true),
    F("Fail", 0.0, 0.0, false);

    private final String description;
    private final double gradePoint;
    private final double minPercentage;
    private final boolean isPass;

    GradeLetter(String description, double gradePoint, double minPercentage, boolean isPass) {
        this.description = description;
        this.gradePoint = gradePoint;
        this.minPercentage = minPercentage;
        this.isPass = isPass;
    }

    public String getDescription() { return description; }
    public double getGradePoint() { return gradePoint; }
    public double getMinPercentage() { return minPercentage; }
    public boolean isPass() { return isPass; }

    public String getGradeCode() {
        if (this == A_PLUS) return "A+";
        if (this == B_PLUS) return "B+";
        return name();
    }

    public static GradeLetter fromPercentage(double percentage) {
        if (percentage >= 90.0) return O;
        if (percentage >= 80.0) return A_PLUS;
        if (percentage >= 70.0) return A;
        if (percentage >= 60.0) return B_PLUS;
        if (percentage >= 50.0) return B;
        if (percentage >= 40.0) return C;
        return F;
    }
}
