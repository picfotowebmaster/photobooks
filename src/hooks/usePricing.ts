"use client";

import { useEffect, useMemo, useState } from "react";
import { calculatePricing } from "@/lib/pricing/calculator";
import { DEFAULT_PRICING_CONFIG } from "@/lib/pricing/defaults";
import type { PricingConfig, PricingInput } from "@/types/pricing";

let cachedConfig: PricingConfig | null = null;

/**
 * Drop the cached pricing config so the next consumer refetches it.
 * Call after an admin edits prices or cover types.
 */
export function invalidatePricingConfig() {
  cachedConfig = null;
}

export function usePricingConfig() {
  const [config, setConfig] = useState<PricingConfig>(
    cachedConfig ?? DEFAULT_PRICING_CONFIG
  );
  const [loading, setLoading] = useState(!cachedConfig);

  useEffect(() => {
    if (cachedConfig) return;
    let active = true;

    fetch("/api/pricing/config")
      .then((res) => res.json())
      .then(({ data }: { data?: PricingConfig }) => {
        if (active && data) {
          cachedConfig = data;
          setConfig(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { config, loading };
}

export function usePricing(input: PricingInput) {
  const { config, loading } = usePricingConfig();

  const pricing = useMemo(() => {
    try {
      return calculatePricing(input, config);
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input.totalPages, input.coverType, input.format, config]);

  return { pricing, config, loading };
}
