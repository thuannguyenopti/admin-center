"use client";

import { Box } from "@optiaxiom/react";
import { ImageData } from "./mockImageData";

interface ImageCardProps {
  image: ImageData;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function ImageCard({ image, isSelected, onSelect }: ImageCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("image/url", image.url);
    e.dataTransfer.setData("image/id", image.id);
    e.dataTransfer.setData("image/alt", image.alt);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <Box
      onClick={() => onSelect(image.id)}
      draggable
      onDragStart={handleDragStart}
      style={{
        width: "calc((100% - 16px) / 3)",
        aspectRatio: "1",
        borderRadius: "8px",
        overflow: "hidden",
        cursor: "grab",
        border: isSelected ? "2px solid #0037FF" : "2px solid transparent",
        transition: "all 0.2s ease",
      }}
      className="hover:opacity-80 active:cursor-grabbing"
    >
      <img
        src={image.url}
        alt={image.alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </Box>
  );
}