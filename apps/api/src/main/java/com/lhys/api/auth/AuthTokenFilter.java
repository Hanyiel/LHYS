package com.lhys.api.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class AuthTokenFilter extends OncePerRequestFilter {
    private final AuthTokenService authTokenService;
    private final AdminUserRepository adminUserRepository;

    public AuthTokenFilter(
            AuthTokenService authTokenService,
            AdminUserRepository adminUserRepository) {
        this.authTokenService = authTokenService;
        this.adminUserRepository = adminUserRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");

        if (authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.substring("Bearer ".length());
            authTokenService.validateToken(token)
                    .flatMap(adminUserRepository::findByUsername)
                    .filter(AdminUser::isEnabled)
                    .ifPresent(adminUser -> {
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        adminUser.getUsername(),
                                        null,
                                        List.of(new SimpleGrantedAuthority("ROLE_" + adminUser.getRole())));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    });
        }

        filterChain.doFilter(request, response);
    }
}
