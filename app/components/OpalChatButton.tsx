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
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <path d="M10.0002 12.6923C9.88342 12.6923 9.77675 12.6731 9.68022 12.6346C9.5837 12.5961 9.4964 12.5333 9.41835 12.4461L5.47668 8.50418C5.33918 8.37599 5.2705 8.2137 5.27064 8.01731C5.27092 7.82092 5.34245 7.65363 5.48522 7.51543C5.628 7.37724 5.79397 7.30814 5.98314 7.30814C6.17217 7.30814 6.33807 7.37495 6.48085 7.50856L10.0071 11.0434L13.5279 7.50856C13.6654 7.38036 13.8286 7.31634 14.0175 7.31648C14.2064 7.31661 14.3722 7.38578 14.515 7.52398C14.6579 7.66217 14.7294 7.82814 14.7294 8.02189C14.7294 8.21564 14.6579 8.37925 14.515 8.51272L10.5819 12.4461C10.5038 12.5333 10.4166 12.5961 10.3202 12.6346C10.2237 12.6731 10.117 12.6923 10.0002 12.6923Z" fill="currentColor"/>
            </svg>
          </div>
        </button>
      </MenuTrigger>
      <MenuContent />
    </Menu>
  );
}

export { IconComments };
