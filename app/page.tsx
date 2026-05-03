"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Shield, Loader } from "lucide-react";

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      router.replace(data.session ? "/dashboard" : "/auth");
    });
  }, []);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "var(--bg-primary)" }}>
      <Shield size={32} style={{ color: "#3b82f6", marginBottom: 16 }} />
      <Loader size={18} className="animate-spin" style={{ color: "var(--text-muted)" }} />
    </div>
  );
}
