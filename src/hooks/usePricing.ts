import { calculatePricing, validatePageCount } from "@/lib/pricing/calculator";
import { useMemo } from "react";
import type { PricingInput } from "@/types/pricing";

export function usePricing(input: PricingInput) {
  return useMemo(() => {
    if (!validatePageCount(input.totalPages)) {
      return null;
    }
    return calculatePricing(input);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input.totalPages, input.coverType, input.format]);
}
