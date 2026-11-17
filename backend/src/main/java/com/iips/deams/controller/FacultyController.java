package com.iips.deams.controller;

import com.iips.deams.dto.ApiResponse;
import com.iips.deams.dto.PaperGenerationRequest;
import com.iips.deams.dto.SubjectiveEvaluationRequest;
import com.iips.deams.model.*;
import com.iips.deams.service.FacultyService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faculty")
public class FacultyController {

    private final FacultyService facultyService;

    public FacultyController(FacultyService facultyService) {
        this.facultyService = facultyService;
    }
    @GetMapping("/courses")
    public ApiResponse<List<Course>> getCourses() {
        return ApiResponse.ok("Courses list", facultyService.getAllCourses());
    }

    @GetMapping("/subjects")
    public ApiResponse<List<Subject>> getSubjects(@RequestParam(required = false) String courseId) {
        return ApiResponse.ok("Subjects list", facultyService.getAllSubjects(courseId));
    }

    @GetMapping("/questions")
    public ApiResponse<List<Question>> getQuestions(
            @RequestParam(required = false) String courseId,
            @RequestParam(required = false) String subjectId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String difficulty) {
        return ApiResponse.ok("Questions list", facultyService.getAllQuestions(courseId, subjectId, type, difficulty));
    }

    @PostMapping("/questions")
    public ApiResponse<Question> createQuestion(@RequestBody Question question, Authentication auth) {
        return ApiResponse.ok("Question created", facultyService.createQuestion(question, auth.getName()));
    }

    @PutMapping("/questions/{id}")
    public ApiResponse<Question> updateQuestion(@PathVariable String id, @RequestBody Question question, Authentication auth) {
        return ApiResponse.ok("Question updated", facultyService.updateQuestion(id, question, auth.getName()));
    }

    @DeleteMapping("/questions/{id}")
    public ApiResponse<String> deleteQuestion(@PathVariable String id, Authentication auth) {
        facultyService.deleteQuestion(id, auth.getName());
        return ApiResponse.ok("Question deleted successfully", id);
    }

    @PostMapping("/generate-paper")
    public ApiResponse<ExamSchedule> generateRandomizedPaper(@RequestBody PaperGenerationRequest request, Authentication auth) {
        return ApiResponse.ok("Question paper randomized and scheduled", facultyService.generateRandomizedPaper(request, auth.getName()));
    }

    @GetMapping("/submissions")
    public ApiResponse<List<ExamAttempt>> getSubmissions(@RequestParam(required = false) String examId) {
        return ApiResponse.ok("Submissions list", facultyService.getSubmissionsForEvaluation(examId));
    }

    @PostMapping("/evaluate")
    public ApiResponse<ExamAttempt> evaluateSubmission(@RequestBody SubjectiveEvaluationRequest request, Authentication auth) {
        return ApiResponse.ok("Evaluation saved successfully", facultyService.evaluateSubjectiveSubmission(request, auth.getName()));
    }

    @GetMapping("/analytics/{examId}")
    public ApiResponse<Map<String, Object>> getAnalytics(@PathVariable String examId) {
        return ApiResponse.ok("Exam performance analytics", facultyService.getExamAnalytics(examId));
    }
}
