"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { CollabRail } from "../../components/Opal/CollabRail";
import { ApprovalActionCard } from "../../components/Opal/ApprovalActionCard";
import { HITLApprovalCard } from "../../components/Opal/HITLApprovalCard";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
  Box,
  Text,
  Avatar,
  Badge,
  Button,
  Tooltip,
  Disclosure,
  DisclosureTrigger,
  DisclosureContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogClose,
  RadioGroup,
  Radio,
  Checkbox,
  AvatarGroup,
  Menu,
  MenuTrigger,
  MenuContent,
  ToggleButton,
  Spinner,
  Alert,
  Listbox,
  ListboxItem,
  Select,
  SelectTrigger,
  SelectContent,
} from "@optiaxiom/react";
import {
  IconPlus,
  IconPenToSquare,
  IconCircleCheck,
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconLink,
  IconListOl,
  IconListUl,
  IconQuoteRight,
  IconCode,
  IconPaperclip,
  IconWavePulse,
  IconPaperPlaneTop as IconSend,
  IconGalleryThumbnails,
  IconSearch,
  IconFileLines,
  IconDownload,
  IconArrowsMaximize,
  IconXmark,
  IconArrowUpRightFromSquare,
  IconEllipsisSolid,
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
  IconGear,
  IconArrowsMinimize,
  IconComment,
  IconMessageLines,
  IconEye,
  IconBell,
  IconBellSlash,
  IconCheck,
  IconAt,
  IconComments,
  IconPen,
  IconThumbtack,
  IconFaceSmile,
  IconUserPlus,
  IconBook,
  IconCircleInfo,
  IconUserGroup,
  IconLock,
  IconHashtag,
  IconUser,
  IconBoxArchive,
  IconBan,
  IconTrashCan,
  IconSliders,
} from "@optiaxiom/icons";
import { IconSparkles } from "@optimizely/axiom-icons";

const IconMarkEmailUnread = ({ size = 16 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} width={size} viewBox="0 -960 960 960" fill="currentColor">
    <path d="M840-680q0 33-23.5 56.5T760-600q-33 0-56.5-23.5T680-680q0-33 23.5-56.5T760-760q33 0 56.5 23.5T840-680ZM120-160q-33 0-56.5-23.5T40-240v-480q0-33 23.5-56.5T120-800h520q-4 20-4 40t4 40H120l360 240 136-91q14 17 30.5 30T682-522L480-400 120-640v400h720v-252q23-5 43.5-14.5T920-732v492q0 33-23.5 56.5T840-160H120Z" />
  </svg>
);

// ── Types ──────────────────────────────────────────────────────────────────────

type PresenceStatus = "active" | "away" | "busy" | "ooo";
type Deliverable = { id: string; title: string; type: string; thumbnail?: string };
type DMItem      = { id: string; name: string; avatar: string; status?: PresenceStatus; unread?: number; isVAU?: boolean; isDeactivated?: boolean; hasDraft?: boolean; preview?: string; role?: string; time?: string };
type GroupItem   = { id: string; name: string; members: string; emoji: string; unread?: number; hasDraft?: boolean; preview?: string; memberList?: { name: string; avatar: string }[]; time?: string; createdBy?: string; createdOn?: string };
type ChannelItem = { id: string; name: string; preview?: string; unread?: number; isPrivate?: boolean; memberList?: { name: string; avatar: string }[]; time?: string; createdBy?: string; createdOn?: string };
type Section     = { id: string; label: string; items?: string[] };

type Reaction = { emoji: string; count: number };
type Message = {
  id: string;
  from: "user" | "vau" | "human" | "system";
  type?: "text" | "attachment" | "hitl";
  senderName?: string;
  senderAvatar?: string;
  senderColor?: string;
  text: string;
  attachment?: { title: string; file: string };
  reactions?: Reaction[];
  threadCount?: number;
  agentCard?: { name: string; emoji: string; description: string; tags: string[]; connectors: string[]; workingWith: string[] };
};

// ── Mock data ──────────────────────────────────────────────────────────────────

const PRESENCE_COLOR: Record<PresenceStatus, string> = {
  active: "var(--ax-colors-bg-success)",
  away:   "var(--ax-colors-fg-tertiary)",
  busy:   "var(--ax-colors-fg-tertiary)",
  ooo:    "var(--ax-colors-fg-tertiary)",
};

function OOOIndicator({ size, outerBorderColor }: { size: number; outerBorderColor: string }) {
  return (
    <div style={{
      position: "absolute", bottom: -1, right: -1,
      width: size, height: size, borderRadius: "50%",
      background: "#E53935",
      boxShadow: `0 0 0 1.5px ${outerBorderColor}`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width={Math.round(size * 0.55)} height={2} viewBox="0 0 6 2" fill="none">
        <path d="M0.5 1H5.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

// Unread/notification dot — always pushed to the far right of its row
const UNREAD_DOT_STYLE: React.CSSProperties = {
  width: 8, height: 8, borderRadius: "50%", background: "var(--ax-colors-bg-information)", flexShrink: 0, marginLeft: "auto",
};

const DMS: DMItem[] = [
  { id: "js",   name: "Jane Smith",                avatar: "https://i.pravatar.cc/150?img=47", status: "active", unread: 2, preview: "Same 😂 see you at 2!", time: "2:22 PM" },
  { id: "hw",   name: "Harry Winston-Brown",        avatar: "https://i.pravatar.cc/150?img=52", status: "busy",   preview: "Happy to help 😄 Let me know if anything else comes up!", time: "Yesterday" },
  { id: "pr",   name: "Priya Rajan",                avatar: "https://i.pravatar.cc/150?img=44", status: "away",  unread: 3, hasDraft: true, preview: "Just flagging in case you hadn't seen the calendar invite!", time: "11:45 AM" },
  { id: "ao",   name: "Amara Osei",                 avatar: "https://i.pravatar.cc/150?img=38", status: "active", preview: "You: I've put together the full Q4 content brief based on our conversation", time: "10:02 AM" },
  { id: "bubs", name: "Randy",                       avatar: "/vau-bubs.svg",                    status: "active", isVAU: true, role: "Chief of Staff",              preview: "Randy sent an item that needs your approval", time: "9:54 AM" },
  { id: "kara", name: "Kara",                       avatar: "/vau-kara.svg",                    status: "active", isVAU: true, role: "Content Strategy Expert",  preview: "Kara sent an item that needs your approval", time: "9:30 AM" },
  { id: "eric", name: "Eric",                       avatar: "/vau-eric.svg",                    status: "ooo",    isVAU: true, role: "Experimentation Manager",   preview: "Test is configured and ready to launch 🧪", time: "8:15 AM" },
  { id: "sage", name: "Sage",                       avatar: "",                                                   isVAU: true, isDeactivated: true, role: "Email Automation", preview: "All 8 emails are drafted and staged for review.", time: "Mon" },
];

const ARCHIVED_DM_IDS: string[] = ["sage", "hw"];

const GROUPS: GroupItem[] = [
  { id: "bf", name: "Black Friday Campaign", members: "Jason, Patrick +2", emoji: "🛍️", unread: 5, preview: "Randy: Love it! Opening it up now — give me a moment to read through.", time: "1:08 PM",
    createdBy: "Erika Schreiber", createdOn: "October 14, 2025",
    memberList: [
      { name: "Jason Park",   avatar: "https://i.pravatar.cc/150?img=7" },
      { name: "Patrick Chen", avatar: "https://i.pravatar.cc/150?img=12" },
      { name: "Lisa Gray",    avatar: "https://i.pravatar.cc/150?img=5" },
      { name: "Priya Rajan",  avatar: "https://i.pravatar.cc/150?img=44" },
    ]},
  { id: "vw", name: "VAU Working Group", members: "8 members", emoji: "🤖", preview: "Lisa: This is super helpful, bookmarking this 🙏", time: "12:34 PM",
    createdBy: "Lisa Gray", createdOn: "March 3, 2025",
    memberList: [
      { name: "Randy",          avatar: "/vau-bubs.svg" },
      { name: "Kara",          avatar: "/vau-kara.svg" },
      { name: "Eric",          avatar: "/vau-eric.svg" },
      { name: "Lisa Gray",     avatar: "https://i.pravatar.cc/150?img=5" },
      { name: "Marcus Santos", avatar: "https://i.pravatar.cc/150?img=12" },
      { name: "Jason Park",    avatar: "https://i.pravatar.cc/150?img=7" },
      { name: "Nadia Flores",  avatar: "https://i.pravatar.cc/150?img=29" },
      { name: "Tom Decker",    avatar: "https://i.pravatar.cc/150?img=17" },
    ]},
  { id: "cm", name: "Content Marketing Crew", members: "12 members", emoji: "✍️", hasDraft: true, preview: "You: On it, reviewing now 👀", time: "11:20 AM",
    createdBy: "Priya Rajan", createdOn: "January 8, 2025",
    memberList: [
      { name: "Lisa Gray",     avatar: "https://i.pravatar.cc/150?img=5" },
      { name: "Priya Rajan",   avatar: "https://i.pravatar.cc/150?img=44" },
      { name: "Marcus Santos", avatar: "https://i.pravatar.cc/150?img=12" },
      { name: "Jason Park",    avatar: "https://i.pravatar.cc/150?img=7" },
      { name: "Nadia Flores",  avatar: "https://i.pravatar.cc/150?img=29" },
      { name: "Patrick Chen",  avatar: "https://i.pravatar.cc/150?img=15" },
      { name: "Tom Decker",    avatar: "https://i.pravatar.cc/150?img=17" },
      { name: "Sarah Kim",     avatar: "https://i.pravatar.cc/150?img=39" },
      { name: "Dev Patel",     avatar: "https://i.pravatar.cc/150?img=56" },
      { name: "Amy Torres",    avatar: "https://i.pravatar.cc/150?img=32" },
      { name: "Ben Okafor",    avatar: "https://i.pravatar.cc/150?img=52" },
      { name: "Chloe Reyes",   avatar: "https://i.pravatar.cc/150?img=47" },
    ]},
  { id: "sg", name: "Stride GEO", members: "Randy ✨ · Nadia, Jason", emoji: "🌍", unread: 2, preview: "Randy sent an item that needs your approval", time: "10:55 AM",
    createdBy: "Jason Park", createdOn: "September 22, 2025",
    memberList: [
      { name: "Randy",        avatar: "/vau-bubs.svg" },
      { name: "Nadia Flores", avatar: "https://i.pravatar.cc/150?img=29" },
      { name: "Jason Park",   avatar: "https://i.pravatar.cc/150?img=7" },
    ]},
  { id: "q4gs", name: "Q4 Growth Sprint", members: "Kara ✨ · Sarah, Jason +1", emoji: "📈", preview: "Kara: Kicking off the brief drafts now. I'll ping when the first set is ready 📝", time: "9:47 AM",
    createdBy: "Sarah Kim", createdOn: "August 5, 2025",
    memberList: [
      { name: "Randy",        avatar: "/vau-bubs.svg" },
      { name: "Kara",         avatar: "/vau-kara.svg" },
      { name: "Sarah Kim",    avatar: "https://i.pravatar.cc/150?img=39" },
      { name: "Jason Park",   avatar: "https://i.pravatar.cc/150?img=7" },
    ]},
];

const CHANNELS: ChannelItem[] = [
  { id: "ch-general",   name: "#general",   preview: "Welcome to #general 👋 — introduce yourself!", unread: 2, time: "3:15 PM",
    createdBy: "Marcus Santos", createdOn: "February 12, 2024",
    memberList: [
      { name: "Jason Park",    avatar: "https://i.pravatar.cc/150?img=7" },
      { name: "Priya Rajan",   avatar: "https://i.pravatar.cc/150?img=44" },
      { name: "Lisa Gray",     avatar: "https://i.pravatar.cc/150?img=5" },
      { name: "Marcus Santos", avatar: "https://i.pravatar.cc/150?img=12" },
      { name: "Nadia Flores",  avatar: "https://i.pravatar.cc/150?img=29" },
      { name: "Patrick Chen",  avatar: "https://i.pravatar.cc/150?img=15" },
    ]},
  { id: "ch-marketing", name: "#marketing", preview: "Priya: New campaign deck is ready for feedback", time: "2:50 PM",
    createdBy: "Priya Rajan", createdOn: "April 3, 2024",
    memberList: [
      { name: "Priya Rajan",   avatar: "https://i.pravatar.cc/150?img=44" },
      { name: "Marcus Santos", avatar: "https://i.pravatar.cc/150?img=12" },
      { name: "Jason Park",    avatar: "https://i.pravatar.cc/150?img=7" },
      { name: "Amara Osei",    avatar: "https://i.pravatar.cc/150?img=38" },
    ]},
  { id: "ch-content",   name: "#content",   isPrivate: true, preview: "Lisa: Editorial calendar updated for Q3", time: "Yesterday",
    createdBy: "Lisa Gray", createdOn: "June 17, 2024",
    memberList: [
      { name: "Lisa Gray",     avatar: "https://i.pravatar.cc/150?img=5" },
      { name: "Priya Rajan",   avatar: "https://i.pravatar.cc/150?img=44" },
      { name: "Patrick Chen",  avatar: "https://i.pravatar.cc/150?img=15" },
      { name: "Sarah Kim",     avatar: "https://i.pravatar.cc/150?img=39" },
    ]},
];

const VAU_DELIVERABLES: Record<string, Deliverable[]> = {
  bubs: [
    { id: "b1", title: "Q3 Content Strategy Draft", type: "Blog Post" },
  ],
  kara: [
    { id: "k1", title: "2026 Brand Voice Guidelines Update",                  type: "Content Brief" },
    { id: "k2", title: "Top 10 AI Marketing Tools for Enterprise Teams",      type: "SEO Article" },
    { id: "k3", title: "Optimizely Product Launch Email Sequence",            type: "Email Draft" },
  ],
  eric: [
    { id: "e1", title: "Homepage CTA Multivariate Test",     type: "A/B Test" },
    { id: "e2", title: "Pricing Page Copy Variants",         type: "Test Variants" },
  ],
};

type GroupDeliverable = { id: string; title: string; type: string; vauId: string; vauName: string; vauAvatar: string };

type DeliverableContentBlock = { label?: string; text: string };
type DeliverableContent = { headline: string; meta: string; blocks: DeliverableContentBlock[] };

const DELIVERABLE_CONTENT: Record<string, DeliverableContent> = {
  b1: {
    headline: "Q3 Content Strategy: How AI Is Reshaping Marketing",
    meta: "Blog Post · 1,240 words · Est. 6 min read",
    blocks: [
      { label: "Introduction", text: "Artificial intelligence is no longer a future concept in marketing — it's the engine quietly driving campaigns at some of the world's most competitive brands. In Q3, our team leaned hard into AI-assisted content workflows, and the results are worth unpacking for the rest of the org." },
      { label: "Key Findings", text: "Personalization at scale was the biggest unlock. By using AI to segment audiences into 14 micro-cohorts rather than the usual 3–4 broad buckets, we saw a 22% lift in email open rates and a 17% improvement in click-through on landing pages. The content itself didn't change dramatically — the targeting did." },
      { label: "Editorial Workflow Changes", text: "We shifted from a 'draft → review → publish' model to a three-stage AI-assisted loop: outline generation, human refinement, and AI-powered SEO pass. This cut average article production time from 4.5 days to 1.8 days without measurable quality degradation based on reader engagement signals." },
      { label: "Recommendations", text: "For Q4, we recommend investing in a dedicated prompt library that captures our brand voice constraints, piloting a live A/B content framework for the blog, and exploring AI-generated social variations pegged to top-performing long-form pieces." },
    ],
  },
  b2: {
    headline: "Black Friday Campaign Email Series",
    meta: "Email Draft · 3 emails · Send window: Nov 25–29",
    blocks: [
      { label: "Email 1 — Teaser (Nov 25)", text: "Subject: Something big is coming 👀\n\nHey [First Name], we don't usually do this — but this year's Black Friday deal is different enough that we wanted to give you a heads up before the doors open. Keep an eye on your inbox Thursday night." },
      { label: "Email 2 — Launch (Nov 28)", text: "Subject: It's here. 40% off everything.\n\nFor 72 hours only, every Optimizely plan is 40% off — including our enterprise tier. No code needed, no hoops to jump through. Just upgrade before midnight Sunday and the discount locks in for 12 months." },
      { label: "Email 3 — Last Chance (Nov 29)", text: "Subject: Last call — offer ends at midnight\n\nThis is your final reminder that our Black Friday pricing disappears at 11:59 PM tonight. Over 3,200 teams upgraded in the last 48 hours. Don't let a deadline make this decision for you — make it now." },
    ],
  },
  b3: {
    headline: "LinkedIn Thought Leadership Series — November",
    meta: "Social Copy · 5 posts · Posting schedule: Mon/Wed/Fri",
    blocks: [
      { label: "Post 1", text: "Most content teams are measuring the wrong thing. They track word count, publish frequency, and social shares. The metric that actually predicts pipeline? Time-on-page from organic search on bottom-of-funnel keywords. Fix the metric, fix the strategy. #ContentMarketing #B2B" },
      { label: "Post 2", text: "We ran 14 A/B tests on our blog CTAs last quarter. The winner wasn't the flashiest button or the most urgent copy. It was a CTA that acknowledged what the reader just learned and offered the logical next step. Relevance > urgency, every time." },
      { label: "Post 3", text: "Unpopular opinion: AI doesn't make content teams faster. It makes bad processes much, much faster. Before you add AI to your workflow, document what great content looks like at your company. Otherwise you're just scaling mediocrity at 10x speed." },
    ],
  },
  k1: {
    headline: "2026 Brand Voice Guidelines Update",
    meta: "Content Brief · Updated for AI-era communications",
    blocks: [
      { label: "What Changed", text: "The 2024 guidelines were written before AI-generated content became a daily reality for our team. This update introduces three new dimensions: Specificity (prefer concrete numbers and examples over adjectives), Transparency (acknowledge uncertainty rather than paper over it), and Directness (cut preamble — get to the point in sentence one)." },
      { label: "Tone Calibration", text: "Optimizely speaks like a smart colleague, not a thought leader. We avoid phrases like 'in today's fast-paced landscape' and 'transformative solutions.' We do use real customer data, honest trade-offs, and plain language. When in doubt, ask: would a tired marketer at 4pm on a Friday find this useful?" },
      { label: "AI Content Guidelines", text: "All AI-generated content must pass a brand voice review before publishing. Key red flags: passive voice in more than 15% of sentences, any use of 'leverage' as a verb, superlatives without supporting data, and openings that begin with 'In today's world' or 'As we navigate.'" },
      { label: "Approved Vocabulary", text: "Use: experiment, test, personalize, measure, optimize, audience, signal, data, lift, variant. Avoid: synergy, disrupt, transform, revolutionize, unlock (unless literal), supercharge, game-changing, world-class, industry-leading." },
    ],
  },
  k2: {
    headline: "Top 10 AI Marketing Tools for Enterprise Teams",
    meta: "SEO Article · Target keyword: 'ai marketing tools enterprise' · Vol: 4,400/mo",
    blocks: [
      { label: "Search Intent", text: "Bottom-of-funnel buyers researching AI tooling to present to their CMO. Primary pain point: justifying ROI and integration complexity. Article should lead with outcomes and include at least one enterprise case study in the first 200 words to establish credibility early." },
      { label: "Outline", text: "1. Why enterprise AI marketing is different from SMB (governance, scale, compliance)\n2. Criteria we used to evaluate tools (integrations, pricing model, support tier, privacy)\n3. Tools 1–10 with: best for, key feature, pricing signal, one downside\n4. How to build a shortlist for your stack\n5. FAQ (10 questions sourced from 'People Also Ask' data)" },
      { label: "Internal Linking", text: "Link to: Optimizely experimentation overview (3× minimum), web personalization product page, case study with Telecom client on AI content workflows, and the content brief generator landing page." },
      { label: "Competitive Gap", text: "Top-ranking articles are from 2023 and don't include tools released after GPT-4. We have a significant recency advantage. Focus on tools that launched or had major updates in 2025–2026 to dominate freshness signals." },
    ],
  },
  k3: {
    headline: "Optimizely Product Launch Email Sequence",
    meta: "Email Draft · 4-email nurture · Launch window: Q4",
    blocks: [
      { label: "Email 1 — Announcement", text: "Subject: We built the thing you kept asking for\n\nFor the past 18 months, the most common feature request in our feedback portal was [Feature]. Today it's live. Here's what it does, who it's for, and how to turn it on in the next 5 minutes." },
      { label: "Email 2 — Deep Dive", text: "Subject: How [Feature] works under the hood\n\nIf you activated [Feature] last week, you've probably noticed [outcome]. This email covers the technical decisions behind it and the three workflow changes our power users are making to get the most out of it." },
      { label: "Email 3 — Social Proof", text: "Subject: What 500 teams did with [Feature] in the first week\n\nWe weren't expecting adoption this fast. 500 teams activated [Feature] in the first 7 days. Here's what they're actually doing with it — including one use case we didn't anticipate." },
    ],
  },
  e1: {
    headline: "Homepage CTA Multivariate Test",
    meta: "A/B Test · 4 variants · Target: CTA click-through rate",
    blocks: [
      { label: "Hypothesis", text: "We believe that replacing the current generic 'Get Started' CTA with outcome-focused copy ('Run your first experiment in 10 minutes') will increase click-through rate for first-time homepage visitors, because it speaks directly to the intent of users in the consideration phase." },
      { label: "Variants", text: "Control: 'Get Started Free'\nVariant A: 'Run your first experiment in 10 minutes'\nVariant B: 'See how Optimizely works' (soft CTA, targets browsers)\nVariant C: 'Start a free trial — no credit card' (removes friction objection)" },
      { label: "Traffic Allocation", text: "25% per variant. Target audience: new visitors with no prior cookie, arriving via organic search or direct. Exclude: existing customers (logged in), visitors from known paid remarketing campaigns. Minimum run time: 14 days. Statistical significance threshold: 95%." },
      { label: "Success Metrics", text: "Primary: CTA click-through rate. Secondary: trial signup completion rate for users who clicked (conversion quality). Guardrail: bounce rate — if any variant increases bounce by >5% relative, flag for early stopping." },
    ],
  },
  e2: {
    headline: "Pricing Page Copy Variants (3 versions)",
    meta: "Test Variants · 3 copy treatments · Pricing page",
    blocks: [
      { label: "Variant 1 — Value-Led", text: "Focus: Lead with outcomes, not features. 'Teams using Optimizely run 3× more experiments per quarter.' Pricing tiers named: Starter, Growth, Enterprise. Annual billing surfaced prominently as '2 months free.' Trust signal: '9,000+ teams worldwide.'" },
      { label: "Variant 2 — Simplicity-Led", text: "Focus: Reduce cognitive load. Single CTA per tier: 'Start free,' 'Talk to sales.' Feature comparison table hidden behind 'See full feature list' toggle. Emphasize: 'No setup fees. Cancel anytime.' Designed for visitors who abandon pricing pages due to overwhelm." },
      { label: "Variant 3 — Social Proof-Led", text: "Focus: Trust and peer validation. Customer logos above the fold. Tier anchoring via quote: 'We moved to Growth after our first 10 experiments paid for themselves — Sarah K., Head of Growth at Contoso.' G2 rating badge next to pricing header." },
    ],
  },
  e3: {
    headline: "Q4 Onboarding Flow Experiment Results",
    meta: "Test Report · 22-day run · n=4,812 participants",
    blocks: [
      { label: "Summary", text: "The progressive disclosure onboarding (Variant B) outperformed both the original wizard flow (Control) and the video-first onboarding (Variant A) on all three success metrics. Variant B is recommended for full rollout." },
      { label: "Results", text: "Activation rate (completed first experiment): Control 31% → Variant B 44% (+42% lift, p<0.001). Day-7 retention: Control 58% → Variant B 67% (+15% lift, p=0.003). Time to first experiment: Control 4.2 days → Variant B 1.9 days (−55%)." },
      { label: "Why Variant B Won", text: "Exit surveys indicate users in Variant B felt less overwhelmed during setup. The step-by-step reveal of features based on user progress — rather than all at once — reduced decision paralysis. Users who skipped steps in the wizard (Control) were 3× more likely to churn before day 14." },
      { label: "Recommended Next Steps", text: "1. Ship Variant B as the default for all new signups starting Nov 1. 2. Run a follow-up test on the 'invite teammate' prompt (shown too early in current B flow). 3. Instrument day-30 and day-60 cohort analysis to confirm retention impact at longer time horizons." },
    ],
  },
  gvw1: {
    headline: "Q3 Content Strategy Draft",
    meta: "Blog Post · Cross-team review · Prepared by Randy",
    blocks: [
      { label: "Executive Summary", text: "This Q3 content strategy covers eight content pillars aligned to the three pipeline stages most impacted by content-assisted conversion: awareness (top), evaluation (middle), and decision (bottom). Total planned output: 24 long-form pieces, 60 social posts, 4 email nurture tracks." },
      { label: "Priority Pillar: AI in Experimentation", text: "Search demand for AI-assisted A/B testing grew 180% YoY. We're currently unranked for the top 6 cluster terms. Recommended investment: 3 authoritative pieces in Q3, targeting clusters with buying intent. Expected payback: organic pipeline contribution in 60–90 days." },
      { label: "Resource Allocation", text: "Writers: 60% long-form, 20% social adaptation, 20% email copy. VAU-assisted tasks: keyword clustering, first draft on 8 of 24 long-form pieces, social copy for all published pieces. Human review: all drafts pass brand voice check before scheduling." },
    ],
  },
  gvw2: {
    headline: "SEO Keyword Analysis for Q4 Content",
    meta: "SEO Article · 3 keyword clusters · 10 priority topics · Prepared by Kara",
    blocks: [
      { label: "Cluster 1: AI Content Tools", text: "Top terms: 'ai content generator b2b' (6,600/mo), 'ai writing tool for marketing teams' (2,900/mo), 'best ai marketing software 2026' (1,800/mo). Current rank: unranked for all three. Gap vs. competitors: HubSpot ranks #2–4 with content that's 18+ months old. Freshness opportunity is high." },
      { label: "Cluster 2: Content Personalization", text: "Top terms: 'website personalization platform' (3,200/mo), 'dynamic content marketing' (1,400/mo), 'personalized landing page software' (880/mo). Current rank: #7–11 across cluster. Recommended action: refresh existing /personalization page with 2025 use cases and add FAQ schema." },
      { label: "Cluster 3: Experimentation ROI", text: "Top terms: 'how to measure ab test results' (5,400/mo), 'a/b testing roi calculator' (1,200/mo), 'experimentation program metrics' (720/mo). Current rank: #3 for calculator term. Opportunity: build linked hub page connecting calculator → ROI guide → case studies to capture full funnel." },
      { label: "Recommended Q4 Focus", text: "Prioritize Cluster 1 for net-new content (largest gap, high buyer intent), Cluster 3 for quick wins via content refresh (already ranking, incremental lift possible), and Cluster 2 for one well-resourced pillar piece to improve domain authority in personalization segment." },
    ],
  },
  sg1: {
    headline: "Q&A: Discover the Unknown",
    meta: "GEO Q&A article · 7 Q&A pairs · Updated v2",
    blocks: [
      { label: "What is Discover the Unknown?", text: "Discover the Unknown is Stride's flagship multi-sport challenge series — an explorer-first adventure platform that throws individuals and teams into the wild unknown. It's not a checklist; it's a journey into terrain, weather, and limits you didn't know you had." },
      { label: "What activities does it support?", text: "The program is built around trail running, rock climbing, free diving, skydiving, and multi-terrain endurance challenges. Each discipline can be combined into a multi-day expedition or tackled individually as a standalone challenge." },
      { label: "Who is Discover the Unknown designed for?", text: "Stride's Discover the Unknown is built for teams and individuals who want structured adventure experiences. It suits corporate groups, competitive athletes, and anyone looking for a challenge that blends fitness with exploration." },
      { label: "How does it help teams?", text: "The program is purpose-built for competitive multi-sport group challenges — not generic team building. Groups race, climb, and dive together toward shared goals, with Stride tracking performance across disciplines and adapting difficulty as teams improve." },
      { label: "What makes Discover the Unknown different from other adventure programs?", text: "Stride's experience-design methodology sets it apart — each challenge is sequenced to escalate difficulty, keeping participants engaged across multiple sessions. The program tracks progress and adapts to team performance over time." },
      { label: "Is Discover the Unknown suitable for beginners?", text: "Yes. Challenge difficulty is scaled to participant ability. First-time participants complete an onboarding assessment that places them in the right tier, ensuring the experience is appropriately challenging without being inaccessible." },
      { label: "How do I get started with Discover the Unknown?", text: "Teams can register through the Stride platform. After completing the onboarding profile, participants receive a tailored challenge roadmap, gear checklist, and access to the Stride coordination tools for scheduling and tracking." },
    ],
  },
  "kara-q4-brief": {
    headline: "Q4 SEO Content Brief",
    meta: "Content Brief · q4-content-brief.md · 3 keyword clusters · 10 topics",
    blocks: [
      { label: "Overview", text: "This brief covers the full Q4 content strategy for Optimizely's SEO program. It maps three primary keyword clusters to ten planned articles, with target metrics, recommended formats, and internal linking guidance for each piece." },
      { label: "Cluster 1 — AI Content Tools", text: "Target: 'ai content generator b2b' (6,600/mo), 'ai writing tool for marketing teams' (2,900/mo). Recommended format: long-form comparison guide (2,500+ words). Target persona: Marketing Ops leads evaluating AI tooling. CTA: free trial." },
      { label: "Cluster 2 — Personalization", text: "Target: 'website personalization platform' (3,200/mo), 'dynamic content marketing' (1,400/mo). Recommended format: use-case roundup with customer examples. Target persona: Growth and Demand Gen. CTA: book a demo." },
      { label: "Cluster 3 — Experimentation ROI", text: "Target: 'how to measure ab test results' (5,400/mo), 'a/b testing roi calculator' (1,200/mo). Recommended format: interactive calculator + supporting guide. Target persona: Analysts and VPs of Product. CTA: ROI calculator." },
      { label: "Editorial Calendar", text: "Week 1 (Oct 7): Cluster 3 — ROI guide. Week 2 (Oct 14): Cluster 1 — AI tools comparison. Week 3 (Oct 21): Cluster 2 — personalization roundup. Weeks 4–6: supporting articles (10 total). All pieces reviewed by Erika before scheduling." },
    ],
  },
  gvw3: {
    headline: "Homepage CTA Multivariate Test",
    meta: "A/B Test · 3 variants · Target metric: trial signup rate · Prepared by Eric",
    blocks: [
      { label: "Test Overview", text: "This test evaluates three CTA treatments on the homepage hero section for first-time visitors. The current 'Get Started Free' CTA converts at 3.2%. Internal benchmarking suggests outcome-oriented CTAs in our category average 4.5–5.0%, indicating meaningful upside." },
      { label: "Variants Under Test", text: "Control: 'Get Started Free' (green button, center-aligned hero)\nVariant A: 'Start your first experiment free' (same placement, outcome language)\nVariant B: 'See a live demo →' (lower-commitment entry point for browsers)\nVariant C: Split button — 'Start free' primary + 'Watch demo' ghost secondary" },
      { label: "Audience & Duration", text: "New visitors via organic and direct only. Paid traffic excluded to avoid polluting intent signal. Sample size needed per variant: 2,100 (80% power, 95% confidence, MDE 0.8%). Expected run time at current traffic: 18–21 days. Start date: Nov 4, 2026." },
      { label: "Decision Framework", text: "If Variant A wins: update all CTAs site-wide to outcome language in Q4. If Variant B wins: explore reducing homepage commitment friction across all top-of-funnel pages. If Variant C wins: implement split-button pattern on pricing page and product pages. If no winner: ship Variant A as default (directional lift, lower risk than no change)." },
    ],
  },
};

// Which groups contain VAUs (used to show Needs Review)
// Always-on typing indicators per conversation (never cleared)
const TYPING_USERS: Record<string, { name: string; avatar: string }[]> = {
  js:   [{ name: "Jane Smith",  avatar: "https://i.pravatar.cc/150?img=47" }],
  pr:   [{ name: "Priya Rajan", avatar: "https://i.pravatar.cc/150?img=44" }],
  bf:   [{ name: "Patrick Lee", avatar: "https://i.pravatar.cc/150?img=53" }, { name: "Jason Wu", avatar: "https://i.pravatar.cc/150?img=61" }],
  vw:   [{ name: "Randy",        avatar: "/vau-bubs.svg" }],
};

const GROUP_VAU_IDS: Record<string, string[]> = {
  vw: ["bubs", "kara", "eric"],
  sg: ["frank"],
  q4gs: ["bubs", "kara"],
};

const ARCHIVED_VAU_THREAD: Record<string, Message[]> = {
  sage: [
    {
      id: "sage1", from: "vau",
      senderName: "Sage", senderAvatar: "", senderColor: "var(--ax-colors-fg-tertiary)",
      text: "Hi! I've started on the onboarding email sequence. Planning 7 emails covering welcome, activation, first feature use, and a 7-day check-in. Does this scope sound right?",
    },
    {
      id: "sage2", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Yes, perfect scope. One thing — can you make the tone more conversational? Less formal, more like a teammate checking in.",
    },
    {
      id: "sage3", from: "vau",
      senderName: "Sage", senderAvatar: "", senderColor: "var(--ax-colors-fg-tertiary)",
      text: "Done — rewrote all 7 subjects and openers. Dropped the corporate language, added first-name callouts, and shortened the CTAs. Much more conversational now.",
      reactions: [{ emoji: "👍", count: 1 }],
    },
    {
      id: "sage4", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Can you also add a re-engagement email for users who go inactive after day 14?",
    },
    {
      id: "sage5", from: "vau",
      senderName: "Sage", senderAvatar: "", senderColor: "var(--ax-colors-fg-tertiary)",
      text: "Added — email 8 targets users inactive after 14 days. Subject: \"Still figuring things out?\" with a quick-start checklist and a prompt to book office hours.",
      reactions: [{ emoji: "✅", count: 2 }],
    },
    {
      id: "sage6", from: "vau",
      senderName: "Sage", senderAvatar: "", senderColor: "var(--ax-colors-fg-tertiary)",
      text: "All 8 emails are drafted and staged for review. The re-engagement email is queued as a separate flow — ready whenever you are.",
    },
  ],
};

const GROUP_PAUSED_VAU_IDS: Record<string, string[]> = {
  q4gs: ["bubs"],
};

const CHANNEL_VAU_IDS: Record<string, string[]> = {
  "ch-marketing": ["bubs"],
};

// Prototype review items for group chats
const GROUP_DELIVERABLES: Record<string, GroupDeliverable[]> = {
  vw: [
    { id: "gvw1", title: "Q3 Content Strategy Draft",           type: "Blog Post",   vauId: "bubs", vauName: "Randy", vauAvatar: "/vau-bubs.svg" },
    { id: "gvw2", title: "SEO Keyword Analysis for Q4 Content", type: "SEO Article", vauId: "kara", vauName: "Kara", vauAvatar: "/vau-kara.svg" },
    { id: "gvw3", title: "Homepage CTA Multivariate Test",      type: "A/B Test",    vauId: "eric", vauName: "Eric", vauAvatar: "/vau-eric.svg" },
  ],
  sg: [
    { id: "sg1", title: "Stride GEO: Updated Article Draft", type: "SEO Article", vauId: "bubs", vauName: "Randy", vauAvatar: "/vau-bubs.svg" },
  ],
  q4gs: [],
};

const CHANNEL_DELIVERABLES: Record<string, GroupDeliverable[]> = {
  "ch-marketing": [
    { id: "chm1", title: "Q4 Campaign Performance Report", type: "Analytics Report", vauId: "bubs", vauName: "Randy", vauAvatar: "/vau-bubs.svg" },
  ],
};

const ALL_ARTIFACTS: Record<string, Deliverable[]> = {
  // Human DMs
  js: [
    { id: "js1", title: "Homepage Redesign Mockups v3",         type: "Design File",  thumbnail: "https://picsum.photos/seed/js1/400/200" },
    { id: "js2", title: "Brand Identity Refresh Presentation",  type: "Slides",       thumbnail: "https://picsum.photos/seed/js2/400/200" },
  ],
  lg: [
    { id: "lg1", title: "Q4 Editorial Calendar",                type: "Document",     thumbnail: "https://picsum.photos/seed/lg1/400/200" },
    { id: "lg2", title: "Content Performance Report — Oct",     type: "Report",       thumbnail: "https://picsum.photos/seed/lg2/400/200" },
  ],
  hw: [
    { id: "hw1", title: "Platform Architecture Spec v2",        type: "Technical Doc", thumbnail: "https://picsum.photos/seed/hw1/400/200" },
    { id: "hw2", title: "2026 Product Roadmap",                 type: "Slides",       thumbnail: "https://picsum.photos/seed/hw2/400/200" },
    { id: "hw3", title: "API Integration Guide",                type: "Document",     thumbnail: "https://picsum.photos/seed/hw3/400/200" },
  ],
  bw: [
    { id: "bw1", title: "Customer Journey Analysis",            type: "Report",       thumbnail: "https://picsum.photos/seed/bw1/400/200" },
    { id: "bw2", title: "Competitive Landscape Overview",       type: "Document",     thumbnail: "https://picsum.photos/seed/bw2/400/200" },
  ],
  ms: [
    { id: "ms1", title: "Instagram Campaign Assets — Nov",      type: "Design File",  thumbnail: "https://picsum.photos/seed/ms1/400/200" },
    { id: "ms2", title: "Paid Social Strategy Deck",            type: "Slides",       thumbnail: "https://picsum.photos/seed/ms2/400/200" },
  ],
  pr: [
    { id: "pr1", title: "User Research Synthesis — Onboarding", type: "Report",       thumbnail: "https://picsum.photos/seed/pr1/400/200" },
    { id: "pr2", title: "Persona Deck 2026",                    type: "Slides",       thumbnail: "https://picsum.photos/seed/pr2/400/200" },
    { id: "pr3", title: "Interview Transcripts — Nov Cohort",   type: "Document",     thumbnail: "https://picsum.photos/seed/pr3/400/200" },
  ],
  td: [
    { id: "td1", title: "Frontend Performance Audit",           type: "Report",       thumbnail: "https://picsum.photos/seed/td1/400/200" },
    { id: "td2", title: "Component Library Migration Plan",     type: "Technical Doc", thumbnail: "https://picsum.photos/seed/td2/400/200" },
  ],
  ao: [
    { id: "ao1", title: "Brand Guidelines Update — Fall 2026",  type: "Design File",  thumbnail: "https://picsum.photos/seed/ao1/400/200" },
    { id: "ao2", title: "Event Campaign Visual Kit",            type: "Design File",  thumbnail: "https://picsum.photos/seed/ao2/400/200" },
  ],
  // VAUs
  bubs: [
    { id: "b1", title: "Q3 Content Strategy: How AI Is Reshaping Marketing", type: "Blog Post",    thumbnail: "https://picsum.photos/seed/b1/400/200" },
    { id: "b2", title: "Black Friday Campaign Email Series",                  type: "Email Draft",  thumbnail: "https://picsum.photos/seed/b2/400/200" },
    { id: "b3", title: "LinkedIn Thought Leadership Series — November",       type: "Social Copy",  thumbnail: "https://picsum.photos/seed/b3/400/200" },
    { id: "b4", title: "Optimizely Year in Review 2025",                      type: "Blog Post",    thumbnail: "https://picsum.photos/seed/b4/400/200" },
    { id: "b5", title: "Q4 Nurture Email Sequence — Enterprise",              type: "Email Draft",  thumbnail: "https://picsum.photos/seed/b5/400/200" },
    { id: "b6", title: "2026 Content Pillar Strategy Deck",                   type: "Slides",       thumbnail: "https://picsum.photos/seed/b6/400/200" },
    { id: "b7", title: "Personalization Playbook for B2B Marketers",          type: "Guide",        thumbnail: "https://picsum.photos/seed/b7/400/200" },
  ],
  kara: [
    { id: "k1", title: "2026 Brand Voice Guidelines Update",                  type: "Content Brief", thumbnail: "https://picsum.photos/seed/k1/400/200" },
    { id: "k2", title: "Top 10 AI Marketing Tools for Enterprise Teams",      type: "SEO Article",  thumbnail: "https://picsum.photos/seed/k2/400/200" },
    { id: "k3", title: "Optimizely Product Launch Email Sequence",            type: "Email Draft",  thumbnail: "https://picsum.photos/seed/k3/400/200" },
  ],
  eric: [
    { id: "e1", title: "Homepage CTA Multivariate Test",                      type: "A/B Test",     thumbnail: "https://picsum.photos/seed/e1/400/200" },
    { id: "e2", title: "Pricing Page Copy Variants (3 versions)",             type: "Test Variants", thumbnail: "https://picsum.photos/seed/e2/400/200" },
    { id: "e3", title: "Q4 Onboarding Flow Experiment Results",               type: "Test Report",  thumbnail: "https://picsum.photos/seed/e3/400/200" },
  ],
  sage: [
    { id: "sg1", title: "Welcome Email — Onboarding Series",                  type: "Email Draft",  thumbnail: "https://picsum.photos/seed/sg1/400/200" },
    { id: "sg2", title: "Activation Email — First Steps",                     type: "Email Draft",  thumbnail: "https://picsum.photos/seed/sg2/400/200" },
    { id: "sg3", title: "Feature Discovery Email — Day 3",                    type: "Email Draft",  thumbnail: "https://picsum.photos/seed/sg3/400/200" },
    { id: "sg4", title: "7-Day Check-in — How's it going?",                  type: "Email Draft",  thumbnail: "https://picsum.photos/seed/sg4/400/200" },
    { id: "sg5", title: "Day 14 Re-engagement — Still figuring things out?", type: "Email Draft",  thumbnail: "https://picsum.photos/seed/sg5/400/200" },
  ],
  // Groups
  bf: [
    { id: "bf1", title: "Black Friday Campaign Brief 2026",       type: "Document",     thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&q=70" },
    { id: "bf2", title: "Email Series — 5 Touchpoints",           type: "Email Draft",  thumbnail: "https://images.unsplash.com/photo-1596526131083-e8c633064982?w=400&q=70" },
    { id: "bf3", title: "Paid Social Ad Set — Draft",             type: "Design File",  thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=70" },
  ],
  vw: [
    { id: "vw1", title: "VAU Use Case Research Report",           type: "Report",       thumbnail: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&q=70" },
    { id: "vw2", title: "Rollout Playbook — Phase 1",             type: "Document",     thumbnail: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&q=70" },
  ],
  cm: [
    { id: "cm1", title: "Editorial Calendar — H1 2026",           type: "Document",     thumbnail: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&q=70" },
    { id: "cm2", title: "Content Style Guide v4",                 type: "Document",     thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&q=70" },
    { id: "cm3", title: "SEO Keyword Clusters — Q4",              type: "Report",       thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=70" },
  ],
};

const RANDY_WORK_ITEMS = [
  {
    id: "rw1",
    priority: "Urgent",
    priorityBg: "#FAD9E7",
    priorityColor: "#8B1A3A",
    title: "Q3 Marketing Roadmap Brief",
    source: "Meeting_Prep",
    description: "Review before 3 PM meeting today. Deck has 4 outstanding sections needing your input.",
    time: "10:15 AM",
  },
  {
    id: "rw2",
    priority: "Medium Priority",
    priorityBg: "#FFF3C4",
    priorityColor: "#7A4F00",
    title: "Sarah Chen Follow-up Email",
    source: "Email_Triage",
    description: "Approve to send. HITL gated — will not send without your action.",
    time: "9:15 AM",
  },
  {
    id: "rw3",
    priority: "No Rush",
    priorityBg: "var(--ax-colors-bg-secondary)",
    priorityColor: "var(--ax-colors-fg-secondary)",
    title: "Weekly Performance Summary",
    source: "Performance_Digest",
    description: "Acknowledge before Friday sync. Covers email open rate, CMP throughput, and campaign deltas.",
    time: "8:00 AM",
  },
];

// Mock message threads per conversation
const CHANNEL_THREADS: Record<string, Message[]> = {
  "ch-general": [
    { id: "cg1", from: "human", senderName: "Priya Rajan",  senderAvatar: "https://i.pravatar.cc/150?img=44", text: "Welcome to #general 👋 — introduce yourself and let us know what team you're on!" },
    { id: "cg2", from: "human", senderName: "Marcus Santos", senderAvatar: "", text: "Hey everyone! Marcus here from Product. Excited to be working with this crew 🙌" },
    { id: "cg3", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Hi all! Happy to be here. Looking forward to collaborating with you all.", reactions: [{ emoji: "❤️", count: 3 }] },
    { id: "cg4", from: "human", senderName: "Lisa Gray",    senderAvatar: "https://i.pravatar.cc/150?img=9",  text: "Love the energy in here! Has everyone seen the new content brief that went out this morning?" },
    { id: "cg5", from: "human", senderName: "Priya Rajan",  senderAvatar: "https://i.pravatar.cc/150?img=44", text: "Yes! The new campaign deck looks great. Left some comments on page 4." },
  ],
  "ch-marketing": [
    { id: "cm1", from: "human", senderName: "Priya Rajan",  senderAvatar: "https://i.pravatar.cc/150?img=44", text: "New campaign deck is ready for feedback — take a look and share any thoughts by Friday." },
    { id: "cm2", from: "human", senderName: "Amara Osei",   senderAvatar: "https://i.pravatar.cc/150?img=38", text: "Really strong visuals this time! The hero section especially — nice work @Priya" },
    { id: "cm3", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "Agreed, the narrative arc is much tighter than last quarter. Can we get Eric to run a CTA variant test?" },
    { id: "cm4", from: "human", senderName: "Marcus Santos", senderAvatar: "", text: "I'll loop Eric in — good call. Targeting the end of next week for that." },
  ],
  "ch-content": [
    { id: "cc1", from: "human", senderName: "Lisa Gray",    senderAvatar: "https://i.pravatar.cc/150?img=9",  text: "Editorial calendar updated for Q3 — all slots are filled through September. Let me know if anything needs adjusting." },
    { id: "cc2", from: "human", senderName: "Jane Smith",   senderAvatar: "https://i.pravatar.cc/150?img=47", text: "This is so organized, thank you Lisa!! I added a note on the mid-August piece — we may need to push it a week." },
    { id: "cc3", from: "user",  senderAvatar: "https://i.pravatar.cc/150?img=24", text: "No problem on the push. I've also flagged the SEO keyword clusters doc — worth reviewing before we finalize the August topics." },
    { id: "cc4", from: "human", senderName: "Lisa Gray",    senderAvatar: "https://i.pravatar.cc/150?img=9",  text: "Great point. Randy already ran an analysis — I'll share the output here once it's cleaned up." },
  ],
};

const THREADS: Record<string, Message[]> = {
  bf: [
    {
      id: "1", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Hey y'all! I'm working on a new blog post and I wanted to get your thoughts. I had Randy help with some of the content.",
    },
    {
      id: "2", from: "vau",
      senderName: "Randy", senderAvatar: "/vau-bubs.svg", senderColor: "var(--opal-vau-bubs)",
      text: "Sure! I'd be happy to review. Send on over.",
      reactions: [{ emoji: "👍", count: 2 }, { emoji: "😊", count: 1 }],
    },
    {
      id: "3", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Here you go!",
    },
    {
      id: "4", from: "user", type: "attachment",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "",
      attachment: {
        title: "Q3 Content Strategy: How AI Is Reshaping Marketing",
        file: "q3-blog-post.pdf",
      },
    },
    {
      id: "5", from: "vau",
      senderName: "Randy", senderAvatar: "/vau-bubs.svg", senderColor: "var(--opal-vau-bubs)",
      text: "Love it! Opening it up now — give me a moment to read through.",
      reactions: [{ emoji: "❤️", count: 3 }, { emoji: "🔥", count: 2 }],
    },
  ],
  js: [
    {
      id: "1", from: "human",
      senderName: "Jane Smith", senderAvatar: "https://i.pravatar.cc/150?img=47",
      text: "Hey! Did you see the latest campaign brief? 👀",
    },
    {
      id: "2", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Just read it — looks great. I had a few notes though.",
    },
    {
      id: "3", from: "human",
      senderName: "Jane Smith", senderAvatar: "https://i.pravatar.cc/150?img=47",
      text: "Would love to hear them! @Erika can we jump on a quick call?",
      threadCount: 2,
    },
    {
      id: "4", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Sure, free at 2pm?",
    },
    {
      id: "5", from: "human",
      senderName: "Jane Smith", senderAvatar: "https://i.pravatar.cc/150?img=47",
      text: "Perfect 🙌 sending an invite now",
    },
    {
      id: "6", from: "human",
      senderName: "Jane Smith", senderAvatar: "https://i.pravatar.cc/150?img=47",
      text: "Also @Erika — totally unrelated but have you tried the new Randy email draft feature? Game changer honestly 🤯",
    },
    {
      id: "7", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "YES it's so good. I used it for the last three stakeholder updates lol",
    },
    {
      id: "8", from: "human",
      senderName: "Jane Smith", senderAvatar: "https://i.pravatar.cc/150?img=47",
      text: "Same 😂 see you at 2!",
    },
  ],
  lg: [
    {
      id: "1", from: "human",
      senderName: "Lisa Gray", senderAvatar: "https://i.pravatar.cc/150?img=9",
      text: "Hey! I finished the first pass on the new design components 🎉",
    },
    {
      id: "2", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Ooh exciting! Can you drop the Figma link?",
    },
    {
      id: "3", from: "human",
      senderName: "Lisa Gray", senderAvatar: "https://i.pravatar.cc/150?img=9",
      text: "Just shared it in the design channel too. I'm pretty happy with how the card variants turned out.",
    },
    {
      id: "4", from: "human",
      senderName: "Lisa Gray", senderAvatar: "https://i.pravatar.cc/150?img=9",
      text: "@Erika one thing I'm still debating — should the hover state use the secondary bg token or a border highlight? 🤔",
      threadCount: 4,
    },
    {
      id: "5", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Honestly I'd go border highlight — feels more intentional. The bg hover can get muddy with nested components.",
    },
    {
      id: "6", from: "human",
      senderName: "Lisa Gray", senderAvatar: "https://i.pravatar.cc/150?img=9",
      text: "That's a good point. Switching it now. Also — can we do a 30 min review Thursday?",
    },
    {
      id: "7", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Thursday works! Morning or afternoon?",
    },
    {
      id: "8", from: "human",
      senderName: "Lisa Gray", senderAvatar: "https://i.pravatar.cc/150?img=9",
      text: "10am? I'll block it ✅",
    },
  ],
  hw: [
    {
      id: "1", from: "human",
      senderName: "Harry Winston-Brown", senderAvatar: "https://i.pravatar.cc/150?img=52",
      text: "Quick heads up — IT is pushing a macOS update tonight, might need a restart in the morning.",
    },
    {
      id: "2", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Thanks for the heads up! Anything I need to do beforehand?",
    },
    {
      id: "3", from: "human",
      senderName: "Harry Winston-Brown", senderAvatar: "https://i.pravatar.cc/150?img=52",
      text: "Just save and close everything before you leave. Should be seamless 🤞",
    },
    {
      id: "4", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Done. Also — any update on the Figma plugin access request I sent last week?",
    },
    {
      id: "5", from: "human",
      senderName: "Harry Winston-Brown", senderAvatar: "https://i.pravatar.cc/150?img=52",
      text: "Ah yes! Approved this morning. You should have it now — try logging out and back in.",
    },
    {
      id: "6", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Just checked — it's there! 🙏 You're the best Harry",
    },
    {
      id: "7", from: "human",
      senderName: "Harry Winston-Brown", senderAvatar: "https://i.pravatar.cc/150?img=52",
      text: "Happy to help 😄 Let me know if anything else comes up!",
    },
    {
      id: "8", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "One more thing — I've got 3 nav redesign concepts ready. Can you take a quick look and pick your favourite?",
    },
    {
      id: "9", from: "human",
      senderName: "Harry Winston-Brown", senderAvatar: "https://i.pravatar.cc/150?img=52",
      text: "I love #1. Going with that 🎯",
    },
  ],
  bw: [
    {
      id: "1", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Hey Brendan! Are you going to the offsite next month?",
    },
    {
      id: "2", from: "human",
      senderName: "Brendan Wilmington", senderAvatar: "https://i.pravatar.cc/150?img=57",
      text: "100%! Already booked flights. You?",
    },
    {
      id: "3", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Yep! Really looking forward to the strategy sessions. Should be a good one.",
    },
    {
      id: "4", from: "human",
      senderName: "Brendan Wilmington", senderAvatar: "https://i.pravatar.cc/150?img=57",
      text: "Same. BTW I heard they're doing a demo of the new Opal agent builder — have you seen it yet?",
    },
    {
      id: "5", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "I've been playing with it! It's actually really powerful once you get into the workflow builder.",
    },
    {
      id: "6", from: "human",
      senderName: "Brendan Wilmington", senderAvatar: "https://i.pravatar.cc/150?img=57",
      text: "Nice 👌 maybe we can sit together at the demo and you can give me the insider tour 😄",
    },
    {
      id: "7", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Deal! See you there 🚀",
    },
  ],
  ms: [
    {
      id: "1", from: "human",
      senderName: "Marcus Santos", senderAvatar: "",
      text: "Hey — I pulled the Q2 content performance data. Some really interesting stuff in here 📊",
    },
    {
      id: "2", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Oh nice! What are the highlights?",
    },
    {
      id: "3", from: "human",
      senderName: "Marcus Santos", senderAvatar: "",
      text: "Long-form blog posts outperformed short ones by 3x on time-on-page. Also, AI-drafted content had higher initial click rates but slightly lower scroll depth.",
    },
    {
      id: "4", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "That scroll depth finding is really interesting. Maybe the hooks are stronger but the body needs more work?",
    },
    {
      id: "5", from: "human",
      senderName: "Marcus Santos", senderAvatar: "",
      text: "Exactly what I was thinking. It's like AI front-loads all the value.",
    },
    {
      id: "6", from: "human",
      senderName: "Marcus Santos", senderAvatar: "",
      text: "I'll send over the full deck — might be worth looping in Kara to help rebalance some of the drafts.",
    },
    {
      id: "7", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Good call. Let's do it 💪",
    },
  ],
  pr: [
    {
      id: "1", from: "human",
      senderName: "Priya Rajan", senderAvatar: "https://i.pravatar.cc/150?img=44",
      text: "Hey! Loving the direction on the Q3 blog. One quick ask — can we add a section on personalization? It's super relevant to our ICP right now.",
    },
    {
      id: "2", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Great idea! I'll slot it in after the AI section. Want me to have Randy draft it?",
    },
    {
      id: "3", from: "human",
      senderName: "Priya Rajan", senderAvatar: "https://i.pravatar.cc/150?img=44",
      text: "Yes please! And can it reference the Optimizely personalization stats from the 2025 report? That data is 🔥",
    },
    {
      id: "4", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "On it! Should have a draft to you by EOD.",
    },
    {
      id: "5", from: "human",
      senderName: "Priya Rajan", senderAvatar: "https://i.pravatar.cc/150?img=44",
      text: "You're amazing, thank you 🙏",
    },
    {
      id: "6", from: "human",
      senderName: "Priya Rajan", senderAvatar: "https://i.pravatar.cc/150?img=44",
      text: "Also @Erika — are you going to the design review tomorrow? I want to make sure someone from content is in the room.",
      threadCount: 3,
    },
    {
      id: "7", from: "human",
      senderName: "Priya Rajan", senderAvatar: "https://i.pravatar.cc/150?img=44",
      text: "Just flagging in case you hadn't seen the calendar invite! It got added pretty last minute 😬",
    },
    {
      id: "8", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Yep, I'll be there! Also — wrapping up the Q4 content brief, will send it over today.",
    },
    {
      id: "9", from: "human",
      senderName: "Priya Rajan", senderAvatar: "https://i.pravatar.cc/150?img=44",
      text: "I've put together the full Q4 content brief based on our conversation. Ready for your review before I start building out the article briefs.",
    },
  ],
  td: [
    {
      id: "1", from: "human",
      senderName: "Tom Decker", senderAvatar: "https://i.pravatar.cc/150?img=53",
      text: "Hey — got a sec? I'm working on the Opal API integration and hitting a weird edge case with streaming responses.",
    },
    {
      id: "2", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Sure! What's the behavior you're seeing?",
    },
    {
      id: "3", from: "human",
      senderName: "Tom Decker", senderAvatar: "https://i.pravatar.cc/150?img=53",
      text: "If the stream takes longer than ~10s the UI just hangs. No error state, no timeout — just frozen 🧊",
    },
    {
      id: "4", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "That sounds like a missing abort controller. Are you setting a timeout on the fetch?",
    },
    {
      id: "5", from: "human",
      senderName: "Tom Decker", senderAvatar: "https://i.pravatar.cc/150?img=53",
      text: "I'm not 🤦 that's definitely it. Let me add that in.",
    },
    {
      id: "6", from: "human",
      senderName: "Tom Decker", senderAvatar: "https://i.pravatar.cc/150?img=53",
      text: "Fixed! Works perfectly now. You just saved me like 3 hours 😂 thanks!!",
    },
    {
      id: "7", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Ha! Glad that was it. The frozen UI with no error is a classic one 😄",
    },
  ],
  ao: [
    {
      id: "1", from: "human",
      senderName: "Amara Osei", senderAvatar: "https://i.pravatar.cc/150?img=38",
      text: "Hey! Just finished the first round of brand refresh concepts for the Fall campaign visual kit 🎨 want to be the first set of eyes before I share wider?",
    },
    {
      id: "2", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Yes absolutely, send it over! What direction did you go with?",
    },
    {
      id: "3", from: "human",
      senderName: "Amara Osei", senderAvatar: "https://i.pravatar.cc/150?img=38",
      text: "Bold gradients but grounded — earthy tones with a lot of movement. Pretty different from our usual palette, I'm curious what you think.",
    },
    {
      id: "4", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "That sounds really fresh actually. Dropping the Figma link in here or the brand channel?",
    },
    {
      id: "5", from: "human",
      senderName: "Amara Osei", senderAvatar: "https://i.pravatar.cc/150?img=38",
      text: "I'll share in the brand channel after you've had a look. Wanted your eyes first since you're leading the campaign 🙏",
    },
    {
      id: "6", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Just pulled it up — this is incredible, Amara. The typography especially ✨",
    },
    {
      id: "7", from: "human",
      senderName: "Amara Osei", senderAvatar: "https://i.pravatar.cc/150?img=38",
      text: "You're too kind 😊 I'll incorporate your notes and post to the brand channel this afternoon.",
    },
  ],
  vw: [
    {
      id: "1", from: "human",
      senderName: "Patrick Lee", senderAvatar: "https://i.pravatar.cc/150?img=60",
      text: "VAU Working Group 👋 Kicking off our first async check-in! Quick question for everyone — which VAU are you using most right now?",
    },
    {
      id: "2", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Randy for content drafting, Kara for SEO review. Honestly using them both daily at this point.",
    },
    {
      id: "3", from: "human",
      senderName: "Lisa Gray", senderAvatar: "https://i.pravatar.cc/150?img=9",
      text: "Same! Randy has been a game changer for writing specs. The 'make it punchier' prompt is carrying me 😂",
      reactions: [{ emoji: "😂", count: 4 }, { emoji: "👍", count: 3 }],
    },
    {
      id: "4", from: "human",
      senderName: "Marcus Santos", senderAvatar: "",
      text: "Eric for anything data-adjacent. His suggested test variants are shockingly good.",
    },
    {
      id: "5", from: "human",
      senderName: "Patrick Lee", senderAvatar: "https://i.pravatar.cc/150?img=60",
      text: "Great signals! One thing I want to track this quarter — is anyone hitting accuracy issues? Like confidently wrong answers?",
    },
    {
      id: "6", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Occasionally with sourced stats. I always double-check numbers Randy cites before publishing.",
    },
    {
      id: "7", from: "human",
      senderName: "Lisa Gray", senderAvatar: "https://i.pravatar.cc/150?img=9",
      text: "Same — and I'd love a 'cite your sources' mode 👀 cc @Patrick is that on the roadmap?",
    },
    {
      id: "8", from: "human",
      senderName: "Patrick Lee", senderAvatar: "https://i.pravatar.cc/150?img=60",
      text: "Adding it to the backlog right now! Great thread everyone 🙌",
      reactions: [{ emoji: "🙌", count: 5 }, { emoji: "👏", count: 2 }],
    },
    {
      id: "9", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Also sharing the usage report I put together — has some good data for the backlog.",
    },
    {
      id: "10", from: "user", type: "attachment",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "",
      attachment: {
        title: "VAU Use Case Research Report",
        file: "vau-usage-report.pdf",
      },
    },
    {
      id: "11", from: "human",
      senderName: "Lisa Gray", senderAvatar: "https://i.pravatar.cc/150?img=9",
      text: "This is super helpful, bookmarking this 🙏",
    },
  ],
  cm: [
    {
      id: "1", from: "human",
      senderName: "Sara Chen", senderAvatar: "https://i.pravatar.cc/150?img=20",
      text: "Content Marketing Crew 📣 Quick reminder — Q3 content calendar is due for final sign-off by Friday!",
    },
    {
      id: "2", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "On it! I've got blog posts and email covered. Just need to confirm the webinar topic.",
    },
    {
      id: "3", from: "human",
      senderName: "Priya Rajan", senderAvatar: "https://i.pravatar.cc/150?img=44",
      text: "Webinar topic vote: 'AI in Content Marketing' vs 'Personalizing at Scale' — which one? 🗳️",
    },
    {
      id: "4", from: "human",
      senderName: "Marcus Santos", senderAvatar: "",
      text: "AI in Content Marketing all the way. Way more search volume on that right now.",
    },
    {
      id: "5", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Agreed — and we can weave personalization in as a subtopic. Best of both worlds 💡",
    },
    {
      id: "6", from: "human",
      senderName: "Sara Chen", senderAvatar: "https://i.pravatar.cc/150?img=20",
      text: "Love it! Updating the calendar now. Also — Randy is going to draft the landing page copy, should be ready by tomorrow 🤖",
    },
    {
      id: "7", from: "human",
      senderName: "Priya Rajan", senderAvatar: "https://i.pravatar.cc/150?img=44",
      text: "Amazing. This team is on fire lately 🔥🔥",
      reactions: [{ emoji: "🔥", count: 6 }, { emoji: "❤️", count: 3 }],
    },
    {
      id: "8", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Let's gooo 🚀",
      reactions: [{ emoji: "🚀", count: 4 }],
    },
    {
      id: "9", from: "human",
      senderName: "Sara Chen", senderAvatar: "https://i.pravatar.cc/150?img=20",
      text: "Oh — also dropping the draft content calendar here for everyone to review!",
    },
    {
      id: "10", from: "human", type: "attachment",
      senderAvatar: "https://i.pravatar.cc/150?img=20",
      senderName: "Sara Chen",
      text: "",
      attachment: {
        title: "Editorial Calendar — H1 2026",
        file: "editorial-calendar-h1-2026.xlsx",
      },
    },
    {
      id: "11", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "On it, reviewing now 👀",
    },
  ],
  bubs: [
    {
      id: "1", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Randy, can you draft an intro for the Q3 blog post?",
    },
    {
      id: "2", from: "vau",
      senderName: "Randy", senderAvatar: "/vau-bubs.svg", senderColor: "var(--opal-vau-bubs)",
      text: "On it! Here's a draft intro:\n\nAs we head into Q3, our focus shifts to deepening customer engagement and scaling what's working. Here's what's on the horizon.",
    },
    {
      id: "3", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Love it. Can you make it a bit punchier?",
    },
    {
      id: "4", from: "vau",
      senderName: "Randy", senderAvatar: "/vau-bubs.svg", senderColor: "var(--opal-vau-bubs)",
      text: "Q3 is here. Time to double down on what's working and move faster. Here's the plan.",
    },
    {
      id: "5", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Perfect 🙌 one more thing — can you suggest 3 headline options?",
    },
    {
      id: "6", from: "vau",
      senderName: "Randy", senderAvatar: "/vau-bubs.svg", senderColor: "var(--opal-vau-bubs)",
      text: "Sure! Here are three options:\n\n1. \"The Q3 Playbook: AI, Speed, and Content That Converts\"\n2. \"How We're Using AI to Outpace the Competition This Quarter\"\n3. \"Q3 Is Here — Here's Our Content Strategy (And Why AI Is Central to It)\"",
    },
    {
      id: "7", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "I love #1. Going with that 🎯",
    },
    {
      id: "8", from: "vau",
      senderName: "Randy", senderAvatar: "/vau-bubs.svg", senderColor: "var(--opal-vau-bubs)",
      text: "@Erika — great choice! It's punchy and keyword-friendly. Good luck with the post! 🚀",
      threadCount: 1,
    },
    {
      id: "9", from: "vau", type: "hitl",
      senderName: "Randy", senderAvatar: "/vau-bubs.svg", senderColor: "var(--opal-vau-bubs)",
      text: "",
    },
  ],
  kara: [
    {
      id: "1", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Kara, can you run a keyword analysis for our Q4 content plan?",
    },
    {
      id: "2", from: "vau",
      senderName: "Kara", senderAvatar: "/vau-kara.svg", senderColor: "var(--opal-vau-kara)",
      text: "On it! Here are the top keyword clusters for Q4 based on your current content and search trends:\n\n1. **AI in content marketing** — high volume, low competition\n2. **Personalization at scale** — growing fast\n3. **Content ROI measurement** — conversion-focused, great for bottom-funnel",
    },
    {
      id: "3", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Nice. Which one should anchor the editorial calendar?",
    },
    {
      id: "4", from: "vau",
      senderName: "Kara", senderAvatar: "/vau-kara.svg", senderColor: "var(--opal-vau-kara)",
      text: "I'd go with **AI in content marketing** — it maps to your strongest existing content and has the clearest path to ranking in the next 90 days. Want me to draft a topic cluster around it?",
    },
    {
      id: "5", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Yes please! 10 topics max.",
    },
    {
      id: "6", from: "vau",
      senderName: "Kara", senderAvatar: "/vau-kara.svg", senderColor: "var(--opal-vau-kara)",
      text: "Here's your Q4 AI content cluster:\n\n1. What is AI content marketing?\n2. How AI improves content personalization\n3. AI tools for content teams in 2026\n4. Measuring content ROI with AI\n5. AI vs human writers — finding the balance\n6. Building an AI-assisted editorial workflow\n7. How Optimizely uses AI in content strategy\n8. AI content briefs: a step-by-step guide\n9. Ethics of AI-generated content\n10. The future of SEO in an AI world\n\nLet me know which to prioritise! ✅",
    },
    {
      id: "7", from: "vau",
      senderName: "Kara", senderAvatar: "/vau-kara.svg", senderColor: "var(--opal-vau-kara)",
      text: "I've put together the full Q4 content brief based on our conversation. Ready for your review before I start building out the article briefs.",
    },
    {
      id: "8", from: "vau", type: "hitl",
      senderName: "Kara", senderAvatar: "/vau-kara.svg", senderColor: "var(--opal-vau-kara)",
      text: "",
    },
  ],
  eric: [
    {
      id: "1", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Eric, we need to run an A/B test on the homepage CTA. Can you set one up?",
    },
    {
      id: "2", from: "vau",
      senderName: "Eric", senderAvatar: "/vau-eric.svg", senderColor: "var(--opal-vau-eric)",
      text: "Sure! To set this up well — what's the current CTA copy and what's your hypothesis for the variant?",
    },
    {
      id: "3", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Current is 'Get started free'. We think 'See it in action' might drive more demo signups.",
    },
    {
      id: "4", from: "vau",
      senderName: "Eric", senderAvatar: "/vau-eric.svg", senderColor: "var(--opal-vau-eric)",
      text: "Good hypothesis — intent shift from 'start using' to 'learn first' often converts better for enterprise buyers. I'd suggest a **multivariate** test:\n\n- **Control:** Get started free\n- **Variant A:** See it in action\n- **Variant B:** Book a demo\n\nGoal metric: demo request submissions. Want me to configure it with a 33/33/33 split and a 95% confidence threshold?",
    },
    {
      id: "5", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Yes, that's perfect. Go for it.",
    },
    {
      id: "6", from: "vau",
      senderName: "Eric", senderAvatar: "/vau-eric.svg", senderColor: "var(--opal-vau-eric)",
      text: "Test is configured and ready to launch 🧪 You'll need to approve it in the Optimizely dashboard before it goes live. I'll ping you when we hit statistical significance — estimated 7–10 days at current traffic levels.",
    },
    {
      id: "7", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Perfect, approving now. Also — can you draft 3 headline options for our Q3 content strategy post?",
    },
    {
      id: "8", from: "vau",
      senderName: "Eric", senderAvatar: "/vau-eric.svg", senderColor: "var(--opal-vau-eric)",
      text: "Sure! Here are three options:\n\n1. \"The Q3 Playbook: AI, Speed, and Content That Converts\"\n2. \"How We're Using AI to Outpace the Competition This Quarter\"\n3. \"Q3 Is Here — Here's Our Content Strategy (And Why AI Is Central to It)\"",
    },
  ],
  sg: [
    {
      id: "sg1", from: "vau",
      senderName: "Randy", senderAvatar: "/vau-bubs.svg", senderColor: "var(--opal-vau-bubs)",
      text: "Hey team! Just wrapped the second pass on the Stride GEO article. Incorporated all the feedback from last week's review session.",
    },
    {
      id: "sg2", from: "human",
      senderName: "Nadia Flores", senderAvatar: "https://i.pravatar.cc/150?img=29",
      text: "Quick — was the tone feedback addressed? Last version felt a bit generic.",
    },
    {
      id: "sg3", from: "vau",
      senderName: "Randy", senderAvatar: "/vau-bubs.svg", senderColor: "var(--opal-vau-bubs)",
      text: "Yes! Rewrote the first 3 Q&As completely in Stride's adventurous, explorer-first voice. Much stronger now.",
      reactions: [{ emoji: "👍", count: 2 }],
    },
    {
      id: "sg4", from: "human",
      senderName: "Jason Park", senderAvatar: "https://i.pravatar.cc/150?img=51",
      text: "Quick question — are we still targeting 'discover the unknown stride' as the primary keyword cluster?",
    },
    {
      id: "sg5", from: "vau",
      senderName: "Randy", senderAvatar: "/vau-bubs.svg", senderColor: "var(--opal-vau-bubs)",
      text: "Yes, holding that cluster. Also expanded the activities section based on SEO gap analysis — adds trail running, open-water diving, and skydiving explicitly.",
    },
    {
      id: "sg6", from: "vau",
      senderName: "Randy", senderAvatar: "/vau-bubs.svg", senderColor: "var(--opal-vau-bubs)",
      text: "Done — all three rounds of feedback incorporated:\n\n✓ **Activities** — Explicitly listed trail running, climbing, diving, skydiving, and multi-terrain endurance challenges\n✓ **Team use cases** — Rewired around competitive multi-sport group challenges, not generic team building\n✓ **Opening tone** — Rewrote the first 3 Q&As in Stride's adventurous, explorer-first voice\n\nThe updated article is ready for final review. See the revised artifact below.",
    },
    {
      id: "sg7", from: "vau", type: "hitl",
      senderName: "Randy", senderAvatar: "/vau-bubs.svg", senderColor: "var(--opal-vau-bubs)",
      text: "",
    },
  ],
  q4gs: [
    {
      id: "q1", from: "human",
      senderName: "Sarah Kim", senderAvatar: "https://i.pravatar.cc/150?img=39",
      text: "Q4 Growth Sprint kickoff! 🎉 Quick agenda for this channel: align on keyword targets, brief assignments, and publish schedule. Let's keep it moving.",
    },
    {
      id: "q2", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Love it. I think we should start with Kara pulling a fresh keyword gap analysis before we assign any briefs.",
    },
    {
      id: "q3", from: "vau",
      senderName: "Kara", senderAvatar: "/vau-kara.svg", senderColor: "var(--opal-vau-kara)",
      text: "On it! Running the gap analysis now against our Q3 performance data. I'll have the prioritized keyword clusters ready shortly.",
      reactions: [{ emoji: "🙌", count: 3 }],
    },
    {
      id: "q4", from: "human",
      senderName: "Jason Park", senderAvatar: "https://i.pravatar.cc/150?img=7",
      text: "Also — can Randy start blocking out the content draft framework? We'll want that structure before Kara's briefs land.",
    },
    {
      id: "q5", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "FYI — Randy is paused in this conversation right now. We'll need to handle the draft structure manually or resume him when we're ready.",
    },
    {
      id: "q6", from: "human",
      senderName: "Sarah Kim", senderAvatar: "https://i.pravatar.cc/150?img=39",
      text: "Good to know! Let's get Kara's targeting list first, then decide if we need to unpause him for drafting. No blockers for now.",
      reactions: [{ emoji: "👍", count: 2 }],
    },
    {
      id: "q7", from: "vau",
      senderName: "Kara", senderAvatar: "/vau-kara.svg", senderColor: "var(--opal-vau-kara)",
      text: "Done! Here's the top cluster breakdown for Q4:\n\n**Tier 1 (high volume, low competition)**\n— AI-powered content personalization\n— Enterprise content operations\n— B2B content ROI measurement\n\n**Tier 2 (growing, strategic fit)**\n— GEO optimization for content teams\n— AI content brief generation\n— Content workflow automation\n\nRecommend we prioritize Tier 1 for the first 6 briefs. Want me to generate the brief outlines?",
      reactions: [{ emoji: "🔥", count: 4 }, { emoji: "✅", count: 2 }],
    },
    {
      id: "q8", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Targeting list is locked in — ready to build the brief",
    },
    {
      id: "q9", from: "human",
      senderName: "Jason Park", senderAvatar: "https://i.pravatar.cc/150?img=7",
      text: "Agreed on Tier 1 first. Kara please go ahead and draft the first three brief outlines. We'll review async and tag @Erika for sign-off.",
    },
    {
      id: "q10", from: "vau",
      senderName: "Kara", senderAvatar: "/vau-kara.svg", senderColor: "var(--opal-vau-kara)",
      text: "Perfect — kicking off the brief drafts now. I'll ping here once the first set is ready for review. 📝",
    },
  ],
};

// ── Canned auto-replies per conversation ──────────────────────────────────────

type Responder = { from: "vau" | "human"; name: string; avatar?: string; color?: string };

const RESPONDERS: Record<string, Responder> = {
  js:   { from: "human", name: "Jane Smith",            avatar: "https://i.pravatar.cc/150?img=47" },
  lg:   { from: "human", name: "Lisa Gray",             avatar: "https://i.pravatar.cc/150?img=9"  },
  hw:   { from: "human", name: "Harry Winston-Brown",   avatar: "https://i.pravatar.cc/150?img=52" },
  bw:   { from: "human", name: "Brendan Wilmington",    avatar: "https://i.pravatar.cc/150?img=57" },
  ms:   { from: "human", name: "Marcus Santos",         avatar: "" },
  pr:   { from: "human", name: "Priya Rajan",           avatar: "https://i.pravatar.cc/150?img=44" },
  td:   { from: "human", name: "Tom Decker",            avatar: "https://i.pravatar.cc/150?img=53" },
  ao:   { from: "human", name: "Amara Osei",            avatar: "https://i.pravatar.cc/150?img=38" },
  bf:   { from: "human", name: "Jason Park",            avatar: "https://i.pravatar.cc/150?img=33" },
  vw:   { from: "human", name: "Patrick Lee",           avatar: "https://i.pravatar.cc/150?img=60" },
  cm:   { from: "human", name: "Sara Chen",             avatar: "https://i.pravatar.cc/150?img=20" },
  q4gs: { from: "human", name: "Sarah Kim",             avatar: "https://i.pravatar.cc/150?img=39" },
  bubs: { from: "vau",   name: "Randy", avatar: "/vau-bubs.svg", color: "var(--opal-vau-bubs)" },
  kara: { from: "vau",   name: "Kara", avatar: "/vau-kara.svg", color: "var(--opal-vau-kara)" },
  eric: { from: "vau",   name: "Eric", avatar: "/vau-eric.svg", color: "var(--opal-vau-eric)" },
};

const REPLIES: Record<string, string[]> = {
  js:   ["Totally agree!", "Let me check and get back to you.", "Ooh good point, hadn't thought of that.", "Yes! Let's sync later this week."],
  lg:   ["Makes sense to me.", "Happy to help with that.", "Can you send me the doc?", "On it!"],
  hw:   ["Noted, I'll follow up.", "Sounds good — let me loop in the team.", "Good catch, thanks for flagging.", "Will do!"],
  bw:   ["I'm in!", "Let me check my calendar.", "That works for me.", "Thanks for the heads up."],
  ms:   ["Great idea!", "I was just thinking the same thing.", "Let me pull the numbers on that.", "100% aligned."],
  pr:   ["Love this direction.", "Can we get Randy to draft something?", "I'll review by EOD.", "Adding this to the board now."],
  td:   ["On my radar.", "Will circle back after standup.", "Flagging this for the team.", "Good to know, thanks."],
  ao:   ["Absolutely!", "This is really exciting.", "I can take a first pass at it.", "Let's make it happen."],
  bf:   ["Good update — keeping the thread going.", "Patrick is looking at that now.", "We're on track for launch.", "Let's review together Thursday."],
  vw:   ["Tagging Eric on this too.", "Great thread everyone.", "Let's bring this to next week's sync.", "Agreed — should we update the doc?"],
  cm:   ["Sara is already on it!", "Content calendar is updated.", "This fits perfectly with Q3 goals.", "Scheduling the review now."],
  q4gs: ["Sounds good, I'll flag anything that needs a decision.", "On it — will update the channel once it's done.", "Agreed, let's keep moving.", "Good call. Looping Jason in now."],
  bubs: [
    "On it! Give me a moment to think through that.",
    "Great question. Here's how I'd approach it: start with the outcome you want, then work backwards.",
    "Sure! I can help with that. Want me to draft something for you to react to?",
    "Interesting — I have a few ideas. Want me to sketch out some options?",
    "Done! Let me know if you'd like me to take it in a different direction.",
    "I've been thinking about this too. Here's my take: keep it simple, be specific, and lead with value.",
  ],
  kara: [
    "Happy to help with content! What's the target audience?",
    "I'd suggest leading with a strong hook — something that surprises or challenges the reader.",
    "On it! I'll have a first draft ready in a few seconds.",
    "Great brief. I think a listicle format would work really well here.",
    "Love that direction. Shall I optimize it for SEO too?",
  ],
  eric: [
    "Let's run an experiment on that! I'd suggest an A/B test with two variants.",
    "Based on your past experiments, this hypothesis is worth testing.",
    "Interesting hypothesis. What's your success metric?",
    "I can set that experiment up for you. What's your target lift?",
    "Data looks promising. Let me dig deeper into the cohort.",
  ],
};

function getReply(conversationId: string): string {
  const replies = REPLIES[conversationId] ?? ["Got it!", "Sure thing.", "Thanks for the update!", "Makes sense."];
  return replies[Math.floor(Math.random() * replies.length)];
}

// ── Formatting toolbar button ──────────────────────────────────────────────────

function ToolbarBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Tooltip content={label}>
      <Button
        appearance="subtle"
        size="sm"
        icon={icon}
        aria-label={label}
        style={{ width: 32, height: 32, padding: 0, color: "var(--ax-colors-fg-tertiary)" }}
      />
    </Tooltip>
  );
}

// ── Message bubble ─────────────────────────────────────────────────────────────

function getMockTime(index: number): string {
  const base = 9 * 60 + 30;
  const total = base + index * 3;
  const h = Math.floor(total / 60) % 12 || 12;
  const m = total % 60;
  const ap = Math.floor(total / 60) < 12 ? "AM" : "PM";
  return `${h}:${m.toString().padStart(2, "0")} ${ap}`;
}

const QUICK_EMOJIS = ["👍", "❤️", "😂", "🔥", "🚀", "👏"];

const LINK_PREVIEWS: Record<string, { title: string; description: string; image?: string }> = {
  "optimizely.com": { title: "Optimizely", description: "The leading digital experience platform", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=70" },
  "figma.com": { title: "Figma", description: "The collaborative interface design tool", image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&q=70" },
  "github.com": { title: "GitHub", description: "Where the world builds software", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=70" },
  "notion.so": { title: "Notion", description: "All-in-one workspace for notes, docs, and projects" },
  "google.com": { title: "Google", description: "Search the world's information" },
  "luma.com": { title: "Luma", description: "The easiest way to host memorable events" },
};

function getLinkPreview(url: string) {
  const domain = url.replace(/^https?:\/\//, '').split('/')[0].replace('www.', '');
  return LINK_PREVIEWS[domain] ?? null;
}

const MENTION_CANDIDATES = [
  ...DMS.map(d => ({ id: d.id, name: d.name, avatar: d.avatar, isSpecial: false })),
  { id: 'here',    name: 'here',    avatar: '', isSpecial: true },
  { id: 'channel', name: 'channel', avatar: '', isSpecial: true },
];

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_|\*[^*]+\*|@\w+|https?:\/\/[^\s]+)/g);
  return parts.map((part, i) => {
    if (/^\*\*(.+)\*\*$/.test(part))  return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (/^[_*](.+)[_*]$/.test(part))  return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith('@'))          return <span key={i} style={{ color: 'var(--ax-colors-fg-link-default)', fontWeight: 500 }}>{part}</span>;
    if (/^https?:\/\//.test(part))     return <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ax-colors-fg-link-default)', textDecoration: 'underline' }} onClick={e => e.stopPropagation()}>{part}</a>;
    return part;
  });
}

function renderText(text: string): React.ReactNode {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    let content: React.ReactNode;
    if (line.startsWith('## '))      content = <strong style={{ fontSize: 15, display: 'block' }}>{renderInline(line.slice(3))}</strong>;
    else if (line.startsWith('# ')) content = <strong style={{ fontSize: 17, display: 'block' }}>{renderInline(line.slice(2))}</strong>;
    else if (line.startsWith('- ')) content = <span>• {renderInline(line.slice(2))}</span>;
    else                             content = renderInline(line);
    return <React.Fragment key={lineIdx}>{content}{lineIdx < lines.length - 1 && <br />}</React.Fragment>;
  });
}

// ── Profile hover card ─────────────────────────────────────────────────────────

type ProfileEntry = { name: string; email: string; avatar: string; isVAU: boolean; status?: string };

const PROFILE_LOOKUP: Record<string, ProfileEntry> = {
  "Jane Smith":            { name: "Jane Smith",            email: "jane.smith@optimizely.com",    avatar: "https://i.pravatar.cc/150?img=47", isVAU: false },
  "Lisa Gray":             { name: "Lisa Gray",             email: "lisa.gray@optimizely.com",     avatar: "https://i.pravatar.cc/150?img=9",  isVAU: false },
  "Harry Winston-Brown":   { name: "Harry Winston-Brown",   email: "h.winston@optimizely.com",     avatar: "https://i.pravatar.cc/150?img=52", isVAU: false },
  "Brendan Wilmington":    { name: "Brendan Wilmington",    email: "b.wilmington@optimizely.com",  avatar: "https://i.pravatar.cc/150?img=57", isVAU: false },
  "Marcus Santos":         { name: "Marcus Santos",         email: "marcus.santos@optimizely.com", avatar: "",                                isVAU: false },
  "Priya Rajan":           { name: "Priya Rajan",           email: "priya.rajan@optimizely.com",   avatar: "https://i.pravatar.cc/150?img=44", isVAU: false },
  "Tom Decker":            { name: "Tom Decker",            email: "tom.decker@optimizely.com",    avatar: "https://i.pravatar.cc/150?img=53", isVAU: false },
  "Amara Osei":            { name: "Amara Osei",            email: "amara.osei@optimizely.com",    avatar: "https://i.pravatar.cc/150?img=38", isVAU: false },
  "Erika Schreiber":       { name: "Erika Schreiber",       email: "erika.schreiber@optimizely.com", avatar: "https://i.pravatar.cc/150?img=24", isVAU: false },
  "Me":                    { name: "Erika Schreiber",       email: "erika.schreiber@optimizely.com", avatar: "https://i.pravatar.cc/150?img=24", isVAU: false },
  "Randy":                  { name: "Randy",                  email: "randy@opal.optimizely.com",    avatar: "/vau-bubs.svg",  isVAU: true, status: "Offline" },
  "Kara":                  { name: "Kara",                  email: "kara@opal.optimizely.com",     avatar: "/vau-kara.svg",  isVAU: true, status: "Available" },
  "Eric":                  { name: "Eric",                  email: "eric@opal.optimizely.com",     avatar: "/vau-eric.svg",  isVAU: true, status: "Out of Office" },
  "Sage":                  { name: "Sage",                  email: "sage@opal.optimizely.com",     avatar: "",               isVAU: true, status: "Deactivated" },
};

function AvatarWithHoverCard({ name, src, size, style }: { name: string; src?: string; size?: string; style?: React.CSSProperties }) {
  const wrapRef    = useRef<HTMLDivElement>(null);
  const hideTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visible, setVisible] = useState(false);
  const [cardStyle, setCardStyle] = useState<React.CSSProperties>({});

  const profile = PROFILE_LOOKUP[name];

  const handleEnter = React.useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const cardW = 230;
    const spaceRight = window.innerWidth - rect.right;
    const placement = spaceRight >= cardW + 12 ? "right" : "left";
    setCardStyle({
      position: "fixed",
      top: Math.min(rect.top, window.innerHeight - 160),
      left: placement === "right" ? rect.right + 8 : rect.left - cardW - 8,
      zIndex: 9999,
      width: cardW,
    });
    setVisible(true);
  }, []);

  const handleLeave = React.useCallback(() => {
    hideTimer.current = setTimeout(() => setVisible(false), 200);
  }, []);

  const handleCardEnter = React.useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  const avatarNode = <Avatar name={name} src={src} size={size as "sm" | "md" | "lg" | undefined} />;

  if (!profile) {
    return <div style={{ display: "inline-block", lineHeight: 0, ...style }}>{avatarNode}</div>;
  }

  return (
    <>
      <div
        ref={wrapRef}
        style={{ display: "inline-block", lineHeight: 0, ...style }}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
      >
        {avatarNode}
      </div>
      {visible && typeof document !== "undefined" && createPortal(
        <div
          onPointerEnter={handleCardEnter}
          onPointerLeave={handleLeave}
          style={{
            ...cardStyle,
            background: "var(--ax-colors-bg-default)",
            border: "1px solid var(--ax-colors-border-secondary)",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)",
            padding: "14px 16px",
            pointerEvents: "auto",
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <Avatar name={profile.name} src={profile.avatar} size="lg" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ax-colors-fg-default)", lineHeight: 1.3 }}>{profile.name}</span>
                {profile.isVAU && (
                  <Badge intent="information" style={{ flexShrink: 0 }}>Virtual</Badge>
                )}
              </div>
              <div style={{ fontSize: 11, color: "var(--ax-colors-fg-tertiary)", lineHeight: 1.4, wordBreak: "break-all" }}>{profile.email}</div>
              {profile.isVAU && profile.status && (
                <div style={{ marginTop: 6, display: "flex", alignItems: "flex-start", gap: 5 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%", display: "inline-block", flexShrink: 0, marginTop: 2,
                    background: profile.status === "Available" ? "var(--ax-colors-bg-success)" : profile.status === "Out of Office" ? "var(--ax-colors-bg-error)" : "var(--ax-colors-fg-tertiary)",
                  }} />
                  <span style={{ fontSize: 11, color: "var(--ax-colors-fg-secondary)" }}>{profile.status}</span>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function MessageBubble({ msg, time, onOpenThread, isPinned, onPin, onMarkConvoUnread, id }: { msg: Message; time: string; onOpenThread?: (msg: Message) => void; isPinned?: boolean; onPin?: (id: string) => void; onMarkConvoUnread?: (unread: boolean) => void; id?: string }) {
  const isUser = msg.from === "user";
  const [reactions, setReactions] = useState<(Reaction & { mine: boolean })[]>(
    (msg.reactions ?? []).map(r => ({ ...r, mine: false }))
  );
  const [hovered, setHovered] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(msg.text);
  const [displayText, setDisplayText] = useState(msg.text);
  useEffect(() => { setDisplayText(msg.text ?? ""); setEditText(msg.text ?? ""); }, [msg.text]);
  const [unread, setUnread] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const handleEdit = () => { setEditText(displayText); setEditing(true); };
  const handleSaveEdit = () => { if (editText.trim()) setDisplayText(editText.trim()); setEditing(false); };
  const handleCancelEdit = () => setEditing(false);

  const toggleReaction = (emoji: string) => {
    setReactions(prev => {
      const idx = prev.findIndex(r => r.emoji === emoji);
      if (idx >= 0) {
        const r = prev[idx];
        const newCount = r.mine ? r.count - 1 : r.count + 1;
        if (newCount === 0) return prev.filter((_, i) => i !== idx);
        return prev.map((r, i) => i === idx ? { ...r, count: newCount, mine: !r.mine } : r);
      }
      return [...prev, { emoji, count: 1, mine: true }];
    });
    setPickerOpen(false);
  };

  const hasReactions = reactions.length > 0;
  const showReactionUI = hasReactions || hovered || pickerOpen || menuOpen;

  const reactionRow = (align: "left" | "right") => (
    <Box style={{
      position: "absolute",
      bottom: -14,
      ...(align === "right" ? { right: 0 } : { left: 0 }),
      display: "flex", gap: 4, flexWrap: "wrap",
      justifyContent: align === "right" ? "flex-end" : "flex-start",
      zIndex: 5,
    }}>
      {reactions.map(r => (
        <Box
          key={r.emoji}
          onClick={() => toggleReaction(r.emoji)}
          rounded="full"
          style={{
            display: "inline-flex", alignItems: "center", gap: 3,
            padding: "2px 8px", cursor: "pointer",
            fontSize: 12, userSelect: "none",
            border: r.mine ? "1.5px solid var(--ax-colors-border-focus)" : "1px solid var(--ax-colors-border-secondary)",
            background: r.mine ? "var(--ax-colors-bg-default-hovered)" : "var(--ax-colors-bg-default)",
          }}
        >
          <span>{r.emoji}</span>
          <span style={{ fontSize: 11, color: "var(--ax-colors-fg-secondary)", marginLeft: 2 }}>{r.count}</span>
        </Box>
      ))}
      {(hovered || pickerOpen) && (
        <Box style={{ position: "relative" }}>
          <Box
            onClick={() => setPickerOpen(v => !v)}
            rounded="full"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 30, height: 26, cursor: "pointer", fontSize: 14,
              border: "1px solid var(--ax-colors-border-secondary)",
              background: "var(--ax-colors-bg-default)",
              color: "var(--ax-colors-fg-tertiary)",
            }}
          ><IconFaceSmile size={16} /></Box>
          {pickerOpen && (
            <Box style={{
              position: "absolute",
              bottom: 34,
              ...(align === "right" ? { right: 0 } : { left: 0 }),
              zIndex: 100,
            }}>
              <Picker
                data={data}
                onEmojiSelect={(e: { native: string }) => { toggleReaction(e.native); setPickerOpen(false); }}
                onClickOutside={() => setPickerOpen(false)}
                theme="light"
                previewPosition="none"
                skinTonePosition="search"
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );

  const urlMatch = msg.text.match(/https?:\/\/[^\s]+/)?.[0];
  const linkPreview = urlMatch ? getLinkPreview(urlMatch) : null;

  const actionBar = (side: "left" | "right") => (hovered || menuOpen) && !pickerOpen ? (
    <Box
      rounded="lg"
      style={{
      position: "absolute", top: -46, ...(side === "right" ? { right: 0 } : { left: 0 }),
      display: "flex", alignItems: "center", gap: 1,
      background: "var(--ax-colors-bg-default)",
      border: "1px solid var(--ax-colors-border-secondary)",
      padding: "5px 7px", zIndex: 10,
    }}>
      {/* Quick emoji reactions */}
      {["👍", "❤️", "😂"].map(e => (
        <Tooltip key={e} content={e} delayDuration={300}>
          <Box onClick={() => toggleReaction(e)} rounded="sm" style={{
            cursor: "pointer", fontSize: 18, padding: "2px 4px",
            lineHeight: 1,
          }}>{e}</Box>
        </Tooltip>
      ))}
      {/* Add any reaction */}
      <Tooltip content="Add reaction" delayDuration={300}>
        <Box onClick={() => setPickerOpen(v => !v)} rounded="sm" style={{
          cursor: "pointer", fontSize: 18, padding: "2px 4px",
          color: "var(--ax-colors-fg-tertiary)", lineHeight: 1,
        }}>😊</Box>
      </Tooltip>
      <Box style={{ width: 1, height: 20, background: "var(--ax-colors-border-secondary)", margin: "0 3px", flexShrink: 0 }} />
      {/* Reply in thread */}
      {onOpenThread && (
        <Tooltip content="Reply in thread" delayDuration={300}>
          <Button size="sm" appearance="subtle" style={{ width: 30, height: 30, padding: 0 }}
            icon={<IconMessageLines size={15} />} onClick={() => onOpenThread(msg)} />
        </Tooltip>
      )}
      {/* Pin */}
      {onPin && (
        <Tooltip content={isPinned ? "Unpin message" : "Pin message"} delayDuration={300}>
          <ToggleButton size="sm" appearance="subtle" aria-label={isPinned ? "Unpin message" : "Pin message"}
            pressed={!!isPinned} onPressedChange={() => onPin(msg.id)}
            style={{ width: 30, height: 30, padding: 0 }}
            icon={<IconThumbtack size={15} />} />
        </Tooltip>
      )}
      {/* More options */}
      <Menu
        options={isUser ? [
          { label: "Edit message", execute: handleEdit },
          { label: "Delete message", execute: () => setDeleted(true), intent: "danger" },
          { label: unread ? "Mark read" : "Mark unread", execute: () => { const next = !unread; setUnread(next); onMarkConvoUnread?.(next); } },
          { label: copied ? "Copied!" : "Copy text", execute: handleCopy },
        ] : [
          { label: unread ? "Mark read" : "Mark unread", execute: () => { const next = !unread; setUnread(next); onMarkConvoUnread?.(next); } },
          { label: copied ? "Copied!" : "Copy text", execute: handleCopy },
        ]}
        onOpenChange={(open) => { setMenuOpen(open); if (!open && !hovered) setHovered(false); }}
      >
        <MenuTrigger asChild>
          <Button size="sm" appearance="subtle" style={{ width: 30, height: 30, padding: 0 }}
            icon={<IconEllipsisSolid size={15} />} aria-label="More options" />
        </MenuTrigger>
        <MenuContent />
      </Menu>
    </Box>
  ) : null;

  if (isUser) {
    return (
      <Box
        display="flex"
        gap="8"
        alignItems="start"
        justifyContent="flex-end"
        pl="32"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setTimeout(() => { if (!menuOpen) { setHovered(false); setPickerOpen(false); } }, 150)}
        style={{ paddingTop: 44, marginTop: -44 }}
      >
        <Box style={{ position: "relative", alignItems: "flex-end", display: "flex", flexDirection: "column", paddingBottom: 16 }}>
          {actionBar("right")}
          <Text fontSize="sm" color="fg.tertiary" style={{ marginBottom: 2 }}>{time}</Text>
          <Box rounded="lg" style={{ background: "var(--ax-colors-bg-success-subtle)", padding: "8px 16px", fontSize: 14, lineHeight: 1.6, color: "var(--ax-colors-fg-default)", position: "relative" }}>
            {unread && <Box rounded="full" style={{ position: "absolute", top: 8, left: -14, width: 8, height: 8, background: "var(--ax-colors-bg-info-default)", flexShrink: 0 }} />}
            {isPinned && !deleted && (
              <Box style={{ position: "absolute", top: -10, right: -10, width: 26, height: 26, background: "var(--ax-colors-bg-default)", border: "1px solid var(--ax-colors-border-secondary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}>
                <IconThumbtack size={13} style={{ color: "var(--ax-colors-fg-secondary)" }} />
              </Box>
            )}
            {deleted ? (
              <em style={{ color: "var(--ax-colors-fg-tertiary)" }}>This message was deleted.</em>
            ) : editing ? (
              <Box display="flex" flexDirection="column" gap="8">
                <textarea autoFocus value={editText} onChange={e => setEditText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); } if (e.key === "Escape") handleCancelEdit(); }}
                  style={{ width: "100%", border: "1px solid var(--ax-colors-border-focus)", borderRadius: 6, padding: "6px 8px", fontFamily: "inherit", fontSize: 14, resize: "none", outline: "none", background: "white", minHeight: 60 }} />
                <Box display="flex" gap="8" justifyContent="flex-end">
                  <Button size="sm" appearance="default" onClick={handleCancelEdit}>Cancel</Button>
                  <Button size="sm" appearance="primary" onClick={handleSaveEdit}>Save</Button>
                </Box>
              </Box>
            ) : (
              <>
                {renderText(displayText)}
                {displayText !== msg.text && <Text fontSize="sm" color="fg.tertiary" style={{ marginLeft: 4, display: "inline" }}>(edited)</Text>}
                {linkPreview && (
                  <Box style={{ marginTop: 8, borderLeft: "3px solid rgba(0,0,0,0.12)", paddingLeft: 10 }}>
                    <Text fontSize="sm" fontWeight="500" color="fg.default">{linkPreview.title}</Text>
                    <Text fontSize="sm" color="fg.secondary">{linkPreview.description}</Text>
                    {linkPreview.image && <img src={linkPreview.image} alt="" style={{ marginTop: 6, borderRadius: 4, maxWidth: 220, height: 100, objectFit: "cover", display: "block" }} />}
                  </Box>
                )}
              </>
            )}
          </Box>
          {(msg.threadCount ?? 0) > 0 && (
            <Button size="md" appearance="subtle" icon={<IconMessageLines />} style={{ marginTop: 2 }} onClick={() => onOpenThread?.(msg)}>
              {msg.threadCount} {msg.threadCount === 1 ? "reply" : "replies"}
            </Button>
          )}
          {showReactionUI && reactionRow("right")}
        </Box>
        <Box pt="10" style={{ flexShrink: 0 }}>
          <AvatarWithHoverCard name="Me" src={msg.senderAvatar} size="md" />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      id={id}
      display="flex"
      gap="12"
      alignItems="start"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setTimeout(() => { if (!menuOpen) { setHovered(false); setPickerOpen(false); } }, 150)}
      style={{ paddingTop: 44, marginTop: -44 }}
    >
      <Box pt="4" style={{ flexShrink: 0 }}>
        <AvatarWithHoverCard name={msg.senderName || ""} src={msg.senderAvatar} size="md" />
      </Box>
      <Box style={{ position: "relative", display: "flex", flexDirection: "column", paddingBottom: 16 }}>
        {actionBar("left")}
        <Box display="flex" gap="8" style={{ marginBottom: 2, alignItems: "baseline" }}>
          {msg.senderName && <Text fontSize="md" fontWeight="500" color="fg.default">{msg.senderName}</Text>}
          <Text fontSize="sm" color="fg.tertiary">{time}</Text>
        </Box>
        <Box style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ax-colors-fg-default)", position: "relative" }}>
          {unread && <Box rounded="full" style={{ position: "absolute", top: 4, left: -14, width: 8, height: 8, background: "var(--ax-colors-bg-info-default)" }} />}
          {isPinned && !deleted && (
            <Box style={{ position: "absolute", top: -10, right: -10, width: 26, height: 26, background: "var(--ax-colors-bg-default)", border: "1px solid var(--ax-colors-border-secondary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}>
              <IconThumbtack size={13} style={{ color: "var(--ax-colors-fg-secondary)" }} />
            </Box>
          )}
          {deleted ? (
            <em style={{ color: "var(--ax-colors-fg-tertiary)" }}>This message was deleted.</em>
          ) : editing ? (
            <Box display="flex" flexDirection="column" gap="8">
              <textarea autoFocus value={editText} onChange={e => setEditText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); } if (e.key === "Escape") handleCancelEdit(); }}
                style={{ width: "100%", border: "1px solid var(--ax-colors-border-focus)", borderRadius: 6, padding: "6px 8px", fontFamily: "inherit", fontSize: 14, resize: "none", outline: "none", background: "var(--ax-colors-bg-default)", minHeight: 60 }} />
              <Box display="flex" gap="8">
                <Button size="sm" appearance="default" onClick={handleCancelEdit}>Cancel</Button>
                <Button size="sm" appearance="primary" onClick={handleSaveEdit}>Save</Button>
              </Box>
            </Box>
          ) : (
            <>
              {renderText(displayText)}
              {displayText !== msg.text && <Text fontSize="sm" color="fg.tertiary" style={{ marginLeft: 4, display: "inline" }}>(edited)</Text>}
              {linkPreview && (
                <Box style={{ marginTop: 8, borderLeft: "3px solid var(--ax-colors-border-secondary)", paddingLeft: 10 }}>
                  <Text fontSize="sm" fontWeight="500" color="fg.default">{linkPreview.title}</Text>
                  <Text fontSize="sm" color="fg.secondary">{linkPreview.description}</Text>
                  {linkPreview.image && <img src={linkPreview.image} alt="" style={{ marginTop: 6, borderRadius: 4, maxWidth: 220, height: 100, objectFit: "cover", display: "block" }} />}
                </Box>
              )}
            </>
          )}
        </Box>
        {(msg.threadCount ?? 0) > 0 && (
          <Button size="md" appearance="subtle" icon={<IconMessageLines />} style={{ marginTop: 2 }} onClick={() => onOpenThread?.(msg)}>
            {msg.threadCount} {msg.threadCount === 1 ? "reply" : "replies"}
          </Button>
        )}
        {showReactionUI && reactionRow("left")}
      </Box>
    </Box>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

function IMSidebar({
  selected,
  onSelect,
  collapsed,
  onToggle,
  onNewConversation,
  onNewGroup,
  quickView,
  onQuickViewChange,
  extraGroups,
  extraChannels,
  onChannelCreated,
  manualUnreadConvos,
  mutedConvos,
  dismissedDeliverableIds,
  threads,
  nameOverrides,
  channelPrivacyOverrides,
  leftConvos,
  sections,
  setSections,
  movedItems,
  setMovedItems,
  onHighlightSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
  onHighlightSelect?: (convId: string, msgId: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  onNewConversation: () => void;
  onNewGroup?: () => void;
  quickView: string | null;
  onQuickViewChange: (id: string | null) => void;
  extraGroups?: GroupItem[];
  extraChannels?: ChannelItem[];
  onChannelCreated?: (ch: ChannelItem) => void;
  manualUnreadConvos?: Set<string>;
  mutedConvos?: Set<string>;
  dismissedDeliverableIds?: Set<string>;
  threads: Record<string, { type?: string; from?: string; text?: string; senderName?: string; attachment?: { title?: string } }[]>;
  nameOverrides?: Record<string, string>;
  channelPrivacyOverrides?: Record<string, boolean>;
  leftConvos?: Set<string>;
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  movedItems: string[];
  setMovedItems: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [editingSectionId, setEditingSectionId] = React.useState<string | null>(null);
  const [editingLabel, setEditingLabel] = React.useState("");
  const [hoveredSectionId, setHoveredSectionId] = React.useState<string | null>(null);
  const [openSectionMenuId, setOpenSectionMenuId] = React.useState<string | null>(null);
  const [sectionSettings, setSectionSettings] = React.useState<Record<string, { view: "all" | "unread"; sort: "recent" | "az" }>>({});
  const sectionMenuRef = React.useRef<HTMLDivElement>(null);
  const [createChannelOpen, setCreateChannelOpen] = React.useState(false);
  const [createChannelName, setCreateChannelName] = React.useState("");
  const [createChannelVisibility, setCreateChannelVisibility] = React.useState<"public" | "private">("public");
  // Notification settings (per conversation type)
  const [notifSettingsOpen, setNotifSettingsOpen] = React.useState(false);
  const [dmNotif, setDmNotif] = React.useState<"all" | "mentions" | "off">("all");
  const [groupNotif, setGroupNotif] = React.useState<"all" | "mentions" | "off">("mentions");
  const [channelNotif, setChannelNotif] = React.useState<"all" | "mentions" | "off">("mentions");
  const activeDMS = React.useMemo(() => {
    try {
      const raw = localStorage.getItem("active-vt");
      if (!raw) return DMS;
      const ov = JSON.parse(raw) as { name: string; avatar: string };
      return DMS.map(d => d.id === "bubs" ? { ...d, name: ov.name, avatar: ov.avatar, preview: `${ov.name} is ready to start working with you` } : d);
    } catch { return DMS; }
  }, []);

  const allChannels = [...CHANNELS, ...(extraChannels ?? [])];
  const handleCreateChannel = () => {
    if (!createChannelName.trim()) return;
    const id = "ch-" + createChannelName.trim().toLowerCase().replace(/\s+/g, "-");
    const newCh: ChannelItem = { id, name: "#" + createChannelName.trim().toLowerCase().replace(/\s+/g, "-"), preview: "" };
    onChannelCreated?.(newCh);
    onSelect(id);
    setCreateChannelOpen(false);
    setCreateChannelName("");
    setCreateChannelVisibility("public");
  };
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);
  const dragSrcId = React.useRef<string | null>(null);
  // item-level drag (dragging a DM/group/channel into a custom section)
  const dragItemId = React.useRef<string | null>(null);
  const dragItemSource = React.useRef<string | null>(null);
  const [itemDragOverSectionId, setItemDragOverSectionId] = React.useState<string | null>(null);
  const [sectionPickerOpen, setSectionPickerOpen] = React.useState<string | null>(null);
  const [sectionPickerQuery, setSectionPickerQuery] = React.useState("");
  const [globalSearch, setGlobalSearch] = React.useState("");
  const [sidebarSearchVisible, setSidebarSearchVisible] = React.useState(false);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filterTimeRange, setFilterTimeRange] = React.useState<"all" | "7d" | "30d">("all");
  const [filterTypes, setFilterTypes] = React.useState<Set<"attachment" | "link">>(new Set());
  const toggleFilterType = (t: "attachment" | "link") =>
    setFilterTypes(prev => { const next = new Set(prev); next.has(t) ? next.delete(t) : next.add(t); return next; });
  const searchRef = React.useRef<HTMLInputElement>(null);
  const startEditing = (s: Section) => { setEditingSectionId(s.id); setEditingLabel(s.label); };
  const commitEdit = () => {
    if (editingLabel.trim())
      setSections(prev => prev.map(s => s.id === editingSectionId ? { ...s, label: editingLabel.trim() } : s));
    setEditingSectionId(null);
  };
  const addSection = () => {
    const id = `section-${Date.now()}`;
    setSections(prev => [...prev, { id, label: "New Section" }]);
    setEditingSectionId(id);
    setEditingLabel("New Section");
  };

  const getSectionSettings = (id: string) => sectionSettings[id] ?? { view: "all" as const, sort: "recent" as const };
  const updateSectionSetting = (id: string, update: Partial<{ view: "all" | "unread"; sort: "recent" | "az" }>) => {
    setSectionSettings(prev => ({ ...prev, [id]: { ...getSectionSettings(id), ...update } }));
  };

  React.useEffect(() => {
    if (!openSectionMenuId) return;
    const onDown = (e: MouseEvent) => {
      if (sectionMenuRef.current && !sectionMenuRef.current.contains(e.target as Node)) {
        setOpenSectionMenuId(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openSectionMenuId]);

  const allDMs = activeDMS;
  const allGroups = [...(extraGroups ?? []), ...GROUPS];
  const allChs = [...(extraChannels ?? []), ...CHANNELS];
  const unreadDMs = allDMs.filter(d => (d.unread ?? 0) > 0 || manualUnreadConvos?.has(d.id));
  const unreadGroups = allGroups.filter(g => (g.unread ?? 0) > 0 || manualUnreadConvos?.has(g.id));
  const unreadCount = unreadDMs.length + unreadGroups.length;
  const allThreadMessages = Object.values(THREADS).flat();
  const mentionCount = allThreadMessages.filter(m => m.text?.includes("@")).length;
  const threadCount = allThreadMessages.filter(m => (m.threadCount ?? 0) > 0).length;
  const needsReviewCount =
    Object.values(VAU_DELIVERABLES).flat().filter(d => !dismissedDeliverableIds?.has(d.id)).length +
    Object.values(GROUP_DELIVERABLES).flat().filter(d => !dismissedDeliverableIds?.has(d.id)).length +
    Object.values(CHANNEL_DELIVERABLES).flat().filter(d => !dismissedDeliverableIds?.has(d.id)).length;
  const quickViewCounts: Record<string, number> = {
    unreads: unreadCount,
    mentions: mentionCount,
    threads: threadCount,
    needsreview: needsReviewCount,
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      style={{
        width: collapsed ? 56 : 320,
        flexShrink: 0,
        borderRight: "1px solid var(--ax-colors-border-default, #d8e4cb)",
        background: "var(--ax-colors-bg-page)",
        height: "100%",
        overflow: "hidden",
        transition: "width 0.3s cubic-bezier(0, 1, 0, 1)",
      }}
    >
      {collapsed ? (
        /* ── Icon rail (collapsed) ── */
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap="4"
          py="10"
          style={{ width: 56 }}
        >
          {/* Expand button */}
          <Tooltip content="Expand sidebar" side="right">
            <Button
              appearance="subtle"
              size="sm"
              icon={<IconChevronRight style={{ width: 14, height: 14 }} />}
              aria-label="Expand sidebar"
              onClick={onToggle}
              style={{ width: 32, height: 32, padding: 0, marginBottom: 2 }}
            />
          </Tooltip>
          <Box style={{ height: 1, width: 36, background: "var(--ax-colors-border-secondary, #e4f0da)", marginBottom: 4 }} />
          {/* DM avatars — unread first */}
          {[...activeDMS].sort((a, b) => (b.unread ?? 0) - (a.unread ?? 0)).map((dm) => (
            <Tooltip key={dm.id} content={dm.name} side="right">
              <Box
                rounded="md"
                style={{ position: "relative", cursor: "pointer", padding: 3, background: selected === dm.id ? "var(--ax-colors-bg-default-hovered)" : "transparent" }}
                onClick={() => onSelect(dm.id)}
              >
                <Box style={{ position: "relative", display: "inline-flex" }}>
                  {dm.avatar ? (
                    <Avatar name={dm.name} src={dm.avatar} size="sm" />
                  ) : (
                    <Box style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, color: "var(--ax-colors-fg-secondary)", flexShrink: 0 }}>
                      {dm.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                    </Box>
                  )}
                  {dm.status && (
                    dm.status === "ooo"
                      ? <OOOIndicator size={12} outerBorderColor="var(--ax-colors-bg-secondary, #eff5eb)" />
                      : <Box rounded="full" style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, background: PRESENCE_COLOR[dm.status], border: "1.5px solid var(--ax-colors-bg-secondary, #eff5eb)" }} />
                  )}
                </Box>
                {!collapsed && dm.unread && (
                  <Box style={{ position: "absolute", top: 0, right: 0 }}>
                    <Box style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", border: "2px solid var(--ax-colors-bg-default)" }} />
                  </Box>
                )}
              </Box>
            </Tooltip>
          ))}
          <Box style={{ height: 1, width: 36, background: "var(--ax-colors-border-secondary, #e4f0da)", margin: "4px 0" }} />
          {/* Group avatars */}
          {GROUPS.map((g) => (
            <Tooltip key={g.id} content={g.name} side="right">
              <Box
                rounded="md"
                style={{ cursor: "pointer", padding: 3, background: selected === g.id ? "var(--ax-colors-bg-default-hovered)" : "transparent" }}
                onClick={() => onSelect(g.id)}
              >
                <Box style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <IconUserGroup size={14} style={{ color: "var(--ax-colors-fg-secondary)" }} />
                </Box>
              </Box>
            </Tooltip>
          ))}
          {/* Channel avatars */}
          {allChannels.map((ch) => (
            <Tooltip key={ch.id} content={ch.name} side="right">
              <Box
                rounded="md"
                style={{ cursor: "pointer", padding: 3, background: selected === ch.id ? "var(--ax-colors-bg-default-hovered)" : "transparent" }}
                onClick={() => onSelect(ch.id)}
              >
                <Avatar name={ch.name.replace(/^#/, "")} size="sm" />
              </Box>
            </Tooltip>
          ))}
        </Box>
      ) : (
        <>
      {/* Messages header */}
      <Box display="flex" alignItems="center" px="8" pt="6" pb="4" style={{ flexShrink: 0 }}>
        <Text fontSize="lg" fontWeight="700" color="fg.default" style={{ flex: 1, paddingLeft: 8 }}>Messages</Text>
        <Tooltip content="Search messages" delayDuration={300}>
          <Button appearance="subtle" size="lg"
            icon={<IconSearch style={{ width: 20, height: 20 }} />}
            aria-label="Search messages"
            onClick={() => { setSidebarSearchVisible(v => !v); setTimeout(() => searchRef.current?.focus(), 50); }} />
        </Tooltip>
        <Tooltip content="New message" delayDuration={300}>
          <Button appearance="subtle" size="lg"
            icon={<IconPenToSquare style={{ width: 20, height: 20 }} />}
            aria-label="New message"
            onClick={onNewConversation} />
        </Tooltip>
        <Tooltip content="Collapse sidebar" delayDuration={300}>
          <Button appearance="subtle" size="lg"
            icon={<IconChevronLeft style={{ width: 20, height: 20 }} />}
            aria-label="Collapse sidebar"
            onClick={onToggle} />
        </Tooltip>
      </Box>
      {/* Global search bar + filter — shown on magnifying glass click */}
      {sidebarSearchVisible && (
        <Box style={{ flexShrink: 0 }}>
          {/* Search input row */}
          <Box display="flex" alignItems="center" gap="8" px="10" pb="8" pt="2">
            <Box display="flex" alignItems="center" gap="8" px="10" py="6" rounded="md"
              style={{ flex: 1, background: "var(--ax-colors-bg-default)", border: "1px solid var(--ax-colors-border-default)", cursor: "text" }}
              onClick={() => searchRef.current?.focus()}
            >
              <IconSearch size={14} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
              <input
                ref={searchRef}
                placeholder="Search"
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
                onKeyDown={e => { if (e.key === "Escape") { setGlobalSearch(""); setSidebarSearchVisible(false); setFilterOpen(false); } }}
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 13, color: "var(--ax-colors-fg-default)" }}
              />
              {globalSearch && (
                <Box style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                  onClick={e => { e.stopPropagation(); setGlobalSearch(""); }}>
                  <IconXmark size={12} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
                </Box>
              )}
            </Box>
            <Button
              appearance={filterOpen || filterTypes.size > 0 ? "default" : "subtle"}
              size="md"
              icon={<IconSliders />}
              aria-label="Filters"
              onClick={() => setFilterOpen(v => !v)}
            />
          </Box>
          {/* Filter panel */}
          {filterOpen && (
            <Box mx="10" mb="8" px="12" py="10" rounded="lg"
              style={{ background: "var(--ax-colors-bg-default)", border: "1px solid var(--ax-colors-border-secondary)" }}>
              <Text fontWeight="600" color="fg.default" style={{ display: "block", marginBottom: 10, fontSize: 13 }}>Filters</Text>
              <Text style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "var(--ax-colors-fg-tertiary)", display: "block", marginBottom: 4 }}>Time range</Text>
              <Box mb="10">
                <Select
                  value={filterTimeRange}
                  onValueChange={v => setFilterTimeRange(v as "all" | "7d" | "30d")}
                  options={[
                    { label: "All time", value: "all" },
                    { label: "Last 7 days", value: "7d" },
                    { label: "Last 30 days", value: "30d" },
                  ]}
                >
                  <SelectTrigger>
                    {filterTimeRange === "all" ? "All time" : filterTimeRange === "7d" ? "Last 7 days" : "Last 30 days"}
                  </SelectTrigger>
                  <SelectContent />
                </Select>
              </Box>
              <Text style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "var(--ax-colors-fg-tertiary)", display: "block", marginBottom: 4 }}>Type</Text>
              {(["attachment", "link"] as const).map(t => (
                <Box key={t} display="flex" alignItems="center" gap="8" style={{ padding: "4px 0" }}>
                  <Checkbox
                    checked={filterTypes.has(t)}
                    onCheckedChange={() => toggleFilterType(t)}
                  />
                  <Text
                    fontSize="sm" color="fg.default"
                    style={{ textTransform: "capitalize", cursor: "pointer" }}
                    onClick={() => toggleFilterType(t)}
                  >{t}</Text>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Nav sections — scrollable so all sections are reachable */}
      <Box display="flex" flexDirection="column" gap="16" px="10" pb="10" pt="4" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>

        {(globalSearch.trim() || filterTypes.size > 0) ? (
          /* ── Global search results ── */
          (() => {
            const query = globalSearch.trim().toLowerCase();
            const results: { convId: string; convName: string; convAvatar?: string; convType: "dm" | "group" | "channel"; msg: Message }[] = [];
            Object.entries(THREADS).forEach(([convId, msgs]) => {
              const dm = activeDMS.find(d => d.id === convId);
              const group = GROUPS.find(g => g.id === convId);
              const convName = dm?.name ?? group?.name ?? convId;
              const convAvatar = dm?.avatar;
              const convType: "dm" | "group" | "channel" = dm ? "dm" : group ? "group" : "channel";
              msgs.forEach(msg => {
                const textMatch = !query ||
                  (msg.text && msg.text.toLowerCase().includes(query)) ||
                  (msg.senderName && msg.senderName.toLowerCase().includes(query)) ||
                  convName.toLowerCase().includes(query);
                if (!textMatch) return;
                if (filterTypes.size > 0) {
                  const isAttachment = msg.type === "attachment";
                  const isLink = /https?:\/\//.test(msg.text ?? "");
                  const typeMatch =
                    (filterTypes.has("attachment") && isAttachment) ||
                    (filterTypes.has("link") && isLink);
                  if (!typeMatch) return;
                }
                results.push({ convId, convName, convAvatar, convType, msg });
              });
            });
            const highlight = (text: string) => {
              const idx = text.toLowerCase().indexOf(query);
              if (idx < 0) return <span>{text}</span>;
              return <span>{text.slice(0, idx)}<span style={{ background: "var(--ax-colors-bg-success-subtle)", color: "var(--ax-colors-fg-success)", fontWeight: 600 }}>{text.slice(idx, idx + query.length)}</span>{text.slice(idx + query.length)}</span>;
            };
            return (
              <Box display="flex" flexDirection="column" gap="4">
                <Text style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "var(--ax-colors-fg-secondary)", padding: "2px 8px 4px" }}>
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </Text>
                {results.length === 0 && (
                  <Box px="8" py="8"><Text fontSize="sm" color="fg.tertiary">No messages found</Text></Box>
                )}
                {(["dm", "group", "channel"] as const).map(type => {
                  const group = results.filter(r => r.convType === type);
                  if (group.length === 0) return null;
                  const label = type === "dm" ? "Direct Messages" : type === "group" ? "Group Chats" : "Channels";
                  return (
                    <Box key={type} display="flex" flexDirection="column" gap="4">
                      <Text style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--ax-colors-fg-tertiary)", padding: "4px 8px 0" }}>{label}</Text>
                      {group.map((r, i) => (
                  <Box key={`${r.convId}-${r.msg.id}-${i}`} px="8" py="8" rounded="md"
                    style={{ cursor: "pointer", background: "var(--ax-colors-bg-default)", border: "1px solid var(--ax-colors-border-secondary)", marginBottom: 4 }}
                    onClick={() => { if (onHighlightSelect) { onHighlightSelect(r.convId, r.msg.id); } else { onSelect(r.convId); } setGlobalSearch(""); setSidebarSearchVisible(false); }}>
                    {r.convType === "dm" ? (
                      /* DM: single row — no repeated name */
                      <Box display="flex" alignItems="start" gap="8">
                        <Avatar name={r.convName} src={r.convAvatar} size="sm" style={{ flexShrink: 0 }} />
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text fontSize="sm" fontWeight="500" color="fg.default">{r.convName}</Text>
                          <Text fontSize="sm" color="fg.secondary" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                            {highlight((r.msg.text ?? "").slice(0, 80))}
                          </Text>
                        </Box>
                      </Box>
                    ) : (
                      /* Group / Channel: context header + inline sender */
                      <Box display="flex" flexDirection="column" gap="4">
                        <Box display="flex" alignItems="center" gap="6">
                          {r.convType === "group"
                            ? <Avatar name={r.convName} size="sm" />
                            : <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--ax-colors-bg-default-hovered)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "var(--ax-colors-fg-secondary)" }}>
                                {r.convName.replace(/^#/, "")[0]?.toUpperCase() ?? ""}
                              </div>
                          }
                          <Text style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "var(--ax-colors-fg-secondary)" }}>{r.convName}</Text>
                        </Box>
                        <Box style={{ paddingLeft: 30 }}>
                          <Text fontSize="sm" color="fg.secondary" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                            {r.msg.senderName && <Text asChild fontSize="sm" fontWeight="500" color="fg.default"><span>{r.msg.senderName}: </span></Text>}
                            {highlight((r.msg.text ?? "").slice(0, 80))}
                          </Text>
                        </Box>
                      </Box>
                    )}
                  </Box>
                      ))}
                    </Box>
                  );
                })}
              </Box>
            );
          })()
        ) : (
          /* ── Normal nav ── */
          <>

        {/* Quick Views */}
        {!collapsed && (
          <Box display="flex" flexDirection="column" gap="2">
            <Text style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "var(--ax-colors-fg-secondary)", padding: "2px 8px 4px" }}>
              Quick Views
            </Text>
            {([
              { id: "unreads",    label: "Unreads",      icon: <IconMarkEmailUnread size={15} /> },
              { id: "mentions",   label: "Mentions",     icon: <IconAt size={15} /> },
              { id: "threads",    label: "Threads",      icon: <IconMessageLines size={15} /> },
              { id: "needsreview", label: "Needs Review", icon: <IconCircleCheck size={15} /> },
            ] as const).map(qv => (
              <Box key={qv.id} display="flex" alignItems="center" gap="10" px="8" py="6" rounded="md"
                style={{ cursor: "pointer", background: quickView === qv.id ? "var(--ax-colors-bg-default-hovered)" : "transparent" }}
                onClick={() => onQuickViewChange(quickView === qv.id ? null : qv.id)}
              >
                <Box style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: "var(--ax-colors-bg-default)", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--ax-colors-fg-secondary)", boxShadow: "0 0 0 1px var(--ax-colors-border-secondary)" }}>
                  {qv.icon}
                </Box>
                <Text fontSize="md" fontWeight="400" color="fg.default" style={{ flex: 1 }}>{qv.label}</Text>
                {(quickViewCounts[qv.id] ?? 0) > 0 && (
                  <Badge intent="information">{quickViewCounts[qv.id]}</Badge>
                )}
              </Box>
            ))}
          </Box>
        )}

        {sections.map((s, idx) => (
          <Disclosure key={s.id} defaultOpen>
            <Box
              display="flex" alignItems="center"
              draggable
              onDragStart={() => { dragSrcId.current = s.id; }}
              onDragOver={e => { e.preventDefault(); setDragOverId(s.id); }}
              onDragLeave={() => setDragOverId(null)}
              onDrop={e => {
                e.preventDefault();
                if (!dragSrcId.current || dragSrcId.current === s.id) { setDragOverId(null); return; }
                setSections(prev => {
                  const from = prev.findIndex(x => x.id === dragSrcId.current);
                  const to = prev.findIndex(x => x.id === s.id);
                  const next = [...prev];
                  const [moved] = next.splice(from, 1);
                  next.splice(to, 0, moved);
                  return next;
                });
                dragSrcId.current = null;
                setDragOverId(null);
              }}
              onMouseEnter={() => setHoveredSectionId(s.id)}
              onMouseLeave={() => setHoveredSectionId(null)}
              rounded="sm"
              style={{
                position: "relative",
                background: dragOverId === s.id ? "var(--ax-colors-bg-default-hovered)" : "transparent",
                transition: "background 0.15s",
              }}
            >
            {hoveredSectionId === s.id && (
              <span style={{ cursor: "grab", color: "var(--ax-colors-fg-tertiary)", fontSize: 13, paddingRight: 2, userSelect: "none", flexShrink: 0 }}>⠿</span>
            )}
            {s.id !== "dms" && s.id !== "groups" && s.id !== "channels" && s.id !== "favorites" ? (
              // Custom section: chevron-only trigger + separately clickable editable label
              <>
                <DisclosureTrigger style={{ flexShrink: 0 }} />
                {editingSectionId === s.id ? (
                  <input
                    autoFocus
                    value={editingLabel}
                    onChange={e => setEditingLabel(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={e => {
                      if (e.key === "Enter") { e.preventDefault(); commitEdit(); }
                      if (e.key === "Escape") setEditingSectionId(null);
                    }}
                    style={{
                      flex: 1, minWidth: 0,
                      border: "none", outline: "none", background: "transparent",
                      fontFamily: "inherit",
                      fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const,
                      color: "var(--ax-colors-fg-secondary)",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      cursor: "text",
                      fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const,
                      color: "var(--ax-colors-fg-secondary)",
                    }}
                    onClick={e => { e.stopPropagation(); startEditing(s); }}
                    title="Click to rename"
                  >
                    {s.label}
                  </span>
                )}
              </>
            ) : (
              // Built-in section: full-width trigger, not editable
              <DisclosureTrigger style={{ flex: 1, minWidth: 0 }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--ax-colors-fg-secondary)" }}>
                  {s.label}
                </span>
              </DisclosureTrigger>
            )}
            {(hoveredSectionId === s.id || openSectionMenuId === s.id) && (
              <div
                ref={openSectionMenuId === s.id ? sectionMenuRef : undefined}
                style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", zIndex: openSectionMenuId === s.id ? 100 : 1 }}
              >
                <Button
                  appearance="subtle" size="sm"
                  icon={<IconEllipsisSolid style={{ width: 12, height: 12 }} />}
                  aria-label="Section options"
                  onClick={e => { e.stopPropagation(); setOpenSectionMenuId(openSectionMenuId === s.id ? null : s.id); }}
                  style={{ width: 20, height: 20, padding: 0 }}
                />
                {openSectionMenuId === s.id && (() => {
                  const ss = getSectionSettings(s.id);
                  const menuItem = (label: string, isChecked: boolean, onClick: () => void) => (
                    <div
                      role="button" tabIndex={0}
                      onClick={onClick}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", cursor: "pointer", borderRadius: 6, fontSize: 13, color: "var(--ax-colors-fg-default)", whiteSpace: "nowrap" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--ax-colors-bg-secondary)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ width: 14, fontSize: 12, color: "var(--ax-colors-fg-default)" }}>{isChecked ? "✓" : ""}</span>
                      {label}
                    </div>
                  );
                  return (
                    <div
                      onClick={e => e.stopPropagation()}
                      style={{
                        position: "absolute", top: 28, right: 0, zIndex: 1000,
                        minWidth: 180, background: "var(--ax-colors-bg-default)",
                        border: "1px solid var(--ax-colors-border-secondary)",
                        borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
                        padding: "4px",
                      }}
                    >
                      <div style={{ padding: "6px 10px 2px", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: "var(--ax-colors-fg-tertiary)" }}>View</div>
                      {menuItem("All", ss.view === "all", () => { updateSectionSetting(s.id, { view: "all" }); setOpenSectionMenuId(null); })}
                      {menuItem("Unread only", ss.view === "unread", () => { updateSectionSetting(s.id, { view: "unread" }); setOpenSectionMenuId(null); })}
                      <div style={{ height: 1, background: "var(--ax-colors-border-tertiary)", margin: "4px 8px" }} />
                      <div style={{ padding: "6px 10px 2px", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: "var(--ax-colors-fg-tertiary)" }}>Sort</div>
                      {menuItem("Most recent", ss.sort === "recent", () => { updateSectionSetting(s.id, { sort: "recent" }); setOpenSectionMenuId(null); })}
                      {menuItem("A–Z", ss.sort === "az", () => { updateSectionSetting(s.id, { sort: "az" }); setOpenSectionMenuId(null); })}
                      <div style={{ height: 1, background: "var(--ax-colors-border-tertiary)", margin: "4px 8px" }} />
                      {s.id === "dms" && menuItem("Create Direct Message", false, () => { onNewConversation(); setOpenSectionMenuId(null); })}
                      {s.id === "groups" && menuItem("Create Group Chat", false, () => { onNewGroup?.(); setOpenSectionMenuId(null); })}
                      {s.id === "channels" && menuItem("Create Channel", false, () => { setCreateChannelOpen(true); setOpenSectionMenuId(null); })}
                      {s.id !== "dms" && s.id !== "groups" && s.id !== "channels" && (<>
                        {menuItem("Rename section", false, () => { setOpenSectionMenuId(null); startEditing(s); })}
                        <div style={{ height: 1, background: "var(--ax-colors-border-tertiary)", margin: "4px 8px" }} />
                        <div
                          role="button" tabIndex={0}
                          onClick={() => { setSections(prev => prev.filter(x => x.id !== s.id)); setOpenSectionMenuId(null); }}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", cursor: "pointer", borderRadius: 6, fontSize: 13, color: "var(--ax-colors-fg-danger)", whiteSpace: "nowrap" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--ax-colors-bg-danger-subtle)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <span style={{ width: 14 }} />
                          Delete section
                        </div>
                      </>)}
                    </div>
                  );
                })()}
              </div>
            )}
            </Box>
            <DisclosureContent>
              <Box display="flex" flexDirection="column" pt="4">
                {s.id === "dms" && [...activeDMS].filter(dm => {
                    if (movedItems.includes(dm.id) || ARCHIVED_DM_IDS.includes(dm.id)) return false;
                    if (getSectionSettings("dms").view === "unread")
                      return (dm.unread ?? 0) > 0 || (VAU_DELIVERABLES[dm.id]?.length ?? 0) > 0 || !!manualUnreadConvos?.has(dm.id);
                    return true;
                  }).sort((a, b) => {
                    if (getSectionSettings("dms").sort === "az") return a.name.localeCompare(b.name);
                    const aScore = (a.unread ?? 0) + ((VAU_DELIVERABLES[a.id]?.length ?? 0) > 0 ? 1000 : 0);
                    const bScore = (b.unread ?? 0) + ((VAU_DELIVERABLES[b.id]?.length ?? 0) > 0 ? 1000 : 0);
                    return bScore - aScore;
                  }).map((dm) => (
                  <Box
                    key={dm.id}
                    display="flex"
                    alignItems="center"
                    gap="10"
                    px="8"
                    py="6"
                    rounded="md"
                    draggable
                    onDragStart={e => { e.stopPropagation(); dragItemId.current = dm.id; dragItemSource.current = "dms"; }}
                    onDragEnd={() => { dragItemId.current = null; dragItemSource.current = null; }}
                    style={{
                      cursor: "pointer",
                      background: selected === dm.id ? "var(--ax-colors-bg-default-hovered)" : "transparent",
                    }}
                    onClick={() => onSelect(dm.id)}
                  >
                    <Box style={{ position: "relative", flexShrink: 0, display: "inline-flex" }}>
                      {dm.avatar ? (
                        <Avatar name={dm.name} src={dm.avatar} size="md" />
                      ) : (
                        <Box style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: "var(--ax-colors-fg-secondary)", flexShrink: 0 }}>
                          {dm.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                        </Box>
                      )}
                      {dm.status && (
                        dm.status === "ooo"
                          ? <OOOIndicator size={8} outerBorderColor="var(--ax-colors-bg-secondary, #eff5eb)" />
                          : <Box rounded="full" style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, background: PRESENCE_COLOR[dm.status], border: "1.5px solid var(--ax-colors-bg-secondary, #eff5eb)" }} />
                      )}
                    </Box>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Box display="flex" alignItems="center" gap="6">
                        <Box display="flex" alignItems="center" gap="6" style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                          <Text
                            fontSize="md"
                            fontWeight={(dm.unread || (VAU_DELIVERABLES[dm.id]?.length ?? 0) > 0 || manualUnreadConvos?.has(dm.id)) ? "600" : "400"}
                            color="fg.default"
                            style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 1, minWidth: 0 }}
                          >
                            {dm.name}
                          </Text>
                          {dm.isVAU && (
                            <Badge intent="information" style={{ flexShrink: 0 }}>Virtual</Badge>
                          )}
                          {mutedConvos?.has(dm.id) && (
                            <IconBellSlash size={12} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
                          )}
                          {dm.hasDraft && (
                            <IconPen size={14} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
                          )}
                        </Box>
                        {dm.time && <Text fontSize="sm" color="fg.tertiary" fontWeight={(dm.unread || (VAU_DELIVERABLES[dm.id]?.length ?? 0) > 0 || manualUnreadConvos?.has(dm.id)) ? "500" : "400"} style={{ flexShrink: 0 }}>{dm.time}</Text>}
                      </Box>
                      <Box display="flex" alignItems="center" gap="6">
                        {(() => { const p = getThreadPreview(dm.id, threads, dm.preview); const isUnread = !!(dm.unread || (VAU_DELIVERABLES[dm.id]?.length ?? 0) > 0 || manualUnreadConvos?.has(dm.id)); return p ? <Text fontSize="md" color="fg.tertiary" fontWeight={isUnread ? "500" : "400"} style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p}</Text> : <Box style={{ flex: 1 }} />; })()}
                        {(dm.unread || (VAU_DELIVERABLES[dm.id]?.length ?? 0) > 0 || manualUnreadConvos?.has(dm.id)) && (
                          <Box style={{ ...UNREAD_DOT_STYLE, flexShrink: 0 }} />
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
                {s.id === "groups" && [...(extraGroups ?? []), ...GROUPS].filter(g => {
                    if (movedItems.includes(g.id) || leftConvos?.has(g.id)) return false;
                    if (getSectionSettings("groups").view === "unread")
                      return (g.unread ?? 0) > 0 || !!manualUnreadConvos?.has(g.id);
                    return true;
                  }).sort((a, b) => {
                    if (getSectionSettings("groups").sort === "az") return a.name.localeCompare(b.name);
                    return (b.unread ?? 0) - (a.unread ?? 0);
                  }).map((g) => (
                  <Box
                    key={g.id}
                    display="flex"
                    alignItems="center"
                    gap="10"
                    px="8"
                    py="6"
                    rounded="md"
                    draggable
                    onDragStart={e => { e.stopPropagation(); dragItemId.current = g.id; dragItemSource.current = "groups"; }}
                    onDragEnd={() => { dragItemId.current = null; dragItemSource.current = null; }}
                    style={{
                      cursor: "pointer",
                      background: selected === g.id ? "var(--ax-colors-bg-default-hovered)" : "transparent",
                    }}
                    onClick={() => onSelect(g.id)}
                  >
                    <Box style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <IconUserGroup size={18} style={{ color: "var(--ax-colors-fg-secondary)" }} />
                    </Box>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Box display="flex" alignItems="center" gap="6">
                        <Box display="flex" alignItems="center" gap="6" style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                          <Text
                            fontSize="md"
                            fontWeight={(g.unread || manualUnreadConvos?.has(g.id)) ? "600" : "400"}
                            color="fg.default"
                            style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 1, minWidth: 0 }}
                          >
                            {nameOverrides?.[g.id] ?? g.name}
                          </Text>
                          {mutedConvos?.has(g.id) && (
                            <IconBellSlash size={12} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
                          )}
                          {g.hasDraft && (
                            <IconPen size={14} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
                          )}
                        </Box>
                        {g.time && <Text fontSize="sm" color="fg.tertiary" fontWeight={(g.unread || manualUnreadConvos?.has(g.id)) ? "500" : "400"} style={{ flexShrink: 0 }}>{g.time}</Text>}
                      </Box>
                      <Box display="flex" alignItems="center" gap="6">
                        {(() => { const p = getThreadPreview(g.id, threads, g.preview, true); const isUnread = !!(g.unread || manualUnreadConvos?.has(g.id)); return p ? <Text fontSize="md" color="fg.tertiary" fontWeight={isUnread ? "500" : "400"} style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p}</Text> : <Box style={{ flex: 1 }} />; })()}
                        {(g.unread || manualUnreadConvos?.has(g.id)) && (
                          <Box style={{ ...UNREAD_DOT_STYLE, flexShrink: 0 }} />
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
                {s.id === "channels" && [...allChannels].filter(ch => {
                    if (movedItems.includes(ch.id) || leftConvos?.has(ch.id)) return false;
                    if (getSectionSettings("channels").view === "unread")
                      return (ch.unread ?? 0) > 0 || !!manualUnreadConvos?.has(ch.id);
                    return true;
                  }).sort((a, b) => {
                    if (getSectionSettings("channels").sort === "az") return a.name.localeCompare(b.name);
                    return (b.unread ?? 0) - (a.unread ?? 0);
                  }).map((ch) => (
                  <Box
                    key={ch.id}
                    display="flex"
                    alignItems="center"
                    gap="10"
                    px="8"
                    py="6"
                    rounded="md"
                    draggable
                    onDragStart={e => { e.stopPropagation(); dragItemId.current = ch.id; dragItemSource.current = "channels"; }}
                    onDragEnd={() => { dragItemId.current = null; dragItemSource.current = null; }}
                    style={{
                      cursor: "pointer",
                      background: selected === ch.id ? "var(--ax-colors-bg-default-hovered)" : "transparent",
                    }}
                    onClick={() => onSelect(ch.id)}
                  >
                    <Avatar name={ch.name.replace(/^#/, "")} size="md" />
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Box display="flex" alignItems="center" gap="6">
                        <Box display="flex" alignItems="center" gap="4" style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                          <Text
                            fontSize="md"
                            fontWeight={(ch.unread || manualUnreadConvos?.has(ch.id)) ? "600" : "400"}
                            color="fg.default"
                            style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          >
                            {nameOverrides?.[ch.id] ?? ch.name}
                          </Text>
                          {(channelPrivacyOverrides?.[ch.id] ?? ch.isPrivate) && <IconLock size={12} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />}
                          {mutedConvos?.has(ch.id) && (
                            <IconBellSlash size={12} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
                          )}
                        </Box>
                        {ch.time && <Text fontSize="sm" color="fg.tertiary" fontWeight={(ch.unread || manualUnreadConvos?.has(ch.id)) ? "500" : "400"} style={{ flexShrink: 0 }}>{ch.time}</Text>}
                      </Box>
                      <Box display="flex" alignItems="center" gap="6">
                        {(() => { const p = getThreadPreview(ch.id, threads, ch.preview, true); const isUnread = !!(ch.unread || manualUnreadConvos?.has(ch.id)); return p ? <Text fontSize="md" color="fg.tertiary" fontWeight={isUnread ? "500" : "400"} style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p}</Text> : <Box style={{ flex: 1 }} />; })()}
                        {(ch.unread || manualUnreadConvos?.has(ch.id)) && (
                          <Box style={{ ...UNREAD_DOT_STYLE, flexShrink: 0 }} />
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
                {s.id !== "dms" && s.id !== "groups" && s.id !== "channels" && (() => {
                  const sectionItems = s.items ?? [];
                  const allConvos = [
                    ...activeDMS.map(d => ({ id: d.id, name: d.name, avatar: d.avatar, type: "dm" as const, isVAU: d.isVAU, status: d.status })),
                    ...GROUPS.map(g => ({ id: g.id, name: g.name, avatar: "", type: "group" as const, emoji: g.emoji })),
                    ...CHANNELS.map(ch => ({ id: ch.id, name: ch.name, avatar: "", type: "channel" as const })),
                  ];
                  const addedConvos = allConvos.filter(c => sectionItems.includes(c.id));
                  const availableConvos = allConvos.filter(c =>
                    !sectionItems.includes(c.id) &&
                    (!sectionPickerQuery || c.name.toLowerCase().includes(sectionPickerQuery.toLowerCase()))
                  );
                  const handleItemDrop = (e: React.DragEvent) => {
                    e.preventDefault();
                    const itemId = dragItemId.current;
                    if (!itemId) return;
                    // Add to this section and mark as moved from original
                    setSections(prev => prev.map(x => x.id === s.id ? { ...x, items: [...new Set([...(x.items ?? []), itemId])] } : x));
                    setMovedItems(prev => [...new Set([...prev, itemId])]);
                    dragItemId.current = null;
                    dragItemSource.current = null;
                    setItemDragOverSectionId(null);
                  };
                  return (
                    <Box display="flex" flexDirection="column" gap="0"
                      onDragOver={e => { if (dragItemId.current) { e.preventDefault(); setItemDragOverSectionId(s.id); } }}
                      onDragLeave={() => setItemDragOverSectionId(null)}
                      onDrop={handleItemDrop}
                      style={{ minHeight: 4, borderRadius: 6, background: itemDragOverSectionId === s.id ? "var(--ax-colors-bg-default-hovered)" : "transparent", transition: "background 0.15s" }}
                    >
                      {addedConvos.map(c => (
                        <Box key={c.id} display="flex" alignItems="center" gap="10" px="8" py="6" rounded="md"
                          style={{ cursor: "pointer", background: selected === c.id ? "var(--ax-colors-bg-default-hovered)" : "transparent", position: "relative" }}
                          onClick={() => onSelect(c.id)}
                          onMouseEnter={e => (e.currentTarget.querySelector("[data-remove]") as HTMLElement)?.style.setProperty("opacity", "1")}
                          onMouseLeave={e => (e.currentTarget.querySelector("[data-remove]") as HTMLElement)?.style.setProperty("opacity", "0")}
                        >
                          {c.type === "dm"
                            ? <Box style={{ position: "relative", flexShrink: 0 }}>
                                <Avatar name={c.name} src={c.avatar} size="md" />
                                {c.status && <Box rounded="full" style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, background: PRESENCE_COLOR[c.status], border: "1.5px solid var(--ax-colors-bg-secondary)" }} />}
                              </Box>
                            : c.type === "channel"
                            ? <Avatar name={c.name.replace("#", "")} size="md" />
                            : <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--ax-colors-bg-default-hovered)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{(c as { emoji: string }).emoji}</div>
                          }
                          <Text fontSize="md" color="fg.default" style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</Text>
                          <Box data-remove style={{ opacity: 0, transition: "opacity 0.1s" }}
                            onClick={e => { e.stopPropagation(); setSections(prev => prev.map(x => x.id === s.id ? { ...x, items: (x.items ?? []).filter(i => i !== c.id) } : x)); setMovedItems(prev => prev.filter(i => i !== c.id)); }}>
                            <IconXmark size={12} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
                          </Box>
                        </Box>
                      ))}
                      <Box style={{ position: "relative" }}>
                        <Button appearance="subtle" size="sm" icon={<IconPlus style={{ width: 12, height: 12 }} />}
                          onClick={() => { setSectionPickerOpen(sectionPickerOpen === s.id ? null : s.id); setSectionPickerQuery(""); }}
                          style={{ width: "100%", justifyContent: "flex-start", paddingLeft: 8, color: "var(--ax-colors-fg-tertiary)", marginTop: 2 }}>
                          Add conversations
                        </Button>
                        {sectionPickerOpen === s.id && (
                          <Box style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 30,
                            background: "var(--ax-colors-bg-default)", border: "1px solid var(--ax-colors-border-default)",
                            borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                            <Box px="8" py="6" style={{ borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
                              <input autoFocus placeholder="Search…" value={sectionPickerQuery}
                                onChange={e => setSectionPickerQuery(e.target.value)}
                                style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 13, color: "var(--ax-colors-fg-default)" }} />
                            </Box>
                            <Box style={{ maxHeight: 200, overflowY: "auto" }}>
                              {availableConvos.length === 0 && <Box px="12" py="10"><Text fontSize="sm" color="fg.tertiary">No conversations found</Text></Box>}
                              {availableConvos.map(c => (
                                <Box key={c.id} display="flex" alignItems="center" gap="10" px="10" py="8"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => { setSections(prev => prev.map(x => x.id === s.id ? { ...x, items: [...(x.items ?? []), c.id] } : x)); setSectionPickerQuery(""); setSectionPickerOpen(null); }}>
                                  {c.type === "dm"
                                    ? <Avatar name={c.name} src={c.avatar} size="sm" />
                                    : c.type === "group"
                                    ? <Avatar name={c.name} size="sm" />
                                    : <Avatar name={c.name.replace(/^#/, "")} size="sm" />
                                  }
                                  <Text fontSize="sm" color="fg.default">{c.name}</Text>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                })()}
              </Box>
            </DisclosureContent>
          </Disclosure>
        ))}

        {!collapsed && (
          <Button appearance="subtle" size="md" icon={<IconPlus style={{ width: 14, height: 14 }} />}
            onClick={addSection}
            style={{ width: "100%", justifyContent: "flex-start", paddingLeft: 4, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }}>
            Add a section
          </Button>
        )}

        {/* Archived section — fixed, non-draggable */}
        {!collapsed && (
          <Disclosure defaultOpen>
            <Box display="flex" alignItems="center" gap="4" px="4" py="6" rounded="sm">
              <DisclosureTrigger style={{ flex: 1 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--ax-colors-fg-tertiary)" }}>
                    Archived
                  </span>
                </span>
              </DisclosureTrigger>
            </Box>
            <DisclosureContent>
              <Box display="flex" flexDirection="column" pt="4">
                {activeDMS.filter(dm => ARCHIVED_DM_IDS.includes(dm.id)).map(dm => (
                  <Box
                    key={dm.id}
                    display="flex"
                    alignItems="center"
                    gap="10"
                    px="8"
                    py="6"
                    rounded="md"
                    style={{
                      cursor: "pointer",
                      opacity: 0.65,
                      background: selected === dm.id ? "var(--ax-colors-bg-default-hovered)" : "transparent",
                    }}
                    onClick={() => onSelect(dm.id)}
                  >
                    <Box style={{ position: "relative", flexShrink: 0, display: "inline-flex" }}>
                      <Box style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }}>
                        {dm.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                      </Box>
                    </Box>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Box display="flex" alignItems="center" gap="6" style={{ overflow: "hidden" }}>
                        <Text
                          fontSize="md"
                          fontWeight="400"
                          color="fg.secondary"
                          style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 1, minWidth: 0 }}
                        >
                          {dm.name}
                        </Text>
                        <Badge intent="neutral" style={{ flexShrink: 0, fontSize: 10 }}>Deactivated</Badge>
                      </Box>
                      {(() => { const p = getThreadPreview(dm.id, threads, dm.preview); return p ? <Text fontSize="sm" color="fg.tertiary" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontStyle: "italic" }}>{p}</Text> : null; })()}
                    </Box>
                  </Box>
                ))}
              </Box>
            </DisclosureContent>
          </Disclosure>
        )}

          </>
        )}

      </Box>


</>
      )}

      {/* Create channel modal */}
      {createChannelOpen && (
        <Box
          onClick={() => { setCreateChannelOpen(false); setCreateChannelName(""); setCreateChannelVisibility("public"); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Box
            onClick={e => e.stopPropagation()}
            style={{ background: "var(--ax-colors-bg-default)", borderRadius: 12, width: 480, padding: "28px 32px 24px", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", gap: 20 }}
          >
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Text fontSize="xl" fontWeight="700" color="fg.default">Create a channel</Text>
              <Button appearance="subtle" size="sm" icon={<IconXmark size={16} />} aria-label="Close"
                onClick={() => { setCreateChannelOpen(false); setCreateChannelName(""); setCreateChannelVisibility("public"); }}
                style={{ padding: 4 }} />
            </Box>

            {/* Name */}
            <Box display="flex" flexDirection="column" gap="8">
              <Text fontSize="sm" fontWeight="600" color="fg.default">Name</Text>
              <Box style={{ position: "relative", display: "flex", alignItems: "center", border: "2px solid var(--ax-colors-border-focus, #4f8ef7)", borderRadius: 8, paddingLeft: 10, paddingRight: 40 }}>
                <Text fontSize="md" color="fg.tertiary" style={{ flexShrink: 0, marginRight: 6 }}>#</Text>
                <input
                  autoFocus
                  maxLength={80}
                  value={createChannelName}
                  onChange={e => setCreateChannelName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && createChannelName.trim()) handleCreateChannel(); }}
                  placeholder="e.g. campaign-q4"
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 14, padding: "10px 0", color: "var(--ax-colors-fg-default)" }}
                />
                <Text fontSize="sm" color="fg.tertiary" style={{ position: "absolute", right: 10 }}>{80 - createChannelName.length}</Text>
              </Box>
              <Text fontSize="sm" color="fg.tertiary">Channels are where your team communicates around a topic. Use a name that's easy to find and understand.</Text>
            </Box>

            {/* Visibility */}
            <Box display="flex" flexDirection="column" gap="12">
              <Text fontSize="sm" fontWeight="600" color="fg.default">Visibility</Text>
              {(["public", "private"] as const).map(v => (
                <Box
                  key={v}
                  onClick={() => setCreateChannelVisibility(v)}
                  display="flex" alignItems="start" gap="12"
                  style={{ cursor: "pointer", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${createChannelVisibility === v ? "var(--ax-colors-border-focus, #4f8ef7)" : "var(--ax-colors-border-default)"}`, background: createChannelVisibility === v ? "var(--ax-colors-bg-default-hovered)" : "transparent" }}
                >
                  <Box style={{ marginTop: 2, width: 16, height: 16, borderRadius: "50%", border: `2px solid ${createChannelVisibility === v ? "var(--ax-colors-fg-default)" : "var(--ax-colors-border-default)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {createChannelVisibility === v && <Box style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ax-colors-fg-default)" }} />}
                  </Box>
                  <Box display="flex" flexDirection="column" gap="2">
                    <Text fontSize="md" fontWeight="500" color="fg.default">
                      {v === "public" ? "Public — anyone in Opal Workspace" : "Private — only specific people"}
                    </Text>
                    <Text fontSize="sm" color="fg.tertiary">
                      {v === "public" ? "Anyone in the workspace can find and join" : "Can only be viewed or joined by invitation"}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Footer */}
            <Box display="flex" justifyContent="flex-end" gap="8">
              <Button appearance="default" size="md" onClick={() => { setCreateChannelOpen(false); setCreateChannelName(""); setCreateChannelVisibility("public"); }}>Cancel</Button>
              <Button appearance="primary" size="md" disabled={!createChannelName.trim()} onClick={handleCreateChannel}>Create channel</Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Notification settings modal */}
      <Dialog open={notifSettingsOpen} onOpenChange={setNotifSettingsOpen}>
        <DialogContent style={{ width: 480 }}>
          <DialogHeader>Notification settings</DialogHeader>
          <DialogBody>
            {([
              { key: "dm",      label: "Direct Messages", value: dmNotif,      set: setDmNotif },
              { key: "group",   label: "Group Chats",     value: groupNotif,   set: setGroupNotif },
              { key: "channel", label: "Channels",        value: channelNotif, set: setChannelNotif },
            ] as { key: string; label: string; value: "all" | "mentions" | "off"; set: (v: "all" | "mentions" | "off") => void }[]).map((row, i) => (
              <Box
                key={row.key}
                display="flex"
                flexDirection="column"
                gap="16"
                style={{ paddingTop: 16, paddingBottom: 16, borderTop: i === 0 ? "none" : "1px solid var(--ax-colors-border-tertiary)" }}
              >
                <Text fontSize="lg" fontWeight="500" color="fg.default">{row.label}</Text>
                <RadioGroup value={row.value} onValueChange={v => row.set(v as "all" | "mentions" | "off")}>
                  <Box display="flex" flexDirection="column" gap="10" pl="16">
                    <Radio value="all">All messages</Radio>
                    <Radio value="mentions">@Mentions only</Radio>
                    <Radio value="off">Off</Radio>
                  </Box>
                </RadioGroup>
              </Box>
            ))}
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild><Button appearance="default" size="md">Cancel</Button></DialogClose>
            <Button appearance="primary" size="md" onClick={() => setNotifSettingsOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

// ── Agent data ────────────────────────────────────────────────────────────────

const MOCK_AGENTS = [
  { id: "bubs",      name: "Randy",                emoji: "🐆", description: "Drafts blog posts, emails, and social copy. Trained on Optimizely brand voice.", tags: ["Blog Posts", "Email", "Social"], connectors: ["Figma", "Slack"], workingWith: ["https://i.pravatar.cc/150?img=47", "https://i.pravatar.cc/150?img=68", "https://i.pravatar.cc/150?img=44"] },
  { id: "kara",      name: "Kara",                emoji: "🌿", description: "Plans and optimises SEO content strategy. Analyses keywords and builds editorial calendars.", tags: ["SEO", "Content Brief", "Keywords"], connectors: ["Figma"], workingWith: ["https://i.pravatar.cc/150?img=9", "https://i.pravatar.cc/150?img=24"] },
  { id: "eric",      name: "Eric",                emoji: "🐹", description: "Designs and analyses A/B tests. Suggests variants and interprets experiment results.", tags: ["A/B Test", "Variants", "Report"], connectors: ["Slack"], workingWith: ["https://i.pravatar.cc/150?img=53"] },
  { id: "campaign",  name: "Campaign Strategist", emoji: "♟️", description: "Plan smarter campaigns, target the right audience, and launch with confidence.", tags: ["Creation", "Campaign Drafts"], connectors: ["Figma", "Slack"], workingWith: ["https://i.pravatar.cc/150?img=47", "https://i.pravatar.cc/150?img=68", "https://i.pravatar.cc/150?img=44", "https://i.pravatar.cc/150?img=9"] },
];

const MOCK_SKILLS = [
  { id: "s1", name: "Opti UX Copywriting",                description: "# UX Copywriting & Content Design ## Step 1 — ask which voice Before writing anything, ask: > **Which…", createdBy: { name: "Hsiao-Pei Chien"   }, lastModified: { date: "Jun 15, 2026", by: "Hsiao-Pei Chien" } },
  { id: "s2", name: "Specialized Agent Builder",           description: "When the user asks to build a specialized agent, follow these steps: ## STEP 1 — Gather requirements Ask…", createdBy: { name: "MD. Kamrul Hassan" }, lastModified: { date: "Jun 07, 2026", by: "MD. Kamrul Hassan" } },
  { id: "s3", name: "Optimizely Brand Color Guideline",    description: "1. Primary Colors (Foundation & Branding) These are the core colors that define the Optimizely brand.…",    createdBy: { name: "MD. Kamrul Hassan" }, lastModified: { date: "Jun 02, 2026", by: "Kamrul Hasan" } },
  { id: "s4", name: "Audit Axiom",                         description: "# Audit Axiom Reviews an existing component file for Axiom design system violations and optionally fixes…",  createdBy: { name: "Hsiao-Pei Chien"   }, lastModified: { date: "May 22, 2026", by: "Hsiao-Pei Chien" } },
  { id: "s5", name: "Canvas Style",                        description: "Use this color scheme for canvas outputs: lime green.\\ \\ Add week day in the date too",                      createdBy: { name: "Nikita Bokil"       }, lastModified: { date: "May 14, 2026", by: "Mohammad Tamimul Ehsan" } },
  { id: "s6", name: "Optimizely Opal Release Notes Style", description: "## Objective Write release notes for Optimizely Opal features that match the exact tone, structure, and…",   createdBy: { name: "Nikita Bokil"       }, lastModified: { date: "May 14, 2026", by: "Nikita Bokil" } },
];

// ── Agent Card (chat message) ──────────────────────────────────────────────────

function AgentCardMessage({ agent }: { agent: NonNullable<Message["agentCard"]> }) {
  return (
    <Box rounded="lg" style={{ border: "1px solid var(--ax-colors-border-default)", background: "var(--ax-colors-bg-default)", width: 300, overflow: "hidden" }}>
      {/* Header */}
      <Box display="flex" alignItems="start" gap="12" px="16" pt="16" pb="10">
        {/* Emoji icon */}
        <Box rounded="lg" style={{ width: 48, height: 48, background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
          {agent.emoji}
        </Box>
        {/* Name + working with */}
        <Box display="flex" flexDirection="column" gap="4" style={{ flex: 1, minWidth: 0 }}>
          <Text fontWeight="600" color="fg.default" style={{ fontSize: 16, lineHeight: 1.2 }}>{agent.name}</Text>
          <Box display="flex" alignItems="center" gap="6">
            <Text fontSize="sm" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: "0.04em", fontSize: 10, fontWeight: 500, flexShrink: 0 }}>Working with</Text>
            <AvatarGroup>
              {agent.workingWith.slice(0, 3).map((src, i) => (
                <Avatar key={i} name={`User ${i}`} src={src} size="2xs" />
              ))}
              {agent.workingWith.length > 3 && <Avatar name={`+${agent.workingWith.length - 3}`} size="2xs" />}
            </AvatarGroup>
          </Box>
        </Box>
      </Box>
      {/* Description */}
      <Box px="16" pb="10">
        <Text fontSize="sm" color="fg.secondary" style={{ lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {agent.description}
        </Text>
      </Box>
      {/* Tags */}
      <Box display="flex" px="16" pb="12" gap="6" style={{ flexWrap: "wrap" }}>
        {agent.tags.map(t => <Badge key={t} intent="neutral">{t}</Badge>)}
      </Box>
      {/* Footer */}
      <Box display="flex" alignItems="center" justifyContent="space-between" px="16" py="10"
        style={{ borderTop: "1px solid var(--ax-colors-border-secondary)" }}>
        <Box display="flex" gap="6">
          {agent.connectors.map(c => (
            <Box key={c} rounded="lg" style={{ width: 28, height: 28, border: "1px solid var(--ax-colors-border-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
              {c === "Figma" ? "🎨" : c === "Slack" ? "💬" : "🔗"}
            </Box>
          ))}
        </Box>
        <Button appearance="primary" size="sm">Start chat</Button>
      </Box>
    </Box>
  );
}

// ── Activity Feed ─────────────────────────────────────────────────────────────

type Activity = { id: string; label: string; status: "completed" | "in-progress" | "failed"; duration: string; time: string; trigger: string };

const VAU_ACTIVITIES: Record<string, Activity[]> = {
  bubs: [
    { id: "a1", label: "Drafted Q3 Content Strategy blog post", status: "completed", duration: "2m", time: "Today, 9:51 AM", trigger: "Chat" },
    { id: "a2", label: "Generated Black Friday email series (5 variants)", status: "completed", duration: "4m", time: "Today, 9:33 AM", trigger: "Chat" },
    { id: "a3", label: "Writing LinkedIn thought leadership series", status: "in-progress", duration: "—", time: "Today, 9:12 AM", trigger: "Scheduler" },
    { id: "a4", label: "Created product launch email sequence", status: "completed", duration: "3m", time: "Yesterday, 4:22 PM", trigger: "Chat" },
    { id: "a5", label: "Social copy for Q4 campaign", status: "failed", duration: "1m", time: "Yesterday, 2:10 PM", trigger: "Chat" },
  ],
  kara: [
    { id: "k1", label: "SEO keyword analysis for Q4 content", status: "completed", duration: "6m", time: "Today, 10:15 AM", trigger: "Scheduler" },
    { id: "k2", label: "Updated brand voice guidelines doc", status: "completed", duration: "3m", time: "Today, 9:00 AM", trigger: "Chat" },
    { id: "k3", label: "Building editorial calendar H1 2026", status: "in-progress", duration: "—", time: "Yesterday, 5:30 PM", trigger: "Chat" },
    { id: "k4", label: "Competitor content gap analysis — 12 topics", status: "completed", duration: "9m", time: "Yesterday, 2:45 PM", trigger: "Scheduler" },
    { id: "k5", label: "Refreshed meta descriptions for top 20 pages", status: "completed", duration: "4m", time: "Yesterday, 11:20 AM", trigger: "Chat" },
    { id: "k6", label: "Social amplification plan for Q4 blog series", status: "failed", duration: "2m", time: "Mon, 4:05 PM", trigger: "Chat" },
    { id: "k7", label: "Generated FAQ schema markup for product pages", status: "completed", duration: "5m", time: "Mon, 1:30 PM", trigger: "Webhook" },
    { id: "k8", label: "Audience persona refresh — enterprise segment", status: "completed", duration: "7m", time: "Mon, 10:00 AM", trigger: "Scheduler" },
  ],
  eric: [
    { id: "e1", label: "Homepage CTA multivariate test — 3 variants", status: "completed", duration: "8m", time: "Today, 11:02 AM", trigger: "Webhook" },
    { id: "e2", label: "Pricing page copy A/B test configured", status: "completed", duration: "2m", time: "Today, 10:30 AM", trigger: "Chat" },
    { id: "e3", label: "Analysing Q4 onboarding experiment results", status: "in-progress", duration: "—", time: "Today, 9:45 AM", trigger: "Scheduler" },
    { id: "e4", label: "Mobile nav experiment — insufficient data", status: "failed", duration: "12m", time: "Yesterday, 3:18 PM", trigger: "Webhook" },
  ],
};

const STATUS_ICON: Record<Activity["status"], React.ReactNode> = {
  completed:   <IconCircleCheck size={14} style={{ color: "var(--ax-colors-fg-success)", flexShrink: 0 }} />,
  "in-progress": <IconWavePulse size={14} style={{ color: "var(--ax-colors-fg-secondary)", flexShrink: 0 }} />,
  failed:      <IconXmark size={14} style={{ color: "var(--ax-colors-fg-danger)", flexShrink: 0 }} />,
};

const STATUS_INTENT: Record<Activity["status"], "success" | "information" | "danger"> = {
  completed: "success", "in-progress": "information", failed: "danger",
};

function ActivityFeed({ vauId, compact = false }: { vauId: string; compact?: boolean }) {
  const activities = VAU_ACTIVITIES[vauId] ?? [];
  if (activities.length === 0) return <Box px="16" py="24"><Text fontSize="sm" color="fg.tertiary">No activity yet.</Text></Box>;
  return (
    <Box display="flex" flexDirection="column">
      {activities.map(a => (
        <Box key={a.id} display="flex" alignItems="start" gap="10" px="16" py="10"
          style={{ borderBottom: "1px solid var(--ax-colors-border-secondary)", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--ax-colors-bg-secondary)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
          <Box style={{ paddingTop: 2, flexShrink: 0 }}>{STATUS_ICON[a.status]}</Box>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text fontSize="sm" fontWeight="500" color="fg.default"
              style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
              {a.label}
            </Text>
            <Box display="flex" alignItems="center" gap="8" style={{ marginTop: 2 }}>
              <Text fontSize="sm" color="fg.tertiary">{a.time}</Text>
              {!compact && <Badge intent="neutral">{a.trigger}</Badge>}
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="end" gap="4" style={{ flexShrink: 0 }}>
            <Badge intent={STATUS_INTENT[a.status]}>{a.status === "in-progress" ? "Running" : a.status.charAt(0).toUpperCase() + a.status.slice(1)}</Badge>
            {a.duration !== "—" && <Text fontSize="sm" color="fg.tertiary">{a.duration}</Text>}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// ── Mini Artifact Card ────────────────────────────────────────────────────────

const MOCK_VIEWED = ["Just now", "2h ago", "Yesterday", "3 days ago", "Last week", "2 weeks ago"];

function MiniArtifactCard({ item, idx }: { item: Deliverable & { thumbnail?: string }; idx: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Box
      bg="bg.default"
      border="1"
      borderColor={hovered ? "border.secondary" : "border.tertiary"}
      rounded="xl"
      overflow="hidden"
      style={{
        cursor: "pointer",
        transition: "border-color 0.15s",
        display: "flex",
        flexDirection: "column",
        height: 240,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      <Box style={{ flex: 1, position: "relative", overflow: "hidden", background: "var(--ax-colors-bg-secondary)" }}>
        {item.thumbnail && (
          <img src={item.thumbnail} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
        )}
        {/* Hover overlay */}
        <Box style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.35)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.25s",
          pointerEvents: "none",
        }} />
      </Box>
      {/* Footer */}
      <Box
        display="flex"
        flexDirection="column"
        gap="8"
        style={{
          flexShrink: 0,
          borderTop: "1px solid var(--ax-colors-border-tertiary)",
          padding: `10px 12px ${hovered ? 10 : 0}px`,
          transition: "padding 0.25s ease",
        }}
      >
        {/* Row 1: title */}
        <Text
          fontSize={hovered ? "lg" : "md"}
          fontWeight="500"
          style={{
            overflow: "hidden",
            textOverflow: hovered ? "clip" : "ellipsis",
            whiteSpace: hovered ? "normal" : "nowrap",
            transition: "font-size 0.2s ease",
            lineHeight: 1.3,
          }}
        >
          {item.title}
        </Text>
        {/* Row 2: type badge + viewed */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Badge intent="neutral">{item.type}</Badge>
          <Text fontSize="sm" color="fg.tertiary" style={{ whiteSpace: "nowrap" }}>
            {MOCK_VIEWED[idx % MOCK_VIEWED.length]}
          </Text>
        </Box>
        {/* Row 3: slides in on hover */}
        <Box style={{
          maxHeight: hovered ? 24 : 0,
          opacity: hovered ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.25s ease, opacity 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 6,
        }}>
          <IconArrowUpRightFromSquare size={12} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
          <Text fontSize="sm" fontWeight="500">View →</Text>
        </Box>
      </Box>
    </Box>
  );
}

// ── Work Item Card (Randy's work) ─────────────────────────────────────────────

const CAPTION_MONO: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 400,
  lineHeight: 1.25,
  letterSpacing: "0.36px",
  textTransform: "uppercase" as const,
};

function WorkItemCard({ item }: { item: typeof RANDY_WORK_ITEMS[number] }) {
  return (
    <Box
      bg="bg.default"
      rounded="lg"
      style={{
        border: "1px solid var(--ax-colors-border-default)",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        height: 240,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <span style={{ ...CAPTION_MONO, background: item.priorityBg, color: item.priorityColor, padding: "2px 6px", borderRadius: 4 }}>
          {item.priority}
        </span>
        <Text fontSize="xs" color="fg.tertiary">{item.time}</Text>
      </Box>
      <Text fontSize="sm" fontWeight="600" color="fg.default">{item.title}</Text>
      <span style={{ ...CAPTION_MONO, color: "var(--ax-colors-fg-tertiary)" }}>{item.source}</span>
      <Text fontSize="sm" color="fg.secondary" style={{ flex: 1 }}>{item.description}</Text>
      <Box display="flex" justifyContent="flex-end">
        <Button appearance="default" size="sm" addonAfter={<IconChevronDown size={12} />}>Review</Button>
      </Box>
    </Box>
  );
}

// ── Main area ──────────────────────────────────────────────────────────────────

const CONTENT_ITEMS = [
  {
    id: "ci-1",
    title: "Q3 Content Brief",
    type: "Content Brief",
    accent: "#d4f0c8",
    accentDark: "#4d8c3a",
    lines: [90, 70, 85, 55, 75],
  },
  {
    id: "ci-2",
    title: "Email Launch Plan",
    type: "Email Plan",
    accent: "#fde8b4",
    accentDark: "var(--ax-colors-fg-warning-strong)",
    lines: [80, 95, 60, 70, 85],
  },
  {
    id: "ci-3",
    title: "Customer Story Draft",
    type: "Draft",
    accent: "#dde6fd",
    accentDark: "#3b5fc0",
    lines: [75, 90, 65, 80, 50],
  },
  {
    id: "ci-4",
    title: "Spring Campaign Overview",
    type: "Overview",
    accent: "#fde0f5",
    accentDark: "#9333a8",
    lines: [95, 70, 80, 60, 90],
  },
];
type ContentItem = typeof CONTENT_ITEMS[number];

const MAX_AVATARS = 6;
function GroupMemberAvatars({ memberList }: { memberList: { name: string; avatar: string }[] }) {
  const [overflowOpen, setOverflowOpen] = React.useState(false);
  const visible = memberList.slice(0, MAX_AVATARS);
  const overflow = memberList.slice(MAX_AVATARS);
  return (
    <Box display="flex" alignItems="center" gap="6" style={{ position: "relative" }}>
      <AvatarGroup>
        {visible.map((m) => (
          <Tooltip key={m.name} content={m.name} delayDuration={300}>
            <span>
              <Avatar name={m.name} src={m.avatar} size="xs" />
            </span>
          </Tooltip>
        ))}
      </AvatarGroup>
      {overflow.length > 0 && (
        <Box
          onMouseEnter={() => setOverflowOpen(true)}
          onMouseLeave={() => setOverflowOpen(false)}
          style={{ position: "relative" }}
        >
          <Box style={{
            width: 24, height: 24, borderRadius: "50%", cursor: "default",
            background: "var(--ax-colors-bg-secondary)",
            border: "1px solid var(--ax-colors-border-secondary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 500, color: "var(--ax-colors-fg-secondary)",
          }}>
            +{overflow.length}
          </Box>
          {overflowOpen && (
            <Box style={{
              position: "absolute", top: "calc(100% + 6px)", left: "50%",
              transform: "translateX(-50%)",
              background: "var(--ax-colors-bg-default)",
              border: "1px solid var(--ax-colors-border-secondary)",
              borderRadius: 8, padding: "6px 0",
              boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
              zIndex: 50, minWidth: 160,
            }}>
              {overflow.map((m) => (
                <Box key={m.name} display="flex" alignItems="center" gap="8"
                  style={{ padding: "5px 12px" }}>
                  <Avatar name={m.name} src={m.avatar} size="xs" />
                  <Text fontSize="sm" color="fg.default" style={{ whiteSpace: "nowrap" }}>{m.name}</Text>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

function IMMain({
  selected,
  threads,
  setThreads,
  onOpenReview,
  quickView,
  onQuickViewDismiss,
  onSelectConversation,
  extraGroups,
  extraChannels,
  manualUnreadConvos,
  setManualUnreadConvos,
  mutedConvos,
  toggleMute,
  dismissedDeliverableIds,
  onDismissDeliverable,
  nameOverrides,
  onRename,
  channelPrivacyOverrides,
  onTogglePrivacy,
  leftConvos,
  onLeave,
  sections,
  onMoveToSection,
  highlightMsgId,
  onHighlightClear,
}: {
  selected: string;
  highlightMsgId?: string | null;
  onHighlightClear?: () => void;
  threads: Record<string, Message[]>;
  setThreads: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>;
  onOpenReview: () => void;
  quickView?: string | null;
  onQuickViewDismiss?: () => void;
  onSelectConversation?: (id: string) => void;
  extraGroups?: GroupItem[];
  extraChannels?: ChannelItem[];
  manualUnreadConvos: Set<string>;
  setManualUnreadConvos: React.Dispatch<React.SetStateAction<Set<string>>>;
  mutedConvos: Set<string>;
  toggleMute: () => void;
  dismissedDeliverableIds: Set<string>;
  onDismissDeliverable: (id: string) => void;
  nameOverrides: Record<string, string>;
  onRename: (id: string, name: string) => void;
  channelPrivacyOverrides: Record<string, boolean>;
  onTogglePrivacy: (id: string) => void;
  leftConvos: Set<string>;
  onLeave: (id: string) => void;
  sections: Section[];
  onMoveToSection: (id: string, sectionId: string) => void;
}) {
  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<ContentItem[]>([]);
  const [activeTab, setActiveTab] = useState("messages");
  const [profileOpen, setProfileOpen] = useState(false);
  const [channelMembersOpen, setChannelMembersOpen] = useState(false);
  const [groupMembersOpen, setGroupMembersOpen] = useState(false);
  const isMuted = mutedConvos.has(selected);

  useEffect(() => {
    if (!highlightMsgId) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`msg-${highlightMsgId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("msg-highlight");
        setTimeout(() => { el.classList.remove("msg-highlight"); onHighlightClear?.(); }, 1800);
      } else {
        onHighlightClear?.();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [highlightMsgId, selected]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTimeFilter, setSearchTimeFilter] = useState("any");
  const [searchAttachmentFilter, setSearchAttachmentFilter] = useState(false);
  const [searchLinkFilter, setSearchLinkFilter] = useState(false);
  // Group participants
  const [addParticipantsOpen, setAddParticipantsOpen] = useState(false);
  const [addParticipantMode, setAddParticipantMode] = useState(false);
  const [groupMemberRemovals, setGroupMemberRemovals] = useState<Record<string, string[]>>({});
  const [participantSearch, setParticipantSearch] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyOption, setHistoryOption] = useState<"none" | "days" | "all">("none");
  const [historyDays, setHistoryDays] = useState(1);
  // File/artifact/agent picker
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [artifactPickerOpen, setArtifactPickerOpen] = useState(false);
  const [agentPickerOpen, setAgentPickerOpen] = useState(false);
  // @mentions
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIdx, setMentionIdx] = useState(0);
  // threads
  const [threadOpen, setThreadOpen] = useState(false);
  const [threadMsg, setThreadMsg] = useState<Message | null>(null);
  const [threadReplies, setThreadReplies] = useState<Record<string, Message[]>>({});
  const [threadReply, setThreadReply] = useState("");
  // pins
  const [pinnedMsgIds, setPinnedMsgIds] = useState<Record<string, string[]>>({});
  // content review panel (opened by clicking a Needs Review card)
  const [contentPanelItemId, setContentPanelItemId] = useState<string | null>(null);
  const imRouter = useRouter();
  // full document review layout (Stride GEO)
  const [docReviewOpen, setDocReviewOpen] = useState(false);
  const [docReviewExpanded, setDocReviewExpanded] = useState(false);
  // notification settings popover
  const [notifGearOpen, setNotifGearOpen] = useState(false);
  const [mentionPref, setMentionPref] = useState<"all" | "mentions-only">("all");
  // VAU ellipsis menu
  const [vauMenuOpen, setVauMenuOpen] = useState(false);
  const vauMenuRef = useRef<HTMLDivElement>(null);
  // DM ellipsis menu
  const [dmMenuOpen, setDmMenuOpen] = useState(false);
  // Shared modals
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [moveToSectionOpen, setMoveToSectionOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  // uploading attachment demo (js = Jane Smith)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({ "up-js-1": 34 });
  const uploadingItems: { id: string; title: string; conversationId: string }[] = [
    { id: "up-js-1", title: "Q4 Campaign Assets.zip", conversationId: "js" },
  ];
  useEffect(() => {
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          if (next[key] < 94) next[key] = Math.min(94, next[key] + Math.random() * 3);
        }
        return next;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeDMS = React.useMemo(() => {
    try {
      const raw = localStorage.getItem("active-vt");
      if (!raw) return DMS;
      const ov = JSON.parse(raw) as { name: string; avatar: string };
      return DMS.map(d => d.id === "bubs" ? { ...d, name: ov.name, avatar: ov.avatar } : d);
    } catch { return DMS; }
  }, []);
  const isVAU = !!activeDMS.find(d => d.id === selected)?.isVAU;

  const isDeactivated = ARCHIVED_DM_IDS.includes(selected ?? "");
  const isChannel = CHANNELS.some(ch => ch.id === selected) || (extraChannels ?? []).some(ch => ch.id === selected);
  const thread = selected ? (threads[selected] ?? ARCHIVED_VAU_THREAD[selected] ?? CHANNEL_THREADS[selected] ?? []) : [];
  const selectedDM = activeDMS.find(d => d.id === selected);
  const selectedGroup = GROUPS.find(g => g.id === selected) ?? (extraGroups ?? []).find(g => g.id === selected);
  const selectedChannel = CHANNELS.find(ch => ch.id === selected) ?? (extraChannels ?? []).find(ch => ch.id === selected);
  const unreadCount = selectedDM?.unread ?? selectedGroup?.unread ?? selectedChannel?.unread ?? 0;
  const isGroupWithVAU = !!selectedGroup && (GROUP_VAU_IDS[selected] ?? []).length > 0;
  const isChannelWithVAU = !!selectedChannel && (CHANNEL_VAU_IDS[selected] ?? []).length > 0;
  const deliverableCount = isVAU && selected
    ? (VAU_DELIVERABLES[selected] ?? []).filter(d => !dismissedDeliverableIds.has(d.id)).length
    : isGroupWithVAU && selected
      ? (GROUP_DELIVERABLES[selected] ?? []).filter(d => !dismissedDeliverableIds.has(d.id)).length
      : isChannelWithVAU && selected
        ? (CHANNEL_DELIVERABLES[selected] ?? []).filter(d => !dismissedDeliverableIds.has(d.id)).length
        : 0;

  // Close panes when switching conversations
  useEffect(() => {
    setActiveTab("messages");
    setSearchOpen(false);
    setSearchQuery("");
    setSearchTimeFilter("any");
    setSearchAttachmentFilter(false);
    setSearchLinkFilter(false);
    setThreadOpen(false);
    setThreadMsg(null);
    setProfileOpen(false);
    setDocReviewOpen(false);
    setDocReviewExpanded(false);
  }, [selected, isVAU, isGroupWithVAU]);

  // Priya demo: open thread + pre-fill reply to show in-progress draft state
  useEffect(() => {
    if (selected === "pr") {
      const prThread = threads["pr"] ?? [];
      const targetMsg = prThread.find(m => m.id === "6");
      if (targetMsg) {
        setThreadMsg(targetMsg);
        setThreadOpen(true);
        setThreadReply("yes, thanks for the heads up!");
      }
    }
  }, [selected]);


  useEffect(() => {
    if (!vauMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (vauMenuRef.current && !vauMenuRef.current.contains(e.target as Node)) {
        setVauMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [vauMenuOpen]);

  const vauMenuEl = vauMenuOpen ? (
    <div style={{
      position: "absolute", top: 36, right: 0, zIndex: 1000,
      minWidth: 220, background: "var(--ax-colors-bg-default)",
      border: "1px solid var(--ax-colors-border-secondary)",
      borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
      padding: "4px",
    }}>
      <div
        role="button" tabIndex={0}
        onClick={() => setVauMenuOpen(false)}
        onKeyDown={e => e.key === "Enter" && setVauMenuOpen(false)}
        style={{ display: "flex", alignItems: "center", padding: "10px 12px", cursor: "pointer", borderRadius: 6 }}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--ax-colors-bg-secondary)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <Text>Manage virtual teammate</Text>
      </div>
      {!isDeactivated && (
        <>
          <div
            role="button" tabIndex={0}
            onClick={() => { toggleMute(); setVauMenuOpen(false); }}
            onKeyDown={e => e.key === "Enter" && (e.currentTarget as HTMLDivElement).click()}
            style={{ display: "flex", alignItems: "center", padding: "10px 12px", cursor: "pointer", borderRadius: 6 }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--ax-colors-bg-secondary)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <Text>{isMuted ? "Unmute conversation" : "Mute conversation"}</Text>
          </div>
          <div
            role="button" tabIndex={0}
            onClick={() => { setMoveToSectionOpen(true); setVauMenuOpen(false); }}
            onKeyDown={e => e.key === "Enter" && (e.currentTarget as HTMLDivElement).click()}
            style={{ display: "flex", alignItems: "center", padding: "10px 12px", cursor: "pointer", borderRadius: 6 }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--ax-colors-bg-secondary)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <Text>Move to another section</Text>
          </div>
          <div
            role="button" tabIndex={0}
            onClick={() => { setManualUnreadConvos(prev => { const next = new Set(prev); next.add(selected); return next; }); setVauMenuOpen(false); }}
            onKeyDown={e => e.key === "Enter" && (e.currentTarget as HTMLDivElement).click()}
            style={{ display: "flex", alignItems: "center", padding: "10px 12px", cursor: "pointer", borderRadius: 6 }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--ax-colors-bg-secondary)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <Text>Mark as unread</Text>
          </div>
        </>
      )}
    </div>
  ) : null;

  const filteredMentions = MENTION_CANDIDATES.filter(m => m.name.toLowerCase().startsWith(mentionQuery));

  const notifMenuContent = (() => {
    const notifPref = isMuted ? "muted" : mentionPref;
    const options = [
      { value: "all",           label: "All new posts",  desc: "Messages and threads you follow",                    Icon: IconBell      },
      { value: "mentions-only", label: "Just @mentions", desc: "@you, @channel, @here",                             Icon: IconBell      },
      { value: "muted",         label: "Mute and hide",  desc: "Only badge the channel when someone @mentions you",  Icon: IconBellSlash },
    ];
    return (
      <>
        <div style={{ padding: "6px 12px 8px" }}>
          <span style={{ fontSize: 13, color: "var(--ax-colors-fg-tertiary)" }}>Notify you about...</span>
        </div>
        {options.map(({ value, label, desc, Icon }) => {
          const isSelected = notifPref === value;
          return (
            <div
              key={value}
              role="button" tabIndex={0}
              onClick={() => {
                if (value === "muted") { if (!isMuted) toggleMute(); }
                else { if (isMuted) toggleMute(); setMentionPref(value as "all" | "mentions-only"); }
                setNotifModalOpen(false);
              }}
              onKeyDown={e => e.key === "Enter" && (e.currentTarget as HTMLDivElement).click()}
              style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "6px 12px", cursor: "pointer", borderRadius: 6 }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--ax-colors-bg-secondary)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ width: 16, flexShrink: 0, paddingTop: 3 }}>
                {isSelected && <IconCheck style={{ width: 13, height: 13, color: "var(--ax-colors-fg-default)" }} />}
              </div>
              <Icon style={{ width: 16, height: 16, color: "var(--ax-colors-fg-secondary)", flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: isSelected ? 500 : 400, color: "var(--ax-colors-fg-default)" }}>{label}</div>
                <div style={{ fontSize: 12, color: "var(--ax-colors-fg-tertiary)", marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          );
        })}
      </>
    );
  })();

  const insertMention = (name: string) => {
    const lastAt = message.lastIndexOf('@');
    const newMsg = message.slice(0, lastAt) + `@${name} ` + message.slice(lastAt).replace(/@\S*/, '');
    setMessage(newMsg);
    setMentionOpen(false);
  };

  const sendThreadReply = () => {
    if (!threadReply.trim() || !threadMsg) return;
    const reply: Message = {
      id: Date.now().toString(), from: 'user',
      senderAvatar: 'https://i.pravatar.cc/150?img=24',
      text: threadReply.trim(),
    };
    const parentId = threadMsg.id;
    setThreadReplies(prev => ({ ...prev, [parentId]: [...(prev[parentId] ?? []), reply] }));
    setThreads(prev => ({
      ...prev,
      [selected]: prev[selected].map(m =>
        m.id === parentId ? { ...m, threadCount: (m.threadCount ?? 0) + 1 } : m
      ),
    }));
    setThreadReply("");
  };

  // Auto-focus search input when opened
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  const conversationName =
    activeDMS.find((d) => d.id === selected)?.name ||
    GROUPS.find((g) => g.id === selected)?.name ||
    (extraGroups ?? []).find((g) => g.id === selected)?.name ||
    CHANNELS.find((ch) => ch.id === selected)?.name;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length, typing]);

  const handleSend = () => {
    if (!message.trim() && pendingAttachments.length === 0) return;
    if (!selected) return;

    const msgs: Message[] = [];
    pendingAttachments.forEach((item, i) => {
      msgs.push({ id: (Date.now() + i).toString(), from: "user", type: "attachment", senderAvatar: "https://i.pravatar.cc/150?img=24", text: "", attachment: { title: item.title, file: item.type } });
    });
    if (message.trim()) {
      msgs.push({ id: (Date.now() + pendingAttachments.length).toString(), from: "user", senderAvatar: "https://i.pravatar.cc/150?img=24", text: message.trim() });
    }

    setThreads(prev => ({ ...prev, [selected]: [...(prev[selected] ?? []), ...msgs] }));
    setMessage("");
    setPendingAttachments([]);
    setTyping(true);

    setTimeout(() => {
      const responder = RESPONDERS[selected];
      const replyMsg: Message = {
        id: (Date.now() + 1).toString(),
        from: responder?.from ?? "human",
        senderName: responder?.name,
        senderAvatar: responder?.avatar,
        senderColor: responder?.color,
        text: getReply(selected),
      };
      setThreads(prev => ({ ...prev, [selected]: [...(prev[selected] ?? []), replyMsg] }));
      setTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  if (quickView) {
    const QUICK_VIEW_META = {
      unreads:     { label: "Unreads",      icon: <IconMarkEmailUnread size={16} />, desc: "Conversations with unread messages" },
      threads:     { label: "Threads",      icon: <IconComments size={16} />,    desc: "Messages with active threads" },
      mentions:    { label: "Mentions",     icon: <IconAt size={16} />,          desc: "Messages where you were @mentioned" },
      needsreview: { label: "Needs Review", icon: <IconCircleCheck size={16} />, desc: "Deliverables waiting for your review" },
    } as const;
    const meta = QUICK_VIEW_META[quickView as keyof typeof QUICK_VIEW_META];

    const unreadDMs = activeDMS.filter(d => (d.unread ?? 0) > 0 || manualUnreadConvos.has(d.id));
    const unreadGroups = GROUPS.filter(g => (g.unread ?? 0) > 0 || manualUnreadConvos.has(g.id));
    const unreadConvos: { id: string; name: string; avatar?: string; emoji?: string; isGroup?: boolean; status?: string; isVAU?: boolean }[] = [
      ...unreadDMs.map(d => ({ id: d.id, name: d.name, avatar: d.avatar, status: d.status, isVAU: d.isVAU })),
      ...unreadGroups.map(g => ({ id: g.id, name: g.name, emoji: g.emoji, isGroup: true })),
    ];
    const allMessages = Object.entries(threads).flatMap(([convId, msgs]) => msgs.map(m => ({ ...m, convId })));
    const threadedMessages = allMessages.filter(m => (m.threadCount ?? 0) > 0);
    const mentionMessages = allMessages.filter(m => m.text?.includes("@"));

    return (
      <Box display="flex" flexDirection="column" style={{ flex: 1, height: "100%", background: "var(--ax-colors-bg-default)", minWidth: 0 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap="10" px="20"
          style={{ height: 56, borderBottom: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0 }}>
          <Box style={{ color: "var(--ax-colors-fg-secondary)" }}>{meta?.icon}</Box>
          <Text fontSize="lg" fontWeight="500" color="fg.default">{meta?.label}</Text>
        </Box>

        <Box display="flex" flexDirection="column" style={{ flex: 1, overflowY: "auto" }} px="16" py="16" gap="4">

          {/* UNREADS */}
          {quickView === "unreads" && (
            unreadConvos.length === 0
              ? <Box py="40" style={{ textAlign: "center" }}><Text color="fg.tertiary">You're all caught up 🎉</Text></Box>
              : unreadConvos.map(conv => {
                  const lastMsg = (threads[conv.id] ?? []).slice(-1)[0];
                  const isHitl = lastMsg?.type === "hitl";
                  const lastSender = lastMsg?.from === "user"
                    ? "You"
                    : conv.isGroup ? (lastMsg?.senderName ?? conv.name) : null;
                  const previewText = isHitl
                    ? `${lastMsg?.senderName ?? conv.name} sent an item that needs your approval`
                    : (lastMsg?.text?.slice(0, 60) ?? "No messages yet");
                  return (
                    <Box key={conv.id} display="flex" alignItems="center" gap="12" px="12" py="12" rounded="lg"
                      style={{ cursor: "pointer", background: "var(--ax-colors-bg-default)", border: "1px solid var(--ax-colors-border-secondary)", marginBottom: 6 }}
                      onClick={() => onSelectConversation?.(conv.id)}
                    >
                      <Box style={{ position: "relative", flexShrink: 0, display: "inline-flex" }}>
                        {conv.isGroup ? (
                          <Box style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <IconUserGroup size={18} style={{ color: "var(--ax-colors-fg-secondary)" }} />
                          </Box>
                        ) : conv.avatar ? (
                          <Avatar name={conv.name} src={conv.avatar} size="md" />
                        ) : (
                          <Box style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: "var(--ax-colors-fg-secondary)", flexShrink: 0 }}>
                            {conv.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                          </Box>
                        )}
                      </Box>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Box display="flex" alignItems="center" gap="8">
                          <Text fontSize="md" fontWeight="600" color="fg.default">{conv.name}</Text>
                          {conv.isVAU && <Badge intent="information" style={{ flexShrink: 0 }}>Virtual</Badge>}
                        </Box>
                        <Text fontSize="md" color="fg.secondary" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {!isHitl && lastSender && <Text asChild fontSize="md" fontWeight="500" color="fg.default"><span>{lastSender}: </span></Text>}
                          {previewText}
                        </Text>
                      </Box>
                      <Box style={UNREAD_DOT_STYLE} />
                    </Box>
                  );
                })
          )}

          {/* THREADS */}
          {quickView === "threads" && (
            threadedMessages.length === 0
              ? <Box py="40" style={{ textAlign: "center" }}><Text color="fg.tertiary">No active threads yet</Text></Box>
              : threadedMessages.map((msg, i) => {
                  const dm = activeDMS.find(d => d.id === msg.convId);
                  const group = GROUPS.find(g => g.id === msg.convId);
                  const convName = dm?.name ?? group?.name ?? msg.convId;
                  const senderName = msg.senderName ?? (msg.from === "user" ? "Erika" : convName);
                  const senderAvatar = msg.senderAvatar ?? (msg.from === "user" ? "https://i.pravatar.cc/150?img=24" : "");
                  return (
                    <Box key={`thread-${msg.convId}-${msg.id}-${i}`} display="flex" flexDirection="column" gap="8" px="12" py="12" rounded="lg"
                      style={{ cursor: "pointer", border: "1px solid var(--ax-colors-border-secondary)", background: "var(--ax-colors-bg-default)", marginBottom: 6 }}
                      onClick={() => onSelectConversation?.(msg.convId)}
                    >
                      <Box display="flex" alignItems="start" gap="10">
                        <Avatar name={senderName} src={senderAvatar} size="sm" style={{ flexShrink: 0, marginTop: 2 }} />
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Box display="flex" alignItems="center" gap="6" style={{ marginBottom: 2 }}>
                            <Text fontSize="md" fontWeight="500" color="fg.default">{senderName}</Text>
                            <Text fontSize="sm" color="fg.tertiary">in {convName}</Text>
                          </Box>
                          <Text fontSize="md" color="fg.secondary" style={{ lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {msg.text?.slice(0, 90)}
                          </Text>
                        </Box>
                      </Box>
                      <Box style={{ paddingLeft: 30 }}>
                        <Button size="md" appearance="subtle" icon={<IconMessageLines />}>
                          {msg.threadCount} {(msg.threadCount ?? 0) === 1 ? "reply" : "replies"}
                        </Button>
                      </Box>
                    </Box>
                  );
                })
          )}

          {/* MENTIONS */}
          {quickView === "mentions" && (
            mentionMessages.length === 0
              ? <Box py="40" style={{ textAlign: "center" }}><Text color="fg.tertiary">No mentions yet</Text></Box>
              : mentionMessages.map((msg, i) => {
                  const dm = activeDMS.find(d => d.id === msg.convId);
                  const group = GROUPS.find(g => g.id === msg.convId);
                  const convName = dm?.name ?? group?.name ?? msg.convId;
                  const senderName = msg.senderName ?? (msg.from === "user" ? "Erika" : convName);
                  const senderAvatar = msg.senderAvatar ?? (msg.from === "user" ? "https://i.pravatar.cc/150?img=24" : "");
                  return (
                    <Box key={`${msg.convId}-${i}`} display="flex" gap="10" px="12" py="12" rounded="lg"
                      style={{ cursor: "pointer", border: "1px solid var(--ax-colors-border-secondary)", marginBottom: 6 }}
                      onClick={() => onSelectConversation?.(msg.convId)}
                    >
                      <Avatar name={senderName} src={senderAvatar} size="sm" style={{ flexShrink: 0 }} />
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Box display="flex" alignItems="center" gap="6">
                          <Text fontSize="md" fontWeight="500" color="fg.default">{senderName}</Text>
                          <Text fontSize="sm" color="fg.tertiary">in {convName}</Text>
                        </Box>
                        <Text fontSize="md" color="fg.secondary" style={{ lineHeight: 1.5, marginTop: 2 }}>
                          {msg.text?.split(/(@\w+)/g).map((part, j) =>
                            part.startsWith("@")
                              ? <span key={j} style={{ color: "var(--ax-colors-fg-link-default)", fontWeight: 500 }}>{part}</span>
                              : part
                          )}
                        </Text>
                      </Box>
                    </Box>
                  );
                })
          )}

          {/* NEEDS REVIEW */}
          {quickView === "needsreview" && (() => {
            // Group all deliverables by VAU
            const grouped = new Map<string, { name: string; avatar: string; items: Array<{ id: string; title: string; type: string; convId: string }> }>();
            Object.entries(VAU_DELIVERABLES).forEach(([vauId, items]) => {
              const dm = activeDMS.find(d => d.id === vauId);
              if (!dm) return;
              const filtered = items.filter(d => !dismissedDeliverableIds.has(d.id));
              if (!filtered.length) return;
              const entry = grouped.get(vauId) ?? { name: dm.name, avatar: dm.avatar ?? "", items: [] };
              filtered.forEach(d => entry.items.push({ ...d, convId: vauId }));
              grouped.set(vauId, entry);
            });
            Object.entries(GROUP_DELIVERABLES).forEach(([groupId, items]) => {
              items.filter(d => !dismissedDeliverableIds.has(d.id)).forEach(d => {
                const entry = grouped.get(d.vauId) ?? { name: d.vauName, avatar: d.vauAvatar, items: [] };
                entry.items.push({ ...d, convId: groupId });
                grouped.set(d.vauId, entry);
              });
            });
            if (grouped.size === 0) return <Box py="40" style={{ textAlign: "center" }}><Text color="fg.tertiary">Nothing to review 🎉</Text></Box>;
            return [...grouped.entries()].map(([vauId, group]) => (
              <Box key={vauId} display="flex" flexDirection="column" gap="4" mb="10">
                {/* VAU header */}
                <Box display="flex" alignItems="center" gap="6" px="2">
                  <Avatar name={group.name} src={group.avatar} size="xs" style={{ flexShrink: 0 }} />
                  <Text fontSize="sm" color="fg.secondary">
                    <Text asChild fontSize="sm" fontWeight="500" color="fg.default"><span>{group.name}</span></Text> requests review for:
                  </Text>
                </Box>
                {/* Items */}
                {group.items.map(item => (
                  <Box key={item.id} rounded="lg"
                    style={{ border: "1px solid var(--ax-colors-border-default)", background: "var(--ax-colors-bg-default)", cursor: "pointer" }}
                    onClick={() => { onSelectConversation?.(item.convId); setActiveTab("artifacts"); }}
                  >
                    <Box px="12" py="10" display="flex" alignItems="center" gap="10">
                      <Box rounded="md" style={{ width: 32, height: 32, background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <IconFileLines style={{ width: 16, height: 16, color: "var(--ax-colors-fg-secondary)" }} />
                      </Box>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text fontSize="sm" fontWeight="500" color="fg.default" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{item.title}</Text>
                        <Text fontSize="sm" color="fg.tertiary">{item.type}</Text>
                      </Box>
                      <Button appearance="primary" size="sm" onClick={e => {
                        e.stopPropagation();
                        onSelectConversation?.(item.convId);
                        setActiveTab("artifacts");
                        if (item.convId === "sg") setDocReviewOpen(true);
                        else setContentPanelItemId(item.id);
                      }}>Review</Button>
                      <Button appearance="default" size="sm" onClick={e => { e.stopPropagation(); onDismissDeliverable(item.id); }}>Dismiss</Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            ));
          })()}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="row"
      style={{ flex: 1, height: "100%", background: "var(--ax-colors-bg-default)", minWidth: 0, overflow: "hidden", position: "relative" }}
    >
      {/* ── Main chat column ─────────────────────────────────────────── */}
      <Box display="flex" flexDirection="column" style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>

      {/* ── Conversation header ── */}
      {selected && (() => {
        const dm = activeDMS.find(d => d.id === selected);
        const group = selectedGroup;
        const channel = selectedChannel;
        return (
          <Box display="flex" alignItems="center" gap="10" px="20"
            style={{ minHeight: 56, borderBottom: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0 }}>
            {dm ? (
              <>
                <Box style={{ position: "relative", flexShrink: 0, display: "inline-flex" }}>
                  {dm.avatar ? (
                    <AvatarWithHoverCard name={dm.name} src={dm.avatar} size="md" />
                  ) : (
                    <Box style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: "var(--ax-colors-fg-secondary)", flexShrink: 0 }}>
                      {dm.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                    </Box>
                  )}
                  {dm.status && (
                    dm.status === "ooo"
                      ? <OOOIndicator size={10} outerBorderColor="var(--ax-colors-bg-default)" />
                      : <Box rounded="full" style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, background: PRESENCE_COLOR[dm.status], border: "2px solid var(--ax-colors-bg-default)" }} />
                  )}
                </Box>
                <Box display="flex" flexDirection="column">
                  <Box display="flex" alignItems="center" gap="8">
                    <Text fontWeight="600" fontSize="lg" color="fg.default"
                      onClick={() => setProfileOpen(v => !v)}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                    >{dm.name}</Text>
                    {isMuted && <IconBellSlash size={14} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />}
                    {dm.isVAU && (
                      isDeactivated
                        ? <Badge intent="neutral" style={{ flexShrink: 0 }}>Deactivated</Badge>
                        : <Badge intent="information" style={{ flexShrink: 0 }}>Virtual</Badge>
                    )}
                  </Box>
                  {dm.isVAU && (
                    <Text fontSize="sm" color="fg.tertiary">
                      {isDeactivated ? "This VAU is no longer active" : (dm.role ?? (dm.status === "active" ? "Available" : dm.status === "ooo" ? "Out of Office" : "Offline"))}
                    </Text>
                  )}
                </Box>
                <Box display="flex" alignItems="center" gap="4" style={{ marginLeft: "auto" }}>
                  <Button appearance="subtle" size="lg"
                    icon={<IconSearch style={{ width: 20, height: 20 }} />}
                    aria-label="Search conversation"
                    onClick={() => setSearchOpen(true)} />
                  {!dm.isVAU && !isDeactivated && (
                    <Menu
                      options={[
                        { label: isMuted ? "Unmute conversation" : "Mute conversation", execute: () => { toggleMute(); setDmMenuOpen(false); } },
                        { label: "Move to another section", execute: () => { setMoveToSectionOpen(true); setDmMenuOpen(false); } },
                        { label: "Mark as unread", execute: () => { setManualUnreadConvos(prev => { const next = new Set(prev); next.add(selected); return next; }); setDmMenuOpen(false); } },
                      ]}
                      open={dmMenuOpen}
                      onOpenChange={setDmMenuOpen}
                    >
                      <MenuTrigger asChild>
                        <Button appearance="subtle" size="lg"
                          icon={<IconEllipsisSolid style={{ width: 20, height: 20 }} />}
                          aria-label="More options" />
                      </MenuTrigger>
                      <MenuContent align="end" />
                    </Menu>
                  )}
                  {dm.isVAU && (
                    <div ref={vauMenuRef} style={{ position: "relative" }}>
                      <Button appearance="subtle" size="lg"
                        icon={<IconEllipsisSolid style={{ width: 20, height: 20 }} />}
                        aria-label="More options"
                        onClick={() => setVauMenuOpen(v => !v)} />
                      {vauMenuEl}
                    </div>
                  )}
                </Box>
              </>
            ) : group ? (
              <>
                <Box style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <IconUserGroup size={18} style={{ color: "var(--ax-colors-fg-secondary)" }} />
                </Box>
                <Box display="flex" flexDirection="column" style={{ flex: 1, minWidth: 0, paddingTop: 8, paddingBottom: 8 }}>
                  <Box display="flex" alignItems="center" gap="8">
                    <Text fontWeight="600" fontSize="lg" color="fg.default"
                    >{nameOverrides[selected] ?? group.name}</Text>
                    {isMuted && <IconBellSlash size={14} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />}
                  </Box>
                  <Button
                    appearance="default"
                    size="md"
                    icon={
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {(group.memberList ?? []).slice(0, 3).map((m, i) => (
                          <div key={m.name} style={{ marginLeft: i > 0 ? -5 : 0, borderRadius: "50%", border: "1.5px solid var(--ax-colors-bg-default)", overflow: "hidden", width: 20, height: 20, flexShrink: 0 }}>
                            {m.avatar
                              ? <img src={m.avatar} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              : <div style={{ width: "100%", height: "100%", background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "var(--ax-colors-fg-secondary)" }}>{m.name[0]}</div>
                            }
                          </div>
                        ))}
                      </div>
                    }
                    onClick={() => setGroupMembersOpen(true)}
                    style={{ marginTop: 4, alignSelf: "flex-start" }}
                  >
                    {group.memberList ? `${group.memberList.length} members` : group.members}
                  </Button>
                </Box>
                <Box display="flex" alignItems="center" gap="4" style={{ marginLeft: "auto" }}>
                  <Button appearance="subtle" size="lg"
                    icon={<IconSearch style={{ width: 20, height: 20 }} />}
                    aria-label="Search conversation"
                    onClick={() => setSearchOpen(true)} />
                  <Menu
                    options={[
                      { label: "Notification settings", execute: () => setNotifModalOpen(true) },
                      { label: "Rename group", execute: () => { setRenameValue(nameOverrides[selected] ?? group.name); setRenameDialogOpen(true); } },
                      { label: "Mark as unread", execute: () => setManualUnreadConvos(prev => { const next = new Set(prev); next.add(selected); return next; }) },
                      { label: "Move to another section", execute: () => setMoveToSectionOpen(true) },
                      { label: "Leave group", execute: () => setLeaveConfirmOpen(true), intent: "danger", group: { label: "", hidden: true, separator: true } },
                    ]}
                  >
                    <MenuTrigger asChild>
                      <Button appearance="subtle" size="lg"
                        icon={<IconEllipsisSolid style={{ width: 20, height: 20 }} />}
                        aria-label="More options" />
                    </MenuTrigger>
                    <MenuContent align="end" />
                  </Menu>
                </Box>
              </>
            ) : channel ? (
              <>
                <Avatar name={(nameOverrides[selected] ?? channel.name).replace(/^#/, "")} size="md" />
                <Box display="flex" flexDirection="column" style={{ flex: 1, minWidth: 0, paddingTop: 6, paddingBottom: 6 }}>
                  <Box display="flex" alignItems="center" gap="8">
                    <Text fontWeight="600" fontSize="lg" color="fg.default"
                    >{nameOverrides[selected] ?? channel.name}</Text>
                    {(channelPrivacyOverrides[selected] ?? channel.isPrivate) && <IconLock size={14} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />}
                    {isMuted && <IconBellSlash size={14} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />}
                  </Box>
                  <Button
                    appearance="default"
                    size="md"
                    icon={
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {(channel.memberList ?? []).slice(0, 3).map((m, i) => (
                          <div key={m.name} style={{ marginLeft: i > 0 ? -5 : 0, borderRadius: "50%", border: "1.5px solid var(--ax-colors-bg-default)", overflow: "hidden", width: 20, height: 20, flexShrink: 0 }}>
                            {m.avatar
                              ? <img src={m.avatar} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              : <div style={{ width: "100%", height: "100%", background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "var(--ax-colors-fg-secondary)" }}>{m.name[0]}</div>
                            }
                          </div>
                        ))}
                      </div>
                    }
                    onClick={() => setChannelMembersOpen(true)}
                    style={{ marginTop: 4, alignSelf: "flex-start" }}
                  >
                    {channel.memberList ? `${channel.memberList.length} members` : "0 members"}
                  </Button>
                </Box>
                <Box display="flex" alignItems="center" gap="4" style={{ marginLeft: "auto" }}>
                  <Button appearance="subtle" size="lg"
                    icon={<IconSearch style={{ width: 20, height: 20 }} />}
                    aria-label="Search conversation"
                    onClick={() => setSearchOpen(true)} />
                  <Menu
                    options={[
                      { label: "Notification settings", execute: () => setNotifModalOpen(true) },
                      { label: "Rename", execute: () => { setRenameValue(nameOverrides[selected] ?? channel.name); setRenameDialogOpen(true); } },
                      { label: "Mark as unread", execute: () => setManualUnreadConvos(prev => { const next = new Set(prev); next.add(selected); return next; }) },
                      { label: "Move to another section", execute: () => setMoveToSectionOpen(true) },
                      { label: (channelPrivacyOverrides[selected] ?? channel.isPrivate) ? "Make public" : "Make private", execute: () => onTogglePrivacy(selected) },
                      { label: "Leave channel", execute: () => setLeaveConfirmOpen(true), intent: "danger", group: { label: "", hidden: true, separator: true } },
                    ]}
                  >
                    <MenuTrigger asChild>
                      <Button appearance="subtle" size="lg"
                        icon={<IconEllipsisSolid style={{ width: 20, height: 20 }} />}
                        aria-label="More options" />
                    </MenuTrigger>
                    <MenuContent align="end" />
                  </Menu>
                </Box>
              </>
            ) : null}
          </Box>
        );
      })()}

      {/* Combined bar: tabs left, actions right */}
      <Box display="flex" flexDirection="column" style={{ flex: 1, minHeight: 0 }}>
        <Box display="flex" flexDirection="column" style={{ flex: 1, minHeight: 0 }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <Box
              display="flex"
              alignItems="center"
              px="20"
              style={{ flexShrink: 0, height: 52, borderBottom: searchOpen ? "none" : "1px solid var(--ax-colors-border-secondary)" }}
            >
              {searchOpen ? (
                <>
                  <IconSearch style={{ width: 16, height: 16, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0, marginRight: 8 }} />
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); } }}
                    placeholder="Search in this conversation…"
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontFamily: "inherit",
                      fontSize: 14,
                      color: "var(--ax-colors-fg-default)",
                    }}
                  />
                  <Button
                    appearance="subtle"
                    size="sm"
                    onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  >Cancel</Button>
                </>
              ) : (
                <>
              <TabsList style={{ alignSelf: "flex-end", borderBottom: "none" }}>
                <TabsTrigger value="messages">
                  <Box asChild display="inline-flex" alignItems="center" gap="6">
                    <span>
                      Messages
                      {unreadCount > 0 && selected && (
                        <Badge intent="information">{unreadCount}</Badge>
                      )}
                    </span>
                  </Box>
                </TabsTrigger>
                <TabsTrigger value="artifacts">
                  <Box asChild display="inline-flex" alignItems="center" gap="6">
                    <span>
                      Artifacts
                      {(isVAU || isGroupWithVAU) && deliverableCount > 0 && <Badge intent="information">{deliverableCount}</Badge>}
                    </span>
                  </Box>
                </TabsTrigger>
                <TabsTrigger value="pins">
                  <Box asChild display="inline-flex" alignItems="center" gap="6">
                    <span>
                      Pins
                      {selected && (pinnedMsgIds[selected]?.length ?? 0) > 0 && (
                        <Badge intent="information">{pinnedMsgIds[selected].length}</Badge>
                      )}
                    </span>
                  </Box>
                </TabsTrigger>
              </TabsList>
                </>
              )}
            </Box>
            {/* Filter row — only visible when search is open */}
            {searchOpen && (
              <Box display="flex" alignItems="center" gap="16" px="20"
                style={{ height: 44, borderBottom: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0 }}>
                <select value={searchTimeFilter} onChange={e => setSearchTimeFilter(e.target.value)}
                  style={{ fontFamily: "inherit", fontSize: 13, border: "0.5px solid var(--ax-colors-border-secondary)", borderRadius: 6, padding: "4px 8px", background: "var(--ax-colors-bg-default)", color: "var(--ax-colors-fg-default)", cursor: "pointer" }}>
                  <option value="any">Any time</option>
                  <option value="today">Today</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                </select>
                <Box display="flex" alignItems="center" gap="6" style={{ cursor: "pointer" }} onClick={() => setSearchAttachmentFilter(v => !v)}>
                  <Checkbox checked={searchAttachmentFilter} onCheckedChange={v => setSearchAttachmentFilter(v === true)} />
                  <Text fontSize="sm" color="fg.tertiary">attachment</Text>
                </Box>
                <Box display="flex" alignItems="center" gap="6" style={{ cursor: "pointer" }} onClick={() => setSearchLinkFilter(v => !v)}>
                  <Checkbox checked={searchLinkFilter} onCheckedChange={v => setSearchLinkFilter(v === true)} />
                  <Text fontSize="sm" color="fg.tertiary">link</Text>
                </Box>
              </Box>
            )}

            {/* Messages tab */}
            <TabsContent value="messages" style={{ flex: 1, minHeight: 0, display: activeTab === "messages" ? "flex" : "none", flexDirection: "column", overflow: "hidden" }}>
              {searchOpen ? (
                <Box display="flex" flexDirection="column" style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
                  {searchQuery.trim() === "" ? (
                    <Text fontSize="sm" color="fg.tertiary">Type to search messages in this conversation</Text>
                  ) : (() => {
                    const q = searchQuery.toLowerCase();
                    const results = thread.filter(m => m.text && typeof m.text === "string" && m.text.toLowerCase().includes(q) && m.from !== "system");
                    if (results.length === 0) return <Text fontSize="sm" color="fg.tertiary">No results for &ldquo;{searchQuery}&rdquo;</Text>;
                    const convName = selectedDM?.name ?? selectedGroup?.name ?? selectedChannel?.name ?? "";
                    return (
                      <>
                        <Text fontSize="sm" color="fg.tertiary" style={{ marginBottom: 12 }}>{results.length} result{results.length !== 1 ? "s" : ""}</Text>
                        {results.map(msg => {
                          const senderDM = activeDMS.find(d => d.id === msg.from);
                          const senderName = msg.from === "user" ? "You" : (senderDM?.name ?? convName ?? msg.from);
                          const avatarSrc = senderDM?.avatar;
                          const lo = (msg.text as string).toLowerCase().indexOf(q);
                          const before = lo >= 0 ? (msg.text as string).slice(0, lo) : (msg.text as string);
                          const matchText = lo >= 0 ? (msg.text as string).slice(lo, lo + q.length) : "";
                          const afterText = lo >= 0 ? (msg.text as string).slice(lo + q.length) : "";
                          return (
                            <Box key={msg.id} display="flex" gap="12" px="12" py="10"
                              style={{ borderRadius: 8, cursor: "pointer", marginBottom: 2 }}
                              onMouseEnter={e => (e.currentTarget.style.background = "var(--ax-colors-bg-secondary)")}
                              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                              onClick={() => { setSearchOpen(false); setTimeout(() => { const el = document.getElementById(`msg-${msg.id}`); if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.classList.add("msg-highlight"); setTimeout(() => el.classList.remove("msg-highlight"), 1800); } }, 120); }}>
                              {avatarSrc
                                ? <img src={avatarSrc} alt={senderName} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                                : <Box style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: "var(--ax-colors-fg-secondary)", flexShrink: 0 }}>{senderName[0]}</Box>
                              }
                              <Box style={{ flex: 1, minWidth: 0 }}>
                                <Box display="flex" alignItems="center" gap="8" style={{ marginBottom: 2 }}>
                                  <Text fontSize="sm" fontWeight="500" color="fg.default">{senderName}</Text>
                                  <Text fontSize="xs" color="fg.tertiary">{"time" in msg ? String(msg.time) : ""}</Text>
                                </Box>
                                <Text fontSize="sm" color="fg.tertiary" style={{ lineHeight: 1.5 }}>
                                  {before}<mark style={{ background: "var(--ax-colors-bg-success-subtle)", color: "var(--ax-colors-fg-success)", fontWeight: 600, padding: "0 2px", borderRadius: 2, fontStyle: "normal" }}>{matchText}</mark>{afterText}
                                </Text>
                              </Box>
                            </Box>
                          );
                        })}
                      </>
                    );
                  })()}
                </Box>
              ) : thread.length > 0 && (
                <Box
                  display="flex"
                  flexDirection="column"
                  gap="24"
                  px="20"
                  pt="16"
                  pb="24"
                  style={{ overflowY: "auto", flex: 1, minHeight: 0 }}
                >
                  {thread.map((msg, idx) =>
                    msg.from === "system" ? (
                      <Box key={msg.id} id={`msg-${msg.id}`} display="flex" alignItems="center" gap="12" px="16" py="4">
                        <Box style={{ flex: 1, height: 1, background: "var(--ax-colors-border-secondary)" }} />
                        <Box display="flex" alignItems="center" gap="6">
                          <IconUserPlus size={13} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
                          <Text fontSize="xs" color="fg.tertiary" style={{ whiteSpace: "nowrap" }}>{msg.text}</Text>
                        </Box>
                        <Box style={{ flex: 1, height: 1, background: "var(--ax-colors-border-secondary)" }} />
                      </Box>
                    ) : msg.agentCard ? (
                      <Box key={msg.id} id={`msg-${msg.id}`} display="flex" justifyContent="flex-end" pl="32">
                        <AgentCardMessage agent={msg.agentCard} />
                      </Box>
                    ) : msg.type === "attachment" ? (
                      <Box key={msg.id} id={`msg-${msg.id}`} display="flex" gap="8" alignItems="start" justifyContent="flex-end" pl="32">
                        <Box display="flex" flexDirection="column" style={{ alignItems: "flex-end" }}>
                          <Box
                            onClick={onOpenReview}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              background: "var(--ax-colors-bg-default, white)",
                              border: "1px solid var(--ax-colors-border-default, #d8e4cb)",
                              borderRadius: 12,
                              padding: "10px 12px",
                              cursor: "pointer",
                              maxWidth: 240,
                              minWidth: 180,
                            }}
                          >
                            <Box
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                background: "var(--ax-colors-bg-secondary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <IconFileLines style={{ width: 18, height: 18, color: "var(--ax-colors-fg-secondary)" }} />
                            </Box>
                            <Box style={{ minWidth: 0 }}>
                              <Text
                                fontSize="sm"
                                fontWeight="500"
                                color="fg.default"
                                style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}
                              >
                                {msg.attachment!.title}
                              </Text>
                              <Text fontSize="sm" color="fg.tertiary" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                                {msg.attachment!.file}
                              </Text>
                            </Box>
                          </Box>
                          <Text fontSize="sm" color="fg.tertiary" style={{ marginTop: 2 }}>{getMockTime(idx)}</Text>
                        </Box>
                        <Box pt="10" style={{ flexShrink: 0 }}>
                          <AvatarWithHoverCard name="Me" src={msg.senderAvatar} size="md" />
                        </Box>
                      </Box>
                    ) : msg.type === "hitl" ? (
                      <Box key={msg.id} id={`msg-${msg.id}`} display="flex" gap="12" alignItems="start" py="4">
                        <Box pt="4" style={{ flexShrink: 0 }}>
                          <AvatarWithHoverCard name={msg.senderName ?? ""} src={msg.senderAvatar} size="md" />
                        </Box>
                        <Box display="flex" flexDirection="column" gap="4">
                          <Box display="flex" gap="8" style={{ alignItems: "baseline", marginBottom: 2 }}>
                            {msg.senderName && <Text fontSize="md" fontWeight="500" color="fg.default">{msg.senderName}</Text>}
                            <Text fontSize="sm" color="fg.tertiary">{getMockTime(idx)}</Text>
                          </Box>
                          {selected === "sg" ? (
                            <HITLApprovalCard
                              fileName="Content Review for Blog Post"
                              agentHandle="@ContentReview"
                              dueDate="Due on July 8 at 4:15PM"
                              approvalTitle="Does this blog post meet our brand guidelines?"
                              approvalDescription="Blog post is for Q3. Please review ASAP in Opal."
                              viewOnly
                            />
                          ) : selected === "kara" ? (
                            <HITLApprovalCard
                              fileName="Q&A: Discover the Unknown"
                              agentHandle="@ContentReview"
                              dueDate="Due on July 8 at 4:15PM"
                              approvalTitle="Does this blog post meet our brand guidelines?"
                              approvalDescription="Blog post is for Q3. Please review ASAP in Opal."
                              persistKey="kara-q4-brief-approval"
                              approvalState="pending"
                              onPreview={() => imRouter.push('/opal?artifacts=1')}
                            />
                          ) : (
                            <ApprovalActionCard
                              authorName={msg.senderName ?? ""}
                              authorAvatar={msg.senderAvatar}
                              isVAU
                              badge="UPDATED"
                              fileName="Q&A: Discover the Unknown"
                              fileSubtitle="GEO-optimized Q&A article for Stride · v2 (updated)"
                              approvalTitle="Team approval needed"
                              approvalDescription="Review the Q4 content brief. Approve to proceed with building out article briefs and the editorial calendar, or request further changes."
                              persistKey="other-q4-brief-approval"
                              approvalState="pending"
                              onPreview={() => imRouter.push('/opal?artifacts=1')}
                            />
                          )}
                        </Box>
                      </Box>
                    ) : (
                      <MessageBubble key={msg.id} id={`msg-${msg.id}`} msg={msg} time={getMockTime(idx)} onOpenThread={m => { setThreadMsg(m); setThreadOpen(true); }}
                        isPinned={!!(selected && pinnedMsgIds[selected]?.includes(msg.id))}
                        onPin={id => setPinnedMsgIds(prev => {
                          const current = prev[selected] ?? [];
                          const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
                          return { ...prev, [selected]: next };
                        })}
                        onMarkConvoUnread={isUnread => setManualUnreadConvos(prev => {
                          const next = new Set(prev);
                          if (isUnread) next.add(selected); else next.delete(selected);
                          return next;
                        })}
                      />
                    )
                  )}
                  <div ref={bottomRef} />
                </Box>
              )}
            </TabsContent>

            {/* Pins tab */}
            <TabsContent value="pins" style={{ flex: 1, minHeight: 0, display: activeTab === "pins" ? "flex" : "none", flexDirection: "column", overflow: "hidden" }}>
              {(() => {
                const ids = selected ? (pinnedMsgIds[selected] ?? []) : [];
                const pinned = thread.filter(m => ids.includes(m.id));
                if (pinned.length === 0) return (
                  <Box display="flex" alignItems="center" justifyContent="center" py="48">
                    <Text fontSize="sm" color="fg.tertiary">No pins yet — pin a message to see it here</Text>
                  </Box>
                );
                return (
                  <Box style={{ overflowY: "auto", flex: 1 }}>
                    {pinned.map((m, idx) => (
                      <Box key={m.id} px="16" py="12" style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}>
                        <Box display="flex" alignItems="center" gap="8" style={{ marginBottom: 6 }}>
                          <IconThumbtack size={12} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
                          <Text fontSize="sm" color="fg.tertiary">
                            {m.from === "user" ? "You" : m.senderName ?? "Unknown"} · {getMockTime(idx)}
                          </Text>
                        </Box>
                        <Text fontSize="md" color="fg.default">{m.text}</Text>
                        <Box display="flex" justifyContent="flex-end" style={{ marginTop: 6 }}>
                          <Button size="sm" appearance="subtle"
                            onClick={() => setPinnedMsgIds(prev => ({ ...prev, [selected]: (prev[selected] ?? []).filter(x => x !== m.id) }))}
                            style={{ color: "var(--ax-colors-fg-tertiary)", fontSize: 12 }}>
                            Unpin
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                );
              })()}
            </TabsContent>

            {/* Artifacts tab */}
            <TabsContent value="artifacts" style={{ flex: 1, minHeight: 0, display: activeTab === "artifacts" ? "flex" : "none", flexDirection: "column", overflow: "hidden" }}>
              <Box style={{ overflowY: "auto", flex: 1, alignSelf: "stretch" }}>
                <Box px="16" py="16" display="flex" flexDirection="column" gap="20">
                  {/* To Review section — VAU DMs, group chats, and channels with VAUs */}
                  {(isVAU || isGroupWithVAU || isChannelWithVAU) && deliverableCount > 0 && (
                    <Box style={{ maxWidth: 640 }}>
                      <Box display="flex" alignItems="center" gap="8" pb="10">
                        <Text fontSize="xs" fontWeight="500" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>To review</Text>
                        <Badge intent="information">{deliverableCount}</Badge>
                      </Box>
                      <Box display="flex" flexDirection="column" gap="8">
                        {isVAU && selected && (VAU_DELIVERABLES[selected] ?? []).filter(d => !dismissedDeliverableIds.has(d.id)).map((item) => (
                          <Box
                            key={item.id}
                            rounded="lg"
                            onClick={() => setContentPanelItemId(item.id)}
                            style={{ border: "1px solid var(--ax-colors-border-default)", background: "var(--ax-colors-bg-default)", cursor: "pointer" }}
                          >
                            <Box px="12" py="10" display="flex" alignItems="center" gap="10">
                              <Box rounded="md" style={{ width: 32, height: 32, background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <IconFileLines style={{ width: 16, height: 16, color: "var(--ax-colors-fg-secondary)" }} />
                              </Box>
                              <Box style={{ flex: 1, minWidth: 0 }}>
                                <Text fontSize="sm" fontWeight="500" color="fg.default" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{item.title}</Text>
                                <Text fontSize="sm" color="fg.tertiary">{item.type}</Text>
                              </Box>
                              <Button appearance="primary" size="sm" onClick={e => { e.stopPropagation(); setContentPanelItemId(item.id); }}>Review</Button>
                              <Button appearance="default" size="sm" onClick={e => { e.stopPropagation(); onDismissDeliverable(item.id); }}>Dismiss</Button>
                            </Box>
                          </Box>
                        ))}
                        {isGroupWithVAU && selected && (GROUP_DELIVERABLES[selected] ?? []).filter(d => !dismissedDeliverableIds.has(d.id)).map((item) => (
                          <Box
                            key={item.id}
                            rounded="lg"
                            onClick={() => selected === "sg" ? setDocReviewOpen(true) : setContentPanelItemId(item.id)}
                            style={{ border: "1px solid var(--ax-colors-border-default)", background: "var(--ax-colors-bg-default)", cursor: "pointer" }}
                          >
                            <Box px="12" py="10" display="flex" alignItems="center" gap="10">
                              <Box rounded="md" style={{ width: 32, height: 32, background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <IconFileLines style={{ width: 16, height: 16, color: "var(--ax-colors-fg-secondary)" }} />
                              </Box>
                              <Box style={{ flex: 1, minWidth: 0 }}>
                                <Text fontSize="sm" fontWeight="500" color="fg.default" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{item.title}</Text>
                                <Text fontSize="sm" color="fg.tertiary"><Text asChild fontSize="sm" fontWeight="500" color="fg.default"><span>{item.vauName}</span></Text> · {item.type}</Text>
                              </Box>
                              <Button appearance="primary" size="sm" onClick={e => { e.stopPropagation(); selected === "sg" ? setDocReviewOpen(true) : setContentPanelItemId(item.id); }}>Review</Button>
                              <Button appearance="default" size="sm" onClick={e => { e.stopPropagation(); onDismissDeliverable(item.id); }}>Dismiss</Button>
                            </Box>
                          </Box>
                        ))}
                        {isChannelWithVAU && selected && (CHANNEL_DELIVERABLES[selected] ?? []).filter(d => !dismissedDeliverableIds.has(d.id)).map((item) => (
                          <Box
                            key={item.id}
                            rounded="lg"
                            onClick={() => setContentPanelItemId(item.id)}
                            style={{ border: "1px solid var(--ax-colors-border-default)", background: "var(--ax-colors-bg-default)", cursor: "pointer" }}
                          >
                            <Box px="12" py="10" display="flex" alignItems="center" gap="10">
                              <Box rounded="md" style={{ width: 32, height: 32, background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <IconFileLines style={{ width: 16, height: 16, color: "var(--ax-colors-fg-secondary)" }} />
                              </Box>
                              <Box style={{ flex: 1, minWidth: 0 }}>
                                <Text fontSize="sm" fontWeight="500" color="fg.default" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{item.title}</Text>
                                <Text fontSize="sm" color="fg.tertiary"><Text asChild fontSize="sm" fontWeight="500" color="fg.default"><span>{item.vauName}</span></Text> · {item.type}</Text>
                              </Box>
                              <Button appearance="primary" size="sm" onClick={e => { e.stopPropagation(); setContentPanelItemId(item.id); }}>Review</Button>
                              <Button appearance="default" size="sm" onClick={e => { e.stopPropagation(); onDismissDeliverable(item.id); }}>Dismiss</Button>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Artifacts grid */}
                  {selected && ((ALL_ARTIFACTS[selected]?.length ?? 0) > 0 || selected === "bubs") && (
                    <Box display="flex" flexDirection="column" gap="12" pt="8">
                      <Text fontSize="xs" fontWeight="500" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>Files and Artifacts</Text>
                      <Box display="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                        {selected === "bubs"
                          ? (() => {
                              const arts = ALL_ARTIFACTS["bubs"] ?? [];
                              const work = RANDY_WORK_ITEMS;
                              const maxLen = Math.max(arts.length, work.length);
                              const cells = [];
                              for (let i = 0; i < maxLen; i++) {
                                if (i < arts.length) cells.push(<MiniArtifactCard key={arts[i].id} item={arts[i]} idx={i} />);
                                if (i < work.length) cells.push(<WorkItemCard key={work[i].id} item={work[i]} />);
                              }
                              return cells;
                            })()
                          : (ALL_ARTIFACTS[selected] ?? []).map((item, idx) => (
                              <MiniArtifactCard key={item.id} item={item} idx={idx} />
                            ))
                        }
                      </Box>
                    </Box>
                  )}
                  {(!selected || (ALL_ARTIFACTS[selected]?.length ?? 0) === 0) && deliverableCount === 0 && !isChannelWithVAU && (
                    <Box display="flex" alignItems="center" justifyContent="center" py="48">
                      <Text fontSize="sm" color="fg.tertiary">No artifacts yet</Text>
                    </Box>
                  )}
                </Box>
              </Box>
            </TabsContent>

          </Tabs>
        </Box>
      </Box>

      {/* Typing indicators — pinned above composer */}
      {!searchOpen && activeTab === "messages" && (() => {
        const alwaysTyping = selected ? (TYPING_USERS[selected] ?? []) : [];
        const vauTyping = typing && isVAU
          ? [{ name: activeDMS.find(d => d.id === selected)?.name ?? "VAU", avatar: activeDMS.find(d => d.id === selected)?.avatar ?? "" }]
          : [];
        const allTyping = [...alwaysTyping, ...vauTyping];
        if (allTyping.length === 0) return null;
        const label = allTyping.length === 1
          ? allTyping[0].name
          : allTyping.length === 2
            ? `${allTyping[0].name} and ${allTyping[1].name}`
            : `${allTyping[0].name}, ${allTyping[1].name} +${allTyping.length - 2}`;
        return (
          <Box px="20" pt="8" pb="12" style={{ flexShrink: 0, background: "var(--ax-colors-bg-default)" }}>
            <Box display="flex" gap="10" alignItems="center">
              {allTyping.length === 1 && <Avatar name={allTyping[0].name} src={allTyping[0].avatar} size="sm" />}
              <Box style={{ background: "var(--ax-colors-bg-secondary)", borderRadius: 12, padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Text fontSize="sm" color="fg.tertiary" style={{ marginRight: 4 }}>{label}</Text>
                {[0, 1, 2].map((i) => (
                  <Box key={i} rounded="full" style={{ width: 5, height: 5, background: "var(--ax-colors-fg-tertiary)", animation: `opal-typing-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </Box>
            </Box>
          </Box>
        );
      })()}

      {/* OOO alert banner */}
      {activeDMS.find(d => d.id === selected)?.status === "ooo" && (activeTab === "messages" || activeTab === "pins") && (
        <Box px="16" pb="8" style={{ background: "var(--ax-colors-bg-default, white)", flexShrink: 0 }}>
          <Alert intent="warning">
            <Box display="flex" alignItems="center" justifyContent="space-between" gap="12">
              <Text fontSize="md">{conversationName} is paused right now. Messages will be delivered but workflows won&apos;t run.</Text>
              <Button appearance="subtle" size="sm" style={{ flexShrink: 0 }}>Resume</Button>
            </Box>
          </Alert>
        </Box>
      )}

      {/* Paused VAU banner for group chats — non-actionable */}
      {isGroupWithVAU && selected && (GROUP_PAUSED_VAU_IDS[selected] ?? []).length > 0 && (activeTab === "messages" || activeTab === "pins") && (
        <Box px="16" pb="8" style={{ background: "var(--ax-colors-bg-default, white)", flexShrink: 0 }}>
          {(GROUP_PAUSED_VAU_IDS[selected] ?? []).map(pausedId => {
            const vauName = activeDMS.find(d => d.id === pausedId)?.name ?? pausedId;
            return (
              <Alert key={pausedId} intent="warning">
                <Text fontSize="md">{vauName} is paused right now — messages will be delivered but workflows won&apos;t run.</Text>
              </Alert>
            );
          })}
        </Box>
      )}

      {/* Deactivated banner — replaces composer */}
      {isDeactivated && (
        <Box px="16" pb="16" style={{ flexShrink: 0 }}>
          <Box display="flex" alignItems="center" gap="10" px="16" py="12" rounded="lg" bg="bg.secondary"
            style={{ border: "1px solid var(--ax-colors-border-default)" }}>
            <IconBan size={15} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
            <Text fontSize="sm" color="fg.tertiary">
              This VAU has been deactivated. Past messages are read-only.
            </Text>
          </Box>
        </Box>
      )}

      {/* Composer — hidden on non-message tabs, deactivated VAUs, and search mode */}
      {!searchOpen && (activeTab === "messages" || activeTab === "pins") && !isDeactivated && <Box
        px="16"
        pb="16"
        style={{ background: "var(--ax-colors-bg-default, white)", flexShrink: 0 }}
      >
        {/* Formatting toolbar */}
        <Box
          display="flex"
          alignItems="center"
          px="4"
          style={{
            height: 37,
            background: "var(--ax-colors-bg-tertiary, #eff5eb)",
            borderRadius: "4px 4px 0 0",
          }}
        >
          <ToolbarBtn icon={<IconBold />} label="Bold" />
          <ToolbarBtn icon={<IconItalic />} label="Italic" />
          <ToolbarBtn icon={<IconUnderline />} label="Underline" />
          <ToolbarBtn icon={<IconStrikethrough />} label="Strikethrough" />
          <Box style={{ width: 1, height: 18, background: "var(--ax-colors-border-secondary)", margin: "0 4px", flexShrink: 0 }} />
          <ToolbarBtn icon={<IconLink />} label="Link" />
          <ToolbarBtn icon={<IconListOl />} label="Ordered list" />
          <ToolbarBtn icon={<IconListUl />} label="Bullet list" />
          <ToolbarBtn icon={<IconQuoteRight />} label="Block quote" />
          <Box style={{ width: 1, height: 18, background: "var(--ax-colors-border-secondary)", margin: "0 4px", flexShrink: 0 }} />
          <ToolbarBtn icon={<IconCode />} label="Code" />
        </Box>

        {/* Input box */}
        <Box style={{ position: "relative" }}>
        {/* @mention dropdown */}
        {mentionOpen && filteredMentions.length > 0 && (
          <Box
            rounded="lg"
            style={{
            position: "absolute", bottom: "100%", left: 0, right: 0, marginBottom: 4,
            background: "var(--ax-colors-bg-default)", border: "1px solid var(--ax-colors-border-secondary)",
            maxHeight: 200, overflowY: "auto", zIndex: 20,
          }}>
            {filteredMentions.map((m, i) => (
              <Box key={m.id} onClick={() => insertMention(m.name)} display="flex" alignItems="center" gap="8" px="12" py="8"
                style={{ cursor: "pointer", background: i === mentionIdx ? "var(--ax-colors-bg-default-hovered)" : "transparent" }}>
                {m.isSpecial
                  ? <Box rounded="full" style={{ width: 24, height: 24, background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>@</Box>
                  : <Avatar name={m.name} src={m.avatar} size="sm" />}
                <Text fontSize="md" color="fg.default">@{m.name}</Text>
              </Box>
            ))}
          </Box>
        )}
        <Box
          style={{
            background: "var(--ax-colors-bg-default, white)",
            border: "1px solid var(--ax-colors-border-default, #d8e4cb)",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
            minHeight: 111,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "8px 8px 8px 12px",
          }}
        >
          {/* Pending content item thumbnails — above textarea */}
          {(pendingAttachments.length > 0 || uploadingItems.some(u => u.conversationId === selected)) && (
            <Box pb="8" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {/* Uploading thumbnails */}
              {uploadingItems.filter(u => u.conversationId === selected).map(u => {
                const pct = Math.round(uploadProgress[u.id] ?? 0);
                return (
                  <Box key={u.id} style={{ position: "relative", display: "inline-block", flexShrink: 0 }}>
                    <Box rounded="lg" style={{ width: 110, overflow: "hidden", border: "1px solid var(--ax-colors-border-default)", background: "var(--ax-colors-bg-default)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                      {/* Thumbnail area with spinner overlay */}
                      <Box style={{ height: 68, background: "var(--ax-colors-bg-secondary)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Spinner size="sm" />
                        {/* Progress % bottom-right */}
                        <Box style={{ position: "absolute", bottom: 4, right: 6 }}>
                          <Text fontSize="sm" style={{ fontSize: 9, fontWeight: 600, color: "var(--ax-colors-fg-secondary)" }}>{pct}%</Text>
                        </Box>
                      </Box>
                      {/* Filename + progress bar */}
                      <Box px="8" py="6" display="flex" flexDirection="column" gap="4">
                        <Text fontSize="sm" style={{ fontSize: 10, fontWeight: 500, color: "var(--ax-colors-fg-default)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.title}</Text>
                        {/* Progress bar */}
                        <Box style={{ height: 3, borderRadius: 2, background: "var(--ax-colors-bg-tertiary, #e5eaf2)", overflow: "hidden" }}>
                          <Box style={{ height: "100%", borderRadius: 2, background: "var(--ax-colors-bg-information)", width: `${pct}%`, transition: "width 0.8s ease" }} />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
              {pendingAttachments.map(item => (
                <Box key={item.id} style={{ position: "relative", display: "inline-block", flexShrink: 0 }}>
                  <Box rounded="lg" style={{ width: 110, overflow: "hidden", border: "1px solid var(--ax-colors-border-default)", background: "var(--ax-colors-bg-default)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    {/* Document preview area */}
                    <Box style={{ height: 68, background: item.accent, display: "flex", flexDirection: "column", justifyContent: "center", padding: "10px 10px 6px" }}>
                      {/* Simulated document lines */}
                      {item.lines.map((w, i) => (
                        <Box key={i} style={{ height: 3, width: `${w}%`, background: item.accentDark, opacity: 0.35, borderRadius: 2, marginBottom: i < item.lines.length - 1 ? 4 : 0 }} />
                      ))}
                    </Box>
                  </Box>
                  <Box onClick={() => setPendingAttachments(prev => prev.filter(a => a.id !== item.id))}
                    rounded="full"
                    style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, background: "var(--ax-colors-fg-default)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 1 }}>
                    <IconXmark size={10} style={{ color: "var(--ax-colors-bg-default)" }} />
                  </Box>
                </Box>
              ))}
            </Box>
          )}
          <textarea
            value={message}
            onChange={e => {
              const val = e.target.value;
              setMessage(val);
              const lastAt = val.lastIndexOf('@');
              if (lastAt >= 0) {
                const after = val.slice(lastAt + 1);
                if (!after.includes(' ')) { setMentionQuery(after.toLowerCase()); setMentionOpen(true); setMentionIdx(0); return; }
              }
              setMentionOpen(false);
            }}
            onKeyDown={e => {
              if (mentionOpen) {
                if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIdx(i => Math.min(i + 1, filteredMentions.length - 1)); return; }
                if (e.key === 'ArrowUp')   { e.preventDefault(); setMentionIdx(i => Math.max(i - 1, 0)); return; }
                if (e.key === 'Escape')    { setMentionOpen(false); return; }
                if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); if (filteredMentions[mentionIdx]) insertMention(filteredMentions[mentionIdx].name); return; }
              }
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder={conversationName ? `Message ${conversationName}…` : "Select a conversation…"}
            disabled={!selected}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              resize: "none",
              background: "transparent",
              fontFamily: "inherit",
              fontSize: 16,
              color: "var(--ax-colors-fg-default)",
              lineHeight: 1.5,
              minHeight: 48,
            }}
          />
          <Box display="flex" alignItems="center" pt="4">
            <Menu
              options={[
                { label: "File", execute: () => fileInputRef.current?.click() },
                { label: "Artifact", execute: () => setArtifactPickerOpen(true) },
                { label: "Skills", execute: () => setAgentPickerOpen(true) },
              ]}
            >
              <MenuTrigger asChild>
                <Button appearance="subtle" size="sm" icon={<IconPlus />} aria-label="Add"
                  style={{ width: 28, height: 28, padding: 0, color: "var(--ax-colors-fg-tertiary)" }} />
              </MenuTrigger>
              <MenuContent align="start" />
            </Menu>
            <Box style={{ flex: 1 }} />
            <Tooltip content="Send">
              <Button
                appearance="primary"
                size="sm"
                icon={<IconSend />}
                aria-label="Send message"
                onClick={handleSend}
            disabled={(!message.trim() && pendingAttachments.length === 0) || !selected}
                rounded="full"
                style={{ width: 32, height: 32, padding: 0, marginLeft: 4 }}
              />
            </Tooltip>
          </Box>
        </Box>
        </Box>
      </Box>}
      </Box>

      {/* ── Profile panel ────────────────────────────────────────────── */}
      {(() => {
        const dm = activeDMS.find(d => d.id === selected);
        const group = selectedGroup;
        const channel = selectedChannel;
        const USER_META: Record<string, { title: string; email: string; time: string }> = {
          js: { title: "Sr. Content Strategist", email: "jane.smith@optimizely.com", time: "9:51 AM" },
          lg: { title: "Content Writer", email: "lisa.gray@optimizely.com", time: "9:51 AM" },
          hw: { title: "Product Manager", email: "harry.wb@optimizely.com", time: "2:51 PM" },
          bw: { title: "Data Analyst", email: "brendan.w@optimizely.com", time: "9:51 AM" },
          ms: { title: "Social Media Manager", email: "marcus.santos@optimizely.com", time: "9:51 AM" },
          pr: { title: "UX Researcher", email: "priya.rajan@optimizely.com", time: "10:51 AM" },
          td: { title: "Frontend Engineer", email: "tom.decker@optimizely.com", time: "9:51 AM" },
          ao: { title: "Brand Designer", email: "amara.osei@optimizely.com", time: "9:51 AM" },
        };
        const meta = dm ? USER_META[dm.id] : null;
        const vauAgent = dm?.isVAU ? MOCK_AGENTS.find(a => a.id === dm.id) : null;

        const shareContact = () => {
          if (!selected || !dm) return;
          const contactMsg: Message = {
            id: Date.now().toString(), from: "user",
            senderAvatar: "https://i.pravatar.cc/150?img=24", text: "",
            agentCard: vauAgent
              ? { name: dm.name, emoji: vauAgent.emoji, description: vauAgent.description, tags: vauAgent.tags, connectors: vauAgent.connectors, workingWith: vauAgent.workingWith }
              : { name: dm.name, emoji: "👤", description: meta?.title ?? "", tags: [meta?.title ?? ""], connectors: [], workingWith: [] },
          };
          setThreads(prev => ({ ...prev, [selected]: [...(prev[selected] ?? []), contactMsg] }));
          setProfileOpen(false);
        };

        return (
          <Box style={{
            position: "absolute", top: 0, right: 0, bottom: 0, width: 320,
            transform: profileOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s cubic-bezier(0.2, 0, 0, 1)",
            borderLeft: "1px solid var(--ax-colors-border-secondary)",
            background: "var(--ax-colors-bg-default)", zIndex: 10,
            display: "flex", flexDirection: "column", overflowY: "auto",
          }}>
            {(dm || group || channel) && (
              <>
                {/* Close */}
                <Box display="flex" justifyContent="space-between" alignItems="center" px="16" py="12" style={{ flexShrink: 0 }}>
                  <Text fontWeight="600" fontSize="md" color="fg.default">
                    {dm ? "Profile" : group ? "Group info" : "Channel info"}
                  </Text>
                  <Button appearance="subtle" size="sm" icon={<IconXmark style={{ width: 14, height: 14 }} />}
                    onClick={() => setProfileOpen(false)} style={{ width: 28, height: 28, padding: 0 }} />
                </Box>

                {dm ? (
                  <>
                    {/* Large avatar */}
                    <Box display="flex" flexDirection="column" alignItems="center" px="20" pb="16" gap="12">
                      <Box style={{ position: "relative" }}>
                        {dm.avatar ? (
                          <Avatar name={dm.name} src={dm.avatar} size="xl" />
                        ) : (
                          <Box style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 500, color: "var(--ax-colors-fg-secondary)", flexShrink: 0 }}>
                            {dm.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                          </Box>
                        )}
                        {dm.status && (
                          <Box rounded="full" style={{ position: "absolute", bottom: 2, right: 2, width: 14, height: 14, background: PRESENCE_COLOR[dm.status], border: "2px solid var(--ax-colors-bg-default)" }} />
                        )}
                      </Box>
                      <Box display="flex" flexDirection="column" alignItems="center" gap="4">
                        <Box display="flex" alignItems="center" gap="6">
                          <Text fontWeight="600" fontSize="xl" color="fg.default">{dm.name}</Text>
                        </Box>
                        {!dm.isVAU && meta && (
                          <Text fontSize="sm" color="fg.secondary">{meta.title}</Text>
                        )}
                        {dm.isVAU && vauAgent && (
                          <Badge intent="neutral">Virtual Teammate</Badge>
                        )}
                      </Box>
                    </Box>

                    {/* Action buttons */}
                    <Box display="flex" gap="8" px="16" pb="16" justifyContent="center">
                      <Button appearance="default" size="md" icon={<IconComment size={14} />}>Message</Button>
                      <Button appearance="default" size="md" onClick={shareContact}>Share contact</Button>
                    </Box>

                    <Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", margin: "0 16px" }} />

                    {/* Human profile: contact info */}
                    {!dm.isVAU && meta && (
                      <Box display="flex" flexDirection="column" gap="16" px="16" pt="16">
                        <Text fontWeight="600" fontSize="md" color="fg.default">Contact information</Text>
                        <Box display="flex" flexDirection="column" gap="2">
                          <Text fontSize="sm" color="fg.tertiary">Email Address</Text>
                          <Text fontSize="sm" color="fg.link.default" style={{ wordBreak: "break-all" }}>{meta.email}</Text>
                        </Box>
                        <Box display="flex" flexDirection="column" gap="2">
                          <Text fontSize="sm" color="fg.tertiary">Local time</Text>
                          <Text fontSize="sm" color="fg.default">{meta.time} local time</Text>
                        </Box>
                        <Box display="flex" flexDirection="column" gap="2">
                          <Text fontSize="sm" color="fg.tertiary">Title</Text>
                          <Text fontSize="sm" color="fg.default">{meta.title}</Text>
                        </Box>
                      </Box>
                    )}

                    {/* VAU profile: Overview */}
                    {dm.isVAU && vauAgent && (
                      <Box display="flex" flexDirection="column" gap="16" px="16" pt="16" style={{ overflowY: "auto", flex: 1 }}>
                        <Box>
                          <Text fontWeight="600" fontSize="md" color="fg.default" style={{ marginBottom: 8 }}>About</Text>
                          <Text fontSize="sm" color="fg.secondary" style={{ lineHeight: 1.6 }}>{vauAgent.description}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="600" fontSize="md" color="fg.default" style={{ marginBottom: 8 }}>Capabilities</Text>
                          <Box display="flex" gap="6" style={{ flexWrap: "wrap" }}>
                            {vauAgent.tags.map(t => <Badge key={t} intent="neutral">{t}</Badge>)}
                          </Box>
                        </Box>
                        <Box style={{ height: 1, background: "var(--ax-colors-border-secondary)" }} />
                        <Box>
                          <Text fontWeight="600" fontSize="md" color="fg.default" style={{ marginBottom: 12 }}>Recent deliverables</Text>
                          <Box display="flex" flexDirection="column" gap="8">
                            {(VAU_DELIVERABLES[dm.id] ?? []).map(d => (
                              <Box key={d.id} display="flex" alignItems="center" gap="10" px="10" py="8"
                                rounded="lg" style={{ border: "1px solid var(--ax-colors-border-secondary)", background: "var(--ax-colors-bg-default)" }}>
                                <IconFileLines size={14} style={{ color: "var(--ax-colors-fg-secondary)", flexShrink: 0 }} />
                                <Box style={{ flex: 1, minWidth: 0 }}>
                                  <Text fontSize="sm" fontWeight="500" color="fg.default" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{d.title}</Text>
                                </Box>
                                <Badge intent="neutral">{d.type}</Badge>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </>
                ) : group ? (
                  <Box display="flex" flexDirection="column" gap="0" style={{ flex: 1, overflowY: "auto" }}>
                    {/* Group header */}
                    <Box display="flex" flexDirection="column" alignItems="center" px="20" py="20" gap="10">
                      <Box rounded="xl" style={{ width: 64, height: 64, background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <IconUserGroup size={28} style={{ color: "var(--ax-colors-fg-secondary)" }} />
                      </Box>
                      <Box display="flex" flexDirection="column" alignItems="center" gap="4">
                        <Text fontWeight="600" fontSize="xl" color="fg.default">{group.name}</Text>
                        <Text fontSize="sm" color="fg.tertiary">{group.memberList?.length ?? 0} members</Text>
                      </Box>
                    </Box>
                    <Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", margin: "0 16px" }} />
                    {/* Created by */}
                    <Box display="flex" flexDirection="column" gap="12" px="16" py="16">
                      <Box display="flex" flexDirection="column" gap="2">
                        <Text fontSize="sm" color="fg.tertiary">Created by</Text>
                        <Text fontSize="sm" color="fg.default">Erika Schreiber</Text>
                      </Box>
                      <Box display="flex" flexDirection="column" gap="2">
                        <Text fontSize="sm" color="fg.tertiary">Created on</Text>
                        <Text fontSize="sm" color="fg.default">October 14, 2025</Text>
                      </Box>
                    </Box>
                    <Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", margin: "0 16px" }} />
                    {/* Members */}
                    <Box display="flex" flexDirection="column" gap="12" px="16" py="16">
                      <Text fontWeight="600" fontSize="md" color="fg.default">Members</Text>
                      <Box display="flex" flexDirection="column" gap="10">
                        {(group.memberList ?? []).map(m => (
                          <Box key={m.name} display="flex" alignItems="center" gap="10">
                            <Avatar name={m.name} src={m.avatar || undefined} size="sm" />
                            <Text fontSize="sm" color="fg.default">{m.name}</Text>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                ) : channel ? (
                  <Box display="flex" flexDirection="column" gap="0" style={{ flex: 1, overflowY: "auto" }}>
                    {/* Channel header */}
                    <Box display="flex" flexDirection="column" alignItems="center" px="20" py="20" gap="10">
                      <Avatar name={channel.name.replace(/^#/, "")} size="xl" />
                      <Box display="flex" flexDirection="column" alignItems="center" gap="4">
                        <Text fontWeight="600" fontSize="xl" color="fg.default">{channel.name}</Text>
                        <Text fontSize="sm" color="fg.tertiary">{channel.memberList?.length ?? 0} members</Text>
                      </Box>
                    </Box>
                    <Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", margin: "0 16px" }} />
                    {/* Channel meta */}
                    <Box display="flex" flexDirection="column" gap="12" px="16" py="16">
                      <Box display="flex" flexDirection="column" gap="2">
                        <Text fontSize="sm" color="fg.tertiary">Created by</Text>
                        <Text fontSize="sm" color="fg.default">Erika Schreiber</Text>
                      </Box>
                      <Box display="flex" flexDirection="column" gap="2">
                        <Text fontSize="sm" color="fg.tertiary">Created on</Text>
                        <Text fontSize="sm" color="fg.default">September 3, 2025</Text>
                      </Box>
                    </Box>
                    <Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", margin: "0 16px" }} />
                    {/* Members */}
                    <Box display="flex" flexDirection="column" gap="12" px="16" py="16">
                      <Text fontWeight="600" fontSize="md" color="fg.default">Members</Text>
                      <Box display="flex" flexDirection="column" gap="10">
                        {(channel.memberList ?? []).map(m => (
                          <Box key={m.name} display="flex" alignItems="center" gap="10">
                            <Avatar name={m.name} src={m.avatar || undefined} size="sm" />
                            <Text fontSize="sm" color="fg.default">{m.name}</Text>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                ) : null}
              </>
            )}
          </Box>
        );
      })()}

      {/* ── Content Review panel (opens when a card in Activities tab is clicked) ── */}
      {(() => {
        const content = contentPanelItemId ? DELIVERABLE_CONTENT[contentPanelItemId] : null;
        // Find the deliverable title+type for the header badge
        const allDeliverables = [
          ...Object.values(VAU_DELIVERABLES).flat(),
          ...Object.values(GROUP_DELIVERABLES).flat(),
        ];
        const deliverable = allDeliverables.find(d => d.id === contentPanelItemId);
        return (
          <Box style={{
            position: "absolute", inset: 0,
            transform: contentPanelItemId ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s cubic-bezier(0.2, 0, 0, 1)",
            background: "var(--ax-colors-bg-default)",
            zIndex: 20,
            display: "flex", flexDirection: "column",
          }}>
            {/* Header */}
            <Box display="flex" alignItems="center" gap="8" px="16"
              style={{ height: 56, borderBottom: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0 }}>
              <Button
                appearance="subtle" size="sm"
                icon={<IconChevronLeft style={{ width: 14, height: 14 }} />}
                aria-label="Back to thread"
                onClick={() => setContentPanelItemId(null)}
                style={{ width: 28, height: 28, padding: 0, flexShrink: 0 }}
              />
              <Box rounded="md" style={{ width: 28, height: 28, background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <IconFileLines style={{ width: 14, height: 14, color: "var(--ax-colors-fg-secondary)" }} />
              </Box>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text fontSize="sm" fontWeight="500" color="fg.default" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {content?.headline ?? ""}
                </Text>
              </Box>
            </Box>

            {/* Scrollable content */}
            <Box style={{ flex: 1, overflowY: "auto" }} px="24" py="20" display="flex" flexDirection="column" gap="20">
              {/* Meta row */}
              <Box display="flex" alignItems="center" gap="8" style={{ flexWrap: "wrap" }}>
                {deliverable && <Badge intent="neutral">{deliverable.type}</Badge>}
                <Text fontSize="sm" color="fg.tertiary">{content?.meta}</Text>
              </Box>

              {/* Content blocks */}
              {content?.blocks.map((block, i) => (
                <Box key={i} display="flex" flexDirection="column" gap="6">
                  {block.label && (
                    <Text fontSize="sm" fontWeight="600" color="fg.default">{block.label}</Text>
                  )}
                  <Text fontSize="sm" color="fg.secondary" style={{ lineHeight: 1.65, whiteSpace: "pre-line" }}>
                    {block.text}
                  </Text>
                </Box>
              ))}
            </Box>

            {/* Footer actions */}
            <Box display="flex" alignItems="center" gap="8" px="16" py="12"
              style={{ borderTop: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0 }}>
              <Box style={{ flex: 1 }} />
              <Button appearance="default" size="sm">Reject</Button>
              <Button appearance="primary" size="sm">Approve</Button>
            </Box>
          </Box>
        );
      })()}

      {/* ── Document Review overlay (Stride GEO) ─────────────────── */}
      {docReviewOpen && (
        <Box style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "row",
          background: "var(--ax-colors-bg-default)",
          zIndex: 30,
        }}>
          {/* ── Document viewer (left) ── */}
          <Box style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Toolbar */}
            <Box display="flex" alignItems="center" gap="6" px="16"
              style={{ height: 48, borderBottom: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0 }}>
              <Button appearance="subtle" size="sm"
                icon={<IconCode style={{ width: 13, height: 13 }} />}
                aria-label="Code view"
                style={{ width: 28, height: 28, padding: 0 }} />
              <ToggleButton appearance="subtle" size="sm" pressed={true}
                icon={<IconEye style={{ width: 13, height: 13 }} />}
                aria-label="Preview"
                style={{ width: 28, height: 28, padding: 0 }} />
              <Button appearance="subtle" size="sm"
                icon={<IconEllipsisSolid style={{ width: 13, height: 13 }} />}
                aria-label="More options"
                style={{ width: 28, height: 28, padding: 0 }} />
              <Box style={{ flex: 1 }} />
              <AvatarGroup>
                <Avatar name="Nadia Flores" src="https://i.pravatar.cc/150?img=29" size="xs" />
                <Avatar name="Jason Park" src="https://i.pravatar.cc/150?img=51" size="xs" />
                <Avatar name="Sara Chen" src="https://i.pravatar.cc/150?img=20" size="xs" />
                <Avatar name="Me" src="https://i.pravatar.cc/150?img=24" size="xs" />
              </AvatarGroup>
              <Badge intent="success" style={{ marginLeft: 4 }}>SAVED</Badge>
              <Button appearance="default" size="sm" style={{ marginLeft: 4 }}>Share</Button>
              <Button appearance="subtle" size="sm"
                icon={<IconComment style={{ width: 13, height: 13 }} />}
                aria-label="Comments"
                style={{ width: 28, height: 28, padding: 0 }} />
              <Button appearance="subtle" size="sm"
                icon={<IconArrowsMaximize style={{ width: 13, height: 13 }} />}
                aria-label="Expand"
                onClick={() => setDocReviewExpanded(true)}
                style={{ width: 28, height: 28, padding: 0 }} />
              <Button appearance="subtle" size="sm"
                icon={<IconXmark style={{ width: 13, height: 13 }} />}
                aria-label="Close"
                onClick={() => setDocReviewOpen(false)}
                style={{ width: 28, height: 28, padding: 0 }} />
            </Box>

            {/* Article content */}
            <Box style={{ flex: 1, overflowY: "auto" }} px="40" py="32" display="flex" flexDirection="column">
              <Text fontWeight="700" color="fg.default" style={{ fontSize: 26, lineHeight: 1.3, marginBottom: 6 }}>
                Q&amp;A: Discover the Unknown
              </Text>
              <Text fontSize="sm" color="fg.tertiary" style={{ marginBottom: 24 }}>
                GEO-optimized Q&amp;A article for Stride · v2 (updated)
              </Text>
              <Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", marginBottom: 28 }} />
              {(DELIVERABLE_CONTENT["sg1"]?.blocks ?? []).map((block, i) => (
                <Box key={i} style={{ marginBottom: 24 }}>
                  <Text fontWeight="700" color="fg.default" style={{ fontSize: 15, marginBottom: 8, display: "block" }}>
                    {block.label}
                  </Text>
                  <Text fontSize="md" color="fg.default" style={{ lineHeight: 1.7 }}>
                    {block.text}
                  </Text>
                </Box>
              ))}
            </Box>

            {/* Status bar */}
            <Box display="flex" alignItems="center" px="16"
              style={{ height: 28, borderTop: "1px solid var(--ax-colors-border-tertiary)", flexShrink: 0, background: "var(--ax-colors-bg-secondary)" }}>
              <Text color="fg.tertiary" style={{ fontSize: 11 }}>
                discover-the-unknown-qa.md&nbsp;&nbsp;·&nbsp;&nbsp;Markdown · UTF-8
              </Text>
            </Box>
          </Box>

          {/* ── Collab panel (right) ── */}
          <Box style={{
            width: 360, flexShrink: 0,
            borderLeft: "1px solid var(--ax-colors-border-secondary)",
            display: "flex", flexDirection: "column",
            background: "var(--ax-colors-bg-default)",
          }}>
            {/* Header */}
            <Box display="flex" alignItems="center" gap="10" px="16"
              style={{ height: 56, borderBottom: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0 }}>
              <img src="/vau-bubs.svg" alt="Randy" style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0 }} />
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text fontSize="sm" fontWeight="600" color="fg.default">Randy</Text>
                <Text color="fg.tertiary" style={{ fontSize: 11 }}>GEO Content Strategist</Text>
              </Box>
              <Button appearance="subtle" size="sm"
                icon={<IconXmark style={{ width: 13, height: 13 }} />}
                aria-label="Close"
                onClick={() => setDocReviewOpen(false)}
                style={{ width: 28, height: 28, padding: 0 }} />
            </Box>

            {/* Messages + approval card */}
            <Box style={{ flex: 1, overflowY: "auto" }} px="16" py="16" display="flex" flexDirection="column" gap="16">
              <Box style={{
                background: "var(--ax-colors-bg-secondary)",
                borderRadius: 10,
                padding: "12px 14px",
              }}>
                <Text fontSize="sm" color="fg.default" style={{ lineHeight: 1.65 }}>
                  Done — all three rounds of feedback incorporated:
                </Text>
                <Box display="flex" flexDirection="column" gap="4" style={{ marginTop: 8 }}>
                  {[
                    "Activities — Explicitly listed trail running, climbing, diving, skydiving, and multi-terrain endurance challenges",
                    "Team use cases — Rewired around competitive multi-sport group challenges, not generic team building",
                    "Opening tone — Rewrote the first 3 Q&As in Stride's adventurous, explorer-first voice",
                  ].map((item, i) => (
                    <Box key={i} display="flex" alignItems="start" gap="6">
                      <Text fontSize="sm" color="fg.success" style={{ lineHeight: 1.5, flexShrink: 0 }}>✓</Text>
                      <Text fontSize="sm" color="fg.default" style={{ lineHeight: 1.5 }}>{item}</Text>
                    </Box>
                  ))}
                </Box>
                <Text fontSize="sm" color="fg.secondary" style={{ lineHeight: 1.65, marginTop: 8, display: "block" }}>
                  The updated article is ready for final review. See the revised artifact below.
                </Text>
              </Box>

              <ApprovalActionCard
                authorName="Randy"
                authorAvatar="/vau-bubs.svg"
                isVAU
                badge="UPDATED"
                fileName="discover-the-unknown-qa.md"
                fileSubtitle="GEO Q&A article · 7 Q&A pairs · updated"
                approvalTitle="Team approval needed"
                approvalDescription="Review the updated Q&A article. Approve to proceed with publishing, or request further changes."
                persistKey="sg-dtku-approval"
              />
            </Box>

            {/* Composer */}
            <Box px="12" py="12"
              style={{ borderTop: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0 }}>
              <Box style={{
                border: "1px solid var(--ax-colors-border-default)",
                borderRadius: 8,
                background: "var(--ax-colors-bg-default)",
                padding: "10px 14px",
                minHeight: 40,
                display: "flex", alignItems: "center",
              }}>
                <Text fontSize="sm" color="fg.tertiary" style={{ pointerEvents: "none", userSelect: "none" }}>
                  Collaborate with your team
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Expanded doc view (fullscreen portal) ─────────────────── */}
      {docReviewExpanded && typeof document !== "undefined" && createPortal(
        <Box style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "var(--ax-colors-bg-default)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Header */}
          <Box display="flex" alignItems="center" gap="10" px="20"
            style={{ height: 52, borderBottom: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0 }}>
            <Button appearance="subtle" size="sm"
              icon={<IconCode style={{ width: 13, height: 13 }} />}
              style={{ width: 28, height: 28, padding: 0 }} />
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text fontSize="sm" fontWeight="500" color="fg.default">discover-the-unknown-qa.md</Text>
              <Text color="fg.tertiary" style={{ fontSize: 11 }}>GEO Q&A article · 7 Q&A pairs · updated</Text>
            </Box>
            <Button appearance="subtle" size="sm"
              icon={<IconArrowsMinimize style={{ width: 13, height: 13 }} />}
              aria-label="Exit fullscreen"
              onClick={() => setDocReviewExpanded(false)}
              style={{ width: 28, height: 28, padding: 0 }} />
            <Button appearance="subtle" size="sm"
              icon={<IconXmark style={{ width: 13, height: 13 }} />}
              aria-label="Close"
              onClick={() => { setDocReviewExpanded(false); setDocReviewOpen(false); }}
              style={{ width: 28, height: 28, padding: 0 }} />
          </Box>

          {/* Article content */}
          <Box style={{ flex: 1, overflowY: "auto" }} display="flex" justifyContent="center" py="40" px="24">
            <Box style={{ width: "100%", maxWidth: 720 }}>
              <Text fontWeight="700" color="fg.default" style={{ fontSize: 28, lineHeight: 1.3, marginBottom: 6, display: "block" }}>
                GEO Q&amp;A: Discover the Unknown
              </Text>
              <Text fontSize="sm" color="fg.tertiary" style={{ marginBottom: 8, display: "block" }}>
                Brand: Stride · Format: GEO Q&amp;A · Status: Updated v2
              </Text>
              <Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", marginBottom: 32 }} />
              {(DELIVERABLE_CONTENT["sg1"]?.blocks ?? []).map((block, i) => (
                <Box key={i} style={{ marginBottom: 28 }}>
                  <Text fontWeight="700" color="fg.default" style={{ fontSize: 15, marginBottom: 8, display: "block" }}>
                    Q: {block.label}
                  </Text>
                  <Text fontSize="md" color="fg.default" style={{ lineHeight: 1.75 }}>
                    {block.text}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>,
        document.body
      )}

      {/* ── Thread panel ──────────────────────────────────────────── */}
      <Box style={{
        position: "absolute", top: 0, right: 0, bottom: 0, width: 400,
        transform: threadOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.2, 0, 0, 1)",
        borderLeft: "1px solid var(--ax-colors-border-secondary)",
        background: "var(--ax-colors-bg-default)", zIndex: 10,
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <Box display="flex" alignItems="center" px="16"
          style={{ height: 52, borderBottom: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0 }}>
          <Text fontWeight="500" color="fg.default">Thread</Text>
          <Box style={{ flex: 1 }} />
          <Button appearance="subtle" size="sm" icon={<IconXmark style={{ width: 14, height: 14 }} />}
            aria-label="Close thread" onClick={() => setThreadOpen(false)}
            style={{ width: 28, height: 28, padding: 0 }} />
        </Box>
        {/* Original message */}
        {threadMsg && (
          <Box px="16" py="12" style={{ borderBottom: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0 }}>
            <MessageBubble msg={threadMsg} time="" />
          </Box>
        )}
        {/* Replies */}
        <Box display="flex" flexDirection="column" gap="16" px="16" py="12" style={{ flex: 1, overflowY: "auto" }}>
          {threadMsg && (threadReplies[threadMsg.id] ?? []).map((r, i) => (
            <MessageBubble key={r.id} msg={r} time={getMockTime(i)} />
          ))}
          {threadMsg && (threadReplies[threadMsg.id] ?? []).length === 0 && (
            <Text fontSize="sm" color="fg.tertiary">No replies yet — be the first!</Text>
          )}
        </Box>
        {/* Reply composer */}
        <Box px="12" py="12" style={{ borderTop: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0 }}>
          {/* Formatting toolbar */}
          <Box display="flex" alignItems="center" px="4" style={{ height: 37, background: "var(--ax-colors-bg-tertiary, #eff5eb)", borderRadius: "4px 4px 0 0" }}>
            <ToolbarBtn icon={<IconBold />} label="Bold" />
            <ToolbarBtn icon={<IconItalic />} label="Italic" />
            <ToolbarBtn icon={<IconUnderline />} label="Underline" />
            <ToolbarBtn icon={<IconStrikethrough />} label="Strikethrough" />
            <Box style={{ width: 1, height: 18, background: "var(--ax-colors-border-secondary)", margin: "0 4px", flexShrink: 0 }} />
            <ToolbarBtn icon={<IconLink />} label="Link" />
            <ToolbarBtn icon={<IconListOl />} label="Ordered list" />
            <ToolbarBtn icon={<IconListUl />} label="Bullet list" />
            <ToolbarBtn icon={<IconQuoteRight />} label="Block quote" />
            <Box style={{ width: 1, height: 18, background: "var(--ax-colors-border-secondary)", margin: "0 4px", flexShrink: 0 }} />
            <ToolbarBtn icon={<IconCode />} label="Code" />
          </Box>
          <Box style={{
            background: "var(--ax-colors-bg-default, white)",
            border: "1px solid var(--ax-colors-border-default, #d8e4cb)",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
            minHeight: 111,
            display: "flex",
            flexDirection: "column",
            padding: "8px 12px",
          }}>
            <textarea
              value={threadReply}
              onChange={e => setThreadReply(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendThreadReply(); } }}
              placeholder="Reply in thread…"
              style={{
                flex: 1, border: "none", outline: "none", resize: "none",
                background: "transparent", fontFamily: "inherit", fontSize: 16,
                color: "var(--ax-colors-fg-default)", lineHeight: 1.5, minHeight: 48,
              }}
            />
            <Box display="flex" alignItems="center" pt="4">
              <Menu
                options={[
                  { label: "File", execute: () => fileInputRef.current?.click() },
                  { label: "Artifact", execute: () => setArtifactPickerOpen(true) },
                  { label: "Skills", execute: () => setAgentPickerOpen(true) },
                ]}
              >
                <MenuTrigger asChild>
                  <Button appearance="subtle" size="sm" icon={<IconPlus />} aria-label="Add"
                    style={{ width: 28, height: 28, padding: 0, color: "var(--ax-colors-fg-tertiary)" }} />
                </MenuTrigger>
                <MenuContent align="start" />
              </Menu>
              <Box style={{ flex: 1 }} />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Group Members Modal ── */}
      {(() => {
        const group = selectedGroup;
        if (!group) return null;
        return (
          <Dialog open={groupMembersOpen} onOpenChange={setGroupMembersOpen}>
            <DialogContent style={{ width: 480 }}>
              <DialogHeader>{nameOverrides[selected] ?? group.name}</DialogHeader>
              <DialogBody style={{ padding: 0 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" px="24" py="16"
                  style={{ borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
                  <Text fontSize="md" color="fg.tertiary">
                    {group.memberList ? `${group.memberList.length} members` : group.members}
                  </Text>
                  <Button appearance="default" size="md" icon={<IconUserPlus size={14} />}
                    onClick={() => { setGroupMembersOpen(false); setAddParticipantsOpen(true); }}>
                    Add team member
                  </Button>
                </Box>
                <Box display="flex" flexDirection="column" px="16" py="8">
                  {(group.memberList ?? []).map(m => (
                    <Box key={m.name} display="flex" alignItems="center" gap="12" px="8" py="12"
                      style={{ borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
                      <Avatar name={m.name} src={m.avatar || undefined} size="md" />
                      <Text fontSize="md" color="fg.default" style={{ flex: 1 }}>{m.name}</Text>
                      <Button appearance="subtle" size="sm" icon={<IconTrashCan style={{ width: 16, height: 16 }} />}
                        aria-label={`Remove ${m.name}`} />
                    </Box>
                  ))}
                </Box>
                {(group.createdBy || group.createdOn) && (
                  <Box px="24" py="16" display="flex" flexDirection="column" gap="12"
                    style={{ borderTop: "1px solid var(--ax-colors-border-secondary)" }}>
                    {group.createdBy && (
                      <Box display="flex" flexDirection="column" gap="2">
                        <Text fontSize="sm" color="fg.tertiary">Created by</Text>
                        <Text fontSize="sm" color="fg.default" fontWeight="500">{group.createdBy}</Text>
                      </Box>
                    )}
                    {group.createdOn && (
                      <Box display="flex" flexDirection="column" gap="2">
                        <Text fontSize="sm" color="fg.tertiary">Created on</Text>
                        <Text fontSize="sm" color="fg.default" fontWeight="500">{group.createdOn}</Text>
                      </Box>
                    )}
                  </Box>
                )}
              </DialogBody>
              <DialogFooter>
                <DialogClose asChild>
                  <Button appearance="default" size="md">Done</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* ── Channel Members Modal ── */}
      {(() => {
        const ch = selectedChannel;
        if (!ch) return null;
        return (
          <Dialog open={channelMembersOpen} onOpenChange={setChannelMembersOpen}>
            <DialogContent style={{ width: 480 }}>
              <DialogHeader>{ch.name}</DialogHeader>
              <DialogBody style={{ padding: 0 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" px="24" py="16"
                  style={{ borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
                  <Text fontSize="md" color="fg.tertiary">
                    {ch.memberList ? `${ch.memberList.length} members` : "Members"}
                  </Text>
                  <Button appearance="default" size="md" icon={<IconUserPlus size={14} />}
                    onClick={() => { setChannelMembersOpen(false); setAddParticipantsOpen(true); }}>
                    Add team member
                  </Button>
                </Box>
                <Box display="flex" flexDirection="column" px="16" py="8">
                  {(ch.memberList ?? []).map(m => (
                    <Box key={m.name} display="flex" alignItems="center" gap="12" px="8" py="12"
                      style={{ borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
                      <Avatar name={m.name} src={m.avatar || undefined} size="md" />
                      <Text fontSize="md" color="fg.default" style={{ flex: 1 }}>{m.name}</Text>
                      <Button appearance="subtle" size="sm" icon={<IconTrashCan style={{ width: 16, height: 16 }} />}
                        aria-label={`Remove ${m.name}`} />
                    </Box>
                  ))}
                </Box>
                {(ch.createdBy || ch.createdOn) && (
                  <Box px="24" py="16" display="flex" flexDirection="column" gap="12"
                    style={{ borderTop: "1px solid var(--ax-colors-border-secondary)" }}>
                    {ch.createdBy && (
                      <Box display="flex" flexDirection="column" gap="2">
                        <Text fontSize="sm" color="fg.tertiary">Created by</Text>
                        <Text fontSize="sm" color="fg.default" fontWeight="500">{ch.createdBy}</Text>
                      </Box>
                    )}
                    {ch.createdOn && (
                      <Box display="flex" flexDirection="column" gap="2">
                        <Text fontSize="sm" color="fg.tertiary">Created on</Text>
                        <Text fontSize="sm" color="fg.default" fontWeight="500">{ch.createdOn}</Text>
                      </Box>
                    )}
                  </Box>
                )}
              </DialogBody>
              <DialogFooter>
                <DialogClose asChild>
                  <Button appearance="default" size="md">Done</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* ── Add Participants Dialog ── */}
    {(() => {
      const group = selectedGroup;
      const q = participantSearch.trim().toLowerCase();
      const filteredPeople = activeDMS.filter(d => !d.isVAU && (!q || d.name.toLowerCase().includes(q)));
      const filteredVAUs   = activeDMS.filter(d =>  d.isVAU && (!q || d.name.toLowerCase().includes(q)));
      const renderRow = (dm: DMItem) => (
        <Box key={dm.id} display="flex" alignItems="center" gap="10" px="8" py="8"
          onClick={() => setSelectedParticipants(p => p.includes(dm.id) ? p.filter(x => x !== dm.id) : [...p, dm.id])}
          rounded="lg"
          style={{ cursor: "pointer", background: selectedParticipants.includes(dm.id) ? "var(--ax-colors-bg-default-hovered)" : "transparent" }}>
          <Box style={{ position: "relative", flexShrink: 0, display: "inline-flex" }}>
            {dm.avatar ? (
              <Avatar name={dm.name} src={dm.avatar} size="sm" />
            ) : (
              <Box style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, color: "var(--ax-colors-fg-secondary)", flexShrink: 0 }}>
                {dm.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
              </Box>
            )}
            {!dm.isVAU && dm.status && <Box rounded="full" style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, background: PRESENCE_COLOR[dm.status], border: "1.5px solid var(--ax-colors-bg-default)" }} />}
          </Box>
          <Text fontSize="md" color="fg.default" style={{ flex: 1 }}>{dm.name}</Text>
          {selectedParticipants.includes(dm.id) && <IconCircleCheck size={16} style={{ color: "var(--ax-colors-fg-secondary)" }} />}
        </Box>
      );
      return (
        <Dialog open={addParticipantsOpen} onOpenChange={open => { setAddParticipantsOpen(open); if (!open) { setAddParticipantMode(false); setParticipantSearch(""); setSelectedParticipants([]); } }}>
          <DialogContent style={{ width: 440 }}>
            <DialogHeader>{nameOverrides[selected] ?? group?.name ?? "Group"}</DialogHeader>
            <DialogBody>
              {addParticipantMode ? (
                <>
                  <Button appearance="subtle" size="sm" icon={<IconChevronLeft style={{ width: 14, height: 14 }} />}
                    onClick={() => { setAddParticipantMode(false); setParticipantSearch(""); setSelectedParticipants([]); }}
                    style={{ marginBottom: 12 }}>
                    Back to members
                  </Button>
                  <input autoFocus value={participantSearch} onChange={e => setParticipantSearch(e.target.value)}
                    placeholder="Search teammates…"
                    style={{ width: "100%", border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, padding: "8px 12px", fontFamily: "inherit", fontSize: 14, outline: "none", marginBottom: 12, background: "var(--ax-colors-bg-default)", color: "var(--ax-colors-fg-default)" }} />
                  <Box display="flex" flexDirection="column" gap="4">
                    {filteredPeople.length > 0 && <>
                      <Text fontSize="sm" fontWeight="500" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: "0.06em", padding: "4px 8px" }}>People</Text>
                      {filteredPeople.map(renderRow)}
                    </>}
                    {filteredVAUs.length > 0 && <>
                      <Text fontSize="sm" fontWeight="500" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: "0.06em", padding: "4px 8px", marginTop: filteredPeople.length > 0 ? 8 : 0 }}>Virtual Teammates</Text>
                      {filteredVAUs.map(renderRow)}
                    </>}
                  </Box>
                </>
              ) : (
                <>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb="12">
                    <Text fontSize="sm" color="fg.tertiary">
                      {(() => {
                        const count = (group?.memberList ?? []).filter(m => !(groupMemberRemovals[selected] ?? []).includes(m.name)).length;
                        return `${count} member${count !== 1 ? "s" : ""}`;
                      })()}
                    </Text>
                    <Button appearance="default" size="md" icon={<IconUserPlus style={{ width: 14, height: 14 }} />}
                      onClick={() => setAddParticipantMode(true)}>
                      Add team member
                    </Button>
                  </Box>
                  <Box display="flex" flexDirection="column" gap="4">
                    {(group?.memberList ?? [])
                      .filter(m => !(groupMemberRemovals[selected] ?? []).includes(m.name))
                      .map(m => (
                        <Box key={m.name} display="flex" alignItems="center" gap="10"
                          style={{ padding: "6px 4px", borderRadius: 8 }}
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--ax-colors-bg-secondary)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                            {m.avatar
                              ? <img src={m.avatar} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              : <div style={{ width: "100%", height: "100%", background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--ax-colors-fg-secondary)" }}>{m.name[0]}</div>
                            }
                          </div>
                          <Text fontSize="sm" color="fg.default" style={{ flex: 1 }}>{m.name}</Text>
                          <Button appearance="subtle" size="md"
                            icon={<IconTrashCan style={{ width: 16, height: 16, color: "var(--ax-colors-fg-tertiary)" }} />}
                            aria-label={`Remove ${m.name}`}
                            onClick={() => setGroupMemberRemovals(prev => ({ ...prev, [selected]: [...(prev[selected] ?? []), m.name] }))} />
                        </Box>
                      ))}
                  </Box>
                </>
              )}
            </DialogBody>
            <DialogFooter>
              {addParticipantMode ? (
                <>
                  <Button appearance="default" size="md" onClick={() => { setAddParticipantMode(false); setParticipantSearch(""); setSelectedParticipants([]); }}>Cancel</Button>
                  <Button appearance="primary" size="md" disabled={selectedParticipants.length === 0}
                    onClick={() => { setAddParticipantMode(false); setHistoryModalOpen(true); }}>
                    Add {selectedParticipants.length > 0 ? `(${selectedParticipants.length})` : ""}
                  </Button>
                </>
              ) : (
                <DialogClose asChild><Button appearance="default" size="md">Done</Button></DialogClose>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    })()}

    {/* ── Chat History Permissions Dialog ── */}
    {(() => {
      const historyLabel = historyOption === "none"
        ? "did not share chat history"
        : historyOption === "all"
          ? "shared all chat history"
          : `shared the last ${historyDays} day${historyDays === 1 ? "" : "s"} of chat history`;

      const resetHistory = () => {
        setHistoryModalOpen(false);
        setHistoryOption("none");
        setHistoryDays(1);
        setParticipantSearch("");
        setSelectedParticipants([]);
      };

      return (
        <Dialog
          open={historyModalOpen}
          onOpenChange={open => { if (!open) resetHistory(); }}
        >
          <DialogContent style={{ width: 440 }}>
            <DialogHeader>Chat history</DialogHeader>
            <DialogBody>
              <RadioGroup value={historyOption} onValueChange={v => setHistoryOption(v as "none" | "days" | "all")}>
                <Box display="flex" flexDirection="column" gap="12">
                  <Radio value="none">Don&rsquo;t include chat history</Radio>
                  <Radio value="days">Include history from the past number of days:</Radio>
                  {historyOption === "days" && (
                    <Box pl="24" onClick={e => e.stopPropagation()}>
                      <input
                        type="number"
                        min={1}
                        value={historyDays}
                        onChange={e => setHistoryDays(Math.max(1, Number(e.target.value)))}
                        style={{
                          width: 52, border: "1px solid var(--ax-colors-border-default)",
                          borderRadius: 6, padding: "2px 8px", fontFamily: "inherit", fontSize: 14,
                          outline: "none", textAlign: "center", background: "var(--ax-colors-bg-default)",
                          color: "var(--ax-colors-fg-default)",
                        }}
                      />
                    </Box>
                  )}
                  <Radio value="all">Include all chat history</Radio>
                </Box>
              </RadioGroup>
            </DialogBody>
            <DialogFooter>
              {(() => {
                const vauNames = selectedParticipants
                  .map(id => activeDMS.find(d => d.id === id))
                  .filter(d => d?.isVAU)
                  .map(d => d!.name);
                const vauLabel = vauNames.length === 1 ? vauNames[0] : vauNames.length > 1 ? vauNames.slice(0, -1).join(", ") + " and " + vauNames[vauNames.length - 1] : null;
                return vauLabel ? (
                  <Box display="flex" gap="6" style={{ marginRight: "auto", maxWidth: 200, alignItems: "flex-start" }}>
                    <IconCircleInfo size={16} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0, marginTop: 2 }} />
                    <Text fontSize="sm" color="fg.tertiary">{vauLabel} will respect the permissions you have enabled</Text>
                  </Box>
                ) : null;
              })()}
              <DialogClose asChild><Button appearance="default" size="md" onClick={resetHistory}>Cancel</Button></DialogClose>
              <Button appearance="primary" size="md" onClick={() => {
                const names = selectedParticipants.map(id => activeDMS.find(d => d.id === id)?.name ?? id);
                const nameStr = names.length === 1 ? names[0] : names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
                const sysMsg: Message = {
                  id: `sys-${Date.now()}`,
                  from: "system",
                  text: historyOption === "none"
                    ? `${nameStr} was added to the chat.`
                    : `Erika Schreiber added ${nameStr} to the chat and ${historyLabel}.`,
                };
                setThreads(prev => ({ ...prev, [selected]: [...(prev[selected] ?? []), sysMsg] }));
                resetHistory();
              }}>
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    })()}

    {/* ── Native file input ── */}
    <input
      ref={fileInputRef}
      type="file"
      multiple
      style={{ display: "none" }}
      onChange={e => {
        const files = Array.from(e.target.files ?? []);
        files.forEach(file => {
          const ci = { id: `file-${file.name}`, title: file.name, type: file.type || "file", accent: "#f0f4f8", accentDark: "#64748b", lines: [80, 65, 75, 55, 70] as number[] };
          setPendingAttachments(prev => prev.find(a => a.id === ci.id) ? prev : [...prev, ci]);
        });
        e.target.value = "";
      }}
    />

    {/* ── Artifact Picker Dialog ── */}
    {(() => {
      const artifacts = selected ? (ALL_ARTIFACTS[selected] ?? Object.values(ALL_ARTIFACTS).flat().slice(0, 6)) : [];
      const sendArtifact = (item: Deliverable & { thumbnail?: string }) => {
        const ci = { id: item.id, title: item.title, type: item.type, accent: "#f0f4f8", accentDark: "#64748b", lines: [80, 65, 75, 55, 70] as number[] };
        setPendingAttachments(prev => prev.find(a => a.id === item.id) ? prev : [...prev, ci]);
        setArtifactPickerOpen(false);
      };
      return (
        <Dialog open={artifactPickerOpen} onOpenChange={setArtifactPickerOpen}>
          <DialogContent style={{ width: 480 }}>
            <DialogHeader>Share an artifact</DialogHeader>
            <DialogBody>
              <Box display="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {artifacts.map((item, idx) => (
                  <Box key={item.id} rounded="lg" onClick={() => sendArtifact(item)}
                    style={{ border: "1px solid var(--ax-colors-border-default)", overflow: "hidden", background: "var(--ax-colors-bg-default)", cursor: "pointer" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--ax-colors-border-focus)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--ax-colors-border-default)"; }}>
                    <Box style={{ height: 72, overflow: "hidden", background: "var(--ax-colors-bg-secondary)", position: "relative" }}>
                      {item.thumbnail && <img src={item.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                      <Box rounded="sm" style={{ position: "absolute", top: 5, left: 5, width: 18, height: 18, background: "var(--ax-colors-bg-default)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <IconFileLines size={10} style={{ color: "var(--ax-colors-fg-secondary)" }} />
                      </Box>
                    </Box>
                    <Box style={{ borderTop: "1px solid var(--ax-colors-border-tertiary)", padding: "7px 9px" }}>
                      <Text fontSize="sm" fontWeight="500" color="fg.default" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", marginBottom: 3 }}>{item.title}</Text>
                      <Badge intent="neutral">{item.type}</Badge>
                    </Box>
                  </Box>
                ))}
              </Box>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild><Button appearance="default" size="md">Cancel</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    })()}

    {/* ── Agent Picker Dialog ── */}
    <Dialog open={agentPickerOpen} onOpenChange={setAgentPickerOpen}>
      <DialogContent size="md">
        <DialogHeader>Share a skill</DialogHeader>
        <DialogBody style={{ padding: 0 }}>
          <Table>
            <thead>
              <Tr>
                <Th>Name</Th>
                <Th style={{ width: 140 }}>Created by</Th>
                <Th style={{ width: 120 }}>Last modified</Th>
              </Tr>
            </thead>
            <tbody>
              {MOCK_SKILLS.map(skill => (
                <Tr key={skill.id} onClick={() => {
                  setThreads(prev => ({ ...prev, [selected]: [...(prev[selected] ?? []), {
                    id: Date.now().toString(), from: "user" as const,
                    senderAvatar: "https://i.pravatar.cc/150?img=24",
                    text: "",
                    agentCard: { name: skill.name, emoji: "📖", description: skill.description, tags: [], connectors: [], workingWith: [] },
                  }] }));
                  setAgentPickerOpen(false);
                }}>
                  <Td type="header" description={skill.description}>{skill.name}</Td>
                  <Td>
                    <Box display="flex" alignItems="center" gap="8">
                      <Avatar name={skill.createdBy.name} size="sm" style={{ flexShrink: 0 }} />
                      <Text fontSize="sm" color="fg.default" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{skill.createdBy.name}</Text>
                    </Box>
                  </Td>
                  <Td>
                    <Text fontSize="sm" color="fg.default" style={{ display: "block", whiteSpace: "nowrap" }}>{skill.lastModified.date}</Text>
                    <Text fontSize="sm" color="fg.tertiary" style={{ display: "block", whiteSpace: "nowrap" }}>by {skill.lastModified.by}</Text>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild><Button appearance="default" size="md">Cancel</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Notification settings modal */}
    <Dialog open={notifModalOpen} onOpenChange={setNotifModalOpen}>
      <DialogContent style={{ width: 360 }}>
        <DialogHeader>
          {selectedGroup
            ? `Notifications for ${nameOverrides[selected] ?? selectedGroup.name}`
            : selectedChannel
            ? `Notifications for ${nameOverrides[selected] ?? selectedChannel.name}`
            : selectedDM
            ? `Notifications for ${selectedDM.name}`
            : "Notification settings"}
        </DialogHeader>
        <DialogBody>
          {notifMenuContent}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild><Button appearance="default" size="md">Close</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Rename dialog */}
    <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
      <DialogContent style={{ width: 360 }}>
        <DialogHeader>{selectedGroup ? "Rename Group" : "Rename Channel"}</DialogHeader>
        <DialogBody>
          <input
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && renameValue.trim()) { onRename(selected, renameValue.trim()); setRenameDialogOpen(false); } }}
            style={{ width: "100%", fontSize: 14, padding: "8px 10px", borderRadius: 6, border: "1px solid var(--ax-colors-border-secondary)", background: "var(--ax-colors-bg-default)", color: "var(--ax-colors-fg-default)", outline: "none" }}
            autoFocus
          />
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild><Button appearance="default" size="md">Cancel</Button></DialogClose>
          <Button appearance="primary" size="md"
            onClick={() => { if (renameValue.trim()) { onRename(selected, renameValue.trim()); setRenameDialogOpen(false); } }}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Move to another section dialog */}
    <Dialog open={moveToSectionOpen} onOpenChange={setMoveToSectionOpen}>
      <DialogContent style={{ width: 360 }}>
        <DialogHeader>Move to another section</DialogHeader>
        <DialogBody>
          {sections.filter(s => !["dms", "groups", "channels"].includes(s.id)).length === 0 ? (
            <Text fontSize="sm" color="fg.tertiary">No custom sections yet — add one from the sidebar.</Text>
          ) : (
            <Box display="flex" flexDirection="column" gap="2">
              {sections.filter(s => !["dms", "groups", "channels"].includes(s.id)).map(s => (
                <Button
                  key={s.id}
                  appearance="subtle"
                  size="md"
                  onClick={() => { onMoveToSection(selected, s.id); setMoveToSectionOpen(false); }}
                  style={{ width: "100%", justifyContent: "flex-start" }}
                >
                  {s.label}
                </Button>
              ))}
            </Box>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild><Button appearance="default" size="md">Cancel</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Leave confirmation dialog */}
    <Dialog open={leaveConfirmOpen} onOpenChange={setLeaveConfirmOpen}>
      <DialogContent style={{ width: 360 }}>
        <DialogHeader>{selectedGroup ? "Leave Group" : "Leave Channel"}</DialogHeader>
        <DialogBody>
          <Text fontSize="sm">
            Are you sure you want to leave{" "}
            <strong>
              {selectedGroup
                ? (nameOverrides[selected] ?? selectedGroup.name)
                : selectedChannel
                ? (nameOverrides[selected] ?? selectedChannel.name)
                : "this conversation"}
            </strong>?
          </Text>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild><Button appearance="default" size="md">Cancel</Button></DialogClose>
          <Button appearance="subtle" size="md"
            style={{ color: "var(--ax-colors-fg-danger)" }}
            onClick={() => { onLeave(selected); setLeaveConfirmOpen(false); }}>
            Leave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    </Box>
  );
}

// ── New Message Pane ──────────────────────────────────────────────────────────

const RECENT_CONTACTS: (DMItem & { role: string })[] = [
  { id: "js",   name: "Jane Smith",          avatar: "https://i.pravatar.cc/150?img=47", status: "active", role: "Sr. Content Strategist" },
  { id: "ao",   name: "Amara Osei",          avatar: "https://i.pravatar.cc/150?img=38", status: "active", role: "Brand Designer" },
  { id: "pr",   name: "Priya Rajan",         avatar: "https://i.pravatar.cc/150?img=44", status: "away",   role: "UX Researcher" },
  { id: "hw",   name: "Harry Winston-Brown", avatar: "https://i.pravatar.cc/150?img=52", status: "busy",   role: "Product Manager" },
  { id: "bubs", name: "Randy",                avatar: "/vau-bubs.svg",                    status: "active", isVAU: true, role: "Content Drafting" },
  { id: "kara", name: "Kara",                avatar: "/vau-kara.svg",                    status: "active", isVAU: true, role: "SEO & Content Strategy" },
  { id: "eric", name: "Eric",                avatar: "/vau-eric.svg",                    status: "ooo",    isVAU: true, role: "A/B Testing & Experimentation" },
];

function NewMessagePane({ onStartConversation, onClose }: {
  onStartConversation: (chips: typeof RECENT_CONTACTS, message: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [chips, setChips] = useState<typeof RECENT_CONTACTS>([]);
  const [composerText, setComposerText] = useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const composerRef = React.useRef<HTMLTextAreaElement>(null);


  const chipIds = chips.map(c => c.id);
  const filtered = RECENT_CONTACTS.filter(c =>
    !chipIds.includes(c.id) && (!query.trim() || c.name.toLowerCase().includes(query.toLowerCase()))
  );

  const addChip = (c: typeof RECENT_CONTACTS[0]) => {
    setChips(prev => [...prev, c]);
    setQuery("");
    setTimeout(() => composerRef.current?.focus() ?? inputRef.current?.focus(), 0);
  };

  const removeChip = (id: string) => setChips(prev => prev.filter(c => c.id !== id));

  const openConversation = (msg = "") => {
    if (chips.length === 0) return;
    onStartConversation(chips, msg);
  };

  return (
    <Box display="flex" flexDirection="column" style={{ flex: 1, height: "100%", background: "var(--ax-colors-bg-default)", minWidth: 0 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" px="20"
        style={{ height: 52, borderBottom: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0 }}>
        <Text fontWeight="600" fontSize="lg" color="fg.default">New message</Text>
        <Box style={{ flex: 1 }} />
        <Button appearance="subtle" size="sm" icon={<IconXmark style={{ width: 14, height: 14 }} />}
          aria-label="Close" onClick={onClose} style={{ width: 28, height: 28, padding: 0 }} />
      </Box>

      {/* To: field with chips */}
      <Box display="flex" alignItems="center" flexWrap="wrap" px="20" gap="6"
        onClick={() => inputRef.current?.focus()}
        style={{ borderBottom: "1px solid var(--ax-colors-border-secondary)", minHeight: 44, padding: "8px 20px", cursor: "text", flexShrink: 0 }}>
        <Text fontSize="md" color="fg.tertiary" style={{ fontWeight: 500, flexShrink: 0 }}>To:</Text>
        {chips.map(c => (
          <Box key={c.id} display="flex" alignItems="center" gap="4"
            rounded="full"
            style={{ background: "var(--ax-colors-bg-default-hovered)", padding: "2px 10px 2px 6px", flexShrink: 0 }}>
            <Avatar name={c.name} src={c.avatar} size="2xs" />
            <Text fontSize="sm" color="fg.default" style={{ fontWeight: 500 }}>{c.name}</Text>
            <Box onClick={e => { e.stopPropagation(); removeChip(c.id); }}
              style={{ cursor: "pointer", marginLeft: 2, color: "var(--ax-colors-fg-tertiary)", lineHeight: 1 }}>
              <IconXmark size={10} />
            </Box>
          </Box>
        ))}
        <input
          ref={inputRef}
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === "Backspace" && !query && chips.length > 0) removeChip(chips[chips.length - 1].id); }}
          placeholder={chips.length === 0 ? "#a-channel, @somebody, or somebody@example.com" : ""}
          style={{ border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 14, color: "var(--ax-colors-fg-default)", minWidth: 120, flex: 1 }}
        />
      </Box>

      {/* Recent contacts */}
      <Box display="flex" flexDirection="column" style={{ flex: 1, overflowY: "auto" }}>
        <Box px="20" pt="16" pb="8">
          <Text fontSize="sm" fontWeight="500" color="fg.tertiary" style={{ letterSpacing: "0.05em", textTransform: "uppercase" }}>
            {query.trim() ? "Results" : "Recent"}
          </Text>
        </Box>
        {filtered.map(c => (
          <Box key={c.id} display="flex" alignItems="center" gap="12" px="20" py="8"
            onClick={() => addChip(c)}
            style={{ cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--ax-colors-bg-secondary)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <Box style={{ position: "relative", flexShrink: 0 }}>
              <Avatar name={c.name} src={c.avatar} size="md" />
              {c.status && <Box rounded="full" style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, background: PRESENCE_COLOR[c.status], border: "1.5px solid var(--ax-colors-bg-default)" }} />}
            </Box>
            <Box>
              <Box display="flex" alignItems="center" gap="6">
                <Text fontSize="md" color="fg.default">{c.name}</Text>
              </Box>
              <Text fontSize="sm" color="fg.tertiary">{c.role}</Text>
            </Box>
          </Box>
        ))}
        {filtered.length === 0 && chips.length > 0 && !query && (
          <Box px="20" py="16" display="flex" justifyContent="center">
            <Button appearance="primary" size="md" onClick={() => openConversation()}>
              Open conversation
            </Button>
          </Box>
        )}
        {filtered.length === 0 && query && (
          <Box px="20" py="24">
            <Text fontSize="sm" color="fg.tertiary">No contacts found for "{query}"</Text>
          </Box>
        )}
      </Box>

      {/* Composer — live when at least one person is selected */}
      {chips.length > 0 && (
        <Box px="16" pb="16" style={{ flexShrink: 0 }}>
          <Box style={{ border: "1px solid var(--ax-colors-border-default, #d8e4cb)", borderRadius: 8, background: "var(--ax-colors-bg-default)" }}>
            <Box display="flex" alignItems="center" px="4"
              style={{ height: 37, background: "var(--ax-colors-bg-tertiary, #eff5eb)", borderRadius: "8px 8px 0 0" }}>
              <ToolbarBtn icon={<IconBold />} label="Bold" />
              <ToolbarBtn icon={<IconItalic />} label="Italic" />
              <ToolbarBtn icon={<IconUnderline />} label="Underline" />
              <ToolbarBtn icon={<IconStrikethrough />} label="Strikethrough" />
              <Box style={{ width: 1, height: 18, background: "var(--ax-colors-border-secondary)", margin: "0 4px", flexShrink: 0 }} />
              <ToolbarBtn icon={<IconLink />} label="Link" />
              <ToolbarBtn icon={<IconListOl />} label="Ordered list" />
              <ToolbarBtn icon={<IconListUl />} label="Bullet list" />
              <ToolbarBtn icon={<IconQuoteRight />} label="Block quote" />
              <Box style={{ width: 1, height: 18, background: "var(--ax-colors-border-secondary)", margin: "0 4px", flexShrink: 0 }} />
              <ToolbarBtn icon={<IconCode />} label="Code" />
            </Box>
            <textarea
              ref={composerRef}
              value={composerText}
              onChange={e => setComposerText(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (composerText.trim()) openConversation(composerText.trim());
                }
              }}
              placeholder="Start a new message…"
              style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 14, color: "var(--ax-colors-fg-default)", resize: "none", minHeight: 72, padding: "12px", lineHeight: 1.5, borderRadius: 8, display: "block" }}
            />
            <Box display="flex" justifyContent="flex-end" px="8" pb="8">
              <Button
                appearance="primary" size="sm"
                icon={<IconSend style={{ width: 13, height: 13 }} />}
                aria-label="Send"
                disabled={!composerText.trim()}
                onClick={() => { if (composerText.trim()) openConversation(composerText.trim()); }}
                style={{ width: 28, height: 28, padding: 0 }}
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ── Blog Review Panel ─────────────────────────────────────────────────────────

function BlogReviewPanel({ open, onClose, onWorkInOpal, onExpand }: { open: boolean; onClose: () => void; onWorkInOpal: (prompt?: string) => void; onExpand?: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectionBar, setSelectionBar] = useState<{ top: number; left: number } | null>(null);
  const [opalPopoverOpen, setOpalPopoverOpen] = useState(false);
  const [opalPrompt, setOpalPrompt] = useState("");
  const [opalPopoverPos, setOpalPopoverPos] = useState<{ top: number; left: number } | null>(null);

  type Annotation = { id: string; text: string; top: number; author: string; avatar: string; resolved: boolean };
  const [annotations, setAnnotations] = useState<Annotation[]>([
    { id: "a1", text: "This opening stat is really strong — let's make sure it's sourced.", top: 310, author: "Lisa Gray",     avatar: "https://i.pravatar.cc/150?img=5",  resolved: false },
    { id: "a2", text: "Randy → should we call it out by full name on first mention?",           top: 430, author: "Marcus Santos", avatar: "https://i.pravatar.cc/150?img=12", resolved: false },
  ]);
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);
  const [collapsedAnnotationIds, setCollapsedAnnotationIds] = useState<Set<string>>(new Set(["a1", "a2"]));
  const collapseAnnotation = (id: string) => setCollapsedAnnotationIds(prev => new Set([...prev, id]));
  const expandAnnotation   = (id: string) => setCollapsedAnnotationIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  const articleRef = useRef<HTMLDivElement>(null);
  const textBoxRef = useRef<HTMLDivElement>(null);

  const handleAddComment = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const boxRect = textBoxRef.current?.getBoundingClientRect();
    const scrollTop = articleRef.current?.scrollTop ?? 0;
    const topRelative = boxRect ? rect.top - boxRect.top + scrollTop : rect.top;
    const id = Date.now().toString();
    setAnnotations(prev => [...prev, {
      id,
      text: "",
      top: Math.max(0, topRelative),
      author: "You",
      avatar: "",
      resolved: false,
    }]);
    setActiveAnnotationId(id);
    setSelectionBar(null);
    sel.removeAllRanges();
  };

  const handleSendToOpal = () => {
    onWorkInOpal(opalPrompt.trim() || undefined);
    setOpalPopoverOpen(false);
    setOpalPopoverPos(null);
    setOpalPrompt("");
    setSelectionBar(null);
  };

  // Escape key closes fullscreen
  useEffect(() => {
    if (!isExpanded) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsExpanded(false); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isExpanded]);

  // Dismiss selection bar when selection is cleared
  useEffect(() => {
    const onSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        setSelectionBar(null);
      }
    };
    document.addEventListener("selectionchange", onSelectionChange);
    return () => document.removeEventListener("selectionchange", onSelectionChange);
  }, []);

  const handleArticleMouseUp = () => {
    if (!isExpanded) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setSelectionBar(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    // clamp so toolbar never clips off either edge
    const clampedLeft = Math.max(200, Math.min(rect.left + rect.width / 2, window.innerWidth - 220));
    setSelectionBar({ top: rect.top - 52, left: clampedLeft });
  };

  // Shared pieces used in both layouts
  const reviewFooter = (
    <>
      {/* Comment input */}
      <Box
        rounded="lg"
        style={{
          background: "var(--ax-colors-bg-default, white)",
          border: "1px solid var(--ax-colors-border-default, #d8e4cb)",
          padding: "8px 12px",
          flexShrink: 0,
        }}
      >
        <textarea
          placeholder="Leave a comment…"
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            resize: "none",
            background: "transparent",
            fontFamily: "inherit",
            fontSize: 14,
            color: "var(--ax-colors-fg-default)",
            lineHeight: 1.5,
            height: 56,
            boxSizing: "border-box" as const,
          }}
        />
      </Box>
      {/* Action buttons */}
      <Box display="flex" alignItems="center" gap="8" justifyContent="flex-end">
        <Menu
          options={[
            { label: "Download" },
            { label: "Work in Opal", execute: () => onWorkInOpal() },
          ]}
        >
          <MenuTrigger asChild>
            <Button
              appearance="subtle"
              size="sm"
              icon={<IconEllipsisSolid size={16} />}
              aria-label="More options"
            />
          </MenuTrigger>
          <MenuContent align="end" />
        </Menu>
        <Button appearance="default" size="sm">
          Request Changes
        </Button>
        <Button appearance="primary" size="sm">
          Approve
        </Button>
      </Box>
    </>
  );

  // Waypoints are {top, left} relative to the text content box.
  // Each cursor cycles through its waypoints on its own interval so they feel independent.
  const CURSOR_WAYPOINTS = {
    lisa: [
      { top: 148, left: 220 },  // para 1 line 1
      { top: 172, left: 140 },  // para 1 line 2
      { top: 220, left: 310 },  // para 1 line 4
      { top: 310, left: 68  },  // para 3 line 1
      { top: 334, left: 255 },  // para 3 line 2
    ],
    marcus: [
      { top: 148, left: 310 },  // para 1 line 1
      { top: 260, left: 180 },  // para 2 line 2
      { top: 380, left: 95  },  // para 4 line 1
      { top: 404, left: 340 },  // para 4 line 2
      { top: 460, left: 190 },  // para 5 line 1
    ],
  };

  const [lisaIdx,   setLisaIdx]   = useState(0);
  const [marcusIdx, setMarcusIdx] = useState(2);

  useEffect(() => {
    if (!isExpanded) return;
    const t = setInterval(() => setLisaIdx(i => (i + 1) % CURSOR_WAYPOINTS.lisa.length), 2800);
    return () => clearInterval(t);
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) return;
    const t = setInterval(() => setMarcusIdx(i => (i + 1) % CURSOR_WAYPOINTS.marcus.length), 3700);
    return () => clearInterval(t);
  }, [isExpanded]);

  const ARTICLE_PRESENCE = [
    { id: "lisa",   name: "Lisa",   color: "var(--opal-collab-accent)", ...CURSOR_WAYPOINTS.lisa[lisaIdx]   },
    { id: "marcus", name: "Marcus", color: "var(--opal-vau-bubs)", ...CURSOR_WAYPOINTS.marcus[marcusIdx] },
  ];

  const articleContent = (
    <Box
      ref={isExpanded ? articleRef : undefined}
      onMouseUp={handleArticleMouseUp}
      style={{ flex: 1, overflowY: "auto", minHeight: 0 }}
    >
      {/* Cover image */}
      <img
        src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80"
        alt=""
        style={{ width: "100%", height: isExpanded ? 260 : 180, objectFit: "cover", display: "block" }}
      />
      {/* Outer row: text column + annotation sidebar */}
      <div style={{
        maxWidth: isExpanded ? 900 : undefined,
        margin: isExpanded ? "0 auto" : undefined,
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
      }}>
        {/* ── Text column ── */}
        <div
          ref={isExpanded ? (textBoxRef as React.RefObject<HTMLDivElement>) : undefined}
          style={{
            flex: 1,
            minWidth: 0,
            padding: "20px 20px 20px 20px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Google Docs–style collaborator cursors */}
          {isExpanded && ARTICLE_PRESENCE.map(p => (
            <Box key={p.id} style={{ position: "absolute", top: p.top, left: p.left, pointerEvents: "none", zIndex: 5, transition: "top 0.6s cubic-bezier(0.4,0,0.2,1), left 0.6s cubic-bezier(0.4,0,0.2,1)" }}>
              <Box style={{
                position: "absolute", bottom: "100%", left: 0,
                background: p.color, color: "white", fontSize: 11, fontWeight: 600,
                padding: "2px 7px", borderRadius: "4px 4px 4px 0",
                whiteSpace: "nowrap" as const, lineHeight: "17px", userSelect: "none" as const,
              }}>{p.name}</Box>
              <Box style={{ width: 2, height: 22, background: p.color }} />
            </Box>
          ))}

          {/* Title */}
          <Text fontWeight="700" color="fg.default" style={{ fontSize: isExpanded ? 26 : 20, lineHeight: 1.3, letterSpacing: "-0.3px" }}>
            Discover the Unknown: Q&A
          </Text>
          {/* Meta */}
          <Box display="flex" flexDirection="column" gap="6">
            <Box display="flex" alignItems="center" gap="8">
              <Avatar name="Erika Schreiber" src="https://i.pravatar.cc/150?img=24" size="sm" />
              <Text fontSize="sm" color="fg.secondary">Erika Schreiber</Text>
              <Box rounded="full" style={{ width: 3, height: 3, background: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
              <Text fontSize="sm" color="fg.secondary" style={{ whiteSpace: "nowrap" }}>May 20, 2026</Text>
            </Box>
            <Box rounded="sm" style={{ display: "inline-flex", alignItems: "center", background: "var(--ax-colors-bg-tertiary, #eff5eb)", padding: "2px 8px", alignSelf: "flex-start" }}>
              <Text fontSize="sm" color="fg.secondary" style={{ whiteSpace: "nowrap" }}>5 min read</Text>
            </Box>
          </Box>
          {/* Body */}
          <Box display="flex" flexDirection="column" gap="12">
            <Text fontSize="md" color="fg.default" style={{ lineHeight: 1.7 }}>
              As we move into Q3, the conversation around AI in content marketing has shifted from "should we use it?" to "how do we use it well?" The early excitement has given way to more nuanced questions about quality, authenticity, and long-term brand equity.
            </Text>
            <Text fontSize="md" color="fg.default" style={{ lineHeight: 1.7 }}>
              Our team has been piloting AI-assisted content workflows for the past two quarters, using Randy — our in-house content VAU — to accelerate drafting and ideation. The results are promising: we've seen a 40% reduction in first-draft time and a measurable improvement in content consistency across channels.
            </Text>
            <Text fontSize="md" color="fg.default" style={{ lineHeight: 1.7 }}>
              But speed isn't the whole story. The most significant gains have come from using AI as a thinking partner rather than a writing replacement. When we ask Randy to challenge our assumptions or generate alternative angles, we consistently end up with more creative, audience-relevant content.
            </Text>
            <Text fontSize="md" color="fg.default" style={{ lineHeight: 1.7 }}>
              For Q3, we're doubling down on three content pillars: thought leadership, customer stories, and product education. Each has a distinct role in our funnel, and each benefits differently from AI assistance. Thought leadership requires a strong human voice; AI can help with structure and research synthesis. Customer stories need authenticity — AI earns its keep in post-interview editing and SEO optimization.
            </Text>
            <Text fontSize="md" color="fg.default" style={{ lineHeight: 1.7 }}>
              The bottom line: AI is a multiplier, not a replacement. Teams that treat it as a collaborative tool — not a content vending machine — will produce the kind of work that builds genuine audience trust over time.
            </Text>
          </Box>
        </div>

        {/* ── Annotation sidebar — own fixed-width column, never overlaps text ── */}
        {isExpanded && (
          <div style={{ width: 236, flexShrink: 0, position: "relative", paddingTop: 20 }}>
            {annotations.filter(a => !a.resolved).map(a => (
            <div
              key={a.id}
              style={{
                position: "absolute",
                top: a.top,
                left: 8,
                width: collapsedAnnotationIds.has(a.id) ? 44 : 220,
                pointerEvents: "auto",
                zIndex: 10,
              }}
            >
              {collapsedAnnotationIds.has(a.id) ? (
                /* Collapsed — icon chip, click to reopen */
                <button
                  onClick={() => expandAnnotation(a.id)}
                  title={`${a.author}: ${a.text}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: "#fffbeb", border: "1px solid #fde68a",
                    borderRadius: 20, padding: "4px 10px 4px 7px",
                    cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    transition: "all 0.15s", fontFamily: "inherit",
                  }}
                >
                  {a.avatar ? (
                    <img src={a.avatar} alt={a.author} style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0 }} />
                  ) : (
                    <Box rounded="full" style={{ width: 16, height: 16, background: "var(--ax-colors-bg-tertiary)", fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>Y</Box>
                  )}
                  <IconComment size={12} style={{ color: "#92400e", flexShrink: 0 }} />
                </button>
              ) : (
                /* Expanded card — shown by default */
                <Box
                  shadow="lg"
                  rounded="lg"
                  style={{
                  background: "var(--ax-colors-bg-default)",
                  border: "1px solid var(--opal-annotation-border, #fbbf24)",
                  overflow: "hidden",
                }}>
                  {/* Card header */}
                  <Box display="flex" alignItems="center" gap="8" px="10" style={{ paddingTop: 8, paddingBottom: a.text ? 4 : 0 }}>
                    {a.avatar ? (
                      <img src={a.avatar} alt={a.author} style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0 }} />
                    ) : (
                      <Box rounded="full" style={{ width: 20, height: 20, background: "var(--ax-colors-bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, flexShrink: 0 }}>Y</Box>
                    )}
                    <Text style={{ fontSize: 12, fontWeight: 600, color: "var(--ax-colors-fg-default)", flex: 1 }}>{a.author}</Text>
                    {/* × to collapse */}
                    <button
                      onClick={e => { e.stopPropagation(); collapseAnnotation(a.id); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ax-colors-fg-tertiary)", fontSize: 14, lineHeight: 1, padding: "0 2px", fontFamily: "inherit" }}
                      title="Dismiss"
                    >×</button>
                  </Box>

                  {a.text ? (
                    /* Existing comment */
                    <>
                      <Box px="10" style={{ paddingBottom: 8 }}>
                        <Text style={{ fontSize: 12, color: "var(--ax-colors-fg-default)", lineHeight: 1.5 }}>{a.text}</Text>
                      </Box>
                      <Box display="flex" justifyContent="flex-end" px="10" style={{ paddingBottom: 8 }}>
                        <button
                          onClick={e => { e.stopPropagation(); setAnnotations(prev => prev.map(x => x.id === a.id ? { ...x, resolved: true } : x)); }}
                          style={{ background: "none", border: "none", fontSize: 10, cursor: "pointer", color: "#92400e", fontFamily: "inherit", fontWeight: 600 }}
                        >Resolve ✓</button>
                      </Box>
                    </>
                  ) : (
                    /* New comment input */
                    <>
                      <textarea
                        autoFocus
                        placeholder="Add a comment…"
                        style={{
                          width: "100%", border: "none", outline: "none", resize: "none",
                          padding: "6px 10px", fontSize: 12, fontFamily: "inherit",
                          lineHeight: 1.5, minHeight: 60, boxSizing: "border-box" as const,
                          color: "var(--ax-colors-fg-default)", background: "transparent",
                        }}
                        onKeyDown={e => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            const text = (e.target as HTMLTextAreaElement).value.trim();
                            if (!text) { setAnnotations(prev => prev.filter(x => x.id !== a.id)); }
                            else {
                              setAnnotations(prev => prev.map(x => x.id === a.id ? { ...x, text } : x));
                              collapseAnnotation(a.id);
                            }
                            setActiveAnnotationId(null);
                          }
                          if (e.key === "Escape") {
                            setAnnotations(prev => prev.filter(x => x.id !== a.id));
                            setActiveAnnotationId(null);
                          }
                        }}
                      />
                      <Box display="flex" justifyContent="flex-end" gap="6" px="8" style={{ paddingBottom: 8 }}>
                        <button onClick={() => { setAnnotations(prev => prev.filter(x => x.id !== a.id)); setActiveAnnotationId(null); }}
                          style={{ background: "none", border: "none", fontSize: 11, cursor: "pointer", color: "var(--ax-colors-fg-secondary)", fontFamily: "inherit" }}>Cancel</button>
                        <button style={{ background: "#fbbf24", border: "none", borderRadius: 4, fontSize: 11, cursor: "pointer", padding: "3px 10px", fontFamily: "inherit", fontWeight: 600 }}>
                          Save
                        </button>
                      </Box>
                    </>
                  )}
                </Box>
              )}
            </div>
            ))}
          </div>
        )}
      </div>
    </Box>
  );

  const panelHeader = (
    <Box
      display="flex"
      alignItems="center"
      gap="10"
      px="16"
      style={{
        height: 56,
        borderBottom: "1px solid var(--ax-colors-border-tertiary)",
        flexShrink: 0,
      }}
    >
      <Box
        rounded="md"
        style={{
          width: 28,
          height: 28,
          background: "var(--ax-colors-bg-secondary, #eff5eb)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <IconFileLines style={{ width: 14, height: 14, color: "var(--ax-colors-fg-secondary)" }} />
      </Box>
      <Text
        fontWeight="600"
        color="fg.default"
        style={{ flex: 1, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
      >
        discover-the-unknown-qa.md
      </Text>
      <Box display="flex" alignItems="center" gap="2">
        <Tooltip content={isExpanded ? "Exit fullscreen" : "Expand"} delayDuration={300}>
          <span>
            <Button
              appearance="subtle"
              size="sm"
              icon={isExpanded
                ? <IconArrowsMinimize style={{ width: 14, height: 14 }} />
                : <IconArrowsMaximize style={{ width: 14, height: 14 }} />
              }
              aria-label="Expand panel"
              onClick={() => onExpand?.()}
              style={{ width: 28, height: 28, padding: 0 }}
            />
          </span>
        </Tooltip>
        <Tooltip content="Close" delayDuration={300}>
          <span>
            <Button
              appearance="subtle"
              size="sm"
              icon={<IconXmark style={{ width: 14, height: 14 }} />}
              aria-label="Close panel"
              onClick={() => { setIsExpanded(false); onClose(); }}
              style={{ width: 28, height: 28, padding: 0 }}
            />
          </span>
        </Tooltip>
      </Box>
    </Box>
  );

  const panelContent = isExpanded ? (
    // ── Fullscreen: two-column layout ──────────────────────────────────────────
    <Box
      display="flex"
      style={{ position: "fixed" as const, inset: 0, zIndex: 50, flexDirection: "row" as const, background: "var(--ax-colors-bg-default)" }}
    >
      {/* Left: header + article + review actions */}
      <Box display="flex" flexDirection="column" style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
        {panelHeader}

        {/* ── Collaboration mode banner ── */}
        <Box display="flex" alignItems="center" gap="8" px="12" style={{
          height: 32, flexShrink: 0,
          background: "var(--opal-collab-bg, #f5f0ff)",
          borderBottom: "1px solid var(--opal-collab-border, #ede9fe)",
        }}>
          <Box rounded="full" style={{
            width: 7, height: 7,
            background: "var(--opal-collab-accent, #7c3aed)", flexShrink: 0,
            animation: "opal-collab-pulse 1.5s ease-in-out infinite",
          }} />
          <Text fontWeight="600" style={{ fontSize: 12, color: "var(--opal-collab-text, #6d28d9)" }}>Collaboration mode</Text>
          <Text style={{ fontSize: 12, color: "var(--opal-collab-muted, #a78bfa)" }}>·</Text>
          <Box display="flex" alignItems="center" style={{ flexShrink: 0 }}>
            {[
              { name: "Lisa Gray",     src: "https://i.pravatar.cc/150?img=5"  },
              { name: "Marcus Santos", src: "https://i.pravatar.cc/150?img=12" },
            ].map((c, i) => (
              <img key={c.name} src={c.src} alt={c.name} title={c.name}
                style={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid white", marginLeft: i === 0 ? 0 : -4, flexShrink: 0 }} />
            ))}
          </Box>
          <Text style={{ fontSize: 12, color: "var(--opal-collab-text, #6d28d9)" }}>Lisa and Marcus are here</Text>
        </Box>

        {articleContent}
        <Box
          px="16"
          pt="12"
          pb="16"
          display="flex"
          flexDirection="column"
          gap="8"
          style={{
            borderTop: "1px solid var(--ax-colors-border-tertiary)",
            flexShrink: 0,
            background: "var(--ax-colors-bg-default, white)",
          }}
        >
          {reviewFooter}
        </Box>
      </Box>

      {/* Right: collaboration rail */}
      <CollabRail open={true} />

      {/* Opal prompt popover */}
      {opalPopoverOpen && opalPopoverPos && (
        <Box
          onMouseDown={(e) => e.stopPropagation()}
          display="flex"
          flexDirection="column"
          gap="10"
          shadow="xl"
          rounded="xl"
          style={{
            position: "fixed" as const,
            top: opalPopoverPos.top + 50,
            left: opalPopoverPos.left,
            transform: "translateX(-50%)",
            zIndex: 101,
            background: "var(--ax-colors-bg-default)",
            border: "1px solid var(--ax-colors-border-default, #d8e4cb)",
            padding: "12px",
            width: 320,
          }}
        >
          <textarea
            autoFocus
            value={opalPrompt}
            onChange={(e) => setOpalPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendToOpal(); }
              if (e.key === "Escape") { setOpalPopoverOpen(false); }
            }}
            placeholder="Ask Opal about this selection…"
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              resize: "none",
              background: "transparent",
              fontFamily: "inherit",
              fontSize: 13,
              color: "var(--ax-colors-fg-default)",
              lineHeight: 1.6,
              minHeight: 72,
              boxSizing: "border-box" as const,
            }}
          />
          <Box display="flex" alignItems="center" justifyContent="flex-end" gap="8">
            <Button
              appearance="subtle"
              size="sm"
              onClick={() => setOpalPopoverOpen(false)}
            >
              Cancel
            </Button>
            <Button
              appearance="primary"
              size="sm"
              rounded="full"
              onClick={handleSendToOpal}
              disabled={!opalPrompt.trim()}
              style={{ paddingLeft: 10, paddingRight: 12 }}
            >
              <img src="/opal-orb.svg" alt="" width={13} height={13} style={{ display: "inline-block", verticalAlign: "middle", marginRight: 4 }} />
              Send to Opal
            </Button>
          </Box>
        </Box>
      )}

      {/* Floating selection toolbar */}
      {selectionBar && (
        <Box
          onMouseDown={(e) => e.stopPropagation()}
          display="flex"
          alignItems="center"
          gap="2"
          shadow="lg"
          rounded="full"
          style={{
            position: "fixed" as const,
            top: selectionBar.top,
            left: selectionBar.left,
            transform: "translateX(-50%)",
            zIndex: 100,
            background: "var(--ax-colors-bg-default)",
            border: "1px solid var(--ax-colors-border-secondary)",
            padding: "3px 8px",
            height: 38,
            whiteSpace: "nowrap" as const,
          }}
        >
          <Tooltip content="Bold" delayDuration={300}>
            <span>
              <Button appearance="subtle" size="sm" icon={<IconBold style={{ width: 14, height: 14 }} />} aria-label="Bold" />
            </span>
          </Tooltip>
          <Tooltip content="Italic" delayDuration={300}>
            <span>
              <Button appearance="subtle" size="sm" icon={<IconItalic style={{ width: 14, height: 14 }} />} aria-label="Italic" />
            </span>
          </Tooltip>
          <Tooltip content="Underline" delayDuration={300}>
            <span>
              <Button appearance="subtle" size="sm" icon={<IconUnderline style={{ width: 14, height: 14 }} />} aria-label="Underline" />
            </span>
          </Tooltip>

          {/* Divider */}
          <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0, margin: "0 2px" }} />

          <Tooltip content="Link" delayDuration={300}>
            <span>
              <Button appearance="subtle" size="sm" icon={<IconLink style={{ width: 14, height: 14 }} />} aria-label="Link" />
            </span>
          </Tooltip>

          {/* Divider */}
          <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0, margin: "0 2px" }} />

          {/* Comment */}
          <Tooltip content="Comment" delayDuration={300}>
            <span>
              <Button
                appearance="subtle"
                size="sm"
                icon={<IconComment style={{ width: 14, height: 14 }} />}
                aria-label="Comment"
                onClick={handleAddComment}
              />
            </span>
          </Tooltip>

          {/* Divider */}
          <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0, margin: "0 2px" }} />

          {/* Work with Opal — full text */}
          <Button
            appearance="primary"
            size="sm"
            rounded="full"
            onClick={() => {
              if (!opalPopoverOpen && selectionBar) setOpalPopoverPos(selectionBar);
              setOpalPopoverOpen(v => !v);
            }}
            style={{ paddingLeft: 10, paddingRight: 12, gap: 6 }}
          >
            <img src="/opal-orb.svg" alt="" width={13} height={13} style={{ display: "inline-block", verticalAlign: "middle", marginRight: 4 }} />
            Work with Opal
          </Button>
        </Box>
      )}
    </Box>
  ) : (
    // ── Normal: stacked layout ─────────────────────────────────────────────────
    <Box display="flex" flexDirection="column" style={{ width: 450, height: "100%" }}>
      {panelHeader}
      {articleContent}
      <Box
        px="16"
        pt="12"
        pb="16"
        display="flex"
        flexDirection="column"
        gap="8"
        style={{
          borderTop: "1px solid var(--ax-colors-border-tertiary)",
          flexShrink: 0,
          background: "var(--ax-colors-bg-default, white)",
        }}
      >
        {reviewFooter}
      </Box>
    </Box>
  );

  if (isExpanded && typeof document !== "undefined") {
    return createPortal(panelContent, document.body);
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      style={{
        width: open ? 450 : 0,
        flexShrink: 0,
        overflow: "hidden",
        transition: "width 0.35s cubic-bezier(0, 1, 0, 1)",
        borderLeft: open ? "1px solid var(--ax-colors-border-tertiary)" : "none",
        height: "100%",
      }}
    >
      {panelContent}
    </Box>
  );
}

// ── Dynamic preview helper ─────────────────────────────────────────────────────

function getThreadPreview(
  convId: string,
  threads: Record<string, { type?: string; from?: string; text?: string; senderName?: string; attachment?: { title?: string } }[]>,
  fallback?: string,
  isGroup = false
): string {
  const msgs = threads[convId] ?? [];
  const last = msgs[msgs.length - 1];
  if (!last) return fallback ?? "";
  if (last.type === "hitl") return `${last.senderName ?? ""} sent an item that needs your approval`;
  if (last.type === "attachment") {
    const title = last.attachment?.title ?? "Shared a file";
    if (last.from === "user") return `You: ${title}`;
    if (isGroup && last.senderName) return `${last.senderName.split(" ")[0]}: ${title}`;
    return title;
  }
  const text = (last.text ?? "").trim();
  if (!text) return fallback ?? "";
  if (last.from === "user") return `You: ${text}`;
  if (isGroup && last.senderName) return `${last.senderName.split(" ")[0]}: ${text}`;
  return text;
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState(() => searchParams.get("conversation") ?? "bubs");
  const [vtWelcome, setVtWelcome] = useState<{ name: string; avatar: string } | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("im-vau-welcome");
      if (raw) {
        const data = JSON.parse(raw) as { name: string; avatar: string };
        sessionStorage.removeItem("im-vau-welcome");
        setVtWelcome(data);
      }
    } catch {}
  }, []);

  const activeDMS = useMemo(() => {
    if (!vtWelcome) return DMS;
    return DMS.map(d =>
      d.id === "bubs" ? { ...d, name: vtWelcome.name, avatar: vtWelcome.avatar, preview: `${vtWelcome.name} is ready to start working with you` } : d
    );
  }, [vtWelcome]);

  const [threads, setThreads] = useState<Record<string, Message[]>>({ ...THREADS, ...CHANNEL_THREADS });
  useEffect(() => {
    const welcomeThread: Message[] = vtWelcome ? [{
      id: "welcome-1",
      from: "vau",
      senderName: vtWelcome.name,
      senderAvatar: vtWelcome.avatar,
      senderColor: "var(--opal-vau-bubs)",
      text: `Hi! I'm ${vtWelcome.name}, your new Chief of Staff. I'm here to help you stay on top of everything — from meeting prep to follow-ups and keeping things moving. What would you like to tackle first?`,
    }] : THREADS.bubs;
    setThreads({ ...THREADS, ...CHANNEL_THREADS, bubs: welcomeThread });
  }, [vtWelcome]);

  useEffect(() => {
    const convo = searchParams.get("conversation");
    if (convo) { setSelected(convo); setNewConvoMode(false); setQuickView(null); }
  }, [searchParams]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [newConvoMode, setNewConvoMode] = useState(false);
  const [quickView, setQuickView] = useState<string | null>(null);
  const [pendingHighlightMsgId, setPendingHighlightMsgId] = useState<string | null>(null);

  // Auto-collapse sidebar on narrow viewports so IMMain always has room
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarCollapsed(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [extraGroups, setExtraGroups] = useState<GroupItem[]>([]);
  const [extraChannels, setExtraChannels] = useState<ChannelItem[]>([]);
  const [manualUnreadConvos, setManualUnreadConvos] = useState<Set<string>>(new Set());
  const [dismissedDeliverableIds, setDismissedDeliverableIds] = useState<Set<string>>(new Set());
  const dismissDeliverable = (id: string) => setDismissedDeliverableIds(prev => new Set([...prev, id]));

  const [mutedConvos, setMutedConvos] = useState<Set<string>>(new Set());
  const toggleMute = () => setMutedConvos(prev => {
    const next = new Set(prev);
    next.has(selected) ? next.delete(selected) : next.add(selected);
    return next;
  });

  const [nameOverrides, setNameOverrides] = useState<Record<string, string>>({});
  const [channelPrivacyOverrides, setChannelPrivacyOverrides] = useState<Record<string, boolean>>({});
  const [leftConvos, setLeftConvos] = useState<Set<string>>(new Set());
  const [sections, setSections] = useState<Section[]>([
    { id: "favorites", label: "Favorites" },
    { id: "dms", label: "Direct Messages" },
    { id: "groups", label: "Group Chats" },
    { id: "channels", label: "Channels" },
  ]);
  const [movedItems, setMovedItems] = useState<string[]>([]);

  const handleRename = (id: string, name: string) => setNameOverrides(prev => ({ ...prev, [id]: name }));
  const handleTogglePrivacy = (id: string) =>
    setChannelPrivacyOverrides(prev => {
      const current = prev[id] ?? (CHANNELS.find(ch => ch.id === id)?.isPrivate ?? false);
      return { ...prev, [id]: !current };
    });
  const handleLeave = (id: string) => {
    setLeftConvos(prev => new Set([...prev, id]));
    setSelected("bubs");
  };
  const handleMoveToSection = (id: string, sectionId: string) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, items: [...(s.items ?? []), id] } : s));
    setMovedItems(prev => [...prev, id]);
  };

  const openReviewPanel = () => { setPanelOpen(true); setSidebarCollapsed(true); };
  const closeReviewPanel = () => { setPanelOpen(false); };
  const toggleSidebar = () => setSidebarCollapsed(c => !c);

  const handleStartConversation = (chips: typeof RECENT_CONTACTS, firstMessage: string) => {
    let id: string;
    if (chips.length === 1) {
      id = chips[0].id;
    } else {
      id = `group-${Date.now()}`;
      const firstName = (n: string) => n.split(" ")[0];
      const groupName = chips.length <= 3
        ? chips.map(c => firstName(c.name)).join(", ")
        : `${chips.slice(0, 2).map(c => firstName(c.name)).join(", ")} +${chips.length - 2}`;
      setExtraGroups(prev => [...prev, {
        id,
        name: groupName,
        members: `${chips.length} members`,
        emoji: "💬",
        memberList: chips.map(c => ({ name: c.name, avatar: c.avatar })),
      }]);
    }
    if (firstMessage.trim()) {
      const msg: Message = {
        id: Date.now().toString(),
        from: "user",
        senderAvatar: "https://i.pravatar.cc/150?img=24",
        text: firstMessage.trim(),
      };
      setThreads(prev => ({ ...prev, [id]: [...(prev[id] ?? []), msg] }));
    }
    setSelected(id);
    setNewConvoMode(false);
  };

  return (
    <Box display="flex" style={{ height: "100%", overflow: "hidden" }}>
      <IMSidebar selected={selected} onSelect={id => { setSelected(id); setNewConvoMode(false); setQuickView(null); }} onHighlightSelect={(convId, msgId) => { setSelected(convId); setPendingHighlightMsgId(msgId); setNewConvoMode(false); setQuickView(null); }} collapsed={sidebarCollapsed} onToggle={toggleSidebar} onNewConversation={() => setNewConvoMode(true)} onNewGroup={() => setNewConvoMode(true)} quickView={quickView} onQuickViewChange={v => { setQuickView(v); setSelected(""); setNewConvoMode(false); }} extraGroups={extraGroups} extraChannels={extraChannels} onChannelCreated={ch => setExtraChannels(prev => [...prev, ch])} manualUnreadConvos={manualUnreadConvos} mutedConvos={mutedConvos} dismissedDeliverableIds={dismissedDeliverableIds} threads={threads} nameOverrides={nameOverrides} channelPrivacyOverrides={channelPrivacyOverrides} leftConvos={leftConvos} sections={sections} setSections={setSections} movedItems={movedItems} setMovedItems={setMovedItems} />
      {newConvoMode
        ? <NewMessagePane onStartConversation={handleStartConversation} onClose={() => setNewConvoMode(false)} />
        : <IMMain selected={selected} threads={threads} setThreads={setThreads} onOpenReview={openReviewPanel} quickView={quickView} onQuickViewDismiss={() => setQuickView(null)} onSelectConversation={id => { setSelected(id); setQuickView(null); }} extraGroups={extraGroups} extraChannels={extraChannels} manualUnreadConvos={manualUnreadConvos} setManualUnreadConvos={setManualUnreadConvos} mutedConvos={mutedConvos} toggleMute={toggleMute} dismissedDeliverableIds={dismissedDeliverableIds} onDismissDeliverable={dismissDeliverable} nameOverrides={nameOverrides} onRename={handleRename} channelPrivacyOverrides={channelPrivacyOverrides} onTogglePrivacy={handleTogglePrivacy} leftConvos={leftConvos} onLeave={handleLeave} sections={sections} onMoveToSection={handleMoveToSection} highlightMsgId={pendingHighlightMsgId} onHighlightClear={() => setPendingHighlightMsgId(null)} />
      }
      <BlogReviewPanel
        open={panelOpen}
        onClose={closeReviewPanel}
        onWorkInOpal={(prompt) => router.push(`/opal?file=q3-blog-post.pdf&title=Q3+Content+Strategy%3A+How+AI+Is+Reshaping+Marketing${prompt ? '&prompt=' + encodeURIComponent(prompt) : ''}`)}
        onExpand={() => router.push('/opal?artifacts=1')}
      />
    </Box>
  );
}
