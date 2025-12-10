"use client";

import { Box } from "@optiaxiom/react";
import { IconDots } from "@tabler/icons-react";
import FileIcon from "@/app/assets/file-icon.svg";

interface MediaCardProps {
  imageUrl: string;
  title: string;
  altText?: string;
}

export default function MediaCard({ imageUrl, title, altText }: MediaCardProps) {
  return (
    <Box
      style={{
        border: "1px solid #E9EDF5",
        borderRadius: "12px",
        overflow: "hidden",
        width: "100%",
        backgroundColor: "#fff",
      }}
    >
      {/* Thumbnail */}
      <Box style={{ width: "100%", height: "132px", overflow: "hidden" }}>
        <img
          src={imageUrl}
          alt={altText || title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Box>

      {/* Content */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px="16"
        py="12"
        gap="8"
      >
        <Box display="flex" alignItems="center" gap="8" style={{ flex: 1, minWidth: 0 }}>
          <FileIcon width={12} height={16} />
          <Box
            fontSize="sm"
            fontWeight="500"
            color="fg.default"
            style={{
              letterSpacing: "-0.10px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Box>
        </Box>
        <Box
          style={{
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            borderRadius: "6px",
          }}
          className="hover:bg-[#091E4208]"
        >
          <IconDots size={16} color="#4F576E" />
        </Box>
      </Box>
    </Box>
  );
}