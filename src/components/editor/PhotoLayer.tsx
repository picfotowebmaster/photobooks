"use client";

import { useEffect, useRef, useState } from "react";
import { Group, Image as KonvaImage } from "react-konva";
import Konva from "konva";
import type { PhotoPlacement } from "@/types/editor";
import { withSupabaseAssetApiKey } from "@/lib/supabase/assetUrl";

interface PhotoSlot {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PhotoLayerProps {
  photo: PhotoPlacement;
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
  slot?: PhotoSlot;
  xOffset?: number;
}

export function PhotoLayer({
  photo,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
  transformerRef,
  slot,
  xOffset = 0,
}: PhotoLayerProps) {
  const imageRef = useRef<Konva.Image>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let active = true;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = withSupabaseAssetApiKey(photo.lowResUrl);
    img.onload = () => {
      if (active) setImage(img);
    };
    return () => {
      active = false;
      img.onload = null;
    };
  }, [photo.lowResUrl]);

  useEffect(() => {
    if (isSelected && imageRef.current && transformerRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, transformerRef]);

  if (!image) return null;

  const imageNode = (
    <KonvaImage
      ref={imageRef}
      image={image}
      x={photo.x + (slot ? 0 : xOffset)}
      y={photo.y}
      width={photo.width}
      height={photo.height}
      scaleX={photo.scaleX}
      scaleY={photo.scaleY}
      rotation={photo.rotation}
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

  if (!slot) return imageNode;

  return (
    <Group
      x={xOffset}
      clipX={slot.x}
      clipY={slot.y}
      clipWidth={slot.w}
      clipHeight={slot.h}
    >
      {imageNode}
    </Group>
  );
}
