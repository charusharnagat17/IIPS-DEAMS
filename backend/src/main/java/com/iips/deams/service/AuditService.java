package com.iips.deams.service;

import com.iips.deams.model.AuditLog;
import com.iips.deams.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }
    public AuditLog log(String userId, String username, String role, String action, String module, String details, String ipAddress) {
        AuditLog log = new AuditLog(userId, username, role, action, module, details, ipAddress != null ? ipAddress : "127.0.0.1");
        return auditLogRepository.save(log);
    }
    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc();
    }
    public List<AuditLog> getLogsByModule(String module) {
        return auditLogRepository.findByModuleOrderByTimestampDesc(module);
    }
}
