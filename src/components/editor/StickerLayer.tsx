"use client";

import { useEffect, useRef, useState } from "react";
import { Image as KonvaImage } from "react-konva";
import Konva from "konva";
import { getStickerById } from "@/types/sticker";
import type { StickerPlacement } from "@/types/editor";

interface StickerLayerProps {
  sticker: StickerPlacement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (
    x: number,
    y: number,
    scaleX: number,
    scaleY: number,
    rotation: number
  ) => void;
  transformerRef: React.RefObject<Konva.Transformer | null>;
}

export function StickerLayer({
  sticker,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
  transformerRef,
}: StickerLayerProps) {
  const imageRef = useRef<Konva.Image>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  const def = getStickerById(sticker.stickerId);

  useEffect(() => {
    if (!def) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = def.imagePath;
    img.onload = () => setImage(img);
  }, [def]);

  useEffect(() => {
    if (isSelected && imageRef.current && transformerRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, transformerRef]);

  if (!def || !image) return null;

  return (
    <KonvaImage
      ref={imageRef}
      image={image}
      x={sticker.x}
      y={sticker.y}
      width={sticker.width}
      height={sticker.height}
      scaleX={sticker.scaleX}
      scaleY={sticker.scaleY}
      rotation={sticker.rotation}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onDragEnd(e.target.x(), e.target.y());
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        onTransformEnd(
          node.x(),
          node.y(),
          node.scaleX(),
          node.scaleY(),
          node.rotation()
        );
      }}
    />
  );
}
