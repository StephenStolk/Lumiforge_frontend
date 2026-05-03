"use client";
import { useEffect, useState } from "react";
import { getMonitoringDashboard, getAlerts, resolveAlert, getControls, getRisks, getIncidents } from "@/lib/api";
import { StatCard, Card, Btn, RiskBadge, StatusBadge, Spinner, Empty, ProgressBar, Table, Th, Td, Tr, SectionLabel } from "@/components/ui";
import { RefreshCw, Bell, CheckCircle, Shield, AlertTriangle, Activity, TrendingUp, Zap } from "lucide-react";

export default function DashboardPage() {
  const [monitor, setMonitor]     = useState<any>(null);
  const [alerts, setAlerts]       = useState<any[]>([]);
  const [controls, setControls]   = useState<any>(null);
  const [risks, setRisks]         = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  const load = async () => {
    try {
      const [m, a, c, r, i] = await Promise.all([
        getMonitoringDashboard(), getAlerts(), getControls(), getRisks(), getIncidents()
      ]);
      setMonitor(m);
      setAlerts(a.alerts || []);
      setControls(c);
      setRisks(r);
      setIncidents(Array.isArray(i) ? i : i.incidents || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  const handleResolve = async (id: string) => { await resolveAlert(id); load(); };

  if (loading) return <Spinner />;

  const score = monitor?.overall_compliance_score ?? 0;
  const openIncidents = incidents.filter((i: any) => i.status === "open").length;

  return (
    <div style={{ maxWidth: 1400 }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between fade-up" style={{ marginBottom: 28 }}>
        <div>
          <div className="flex items-center" style={{ gap: 10, marginBottom: 4 }}>
            <div
              style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                boxShadow: "0 0 8px rgba(59,130,246,0.6)",
              }}
            />
            <span style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Live Dashboard
            </span>
          </div>
          <h1 className="font-bold text-white" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem,3vw,1.55rem)", letterSpacing: "-0.02em" }}>
            Compliance Posture
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 3 }}>
            Real-time overview across all frameworks
          </p>
        </div>
        <Btn onClick={load} small variant="secondary">
          <RefreshCw size={12} /> Refresh
        </Btn>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 fade-up-1" style={{ gap: 12, marginBottom: 20 }}>
        <StatCard
          label="Compliance Score"
          value={`${score}%`}
          color={score >= 80 ? "green" : score >= 50 ? "amber" : "red"}
          sub={monitor?.trend}
          icon={<TrendingUp size={13} />}
        />
        <StatCard
          label="Controls"
          value={`${controls?.by_status?.implemented ?? 0}/${controls?.total ?? 0}`}
          sub="implemented"
          color="blue"
          icon={<Shield size={13} />}
        />
        <StatCard
          label="Open Risks"
          value={risks?.by_severity ? Object.values(risks.by_severity).reduce((a: any, b: any) => a + b, 0) : 0}
          color="amber"
          icon={<AlertTriangle size={13} />}
        />
        <StatCard
          label="Open Incidents"
          value={openIncidents}
          color={openIncidents > 0 ? "red" : "green"}
          icon={<Zap size={13} />}
        />
      </div>

      {/* ── 3-col grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 fade-up-2" style={{ gap: 16, marginBottom: 16 }}>

        {/* Compliance posture */}
        <Card>
          <SectionLabel><Shield size={11} /> Compliance posture</SectionLabel>
          <div className="flex flex-col items-center" style={{ paddingTop: 16, paddingBottom: 16, marginBottom: 16 }}>
            <div className="relative" style={{ width: 104, height: 104 }}>
              <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="50" cy="50" r="40" stroke="var(--border)" strokeWidth="7" fill="none" />
                <circle
                  cx="50" cy="50" r="40"
                  stroke={score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="7" fill="none"
                  strokeDasharray={`${(score / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)", filter: "drop-shadow(0 0 6px currentColor)" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-bold text-white" style={{ fontFamily: "var(--font-display)", fontSize: 24, letterSpacing: "-0.02em" }}>{score}</p>
                <p style={{ fontSize: 8.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>SCORE</p>
              </div>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10, textAlign: "center" }}>
              {monitor?.integrations_connected ?? 0} integrations · {monitor?.checks_today ?? 0} checks today
            </p>
          </div>
          {controls?.by_status && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.entries(controls.by_status).map(([k, v]: any) => (
                <div key={k}>
                  <div className="flex justify-between" style={{ fontSize: 11, marginBottom: 5 }}>
                    <span style={{ color: "var(--text-secondary)", textTransform: "capitalize" }}>{k.replace(/_/g, " ")}</span>
                    <span className="text-white font-medium">{v}</span>
                  </div>
                  <ProgressBar value={v} max={controls.total || 1} color={k === "implemented" ? "green" : k === "failed" ? "red" : "amber"} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Risk breakdown */}
        <Card>
          <SectionLabel><AlertTriangle size={11} /> Risk breakdown</SectionLabel>
          {risks?.by_severity ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
              {Object.entries(risks.by_severity).map(([level, count]: any) => (
                <div key={level}>
                  <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
                    <RiskBadge level={level} />
                    <span className="text-white font-semibold" style={{ fontSize: 15, fontFamily: "var(--font-display)" }}>{count}</span>
                  </div>
                  <ProgressBar
                    value={count}
                    max={risks.total || 1}
                    color={level === "CRITICAL" ? "red" : level === "HIGH" ? "orange" : level === "MEDIUM" ? "amber" : "green"}
                  />
                </div>
              ))}
            </div>
          ) : <Empty message="No risks logged yet" />}
        </Card>

        {/* Active alerts */}
        <Card>
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <SectionLabel><Bell size={11} /> Active alerts</SectionLabel>
            <span
              className="rounded-full font-medium"
              style={{
                fontSize: 10, padding: "2px 8px",
                background: "rgba(239,68,68,0.1)", color: "#f87171",
                border: "1px solid rgba(239,68,68,0.28)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {alerts.length}
            </span>
          </div>
          {alerts.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 224, overflowY: "auto", paddingRight: 4 }}>
              {alerts.map((a: any) => (
                <div
                  key={a.id}
                  className="flex items-start rounded-lg"
                  style={{
                    gap: 10,
                    padding: "10px 12px",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white" style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.message}
                    </p>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 3 }}>
                      {a.provider?.toUpperCase()} · {a.severity}
                    </p>
                  </div>
                  <button
                    onClick={() => handleResolve(a.id)}
                    className="transition-colors shrink-0 hover:opacity-70"
                    style={{ color: "#34d399", marginTop: 2 }}
                    title="Resolve alert"
                  >
                    <CheckCircle size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : <Empty message="No active alerts 🎉" />}
        </Card>
      </div>

      {/* ── Recent incidents ── */}
      <Card className="fade-up-3">
        <SectionLabel><Activity size={11} /> Recent incidents</SectionLabel>
        {incidents.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>Severity</Th>
                <Th>Status</Th>
                <Th>Date</Th>
              </tr>
            </thead>
            <tbody>
              {incidents.slice(0, 5).map((i: any) => (
                <Tr key={i.id}>
                  <Td><span className="font-medium">{i.title}</span></Td>
                  <Td><RiskBadge level={i.severity} /></Td>
                  <Td><StatusBadge status={i.status} /></Td>
                  <Td>
                    <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                      {i.created_at?.slice(0, 10)}
                    </span>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : <Empty message="No incidents reported" />}
      </Card>
    </div>
  );
}
