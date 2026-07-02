"use client";

import { forwardRef, type ReactNode } from "react";

interface OpalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const OpalButton = forwardRef<HTMLButtonElement, OpalButtonProps>(
  ({ children, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        {...props}
        style={{
          backgroundImage: "conic-gradient(from 0deg at 50% 50%, #88f7ba 0deg, #9cc0c8 55deg, #8e70af 72deg, #93b197 104deg, #93ba8f 115deg, #c8bdff 245deg, #94a1a5 256deg, #9a65bc 287deg, #a1bad1 302deg, #aed0f7 308deg, #bed9fe 317deg, #d9deff 329deg, #a5f7fc 345deg, #88f7ba 360deg)",
          backgroundColor: "transparent",
          border: "none",
          padding: 2,
          borderRadius: 14,
          cursor: "pointer",
          display: "inline-flex",
          outline: "none",
          ...props.style,
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
          {children}
        </div>
      </button>
    );
  }
);

OpalButton.displayName = "OpalButton";
