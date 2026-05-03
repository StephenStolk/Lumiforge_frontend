"use client";
import { useEffect, useState } from "react";
import { getAgents, suggestControls, runAiAuditor, naturalLanguageQuery, runGapDetection, getControls } from "@/lib/api";
import { PageHeader, Card, Btn, Badge, RiskBadge, Spinner, Empty, Select, Textarea, Input, SectionLabel } from "@/components/ui";
import { Bot, Wand2, Search, MessageSquare, ShieldAlert, ChevronDown, ChevronRight, Loader, Zap } from "lucide-react";

const FRAMEWORKS = ["SOC2","GDPR","ISO27001","HIPAA","PCI-DSS"];

const AGENT_META: Record<string, { icon: any; color: string; desc: string }> = {
  smart_control_advisor: { icon: Wand2, color: "blue", desc: "Suggests controls tailored to your tech stack and compliance targets" },
  ai_auditor: { icon: ShieldAlert, color: "indigo", desc: "Simulates an AI-driven audit and surfaces critical compliance gaps" },
  compliance_assistant: { icon: MessageSquare, color: "cyan", desc: "Natural language interface — ask anything about your compliance posture" },
  gap_detector: { icon: Search, color: "amber", desc: "Detects missing controls and maps gaps to specific framework requirements" },
};

export default function MCPPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [activeAgent, setActiveAgent] = useState<string|null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [expanded, setExpanded] = useState<string[]>([]);

  const [stack, setStack] = useState("AWS, GitHub, PostgreSQL");
  const [frameworks, setFrameworks] = useState("SOC2, GDPR");
  const [currentState, setCurrentState] = useState("Early stage startup, minimal compliance processes");
  const [auditorContext, setAuditorContext] = useState("We are a B2B SaaS company targeting SOC2 Type II. We have MFA enabled, encrypted databases, and basic access controls.");
  const [nlQuestion, setNlQuestion] = useState("");
  const [gapFw, setGapFw] = useState("SOC2");

  useEffect(() => { getAgents().then(d => { setAgents(d.agents || []); setLoading(false); }); }, []);

  const toggle = (k: string) => setExpanded(e => e.includes(k) ? e.filter(x => x !== k) : [...e, k]);

  const runAgent = async (agentId: string) => {
    setRunning(true); setResult(null); setActiveAgent(agentId);
    try {
      let res;
      if (agentId === "smart_control_advisor") {
        res = await suggestControls({ tech_stack: stack.split(",").map(s=>s.trim()), target_frameworks: frameworks.split(",").map(s=>s.trim()), current_state: currentState });
      } else if (agentId === "ai_auditor") {
        res = await runAiAuditor({ context: auditorContext });
      } else if (agentId === "compliance_assistant") {
        res = await naturalLanguageQuery(nlQuestion, {});
      } else if (agentId === "gap_detector") {
        const ctrlData = await getControls();
        res = await runGapDetection(ctrlData.controls || [], gapFw);
      }
      setResult(res);
    } catch(e: any) {
      setResult({ error: e?.response?.data?.detail || e.message || "Agent failed" });
    }
    setRunning(false);
  };

  const renderAgentForm = (agentId: string) => {
    if (agentId === "smart_control_advisor") return (
      <div>
        <Input label="Tech stack (comma-separated)" value={stack} onChange={setStack} placeholder="AWS, GitHub, PostgreSQL" />
        <Input label="Target frameworks" value={frameworks} onChange={setFrameworks} placeholder="SOC2, GDPR" />
        <Textarea label="Current compliance state" value={currentState} onChange={setCurrentState} placeholder="Describe your current compliance posture..." />
      </div>
    );
    if (agentId === "ai_auditor") return (
      <Textarea label="Organization context" value={auditorContext} onChange={setAuditorContext} rows={4} placeholder="Describe your organization, infrastructure, and current controls..." />
    );
    if (agentId === "compliance_assistant") return (
      <Input label="Question" value={nlQuestion} onChange={setNlQuestion} placeholder="What are our biggest compliance gaps?" />
    );
    if (agentId === "gap_detector") return (
      <Select label="Framework to analyze" value={gapFw} onChange={setGapFw} options={FRAMEWORKS} />
    );
    return null;
  };

  const renderResult = (res: any) => {
    if (!res) return null;
    if (res.error) return (
      <div className="rounded-lg p-3.5" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
        <p style={{ fontSize: 13, color: "#f87171" }}>{res.error}</p>
      </div>
    );
    return (
      <div className="rounded-lg p-4 overflow-auto" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-bright)", maxHeight: 400 }}>
        <pre className="text-xs whitespace-pre-wrap" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
          {typeof res === "string" ? res : JSON.stringify(res, null, 2)}
        </pre>
      </div>
    );
  };

  if (loading) return <Spinner />;

  const agentList = agents.length > 0 ? agents : Object.keys(AGENT_META).map(id => ({ id, name: id.replace(/_/g, " "), status: "ready" }));

  return (
    <div>
      <PageHeader title="AI Agents" sub="MCP-powered agentic intelligence — specialized compliance agents" />

      {/* Agent cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        {agentList.map((agent: any) => {
          const meta = AGENT_META[agent.id] || { icon: Bot, color: "gray", desc: "" };
          const Icon = meta.icon;
          const isActive = activeAgent === agent.id;
          const isOpen = expanded.includes(agent.id);

          return (
            <div
              key={agent.id}
              className="rounded-xl overflow-hidden transition-all"
              style={{
                background: "var(--bg-card)",
                border: `1px solid ${isActive ? "rgba(37,99,235,0.4)" : "var(--border)"}`,
                boxShadow: isActive ? "0 0 20px rgba(37,99,235,0.08)" : "none",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer select-none"
                onClick={() => toggle(agent.id)}
              >
                <div
                  className="rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    width: 36, height: 36,
                    background: `${["rgba(37,99,235,0.12)","rgba(99,102,241,0.12)","rgba(6,182,212,0.12)","rgba(245,158,11,0.12)"][["blue","indigo","cyan","amber"].indexOf(meta.color)] || "rgba(100,116,139,0.12)"}`,
                    border: `1px solid rgba(255,255,255,0.06)`,
                  }}
                >
                  <Icon size={16} style={{ color: { blue:"#60a5fa", indigo:"#a5b4fc", cyan:"#22d3ee", amber:"#fbbf24", gray:"#64748b" }[meta.color] || "#64748b" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white capitalize" style={{ fontSize: 13, fontFamily: "var(--font-display)" }}>
                    {agent.name || agent.id.replace(/_/g, " ")}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{meta.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isActive && running && <Loader size={13} className="animate-spin" style={{ color: "#60a5fa" }} />}
                  {isOpen ? <ChevronDown size={14} style={{ color: "var(--text-muted)" }} /> : <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />}
                </div>
              </div>

              {/* Expanded form */}
              {isOpen && (
                <div className="px-4 pb-4" style={{ borderTop: "1px solid var(--border)" }}>
                  <div className="pt-4">
                    {renderAgentForm(agent.id)}
                    <Btn onClick={() => runAgent(agent.id)} disabled={running} className="w-full justify-center mt-2">
                      {running && isActive ? (
                        <><Loader size={13} className="animate-spin"/> Running agent…</>
                      ) : (
                        <><Zap size={13}/> Run Agent</>
                      )}
                    </Btn>
                  </div>
                  {/* Result */}
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
    </div>
  );
}
