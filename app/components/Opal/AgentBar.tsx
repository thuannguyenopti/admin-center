"use client";

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
  borderRadius: 0,
  padding: "8px 12px",
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
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {/* Gray card: resume prompt */}
        <div style={{
          background: "#e9edf5",
          borderRadius: 0,
          padding: "8px 12px 10px",
          ...BASE_STYLES,
        }}>
          <div style={{ marginBottom: 8 }}>Resume previous conversation?</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={YES_BTN} onClick={onResumeYes}>Yes, resume</button>
            <button style={NO_BTN} onClick={onResumeNo}>Start new</button>
          </div>
        </div>
        {/* Purple card: agent info */}
        <div style={{ ...PURPLE_CARD, borderRadius: 0, marginTop: 0 }}>
          <div style={AGENT_ROW}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>{agent.emoji}</span>
            <span style={{ fontWeight: 500 }}>{agent.name}</span>
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
          <span style={{ fontWeight: 500 }}>{agent.name}</span>
        </div>
        {state === "in-chat" && (
          <button style={DONE_BTN} onClick={onDone}>Done</button>
        )}
        {state === "default" && (
          <button style={DISMISS_BTN} onClick={onDismiss} aria-label="Dismiss">×</button>
        )}
      </div>
      {state === "default" && agent.subtitle && (
        <div style={{ marginTop: 2, color: "#4f576e" }}>{agent.subtitle}</div>
      )}
    </div>
  );
}
