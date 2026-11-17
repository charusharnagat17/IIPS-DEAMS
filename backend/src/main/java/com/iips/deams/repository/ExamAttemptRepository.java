package com.iips.deams.repository;

import com.iips.deams.model.ExamAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface ExamAttemptRepository extends MongoRepository<ExamAttempt, String> {
    List<ExamAttempt> findByExamId(String examId);
    List<ExamAttempt> findByStudentId(String studentId);
    Optional<ExamAttempt> findByExamIdAndStudentId(String examId, String studentId);
    List<ExamAttempt> findByExamIdAndStatus(String examId, String status);
}
