"use client";

import { useEffect, useState } from "react";
import {
  Users, UserCheck, DollarSign, CreditCard,
  TrendingUp, Package, Wallet,
} from "lucide-react";

interface DashboardData {
  totalClients: number;
  activeClients: number;
  newThisMonth: number;
  totalRevenue: number;
  revenueThisMonth: number;
  totalProjects: number;
  paidOrders: number;
  revenueChart: { labels: string[]; data: number[] };
  signupsChart: { labels: string[]; data: number[] };
  topClients: { full_name: string; email: string; total: number }[];
}

type CardDef = { key: string; label: string; icon: React.ElementType; color: string; bg: string; isCurrency?: boolean };

const cards: CardDef[] = [
  { key: "totalClients", label: "Total clientes", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "activeClients", label: "Activos", icon: UserCheck, color: "text-green-600", bg: "bg-green-50" },
  { key: "newThisMonth", label: "Nuevos este mes", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
  { key: "totalRevenue", label: "Ingresos totales", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", isCurrency: true },
  { key: "paidOrders", label: "Órdenes pagadas", icon: CreditCard, color: "text-orange-600", bg: "bg-orange-50" },
  { key: "totalProjects", label: "Proyectos", icon: Package, color: "text-indigo-600", bg: "bg-indigo-50" },
];

function formatMXN(value: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
}

function BarChart({ labels, data, max }: { labels: string[]; data: number[]; max: number }) {
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((val, i) => {
        const pct = max > 0 ? (val / max) * 100 : 0;
        const month = labels[i]?.split("-")[1] ? ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][parseInt(labels[i].split("-")[1]) - 1] : "";
        return (
          <div key={i} className="flex flex-col items-center flex-1 gap-1">
            <span className="text-xs text-neutral-500">{val > 0 ? `$${Math.round(val/1000)}k` : ""}</span>
            <div className="w-full bg-indigo-500 rounded-t" style={{ height: `${Math.max(pct, 2)}%` }} />
            <span className="text-xs text-neutral-400">{month}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-neutral-400">Cargando dashboard...</div>;
  }

  if (!data) return null;

  const revMax = Math.max(...data.revenueChart.data, 1);
  const signMax = Math.max(...data.signupsChart.data, 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map(({ key, label, icon: Icon, color, bg, isCurrency }) => (
          <div key={key} className={`${bg} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-sm text-neutral-600">{label}</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {isCurrency ? formatMXN(data[key as keyof DashboardData] as number) : data[key as keyof DashboardData] as number}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center gap-2">
            <Wallet className="w-4 h-4" /> Ingresos (últimos 6 meses)
          </h2>
          <BarChart labels={data.revenueChart.labels} data={data.revenueChart.data} max={revMax} />
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Nuevos clientes (últimos 6 meses)
          </h2>
          <BarChart labels={data.signupsChart.labels} data={data.signupsChart.data} max={signMax} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-sm font-semibold text-neutral-700 mb-4">Top 5 clientes por gasto</h2>
        <div className="space-y-2">
          {data.topClients.length === 0 && (
            <p className="text-sm text-neutral-400">No hay órdenes pagadas aún.</p>
          )}
          {data.topClients.map((c, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-neutral-900">{c.full_name}</p>
                <p className="text-xs text-neutral-500">{c.email}</p>
              </div>
              <span className="text-sm font-semibold text-neutral-900">{formatMXN(c.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
