"use client";
import { useEffect, useState } from "react";
import { getIncidents, createIncident, updateIncident } from "@/lib/api";
import { PageHeader, Card, Btn, RiskBadge, StatusBadge, Modal, Input, Select, Textarea, Empty, Spinner, StatCard, Table, Th, Td, Tr } from "@/components/ui";
import { Plus, AlertOctagon, CheckCircle} from "lucide-react";

const SEVERITIES = ["low","medium","high","critical"];
const STATUSES = ["open","investigating","contained","resolved"];
const SEVERITY_COLOR: Record<string,string> = { low:"green", medium:"amber", high:"orange", critical:"red" };

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ title:"", description:"", severity:"medium", affected_systems:[] as string[], affected_input:"", reporter:"" });

  const load = async () => { const d = await getIncidents(); setIncidents(Array.isArray(d) ? d : d.incidents || []); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    const systems = form.affected_input.split(",").map(s=>s.trim()).filter(Boolean);
    await createIncident({ ...form, affected_systems: systems });
    setShowAdd(false); load();
    setForm({ title:"", description:"", severity:"medium", affected_systems:[], affected_input:"", reporter:"" });
  };

  const handleUpdate = async (id: string, status: string) => {
    await updateIncident(id, { status });
    if (selected?.id === id) setSelected((s: any) => ({...s, status}));
    load();
  };

  if (loading) return <Spinner />;
  const open = incidents.filter(i => i.status === "open").length;
  const critical = incidents.filter(i => i.severity === "critical").length;

  return (
    <div>
      <PageHeader
        title="Incidents"
        sub="Log, investigate, and resolve security incidents"
        action={<Btn onClick={() => setShowAdd(true)} small><Plus size={12}/> Report Incident</Btn>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 12, marginBottom: 20 }}>
        {SEVERITIES.map(s => (
          <StatCard
            key={s}
            label={s.charAt(0).toUpperCase() + s.slice(1)}
            value={incidents.filter(i => i.severity === s).length}
            color={SEVERITY_COLOR[s]}
            icon={<AlertOctagon size={12}/>}
          />
        ))}
      </div>

      {incidents.length === 0 ? (
        <Card><Empty message="No incidents reported. Hopefully it stays that way." icon={<CheckCircle size={32}/>} /></Card>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Incident</Th>
              <Th>Severity</Th>
              <Th>Status</Th>
              <Th>Reporter</Th>
              <Th>Date</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((inc: any) => (
              <Tr key={inc.id} onClick={() => setSelected(inc)}>
                <Td>
                  <p className="font-medium text-white">{inc.title}</p>
                  {inc.affected_systems?.length > 0 && (
                    <p style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                      {inc.affected_systems.slice(0, 2).join(", ")}
                      {inc.affected_systems.length > 2 && ` +${inc.affected_systems.length - 2}`}
                    </p>
                  )}
                </Td>
                <Td><RiskBadge level={inc.severity} /></Td>
                <Td><StatusBadge status={inc.status} /></Td>
                <Td><span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{inc.reporter || "—"}</span></Td>
                <Td><span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{inc.created_at?.slice(0,10)}</span></Td>
                <Td onClick={e => e.stopPropagation()}>
                  {inc.status !== "resolved" && (
                    <Btn small variant="success" onClick={() => handleUpdate(inc.id, "resolved")}>
                      <CheckCircle size={11}/> Resolve
                    </Btn>
                  )}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title || ""}>
        {selected && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <RiskBadge level={selected.severity} />
              <StatusBadge status={selected.status} />
            </div>
            {selected.description && (
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{selected.description}</p>
            )}
            {selected.affected_systems?.length > 0 && (
              <div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Affected Systems</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.affected_systems.map((s: string) => (
                    <span key={s} className="rounded-lg px-2 py-1" style={{ fontSize: 11, background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
            {selected.status !== "resolved" && (
              <div className="flex gap-2 flex-wrap pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                {STATUSES.filter(s => s !== selected.status).map(s => (
                  <Btn key={s} small variant="secondary" onClick={() => handleUpdate(selected.id, s)}>
                    Mark as {s}
                  </Btn>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Report Incident">
        <Input label="Title" value={form.title} onChange={(v:string)=>setForm({...form,title:v})} placeholder="Brief incident description" required />
        <Textarea label="Description" value={form.description} onChange={(v:string)=>setForm({...form,description:v})} placeholder="What happened? What systems are affected?" />
        <Select label="Severity" value={form.severity} onChange={(v:string)=>setForm({...form,severity:v})} options={SEVERITIES} />
        <Input label="Affected systems (comma-separated)" value={form.affected_input} onChange={(v:string)=>setForm({...form,affected_input:v})} placeholder="api-server, database, auth-service" />
        <Input label="Reporter" value={form.reporter} onChange={(v:string)=>setForm({...form,reporter:v})} placeholder="Your name" />
        <Btn onClick={handleCreate} disabled={!form.title}>Report Incident</Btn>
      </Modal>
    </div>
  );
}
