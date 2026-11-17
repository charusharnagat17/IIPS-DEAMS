package com.iips.deams.factory;

import com.iips.deams.model.*;
import com.iips.deams.model.enums.UserRole;

public class UserFactory {

    public static User createUser(UserRole role, String username, String email, String password,
                                  String fullName, String rollNoOrId, String courseId, Integer semester) {
        return switch (role) {
            case ROLE_ADMIN -> new Admin(username, email, password, fullName, rollNoOrId);
            case ROLE_FACULTY -> new Faculty(username, email, password, fullName, rollNoOrId);
            case ROLE_STUDENT -> {
                Student student = new Student(username, email, password, fullName, rollNoOrId, courseId, semester != null ? semester : 1);
                yield student;
            }
        };
    }
}
