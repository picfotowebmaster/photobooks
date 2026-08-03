"use client";

import { useState } from "react";
import { Mail, Phone, Calendar, User, Save } from "lucide-react";
import type { Profile } from "@/types/profile";

interface PersonalInfoTabProps {
  profile: Profile;
  onUpdate: (profile: Profile) => void;
}

export function PersonalInfoTab({ profile, onUpdate }: PersonalInfoTabProps) {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const save = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, phone }),
    });
    if (res.ok) {
      const d = await res.json();
      onUpdate(d.data);
      setEditing(false);
      setMessage("Perfil actualizado.");
    } else {
      setMessage("Error al actualizar.");
    }
    setSaving(false);
  };

  const initials = (profile.full_name || profile.email)[0].toUpperCase();

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600">
          {initials}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">{profile.full_name || "Sin nombre"}</h2>
          <div className="flex items-center gap-1 mt-1 text-sm text-neutral-500">
            <Mail className="w-3.5 h-3.5" /> {profile.email}
          </div>
          <div className="flex items-center gap-1 mt-1 text-sm text-neutral-500">
            <Calendar className="w-3.5 h-3.5" /> Miembro desde {new Date(profile.created_at).toLocaleDateString("es-MX")}
          </div>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 text-sm rounded-lg ${message.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {message}
        </div>
      )}

      {editing ? (
        <div className="space-y-4 p-4 bg-neutral-50 rounded-lg">
          <div>
            <label className="text-xs text-neutral-500 flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Nombre completo
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
              placeholder="Tu nombre completo"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> Teléfono
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
              placeholder="Tu número de teléfono"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? "Guardando..." : "Guardar"}
            </button>
            <button onClick={() => setEditing(false)} className="px-4 py-2 border border-neutral-300 text-sm rounded-lg hover:bg-neutral-50">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-neutral-400" />
            <span className="text-neutral-600">{profile.full_name || "Sin nombre"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-neutral-400" />
            <span className="text-neutral-600">{profile.phone || "No especificado"}</span>
          </div>
          <button onClick={() => setEditing(true)} className="mt-4 px-4 py-2 border border-neutral-300 text-sm rounded-lg hover:bg-neutral-50">
            Editar perfil
          </button>
        </div>
      )}
    </div>
  );
}
