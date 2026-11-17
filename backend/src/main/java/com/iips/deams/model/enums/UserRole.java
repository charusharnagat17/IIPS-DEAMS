package com.iips.deams.model.enums;

public enum UserRole {
    ROLE_ADMIN("Administrator"),
    ROLE_FACULTY("Faculty Examiner"),
    ROLE_STUDENT("Student Candidate");

    private final String displayName;

    UserRole(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static UserRole fromString(String roleStr) {
        if (roleStr == null) return ROLE_STUDENT;
        String clean = roleStr.trim().toUpperCase();
        if (!clean.startsWith("ROLE_")) {
            clean = "ROLE_" + clean;
        }
        for (UserRole role : values()) {
            if (role.name().equalsIgnoreCase(clean)) {
                return role;
            }
        }
        return ROLE_STUDENT;
    }
}
