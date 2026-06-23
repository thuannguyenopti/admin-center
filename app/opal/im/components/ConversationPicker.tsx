"use client";

import { useMemo } from "react";
import {
  Box,
  Menu,
  MenuContent,
  type MenuOption,
  MenuTrigger,
  Text,
} from "@optiaxiom/react";
import { IconAngleDown } from "@optimizely/axiom-icons";
import type { ConversationIndexEntry } from "../lib/types";
import { conversationTitle } from "../lib/adapters";

type Props = {
  conversations: ConversationIndexEntry[];
  profiles: Record<string, string>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewChat?: () => void;
};

export function ConversationPicker({
  conversations,
  profiles,
  selectedId,
  onSelect,
  onNewChat,
}: Props) {
  const selected = conversations.find((c) => c.conversation_id === selectedId);
  const label = selected ? conversationTitle(selected, profiles) : "Select a conversation";

  const options: MenuOption[] = useMemo(() => {
    const opts: MenuOption[] = conversations.map((c) => ({
      label: conversationTitle(c, profiles),
      execute: () => onSelect(c.conversation_id),
    }));
    if (onNewChat) {
      opts.push({ label: "+ New conversation", execute: onNewChat });
    }
    return opts;
  }, [conversations, profiles, onSelect, onNewChat]);

  return (
    <Box
      px="20"
      py="12"
      style={{
        borderBottom: "1px solid var(--ax-colors-border-secondary)",
        background: "var(--ax-colors-bg-default)",
      }}
    >
      <Menu options={options}>
        <MenuTrigger asChild>
          <Box
            asChild
            display="inline-flex"
            alignItems="center"
            gap="8"
            px="12"
            py="6"
            rounded="md"
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            <button
              type="button"
              style={{
                background: "transparent",
                border: "1px solid var(--ax-colors-border-secondary)",
              }}
            >
              <Text fontSize="md" fontWeight="600">
                {label}
              </Text>
              <IconAngleDown size={14} />
            </button>
          </Box>
        </MenuTrigger>
        <MenuContent />
      </Menu>
    </Box>
  );
}
