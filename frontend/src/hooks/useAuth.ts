"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";

export function useAuth() {
  const router = useRouter();
  const store  = useAuthStore();

  useEffect(() => {
    if (!store.isAuthenticated) {
      router.push("/login");
      return;
    }
    const done = localStorage.getItem("cvforge-onboarding-done");
    if (!done) {
      router.push("/onboarding");
      return;
    }
    api.getMe().then(store.setUser).catch(() => {});
  }, [store.isAuthenticated]);

  return { user: store.user, isAuthenticated: store.isAuthenticated };
}
