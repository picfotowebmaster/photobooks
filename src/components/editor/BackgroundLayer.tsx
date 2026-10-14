"use client";

import { useEffect, useState } from "react";
import { Rect, Image as KonvaImage } from "react-konva";
import type { PageBackground } from "@/types/editor";
import { getPatternById } from "@/types/pattern";
import { getPatternTileImage, loadImage } from "@/lib/editor/patternRenderer";
import { withSupabaseAssetApiKey } from "@/lib/supabase/assetUrl";

interface BackgroundLayerProps {
  width: number;
  height: number;
  x?: number;
  y?: number;
  background?: PageBackground;
}

export function BackgroundLayer({
  width,
  height,
  x = 0,
  y = 0,
  background,
}: BackgroundLayerProps) {
  const bg: PageBackground = background ?? { type: "color", color: "#ffffff" };
  const baseColor = bg.color ?? "#ffffff";

  const [patternImage, setPatternImage] = useState<HTMLImageElement | null>(null);
  const [textureImage, setTextureImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let active = true;

    if (bg.type === "pattern" && bg.patternId) {
      const pattern = getPatternById(bg.patternId);
      if (pattern) {
        setPatternImage(null);
        getPatternTileImage(
          pattern,
          bg.tintBase ?? "#e5e7eb",
          bg.tintAccent ?? "#3b82f6"
        )
          .then((img) => {
            if (active) setPatternImage(img);
          })
          .catch(() => {});
      }
    }

    if (bg.type === "image" && bg.imageUrl) {
      setTextureImage(null);
      loadImage(withSupabaseAssetApiKey(bg.imageUrl))
        .then((img) => {
          if (active) setTextureImage(img);
        })
        .catch(() => {});
    }

    return () => {
      active = false;
    };
  }, [bg.type, bg.patternId, bg.imageUrl, bg.tintBase, bg.tintAccent]);

  if (bg.type === "color") {
    return (
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={baseColor}
        perfectDrawEnabled={false}
        shadowForStrokeEnabled={false}
        listening={false}
      />
    );
  }

  if (bg.type === "pattern") {
    const tile = bg.mode !== "stretch";
    if (tile) {
      return (
        <>
          <Rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={baseColor}
            perfectDrawEnabled={false}
            shadowForStrokeEnabled={false}
            listening={false}
          />
          <Rect
            x={x}
            y={y}
            width={width}
            height={height}
            fillPatternImage={patternImage ?? undefined}
            fillPatternRepeat="repeat"
            perfectDrawEnabled={false}
            shadowForStrokeEnabled={false}
            listening={false}
          />
        </>
      );
    }
    return (
      <>
        <Rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={baseColor}
          perfectDrawEnabled={false}
          shadowForStrokeEnabled={false}
          listening={false}
        />
        {patternImage && (
          <KonvaImage
            x={x}
            y={y}
            width={width}
            height={height}
            image={patternImage}
            listening={false}
          />
        )}
      </>
    );
  }

  if (bg.type === "image") {
    const tile = bg.mode !== "stretch";
    if (tile) {
      return (
        <>
          <Rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={baseColor}
            perfectDrawEnabled={false}
            shadowForStrokeEnabled={false}
            listening={false}
          />
          <Rect
            x={x}
            y={y}
            width={width}
            height={height}
            fillPatternImage={textureImage ?? undefined}
            fillPatternRepeat="repeat"
            perfectDrawEnabled={false}
            shadowForStrokeEnabled={false}
            listening={false}
          />
        </>
      );
    }
    return (
      <>
        <Rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={baseColor}
          perfectDrawEnabled={false}
          shadowForStrokeEnabled={false}
          listening={false}
        />
        {textureImage && (
          <KonvaImage
            x={x}
            y={y}
            width={width}
            height={height}
            image={textureImage}
            listening={false}
          />
        )}
      </>
    );
  }

  return null;
}
