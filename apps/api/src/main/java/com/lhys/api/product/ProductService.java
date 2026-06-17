package com.lhys.api.product;

import com.lhys.api.auth.AdminUser;
import com.lhys.api.auth.AdminUserRepository;
import java.security.Principal;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProductService {
    private final JdbcTemplate jdbcTemplate;
    private final AdminUserRepository adminUserRepository;

    public ProductService(JdbcTemplate jdbcTemplate, AdminUserRepository adminUserRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.adminUserRepository = adminUserRepository;
    }

    public List<ServerProductResponse> listServers(Principal principal) {
        Long adminUserId = currentAdminId(principal);
        return jdbcTemplate.query("""
                SELECT id, admin_user_id, server_name, ip_address, provider, purchase_date,
                       expiry_date, price, ownership_start_date, last_renewed_at, status,
                       notes, created_at, updated_at
                FROM server_products
                WHERE admin_user_id = ?
                ORDER BY expiry_date ASC, id DESC
                """,
                (rs, rowNum) -> new ServerProductResponse(
                        rs.getLong("id"),
                        rs.getLong("admin_user_id"),
                        rs.getString("server_name"),
                        rs.getString("ip_address"),
                        rs.getString("provider"),
                        nullableDate(rs.getDate("purchase_date")),
                        nullableDate(rs.getDate("expiry_date")),
                        rs.getBigDecimal("price"),
                        nullableDate(rs.getDate("ownership_start_date")),
                        nullableDate(rs.getDate("last_renewed_at")),
                        rs.getString("status"),
                        rs.getString("notes"),
                        nullableDateTime(rs.getTimestamp("created_at")),
                        nullableDateTime(rs.getTimestamp("updated_at"))),
                adminUserId);
    }

    public ServerProductResponse createServer(Principal principal, ServerProductRequest request) {
        Long adminUserId = currentAdminId(principal);
        Long id = insertAndReturnId("""
                INSERT INTO server_products
                  (admin_user_id, server_name, ip_address, provider, purchase_date, expiry_date,
                   price, ownership_start_date, last_renewed_at, status, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                adminUserId,
                trim(request.serverName()),
                trim(request.ipAddress()),
                trimOptional(request.provider()),
                request.purchaseDate(),
                request.expiryDate(),
                request.price(),
                request.ownershipStartDate(),
                request.lastRenewedAt(),
                statusOrActive(request.status()),
                trimOptional(request.notes()));
        return findServer(adminUserId, id);
    }

    public ServerProductResponse updateServer(Principal principal, Long id, ServerProductRequest request) {
        Long adminUserId = currentAdminId(principal);
        int updated = jdbcTemplate.update("""
                UPDATE server_products
                SET server_name = ?, ip_address = ?, provider = ?, purchase_date = ?,
                    expiry_date = ?, price = ?, ownership_start_date = ?, last_renewed_at = ?,
                    status = ?, notes = ?
                WHERE id = ? AND admin_user_id = ?
                """,
                trim(request.serverName()),
                trim(request.ipAddress()),
                trimOptional(request.provider()),
                request.purchaseDate(),
                request.expiryDate(),
                request.price(),
                request.ownershipStartDate(),
                request.lastRenewedAt(),
                statusOrActive(request.status()),
                trimOptional(request.notes()),
                id,
                adminUserId);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Server product not found");
        }
        return findServer(adminUserId, id);
    }

    public void deleteServer(Principal principal, Long id) {
        Long adminUserId = currentAdminId(principal);
        jdbcTemplate.update("DELETE FROM server_products WHERE id = ? AND admin_user_id = ?", id, adminUserId);
    }

    public List<DomainProductResponse> listDomains(Principal principal) {
        Long adminUserId = currentAdminId(principal);
        return jdbcTemplate.query("""
                SELECT id, admin_user_id, domain_name, nameserver, registrar, purchase_date,
                       expiry_date, price, last_renewed_at, status, notes, created_at, updated_at
                FROM domain_products
                WHERE admin_user_id = ?
                ORDER BY expiry_date ASC, id DESC
                """,
                (rs, rowNum) -> new DomainProductResponse(
                        rs.getLong("id"),
                        rs.getLong("admin_user_id"),
                        rs.getString("domain_name"),
                        rs.getString("nameserver"),
                        rs.getString("registrar"),
                        nullableDate(rs.getDate("purchase_date")),
                        nullableDate(rs.getDate("expiry_date")),
                        rs.getBigDecimal("price"),
                        nullableDate(rs.getDate("last_renewed_at")),
                        rs.getString("status"),
                        rs.getString("notes"),
                        nullableDateTime(rs.getTimestamp("created_at")),
                        nullableDateTime(rs.getTimestamp("updated_at"))),
                adminUserId);
    }

    public DomainProductResponse createDomain(Principal principal, DomainProductRequest request) {
        Long adminUserId = currentAdminId(principal);
        Long id = insertAndReturnId("""
                INSERT INTO domain_products
                  (admin_user_id, domain_name, nameserver, registrar, purchase_date, expiry_date,
                   price, last_renewed_at, status, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                adminUserId,
                trim(request.domainName()),
                trimOptional(request.nameserver()),
                trimOptional(request.registrar()),
                request.purchaseDate(),
                request.expiryDate(),
                request.price(),
                request.lastRenewedAt(),
                statusOrActive(request.status()),
                trimOptional(request.notes()));
        return findDomain(adminUserId, id);
    }

    public DomainProductResponse updateDomain(Principal principal, Long id, DomainProductRequest request) {
        Long adminUserId = currentAdminId(principal);
        int updated = jdbcTemplate.update("""
                UPDATE domain_products
                SET domain_name = ?, nameserver = ?, registrar = ?, purchase_date = ?,
                    expiry_date = ?, price = ?, last_renewed_at = ?, status = ?, notes = ?
                WHERE id = ? AND admin_user_id = ?
                """,
                trim(request.domainName()),
                trimOptional(request.nameserver()),
                trimOptional(request.registrar()),
                request.purchaseDate(),
                request.expiryDate(),
                request.price(),
                request.lastRenewedAt(),
                statusOrActive(request.status()),
                trimOptional(request.notes()),
                id,
                adminUserId);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Domain product not found");
        }
        return findDomain(adminUserId, id);
    }

    public void deleteDomain(Principal principal, Long id) {
        Long adminUserId = currentAdminId(principal);
        jdbcTemplate.update("DELETE FROM domain_products WHERE id = ? AND admin_user_id = ?", id, adminUserId);
    }

    private ServerProductResponse findServer(Long adminUserId, Long id) {
        return jdbcTemplate.query("""
                SELECT id, admin_user_id, server_name, ip_address, provider, purchase_date,
                       expiry_date, price, ownership_start_date, last_renewed_at, status,
                       notes, created_at, updated_at
                FROM server_products
                WHERE id = ? AND admin_user_id = ?
                """,
                (rs, rowNum) -> new ServerProductResponse(
                        rs.getLong("id"),
                        rs.getLong("admin_user_id"),
                        rs.getString("server_name"),
                        rs.getString("ip_address"),
                        rs.getString("provider"),
                        nullableDate(rs.getDate("purchase_date")),
                        nullableDate(rs.getDate("expiry_date")),
                        rs.getBigDecimal("price"),
                        nullableDate(rs.getDate("ownership_start_date")),
                        nullableDate(rs.getDate("last_renewed_at")),
                        rs.getString("status"),
                        rs.getString("notes"),
                        nullableDateTime(rs.getTimestamp("created_at")),
                        nullableDateTime(rs.getTimestamp("updated_at"))),
                id,
                adminUserId).stream()
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Server product not found"));
    }

    private DomainProductResponse findDomain(Long adminUserId, Long id) {
        return jdbcTemplate.query("""
                SELECT id, admin_user_id, domain_name, nameserver, registrar, purchase_date,
                       expiry_date, price, last_renewed_at, status, notes, created_at, updated_at
                FROM domain_products
                WHERE id = ? AND admin_user_id = ?
                """,
                (rs, rowNum) -> new DomainProductResponse(
                        rs.getLong("id"),
                        rs.getLong("admin_user_id"),
                        rs.getString("domain_name"),
                        rs.getString("nameserver"),
                        rs.getString("registrar"),
                        nullableDate(rs.getDate("purchase_date")),
                        nullableDate(rs.getDate("expiry_date")),
                        rs.getBigDecimal("price"),
                        nullableDate(rs.getDate("last_renewed_at")),
                        rs.getString("status"),
                        rs.getString("notes"),
                        nullableDateTime(rs.getTimestamp("created_at")),
                        nullableDateTime(rs.getTimestamp("updated_at"))),
                id,
                adminUserId).stream()
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Domain product not found"));
    }

    private Long currentAdminId(Principal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        AdminUser adminUser = adminUserRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return adminUser.getId();
    }

    private Long insertAndReturnId(String sql, Object... args) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            for (int i = 0; i < args.length; i++) {
                Object value = args[i];
                if (value instanceof LocalDate localDate) {
                    ps.setDate(i + 1, Date.valueOf(localDate));
                } else {
                    ps.setObject(i + 1, value);
                }
            }
            return ps;
        }, keyHolder);
        Number key = keyHolder.getKey();
        if (key == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No generated id returned");
        }
        return key.longValue();
    }

    private LocalDate nullableDate(Date date) {
        return date == null ? null : date.toLocalDate();
    }

    private LocalDateTime nullableDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }

    private String trim(String value) {
        return value.trim();
    }

    private String trimOptional(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private String statusOrActive(String value) {
        if (!StringUtils.hasText(value)) {
            return "active";
        }
        return value.trim();
    }
}
