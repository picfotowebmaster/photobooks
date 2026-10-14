import { useCallback, useEffect, useState } from "react";
import type { Template } from "@/types/template";

export function useTemplates(format: string | null) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    if (!format) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`/api/templates?format=${encodeURIComponent(format)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar plantillas");
        return res.json();
      })
      .then(({ data }) => {
        setTemplates((data as Template[]) ?? []);
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        setTemplates([]);
        setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [format, requestId]);

  const retry = useCallback(() => {
    setRequestId((id) => id + 1);
  }, []);

  return { templates, loading, error, retry };
}
