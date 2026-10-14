"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEditorStore } from "@/stores/editorStore";
import { usePricing } from "@/hooks/usePricing";
import { DEFAULT_FORMAT } from "@/lib/editor/formats";
import { PricingSummary } from "@/components/checkout/PricingSummary";
import { PaymentForm } from "@/components/checkout/PaymentForm";
import { Spinner } from "@/components/ui/Spinner";
import { PageTitle } from "@/components/ui/PageTitle";
import type { Project } from "@/types/project";

export default function CheckoutPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const { totalPages } = useEditorStore();

  const { pricing } = usePricing({
    totalPages,
    format: project?.format ?? DEFAULT_FORMAT,
    coverType: project?.cover_type ?? "",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setProject(data as Project);
        }
        setLoading(false);
      });
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return <div className="p-8">Proyecto no encontrado</div>;
  }

  if (!pricing) {
    return <div className="p-8">No se pudo calcular el precio.</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-neutral-500 hover:text-neutral-900"
        >
          ← Volver al editor
        </button>

        <PageTitle>Pago</PageTitle>

        <PricingSummary pricing={pricing} />
        <PaymentForm
          projectId={projectId}
          total={pricing.total}
          currency={pricing.currency}
          totalPages={totalPages}
          coverType={pricing.coverType}
        />
      </div>
    </div>
  );
}
