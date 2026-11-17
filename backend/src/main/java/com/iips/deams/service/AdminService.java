package com.iips.deams.service;

import com.iips.deams.model.*;
import com.iips.deams.model.enums.UserRole;
import com.iips.deams.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AdminService {

    private final UserRepository userRepo;
    private final CourseRepository courseRepo;
    private final SubjectRepository subjectRepo;
    private final ExamScheduleRepository examRepo;
    private final ExamAttemptRepository attemptRepo;
    private final AuditService auditService;
    private final PasswordEncoder encoder;

    public AdminService(UserRepository userRepo, CourseRepository courseRepo, SubjectRepository subjectRepo,
                        ExamScheduleRepository examRepo, ExamAttemptRepository attemptRepo,
                        AuditService auditService, PasswordEncoder encoder) {
        this.userRepo = userRepo; this.courseRepo = courseRepo; this.subjectRepo = subjectRepo;
        this.examRepo = examRepo; this.attemptRepo = attemptRepo;
        this.auditService = auditService; this.encoder = encoder;
    }

    public List<User> getAllStudents() { return userRepo.findByRole(UserRole.ROLE_STUDENT.name()); }

    public List<User> getStudentsByCourse(String courseId, Integer semester) {
        return semester != null ? userRepo.findByCourseIdAndSemester(courseId, semester) : userRepo.findByCourseId(courseId);
    }

    public User createStudent(User student, String admin) {
        if (userRepo.existsByUsername(student.getUsername()) || userRepo.existsByEmail(student.getEmail())) {
            throw new RuntimeException("Username or email already exists.");
        }
        student.setRole(UserRole.ROLE_STUDENT.name());
        if (student.getPassword() == null || student.getPassword().isBlank()) throw new RuntimeException("Password is required.");
        student.setPassword(encoder.encode(student.getPassword()));
        student.setActive(true);
        User saved = userRepo.save(student);
        auditService.log(saved.getId(), admin, "ROLE_ADMIN", "CREATE_STUDENT", "ADMIN", "Created student: " + saved.getFullName(), "127.0.0.1");
        return saved;
    }

    public User updateStudent(String id, User updated, String admin) {
        User existing = userRepo.findById(id).orElseThrow(() -> new RuntimeException("Student not found"));
        existing.setFullName(updated.getFullName()); existing.setEmail(updated.getEmail());
        existing.setRollNoOrFacultyId(updated.getRollNoOrFacultyId()); existing.setCourseId(updated.getCourseId());
        existing.setSemester(updated.getSemester()); existing.setActive(updated.isActive());
        if (updated.getPassword() != null && !updated.getPassword().isBlank()) existing.setPassword(encoder.encode(updated.getPassword()));
        User saved = userRepo.save(existing);
        auditService.log(saved.getId(), admin, "ROLE_ADMIN", "UPDATE_STUDENT", "ADMIN", "Updated student: " + saved.getFullName(), "127.0.0.1");
        return saved;
    }

    public void deleteUser(String id, String admin) {
        User user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        userRepo.deleteById(id);
        auditService.log(id, admin, "ROLE_ADMIN", "DELETE_USER", "ADMIN", "Deleted user: " + user.getFullName(), "127.0.0.1");
    }

    public List<User> getAllFaculty() { return userRepo.findByRole(UserRole.ROLE_FACULTY.name()); }

    public User createFaculty(User faculty, String admin) {
        if (userRepo.existsByUsername(faculty.getUsername()) || userRepo.existsByEmail(faculty.getEmail())) {
            throw new RuntimeException("Username or email already exists.");
        }
        faculty.setRole(UserRole.ROLE_FACULTY.name());
        if (faculty.getPassword() == null || faculty.getPassword().isBlank()) throw new RuntimeException("Password is required.");
        faculty.setPassword(encoder.encode(faculty.getPassword()));
        faculty.setActive(true);
        User saved = userRepo.save(faculty);
        auditService.log(saved.getId(), admin, "ROLE_ADMIN", "CREATE_FACULTY", "ADMIN", "Created faculty: " + saved.getFullName(), "127.0.0.1");
        return saved;
    }

    public List<Course> getAllCourses() { return courseRepo.findAll(); }

    public Course createCourse(Course course, String admin) {
        Course saved = courseRepo.save(course);
        auditService.log(saved.getId(), admin, "ROLE_ADMIN", "CREATE_COURSE", "ADMIN", "Created course: " + saved.getCode(), "127.0.0.1");
        return saved;
    }

    public List<Subject> getAllSubjects() { return subjectRepo.findAll(); }
    public List<Subject> getSubjectsByCourse(String courseId) { return subjectRepo.findByCourseId(courseId); }

    public Subject createSubject(Subject subject, String admin) {
        Subject saved = subjectRepo.save(subject);
        auditService.log(saved.getId(), admin, "ROLE_ADMIN", "CREATE_SUBJECT", "ADMIN", "Created subject: " + saved.getCode(), "127.0.0.1");
        return saved;
    }

    public List<ExamSchedule> getAllSchedules() { return examRepo.findAll(); }

    public ExamSchedule createExamSchedule(ExamSchedule schedule, String admin) {
        ExamSchedule saved = examRepo.save(schedule);
        auditService.log(saved.getId(), admin, "ROLE_ADMIN", "CREATE_EXAM_SCHEDULE", "ADMIN", "Scheduled exam: " + saved.getTitle(), "127.0.0.1");
        return saved;
    }

    public ExamSchedule allocateCenters(String examId, List<ExamSchedule.CenterAllocation> allocations, String admin) {
        ExamSchedule schedule = examRepo.findById(examId).orElseThrow(() -> new RuntimeException("Exam not found"));
        schedule.setCenterAllocations(allocations);
        ExamSchedule saved = examRepo.save(schedule);
        auditService.log(saved.getId(), admin, "ROLE_ADMIN", "ALLOCATE_CENTERS", "ADMIN", "Allocated centers for: " + saved.getTitle(), "127.0.0.1");
        return saved;
    }

    public Map<String, Object> getDashboardStats() {
        long totalCheatingAlerts = attemptRepo.findAll().stream().mapToLong(ExamAttempt::getTotalInfractions).sum();
        return Map.of(
            "totalStudents", userRepo.findByRole(UserRole.ROLE_STUDENT.name()).size(),
            "totalFaculty", userRepo.findByRole(UserRole.ROLE_FACULTY.name()).size(),
            "totalCourses", courseRepo.count(),
            "totalSubjects", subjectRepo.count(),
            "totalExams", examRepo.count(),
            "totalSubmissions", attemptRepo.count(),
            "totalCheatingAlerts", totalCheatingAlerts
        );
    }
}
