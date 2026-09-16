package com.bluegen.deepsyncapp.controller;

import com.bluegen.deepsyncapp.dto.LoginRequest;
import com.bluegen.deepsyncapp.dto.SignupRequest;
import com.bluegen.deepsyncapp.entity.UserEntity;
import com.bluegen.deepsyncapp.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        String identifier = null;
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            identifier = request.getEmail().trim();
        } else if (request.getEmployeeId() != null && !request.getEmployeeId().trim().isEmpty()) {
            identifier = request.getEmployeeId().trim();
        }

        if (identifier == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email or Employee ID is required."));
        }

        if (request.getPassword() == null || request.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters long."));
        }

        Optional<UserEntity> existing = userRepository.findByEmpIdOrEmail(identifier);
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Account with this identifier already exists."));
        }

        // Also check if alternate employeeId or email matches
        if (request.getEmployeeId() != null && !request.getEmployeeId().trim().isEmpty()) {
            Optional<UserEntity> existingEmp = userRepository.findByEmpIdOrEmail(request.getEmployeeId().trim());
            if (existingEmp.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Account with this Employee ID already exists."));
            }
        }

        UserEntity user = new UserEntity();
        user.setEmpIdOrEmail(identifier);
        user.setFullName(request.getFullName() != null && !request.getFullName().isBlank() 
                ? request.getFullName().trim() 
                : identifier);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        // Set to active=true so users can immediately test & log in
        user.setActive(true);

        UserEntity saved = userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Account created successfully! You can now sign in.");
        response.put("userId", saved.getId());
        response.put("empIdOrEmail", saved.getEmpIdOrEmail());
        response.put("fullName", saved.getFullName());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String identifier = request.getEmpIdOrEmail();
        if (identifier == null || identifier.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Emp ID or Institutional Email is required."));
        }
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password is required."));
        }

        identifier = identifier.trim();

        Optional<UserEntity> userOpt = userRepository.findByEmpIdOrEmail(identifier);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid credentials. User not found."));
        }

        UserEntity user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid credentials. Incorrect password."));
        }

        if (!user.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Account is inactive. Pending admin approval."));
        }

        String token = "ds_token_" + UUID.randomUUID().toString();

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("empIdOrEmail", user.getEmpIdOrEmail());
        userData.put("fullName", user.getFullName());
        userData.put("active", user.isActive());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", userData);
        response.put("message", "Login successful");

        return ResponseEntity.ok(response);
    }
}
