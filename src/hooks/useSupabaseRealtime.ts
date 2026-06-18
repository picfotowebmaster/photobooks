"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useSupabaseRealtime<T extends Record<string, unknown>>(
  channel: string,
  table: string,
  event: "INSERT" | "UPDATE" | "DELETE" = "UPDATE",
  filter?: string
) {
  const [payload, setPayload] = useState<RealtimePostgresChangesPayload<T> | null>(null);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  useEffect(() => {
    const subscription = supabase
      .channel(channel)
      .on(
        "postgres_changes" as never,
        {
          event,
          schema: "public",
          table,
          ...(filter ? { filter } : {}),
        },
        (p: RealtimePostgresChangesPayload<T>) => {
          setPayload(p);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, channel, table, event, filter]);

  return payload;
}
