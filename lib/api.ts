import axios from "axios";
import { getAuthToken } from "./supabase";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Auto-injects Supabase JWT on every request
const API = axios.create({ baseURL: BASE });

API.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Documents (/api/) ───────────────────────────────────
export const uploadDocument = async (file: File) => {
  const fd = new FormData();
  fd.append("file", file);
  return (await API.post("/api/upload", fd, { headers: { "Content-Type": "multipart/form-data" } })).data;
};
export const analyzeDocument = async (document_id: string, query: string) =>
  (await API.post("/api/analyze", { document_id, query })).data;
export const verifyDocument = async (document_id: string) =>
  (await API.get(`/api/verify/${document_id}`)).data;
export const listDocuments = async () =>
  (await API.get("/api/documents")).data;
export const getAnalysisHistory = async () =>
  (await API.get("/api/analysis-history")).data;

// ── Controls (/api/controls/) ──────────────────────────
export const getFrameworks = async () =>
  (await API.get("/api/controls/frameworks")).data;
export const getControls = async (framework?: string, status?: string) =>
  (await API.get("/api/controls/", { params: { framework, status } })).data;
export const createControl = async (data: any) =>
  (await API.post("/api/controls/", data)).data;
export const updateControlStatus = async (id: string, status: string, notes = "") =>
  (await API.put(`/api/controls/${id}/status`, null, { params: { status, notes } })).data;
export const addEvidence = async (control_id: string, data: any) =>
  (await API.post(`/api/controls/${control_id}/evidence`, data)).data;

// ── Risks (/api/risk/) ─────────────────────────────────
export const getRisks = async (status?: string) =>
  (await API.get("/api/risk/", { params: { status } })).data;
export const createRisk = async (data: any) =>
  (await API.post("/api/risk/", data)).data;
export const updateRisk = async (id: string, data: any) =>
  (await API.put(`/api/risk/${id}`, data)).data;
export const getRiskHeatmap = async () =>
  (await API.get("/api/risk/heatmap")).data;

// ── Vendors (/api/vendors/) ────────────────────────────
export const getVendors = async () =>
  (await API.get("/api/vendors/")).data;
export const createVendor = async (data: any) =>
  (await API.post("/api/vendors/", data)).data;
export const updateVendor = async (id: string, data: any) =>
  (await API.put(`/api/vendors/${id}`, data)).data;

// ── Employees (/api/employees/) ───────────────────────
export const getEmployees = async () =>
  (await API.get("/api/employees/")).data;
export const createEmployee = async (data: any) =>
  (await API.post("/api/employees/", data)).data;
export const updateEmployee = async (id: string, data: any) =>
  (await API.put(`/api/employees/${id}`, data)).data;

// ── Policies (/api/policies/) ─────────────────────────
export const getPolicies = async () =>
  (await API.get("/api/policies/")).data;
export const createPolicy = async (data: any) =>
  (await API.post("/api/policies/", data)).data;
export const updatePolicy = async (id: string, data: any) =>
  (await API.put(`/api/policies/${id}`, data)).data;

// ── Incidents (/api/incidents/) ───────────────────────
export const getIncidents = async () =>
  (await API.get("/api/incidents/")).data;
export const createIncident = async (data: any) =>
  (await API.post("/api/incidents/", data)).data;
export const updateIncident = async (id: string, data: any) =>
  (await API.put(`/api/incidents/${id}`, data)).data;

// ── Monitoring (/api/monitoring/) ─────────────────────
export const getMonitoringDashboard = async () =>
  (await API.get("/api/monitoring/dashboard")).data;
export const connectIntegration = async (data: any) =>
  (await API.post("/api/monitoring/integrations/connect", data)).data;
export const getIntegrations = async () =>
  (await API.get("/api/monitoring/integrations")).data;
export const syncIntegration = async (id: string) =>
  (await API.post(`/api/monitoring/integrations/${id}/sync`)).data;
export const getAlerts = async (status = "open") =>
  (await API.get("/api/monitoring/alerts", { params: { status } })).data;
export const resolveAlert = async (id: string, note = "") =>
  (await API.post(`/api/monitoring/alerts/${id}/resolve`, null, { params: { resolution_note: note } })).data;
export const getComplianceLogs = async (days = 30) =>
  (await API.get("/api/monitoring/logs", { params: { days } })).data;

// ── Audit (/api/audit/) ───────────────────────────────
export const getAuditSessions = async () =>
  (await API.get("/api/audit/sessions")).data;
export const createAuditSession = async (data: any) =>
  (await API.post("/api/audit/sessions", data)).data;
export const generateAuditPackage = async (session_id: string) =>
  (await API.post(`/api/audit/sessions/${session_id}/generate-package`)).data;

// ── MCP / AI Agents (/api/mcp/) ───────────────────────
export const getAgents = async () =>
  (await API.get("/api/mcp/agents")).data;
export const suggestControls = async (data: any) =>
  (await API.post("/api/mcp/suggest-controls", data)).data;
export const runAiAuditor = async (data: any) =>
  (await API.post("/api/mcp/ai-auditor", data)).data;
export const naturalLanguageQuery = async (question: string, org_context: any = {}, document_id?: string) =>
  (await API.post("/api/mcp/query", { question, org_context, document_id })).data;
export const runGapDetection = async (controls: any[], framework: string, document_id?: string) =>
  (await API.post("/api/mcp/gap-detection", { controls, framework, document_id })).data;
export const getAgentHistory = async () =>
  (await API.get("/api/mcp/history")).data;

// ── Audit extras (/api/audit/) ────────────────────────
export const getAuditTimeline = async () =>
  (await API.get("/api/audit/timeline")).data;
export const grantAuditorAccess = async (data: any) =>
  (await API.post("/api/audit/auditor-access", data)).data;
// ── Vendor AI (/api/vendors/) ──────────────────────────
export const aiVendorAssess = async (vendor_id: string) =>
  (await API.post(`/api/vendors/${vendor_id}/ai-assess`)).data;
export const generateVendorQuestionnaire = async (vendor_id: string) =>
  (await API.post(`/api/vendors/${vendor_id}/questionnaire`)).data;

// ── Policy AI (/api/policies/) ────────────────────────
export const aiPolicyReview = async (policy_id: string) =>
  (await API.post(`/api/policies/${policy_id}/ai-review`)).data;
export const aiGeneratePolicy = async (data: { policy_type: string; frameworks: string[] }) =>
  (await API.post("/api/policies/ai-generate", data)).data;

// ── Employee AI (/api/employees/) ─────────────────────
export const aiTrainingPlan = async (data: { role: string; department: string; frameworks: string[] }) =>
  (await API.post("/api/employees/ai-training-plan", data)).data;
export const aiOnboardingChecklist = async (employee_id: string) =>
  (await API.post(`/api/employees/${employee_id}/ai-onboarding`)).data;
