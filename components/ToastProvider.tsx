"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

type Toast = {
  id: string;
  type?: "success" | "error" | "info";
  title: string;
  description?: string;
};

const ToastContext = createContext<{
  toast: (t: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((s) => [{ id, ...t }, ...s]);
    // auto-dismiss
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 4500);
    return id;
  }, []);

  const dismiss = useCallback(
    (id: string) => setToasts((s) => s.filter((t) => t.id !== id)),
    [],
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        style={{
          position: "fixed",
          right: 18,
          bottom: 18,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            style={{ minWidth: 260, maxWidth: 420 }}
          >
            <div
              style={{
                background:
                  t.type === "error"
                    ? "rgba(248,113,113,0.12)"
                    : t.type === "success"
                      ? "rgba(16,185,129,0.08)"
                      : "rgba(96,165,250,0.06)",
                border: "1px solid var(--border)",
                padding: "12px 14px",
                borderRadius: 12,
                backdropFilter: "blur(6px)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {t.title}
                  </div>
                  {t.description && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        marginTop: 6,
                      }}
                    >
                      {t.description}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
