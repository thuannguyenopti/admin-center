"use client";

import { Box, Button, Text, Tooltip } from "@optiaxiom/react";
import { IconFileLines, IconEye, IconPen, IconDownload } from "@optiaxiom/icons";

type CanvasOutputCardProps = {
  title?: string;
  subtitle?: string;
  onOpen?: () => void;
};

export function CanvasOutputCard({
  title = "ODP Product Launch — Content Angles",
  subtitle = "Content canvas · 8 angles",
  onOpen = () => window.dispatchEvent(new CustomEvent("opal-open-canvas")),
}: CanvasOutputCardProps) {
  return (
    <Box
      display="flex"
      rounded="lg"
      style={{
        padding: "14px 16px",
        border: "1px solid var(--ax-colors-border-secondary)",
        background: "var(--ax-colors-bg-default)",
        cursor: "pointer",
        transition: "background 0.15s",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "center",
      }}
      onClick={onOpen}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--ax-colors-bg-secondary)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--ax-colors-bg-default)")}
    >
      {/* Thumbnail + text — flex together, min-width so they wrap before getting too small */}
      <Box display="flex" alignItems="center" gap="12" style={{ flex: "1 1 200px", minWidth: 0 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          rounded="sm"
          style={{ width: 40, height: 40, background: "var(--ax-colors-bg-accent-subtle)", flexShrink: 0 }}
        >
          <IconFileLines size={20} style={{ color: "var(--ax-colors-fg-secondary)" }} />
        </Box>
        <Box display="flex" flexDirection="column" style={{ minWidth: 0 }}>
          <Text
            fontSize="md"
            fontWeight="600"
            color="fg.default"
            style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {title}
          </Text>
          <Text fontSize="sm" color="fg.tertiary">{subtitle}</Text>
        </Box>
      </Box>

      {/* Actions — flex-shrink: 0 so they don't compress, wrap below text on narrow screens */}
      <Box
        display="flex"
        alignItems="center"
        gap="4"
        style={{ flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip content="Preview" delayDuration={300}>
          <Button appearance="subtle" size="md" icon={<IconEye size={18} style={{ color: "var(--ax-colors-fg-tertiary)" }} />} aria-label="Preview" />
        </Tooltip>
        <Tooltip content="Edit" delayDuration={300}>
          <Button appearance="subtle" size="md" icon={<IconPen size={18} style={{ color: "var(--ax-colors-fg-tertiary)" }} />} aria-label="Edit" />
        </Tooltip>
        <Button appearance="default" size="md" icon={<IconDownload size={16} />} iconPosition="end" onClick={onOpen}>
          Download
        </Button>
      </Box>
    </Box>
  );
}
