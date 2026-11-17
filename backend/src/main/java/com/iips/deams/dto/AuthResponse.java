package com.iips.deams.dto;

public record AuthResponse(
    String token, String id, String username, String email, String role,
    String fullName, String rollNoOrFacultyId, String courseId, Integer semester
) {
    public String getToken() { return token; }
    public String getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getFullName() { return fullName; }
    public String getRollNoOrFacultyId() { return rollNoOrFacultyId; }
    public String getCourseId() { return courseId; }
    public Integer getSemester() { return semester; }
}
