"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Order {
  id: string;
  project_id: string;
  total_pages: number;
  total_amount: number;
  payment_status: string;
  created_at: string;
  paid_at: string | null;
}

interface OrdersResponse {
  data: Order[];
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

export default function MyOrdersPage() {
  const [response, setResponse] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "10");

    fetch(`/api/orders?${params}`)
      .then((r) => r.json())
      .then(setResponse)
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Mis Órdenes</h1>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Total</th>
                <th className="text-center px-4 py-3 font-medium text-neutral-600">Páginas</th>
                <th className="text-center px-4 py-3 font-medium text-neutral-600">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-12 text-neutral-400">Cargando...</td></tr>
              ) : !response?.data.length ? (
                <tr><td colSpan={4} className="text-center py-12 text-neutral-400">No tienes órdenes aún.</td></tr>
              ) : (
                response.data.map((order) => (
                  <tr key={order.id} className="border-b border-neutral-100">
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
                ))
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
