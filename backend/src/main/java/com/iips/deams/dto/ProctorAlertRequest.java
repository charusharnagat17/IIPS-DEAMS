package com.iips.deams.dto;

public record ProctorAlertRequest(String examId, String eventType, String details) {
    public String getExamId() { return examId; }
    public String getEventType() { return eventType; }
    public String getDetails() { return details; }
}
