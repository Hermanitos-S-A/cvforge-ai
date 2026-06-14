import axios, { AxiosInstance, AxiosError } from "axios";
import { useAuthStore } from "@/stores/authStore";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
class ApiClient {
  private client: AxiosInstance;
  constructor() {
    this.client = axios.create({ baseURL: `${API_BASE}/api/v1`, headers: { "Content-Type": "application/json" } });
    this.client.interceptors.request.use((config) => {
      const token = useAuthStore.getState().accessToken;
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    this.client.interceptors.response.use((res) => res, (error: AxiosError) => {
      if (error.response?.status === 401) { useAuthStore.getState().logout(); if (typeof window !== "undefined") window.location.href = "/login"; }
      return Promise.reject(error);
    });
  }
  async register(email: string, password: string, full_name: string) { const { data } = await this.client.post("/auth/register", { email, password, full_name }); return data; }
  async login(email: string, password: string) { const { data } = await this.client.post("/auth/login", { email, password }); return data; }
  async getMe() { const { data } = await this.client.get("/auth/me"); return data; }
  async getResumes() { const { data } = await this.client.get("/resumes"); return data; }
  async createResume(payload: object) { const { data } = await this.client.post("/resumes", payload); return data; }
  async updateResume(id: number, payload: object) { const { data } = await this.client.patch(`/resumes/${id}`, payload); return data; }
  async addExperience(resumeId: number, payload: object) { const { data } = await this.client.post(`/resumes/${resumeId}/experiences`, payload); return data; }
  async addSkill(resumeId: number, payload: object) { const { data } = await this.client.post(`/resumes/${resumeId}/skills`, payload); return data; }
  async addProject(resumeId: number, payload: object) { const { data } = await this.client.post(`/resumes/${resumeId}/projects`, payload); return data; }
  async optimizeText(text: string, context: string = "experience") { const { data } = await this.client.post("/ai/optimize", { text, context }); return data; }
  async generateBio(platform: string, tone: string) { const { data } = await this.client.post("/ai/bio", { platform, tone }); return data; }
  async generateSummary(payload: object) { const { data } = await this.client.post("/ai/summary", payload); return data; }
  async analyzeATS(resume_id: number, job_description: string) { const { data } = await this.client.post("/ats/analyze", { resume_id, job_description }); return data; }
  async exportPDF(resume_id: number, template?: string): Promise<Blob> { const { data } = await this.client.post("/exports/pdf", { resume_id, template }, { responseType: "blob" }); return data; }
  async exportPortfolioHTML(resume_id: number): Promise<Blob> { const { data } = await this.client.post(`/exports/portfolio-html?resume_id=${resume_id}`, {}, { responseType: "blob" }); return data; }
}
export const api = new ApiClient();
