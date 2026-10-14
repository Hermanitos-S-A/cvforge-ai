"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";

export function useAuth() {
  const router = useRouter();
  const store = useAuthStore();

  useEffect(() => {
    // Migrate away from the legacy localStorage token cache. Never read tokens.
    localStorage.removeItem("cvforge-auth");
    api.getMe().then((user) => {
      useAuthStore.getState().setUser(user);
      if (!(localStorage.getItem("epersona-onboarding-done") || localStorage.getItem("cvforge-onboarding-done"))) router.replace("/onboarding");
    }).catch(() => {
      useAuthStore.getState().logout();
      router.replace("/login");
    });
  }, [router]);

  return { user: store.user, isAuthenticated: store.isAuthenticated };
}
