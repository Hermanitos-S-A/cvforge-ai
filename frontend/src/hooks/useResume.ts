"use client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useResumeStore } from "@/stores/resumeStore";
import { useAuthStore } from "@/stores/authStore";

export function useResume() {
  const store = useResumeStore();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadResume();
  }, [isAuthenticated]);

  const loadResume = async () => {
    setLoading(true);
    try {
      const resumes = await api.getResumes();
      if (resumes && resumes.length > 0) {
        const r = resumes[0];
        store.setResume({
          id: r.id,
          title: r.title || "My Resume",
          template: r.template || "atlas",
          personal: r.personal || {},
          summary: r.summary || "",
          experiences: r.experiences || [],
          educations: r.educations || [],
          skills: r.skills || [],
          projects: r.projects || [],
          ats_score: r.ats_score || 0,
        });
        store.setServerResumeId(r.id);
      } else {
        // Create default resume
        const created = await api.createResume({
          title: "My Resume",
          template: "atlas",
          personal: {},
          summary: "",
        });
        store.setServerResumeId(created.id);
        store.setResume({
          id: created.id,
          title: "My Resume",
          template: "atlas",
          personal: { name: "", title: "", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: "" },
          summary: "",
          experiences: [],
          educations: [],
          skills: [],
          projects: [],
          ats_score: 0,
        });
      }
    } catch (err: any) {
      console.error("Failed to load resume:", err);
      // Don't show error toast on load — just use local state
    } finally {
      setLoading(false);
    }
  };

  const save = useCallback(async () => {
    if (!store.serverResumeId) {
      toast.error("No se encontró el CV — recarga la página");
      return;
    }
    setSaving(true);
    try {
      await api.updateResume(store.serverResumeId, {
        title: store.resume.title,
        template: store.resume.template,
        personal: store.resume.personal,
        summary: store.resume.summary,
      });
      store.markClean();
      toast.success("✅ Cambios guardados correctamente");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Error al guardar";
      toast.error(typeof msg === "string" ? msg : "Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }, [store]);

  return { ...store, loading, saving, save, reload: loadResume };
}
