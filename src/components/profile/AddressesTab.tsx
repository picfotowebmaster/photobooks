"use client";

import { useState } from "react";
import { Pencil, Trash2, MapPin, Star, Plus } from "lucide-react";
import type { Address } from "@/types/profile";

interface AddressesTabProps {
  addresses: Address[];
  onRefresh: () => void;
}

const emptyForm = {
  label: "Casa",
  full_name: "",
  phone: "",
  street: "",
  ext_number: "",
  int_number: "",
  neighborhood: "",
  city: "",
  state: "",
  zip: "",
};

export function AddressesTab({ addresses, onRefresh }: AddressesTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (addr: Address) => {
    setForm({
      label: addr.label,
      full_name: addr.full_name || "",
      phone: addr.phone || "",
      street: addr.street,
      ext_number: addr.ext_number || "",
      int_number: addr.int_number || "",
      neighborhood: addr.neighborhood || "",
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    const url = editingId
      ? `/api/profile/addresses/${editingId}`
      : "/api/profile/addresses";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowForm(false);
      onRefresh();
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    await fetch(`/api/profile/addresses/${id}`, { method: "DELETE" });
    onRefresh();
  };

  const toggleDefault = async (addr: Address) => {
    await fetch(`/api/profile/addresses/${addr.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_default: !addr.is_default }),
    });
    onRefresh();
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const input = (field: string, placeholder: string, label: string, required = false) => (
    <div>
      <label className="text-xs text-neutral-500">{label}{required && " *"}</label>
      <input
        value={form[field as keyof typeof form] || ""}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder}
        className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
        required={required}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Mis direcciones</h2>
        <button
          onClick={openNew}
          className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </div>

      {addresses.length === 0 && !showForm && (
        <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center text-neutral-400">
          <MapPin className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>No tienes direcciones guardadas.</p>
          <p className="text-sm mt-1">Agrega una dirección de envío para tus fotolibros.</p>
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {addresses.map((addr) => (
          <div key={addr.id} className="bg-white rounded-xl border border-neutral-200 p-4 relative">
            {addr.is_default && (
              <span className="absolute top-3 right-3 flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-amber-500" /> Principal
              </span>
            )}
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-neutral-400" />
              <span className="font-medium text-sm text-neutral-900">{addr.label}</span>
            </div>
            {addr.full_name && <p className="text-sm text-neutral-700">{addr.full_name}</p>}
            {addr.phone && <p className="text-sm text-neutral-500">{addr.phone}</p>}
            <p className="text-sm text-neutral-600 mt-1">
              {addr.street}
              {addr.ext_number && ` #${addr.ext_number}`}
              {addr.int_number && ` Int. ${addr.int_number}`}
            </p>
            {addr.neighborhood && <p className="text-sm text-neutral-600">{addr.neighborhood}</p>}
            <p className="text-sm text-neutral-600">
              {addr.city}, {addr.state}, CP {addr.zip}
            </p>
            <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-100">
              <button
                onClick={() => openEdit(addr)}
                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900"
              >
                <Pencil className="w-3 h-3" /> Editar
              </button>
              <button
                onClick={() => remove(addr.id)}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" /> Eliminar
              </button>
              {!addr.is_default && (
                <button
                  onClick={() => toggleDefault(addr)}
                  className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700"
                >
                  <Star className="w-3 h-3" /> Hacer principal
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-indigo-200 p-6">
          <h3 className="text-sm font-semibold text-neutral-900 mb-4">
            {editingId ? "Editar dirección" : "Nueva dirección"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-500">Etiqueta</label>
              <select
                value={form.label}
                onChange={(e) => updateField("label", e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white"
              >
                <option>Casa</option>
                <option>Oficina</option>
                <option>Otro</option>
              </select>
            </div>
            {input("full_name", "Nombre de quien recibe", "Nombre completo")}
            {input("phone", "Teléfono de contacto", "Teléfono")}
            {input("street", "Calle", "Calle", true)}
            <div className="grid grid-cols-2 gap-2">
              {input("ext_number", "Número exterior", "Núm. ext.", true)}
              {input("int_number", "Número interior", "Núm. int.")}
            </div>
            {input("neighborhood", "Colonia", "Colonia")}
            {input("city", "Ciudad", "Ciudad", true)}
            {input("state", "Estado", "Estado", true)}
            {input("zip", "Código Postal", "C.P.", true)}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={save}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar"}
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
  );
}
