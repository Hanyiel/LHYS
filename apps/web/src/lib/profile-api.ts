import { apiRequest } from "@/lib/api";
import { authHeaders } from "@/lib/admin-api";

export interface BasicProfile {
  id: number;
  adminUserId: number;
  realName: string;
  email: string | null;
  avatarUrl: string | null;
  headline: string | null;
  location: string | null;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectExperience {
  id: number;
  profileId: number;
  projectName: string;
  periodText: string | null;
  startDate: string | null;
  endDate: string | null;
  projectSummary: string | null;
  roleDescription: string | null;
  personalContribution: string | null;
  repositoryUrl: string | null;
  sortOrder: number;
  visible: boolean;
}

export interface HonorAward {
  id: number;
  profileId: number;
  awardName: string;
  awardedDate: string | null;
  awardLevel: string | null;
  certificatePdfUrl: string | null;
  sortOrder: number;
  visible: boolean;
}

export interface WorkExperience {
  id: number;
  profileId: number;
  organization: string;
  positionTitle: string | null;
  periodText: string | null;
  startDate: string | null;
  endDate: string | null;
  workContent: string | null;
  achievements: string | null;
  sortOrder: number;
  visible: boolean;
}

export interface PortfolioLink {
  id: number;
  profileId: number;
  linkName: string;
  linkUrl: string;
  sortOrder: number;
  visible: boolean;
}

export interface ProfileWorkspace {
  profile: BasicProfile | null;
  introduction: string;
  skillsText: string;
  projects: ProjectExperience[];
  honors: HonorAward[];
  workExperiences: WorkExperience[];
  links: PortfolioLink[];
}

export interface AvatarUploadResponse {
  avatarUrl: string;
}

export interface BasicProfileRequest {
  realName: string;
  email: string;
  avatarUrl?: string;
  headline?: string;
  location?: string;
  visible?: boolean;
}

export interface ProjectExperienceRequest {
  projectName: string;
  periodText?: string;
  startDate?: string;
  endDate?: string;
  projectSummary?: string;
  roleDescription?: string;
  personalContribution?: string;
  repositoryUrl?: string;
  sortOrder?: number;
  visible?: boolean;
}

export interface HonorAwardRequest {
  awardName: string;
  awardedDate?: string;
  awardLevel?: string;
  certificatePdfUrl?: string;
  sortOrder?: number;
  visible?: boolean;
}

export interface WorkExperienceRequest {
  organization: string;
  positionTitle?: string;
  periodText?: string;
  startDate?: string;
  endDate?: string;
  workContent?: string;
  achievements?: string;
  sortOrder?: number;
  visible?: boolean;
}

export interface PortfolioLinkRequest {
  linkName: string;
  linkUrl: string;
  sortOrder?: number;
  visible?: boolean;
}

const headers = () => authHeaders();

export function getProfileWorkspace() {
  return apiRequest<ProfileWorkspace>("/api/admin/profile", {
    headers: headers(),
  });
}

export function saveBasicProfile(request: BasicProfileRequest) {
  return apiRequest<BasicProfile>("/api/admin/profile/basic", {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(request),
  });
}

export function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<AvatarUploadResponse>("/api/admin/profile/avatar", {
    method: "POST",
    headers: headers(),
    body: formData,
  });
}

export function saveIntroduction(introduction: string) {
  return apiRequest<void>("/api/admin/profile/introduction", {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ introduction }),
  });
}

export function saveSkills(skillsText: string) {
  return apiRequest<void>("/api/admin/profile/skills", {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ skillsText }),
  });
}

export function createProject(request: ProjectExperienceRequest) {
  return apiRequest<ProjectExperience>("/api/admin/profile/projects", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(request),
  });
}

export function deleteProject(id: number) {
  return apiRequest<void>(`/api/admin/profile/projects/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
}

export function createHonor(request: HonorAwardRequest) {
  return apiRequest<HonorAward>("/api/admin/profile/honors", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(request),
  });
}

export function deleteHonor(id: number) {
  return apiRequest<void>(`/api/admin/profile/honors/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
}

export function createWorkExperience(request: WorkExperienceRequest) {
  return apiRequest<WorkExperience>("/api/admin/profile/work-experiences", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(request),
  });
}

export function deleteWorkExperience(id: number) {
  return apiRequest<void>(`/api/admin/profile/work-experiences/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
}

export function createPortfolioLink(request: PortfolioLinkRequest) {
  return apiRequest<PortfolioLink>("/api/admin/profile/links", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(request),
  });
}

export function deletePortfolioLink(id: number) {
  return apiRequest<void>(`/api/admin/profile/links/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
}
