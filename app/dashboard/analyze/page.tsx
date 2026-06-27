"use client";
import { useState } from "react";
import { uploadDocument, analyzeDocument } from "@/lib/api";
import Dropzone from "@/components/Dropzone";
import {
  Card,
  PageHeader,
  Btn,
  Badge,
  Spinner,
  SectionLabel,
} from "@/components/ui";
import { useToast } from "@/components/ToastProvider";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Bot,
  ChevronDown,
  ChevronRight,
  FileText,
  CheckCircle,
} from "lucide-react";

const STEPS = ["upload", "analyze", "result"];
const STEP_LABELS: Record<string, string> = {
  upload: "Upload",
  analyze: "Configure",
  result: "Results",
};

export default function AnalyzePage() {
  const [step, setStep] = useState<"upload" | "analyze" | "result">("upload");
  const [docId, setDocId] = useState("");
  const [filename, setFilename] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string[]>(["main"]);

  const { toast } = useToast();

  const toggle = (key: string) =>
    setExpanded((e) =>
      e.includes(key) ? e.filter((x) => x !== key) : [...e, key],
    );

  const onUpload = async (file: File) => {
    setLoading(true);
    try {
      const d = await uploadDocument(file);
      setDocId(d.document_id);
      setFilename(d.filename);
      setStep("analyze");
      toast({ type: "success", title: "Uploaded", description: d.filename });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onAnalyze = async () => {
    setLoading(true);
    try {
      const d = await analyzeDocument(docId, query);
      setResult(d);
      setStep("result");
    } catch (e) {
      console.error(e);
      toast({
        type: "error",
        title: "Analysis failed",
        description: String(e),
      });
    } finally {
      setLoading(false);
    }
  };

  const statusIcon = (s: string) => {
    if (s === "PASS")
      return <ShieldCheck size={24} style={{ color: "#34d399" }} />;
    if (s === "FAIL")
      return <ShieldAlert size={24} style={{ color: "#f87171" }} />;
    return <AlertTriangle size={24} style={{ color: "#fbbf24" }} />;
  };

  const statusStyle: Record<string, React.CSSProperties> = {
    PASS: {
      border: "1px solid rgba(16,185,129,0.25)",
      background: "rgba(16,185,129,0.06)",
    },
    FAIL: {
      border: "1px solid rgba(239,68,68,0.25)",
      background: "rgba(239,68,68,0.06)",
    },
    WARNING: {
      border: "1px solid rgba(245,158,11,0.25)",
      background: "rgba(245,158,11,0.06)",
    },
  };

  const currentStepIdx = STEPS.indexOf(step);

  return (
    <div>
      <PageHeader
        title="Document Analysis"
        sub="Upload a compliance document for multi-agent RAG analysis with blockchain proof"
      />

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-6 fade-up">
        {STEPS.map((s, i) => {
          const done = i < currentStepIdx;
          const active = s === step;
          return (
            <div key={s} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center rounded-full font-bold transition-all"
                  style={{
                    width: 28,
                    height: 28,
                    fontSize: 11,
                    background: done
                      ? "#10b981"
                      : active
                        ? "#2563eb"
                        : "var(--bg-secondary)",
                    color: done || active ? "#fff" : "var(--text-muted)",
                    border: `1px solid ${done ? "#10b981" : active ? "#2563eb" : "var(--border-bright)"}`,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {done ? <CheckCircle size={12} /> : i + 1}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: active ? "var(--text-primary)" : "var(--text-muted)",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {STEP_LABELS[s]}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="mx-3 h-px w-8"
                  style={{
                    background:
                      i < currentStepIdx ? "#10b981" : "var(--border)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step: Upload */}
      {step === "upload" && <Dropzone onUpload={onUpload} loading={loading} />}

      {/* Step: Analyze */}
      {step === "analyze" && (
        <Card>
          <div
            className="flex items-center gap-3 rounded-lg px-4 py-3 mb-5"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <FileText size={16} style={{ color: "#34d399" }} />
            <p
              className="font-medium text-white flex-1"
              style={{ fontSize: 13 }}
            >
              {filename}
            </p>
            <span
              style={{
                fontSize: 11,
                color: "#34d399",
                fontFamily: "var(--font-mono)",
              }}
            >
              ✓ Uploaded
            </span>
          </div>

          <div className="mb-5">
            <label
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                fontWeight: 500,
                display: "block",
                marginBottom: 8,
              }}
            >
              Analysis query (optional)
            </label>
            <textarea
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Specific questions about the document, or leave blank for full analysis…"
              className="w-full rounded-lg px-3 py-2.5 text-white placeholder-gray-600 resize-none"
              style={{
                fontSize: 13,
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-bright)",
                outline: "none",
              }}
            />
          </div>

          <div className="flex" style={{ gap: 12 }}>
            <Btn onClick={onAnalyze} disabled={loading}>
              {loading ? (
                <>
                  <Spinner size={14} /> Analyzing…
                </>
              ) : (
                <>
                  <Bot size={13} /> Run Multi-Agent Analysis
                </>
              )}
            </Btn>
            <Btn variant="ghost" onClick={() => setStep("upload")}>
              ← Back
            </Btn>
          </div>
        </Card>
      )}

      {/* Step: Result */}
      {step === "result" && result && (
        <div className="space-y-4 animate-fade-in">
          {/* Overall */}
          <Card style={{ ...statusStyle[result.overall_status] }}>
            <div className="flex items-start gap-4">
              {statusIcon(result.overall_status)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p
                    className="font-bold text-white"
                    style={{ fontFamily: "var(--font-display)", fontSize: 16 }}
                  >
                    {result.overall_status}
                  </p>
                  {result.compliance_score !== undefined && (
                    <span
                      className="font-semibold"
                      style={{
                        fontSize: 22,
                        color: "#60a5fa",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {result.compliance_score}%
                    </span>
                  )}
                </div>
                {result.summary && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                    }}
                  >
                    {result.summary}
                  </p>
                )}
                {result.blockchain_tx && (
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      style={{
                        fontSize: 10,
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      Blockchain TX: {result.blockchain_tx}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Framework results */}
          {result.framework_results &&
            Object.entries(result.framework_results).map(
              ([fw, fwResult]: any) => {
                const isOpen = expanded.includes(fw);
                return (
                  <Card key={fw}>
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggle(fw)}
                    >
                      <div className="flex items-center gap-2.5">
                        <Badge label={fw} color="blue" />
                        <span
                          className="font-medium text-white"
                          style={{ fontSize: 13 }}
                        >
                          {fwResult.status}
                        </span>
                        {fwResult.score !== undefined && (
                          <span
                            style={{
                              fontSize: 12,
                              color: "#60a5fa",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {fwResult.score}%
                          </span>
                        )}
                      </div>
                      {isOpen ? (
                        <ChevronDown
                          size={14}
                          style={{ color: "var(--text-muted)" }}
                        />
                      ) : (
                        <ChevronRight
                          size={14}
                          style={{ color: "var(--text-muted)" }}
                        />
                      )}
                    </div>
                    {isOpen && (
                      <div className="mt-4 space-y-2">
                        {fwResult.controls?.map((c: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-start justify-between rounded-lg px-3 py-2.5 gap-3"
                            style={{
                              background: "var(--bg-secondary)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            <div className="flex-1">
                              <p
                                className="font-medium text-white"
                                style={{ fontSize: 12 }}
                              >
                                {c.control_name || c.control_id}
                              </p>
                              {c.finding && (
                                <p
                                  style={{
                                    fontSize: 11,
                                    color: "var(--text-muted)",
                                    marginTop: 2,
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {c.finding}
                                </p>
                              )}
                            </div>
                            <span
                              style={{
                                fontSize: 10,
                                fontFamily: "var(--font-mono)",
                                color:
                                  c.status === "PASS"
                                    ? "#34d399"
                                    : c.status === "FAIL"
                                      ? "#f87171"
                                      : "#fbbf24",
                                flexShrink: 0,
                              }}
                            >
                              {c.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              },
            )}

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <Card>
              <SectionLabel>
                <Bot size={11} /> AI recommendations
              </SectionLabel>
              <div className="space-y-2 mt-2">
                {result.recommendations.map((r: string, i: number) => (
                  <div
                    key={i}
                    className="flex gap-2.5 rounded-lg px-3 py-2.5"
                    style={{
                      background: "rgba(37,99,235,0.06)",
                      border: "1px solid rgba(37,99,235,0.15)",
                    }}
                  >
                    <span
                      style={{ color: "#60a5fa", flexShrink: 0, marginTop: 1 }}
                    >
                      →
                    </span>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        lineHeight: 1.6,
                      }}
                    >
                      {r}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Btn
            variant="secondary"
            onClick={() => {
              setStep("upload");
              setResult(null);
              setDocId("");
              setFilename("");
            }}
          >
            ← Analyze another document
          </Btn>
        </div>
      )}
    </div>
  );
}
