package com.lhys.api.auth;

public record LoginResponse(
        String token,
        AdminUserResponse user) {
}
