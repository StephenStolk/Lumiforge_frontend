"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, Loader, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handle = async () => {
    setLoading(true); setError(""); setInfo("");
    try {
      if (mode === "signup") {
        const { error: e } = await supabase.auth.signUp({ email, password });
        if (e) throw e;
        setInfo("Check your email to confirm your account.");
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
        router.push("/dashboard");
      }
    } catch (e: any) {
      setError(e.message || "Authentication failed");
    }
    setLoading(false);
  };

  const handleGithub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/dashboard` }
    });
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
      <div className="fixed inset-0 pointer-events-none grid-bg" />
      <div className="fixed pointer-events-none" style={{ top: -200, left: "30%", width: 700, height: 700, background: "radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, transparent 65%)" }} />

      <div className="relative z-10 w-full" style={{ maxWidth: 420, padding: "0 20px" }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center rounded-2xl mb-4" style={{ width: 52, height: 52, background: "linear-gradient(135deg, #2563eb, #06b6d4)", boxShadow: "0 0 32px rgba(37,99,235,0.35)" }}>
            <Shield size={26} style={{ color: "#fff" }} />
          </div>
          <h1 className="font-bold text-white" style={{ fontFamily: "var(--font-display)", fontSize: 26, letterSpacing: "-0.02em" }}>Lumiforge</h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>AI Compliance Copilot</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-bright)", padding: "28px 28px" }}>
          {/* Tabs */}
          <div className="flex rounded-xl mb-6" style={{ background: "var(--bg-secondary)", padding: 4 }}>
            {(["signin","signup"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} className="flex-1 rounded-lg py-2 transition-all" style={{ fontSize: 13, fontWeight: 500, background: mode === m ? "var(--bg-card)" : "transparent", color: mode === m ? "var(--text-primary)" : "var(--text-muted)", border: mode === m ? "1px solid var(--border)" : "1px solid transparent" }}>
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Mail size={14} className="absolute" style={{ top: "50%", left: 12, transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg text-white"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-bright)", padding: "10px 12px 10px 36px", fontSize: 13, outline: "none" }}
                onKeyDown={e => e.key === "Enter" && handle()} />
            </div>
            <div className="relative">
              <Lock size={14} className="absolute" style={{ top: "50%", left: 12, transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input type={showPw ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full rounded-lg text-white"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-bright)", padding: "10px 36px 10px 36px", fontSize: 13, outline: "none" }}
                onKeyDown={e => e.key === "Enter" && handle()} />
              <button onClick={() => setShowPw(!showPw)} className="absolute" style={{ top: "50%", right: 12, transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
          </div>

          {error && <p style={{ fontSize: 12, color: "#f87171", marginBottom: 12 }}>{error}</p>}
          {info  && <p style={{ fontSize: 12, color: "#34d399", marginBottom: 12 }}>{info}</p>}

          <button onClick={handle} disabled={loading || !email || !password} className="w-full rounded-xl font-semibold transition-all" style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", padding: "11px", fontSize: 14, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading || !email || !password ? 0.6 : 1 }}>
            {loading ? <span className="flex items-center justify-center gap-2"><Loader size={14} className="animate-spin"/> {mode === "signin" ? "Signing in…" : "Creating account…"}</span>
              : mode === "signin" ? "Sign In" : "Create Account"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>or continue with</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleGithub} className="rounded-xl py-2.5 flex items-center justify-center gap-2 transition-all" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-bright)", fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </button>
            <button onClick={handleGoogle} className="rounded-xl py-2.5 flex items-center justify-center gap-2 transition-all" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-bright)", fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 20 }}>
          By continuing, you agree to Lumiforge's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
