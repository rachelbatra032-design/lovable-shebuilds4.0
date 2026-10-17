import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, UserPlus, ArrowRight, Building2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { companyOverviewQuery, myCompaniesQuery, myInvitesQuery } from "@/lib/queries";
import { completeness, riskLabel } from "@/lib/knowledge";
import { createSampleWorkspace } from "@/lib/roles.functions";
import { ScoreRing } from "@/components/ScoreRing";


export const Route = createFileRoute("/_authenticated/app")({
  validateSearch: z.object({ c: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Workspace — Kaimaaral" },
      { name: "description", content: "Departments, roles and how well each role is documented." },
      { property: "og:title", content: "Workspace — Kaimaaral" },
      { property: "og:description", content: "Departments, roles and how well each role is documented." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AppHome,
});

function AppHome() {
  const { c } = Route.useSearch();
  const navigate = Route.useNavigate();
  const companies = useQuery(myCompaniesQuery());
  const list = companies.data ?? [];
  const current = list.find((x) => x.id === c) ?? list[0];

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-6">
        {companies.isLoading ? (
          <p className="text-muted-foreground">Loading your workspace…</p>
        ) : !current ? (
          <Onboarding onCreated={(id) => navigate({ search: { c: id } })} />
        ) : (
          <>
            <div className="mb-6 grid gap-3 sm:flex sm:items-center">
              {list.length > 1 ? (
                <Select value={current.id} onValueChange={(v) => navigate({ search: { c: v } })}>
                  <SelectTrigger className="w-full min-w-0 sm:w-auto sm:min-w-[14rem]" aria-label="Workspace">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {list.map((x) => (
                      <SelectItem key={x.id} value={x.id}>
                        {x.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              <NewWorkspaceDialog onCreated={(id) => navigate({ search: { c: id } })} />
            </div>
            <CompanyView companyId={current.id} name={current.name} isSample={current.is_sample} isAdmin={current.member_role === "admin"} />
          </>
        )}
      </main>
    </div>
  );
}

function useCreateCompany(onCreated: (id: string) => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, departments }: { name: string; departments: string[] }) => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user!.id;
      const { data: co, error } = await supabase.from("companies").insert({ name, created_by: uid }).select("id").single();
      if (error) throw error;
      const m = await supabase.from("company_members").insert({ company_id: co.id, user_id: uid, member_role: "admin" });
      if (m.error) throw m.error;
      if (departments.length) await supabase.from("departments").insert(departments.map((d) => ({ company_id: co.id, name: d })));
      return co.id;
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ["companies"] });
      onCreated(id);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create workspace"),
  });
}

function useLoadSample(onCreated: (id: string) => void) {
  const qc = useQueryClient();
  const fn = useServerFn(createSampleWorkspace);
  return useMutation({
    mutationFn: () => fn(),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Sample company loaded");
      onCreated(r.companyId);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not load sample"),
  });
}

function CreateForm({ onCreated }: { onCreated: (id: string) => void }) {
  const [name, setName] = useState("");
  const [depts, setDepts] = useState("Finance, Marketing, Operations");
  const create = useCreateCompany(onCreated);
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        create.mutate({ name, departments: depts.split(",").map((s) => s.trim()).filter(Boolean) });
      }}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="co">Company name</Label>
        <Input id="co" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Malabar Textiles" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="dp">Departments (comma separated)</Label>
        <Input id="dp" value={depts} onChange={(e) => setDepts(e.target.value)} />
      </div>
      <Button type="submit" disabled={create.isPending}>
        {create.isPending ? "Creating…" : "Create workspace"}
      </Button>
    </form>
  );
}

function NewWorkspaceDialog({ onCreated }: { onCreated: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const sample = useLoadSample((id) => {
    setOpen(false);
    onCreated(id);
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Building2 /> New workspace
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-3xl font-normal">New workspace</DialogTitle>
        </DialogHeader>
        <CreateForm
          onCreated={(id) => {
            setOpen(false);
            onCreated(id);
          }}
        />
        <Button variant="secondary" onClick={() => sample.mutate()} disabled={sample.isPending}>
          {sample.isPending ? "Loading sample…" : "Or load the sample company"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function Onboarding({ onCreated }: { onCreated: (id: string) => void }) {
  const sample = useLoadSample(onCreated);
  const invites = useQuery(myInvitesQuery());
  const qc = useQueryClient();

  async function accept(inv: { id: string; company_id: string }) {
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("company_members").insert({ company_id: inv.company_id, user_id: u.user!.id, member_role: "member" });
    if (error) { toast.error(error.message); return; }
    await supabase.from("invites").update({ accepted: true }).eq("id", inv.id);
    qc.invalidateQueries();
    onCreated(inv.company_id);
  }

  return (
    <div className="mx-auto max-w-3xl py-6">
      <h1 className="text-3xl sm:text-5xl">Let's map your first role</h1>
      <p className="mt-2 text-lg text-muted-foreground">Start from a ready-made example, or set up your own company in a minute.</p>

      {invites.data?.length ? (
        <div className="paper-card mt-6 p-5">
          <h2 className="text-2xl">You've been invited</h2>
          {invites.data.map((inv) => (
            <div key={inv.id} className="mt-3 flex items-center justify-between gap-3">
              <span>{(inv.companies as { name: string } | null)?.name ?? "A workspace"}</span>
              <Button size="sm" onClick={() => accept(inv)}>
                Join
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="paper-card flex flex-col p-6">
          <Badge className="w-fit bg-accent text-accent-foreground hover:bg-accent">Recommended for a first look</Badge>
          <h2 className="mt-3 text-3xl">Kerala Spices Traders</h2>
          <p className="mt-2 flex-1 text-muted-foreground">
            A fictional spice exporter in Kochi. Anitha, the Accounts Lead, is leaving next month. Her Malayalam voice notes are already mapped.
          </p>
          <Button className="mt-5" size="lg" onClick={() => sample.mutate()} disabled={sample.isPending}>
            {sample.isPending ? "Setting up…" : "Load sample company"}
          </Button>
        </div>
        <div className="paper-card p-6">
          <h2 className="text-3xl">Your own company</h2>
          <p className="mb-4 mt-2 text-muted-foreground">Add departments now; roles and people next.</p>
          <CreateForm onCreated={onCreated} />
        </div>
      </div>
    </div>
  );
}

function CompanyView({ companyId, name, isSample, isAdmin }: { companyId: string; name: string; isSample: boolean; isAdmin: boolean }) {
  const q = useQuery(companyOverviewQuery(companyId));
  const qc = useQueryClient();
  const [newDept, setNewDept] = useState("");
  const refresh = () => qc.invalidateQueries({ queryKey: ["company", companyId] });

  async function addDept(e: React.FormEvent) {
    e.preventDefault();
    if (!newDept.trim()) return;
    const { error } = await supabase.from("departments").insert({ company_id: companyId, name: newDept.trim() });
    if (error) { toast.error(error.message); return; }
    setNewDept("");
    refresh();
  }

  if (q.isLoading || !q.data) return <p className="text-muted-foreground">Loading…</p>;
  const { departments, roles, items, inputs, changes, invites } = q.data;

  const scoreFor = (roleId: string) =>
    completeness({
      items: items.filter((i) => i.role_id === roleId),
      inputDates: inputs.filter((i) => i.role_id === roleId).map((i) => i.created_at),
      pendingChanges: changes.filter((c) => c.role_id === roleId).length,
    });

  const atRisk = roles.filter((r) => scoreFor(r.id) < 45).length;

  return (
    <div>
      <div className="grid gap-4 sm:flex sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="grid gap-2 sm:flex sm:items-center">
            <h1 className="min-w-0 text-3xl sm:text-4xl">{name}</h1>
            {isSample && <Badge variant="outline" className="w-fit shrink-0 border-terracotta text-terracotta">Sample data</Badge>}
          </div>
          <p className="mt-1 text-muted-foreground">
            {departments.length} departments · {roles.length} roles · {atRisk} at risk
          </p>
        </div>
        {isAdmin && <InviteDialog companyId={companyId} roles={roles} invites={invites} onDone={refresh} />}
      </div>

      <div className="mt-8 space-y-10">
        {departments.map((d) => {
          const deptRoles = roles.filter((r) => r.department_id === d.id);
          return (
            <section key={d.id}>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border pb-2">
                <h2 className="min-w-0 text-2xl sm:text-3xl">{d.name}</h2>
                <AddRoleDialog companyId={companyId} departmentId={d.id} departmentName={d.name} onDone={refresh} />
              </div>
              {deptRoles.length === 0 ? (
                <p className="mt-4 text-muted-foreground">No roles yet. Add the first role in {d.name} — e.g. "Accounts Lead".</p>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {deptRoles.map((r) => {
                    const s = scoreFor(r.id);
                    const risk = riskLabel(s);
                    const pending = changes.filter((c) => c.role_id === r.id).length;
                    return (
                      <Link
                        key={r.id}
                        to="/roles/$roleId"
                        params={{ roleId: r.id }}
                        className="paper-card group flex items-center gap-4 p-5 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        <ScoreRing value={s} />
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-2xl">{r.title}</h3>
                          <p className="truncate text-sm text-muted-foreground">{r.holder_name || "No holder yet"}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <Badge variant="outline" className={risk.tone === "danger" ? "border-destructive text-destructive" : risk.tone === "warn" ? "border-terracotta text-terracotta" : "border-success text-success"}>
                              {risk.label}
                            </Badge>
                            {r.status === "leaving" && <Badge className="bg-terracotta text-terracotta-foreground hover:bg-terracotta">Leaving</Badge>}
                            {pending > 0 && <Badge variant="secondary">{pending} to review</Badge>}
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden />
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
        <form onSubmit={addDept} className="flex max-w-md gap-2">
          <Input value={newDept} onChange={(e) => setNewDept(e.target.value)} placeholder="Add a department" aria-label="New department name" />
          <Button type="submit" variant="outline">
            <Plus /> Add
          </Button>
        </form>
      </div>
    </div>
  );
}

function AddRoleDialog({ companyId, departmentId, departmentName, onDone }: { companyId: string; departmentId: string; departmentName: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [holder, setHolder] = useState("");
  useEffect(() => {
    if (!open) {
      setTitle("");
      setHolder("");
    }
  }, [open]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("roles").insert({ company_id: companyId, department_id: departmentId, title, holder_name: holder || null });
    if (error) { toast.error(error.message); return; }
    setOpen(false);
    onDone();
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Plus /> Role
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-3xl font-normal">New role in {departmentName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="rt">Role title</Label>
            <Input id="rt" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Accounts Payable Lead" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="rh">Current role-holder</Label>
            <Input id="rh" value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="Name" />
          </div>
          <DialogFooter>
            <Button type="submit">Create role</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InviteDialog({
  companyId,
  roles,
  invites,
  onDone,
}: {
  companyId: string;
  roles: { id: string; title: string }[];
  invites: { id: string; email: string; accepted: boolean }[];
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState<string>("none");
  async function send(e: React.FormEvent) {
    e.preventDefault();
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("invites")
      .insert({ company_id: companyId, email: email.trim().toLowerCase(), role_id: roleId === "none" ? null : roleId, invited_by: u.user!.id });
    if (error) { toast.error(error.message); return; }
    toast.success(`Invite saved. ${email} can join after signing up with this email.`);
    setEmail("");
    onDone();
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus /> Invite people
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-3xl font-normal">Invite a teammate</DialogTitle>
        </DialogHeader>
        <form onSubmit={send} className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="ie">Email</Label>
            <Input id="ie" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Role (optional)</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific role</SelectItem>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">They'll see a "Join" button after signing in with this email.</p>
          <DialogFooter>
            <Button type="submit">Save invite</Button>
          </DialogFooter>
        </form>
        {invites.length > 0 && (
          <div className="border-t border-border pt-3 text-sm">
            <p className="mb-2 font-medium">Invited</p>
            <ul className="space-y-1">
              {invites.map((i) => (
                <li key={i.id} className="flex justify-between">
                  <span>{i.email}</span>
                  <span className="text-muted-foreground">{i.accepted ? "Joined" : "Pending"}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
