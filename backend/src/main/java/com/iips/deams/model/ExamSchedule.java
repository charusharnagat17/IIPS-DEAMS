package com.iips.deams.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "exam_schedules")
public class ExamSchedule {
    @Id
    private String id;
    private String title;
    private String courseId;
    private String subjectId;
    private String subjectName;
    private int semester = 1;
    private String createdByFacultyId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int durationMinutes = 60;
    private double totalMarks = 50.0;
    private double passingMarks = 20.0;
    private boolean negativeMarkingEnabled = true;
    private double defaultNegativeFactor = 0.25;
    private String instructions = "1. Fullscreen mode is mandatory.\n2. Switching tabs will trigger warning alerts.\n3. 3 warnings result in automatic submission.\n4. Negative marking is applicable for MCQs.";
    private String status = "SCHEDULED";
    private boolean proctoringEnabled = true;
    private int maxAllowedInfractions = 3;
    private List<CenterAllocation> centerAllocations = new ArrayList<>();
    private List<String> questionIds = new ArrayList<>();

    public ExamSchedule() {}

    public static class CenterAllocation {
        private String centerName;
        private String roomNumber;
        private int capacity;
        private String allocatedRollRange;
        private String invigilatorName;

        public CenterAllocation() {}
        public CenterAllocation(String centerName, String roomNumber, int capacity, String allocatedRollRange, String invigilatorName) {
            this.centerName = centerName; this.roomNumber = roomNumber; this.capacity = capacity;
            this.allocatedRollRange = allocatedRollRange; this.invigilatorName = invigilatorName;
        }

        public String getCenterName() { return centerName; } public void setCenterName(String c) { this.centerName = c; }
        public String getRoomNumber() { return roomNumber; } public void setRoomNumber(String r) { this.roomNumber = r; }
        public int getCapacity() { return capacity; } public void setCapacity(int c) { this.capacity = c; }
        public String getAllocatedRollRange() { return allocatedRollRange; } public void setAllocatedRollRange(String a) { this.allocatedRollRange = a; }
        public String getInvigilatorName() { return invigilatorName; } public void setInvigilatorName(String i) { this.invigilatorName = i; }
    }

    public String getId() { return id; } public void setId(String id) { this.id = id; }
    public String getTitle() { return title; } public void setTitle(String title) { this.title = title; }
    public String getCourseId() { return courseId; } public void setCourseId(String courseId) { this.courseId = courseId; }
    public String getSubjectId() { return subjectId; } public void setSubjectId(String subjectId) { this.subjectId = subjectId; }
    public String getSubjectName() { return subjectName; } public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
    public int getSemester() { return semester; } public void setSemester(int semester) { this.semester = semester; }
    public String getCreatedByFacultyId() { return createdByFacultyId; } public void setCreatedByFacultyId(String f) { this.createdByFacultyId = f; }
    public LocalDateTime getStartTime() { return startTime; } public void setStartTime(LocalDateTime st) { this.startTime = st; }
    public LocalDateTime getEndTime() { return endTime; } public void setEndTime(LocalDateTime et) { this.endTime = et; }
    public int getDurationMinutes() { return durationMinutes; } public void setDurationMinutes(int d) { this.durationMinutes = d; }
    public double getTotalMarks() { return totalMarks; } public void setTotalMarks(double m) { this.totalMarks = m; }
    public double getPassingMarks() { return passingMarks; } public void setPassingMarks(double p) { this.passingMarks = p; }
    public boolean isNegativeMarkingEnabled() { return negativeMarkingEnabled; } public void setNegativeMarkingEnabled(boolean n) { this.negativeMarkingEnabled = n; }
    public double getDefaultNegativeFactor() { return defaultNegativeFactor; } public void setDefaultNegativeFactor(double d) { this.defaultNegativeFactor = d; }
    public String getInstructions() { return instructions; } public void setInstructions(String i) { this.instructions = i; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public boolean isProctoringEnabled() { return proctoringEnabled; } public void setProctoringEnabled(boolean p) { this.proctoringEnabled = p; }
    public int getMaxAllowedInfractions() { return maxAllowedInfractions; } public void setMaxAllowedInfractions(int m) { this.maxAllowedInfractions = m; }
    public List<CenterAllocation> getCenterAllocations() { return centerAllocations; } public void setCenterAllocations(List<CenterAllocation> c) { this.centerAllocations = c; }
    public List<String> getQuestionIds() { return questionIds; } public void setQuestionIds(List<String> q) { this.questionIds = q; }
}
