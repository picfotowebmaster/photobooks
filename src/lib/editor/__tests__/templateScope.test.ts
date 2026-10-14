import { describe, it, expect } from "vitest";
import { partitionSpreadSlots, resolveTemplatePages } from "@/lib/editor/templateScope";

describe("resolveTemplatePages", () => {
  const base = { targetPage: 2, leftPage: 2, rightPage: 3, totalPages: 10 };

  it("devuelve solo la página activa con scope 'page'", () => {
    expect(resolveTemplatePages({ ...base, scope: "page" })).toEqual([2]);
    expect(
      resolveTemplatePages({ ...base, scope: "page", targetPage: 3 })
    ).toEqual([3]);
  });

  it("devuelve ambas páginas del pliego con scope 'spread'", () => {
    expect(resolveTemplatePages({ ...base, scope: "spread" })).toEqual([2, 3]);
  });

  it("devuelve todas las páginas con scope 'all'", () => {
    expect(resolveTemplatePages({ ...base, scope: "all", totalPages: 4 })).toEqual(
      [0, 1, 2, 3]
    );
  });

  it("ignora páginas fuera de rango", () => {
    expect(
      resolveTemplatePages({
        scope: "spread",
        targetPage: 0,
        leftPage: 8,
        rightPage: 9,
        totalPages: 9,
      })
    ).toEqual([8]);
    expect(
      resolveTemplatePages({ ...base, scope: "page", targetPage: 99 })
    ).toEqual([]);
  });
});

describe("partitionSpreadSlots", () => {
  it("separa los slots por página y deja el span en la izquierda", () => {
    const { left, right } = partitionSpreadSlots([
      { page: 0 as const },
      { page: 1 as const },
      { page: 0 as const, span: "spread" as const },
      {},
    ]);
    expect(left).toHaveLength(3);
    expect(right).toHaveLength(1);
  });
});
