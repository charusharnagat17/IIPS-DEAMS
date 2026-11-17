package com.iips.deams.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "courses")
public class Course {
    @Id
    private String id;
    private String code;
    private String name;
    private String department;
    private int durationYears;
    private int totalSemesters;
    private String description;

    public Course() {}
    public Course(String id, String code, String name, String department, int durationYears, int totalSemesters, String description) {
        this.id = id; this.code = code; this.name = name; this.department = department;
        this.durationYears = durationYears; this.totalSemesters = totalSemesters; this.description = description;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public int getDurationYears() { return durationYears; }
    public void setDurationYears(int durationYears) { this.durationYears = durationYears; }
    public int getTotalSemesters() { return totalSemesters; }
    public void setTotalSemesters(int totalSemesters) { this.totalSemesters = totalSemesters; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
