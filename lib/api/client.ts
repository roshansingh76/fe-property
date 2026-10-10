/**
 * Typed API client for the standalone Node API.
 */

import type { AgriProperty, PropertyCategory } from "@/lib/data/properties";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://be-property.onrender.com/api/v1";
const API_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, "");

type ApiProperty = {
  id: string;
  title: string;
  slug: string;
  category: string;
  village: string;
  tehsil: string;
  district: string;
  latitude: number | null;
  longitude: number | null;
  price: number;
  pricePerBigha: number | null;
  pricePerAcre: number | null;
  area: number;
  areaUnit: string;
  irrigation: string[];
  roadFrontage: number | null;
  electricity: boolean;
  highwayTouch: boolean;
  canalTouch: boolean;
  distanceFromPalia: number | null;
  khasraNumber: string | null;
  khatauniVerified: boolean;
  registryReady: boolean;
  images: string[];
  description: string | null;
  featured: boolean;
  viewCount: number;
  createdAt: string;
  owner?: { name: string | null; phone?: string; role: string; isVerified: boolean };
};

const CATEGORY_MAP: Record<string, PropertyCategory> = {
  AGRICULTURAL_LAND: "sugarcane_farm",
  PADDY_WHEAT: "paddy_wheat",
  SUGARCANE_FARM: "sugarcane_farm",
  MANGO_ORCHARD: "mango_orchard",
  POPLAR_PLANTATION: "poplar_plantation",
  FARMHOUSE: "farmhouse_resort",
  DAIRY_POULTRY: "dairy_poultry",
  RESIDENTIAL_PLOT: "residential_plot",
  COMMERCIAL_PROPERTY: "commercial_land",
  HIGHWAY_INVESTMENT: "highway_investment",
};

export function toFrontendProperty(item: ApiProperty): AgriProperty {
  const areaUnit = item.areaUnit.toLowerCase() as AgriProperty["areaUnit"];
  const category = CATEGORY_MAP[item.category] ?? "commercial_land";
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    category,
    village: item.village,
    tehsil: item.tehsil,
    district: item.district,
    location: `${item.village}, ${item.district}`,
    coordinates: { lat: item.latitude ?? 28.4328, lng: item.longitude ?? 80.5889 },
    price: item.price,
    priceUnit: "total",
    area: item.area,
    areaUnit,
    pricePerBigha: item.pricePerBigha ?? 0,
    pricePerAcre: item.pricePerAcre ?? 0,
    irrigation: item.irrigation as AgriProperty["irrigation"],
    soilType: "alluvial_loam",
    roadFrontage: item.roadFrontage ?? 0,
    electricityConnection: item.electricity,
    distanceFromPalia: item.distanceFromPalia ?? 0,
    highwayTouch: item.highwayTouch,
    canalTouch: item.canalTouch,
    cropHistory: [],
    khasraNumber: item.khasraNumber ?? "Not disclosed",
    sellerType: item.owner?.role === "BROKER" ? "verified_broker" : "owner",
    sellerName: item.owner?.name ?? "Local property seller",
    sellerPhone: item.owner?.phone ?? "",
    badges: [
      ...(item.owner?.isVerified ? [{ label: "Verified Seller", variant: "verified" as const }] : []),
      ...(item.khatauniVerified ? [{ label: "Khatauni Verified", variant: "khatauni" as const }] : []),
      ...(item.registryReady ? [{ label: "Registry Ready", variant: "registry" as const }] : []),
      ...(item.featured ? [{ label: "Featured", variant: "featured" as const }] : []),
    ],
    images: item.images.map(image => image.startsWith("/") ? image : image),
    description: item.description ?? "Property details are being reviewed by the Palia Property Hub team.",
    legalStatus: "freehold",
    immediateRegistry: item.registryReady,
    singleOwner: true,
    featured: item.featured,
    postedAt: item.createdAt,
    views: item.viewCount,
  };
}

export type PropertyListParams = {
  q?: string;
  village?: string;
  category?: PropertyCategory;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "area_desc";
  page?: number;
  pageSize?: number;
};

export type PropertyListResult = {
  items: AgriProperty[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function toApiCategory(category?: PropertyCategory) {
  if (!category) return undefined;
  return Object.entries(CATEGORY_MAP).find(([, value]) => value === category)?.[0] ?? category.toUpperCase();
}

export async function fetchPropertyList(params: PropertyListParams = {}): Promise<PropertyListResult> {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.village) query.set("village", params.village);
  const category = toApiCategory(params.category);
  if (category) query.set("category", category);
  if (params.minPrice != null) query.set("minPrice", String(params.minPrice));
  if (params.maxPrice != null) query.set("maxPrice", String(params.maxPrice));
  if (params.featured) query.set("featured", "true");
  if (params.sort) query.set("sort", params.sort);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  const response = await fetch(`${API_BASE}/properties?${query.toString()}`, { cache: "no-store" });
  if (!response.ok) throw new ApiError(response.status, "Unable to load properties from the API");
  const data = await response.json() as { items: ApiProperty[]; total: number; page: number; pageSize: number; totalPages: number };
  return {
    items: data.items.map(toFrontendProperty),
    total: data.total,
    page: data.page,
    pageSize: data.pageSize,
    totalPages: data.totalPages,
  };
}

export async function fetchProperties(params: PropertyListParams = {}): Promise<AgriProperty[]> {
  return (await fetchPropertyList({ ...params, pageSize: params.pageSize ?? 24 })).items;
}

export async function createBuyerInquiry(payload: {
  buyerName: string;
  buyerPhone: string;
  purpose: string;
  preferredVillages: string[];
  minArea?: number;
  maxArea?: number;
  areaUnit?: string;
  minBudget?: number;
  maxBudget?: number;
  waterSourceRequired?: string;
  highwayTouchRequired?: boolean;
  immediateRegistryRequired?: boolean;
  notes?: string;
}): Promise<void> {
  await api.postPublic("/inquiries", payload);
}

export async function fetchPropertyBySlug(slug: string): Promise<AgriProperty | null> {
  const response = await fetch(`${API_BASE}/properties/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new ApiError(response.status, "Unable to load this property from the API");
  return toFrontendProperty(await response.json() as ApiProperty);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
    public raw?: unknown,
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

// ── Token storage (localStorage; swap to httpOnly cookie via middleware if preferred) ──

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pph_access_token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pph_refresh_token");
}

export function setTokens(access: string, refresh = ""): void {
  localStorage.setItem("pph_access_token", access);
  if (refresh) localStorage.setItem("pph_refresh_token", refresh);
  else localStorage.removeItem("pph_refresh_token");
}

export function clearTokens(): void {
  localStorage.removeItem("pph_access_token");
  localStorage.removeItem("pph_refresh_token");
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean; retried?: boolean } = {},
): Promise<T> {
  const { skipAuth, ...fetchOpts } = options;

  const headers = new Headers(fetchOpts.headers);
  headers.set("Content-Type", "application/json");

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...fetchOpts, headers });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ApiError(
        0,
        `Cannot reach the API at ${API_BASE}. Check that the backend is running and allows this frontend origin.`,
        error,
      );
    }
    throw error;
  }

  if (res.status === 401 && !skipAuth) {
    clearTokens();
    if (typeof window !== "undefined" && window.location.pathname !== "/login") window.location.assign("/login");
    throw new ApiError(401, "Please sign in again");
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = (await res.json()) as { detail?: string; error?: string };
      detail = err.detail ?? err.error ?? detail;
    } catch { /* ignore */ }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Typed API methods ─────────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, opts?: RequestInit) =>
    apiFetch<T>(path, { ...opts, method: "GET" }),

  post: <T>(path: string, body?: unknown, opts?: RequestInit) =>
    apiFetch<T>(path, { ...opts, method: "POST", body: body ? JSON.stringify(body) : undefined }),

  patch: <T>(path: string, body?: unknown, opts?: RequestInit) =>
    apiFetch<T>(path, { ...opts, method: "PATCH", body: body ? JSON.stringify(body) : undefined }),

  delete: <T = void>(path: string, opts?: RequestInit) =>
    apiFetch<T>(path, { ...opts, method: "DELETE" }),

  postPublic: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined, skipAuth: true }),
};

export async function createProperty(payload: Record<string, unknown>): Promise<AgriProperty> {
  const response = await api.post<ApiProperty>("/properties", payload);
  return toFrontendProperty(response);
}

export async function createPropertiesBulk(payloads: Record<string, unknown>[]): Promise<{ created: number; propertyIds: string[]; status: string }> {
  return api.post<{ created: number; propertyIds: string[]; status: string }>("/properties/bulk", payloads);
}

export async function fetchMyProperties(): Promise<AgriProperty[]> {
  const response = await api.get<ApiProperty[]>("/properties/mine");
  return response.map(toFrontendProperty);
}

export async function uploadPropertyImages(propertyId: string, files: FileList | File[]): Promise<string[]> {
  const form = new FormData();
  Array.from(files).forEach(file => form.append("images", file));
  const token = getAccessToken();
  const response = await fetch(`${API_BASE}/properties/${propertyId}/images`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  if (!response.ok) throw new ApiError(response.status, "Unable to upload property photos");
  return (await response.json() as { images: string[] }).images.map(image => image.startsWith("/") ? `${API_ORIGIN}${image}` : image);
}

export async function deletePropertyImage(propertyId: string, imageUrl: string): Promise<string[]> {
  // Strip the origin prefix so we send the relative /uploads/... path the server stored
  const relative = imageUrl.startsWith(API_ORIGIN) ? imageUrl.slice(API_ORIGIN.length) : imageUrl;
  const response = await apiFetch<{ images: string[] }>(`/properties/${propertyId}/images`, {
    method: "DELETE",
    body: JSON.stringify({ imageUrl: relative }),
  });
  return response.images.map(img => img.startsWith("/") ? `${API_ORIGIN}${img}` : img);
}

export async function uploadPropertyDocument(propertyId: string, file: File, documentType: "KHATAUNI" | "KHASRA" | "IDENTITY" | "REGISTRY" | "OTHER"): Promise<void> {
  const form = new FormData();
  form.append("documentType", documentType);
  form.append("document", file);
  const token = getAccessToken();
  const response = await fetch(`${API_BASE}/properties/${propertyId}/documents`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : undefined, body: form });
  if (!response.ok) throw new ApiError(response.status, "Unable to upload property document");
}

export async function uploadProfileAvatar(file: File): Promise<void> {
  const form = new FormData();
  form.append("avatar", file);
  const token = getAccessToken();
  const response = await fetch(`${API_BASE}/auth/me/avatar`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  if (!response.ok) throw new ApiError(response.status, "Unable to upload profile photo");
}

export async function uploadIdentityDocument(file: File): Promise<void> {
  const form = new FormData();
  form.append("consent", "true");
  form.append("document", file);
  const token = getAccessToken();
  const response = await fetch(`${API_BASE}/auth/me/identity-document`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  if (!response.ok) {
    let detail = "Unable to upload identity document";
    try {
      const error = await response.json() as { error?: string; detail?: string };
      detail = error.detail ?? error.error ?? detail;
    } catch { /* use the fallback message */ }
    throw new ApiError(response.status, detail);
  }
}

export async function toggleSavedProperty(propertyId: string): Promise<boolean> {
  const response = await api.post<{ saved: boolean }>(`/properties/${propertyId}/save`);
  return response.saved;
}

export async function createLead(payload: { propertyId: string; buyerName: string; buyerPhone: string; buyerWhatsapp?: string; message?: string }): Promise<void> {
  await api.postPublic("/leads", payload);
}

export async function requestSiteVisit(payload: { propertyId: string; scheduledFor: string; note?: string }): Promise<void> {
  await api.post("/site-visits", payload);
}

export interface PendingPropertyReview {
  id: string;
  title: string;
  village: string;
  price: number;
  images: string[];
  owner: { name: string | null; phone: string; role: string };
  documents: { id: string; type: string; filename: string; url: string; status: string }[];
  verifications: { level: number; name: string; status: string }[];
}

export async function fetchPendingProperties(): Promise<PendingPropertyReview[]> {
  return api.get<PendingPropertyReview[]>("/admin/properties/pending");
}

export async function reviewProperty(propertyId: string, status: "ACTIVE" | "REJECTED", levels: { level: number; name: string; status: "VERIFIED" | "REJECTED" }[]): Promise<void> {
  await api.patch(`/admin/properties/${propertyId}/review`, { status, levels });
}

export interface AdminUser { id: string; phone: string; name: string | null; role: string; isVerified: boolean; isBlocked: boolean; createdAt: string; }

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  return api.get<AdminUser[]>("/admin/users");
}

export async function updateAdminUser(userId: string, data: { name?: string | null; role?: AdminUser["role"]; isVerified?: boolean; isBlocked?: boolean }): Promise<AdminUser> {
  return api.patch<AdminUser>(`/admin/users/${userId}`, data);
}

export interface AdminProperty {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  village: string;
  price: number;
  area: number;
  areaUnit: string;
  featured: boolean;
  images: string[];
  description: string | null;
  khasraNumber: string | null;
  owner: { id: string; name: string | null; phone: string; role: string; isVerified: boolean };
}

export async function fetchAdminProperties(): Promise<AdminProperty[]> {
  return api.get<AdminProperty[]>("/admin/properties");
}

export async function createAdminProperty(payload: Record<string, unknown>): Promise<AdminProperty> {
  return api.post<AdminProperty>("/admin/properties", payload);
}

export async function updateAdminProperty(propertyId: string, payload: Record<string, unknown>): Promise<AdminProperty> {
  return api.patch<AdminProperty>(`/admin/properties/${propertyId}`, payload);
}

export async function deleteAdminProperty(propertyId: string): Promise<void> {
  await api.delete(`/admin/properties/${propertyId}`);
}

export async function setUserBlocked(userId: string, blocked: boolean): Promise<void> {
  await api.patch(`/admin/users/${userId}/block`, { blocked });
}

export async function verifyUser(userId: string, verified: boolean): Promise<void> {
  await api.patch(`/admin/users/${userId}/verify`, { verified });
}

export interface AdminLocation {
  id: string;
  name: string;
  slug: string;
  type: string;
  district: string;
  state: string;
  isActive: boolean;
}

export async function fetchLocations(): Promise<AdminLocation[]> {
  return api.get<AdminLocation[]>("/locations", { cache: "no-store" });
}

export async function fetchAdminLocations(): Promise<AdminLocation[]> {
  return api.get<AdminLocation[]>("/admin/locations");
}

export async function createLocation(payload: { name: string; type: "CITY" | "VILLAGE" | "BLOCK" | "DISTRICT"; district?: string; state?: string }): Promise<AdminLocation> {
  return api.post<AdminLocation>("/admin/locations", payload);
}

export async function updateLocation(locationId: string, data: { name?: string; isActive?: boolean }): Promise<AdminLocation> {
  return api.patch<AdminLocation>(`/admin/locations/${locationId}`, data);
}

// ── Admin: Leads ──────────────────────────────────────────────────────────────

export interface AdminLead {
  id: string;
  buyerName: string;
  buyerPhone: string;
  buyerWhatsapp: string | null;
  message: string | null;
  status: string;
  source: string;
  createdAt: string;
  property: {
    id: string;
    title: string;
    slug: string;
    village: string;
    owner: { id: string; name: string | null; phone: string };
  };
}

export async function fetchAdminLeads(): Promise<AdminLead[]> {
  return api.get<AdminLead[]>("/admin/leads");
}

export async function updateAdminLeadStatus(leadId: string, status: string): Promise<AdminLead> {
  return api.patch<AdminLead>(`/admin/leads/${leadId}/status`, { status });
}

// ── Admin: Site Visits ────────────────────────────────────────────────────────

export interface AdminSiteVisit {
  id: string;
  scheduledFor: string;
  note: string | null;
  status: string;
  createdAt: string;
  property: { id: string; title: string; slug: string; village: string };
  buyer: { id: string; name: string | null; phone: string };
}

export async function fetchAdminSiteVisits(): Promise<AdminSiteVisit[]> {
  return api.get<AdminSiteVisit[]>("/admin/site-visits");
}

export async function updateAdminSiteVisitStatus(visitId: string, status: string): Promise<AdminSiteVisit> {
  return api.patch<AdminSiteVisit>(`/admin/site-visits/${visitId}/status`, { status });
}

// ── Property Types ────────────────────────────────────────────────────────────

export interface AdminPropertyType {
  id: string;
  key: string;
  label: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type PublicPropertyType = Pick<AdminPropertyType, "id" | "key" | "label" | "description" | "icon" | "sortOrder">;

export async function fetchPropertyTypes(): Promise<PublicPropertyType[]> {
  return api.get<PublicPropertyType[]>("/property-types", { cache: "no-store" } as RequestInit);
}

export async function fetchAdminPropertyTypes(): Promise<AdminPropertyType[]> {
  return api.get<AdminPropertyType[]>("/admin/property-types");
}

export async function createPropertyType(
  payload: { key: string; label: string; description?: string | null; icon?: string | null; isActive?: boolean; sortOrder?: number },
): Promise<AdminPropertyType> {
  return api.post<AdminPropertyType>("/admin/property-types", payload);
}

export async function updatePropertyType(
  id: string,
  data: { label?: string; description?: string | null; icon?: string | null; isActive?: boolean; sortOrder?: number },
): Promise<AdminPropertyType> {
  return api.patch<AdminPropertyType>(`/admin/property-types/${id}`, data);
}

export async function deletePropertyType(id: string): Promise<void> {
  await api.delete(`/admin/property-types/${id}`);
}

// ── Seller / Broker ───────────────────────────────────────────────────────────

export interface SellerLead {
  id: string;
  buyerName: string;
  buyerPhone: string;
  buyerWhatsapp: string | null;
  message: string | null;
  status: string;
  source: string;
  createdAt: string;
  property: { id: string; title: string; slug: string; village: string };
}

export async function fetchSellerLeads(): Promise<SellerLead[]> {
  return api.get<SellerLead[]>("/seller/leads");
}

export async function updateSellerLeadStatus(leadId: string, status: string): Promise<{ id: string; status: string }> {
  return api.patch<{ id: string; status: string }>(`/leads/${leadId}/status`, { status });
}

export async function updateSellerProperty(propertyId: string, payload: Record<string, unknown>): Promise<AgriProperty> {
  const raw = await api.patch<ApiProperty>(`/properties/${propertyId}`, payload);
  return toFrontendProperty(raw);
}

export async function deleteSellerProperty(propertyId: string): Promise<void> {
  await api.delete(`/properties/${propertyId}`);
}

export interface BuyerDashboardStats {
  activeProperties: number;
  savedProperties: number;
  alerts: number;
  latestProperties: { id: string; title: string; slug: string; price: number; village: string; images: string[]; area: number; areaUnit: string }[];
}

export async function fetchBuyerDashboard(): Promise<BuyerDashboardStats> {
  return api.get<BuyerDashboardStats>("/buyer/dashboard");
}

export async function fetchSavedProperties(): Promise<{ id: string; propertyId: string; property: ApiProperty }[]> {
  return api.get("/saved-properties");
}

// ── Admin: Buyer detail ───────────────────────────────────────────────────────

export interface AdminBuyerDetail extends AdminUser {
  savedProperties: {
    id: string;
    createdAt: string;
    property: { id: string; title: string; slug: string; village: string; price: number; status: string };
  }[];
  leads: {
    id: string;
    buyerName: string;
    buyerPhone: string;
    message: string | null;
    status: string;
    createdAt: string;
    property: { id: string; title: string; slug: string; village: string };
  }[];
  siteVisits: {
    id: string;
    scheduledFor: string;
    note: string | null;
    status: string;
    createdAt: string;
    property: { id: string; title: string; slug: string; village: string };
  }[];
}

export async function fetchAdminBuyerDetail(userId: string): Promise<AdminBuyerDetail> {
  return api.get<AdminBuyerDetail>(`/admin/buyers/${userId}`);
}

// ── Admin: Seller / Broker detail ────────────────────────────────────────────

export interface AdminSellerProperty {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  village: string;
  price: number;
  area: number;
  areaUnit: string;
  featured: boolean;
  viewCount: number;
  createdAt: string;
  leadCount: number;
}

export interface AdminSellerDetail extends AdminUser {
  properties: AdminSellerProperty[];
}

export async function fetchAdminSellerDetail(userId: string): Promise<AdminSellerDetail> {
  return api.get<AdminSellerDetail>(`/admin/sellers/${userId}`);
}
