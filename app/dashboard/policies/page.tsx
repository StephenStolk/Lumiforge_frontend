"use client";
import { useEffect, useState } from "react";
import { getPolicies, createPolicy, updatePolicy } from "@/lib/api";
import { PageHeader, Card, Btn, StatusBadge, Badge, Modal, Input, Textarea, Select, Empty, Spinner, StatCard, SectionLabel } from "@/components/ui";
import { Plus, Send, FileText, BookOpen } from "lucide-react";

const FRAMEWORKS = ["SOC2","GDPR","ISO27001","HIPAA","PCI-DSS"];
const STATUSES = ["draft","under_review","approved","published","archived"];

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ name:"", content:"", version:"1.0", owner:"", review_date:"", frameworks:[] as string[], status:"draft" });

  const load = async () => { const d = await getPolicies(); setPolicies(Array.isArray(d) ? d : d.policies || []); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    await createPolicy(form); setShowAdd(false); load();
    setForm({ name:"", content:"", version:"1.0", owner:"", review_date:"", frameworks:[], status:"draft" });
  };

  const handlePublish = async (id: string) => { await updatePolicy(id, { status:"published" }); load(); };

  const toggleFw = (fw: string) => setForm(f => ({
    ...f, frameworks: f.frameworks.includes(fw) ? f.frameworks.filter(x => x !== fw) : [...f.frameworks, fw]
  }));

  if (loading) return <Spinner />;
  const published = policies.filter(p => p.status === "published");
  const drafts = policies.filter(p => p.status === "draft");

  const STATUS_COLOR: Record<string,string> = { draft:"gray", under_review:"amber", approved:"blue", published:"green", archived:"gray" };

  return (
    <div>
      <PageHeader
        title="Policies"
        sub="Manage policy lifecycle, versioning, and acknowledgments"
        action={<Btn onClick={() => setShowAdd(true)} small><Plus size={12}/> New Policy</Btn>}
      />

      <div className="grid grid-cols-3" style={{ gap: 12, marginBottom: 20 }}>
        <StatCard label="Total" value={policies.length} color="blue" icon={<FileText size={13}/>} />
        <StatCard label="Published" value={published.length} color="green" icon={<BookOpen size={13}/>} />
        <StatCard label="Drafts" value={drafts.length} color="amber" icon={<FileText size={13}/>} />
      </div>

      {policies.length === 0 ? (
        <Card><Empty message="No policies yet. Create your first policy." icon={<FileText size={32}/>} /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {policies.map((p: any) => (
            <div
              key={p.id}
              className="rounded-xl p-4 transition-all cursor-pointer hover:border-opacity-60"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              onClick={() => setSelected(p)}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="font-semibold text-white" style={{ fontSize: 14, fontFamily: "var(--font-display)" }}>{p.name}</p>
                <StatusBadge status={p.status} />
              </div>
              <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>v{p.version}</span>
                {p.owner && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Owner: {p.owner}</span>}
                {p.review_date && <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Review: {p.review_date}</span>}
              </div>
              {p.frameworks?.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {p.frameworks.map((fw: string) => <Badge key={fw} label={fw} color="blue" />)}
                </div>
              )}
              {p.status !== "published" && (
                <Btn small variant="primary" onClick={e => { e.stopPropagation(); handlePublish(p.id); }}>
                  <Send size={11}/> Publish
                </Btn>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name || ""}>
        {selected && (
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <StatusBadge status={selected.status} />
              {selected.frameworks?.map((fw: string) => <Badge key={fw} label={fw} color="blue" />)}
            </div>
            {selected.content && (
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{selected.content}</p>
            )}
            <div className="grid grid-cols-2 gap-3" style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
              <div><SectionLabel>Version</SectionLabel><p style={{ fontSize: 13 }}>v{selected.version}</p></div>
              {selected.owner && <div><SectionLabel>Owner</SectionLabel><p style={{ fontSize: 13 }}>{selected.owner}</p></div>}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Policy">
        <Input label="Policy name" value={form.name} onChange={(v:string)=>setForm({...form,name:v})} placeholder="Password Policy" required />
        <Textarea label="Content" value={form.content} onChange={(v:string)=>setForm({...form,content:v})} placeholder="Policy content..." rows={4} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Version" value={form.version} onChange={(v:string)=>setForm({...form,version:v})} />
          <Input label="Owner" value={form.owner} onChange={(v:string)=>setForm({...form,owner:v})} placeholder="CISO" />
        </div>
        <Input label="Review date" value={form.review_date} onChange={(v:string)=>setForm({...form,review_date:v})} type="date" />
        <div className="mb-4">
          <label style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, display: "block", marginBottom: 8 }}>Frameworks</label>
          <div className="flex gap-2 flex-wrap">
            {FRAMEWORKS.map(fw => (
              <button
                key={fw}
                onClick={() => toggleFw(fw)}
                className="rounded-lg px-2.5 py-1 transition-all"
                style={{
                  fontSize: 11, fontFamily: "var(--font-mono)",
                  background: form.frameworks.includes(fw) ? "rgba(37,99,235,0.15)" : "transparent",
                  color: form.frameworks.includes(fw) ? "#60a5fa" : "var(--text-muted)",
                  border: `1px solid ${form.frameworks.includes(fw) ? "rgba(37,99,235,0.3)" : "var(--border-bright)"}`,
                }}
              >
                {fw}
              </button>
            ))}
          </div>
        </div>
        <Btn onClick={handleCreate} disabled={!form.name}>Create Policy</Btn>
      </Modal>
    </div>
  );
}
