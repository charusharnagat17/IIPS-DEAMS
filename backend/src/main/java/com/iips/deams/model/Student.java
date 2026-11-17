package com.iips.deams.model;

import com.iips.deams.model.enums.UserRole;
import org.springframework.data.annotation.TypeAlias;

@TypeAlias("STUDENT")
public class Student extends User {

    public Student() {
        super();
        this.setRole(UserRole.ROLE_STUDENT.name());
    }

    public Student(String username, String email, String password, String fullName,
                   String rollNo, String courseId, int semester) {
        super(username, email, password, UserRole.ROLE_STUDENT.name(), fullName, rollNo);
        this.setCourseId(courseId);
        this.setSemester(semester);
    }

    public String getRollNumber() {
        return getRollNoOrFacultyId();
    }

    public void setRollNumber(String rollNumber) {
        setRollNoOrFacultyId(rollNumber);
    }
}
