"use client";

import { useRef, useState } from "react";
import { Box, Avatar, Button, Text } from "@optiaxiom/react";
import { IconArrowUp, IconPlus, IconSparkles, IconRecordVoiceOver } from "@optiaxiom/icons";
import { mobileType } from "../typography";

const IconBack = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

type Msg = { role: "user" | "opal"; text: string; sender?: string };

// Sub-agents are Opal agents — all use the Opal avatar, distinguished by name only
const AGENT_AVATAR: Record<string, string> = {};

// Seed messages per chat ID — sender = "Opal" or agent name
const SEEDS: Record<string, Msg[]> = {
  c1: [
    { role: "user",  text: "Generate content angles for our product launch" },
    { role: "opal",  sender: "Opal", text: "Great picks — ODP for C-Suite, covering conversion + post-launch, via blog/SEO.\n\nHere's your ODP content angles doc — 8 angles split across Conversion and Post-Launch Retention, each with a punchy hook, SEO targets, and format recommendations, plus a suggested 8-week content calendar.\n\nWant me to draft any of these angles into a full blog post?" },
  ],
  c2: [
    { role: "user",  text: "Q3 blog post SEO meta descriptions" },
    { role: "opal",  sender: "Content Localizer", text: "Here are 3 variants optimized for 'AI content platform':\n\n1. \"Opal is the AI content platform built for marketing teams — generate, review, and publish at scale.\"\n\n2. \"Meet Opal — the AI content platform that turns briefs into polished drafts in seconds.\"\n\n3. \"Opal's AI content platform helps teams create, approve, and publish better content, faster.\"" },
  ],
  c3: [
    { role: "user",  text: "Draft the newsletter A/B test subject lines" },
    { role: "opal",  sender: "Email Creator", text: "Two subject-line variants to test on this week's send:\n\nVariant A: \"Your Q3 content playbook is here\"\nVariant B: \"10 AI content moves for Q3\"\n\nI'd recommend A for the warmer segment and B for re-engagement." },
  ],
  c4: [
    { role: "user",  text: "Opal catch-up" },
    { role: "opal",  sender: "Opal", text: "3 items need your attention: Bubs needs approval on the Q3 blog, Kara needs input on brand voice, and you have 5 unread messages." },
  ],
  c5: [
    { role: "user",  text: "Homepage hero CTA multivariate test — what's the status?" },
    { role: "opal",  sender: "GEO Recommendations", text: "Variant B ('Create Better Content, 10x Faster') is outperforming control by 23% on trial sign-ups at 94% confidence. I'd recommend declaring it the winner." },
  ],
  c6: [
    { role: "user",  text: "Draft talking points for the Opticon keynote" },
    { role: "opal",  sender: "Opal", text: "Based on your calendar and recent product work, here are 5 talking points for next week's keynote:\n\n1. Opal as the content intelligence layer\n2. From brief to published in < 10 min\n3. Human-in-the-loop at every step\n4. Results: 3x content velocity, same team size\n5. What's next — autonomous workflows" },
  ],
};

export function OpalChatView({ chatId, title, onBack }: { chatId: string; title: string; onBack: () => void }) {
  const seed = SEEDS[chatId] ?? [
    { role: "user" as const,  text: title },
    { role: "opal" as const,  text: "I've worked on this. Let me know if you'd like me to refine or expand anything." },
  ];
  const [messages, setMessages] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isTyping = input.trim().length > 0;

  const send = () => {
    if (!isTyping) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setInput("");
    setFocused(false);
    // Simulate Opal reply
    setTimeout(() => {
      setMessages((m) => [...m, { role: "opal", sender: "Opal", text: "Got it — working on that now. Give me a moment." }]);
    }, 800);
  };

  return (
    <Box display="flex" flexDirection="column" style={{ height: "100%", background: "var(--ax-colors-bg-page)" }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap="8" style={{ padding: "14px 16px 10px", flexShrink: 0, borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
        <Box onClick={onBack} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ax-colors-fg-secondary)", flexShrink: 0 }}>
          <IconBack />
        </Box>
        <Text style={{ ...mobileType.sectionHeader, fontWeight: 600, color: "var(--ax-colors-fg-default)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {title}
        </Text>
      </Box>

      {/* Messages */}
      <Box ref={listRef} style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
        {messages.map((msg, i) => (
          msg.role === "opal" ? (
            /* Opal/Agent: small icon + name label above, no bubble */
            <Box key={i} style={{ marginBottom: 16 }}>
              <Box display="flex" alignItems="center" gap="4" style={{ marginBottom: 4 }}>
                <img
                  src="/fd-avatar-opal.png"
                  alt={msg.sender ?? "Opal"}
                  style={{ width: 12, height: 12, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                />
                <Text style={{
                  ...mobileType.caps, fontWeight: 600, color: "var(--ax-colors-fg-tertiary)",
                }}>
                  {msg.sender ?? "Opal"}
                </Text>
              </Box>
              <Text style={{ ...mobileType.body, lineHeight: 1.55, color: "var(--ax-colors-fg-default)", whiteSpace: "pre-wrap" }}>
                {msg.text}
              </Text>
            </Box>
          ) : (
            /* User: bubble on the right */
            <Box key={i} display="flex" justifyContent="end" alignItems="end" gap="8" style={{ marginBottom: 12 }}>
              <Box style={{
                maxWidth: "78%",
                background: "var(--ax-colors-bg-secondary)",
                border: "1px solid var(--ax-colors-border-secondary)",
                borderRadius: "18px 18px 4px 18px",
                padding: "10px 14px",
              }}>
                <Text style={{ ...mobileType.body, lineHeight: 1.45, color: "var(--ax-colors-fg-default)" }}>
                  {msg.text}
                </Text>
              </Box>
              <Avatar name="Jamie Cohen" src="/avatars/jc.png" size="sm" style={{ flexShrink: 0 }} />
            </Box>
          )
        ))}
      </Box>

      {/* Input */}
      <Box style={{ padding: "8px 16px 12px", borderTop: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0, background: "var(--ax-colors-bg-default)" }}>
        <Box style={{
          border: `1px solid ${focused ? "var(--ax-colors-border-focus)" : "var(--ax-colors-border-default)"}`,
          borderRadius: 12, background: "var(--ax-colors-bg-default)", overflow: "hidden",
          boxShadow: focused ? "0 0 0 2px var(--ax-colors-border-focus)" : "none",
          transition: "box-shadow 0.15s",
        }}>
          {!focused ? (
            <Box display="flex" alignItems="center" style={{ padding: "0 8px 0 12px", height: 44 }}>
              <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onFocus={() => setFocused(true)}
                placeholder="Reply to Opal" rows={1}
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", resize: "none", fontFamily: "inherit", ...mobileType.body, color: "var(--ax-colors-fg-default)", padding: 0, height: 22, overflow: "hidden", scrollbarWidth: "none" }} />
              <Box style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: "var(--ax-colors-bg-accent, #abff44)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <IconRecordVoiceOver style={{ width: 16, height: 16, color: "var(--ax-colors-fg-default)" }} />
              </Box>
            </Box>
          ) : (
            <>
              <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)}
                onFocus={() => setFocused(true)} onBlur={() => { if (!input) setFocused(false); }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Reply to Opal" rows={3}
                style={{ width: "100%", border: "none", outline: "none", background: "transparent", resize: "none", fontFamily: "inherit", ...mobileType.body, color: "var(--ax-colors-fg-default)", padding: "12px 12px 8px", display: "block", boxSizing: "border-box", scrollbarWidth: "none" }} />
              <Box display="flex" alignItems="center" style={{ padding: "4px 8px 8px", gap: 2 }}>
                <Button appearance="subtle" size="sm" aria-label="Add" icon={<IconPlus style={{ width: 16, height: 16 }} />} style={{ width: 32, height: 32, padding: 0 }} />
                <Button appearance="subtle" size="sm" aria-label="Agents" icon={<IconSparkles style={{ width: 16, height: 16 }} />} style={{ width: 32, height: 32, padding: 0 }} />
                <Box style={{ flex: 1 }} />
                <Button appearance="subtle" size="sm" aria-label="Voice" icon={<IconRecordVoiceOver style={{ width: 18, height: 18 }} />} style={{ width: 32, height: 32, padding: 0 }} />
                <Box onClick={send} style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: isTyping ? "var(--ax-colors-bg-accent, #abff44)" : "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", cursor: isTyping ? "pointer" : "default", transition: "background 0.15s" }}>
                  <IconArrowUp style={{ width: 16, height: 16, color: "var(--ax-colors-fg-default)" }} />
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
