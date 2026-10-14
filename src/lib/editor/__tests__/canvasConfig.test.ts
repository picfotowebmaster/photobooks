import { describe, expect, it } from "vitest";
import { clampZoom, MAX_ZOOM, MIN_ZOOM, stepZoom } from "@/lib/editor/canvasConfig";

describe("canvas zoom controls", () => {
  it("steps in consistent tenths without floating-point drift", () => {
    expect(stepZoom(1, 1)).toBe(1.1);
    expect(stepZoom(1.1, -1)).toBe(1);
  });

  it("clamps zoom changes to supported limits", () => {
    expect(stepZoom(MIN_ZOOM, -1)).toBe(MIN_ZOOM);
    expect(stepZoom(MAX_ZOOM, 1)).toBe(MAX_ZOOM);
    expect(clampZoom(2.4)).toBe(MAX_ZOOM);
    expect(clampZoom(0.1)).toBe(MIN_ZOOM);
  });
});
