"use client";

import { IconUserGroup } from "@optiaxiom/icons";
import type { ReactNode } from "react";

const AVATAR_COLORS = [
  "#3a7d3a", // green
  "#3b6cb4", // blue
  "#b87a1f", // amber
  "#7a3fb8", // purple
  "#b8334d", // rose
  "#2f7d7d", // teal
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function colorForInitials(initials: string): string {
  return AVATAR_COLORS[hashString(initials.toUpperCase()) % AVATAR_COLORS.length];
}

export function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Known users that should render with an image instead of initials. */
const AVATAR_IMAGE_BY_INITIALS: Record<string, string> = {
  FR: "/avatars/vau-frank.png",
  HE: "/avatars/vau-henry.png",
  JO: "/avatars/vau-jonas.png",
  KE: "/avatars/vau-kerby.png",
  MY: "/avatars/vau-mayling.png",
  PO: "/avatars/vau-poppy.png",
  TO: "/avatars/vau-tony.png",
};

/** Known identities that render an icon (e.g. group / team) instead of initials. */
const AVATAR_ICON_BY_INITIALS: Record<string, (size: number) => ReactNode> = {
  TM: (size) => <IconUserGroup size={Math.round(size * 0.58)} />,
};

export function InitialsAvatar({
  initials,
  size = 24,
  withBorder = true,
  title,
  imageUrl,
}: {
  initials: string;
  size?: number;
  withBorder?: boolean;
  title?: string;
  imageUrl?: string;
}) {
  const key = initials.toUpperCase();
  const src = imageUrl ?? AVATAR_IMAGE_BY_INITIALS[key];
  const iconRenderer = AVATAR_ICON_BY_INITIALS[key];
  const commonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    flexShrink: 0,
    borderRadius: "50%",
    boxSizing: "border-box",
    border: withBorder ? "2px solid var(--ax-colors-bg-default)" : "none",
    overflow: "hidden",
  };
  if (src) {
    return (
      <span title={title} style={commonStyle}>
        <img
          src={src}
          alt={title ?? initials}
          width={size}
          height={size}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </span>
    );
  }
  if (iconRenderer) {
    return (
      <span
        title={title}
        style={{
          ...commonStyle,
          background: "var(--ax-colors-bg-secondary)",
          color: "var(--ax-colors-fg-default)",
        }}
      >
        {iconRenderer(size)}
      </span>
    );
  }
  return (
    <div
      title={title}
      style={{
        ...commonStyle,
        background: colorForInitials(initials),
        color: "#fff",
        fontSize: Math.round(size * 0.42),
        fontWeight: 600,
        lineHeight: 1,
        letterSpacing: 0,
      }}
    >
      {initials}
    </div>
  );
}
