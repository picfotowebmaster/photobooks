"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface PaymentFormProps {
  projectId: string;
  total: number;
  currency: string;
}

export function PaymentForm({ projectId, total, currency }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects/" + projectId + "/checkout", {
        method: "POST",
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
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
