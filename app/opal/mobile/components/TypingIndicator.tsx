"use client";

import { Box, Avatar } from "@optiaxiom/react";

type Props = {
  name: string;
  avatar?: string;
  color?: string;
};

export function TypingIndicator({ name, avatar, color }: Props) {
  return (
    <Box display="flex" gap="10" alignItems="center" style={{ paddingLeft: 4 }}>
      {color ? (
        <Box
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: "white",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {name[0]}
        </Box>
      ) : (
        <Avatar name={name} src={avatar} size="sm" style={{ flexShrink: 0 }} />
      )}
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          background: "var(--ax-colors-bg-secondary)",
          borderRadius: 18,
          padding: "10px 14px",
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            className="mobile-typing-dot"
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--ax-colors-fg-tertiary)",
              animationDelay: `${i * 0.16}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
