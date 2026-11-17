package com.iips.deams.repository;

import com.iips.deams.model.ExamSchedule;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ExamScheduleRepository extends MongoRepository<ExamSchedule, String> {
    List<ExamSchedule> findByCourseId(String courseId);
    List<ExamSchedule> findByCourseIdAndSemester(String courseId, int semester);
    List<ExamSchedule> findByCreatedByFacultyId(String createdByFacultyId);
    List<ExamSchedule> findByStatus(String status);
}
