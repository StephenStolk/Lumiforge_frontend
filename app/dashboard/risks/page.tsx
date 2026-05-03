"use client";
import { useEffect, useState } from "react";
import { getRisks, createRisk, updateRisk } from "@/lib/api";
import { PageHeader, Card, Btn, RiskBadge, Modal, Input, Select, Textarea, Empty, Spinner, Table, Th, Td, Tr, ProgressBar, StatCard } from "@/components/ui";
import { Plus, AlertTriangle } from "lucide-react";

const CATS = ["Operational","Technical","Legal","Vendor","Financial","Reputational"];
const STATUSES = ["open","mitigating","mitigated","accepted"];

export default function RisksPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title:"", description:"", category:CATS[0], likelihood:3, impact:3, owner:"", frameworks:[] as string[], linked_controls:[] as string[] });

  const load = async () => { setData(await getRisks()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    await createRisk(form); setShowAdd(false); load();
    setForm({ title:"", description:"", category:CATS[0], likelihood:3, impact:3, owner:"", frameworks:[], linked_controls:[] });
  };

  const handleUpdate = async (id: string, status: string) => { await updateRisk(id, { status }); load(); };

  if (loading) return <Spinner />;
  const risks = data?.risks || [];

  const severityOrder = ["CRITICAL","HIGH","MEDIUM","LOW"];

  return (
    <div>
      <PageHeader
        title="Risk Register"
        sub="Identify, score, and track organisational risks"
        action={<Btn onClick={() => setShowAdd(true)} small><Plus size={12}/> Add Risk</Btn>}
      />

      {/* Severity summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 12, marginBottom: 20 }}>
        {severityOrder.map(l => {
          const colorMap: Record<string,string> = { CRITICAL:"red", HIGH:"orange", MEDIUM:"amber", LOW:"green" };
          return (
            <StatCard
              key={l}
              label={l}
              value={data?.by_severity?.[l] ?? 0}
              color={colorMap[l]}
              icon={<AlertTriangle size={12} />}
            />
          );
        })}
      </div>

      {risks.length === 0 ? (
        <Card><Empty message="No risks logged. Build your risk register." icon={<AlertTriangle size={32} />} /></Card>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Risk</Th>
              <Th>Category</Th>
              <Th>Score</Th>
              <Th>Severity</Th>
              <Th>Status</Th>
              <Th>Owner</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {risks.map((r: any) => (
              <Tr key={r.id}>
                <Td>
                  <div>
                    <p className="font-medium text-white">{r.title}</p>
                    {r.description && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }} className="line-clamp-1">{r.description}</p>}
                  </div>
                </Td>
                <Td><span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{r.category}</span></Td>
                <Td>
                  <span className="font-bold" style={{ fontFamily: "var(--font-display)", color: "#60a5fa" }}>
                    {r.risk_score ?? (r.likelihood ?? 1) * (r.impact ?? 1)}
                  </span>
                </Td>
                <Td><RiskBadge level={r.severity || "medium"} /></Td>
                <Td>
                  <select
                    value={r.status}
                    onChange={e => handleUpdate(r.id, e.target.value)}
                    className="rounded-lg px-2 py-1 text-white transition-all"
                    style={{ fontSize: 11, background: "var(--bg-secondary)", border: "1px solid var(--border-bright)", fontFamily: "var(--font-mono)", cursor: "pointer" }}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Td>
                <Td><span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{r.owner || "—"}</span></Td>
                <Td>
                  {r.status === "open" && (
                    <Btn small variant="secondary" onClick={() => handleUpdate(r.id, "mitigating")}>Mitigate</Btn>
                  )}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Risk">
        <Input label="Risk title" value={form.title} onChange={(v:string)=>setForm({...form,title:v})} placeholder="Unauthorized data access" required />
        <Textarea label="Description" value={form.description} onChange={(v:string)=>setForm({...form,description:v})} placeholder="Describe the risk..." />
        <Select label="Category" value={form.category} onChange={(v:string)=>setForm({...form,category:v})} options={CATS} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Likelihood (1-5)" value={form.likelihood} onChange={(v:string)=>setForm({...form,likelihood:Number(v)})} type="number" />
          <Input label="Impact (1-5)" value={form.impact} onChange={(v:string)=>setForm({...form,impact:Number(v)})} type="number" />
        </div>
        <Input label="Owner" value={form.owner} onChange={(v:string)=>setForm({...form,owner:v})} placeholder="Risk owner name" />
        <Btn onClick={handleCreate} disabled={!form.title}>Add Risk</Btn>
      </Modal>
    </div>
  );
}
