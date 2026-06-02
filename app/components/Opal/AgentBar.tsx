"use client";

import { useEffect, useRef } from "react";
import { Button } from "@optiaxiom/react";

export type AgentBarAgent = {
  emoji: string;
  name: string;
  handle?: string;
  subtitle?: string;
};

type AgentBarProps = {
  agent: AgentBarAgent;
  state: 'default' | 'in-chat' | 'resume';
  onDone?: () => void;
  onDismiss?: () => void;
  onResumeYes?: () => void;
  onResumeNo?: () => void;
  /** Flash the resume bar in error/alert color when the user tries to submit without choosing */
  highlight?: boolean;
};

const BASE_STYLES = {
  fontFamily: "var(--ax-fontFamily-sans, sans-serif)",
  fontSize: 12,
  color: "var(--ax-colors-fg-default)",
};

const PURPLE_CARD: React.CSSProperties = {
  background: "var(--ax-colors-bg-secondary)",
  border: "1px solid var(--ax-colors-border-secondary)",
  borderBottom: "none",
  borderRadius: "12px 12px 0 0",
  padding: "8px 12px 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  ...BASE_STYLES,
};

const AGENT_ROW: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const DONE_BTN: React.CSSProperties = {
  background: "transparent",
  border: "1px solid var(--ax-colors-border-secondary)",
  borderRadius: 4,
  padding: "2px 8px",
  fontSize: 11,
  color: "var(--ax-colors-fg-default)",
  cursor: "pointer",
  fontFamily: "var(--ax-fontFamily-sans, sans-serif)",
  fontWeight: 500,
};

const DISMISS_BTN: React.CSSProperties = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: "var(--ax-colors-fg-secondary)",
  fontSize: 16,
  lineHeight: 1,
  padding: "0 2px",
  display: "flex",
  alignItems: "center",
};

const YES_BTN: React.CSSProperties = {
  background: "var(--ax-colors-bg-accent)",
  border: "none",
  borderRadius: 4,
  padding: "3px 10px",
  fontSize: 11,
  color: "var(--ax-colors-fg-default-inverse)",
  cursor: "pointer",
  fontFamily: "var(--ax-fontFamily-sans, sans-serif)",
  fontWeight: 500,
};

const NO_BTN: React.CSSProperties = {
  background: "transparent",
  border: "1px solid var(--ax-colors-border-default)",
  borderRadius: 4,
  padding: "3px 10px",
  fontSize: 11,
  color: "var(--ax-colors-fg-secondary)",
  cursor: "pointer",
  fontFamily: "var(--ax-fontFamily-sans, sans-serif)",
};

export function AgentBar({ agent, state, onDone, onDismiss, onResumeYes, onResumeNo, highlight }: AgentBarProps) {
  const yesRef = useRef<HTMLButtonElement>(null);

  // Auto-focus "Yes" when the resume bar appears so the user can hit Enter / Tab
  useEffect(() => {
    if (state === "resume") {
      // Small delay so the slide-in animation has started before focus shifts
      const t = setTimeout(() => yesRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [state]);

  if (state === "resume") {
    return (
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Gray resume bar — slides up from behind the purple bar */}
        <div style={{
          background: highlight ? "var(--ax-colors-bg-error-subtlest)" : "var(--ax-colors-bg-secondary)",
          padding: "8px 12px",
          borderRadius: "12px 12px 0 0",
          margin: "0 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "var(--ax-fontFamily-sans, sans-serif)",
          animation: highlight
            ? "resumeBarShake 0.6s ease"
            : "resumeBarSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ax-colors-fg-default)" }}>Resume previous conversation?</span>
          <div style={{ display: "flex", gap: 6 }}>
            <Button ref={yesRef} appearance="default" size="sm" onClick={onResumeYes}>Yes</Button>
            <Button appearance="default" size="sm" onClick={onResumeNo}>No</Button>
          </div>
        </div>
        {/* Purple bar — standalone, full width */}
        <div style={{ ...PURPLE_CARD, height: 44 }}>
          <div style={AGENT_ROW}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>{agent.emoji}</span>
            <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px" }}>{agent.name}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...PURPLE_CARD, flexDirection: "column", alignItems: "stretch" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={AGENT_ROW}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>{agent.emoji}</span>
          <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px" }}>{agent.name}</span>
        </div>
        {state === "in-chat" && (
          <Button appearance="default" size="sm" onClick={onDone}>Done</Button>
        )}
        {state === "default" && (
          <Button appearance="default" size="sm" onClick={onDismiss}>Done</Button>
        )}
      </div>
      {state === "default" && agent.subtitle && (
        <div style={{ marginTop: 2, color: "var(--ax-colors-fg-secondary)" }}>{agent.subtitle}</div>
      )}
    </div>
  );
}
