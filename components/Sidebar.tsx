"use client";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShieldCheck, AlertTriangle, Users, Building2,
  FileText, Zap, BookOpen, Radio, Search, Bot,
  Shield, X, Menu, ChevronRight
} from "lucide-react";

const NAV = [
  { href: "/dashboard",           icon: LayoutDashboard, label: "Dashboard",     group: "overview" },
  { href: "/dashboard/analyze",   icon: Search,          label: "Analyze Doc",   group: "tools" },
  { href: "/dashboard/monitor",   icon: Radio,           label: "Live Monitor",  group: "tools" },
  { href: "/dashboard/mcp",       icon: Bot,             label: "AI Agents",     group: "tools" },
  { href: "/dashboard/controls",  icon: ShieldCheck,     label: "Controls",      group: "compliance" },
  { href: "/dashboard/risks",     icon: AlertTriangle,   label: "Risk Register", group: "compliance" },
  { href: "/dashboard/incidents", icon: Zap,             label: "Incidents",     group: "compliance" },
  { href: "/dashboard/policies",  icon: FileText,        label: "Policies",      group: "compliance" },
  { href: "/dashboard/vendors",   icon: Building2,       label: "Vendors",       group: "data" },
  { href: "/dashboard/employees", icon: Users,           label: "Employees",     group: "data" },
  { href: "/dashboard/audit",     icon: BookOpen,        label: "Audit Hub",     group: "data" },
];

const GROUP_LABELS: Record<string, string> = {
  overview:   "Overview",
  tools:      "Intelligence",
  compliance: "Compliance",
  data:       "Records",
};

interface SidebarProps { mobileOpen: boolean; onClose: () => void; }

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const path = usePathname();
  const groups = Array.from(new Set(NAV.map(n => n.group)));

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? "active" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`sidebar-drawer shrink-0 flex flex-col h-screen top-0 overflow-y-auto ${mobileOpen ? "open" : ""}`}
        style={{
          width: 244,
          background: "linear-gradient(180deg, #060c1a 0%, #040810 100%)",
          borderRight: "1px solid #101c32",
        }}
      >
        {/* Logo */}
        <div className="flex items-center" style={{ gap: 12, padding: "20px 20px", borderBottom: "1px solid #101c32" }}>
          <div
            className="flex items-center justify-center rounded-xl shrink-0"
            style={{
              width: 36, height: 36,
              background: "linear-gradient(135deg, #2563eb 0%, #0891b2 100%)",
              boxShadow: "0 0 24px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white leading-none" style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, letterSpacing: "-0.01em" }}>
              Lumiforge
            </p>
            <p style={{ marginTop: 2, fontSize: 9.5, color: "#2d4a6e", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em" }}>
              AI COMPLIANCE
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto md:hidden flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
            style={{ width: 28, height: 28, color: "#3d5175" }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col" style={{ padding: "16px 12px", gap: 20 }}>
          {groups.map(group => (
            <div key={group}>
              <p
                className="uppercase" style={{ paddingLeft: 8, paddingRight: 8, marginBottom: 8 }}
                style={{ fontSize: 9, color: "#1e3050", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.12em", fontWeight: 600 }}
              >
                {GROUP_LABELS[group]}
              </p>
              <div className="flex flex-col" style={{ gap: 2 }}>
                {NAV.filter(n => n.group === group).map(({ href, icon: Icon, label }) => {
                  const active = path === href || (href !== "/dashboard" && path.startsWith(href));
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className="flex items-center rounded-lg relative transition-all duration-150 group" style={{ gap: 10 }}
                      style={{
                        padding: "8px 12px",
                        color: active ? "#e2e8f0" : "#445e80",
                        background: active
                          ? "linear-gradient(135deg, rgba(37,99,235,0.16) 0%, rgba(8,145,178,0.08) 100%)"
                          : "transparent",
                        border: active ? "1px solid rgba(37,99,235,0.18)" : "1px solid transparent",
                      }}
                      onMouseEnter={e => {
                        if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                      }}
                      onMouseLeave={e => {
                        if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      {active && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                          style={{ width: 3, height: 18, background: "linear-gradient(180deg, #3b82f6, #06b6d4)" }}
                        />
                      )}
                      <Icon
                        size={14}
                        style={{ color: active ? "#60a5fa" : "#253a58", flexShrink: 0, transition: "color 0.15s" }}
                      />
                      <span className="flex-1 font-medium" style={{ fontSize: 13 }}>{label}</span>
                      {active && <ChevronRight size={10} style={{ color: "#3b82f6", opacity: 0.7 }} />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <SidebarFooter />
      </aside>
    </>
  );
}


function SidebarFooter() {
  const [email, setEmail] = useState("");
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email || "");
    });
  }, []);
  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };
  return (
    <div className="px-4 py-4" style={{ borderTop: "1px solid #101c32" }}>
      <div className="flex items-center" style={{ gap: 8, marginBottom: 8 }}>
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span style={{ fontSize: 11, color: "#10b981", fontFamily: "'JetBrains Mono', monospace" }}>
          System operational
        </span>
      </div>
      {email && (
        <p style={{ fontSize: 10.5, color: "#334d6e", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {email}
        </p>
      )}
      <div className="flex items-center justify-between">
        <p style={{ fontSize: 9.5, color: "#172233", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em" }}>
          v3.0 · MCP + RAG + Supabase
        </p>
        <button onClick={signOut} title="Sign out" style={{ color: "#334d6e", cursor: "pointer", background: "none", border: "none" }}>
          <LogOut size={13} />
        </button>
      </div>
    </div>
  );
}

export function MobileTopbar({ onOpen }: { onOpen: () => void }) {
  return (
    <div
      className="mobile-topbar flex items-center sticky top-0 z-30" style={{ gap: 12, padding: "10px 16px" }}
      style={{
        background: "rgba(3,6,16,0.88)",
        borderBottom: "1px solid #101c32",
        backdropFilter: "blur(16px)",
      }}
    >
      <button
        onClick={onOpen}
        className="flex items-center justify-center rounded-lg transition-colors hover:bg-white/5"
        style={{ width: 36, height: 36 }}
        aria-label="Open sidebar"
      >
        <Menu size={18} style={{ color: "#8899b4" }} />
      </button>
      <div className="flex items-center" style={{ gap: 8 }}>
        <div
          className="flex items-center justify-center rounded-lg"
          style={{ width: 28, height: 28, background: "linear-gradient(135deg, #2563eb, #06b6d4)", boxShadow: "0 0 14px rgba(37,99,235,0.3)" }}
        >
          <Shield size={12} className="text-white" />
        </div>
        <span className="font-bold text-white" style={{ fontFamily: "'Syne', sans-serif", fontSize: 14 }}>
          Lumiforge
        </span>
      </div>
    </div>
  );
}
