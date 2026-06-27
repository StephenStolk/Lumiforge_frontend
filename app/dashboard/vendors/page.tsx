"use client";
import { useEffect, useState } from "react";
import { getVendors, createVendor, updateVendor, aiVendorAssess, generateVendorQuestionnaire } from "@/lib/api";
import { PageHeader, Card, Btn, RiskBadge, StatusBadge, Modal, Input, Select, Textarea, Empty, Spinner, StatCard, SectionLabel, Table, Th, Td, Tr } from "@/components/ui";
import { Plus, Building2, Bot, ShieldAlert, FileQuestion, Loader, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const RISK_LEVELS = ["low","medium","high","critical"];
const CATS = ["SaaS","Cloud Infrastructure","Security","HR","Legal","Finance","Payments","Analytics","Other"];

export default function VendorsPage() {
  const [vendors, setVendors]           = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showAdd, setShowAdd]           = useState(false);
  const [aiResult, setAiResult]         = useState<any>(null);
  const [aiLoading, setAiLoading]       = useState<string|null>(null);
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [form, setForm] = useState({ name:"", category:CATS[0], risk_tier:"medium", contact_email:"", review_frequency_days:365 });

  const load = async () => {
    const d = await getVendors();
    setVendors(Array.isArray(d) ? d : d.vendors || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => { await createVendor(form); setShowAdd(false); load(); };

  const handleAIAssess = async (vendor: any) => {
    setAiLoading(vendor.id); setSelectedVendor(vendor); setAiResult(null); setQuestionnaire(null);
    try {
      const res = await aiVendorAssess(vendor.id);
      setAiResult(res);
    } catch(e: any) { setAiResult({ error: e?.response?.data?.detail || "Assessment failed" }); }
    setAiLoading(null);
  };

  const handleQuestionnaire = async (vendor: any) => {
    setAiLoading(vendor.id + "_q"); setSelectedVendor(vendor); setAiResult(null); setQuestionnaire(null);
    try {
      const res = await generateVendorQuestionnaire(vendor.id);
      setQuestionnaire(res);
    } catch(e: any) { setQuestionnaire({ error: "Failed to generate questionnaire" }); }
    setAiLoading(null);
  };

  if (loading) return <Spinner />;

  const high = vendors.filter(v => ["high","critical"].includes(v.risk_tier));
  const dueReview = vendors.filter(v => {
    if (!v.next_review_date) return false;
    return new Date(v.next_review_date) < new Date(Date.now() + 30*24*60*60*1000);
  });

  return (
    <div>
      <PageHeader title="Vendor Risk Management" sub="Track third-party vendors, run AI risk assessments, generate security questionnaires"
        action={<Btn onClick={() => setShowAdd(true)} small><Plus size={12}/> Add Vendor</Btn>}/>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard label="Total Vendors" value={vendors.length} color="blue" icon={<Building2 size={13}/>}/>
        <StatCard label="High / Critical Risk" value={high.length} color="red" icon={<ShieldAlert size={13}/>}/>
        <StatCard label="Review Due (30d)" value={dueReview.length} color="amber" icon={<Clock size={13}/>}/>
      </div>

      {vendors.length === 0 ? (
        <Card><Empty message="No vendors added yet." icon={<Building2 size={32}/>}/></Card>
      ) : (
        <Card style={{ padding:0, overflow:"hidden" }}>
          <Table>
            <thead><tr>
              <Th>Vendor</Th><Th>Category</Th><Th>Risk Tier</Th><Th>Status</Th><Th>Next Review</Th><Th>AI Actions</Th>
            </tr></thead>
            <tbody>
              {vendors.map((v:any) => (
                <Tr key={v.id}>
                  <Td><div className="font-medium text-white" style={{fontSize:13}}>{v.name}</div>
                    {v.contact_email && <div style={{fontSize:11,color:"var(--text-muted)"}}>{v.contact_email}</div>}
                  </Td>
                  <Td><span style={{fontSize:12,color:"var(--text-secondary)"}}>{v.category}</span></Td>
                  <Td><RiskBadge level={v.risk_tier||"medium"}/></Td>
                  <Td><StatusBadge status={v.status||"active"}/></Td>
                  <Td><span style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--text-muted)"}}>
                    {v.next_review_date ? new Date(v.next_review_date).toLocaleDateString() : "—"}
                  </span></Td>
                  <Td>
                    <div className="flex gap-2">
                      <Btn small variant="ghost" onClick={() => handleAIAssess(v)} disabled={!!aiLoading}>
                        {aiLoading === v.id ? <Loader size={11} className="animate-spin"/> : <Bot size={11}/>}
                        {aiLoading === v.id ? "Assessing…" : "AI Assess"}
                      </Btn>
                      <Btn small variant="ghost" onClick={() => handleQuestionnaire(v)} disabled={!!aiLoading}>
                        {aiLoading === v.id+"_q" ? <Loader size={11} className="animate-spin"/> : <FileQuestion size={11}/>}
                        Questionnaire
                      </Btn>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* AI Result Panel */}
      {(aiResult || questionnaire) && selectedVendor && (
        <Card style={{ marginTop:16 }}>
          <div className="flex items-center justify-between mb-4">
            <SectionLabel>
              <Bot size={11}/> AI Analysis — {selectedVendor.name}
            </SectionLabel>
            <Btn small variant="ghost" onClick={() => { setAiResult(null); setQuestionnaire(null); }}>✕ Close</Btn>
          </div>
          {aiResult?.error && <p style={{color:"#f87171",fontSize:13}}>{aiResult.error}</p>}
          {questionnaire?.error && <p style={{color:"#f87171",fontSize:13}}>{questionnaire.error}</p>}
          {(aiResult || questionnaire) && !aiResult?.error && !questionnaire?.error && (
            <div className="rounded-lg p-4 overflow-auto" style={{ background:"var(--bg-secondary)", border:"1px solid var(--border-bright)", maxHeight:400 }}>
              <pre className="text-xs whitespace-pre-wrap" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-mono)", lineHeight:1.7 }}>
                {JSON.stringify(aiResult || questionnaire, null, 2)}
              </pre>
            </div>
          )}
        </Card>
      )}

      {/* Add Vendor Modal */}
      {showAdd && (
        <Modal title="Add Vendor" onClose={() => setShowAdd(false)}>
          <Input label="Vendor name" value={form.name} onChange={v => setForm(f=>({...f,name:v}))} placeholder="Stripe, AWS, etc."/>
          <Select label="Category" value={form.category} onChange={v => setForm(f=>({...f,category:v}))} options={CATS}/>
          <Select label="Risk tier" value={form.risk_tier} onChange={v => setForm(f=>({...f,risk_tier:v}))} options={RISK_LEVELS}/>
          <Input label="Contact email" value={form.contact_email} onChange={v => setForm(f=>({...f,contact_email:v}))} placeholder="security@vendor.com"/>
          <Btn onClick={handleCreate} className="w-full justify-center mt-2">Add Vendor</Btn>
        </Modal>
      )}
    </div>
  );
}
