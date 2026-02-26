"use client";

import { Box, Button } from "@optiaxiom/react";
import { Text } from "../Text";
import { Input } from "../Input";
import { OpalHistoryItem } from "./OpalHistoryItem";
import { ChatHistoryItem } from "@/app/hooks/useOpalHistory";
import IconSearch from "@/app/assets/opal/icon-search.svg";
import { IconCirclePlus } from "@optimizely/axiom-icons";
import { opalTypography } from "@/app/styles/opalTypography";

type OpalHistorySidebarProps = {
  groupedHistory: { [key: string]: ChatHistoryItem[] };
  activeChat: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  mode: 'docked' | 'popped-out';
  isVisible: boolean;
};

export function OpalHistorySidebar({
  groupedHistory,
  activeChat,
  searchQuery,
  onSearchChange,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  mode,
  isVisible,
}: OpalHistorySidebarProps) {
  const sidebarWidth = mode === 'docked' ? '272px' : '256px';

  return (
    <Box
      className="opal-history-sidebar"
      style={{
        width: isVisible ? sidebarWidth : '0px',
        height: '100%',
        backgroundColor: 'var(--opal-bg-sidebar)',
        borderRight: isVisible ? '1px solid var(--opal-border-secondary)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: isVisible ? '16px' : '0px',
        overflow: 'hidden',
        transition: 'width 0.3s cubic-bezier(0, 1, 0, 1), padding 0.3s cubic-bezier(0, 1, 0, 1), border 0.3s cubic-bezier(0, 1, 0, 1)',
        visibility: isVisible ? 'visible' : 'hidden',
      }}
    >
      {/* Search and New Chat */}
      <Box display="flex" flexDirection="row" gap="2" alignItems="center" justifyContent="space-between">
        <Button
          appearance="subtle"
          size="md"
          aria-label="Search"
          style={{
            width: '32px',
            height: '32px',
            padding: 0,
            borderRadius: '6px',
            minWidth: '32px',
            flexShrink: 0,
          }}
        >
          <IconSearch style={{ width: '16px', height: '16px' }} />
        </Button>

        <Box
          onClick={onNewChat}
          style={{
            height: '32px',
            borderRadius: '6px',
            border: '1px solid var(--opal-border-input)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '0 12px',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            transition: 'background-color 0.2s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--opal-bg-history-active)';
            e.currentTarget.style.borderColor = 'var(--opal-border-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'var(--opal-border-input)';
          }}
        >
          <IconCirclePlus size={16} style={{ flexShrink: 0 }} />
          <Text
            style={{
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '-0.10px',
              fontFamily: 'Inter, sans-serif',
              margin: 0,
              color: 'var(--opal-text-primary)',
            }}
          >
            New chat
          </Text>
        </Box>
      </Box>

      {/* Chat History Groups */}
      <Box display="flex" flexDirection="column" gap="16" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {Object.entries(groupedHistory).map(([dateLabel, items]) => {
          if (items.length === 0) return null;

          return (
            <Box key={dateLabel} display="flex" flexDirection="column" gap="8">
              <Text
                style={{
                  ...opalTypography.disclaimer,
                  margin: 0,
                  color: 'var(--opal-text-secondary)',
                }}
              >
                {dateLabel}
              </Text>
              <Box display="flex" flexDirection="column" gap="4">
                {items.map(item => (
                  <OpalHistoryItem
                    key={item.id}
                    item={item}
                    isActive={activeChat === item.id}
                    onClick={() => onSelectChat(item.id)}
                    onDelete={() => onDeleteChat(item.id)}
                  />
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}