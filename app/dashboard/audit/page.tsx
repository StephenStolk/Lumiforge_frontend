"use client";
import { useEffect, useState } from "react";
import { getAuditSessions, createAuditSession, generateAuditPackage, grantAuditorAccess, getAuditTimeline } from "@/lib/api";
import { PageHeader, Card, Btn, StatusBadge, Badge, Modal, Input, Select, Empty, Spinner, SectionLabel, Table, Th, Td, Tr } from "@/components/ui";
import { Plus, Package, UserCheck, Clock, ExternalLink, BookOpen } from "lucide-react";

const FRAMEWORKS = ["SOC2","ISO27001","GDPR","HIPAA","PCI-DSS"];

export default function AuditPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showAccess, setShowAccess] = useState(false);
  const [generatingFor, setGeneratingFor] = useState<string|null>(null);
  const [generatedPkg, setGeneratedPkg] = useState<any>(null);
  const [form, setForm] = useState({ framework:"SOC2", auditor_name:"", auditor_org:"", scheduled_date:"", scope:[] as string[] });
  const [accessForm, setAccessForm] = useState({ auditor_email:"", access_level:"read_only", expiry_days:30 });
  const [accessResult, setAccessResult] = useState<any>(null);

  const load = async () => {
    try {
      const [s, t] = await Promise.all([getAuditSessions(), getAuditTimeline()]);
      setSessions(s.sessions || []); setTimeline(t.timeline || []);
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => { await createAuditSession(form); setShowAdd(false); load(); };
  const handleGenPackage = async (id: string) => {
    setGeneratingFor(id);
    const pkg = await generateAuditPackage(id);
    setGeneratedPkg(pkg); setGeneratingFor(null);
  };
  const handleGrantAccess = async () => {
    const r = await grantAuditorAccess(accessForm);
    setAccessResult(r); setShowAccess(false);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Audit Hub"
        sub="Prepare, manage, and share compliance audit packages"
        action={
          <div className="flex" style={{ gap: 8 }}>
            <Btn variant="secondary" small onClick={() => setShowAccess(true)}>
              <UserCheck size={12}/> Grant Access
            </Btn>
            <Btn small onClick={() => setShowAdd(true)}>
              <Plus size={12}/> New Audit
            </Btn>
          </div>
        }
      />

      {/* Timeline */}
      {timeline.length > 0 && (
        <Card className="mb-5">
          <SectionLabel><Clock size={11}/> Audit timeline</SectionLabel>
          <div className="relative pl-5 mt-3" style={{ borderLeft: "1px solid var(--border)" }}>
            <div className="space-y-4">
              {timeline.map((t: any, i: number) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full" style={{ background: "var(--accent-blue)", border: "2px solid var(--bg-card)" }} />
                  <p className="font-medium text-white" style={{ fontSize: 12 }}>{t.event || t.title}</p>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                    {t.date?.slice(0,10)} {t.framework && `· ${t.framework}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Audit sessions */}
      {sessions.length === 0 ? (
        <Card><Empty message="No audit sessions yet. Create your first audit." icon={<BookOpen size={32}/>} /></Card>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Audit</Th>
              <Th>Framework</Th>
              <Th>Status</Th>
              <Th>Scheduled</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s: any) => (
              <Tr key={s.id}>
                <Td>
                  <p className="font-medium text-white" style={{ fontSize: 13 }}>{s.auditor_name || "—"}</p>
                  <p style={{ fontSize: 10, color: "var(--text-muted)" }}>{s.auditor_org}</p>
                </Td>
                <Td><Badge label={s.framework} color="blue" /></Td>
                <Td><StatusBadge status={s.status} /></Td>
                <Td><span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{s.scheduled_date || "TBD"}</span></Td>
                <Td>
                  <Btn
                    small
                    variant="secondary"
                    onClick={() => handleGenPackage(s.id)}
                    disabled={generatingFor === s.id}
                  >
                    <Package size={11}/>
                    {generatingFor === s.id ? "Generating…" : "Package"}
                  </Btn>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Generated package result */}
      {generatedPkg && (
        <Card className="mt-4">
          <SectionLabel><Package size={11}/> Generated audit package</SectionLabel>
          <div className="rounded-lg p-3 mt-2" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-secondary)" }}>
            <pre className="whitespace-pre-wrap overflow-x-auto">{JSON.stringify(generatedPkg, null, 2)}</pre>
          </div>
        </Card>
      )}

      {/* Access granted result */}
      {accessResult && (
        <Card className="mt-4">
          <SectionLabel><UserCheck size={11}/> Auditor access granted</SectionLabel>
          <div className="rounded-lg p-3 mt-2" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <p style={{ fontSize: 12, color: "#34d399" }}>Access link: <span style={{ fontFamily: "var(--font-mono)" }}>{accessResult.access_link || "Generated"}</span></p>
            {accessResult.expiry && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Expires: {accessResult.expiry}</p>}
          </div>
        </Card>
      )}

      {/* New audit modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Audit Session">
        <Select label="Framework" value={form.framework} onChange={(v:string)=>setForm({...form,framework:v})} options={FRAMEWORKS} />
        <Input label="Auditor name" value={form.auditor_name} onChange={(v:string)=>setForm({...form,auditor_name:v})} placeholder="Jane Smith" />
        <Input label="Auditor organization" value={form.auditor_org} onChange={(v:string)=>setForm({...form,auditor_org:v})} placeholder="KPMG" />
        <Input label="Scheduled date" value={form.scheduled_date} onChange={(v:string)=>setForm({...form,scheduled_date:v})} type="date" />
        <Btn onClick={handleCreate}>Create Audit Session</Btn>
      </Modal>

      {/* Grant access modal */}
      <Modal open={showAccess} onClose={() => setShowAccess(false)} title="Grant Auditor Access">
        <Input label="Auditor email" value={accessForm.auditor_email} onChange={(v:string)=>setAccessForm({...accessForm,auditor_email:v})} placeholder="auditor@firm.com" type="email" required />
        <Select label="Access level" value={accessForm.access_level} onChange={(v:string)=>setAccessForm({...accessForm,access_level:v})} options={["read_only","read_write","admin"]} />
        <Input label="Expiry (days)" value={accessForm.expiry_days} onChange={(v:string)=>setAccessForm({...accessForm,expiry_days:Number(v)})} type="number" />
        <Btn onClick={handleGrantAccess} disabled={!accessForm.auditor_email}>Grant Access</Btn>
      </Modal>
    </div>
  );
}
