import { describe, it, expect } from "vitest";
import { mapCoverRow } from "@/lib/pricing/config";

describe("mapCoverRow", () => {
  it("convierte snake_case de la BD a la forma camelCase del cliente", () => {
    const mapped = mapCoverRow({
      id: "abc",
      key: "pasta_dura",
      name: "Pasta Dura",
      description: "Pasta dura",
      image_url: "https://example.com/cover.jpg",
      price: 12.5,
      sort_order: 4,
      is_active: true,
    });

    expect(mapped).toEqual({
      id: "abc",
      key: "pasta_dura",
      name: "Pasta Dura",
      description: "Pasta dura",
      imageUrl: "https://example.com/cover.jpg",
      price: 12.5,
      sortOrder: 4,
      isActive: true,
    });
  });

  it("normaliza price numérico y conserva nulls", () => {
    const mapped = mapCoverRow({
      id: "x",
      key: "k",
      name: "n",
      description: null,
      image_url: null,
      price: "9.99" as unknown as number,
      sort_order: 2,
      is_active: false,
    });

    expect(mapped.price).toBe(9.99);
    expect(mapped.description).toBeNull();
    expect(mapped.imageUrl).toBeNull();
    expect(mapped.isActive).toBe(false);
  });
});
