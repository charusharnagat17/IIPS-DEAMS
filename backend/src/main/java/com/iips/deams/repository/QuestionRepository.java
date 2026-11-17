package com.iips.deams.repository;

import com.iips.deams.model.Question;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface QuestionRepository extends MongoRepository<Question, String> {
    List<Question> findBySubjectId(String subjectId);
    List<Question> findBySubjectIdAndType(String subjectId, String type);
    List<Question> findBySubjectIdAndDifficulty(String subjectId, String difficulty);
    List<Question> findByCreatedByFacultyId(String createdByFacultyId);
}
