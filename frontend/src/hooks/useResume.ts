"use client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useResumeStore } from "@/stores/resumeStore";
import { useAuthStore } from "@/stores/authStore";

/**
 * Manages server-side resume sync.
 * - On mount: loads existing resume from server or creates one.
 * - save(): syncs local state to server.
 */
export function useResume() {
  const store = useResumeStore();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load resume from server on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    loadResume();
  }, [isAuthenticated]);

  const loadResume = async () => {
    setLoading(true);
    try {
      const resumes = await api.getResumes();
      if (resumes.length > 0) {
        const r = resumes[0];
        store.setResume({
          id: r.id,
          title: r.title,
          template: r.template,
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
        // Create a default resume on first login
        const created = await api.createResume({
          title: "My Resume",
          template: "atlas",
          personal: {},
          summary: "",
        });
        store.setServerResumeId(created.id);
      }
    } catch (err) {
      console.error("Failed to load resume:", err);
    } finally {
      setLoading(false);
    }
  };

  const save = useCallback(async () => {
    if (!store.serverResumeId) return;
    setSaving(true);
    try {
      await api.updateResume(store.serverResumeId, {
        title: store.resume.title,
        template: store.resume.template,
        personal: store.resume.personal,
        summary: store.resume.summary,
      });
      store.markClean();
      toast.success("Changes saved!");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [store]);

  return { ...store, loading, saving, save, reload: loadResume };
}
