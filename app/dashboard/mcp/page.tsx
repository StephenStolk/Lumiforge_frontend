"use client";
import { useEffect, useState } from "react";
import {
  getAgents, suggestControls, runAiAuditor, naturalLanguageQuery,
  runGapDetection, getControls, listDocuments, getAgentHistory
} from "@/lib/api";
import {
  PageHeader, Card, Btn, Badge, RiskBadge, Spinner, Empty,
  Select, Textarea, Input, SectionLabel, StatCard, StatusBadge,
  Table, Th, Td, Tr
} from "@/components/ui";
import {
  Bot, Wand2, Search, MessageSquare, ShieldAlert, ChevronDown,
  ChevronRight, Loader, Zap, FileText, Link2, History, CheckCircle
} from "lucide-react";

const FRAMEWORKS = ["SOC2","GDPR","ISO27001","HIPAA","PCI-DSS"];

const AGENT_META: Record<string, { icon: any; color: string; desc: string; docLabel: string }> = {
  smart_control_advisor: { icon: Wand2, color: "blue",
    desc: "Suggests controls tailored to your tech stack and compliance targets",
    docLabel: "Ground suggestions in uploaded document" },
  ai_auditor: { icon: ShieldAlert, color: "indigo",
    desc: "Simulates an AI-driven audit and surfaces critical compliance gaps",
    docLabel: "Audit against uploaded document evidence" },
  compliance_assistant: { icon: MessageSquare, color: "cyan",
    desc: "Natural language interface — ask anything about your compliance posture",
    docLabel: "Answer based on uploaded document" },
  gap_detector: { icon: Search, color: "amber",
    desc: "Detects missing controls and maps gaps to specific framework requirements",
    docLabel: "Detect gaps from uploaded document" },
};

const COLOR_MAP: Record<string, string> = {
  blue:"#60a5fa", indigo:"#a5b4fc", cyan:"#22d3ee", amber:"#fbbf24", gray:"#64748b"
};
const BG_MAP: Record<string, string> = {
  blue:"rgba(37,99,235,0.12)", indigo:"rgba(99,102,241,0.12)",
  cyan:"rgba(6,182,212,0.12)", amber:"rgba(245,158,11,0.12)", gray:"rgba(100,116,139,0.12)"
};

export default function MCPPage() {
  const [agents, setAgents]         = useState<any[]>([]);
  const [documents, setDocuments]   = useState<any[]>([]);
  const [history, setHistory]       = useState<any[]>([]);
  const [activeAgent, setActiveAgent] = useState<string|null>(null);
  const [loading, setLoading]       = useState(true);
  const [running, setRunning]       = useState(false);
  const [result, setResult]         = useState<any>(null);
  const [expanded, setExpanded]     = useState<string[]>([]);
  const [tab, setTab]               = useState<"agents"|"history">("agents");

  // Per-agent form state
  const [stack, setStack]           = useState("AWS, GitHub, PostgreSQL");
  const [frameworks, setFrameworks] = useState("SOC2, GDPR");
  const [currentState, setCurrentState] = useState("Early stage startup, minimal compliance processes");
  const [auditorCtx, setAuditorCtx] = useState("We are a B2B SaaS company targeting SOC2 Type II. We have MFA enabled, encrypted databases, and basic access controls.");
  const [nlQuestion, setNlQuestion] = useState("");
  const [gapFw, setGapFw]           = useState("SOC2");

  // Document selection — shared across all agents
  const [selectedDocId, setSelectedDocId] = useState<string>("");

  useEffect(() => {
    Promise.all([
      getAgents().then(d => setAgents(d.agents || [])),
      listDocuments().then(d => setDocuments(d.documents || [])).catch(() => {}),
      getAgentHistory().then(d => setHistory(d.runs || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const toggle = (k: string) =>
    setExpanded(e => e.includes(k) ? e.filter(x => x !== k) : [...e, k]);

  const runAgent = async (agentId: string) => {
    setRunning(true); setResult(null); setActiveAgent(agentId);
    try {
      const docId = selectedDocId || undefined;
      let res: any;
      if (agentId === "smart_control_advisor") {
        res = await suggestControls({ tech_stack: stack.split(",").map(s=>s.trim()), target_frameworks: frameworks.split(",").map(s=>s.trim()), current_state: currentState, document_id: docId });
      } else if (agentId === "ai_auditor") {
        res = await runAiAuditor({ context: auditorCtx, document_id: docId });
      } else if (agentId === "compliance_assistant") {
        res = await naturalLanguageQuery(nlQuestion, {}, docId);
      } else if (agentId === "gap_detector") {
        const ctrlData = await getControls();
        res = await runGapDetection(ctrlData.controls || [], gapFw, docId);
      }
      setResult(res);
      // Refresh history
      getAgentHistory().then(d => setHistory(d.runs || [])).catch(()=>{});
    } catch(e: any) {
      setResult({ error: e?.response?.data?.detail || e.message || "Agent failed" });
    }
    setRunning(false);
  };

  const renderAgentForm = (agentId: string) => (
    <div className="space-y-3">
      {agentId === "smart_control_advisor" && <>
        <Input label="Tech stack (comma-separated)" value={stack} onChange={setStack} placeholder="AWS, GitHub, PostgreSQL" />
        <Input label="Target frameworks" value={frameworks} onChange={setFrameworks} placeholder="SOC2, GDPR" />
        <Textarea label="Current compliance state" value={currentState} onChange={setCurrentState} />
      </>}
      {agentId === "ai_auditor" &&
        <Textarea label="Organization context" value={auditorCtx} onChange={setAuditorCtx} rows={4} />}
      {agentId === "compliance_assistant" &&
        <Input label="Your question" value={nlQuestion} onChange={setNlQuestion} placeholder="What are our biggest compliance gaps?" />}
      {agentId === "gap_detector" &&
        <Select label="Framework to analyze" value={gapFw} onChange={setGapFw} options={FRAMEWORKS} />}
    </div>
  );

  const renderResult = (res: any) => {
    if (!res) return null;
    if (res.error) return (
      <div className="rounded-lg p-3.5" style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)" }}>
        <p style={{ fontSize:13, color:"#f87171" }}>{res.error}</p>
      </div>
    );
    return (
      <div>
        {res.rag_grounded && (
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 mb-3"
            style={{ background:"rgba(16,185,129,0.07)", border:"1px solid rgba(16,185,129,0.2)", fontSize:11, color:"#34d399" }}>
            <Link2 size={11}/> Grounded in uploaded document via RAG retrieval
          </div>
        )}
        <div className="rounded-lg p-4 overflow-auto"
          style={{ background:"var(--bg-secondary)", border:"1px solid var(--border-bright)", maxHeight:420 }}>
          <pre className="text-xs whitespace-pre-wrap"
            style={{ color:"var(--text-secondary)", fontFamily:"var(--font-mono)", lineHeight:1.7 }}>
            {typeof res === "string" ? res : JSON.stringify(res, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  if (loading) return <Spinner />;

  const agentList = agents.length > 0 ? agents :
    Object.keys(AGENT_META).map(id => ({ id, name: id.replace(/_/g," "), status:"ready", doc_aware:true }));

  return (
    <div>
      <PageHeader title="AI Agents" sub="MCP-powered compliance intelligence — all agents can be grounded in your uploaded documents" />

      {/* Tab bar */}
      <div className="flex gap-1 mb-5" style={{ borderBottom:"1px solid var(--border)", paddingBottom:0 }}>
        {(["agents","history"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 capitalize transition-all"
            style={{
              fontSize:12, fontWeight:500,
              color: tab===t ? "var(--text-primary)" : "var(--text-muted)",
              borderBottom: tab===t ? "2px solid #3b82f6" : "2px solid transparent",
            }}>
            {t === "history" ? <><History size={11} style={{display:"inline",marginRight:5}}/>History</> : <><Bot size={11} style={{display:"inline",marginRight:5}}/>Agents</>}
          </button>
        ))}
      </div>

      {tab === "agents" && (
        <>
          {/* Document selector — pinned at top, affects all agents */}
          <Card style={{ marginBottom:16, border:"1px solid rgba(59,130,246,0.2)", background:"rgba(37,99,235,0.04)" }}>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 shrink-0">
                <FileText size={14} style={{ color:"#60a5fa" }}/>
                <span style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:500 }}>
                  Document context (optional — applies to all agents)
                </span>
              </div>
              <select
                value={selectedDocId}
                onChange={e => setSelectedDocId(e.target.value)}
                className="flex-1 rounded-lg px-3 py-1.5 text-white"
                style={{ fontSize:12, background:"var(--bg-secondary)", border:"1px solid var(--border-bright)", outline:"none", minWidth:220 }}>
                <option value="">— No document (use free-text context) —</option>
                {documents.map((d:any) => (
                  <option key={d.id} value={d.id}>{d.filename}</option>
                ))}
              </select>
              {selectedDocId && (
                <div className="flex items-center gap-1.5" style={{ fontSize:11, color:"#34d399" }}>
                  <CheckCircle size={11}/> RAG-enabled
                </div>
              )}
            </div>
            {!selectedDocId && (
              <p style={{ fontSize:11, color:"var(--text-muted)", marginTop:8 }}>
                Upload a document on the Analyze page first, then select it here to ground agent responses in your actual document content.
              </p>
            )}
          </Card>

          {/* Agent cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {agentList.map((agent:any) => {
              const meta = AGENT_META[agent.id] || { icon:Bot, color:"gray", desc:"", docLabel:"" };
              const Icon = meta.icon;
              const isActive = activeAgent === agent.id;
              const isOpen = expanded.includes(agent.id);

              return (
                <div key={agent.id} className="rounded-xl overflow-hidden transition-all"
                  style={{
                    background:"var(--bg-card)",
                    border:`1px solid ${isActive ? "rgba(37,99,235,0.4)" : "var(--border)"}`,
                    boxShadow: isActive ? "0 0 20px rgba(37,99,235,0.08)" : "none",
                  }}>
                  <div className="flex items-center gap-3 p-4 cursor-pointer select-none" onClick={() => toggle(agent.id)}>
                    <div className="rounded-lg flex items-center justify-center shrink-0"
                      style={{ width:36, height:36, background:BG_MAP[meta.color]||BG_MAP.gray, border:"1px solid rgba(255,255,255,0.06)" }}>
                      <Icon size={16} style={{ color:COLOR_MAP[meta.color]||COLOR_MAP.gray }}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white capitalize" style={{ fontSize:13, fontFamily:"var(--font-display)" }}>
                          {agent.name || agent.id.replace(/_/g," ")}
                        </p>
                        {agent.doc_aware && (
                          <span style={{ fontSize:9, color:"#60a5fa", background:"rgba(37,99,235,0.1)", border:"1px solid rgba(37,99,235,0.2)", borderRadius:4, padding:"1px 5px", fontFamily:"var(--font-mono)" }}>
                            DOC-AWARE
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize:11, color:"var(--text-muted)" }}>{meta.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isActive && running && <Loader size={13} className="animate-spin" style={{ color:"#60a5fa" }}/>}
                      {isOpen ? <ChevronDown size={14} style={{ color:"var(--text-muted)" }}/> : <ChevronRight size={14} style={{ color:"var(--text-muted)" }}/>}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-4 pb-4" style={{ borderTop:"1px solid var(--border)" }}>
                      {selectedDocId && meta.docLabel && (
                        <div className="flex items-center gap-1.5 mt-3 mb-3 rounded-md px-2.5 py-1.5"
                          style={{ background:"rgba(16,185,129,0.07)", border:"1px solid rgba(16,185,129,0.18)", fontSize:11, color:"#34d399" }}>
                          <Link2 size={10}/> {meta.docLabel}
                        </div>
                      )}
                      <div className="pt-3">
                        {renderAgentForm(agent.id)}
                        <Btn onClick={() => runAgent(agent.id)} disabled={running} className="w-full justify-center mt-3">
                          {running && isActive
                            ? <><Loader size={13} className="animate-spin"/> Running…</>
                            : <><Zap size={13}/> Run Agent{selectedDocId ? " on Document" : ""}</>}
                        </Btn>
                      </div>
                      {isActive && result && (
                        <div className="mt-4">
                          <SectionLabel>Agent output</SectionLabel>
                          {renderResult(result)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "history" && (
        <Card>
          <SectionLabel><History size={11}/> Past agent runs</SectionLabel>
          {history.length === 0 ? <Empty message="No agent runs yet"/> : (
            <div className="space-y-2 mt-3">
              {history.map((run:any) => (
                <div key={run.id} className="rounded-lg p-3"
                  style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)" }}>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Bot size={13} style={{ color:"#60a5fa" }}/>
                      <span className="font-medium text-white" style={{ fontSize:12 }}>
                        {run.agent?.replace(/_/g," ")}
                      </span>
                      {run.input?.document_id && (
                        <span style={{ fontSize:9, color:"#34d399", background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:4, padding:"1px 5px", fontFamily:"var(--font-mono)" }}>
                          DOC
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize:10, color:"var(--text-muted)", fontFamily:"var(--font-mono)" }}>
                      {run.created_at?.slice(0,16)?.replace("T"," ")}
                    </span>
                  </div>
                  {run.input?.question && (
                    <p style={{ fontSize:11, color:"var(--text-muted)", marginTop:4 }}>"{run.input.question}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
