"use client";

import { Avatar, Tooltip } from "@optiaxiom/react";
import { avatarFor } from "../lib/avatars";
import { getVAU } from "../lib/virtualTeammates";
import { getPresence, PRESENCE_COLORS } from "../lib/presence";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

const DOT_SIZE: Record<number, number> = { 24: 10, 32: 12, 40: 14 };

function PresenceDot({ size, status }: { size: number; status: string }) {
  const dot = DOT_SIZE[size] ?? 8;
  return (
    <span
      aria-label={status}
      style={{
        position: "absolute",
        bottom: 0,
        right: 0,
        width: dot,
        height: dot,
        borderRadius: "50%",
        background: PRESENCE_COLORS[status as keyof typeof PRESENCE_COLORS] ?? PRESENCE_COLORS.offline,
        border: "1.5px solid var(--ax-colors-bg-default)",
        boxSizing: "border-box",
        pointerEvents: "none",
      }}
    />
  );
}

export function UserAvatar({
  userId,
  name,
  size = 24,
  showTooltip = true,
  showPresence = false,
}: {
  userId: string;
  name: string;
  size?: number;
  showTooltip?: boolean;
  showPresence?: boolean;
}) {
  const url = avatarFor(userId);
  const isVAU = !!getVAU(userId);
  const template = getVAU(userId)?.template_name;
  const presence = showPresence && !isVAU ? getPresence(userId) : null;

  const img = url ? (
    <img
      src={url}
      alt={name}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        flexShrink: 0,
      }}
    />
  ) : (
    <Avatar size="sm" name={name}>
      {initials(name)}
    </Avatar>
  );

  const avatar = presence ? (
    <span style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
      {img}
      <PresenceDot size={size} status={presence} />
    </span>
  ) : img;

  if (!showTooltip) return avatar;

  const tooltipContent = template ? (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 2, lineHeight: 1.3 }}>
      <span style={{ fontWeight: 600 }}>{name}</span>
      <span style={{ opacity: 0.85 }}>{template}</span>
    </span>
  ) : (
    name
  );

  return (
    <Tooltip content={tooltipContent} delayDuration={300}>
      <span style={{ display: "inline-flex", flexShrink: 0 }}>{avatar}</span>
    </Tooltip>
  );
}
