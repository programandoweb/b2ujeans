"use client";

import { useEffect, useMemo, useState } from "react";
import { KeyRound, LogIn, Pencil, Plus, Save, Send, ShieldCheck, Trash2, UserCog, Users } from "lucide-react";

type UserRow = {
  id: number;
  name: string;
  email: string;
  whatsapp: string | null;
  roles: string[];
  permissions: string[];
  effective_permissions: string[];
  protected: boolean;
  can_impersonate: boolean;
};

type RoleRow = {
  id: number;
  name: string;
  permissions: string[];
  protected: boolean;
};

type Tab = "users" | "roles";

const emptyUser = { id: 0, name: "", email: "", whatsapp: "", roles: [] as string[], permissions: [] as string[] };
const emptyRole = { id: 0, name: "", permissions: [] as string[] };

function groupPermission(permission: string) {
  const root = permission.split(".")[0];
  const labels: Record<string, string> = {
    dashboard: "Dashboard",
    catalog: "Productos y servicios",
    content: "Gaspro-notas",
    heroes: "Constructor de heroes",
    agents: "Agentes",
    ai: "Proveedores IA",
    channels: "Canales",
    commercial: "Comercial",
    seo: "SEO",
    deployments: "Despliegues",
    security: "Seguridad",
  };
  return labels[root] ?? root;
}

async function api(path: string, init?: RequestInit) {
  const response = await fetch("/api/admin" + path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message ?? Object.values(data.errors ?? {}).flat()[0] ?? "No fue posible completar la operación.");
  return data;
}

export default function SecurityPage() {
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<typeof emptyUser | null>(null);
  const [editingRole, setEditingRole] = useState<typeof emptyRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [invitingUserId, setInvitingUserId] = useState<number | null>(null);
  const [impersonatingUserId, setImpersonatingUserId] = useState<number | null>(null);

  const grouped = useMemo(() => {
    return permissions.reduce<Record<string, string[]>>((acc, permission) => {
      const group = groupPermission(permission);
      (acc[group] ??= []).push(permission);
      return acc;
    }, {});
  }, [permissions]);

  async function load() {
    setLoading(true);
    try {
      const [u, r, p] = await Promise.all([
        api("/security/users"),
        api("/security/roles"),
        api("/security/permissions"),
      ]);
      setUsers(u.data ?? []);
      setRoles(r.data ?? []);
      setPermissions(p.data ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error cargando seguridad.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function toggle(value: string, current: string[], setter: (values: string[]) => void) {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  async function saveUser() {
    if (!editingUser) return;
    setMessage("");
    try {
      await api(editingUser.id ? `/security/users/${editingUser.id}` : "/security/users", {
        method: editingUser.id ? "PUT" : "POST",
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          whatsapp: editingUser.whatsapp || null,
          roles: editingUser.roles,
          permissions: editingUser.permissions,
        }),
      });
      setEditingUser(null);
      setMessage("Usuario guardado correctamente.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible guardar el usuario.");
    }
  }

  async function saveRole() {
    if (!editingRole) return;
    setMessage("");
    try {
      await api(editingRole.id ? `/security/roles/${editingRole.id}` : "/security/roles", {
        method: editingRole.id ? "PUT" : "POST",
        body: JSON.stringify({ name: editingRole.name, permissions: editingRole.permissions }),
      });
      setEditingRole(null);
      setMessage("Rol guardado correctamente.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible guardar el rol.");
    }
  }

  async function impersonateUser(user: UserRow) {
    if (!confirm(`¿Iniciar sesión como ${user.name}? Podrás volver a tu cuenta root desde el menú lateral.`)) return;

    setMessage("");
    setImpersonatingUserId(user.id);

    try {
      const response = await fetch(`/api/auth/impersonate/${user.id}`, { method: "POST" });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message ?? "No fue posible iniciar sesión como este usuario.");
      }

      window.location.assign("/dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible iniciar la suplantación.");
      setImpersonatingUserId(null);
    }
  }

  async function inviteUser(user: UserRow) {
    setMessage("");
    setInvitingUserId(user.id);
    try {
      const result = await api(`/security/users/${user.id}/invite`, { method: "POST" });
      setMessage(result.message ?? `Invitación enviada correctamente a ${user.email}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible enviar la invitación.");
    } finally {
      setInvitingUserId(null);
    }
  }

  async function removeUser(user: UserRow) {
    if (!confirm(`¿Eliminar a ${user.name}?`)) return;
    try {
      await api(`/security/users/${user.id}`, { method: "DELETE" });
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible eliminar el usuario.");
    }
  }

  async function removeRole(role: RoleRow) {
    if (!confirm(`¿Eliminar el rol ${role.name}?`)) return;
    try {
      await api(`/security/roles/${role.id}`, { method: "DELETE" });
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible eliminar el rol.");
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--brand)]">Administración de acceso</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Usuarios, roles y permisos</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Los permisos efectivos combinan los heredados por rol y los asignados directamente al usuario.</p>
        </div>
        <button
          onClick={() => tab === "users" ? setEditingUser({ ...emptyUser }) : setEditingRole({ ...emptyRole })}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 text-sm font-semibold text-white"
        >
          <Plus size={18} /> {tab === "users" ? "Nuevo usuario" : "Nuevo rol"}
        </button>
      </header>

      <div className="flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
        <button onClick={() => setTab("users")} className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${tab === "users" ? "bg-[var(--brand)] text-white" : "text-[var(--muted)]"}`}>
          <Users size={18} /> Usuarios
        </button>
        <button onClick={() => setTab("roles")} className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${tab === "roles" ? "bg-[var(--brand)] text-white" : "text-[var(--muted)]"}`}>
          <ShieldCheck size={18} /> Roles
        </button>
      </div>

      {message && <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">{message}</div>}

      {loading ? (
        <div className="py-16 text-center text-sm text-[var(--muted)]">Cargando seguridad…</div>
      ) : tab === "users" ? (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-[var(--app-bg)] text-left text-xs uppercase tracking-wide text-[var(--muted)]">
                <tr><th className="px-4 py-3">Usuario</th><th className="px-4 py-3">Roles</th><th className="px-4 py-3">Permisos directos</th><th className="px-4 py-3">Permisos efectivos</th><th className="px-4 py-3 text-right">Acciones</th></tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-4"><strong className="block">{user.name}</strong><span className="block text-[var(--muted)]">{user.email}</span><span className="text-xs text-[var(--muted)]">{user.whatsapp || "Sin WhatsApp"}</span></td>
                    <td className="px-4 py-4">{user.roles.join(", ") || "—"}</td>
                    <td className="px-4 py-4">{user.permissions.length}</td>
                    <td className="px-4 py-4">{user.effective_permissions.length}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {user.can_impersonate && (
                          <button
                            onClick={() => void impersonateUser(user)}
                            disabled={impersonatingUserId === user.id}
                            className="grid size-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--accent)] transition hover:bg-[var(--accent-soft)] disabled:cursor-wait disabled:opacity-50"
                            title={impersonatingUserId === user.id ? "Iniciando sesión…" : "Iniciar sesión como este usuario"}
                            aria-label={`Iniciar sesión como ${user.name}`}
                          >
                            <LogIn size={16}/>
                          </button>
                        )}
                        <button
                          onClick={() => void inviteUser(user)}
                          disabled={invitingUserId === user.id}
                          className="grid size-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--brand)] transition hover:bg-[var(--brand-soft)] disabled:cursor-wait disabled:opacity-50"
                          title={invitingUserId === user.id ? "Enviando invitación…" : "Enviar invitación a GaspronalApp"}
                          aria-label={`Enviar invitación a GaspronalApp a ${user.name}`}
                        >
                          <Send size={16}/>
                        </button>
                        <button onClick={() => setEditingUser({ id: user.id, name: user.name, email: user.email, whatsapp: user.whatsapp ?? "", roles: [...user.roles], permissions: [...user.permissions] })} className="grid size-9 place-items-center rounded-lg border border-[var(--border)]" title="Editar"><Pencil size={16}/></button>
                        {!user.protected && <button onClick={() => void removeUser(user)} className="grid size-9 place-items-center rounded-lg border border-[var(--border)] text-red-600" title="Eliminar"><Trash2 size={16}/></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-[var(--app-bg)] text-left text-xs uppercase tracking-wide text-[var(--muted)]">
                <tr><th className="px-4 py-3">Rol</th><th className="px-4 py-3">Permisos</th><th className="px-4 py-3 text-right">Acciones</th></tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td className="px-4 py-4"><strong>{role.name}</strong>{role.protected && <span className="ml-2 rounded-full bg-[var(--brand-soft)] px-2 py-1 text-xs text-[var(--brand)]">protegido</span>}</td>
                    <td className="px-4 py-4">{role.permissions.length} permisos</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button disabled={role.protected} onClick={() => setEditingRole({ id: role.id, name: role.name, permissions: [...role.permissions] })} className="grid size-9 place-items-center rounded-lg border border-[var(--border)] disabled:opacity-30" title="Editar"><Pencil size={16}/></button>
                        {!["root","admin"].includes(role.name) && <button onClick={() => void removeRole(role)} className="grid size-9 place-items-center rounded-lg border border-[var(--border)] text-red-600" title="Eliminar"><Trash2 size={16}/></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
          <div className="mb-5 flex items-center gap-3"><UserCog className="text-[var(--brand)]"/><div><h2 className="font-bold">{editingUser.id ? "Editar usuario" : "Nuevo usuario"}</h2><p className="text-sm text-[var(--muted)]">Asigna roles y, si hace falta, excepciones directas por usuario.</p></div></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="text-sm font-medium">Nombre<input value={editingUser.name} onChange={e=>setEditingUser({...editingUser,name:e.target.value})} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/></label>
            <label className="text-sm font-medium">Correo<input type="email" value={editingUser.email} onChange={e=>setEditingUser({...editingUser,email:e.target.value})} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/></label>
            <label className="text-sm font-medium">WhatsApp<input type="tel" inputMode="tel" autoComplete="tel" placeholder="+573115000926" value={editingUser.whatsapp ?? ""} onChange={e=>setEditingUser({...editingUser,whatsapp:e.target.value.replace(/\\s/g, "")})} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/><span className="mt-1 block text-xs font-normal text-[var(--muted)]">Formato internacional E.164, por ejemplo +573115000926.</span></label>
          </div>
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-bold">Roles</h3>
            <div className="flex flex-wrap gap-3">{roles.filter(role => role.name !== "root" || editingUser.roles.includes("root")).map(role=><label key={role.id} className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"><input type="checkbox" checked={editingUser.roles.includes(role.name)} disabled={role.name === "root"} onChange={()=>toggle(role.name,editingUser.roles,v=>setEditingUser({...editingUser,roles:v}))}/>{role.name}</label>)}</div>
          </div>
          <PermissionGrid grouped={grouped} selected={editingUser.permissions} onToggle={(p)=>toggle(p,editingUser.permissions,v=>setEditingUser({...editingUser,permissions:v}))}/>
          <div className="mt-6 flex justify-end gap-2"><button onClick={()=>setEditingUser(null)} className="min-h-11 rounded-xl border border-[var(--border)] px-4 text-sm font-semibold">Cancelar</button><button onClick={()=>void saveUser()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--brand)] px-4 text-sm font-semibold text-white"><Save size={17}/>Guardar</button></div>
        </div>
      )}

      {editingRole && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
          <div className="mb-5 flex items-center gap-3"><KeyRound className="text-[var(--brand)]"/><div><h2 className="font-bold">{editingRole.id ? "Editar rol" : "Nuevo rol"}</h2><p className="text-sm text-[var(--muted)]">Selecciona exactamente qué puede hacer este rol.</p></div></div>
          <label className="block max-w-xl text-sm font-medium">Nombre del rol<input value={editingRole.name} onChange={e=>setEditingRole({...editingRole,name:e.target.value})} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/></label>
          <PermissionGrid grouped={grouped} selected={editingRole.permissions} onToggle={(p)=>toggle(p,editingRole.permissions,v=>setEditingRole({...editingRole,permissions:v}))}/>
          <div className="mt-6 flex justify-end gap-2"><button onClick={()=>setEditingRole(null)} className="min-h-11 rounded-xl border border-[var(--border)] px-4 text-sm font-semibold">Cancelar</button><button onClick={()=>void saveRole()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--brand)] px-4 text-sm font-semibold text-white"><Save size={17}/>Guardar</button></div>
        </div>
      )}
    </section>
  );
}

function PermissionGrid({ grouped, selected, onToggle }: { grouped: Record<string,string[]>; selected: string[]; onToggle: (permission:string)=>void }) {
  return <div className="mt-6 space-y-4">
    <h3 className="text-sm font-bold">Permisos específicos</h3>
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {Object.entries(grouped).map(([group, items]) => (
        <fieldset key={group} className="rounded-xl border border-[var(--border)] p-4">
          <legend className="px-1 text-sm font-bold">{group}</legend>
          <div className="space-y-2">{items.map(permission => <label key={permission} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.includes(permission)} onChange={()=>onToggle(permission)}/><span>{permission}</span></label>)}</div>
        </fieldset>
      ))}
    </div>
  </div>;
}
