package com.iips.deams.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "subjects")
public class Subject {
    @Id
    private String id;
    private String code;
    private String name;
    private String courseId;
    private int semester;
    private int credits;
    private String facultyId;

    public Subject() {}
    public Subject(String id, String code, String name, String courseId, int semester, int credits, String facultyId) {
        this.id = id; this.code = code; this.name = name; this.courseId = courseId;
        this.semester = semester; this.credits = credits; this.facultyId = facultyId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }
    public int getCredits() { return credits; }
    public void setCredits(int credits) { this.credits = credits; }
    public String getFacultyId() { return facultyId; }
    public void setFacultyId(String facultyId) { this.facultyId = facultyId; }
}
