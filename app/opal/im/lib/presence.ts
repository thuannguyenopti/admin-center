// Mock presence — real impl would poll a /presence endpoint or subscribe to
// a WebSocket feed. Only human users get a status; VAUs are always "active"
// but don't surface a presence indicator.
export type PresenceStatus = "online" | "away" | "offline";

const MOCK_PRESENCE: Record<string, PresenceStatus> = {
  jamie: "online",
  "mary-anne": "online",
  frank: "away",
  pei: "online",
};

export function getPresence(userId: string): PresenceStatus {
  return MOCK_PRESENCE[userId] ?? "offline";
}

export const PRESENCE_COLORS: Record<PresenceStatus, string> = {
  online: "var(--ax-colors-fg-success)",
  away: "var(--ax-colors-fg-warning)",
  offline: "var(--ax-colors-fg-disabled)",
};
