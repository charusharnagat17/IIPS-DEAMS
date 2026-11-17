package com.iips.deams.repository;

import com.iips.deams.model.Course;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface CourseRepository extends MongoRepository<Course, String> {
    Optional<Course> findByCode(String code);
    boolean existsByCode(String code);
}
