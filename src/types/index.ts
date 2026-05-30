/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

// ── API response types ─────────────────────────────────────────────

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  is_new_user: boolean;
}

export interface RefreshResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserMe {
  user_id: string;
  username: string | null;
  is_guest: boolean;
  token_expires_at: string;
}

export interface UsernameCheckResponse {
  username: string;
  available: boolean;
  reason?: string;
}

export interface UsernameSetResponse {
  message: string;
  username: string;
  access_token: string;
}

export interface UserProfile {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  country: string | null;
  preferred_language: string;
  github_url: string | null;
  updated_at: string;
}

// ── NextAuth type extensions ────────────────────────────────────────

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    isNewUser?: boolean;
    userId?: string;
    username?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
    isGuest?: boolean;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    isNewUser?: boolean;
    userId?: string;
    username?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
    isGuest?: boolean;
  }
}
