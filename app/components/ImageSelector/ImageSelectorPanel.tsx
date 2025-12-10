"use client";

import { Box, Button, Menu, MenuTrigger, MenuContent } from "@optiaxiom/react";
import { IconDots } from "@tabler/icons-react";
import { useState } from "react";
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

  return (
    <Box
      bg="bg.page"
      borderL="1"
      borderColor="border.tertiary"
      style={{
        width: "300px",
        height: "100%",
        maxHeight: "100%",
        display: "flex",
        flexDirection: "column",
        animation: "slideIn 0.3s ease-out",
      }}
    >
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
            <button
              className="border border-[#CACFDC] rounded-md px-3 py-2 flex items-center gap-2 cursor-pointer bg-white"
              style={{ height: "40px", borderRadius: "6px" }}
            >
              <Box display="flex" flexDirection="column" gap="2" alignItems="start">
                <Box
                  fontSize="xs"
                  color="fg.secondary"
                  style={{ lineHeight: "14px", letterSpacing: "0.05px" }}
                >
                  Source
                </Box>
                <Box
                  fontSize="sm"
                  color="fg.default"
                  style={{ lineHeight: "16px", letterSpacing: "0.01px" }}
                >
                  {sourceFilter}
                </Box>
              </Box>
              <ChevronDownIcon width={11} height={5} />
            </button>
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