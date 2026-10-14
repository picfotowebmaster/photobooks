"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatMXN } from "@/lib/utils/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { PageTitle } from "@/components/ui/PageTitle";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";

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

export default function AdminOrdersPage() {
  const [response, setResponse] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    params.set("page", String(page));
    params.set("limit", "20");

    fetch(`/api/admin/orders?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setResponse)
      .catch(() => setError("No se pudieron cargar las órdenes."))
      .finally(() => setLoading(false));
  }, [status, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-6">
      <PageTitle>Órdenes</PageTitle>

      <div className="flex gap-3">
        <Select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          variant="admin"
        >
          <option value="">Todas</option>
          <option value="pending">Pendientes</option>
          <option value="paid">Pagadas</option>
          <option value="failed">Fallidas</option>
        </Select>
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
                <tr><td colSpan={5} className="py-12"><div className="flex justify-center"><Spinner size="sm" /></div></td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="text-center py-12 text-neutral-400">{error}</td></tr>
              ) : !response?.data?.length ? (
                <tr><td colSpan={5} className="text-center py-12 text-neutral-400">No se encontraron órdenes.</td></tr>
              ) : (
                response.data.map((order) => {
                  const profile = order.profiles?.[0] as Record<string, unknown> | undefined;
                  return (
                    <tr key={order.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <Link href={`/admin/clients/${order.user_id}`} className="text-admin-600 hover:text-admin-800 capitalize">
                            {(profile?.full_name as string) || (profile?.email as string) || "—"}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{formatMXN(Number(order.total_amount))}</td>
                      <td className="px-4 py-3 text-center">{order.total_pages}</td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={order.payment_status} />
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
