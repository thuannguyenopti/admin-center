"use client";

import { Avatar, Tooltip } from "@optiaxiom/react";
import { avatarFor } from "../lib/avatars";
import { getVAU } from "../lib/virtualTeammates";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function UserAvatar({
  userId,
  name,
  size = 24,
  showTooltip = true,
}: {
  userId: string;
  name: string;
  size?: number;
  showTooltip?: boolean;
}) {
  const url = avatarFor(userId);
  const template = getVAU(userId)?.template_name;

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

  if (!showTooltip) return img;

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
      <span style={{ display: "inline-flex", flexShrink: 0 }}>{img}</span>
    </Tooltip>
  );
}
