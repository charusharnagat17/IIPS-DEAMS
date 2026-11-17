package com.iips.deams.repository;

import com.iips.deams.model.Subject;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends MongoRepository<Subject, String> {
    Optional<Subject> findByCode(String code);
    List<Subject> findByCourseId(String courseId);
    List<Subject> findByCourseIdAndSemester(String courseId, int semester);
    List<Subject> findByFacultyId(String facultyId);
}
