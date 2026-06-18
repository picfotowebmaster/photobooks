"use client";

import { useEffect, useRef, useState } from "react";
import { Image as KonvaImage } from "react-konva";
import Konva from "konva";
import type { PhotoPlacement } from "@/types/editor";

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
}

export function PhotoLayer({
  photo,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
  transformerRef,
}: PhotoLayerProps) {
  const imageRef = useRef<Konva.Image>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = photo.lowResUrl;
    img.onload = () => setImage(img);
  }, [photo.lowResUrl]);

  useEffect(() => {
    if (isSelected && imageRef.current && transformerRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, transformerRef]);

  if (!image) return null;

  return (
    <KonvaImage
      ref={imageRef}
      image={image}
      x={photo.x}
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
}
