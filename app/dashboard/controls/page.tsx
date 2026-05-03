"use client";
import { useEffect, useState } from "react";
import { getControls, createControl, updateControlStatus, getFrameworks, addEvidence } from "@/lib/api";
import { PageHeader, Card, Btn, StatusBadge, Badge, Modal, Input, Select, Textarea, Empty, Spinner, ProgressBar, StatCard, Table, Th, Td, Tr, SectionLabel } from "@/components/ui";
import { Plus, Shield, ChevronDown, ChevronRight, Paperclip } from "lucide-react";

const STATUSES = ["not_implemented","partial","implemented","failed"];
const CATEGORIES = ["Access Control","Data Protection","Incident Response","Vendor Management","Employee Training","Audit Logging","Encryption","Network Security","Physical Security","Business Continuity","Change Management","Risk Mitigation"];

export default function ControlsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fwData, setFwData] = useState<any>({});
  const [activeFw, setActiveFw] = useState("SOC2");
  const [showAdd, setShowAdd] = useState(false);
  const [showEvidence, setShowEvidence] = useState<string|null>(null);
  const [form, setForm] = useState({ name:"", description:"", framework:"SOC2", control_id:"", category:CATEGORIES[0], status:"not_implemented", owner:"", linked_risks:[] as string[] });
  const [evForm, setEvForm] = useState({ control_id:"", title:"", description:"", evidence_type:"screenshot" });

  const load = async () => {
    const [d, fw] = await Promise.all([getControls(), getFrameworks()]);
    setData(d); setFwData(fw.frameworks || {}); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    await createControl(form); setShowAdd(false); load();
    setForm({ name:"", description:"", framework:"SOC2", control_id:"", category:CATEGORIES[0], status:"not_implemented", owner:"", linked_risks:[] });
  };

  const handleStatus = async (id: string, status: string) => { await updateControlStatus(id, status); load(); };
  const handleAddEvidence = async () => {
    await addEvidence(showEvidence!, evForm); setShowEvidence(null);
    setEvForm({ control_id:"", title:"", description:"", evidence_type:"screenshot" });
    load();
  };

  if (loading) return <Spinner />;
  const rate = data?.compliance_rate ?? 0;

  return (
    <div>
      <PageHeader
        title="Controls"
        sub="Map, track, and evidence compliance controls across frameworks"
        action={<Btn onClick={() => setShowAdd(true)} small><Plus size={12}/> Add Control</Btn>}
      />

      {/* Compliance rate */}
      <Card style={{ marginBottom: 20 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <SectionLabel>Overall compliance rate</SectionLabel>
          <span className="font-bold" style={{ fontFamily: "var(--font-display)", fontSize: 20, color: rate >= 80 ? "#34d399" : rate >= 50 ? "#fbbf24" : "#f87171" }}>
            {rate}%
          </span>
        </div>
        <ProgressBar value={rate} color={rate >= 80 ? "green" : rate >= 50 ? "amber" : "red"} />
        <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 16, marginTop: 16 }}>
          {data?.by_status && Object.entries(data.by_status).map(([k, v]: any) => (
            <div key={k} className="text-center">
              <p className="font-bold text-white" style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>{v}</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "capitalize", marginTop: 2 }}>{k.replace(/_/g," ")}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Framework tabs */}
      {Object.keys(fwData).length > 0 && (
        <Card style={{ marginBottom: 20 }}>
          <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 16 }}>
            {Object.keys(fwData).map(fw => (
              <button
                key={fw}
                onClick={() => setActiveFw(fw)}
                className="rounded-lg px-3 py-1.5 transition-all font-medium"
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  background: activeFw === fw ? "rgba(37,99,235,0.15)" : "transparent",
                  color: activeFw === fw ? "#60a5fa" : "var(--text-muted)",
                  border: `1px solid ${activeFw === fw ? "rgba(37,99,235,0.3)" : "var(--border)"}`,
                }}
              >
                {fw}
              </button>
            ))}
          </div>
          {fwData[activeFw] && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {fwData[activeFw].controls?.slice(0, 6).map((c: any) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                  <div>
                    <p className="font-medium text-white" style={{ fontSize: 12 }}>{c.name}</p>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{c.control_id}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Controls table */}
      {data?.controls?.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Control</Th>
              <Th>Framework</Th>
              <Th>Category</Th>
              <Th>Status</Th>
              <Th>Owner</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.controls.map((c: any) => (
              <Tr key={c.id}>
                <Td>
                  <p className="font-medium text-white" style={{ fontSize: 13 }}>{c.name}</p>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>{c.control_id}</p>
                </Td>
                <Td><Badge label={c.framework || "—"} color="blue" /></Td>
                <Td><span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{c.category || "—"}</span></Td>
                <Td>
                  <select
                    value={c.status}
                    onChange={e => handleStatus(c.id, e.target.value)}
                    className="rounded-lg px-2 py-1 text-white"
                    style={{ fontSize: 11, background: "var(--bg-secondary)", border: "1px solid var(--border-bright)", fontFamily: "var(--font-mono)", cursor: "pointer" }}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Td>
                <Td><span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{c.owner || "—"}</span></Td>
                <Td>
                  <Btn small variant="secondary" onClick={() => { setShowEvidence(c.id); setEvForm(f => ({...f, control_id: c.id})); }}>
                    <Paperclip size={11}/> Evidence
                  </Btn>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Add control modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Control">
        <Input label="Control name" value={form.name} onChange={(v:string)=>setForm({...form,name:v})} placeholder="Multi-factor Authentication" required />
        <Textarea label="Description" value={form.description} onChange={(v:string)=>setForm({...form,description:v})} placeholder="Describe the control..." />
        <div className="grid grid-cols-2" style={{ gap: 12 }}>
          <Select label="Framework" value={form.framework} onChange={(v:string)=>setForm({...form,framework:v})} options={["SOC2","GDPR","ISO27001","HIPAA","PCI-DSS"]} />
          <Input label="Control ID" value={form.control_id} onChange={(v:string)=>setForm({...form,control_id:v})} placeholder="CC6.1" />
        </div>
        <Select label="Category" value={form.category} onChange={(v:string)=>setForm({...form,category:v})} options={CATEGORIES} />
        <Select label="Status" value={form.status} onChange={(v:string)=>setForm({...form,status:v})} options={STATUSES} />
        <Input label="Owner" value={form.owner} onChange={(v:string)=>setForm({...form,owner:v})} placeholder="Security team" />
        <Btn onClick={handleCreate} disabled={!form.name}>Add Control</Btn>
      </Modal>

      {/* Evidence modal */}
      <Modal open={!!showEvidence} onClose={() => setShowEvidence(null)} title="Add Evidence">
        <Input label="Title" value={evForm.title} onChange={(v:string)=>setEvForm({...evForm,title:v})} placeholder="Screenshot of MFA policy" required />
        <Textarea label="Description" value={evForm.description} onChange={(v:string)=>setEvForm({...evForm,description:v})} placeholder="Describe the evidence..." />
        <Select label="Type" value={evForm.evidence_type} onChange={(v:string)=>setEvForm({...evForm,evidence_type:v})} options={["screenshot","document","log","audit_report","attestation"]} />
        <Btn onClick={handleAddEvidence} disabled={!evForm.title}>Add Evidence</Btn>
      </Modal>
    </div>
  );
}
