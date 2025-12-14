"use client";

import { Box, Button, Menu, MenuTrigger, MenuContent, LabelMenuButton } from "@optiaxiom/react";
import { IconDots, IconArrowsHorizontal } from "@tabler/icons-react";
import { useState, useRef } from "react";
import ImageCard from "./ImageCard";
import { mockImages } from "./mockImageData";
import PopOutIcon from "@/app/assets/pop-out-icon.svg";
import CloseIcon from "@/app/assets/close-icon.svg";
import ChevronDownIcon from "@/app/assets/chevron-down-icon.svg";
import SearchIcon from "@/app/assets/search-icon.svg";
import FilterIcon from "@/app/assets/filter-icon.svg";
import ViewIcon from "@/app/assets/view-icon.svg";

interface ImageSelectorPanelProps {
  onClose: () => void;
}

export default function ImageSelectorPanel({ onClose }: ImageSelectorPanelProps) {
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>("CMS");
  const [panelWidth, setPanelWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = panelWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX; // Inverted because we're resizing from left
      const newWidth = Math.max(300, Math.min(400, startWidth + delta));
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <Box
      ref={panelRef}
      bg="bg.page"
      borderL="1"
      borderColor="border.tertiary"
      style={{
        width: `${panelWidth}px`,
        height: "100%",
        maxHeight: "100%",
        display: "flex",
        flexDirection: "column",
        animation: "slideIn 0.3s ease-out",
        position: "relative",
        transition: isResizing ? "none" : "width 0.1s ease",
      }}
    >
      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "8px",
          cursor: "col-resize",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        className="group hover:bg-blue-500/10 transition-colors"
      >
        <div
          style={{
            width: "2px",
            height: "40px",
            background: "rgba(0, 0, 0, 0.1)",
            borderRadius: "1px",
            transition: "all 0.2s ease",
          }}
          className="group-hover:bg-blue-500 group-hover:h-12"
        />
      </div>
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px="24"
        py="24"
        style={{ flexShrink: 0 }}
      >
        <Box
          fontSize="md"
          fontWeight="600"
          color="fg.default"
          style={{ letterSpacing: "-0.20px" }}
        >
          Select Image
        </Box>
        <Box display="flex" gap="4">
          <Button
            appearance="subtle"
            size="sm"
            aria-label="More options"
            style={{ borderRadius: "6px" }}
          >
            <IconDots size={16} />
          </Button>
          <Button
            appearance="subtle"
            size="sm"
            aria-label="Pop out"
            style={{ borderRadius: "6px" }}
          >
            <PopOutIcon width={16} height={16} />
          </Button>
          <Button
            appearance="subtle"
            size="sm"
            aria-label="Close"
            onClick={onClose}
            style={{ borderRadius: "6px" }}
          >
            <CloseIcon width={10} height={10} />
          </Button>
        </Box>
      </Box>

      {/* Controls Row */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px="24"
        pb="16"
        gap="8"
        style={{ flexShrink: 0 }}
      >
        {/* Source Dropdown */}
        <Menu
          options={[
            { label: "CMS", execute: () => setSourceFilter("CMS") },
            { label: "Library", execute: () => setSourceFilter("Library") },
            { label: "Uploads", execute: () => setSourceFilter("Uploads") },
          ]}
        >
          <MenuTrigger asChild>
            <LabelMenuButton label="Source" h="40">
              {sourceFilter}
            </LabelMenuButton>
          </MenuTrigger>
          <MenuContent />
        </Menu>

        {/* Action Buttons */}
        <Box display="flex" gap="4">
          <Button
            appearance="subtle"
            size="sm"
            aria-label="Search"
            style={{ borderRadius: "6px" }}
          >
            <SearchIcon width={16} height={16} />
          </Button>
          <Button
            appearance="subtle"
            size="sm"
            aria-label="Filter"
            style={{ borderRadius: "6px" }}
          >
            <FilterIcon width={16} height={16} />
          </Button>
          <Button
            appearance="subtle"
            size="sm"
            aria-label="View options"
            style={{ borderRadius: "6px" }}
          >
            <ViewIcon width={16} height={16} />
          </Button>
        </Box>
      </Box>

      {/* Image Grid */}
      <Box
        px="24"
        pb="24"
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          minHeight: 0,
        }}
      >
        <Box
          display="flex"
          flexWrap="wrap"
          gap="8"
        >
          {mockImages.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              isSelected={selectedImageId === image.id}
              onSelect={setSelectedImageId}
            />
          ))}
        </Box>
      </Box>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </Box>
  );
}