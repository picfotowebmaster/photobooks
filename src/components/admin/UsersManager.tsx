"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Search, UserCog, ShieldCheck, User } from "lucide-react";
import { PageTitle } from "@/components/ui/PageTitle";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";

interface UserAccount {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface UsersResponse {
  data: UserAccount[];
  total: number;
  page: number;
  totalPages: number;
}

const roleLabels: Record<string, string> = {
  client: "Cliente",
  admin: "Administrador",
  superadmin: "Superadmin",
};

const emptyForm = {
  full_name: "",
  email: "",
  password: "",
  role: "client",
};

export function UsersManager() {
  const [response, setResponse] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    params.set("page", String(page));
    params.set("limit", "20");

    fetch(`/api/admin/users?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setResponse)
      .catch(() => setError("No se pudieron cargar los usuarios."))
      .finally(() => setLoading(false));
  }, [search, roleFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const closeModal = () => {
    setOpen(false);
    setForm(emptyForm);
    setFormError(null);
  };

  const createUser = async () => {
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(payload.error || "No se pudo crear la cuenta.");
        return;
      }
      closeModal();
      setPage(1);
      fetchUsers();
    } catch {
      setFormError("No se pudo crear la cuenta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <PageTitle>Usuarios</PageTitle>
        <Button onClick={() => setOpen(true)} className="bg-admin-600 hover:bg-admin-700">
          <Plus className="w-4 h-4 mr-2" /> Nueva cuenta
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            variant="admin"
            className="pl-10 pr-4"
          />
        </div>
        <Select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          variant="admin"
        >
          <option value="">Todos los roles</option>
          <option value="client">Clientes</option>
          <option value="admin">Administradores</option>
        </Select>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Usuario</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Rol</th>
                <th className="text-center px-4 py-3 font-medium text-neutral-600">Estado</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-600">Creado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-12"><div className="flex justify-center"><Spinner size="sm" /></div></td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="text-center py-12 text-neutral-400">{error}</td></tr>
              ) : !response?.data?.length ? (
                <tr><td colSpan={5} className="text-center py-12 text-neutral-400">No se encontraron usuarios.</td></tr>
              ) : (
                response.data.map((account) => (
                  <tr key={account.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-admin-100 flex items-center justify-center text-admin-600">
                          {account.role === "client" ? <User className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </div>
                        <span className="font-medium text-neutral-900">{account.full_name || "Sin nombre"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{account.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                        account.role === "superadmin"
                          ? "text-purple-700 bg-purple-50"
                          : account.role === "admin"
                          ? "text-admin-700 bg-admin-50"
                          : "text-neutral-600 bg-neutral-100"
                      }`}>
                        {roleLabels[account.role] || account.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium ${account.is_active ? "text-green-600" : "text-red-600"}`}>
                        {account.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-500">
                      {new Date(account.created_at).toLocaleDateString("es-MX")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {response && response.totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={response.totalPages}
            total={response.total}
            label="usuarios"
            onPageChange={setPage}
          />
        )}
      </div>

      <Modal open={open} onClose={closeModal} title="Nueva cuenta">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <UserCog className="w-4 h-4" />
            <span>Crea una cuenta de cliente o administrador.</span>
          </div>

          <div>
            <label className="text-xs text-neutral-500">Nombre completo</label>
            <Input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Nombre de la persona"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-500">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="correo@ejemplo.com"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-500">Contraseña</label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Mínimo 8 caracteres"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-500">Rol</label>
            <Select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="mt-1 w-full"
            >
              <option value="client">Cliente</option>
              <option value="admin">Administrador</option>
            </Select>
          </div>

          {formError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg" role="alert">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancelar
            </Button>
            <Button
              onClick={createUser}
              disabled={saving || !form.email || form.password.length < 8}
              className="bg-admin-600 hover:bg-admin-700"
            >
              {saving ? "Creando..." : "Crear cuenta"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
