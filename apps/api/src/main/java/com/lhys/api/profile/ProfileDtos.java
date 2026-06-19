package com.lhys.api.profile;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

record ProfileWorkspaceResponse(
        BasicProfileResponse profile,
        String introduction,
        String skillsText,
        List<SkillItemResponse> skillItems,
        List<ProjectExperienceResponse> projects,
        List<HonorAwardResponse> honors,
        List<WorkExperienceResponse> workExperiences,
        List<PortfolioLinkResponse> links) {
}

record PublicProfileResponse(
        BasicProfileResponse profile,
        String introduction,
        String skillsText,
        List<SkillItemResponse> skillItems,
        List<ProjectExperienceResponse> projects,
        List<HonorAwardResponse> honors,
        List<WorkExperienceResponse> workExperiences,
        List<PortfolioLinkResponse> links) {
}

record BasicProfileRequest(
        @NotBlank @Size(max = 100) String realName,
        @NotBlank @Email @Size(max = 255) String email,
        @Size(max = 500) String avatarUrl,
        @Size(max = 200) String headline,
        @Size(max = 100) String location,
        Boolean visible) {
}

record BasicProfileResponse(
        Long id,
        Long adminUserId,
        String realName,
        String email,
        String avatarUrl,
        String headline,
        String location,
        boolean visible,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}

record AvatarUploadResponse(String avatarUrl) {
}

record IntroductionRequest(String introduction) {
}

record SkillItemRequest(
        @NotBlank @Size(max = 100) String skillName,
        String skillDescription,
        Integer sortOrder,
        Boolean visible) {
}

record SkillItemResponse(
        Long id,
        Long profileId,
        String skillName,
        String skillDescription,
        int sortOrder,
        boolean visible) {
}

record ProjectExperienceRequest(
        @NotBlank @Size(max = 200) String projectName,
        @Size(max = 100) String periodText,
        LocalDate startDate,
        LocalDate endDate,
        String projectSummary,
        String roleDescription,
        String personalContribution,
        @Size(max = 500) String repositoryUrl,
        Integer sortOrder,
        Boolean visible) {
}

record ProjectExperienceResponse(
        Long id,
        Long profileId,
        String projectName,
        String periodText,
        LocalDate startDate,
        LocalDate endDate,
        String projectSummary,
        String roleDescription,
        String personalContribution,
        String repositoryUrl,
        List<ProjectLinkResponse> projectLinks,
        int sortOrder,
        boolean visible) {
}

record ProjectLinkRequest(
        @NotBlank @Size(max = 100) String linkName,
        @NotBlank @Size(max = 500) String linkUrl,
        Integer sortOrder,
        Boolean visible) {
}

record ProjectLinkResponse(
        Long id,
        Long projectId,
        String linkName,
        String linkUrl,
        int sortOrder,
        boolean visible) {
}

record HonorAwardRequest(
        @NotBlank @Size(max = 200) String awardName,
        LocalDate awardedDate,
        @Size(max = 100) String awardLevel,
        @Size(max = 500) String certificatePdfUrl,
        Integer sortOrder,
        Boolean visible) {
}

record HonorAwardResponse(
        Long id,
        Long profileId,
        String awardName,
        LocalDate awardedDate,
        String awardLevel,
        String certificatePdfUrl,
        int sortOrder,
        boolean visible) {
}

record WorkExperienceRequest(
        @NotBlank @Size(max = 200) String organization,
        @Size(max = 150) String positionTitle,
        @Size(max = 100) String periodText,
        LocalDate startDate,
        LocalDate endDate,
        String workContent,
        String achievements,
        Integer sortOrder,
        Boolean visible) {
}

record WorkExperienceResponse(
        Long id,
        Long profileId,
        String organization,
        String positionTitle,
        String periodText,
        LocalDate startDate,
        LocalDate endDate,
        String workContent,
        String achievements,
        int sortOrder,
        boolean visible) {
}

record PortfolioLinkRequest(
        @NotBlank @Size(max = 100) String linkName,
        @NotBlank @Size(max = 500) String linkUrl,
        Integer sortOrder,
        Boolean visible) {
}

record PortfolioLinkResponse(
        Long id,
        Long profileId,
        String linkName,
        String linkUrl,
        int sortOrder,
        boolean visible) {
}
