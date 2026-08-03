"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface OrderRow {
  id: string;
  user_id: string;
  project_id: string;
  total_pages: number;
  total_amount: number;
  payment_status: string;
  created_at: string;
  paid_at: string | null;
  profiles?: { email: string; full_name: string }[];
}

interface OrdersResponse {
  data: OrderRow[];
  total: number;
  page: number;
  totalPages: number;
}

const paymentStatusLabels: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  failed: "Fallido",
};

function formatMXN(value: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
}

export default function AdminOrdersPage() {
  const [response, setResponse] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    params.set("page", String(page));
    params.set("limit", "20");

    fetch(`/api/admin/orders?${params}`)
      .then((r) => r.json())
      .then(setResponse)
      .finally(() => setLoading(false));
  }, [status, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Órdenes</h1>

      <div className="flex gap-3">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white"
        >
          <option value="">Todas</option>
          <option value="pending">Pendientes</option>
          <option value="paid">Pagadas</option>
          <option value="failed">Fallidas</option>
        </select>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Total</th>
                <th className="text-center px-4 py-3 font-medium text-neutral-600">Páginas</th>
                <th className="text-center px-4 py-3 font-medium text-neutral-600">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-neutral-400">Cargando...</td></tr>
              ) : !response?.data.length ? (
                <tr><td colSpan={5} className="text-center py-12 text-neutral-400">No se encontraron órdenes.</td></tr>
              ) : (
                response.data.map((order) => {
                  const profile = order.profiles?.[0] as Record<string, unknown> | undefined;
                  return (
                    <tr key={order.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <Link href={`/admin/clients/${order.user_id}`} className="text-indigo-600 hover:text-indigo-800 capitalize">
                            {(profile?.full_name as string) || (profile?.email as string) || "—"}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{formatMXN(Number(order.total_amount))}</td>
                      <td className="px-4 py-3 text-center">{order.total_pages}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          order.payment_status === "paid" ? "bg-green-50 text-green-600" :
                          order.payment_status === "pending" ? "bg-yellow-50 text-yellow-600" :
                          "bg-red-50 text-red-600"
                        }`}>
                          {paymentStatusLabels[order.payment_status] || order.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        {new Date(order.created_at).toLocaleDateString("es-MX")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {response && response.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
            <span className="text-sm text-neutral-500">
              Página {response.page} de {response.totalPages} ({response.total} órdenes)
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
