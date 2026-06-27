"use client";
import { useEffect, useState } from "react";
import { getPolicies, createPolicy, updatePolicy, aiPolicyReview, aiGeneratePolicy } from "@/lib/api";
import { PageHeader, Card, Btn, StatusBadge, Badge, Modal, Input, Textarea, Select, Empty, Spinner, StatCard, SectionLabel } from "@/components/ui";
import { Plus, Send, FileText, BookOpen, Bot, Wand2, Loader, CheckCircle, Clock, AlertTriangle } from "lucide-react";

const FRAMEWORKS = ["SOC2","GDPR","ISO27001","HIPAA","PCI-DSS"];
const POLICY_TYPES = ["Access Control","Data Classification","Incident Response","Business Continuity","Acceptable Use","Password","Encryption","Vendor Management","Change Management","Audit Logging"];
const STATUSES = ["draft","under_review","approved","published","archived"];
const STATUS_COLOR: Record<string,string> = { draft:"gray", under_review:"amber", approved:"blue", published:"green", archived:"gray" };

export default function PoliciesPage() {
  const [policies, setPolicies]         = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showAdd, setShowAdd]           = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [selected, setSelected]         = useState<any>(null);
  const [aiReview, setAiReview]         = useState<any>(null);
  const [aiLoading, setAiLoading]       = useState<string|null>(null);
  const [genLoading, setGenLoading]     = useState(false);
  const [genResult, setGenResult]       = useState<any>(null);
  const [form, setForm] = useState({ title:"", content:"", version:"1.0", category:POLICY_TYPES[0], frameworks:[] as string[], status:"draft" });
  const [genForm, setGenForm] = useState({ policy_type:POLICY_TYPES[0], frameworks:["SOC2"] });

  const load = async () => { const d = await getPolicies(); setPolicies(Array.isArray(d) ? d : d.policies || []); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => { await createPolicy(form); setShowAdd(false); load(); setForm({ title:"", content:"", version:"1.0", category:POLICY_TYPES[0], frameworks:[], status:"draft" }); };
  const handlePublish = async (id: string) => { await updatePolicy(id, { status:"published" }); load(); };
  const toggleFw = (fw: string) => setForm(f => ({ ...f, frameworks: f.frameworks.includes(fw) ? f.frameworks.filter(x=>x!==fw) : [...f.frameworks, fw] }));
  const toggleGenFw = (fw: string) => setGenForm(f => ({ ...f, frameworks: f.frameworks.includes(fw) ? f.frameworks.filter(x=>x!==fw) : [...f.frameworks, fw] }));

  const handleAIReview = async (policy: any) => {
    setAiLoading(policy.id); setSelected(policy); setAiReview(null);
    try { setAiReview(await aiPolicyReview(policy.id)); }
    catch(e:any) { setAiReview({ error: e?.response?.data?.detail || "Review failed" }); }
    setAiLoading(null);
  };

  const handleGenerate = async () => {
    setGenLoading(true); setGenResult(null);
    try { setGenResult(await aiGeneratePolicy(genForm)); }
    catch(e:any) { setGenResult({ error: "Generation failed" }); }
    setGenLoading(false);
  };

  if (loading) return <Spinner />;
  const published = policies.filter(p => p.status === "published");
  const drafts = policies.filter(p => p.status === "draft");
  const review = policies.filter(p => p.status === "under_review");

  return (
    <div>
      <PageHeader title="Policies" sub="Manage, review, and publish compliance policies with AI assistance"
        action={
          <div className="flex gap-2">
            <Btn small variant="secondary" onClick={() => setShowGenerate(true)}><Wand2 size={12}/> AI Generate</Btn>
            <Btn small onClick={() => setShowAdd(true)}><Plus size={12}/> New Policy</Btn>
          </div>
        }/>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard label="Published" value={published.length} color="green" icon={<CheckCircle size={13}/>}/>
        <StatCard label="In Review" value={review.length} color="amber" icon={<Clock size={13}/>}/>
        <StatCard label="Drafts" value={drafts.length} color="gray" icon={<FileText size={13}/>}/>
      </div>

      {policies.length === 0 ? (
        <Card><Empty message="No policies yet. Create one manually or use AI Generate." icon={<BookOpen size={32}/>}/></Card>
      ) : (
        <div className="space-y-3">
          {policies.map((p:any) => (
            <Card key={p.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-white" style={{fontSize:14}}>{p.title || p.name}</p>
                    <StatusBadge status={p.status}/>
                    {p.version && <span style={{fontSize:10,color:"var(--text-muted)",fontFamily:"var(--font-mono)"}}>v{p.version}</span>}
                  </div>
                  <div className="flex gap-1.5 flex-wrap mt-1">
                    {(p.frameworks||[]).map((fw:string) => <Badge key={fw} label={fw} color="blue"/>)}
                  </div>
                  {p.content && (
                    <p style={{fontSize:12,color:"var(--text-muted)",marginTop:6,lineHeight:1.5}} className="line-clamp-2">
                      {p.content.slice(0,180)}…
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap">
                  <Btn small variant="ghost" onClick={() => handleAIReview(p)} disabled={!!aiLoading}>
                    {aiLoading === p.id ? <Loader size={11} className="animate-spin"/> : <Bot size={11}/>}
                    AI Review
                  </Btn>
                  {p.status !== "published" && (
                    <Btn small onClick={() => handlePublish(p.id)}><Send size={11}/> Publish</Btn>
                  )}
                </div>
              </div>

              {/* AI Review inline */}
              {selected?.id === p.id && aiReview && (
                <div className="mt-4 rounded-lg p-4" style={{ background:"var(--bg-secondary)", border:"1px solid var(--border-bright)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <SectionLabel><Bot size={11}/> AI Review</SectionLabel>
                    <Btn small variant="ghost" onClick={() => { setAiReview(null); setSelected(null); }}>✕</Btn>
                  </div>
                  {aiReview.error ? (
                    <p style={{color:"#f87171",fontSize:12}}>{aiReview.error}</p>
                  ) : (
                    <pre className="text-xs whitespace-pre-wrap overflow-auto" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-mono)", lineHeight:1.7, maxHeight:300 }}>
                      {JSON.stringify(aiReview, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* AI Generate Modal */}
      {showGenerate && (
        <Modal title="AI Policy Generator" onClose={() => { setShowGenerate(false); setGenResult(null); }}>
          <Select label="Policy type" value={genForm.policy_type} onChange={v => setGenForm(f=>({...f,policy_type:v}))} options={POLICY_TYPES}/>
          <div className="mb-4">
            <label style={{fontSize:12,color:"var(--text-secondary)",fontWeight:500,display:"block",marginBottom:8}}>Frameworks</label>
            <div className="flex gap-2 flex-wrap">
              {FRAMEWORKS.map(fw => (
                <button key={fw} onClick={() => toggleGenFw(fw)}
                  className="rounded-full px-3 py-1 transition-all"
                  style={{ fontSize:11, border:"1px solid", borderColor: genForm.frameworks.includes(fw) ? "#3b82f6" : "var(--border-bright)", background: genForm.frameworks.includes(fw) ? "rgba(37,99,235,0.15)" : "transparent", color: genForm.frameworks.includes(fw) ? "#60a5fa" : "var(--text-muted)" }}>
                  {fw}
                </button>
              ))}
            </div>
          </div>
          <Btn onClick={handleGenerate} disabled={genLoading} className="w-full justify-center">
            {genLoading ? <><Loader size={13} className="animate-spin"/> Generating…</> : <><Wand2 size={13}/> Generate Policy</>}
          </Btn>
          {genResult && !genResult.error && (
            <div className="mt-4 rounded-lg p-4 overflow-auto" style={{ background:"var(--bg-secondary)", border:"1px solid var(--border-bright)", maxHeight:400 }}>
              <pre className="text-xs whitespace-pre-wrap" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-mono)", lineHeight:1.7 }}>
                {JSON.stringify(genResult, null, 2)}
              </pre>
            </div>
          )}
        </Modal>
      )}

      {/* Add Policy Modal */}
      {showAdd && (
        <Modal title="New Policy" onClose={() => setShowAdd(false)}>
          <Input label="Title" value={form.title} onChange={v => setForm(f=>({...f,title:v}))} placeholder="Access Control Policy"/>
          <Select label="Category" value={form.category} onChange={v => setForm(f=>({...f,category:v}))} options={POLICY_TYPES}/>
          <Input label="Version" value={form.version} onChange={v => setForm(f=>({...f,version:v}))} placeholder="1.0"/>
          <Textarea label="Policy content" value={form.content} onChange={v => setForm(f=>({...f,content:v}))} rows={5} placeholder="Enter policy content…"/>
          <div className="mb-4">
            <label style={{fontSize:12,color:"var(--text-secondary)",fontWeight:500,display:"block",marginBottom:8}}>Frameworks</label>
            <div className="flex gap-2 flex-wrap">
              {FRAMEWORKS.map(fw => (
                <button key={fw} onClick={() => toggleFw(fw)}
                  className="rounded-full px-3 py-1 transition-all"
                  style={{ fontSize:11, border:"1px solid", borderColor: form.frameworks.includes(fw) ? "#3b82f6" : "var(--border-bright)", background: form.frameworks.includes(fw) ? "rgba(37,99,235,0.15)" : "transparent", color: form.frameworks.includes(fw) ? "#60a5fa" : "var(--text-muted)" }}>
                  {fw}
                </button>
              ))}
            </div>
          </div>
          <Btn onClick={handleCreate} className="w-full justify-center">Create Policy</Btn>
        </Modal>
      )}
    </div>
  );
}
