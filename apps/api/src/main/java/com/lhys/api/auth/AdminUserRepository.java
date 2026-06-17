package com.lhys.api.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {
    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Optional<AdminUser> findByUsername(String username);
}
