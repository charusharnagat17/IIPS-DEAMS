package com.iips.deams.service;

import com.iips.deams.config.JwtUtils;
import com.iips.deams.dto.AuthResponse;
import com.iips.deams.dto.LoginRequest;
import com.iips.deams.dto.RegisterRequest;
import com.iips.deams.factory.UserFactory;
import com.iips.deams.model.User;
import com.iips.deams.model.enums.UserRole;
import com.iips.deams.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final AuditService auditService;

    public AuthService(UserRepository userRepo, PasswordEncoder encoder, JwtUtils jwtUtils, AuditService auditService) {
        this.userRepo = userRepo; this.encoder = encoder; this.jwtUtils = jwtUtils; this.auditService = auditService;
    }

    public AuthResponse login(LoginRequest req, String ip) {
        String query = req.getUsernameOrEmail().trim();
        Optional<User> opt = userRepo.findByUsername(query);
        if (opt.isEmpty()) opt = userRepo.findByEmail(query);
        if (opt.isEmpty()) throw new RuntimeException("Invalid username or email.");

        User user = opt.get();
        if (!encoder.matches(req.getPassword(), user.getPassword())) throw new RuntimeException("Invalid password.");
        if (!user.isActive()) throw new RuntimeException("Account is disabled.");

        String token = jwtUtils.generateJwtToken(user.getUsername(), user.getRole(), user.getId());
        auditService.log(user.getId(), user.getUsername(), user.getRole(), "USER_LOGIN", "AUTH", "Login from " + ip, ip);
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail(), user.getRole(),
                user.getFullName(), user.getRollNoOrFacultyId(), user.getCourseId(), user.getSemester());
    }

    public AuthResponse register(RegisterRequest req, String ip) {
        if (userRepo.existsByUsername(req.getUsername()) || userRepo.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Username or email already exists.");
        }
        User user = UserFactory.createUser(
                UserRole.fromString(req.getRole()), req.getUsername(), req.getEmail(),
                encoder.encode(req.getPassword()), req.getFullName(), req.getRollNoOrFacultyId(),
                req.getCourseId(), req.getSemester()
        );
        User saved = userRepo.save(user);
        auditService.log(saved.getId(), saved.getUsername(), saved.getRole(), "USER_REGISTER", "AUTH", "Registered: " + saved.getFullName(), ip);
        String token = jwtUtils.generateJwtToken(saved.getUsername(), saved.getRole(), saved.getId());
        return new AuthResponse(token, saved.getId(), saved.getUsername(), saved.getEmail(), saved.getRole(),
                saved.getFullName(), saved.getRollNoOrFacultyId(), saved.getCourseId(), saved.getSemester());
    }

    public User getUserByUsername(String username) {
        return userRepo.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found: " + username));
    }
}
