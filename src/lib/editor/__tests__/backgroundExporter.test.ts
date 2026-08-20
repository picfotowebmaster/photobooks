import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { renderBackground } from "@/lib/editor/backgroundExporter";
import type { PageBackground } from "@/types/editor";

const pageW = 600;
const pageH = 600;

async function redPng(): Promise<ArrayBuffer> {
  const buf = await sharp({
    create: { width: 8, height: 8, channels: 3, background: { r: 255, g: 0, b: 0 } },
  })
    .png()
    .toBuffer();
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

describe("renderBackground", () => {
  it("devuelve null para tipo color", async () => {
    const bg: PageBackground = { type: "color", color: "#ffffff" };
    const result = await renderBackground(bg, pageW, pageH, async () => new ArrayBuffer(0));
    expect(result).toBeNull();
  });

  it("renderiza un patrón tile como PNG", async () => {
    const bg: PageBackground = {
      type: "pattern",
      patternId: "dots",
      tintBase: "#000000",
      tintAccent: "#ffffff",
      mode: "tile",
    };
    const result = await renderBackground(bg, pageW, pageH, async () => new ArrayBuffer(0));
    expect(result).not.toBeNull();
    expect(result?.format).toBe("PNG");
    expect(result?.dataUrl.startsWith("data:image/png;base64,")).toBe(true);
  });

  it("renderiza un patrón stretch como PNG", async () => {
    const bg: PageBackground = {
      type: "pattern",
      patternId: "stripes",
      tintBase: "#111111",
      tintAccent: "#eeeeee",
      mode: "stretch",
    };
    const result = await renderBackground(bg, pageW, pageH, async () => new ArrayBuffer(0));
    expect(result).not.toBeNull();
    expect(result?.dataUrl.startsWith("data:image/png;base64,")).toBe(true);
  });

  it("renderiza una imagen stretch usando el fetcher", async () => {
    const buffer = await redPng();
    const bg: PageBackground = {
      type: "image",
      imagePath: "user/tex.png",
      mode: "stretch",
      color: "#ffffff",
    };
    const result = await renderBackground(bg, pageW, pageH, async () => buffer);
    expect(result).not.toBeNull();
    expect(result?.dataUrl.startsWith("data:image/png;base64,")).toBe(true);
  });

  it("renderiza una imagen tile usando el fetcher", async () => {
    const buffer = await redPng();
    const bg: PageBackground = {
      type: "image",
      imagePath: "user/tex.jpg",
      mode: "tile",
    };
    const result = await renderBackground(bg, pageW, pageH, async () => buffer);
    expect(result).not.toBeNull();
    expect(result?.dataUrl.startsWith("data:image/png;base64,")).toBe(true);
  });

  it("lanza error si el patrón no existe", async () => {
    const bg: PageBackground = { type: "pattern", patternId: "nope", mode: "tile" };
    await expect(renderBackground(bg, pageW, pageH, async () => new ArrayBuffer(0))).rejects.toThrow();
  });
});
