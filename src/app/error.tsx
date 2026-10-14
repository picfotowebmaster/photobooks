"use client";

import { Button } from "@/components/ui/Button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-neutral-50 px-6 text-center">
      <p className="text-6xl font-bold text-neutral-900">Ups</p>
      <p className="text-lg text-neutral-600">
        Algo salió mal. Inténtalo de nuevo.
      </p>
      <Button onClick={() => reset()}>Reintentar</Button>
    </div>
  );
}
