package com.iips.deams.event;

import com.iips.deams.service.AuditService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class ProctorSecurityEventListener {

    private final AuditService auditService;

    public ProctorSecurityEventListener(AuditService auditService) {
        this.auditService = auditService;
    }

    @EventListener
    public void handleProctorViolation(ProctorInfractionEvent event) {
        String action = event.isDisqualified() ? "CHEATING_TERMINATED" : "PROCTOR_WARNING_" + event.getEventType().name();
        String details = String.format("Candidate %s (%s) triggered %s [Count: %d]. %s",
                event.getStudentName(), event.getStudentUsername(),
                event.getEventType().getDescription(),
                event.getCurrentInfractionCount(),
                event.isDisqualified() ? "Candidate AUTO-DISQUALIFIED." : "");

        auditService.log(
                event.getStudentId(),
                event.getStudentUsername(),
                "ROLE_STUDENT",
                action,
                "PROCTORING",
                details,
                "127.0.0.1"
        );
    }
}
