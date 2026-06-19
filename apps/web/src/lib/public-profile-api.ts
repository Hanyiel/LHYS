import { apiRequest } from "@/lib/api";
import type {
  BasicProfile,
  HonorAward,
  PortfolioLink,
  ProjectExperience,
  SkillItem,
  WorkExperience,
} from "@/lib/profile-api";

export interface PublicProfile {
  profile: BasicProfile;
  introduction: string;
  skillsText: string;
  skillItems: SkillItem[];
  projects: ProjectExperience[];
  honors: HonorAward[];
  workExperiences: WorkExperience[];
  links: PortfolioLink[];
}

export function getPublicProfile(username: string) {
  return apiRequest<PublicProfile>(`/api/public/profiles/${encodeURIComponent(username)}`);
}

export function getPublicProfileByAdminUserId(adminUserId: number) {
  return apiRequest<PublicProfile>(`/api/public/profiles/admin-users/${adminUserId}`);
}
