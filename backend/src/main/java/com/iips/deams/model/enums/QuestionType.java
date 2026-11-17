package com.iips.deams.model.enums;

public enum QuestionType {
    MCQ("Multiple Choice Question", true),
    DESCRIPTIVE("Descriptive / Subjective", false),
    CODE("Code-Based Problem", false);

    private final String description;
    private final boolean autoEvaluable;

    QuestionType(String description, boolean autoEvaluable) {
        this.description = description;
        this.autoEvaluable = autoEvaluable;
    }

    public String getDescription() {
        return description;
    }

    public boolean isAutoEvaluable() {
        return autoEvaluable;
    }

    public static QuestionType fromString(String val) {
        if (val == null) return MCQ;
        for (QuestionType t : values()) {
            if (t.name().equalsIgnoreCase(val.trim())) {
                return t;
            }
        }
        return MCQ;
    }
}
