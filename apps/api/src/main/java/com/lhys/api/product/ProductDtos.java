package com.lhys.api.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

record ServerProductRequest(
        @NotBlank @Size(max = 200) String serverName,
        @NotBlank @Size(max = 64) String ipAddress,
        @Size(max = 200) String provider,
        LocalDate purchaseDate,
        LocalDate expiryDate,
        BigDecimal price,
        LocalDate ownershipStartDate,
        LocalDate lastRenewedAt,
        @Size(max = 50) String status,
        String notes) {
}

record ServerProductResponse(
        Long id,
        Long adminUserId,
        String serverName,
        String ipAddress,
        String provider,
        LocalDate purchaseDate,
        LocalDate expiryDate,
        BigDecimal price,
        LocalDate ownershipStartDate,
        LocalDate lastRenewedAt,
        String status,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}

record DomainProductRequest(
        @NotBlank @Size(max = 255) String domainName,
        @Size(max = 255) String nameserver,
        @Size(max = 200) String registrar,
        LocalDate purchaseDate,
        LocalDate expiryDate,
        BigDecimal price,
        LocalDate lastRenewedAt,
        @Size(max = 50) String status,
        String notes) {
}

record DomainProductResponse(
        Long id,
        Long adminUserId,
        String domainName,
        String nameserver,
        String registrar,
        LocalDate purchaseDate,
        LocalDate expiryDate,
        BigDecimal price,
        LocalDate lastRenewedAt,
        String status,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
