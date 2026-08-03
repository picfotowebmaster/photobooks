"use client";

import { useState, useEffect, useCallback } from "react";
import { CreditCard, DollarSign, Clock, ExternalLink, Plus, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import type { SavedCard } from "@/types/profile";

interface Order {
  id: string;
  project_id: string;
  total_pages: number;
  total_amount: number;
  payment_status: string;
  created_at: string;
  paid_at: string | null;
}

const brandGradients: Record<string, string> = {
  visa: "linear-gradient(135deg, #1a56db 0%, #1e3a5f 100%)",
  mastercard: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
  amex: "linear-gradient(135deg, #1e40af 0%, #312e81 100%)",
  paypal: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  openpay: "linear-gradient(135deg, #0891b2 0%, #164e63 100%)",
};

const brandLabels: Record<string, string> = {
  visa: "VISA",
  mastercard: "MASTERCARD",
  amex: "AMEX",
  paypal: "PAYPAL",
  openpay: "OPENPAY",
};

const cardBrands = ["visa", "mastercard", "amex", "paypal", "openpay"];

function formatMXN(value: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
}

export function PaymentsTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    card_brand: "visa",
    card_number: "",
    last4: "",
    exp_month: "",
    exp_year: "",
    cardholder_name: "",
  });

  const fetchData = useCallback(async () => {
    const [ordersRes, cardsRes] = await Promise.all([
      fetch("/api/orders").then((r) => r.json()),
      fetch("/api/profile/cards").then((r) => r.json()),
    ]);
    setOrders(ordersRes.data || []);
    setCards(cardsRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveCard = async () => {
    setSaving(true);
    const last4 = form.card_number.replace(/\D/g, "").slice(-4);
    const res = await fetch("/api/profile/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, last4, card_number: undefined }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ card_brand: "visa", card_number: "", last4: "", exp_month: "", exp_year: "", cardholder_name: "" });
      fetchData();
    }
    setSaving(false);
  };

  const toggleDefault = async (card: SavedCard) => {
    await fetch(`/api/profile/cards/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_default: !card.is_default }),
    });
    fetchData();
  };

  const removeCard = async (id: string) => {
    await fetch(`/api/profile/cards/${id}`, { method: "DELETE" });
    fetchData();
  };

  const totalSpent = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((s, o) => s + Number(o.total_amount), 0);

  if (loading) {
    return <div className="text-sm text-neutral-400 py-8 text-center">Cargando...</div>;
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Tarjetas guardadas</h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </div>

        {cards.length === 0 && !showForm && (
          <div className="text-center py-8 text-neutral-400">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No tienes tarjetas guardadas.</p>
            <p className="text-sm mt-1">Agrega una tarjeta para pagos más rápidos.</p>
          </div>
        )}

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {cards.map((card) => {
            const gradient = brandGradients[card.card_brand] || brandGradients.visa;
            const label = brandLabels[card.card_brand] || card.card_brand.toUpperCase();
            return (
              <div
                key={card.id}
                className="rounded-xl p-5 text-white relative overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg"
                style={{ background: gradient, minHeight: 180 }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                {card.is_default && (
                  <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] bg-white/20 backdrop-blur px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3 fill-white" /> Principal
                  </span>
                )}

                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-6 bg-yellow-400/80 rounded opacity-80" />
                  <div className="w-5 h-5 bg-white/20 rounded" />
                </div>

                <div className="text-lg font-mono tracking-[.25em] mb-4 text-white/90">
                  •••• •••• •••• <span className="tracking-normal font-sans">{card.last4}</span>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/50 mb-0.5">Titular</p>
                    <p className="text-xs font-medium tracking-wide">{card.cardholder_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-white/50 mb-0.5">Expira</p>
                    <p className="text-xs font-medium">{card.exp_month}/{card.exp_year}</p>
                  </div>
                </div>

                <div className="absolute top-3 left-3">
                  <span className="text-[11px] font-bold tracking-wider text-white/70">{label}</span>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-white/10">
                  <button
                    onClick={() => removeCard(card.id)}
                    className="flex items-center gap-1 text-[11px] text-white/60 hover:text-white/90 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Eliminar
                  </button>
                  {!card.is_default && (
                    <button
                      onClick={() => toggleDefault(card)}
                      className="flex items-center gap-1 text-[11px] text-white/60 hover:text-white/90 transition-colors"
                    >
                      <Star className="w-3 h-3" /> Principal
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {showForm && (
          <div className="mt-4 p-4 bg-neutral-50 rounded-lg border border-indigo-200">
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">Nueva tarjeta</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-500">Marca</label>
                <select
                  value={form.card_brand}
                  onChange={(e) => setForm({ ...form, card_brand: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white"
                >
                  {cardBrands.map((b) => (
                    <option key={b} value={b}>{brandLabels[b]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-neutral-500">Nombre en la tarjeta</label>
                <input
                  value={form.cardholder_name}
                  onChange={(e) => setForm({ ...form, cardholder_name: e.target.value })}
                  placeholder="Nombre del titular"
                  className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">Número de tarjeta</label>
                <input
                  value={form.card_number}
                  onChange={(e) => setForm({ ...form, card_number: e.target.value.replace(/\D/g, "").slice(0, 16) })}
                  placeholder="1234 5678 9012 3456"
                  maxLength={16}
                  className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm font-mono"
                />
                {form.card_number.length > 0 && (
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Se guardarán solo los últimos 4 dígitos: •••• {form.card_number.replace(/\D/g, "").slice(-4) || "____"}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-neutral-500">Mes</label>
                  <input
                    value={form.exp_month}
                    onChange={(e) => setForm({ ...form, exp_month: e.target.value.slice(0, 2).replace(/\D/g, "") })}
                    placeholder="12"
                    maxLength={2}
                    className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-500">Año</label>
                  <input
                    value={form.exp_year}
                    onChange={(e) => setForm({ ...form, exp_year: e.target.value.slice(0, 4).replace(/\D/g, "") })}
                    placeholder="2028"
                    maxLength={4}
                    className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={saveCard}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar tarjeta"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-neutral-300 text-sm rounded-lg hover:bg-neutral-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
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
