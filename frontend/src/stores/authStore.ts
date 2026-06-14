import { create } from "zustand";
import { persist } from "zustand/middleware";
interface User { id: number; email: string; full_name: string; plan: string; }
interface AuthStore {
  user: User | null; accessToken: string | null; refreshToken: string | null; isAuthenticated: boolean;
  setTokens: (a: string, r: string) => void; setUser: (u: User) => void; logout: () => void;
}
export const useAuthStore = create<AuthStore>()(persist(
  (set) => ({
    user: null, accessToken: null, refreshToken: null, isAuthenticated: false,
    setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh, isAuthenticated: true }),
    setUser: (user) => set({ user }),
    logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
  }),
  { name: "cvforge-auth" }
));
