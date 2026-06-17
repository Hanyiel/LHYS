package com.lhys.api.auth;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminUserService {
    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthTokenService authTokenService;

    public AdminUserService(
            AdminUserRepository adminUserRepository,
            PasswordEncoder passwordEncoder,
            AuthTokenService authTokenService) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.authTokenService = authTokenService;
    }

    public LoginResponse login(LoginRequest request) {
        AdminUser adminUser = adminUserRepository.findByUsername(request.username())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid username or password"));

        if (!adminUser.isEnabled()
                || !passwordEncoder.matches(request.password(), adminUser.getPasswordHash())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid username or password");
        }

        adminUser.setLastLoginAt(LocalDateTime.now());
        AdminUser savedUser = adminUserRepository.save(adminUser);
        return new LoginResponse(
                authTokenService.createToken(savedUser.getUsername()),
                AdminUserResponse.from(savedUser));
    }

    public AdminUserResponse findByUsername(String username) {
        return adminUserRepository.findByUsername(username)
                .map(AdminUserResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin user not found"));
    }

    public List<AdminUserResponse> listAdminUsers() {
        return adminUserRepository.findAll().stream()
                .map(AdminUserResponse::from)
                .toList();
    }

    public AdminUserResponse createAdminUser(CreateAdminUserRequest request) {
        String username = request.username().trim();
        String email = normalizeOptional(request.email());

        if (adminUserRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        if (StringUtils.hasText(email) && adminUserRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        AdminUser adminUser = new AdminUser();
        adminUser.setUsername(username);
        adminUser.setPasswordHash(passwordEncoder.encode(request.password()));
        adminUser.setDisplayName(request.displayName().trim());
        adminUser.setEmail(email);
        adminUser.setEnabled(request.enabled() == null || request.enabled());

        return AdminUserResponse.from(adminUserRepository.save(adminUser));
    }

    private String normalizeOptional(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }

        return value.trim();
    }
}
