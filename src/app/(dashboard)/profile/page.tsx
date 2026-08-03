"use client";

import { useEffect, useState, useCallback } from "react";
import { User, MapPin, FileText, CreditCard } from "lucide-react";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { PersonalInfoTab } from "@/components/profile/PersonalInfoTab";
import { AddressesTab } from "@/components/profile/AddressesTab";
import { BillingTab } from "@/components/profile/BillingTab";
import { PaymentsTab } from "@/components/profile/PaymentsTab";
import type { Profile, Address } from "@/types/profile";

const tabs = [
  { id: "personal", label: "Datos personales", icon: User },
  { id: "addresses", label: "Direcciones", icon: MapPin },
  { id: "billing", label: "Facturación", icon: FileText },
  { id: "payments", label: "Pagos", icon: CreditCard },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("personal");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const res = await fetch("/api/profile");
    if (res.ok) {
      const d = await res.json();
      setProfile(d.data);
    }
  }, []);

  const fetchAddresses = useCallback(async () => {
    const res = await fetch("/api/profile/addresses");
    if (res.ok) {
      const d = await res.json();
      setAddresses(d.data || []);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchProfile(), fetchAddresses()]).finally(() => setLoading(false));
  }, [fetchProfile, fetchAddresses]);

  const handleProfileUpdate = (updated: Profile) => {
    setProfile(updated);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-neutral-400">Cargando perfil...</div>;
  }
  if (!profile) {
    return <div className="text-neutral-500">Error al cargar perfil.</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Mi Perfil</h1>

      <ProfileTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "personal" && (
        <PersonalInfoTab profile={profile} onUpdate={handleProfileUpdate} />
      )}
      {activeTab === "addresses" && (
        <AddressesTab addresses={addresses} onRefresh={fetchAddresses} />
      )}
      {activeTab === "billing" && (
        <BillingTab profile={profile} onUpdate={handleProfileUpdate} />
      )}
      {activeTab === "payments" && (
        <PaymentsTab />
      )}
    </div>
  );
}
