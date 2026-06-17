package com.lhys.api.profile;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/profiles")
public class PublicProfileController {
    private final ProfileService profileService;

    public PublicProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/{username}")
    public PublicProfileResponse getPublicProfile(@PathVariable String username) {
        return profileService.getPublicProfile(username);
    }

    @GetMapping("/admin-users/{adminUserId}")
    public PublicProfileResponse getPublicProfileByAdminUserId(@PathVariable Long adminUserId) {
        return profileService.getPublicProfileByAdminUserId(adminUserId);
    }
}
