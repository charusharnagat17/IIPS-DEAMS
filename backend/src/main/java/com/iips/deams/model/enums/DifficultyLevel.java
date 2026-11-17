package com.iips.deams.model.enums;

public enum DifficultyLevel {
    EASY(1),
    MEDIUM(2),
    HARD(3);

    private final int weight;

    DifficultyLevel(int weight) {
        this.weight = weight;
    }

    public int getWeight() {
        return weight;
    }

    public static DifficultyLevel fromString(String val) {
        if (val == null) return MEDIUM;
        for (DifficultyLevel d : values()) {
            if (d.name().equalsIgnoreCase(val.trim())) return d;
        }
        return MEDIUM;
    }
}
