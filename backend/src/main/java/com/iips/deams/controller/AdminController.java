package com.iips.deams.controller;

import com.iips.deams.dto.ApiResponse;
import com.iips.deams.model.*;
import com.iips.deams.service.AdminService;
import com.iips.deams.service.AuditService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final AuditService auditService;

    public AdminController(AdminService adminService, AuditService auditService) {
        this.adminService = adminService;
        this.auditService = auditService;
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats() {
        return ApiResponse.ok("Admin stats", adminService.getDashboardStats());
    }

    @GetMapping("/students")
    public ApiResponse<List<User>> getStudents(@RequestParam(required = false) String courseId, @RequestParam(required = false) Integer semester) {
        return ApiResponse.ok("Students", courseId != null && !courseId.isBlank() ? adminService.getStudentsByCourse(courseId, semester) : adminService.getAllStudents());
    }

    @PostMapping("/students")
    public ApiResponse<User> createStudent(@RequestBody User student, Authentication auth) {
        return ApiResponse.ok("Student created", adminService.createStudent(student, auth.getName()));
    }

    @PutMapping("/students/{id}")
    public ApiResponse<User> updateStudent(@PathVariable String id, @RequestBody User student, Authentication auth) {
        return ApiResponse.ok("Student updated", adminService.updateStudent(id, student, auth.getName()));
    }

    @DeleteMapping("/users/{id}")
    public ApiResponse<String> deleteUser(@PathVariable String id, Authentication auth) {
        adminService.deleteUser(id, auth.getName());
        return ApiResponse.ok("User deleted successfully", id);
    }

    @GetMapping("/faculty")
    public ApiResponse<List<User>> getAllFaculty() {
        return ApiResponse.ok("All faculty", adminService.getAllFaculty());
    }

    @PostMapping("/faculty")
    public ApiResponse<User> createFaculty(@RequestBody User faculty, Authentication auth) {
        return ApiResponse.ok("Faculty created", adminService.createFaculty(faculty, auth.getName()));
    }

    @GetMapping("/courses")
    public ApiResponse<List<Course>> getAllCourses() {
        return ApiResponse.ok("All courses", adminService.getAllCourses());
    }

    @PostMapping("/courses")
    public ApiResponse<Course> createCourse(@RequestBody Course course, Authentication auth) {
        return ApiResponse.ok("Course created", adminService.createCourse(course, auth.getName()));
    }

    @GetMapping("/subjects")
    public ApiResponse<List<Subject>> getSubjects(@RequestParam(required = false) String courseId) {
        return ApiResponse.ok("Subjects", courseId != null && !courseId.isBlank() ? adminService.getSubjectsByCourse(courseId) : adminService.getAllSubjects());
    }

    @PostMapping("/subjects")
    public ApiResponse<Subject> createSubject(@RequestBody Subject subject, Authentication auth) {
        return ApiResponse.ok("Subject created", adminService.createSubject(subject, auth.getName()));
    }

    @GetMapping("/schedules")
    public ApiResponse<List<ExamSchedule>> getAllSchedules() {
        return ApiResponse.ok("All exam schedules", adminService.getAllSchedules());
    }

    @PostMapping("/schedules")
    public ApiResponse<ExamSchedule> createSchedule(@RequestBody ExamSchedule schedule, Authentication auth) {
        return ApiResponse.ok("Schedule created", adminService.createExamSchedule(schedule, auth.getName()));
    }

    @PostMapping("/schedules/{id}/allocate-centers")
    public ApiResponse<ExamSchedule> allocateCenters(@PathVariable String id, @RequestBody List<ExamSchedule.CenterAllocation> allocations, Authentication auth) {
        return ApiResponse.ok("Centers allocated", adminService.allocateCenters(id, allocations, auth.getName()));
    }

    @GetMapping("/audit-logs")
    public ApiResponse<List<AuditLog>> getAuditLogs(@RequestParam(required = false) String module) {
        return ApiResponse.ok("Audit logs", module != null && !module.isBlank() ? auditService.getLogsByModule(module) : auditService.getRecentLogs());
    }
}
