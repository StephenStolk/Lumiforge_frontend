"use client";
import { useEffect, useState } from "react";
import {
  getAuditSessions, createAuditSession, generateAuditPackage,
  grantAuditorAccess, getAuditTimeline, getAnalysisHistory,
  getAgentHistory
} from "@/lib/api";
import {
  PageHeader, Card, Btn, StatusBadge, Badge, Modal, Input, Select,
  Empty, Spinner, SectionLabel, StatCard
} from "@/components/ui";
import {
  Plus, Package, UserCheck, Clock, BookOpen, ShieldCheck,
  FileText, Bot, Activity,Link2
} from "lucide-react";

const FRAMEWORKS = ["SOC2","ISO27001","GDPR","HIPAA","PCI-DSS"];

export default function AuditPage() {
  const [sessions, setSessions]         = useState<any[]>([]);
  const [timeline, setTimeline]         = useState<any[]>([]);
  const [analyses, setAnalyses]         = useState<any[]>([]);
  const [agentRuns, setAgentRuns]       = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showAdd, setShowAdd]           = useState(false);
  const [showAccess, setShowAccess]     = useState(false);
  const [generatingFor, setGeneratingFor] = useState<string|null>(null);
  const [generatedPkg, setGeneratedPkg] = useState<any>(null);
  const [expandedPkg, setExpandedPkg]   = useState<string|null>(null);
  const [accessResult, setAccessResult] = useState<any>(null);
  const [activeTab, setActiveTab]       = useState<"sessions"|"evidence"|"timeline">("sessions");
  const [form, setForm] = useState({ framework:"SOC2", auditor_name:"", auditor_org:"", scheduled_date:"", scope:[] as string[] });
  const [accessForm, setAccessForm] = useState({ auditor_email:"", access_level:"read_only", expiry_days:30 });

  const load = async () => {
    try {
      const [s, t, a, ar] = await Promise.all([
        getAuditSessions(), getAuditTimeline(),
        getAnalysisHistory().catch(()=>[]),
        getAgentHistory().catch(()=>({runs:[]})),
      ]);
      setSessions(s.sessions || []);
      setTimeline(t.timeline || []);
      setAnalyses(Array.isArray(a) ? a : a?.results || []);
      setAgentRuns(ar.runs || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => { await createAuditSession(form); setShowAdd(false); load(); };
  const handleGenPackage = async (id: string) => {
    setGeneratingFor(id);
    const pkg = await generateAuditPackage(id);
    setGeneratedPkg(pkg); setGeneratingFor(null); setExpandedPkg(id);
  };
  const handleGrantAccess = async () => {
    const r = await grantAuditorAccess(accessForm);
    setAccessResult(r); setShowAccess(false);
  };

  if (loading) return <Spinner />;

  const pending = sessions.filter(s => s.status === "preparation");
  const completed = sessions.filter(s => s.status === "completed");

  return (
    <div>
      <PageHeader title="Audit Hub" sub="Manage audit sessions, evidence packages, and auditor access"
        action={
          <div className="flex gap-2">
            <Btn small variant="secondary" onClick={() => setShowAccess(true)}><UserCheck size={12}/> Grant Auditor Access</Btn>
            <Btn small onClick={() => setShowAdd(true)}><Plus size={12}/> New Audit Session</Btn>
          </div>
        }/>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard label="Active Sessions" value={pending.length} color="amber" icon={<Clock size={13}/>}/>
        <StatCard label="Completed" value={completed.length} color="green" icon={<ShieldCheck size={13}/>}/>
        <StatCard label="Evidence Items" value={analyses.length + agentRuns.length} color="blue" icon={<FileText size={13}/>}/>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5" style={{ borderBottom:"1px solid var(--border)" }}>
        {(["sessions","evidence","timeline"] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className="px-4 py-2 capitalize transition-all"
            style={{ fontSize:12, fontWeight:500, color: activeTab===t ? "var(--text-primary)":"var(--text-muted)", borderBottom: activeTab===t ? "2px solid #3b82f6":"2px solid transparent" }}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === "sessions" && (
        sessions.length === 0 ? (
          <Card><Empty message="No audit sessions yet." icon={<BookOpen size={32}/>}/></Card>
        ) : (
          <div className="space-y-3">
            {sessions.map((s:any) => (
              <Card key={s.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge label={s.framework} color="blue"/>
                      <StatusBadge status={s.status}/>
                    </div>
                    <p className="font-medium text-white" style={{fontSize:13}}>
                      {s.auditor_name} {s.auditor_org ? `— ${s.auditor_org}` : ""}
                    </p>
                    {s.scheduled_date && (
                      <p style={{fontSize:11,color:"var(--text-muted)",marginTop:3}}>
                        Scheduled: {new Date(s.scheduled_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Btn small onClick={() => handleGenPackage(s.id)} disabled={generatingFor === s.id}>
                    {generatingFor === s.id ? "Generating…" : <><Package size={11}/> Generate Package</>}
                  </Btn>
                </div>

                {/* Generated package inline */}
                {expandedPkg === s.id && generatedPkg && (
                  <div className="mt-4 rounded-lg p-4" style={{ background:"var(--bg-secondary)", border:"1px solid var(--border-bright)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <SectionLabel><Package size={11}/> Audit Package</SectionLabel>
                      <Btn small variant="ghost" onClick={() => setExpandedPkg(null)}>✕</Btn>
                    </div>
                    <pre className="text-xs whitespace-pre-wrap overflow-auto" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-mono)", lineHeight:1.7, maxHeight:300 }}>
                      {JSON.stringify(generatedPkg, null, 2)}
                    </pre>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )
      )}

      {activeTab === "evidence" && (
        <div className="space-y-4">
          {/* Compliance analyses as evidence */}
          <Card>
            <SectionLabel><Bot size={11}/> Document Analyses (from AI Compliance Analyzer)</SectionLabel>
            {analyses.length === 0 ? <Empty message="No analyses yet — run analysis on the Analyze page"/> : (
              <div className="space-y-2 mt-3">
                {analyses.slice(0,10).map((a:any) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg px-3 py-2.5 gap-3"
                    style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)" }}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white" style={{fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {a.filename || a.document_id}
                      </p>
                      <p style={{fontSize:11,color:"var(--text-muted)",marginTop:2}} className="line-clamp-1">{a.query}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span style={{fontSize:11,fontFamily:"var(--font-mono)",color: a.overall_status==="PASS"?"#34d399":a.overall_status==="FAIL"?"#f87171":"#fbbf24"}}>
                        {a.overall_status}
                      </span>
                      {a.blockchain_tx && (
                        <span style={{fontSize:9,color:"#34d399",fontFamily:"var(--font-mono)"}} title={`TX: ${a.blockchain_tx}`}>
                          ⛓ ON-CHAIN
                        </span>
                      )}
                      <span style={{fontSize:10,color:"var(--text-muted)",fontFamily:"var(--font-mono)"}}>
                        {a.created_at?.slice(0,10)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Agent runs as evidence */}
          <Card>
            <SectionLabel><Activity size={11}/> AI Agent Runs (MCP tool logs)</SectionLabel>
            {agentRuns.length === 0 ? <Empty message="No agent runs yet — use AI Agents page"/> : (
              <div className="space-y-2 mt-3">
                {agentRuns.slice(0,8).map((r:any) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg px-3 py-2.5 gap-3"
                    style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)" }}>
                    <div>
                      <p className="font-medium text-white" style={{fontSize:12}}>{r.agent?.replace(/_/g," ")}</p>
                      {r.input?.document_id && (
                        <div className="flex items-center gap-1 mt-1" style={{fontSize:10,color:"#34d399"}}>
                          <Link2 size={9}/> Document-grounded
                        </div>
                      )}
                    </div>
                    <span style={{fontSize:10,color:"var(--text-muted)",fontFamily:"var(--font-mono)"}}>
                      {r.created_at?.slice(0,16)?.replace("T"," ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "timeline" && (
        <Card>
          <SectionLabel><Clock size={11}/> Audit Timeline</SectionLabel>
          {timeline.length === 0 ? <Empty message="No timeline events"/> : (
            <div className="space-y-3 mt-3">
              {timeline.map((e:any, i:number) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background:"#3b82f6" }}/>
                    {i < timeline.length-1 && <div className="w-px flex-1 mt-1" style={{ background:"var(--border)" }}/>}
                  </div>
                  <div className="pb-4 flex-1">
                    <p className="font-medium text-white" style={{fontSize:12}}>{e.event||e.title}</p>
                    {e.description && <p style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>{e.description}</p>}
                    <p style={{fontSize:10,color:"var(--text-muted)",marginTop:3,fontFamily:"var(--font-mono)"}}>{e.date||e.created_at?.slice(0,10)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Grant Access Modal */}
      {showAccess && (
        <Modal title="Grant Auditor Access" onClose={() => setShowAccess(false)}>
          <Input label="Auditor email" value={accessForm.auditor_email} onChange={v => setAccessForm(f=>({...f,auditor_email:v}))} placeholder="auditor@firm.com"/>
          <Select label="Access level" value={accessForm.access_level} onChange={v => setAccessForm(f=>({...f,access_level:v}))} options={["read_only","read_write","admin"]}/>
          <Input label="Expiry (days)" value={String(accessForm.expiry_days)} onChange={v => setAccessForm(f=>({...f,expiry_days:parseInt(v)||30}))} placeholder="30"/>
          <Btn onClick={handleGrantAccess} className="w-full justify-center mt-2"><UserCheck size={13}/> Grant Access</Btn>
          {accessResult && <p style={{fontSize:12,color:"#34d399",marginTop:8}}>✓ Access granted. Token: {accessResult.token?.slice(0,20)}…</p>}
        </Modal>
      )}

      {/* New Session Modal */}
      {showAdd && (
        <Modal title="New Audit Session" onClose={() => setShowAdd(false)}>
          <Select label="Framework" value={form.framework} onChange={v => setForm(f=>({...f,framework:v}))} options={FRAMEWORKS}/>
          <Input label="Auditor name" value={form.auditor_name} onChange={v => setForm(f=>({...f,auditor_name:v}))} placeholder="Jane Smith"/>
          <Input label="Audit firm" value={form.auditor_org} onChange={v => setForm(f=>({...f,auditor_org:v}))} placeholder="Deloitte"/>
          <Input label="Scheduled date" value={form.scheduled_date} onChange={v => setForm(f=>({...f,scheduled_date:v}))} placeholder="2024-06-01"/>
          <Btn onClick={handleCreate} className="w-full justify-center mt-2">Create Session</Btn>
        </Modal>
      )}
    </div>
  );
}
