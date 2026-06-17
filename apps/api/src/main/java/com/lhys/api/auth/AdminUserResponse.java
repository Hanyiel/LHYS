package com.lhys.api.auth;

import java.time.LocalDateTime;

public record AdminUserResponse(
        Long id,
        String username,
        String displayName,
        String email,
        String role,
        boolean enabled,
        LocalDateTime lastLoginAt,
        LocalDateTime createdAt) {
    public static AdminUserResponse from(AdminUser user) {
        return new AdminUserResponse(
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled(),
                user.getLastLoginAt(),
                user.getCreatedAt());
    }
}
