"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Ban, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface Client {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  is_active: boolean;
  role: string;
  created_at: string;
  projectCount: number;
  totalSpent: number;
}

interface ClientsResponse {
  data: Client[];
  total: number;
  page: number;
  totalPages: number;
}

function formatMXN(value: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
}

export default function AdminClientsPage() {
  const [response, setResponse] = useState<ClientsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [banningId, setBanningId] = useState<string | null>(null);

  const fetchClients = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filter) params.set("filter", filter);
    params.set("page", String(page));
    params.set("limit", "20");

    fetch(`/api/admin/clients?${params}`)
      .then((r) => r.json())
      .then(setResponse)
      .finally(() => setLoading(false));
  }, [search, filter, page]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const toggleBan = async (client: Client) => {
    setBanningId(client.id);
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !client.is_active }),
      });
      if (res.ok) fetchClients();
    } finally {
      setBanningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Clientes</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white"
        >
          <option value="">Todos</option>
          <option value="active">Activos</option>
          <option value="banned">Baneados</option>
        </select>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Teléfono</th>
                <th className="text-center px-4 py-3 font-medium text-neutral-600">Proyectos</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-600">Total gastado</th>
                <th className="text-center px-4 py-3 font-medium text-neutral-600">Estado</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-neutral-400">Cargando...</td></tr>
              ) : !response?.data.length ? (
                <tr><td colSpan={7} className="text-center py-12 text-neutral-400">No se encontraron clientes.</td></tr>
              ) : (
                response.data.map((client) => (
                  <tr key={client.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/clients/${client.id}`} className="font-medium text-neutral-900 hover:text-indigo-600">
                        {client.full_name || "Sin nombre"}
                      </Link>
                      <p className="text-xs text-neutral-400">
                        {new Date(client.created_at).toLocaleDateString("es-MX")}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{client.email}</td>
                    <td className="px-4 py-3 text-neutral-600">{client.phone || "—"}</td>
                    <td className="px-4 py-3 text-center text-neutral-900 font-medium">{client.projectCount}</td>
                    <td className="px-4 py-3 text-right text-neutral-900 font-medium">{formatMXN(client.totalSpent)}</td>
                    <td className="px-4 py-3 text-center">
                      {client.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                          <Ban className="w-3 h-3" /> Baneado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/clients/${client.id}`}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Ver
                        </Link>
                        <button
                          onClick={() => toggleBan(client)}
                          disabled={banningId === client.id}
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            client.is_active
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {banningId === client.id ? "..." : client.is_active ? "Banear" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {response && response.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
            <span className="text-sm text-neutral-500">
              Página {response.page} de {response.totalPages} ({response.total} clientes)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= response.totalPages}
                className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
