"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CollabRail } from "@/app/components/Opal/CollabRail";
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@optiaxiom/react";
import {
  IconRobot,
  IconPlus,
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
  IconFolder,
  IconSearch,
  IconBars,
  IconFileLines,
  IconDownload,
  IconArrowsMaximize,
  IconXmark,
  IconArrowUpRightFromSquare,
  IconEllipsisSolid,
  IconChevronLeft,
  IconChevronRight,
  IconArrowsMinimize,
  IconComment,
} from "@optiaxiom/icons";

// ── Types ──────────────────────────────────────────────────────────────────────

type PresenceStatus = "active" | "away" | "busy";
type DMItem    = { id: string; name: string; avatar: string; status?: PresenceStatus; unread?: number };
type GroupItem = { id: string; name: string; members: string; unread?: number };
type VAUItem   = { id: string; name: string; color: string };

type Message = {
  id: string;
  from: "user" | "vau" | "human";
  type?: "text" | "attachment";
  senderName?: string;
  senderAvatar?: string;
  senderColor?: string;
  text: string;
  attachment?: { title: string; file: string };
};

// ── Mock data ──────────────────────────────────────────────────────────────────

const PRESENCE_COLOR: Record<PresenceStatus, string> = {
  active: "#22c55e",
  away:   "#f59e0b",
  busy:   "#ef4444",
};

const DMS: DMItem[] = [
  { id: "js", name: "Jane Smith",           avatar: "https://i.pravatar.cc/150?img=47", status: "active", unread: 2 },
  { id: "lg", name: "Lisa Gray",            avatar: "https://i.pravatar.cc/150?img=9",  status: "active" },
  { id: "hw", name: "Harry Winston-Brown",  avatar: "https://i.pravatar.cc/150?img=52", status: "busy"   },
  { id: "bw", name: "Brendan Wilmington",   avatar: "https://i.pravatar.cc/150?img=57", status: "away"   },
  { id: "ms", name: "Marcus Santos",        avatar: "https://i.pravatar.cc/150?img=68", status: "active" },
  { id: "pr", name: "Priya Rajan",          avatar: "https://i.pravatar.cc/150?img=44", status: "away",  unread: 3 },
  { id: "td", name: "Tom Decker",           avatar: "https://i.pravatar.cc/150?img=53", status: "busy"   },
  { id: "ao", name: "Amara Osei",           avatar: "https://i.pravatar.cc/150?img=38", status: "active" },
];

const GROUPS: GroupItem[] = [
  { id: "bf", name: "Black Friday Campaign", members: "Jason, Patrick +2", unread: 5 },
  { id: "vw", name: "VAU Working Group",     members: "8 members" },
  { id: "cm", name: "Content Marketing Crew", members: "12 members" },
];

const VAUS: VAUItem[] = [
  { id: "bubs", name: "Bubs",                     color: "#2563eb" },
  { id: "kara", name: "Kara the Content Creator",  color: "#6B5CE7" },
  { id: "eric", name: "Eric the Experimenter",     color: "#6B5CE7" },
];

// Mock message threads per conversation
const THREADS: Record<string, Message[]> = {
  bf: [
    {
      id: "1", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Hey y'all! I'm working on a new blog post and I wanted to get your thoughts. I had Bubs help with some of the content.",
    },
    {
      id: "2", from: "vau",
      senderName: "Bubs", senderColor: "#2563eb",
      text: "Sure! I'd be happy to review. Send on over.",
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
      senderName: "Bubs", senderColor: "#2563eb",
      text: "Love it! Opening it up now — give me a moment to read through.",
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
      text: "Would love to hear them! Can we jump on a quick call?",
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
      text: "Also — totally unrelated but have you tried the new Bubs email draft feature? Game changer honestly 🤯",
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
      text: "One thing I'm still debating — should the hover state use the secondary bg token or a border highlight? 🤔",
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
      senderName: "Marcus Santos", senderAvatar: "https://i.pravatar.cc/150?img=68",
      text: "Hey — I pulled the Q2 content performance data. Some really interesting stuff in here 📊",
    },
    {
      id: "2", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Oh nice! What are the highlights?",
    },
    {
      id: "3", from: "human",
      senderName: "Marcus Santos", senderAvatar: "https://i.pravatar.cc/150?img=68",
      text: "Long-form blog posts outperformed short ones by 3x on time-on-page. Also, AI-drafted content had higher initial click rates but slightly lower scroll depth.",
    },
    {
      id: "4", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "That scroll depth finding is really interesting. Maybe the hooks are stronger but the body needs more work?",
    },
    {
      id: "5", from: "human",
      senderName: "Marcus Santos", senderAvatar: "https://i.pravatar.cc/150?img=68",
      text: "Exactly what I was thinking. It's like AI front-loads all the value.",
    },
    {
      id: "6", from: "human",
      senderName: "Marcus Santos", senderAvatar: "https://i.pravatar.cc/150?img=68",
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
      text: "Great idea! I'll slot it in after the AI section. Want me to have Bubs draft it?",
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
      text: "Also — completely separate — are you going to the design review tomorrow? I want to make sure someone from content is in the room.",
    },
    {
      id: "7", from: "human",
      senderName: "Priya Rajan", senderAvatar: "https://i.pravatar.cc/150?img=44",
      text: "Just flagging in case you hadn't seen the calendar invite! It got added pretty last minute 😬",
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
      text: "Hey! Just wanted to say — the Opal demo you ran for the exec team last week was SO good. They were really impressed ⭐",
    },
    {
      id: "2", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "That means a lot, thank you! It was a little nerve-wracking honestly 😅",
    },
    {
      id: "3", from: "human",
      senderName: "Amara Osei", senderAvatar: "https://i.pravatar.cc/150?img=38",
      text: "You couldn't tell at all! The blog review flow especially — people were genuinely excited about that use case.",
    },
    {
      id: "4", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Really glad that landed! It's been a big focus for the team.",
    },
    {
      id: "5", from: "human",
      senderName: "Amara Osei", senderAvatar: "https://i.pravatar.cc/150?img=38",
      text: "For sure. I think there's a real opportunity to build on that for the roadmap presentation next quarter.",
    },
    {
      id: "6", from: "human",
      senderName: "Amara Osei", senderAvatar: "https://i.pravatar.cc/150?img=38",
      text: "Let's find time to brainstorm — I have some ideas I want to run by you 💡",
    },
    {
      id: "7", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "100%! I'd love that. Let's get something on the calendar this week.",
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
      text: "Bubs for content drafting, Kara for SEO review. Honestly using them both daily at this point.",
    },
    {
      id: "3", from: "human",
      senderName: "Lisa Gray", senderAvatar: "https://i.pravatar.cc/150?img=9",
      text: "Same! Bubs has been a game changer for writing specs. The 'make it punchier' prompt is carrying me 😂",
    },
    {
      id: "4", from: "human",
      senderName: "Marcus Santos", senderAvatar: "https://i.pravatar.cc/150?img=68",
      text: "Eric the Experimenter for anything data-adjacent. His suggested test variants are shockingly good.",
    },
    {
      id: "5", from: "human",
      senderName: "Patrick Lee", senderAvatar: "https://i.pravatar.cc/150?img=60",
      text: "Great signals! One thing I want to track this quarter — is anyone hitting accuracy issues? Like confidently wrong answers?",
    },
    {
      id: "6", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Occasionally with sourced stats. I always double-check numbers Bubs cites before publishing.",
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
      senderName: "Marcus Santos", senderAvatar: "https://i.pravatar.cc/150?img=68",
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
      text: "Love it! Updating the calendar now. Also — Bubs is going to draft the landing page copy, should be ready by tomorrow 🤖",
    },
    {
      id: "7", from: "human",
      senderName: "Priya Rajan", senderAvatar: "https://i.pravatar.cc/150?img=44",
      text: "Amazing. This team is on fire lately 🔥🔥",
    },
    {
      id: "8", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Let's gooo 🚀",
    },
  ],
  bubs: [
    {
      id: "1", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Bubs, can you draft an intro for the Q3 blog post?",
    },
    {
      id: "2", from: "vau",
      senderName: "Bubs", senderColor: "#2563eb",
      text: "On it! Here's a draft intro:\n\nAs we head into Q3, our focus shifts to deepening customer engagement and scaling what's working. Here's what's on the horizon.",
    },
    {
      id: "3", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Love it. Can you make it a bit punchier?",
    },
    {
      id: "4", from: "vau",
      senderName: "Bubs", senderColor: "#2563eb",
      text: "Q3 is here. Time to double down on what's working and move faster. Here's the plan.",
    },
    {
      id: "5", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "Perfect 🙌 one more thing — can you suggest 3 headline options?",
    },
    {
      id: "6", from: "vau",
      senderName: "Bubs", senderColor: "#2563eb",
      text: "Sure! Here are three options:\n\n1. \"The Q3 Playbook: AI, Speed, and Content That Converts\"\n2. \"How We're Using AI to Outpace the Competition This Quarter\"\n3. \"Q3 Is Here — Here's Our Content Strategy (And Why AI Is Central to It)\"",
    },
    {
      id: "7", from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: "I love #1. Going with that 🎯",
    },
    {
      id: "8", from: "vau",
      senderName: "Bubs", senderColor: "#2563eb",
      text: "Great choice — it's punchy and keyword-friendly. Good luck with the post! 🚀",
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
  ms:   { from: "human", name: "Marcus Santos",         avatar: "https://i.pravatar.cc/150?img=68" },
  pr:   { from: "human", name: "Priya Rajan",           avatar: "https://i.pravatar.cc/150?img=44" },
  td:   { from: "human", name: "Tom Decker",            avatar: "https://i.pravatar.cc/150?img=53" },
  ao:   { from: "human", name: "Amara Osei",            avatar: "https://i.pravatar.cc/150?img=38" },
  bf:   { from: "human", name: "Jason Park",            avatar: "https://i.pravatar.cc/150?img=33" },
  vw:   { from: "human", name: "Patrick Lee",           avatar: "https://i.pravatar.cc/150?img=60" },
  cm:   { from: "human", name: "Sara Chen",             avatar: "https://i.pravatar.cc/150?img=20" },
  bubs: { from: "vau",   name: "Bubs",                  color: "#2563eb" },
  kara: { from: "vau",   name: "Kara the Content Creator", color: "#6B5CE7" },
  eric: { from: "vau",   name: "Eric the Experimenter", color: "#6B5CE7" },
};

const REPLIES: Record<string, string[]> = {
  js:   ["Totally agree!", "Let me check and get back to you.", "Ooh good point, hadn't thought of that.", "Yes! Let's sync later this week."],
  lg:   ["Makes sense to me.", "Happy to help with that.", "Can you send me the doc?", "On it!"],
  hw:   ["Noted, I'll follow up.", "Sounds good — let me loop in the team.", "Good catch, thanks for flagging.", "Will do!"],
  bw:   ["I'm in!", "Let me check my calendar.", "That works for me.", "Thanks for the heads up."],
  ms:   ["Great idea!", "I was just thinking the same thing.", "Let me pull the numbers on that.", "100% aligned."],
  pr:   ["Love this direction.", "Can we get Bubs to draft something?", "I'll review by EOD.", "Adding this to the board now."],
  td:   ["On my radar.", "Will circle back after standup.", "Flagging this for the team.", "Good to know, thanks."],
  ao:   ["Absolutely!", "This is really exciting.", "I can take a first pass at it.", "Let's make it happen."],
  bf:   ["Good update — keeping the thread going.", "Patrick is looking at that now.", "We're on track for launch.", "Let's review together Thursday."],
  vw:   ["Tagging Eric on this too.", "Great thread everyone.", "Let's bring this to next week's sync.", "Agreed — should we update the doc?"],
  cm:   ["Sara is already on it!", "Content calendar is updated.", "This fits perfectly with Q3 goals.", "Scheduling the review now."],
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

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.from === "user";

  if (isUser) {
    return (
      <Box
        display="flex"
        gap="8"
        alignItems="start"
        justifyContent="flex-end"
        pl="32"
      >
        <Box
          style={{
            background: "var(--opal-user-message, #e4f0da)",
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--ax-colors-fg-default)",
            whiteSpace: "pre-wrap",
          }}
        >
          {msg.text}
        </Box>
        <Box pt="10" style={{ flexShrink: 0 }}>
          <Avatar name="Me" src={msg.senderAvatar} size="xs" />
        </Box>
      </Box>
    );
  }

  // VAU or human message — left aligned, no bubble
  return (
    <Box display="flex" gap="12" alignItems="start">
      <Box pt="4" style={{ flexShrink: 0 }}>
        {msg.from === "vau" ? (
          <Box
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: msg.senderColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              color: "white",
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {msg.senderName?.[0]}
          </Box>
        ) : (
          <Avatar name={msg.senderName || ""} src={msg.senderAvatar} size="xs" />
        )}
      </Box>
      <Box
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: "var(--ax-colors-fg-default)",
          whiteSpace: "pre-wrap",
          paddingTop: 4,
        }}
      >
        {msg.text}
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
}: {
  selected: string;
  onSelect: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      style={{
        width: collapsed ? 56 : 320,
        flexShrink: 0,
        borderRight: "1px solid var(--ax-colors-border-default, #d8e4cb)",
        background: "var(--ax-colors-bg-secondary, #eff5eb)",
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
          {/* Opal Workspace logo mark */}
          <Box
            style={{
              width: 30,
              height: 33,
              borderRadius: 4,
              background: "#38735d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              padding: "5px 5px 4px 7px",
              marginBottom: 6,
            }}
          >
            <img src="/opal-workspace-logo.svg" alt="" style={{ width: 20, height: 22.9 }} />
          </Box>
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
          {/* DM avatars */}
          {DMS.map((dm) => (
            <Tooltip key={dm.id} content={dm.name} side="right">
              <Box
                style={{ position: "relative", cursor: "pointer", padding: 3, borderRadius: 6, background: selected === dm.id ? "var(--ax-colors-bg-accent-subtle)" : "transparent" }}
                onClick={() => onSelect(dm.id)}
              >
                <Avatar name={dm.name} src={dm.avatar} size="xs" />
                {dm.status && (
                  <Box style={{ position: "absolute", bottom: 2, right: 2, width: 9, height: 9, borderRadius: "50%", background: PRESENCE_COLOR[dm.status], border: "1.5px solid var(--ax-colors-bg-secondary, #eff5eb)" }} />
                )}
              </Box>
            </Tooltip>
          ))}
          <Box style={{ height: 1, width: 36, background: "var(--ax-colors-border-secondary, #e4f0da)", margin: "4px 0" }} />
          {/* Group avatars */}
          {GROUPS.map((g) => (
            <Tooltip key={g.id} content={g.name} side="right">
              <Box
                style={{ cursor: "pointer", padding: 3, borderRadius: 6, background: selected === g.id ? "var(--ax-colors-bg-accent-subtle)" : "transparent" }}
                onClick={() => onSelect(g.id)}
              >
                <Avatar name={g.name} size="xs" />
              </Box>
            </Tooltip>
          ))}
          <Box style={{ height: 1, width: 36, background: "var(--ax-colors-border-secondary, #e4f0da)", margin: "4px 0" }} />
          {/* VAU avatars */}
          {VAUS.map((v) => (
            <Tooltip key={v.id} content={v.name} side="right">
              <Box
                style={{ position: "relative", cursor: "pointer", padding: 3, borderRadius: 6, background: selected === v.id ? "var(--ax-colors-bg-accent-subtle)" : "transparent" }}
                onClick={() => onSelect(v.id)}
              >
                <Box style={{ width: 24, height: 24, borderRadius: "50%", background: v.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconRobot style={{ width: 13, height: 13, color: "white" }} />
                </Box>
                <Box style={{ position: "absolute", bottom: 2, right: 2, width: 9, height: 9, borderRadius: "50%", background: "#22c55e", border: "1.5px solid var(--ax-colors-bg-secondary, #eff5eb)" }} />
              </Box>
            </Tooltip>
          ))}
        </Box>
      ) : (
        <>
      {/* Opal Workspace header */}
      <Box display="flex" flexDirection="column" gap="10" px="10" pt="10" pb="4">
        <Box display="flex" alignItems="center" gap="8">
          <Box
            style={{
              width: 30,
              height: 33,
              borderRadius: 4,
              background: "#38735d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              padding: "5px 5px 4px 7px",
            }}
          >
            <img
              src="https://www.figma.com/api/mcp/asset/751b0984-aab1-48e4-a7f2-1d03c29c0dfc"
              alt=""
              style={{ width: 20, height: 22.9 }}
            />
          </Box>
          <Text fontWeight="600" color="fg.default" style={{ fontSize: 16, letterSpacing: "0.32px" }}>
            Opal Workspace
          </Text>
          <Box style={{ marginLeft: "auto" }}>
            <Tooltip content="Collapse sidebar" side="right">
              <Button
                appearance="subtle"
                size="sm"
                icon={<IconChevronLeft style={{ width: 14, height: 14 }} />}
                aria-label="Collapse sidebar"
                onClick={onToggle}
                style={{ width: 28, height: 28, padding: 0 }}
              />
            </Tooltip>
          </Box>
        </Box>
        <Box style={{ height: 1, background: "var(--ax-colors-border-secondary, #e4f0da)" }} />
      </Box>

      {/* Nav sections — scrollable so all sections are reachable */}
      <Box display="flex" flexDirection="column" gap="24" px="10" pb="10" pt="4" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>

        <Disclosure defaultOpen>
          <DisclosureTrigger>Direct Messages</DisclosureTrigger>
          <DisclosureContent>
            <Box display="flex" flexDirection="column" pt="4">
              {DMS.map((dm) => (
                <Box
                  key={dm.id}
                  display="flex"
                  alignItems="center"
                  gap="8"
                  px="8"
                  py="6"
                  style={{
                    cursor: "pointer",
                    borderRadius: 6,
                    background: selected === dm.id ? "var(--ax-colors-bg-accent-subtle)" : "transparent",
                  }}
                  onClick={() => onSelect(dm.id)}
                >
                  <Box style={{ position: "relative", flexShrink: 0 }}>
                    <Avatar name={dm.name} src={dm.avatar} size="xs" />
                    {dm.status && (
                      <Box
                        style={{
                          position: "absolute",
                          bottom: -1,
                          right: -1,
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          background: PRESENCE_COLOR[dm.status],
                          border: "1.5px solid var(--ax-colors-bg-secondary, #eff5eb)",
                        }}
                      />
                    )}
                  </Box>
                  <Text
                    fontSize="md"
                    color="fg.default"
                    style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {dm.name}
                  </Text>
                  {dm.unread && (
                    <Badge intent="success" size="sm">{dm.unread}</Badge>
                  )}
                </Box>
              ))}
            </Box>
          </DisclosureContent>
        </Disclosure>

        <Disclosure defaultOpen>
          <DisclosureTrigger>Group Chats</DisclosureTrigger>
          <DisclosureContent>
            <Box display="flex" flexDirection="column" pt="4">
              {GROUPS.map((g) => (
                <Box
                  key={g.id}
                  display="flex"
                  alignItems="center"
                  gap="8"
                  px="8"
                  py="6"
                  style={{
                    cursor: "pointer",
                    borderRadius: 6,
                    background: selected === g.id ? "var(--ax-colors-bg-accent-subtle)" : "transparent",
                  }}
                  onClick={() => onSelect(g.id)}
                >
                  <Avatar name={g.name} size="xs" />
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      fontSize="md"
                      color="fg.default"
                      style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {g.name}
                    </Text>
                    <Text fontSize="sm" color="fg.tertiary">{g.members}</Text>
                  </Box>
                  {g.unread && (
                    <Badge intent="success" size="sm">{g.unread}</Badge>
                  )}
                </Box>
              ))}
            </Box>
          </DisclosureContent>
        </Disclosure>

        <Disclosure defaultOpen>
          <DisclosureTrigger>Virtual Teammates</DisclosureTrigger>
          <DisclosureContent>
            <Box display="flex" flexDirection="column" pt="4">
              {VAUS.map((v) => (
                <Box
                  key={v.id}
                  display="flex"
                  alignItems="center"
                  gap="8"
                  px="8"
                  py="6"
                  style={{
                    cursor: "pointer",
                    borderRadius: 6,
                    background: selected === v.id ? "var(--ax-colors-bg-accent-subtle)" : "transparent",
                  }}
                  onClick={() => onSelect(v.id)}
                >
                  <Box style={{ position: "relative", flexShrink: 0 }}>
                    <Box
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: v.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconRobot style={{ width: 13, height: 13, color: "white" }} />
                    </Box>
                    {/* Online indicator */}
                    <Box
                      style={{
                        position: "absolute",
                        bottom: -1,
                        right: -1,
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: "#22c55e",
                        border: "1.5px solid var(--ax-colors-bg-secondary, #eff5eb)",
                      }}
                    />
                  </Box>
                  <Text
                    fontSize="md"
                    color="fg.default"
                    style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {v.name}
                  </Text>
                </Box>
              ))}
            </Box>
          </DisclosureContent>
        </Disclosure>


      </Box>
        </>
      )}
    </Box>
  );
}

// ── Main area ──────────────────────────────────────────────────────────────────

function IMMain({
  selected,
  threads,
  setThreads,
  onOpenReview,
}: {
  selected: string;
  threads: Record<string, Message[]>;
  setThreads: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>;
  onOpenReview: () => void;
}) {
  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const thread = selected ? (threads[selected] ?? []) : [];
  const unreadCount = thread.length > 0 ? 1 : 0;

  const conversationName =
    DMS.find((d) => d.id === selected)?.name ||
    GROUPS.find((g) => g.id === selected)?.name ||
    VAUS.find((v) => v.id === selected)?.name;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length, typing]);

  const handleSend = () => {
    if (!message.trim() || !selected) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      from: "user",
      senderAvatar: "https://i.pravatar.cc/150?img=24",
      text: message.trim(),
    };

    setThreads(prev => ({ ...prev, [selected]: [...(prev[selected] ?? []), userMsg] }));
    setMessage("");
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

  return (
    <Box
      display="flex"
      flexDirection="column"
      style={{ flex: 1, height: "100%", background: "var(--ax-colors-bg-default, white)", minWidth: 0, overflow: "hidden" }}
    >
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }`}</style>
      {/* Combined bar: tabs left, actions right */}
      <Box display="flex" flexDirection="column" style={{ flex: 1, minHeight: 0 }}>
        <Box display="flex" flexDirection="column" style={{ flex: 1, minHeight: 0 }}>
          <Tabs defaultValue="messages">
            <Box
              display="flex"
              alignItems="center"
              px="20"
              style={{ borderBottom: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0, height: 52 }}
            >
              <TabsList>
                <TabsTrigger value="messages">
                  <Box asChild display="inline-flex" alignItems="center" gap="6">
                    <span>
                      Messages
                      {unreadCount > 0 && selected && (
                        <Badge intent="neutral" style={{ background: "#202320", color: "white", fontSize: 11, lineHeight: 1 }}>
                          {unreadCount}
                        </Badge>
                      )}
                    </span>
                  </Box>
                </TabsTrigger>
                <TabsTrigger value="pins">Pins</TabsTrigger>
              </TabsList>
              <Box style={{ flex: 1 }} />
              <Box display="flex" alignItems="center" gap="4">
                <Button appearance="subtle" size="md" icon={<IconGalleryThumbnails />}>Artifacts</Button>
                <Button appearance="subtle" size="md" icon={<IconFolder />}>Files</Button>
                <Button appearance="subtle" size="md" icon={<IconSearch />}>Search</Button>
              </Box>
              <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0, margin: "0 8px" }} />
              <Tooltip content="Menu">
                <Button
                  appearance="subtle"
                  size="sm"
                  icon={<IconBars />}
                  aria-label="Menu"
                  style={{ width: 28, height: 28, padding: 0 }}
                />
              </Tooltip>
            </Box>

            {/* Messages tab */}
            <TabsContent value="messages">
              {thread.length > 0 && (
                <Box
                  display="flex"
                  flexDirection="column"
                  gap="24"
                  px="20"
                  pt="16"
                  pb="24"
                  style={{ overflowY: "auto" }}
                >
                  {thread.map((msg) =>
                    msg.type === "attachment" ? (
                      <Box key={msg.id} display="flex" gap="8" alignItems="start" justifyContent="flex-end" pl="32">
                        <Box
                          onClick={onOpenReview}
                          style={{
                            background: "var(--ax-colors-bg-default, white)",
                            border: "1px solid var(--ax-colors-border-default, #d8e4cb)",
                            borderRadius: 8,
                            padding: "12px 14px",
                            cursor: "pointer",
                            maxWidth: 260,
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          <Box display="flex" alignItems="start" gap="8">
                            <Box
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                background: "var(--ax-colors-bg-secondary, #eff5eb)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <IconFileLines style={{ width: 16, height: 16, color: "var(--ax-colors-fg-secondary)" }} />
                            </Box>
                            <Box style={{ minWidth: 0 }}>
                              <Text
                                fontSize="md"
                                fontWeight="500"
                                color="fg.default"
                                style={{ overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
                              >
                                {msg.attachment!.title}
                              </Text>
                              <Text fontSize="sm" color="fg.tertiary">{msg.attachment!.file}</Text>
                            </Box>
                          </Box>
                          <Box style={{ paddingLeft: 40 }}>
                            <Button
                              appearance="default"
                              size="md"
                              icon={<IconArrowUpRightFromSquare />}
                              iconPosition="end"
                            >
                              Open to review
                            </Button>
                          </Box>
                        </Box>
                        <Box pt="10" style={{ flexShrink: 0 }}>
                          <Avatar name="Me" src={msg.senderAvatar} size="xs" />
                        </Box>
                      </Box>
                    ) : (
                      <MessageBubble key={msg.id} msg={msg} />
                    )
                  )}
                  {typing && (
                    <Box display="flex" gap="12" alignItems="center">
                      <Box style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--ax-colors-bg-tertiary)", flexShrink: 0 }} />
                      <Box display="flex" gap="4" alignItems="center">
                        {[0, 1, 2].map((i) => (
                          <Box
                            key={i}
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "var(--ax-colors-fg-tertiary)",
                              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  <div ref={bottomRef} />
                </Box>
              )}
            </TabsContent>

            {/* Pins tab */}
            <TabsContent value="pins">
              <Box display="flex" alignItems="center" justifyContent="center" py="48">
                <Text fontSize="sm" color="fg.tertiary">No pins yet</Text>
              </Box>
            </TabsContent>
          </Tabs>
        </Box>
      </Box>

      {/* Composer */}
      <Box
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
          <Box style={{ width: 1, height: 18, background: "#e5e7eb", margin: "0 4px", flexShrink: 0 }} />
          <ToolbarBtn icon={<IconLink />} label="Link" />
          <ToolbarBtn icon={<IconListOl />} label="Ordered list" />
          <ToolbarBtn icon={<IconListUl />} label="Bullet list" />
          <ToolbarBtn icon={<IconQuoteRight />} label="Block quote" />
          <Box style={{ width: 1, height: 18, background: "#e5e7eb", margin: "0 4px", flexShrink: 0 }} />
          <ToolbarBtn icon={<IconCode />} label="Code" />
          <ToolbarBtn icon={<IconPaperclip />} label="Attach file" />
        </Box>

        {/* Input box */}
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
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
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
            <Tooltip content="Add">
              <Button
                appearance="subtle"
                size="sm"
                icon={<IconPlus />}
                aria-label="Add"
                style={{ width: 28, height: 28, padding: 0, color: "var(--ax-colors-fg-tertiary)" }}
              />
            </Tooltip>
            <Box style={{ flex: 1 }} />
            <Tooltip content="Voice message">
              <Button
                appearance="subtle"
                size="sm"
                icon={<IconWavePulse />}
                aria-label="Voice message"
                style={{ width: 28, height: 28, padding: 0, color: "var(--ax-colors-fg-tertiary)" }}
              />
            </Tooltip>
            <Tooltip content="Send">
              <Button
                appearance="primary"
                size="sm"
                icon={<IconSend />}
                aria-label="Send message"
                onClick={handleSend}
            disabled={!message.trim() || !selected}
                style={{ width: 32, height: 32, padding: 0, borderRadius: "50%", marginLeft: 4 }}
              />
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ── Blog Review Panel ─────────────────────────────────────────────────────────

function BlogReviewPanel({ open, onClose, onWorkInOpal }: { open: boolean; onClose: () => void; onWorkInOpal: (prompt?: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectionBar, setSelectionBar] = useState<{ top: number; left: number } | null>(null);
  const [opalPopoverOpen, setOpalPopoverOpen] = useState(false);
  const [opalPrompt, setOpalPrompt] = useState("");
  const [opalPopoverPos, setOpalPopoverPos] = useState<{ top: number; left: number } | null>(null);

  type Annotation = { id: string; text: string; top: number; author: string; avatar: string; resolved: boolean };
  const [annotations, setAnnotations] = useState<Annotation[]>([
    { id: "a1", text: "This opening stat is really strong — let's make sure it's sourced.", top: 310, author: "Lisa Gray",     avatar: "https://i.pravatar.cc/150?img=5",  resolved: false },
    { id: "a2", text: "Bubs → should we call it out by full name on first mention?",           top: 430, author: "Marcus Santos", avatar: "https://i.pravatar.cc/150?img=12", resolved: false },
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
        style={{
          background: "var(--ax-colors-bg-default, white)",
          border: "1px solid var(--ax-colors-border-default, #d8e4cb)",
          borderRadius: 8,
          padding: "8px 12px",
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
            minHeight: isExpanded ? 120 : 52,
            boxSizing: "border-box" as const,
          }}
        />
      </Box>
      {/* Action buttons */}
      <Box display="flex" alignItems="center" gap="8" justifyContent="flex-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              appearance="subtle"
              size="md"
              icon={<IconEllipsisSolid size={16} />}
              aria-label="More options"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Box display="flex" alignItems="center" gap="8">
                <IconDownload style={{ width: 16, height: 16 }} />
                Download
              </Box>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onWorkInOpal()}>
              <Box display="flex" alignItems="center" gap="8">
                <IconArrowUpRightFromSquare style={{ width: 16, height: 16 }} />
                Work in Opal
              </Box>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button appearance="default" size="md">
          Request Changes
        </Button>
        <Button appearance="primary" size="md">
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
    { id: "lisa",   name: "Lisa",   color: "#7c3aed", ...CURSOR_WAYPOINTS.lisa[lisaIdx]   },
    { id: "marcus", name: "Marcus", color: "#2563eb", ...CURSOR_WAYPOINTS.marcus[marcusIdx] },
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
            Q3 Content Strategy: How AI Is Reshaping Marketing
          </Text>
          {/* Meta */}
          <Box display="flex" flexDirection="column" gap="6">
            <Box display="flex" alignItems="center" gap="8">
              <Avatar name="Erika Schreiber" src="https://i.pravatar.cc/150?img=24" size="xs" />
              <Text fontSize="sm" color="fg.secondary">Erika Schreiber</Text>
              <Box style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
              <Text fontSize="sm" color="fg.secondary" style={{ whiteSpace: "nowrap" }}>May 20, 2026</Text>
            </Box>
            <Box style={{ display: "inline-flex", alignItems: "center", background: "var(--ax-colors-bg-tertiary, #eff5eb)", borderRadius: 4, padding: "2px 8px", alignSelf: "flex-start" }}>
              <Text fontSize="sm" color="fg.secondary" style={{ whiteSpace: "nowrap" }}>5 min read</Text>
            </Box>
          </Box>
          {/* Body */}
          <Box display="flex" flexDirection="column" gap="12">
            <Text fontSize="md" color="fg.default" style={{ lineHeight: 1.7 }}>
              As we move into Q3, the conversation around AI in content marketing has shifted from "should we use it?" to "how do we use it well?" The early excitement has given way to more nuanced questions about quality, authenticity, and long-term brand equity.
            </Text>
            <Text fontSize="md" color="fg.default" style={{ lineHeight: 1.7 }}>
              Our team has been piloting AI-assisted content workflows for the past two quarters, using Bubs — our in-house content VAU — to accelerate drafting and ideation. The results are promising: we've seen a 40% reduction in first-draft time and a measurable improvement in content consistency across channels.
            </Text>
            <Text fontSize="md" color="fg.default" style={{ lineHeight: 1.7 }}>
              But speed isn't the whole story. The most significant gains have come from using AI as a thinking partner rather than a writing replacement. When we ask Bubs to challenge our assumptions or generate alternative angles, we consistently end up with more creative, audience-relevant content.
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
                    <Box style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--ax-colors-bg-tertiary)", fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>Y</Box>
                  )}
                  <IconComment size={12} style={{ color: "#92400e", flexShrink: 0 }} />
                </button>
              ) : (
                /* Expanded card — shown by default */
                <Box style={{
                  background: "white",
                  border: "1px solid #fbbf24",
                  borderRadius: 8,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                  overflow: "hidden",
                }}>
                  {/* Card header */}
                  <Box display="flex" alignItems="center" gap="8" px="10" style={{ paddingTop: 8, paddingBottom: a.text ? 4 : 0 }}>
                    {a.avatar ? (
                      <img src={a.avatar} alt={a.author} style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0 }} />
                    ) : (
                      <Box style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--ax-colors-bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, flexShrink: 0 }}>Y</Box>
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
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
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
        Q3 Content Strategy: How AI Is Reshaping Marketing
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
              aria-label={isExpanded ? "Exit fullscreen" : "Expand panel"}
              onClick={() => setIsExpanded(v => !v)}
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
          background: "#f5f0ff",
          borderBottom: "1px solid #ede9fe",
        }}>
          <style>{`@keyframes collab-pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
          <Box style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#7c3aed", flexShrink: 0,
            animation: "collab-pulse 1.5s ease-in-out infinite",
          }} />
          <Text fontWeight="600" style={{ fontSize: 12, color: "#6d28d9" }}>Collaboration mode</Text>
          <Text style={{ fontSize: 12, color: "#a78bfa" }}>·</Text>
          <Box display="flex" alignItems="center" style={{ flexShrink: 0 }}>
            {[
              { name: "Lisa Gray",     src: "https://i.pravatar.cc/150?img=5"  },
              { name: "Marcus Santos", src: "https://i.pravatar.cc/150?img=12" },
            ].map((c, i) => (
              <img key={c.name} src={c.src} alt={c.name} title={c.name}
                style={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid white", marginLeft: i === 0 ? 0 : -4, flexShrink: 0 }} />
            ))}
          </Box>
          <Text style={{ fontSize: 12, color: "#6d28d9" }}>Lisa and Marcus are here</Text>
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
          style={{
            position: "fixed" as const,
            top: opalPopoverPos.top + 50,
            left: opalPopoverPos.left,
            transform: "translateX(-50%)",
            zIndex: 101,
            background: "white",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)",
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
              onClick={handleSendToOpal}
              disabled={!opalPrompt.trim()}
              style={{ borderRadius: 20, paddingLeft: 10, paddingRight: 12 }}
            >
              <img src="/opal-orb.png" alt="" width={13} height={13} style={{ display: "inline-block", verticalAlign: "middle", marginRight: 4 }} />
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
          style={{
            position: "fixed" as const,
            top: selectionBar.top,
            left: selectionBar.left,
            transform: "translateX(-50%)",
            zIndex: 100,
            background: "white",
            borderRadius: 24,
            boxShadow: "0 4px 20px rgba(0,0,0,0.14), 0 1px 6px rgba(0,0,0,0.08)",
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
            onClick={() => {
              if (!opalPopoverOpen && selectionBar) setOpalPopoverPos(selectionBar);
              setOpalPopoverOpen(v => !v);
            }}
            style={{ borderRadius: 20, paddingLeft: 10, paddingRight: 12, gap: 6 }}
          >
            <img src="/opal-orb.png" alt="" width={13} height={13} style={{ display: "inline-block", verticalAlign: "middle", marginRight: 4 }} />
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

// ── Page ───────────────────────────────────────────────────────────────────────

export function LayoutBErika() {
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [threads, setThreads] = useState<Record<string, Message[]>>(THREADS);
  const [panelOpen, setPanelOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auto-collapse sidebar on narrow viewports so IMMain always has room
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarCollapsed(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const openReviewPanel = () => { setPanelOpen(true); setSidebarCollapsed(true); };
  const closeReviewPanel = () => { setPanelOpen(false); };
  const toggleSidebar = () => setSidebarCollapsed(c => !c);

  return (
    <Box display="flex" style={{ height: "100%", overflow: "hidden" }}>
      <IMSidebar selected={selected} onSelect={setSelected} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <IMMain selected={selected} threads={threads} setThreads={setThreads} onOpenReview={openReviewPanel} />
      <BlogReviewPanel
        open={panelOpen}
        onClose={closeReviewPanel}
        onWorkInOpal={(prompt) => router.push(`/opal?file=q3-blog-post.pdf&title=Q3+Content+Strategy%3A+How+AI+Is+Reshaping+Marketing${prompt ? '&prompt=' + encodeURIComponent(prompt) : ''}`)}
      />
    </Box>
  );
}
