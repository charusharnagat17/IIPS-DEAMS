package com.iips.deams.controller;

import com.iips.deams.dto.ApiResponse;
import com.iips.deams.dto.ExamSubmissionRequest;
import com.iips.deams.dto.ProctorAlertRequest;
import com.iips.deams.model.ExamAttempt;
import com.iips.deams.model.ExamSchedule;
import com.iips.deams.service.StudentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/exams")
    public ApiResponse<List<ExamSchedule>> getAvailableExams(Authentication auth) {
        return ApiResponse.ok("Available exams", studentService.getAvailableExamsForStudent(auth.getName()));
    }

    @PostMapping("/exam/{examId}/start")
    public ResponseEntity<ApiResponse<Map<String, Object>>> startExam(@PathVariable String examId, Authentication auth, HttpServletRequest req) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Exam started", studentService.startExam(examId, auth.getName(), req.getRemoteAddr())));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/exam/{attemptId}/save")
    public ResponseEntity<ApiResponse<ExamAttempt>> saveAnswers(@PathVariable String attemptId, @RequestBody List<ExamAttempt.StudentAnswer> answers) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Progress auto-saved", studentService.saveProgress(attemptId, answers)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/exam/{attemptId}/alert")
    public ResponseEntity<ApiResponse<Map<String, Object>>> recordAlert(@PathVariable String attemptId, @RequestBody ProctorAlertRequest alertReq, Authentication auth, HttpServletRequest req) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Alert recorded", studentService.recordProctorAlert(attemptId, alertReq, auth.getName(), req.getRemoteAddr())));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/exam/{attemptId}/submit")
    public ResponseEntity<ApiResponse<ExamAttempt>> submitExam(@PathVariable String attemptId, @RequestBody ExamSubmissionRequest subReq, Authentication auth, HttpServletRequest req) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Exam submitted successfully", studentService.submitExam(attemptId, subReq, auth.getName(), req.getRemoteAddr())));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/attempt/{attemptId}")
    public ResponseEntity<ApiResponse<ExamAttempt>> getAttemptResult(@PathVariable String attemptId) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Attempt result", studentService.getAttemptResult(attemptId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/results")
    public ApiResponse<List<ExamAttempt>> getResults(Authentication auth) {
        return ApiResponse.ok("Student examination results", studentService.getStudentResults(auth.getName()));
    }
}
