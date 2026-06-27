"use client";
import { useEffect, useState } from "react";
import { getEmployees, createEmployee, updateEmployee, aiTrainingPlan, aiOnboardingChecklist } from "@/lib/api";
import { PageHeader, Card, Btn, StatusBadge, Modal, Input, Select, Empty, Spinner, StatCard, SectionLabel, Table, Th, Td, Tr } from "@/components/ui";
import { Plus, UserX, Users, UserCheck, GraduationCap, Bot, BookOpen, Loader, ClipboardList } from "lucide-react";

const DEPARTMENTS = ["Engineering","Security","Legal","HR","Finance","Operations","Product","Sales","Marketing"];
const FRAMEWORKS = ["SOC2","GDPR","ISO27001","HIPAA"];

export default function EmployeesPage() {
  const [employees, setEmployees]       = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showAdd, setShowAdd]           = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [aiResult, setAiResult]         = useState<any>(null);
  const [aiLoading, setAiLoading]       = useState<string|null>(null);
  const [selectedEmp, setSelectedEmp]   = useState<any>(null);
  const [form, setForm] = useState({ name:"", email:"", role:"", department:DEPARTMENTS[0] });
  const [trainingForm, setTrainingForm] = useState({ role:"", department:DEPARTMENTS[0], frameworks:["SOC2"] });

  const load = async () => { const d = await getEmployees(); setEmployees(Array.isArray(d) ? d : d.employees || []); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => { await createEmployee(form); setShowAdd(false); load(); setForm({name:"",email:"",role:"",department:DEPARTMENTS[0]}); };
  const handleOffboard = async (id: string) => { await updateEmployee(id, { status:"offboarded" }); load(); };

  const handleOnboarding = async (emp: any) => {
    setAiLoading(emp.id); setSelectedEmp(emp); setAiResult(null);
    try { setAiResult(await aiOnboardingChecklist(emp.id)); }
    catch(e:any) { setAiResult({ error: e?.response?.data?.detail || "Failed" }); }
    setAiLoading(null);
  };

  const handleTrainingPlan = async () => {
    setAiLoading("training"); setAiResult(null);
    try { setAiResult(await aiTrainingPlan(trainingForm)); }
    catch(e:any) { setAiResult({ error: "Failed to generate training plan" }); }
    setAiLoading(null);
  };

  const toggleFw = (fw: string) => setTrainingForm(f => ({ ...f, frameworks: f.frameworks.includes(fw) ? f.frameworks.filter(x=>x!==fw) : [...f.frameworks, fw] }));

  if (loading) return <Spinner />;
  const active = employees.filter(e => e.status !== "offboarded");
  const offboarded = employees.filter(e => e.status === "offboarded");

  return (
    <div>
      <PageHeader title="Employees & Training" sub="Track onboarding, compliance training, and policy acknowledgments"
        action={
          <div className="flex gap-2">
            <Btn small variant="secondary" onClick={() => { setShowTraining(true); setAiResult(null); }}>
              <GraduationCap size={12}/> AI Training Plan
            </Btn>
            <Btn small onClick={() => setShowAdd(true)}><Plus size={12}/> Add Employee</Btn>
          </div>
        }/>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard label="Active" value={active.length} color="green" icon={<UserCheck size={13}/>}/>
        <StatCard label="Offboarded" value={offboarded.length} color="gray" icon={<UserX size={13}/>}/>
        <StatCard label="Total" value={employees.length} color="blue" icon={<Users size={13}/>}/>
      </div>

      {employees.length === 0 ? (
        <Card><Empty message="No employees added." icon={<Users size={32}/>}/></Card>
      ) : (
        <Card style={{ padding:0, overflow:"hidden" }}>
          <Table>
            <thead><tr>
              <Th>Name</Th><Th>Role</Th><Th>Department</Th><Th>Status</Th><Th>Actions</Th>
            </tr></thead>
            <tbody>
              {employees.map((e:any) => (
                <Tr key={e.id}>
                  <Td>
                    <div className="font-medium text-white" style={{fontSize:13}}>{e.name}</div>
                    <div style={{fontSize:11,color:"var(--text-muted)"}}>{e.email}</div>
                  </Td>
                  <Td><span style={{fontSize:12,color:"var(--text-secondary)"}}>{e.role||"—"}</span></Td>
                  <Td><span style={{fontSize:12,color:"var(--text-secondary)"}}>{e.department||"—"}</span></Td>
                  <Td><StatusBadge status={e.status||"active"}/></Td>
                  <Td>
                    <div className="flex gap-2">
                      <Btn small variant="ghost" onClick={() => handleOnboarding(e)} disabled={!!aiLoading}>
                        {aiLoading === e.id ? <Loader size={11} className="animate-spin"/> : <ClipboardList size={11}/>}
                        Onboarding
                      </Btn>
                      {e.status !== "offboarded" && (
                        <Btn small variant="ghost" onClick={() => handleOffboard(e.id)}>
                          <UserX size={11}/> Offboard
                        </Btn>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* AI Result Panel */}
      {aiResult && !showTraining && (
        <Card style={{ marginTop:16 }}>
          <div className="flex items-center justify-between mb-3">
            <SectionLabel><Bot size={11}/> AI Onboarding Checklist — {selectedEmp?.name}</SectionLabel>
            <Btn small variant="ghost" onClick={() => setAiResult(null)}>✕</Btn>
          </div>
          {aiResult.error ? (
            <p style={{color:"#f87171",fontSize:12}}>{aiResult.error}</p>
          ) : (
            <pre className="text-xs whitespace-pre-wrap overflow-auto rounded-lg p-4"
              style={{ color:"var(--text-secondary)", fontFamily:"var(--font-mono)", lineHeight:1.7, background:"var(--bg-secondary)", border:"1px solid var(--border-bright)", maxHeight:400 }}>
              {JSON.stringify(aiResult, null, 2)}
            </pre>
          )}
        </Card>
      )}

      {/* Training Plan Modal */}
      {showTraining && (
        <Modal title="AI Compliance Training Plan" onClose={() => { setShowTraining(false); setAiResult(null); }}>
          <Input label="Role" value={trainingForm.role} onChange={v => setTrainingForm(f=>({...f,role:v}))} placeholder="Software Engineer"/>
          <Select label="Department" value={trainingForm.department} onChange={v => setTrainingForm(f=>({...f,department:v}))} options={DEPARTMENTS}/>
          <div className="mb-4">
            <label style={{fontSize:12,color:"var(--text-secondary)",fontWeight:500,display:"block",marginBottom:8}}>Frameworks</label>
            <div className="flex gap-2 flex-wrap">
              {FRAMEWORKS.map(fw => (
                <button key={fw} onClick={() => toggleFw(fw)} className="rounded-full px-3 py-1 transition-all"
                  style={{ fontSize:11, border:"1px solid", borderColor: trainingForm.frameworks.includes(fw) ? "#3b82f6":"var(--border-bright)", background: trainingForm.frameworks.includes(fw) ? "rgba(37,99,235,0.15)":"transparent", color: trainingForm.frameworks.includes(fw) ? "#60a5fa":"var(--text-muted)" }}>
                  {fw}
                </button>
              ))}
            </div>
          </div>
          <Btn onClick={handleTrainingPlan} disabled={aiLoading==="training"} className="w-full justify-center">
            {aiLoading==="training" ? <><Loader size={13} className="animate-spin"/> Generating…</> : <><GraduationCap size={13}/> Generate Plan</>}
          </Btn>
          {aiResult && (
            <div className="mt-4 rounded-lg p-4 overflow-auto" style={{ background:"var(--bg-secondary)", border:"1px solid var(--border-bright)", maxHeight:400 }}>
              <pre className="text-xs whitespace-pre-wrap" style={{ color:"var(--text-secondary)", fontFamily:"var(--font-mono)", lineHeight:1.7 }}>
                {JSON.stringify(aiResult, null, 2)}
              </pre>
            </div>
          )}
        </Modal>
      )}

      {/* Add Employee Modal */}
      {showAdd && (
        <Modal title="Add Employee" onClose={() => setShowAdd(false)}>
          <Input label="Name" value={form.name} onChange={v => setForm(f=>({...f,name:v}))} placeholder="Jane Smith"/>
          <Input label="Email" value={form.email} onChange={v => setForm(f=>({...f,email:v}))} placeholder="jane@company.com"/>
          <Input label="Role" value={form.role} onChange={v => setForm(f=>({...f,role:v}))} placeholder="Software Engineer"/>
          <Select label="Department" value={form.department} onChange={v => setForm(f=>({...f,department:v}))} options={DEPARTMENTS}/>
          <Btn onClick={handleCreate} className="w-full justify-center mt-2">Add Employee</Btn>
        </Modal>
      )}
    </div>
  );
}
