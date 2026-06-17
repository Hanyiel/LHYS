import { apiRequest } from "@/lib/api";
import { getStoredAuthToken } from "@/lib/auth-storage";

export interface AdminUser {
  id: number;
  username: string;
  displayName: string;
  email: string | null;
  role: string;
  enabled: boolean;
  lastLoginAt: string | null;
  createdAt: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface CreateAdminUserRequest {
  username: string;
  password: string;
  displayName: string;
  email?: string;
  enabled?: boolean;
}

export interface LoginResponse {
  token: string;
  user: AdminUser;
}

export function authHeaders(): Record<string, string> {
  const token = getStoredAuthToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

export function loginAdmin(request: LoginRequest) {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function getCurrentAdmin() {
  return apiRequest<AdminUser>("/api/auth/me", {
    headers: authHeaders(),
  });
}

export function listAdminUsers() {
  return apiRequest<AdminUser[]>("/api/admin/users", {
    headers: authHeaders(),
  });
}

export function createAdminUser(request: CreateAdminUserRequest) {
  return apiRequest<AdminUser>("/api/admin/users", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(request),
  });
}
