"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Input,
  Text,
} from "@optiaxiom/react";
import { searchUsers, addParticipant } from "../lib/service";
import { UserAvatar } from "./UserAvatar";
import type { UserProfile } from "../lib/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  existingMemberIds: string[];
  onAdded?: () => void;
};

export function AddMemberDialog({
  open,
  onOpenChange,
  conversationId,
  existingMemberIds,
  onAdded,
}: Props) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    void searchUsers().then((resp) => {
      setUsers(resp.users.filter((u) => !existingMemberIds.includes(u.user_id)));
    });
  }, [open, existingMemberIds]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        u.display_name.toLowerCase().includes(q) ||
        u.user_id.toLowerCase().includes(q),
    );
  }, [users, query]);

  const handleAdd = async (userId: string) => {
    setAdding(userId);
    try {
      await addParticipant(conversationId, userId);
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
      onAdded?.();
    } finally {
      setAdding(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>Add people</DialogHeader>
        <DialogBody>
          <Box display="flex" flexDirection="column" gap="12">
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
              {filtered.length === 0 ? (
                <Box p="16">
                  <Text color="fg.tertiary">No one left to add</Text>
                </Box>
              ) : (
                filtered.map((u) => (
                  <Box
                    key={u.user_id}
                    display="flex"
                    alignItems="center"
                    gap="12"
                    px="12"
                    py="10"
                    style={{
                      borderBottom: "1px solid var(--ax-colors-border-tertiary)",
                    }}
                  >
                    <UserAvatar userId={u.user_id} name={u.display_name} size={28} />
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text fontWeight="500">{u.display_name}</Text>
                      {u.email && (
                        <Text fontSize="sm" color="fg.tertiary">
                          {u.email}
                        </Text>
                      )}
                    </Box>
                    <Button
                      appearance="subtle"
                      size="sm"
                      onClick={() => handleAdd(u.user_id)}
                      disabled={adding === u.user_id}
                    >
                      {adding === u.user_id ? "Adding…" : "Add"}
                    </Button>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        </DialogBody>
        <DialogFooter>
          <Button appearance="primary" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
