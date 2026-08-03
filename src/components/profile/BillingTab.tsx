"use client";

import { useState, useEffect } from "react";
import { Save, FileText, Download, CreditCard } from "lucide-react";
import type { Profile, Invoice } from "@/types/profile";

interface BillingTabProps {
  profile: Profile;
  onUpdate: (profile: Profile) => void;
}

const regimenesFiscales = [
  "Persona Física con Actividad Empresarial",
  "Persona Física con Actividad Profesional",
  "Persona Física con Sueldos y Salarios",
  "Persona Moral del Régimen General",
  "Persona Moral con Fines No Lucrativos",
  "Régimen de Incorporación Fiscal",
  "Régimen Simplificado de Confianza (RESICO)",
];

const usosCFDI = [
  "Gastos en general",
  "Adquisición de mercancías",
  "Devoluciones, descuentos o bonificaciones",
  "Gastos de viaje",
  "Construcciones",
];

function formatMXN(value: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
}

export function BillingTab({ profile, onUpdate }: BillingTabProps) {
  const [rfc, setRfc] = useState(profile.rfc || "");
  const [razonSocial, setRazonSocial] = useState(profile.razon_social || "");
  const [regimenFiscal, setRegimenFiscal] = useState(profile.regimen_fiscal || "");
  const [cpFiscal, setCpFiscal] = useState(profile.cp_fiscal || "");
  const [usoCfdi, setUsoCfdi] = useState(profile.uso_cfdi || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);

  useEffect(() => {
    fetch("/api/invoices")
      .then((r) => r.json())
      .then((d) => setInvoices(d.data || []))
      .finally(() => setLoadingInvoices(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rfc,
        razon_social: razonSocial,
        regimen_fiscal: regimenFiscal,
        cp_fiscal: cpFiscal,
        uso_cfdi: usoCfdi,
      }),
    });
    if (res.ok) {
      const d = await res.json();
      onUpdate(d.data);
      setMessage("Datos de facturación guardados.");
    } else {
      setMessage("Error al guardar.");
    }
    setSaving(false);
  };

  const downloadReceipt = (inv: Invoice) => {
    window.open(`/api/invoices/${inv.id}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-1">Datos de facturación</h2>
        <p className="text-sm text-neutral-500 mb-4">
          Estos datos se usarán para generar tus recibos de compra.
        </p>

        {message && (
          <div className={`mb-4 p-3 text-sm rounded-lg ${message.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-neutral-500">RFC</label>
            <input
              value={rfc}
              onChange={(e) => setRfc(e.target.value.toUpperCase())}
              placeholder="XXXX000000XXX"
              className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm uppercase"
              maxLength={13}
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500">Razón social</label>
            <input
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              placeholder="Nombre o razón social"
              className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500">Régimen fiscal</label>
            <select
              value={regimenFiscal}
              onChange={(e) => setRegimenFiscal(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white"
            >
              <option value="">Seleccionar...</option>
              {regimenesFiscales.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-neutral-500">Código Postal fiscal</label>
            <input
              value={cpFiscal}
              onChange={(e) => setCpFiscal(e.target.value)}
              placeholder="00000"
              className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
              maxLength={5}
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-neutral-500">Uso del CFDI</label>
            <select
              value={usoCfdi}
              onChange={(e) => setUsoCfdi(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white"
            >
              <option value="">Seleccionar...</option>
              {usosCFDI.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? "Guardando..." : "Guardar datos"}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" /> Historial de recibos
        </h2>

        {loadingInvoices ? (
          <p className="text-sm text-neutral-400">Cargando...</p>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No tienes recibos aún.</p>
            <p className="text-sm mt-1">Cuando realices un pago, aparecerá aquí.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="text-left px-4 py-2 font-medium text-neutral-600">Folio</th>
                  <th className="text-left px-4 py-2 font-medium text-neutral-600">Proyecto</th>
                  <th className="text-right px-4 py-2 font-medium text-neutral-600">Total</th>
                  <th className="text-left px-4 py-2 font-medium text-neutral-600">Fecha</th>
                  <th className="text-center px-4 py-2 font-medium text-neutral-600">PDF</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const proj = (Array.isArray(inv.projects) ? inv.projects[0] : inv.projects) as { title?: string } | undefined;
                  return (
                    <tr key={inv.id} className="border-b border-neutral-100">
                      <td className="px-4 py-3 font-mono text-xs text-neutral-600">
                        {inv.invoice_number || inv.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-neutral-900">
                        {proj?.title || "Fotolibro"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatMXN(Number(inv.total_amount))}
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        {new Date(inv.paid_at || inv.created_at).toLocaleDateString("es-MX")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => downloadReceipt(inv)}
                          className="flex items-center gap-1 mx-auto text-xs text-indigo-600 hover:text-indigo-800"
                        >
                          <Download className="w-3.5 h-3.5" /> Descargar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
