package com.iips.deams.repository;

import com.iips.deams.model.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface AuditLogRepository extends MongoRepository<AuditLog, String> {
    List<AuditLog> findTop50ByOrderByTimestampDesc();
    List<AuditLog> findByModuleOrderByTimestampDesc(String module);
    List<AuditLog> findByUserIdOrderByTimestampDesc(String userId);
}
