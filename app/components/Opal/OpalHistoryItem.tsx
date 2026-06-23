"use client";

import { Box, Button } from "@optiaxiom/react";
import { Text } from "../Text";
import { ChatHistoryItem } from "@/app/hooks/useOpalHistory";
import { useState } from "react";
import { IconTrashCan, IconBell } from "@/app/lib/axiom-icons";
import { IconSparkles } from "@optimizely/axiom-icons";
import {
  InitialsAvatar,
  initialsFromName,
} from "@/app/opal/components/InitialsAvatar";

type OpalHistoryItemProps = {
  item: ChatHistoryItem;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
};

const TILE_SIZE = 32;

const CHANNEL_COLORS = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#7c3aed'];
function channelBg(name: string): string {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return CHANNEL_COLORS[Math.abs(h) % CHANNEL_COLORS.length];
}

export function OpalHistoryItem({ item, isActive, onClick, onDelete }: OpalHistoryItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isGroup = !!item.avatarStack && item.avatarStack.length > 0;
  const singleAvatar: { name: string; url?: string } | null = item.avatarUrl
    ? { name: item.title, url: item.avatarUrl }
    : (isGroup || !!item.isChannel)
      ? { name: item.title }
      : null;

  return (
    <Box
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: 'pointer',
        padding: '8px 8px 8px 20px',
        backgroundColor: isActive ? 'var(--opal-bg-history-active)' : 'transparent',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '8px',
        transition: 'background-color 0.2s ease',
        marginLeft: 0,
        marginRight: 0,
      }}
    >
      {singleAvatar && (
        <Box display="flex" alignItems="start" style={{ flexShrink: 0, position: 'relative' }}>
          {item.isChannel ? (() => {
            const chanName = singleAvatar.name.replace(/^[#🔒⚠️]\s*/, '').trim();
            return (
              <div style={{
                width: TILE_SIZE, height: TILE_SIZE, borderRadius: 8, flexShrink: 0,
                background: channelBg(chanName), display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700,
                letterSpacing: '-0.3px',
              }}>
                {chanName.slice(0, 2).toUpperCase()}
              </div>
            );
          })() : (
            <InitialsAvatar
              initials={initialsFromName(singleAvatar.name)}
              imageUrl={singleAvatar.url}
              title={singleAvatar.name}
              size={TILE_SIZE}
              withBorder={false}
            />
          )}
          {(item.presenceStatus || item.isVAU) && (
            <span style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: item.isVAU
                ? '#7c5cff'
                : item.presenceStatus === 'online' ? '#22c55e'
                : item.presenceStatus === 'away' ? '#f59e0b' : '#9ca3af',
              border: '1px solid var(--opal-bg-sidebar)',
              boxSizing: 'border-box',
            }} />
          )}
        </Box>
      )}
      <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0, marginTop: -2 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
          <Text
            style={{
              fontSize: '14px',
              fontWeight: item.hasRedDot ? 600 : 400,
              letterSpacing: '-0.13px',
              color: 'var(--opal-text-body)',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
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
          {item.isVAU && (
            <IconSparkles size={12} style={{ color: '#7c5cff', flexShrink: 0 }} />
          )}
        </span>
        {item.vauTemplateName && (
          <Text
            style={{
              fontSize: '11px',
              fontWeight: 400,
              color: 'var(--ax-colors-fg-tertiary)',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.vauTemplateName}
          </Text>
        )}
        {(() => {
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
                  color: 'var(--ax-colors-fg-information, #2E66F7)',
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
              <IconTrashCan size={16} />
            </Button>
          )}
        </div>
        {item.hasRedDot && !isHovered && (
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--ax-colors-bg-information, #2E66F7)',
            flexShrink: 0,
            display: 'inline-block',
          }} />
        )}
      </Box>
    </Box>
  );
}
