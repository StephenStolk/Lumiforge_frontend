"use client";
import { useEffect, useState } from "react";
import { getVendors, createVendor, updateVendor } from "@/lib/api";
import { PageHeader, Card, Btn, RiskBadge, StatusBadge, Modal, Input, Select, Textarea, Empty, Spinner, Table, Th, Td, Tr } from "@/components/ui";
import { Plus, Building2 } from "lucide-react";

const RISK_LEVELS = ["low","medium","high","critical"];
const CATS = ["SaaS","Cloud Infrastructure","Security","HR","Legal","Finance","Payments","Analytics","Other"];

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:"", category:CATS[0], risk_level:"medium", contact_email:"", notes:"", review_date:"" });

  const load = async () => { const d = await getVendors(); setVendors(Array.isArray(d) ? d : d.vendors || []); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => { await createVendor(form); setShowAdd(false); load(); };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Vendors"
        sub="Track third-party vendors and their compliance risk"
        action={<Btn onClick={() => setShowAdd(true)} small><Plus size={12}/> Add Vendor</Btn>}
      />

      {vendors.length === 0 ? (
        <Card><Empty message="No vendors added yet." icon={<Building2 size={32}/>} /></Card>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Vendor</Th>
              <Th>Category</Th>
              <Th>Risk</Th>
              <Th>Contact</Th>
              <Th>Review Date</Th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v: any) => (
              <Tr key={v.id}>
                <Td><span className="font-medium text-white">{v.name}</span></Td>
                <Td><span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{v.category}</span></Td>
                <Td><RiskBadge level={v.risk_level} /></Td>
                <Td><span style={{ fontSize: 12, color: "var(--text-muted)" }}>{v.contact_email || "—"}</span></Td>
                <Td>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {v.review_date || "Not set"}
                  </span>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Vendor">
        <Input label="Vendor name" value={form.name} onChange={(v:string)=>setForm({...form,name:v})} placeholder="e.g. AWS" required />
        <Select label="Category" value={form.category} onChange={(v:string)=>setForm({...form,category:v})} options={CATS} />
        <Select label="Risk level" value={form.risk_level} onChange={(v:string)=>setForm({...form,risk_level:v})} options={RISK_LEVELS} />
        <Input label="Contact email" value={form.contact_email} onChange={(v:string)=>setForm({...form,contact_email:v})} placeholder="security@vendor.com" />
        <Input label="Next review date" value={form.review_date} onChange={(v:string)=>setForm({...form,review_date:v})} type="date" />
        <Textarea label="Notes" value={form.notes} onChange={(v:string)=>setForm({...form,notes:v})} placeholder="Any notes about this vendor..." />
        <Btn onClick={handleCreate} disabled={!form.name}>Add Vendor</Btn>
      </Modal>
    </div>
  );
}
