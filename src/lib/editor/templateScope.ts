import type { PageTemplate } from "@/types/editor";

export type TemplateScope = "page" | "spread" | "all";

export interface ResolveTemplatePagesInput {
  scope: TemplateScope;
  /** Single page used when scope is "page" */
  targetPage: number;
  leftPage: number;
  rightPage: number;
  totalPages: number;
}

/**
 * Resolve which page indexes a template should be applied to.
 * - "page": only the active page
 * - "spread": both pages of the current spread
 * - "all": every page of the book
 */
export function resolveTemplatePages({
  scope,
  targetPage,
  leftPage,
  rightPage,
  totalPages,
}: ResolveTemplatePagesInput): number[] {
  const inRange = (page: number) => page >= 0 && page < totalPages;

  if (scope === "all") {
    return Array.from({ length: Math.max(0, totalPages) }, (_, i) => i);
  }

  if (scope === "spread") {
    return [leftPage, rightPage].filter(inRange);
  }

  return inRange(targetPage) ? [targetPage] : [];
}

/**
 * Split a spread template's slots into the ones belonging to the left page and
 * the ones belonging to the right page.
 *
 * A slot with `span: "spread"` (a single photo across the gutter) is rendered
 * from the left page. Slots without an explicit `page` are treated as left.
 */
export function partitionSpreadSlots<
  T extends { page?: 0 | 1; span?: "spread" },
>(slots: T[]): { left: T[]; right: T[] } {
  return {
    left: slots.filter((slot) => slot.span === "spread" || slot.page !== 1),
    right: slots.filter((slot) => slot.span !== "spread" && slot.page === 1),
  };
}

/**
 * Return the template as it must be stored on a given page. Page templates are
 * returned untouched; spread templates are split so each page only keeps its
 * own slots (the left page also carries the cross-gutter `span` slots).
 */
export function pageTemplateForPage(
  template: PageTemplate,
  pageIndex: number
): PageTemplate {
  if ((template.scope ?? "page") !== "spread") return template;
  const { left, right } = partitionSpreadSlots(template.slots);
  return {
    ...template,
    slots: pageIndex % 2 === 0 ? left : right,
  };
}
