import { apiRequest } from "@/lib/api";
import { authHeaders } from "@/lib/admin-api";

export interface ServerProduct {
  id: number;
  adminUserId: number;
  serverName: string;
  ipAddress: string;
  provider: string | null;
  purchaseDate: string | null;
  expiryDate: string | null;
  price: number | null;
  ownershipStartDate: string | null;
  lastRenewedAt: string | null;
  status: string;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ServerProductRequest {
  serverName: string;
  ipAddress: string;
  provider?: string;
  purchaseDate?: string;
  expiryDate?: string;
  price?: number;
  ownershipStartDate?: string;
  lastRenewedAt?: string;
  status?: string;
  notes?: string;
}

export interface DomainProduct {
  id: number;
  adminUserId: number;
  domainName: string;
  nameserver: string | null;
  registrar: string | null;
  purchaseDate: string | null;
  expiryDate: string | null;
  price: number | null;
  lastRenewedAt: string | null;
  status: string;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface DomainProductRequest {
  domainName: string;
  nameserver?: string;
  registrar?: string;
  purchaseDate?: string;
  expiryDate?: string;
  price?: number;
  lastRenewedAt?: string;
  status?: string;
  notes?: string;
}

const headers = () => authHeaders();

export function listServers() {
  return apiRequest<ServerProduct[]>("/api/admin/products/servers", {
    headers: headers(),
  });
}

export function createServer(request: ServerProductRequest) {
  return apiRequest<ServerProduct>("/api/admin/products/servers", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(request),
  });
}

export function updateServer(id: number, request: ServerProductRequest) {
  return apiRequest<ServerProduct>(`/api/admin/products/servers/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(request),
  });
}

export function deleteServer(id: number) {
  return apiRequest<void>(`/api/admin/products/servers/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
}

export function listDomains() {
  return apiRequest<DomainProduct[]>("/api/admin/products/domains", {
    headers: headers(),
  });
}

export function createDomain(request: DomainProductRequest) {
  return apiRequest<DomainProduct>("/api/admin/products/domains", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(request),
  });
}

export function updateDomain(id: number, request: DomainProductRequest) {
  return apiRequest<DomainProduct>(`/api/admin/products/domains/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(request),
  });
}

export function deleteDomain(id: number) {
  return apiRequest<void>(`/api/admin/products/domains/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
}
