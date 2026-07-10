"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";

/**
 * Protects a page — redirects to /login if not authenticated.
 * Also fetches fresh user data from /auth/me on mount.
 */
export function useAuth() {
  const router = useRouter();
  const { isAuthenticated, setUser, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    // Refresh user profile
    api.getMe()
      .then((user) => setUser(user))
      .catch(() => {
        logout();
        router.push("/login");
      });
  }, [isAuthenticated]);

  return useAuthStore();
}
