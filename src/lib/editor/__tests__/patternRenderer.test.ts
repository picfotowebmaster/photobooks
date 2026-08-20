import { describe, it, expect } from "vitest";
import { tintSvg, svgToDataUrl } from "@/lib/editor/patternRenderer";

describe("tintSvg", () => {
  it("reemplaza el color base y el acento", () => {
    const svg = '<rect fill="#e5e7eb"/><circle fill="#3b82f6"/>';
    const result = tintSvg(svg, "#000000", "#ffffff");
    expect(result).toContain('fill="#000000"');
    expect(result).toContain('fill="#ffffff"');
    expect(result).not.toContain("#e5e7eb");
    expect(result).not.toContain("#3b82f6");
  });

  it("no modifica otros colores", () => {
    const svg = '<rect fill="#112233"/>';
    expect(tintSvg(svg, "#000000", "#ffffff")).toBe(svg);
  });

  it("no colisiona cuando el base coincide con el acento por defecto", () => {
    const svg = '<rect fill="#e5e7eb"/><circle fill="#3b82f6"/>';
    const result = tintSvg(svg, "#3b82f6", "#000000");
    expect(result).toContain('fill="#3b82f6"');
    expect(result).toContain('fill="#000000"');
    expect(result).not.toContain("#e5e7eb");
  });
});

describe("svgToDataUrl", () => {
  it("genera un data URL SVG", () => {
    const url = svgToDataUrl('<svg xmlns="http://www.w3.org/2000/svg"/>');
    expect(url.startsWith("data:image/svg+xml;utf8,")).toBe(true);
  });
});
