package com.iips.deams.model.enums;

public enum AttemptStatus {
    IN_PROGRESS,
    SUBMITTED,
    EVALUATED,
    TERMINATED_CHEATING;

    public boolean isFinalized() {
        return this == SUBMITTED || this == EVALUATED || this == TERMINATED_CHEATING;
    }
}
