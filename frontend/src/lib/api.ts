import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/authStore";

function csrfCookie(): string {
  if (typeof document === "undefined") return "";
  const item = document.cookie.split("; ").find((value) => value.startsWith("epersona_csrf="));
  return item ? decodeURIComponent(item.split("=").slice(1).join("=")) : "";
}

type RetriableRequest = InternalAxiosRequestConfig & { _refreshed?: boolean; _externalConsent?: boolean };

class ApiClient {
  private http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: "/api/v1", headers: { "Content-Type": "application/json" },
      timeout: 20000, withCredentials: true,
    });
    this.http.interceptors.request.use((config) => {
      const csrf = csrfCookie();
      if (csrf) config.headers.set("X-CSRF-Token", csrf);
      return config;
    });
    this.http.interceptors.response.use((result) => result, async (error: AxiosError) => {
      const req = error.config as RetriableRequest | undefined;
      if (req && error.response?.status === 412 && req.url?.startsWith("/ai/") && !req._externalConsent) {
        req._externalConsent = true;
        if (typeof window !== "undefined" && window.confirm(
          "Esta función enviará información de tu CV a un proveedor externo de IA. ¿Autorizas el envío?"
        )) {
          req.headers.set("X-AI-External-Consent", "true");
          return this.http.request(req);
        }
      }
      if (req && error.response?.status === 401 && !req._refreshed &&
          !req.url?.startsWith("/auth/login") && !req.url?.startsWith("/auth/refresh") &&
          !req.url?.startsWith("/auth/register")) {
        req._refreshed = true;
        try {
          await axios.post("/api/v1/auth/refresh", {}, {
            withCredentials: true, headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfCookie() },
          });
          return this.http.request(req);
        } catch {
          useAuthStore.getState().logout();
          if (typeof window !== "undefined") window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    });
  }

  async register(email: string, password: string, full_name: string) { const {data} = await this.http.post("/auth/register", {email,password,full_name}); return data; }
  async verifyEmail(token: string) { const {data} = await this.http.post("/auth/verify-email", {token}); return data; }
  async resendVerification(email: string) { const {data} = await this.http.post("/auth/resend-verification", {email}); return data; }
  async login(email: string, password: string) { const {data} = await this.http.post("/auth/login", {email,password}); return data; }
  async logout() { const {data} = await this.http.post("/auth/logout"); return data; }
  async getMe() { const {data} = await this.http.get("/auth/me"); return data; }
  async exportAccount() { const {data} = await this.http.get("/auth/account/export"); return data; }
  async deleteAccount(password: string, confirmation: "BORRAR") { const {data} = await this.http.delete("/auth/account", {data:{password,confirmation}}); return data; }
  async getResumes() { const {data} = await this.http.get("/resumes"); return data; }
  async createResume(p: object) { const {data} = await this.http.post("/resumes",p); return data; }
  async updateResume(id: number,p: object) { const {data} = await this.http.patch(`/resumes/${id}`,p); return data; }
  async deleteResume(id: number) { await this.http.delete(`/resumes/${id}`); }
  async addExperience(rid: number,p: object) { const {data} = await this.http.post(`/resumes/${rid}/experiences`,p); return data; }
  async deleteExperience(rid: number,eid: number) { await this.http.delete(`/resumes/${rid}/experiences/${eid}`); }
  async addEducation(rid: number,p: object) { const {data} = await this.http.post(`/resumes/${rid}/education`,p); return data; }
  async addSkill(rid: number,p: object) { const {data} = await this.http.post(`/resumes/${rid}/skills`,p); return data; }
  async deleteSkill(rid: number,sid: number) { await this.http.delete(`/resumes/${rid}/skills/${sid}`); }
  async addProject(rid: number,p: object) { const {data} = await this.http.post(`/resumes/${rid}/projects`,p); return data; }
  async deleteProject(rid: number,pid: number) { await this.http.delete(`/resumes/${rid}/projects/${pid}`); }
  async optimizeText(text: string,context="experience") { const {data} = await this.http.post("/ai/optimize",{text,context}); return data; }
  async generateBio(platform:string,tone:string,user_context?:string) { const {data} = await this.http.post("/ai/bio",{platform,tone,user_context}); return data; }
  async generateSummary(p:object) { const {data} = await this.http.post("/ai/summary",p); return data; }
  async getAIProviderInfo() { const {data} = await this.http.get("/ai/provider-info"); return data; }
  async analyzeATS(resume_id:number,job_description:string) { const {data} = await this.http.post("/ats/analyze",{resume_id,job_description}); return data; }
  async exportPDF(resume_id:number,template?:string):Promise<Blob> { const {data} = await this.http.post("/exports/pdf",{resume_id,template},{responseType:"blob",timeout:30000}); return data; }
  async exportPortfolioHTML(resume_id:number):Promise<Blob> { const {data} = await this.http.post(`/exports/portfolio-html?resume_id=${resume_id}`,{},{responseType:"blob"}); return data; }
  async uploadAvatar(base64_data:string,content_type:string) { const {data} = await this.http.post("/uploads/avatar",{base64_data,content_type}); return data; }
  async deleteAvatar() { const {data} = await this.http.delete("/uploads/avatar"); return data; }
  async getCurrentPlan() { const {data} = await this.http.get("/plans/current"); return data; }
  async downgradePlan() { const {data} = await this.http.post("/plans/downgrade"); return data; }
  async createCheckoutSession(plan:string) { const {data} = await this.http.post("/payments/create-checkout-session",{plan}); return data; }
  async createPortalSession(return_url?:string) { const {data} = await this.http.post("/payments/portal",{return_url}); return data; }
  async getSubscriptionStatus() { const {data} = await this.http.get("/payments/subscription-status"); return data; }
  async adminGetStats() { const {data} = await this.http.get("/admin/stats"); return data; }
  async adminGetUsers(search="",plan="") { const {data} = await this.http.get(`/admin/users?search=${encodeURIComponent(search)}&plan=${encodeURIComponent(plan)}`); return data; }
  async adminUpdatePlan(userId:number,plan:string) { const {data} = await this.http.patch(`/admin/users/${userId}/plan`,{plan}); return data; }
  async adminToggleActive(userId:number,is_active:boolean) { const {data} = await this.http.patch(`/admin/users/${userId}/active`,{is_active}); return data; }
  async adminResetPassword(userId:number,new_password:string) { const {data} = await this.http.patch(`/admin/users/${userId}/reset-password`,{new_password}); return data; }
  async adminDeleteUser(userId:number) { const {data} = await this.http.delete(`/admin/users/${userId}`); return data; }
}

export const api = new ApiClient();
