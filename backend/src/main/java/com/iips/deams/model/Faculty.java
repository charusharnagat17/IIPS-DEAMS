package com.iips.deams.model;

import com.iips.deams.model.enums.UserRole;
import org.springframework.data.annotation.TypeAlias;

@TypeAlias("FACULTY")
public class Faculty extends User {

    public Faculty() {
        super();
        this.setRole(UserRole.ROLE_FACULTY.name());
    }

    public Faculty(String username, String email, String password, String fullName, String facultyId) {
        super(username, email, password, UserRole.ROLE_FACULTY.name(), fullName, facultyId);
    }

    public String getFacultyId() {
        return getRollNoOrFacultyId();
    }

    public void setFacultyId(String facultyId) {
        setRollNoOrFacultyId(facultyId);
    }
}
