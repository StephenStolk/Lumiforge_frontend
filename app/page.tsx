"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Shield, Search, Radio, ShieldCheck, AlertTriangle, FileText,
  BookOpen, Bot, ChevronRight, Lock, ArrowRight, Check,
  Globe, Cpu, Database, Eye, BarChart3, Zap, Menu, X
} from "lucide-react";

const FEATURES = [
  { icon: Search,      title: "Document Intelligence",  desc: "Upload compliance docs for deep multi-agent RAG analysis mapped to SOC2, GDPR, ISO 27001, HIPAA, and PCI-DSS.", tag: "AI-Powered",        color: "blue" },
  { icon: Radio,       title: "Live Monitoring",         desc: "Continuous compliance checks across AWS, GitHub, Google Workspace, Slack, and more — with real-time alerts.", tag: "Real-Time",        color: "cyan" },
  { icon: ShieldCheck, title: "Control Management",      desc: "Track every security control, link evidence, monitor implementation status, and generate audit-ready reports.",  tag: "SOC2 · ISO 27001", color: "green" },
  { icon: AlertTriangle, title: "Risk Register",         desc: "Quantify and prioritize risks with likelihood × impact scoring, framework mapping, and mitigation tracking.",     tag: "Risk Intelligence", color: "amber" },
  { icon: Bot,         title: "AI Agents Suite",         desc: "Five specialized agents: Compliance Analyzer, Control Advisor, AI Auditor, Gap Detector, and NLQ Assistant.",     tag: "Agentic AI",       color: "purple" },
  { icon: BookOpen,    title: "Blockchain Audit Hub",    desc: "Immutable audit trails on Solana. Every analysis is cryptographically sealed — tamper-proof compliance proof.",   tag: "Solana",           color: "teal" },
];

const STATS = [
  { value: "5+",    label: "Compliance Frameworks", sub: "SOC2, GDPR, ISO 27001, HIPAA, PCI-DSS" },
  { value: "50+",   label: "Security Controls",     sub: "Automated tracking & evidence collection" },
  { value: "∞",     label: "Audit Records",         sub: "Immutable blockchain verification" },
  { value: "99.9%", label: "Monitoring Uptime",     sub: "Continuous real-time checks" },
];

const STEPS = [
  { num: "01", title: "Connect & Upload",   desc: "Integrate your cloud infrastructure and upload compliance documents. Lumiforge indexes and embeds everything instantly.", icon: Database },
  { num: "02", title: "Analyze & Detect",   desc: "Multi-agent AI maps findings to framework controls and identifies critical gaps in real time.",                           icon: Cpu },
  { num: "03", title: "Monitor & Prove",    desc: "Continuous monitoring keeps you compliant 24/7. Every audit event is sealed on-chain for irrefutable proof.",             icon: Eye },
];

const COLOR_STYLES: Record<string, { text: string; bg: string; border: string }> = {
  blue:   { text: "#60a5fa", bg: "rgba(37,99,235,0.1)",   border: "rgba(37,99,235,0.3)" },
  cyan:   { text: "#22d3ee", bg: "rgba(6,182,212,0.1)",   border: "rgba(6,182,212,0.3)" },
  green:  { text: "#34d399", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.3)" },
  amber:  { text: "#fbbf24", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)" },
  purple: { text: "#c084fc", bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.3)" },
  teal:   { text: "#2dd4bf", bg: "rgba(20,184,166,0.1)",  border: "rgba(20,184,166,0.3)" },
};

function AnimatedScore() {
  const [score, setScore] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const iv = setInterval(() => setScore(s => { if (s >= 87) { clearInterval(iv); return 87; } return s + 1; }), 20);
      return () => clearInterval(iv);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  const checks = [
    { label: "MFA Enforced",        ok: true  },
    { label: "Encryption at Rest",  ok: true  },
    { label: "Access Logging",      ok: true  },
    { label: "Branch Protection",   ok: false },
    { label: "Audit Trail Active",  ok: true  },
  ];

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="absolute inset-0 rounded-2xl" style={{ background: "rgba(37,99,235,0.08)", filter: "blur(40px)" }} />
      <div className="relative rounded-2xl p-5" style={{ background: "#080e1c", border: "1px solid #151f35" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400" style={{ animation: "pulse-dot 2s infinite" }} />
            <span style={{ fontSize: 10, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>LIVE · AWS</span>
          </div>
          <span style={{ fontSize: 10, color: "#1e2e4a", fontFamily: "'JetBrains Mono', monospace" }}>lumiforge.io</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex items-center justify-center shrink-0" style={{ width: 80, height: 80 }}>
            <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="40" cy="40" r="34" stroke="#151f35" strokeWidth="6" fill="none" />
              <circle cx="40" cy="40" r="34" stroke="#3b82f6" strokeWidth="6" fill="none"
                strokeDasharray={`${(score / 100) * 213.6} 213.6`}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 0.05s linear" }} />
            </svg>
            <div className="text-center">
              <p className="font-bold text-white" style={{ fontSize: 20, fontFamily: "'Syne', sans-serif" }}>{score}</p>
              <p style={{ fontSize: 8, color: "#3d5175", fontFamily: "'JetBrains Mono', monospace" }}>SCORE</p>
            </div>
          </div>
          <div>
            <p className="font-semibold text-white" style={{ fontSize: 13 }}>Compliance Posture</p>
            <p style={{ fontSize: 11, color: "#3d5175", marginTop: 2 }}>3 integrations · 24 checks today</p>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5" style={{ fontSize: 10, color: "#60a5fa", background: "#0a1525", border: "1px solid #1e3a6e" }}>
              <BarChart3 size={9}/> +4% this week
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {checks.map((c) => (
            <div key={c.label} className="flex items-center justify-between rounded-lg px-3 py-1.5" style={{ background: "#0c1322" }}>
              <span style={{ fontSize: 11, color: "#64748b" }}>{c.label}</span>
              <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: c.ok ? "#34d399" : "#f87171", fontWeight: 500 }}>
                {c.ok ? "✓ PASS" : "✗ FAIL"}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-lg p-2.5" style={{ background: "rgba(120,53,15,0.15)", border: "1px solid rgba(146,64,14,0.35)" }}>
          <AlertTriangle size={10} style={{ color: "#fbbf24", marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: 10, color: "#fbbf24" }}>Branch protection missing on 2 repos</p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  // If already logged in, skip landing and go straight to dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
    });
  }, []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: "#030912", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 1000, height: 600, background: "radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", top: "40%", left: 0, width: 400, height: 400, background: "rgba(6,182,212,0.04)", borderRadius: "50%", filter: "blur(100px)" }} />
        <div style={{ position: "absolute", top: "40%", right: 0, width: 400, height: 400, background: "rgba(99,102,241,0.04)", borderRadius: "50%", filter: "blur(100px)" }} />
        <div className="grid-bg absolute inset-0" />
      </div>

      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0"
        style={{
          zIndex: 50,
          background: scrolled ? "rgba(3,9,18,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid #0f1a2e" : "1px solid transparent",
          transition: "all 0.3s",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between" style={{ height: 60 }}>
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{ width: 32, height: 32, background: "linear-gradient(135deg, #2563eb, #06b6d4)", boxShadow: "0 0 20px rgba(37,99,235,0.35)" }}
            >
              <Shield size={14} className="text-white" />
            </div>
            <span className="font-bold text-white" style={{ fontFamily: "'Syne', sans-serif", fontSize: 16 }}>Lumiforge</span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8" style={{ fontSize: 13, color: "#64748b" }}>
            {["Features", "How it works", "Frameworks"].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} style={{ transition: "color 0.2s" }} className="hover:text-white">{l}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="hidden md:flex items-center gap-1.5 rounded-xl text-white font-medium"
              style={{ fontSize: 13, padding: "8px 18px", background: "#2563eb", boxShadow: "0 0 20px rgba(37,99,235,0.25)", transition: "box-shadow 0.2s" }}
            >
              Launch Platform <ChevronRight size={13} />
            </Link>
            <button className="md:hidden p-2 rounded-lg" style={{ color: "#64748b" }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={18}/> : <Menu size={18}/>}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden flex flex-col" style={{ padding: "8px 20px 16px", gap: 12, borderTop: "1px solid #0f1a2e", background: "rgba(3,9,18,0.95)", backdropFilter: "blur(20px)"}}>
            {["Features", "How it works", "Frameworks"].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} style={{ fontSize: 14, color: "#94a3b8" }} onClick={() => setMobileMenuOpen(false)}>{l}</a>
            ))}
            <Link href="/auth" className="text-center rounded-xl text-white font-medium py-2.5" style={{ fontSize: 14, background: "#2563eb" }}>
              Launch Platform
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-5 pb-20" style={{ zIndex: 1, minHeight: "100vh", paddingTop: 100 }}>
        <div
          className="mb-5 inline-flex items-center gap-2 rounded-full"
          style={{ fontSize: 11, padding: "6px 14px", border: "1px solid rgba(37,99,235,0.4)", background: "rgba(37,99,235,0.08)", color: "#93c5fd", fontFamily: "'JetBrains Mono', monospace" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-dot" />
          AI-Native · Blockchain-Verified · Real-Time
        </div>

        <h1
          className="text-center font-bold leading-none mb-5 max-w-4xl"
          style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(2.4rem, 6vw, 5rem)", lineHeight: 1.05 }}
        >
          <span className="text-white">Compliance That</span>
          <br />
          <span style={{ background: "linear-gradient(135deg, #60a5fa 0%, #06b6d4 50%, #818cf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Thinks for Itself
          </span>
        </h1>

        <p className="text-center max-w-lg leading-relaxed mb-8" style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)", color: "#64748b" }}>
          Lumiforge automates compliance across SOC2, GDPR, ISO 27001, HIPAA and PCI-DSS using
          multi-agent AI, continuous monitoring, and tamper-proof blockchain audit trails.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 mb-16">
          <Link
            href="/auth"
            className="flex items-center gap-2 rounded-xl text-white font-semibold"
            style={{ fontSize: 14, padding: "12px 28px", background: "linear-gradient(135deg, #2563eb, #06b6d4)", boxShadow: "0 0 40px rgba(37,99,235,0.35)" }}
          >
            Enter Dashboard <ArrowRight size={15} />
          </Link>
          <a
            href="#features"
            className="flex items-center gap-2 rounded-xl font-medium"
            style={{ fontSize: 14, padding: "12px 28px", border: "1px solid #151f35", color: "#94a3b8" }}
          >
            Explore Features
          </a>
        </div>

        <AnimatedScore />

        <div className="mt-14 flex flex-wrap items-center justify-center gap-2">
          {["SOC 2", "GDPR", "ISO 27001", "HIPAA", "PCI-DSS"].map(fw => (
            <span
              key={fw}
              className="rounded-full"
              style={{ fontSize: 10, padding: "4px 12px", border: "1px solid #0f1a2e", color: "#3d5175", fontFamily: "'JetBrains Mono', monospace" }}
            >
              {fw}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative px-5 py-20" style={{ zIndex: 1 }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p style={{ fontSize: 10, color: "#3b82f6", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 10 }}>
              Platform Features
            </p>
            <h2 className="font-bold text-white mb-3" style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}>
              Everything compliance.<br />Nothing else.
            </h2>
            <p style={{ fontSize: 14, color: "#475569", maxWidth: 400, margin: "0 auto" }}>
              Six integrated modules, one unified platform for your entire compliance stack.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              const c = COLOR_STYLES[f.color];
              return (
                <div
                  key={f.title}
                  className="rounded-2xl p-5 overflow-hidden transition-all duration-200"
                  style={{ background: "#06101e", border: "1px solid #0f1a2e" }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="rounded-xl flex items-center justify-center" style={{ width: 38, height: 38, background: c.bg, border: `1px solid ${c.border}` }}>
                      <Icon size={16} style={{ color: c.text }} />
                    </div>
                    <span className="rounded-full font-medium" style={{ fontSize: 9, padding: "3px 8px", color: c.text, background: c.bg, border: `1px solid ${c.border}`, fontFamily: "'JetBrains Mono', monospace" }}>
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif", fontSize: 14 }}>{f.title}</h3>
                  <p style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="frameworks" className="relative px-5 py-16" style={{ zIndex: 1 }}>
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl p-8 sm:p-10" style={{ background: "linear-gradient(135deg, #07101e 0%, #09122a 100%)", border: "1px solid #0f1a2e", boxShadow: "inset 0 1px 0 rgba(59,130,246,0.08)" }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              {STATS.map(s => (
                <div key={s.label} className="text-center">
                  <p className="font-bold mb-1" style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", background: "linear-gradient(135deg, #60a5fa, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {s.value}
                  </p>
                  <p className="font-medium text-white mb-1" style={{ fontSize: 12 }}>{s.label}</p>
                  <p style={{ fontSize: 10.5, color: "#334155", lineHeight: 1.5 }}>{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative px-5 py-20" style={{ zIndex: 1 }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p style={{ fontSize: 10, color: "#3b82f6", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 10 }}>Process</p>
            <h2 className="font-bold text-white" style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}>
              Up and compliant in minutes
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="rounded-2xl p-6" style={{ background: "#06101e", border: "1px solid #0f1a2e" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-bold" style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, color: "#0f1a2e" }}>{step.num}</span>
                    <div className="rounded-xl flex items-center justify-center" style={{ width: 36, height: 36, background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.25)" }}>
                      <Icon size={15} style={{ color: "#60a5fa" }} />
                    </div>
                  </div>
                  <h3 className="font-semibold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif", fontSize: 14 }}>{step.title}</h3>
                  <p style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.65 }}>{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="relative px-5 py-14" style={{ zIndex: 1 }}>
        <div className="max-w-4xl mx-auto text-center">
          <p style={{ fontSize: 10, color: "#2d4060", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 20 }}>
            Integrates with your stack
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["AWS", "GitHub", "Google Workspace", "Slack", "Vercel", "Pinecone", "Solana"].map(name => (
              <div key={name} className="flex items-center gap-2 rounded-full" style={{ fontSize: 12, padding: "6px 14px", border: "1px solid #0f1a2e", background: "#070d1a", color: "#475569" }}>
                <Globe size={11} style={{ color: "#243352" }} />
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-5 py-20" style={{ zIndex: 1 }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl px-6 sm:px-12 py-14 overflow-hidden" style={{ background: "linear-gradient(135deg, #07101e 0%, #0a1525 100%)", border: "1px solid #0f1a2e" }}>
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 300, height: 200, background: "rgba(37,99,235,0.08)", borderRadius: "50%", filter: "blur(60px)" }} />
            <div className="relative">
              <div className="inline-flex items-center gap-2 mb-5 rounded-full" style={{ fontSize: 10, padding: "6px 14px", border: "1px solid rgba(37,99,235,0.35)", background: "rgba(37,99,235,0.08)", color: "#93c5fd", fontFamily: "'JetBrains Mono', monospace" }}>
                <Lock size={10} style={{ color: "#60a5fa" }} />
                Secure · Compliant · Auditable
              </div>
              <h2 className="font-bold text-white mb-3" style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(1.6rem, 4vw, 2.6rem)", lineHeight: 1.1 }}>
                Start automating<br />
                <span style={{ background: "linear-gradient(135deg, #60a5fa, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  compliance today
                </span>
              </h2>
              <p style={{ fontSize: 14, color: "#475569", maxWidth: 440, margin: "0 auto 28px", lineHeight: 1.7 }}>
                Eliminate compliance anxiety, slash audit prep time, and build trust with customers — in one platform.
              </p>
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 rounded-xl text-white font-semibold"
                style={{ fontSize: 14, padding: "12px 28px", background: "linear-gradient(135deg, #2563eb, #06b6d4)", boxShadow: "0 0 40px rgba(37,99,235,0.3)" }}
              >
                Launch Dashboard <ArrowRight size={15} />
              </Link>
              <div className="flex items-center justify-center gap-6 mt-7 flex-wrap">
                {["No credit card required", "Full platform access", "Blockchain secured"].map(t => (
                  <div key={t} className="flex items-center gap-1.5" style={{ fontSize: 11, color: "#334155" }}>
                    <Check size={10} style={{ color: "#10b981" }} />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-5 py-7" style={{ zIndex: 1, borderTop: "1px solid #0a1525" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-lg" style={{ width: 22, height: 22, background: "linear-gradient(135deg, #2563eb, #06b6d4)" }}>
              <Shield size={10} className="text-white" />
            </div>
            <span className="font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif", fontSize: 13 }}>Lumiforge</span>
            <span style={{ fontSize: 10, color: "#1e2e4a", marginLeft: 4 }}>v2.0 · AI Compliance Platform</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center" style={{ fontSize: 10, color: "#1e2e4a", fontFamily: "'JetBrains Mono', monospace" }}>
            <span>MCP + RAG + Multi-Agent AI</span>
            <span>·</span>
            <span>Solana Blockchain</span>
            <span>·</span>
            <span>Next.js + FastAPI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}