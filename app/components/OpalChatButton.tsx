"use client";

import { Menu, MenuContent, MenuTrigger, type MenuOption } from "@optiaxiom/react";
import { IconComments } from "@optiaxiom/icons";

const GRADIENT =
  "conic-gradient(from 0deg at 50% 50%, #88f7ba 0deg, #9cc0c8 55deg, #8e70af 72deg, #93b197 104deg, #93ba8f 115deg, #c8bdff 245deg, #94a1a5 256deg, #9a65bc 287deg, #a1bad1 302deg, #aed0f7 308deg, #bed9fe 317deg, #d9deff 329deg, #a5f7fc 345deg, #88f7ba 360deg)";

type Props = {
  options: MenuOption[];
  label?: string;
};

export default function OpalChatButton({ options, label = "Chat" }: Props) {
  return (
    <Menu options={options}>
      <MenuTrigger asChild>
        <button
          type="button"
          aria-label={label}
          style={{
            backgroundImage: GRADIENT,
            backgroundColor: "transparent",
            border: "none",
            padding: 2,
            borderRadius: 14,
            cursor: "pointer",
            display: "inline-flex",
            outline: "none",
          }}
        >
          <div
            style={{
              background: "var(--ax-colors-bg-default, white)",
              borderRadius: 12,
              padding: "5px 8px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14,
              letterSpacing: "0.28px",
              color: "var(--ax-colors-fg-default)",
              fontWeight: 500,
              lineHeight: 1.43,
              userSelect: "none",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="6.75" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5.5v5M5.5 8h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {label}
          </div>
        </button>
      </MenuTrigger>
      <MenuContent />
    </Menu>
  );
}

export { IconComments };
