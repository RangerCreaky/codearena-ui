import { create } from "zustand";

interface AuthUser {
  user_id: string;
  username: string | null;
  is_guest: boolean;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isNewUser: boolean;
  setAuth: (accessToken: string, user: AuthUser, isNewUser: boolean) => void;
  setAccessToken: (token: string) => void;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isNewUser: false,
  setAuth: (accessToken, user, isNewUser) =>
    set({ accessToken, user, isNewUser }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setUser: (user) => set({ user }),
  clearAuth: () => set({ accessToken: null, user: null, isNewUser: false }),
}));
