"use client";
import { useEffect, useState } from "react";
import { getMonitoringDashboard, getIntegrations, connectIntegration, syncIntegration, getAlerts, resolveAlert, naturalLanguageQuery, getComplianceLogs } from "@/lib/api";
import { PageHeader, Card, Btn, StatusBadge, RiskBadge, Modal, Input, Select, Empty, Spinner, StatCard, SectionLabel, Table, Th, Td, Tr } from "@/components/ui";
import { RefreshCw, Bot, Send, Bell, CheckCircle, PlugZap, Activity, Shield, AlertTriangle, Zap } from "lucide-react";

const PROVIDERS = ["aws","github","google_workspace","vercel","slack"];
const FREQUENCIES = ["realtime","daily","weekly"];

export default function MonitorPage() {
  const [dash, setDash] = useState<any>(null);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnect, setShowConnect] = useState(false);
  const [connectForm, setConnectForm] = useState({ provider:"aws", credentials:"{}", check_frequency:"daily" });
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [syncing, setSyncing] = useState<string|null>(null);

  const load = async () => {
    try {
      const [d, i, a, l] = await Promise.all([getMonitoringDashboard(), getIntegrations(), getAlerts(), getComplianceLogs(7)]);
      setDash(d); setIntegrations(i.integrations || []); setAlerts(a.alerts || []); setLogs(l.logs || []);
    } catch(e){console.error(e);} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleConnect = async () => {
    let creds = {};
    try { creds = JSON.parse(connectForm.credentials); } catch {}
    await connectIntegration({ ...connectForm, credentials: creds });
    setShowConnect(false); load();
  };

  const handleSync = async (id: string) => { setSyncing(id); await syncIntegration(id); setSyncing(null); load(); };
  const handleResolve = async (id: string) => { await resolveAlert(id); load(); };
  const handleAsk = async () => {
    if (!question) return;
    setAsking(true);
    const r = await naturalLanguageQuery(question, { integrations: integrations.length, alerts: alerts.length });
    setAnswer(r.answer || JSON.stringify(r));
    setAsking(false);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Live Monitor"
        sub="Continuous compliance checks, integrations, and AI assistant"
        action={
          <div className="flex" style={{ gap: 8 }}>
            <Btn onClick={load} small variant="secondary"><RefreshCw size={12}/> Refresh</Btn>
            <Btn onClick={() => setShowConnect(true)} small><PlugZap size={12}/> Connect</Btn>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard label="Compliance Score" value={`${dash?.overall_compliance_score ?? 0}%`} color={dash?.overall_compliance_score >= 80 ? "green" : "amber"} icon={<Shield size={12}/>} />
        <StatCard label="Integrations" value={dash?.integrations_connected ?? 0} color="blue" icon={<PlugZap size={12}/>} />
        <StatCard label="Open Alerts" value={dash?.open_alerts ?? 0} color={dash?.open_alerts > 0 ? "red" : "green"} icon={<Bell size={12}/>} />
        <StatCard label="Checks Today" value={dash?.checks_today ?? 0} color="indigo" icon={<Activity size={12}/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Integrations */}
        <Card>
          <SectionLabel><PlugZap size={11}/> Connected integrations</SectionLabel>
          {integrations.length === 0 ? (
            <Empty message="No integrations connected." icon={<PlugZap size={28}/>} />
          ) : (
            <div className="space-y-2 mt-2">
              {integrations.map((i: any) => (
                <div key={i.id} className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: i.status === "connected" ? "#10b981" : "#f59e0b" }} />
                    <div>
                      <p className="font-medium text-white" style={{ fontSize: 12 }}>{i.provider?.toUpperCase()}</p>
                      <p style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{i.check_frequency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={i.status} />
                    <Btn small variant="ghost" onClick={() => handleSync(i.id)}>
                      <RefreshCw size={11} className={syncing === i.id ? "animate-spin" : ""} />
                      {syncing === i.id ? "Syncing…" : "Sync"}
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Alerts */}
        <Card>
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <SectionLabel><Bell size={11}/> Active alerts</SectionLabel>
            {alerts.length > 0 && (
              <span className="rounded-full font-medium" style={{ fontSize: 10, padding: "1px 7px", background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", fontFamily: "var(--font-mono)" }}>
                {alerts.length}
              </span>
            )}
          </div>
          {alerts.length === 0 ? (
            <Empty message="No active alerts 🎉" icon={<CheckCircle size={28}/>} />
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {alerts.map((a: any) => (
                <div key={a.id} className="flex items-start rounded-lg" style={{ gap: 10, padding: "10px 12px" }} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-white" style={{ fontSize: 12 }}>{a.message}</p>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                      {a.provider?.toUpperCase()} · {a.severity}
                    </p>
                  </div>
                  <button onClick={() => handleResolve(a.id)} style={{ color: "#34d399" }} className="shrink-0 hover:opacity-80 transition-opacity mt-0.5">
                    <CheckCircle size={14}/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* AI Assistant */}
      <Card className="mb-4">
        <SectionLabel><Bot size={11}/> AI compliance assistant</SectionLabel>
        <div className="flex gap-2 mt-2">
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAsk()}
            placeholder="Ask anything about your compliance posture…"
            className="flex-1 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 transition-all"
            style={{ fontSize: 13, background: "var(--bg-secondary)", border: "1px solid var(--border-bright)", outline: "none" }}
          />
          <Btn onClick={handleAsk} disabled={asking || !question}>
            {asking ? <RefreshCw size={13} className="animate-spin"/> : <Send size={13}/>}
            {asking ? "Asking…" : "Ask"}
          </Btn>
        </div>
        {answer && (
          <div className="mt-3 rounded-lg p-3.5" style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)" }}>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{answer}</p>
          </div>
        )}
      </Card>

      {/* Compliance logs */}
      {logs.length > 0 && (
        <Card>
          <SectionLabel><Activity size={11}/> Compliance logs (7 days)</SectionLabel>
          <Table>
            <thead>
              <tr>
                <Th>Event</Th>
                <Th>Provider</Th>
                <Th>Result</Th>
                <Th>Date</Th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 8).map((l: any, idx: number) => (
                <Tr key={idx}>
                  <Td><span style={{ fontSize: 12 }}>{l.event || l.message}</span></Td>
                  <Td><span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{l.provider?.toUpperCase() || "—"}</span></Td>
                  <Td><StatusBadge status={l.result || l.status} /></Td>
                  <Td><span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{l.timestamp?.slice(0, 10)}</span></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <Modal open={showConnect} onClose={() => setShowConnect(false)} title="Connect Integration">
        <Select label="Provider" value={connectForm.provider} onChange={(v:string)=>setConnectForm({...connectForm,provider:v})} options={PROVIDERS} />
        <Select label="Check frequency" value={connectForm.check_frequency} onChange={(v:string)=>setConnectForm({...connectForm,check_frequency:v})} options={FREQUENCIES} />
        <div className="mb-4">
          <label style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, display: "block", marginBottom: 6 }}>Credentials (JSON)</label>
          <textarea
            rows={4}
            value={connectForm.credentials}
            onChange={e => setConnectForm({...connectForm, credentials: e.target.value})}
            className="w-full rounded-lg px-3 py-2.5 text-white resize-none"
            style={{ fontSize: 12, fontFamily: "var(--font-mono)", background: "var(--bg-secondary)", border: "1px solid var(--border-bright)", outline: "none" }}
          />
        </div>
        <Btn onClick={handleConnect}>Connect Integration</Btn>
      </Modal>
    </div>
  );
}
