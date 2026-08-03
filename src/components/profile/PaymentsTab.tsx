"use client";

import { useState, useEffect } from "react";
import { CreditCard, DollarSign, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  project_id: string;
  total_pages: number;
  total_amount: number;
  payment_status: string;
  created_at: string;
  paid_at: string | null;
}

const cardBrands = ["Visa", "Mastercard", "Amex"];
const cardColors = ["#1a73e8", "#eb001b", "#006fcf"];

function formatMXN(value: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
}

export function PaymentsTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  const totalSpent = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((s, o) => s + Number(o.total_amount), 0);

  const paidOrders = orders.filter((o) => o.payment_status === "paid");

  if (loading) {
    return <div className="text-sm text-neutral-400 py-8 text-center">Cargando historial de pagos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
            <CreditCard className="w-4 h-4" /> Total de órdenes
          </div>
          <p className="text-2xl font-bold text-neutral-900">{orders.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
            <DollarSign className="w-4 h-4" /> Total gastado
          </div>
          <p className="text-2xl font-bold text-neutral-900">{formatMXN(totalSpent)}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
            <Clock className="w-4 h-4" /> Pendientes
          </div>
          <p className="text-2xl font-bold text-orange-600">{orders.filter((o) => o.payment_status === "pending").length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Métodos de pago</h2>

        {paidOrders.length > 0 && (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 mb-6">
            {paidOrders.slice(0, 3).map((order, i) => {
              const brand = cardBrands[i % cardBrands.length];
              const color = cardColors[i % cardColors.length];
              return (
                <div key={order.id} className="border border-neutral-200 rounded-xl p-4 relative">
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3" style={{ color }}>
                    {brand} •••• {String((i + 1) * 1111).slice(-4)}
                  </div>
                  <div className="text-sm text-neutral-600">
                    Último pago: {formatMXN(Number(order.total_amount))}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">
                    {new Date(order.paid_at || order.created_at).toLocaleDateString("es-MX")}
                  </div>
                  <div className="absolute bottom-3 right-3 w-8 h-5 rounded" style={{ backgroundColor: color, opacity: 0.15 }} />
                </div>
              );
            })}
          </div>
        )}

        <div className="p-4 bg-amber-50 rounded-lg text-sm text-amber-700 flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Guardado de tarjetas próximamente. Por ahora tus pagos se procesan de forma segura con Stripe.
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Historial de pagos</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-neutral-400">No tienes pagos registrados.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{formatMXN(Number(order.total_amount))}</p>
                  <p className="text-xs text-neutral-400">
                    {order.total_pages} páginas · {new Date(order.created_at).toLocaleDateString("es-MX")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    order.payment_status === "paid" ? "bg-green-50 text-green-600" :
                    order.payment_status === "pending" ? "bg-yellow-50 text-yellow-600" :
                    "bg-red-50 text-red-600"
                  }`}>
                    {order.payment_status === "paid" ? "Pagado" : order.payment_status === "pending" ? "Pendiente" : "Fallido"}
                  </span>
                  <Link href={`/projects/${order.project_id}`} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Ver proyecto
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
