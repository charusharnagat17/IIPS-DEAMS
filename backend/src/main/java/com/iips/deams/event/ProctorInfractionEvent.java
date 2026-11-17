package com.iips.deams.event;

import com.iips.deams.model.enums.ProctorEventType;
import java.time.LocalDateTime;

public record ProctorInfractionEvent(
    String attemptId, String studentId, String studentUsername, String studentName,
    String examId, ProctorEventType eventType, String details, int currentInfractionCount,
    boolean disqualified, LocalDateTime timestamp
) {
    public ProctorInfractionEvent(String attemptId, String studentId, String studentUsername,
                                  String studentName, String examId, ProctorEventType eventType,
                                  String details, int currentInfractionCount, boolean disqualified) {
        this(attemptId, studentId, studentUsername, studentName, examId, eventType, details, currentInfractionCount, disqualified, LocalDateTime.now());
    }
    public String getAttemptId() { return attemptId; }
    public String getStudentId() { return studentId; }
    public String getStudentUsername() { return studentUsername; }
    public String getStudentName() { return studentName; }
    public String getExamId() { return examId; }
    public ProctorEventType getEventType() { return eventType; }
    public String getDetails() { return details; }
    public int getCurrentInfractionCount() { return currentInfractionCount; }
    public boolean isDisqualified() { return disqualified; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
