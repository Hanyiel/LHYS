package com.lhys.api.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AuthTokenService {
    private final byte[] secret;
    private final long expirationSeconds;

    public AuthTokenService(
            @Value("${lhys.auth.token-secret}") String tokenSecret,
            @Value("${lhys.auth.token-expiration-hours}") long expirationHours) {
        this.secret = tokenSecret.getBytes(StandardCharsets.UTF_8);
        this.expirationSeconds = expirationHours * 60 * 60;
    }

    public String createToken(String username) {
        String usernamePart = encode(username);
        String expiresAt = String.valueOf(Instant.now().getEpochSecond() + expirationSeconds);
        String payload = usernamePart + "." + expiresAt;
        return payload + "." + sign(payload);
    }

    public Optional<String> validateToken(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return Optional.empty();
        }

        String payload = parts[0] + "." + parts[1];
        if (!constantTimeEquals(sign(payload), parts[2])) {
            return Optional.empty();
        }

        long expiresAt;
        try {
            expiresAt = Long.parseLong(parts[1]);
        } catch (NumberFormatException ex) {
            return Optional.empty();
        }

        if (expiresAt < Instant.now().getEpochSecond()) {
            return Optional.empty();
        }

        return Optional.of(decode(parts[0]));
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to sign auth token", ex);
        }
    }

    private String encode(String value) {
        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private String decode(String value) {
        return new String(Base64.getUrlDecoder().decode(value), StandardCharsets.UTF_8);
    }

    private boolean constantTimeEquals(String left, String right) {
        return MessageDigest.isEqual(
                left.getBytes(StandardCharsets.UTF_8),
                right.getBytes(StandardCharsets.UTF_8));
    }
}
