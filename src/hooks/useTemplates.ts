import { useEffect, useState } from "react";
import type { Template } from "@/types/template";

export function useTemplates(format: string | null) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!format) return;

    setLoading(true);
    setError(null);

    fetch(`/api/templates?format=${encodeURIComponent(format)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar plantillas");
        return res.json();
      })
      .then(({ data }) => {
        setTemplates((data as Template[]) ?? []);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [format]);

  return { templates, loading, error };
}
