/**
 * Frontend auth utilities: OTP flow, JWT decode, session management, React hooks.
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { api, clearTokens, getAccessToken, setTokens, ApiError, uploadIdentityDocument, uploadProfileAvatar } from "@/lib/api/client";

// ── Types (mirror backend schemas) ───────────────────────────────────────────

export type UserRole = "SUPER_ADMIN" | "SELLER" | "BROKER" | "BUYER" | "AGENT" | "ADMIN";

export interface CurrentUser {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  avatar_url: string | null;
  whatsapp_number: string | null;
  brokerage_name: string | null;
  broker_registration_number: string | null;
  years_experience: number | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  postal_code: string | null;
  identity_document_filename: string | null;
  identity_verification_status: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED";
  identity_verification_note: string | null;
  created_at: string;
}

type ApiProfile = {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  isVerified: boolean;
  whatsappNumber: string | null;
  avatarUrl: string | null;
  brokerageName: string | null;
  brokerRegistrationNumber: string | null;
  yearsExperience: number | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  postalCode: string | null;
  identityDocumentFilename: string | null;
  identityVerificationStatus: CurrentUser["identity_verification_status"];
  identityVerificationNote: string | null;
};

function toCurrentUser(user: ApiProfile): CurrentUser {
  return {
    id: user.id,
    phone: user.phone,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: true,
    is_verified: user.isVerified,
    avatar_url: user.avatarUrl ? (user.avatarUrl.startsWith("/") ? `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ?? "https://be-property.onrender.com"}${user.avatarUrl}` : user.avatarUrl) : null,
    whatsapp_number: user.whatsappNumber,
    brokerage_name: user.brokerageName,
    broker_registration_number: user.brokerRegistrationNumber,
    years_experience: user.yearsExperience,
    address_line1: user.addressLine1,
    address_line2: user.addressLine2,
    city: user.city,
    district: user.district,
    state: user.state,
    postal_code: user.postalCode,
    identity_document_filename: user.identityDocumentFilename,
    identity_verification_status: user.identityVerificationStatus,
    identity_verification_note: user.identityVerificationNote,
    created_at: new Date().toISOString(),
  };
}

interface JWTPayload {
  sub: string;
  phone: string;
  role: UserRole;
  exp: number;
  iat: number;
}

// ── JWT decode (no verification — just payload reading) ───────────────────────

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const [, payload] = token.split(".");
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded) as JWTPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload) return true;
  return Date.now() / 1000 >= payload.exp - 30; // 30s buffer
}

// ── Auth API calls ────────────────────────────────────────────────────────────

export async function requestOTP(phone: string): Promise<{
  sent: boolean;
  expiresIn: number;
  developmentCode?: string;
}> {
  return api.postPublic<{
    sent: boolean;
    expiresIn: number;
    developmentCode?: string;
  }>("/auth/send-otp", { phone });
}

export async function verifyOTP(phone: string, code: string, role: Extract<UserRole, "BUYER" | "SELLER" | "BROKER"> = "BUYER", name?: string): Promise<CurrentUser> {
  const tokens = await api.postPublic<{ accessToken: string; user: { id: string; phone: string; role: UserRole; name: string | null } }>("/auth/verify-otp", {
    phone,
    code,
    role,
    ...(name ? { name } : {}),
  });
  setTokens(tokens.accessToken);
  return {
    id: tokens.user.id,
    phone: tokens.user.phone,
    name: tokens.user.name,
    email: null,
    role: tokens.user.role,
    is_active: true,
    is_verified: false,
    avatar_url: null,
    whatsapp_number: tokens.user.phone,
    brokerage_name: null,
    broker_registration_number: null,
    years_experience: null,
    address_line1: null,
    address_line2: null,
    city: null,
    district: null,
    state: null,
    postal_code: null,
    identity_document_filename: null,
    identity_verification_status: "NOT_SUBMITTED",
    identity_verification_note: null,
    created_at: new Date().toISOString(),
  };
}

export async function logout(): Promise<void> {
  clearTokens();
}

export async function getMe(): Promise<CurrentUser> {
  return toCurrentUser(await api.get<ApiProfile>("/auth/me"));
}

export type ProfileUpdate = Partial<Pick<CurrentUser,
  "name" | "email" | "whatsapp_number" | "brokerage_name" | "broker_registration_number" | "years_experience" | "address_line1" | "address_line2" | "city" | "district" | "state" | "postal_code"
>>;

export async function updateProfile(data: ProfileUpdate): Promise<CurrentUser> {
  const user = await api.patch<ApiProfile>("/auth/me", {
    name: data.name,
    email: data.email,
    whatsappNumber: data.whatsapp_number,
    brokerageName: data.brokerage_name,
    brokerRegistrationNumber: data.broker_registration_number,
    yearsExperience: data.years_experience,
    addressLine1: data.address_line1,
    addressLine2: data.address_line2,
    city: data.city,
    district: data.district,
    state: data.state,
    postalCode: data.postal_code,
  });
  return toCurrentUser(user);
}

export { uploadIdentityDocument, uploadProfileAvatar };

// ── useAuth hook ──────────────────────────────────────────────────────────────

interface AuthState {
  user: CurrentUser | null;
  loading: boolean;
  error: string | null;
}

export function useAuth(): AuthState & {
  requestOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
  isRole: (...roles: UserRole[]) => boolean;
} {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null });

  const fetchUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token || isTokenExpired(token)) {
      setState({ user: null, loading: false, error: null });
      return;
    }
    try {
      const user = await getMe();
      setState({ user, loading: false, error: null });
    } catch (err) {
      clearTokens();
      setState({ user: null, loading: false, error: err instanceof ApiError ? err.detail : "Auth error" });
    }
  }, []);

  useEffect(() => { void fetchUser(); }, [fetchUser]);

  return {
    ...state,
    refetch: fetchUser,
    requestOTP: async (phone: string) => {
      setState(s => ({ ...s, error: null }));
      try { await requestOTP(phone); }
      catch (err) { setState(s => ({ ...s, error: err instanceof ApiError ? err.detail : "Failed to send OTP" })); throw err; }
    },
    verifyOTP: async (phone: string, code: string) => {
      setState(s => ({ ...s, loading: true, error: null }));
      try {
        const user = await verifyOTP(phone, code);
        setState({ user, loading: false, error: null });
      } catch (err) {
        setState(s => ({ ...s, loading: false, error: err instanceof ApiError ? err.detail : "Invalid OTP" }));
        throw err;
      }
    },
    logout: async () => {
      await logout();
      setState({ user: null, loading: false, error: null });
    },
    isRole: (...roles: UserRole[]) => roles.includes(state.user?.role ?? ("" as UserRole)),
  };
}

// ── Role guards ───────────────────────────────────────────────────────────────

export function canPost(role: UserRole): boolean {
  return ["SELLER", "BROKER", "SUPER_ADMIN"].includes(role);
}

export function isAdmin(role: UserRole): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}
