"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface PaymentFormProps {
  projectId: string;
  total: number;
  currency: string;
  totalPages: number;
  coverType: string;
}

export function PaymentForm({
  projectId,
  total,
  currency,
  totalPages,
  coverType,
}: PaymentFormProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects/" + projectId + "/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalPages, coverType }),
      });
      const payload = await res.json();
      if (!res.ok) {
        alert(payload.error || "No se pudo iniciar el pago");
        return;
      }
      if (payload.url) window.location.href = payload.url;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-lg font-semibold">
        <span>Total a pagar</span>
        <span>
          {total.toFixed(2)} {currency}
        </span>
      </div>
      <Button onClick={handleCheckout} disabled={loading} className="w-full" size="lg">
        {loading ? "Redirigiendo..." : "Pagar con Stripe"}
      </Button>
    </div>
  );
}
