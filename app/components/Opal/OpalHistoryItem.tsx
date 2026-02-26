"use client";

import { Box, Button } from "@optiaxiom/react";
import { Text } from "../Text";
import { ChatHistoryItem } from "@/app/hooks/useOpalHistory";
import { useState } from "react";
import IconSmile from "@/app/assets/opal/icon-smile.svg";
import IconRedDot from "@/app/assets/opal/icon-red-dot.svg";
import { IconDots, IconTrash } from "@tabler/icons-react";

type OpalHistoryItemProps = {
  item: ChatHistoryItem;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
};

export function OpalHistoryItem({ item, isActive, onClick, onDelete }: OpalHistoryItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: 'pointer',
        padding: '8px 16px',
        backgroundColor: isActive ? 'var(--opal-bg-history-active)' : 'transparent',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        transition: 'background-color 0.2s ease',
      }}
    >
      <Text
        style={{
          fontSize: '12px',
          fontWeight: 400,
          letterSpacing: '-0.13px',
          color: 'var(--opal-text-body)',
          margin: 0,
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {item.title}
      </Text>
      
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