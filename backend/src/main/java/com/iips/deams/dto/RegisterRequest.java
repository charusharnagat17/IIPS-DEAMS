package com.iips.deams.dto;

public record RegisterRequest(
    String username, String email, String password, String role,
    String fullName, String rollNoOrFacultyId, String courseId, Integer semester
) {
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getRole() { return role; }
    public String getFullName() { return fullName; }
    public String getRollNoOrFacultyId() { return rollNoOrFacultyId; }
    public String getCourseId() { return courseId; }
    public Integer getSemester() { return semester; }
}
