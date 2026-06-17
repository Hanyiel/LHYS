package com.lhys.api.profile;

import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/profile")
public class ProfileController {
    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ProfileWorkspaceResponse getProfile(Principal principal) {
        return profileService.getWorkspace(principal);
    }

    @PutMapping("/basic")
    public BasicProfileResponse saveBasicProfile(
            Principal principal,
            @Valid @RequestBody BasicProfileRequest request) {
        return profileService.saveBasicProfile(principal, request);
    }

    @PostMapping("/avatar")
    public AvatarUploadResponse uploadAvatar(
            Principal principal,
            @RequestParam("file") MultipartFile file) {
        return profileService.uploadAvatar(principal, file);
    }

    @PutMapping("/introduction")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void saveIntroduction(
            Principal principal,
            @Valid @RequestBody IntroductionRequest request) {
        profileService.saveIntroduction(principal, request);
    }

    @PutMapping("/skills")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void saveSkills(
            Principal principal,
            @Valid @RequestBody SkillsRequest request) {
        profileService.saveSkills(principal, request);
    }

    @PostMapping("/projects")
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectExperienceResponse createProject(
            Principal principal,
            @Valid @RequestBody ProjectExperienceRequest request) {
        return profileService.createProject(principal, request);
    }

    @DeleteMapping("/projects/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProject(Principal principal, @PathVariable Long id) {
        profileService.deleteProject(principal, id);
    }

    @PostMapping("/honors")
    @ResponseStatus(HttpStatus.CREATED)
    public HonorAwardResponse createHonor(
            Principal principal,
            @Valid @RequestBody HonorAwardRequest request) {
        return profileService.createHonor(principal, request);
    }

    @DeleteMapping("/honors/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteHonor(Principal principal, @PathVariable Long id) {
        profileService.deleteHonor(principal, id);
    }

    @PostMapping("/work-experiences")
    @ResponseStatus(HttpStatus.CREATED)
    public WorkExperienceResponse createWorkExperience(
            Principal principal,
            @Valid @RequestBody WorkExperienceRequest request) {
        return profileService.createWorkExperience(principal, request);
    }

    @DeleteMapping("/work-experiences/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteWorkExperience(Principal principal, @PathVariable Long id) {
        profileService.deleteWorkExperience(principal, id);
    }

    @PostMapping("/links")
    @ResponseStatus(HttpStatus.CREATED)
    public PortfolioLinkResponse createLink(
            Principal principal,
            @Valid @RequestBody PortfolioLinkRequest request) {
        return profileService.createLink(principal, request);
    }

    @DeleteMapping("/links/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLink(Principal principal, @PathVariable Long id) {
        profileService.deleteLink(principal, id);
    }
}
