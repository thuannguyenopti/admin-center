"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Input,
  SegmentedControl,
  SegmentedControlItem,
  Text,
} from "@optiaxiom/react";
import {
  browseChannels,
  createChannel,
  createDM,
  createGroup,
  joinChannel,
  searchUsers,
} from "../lib/service";
import { CURRENT_USER_ID } from "../lib/adapters";
import { UserAvatar } from "./UserAvatar";
import type { ChannelDirectoryEntry, UserProfile } from "../lib/types";

type Mode = "dm" | "group" | "channel";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (conversationId: string) => void;
  initialMode?: Mode;
};

export function NewChatDialog({ open, onOpenChange, onCreated, initialMode = "dm" }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [groupName, setGroupName] = useState("");
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [channelType, setChannelType] = useState<"public_channel" | "private_channel">(
    "public_channel",
  );
  const [directory, setDirectory] = useState<ChannelDirectoryEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    void searchUsers().then((resp) => {
      setUsers(resp.users.filter((u) => u.user_id !== CURRENT_USER_ID));
    });
    void browseChannels().then((resp) => setDirectory(resp.channels));
  }, [open]);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
    } else {
      setSelected(new Set());
      setGroupName("");
      setChannelName("");
      setChannelDescription("");
      setChannelType("public_channel");
      setQuery("");
    }
  }, [open, initialMode]);

  // When user switches modes, clear selection-y state but keep the search box.
  useEffect(() => {
    setSelected(new Set());
  }, [mode]);

  const filteredUsers = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        u.display_name.toLowerCase().includes(q) ||
        u.user_id.toLowerCase().includes(q),
    );
  }, [users, query]);

  const filteredDirectory = useMemo(() => {
    if (!query.trim()) return directory;
    const q = query.toLowerCase();
    return directory.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q),
    );
  }, [directory, query]);

  const toggle = (userId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const isGroupSize = mode === "dm" && selected.size >= 2;

  const canSubmit = (() => {
    if (submitting) return false;
    if (mode === "dm") {
      if (selected.size === 0) return false;
      if (selected.size === 1) return true;
      return groupName.trim().length > 0;
    }
    if (mode === "channel") return channelName.trim().length > 0;
    return false;
  })();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      if (mode === "dm") {
        if (selected.size === 1) {
          const [userId] = [...selected];
          const conv = await createDM(userId);
          onCreated(conv.id);
        } else {
          const ids = [...selected];
          const conv = await createGroup(groupName.trim(), ids);
          onCreated(conv.id);
        }
      } else if (mode === "channel") {
        const conv = await createChannel(
          channelName.trim(),
          channelType,
          channelDescription.trim() || undefined,
        );
        onCreated(conv.id);
      }
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (convId: string) => {
    setSubmitting(true);
    try {
      await joinChannel(convId);
      onCreated(convId);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const submitLabel = (() => {
    if (mode === "dm") {
      if (selected.size <= 1) return "Start chat";
      return "Create group";
    }
    return channelType === "public_channel" ? "Create channel" : "Create private channel";
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>New conversation</DialogHeader>
        <DialogBody>
          <Box display="flex" flexDirection="column" gap="12">
            <SegmentedControl
              value={mode}
              onValueChange={(v: string) => setMode((v as Mode) || "dm")}
            >
              <SegmentedControlItem value="dm">Message</SegmentedControlItem>
              <SegmentedControlItem value="channel">Channel</SegmentedControlItem>
            </SegmentedControl>

            {mode !== "channel" && (
              <>
                <Input
                  placeholder="Search people"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Box
                  style={{
                    maxHeight: 280,
                    overflowY: "auto",
                    border: "1px solid var(--ax-colors-border-secondary)",
                    borderRadius: 8,
                  }}
                >
                  {filteredUsers.length === 0 ? (
                    <Box p="16">
                      <Text color="fg.tertiary">
                        {query.trim()
                          ? `No people match "${query.trim()}"`
                          : "No people available"}
                      </Text>
                    </Box>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSelected = selected.has(u.user_id);
                      return (
                        <Box
                          key={u.user_id}
                          display="flex"
                          alignItems="center"
                          gap="12"
                          px="12"
                          py="10"
                          style={{
                            cursor: "pointer",
                            background: isSelected
                              ? "var(--ax-colors-bg-secondary)"
                              : "transparent",
                            borderBottom: "1px solid var(--ax-colors-border-tertiary)",
                          }}
                          onClick={() => toggle(u.user_id)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggle(u.user_id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <UserAvatar userId={u.user_id} name={u.display_name} size={28} />
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text fontWeight="500">{u.display_name}</Text>
                            {u.email && (
                              <Text fontSize="sm" color="fg.tertiary">
                                {u.email}
                              </Text>
                            )}
                          </Box>
                        </Box>
                      );
                    })
                  )}
                </Box>
                {mode === "dm" && isGroupSize && (
                  <Box display="flex" flexDirection="column" gap="4">
                    <Input
                      placeholder="Group name"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                    <Text fontSize="sm" color="fg.tertiary">
                      {`${selected.size} people selected — add a name to create a group`}
                    </Text>
                  </Box>
                )}
                {mode === "dm" && !isGroupSize && selected.size === 0 && (
                  <Text fontSize="sm" color="fg.tertiary">
                    Pick one person for a direct message, or add more to start a group.
                  </Text>
                )}
              </>
            )}

            {mode === "channel" && (
              <>
                <Input
                  placeholder="Channel name (e.g. roadmap)"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                />
                <Input
                  placeholder="Description (optional)"
                  value={channelDescription}
                  onChange={(e) => setChannelDescription(e.target.value)}
                />
                <SegmentedControl
                  value={channelType}
                  onValueChange={(v: string) =>
                    setChannelType((v as typeof channelType) || "public_channel")
                  }
                >
                  <SegmentedControlItem value="public_channel"># Public</SegmentedControlItem>
                  <SegmentedControlItem value="private_channel">🔒 Private</SegmentedControlItem>
                </SegmentedControl>

                {directory.length > 0 && (
                  <Box display="flex" flexDirection="column" gap="8" mt="4">
                    <Text fontSize="sm" fontWeight="500" color="fg.tertiary">
                      Or join an existing channel
                    </Text>
                    <Input
                      placeholder="Search channels"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <Box
                      style={{
                        maxHeight: 180,
                        overflowY: "auto",
                        border: "1px solid var(--ax-colors-border-secondary)",
                        borderRadius: 8,
                      }}
                    >
                      {filteredDirectory.length === 0 ? (
                        <Box p="16">
                          <Text color="fg.tertiary">
                            No channels match &ldquo;{query.trim()}&rdquo;
                          </Text>
                        </Box>
                      ) : (
                      filteredDirectory.map((c) => (
                        <Box
                          key={c.conversation_id}
                          display="flex"
                          alignItems="center"
                          gap="12"
                          px="12"
                          py="10"
                          style={{
                            borderBottom: "1px solid var(--ax-colors-border-tertiary)",
                          }}
                        >
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text fontWeight="500"># {c.name}</Text>
                            {c.description && (
                              <Text fontSize="sm" color="fg.tertiary">
                                {c.description}
                              </Text>
                            )}
                            <Text fontSize="sm" color="fg.tertiary">
                              {c.member_count} {c.member_count === 1 ? "member" : "members"}
                            </Text>
                          </Box>
                          <Button
                            appearance="subtle"
                            size="sm"
                            onClick={() => handleJoin(c.conversation_id)}
                            disabled={submitting}
                          >
                            Join
                          </Button>
                        </Box>
                      ))
                      )}
                    </Box>
                  </Box>
                )}
              </>
            )}
          </Box>
        </DialogBody>
        <DialogFooter>
          <Button appearance="subtle" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button appearance="primary" onClick={handleSubmit} disabled={!canSubmit}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
