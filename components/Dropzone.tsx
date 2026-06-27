"use client";
import { useCallback, useState } from "react";
import { useToast } from "./ToastProvider";
import { Upload, FileText, X } from "lucide-react";
import { Spinner } from "./ui";

interface DropzoneProps {
  onUpload: (file: File) => void;
  loading?: boolean;
  accept?: string;
}

export default function Dropzone({ onUpload, loading = false, accept = ".pdf,.doc,.docx,.txt" }: DropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File|null>(null);
  const toastCtx = (() => { try { return useToast(); } catch { return null; } })();

  const handleFile = useCallback((f: File) => {
    setFile(f);
    try { onUpload(f); } catch (e) { /* noop */ }
    // lightweight toast indicating upload started
    try { toastCtx?.toast({ type: "info", title: "Uploading", description: f.name }); } catch (e) { }
  }, [onUpload, toastCtx]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className="relative rounded-2xl transition-all duration-200"
      style={{
        border: `2px dashed ${dragging ? "rgba(37,99,235,0.6)" : "var(--border-bright)"}`,
        background: dragging ? "rgba(37,99,235,0.05)" : "var(--bg-card)",
        padding: "40px 24px",
      }}
    >
      <input
        type="file"
        accept={accept}
        onChange={onInputChange}
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
        disabled={loading}
      />

      <div className="flex flex-col items-center text-center gap-3 pointer-events-none">
        {loading ? (
          <>
            <Spinner size={32} />
            <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>Uploading & indexing…</p>
          </>
        ) : file ? (
          <>
            <div className="rounded-xl flex items-center justify-center" style={{ width: 48, height: 48, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}>
              <FileText size={20} style={{ color: "#34d399" }} />
            </div>
            <p className="font-medium text-white" style={{ fontSize: 14 }}>{file.name}</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>File selected — uploading…</p>
          </>
        ) : (
          <>
            <div
              className="rounded-xl flex items-center justify-center"
              style={{ width: 52, height: 52, background: dragging ? "rgba(37,99,235,0.15)" : "rgba(255,255,255,0.04)", border: "1px solid var(--border-bright)" }}
            >
              <Upload size={20} style={{ color: dragging ? "#60a5fa" : "var(--text-muted)" }} />
            </div>
            <div>
              <p className="font-semibold text-white" style={{ fontSize: 14 }}>Drop your document here</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                or click to browse · PDF, DOCX, TXT supported
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center mt-1">
              {["PDF", "DOCX", "TXT", "DOC"].map(ext => (
                <span
                  key={ext}
                  className="rounded-full"
                  style={{ fontSize: 9, padding: "2px 8px", border: "1px solid var(--border)", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                >
                  {ext}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
