"use client";

import { Box, Button, Tooltip } from "@optiaxiom/react";
import { Text } from "../Text";
import { Input } from "../Input";
import { OpalHistoryItem } from "./OpalHistoryItem";
import { ChatHistoryItem } from "@/app/hooks/useOpalHistory";
import { IconSearch, IconPen, IconPlus, IconAngleDown, IconAngleRight, IconPenToSquare } from "@/app/lib/axiom-icons";
import { opalTypography } from "@/app/styles/opalTypography";
import { useState } from "react";

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
  const imMode = typeof window !== 'undefined' && window.location.pathname.startsWith('/opal/im');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (label: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

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
          <IconSearch size={16} />
        </Button>
        
        {imMode ? (
          <Tooltip content="New Thread">
            <Button
              appearance="subtle"
              size="md"
              aria-label="New Thread"
              onClick={onNewChat}
              icon={<IconPenToSquare size={16} />}
            />
          </Tooltip>
        ) : (
          <Button
            appearance="default"
            size="md"
            onClick={onNewChat}
            icon={<IconPen size={16} />}
            style={{ whiteSpace: 'nowrap' }}
          >
            New chat
          </Button>
        )}
      </Box>

      {/* Chat History Groups */}
      <Box display="flex" flexDirection="column" gap="16" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0, scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
        {Object.entries(groupedHistory).map(([dateLabel, items]) => {
          if (items.length === 0) return null;
          const isCollapsed = collapsedSections.has(dateLabel);

          return (
            <Box key={dateLabel} display="flex" flexDirection="column" gap="4">
              {/* Section header row */}
              <Box
                display="flex"
                alignItems="center"
                style={{ gap: 2, marginLeft: '-4px' }}
              >
                <Button
                  appearance="subtle"
                  size="sm"
                  icon={isCollapsed ? <IconAngleRight size={14} /> : <IconAngleDown size={14} />}
                  aria-label={isCollapsed ? `Expand ${dateLabel}` : `Collapse ${dateLabel}`}
                  onClick={() => toggleSection(dateLabel)}
                  style={{ flexShrink: 0, padding: 0 }}
                />
                <Text
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif',
                    margin: 0,
                    flex: 1,
                    color: 'var(--opal-text-secondary)',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  onClick={() => toggleSection(dateLabel)}
                >
                  {dateLabel}
                </Text>
                <Button
                  appearance="subtle"
                  size="sm"
                  icon={<IconPlus size={14} />}
                  aria-label={`Add ${dateLabel}`}
                  style={{ flexShrink: 0, padding: 0 }}
                />
              </Box>
              {/* Items — hidden when collapsed */}
              {!isCollapsed && (
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
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
