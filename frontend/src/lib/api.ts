import axios, { AxiosInstance, AxiosError } from "axios";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("cvforge-auth");
    if (!raw) return null;
    return JSON.parse(raw)?.state?.accessToken ?? null;
  } catch { return null; }
}

function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("cvforge-auth");
  localStorage.removeItem("cvforge-resume");
  window.location.href = "/login";
}

class ApiClient {
  private http: AxiosInstance;
  constructor() {
    this.http = axios.create({
      baseURL: "/api/v1",
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });
    this.http.interceptors.request.use((c) => {
      const t = getToken();
      if (t) c.headers.Authorization = "Bearer " + t;
      return c;
    });
    this.http.interceptors.response.use(
      (r) => r,
      (e: AxiosError) => { if (e.response?.status === 401) clearAuth(); return Promise.reject(e); }
    );
  }
  async register(email: string, password: string, full_name: string) { const { data } = await this.http.post("/auth/register", { email, password, full_name }); return data; }
  async login(email: string, password: string) { const { data } = await this.http.post("/auth/login", { email, password }); return data; }
  async getMe() { const { data } = await this.http.get("/auth/me"); return data; }
  async getResumes() { const { data } = await this.http.get("/resumes"); return data; }
  async createResume(p: object) { const { data } = await this.http.post("/resumes", p); return data; }
  async updateResume(id: number, p: object) { const { data } = await this.http.patch(`/resumes/${id}`, p); return data; }
  async deleteResume(id: number) { await this.http.delete(`/resumes/${id}`); }
  async addExperience(rid: number, p: object) { const { data } = await this.http.post(`/resumes/${rid}/experiences`, p); return data; }
  async deleteExperience(rid: number, eid: number) { await this.http.delete(`/resumes/${rid}/experiences/${eid}`); }
  async addEducation(rid: number, p: object) { const { data } = await this.http.post(`/resumes/${rid}/education`, p); return data; }
  async addSkill(rid: number, p: object) { const { data } = await this.http.post(`/resumes/${rid}/skills`, p); return data; }
  async deleteSkill(rid: number, sid: number) { await this.http.delete(`/resumes/${rid}/skills/${sid}`); }
  async addProject(rid: number, p: object) { const { data } = await this.http.post(`/resumes/${rid}/projects`, p); return data; }
  async deleteProject(rid: number, pid: number) { await this.http.delete(`/resumes/${rid}/projects/${pid}`); }
  async optimizeText(text: string, context = "experience") { const { data } = await this.http.post("/ai/optimize", { text, context }); return data; }
  async generateBio(platform: string, tone: string, user_context?: string) { const { data } = await this.http.post("/ai/bio", { platform, tone, user_context }); return data; }
  async generateSummary(p: object) { const { data } = await this.http.post("/ai/summary", p); return data; }
  async analyzeATS(resume_id: number, job_description: string) { const { data } = await this.http.post("/ats/analyze", { resume_id, job_description }); return data; }
  async exportPDF(resume_id: number, template?: string): Promise<Blob> { const { data } = await this.http.post("/exports/pdf", { resume_id, template }, { responseType: "blob", timeout: 30000 }); return data; }
  async exportPortfolioHTML(resume_id: number): Promise<Blob> { const { data } = await this.http.post(`/exports/portfolio-html?resume_id=${resume_id}`, {}, { responseType: "blob" }); return data; }
  async uploadAvatar(base64_data: string, content_type: string) { const { data } = await this.http.post("/uploads/avatar", { base64_data, content_type }); return data; }
  async deleteAvatar() { const { data } = await this.http.delete("/uploads/avatar"); return data; }
  async getCurrentPlan() { const { data } = await this.http.get("/plans/current"); return data; }
  async simulateUpgrade() { const { data } = await this.http.post("/plans/upgrade/simulate"); return data; }
  async downgradePlan() { const { data } = await this.http.post("/plans/downgrade"); return data; }
  async createCheckoutSession(plan: string) { const { data } = await this.http.post("/payments/create-checkout-session", { plan }); return data; }
  async createPortalSession(return_url?: string) { const { data } = await this.http.post("/payments/portal", { return_url }); return data; }
  async getSubscriptionStatus() { const { data } = await this.http.get("/payments/subscription-status"); return data; }
}

export const api = new ApiClient();
