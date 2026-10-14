"use client";

import { useEffect, useState, useCallback } from "react";
import { formatMXN } from "@/lib/utils/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { PageTitle } from "@/components/ui/PageTitle";
import { Spinner } from "@/components/ui/Spinner";

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

export default function MyOrdersPage() {
  const [response, setResponse] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "10");

    fetch(`/api/orders?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setResponse)
      .catch(() => setError("No se pudieron cargar las órdenes."))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <div className="max-w-4xl space-y-6">
      <PageTitle>Mis Órdenes</PageTitle>

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
                <tr><td colSpan={4} className="py-12"><div className="flex justify-center"><Spinner size="sm" /></div></td></tr>
              ) : error ? (
                <tr><td colSpan={4} className="text-center py-12 text-neutral-400">{error}</td></tr>
              ) : !response?.data?.length ? (
                <tr><td colSpan={4} className="text-center py-12 text-neutral-400">No tienes órdenes aún.</td></tr>
              ) : (
                response.data.map((order) => (
                  <tr key={order.id} className="border-b border-neutral-100">
                    <td className="px-4 py-3 font-medium">{formatMXN(Number(order.total_amount))}</td>
                    <td className="px-4 py-3 text-center">{order.total_pages}</td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={order.payment_status} />
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
          <Pagination
            page={page}
            totalPages={response.totalPages}
            total={response.total}
            label="órdenes"
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
