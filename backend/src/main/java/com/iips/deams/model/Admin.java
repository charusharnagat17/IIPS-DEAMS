package com.iips.deams.model;

import com.iips.deams.model.enums.UserRole;
import org.springframework.data.annotation.TypeAlias;

@TypeAlias("ADMIN")
public class Admin extends User {

    public Admin() {
        super();
        this.setRole(UserRole.ROLE_ADMIN.name());
    }

    public Admin(String username, String email, String password, String fullName, String adminCode) {
        super(username, email, password, UserRole.ROLE_ADMIN.name(), fullName, adminCode);
    }
}
