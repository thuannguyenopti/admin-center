"use client";

import { Button } from "@optiaxiom/react";

export type AgentBarAgent = {
  emoji: string;
  name: string;
  subtitle?: string;
};

type AgentBarProps = {
  agent: AgentBarAgent;
  state: 'default' | 'in-chat' | 'resume';
  onDone?: () => void;
  onDismiss?: () => void;
  onResumeYes?: () => void;
  onResumeNo?: () => void;
};

const BASE_STYLES = {
  fontFamily: "Inter, sans-serif",
  fontSize: 12,
  color: "#080736",
};

const PURPLE_CARD: React.CSSProperties = {
  background: "#ede9fe",
  borderRadius: "6px 6px 0 0",
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
  border: "1px solid #7c3aed",
  borderRadius: 4,
  padding: "2px 8px",
  fontSize: 11,
  color: "#7c3aed",
  cursor: "pointer",
  fontFamily: "Inter, sans-serif",
  fontWeight: 500,
};

const DISMISS_BTN: React.CSSProperties = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: "#4f576e",
  fontSize: 16,
  lineHeight: 1,
  padding: "0 2px",
  display: "flex",
  alignItems: "center",
};

const YES_BTN: React.CSSProperties = {
  background: "#7c3aed",
  border: "none",
  borderRadius: 4,
  padding: "3px 10px",
  fontSize: 11,
  color: "#fff",
  cursor: "pointer",
  fontFamily: "Inter, sans-serif",
  fontWeight: 500,
};

const NO_BTN: React.CSSProperties = {
  background: "transparent",
  border: "1px solid #cacfdc",
  borderRadius: 4,
  padding: "3px 10px",
  fontSize: 11,
  color: "#4f576e",
  cursor: "pointer",
  fontFamily: "Inter, sans-serif",
};

export function AgentBar({ agent, state, onDone, onDismiss, onResumeYes, onResumeNo }: AgentBarProps) {
  if (state === "resume") {
    return (
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Gray resume bar — slides up from behind the purple bar */}
        <div style={{
          background: "#e9edf5",
          padding: "8px 12px",
          borderRadius: "6px 6px 0 0",
          margin: "0 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "Inter, sans-serif",
          animation: "resumeBarSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#2e3442" }}>Resume previous conversation?</span>
          <div style={{ display: "flex", gap: 6 }}>
            <Button appearance="default" size="sm" onClick={onResumeYes}>Yes</Button>
            <Button appearance="default" size="sm" onClick={onResumeNo}>No</Button>
          </div>
        </div>
        {/* Purple bar — standalone, full width, 44px */}
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
        <div style={{ marginTop: 2, color: "#4f576e" }}>{agent.subtitle}</div>
      )}
    </div>
  );
}
