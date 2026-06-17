package com.lhys.api.profile;

import com.lhys.api.auth.AdminUser;
import com.lhys.api.auth.AdminUserRepository;
import com.lhys.api.upload.UploadProperties;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.Principal;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProfileService {
    private final JdbcTemplate jdbcTemplate;
    private final AdminUserRepository adminUserRepository;
    private final UploadProperties uploadProperties;

    public ProfileService(
            JdbcTemplate jdbcTemplate,
            AdminUserRepository adminUserRepository,
            UploadProperties uploadProperties) {
        this.jdbcTemplate = jdbcTemplate;
        this.adminUserRepository = adminUserRepository;
        this.uploadProperties = uploadProperties;
    }

    public ProfileWorkspaceResponse getWorkspace(Principal principal) {
        Long adminUserId = currentAdminId(principal);
        BasicProfileResponse profile = findProfileByAdminUserId(adminUserId).orElse(null);
        Long profileId = profile == null ? null : profile.id();

        return new ProfileWorkspaceResponse(
                profile,
                profileId == null ? "" : findSingleText("profile_introductions", "introduction", profileId),
                profileId == null ? "" : findSingleText("profile_skills", "skills_text", profileId),
                profileId == null ? List.of() : listProjects(profileId),
                profileId == null ? List.of() : listHonors(profileId),
                profileId == null ? List.of() : listWorkExperiences(profileId),
                profileId == null ? List.of() : listLinks(profileId));
    }

    public PublicProfileResponse getPublicProfile(String username) {
        BasicProfileResponse profile = findPublicProfileByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        return buildPublicProfile(profile);
    }

    public PublicProfileResponse getPublicProfileByAdminUserId(Long adminUserId) {
        BasicProfileResponse profile = findPublicProfileByAdminUserId(adminUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        return buildPublicProfile(profile);
    }

    private PublicProfileResponse buildPublicProfile(BasicProfileResponse profile) {
        Long profileId = profile.id();

        return new PublicProfileResponse(
                profile,
                findSingleText("profile_introductions", "introduction", profileId),
                findSingleText("profile_skills", "skills_text", profileId),
                listVisibleProjects(profileId),
                listVisibleHonors(profileId),
                listVisibleWorkExperiences(profileId),
                listVisibleLinks(profileId));
    }

    public BasicProfileResponse saveBasicProfile(Principal principal, BasicProfileRequest request) {
        Long adminUserId = currentAdminId(principal);
        Optional<BasicProfileResponse> existing = findProfileByAdminUserId(adminUserId);

        if (existing.isPresent()) {
            jdbcTemplate.update("""
                    UPDATE personal_profiles
                    SET real_name = ?, email = ?, avatar_url = ?, headline = ?, location = ?, visible = ?
                    WHERE admin_user_id = ?
                    """,
                    trim(request.realName()),
                    trimOptional(request.email()),
                    trimOptional(request.avatarUrl()),
                    trimOptional(request.headline()),
                    trimOptional(request.location()),
                    request.visible() == null || request.visible(),
                    adminUserId);
        } else {
            jdbcTemplate.update("""
                    INSERT INTO personal_profiles
                      (admin_user_id, real_name, email, avatar_url, headline, location, visible)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    adminUserId,
                    trim(request.realName()),
                    trimOptional(request.email()),
                    trimOptional(request.avatarUrl()),
                    trimOptional(request.headline()),
                    trimOptional(request.location()),
                    request.visible() == null || request.visible());
        }

        return findProfileByAdminUserId(adminUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR));
    }

    public AvatarUploadResponse uploadAvatar(Principal principal, MultipartFile file) {
        Long adminUserId = currentAdminId(principal);
        Long profileId = currentProfileId(principal);

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please select an image file");
        }

        String extension = extensionOf(file.getContentType(), file.getOriginalFilename());
        if (extension == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only JPG, PNG or WebP images are supported");
        }

        Path avatarDir = Path.of(uploadProperties.rootDir(), "avatars")
                .toAbsolutePath()
                .normalize();
        String fileName = "avatar-admin-" + adminUserId + "-"
                + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
                + "-" + UUID.randomUUID() + "." + extension;
        Path target = avatarDir.resolve(fileName).normalize();

        if (!target.startsWith(avatarDir)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file path");
        }

        try {
            Files.createDirectories(avatarDir);
            file.transferTo(target);
        } catch (IOException cause) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save image", cause);
        }

        String avatarUrl = normalizePublicPath(uploadProperties.publicPath()) + "/avatars/" + fileName;
        jdbcTemplate.update(
                "UPDATE personal_profiles SET avatar_url = ? WHERE id = ?",
                avatarUrl,
                profileId);

        return new AvatarUploadResponse(avatarUrl);
    }

    public void saveIntroduction(Principal principal, IntroductionRequest request) {
        Long profileId = currentProfileId(principal);
        upsertSingleText("profile_introductions", "introduction", profileId, trimToEmpty(request.introduction()));
    }

    public void saveSkills(Principal principal, SkillsRequest request) {
        Long profileId = currentProfileId(principal);
        upsertSingleText("profile_skills", "skills_text", profileId, trimToEmpty(request.skillsText()));
    }

    public ProjectExperienceResponse createProject(Principal principal, ProjectExperienceRequest request) {
        Long profileId = currentProfileId(principal);
        Long id = insertAndReturnId("""
                INSERT INTO project_experiences
                  (profile_id, project_name, period_text, start_date, end_date, project_summary,
                   role_description, personal_contribution, repository_url, sort_order, visible)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                profileId,
                trim(request.projectName()),
                trimOptional(request.periodText()),
                request.startDate(),
                request.endDate(),
                trimOptional(request.projectSummary()),
                trimOptional(request.roleDescription()),
                trimOptional(request.personalContribution()),
                trimOptional(request.repositoryUrl()),
                valueOrZero(request.sortOrder()),
                request.visible() == null || request.visible());
        return findProject(profileId, id);
    }

    public void deleteProject(Principal principal, Long id) {
        deleteOwned("project_experiences", currentProfileId(principal), id);
    }

    public HonorAwardResponse createHonor(Principal principal, HonorAwardRequest request) {
        Long profileId = currentProfileId(principal);
        Long id = insertAndReturnId("""
                INSERT INTO honor_awards
                  (profile_id, award_name, awarded_date, award_level, certificate_pdf_url, sort_order, visible)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                profileId,
                trim(request.awardName()),
                request.awardedDate(),
                trimOptional(request.awardLevel()),
                trimOptional(request.certificatePdfUrl()),
                valueOrZero(request.sortOrder()),
                request.visible() == null || request.visible());
        return findHonor(profileId, id);
    }

    public void deleteHonor(Principal principal, Long id) {
        deleteOwned("honor_awards", currentProfileId(principal), id);
    }

    public WorkExperienceResponse createWorkExperience(Principal principal, WorkExperienceRequest request) {
        Long profileId = currentProfileId(principal);
        Long id = insertAndReturnId("""
                INSERT INTO work_experiences
                  (profile_id, organization, position_title, period_text, start_date, end_date,
                   work_content, achievements, sort_order, visible)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                profileId,
                trim(request.organization()),
                trimOptional(request.positionTitle()),
                trimOptional(request.periodText()),
                request.startDate(),
                request.endDate(),
                trimOptional(request.workContent()),
                trimOptional(request.achievements()),
                valueOrZero(request.sortOrder()),
                request.visible() == null || request.visible());
        return findWork(profileId, id);
    }

    public void deleteWorkExperience(Principal principal, Long id) {
        deleteOwned("work_experiences", currentProfileId(principal), id);
    }

    public PortfolioLinkResponse createLink(Principal principal, PortfolioLinkRequest request) {
        Long profileId = currentProfileId(principal);
        Long id = insertAndReturnId("""
                INSERT INTO portfolio_links
                  (profile_id, link_name, link_url, sort_order, visible)
                VALUES (?, ?, ?, ?, ?)
                """,
                profileId,
                trim(request.linkName()),
                trim(request.linkUrl()),
                valueOrZero(request.sortOrder()),
                request.visible() == null || request.visible());
        return findLink(profileId, id);
    }

    public void deleteLink(Principal principal, Long id) {
        deleteOwned("portfolio_links", currentProfileId(principal), id);
    }

    private Optional<BasicProfileResponse> findProfileByAdminUserId(Long adminUserId) {
        List<BasicProfileResponse> results = jdbcTemplate.query("""
                SELECT id, admin_user_id, real_name, email, avatar_url, headline, location,
                       visible, created_at, updated_at
                FROM personal_profiles
                WHERE admin_user_id = ?
                """,
                (rs, rowNum) -> new BasicProfileResponse(
                        rs.getLong("id"),
                        rs.getLong("admin_user_id"),
                        rs.getString("real_name"),
                        rs.getString("email"),
                        rs.getString("avatar_url"),
                        rs.getString("headline"),
                        rs.getString("location"),
                        rs.getBoolean("visible"),
                        rs.getTimestamp("created_at").toLocalDateTime(),
                        rs.getTimestamp("updated_at").toLocalDateTime()),
                adminUserId);
        return results.stream().findFirst();
    }

    private Optional<BasicProfileResponse> findPublicProfileByUsername(String username) {
        List<BasicProfileResponse> results = jdbcTemplate.query("""
                SELECT pp.id, pp.admin_user_id, pp.real_name, pp.email, pp.avatar_url, pp.headline,
                       pp.location, pp.visible, pp.created_at, pp.updated_at
                FROM personal_profiles pp
                JOIN admin_users au ON au.id = pp.admin_user_id
                WHERE au.username = ? AND au.enabled = TRUE AND pp.visible = TRUE
                """,
                (rs, rowNum) -> new BasicProfileResponse(
                        rs.getLong("id"),
                        rs.getLong("admin_user_id"),
                        rs.getString("real_name"),
                        rs.getString("email"),
                        rs.getString("avatar_url"),
                        rs.getString("headline"),
                        rs.getString("location"),
                        rs.getBoolean("visible"),
                        rs.getTimestamp("created_at").toLocalDateTime(),
                        rs.getTimestamp("updated_at").toLocalDateTime()),
                username);
        return results.stream().findFirst();
    }

    private Optional<BasicProfileResponse> findPublicProfileByAdminUserId(Long adminUserId) {
        List<BasicProfileResponse> results = jdbcTemplate.query("""
                SELECT pp.id, pp.admin_user_id, pp.real_name, pp.email, pp.avatar_url, pp.headline,
                       pp.location, pp.visible, pp.created_at, pp.updated_at
                FROM personal_profiles pp
                JOIN admin_users au ON au.id = pp.admin_user_id
                WHERE au.id = ? AND au.enabled = TRUE AND pp.visible = TRUE
                """,
                (rs, rowNum) -> new BasicProfileResponse(
                        rs.getLong("id"),
                        rs.getLong("admin_user_id"),
                        rs.getString("real_name"),
                        rs.getString("email"),
                        rs.getString("avatar_url"),
                        rs.getString("headline"),
                        rs.getString("location"),
                        rs.getBoolean("visible"),
                        rs.getTimestamp("created_at").toLocalDateTime(),
                        rs.getTimestamp("updated_at").toLocalDateTime()),
                adminUserId);
        return results.stream().findFirst();
    }

    private String findSingleText(String table, String column, Long profileId) {
        List<String> results = jdbcTemplate.query(
                "SELECT " + column + " FROM " + table + " WHERE profile_id = ?",
                (rs, rowNum) -> rs.getString(column),
                profileId);
        return results.stream().findFirst().orElse("");
    }

    private void upsertSingleText(String table, String column, Long profileId, String value) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM " + table + " WHERE profile_id = ?",
                Integer.class,
                profileId);
        if (count != null && count > 0) {
            jdbcTemplate.update(
                    "UPDATE " + table + " SET " + column + " = ? WHERE profile_id = ?",
                    trim(value),
                    profileId);
        } else {
            jdbcTemplate.update(
                    "INSERT INTO " + table + " (profile_id, " + column + ") VALUES (?, ?)",
                    profileId,
                    trim(value));
        }
    }

    private List<ProjectExperienceResponse> listProjects(Long profileId) {
        return jdbcTemplate.query("""
                SELECT id, profile_id, project_name, period_text, start_date, end_date, project_summary,
                       role_description, personal_contribution, repository_url, sort_order, visible
                FROM project_experiences
                WHERE profile_id = ?
                ORDER BY sort_order ASC, id DESC
                """,
                (rs, rowNum) -> new ProjectExperienceResponse(
                        rs.getLong("id"),
                        rs.getLong("profile_id"),
                        rs.getString("project_name"),
                        rs.getString("period_text"),
                        nullableDate(rs.getDate("start_date")),
                        nullableDate(rs.getDate("end_date")),
                        rs.getString("project_summary"),
                        rs.getString("role_description"),
                        rs.getString("personal_contribution"),
                        rs.getString("repository_url"),
                        rs.getInt("sort_order"),
                        rs.getBoolean("visible")),
                profileId);
    }

    private List<ProjectExperienceResponse> listVisibleProjects(Long profileId) {
        return jdbcTemplate.query("""
                SELECT id, profile_id, project_name, period_text, start_date, end_date, project_summary,
                       role_description, personal_contribution, repository_url, sort_order, visible
                FROM project_experiences
                WHERE profile_id = ? AND visible = TRUE
                ORDER BY sort_order ASC, id DESC
                """,
                (rs, rowNum) -> new ProjectExperienceResponse(
                        rs.getLong("id"),
                        rs.getLong("profile_id"),
                        rs.getString("project_name"),
                        rs.getString("period_text"),
                        nullableDate(rs.getDate("start_date")),
                        nullableDate(rs.getDate("end_date")),
                        rs.getString("project_summary"),
                        rs.getString("role_description"),
                        rs.getString("personal_contribution"),
                        rs.getString("repository_url"),
                        rs.getInt("sort_order"),
                        rs.getBoolean("visible")),
                profileId);
    }

    private List<HonorAwardResponse> listHonors(Long profileId) {
        return jdbcTemplate.query("""
                SELECT id, profile_id, award_name, awarded_date, award_level, certificate_pdf_url,
                       sort_order, visible
                FROM honor_awards
                WHERE profile_id = ?
                ORDER BY sort_order ASC, id DESC
                """,
                (rs, rowNum) -> new HonorAwardResponse(
                        rs.getLong("id"),
                        rs.getLong("profile_id"),
                        rs.getString("award_name"),
                        nullableDate(rs.getDate("awarded_date")),
                        rs.getString("award_level"),
                        rs.getString("certificate_pdf_url"),
                        rs.getInt("sort_order"),
                        rs.getBoolean("visible")),
                profileId);
    }

    private List<HonorAwardResponse> listVisibleHonors(Long profileId) {
        return jdbcTemplate.query("""
                SELECT id, profile_id, award_name, awarded_date, award_level, certificate_pdf_url,
                       sort_order, visible
                FROM honor_awards
                WHERE profile_id = ? AND visible = TRUE
                ORDER BY sort_order ASC, id DESC
                """,
                (rs, rowNum) -> new HonorAwardResponse(
                        rs.getLong("id"),
                        rs.getLong("profile_id"),
                        rs.getString("award_name"),
                        nullableDate(rs.getDate("awarded_date")),
                        rs.getString("award_level"),
                        rs.getString("certificate_pdf_url"),
                        rs.getInt("sort_order"),
                        rs.getBoolean("visible")),
                profileId);
    }

    private List<WorkExperienceResponse> listWorkExperiences(Long profileId) {
        return jdbcTemplate.query("""
                SELECT id, profile_id, organization, position_title, period_text, start_date, end_date,
                       work_content, achievements, sort_order, visible
                FROM work_experiences
                WHERE profile_id = ?
                ORDER BY sort_order ASC, id DESC
                """,
                (rs, rowNum) -> new WorkExperienceResponse(
                        rs.getLong("id"),
                        rs.getLong("profile_id"),
                        rs.getString("organization"),
                        rs.getString("position_title"),
                        rs.getString("period_text"),
                        nullableDate(rs.getDate("start_date")),
                        nullableDate(rs.getDate("end_date")),
                        rs.getString("work_content"),
                        rs.getString("achievements"),
                        rs.getInt("sort_order"),
                        rs.getBoolean("visible")),
                profileId);
    }

    private List<WorkExperienceResponse> listVisibleWorkExperiences(Long profileId) {
        return jdbcTemplate.query("""
                SELECT id, profile_id, organization, position_title, period_text, start_date, end_date,
                       work_content, achievements, sort_order, visible
                FROM work_experiences
                WHERE profile_id = ? AND visible = TRUE
                ORDER BY sort_order ASC, id DESC
                """,
                (rs, rowNum) -> new WorkExperienceResponse(
                        rs.getLong("id"),
                        rs.getLong("profile_id"),
                        rs.getString("organization"),
                        rs.getString("position_title"),
                        rs.getString("period_text"),
                        nullableDate(rs.getDate("start_date")),
                        nullableDate(rs.getDate("end_date")),
                        rs.getString("work_content"),
                        rs.getString("achievements"),
                        rs.getInt("sort_order"),
                        rs.getBoolean("visible")),
                profileId);
    }

    private List<PortfolioLinkResponse> listLinks(Long profileId) {
        return jdbcTemplate.query("""
                SELECT id, profile_id, link_name, link_url, sort_order, visible
                FROM portfolio_links
                WHERE profile_id = ?
                ORDER BY sort_order ASC, id DESC
                """,
                (rs, rowNum) -> new PortfolioLinkResponse(
                        rs.getLong("id"),
                        rs.getLong("profile_id"),
                        rs.getString("link_name"),
                        rs.getString("link_url"),
                        rs.getInt("sort_order"),
                        rs.getBoolean("visible")),
                profileId);
    }

    private List<PortfolioLinkResponse> listVisibleLinks(Long profileId) {
        return jdbcTemplate.query("""
                SELECT id, profile_id, link_name, link_url, sort_order, visible
                FROM portfolio_links
                WHERE profile_id = ? AND visible = TRUE
                ORDER BY sort_order ASC, id DESC
                """,
                (rs, rowNum) -> new PortfolioLinkResponse(
                        rs.getLong("id"),
                        rs.getLong("profile_id"),
                        rs.getString("link_name"),
                        rs.getString("link_url"),
                        rs.getInt("sort_order"),
                        rs.getBoolean("visible")),
                profileId);
    }

    private ProjectExperienceResponse findProject(Long profileId, Long id) {
        return listProjects(profileId).stream()
                .filter(project -> project.id().equals(id))
                .findFirst()
                .orElseThrow();
    }

    private HonorAwardResponse findHonor(Long profileId, Long id) {
        return listHonors(profileId).stream()
                .filter(honor -> honor.id().equals(id))
                .findFirst()
                .orElseThrow();
    }

    private WorkExperienceResponse findWork(Long profileId, Long id) {
        return listWorkExperiences(profileId).stream()
                .filter(work -> work.id().equals(id))
                .findFirst()
                .orElseThrow();
    }

    private PortfolioLinkResponse findLink(Long profileId, Long id) {
        return listLinks(profileId).stream()
                .filter(link -> link.id().equals(id))
                .findFirst()
                .orElseThrow();
    }

    private Long currentProfileId(Principal principal) {
        Long adminUserId = currentAdminId(principal);
        return findProfileByAdminUserId(adminUserId)
                .map(BasicProfileResponse::id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Please save basic profile first"));
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

    private void deleteOwned(String table, Long profileId, Long id) {
        jdbcTemplate.update("DELETE FROM " + table + " WHERE id = ? AND profile_id = ?", id, profileId);
    }

    private LocalDate nullableDate(Date date) {
        return date == null ? null : date.toLocalDate();
    }

    private int valueOrZero(Integer value) {
        return value == null ? 0 : value;
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

    private String trimToEmpty(String value) {
        if (value == null) {
            return "";
        }
        return value.trim();
    }

    private String extensionOf(String contentType, String originalFilename) {
        String normalizedContentType = contentType == null ? "" : contentType.toLowerCase(Locale.ROOT);
        return switch (normalizedContentType) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            default -> extensionFromFilename(originalFilename);
        };
    }

    private String extensionFromFilename(String originalFilename) {
        if (!StringUtils.hasText(originalFilename) || !originalFilename.contains(".")) {
            return null;
        }
        String extension = originalFilename.substring(originalFilename.lastIndexOf('.') + 1)
                .toLowerCase(Locale.ROOT);
        return switch (extension) {
            case "jpg", "jpeg" -> "jpg";
            case "png" -> "png";
            case "webp" -> "webp";
            default -> null;
        };
    }

    private String normalizePublicPath(String value) {
        if (!StringUtils.hasText(value)) {
            return "/uploads";
        }
        String path = value.trim();
        if (!path.startsWith("/")) {
            path = "/" + path;
        }
        return path.endsWith("/") ? path.substring(0, path.length() - 1) : path;
    }
}
