"use client";

import { Box, Button } from "@optiaxiom/react";
import { Text } from "../Text";
import { ChatHistoryItem } from "@/app/hooks/useOpalHistory";
import { useState } from "react";
import IconSmile from "@/app/assets/opal/icon-smile.svg";
import IconRedDot from "@/app/assets/opal/icon-red-dot.svg";
import { IconDots, IconTrash } from "@tabler/icons-react";
import { IconBell } from "@optiaxiom/icons";

type OpalHistoryItemProps = {
  item: ChatHistoryItem;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function AvatarTile({
  url,
  name,
  size,
}: {
  url?: string;
  name: string;
  size: number;
}) {
  const common: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    flexShrink: 0,
    background: "var(--ax-colors-bg-avatar-purple)",
    overflow: "hidden",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };
  if (url) {
    return (
      <span style={common}>
        <img
          src={url}
          alt={name}
          width={size}
          height={size}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </span>
    );
  }
  return (
    <span style={common}>
      <span
        style={{
          fontSize: Math.max(10, Math.floor(size * 0.4)),
          fontWeight: 700,
          color: "var(--ax-colors-fg-avatar-purple)",
          fontFamily: "Inter, sans-serif",
          letterSpacing: "0.02em",
        }}
      >
        {initials(name)}
      </span>
    </span>
  );
}

export function OpalHistoryItem({ item, isActive, onClick, onDelete }: OpalHistoryItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Single avatar: DMs use the participant's PNG; groups fall back to title
  // initials in one tile rather than stacking multiple participant tiles.
  const isGroup = !!item.avatarStack && item.avatarStack.length > 0;
  const singleAvatar: { name: string; url?: string } | null = item.avatarUrl
    ? { name: item.title, url: item.avatarUrl }
    : isGroup
      ? { name: item.title }
      : null;
  const TILE_SIZE = 32;

  return (
    <Box
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: 'pointer',
        padding: '8px 8px',
        backgroundColor: isActive ? 'var(--opal-bg-history-active)' : 'transparent',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        transition: 'background-color 0.2s ease',
        marginLeft: '-8px',
        marginRight: '-8px',
      }}
    >
      {singleAvatar && (
        <Box display="flex" alignItems="center" style={{ flexShrink: 0 }}>
          <AvatarTile url={singleAvatar.url} name={singleAvatar.name} size={TILE_SIZE} />
        </Box>
      )}
      <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Text
          style={{
            fontSize: '14px',
            fontWeight: 400,
            letterSpacing: '-0.13px',
            color: 'var(--opal-text-body)',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.title.startsWith('🔒 ') ? (
            <>
              <span style={{ fontSize: '11px', marginRight: 0 }}>🔒</span>
              {item.title.slice(2)}
            </>
          ) : (
            item.title
          )}
        </Text>
        {(() => {
          // Channels render with a "# " or "🔒 " prefix in the title — indent
          // the preview so its text lines up with the channel name, not the prefix.
          const channelPrefix = /^(#\s|🔒\s)/.test(item.title);
          const previewIndent = !singleAvatar && channelPrefix ? 12 : 0;
          if (item.needsInput) {
            return (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--ax-colors-fg-link-default, #226b1e)',
                  paddingLeft: previewIndent,
                }}
              >
                <IconBell size={12} />
                Needs input
              </span>
            );
          }
          if (item.preview) {
            return (
              <Text
                style={{
                  fontSize: '12px',
                  fontWeight: 400,
                  color: 'var(--ax-colors-fg-tertiary)',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  paddingLeft: previewIndent,
                }}
              >
                {item.preview}
              </Text>
            );
          }
          return null;
        })()}
      </Box>

      <Box
        display="flex" 
        alignItems="center" 
        gap="4"
        style={{
          minWidth: 'auto',
          justifyContent: 'flex-end',
          height: '24px',
          flexShrink: 0,
        }}
      >
        <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isHovered && (
            <Button
              appearance="subtle"
              size="sm"
              aria-label="More options"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={{
                width: '24px',
                height: '24px',
                padding: 0,
                minWidth: 'auto',
              }}
            >
              <IconTrash size={16} />
            </Button>
          )}
        </div>
      </Box>
    </Box>
  );
}