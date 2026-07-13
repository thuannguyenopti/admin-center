"use client";

import { Avatar, Badge, Box, Button, Text } from "@optiaxiom/react";
import { IconChevronLeft } from "@optiaxiom/icons";

const IconHamburger = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <line x1="3" y1="6"  x2="17" y2="6"  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
import { OpalAlert } from "@/app/opal/components/OpalAlert";
import { PresenceDot } from "../components/MessageBubble";
import { DMS, GROUPS, HITL_NOTIFICATIONS, THREADS, getMockTime } from "../data";

type Props = {
  onBack?: () => void;
  onHamburger?: () => void;
  onSelect: (id: string) => void;
};

const BADGE_INTENT: Record<string, "warning" | "information" | "success"> = {
  approval: "warning",
  question: "information",
  review: "information",
};

const TYPE_LABEL: Record<string, string> = {
  approval: "Needs approval",
  question: "Needs input",
  review: "Ready to review",
};

const MOCK_MENTIONS = [
  { convId: "bf", name: "Black Friday Campaign", emoji: "🛍️", msg: "@Pei can you review the updated brief before Friday?", time: "10:42 AM" },
  { convId: "vw", name: "VAU Working Group", emoji: "🤖", msg: "@Pei great insight — should we add this to the backlog?", time: "11:05 AM" },
];

const MOCK_VAU_UPDATES = [
  { name: "Bubs", color: "#2563eb", msg: "Q3 Content Strategy draft is ready for your review", artifact: "Blog Post · Q3 Content Strategy: How AI Is Reshaping Marketing" },
  { name: "Kara", color: "#6B5CE7", msg: "SEO meta descriptions for the Opal landing page — 3 variants ready", artifact: null },
];

function getLastMessage(id: string): string {
  const thread = THREADS[id] ?? [];
  const last = thread[thread.length - 1];
  if (!last) return "No messages yet";
  if (last.type === "attachment") return "📎 Shared a file";
  const text = last.text ?? "";
  return text.replace(/\n/g, " ").slice(0, 60) + (text.length > 60 ? "…" : "");
}

function getLastTime(id: string): string {
  const thread = THREADS[id] ?? [];
  if (!thread.length) return "";
  return getMockTime(thread.length - 1);
}

export function CatchUpView({ onBack, onHamburger, onSelect }: Props) {
  const actionItems = HITL_NOTIFICATIONS.filter(n => !n.read && n.type !== "complete");
  const unreadDMs = DMS.filter(d => (d.unread ?? 0) > 0);
  const unreadGroups = GROUPS.filter(g => (g.unread ?? 0) > 0);

  return (
    <Box display="flex" flexDirection="column" style={{ height: "100%", background: "var(--ax-colors-bg-default)" }}>

      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        gap="4"
        px="8"
        style={{ height: 56, flexShrink: 0, borderBottom: "1px solid var(--ax-colors-border-secondary)" }}
      >
        {onHamburger ? (
          <Button
            appearance="subtle"
            size="sm"
            icon={<IconHamburger />}
            aria-label="Open menu"
            onClick={onHamburger}
            style={{ width: 40, height: 40, padding: 0, flexShrink: 0 }}
          />
        ) : (
          <Button
            appearance="subtle"
            size="sm"
            icon={<IconChevronLeft style={{ width: 20, height: 20 }} />}
            aria-label="Back"
            onClick={onBack}
            style={{ width: 40, height: 40, padding: 0, flexShrink: 0 }}
          />
        )}
        <Text fontWeight="700" color="fg.default" style={{ fontSize: 20 }}>Catch up</Text>
      </Box>

      {/* Scrollable content */}
      <Box style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>

        {/* Opal AI summary card */}
        <Box style={{ margin: "12px 12px 4px" }}>
          <OpalAlert
            dismissible={false}
            title="3 items need your attention."
            body="Bubs completed the Q3 blog draft and the Black Friday email series are ready for review. Priya and Jane sent you messages. The Black Friday Campaign group has 5 new messages — the team finalized the webinar topic. You were mentioned twice."
          />
        </Box>

        {/* Action required */}
        {actionItems.length > 0 && (
          <>
            <SectionLabel>Action required</SectionLabel>
            {actionItems.map(n => (
              <TapRow key={n.id} onClick={() => {}}>
                <Box style={{
                  width: 36, height: 36, borderRadius: "50%", background: n.vauColor,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Text style={{ fontSize: 14, color: "white", fontWeight: 700 }}>{n.vauName[0]}</Text>
                </Box>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Box display="flex" alignItems="center" gap="8" style={{ marginBottom: 3 }}>
                    <Badge intent={BADGE_INTENT[n.type] ?? "information"} style={{ fontSize: 11, flexShrink: 0 }}>
                      {TYPE_LABEL[n.type] ?? n.type}
                    </Badge>
                    <Text color="fg.tertiary" style={{ fontSize: 12, marginLeft: "auto", flexShrink: 0 }}>{n.timestamp}</Text>
                  </Box>
                  <Text color="fg.default" style={{ fontSize: 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {n.title}
                  </Text>
                </Box>
              </TapRow>
            ))}
          </>
        )}

        {/* Mentions */}
        <SectionLabel>You were mentioned</SectionLabel>
        {MOCK_MENTIONS.map(m => (
          <TapRow key={m.convId} onClick={() => onSelect(m.convId)}>
            <Box style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--ax-colors-bg-secondary)",
              border: "1px solid var(--ax-colors-border-secondary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0,
            }}>
              {m.emoji}
            </Box>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" gap="8">
                <Text fontWeight="500" color="fg.default" style={{ fontSize: 14 }}>{m.name}</Text>
                <Text color="fg.tertiary" style={{ fontSize: 12, flexShrink: 0 }}>{m.time}</Text>
              </Box>
              <Text color="fg.secondary" style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {m.msg}
              </Text>
            </Box>
          </TapRow>
        ))}

        {/* Group highlights */}
        {unreadGroups.length > 0 && (
          <>
            <SectionLabel>Group highlights</SectionLabel>
            {unreadGroups.map(g => (
              <TapRow key={g.id} onClick={() => onSelect(g.id)}>
                <Box style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "var(--ax-colors-bg-secondary)",
                  border: "1px solid var(--ax-colors-border-secondary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0,
                }}>
                  {g.emoji}
                </Box>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" gap="8">
                    <Text fontWeight="500" color="fg.default" style={{ fontSize: 14 }}>{g.name}</Text>
                    <Text color="fg.tertiary" style={{ fontSize: 12, flexShrink: 0 }}>{getLastTime(g.id)}</Text>
                  </Box>
                  <Box display="flex" alignItems="center" justifyContent="space-between" gap="8">
                    <Text color="fg.secondary" style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                      {getLastMessage(g.id)}
                    </Text>
                    <Badge intent="success" size="sm" style={{ flexShrink: 0 }}>{g.unread}</Badge>
                  </Box>
                </Box>
              </TapRow>
            ))}
          </>
        )}

        {/* VAU updates */}
        <SectionLabel>VAU updates</SectionLabel>
        {MOCK_VAU_UPDATES.map(v => (
          <TapRow key={v.name} onClick={() => {}}>
            <Box style={{
              width: 36, height: 36, borderRadius: "50%", background: v.color,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Text style={{ fontSize: 14, color: "white", fontWeight: 700 }}>{v.name[0]}</Text>
            </Box>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text fontWeight="500" color="fg.default" style={{ fontSize: 14, marginBottom: 2 }}>{v.name}</Text>
              <Text color="fg.secondary" style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {v.msg}
              </Text>
              {v.artifact && (
                <Text color="fg.tertiary" style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                  {v.artifact}
                </Text>
              )}
            </Box>
          </TapRow>
        ))}

        {/* Unread DMs */}
        {unreadDMs.length > 0 && (
          <>
            <SectionLabel>Unread messages</SectionLabel>
            {unreadDMs.map(dm => (
              <TapRow key={dm.id} onClick={() => onSelect(dm.id)}>
                <Box style={{ position: "relative", flexShrink: 0 }}>
                  <Avatar name={dm.name} src={dm.avatar} size="md" />
                  {dm.status && <PresenceDot status={dm.status} />}
                </Box>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" gap="8">
                    <Text fontWeight="600" color="fg.default" style={{ fontSize: 14 }}>{dm.name}</Text>
                    <Badge intent="success" size="sm" style={{ flexShrink: 0 }}>{dm.unread}</Badge>
                  </Box>
                  <Text color="fg.secondary" style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {getLastMessage(dm.id)}
                  </Text>
                </Box>
              </TapRow>
            ))}
          </>
        )}

      </Box>
    </Box>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        display: "block",
        fontSize: 11,
        fontWeight: 600,
        color: "var(--ax-colors-fg-tertiary)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        padding: "20px 16px 4px",
      }}
    >
      {children}
    </Text>
  );
}

function TapRow({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      gap="12"
      px="16"
      py="10"
      onClick={onClick}
      style={{ cursor: "pointer", transition: "background 0.1s" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--ax-colors-bg-secondary)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
    >
      {children}
    </Box>
  );
}
