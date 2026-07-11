import axios, { AxiosInstance, AxiosError } from "axios";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("cvforge-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
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

    this.http.interceptors.request.use((config) => {
      const token = getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.http.interceptors.response.use(
      (res) => res,
      (err: AxiosError) => {
        if (err.response?.status === 401) clearAuth();
        return Promise.reject(err);
      }
    );
  }

  async register(email: string, password: string, full_name: string) {
    const { data } = await this.http.post("/auth/register", { email, password, full_name });
    return data;
  }
  async login(email: string, password: string) {
    const { data } = await this.http.post("/auth/login", { email, password });
    return data;
  }
  async getMe() {
    const { data } = await this.http.get("/auth/me");
    return data;
  }
  async getResumes() {
    const { data } = await this.http.get("/resumes");
    return data;
  }
  async createResume(payload: object) {
    const { data } = await this.http.post("/resumes", payload);
    return data;
  }
  async updateResume(id: number, payload: object) {
    const { data } = await this.http.patch(`/resumes/${id}`, payload);
    return data;
  }
  async deleteResume(id: number) {
    await this.http.delete(`/resumes/${id}`);
  }
  async addExperience(resumeId: number, payload: object) {
    const { data } = await this.http.post(`/resumes/${resumeId}/experiences`, payload);
    return data;
  }
  async deleteExperience(resumeId: number, expId: number) {
    await this.http.delete(`/resumes/${resumeId}/experiences/${expId}`);
  }
  async addEducation(resumeId: number, payload: object) {
    const { data } = await this.http.post(`/resumes/${resumeId}/education`, payload);
    return data;
  }
  async addSkill(resumeId: number, payload: object) {
    const { data } = await this.http.post(`/resumes/${resumeId}/skills`, payload);
    return data;
  }
  async deleteSkill(resumeId: number, skillId: number) {
    await this.http.delete(`/resumes/${resumeId}/skills/${skillId}`);
  }
  async addProject(resumeId: number, payload: object) {
    const { data } = await this.http.post(`/resumes/${resumeId}/projects`, payload);
    return data;
  }
  async deleteProject(resumeId: number, projId: number) {
    await this.http.delete(`/resumes/${resumeId}/projects/${projId}`);
  }
  async optimizeText(text: string, context = "experience") {
    const { data } = await this.http.post("/ai/optimize", { text, context });
    return data;
  }
  async generateBio(platform: string, tone: string) {
    const { data } = await this.http.post("/ai/bio", { platform, tone });
    return data;
  }
  async analyzeATS(resume_id: number, job_description: string) {
    const { data } = await this.http.post("/ats/analyze", { resume_id, job_description });
    return data;
  }
  async exportPDF(resume_id: number, template?: string): Promise<Blob> {
    const { data } = await this.http.post(
      "/exports/pdf",
      { resume_id, template },
      { responseType: "blob", timeout: 30000 }
    );
    return data;
  }
  async exportPortfolioHTML(resume_id: number): Promise<Blob> {
    const { data } = await this.http.post(
      `/exports/portfolio-html?resume_id=${resume_id}`,
      {},
      { responseType: "blob" }
    );
    return data;
  }
}

export const api = new ApiClient();