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
    { role: "opal",  sender: "Opal", text: "I've pulled your launch brief, recent blog performance, and ICP data. Here are 8 content angles across two themes:\n\nConversion: \"Why AI Content Platforms Beat Prompt-and-Paste\", \"The CMO's Guide to Content at Scale\", \"From Brief to Published in Under 10 Minutes\"\n\nPost-Launch Retention: \"How [Customer] 3x'd Output Without Hiring\", \"The Content Supply Chain Explained\"\n\nWant me to prioritize by SEO opportunity or audience fit?" },
    { role: "user",  text: "Prioritize by SEO opportunity" },
    { role: "opal",  sender: "Opal", text: "Ranked by search volume + competition score:\n\n1. \"AI content platform\" — 14k/mo, medium competition → \"Why AI Content Platforms Beat Prompt-and-Paste\"\n2. \"content at scale\" — 8k/mo, low competition → \"The CMO's Guide to Content at Scale\"\n3. \"content supply chain\" — 3.2k/mo, very low → \"The Content Supply Chain Explained\"\n\nThe top two are your fastest wins. Want me to draft outlines for both?" },
    { role: "user",  text: "Yes, start with #1" },
    { role: "opal",  sender: "Opal", text: "Here's the outline for \"Why AI Content Platforms Beat Prompt-and-Paste\":\n\nHook: Most teams adopted AI for speed but got chaos instead\nSection 1: The prompt-and-paste trap (inconsistency, off-brand, no audit trail)\nSection 2: What a platform actually gives you (workflow, approvals, brand guardrails)\nSection 3: Real results — 3x output, same headcount\nCTA: Start your free trial\n\nEstimated 1,200 words, 6-8 min read. Ready to draft the full post?" },
  ],
  c2: [
    { role: "user",  text: "Q3 blog post SEO meta descriptions" },
    { role: "opal",  sender: "Content Localizer", text: "Here are 3 variants optimized for 'AI content platform':\n\n1. \"Opal is the AI content platform built for marketing teams — generate, review, and publish at scale.\"\n\n2. \"Meet Opal — the AI content platform that turns briefs into polished drafts in seconds.\"\n\n3. \"Opal's AI content platform helps teams create, approve, and publish better content, faster.\"" },
    { role: "user",  text: "I like #2 but can you make it less salesy?" },
    { role: "opal",  sender: "Content Localizer", text: "Here's a revised version of #2:\n\n\"Opal is an AI content platform that helps marketing teams go from brief to published draft — without the back-and-forth.\"\n\nDropped the superlative, added a specific pain point. Want me to try a few more variations with different angles?" },
    { role: "user",  text: "That's good. Use it. Also update the OG title." },
    { role: "opal",  sender: "Content Localizer", text: "Updated. OG title is now: \"Opal — AI Content Platform for Marketing Teams\"\n\nMeta description: \"Opal is an AI content platform that helps marketing teams go from brief to published draft — without the back-and-forth.\"\n\nBoth are within character limits (58 and 147 chars). Applied to all 4 Q3 posts." },
  ],
  c3: [
    { role: "user",  text: "Draft the newsletter A/B test subject lines" },
    { role: "opal",  sender: "Email Creator", text: "Two subject-line variants to test on this week's send:\n\nVariant A: \"Your Q3 content playbook is here\"\nVariant B: \"10 AI content moves for Q3\"\n\nI'd recommend A for the warmer segment and B for re-engagement. Want preview text for both?" },
    { role: "user",  text: "Yes please" },
    { role: "opal",  sender: "Email Creator", text: "Preview text:\n\nVariant A: \"Everything your team needs to plan, create, and publish this quarter →\"\nVariant B: \"The shortcuts your competitors are already using.\"\n\nVariant B's preview leans into FOMO — strong for re-engagement. Variant A is warmer and fits your nurture segment better." },
    { role: "user",  text: "Can you also write the first two sentences of the email body for each?" },
    { role: "opal",  sender: "Email Creator", text: "Variant A opener:\n\"Q3 is here, and your content calendar shouldn't be a scramble. We put together everything you need — strategy, templates, and a few shortcuts we've learned from the best marketing teams.\"\n\nVariant B opener:\n\"Your competitors are already using AI to produce twice the content in half the time. Here are 10 moves you can make this quarter to close the gap.\"" },
  ],
  c4: [
    { role: "user",  text: "Opal catch-up" },
    { role: "opal",  sender: "Opal", text: "3 items need your attention:\n\n1. Bubs needs approval on the Q3 blog — ready to publish, waiting on your sign-off\n2. Kara needs brand voice direction before she can continue the LinkedIn series\n3. You have 5 unread messages — 2 from Jordan, 1 from the Website Team group\n\nWant me to pull up any of these?" },
    { role: "user",  text: "What did Jordan say?" },
    { role: "opal",  sender: "Opal", text: "Jordan sent two messages this morning:\n\n8:10 AM: \"Let's launch the hero test Friday — results are looking strong\"\n8:14 AM: \"Can you approve the brief before EOD? Needs to go to legal\"\n\nThe brief is in your Opal queue. Want me to open it?" },
    { role: "user",  text: "Yes and remind me at 3pm" },
    { role: "opal",  sender: "Opal", text: "Opening Jordan's brief now. I've also set a reminder for 3:00 PM today: \"Review and approve Jordan's launch brief.\"\n\nAnything else before I let you focus?" },
  ],
  c5: [
    { role: "user",  text: "Homepage hero CTA multivariate test — what's the status?" },
    { role: "opal",  sender: "GEO Recommendations", text: "Here's where things stand at Day 14:\n\nVariant B ('Create Better Content, 10x Faster') is leading — +23% on trial sign-ups vs. control, 94% confidence.\n\nVariant C ('Your AI Content Team Starts Here') is flat at +2%, not significant.\n\nI'd recommend calling Variant B the winner and ending the test. Want me to draft the announcement?" },
    { role: "user",  text: "What was the control CTA?" },
    { role: "opal",  sender: "GEO Recommendations", text: "Control was: \"Start Your Free Trial\"\n\nSimple, direct — but it wasn't connecting the product to an outcome. Variant B does that in 5 words. The lift is consistent across device types (desktop: +21%, mobile: +27%)." },
    { role: "user",  text: "Nice. Ship it. What should we test next?" },
    { role: "opal",  sender: "GEO Recommendations", text: "Shipping Variant B now — I'll update the live page within the hour.\n\nFor the next test, I'd suggest the hero subheadline. The current one is generic. Three hypotheses worth testing:\n\n1. Outcome-led: \"3x your content output without growing your team\"\n2. Pain-led: \"Stop publishing content that nobody reads\"\n3. Social proof: \"Trusted by 500+ marketing teams at Series B and beyond\"\n\nWant me to set this up in the experiment queue?" },
  ],
  c6: [
    { role: "user",  text: "Draft talking points for the Opticon keynote" },
    { role: "opal",  sender: "Opal", text: "I've reviewed your calendar, recent product announcements, and last year's keynote transcript. Here's a draft arc:\n\n1. The problem: AI created chaos, not clarity\n2. What we built: Opal as the content intelligence layer\n3. From brief to published in < 10 min (live demo moment)\n4. Human-in-the-loop: why it matters for brand trust\n5. Results: 3x velocity, same team size\n6. What's next: autonomous content workflows\n\nThis runs about 20 minutes at a comfortable pace. Want me to expand any section?" },
    { role: "user",  text: "Expand section 3, that's the demo moment" },
    { role: "opal",  sender: "Opal", text: "Here's an expanded script for section 3:\n\n\"Let me show you what this actually looks like. I'm going to take a brief that came in this morning — [pull up brief on screen] — and we're going to publish something by the time I leave this stage.\n\nOpal reads the brief, checks our brand guidelines, pulls relevant data, and drafts. Thirty seconds. [pause for effect]\n\nNow I can review, adjust tone, add a quote — all inline. Approve. Done. That's it. Not two weeks. Not three rounds of revisions. Thirty seconds to a first draft, five minutes to publish.\"\n\nWant me to add a fallback script in case the live demo has issues?" },
    { role: "user",  text: "Yes, always" },
    { role: "opal",  sender: "Opal", text: "Fallback added. If the live demo fails, cut to:\n\n\"Rather than troubleshoot on stage, let me show you the output we prepared this morning — [switch to screenshot] — this is what the workflow produces. Same brief, 34 seconds, ready for review.\"\n\nThe key is to keep moving — the audience came for the vision, not the demo. I've added a note in your speaker doc." },
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
            <Box key={i} style={{ marginBottom: 24 }}>
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
            <Box key={i} display="flex" justifyContent="end" alignItems="end" gap="8" style={{ marginBottom: 20 }}>
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
