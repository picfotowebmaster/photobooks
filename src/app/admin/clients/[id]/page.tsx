"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Ban, CheckCircle, Mail, Phone, Calendar, FolderOpen, CreditCard } from "lucide-react";
import Link from "next/link";

interface ClientDetail {
  client: {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    role: string;
    is_active: boolean;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
  };
  projects: {
    id: string;
    title: string;
    format: string;
    status: string;
    cover_type: string;
    created_at: string;
    updated_at: string;
  }[];
  orders: {
    id: string;
    project_id: string;
    total_pages: number;
    total_amount: number;
    payment_status: string;
    cover_surcharge: number;
    extra_pages_cost: number;
    created_at: string;
    paid_at: string | null;
  }[];
}

function formatMXN(value: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
}

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  paid: "Pagado",
  exported: "Exportado",
};
const paymentStatusLabels: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  failed: "Fallido",
};

export default function AdminClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchClient = () => {
    fetch(`/api/admin/clients/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setFullName(d.client.full_name || "");
        setEmail(d.client.email || "");
        setPhone(d.client.phone || "");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const toggleBan = async () => {
    if (!data) return;
    const res = await fetch(`/api/admin/clients/${data.client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !data.client.is_active }),
    });
    if (res.ok) fetchClient();
  };

  const saveProfile = async () => {
    if (!data) return;
    setSaving(true);
    const res = await fetch(`/api/admin/clients/${data.client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, email, phone }),
    });
    if (res.ok) {
      fetchClient();
      setEditing(false);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-neutral-400">Cargando...</div>;
  }
  if (!data) return null;

  const { client, projects, orders } = data;

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900">
        <ArrowLeft className="w-4 h-4" /> Volver a clientes
      </button>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
              {(client.full_name || client.email)[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-neutral-900">
                  {client.full_name || "Sin nombre"}
                </h1>
                {client.is_active ? (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Activo
                  </span>
                ) : (
                  <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full flex items-center gap-1">
                    <Ban className="w-3 h-3" /> Baneado
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1 text-sm text-neutral-500">
                <Mail className="w-3.5 h-3.5" /> {client.email}
              </div>
              {client.phone && (
                <div className="flex items-center gap-1 mt-1 text-sm text-neutral-500">
                  <Phone className="w-3.5 h-3.5" /> {client.phone}
                </div>
              )}
              <div className="flex items-center gap-1 mt-1 text-sm text-neutral-500">
                <Calendar className="w-3.5 h-3.5" /> Registrado: {new Date(client.created_at).toLocaleDateString("es-MX")}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50"
            >
              {editing ? "Cancelar" : "Editar"}
            </button>
            <button
              onClick={toggleBan}
              className={`px-3 py-1.5 text-sm rounded-lg text-white ${
                client.is_active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {client.is_active ? "Banear" : "Activar"}
            </button>
          </div>
        </div>

        {editing && (
          <div className="mt-6 p-4 bg-neutral-50 rounded-lg space-y-3">
            <div>
              <label className="text-xs text-neutral-500">Nombre completo</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500">Teléfono</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
              />
            </div>
            <button
              onClick={saveProfile}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center gap-2">
            <FolderOpen className="w-4 h-4" /> Proyectos ({projects.length})
          </h2>
          {projects.length === 0 ? (
            <p className="text-sm text-neutral-400">No tiene proyectos.</p>
          ) : (
            <div className="space-y-2">
              {projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{p.title}</p>
                    <p className="text-xs text-neutral-400">{p.format} · {statusLabels[p.status] || p.status} · {p.cover_type === "hard" ? "Tapa dura" : "Tapa blanda"}</p>
                  </div>
                  <span className="text-xs text-neutral-500">{new Date(p.created_at).toLocaleDateString("es-MX")}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Órdenes ({orders.length})
          </h2>
          {orders.length === 0 ? (
            <p className="text-sm text-neutral-400">No tiene órdenes.</p>
          ) : (
            <div className="space-y-2">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{formatMXN(Number(o.total_amount))}</p>
                    <p className="text-xs text-neutral-400">
                      {o.total_pages} páginas · {paymentStatusLabels[o.payment_status] || o.payment_status}
                      {o.paid_at && ` · ${new Date(o.paid_at).toLocaleDateString("es-MX")}`}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    o.payment_status === "paid" ? "bg-green-50 text-green-600" :
                    o.payment_status === "pending" ? "bg-yellow-50 text-yellow-600" :
                    "bg-red-50 text-red-600"
                  }`}>
                    {paymentStatusLabels[o.payment_status] || o.payment_status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
