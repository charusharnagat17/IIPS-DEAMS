package com.iips.deams.model.enums;

public enum ProctorEventType {
    TAB_SWITCH("Candidate changed or unfocused browser tab", 1),
    WINDOW_BLUR("Candidate switched application or focus", 1),
    FULLSCREEN_EXIT("Candidate exited mandatory fullscreen mode", 1),
    COPY_ATTEMPT("Candidate attempted clipboard copy/paste action", 1);

    private final String description;
    private final int severityPoints;

    ProctorEventType(String description, int severityPoints) {
        this.description = description;
        this.severityPoints = severityPoints;
    }

    public String getDescription() {
        return description;
    }

    public int getSeverityPoints() {
        return severityPoints;
    }

    public static ProctorEventType fromString(String val) {
        if (val == null) return TAB_SWITCH;
        for (ProctorEventType p : values()) {
            if (p.name().equalsIgnoreCase(val.trim())) return p;
        }
        return TAB_SWITCH;
    }
}
