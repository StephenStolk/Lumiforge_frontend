"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getAnalysisHistory } from "@/lib/api";

type Analysis = any;

const Ctx = createContext<{ history: Analysis[]; refresh: () => Promise<void> } | null>(null);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<Analysis[]>([]);

  const refresh = useCallback(async () => {
    try {
      const res = await getAnalysisHistory();
      setHistory(Array.isArray(res) ? res : res?.results || []);
    } catch (e) {
      console.error("failed to fetch analysis history", e);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <Ctx.Provider value={{ history, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}

export default AnalysisProvider;
