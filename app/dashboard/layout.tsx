"use client";
import Sidebar, { MobileTopbar } from "@/components/Sidebar";
import { AnalysisProvider } from "@/components/AnalysisContext";
import { ReactNode, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/auth");
      else setChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/auth");
    });
    return () => subscription.unsubscribe();
  }, []);

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
      <Loader size={20} className="animate-spin" style={{ color: "var(--text-muted)" }} />
    </div>
  );

  return (
    <div className="flex min-h-screen relative" style={{ background: "var(--bg-primary)" }}>
      <div className="fixed inset-0 pointer-events-none z-0 grid-bg" />
      <div className="fixed pointer-events-none z-0" style={{ top: -250, left: "25%", width: 800, height: 800, background: "radial-gradient(ellipse, rgba(37,99,235,0.055) 0%, transparent 60%)" }} />
      <div className="fixed pointer-events-none z-0" style={{ bottom: -300, right: "10%", width: 600, height: 600, background: "radial-gradient(ellipse, rgba(6,182,212,0.03) 0%, transparent 60%)" }} />
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <MobileTopbar onOpen={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto" style={{ padding: "24px 28px" }}>
          <AnalysisProvider>
            {children}
          </AnalysisProvider>
        </main>
      </div>
    </div>
  );
}
