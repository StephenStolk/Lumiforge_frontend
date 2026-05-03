"use client";
import { ReactNode } from "react";
import { X } from "lucide-react";

/* ── Color maps ── */
const COLOR_TEXT: Record<string, string> = {
  blue: "#60a5fa", cyan: "#22d3ee", green: "#34d399", indigo: "#a5b4fc",
  amber: "#fbbf24", red: "#f87171", orange: "#fb923c", purple: "#c084fc",
  gray: "#64748b", yellow: "#facc15",
};
const COLOR_BG: Record<string, string> = {
  blue: "rgba(37,99,235,0.1)", cyan: "rgba(6,182,212,0.1)", green: "rgba(16,185,129,0.1)",
  indigo: "rgba(99,102,241,0.1)", amber: "rgba(245,158,11,0.1)", red: "rgba(239,68,68,0.1)",
  orange: "rgba(249,115,22,0.1)", purple: "rgba(168,85,247,0.1)", gray: "rgba(100,116,139,0.08)",
  yellow: "rgba(234,179,8,0.1)",
};
const COLOR_BORDER: Record<string, string> = {
  blue: "rgba(37,99,235,0.28)", cyan: "rgba(6,182,212,0.28)", green: "rgba(16,185,129,0.28)",
  indigo: "rgba(99,102,241,0.28)", amber: "rgba(245,158,11,0.28)", red: "rgba(239,68,68,0.28)",
  orange: "rgba(249,115,22,0.28)", purple: "rgba(168,85,247,0.28)", gray: "rgba(100,116,139,0.18)",
  yellow: "rgba(234,179,8,0.28)",
};

/* ── StatCard ── */
export function StatCard({
  label, value, sub, color = "blue", icon
}: {
  label: string; value: any; sub?: string; color?: string; icon?: ReactNode;
}) {
  const tc = COLOR_TEXT[color] || COLOR_TEXT.blue;
  const bg = COLOR_BG[color]  || COLOR_BG.blue;
  const br = COLOR_BORDER[color] || COLOR_BORDER.blue;
  return (
    <div
      className="rounded-xl fade-up card-glow"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        padding: "16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle accent glow in corner */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 80, height: 80,
        background: `radial-gradient(circle at top right, ${tc}18 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <div className="flex items-start justify-between" style={{ marginBottom: 12 }}>
        <p style={{
          fontSize: 10.5, color: "var(--text-muted)",
          fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.09em"
        }}>
          {label}
        </p>
        {icon && (
          <div className="flex items-center justify-center rounded-lg shrink-0" style={{
            width: 28, height: 28, background: bg, border: `1px solid ${br}`
          }}>
            <span style={{ color: tc }}>{icon}</span>
          </div>
        )}
      </div>
      <p className="font-bold leading-none" style={{
        fontSize: 28, color: tc, fontFamily: "var(--font-display)", letterSpacing: "-0.02em"
      }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>{sub}</p>}
    </div>
  );
}

/* ── Badge ── */
export function Badge({ label, color }: { label: string; color: string }) {
  const tc = COLOR_TEXT[color] || COLOR_TEXT.gray;
  const bg = COLOR_BG[color]  || COLOR_BG.gray;
  const br = COLOR_BORDER[color] || COLOR_BORDER.gray;
  return (
    <span
      className="inline-flex items-center rounded-full font-medium"
      style={{
        fontSize: 10, padding: "3px 9px",
        color: tc, background: bg, border: `1px solid ${br}`,
        fontFamily: "var(--font-mono)", letterSpacing: "0.04em",
      }}
    >
      {label}
    </span>
  );
}

export function RiskBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    low: "green", medium: "amber", high: "orange", critical: "red",
    LOW: "green", MEDIUM: "amber", HIGH: "orange", CRITICAL: "red",
  };
  return <Badge label={level?.toUpperCase()} color={map[level] || "gray"} />;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    implemented: "green", pass: "green", published: "green", resolved: "green",
    active: "green", connected: "green", ready: "green",
    not_implemented: "red", fail: "red", failed: "red", open: "red", offboarded: "gray",
    partial: "amber", "in-progress": "amber", mitigating: "amber", draft: "gray",
    preparation: "amber", under_review: "amber",
  };
  return <Badge label={status?.replace(/_/g, " ").toUpperCase()} color={map[status?.toLowerCase()] || "gray"} />;
}

/* ── PageHeader ── */
export function PageHeader({
  title, sub, action
}: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between fade-up" style={{ marginBottom: 24, gap: 16 }}>
      <div>
        <h1
          className="font-bold text-white"
          style={{ fontSize: "clamp(1.1rem, 3vw, 1.4rem)", fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}
        >
          {title}
        </h1>
        {sub && <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 3 }}>{sub}</p>}
      </div>
      {action && (
        <div className="flex items-center shrink-0" style={{ gap: 8, flexWrap: "wrap" }}>
          {action}
        </div>
      )}
    </div>
  );
}

/* ── Card ── */
export function Card({ children, className = "", style = {} }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-xl card-glow ${className}`}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        padding: "20px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Section label ── */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      className="flex items-center"
      style={{
        fontSize: 10.5, color: "var(--text-muted)",
        fontFamily: "var(--font-mono)", textTransform: "uppercase",
        letterSpacing: "0.1em", marginBottom: 12, gap: 6
      }}
    >
      {children}
    </p>
  );
}

/* ── Empty ── */
export function Empty({ message, icon }: { message: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center" style={{ paddingTop: 48, paddingBottom: 48, gap: 10 }}>
      {icon && <div style={{ color: "var(--text-muted)", opacity: 0.35 }}>{icon}</div>}
      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{message}</p>
    </div>
  );
}

/* ── Spinner ── */
export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div className="flex justify-center items-center" style={{ paddingTop: 64, paddingBottom: 64 }}>
      <div
        className="animate-spin rounded-full"
        style={{
          width: size, height: size,
          border: "2px solid var(--border-bright)",
          borderTopColor: "var(--accent-blue)",
        }}
      />
    </div>
  );
}

/* ── Btn ── */
export function Btn({
  children, onClick, variant = "primary", disabled = false, small = false, type = "button", className = ""
}: {
  children: ReactNode; onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; variant?: string;
  disabled?: boolean; small?: boolean; type?: "button" | "submit" | "reset"; className?: string;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
      color: "#fff",
      border: "1px solid rgba(59,130,246,0.35)",
      boxShadow: "0 0 18px rgba(37,99,235,0.18), inset 0 1px 0 rgba(255,255,255,0.1)",
    },
    secondary: {
      background: "rgba(255,255,255,0.04)",
      color: "var(--text-secondary)",
      border: "1px solid var(--border-bright)",
    },
    danger: {
      background: "rgba(239,68,68,0.1)",
      color: "#f87171",
      border: "1px solid rgba(239,68,68,0.28)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-secondary)",
      border: "1px solid transparent",
    },
    success: {
      background: "rgba(16,185,129,0.1)",
      color: "#34d399",
      border: "1px solid rgba(16,185,129,0.28)",
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg font-medium flex items-center transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.97] ${className}`}
      style={{
        fontSize: small ? 12 : 13,
        padding: small ? "6px 12px" : "8px 16px",
        gap: 6,
        fontFamily: "var(--font-body)",
        cursor: disabled ? "not-allowed" : "pointer",
        lineHeight: 1,
        ...styles[variant],
      }}
    >
      {children}
    </button>
  );
}

/* ── Modal ── */
export function Modal({
  open, onClose, title, children
}: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)", padding: 16 }}
      onClick={onClose}
    >
      <div
        className="w-full"
        style={{
          maxWidth: 520,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-bright)",
          borderRadius: 16,
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex justify-between items-center"
          style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)" }}
        >
          <h2 className="font-semibold text-white" style={{ fontSize: 15, fontFamily: "var(--font-display)" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-lg transition-colors hover:bg-white/5"
            style={{ width: 28, height: 28, color: "var(--text-muted)" }}
          >
            <X size={14} />
          </button>
        </div>
        <div style={{ padding: "20px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

/* ── Input ── */
export function Input({
  label, value, onChange, placeholder, type = "text", required = false
}: any) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label className="block" style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 6 }}>
          {label}{required && <span style={{ color: "#f87171", marginLeft: 2 }}>*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg text-white"
        style={{
          fontSize: 13,
          padding: "9px 12px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-bright)",
          outline: "none",
          transition: "border-color 0.15s",
          fontFamily: "var(--font-body)",
        }}
        onFocus={e => (e.target.style.borderColor = "var(--accent-blue)")}
        onBlur={e => (e.target.style.borderColor = "var(--border-bright)")}
      />
    </div>
  );
}

/* ── Select ── */
export function Select({
  label, value, onChange, options
}: { label?: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label className="block" style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 6 }}>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg text-white"
        style={{
          fontSize: 13,
          padding: "9px 12px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-bright)",
          outline: "none",
          cursor: "pointer",
          fontFamily: "var(--font-body)",
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

/* ── Textarea ── */
export function Textarea({ label, value, onChange, placeholder, rows = 3 }: any) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label className="block" style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 6 }}>
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg text-white"
        style={{
          fontSize: 13,
          padding: "9px 12px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-bright)",
          outline: "none",
          transition: "border-color 0.15s",
          resize: "none",
          fontFamily: "var(--font-body)",
        }}
        onFocus={e => (e.target.style.borderColor = "var(--accent-blue)")}
        onBlur={e => (e.target.style.borderColor = "var(--border-bright)")}
      />
    </div>
  );
}

/* ── ProgressBar ── */
export function ProgressBar({ value, max = 100, color = "blue" }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const tc = COLOR_TEXT[color] || COLOR_TEXT.blue;
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: "var(--border)" }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${tc}cc, ${tc})`,
          transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: `0 0 6px ${tc}55`,
        }}
      />
    </div>
  );
}

/* ── Table helpers ── */
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="table-wrap w-full rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <table className="w-full" style={{ borderCollapse: "collapse" }}>
        {children}
      </table>
    </div>
  );
}

export function Th({ children }: { children?: ReactNode }) {
  return (
    <th
      className="text-left font-medium"
      style={{
        fontSize: 10,
        color: "var(--text-muted)",
        background: "var(--bg-secondary)",
        fontFamily: "var(--font-mono)",
        textTransform: "uppercase",
        letterSpacing: "0.09em",
        borderBottom: "1px solid var(--border)",
        padding: "11px 16px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = "", ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      {...props}
      className={className}
      style={{
        fontSize: 13,
        borderBottom: "1px solid rgba(19,29,51,0.7)",
        color: "var(--text-primary)",
        padding: "11px 16px",
        ...(props.style || {}),
      }}
      
    >
      {children}
    </td>
  );
}

export function Tr({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <tr
      onClick={onClick}
      className="transition-colors"
      style={{ cursor: onClick ? "pointer" : "default" }}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.018)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      {children}
    </tr>
  );
}