import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  plan: string;
}

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

// Only a non-sensitive UI hint is persisted. Tokens are HTTP-only cookies.
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "epersona-session",
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
    }
  )
);
