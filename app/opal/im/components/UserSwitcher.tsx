"use client";

import { useEffect, useState } from "react";
import {
  Box,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Text,
} from "@optiaxiom/react";
import { IconAngleDown } from "@optiaxiom/icons";
import { searchUsers } from "../lib/service";
import {
  getCurrentUserId,
  setCurrentUserId,
  subscribeToCurrentUser,
} from "../lib/currentUser";
import { isVAU } from "../lib/virtualTeammates";
import { UserAvatar } from "./UserAvatar";
import type { UserProfile } from "../lib/types";

export function UserSwitcher() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentId, setCurrentId] = useState<string>(getCurrentUserId());

  useEffect(() => {
    void searchUsers().then((resp) => setUsers(resp.users));
    return subscribeToCurrentUser((id) => setCurrentId(id));
  }, []);

  const current = users.find((u) => u.user_id === currentId);
  const humans = users.filter((u) => !isVAU(u.user_id) && u.user_id !== "opal-bot");
  const vaus = users.filter((u) => isVAU(u.user_id));

  const handlePick = (userId: string) => {
    if (userId === currentId) return;
    setCurrentUserId(userId);
    // Hard reload so cached conversation state refetches under the new identity.
    if (typeof window !== "undefined") window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Box
          display="flex"
          alignItems="center"
          gap="8"
          px="8"
          py="6"
          style={{
            cursor: "pointer",
            borderRadius: 6,
            border: "1px solid var(--opal-border-input)",
            background: "var(--ax-colors-bg-default)",
            transition: "background 0.15s ease",
          }}
        >
          <UserAvatar userId={currentId} name={current?.display_name ?? currentId} size={24} />
          <Box style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
            <Text fontSize="sm" fontWeight="500">
              {current?.display_name ?? currentId}
            </Text>
            <Text color="fg.tertiary" style={{ fontSize: 11 }}>
              {isVAU(currentId) ? "Virtual teammate" : "Acting as"}
            </Text>
          </Box>
          <IconAngleDown size={14} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
        </Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" style={{ minWidth: 240 }}>
        <Box px="12" py="6">
          <Text fontSize="sm" fontWeight="500" color="fg.tertiary">
            People
          </Text>
        </Box>
        {humans.map((u) => (
          <DropdownMenuItem key={u.user_id} onClick={() => handlePick(u.user_id)}>
            <Box display="flex" alignItems="center" gap="12" w="full">
              <UserAvatar userId={u.user_id} name={u.display_name} size={24} />
              <Text>{u.display_name}</Text>
              {u.user_id === currentId && (
                <Text fontSize="sm" color="fg.tertiary" style={{ marginLeft: "auto" }}>
                  active
                </Text>
              )}
            </Box>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <Box px="12" py="6">
          <Text fontSize="sm" fontWeight="500" color="fg.tertiary">
            Virtual teammates
          </Text>
        </Box>
        {vaus.map((u) => (
          <DropdownMenuItem key={u.user_id} onClick={() => handlePick(u.user_id)}>
            <Box display="flex" alignItems="center" gap="12" w="full">
              <UserAvatar userId={u.user_id} name={u.display_name} size={24} />
              <Text>{u.display_name}</Text>
              {u.user_id === currentId && (
                <Text fontSize="sm" color="fg.tertiary" style={{ marginLeft: "auto" }}>
                  active
                </Text>
              )}
            </Box>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
