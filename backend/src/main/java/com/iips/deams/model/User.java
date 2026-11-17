package com.iips.deams.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    @Indexed(unique = true)
    private String username;
    @Indexed(unique = true)
    private String email;
    private String password;
    private String role;
    private String fullName;
    private String rollNoOrFacultyId;
    private String courseId;
    private Integer semester;
    private boolean active = true;
    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}
    public User(String username, String email, String password, String role, String fullName, String rollNoOrFacultyId) {
        this.username = username; this.email = email; this.password = password;
        this.role = role; this.fullName = fullName; this.rollNoOrFacultyId = rollNoOrFacultyId;
        this.active = true; this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; } public void setId(String id) { this.id = id; }
    public String getUsername() { return username; } public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; } public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; } public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; } public void setRole(String role) { this.role = role; }
    public String getFullName() { return fullName; } public void setFullName(String fullName) { this.fullName = fullName; }
    public String getRollNoOrFacultyId() { return rollNoOrFacultyId; } public void setRollNoOrFacultyId(String rollNoOrFacultyId) { this.rollNoOrFacultyId = rollNoOrFacultyId; }
    public String getCourseId() { return courseId; } public void setCourseId(String courseId) { this.courseId = courseId; }
    public Integer getSemester() { return semester; } public void setSemester(Integer semester) { this.semester = semester; }
    public boolean isActive() { return active; } public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
