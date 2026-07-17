"use client";

import { useState } from "react";
import { Box, Button, Tooltip } from "@optiaxiom/react";
import { IconPenToSquare, IconPlus, IconAngleDown, IconAngleRight } from "@optiaxiom/icons";
import { Text } from "../Text";
import { Input } from "../Input";
import { OpalHistoryItem } from "./OpalHistoryItem";
import { ChatHistoryItem } from "@/app/hooks/useOpalHistory";
import IconSearch from "@/app/assets/opal/icon-search.svg";
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
  newChatLabel?: string;
  onCreateInSection?: (sectionLabel: string) => void;
  sectionAddTooltips?: Record<string, string>;
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
  newChatLabel = 'New chat',
  onCreateInSection,
  sectionAddTooltips,
}: OpalHistorySidebarProps) {
  const sidebarWidth = mode === 'docked' ? '272px' : '256px';
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const toggleSection = (label: string) =>
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });

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
      <Box display="flex" flexDirection="row" gap="8" alignItems="center">
        <Button
          appearance="subtle"
          size="md"
          aria-label="Search"
          icon={<IconSearch />}
          style={{
            width: '32px',
            height: '32px',
            padding: 0,
            minWidth: '32px',
            flexShrink: 0,
          }}
        />

        <Tooltip content={newChatLabel} delayDuration={300}>
          <Button
            appearance="subtle"
            size="sm"
            onClick={onNewChat}
            icon={<IconPenToSquare />}
            aria-label={newChatLabel}
            style={{ marginLeft: 'auto', flexShrink: 0 }}
          />
        </Tooltip>
      </Box>

      {/* Chat History Groups */}
      <Box display="flex" flexDirection="column" gap="16" style={{ flex: 1, overflowY: 'auto', overflowX: 'clip', minHeight: 0, paddingRight: 2 }}>
        {Object.entries(groupedHistory).map(([dateLabel, items]) => {
          if (items.length === 0) return null;
          const isCollapsed = collapsedSections.has(dateLabel);

          return (
            <Box key={dateLabel} display="flex" flexDirection="column" gap="8">
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap="8"
                onClick={() => toggleSection(dateLabel)}
                style={{ cursor: "pointer", userSelect: "none" }}
              >
                <Box display="flex" alignItems="center" gap="4" style={{ minWidth: 0, flex: 1 }}>
                  {isCollapsed ? (
                    <IconAngleRight size={16} style={{ color: "var(--opal-text-secondary)", flexShrink: 0 }} />
                  ) : (
                    <IconAngleDown size={16} style={{ color: "var(--opal-text-secondary)", flexShrink: 0 }} />
                  )}
                  <Text
                    style={{
                      ...opalTypography.disclaimer,
                      fontSize: '13px',
                      fontWeight: 500,
                      margin: 0,
                      color: 'var(--opal-text-secondary)',
                    }}
                  >
                    {dateLabel}
                  </Text>
                </Box>
                {onCreateInSection && (
                  <Tooltip
                    content={sectionAddTooltips?.[dateLabel] ?? `Add to ${dateLabel}`}
                  >
                    <Button
                      appearance="subtle"
                      size="sm"
                      aria-label={sectionAddTooltips?.[dateLabel] ?? `Add to ${dateLabel}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateInSection(dateLabel);
                      }}
                      icon={<IconPlus size={14} />}
                      style={{
                        width: 20,
                        height: 20,
                        minWidth: 20,
                        padding: 0,
                        color: 'var(--opal-text-secondary)',
                      }}
                    />
                  </Tooltip>
                )}
              </Box>
              {!isCollapsed && (
                <Box display="flex" flexDirection="column" gap="4" style={{ paddingLeft: 16 }}>
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