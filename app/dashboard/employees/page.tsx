"use client";
import { useEffect, useState } from "react";
import { getEmployees, createEmployee, updateEmployee } from "@/lib/api";
import { PageHeader, Card, Btn, StatusBadge, Modal, Input, Select, Empty, Spinner, StatCard, Table, Th, Td, Tr } from "@/components/ui";
import { Plus, UserX, Users, UserCheck, GraduationCap } from "lucide-react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", role:"", department:"", status:"active" });

  const load = async () => { const d = await getEmployees(); setEmployees(Array.isArray(d) ? d : d.employees || []); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => { await createEmployee(form); setShowAdd(false); load(); setForm({name:"",email:"",role:"",department:"",status:"active"}); };
  const handleOffboard = async (id: string) => { await updateEmployee(id, { status:"offboarded" }); load(); };

  if (loading) return <Spinner />;
  const active = employees.filter(e => e.status === "active");
  const offboarded = employees.filter(e => e.status === "offboarded");
  const trained = employees.filter(e => e.training_completed?.length > 0);

  return (
    <div>
      <PageHeader
        title="Employees"
        sub="Track onboarding, training, and policy acknowledgments"
        action={<Btn onClick={() => setShowAdd(true)} small><Plus size={12}/> Add Employee</Btn>}
      />

      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard label="Active" value={active.length} color="green" icon={<UserCheck size={13}/>} />
        <StatCard label="Offboarded" value={offboarded.length} color="gray" icon={<UserX size={13}/>} />
        <StatCard label="Training Complete" value={trained.length} color="blue" icon={<GraduationCap size={13}/>} />
      </div>

      {employees.length === 0 ? (
        <Card><Empty message="No employees added." icon={<Users size={32}/>} /></Card>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Employee</Th>
              <Th>Role</Th>
              <Th>Department</Th>
              <Th>Status</Th>
              <Th>Policies Acked</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e: any) => (
              <Tr key={e.id}>
                <Td>
                  <div>
                    <p className="font-medium text-white">{e.name}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{e.email}</p>
                  </div>
                </Td>
                <Td><span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{e.role || "—"}</span></Td>
                <Td><span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{e.department || "—"}</span></Td>
                <Td><StatusBadge status={e.status} /></Td>
                <Td>
                  <span className="font-semibold" style={{ color: "#60a5fa" }}>{e.policies_acknowledged?.length ?? 0}</span>
                </Td>
                <Td>
                  {e.status === "active" && (
                    <Btn small variant="danger" onClick={() => handleOffboard(e.id)}>
                      <UserX size={11}/> Offboard
                    </Btn>
                  )}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Employee">
        <Input label="Full name" value={form.name} onChange={(v:string)=>setForm({...form,name:v})} placeholder="Jane Doe" required />
        <Input label="Email" value={form.email} onChange={(v:string)=>setForm({...form,email:v})} placeholder="jane@company.com" type="email" required />
        <Input label="Role" value={form.role} onChange={(v:string)=>setForm({...form,role:v})} placeholder="Software Engineer" />
        <Input label="Department" value={form.department} onChange={(v:string)=>setForm({...form,department:v})} placeholder="Engineering" />
        <Select label="Status" value={form.status} onChange={(v:string)=>setForm({...form,status:v})} options={["active","offboarded"]} />
        <Btn onClick={handleCreate} disabled={!form.name || !form.email}>Add Employee</Btn>
      </Modal>
    </div>
  );
}
