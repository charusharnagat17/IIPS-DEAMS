package com.iips.deams.repository;

import com.iips.deams.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<User> findByRole(String role);
    List<User> findByCourseId(String courseId);
    List<User> findByCourseIdAndSemester(String courseId, Integer semester);
}
