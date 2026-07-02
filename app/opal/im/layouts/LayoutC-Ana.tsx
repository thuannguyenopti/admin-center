"use client";

import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogForm,
  DialogHeader,
  Disclosure,
  DisclosureContent,
  DisclosureTrigger,
  Field,
  Group,
  Input,
  Select,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import {
  IconAngleDown,
  IconArrowRight,
  IconArrowRotateLeft,
  IconArrowTurnUp,
  IconArrowUpRightFromSquare,
  IconBullseyePointer,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconCode,
  IconCopy,
  IconDownload,
  IconEllipsisStroke,
  IconEllipsisStrokeVertical,
  IconFileLines,
  IconFilePdf,
  IconFileWord,
  IconFolder,
  IconGrid,
  IconImage,
  IconLock,
  IconMessageLines,
  IconPaperPlaneTop,
  IconBold,
  IconCommentPlus,
  IconEye,
  IconItalic,
  IconLink,
  IconUnderline,
  IconFolderOpen,
  IconList,
  IconListOl,
  IconPen,
  IconPlus,
  IconSearch,
  IconSparkles,
  IconStrikethrough,
  IconThumbsDown,
  IconThumbsUp,
  IconThumbtack,
  IconThumbtackSolid,
  IconUserPlus,
  IconXmark,
} from "@optiaxiom/icons";
import React, { useEffect, useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type OnlineStatus = "online" | "busy" | "offline";

interface DMContact {
  id: string;
  name: string;
  initials: string;
  bg: string;
  status: OnlineStatus;
  unread?: number;
  isVT?: boolean;
  pinned?: boolean;
  photoUrl?: string;
  role?: string;
}

interface GroupChat {
  id: string;
  name: string;
  initials: string;
  bg: string;
  subtitle: string;
  members?: string[];
  description?: string;
  unread?: number;
  pinned?: boolean;
}

// ── Activity surface (shared with future cross-project "Needs you") ────
//
// All three item shapes carry projectId so the same data can power a
// project-scoped strip (this file) AND a cross-project surface later.
// ActivityActor is reused across all three to keep the avatar/glyph
// rendering consistent.

interface ActivityActor {
  name: string;
  initials: string;
  bg: string;
  isVT?: boolean;
  photoUrl?: string;
}

interface WorkingNowItem {
  id: string;
  projectId: string;
  actor: ActivityActor;
  taskDescription: string;
  artifactId?: string;
  eta?: string;
}

type ArtifactType = "copy" | "audience" | "brief" | "image";

interface ApprovalItem {
  id: string;
  projectId: string;
  artifactId: string;
  artifactType: ArtifactType;
  artifactName: string;
  status: string;
  context: string;
  actionLabel: "Review" | "Approve" | "Undo";
  // hitl = blocked on user, aitl = autonomous-but-reversible
  kind: "hitl" | "aitl";
}

interface RecentItem {
  id: string;
  projectId: string;
  actor: ActivityActor;
  description: string;
  artifactId?: string;
  time: string;
}

interface ArtifactDef {
  icon: React.ReactNode;
  title: string;
  time: string;
  description: string;
  contributors: { initials: string; bg: string }[];
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const DM_CONTACTS: DMContact[] = [
  { id: "sofia",   name: "Sofia Andersson",    initials: "SA", bg: "#7c6fad", status: "online",  unread: 2, pinned: true, photoUrl: "https://i.pravatar.cc/96?img=47", role: "Senior Content Strategist" },
  { id: "daniel",  name: "Daniel Vega",        initials: "DV", bg: "#6a8abf", status: "online",  unread: 3,               photoUrl: "https://i.pravatar.cc/96?img=12", role: "Campaign Manager" },
  { id: "frank",   name: "Frank",              initials: "F",  bg: "#3ecfb2", status: "online",  isVT: true, photoUrl: "/avatars/vau-frank.png?v=2",  role: "Content Marketing Chief of Staff" },
  { id: "henry",   name: "Henry",              initials: "H",  bg: "#9b6fd4", status: "online",  isVT: true, photoUrl: "/avatars/vau-henry.png?v=2",  role: "Customer Experience Analyst" },
  { id: "jonas",   name: "Jonas",              initials: "J",  bg: "#6a8abf", status: "online",  isVT: true, unread: 2,   photoUrl: "/avatars/vau-jonas.png?v=2",  role: "Sales Intelligence Agent" },
  { id: "kerby",   name: "Kerby",              initials: "K",  bg: "#4a9e7a", status: "online",  isVT: true, photoUrl: "/avatars/vau-kerby.png?v=2",  role: "Research & Insights Agent" },
  { id: "raj",     name: "Raj Patel",          initials: "RP", bg: "#5b7fa6", status: "online",               photoUrl: "https://i.pravatar.cc/96?img=52", role: "Senior Marketing Analyst" },
  { id: "claire",  name: "Claire Fontaine",    initials: "CF", bg: "#c97c3a", status: "busy",                 photoUrl: "https://i.pravatar.cc/96?img=5",  role: "Brand Strategist" },
  { id: "james",   name: "James Okafor",       initials: "JO", bg: "#3d8a6e", status: "offline",              photoUrl: "https://i.pravatar.cc/96?img=8",  role: "EMEA Marketing Lead" },
  { id: "nina",    name: "Nina Kowalski",      initials: "NK", bg: "#b25c5c", status: "online",               photoUrl: "https://i.pravatar.cc/96?img=23", role: "Competitive Intelligence" },
  { id: "yuki",    name: "Yuki Tanaka",        initials: "YT", bg: "#8a6abf", status: "offline",              photoUrl: "https://i.pravatar.cc/96?img=44", role: "SEO Content Strategist" },
  { id: "miles",   name: "Miles Oduya",        initials: "MO", bg: "#4a9e7a", status: "online",               photoUrl: "https://i.pravatar.cc/96?img=51", role: "Customer Experience Lead" },
];

const GROUP_CHATS: GroupChat[] = [
  { id: "q3",       name: "Q3 Campaign Launch",  initials: "Q3", bg: "#5b7fa6", subtitle: "Sofia, Raj, Frank +2", members: ["Sofia Andersson", "Raj Patel", "Frank (Virtual Teammate)", "Henry (Virtual Teammate)", "Ana Shuleva"], description: "A cross-functional beauty campaign launch — owning the creative direction, audience strategy, and channel mix from brand positioning through go-live.", pinned: true },
  { id: "q4",       name: "Claw Machine Campaign",  initials: "HH", bg: "#4a9e7a", subtitle: "Daniel, Yuki, Frank +2", description: "Full-funnel launch campaign for a collectible Gen-Z nail polish line built around themed mini-polish drops — brand identity, packaging system, drop mechanics, and social-first content engine in production.", unread: 5 },
  { id: "holiday",  name: "Holiday Email Series",initials: "HE", bg: "#c97c3a", subtitle: "Daniel, Frank +1", description: "A multi-touch email program for the holiday window — building the cadence, copy, and segmentation that carry brand voice from pre-Black Friday through year-end." },
];

interface PinnedMessage {
  id: string;
  sender: string;
  preview: string;
  time: string;
  initials: string;
  bg: string;
}

const PINNED_MESSAGES: PinnedMessage[] = [
  { id: "p1", sender: "Sofia Andersson", preview: "Final copy deck is in the shared drive — please review before EOD", time: "2h ago", initials: "SA", bg: "#7c6fad" },
  { id: "p2", sender: "Q4 Launch Planning", preview: "Go/no-go decision moved to Thursday 3pm", time: "Yesterday", initials: "Q4", bg: "#5b7fa6" },
  { id: "p3", sender: "Raj Patel", preview: "Stakeholder deck link: notion.so/q4-deck", time: "Mon", initials: "RP", bg: "#3d8a6e" },
];

interface ChatMessage {
  id: string;
  sender: "you" | "them";
  text?: string;
  artifact?: { title: string; subtitle: string; type: ArtifactRefType };
  time: string;
}

const DM_THREADS: Record<string, ChatMessage[]> = {
  sofia: [
    { id: "1",  sender: "them", text: "Morning! Quick heads up — I pushed the campaign brief to the shared drive last night. Wanted to get it in before the stand-up.", time: "8:47" },
    { id: "2",  sender: "you",  text: "Got it, will take a look before the call.", time: "8:51" },
    { id: "3",  sender: "them", text: "Also flagged a few open questions in comments — mainly around audience segmentation for the mid-funnel.", time: "8:52" },
    { id: "3a", sender: "them", artifact: { title: "Glow Drop Campaign Brief", subtitle: "campaign-brief-v2.md", type: "doc" }, time: "8:52" },
    { id: "4",  sender: "you",  text: "Yep, saw those. The segmentation question is a good one — I think we need to loop in Raj on that before we lock it.", time: "9:02" },
    { id: "5",  sender: "them", text: "Agreed. I'll ping him now so he has context before the meeting.", time: "9:03" },
    { id: "6",  sender: "them", text: "Also — are we still planning to run a B test on the hero copy? I want to flag it if so because it affects the production timeline.", time: "9:04" },
    { id: "7",  sender: "you",  text: "Yes, definitely still B testing. Can you add a note to the brief so the team knows to factor in the variant production?", time: "9:10" },
    { id: "8",  sender: "them", text: "Done — added a callout box at the top so it's hard to miss.", time: "9:12" },
    { id: "9",  sender: "you",  text: "Perfect. Thanks for staying on top of this.", time: "9:14" },
    { id: "10", sender: "them", text: "Of course. One more thing — the legal review window is 5 business days. If we want to hit the Nov 1 launch we need to submit by tomorrow EOD.", time: "9:20" },
    { id: "11", sender: "you",  text: "That's tight. Let's prioritise the final copy pass this morning then.", time: "9:22" },
    { id: "12", sender: "them", text: "Agreed. I'll block 10–12 for us if you're free?", time: "9:23" },
    { id: "13", sender: "you",  text: "Works for me, sending the invite now.", time: "9:24" },
    { id: "14", sender: "them", text: "Hey, do you have a sec to look at the campaign positioning? Want to make sure we're aligned before the go/no-go.", time: "10:18" },
    { id: "15", sender: "you",  text: "Yeah looking now — back in a few.", time: "10:22" },
    { id: "16", sender: "them", text: "Thanks. The bit I'm uncertain about is the second paragraph. Feels too corporate.", time: "10:24" },
    { id: "17", sender: "you",  text: "Agreed, it reads like a press release. Let me rewrite it — give me 10 minutes.", time: "10:26" },
    { id: "18", sender: "them", text: "Amazing, thank you. I'll hold off on sharing it with the wider team until you're done.", time: "10:27" },
  ],
  frank: [
    { id: "1",  sender: "them", text: "Good morning. Yesterday's stand-up generated 3 follow-up tasks — I've added them to your task list and drafted a summary you can paste into the project notes.", time: "8:58" },
    { id: "2",  sender: "you",  text: "Thanks Frank. Can you also flag if any of those tasks are blocked on someone else?", time: "9:00" },
    { id: "3",  sender: "them", text: "Yes — task 2 is waiting on Raj's EMEA projections. I've drafted a nudge message to him if you'd like to send it.", time: "9:01" },
    { id: "4",  sender: "you",  text: "Good call, go ahead and send it from me.", time: "9:01" },
    { id: "5",  sender: "them", text: "Done. Good morning. You have 3 meetings today — briefs prepped for all of them. Your 2pm Opal team sync has 4 open action items from last week I can resurface before you join.", time: "9:02" },
    { id: "6",  sender: "you",  text: "Yes please, and draft the internal announcement for the Opal IM GA?", time: "9:04" },
    { id: "7",  sender: "them", text: "On it — pulling launch context from your Files and Memory. First draft:", time: "9:05" },
    { id: "8",  sender: "them", artifact: { title: "Opal IM GA — #product-launches draft", subtitle: "Internal announcement · 1st draft · ready for review", type: "doc" }, time: "9:05" },
    { id: "9",  sender: "you",  text: "This is great. Can you shorten the second paragraph and make the tone a bit less formal? It reads like a press release.", time: "9:08" },
    { id: "10", sender: "them", text: "Updated — tightened the second paragraph, swapped passive voice constructions, and opened with a stronger hook. Same facts, friendlier tone.", time: "9:09" },
    { id: "11", sender: "you",  text: "Much better. One more pass — can you add a line about what it means for cross-functional teams specifically?", time: "9:11" },
    { id: "12", sender: "them", text: "Added a closing sentence that calls out how IM changes the daily workflow for content, brand, and PMM. Should land well in the product-launches channel.", time: "9:12" },
    { id: "13", sender: "you",  text: "Perfect. I'll review and post it this afternoon.", time: "9:14" },
    { id: "14", sender: "them", text: "Noted. I'll remind you at 2pm if it hasn't gone out by then.", time: "9:14" },
  ],
  henry: [
    { id: "1",  sender: "them", text: "I've been monitoring support ticket volume this week. There's a 22% spike compared to last month — mostly concentrated in onboarding and integration setup.", time: "8:30" },
    { id: "2",  sender: "you",  text: "That's higher than I expected. What's driving it?", time: "8:38" },
    { id: "3",  sender: "them", text: "Main driver: users can't find the integration settings page after signup. It's buried three levels deep and not surfaced in the getting started flow.", time: "8:39" },
    { id: "4",  sender: "them", text: "Second driver: the error messages on failed integrations don't tell users what to do next. They just get a generic 'something went wrong' with no recovery path.", time: "8:40" },
    { id: "5",  sender: "you",  text: "Both of those sound like quick wins. Can you draft a recommendation doc we can bring to the product team?", time: "8:45" },
    { id: "6",  sender: "them", text: "Already started — I'll have a draft ready within the hour.", time: "8:46" },
    { id: "7",  sender: "you",  text: "Great. Also — what's the NPS impact? Do we have data on how onboarding friction correlates to score?", time: "8:50" },
    { id: "8",  sender: "them", text: "Yes. Users who reach their first integration within 3 days give NPS scores averaging 12 points higher than those who don't. The window is critical.", time: "8:51" },
    { id: "9",  sender: "you",  text: "That's a compelling data point. Can you include that in the recommendation doc with a source citation?", time: "8:54" },
    { id: "10", sender: "them", text: "Done — added to the executive summary with a footnote linking to the raw data in the analytics workspace.", time: "8:55" },
    { id: "11", sender: "them", text: "I've completed the CX analysis you asked for. The top friction point is onboarding — specifically the integration setup flow.", time: "9:00" },
    { id: "11a", sender: "them", artifact: { title: "CX Friction Analysis — Q3", subtitle: "cx-analysis-q3.pdf", type: "doc" }, time: "9:00" },
    { id: "12", sender: "you",  text: "Can you summarise the top 5 issues with suggested fixes?", time: "9:05" },
    { id: "13", sender: "them", text: "Sure — pulling from the last 200 support tickets and NPS verbatims.", time: "9:06" },
    { id: "14", sender: "them", text: "Done. Summary ready — the biggest quick win is surfacing the integration page in the primary nav. Estimated 40% ticket reduction based on similar changes in the product logs.", time: "9:07" },
  ],
  jonas: [
    { id: "1",  sender: "them", text: "I've been tracking intent signals across your open pipeline. Meridian Retail, Forta, and StackBridge all visited the pricing page 3+ times in the last 7 days but haven't responded to outreach.", time: "8:30" },
    { id: "2",  sender: "you",  text: "Interesting. What's the last touchpoint we had with each of them?", time: "8:38" },
    { id: "3",  sender: "them", text: "Meridian: email 18 days ago, no reply. Forta: call 12 days ago, said they'd follow up. StackBridge: demo 3 weeks ago, then went quiet.", time: "8:39" },
    { id: "4",  sender: "you",  text: "Forta is the most promising — they explicitly said they'd follow up. Let's lead with them.", time: "8:42" },
    { id: "5",  sender: "them", text: "Agreed. I've drafted a re-engagement email for Forta that references their pricing page visits without making it feel surveillance-y. Want to review?", time: "8:43" },
    { id: "6",  sender: "you",  text: "Yes please. And keep it short — their team is time-poor based on their LinkedIn activity.", time: "8:45" },
    { id: "7",  sender: "them", text: "Already under 80 words. Subject line: 'Picking up where we left off' — neutral, no pressure.", time: "8:46" },
    { id: "8",  sender: "them", text: "Morning. I've flagged 3 high-intent accounts that went dark this week — Meridian Retail, Forta, and StackBridge.", time: "8:45" },
    { id: "9",  sender: "you",  text: "Good catch. Can you draft personalised outreach for each?", time: "8:50" },
    { id: "10", sender: "them", text: "On it. Pulling their CRM history and recent activity signals now.", time: "8:51" },
    { id: "11", sender: "them", text: "All three drafts ready. Forta gets the warmest tone since they expressed genuine interest. Meridian is more neutral — re-establishing context. StackBridge leans on the ROI case since their last objection was budget.", time: "8:54" },
    { id: "11a", sender: "them", artifact: { title: "Account Re-engagement Outreach Drafts", subtitle: "outreach-drafts-forta-meridian-stackbridge.md", type: "doc" }, time: "8:54" },
    { id: "12", sender: "you",  text: "These look strong. Send the Forta one today. I'll review Meridian and StackBridge before approving those.", time: "9:00" },
    { id: "13", sender: "them", text: "Forta sent. I'll surface Meridian and StackBridge in your review queue for this afternoon.", time: "9:01" },
  ],
  kerby: [
    { id: "1",  sender: "you",  text: "Kerby, can you pull together a competitive landscape brief for the board deck? Need it by Thursday.", time: "9:15" },
    { id: "2",  sender: "them", text: "On it. What's the scope — full market or just direct competitors? And any specific angles you want foregrounded?", time: "9:16" },
    { id: "3",  sender: "you",  text: "Direct competitors only. Focus on pricing, positioning, and any recent product moves in the last 90 days.", time: "9:18" },
    { id: "4",  sender: "them", text: "Got it. I'll pull from their pricing pages, recent press releases, G2 reviews, and job postings — job postings often signal product direction before announcements.", time: "9:19" },
    { id: "5",  sender: "you",  text: "Smart. Yes include the job posting angle — that's always useful for the board.", time: "9:21" },
    { id: "6",  sender: "them", text: "Initial scan done. Three competitors have made significant moves: one cut enterprise pricing by ~15%, one launched an AI feature set last month, and one is hiring aggressively in the mid-market segment.", time: "9:45" },
    { id: "7",  sender: "you",  text: "The AI feature launch is concerning. Which competitor?", time: "9:48" },
    { id: "8",  sender: "them", text: "Cortex. They announced it quietly — no press release, just a product update email and a Loom demo on their site. Still in beta but the feature set overlaps significantly with our Q4 roadmap.", time: "9:49" },
    { id: "9",  sender: "you",  text: "We need to flag that to the product team immediately. Can you add a risk callout section to the brief?", time: "9:52" },
    { id: "10", sender: "them", text: "Added. I've also cross-referenced with our public roadmap to show the specific overlap areas — three features align directly.", time: "9:53" },
    { id: "11", sender: "them", text: "The competitor landscape brief you requested is ready. Covered 6 players across pricing, positioning, and recent moves.", time: "10:00" },
    { id: "11a", sender: "them", artifact: { title: "Competitive Landscape Brief — Q3", subtitle: "competitive-brief-q3.pdf", type: "doc" }, time: "10:00" },
    { id: "12", sender: "you",  text: "Perfect timing. Can you highlight the top 3 threats for the exec summary?", time: "10:10" },
    { id: "13", sender: "them", text: "On it — selecting the most material threats based on overlap with our current positioning.", time: "10:11" },
    { id: "14", sender: "them", text: "Done. Top 3: (1) Cortex AI feature overlap with our Q4 roadmap, (2) pricing pressure from the enterprise tier cut, (3) mid-market hiring surge suggesting a land-and-expand push into our core segment.", time: "10:13" },
  ],
  raj: [
    { id: "1",  sender: "them", text: "Hey, quick check — are you joining the EMEA call tomorrow or should I cover?", time: "8:30" },
    { id: "2",  sender: "you",  text: "I'll join for the first 30 minutes then hand to you for the projections deep-dive.", time: "8:35" },
    { id: "3",  sender: "them", text: "Perfect. I'll make sure the deck is ready to share before the call.", time: "8:36" },
    { id: "4",  sender: "you",  text: "What's the status on the EMEA slide deck? Last I checked there were some placeholder numbers.", time: "8:55" },
    { id: "5",  sender: "them", text: "Updated — all figures are now confirmed from the regional finance team. I added a variance column to the projections table too, which I think will help the discussion.", time: "8:57" },
    { id: "6",  sender: "you",  text: "Good call on the variance column. Can you also add a bullet on macro risk factors?", time: "9:01" },
    { id: "7",  sender: "them", text: "Done. Added a slide on macro context — FX volatility, procurement cycles in Germany, and the UK budget impact on enterprise spend.", time: "9:04" },
    { id: "8",  sender: "them", text: "Stakeholder deck is ready — here you go:", time: "9:05" },
    { id: "8a", sender: "them", artifact: { title: "EMEA Q3 Stakeholder Deck", subtitle: "emea-stakeholder-deck-v2.pdf", type: "doc" }, time: "9:05" },
    { id: "9",  sender: "you",  text: "Perfect, I'll review before the Thursday call", time: "9:12" },
    { id: "10", sender: "them", text: "There's a slide on EMEA projections that needs your input — specifically the Nordics number. We have two scenarios and I want your read on which is more defensible.", time: "9:14" },
    { id: "11", sender: "you",  text: "Sure, I'll add comments today. My instinct is the conservative scenario — the Nordics pipeline quality isn't strong enough to justify the upside number.", time: "9:20" },
    { id: "12", sender: "them", text: "Agree with that read. I'll update the deck to lead with the conservative case and show upside as a footnote.", time: "9:22" },
    { id: "13", sender: "you",  text: "Good. Let's also make sure we have a clear narrative for why conservative is the right call — not just the numbers.", time: "9:25" },
    { id: "14", sender: "them", text: "On it. I'll frame it around pipeline maturity and deal velocity rather than just market size. More credible for this audience.", time: "9:27" },
  ],
  claire: [
    { id: "1",  sender: "them", text: "Hi! I wanted to share some early thinking on the rebrand direction. I've been exploring two routes — one is more of an evolution of what we have, the other is a bigger step change.", time: "8:45" },
    { id: "2",  sender: "you",  text: "Excited to see both. What's the timeline for getting a first look?", time: "8:52" },
    { id: "3",  sender: "them", text: "I'll have initial moodboards by end of this week. Nothing polished, just directional.", time: "8:53" },
    { id: "4",  sender: "you",  text: "That works. For context — the exec team has a slight preference for evolution over revolution, so keep that in mind.", time: "8:58" },
    { id: "5",  sender: "them", text: "Good to know. I'll make sure the step-change option still feels achievable — not a total departure. Otherwise it'll get killed in review.", time: "9:00" },
    { id: "6",  sender: "you",  text: "Exactly right. How are you thinking about the typography direction?", time: "9:05" },
    { id: "7",  sender: "them", text: "Leaning towards keeping the current typeface but pairing it with a more distinctive secondary for headlines. Adds energy without disrupting brand recognition.", time: "9:07" },
    { id: "8",  sender: "them", text: "Are we still meeting Thursday for the Q4 kick-off?", time: "9:15" },
    { id: "9",  sender: "you",  text: "Yes! Moved it to 3pm though — does that work?", time: "9:22" },
    { id: "10", sender: "them", text: "Works for me. I'll prep the stakeholder slides beforehand", time: "9:24" },
    { id: "11", sender: "you",  text: "Great — can you share a draft by Wednesday?", time: "9:30" },
    { id: "12", sender: "them", text: "Sure — here's what I have so far:", time: "9:35" },
    { id: "12a", sender: "them", artifact: { title: "Q4 Kick-off Stakeholder Slides", subtitle: "q4-kickoff-deck-draft.pdf", type: "doc" }, time: "9:35" },
    { id: "13", sender: "you",  text: "Also — can you include a slide on how the new brand direction aligns with the product positioning? That's going to be the first question in the room.", time: "9:38" },
    { id: "14", sender: "them", text: "Already planned it. Slide 4 maps each brand pillar to a product capability. Should answer the question before it's asked.", time: "9:40" },
  ],
  james: [
    { id: "1",  sender: "them", text: "James here — EMEA update. The Berlin team is moving faster than expected on enterprise deals. Two are at proposal stage that weren't on our radar last month.", time: "13:00" },
    { id: "2",  sender: "you",  text: "That's great news. What changed?", time: "13:10" },
    { id: "3",  sender: "them", text: "The localised case studies we shipped last quarter. They're using them in discovery calls and it's shortening the sales cycle significantly.", time: "13:12" },
    { id: "4",  sender: "you",  text: "Good to know — we should flag that to the content team as a signal to produce more.", time: "13:15" },
    { id: "5",  sender: "them", text: "Agreed. I'll send them a note with the specific deals as context.", time: "13:16" },
    { id: "6",  sender: "you",  text: "Did the EMEA brief land with the regional team?", time: "14:10" },
    { id: "7",  sender: "them", text: "Yes, they had a few questions on the targeting criteria — specifically why we're deprioritising the SMB segment in Q4.", time: "14:22" },
    { id: "8",  sender: "you",  text: "Can you loop me into that thread? I want to address it directly rather than having it go back and forth.", time: "14:25" },
    { id: "9",  sender: "them", text: "Done — added you just now", time: "14:26" },
    { id: "10", sender: "you",  text: "Thanks. I'll respond in the next hour.", time: "14:28" },
    { id: "11", sender: "them", text: "Heads up — the Munich office also wants to join the Thursday call. They're asking for 15 minutes on the localization roadmap.", time: "14:35" },
    { id: "12", sender: "you",  text: "Fine with me. Can you send them the deck in advance so we don't spend the time on context-setting?", time: "14:40" },
    { id: "13", sender: "them", text: "Will do. I'll send it tomorrow morning with a brief covering note.", time: "14:41" },
    { id: "13a", sender: "them", artifact: { title: "EMEA Enterprise Pipeline Update", subtitle: "emea-pipeline-q3-update.pdf", type: "doc" }, time: "14:41" },
  ],
  nina: [
    { id: "1",  sender: "you",  text: "Nina, quick one — how far along is the competitor teardown?", time: "10:30" },
    { id: "2",  sender: "them", text: "About 70%. I've finished the feature comparison matrix and the pricing analysis. Still working on the positioning narrative.", time: "10:35" },
    { id: "3",  sender: "you",  text: "The pricing analysis is the most urgent part. Can you share just that section today?", time: "10:38" },
    { id: "4",  sender: "them", text: "Already done — I exported it to the shared drive and linked it in the project notes. Let me know if you can't see it.", time: "10:40" },
    { id: "5",  sender: "you",  text: "Got it, looking now. This is really comprehensive — the packaging tier comparison is exactly what the sales team needs.", time: "10:52" },
    { id: "6",  sender: "them", text: "Good, that was the hardest section to put together. Some of their pricing isn't public so I had to cross-reference sales calls and G2 reviews.", time: "10:54" },
    { id: "7",  sender: "them", text: "The competitor teardown is almost done — here's the pricing section to start:", time: "11:00" },
    { id: "7a", sender: "them", artifact: { title: "Competitor Pricing Analysis", subtitle: "competitor-pricing-teardown.pdf", type: "doc" }, time: "11:00" },
    { id: "8",  sender: "you",  text: "Brilliant. Is the full analysis included?", time: "11:08" },
    { id: "9",  sender: "them", text: "Yes, with a side-by-side on packaging tiers", time: "11:10" },
    { id: "10", sender: "you",  text: "Perfect, that's exactly what we need for the sales deck", time: "11:14" },
    { id: "11", sender: "them", text: "I'll also add a one-pager summary at the front so sales reps can get the key points in under 2 minutes.", time: "11:15" },
    { id: "12", sender: "you",  text: "That's a great idea — battle cards format if possible?", time: "11:18" },
    { id: "13", sender: "them", text: "Yes, was planning exactly that. Competitor name, key differentiators, how we beat them, common objections. Fits on one A4 page.", time: "11:20" },
  ],
  daniel: [
    { id: "1",  sender: "you",  text: "Daniel, wanted to check in on the holiday email timeline. Are we still on track?", time: "8:30" },
    { id: "2",  sender: "them", text: "Mostly yes. The send schedule is drafted but I'm waiting on the copy brief from Sofia before I can finalise the subject line testing plan.", time: "8:35" },
    { id: "3",  sender: "you",  text: "Sofia's brief should be ready by EOD today. I'll flag it to her.", time: "8:38" },
    { id: "4",  sender: "them", text: "That helps. Once I have it I can turn around the testing plan within 24 hours.", time: "8:39" },
    { id: "5",  sender: "them", text: "Quick one — are we going ahead with the holiday email series?", time: "8:45" },
    { id: "6",  sender: "you",  text: "Yes, kicking off next week. Can you own the send schedule?", time: "8:52" },
    { id: "7",  sender: "them", text: "On it — here's the draft calendar:", time: "8:54" },
    { id: "7a", sender: "them", artifact: { title: "Holiday Email Send Schedule", subtitle: "holiday-email-calendar-draft.pdf", type: "doc" }, time: "8:54" },
    { id: "8",  sender: "you",  text: "Thanks — copy needs to be locked by the 15th", time: "9:00" },
    { id: "9",  sender: "them", text: "Understood. I'll flag if we're at risk on timeline", time: "9:03" },
    { id: "10", sender: "you",  text: "Also — what's the segmentation plan for the series? Are we doing one send to the full list or breaking it up?", time: "9:10" },
    { id: "11", sender: "them", text: "Breaking it up. Three segments: active customers, lapsed (no purchase in 90+ days), and prospects. Different messaging and send windows for each.", time: "9:12" },
    { id: "12", sender: "you",  text: "Smart. Make sure the lapsed segment gets a win-back angle — not just the holiday offer.", time: "9:15" },
    { id: "13", sender: "them", text: "Already planned. The lapsed email leads with a product update to re-establish value, then introduces the offer. Less discount-y, more 'here's what you've been missing'.", time: "9:17" },
    { id: "14", sender: "you",  text: "Love that framing. Run with it.", time: "9:19" },
  ],
  yuki: [
    { id: "1",  sender: "them", text: "The November content calendar is ready for review. 12 articles mapped to target keywords, 4 of which are high-volume clusters we haven't ranked for yet.", time: "15:30" },
    { id: "1a", sender: "them", artifact: { title: "November SEO Content Calendar", subtitle: "nov-content-calendar-q4.pdf", type: "doc" }, time: "15:30" },
    { id: "2",  sender: "you",  text: "That's a solid output. What's the mix between top-of-funnel and mid-funnel?", time: "15:40" },
    { id: "3",  sender: "them", text: "8 ToFu, 4 MoFu. We're weighted towards discovery this month because the new product pages should handle the bottom of the funnel once they're live.", time: "15:42" },
    { id: "4",  sender: "you",  text: "Makes sense. Who's writing the MoFu pieces — internal or agency?", time: "15:45" },
    { id: "5",  sender: "them", text: "Two internal, two agency. I've briefed the agency already — they have 10 days which is tight but doable.", time: "15:46" },
    { id: "6",  sender: "you",  text: "How's the SEO content calendar looking?", time: "16:00" },
    { id: "7",  sender: "them", text: "On track — Q4 articles are mapped out, waiting on keyword sign-off", time: "16:15" },
    { id: "8",  sender: "you",  text: "I'll get that approved by end of day", time: "16:18" },
    { id: "9",  sender: "them", text: "Great. Once I have sign-off I can brief the writers and lock the editorial calendar.", time: "16:19" },
    { id: "10", sender: "you",  text: "Approved — just sent you the list with a few tweaks. One keyword swap on article 7 and an added cluster on article 11.", time: "16:55" },
    { id: "11", sender: "them", text: "Got it, updating the briefs now. The swap on article 7 is a better fit — higher intent, lower competition. Good call.", time: "16:57" },
    { id: "12", sender: "you",  text: "Glad it works. Let me know if anything else needs input before you brief the team.", time: "17:00" },
    { id: "13", sender: "them", text: "Will do. Should have the full brief pack ready by tomorrow morning.", time: "17:01" },
  ],
  miles: [
    { id: "1",  sender: "them", text: "NPS results are in for Q3. Overall score is 42 — down 4 points from Q2. Not alarming but worth a close look.", time: "12:00" },
    { id: "2",  sender: "you",  text: "What are the main themes in the verbatims?", time: "12:15" },
    { id: "3",  sender: "them", text: "Two dominant themes: onboarding friction (mentioned by 38% of detractors) and slow support response time (mentioned by 29%).", time: "12:17" },
    { id: "4",  sender: "you",  text: "Both are fixable. The onboarding one we already know about — Henry has a recommendation doc in progress. The support response time is more interesting.", time: "12:20" },
    { id: "5",  sender: "them", text: "Support team is stretched — ticket volume is up 22% but headcount is flat. They need either more resource or smarter triage.", time: "12:22" },
    { id: "6",  sender: "you",  text: "Can you put together a short brief on the options? I want to bring this to the ops team with concrete proposals, not just the problem.", time: "12:25" },
    { id: "7",  sender: "them", text: "Yes. I'm thinking 3 options: hire a support specialist, implement AI triage for tier-1 tickets, or route tier-1 volume to a partner. I'll model the cost and impact for each.", time: "12:27" },
    { id: "7a", sender: "them", artifact: { title: "Support Capacity Options Brief", subtitle: "support-capacity-options-q3.pdf", type: "doc" }, time: "12:27" },
    { id: "8",  sender: "them", text: "The CX feedback review is scheduled for Friday at 2pm", time: "13:30" },
    { id: "9",  sender: "you",  text: "I'll be there. Any pre-read needed?", time: "13:45" },
    { id: "10", sender: "them", text: "Just the NPS summary I shared last week — 10 mins tops", time: "13:47" },
    { id: "11", sender: "you",  text: "Got it, will re-read tonight", time: "13:50" },
    { id: "12", sender: "them", text: "Also — I've invited Henry to the first 20 minutes since his analysis covers the onboarding piece. Hope that's okay.", time: "13:52" },
    { id: "13", sender: "you",  text: "Great idea. His data will make the conversation more concrete.", time: "13:55" },
    { id: "14", sender: "them", text: "That was my thinking too. See you Friday.", time: "13:56" },
  ],
};

// ── DM conversation context layer ─────────────────────────────────────────────

type DMTab = "messages" | "pins" | "needs-review" | "activity";
type VAUActivityType = "artifact" | "task" | "memory" | "aitl";
type NeedsReviewType = "artifact" | "action" | "memory" | "question";

interface NeedsReviewItem {
  id: string;
  type: NeedsReviewType;
  title: string;
  subtitle: string;
  primaryActionLabel: string; // "Review" | "Approve" | "Reply"
}

interface DMPinEntry {
  id: string;
  sender: "you" | "them";
  text?: string;
  artifact?: { title: string; subtitle: string };
  time: string;
  pinnedAt: string;
}

interface VAUActivityItem {
  id: string;
  type: VAUActivityType;
  description: string;
  project?: string;
  projectBg?: string;
  time: string;
  status?: string;
  actionLabel?: string;
}

interface VAUActivityDay { label: string; items: VAUActivityItem[]; }

const DM_PINS: Record<string, DMPinEntry[]> = {
  frank: [
    { id: "p1", sender: "them", text: "Good morning. You have 3 meetings today — briefs prepped for all of them. Your 2pm Opal team sync has 4 open action items from last week I can resurface before you join.", time: "9:02", pinnedAt: "Today" },
    { id: "p2", sender: "them", artifact: { title: "Opal IM GA — #product-launches draft", subtitle: "Internal announcement · 1st draft · ready for review" }, time: "9:05", pinnedAt: "Today" },
  ],
  henry: [
    { id: "p1", sender: "them", text: "Users who reach their first integration within 3 days give NPS scores averaging 12 points higher than those who don't. The window is critical.", time: "8:51", pinnedAt: "Today" },
  ],
  sofia: [
    { id: "p1", sender: "them", artifact: { title: "Glow Drop Campaign Brief", subtitle: "campaign-brief-v2.md" }, time: "8:52", pinnedAt: "Today" },
  ],
};

const VAU_ACTIVITY: Record<string, VAUActivityDay[]> = {
  frank: [
    {
      label: "TODAY",
      items: [
        { id: "a1", type: "artifact", description: "Drafted Opal IM GA — #product-launches draft", project: "Q3 Campaign Launch", projectBg: "#5b7fa6", time: "12m ago", status: "awaiting your review", actionLabel: "Review" },
        { id: "a2", type: "memory",   description: "Added competitor research to memory", time: "22m ago" },
        { id: "a3", type: "task",     description: "Completed meeting debrief — Opal IM sync", time: "1h ago", status: "sent to Notion" },
        { id: "a4", type: "aitl",     description: "Sent campaign brief to the team", project: "Q3 Campaign Launch", projectBg: "#5b7fa6", time: "2h ago", actionLabel: "Undo" },
      ],
    },
    {
      label: "YESTERDAY",
      items: [
        { id: "b1", type: "artifact", description: "Drafted Color Stories proposal", project: "Q3 Campaign Launch", projectBg: "#5b7fa6", time: "1d ago", actionLabel: "Open" },
        { id: "b2", type: "task",     description: "Completed hero copy variants for Q3", project: "Q3 Campaign Launch", projectBg: "#5b7fa6", time: "1d ago" },
      ],
    },
  ],
  henry: [
    {
      label: "TODAY",
      items: [
        { id: "a1", type: "artifact", description: "Drafted CX Friction Analysis — Q3", time: "9m ago", status: "awaiting your review", actionLabel: "Review" },
        { id: "a2", type: "memory",   description: "Updated NPS correlation data in memory", time: "1h ago" },
        { id: "a3", type: "task",     description: "Completed onboarding ticket analysis", time: "2h ago", status: "200 tickets reviewed" },
      ],
    },
    {
      label: "YESTERDAY",
      items: [
        { id: "b1", type: "aitl",     description: "Sent onboarding friction report to Miles", time: "1d ago", actionLabel: "Undo" },
        { id: "b2", type: "artifact", description: "Drafted NPS Q3 Summary", time: "1d ago", actionLabel: "Open" },
      ],
    },
  ],
  jonas: [
    {
      label: "TODAY",
      items: [
        { id: "a1", type: "artifact", description: "Drafted Account Re-engagement Outreach Drafts", time: "15m ago", status: "awaiting your review", actionLabel: "Review" },
        { id: "a2", type: "task",     description: "Completed intent signal scan — 3 accounts flagged", time: "45m ago" },
        { id: "a3", type: "aitl",     description: "Sent Forta re-engagement email", time: "2h ago", actionLabel: "Undo" },
      ],
    },
    {
      label: "YESTERDAY",
      items: [
        { id: "b1", type: "artifact", description: "Drafted Pipeline Risk Report — Q3", time: "1d ago", actionLabel: "Open" },
        { id: "b2", type: "memory",   description: "Updated Forta account context in memory", time: "1d ago" },
      ],
    },
  ],
  kerby: [
    {
      label: "TODAY",
      items: [
        { id: "a1", type: "artifact", description: "Drafted Competitive Landscape Brief — Q3", time: "20m ago", status: "awaiting your review", actionLabel: "Review" },
        { id: "a2", type: "task",     description: "Completed Cortex AI feature analysis", time: "1h ago" },
        { id: "a3", type: "memory",   description: "Added Cortex product update to memory", time: "2h ago" },
      ],
    },
    {
      label: "YESTERDAY",
      items: [
        { id: "b1", type: "artifact", description: "Drafted Competitor Pricing Teardown", time: "1d ago", actionLabel: "Open" },
        { id: "b2", type: "aitl",     description: "Flagged AI feature overlap to product team", time: "1d ago" },
      ],
    },
  ],
};

const NEEDS_REVIEW: Record<string, NeedsReviewItem[]> = {
  frank: [
    { id: "n1", type: "artifact", title: "Hero copy v3 — 3 variants ready",                       subtitle: "Drafted 12m ago for Q3 Campaign Launch",         primaryActionLabel: "Review"  },
    { id: "n2", type: "action",   title: "Send Slack announcement to #product-launches",          subtitle: "Drafted 18m ago, awaiting your approval",        primaryActionLabel: "Approve" },
    { id: "n3", type: "memory",   title: "Update memory with “Sofia is content lead on Q3”",  subtitle: "Proposed 22m ago",                               primaryActionLabel: "Approve" },
  ],
  henry: [
    { id: "n1", type: "artifact", title: "CX Friction Analysis — Q3",                             subtitle: "Drafted 9m ago, awaiting your review",           primaryActionLabel: "Review"  },
    { id: "n2", type: "question", title: "Confirm onboarding integration is top priority before I draft the fix doc", subtitle: "Asked 1h ago",         primaryActionLabel: "Reply"   },
  ],
  jonas: [
    { id: "n1", type: "artifact", title: "Account Re-engagement Outreach — 3 drafts",             subtitle: "Drafted 15m ago, awaiting your review",          primaryActionLabel: "Review"  },
    { id: "n2", type: "action",   title: "Send Meridian re-engagement email",                     subtitle: "Drafted 1h ago, awaiting your approval",         primaryActionLabel: "Approve" },
  ],
  kerby: [
    { id: "n1", type: "artifact", title: "Competitive Landscape Brief — Q3",                      subtitle: "Drafted 20m ago, awaiting your review",          primaryActionLabel: "Review"  },
  ],
};

type ArtifactRefType = "code" | "doc" | "audience" | "image";

interface BaseMessage {
  id: string;
  senderId: string;
  senderName: string;
  initials: string;
  bg: string;
  isVT?: boolean;
  time: string;
}

interface TextGroupMessage extends BaseMessage {
  kind?: "text";
  text: string;
  showActions?: boolean;
}

interface ArtifactGroupMessage extends BaseMessage {
  kind: "artifact";
  artifactTitle: string;
  artifactSubtitle: string;
  artifactType: ArtifactRefType;
}

interface ApprovalGroupMessage extends BaseMessage {
  kind: "approval";
  artifactTitle: string;
  artifactSubtitle: string;
  artifactType: ArtifactRefType;
  agentLabel: string;
  approvalTitle: string;
  approvalBody: string;
}

type GroupMessage = TextGroupMessage | ArtifactGroupMessage | ApprovalGroupMessage;

const GROUP_THREADS: Record<string, GroupMessage[]> = {
  q3: [
    { id: "1", senderId: "sofia", senderName: "Sofia", initials: "SA", bg: "#7c6fad", text: "Frank — can you take another pass at the hero copy? Variant B felt strongest but the CTA needs sharpening.", time: "10:14" },
    { id: "2", senderId: "frank",  senderName: "Frank",  initials: "F",  bg: "#3ecfb2", isVT: true, kind: "text", text: "On it. Rewriting the CTA on Hero copy v3 with a more confident, action-led voice. Will pull from the brand voice doc for consistency.", time: "10:16", showActions: true },
    { id: "3", senderId: "frank",  senderName: "Frank",  initials: "F",  bg: "#3ecfb2", isVT: true, kind: "artifact", artifactTitle: "hero-copy-v3.md", artifactSubtitle: "Hero copy · 3 variants · updated", artifactType: "code", time: "10:18" },
    { id: "4", senderId: "frank",  senderName: "Frank",  initials: "F",  bg: "#3ecfb2", isVT: true, kind: "text", text: "The updated hero is ready for final review. See the revised artifact above.", time: "10:18", showActions: true },
    { id: "5", senderId: "frank",  senderName: "Frank",  initials: "F",  bg: "#3ecfb2", isVT: true, kind: "approval", artifactTitle: "hero-copy-v3.md", artifactSubtitle: "Hero copy · 3 variants", artifactType: "code", agentLabel: "FRANK", approvalTitle: "Team approval needed", approvalBody: "Review the updated hero copy. Approve to proceed with the campaign launch, or request further changes.", time: "10:19" },
    { id: "6", senderId: "raj",   senderName: "Raj",   initials: "RP", bg: "#5b7fa6", text: "Looking now — back in 5.", time: "10:22" },
  ],
  q4: [
    { id: "1",  senderId: "daniel", senderName: "Daniel", initials: "DV", bg: "#6a8abf", text: "Morning team — Peticure kickoff doc is live. We're targeting pet owners 25–44, skewing urban. Brand voice is warm, playful, expert.", time: "9:00" },
    { id: "2",  senderId: "yuki",   senderName: "Yuki",   initials: "YT", bg: "#8a6abf", text: "Got it. I'll map the keyword clusters this morning — there's a big search volume gap in the 'natural pet grooming' space we can own.", time: "9:08" },
    { id: "3",  senderId: "frank",  senderName: "Frank",  initials: "F",  bg: "#3ecfb2", isVT: true, kind: "text", text: "I've pulled competitor positioning for the top 6 pet wellness brands. Key gap: none of them lead with the human–pet emotional bond. That's our angle.", time: "9:14", showActions: true },
    { id: "3a", senderId: "frank",  senderName: "Frank",  initials: "F",  bg: "#3ecfb2", isVT: true, kind: "artifact", artifactTitle: "Peticure Launch Messaging Guide", artifactSubtitle: "peticure-messaging-v1.md · 4 tone variants · ready for review", artifactType: "doc", time: "9:15" },
    { id: "4",  senderId: "you",    senderName: "You",    initials: "Y",  bg: "#8a6abf", text: "Love the emotional bond angle — that's exactly right. Frank, can you lead with that in the hero copy?", time: "9:20" },
    { id: "5",  senderId: "frank",  senderName: "Frank",  initials: "F",  bg: "#3ecfb2", isVT: true, kind: "text", text: "Updated. Hero copy now opens with 'Because they trust you completely.' Followed by the product benefit stack.", time: "9:22", showActions: true },
    { id: "6",  senderId: "kerby",  senderName: "Kerby",  initials: "K",  bg: "#4a9e7a", isVT: true, kind: "text", text: "Persona research is in. Top insight: buyers prioritise ingredient transparency over price. 68% read labels before purchasing.", time: "9:30", showActions: true },
    { id: "7",  senderId: "daniel", senderName: "Daniel", initials: "DV", bg: "#6a8abf", text: "That changes the email angle — we should lead with ingredient sourcing, not the discount.", time: "9:34" },
    { id: "8",  senderId: "you",    senderName: "You",    initials: "Y",  bg: "#8a6abf", text: "Agreed. Update the email series to feature the supply chain story in email 1.", time: "9:36" },
    { id: "9",  senderId: "frank",  senderName: "Frank",  initials: "F",  bg: "#3ecfb2", isVT: true, kind: "approval", artifactTitle: "Peticure Launch Messaging Guide", artifactSubtitle: "peticure-messaging-v1.md · 4 tone variants", artifactType: "doc", agentLabel: "FRANK", approvalTitle: "Team approval needed", approvalBody: "Review the Peticure messaging guide. Approve to hand off to creative production, or request changes to tone and copy.", time: "9:38" },
    { id: "10", senderId: "yuki",   senderName: "Yuki",   initials: "YT", bg: "#8a6abf", text: "On it — finalising keyword clusters now. Should have the SEO brief ready by noon.", time: "9:40" },
  ],
  cx: [
    { id: "1", senderId: "miles",  senderName: "Miles",  initials: "MO", bg: "#4a9e7a", text: "NPS dropped 4 points this quarter. Main themes: onboarding friction and slow support response.", time: "14:00" },
    { id: "2", senderId: "nina",   senderName: "Nina",   initials: "NK", bg: "#b25c5c", text: "The onboarding data matches what we saw in the competitor teardown — similar drop-off pattern.", time: "14:08" },
    { id: "3", senderId: "henry",   senderName: "Henry",   initials: "H", bg: "#9b6fd4", isVT: true, text: "I've analysed the last 200 support tickets. Top issue: users can't find the integration settings page.", time: "14:12" },
    { id: "4", senderId: "you",    senderName: "You",    initials: "Y",  bg: "#8a6abf", text: "That's fixable — can we surface it in the nav? Henry can you draft a recommendation?", time: "14:15" },
    { id: "5", senderId: "henry",   senderName: "Henry",   initials: "H", bg: "#9b6fd4", isVT: true, text: "Recommendation drafted and added to the workspace artifact.", time: "14:16" },
    { id: "5a", senderId: "henry",  senderName: "Henry",  initials: "H", bg: "#9b6fd4", isVT: true, kind: "artifact", artifactTitle: "Onboarding Friction Recommendation", artifactSubtitle: "onboarding-fix-recommendations.md · ready for review", artifactType: "doc", time: "14:16" },
  ],
  holiday: [
    { id: "1", senderId: "daniel", senderName: "Daniel", initials: "DV", bg: "#6a8abf", text: "Welcome to the Holiday Email Series, team! Excited to kick this off with you all. We'll be planning out the cadence, copy, and segmentation here — drop in any ideas as they come.", time: "9:00" },
  ],
  geo: [
    { id: "1", senderId: "james",  senderName: "James",  initials: "JO", bg: "#3d8a6e", text: "EMEA team confirmed budget for Q4. We have headroom to push the enterprise tier harder.", time: "11:00" },
    { id: "2", senderId: "you",    senderName: "You",    initials: "Y",  bg: "#8a6abf", text: "Great. Let's prioritise Germany and the Nordics — highest ACV in the region.", time: "11:10" },
    { id: "3", senderId: "frank",   senderName: "Frank",   initials: "F",  bg: "#3ecfb2", isVT: true, text: "I've drafted localised messaging variants for DE and SE. Added to the workspace.", time: "11:14" },
    { id: "3a", senderId: "frank",  senderName: "Frank",  initials: "F",  bg: "#3ecfb2", isVT: true, kind: "artifact", artifactTitle: "EMEA Localised Messaging Variants", artifactSubtitle: "emea-messaging-de-se.md · DE + SE variants · ready for review", artifactType: "doc", time: "11:14" },
    { id: "4", senderId: "james",  senderName: "James",  initials: "JO", bg: "#3d8a6e", text: "Frank the DE variant is spot on. SE might need softening — more consensus-oriented tone.", time: "11:20" },
    { id: "5", senderId: "frank",   senderName: "Frank",   initials: "F",  bg: "#3ecfb2", isVT: true, text: "Updated. Swapped the urgency framing for a collaborative decision tone on the SE variant.", time: "11:21" },
  ],
};

const FRANK: ActivityActor = { name: "Frank", initials: "F", bg: "#3ecfb2", isVT: true, photoUrl: "/avatars/vau-frank.png?v=2" };
const YOU: ActivityActor = { name: "You", initials: "Y", bg: "#5b7fa6", photoUrl: "https://i.pravatar.cc/96?img=15" };
const SOFIA: ActivityActor = { name: "Sofia", initials: "SA", bg: "#7c6fad", photoUrl: "https://i.pravatar.cc/96?img=47" };

const WORKING_NOW: WorkingNowItem[] = [];

const APPROVALS: ApprovalItem[] = [];

const RECENT: RecentItem[] = [];

const Q3_ARTIFACTS: ArtifactDef[] = [
  {
    icon: <IconFileLines size={16} />,
    title: "Hero copy v3",
    time: "just now",
    description: "Frank drafted three variants. Ana commented on tone.",
    contributors: [
      { initials: "B", bg: "#3d8a6e" },
      { initials: "AS", bg: "#5b7fa6" },
    ],
  },
  {
    icon: <IconBullseyePointer size={16} />,
    title: "Audience segment",
    time: "12m ago",
    description: "You picked North America · Enterprise. 42k contacts.",
    contributors: [{ initials: "Y", bg: "#8a6abf" }],
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: OnlineStatus }) {
  if (status === "offline") return null;
  const color = status === "online" ? "#3ecfb2" : "#e8a020";
  return (
    <Box
      style={{
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: color,
        border: "2px solid var(--ax-colors-bg-default)",
      }}
    />
  );
}

function CircleAvatar({
  initials,
  bg,
  src,
  size = 32,
  status,
}: {
  initials: string;
  bg: string;
  src?: string;
  size?: number;
  status?: OnlineStatus;
}) {
  return (
    <Box style={{ position: "relative", flexShrink: 0 }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={initials}
          width={size}
          height={size}
          style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <Box
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 600,
            color: "#fff",
          }}
        >
          {initials}
        </Box>
      )}
      {status && <StatusDot status={status} />}
    </Box>
  );
}

function SquareBadgeAvatar({ initials, bg, size = 32 }: { initials: string; bg: string; size?: number }) {
  return (
    <Box
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
        opacity: 0.85,
      }}
    >
      {initials}
    </Box>
  );
}

function SectionHeader({ label, count, action }: { label: string; count?: number; action?: React.ReactNode }) {
  return (
    <Group gap="6" alignItems="center" justifyContent="space-between" w="full">
      <Group gap="6" alignItems="center">
        <Text
          fontSize="xs"
          fontWeight="500"
          color="fg.tertiary"
          style={{ textTransform: "uppercase", letterSpacing: "0.07em" }}
        >
          {label}
        </Text>
        {typeof count === "number" && <Badge intent="neutral">{count}</Badge>}
      </Group>
      {action}
    </Group>
  );
}

// PinAction — visible when row hovered OR contact/project is pinned.
// Uses Axiom Button (subtle) + IconThumbtack. Opacity transition gives the
// hover-reveal effect without needing extra CSS classes.
function PinAction({ pinned, hovered, onToggle }: { pinned?: boolean; hovered: boolean; onToggle?: () => void }) {
  const visible = pinned || hovered;
  return (
    <Box
      onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
      style={{ opacity: visible ? 1 : 0, transition: "opacity 120ms ease", flexShrink: 0 }}
    >
      <Tooltip content={pinned ? "Unpin" : "Pin"}>
        <Button
          appearance="subtle"
          size="sm"
          icon={pinned
              ? <IconThumbtackSolid size={16} style={{ color: "#202320" }} />
              : <IconThumbtack size={16} />}
          aria-label={pinned ? "Unpin" : "Pin"}
          style={pinned ? { color: "#202320" } : undefined}
        />
      </Tooltip>
    </Box>
  );
}

function DMRow({ contact, active, onClick, onTogglePin }: { contact: DMContact; active: boolean; onClick: () => void; onTogglePin?: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Box
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      pl="12"
      pr="0"
      py="8"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      style={{
        cursor: "pointer",
        borderRadius: 8,
        background: active ? "#EFF5EB" : "transparent",
      }}
    >
      <Group gap="10" alignItems="center" style={{ minWidth: 0, flex: 1 }}>
        {contact.isVT
          ? <VAUPulseAvatar actor={contact} size={32} />
          : <CircleAvatar initials={contact.initials} bg={contact.bg} src={contact.photoUrl} size={32} status={contact.status} />
        }
        <Group gap="6" alignItems="center" style={{ minWidth: 0, flex: 1 }}>
          <Text
            fontSize="sm"
            fontWeight={contact.unread ? "500" : "400"}
            color={contact.unread ? "fg.default" : "fg.secondary"}
            style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}
          >
            {contact.name}
          </Text>
        </Group>
      </Group>
      <Group gap="4" alignItems="center" style={{ flexShrink: 0, marginLeft: 8 }}>
        {contact.unread ? (
          <Badge intent={contact.isVT ? "warning" : "success"}>{contact.unread}</Badge>
        ) : (
          <PinAction pinned={contact.pinned} hovered={hovered} onToggle={onTogglePin} />
        )}
      </Group>
    </Box>
  );
}

function ProjectRow({ group, active, onClick, onTogglePin }: { group: GroupChat; active: boolean; onClick: () => void; onTogglePin?: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Box
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      pl="12"
      pr="0"
      py="8"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      style={{
        cursor: "pointer",
        borderRadius: 8,
        background: active ? "#EFF5EB" : "transparent",
      }}
    >
      <Group gap="10" alignItems="center" style={{ minWidth: 0, flex: 1 }}>
        <ProjectGlyph initials={group.initials} bg={group.bg} size={28} />
        <Text
          fontSize="sm"
          fontWeight="500"
          color="fg.default"
          style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}
        >
          {group.name}
        </Text>
      </Group>
      <Group gap="4" alignItems="center" style={{ flexShrink: 0, marginLeft: 8 }}>
        {group.unread ? (
          <Badge intent="success">{group.unread}</Badge>
        ) : (
          <PinAction pinned={group.pinned} hovered={hovered} onToggle={onTogglePin} />
        )}
      </Group>
    </Box>
  );
}


function ChatInput({
  placeholder,
  value,
  onValueChange,
  showDisclaimer = true,
}: {
  placeholder: string;
  value: string;
  onValueChange: (v: string) => void;
  showDisclaimer?: boolean;
}) {
  return (
    <Box>
      <Textarea
        placeholder={placeholder}
        value={value}
        onValueChange={onValueChange}
        resize="auto"
        maxRows={5}
        rows={2}
        addonAfter={
          <Group p="8" alignItems="center" gap="4">
            <Tooltip content="Add"><Button appearance="subtle" size="sm" icon={<IconPlus />} aria-label="Add" /></Tooltip>
            <Tooltip content="Suggest"><Button appearance="subtle" size="sm" icon={<IconSparkles />} aria-label="Suggest" /></Tooltip>
            <Tooltip content="Attach"><Button appearance="subtle" size="sm" icon={<IconFileLines />} aria-label="Attach" /></Tooltip>
            <Tooltip content="Model"><Button appearance="subtle" size="sm" ml="auto" icon={<IconAngleDown />} iconPosition="end">Auto</Button></Tooltip>
            <Tooltip content="Send">
              <Button
                appearance={value.trim() ? "primary" : "subtle"}
                size="sm"
                icon={<IconPaperPlaneTop />}
                aria-label="Send"
                disabled={!value.trim()}
              />
            </Tooltip>
          </Group>
        }
      />
      {showDisclaimer && (
        <Text
          fontSize="xs"
          color="fg.tertiary"
          mt="6"
          style={{ textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "center", display: "block" }}
        >
          Opal can make mistakes. Double-check its responses.
        </Text>
      )}
    </Box>
  );
}

// ─── DM Chat View ─────────────────────────────────────────────────────────────
// Full 1:1 chat surface. contact.isVT drives VAU-specific affordances.

function parseTimeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function DMDayDivider({ label }: { label: string }) {
  return (
    <Box display="flex" alignItems="center" gap="12" style={{ margin: "28px 0" }}>
      <Box style={{ flex: 1, height: 1, background: "var(--ax-colors-border-default)" }} />
      <Text fontSize="xs" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>
        {label}
      </Text>
      <Box style={{ flex: 1, height: 1, background: "var(--ax-colors-border-default)" }} />
    </Box>
  );
}

function DMChatHeader({ contact }: { contact: DMContact }) {
  const isVT = contact.isVT ?? false;
  const statusLabel = contact.status === "online" ? "Active" : contact.status === "busy" ? "Busy" : "Away";
  return (
    <Box
      px="24"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      style={{ height: 68, flexShrink: 0, borderBottom: "1px solid var(--ax-colors-border-default)", background: "var(--ax-colors-bg-default)" }}
    >
      <Group gap="12" alignItems="center">
        <Box style={{ position: "relative", flexShrink: 0 }}>
          <CircleAvatar initials={contact.initials} bg={contact.bg} src={contact.photoUrl} size={36} status={isVT ? undefined : contact.status} />
          {isVT && (
            <Box style={{ position: "absolute", bottom: 1, right: 1, width: 9, height: 9, borderRadius: "50%", background: "var(--ax-colors-bg-accent)", border: "2px solid var(--ax-colors-bg-default)" }} />
          )}
        </Box>
        <Box>
          <Group gap="8" alignItems="center">
            <Text fontSize="md" fontWeight="600" color="fg.default">{contact.name}</Text>
            {isVT && (
              <Badge intent="success" variant="subtle" style={{ background: "#EFF5EB", color: "#202320" }}>
                <Group gap="2" alignItems="center" asChild>
                  <span><IconSparkles size={10} />Virtual Teammate</span>
                </Group>
              </Badge>
            )}
          </Group>
          <Text fontSize="xs" color="fg.tertiary" style={{ display: "block", marginTop: 2 }}>
            {contact.role ?? (isVT ? "Virtual Teammate" : "Team member")} · {statusLabel}
          </Text>
        </Box>
      </Group>
      <Tooltip content="More options">
        <Button appearance="subtle" size="sm" icon={<IconEllipsisStroke />} aria-label="More options" />
      </Tooltip>
    </Box>
  );
}

const YOU_BG = "#8a6abf";
const YOU_INITIALS = "AS";
const YOU_PHOTO = "/avatars/me.jpg";

// ── DMNavRow ──────────────────────────────────────────────────────────────────
// Second header row: tabs (Messages / Pins / Activity) + Shared & Search buttons.
function DMNavRow({
  contact, activeTab, onTabChange,
  sharedOpen, onSharedToggle,
  searchOpen, onSearchToggle,
  searchQuery, onSearchChange,
  sharedCount, needsReviewCount,
}: {
  contact: DMContact;
  activeTab: DMTab;
  onTabChange: (t: DMTab) => void;
  sharedOpen: boolean;
  onSharedToggle: () => void;
  searchOpen: boolean;
  onSearchToggle: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sharedCount: number;
  needsReviewCount: number;
}) {
  const isVT = contact.isVT ?? false;
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const tabs: { id: DMTab; label: React.ReactNode }[] = [
    { id: "messages", label: "Messages" },
    { id: "pins",     label: "Pins" },
    // VAU only — and only when there are pending items (per spec: "the section
    // doesn't render at all" when empty)
    ...(isVT && needsReviewCount > 0
      ? [{
          id: "needs-review" as DMTab,
          label: (
            <Box asChild display="inline-flex" alignItems="center" gap="6">
              <span>
                Needs review
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 18, height: 18, borderRadius: 9999, background: "#E2E5E0", color: "#4A524D", fontSize: 11, fontWeight: 500, padding: "0 5px", lineHeight: 1 }}>{needsReviewCount}</span>
              </span>
            </Box>
          ),
        }]
      : []),
    ...(isVT ? [{ id: "activity" as DMTab, label: "Activity" }] : []),
  ];

  return (
    <Box
      px="20"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      style={{
        height: 44,
        flexShrink: 0,
        borderBottom: "1px solid var(--ax-colors-border-default)",
        background: "var(--ax-colors-bg-default)",
      }}
    >
      {searchOpen ? (
        <Box display="flex" alignItems="center" gap="8" style={{ flex: 1, minWidth: 0 }}>
          <IconSearch size={14} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
          <input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") { onSearchToggle(); onSearchChange(""); } }}
            placeholder="Search messages…"
            style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 14, color: "var(--ax-colors-fg-default)" }}
          />
          <Button appearance="subtle" size="sm" onClick={() => { onSearchToggle(); onSearchChange(""); }}>
            Cancel
          </Button>
        </Box>
      ) : (
        <>
          {/* Left: Axiom Tabs — handles active underline, color, keyboard nav */}
          <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as DMTab)}>
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Right: Shared + Search */}
          <Group gap="4" alignItems="center">
            <Button
              appearance="subtle"
              size="sm"
              icon={<IconFolderOpen size={13} />}
              onClick={onSharedToggle}
              style={{
                color: sharedOpen ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)",
                background: sharedOpen ? "var(--ax-colors-bg-secondary)" : undefined,
              }}
            >
              {sharedCount > 0 ? `Shared · ${sharedCount}` : "Shared"}
            </Button>
            <Tooltip content="Search messages">
              <Button
                appearance="subtle"
                size="sm"
                icon={<IconSearch size={13} />}
                aria-label="Search"
                onClick={onSearchToggle}
                style={{ color: "var(--ax-colors-fg-tertiary)" }}
              />
            </Tooltip>
          </Group>
        </>
      )}
    </Box>
  );
}

// ── DMPinsView ────────────────────────────────────────────────────────────────
function DMPinsView({ contact, onJumpToMessages }: { contact: DMContact; onJumpToMessages: () => void }) {
  const pins = DM_PINS[contact.id] ?? [];

  if (pins.length === 0) {
    return (
      <Box flex="1" overflow="auto" style={{ background: "#F9FCF8", paddingBottom: 140 }}>
        <Box display="flex" flexDirection="column" alignItems="center" style={{ padding: "64px 32px 0", textAlign: "center" }}>
          <Box style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <IconThumbtack size={18} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
          </Box>
          <Text fontSize="sm" color="fg.tertiary" style={{ display: "block", maxWidth: 280, lineHeight: 1.6 }}>
            No pins yet. Pin a message by hovering over it and clicking the pin icon.
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flex="1" overflow="auto" style={{ background: "#F9FCF8", paddingBottom: 140 }}>
      <Box mx="auto" style={{ maxWidth: 720, padding: "24px 24px 0" }}>
        {pins.map((pin) => {
          const isYou = pin.sender === "you";
          const senderName = isYou ? "You" : contact.name.split(" ")[0];
          const avatarSrc = isYou ? YOU_PHOTO : contact.photoUrl;
          return (
            <Box
              key={pin.id}
              rounded="lg"
              mb="12"
              style={{ border: "1px solid var(--ax-colors-border-default)", background: "var(--ax-colors-bg-default)", overflow: "hidden" }}
            >
              <Box px="16" py="12">
                <Group gap="8" alignItems="center" mb="10">
                  {avatarSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarSrc} alt={senderName} style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover", display: "block", flexShrink: 0 }} />
                  ) : (
                    <Box style={{ width: 24, height: 24, borderRadius: "50%", background: isYou ? YOU_BG : contact.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                      {isYou ? YOU_INITIALS[0] : contact.initials[0]}
                    </Box>
                  )}
                  <Text fontSize="sm" fontWeight="600" color="fg.default">{senderName}</Text>
                  <Text fontSize="xs" color="fg.tertiary">{pin.time}</Text>
                  <Box style={{ marginLeft: "auto", flexShrink: 0 }}>
                    <Badge variant="subtle">Pinned {pin.pinnedAt}</Badge>
                  </Box>
                </Group>
                {pin.text && (
                  <Text fontSize="sm" color="fg.default" style={{ lineHeight: 1.6, display: "block" }}>{pin.text}</Text>
                )}
                {pin.artifact && (
                  <Box rounded="md" style={{ border: "1px solid var(--ax-colors-border-default)", background: "var(--ax-colors-bg-secondary)", overflow: "hidden" }}>
                    <Box px="12" py="10" display="flex" alignItems="center" gap="10">
                      <Box style={{ width: 30, height: 30, borderRadius: 6, background: "var(--ax-colors-bg-default)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <IconFileLines size={14} style={{ color: "var(--ax-colors-fg-secondary)" }} />
                      </Box>
                      <Box style={{ minWidth: 0 }}>
                        <Text fontSize="sm" fontWeight="600" color="fg.default" style={{ display: "block" }}>{pin.artifact.title}</Text>
                        <Text fontSize="xs" color="fg.tertiary" style={{ display: "block", marginTop: 2 }}>{pin.artifact.subtitle}</Text>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
              <Box px="16" py="10" display="flex" justifyContent="flex-end" style={{ borderTop: "1px solid var(--ax-colors-border-default)" }}>
                <Button appearance="subtle" size="sm" onClick={onJumpToMessages}>
                  Jump to message
                </Button>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ── DMActivityView ────────────────────────────────────────────────────────────
// VAU-only: scrollable work-feed showing artifacts drafted, tasks completed,
// AITL actions taken, and memory updates.
function vauActivityMeta(type: VAUActivityType): { icon: React.ReactNode; bg: string; color: string } {
  switch (type) {
    // Dark green for the artifact icon — the brand "fg.accent" lime is too neon
    // against the pale lime background and visually disappears.
    case "artifact": return { icon: <IconFileLines size={14} />,   bg: "var(--ax-colors-bg-accent-subtle)", color: "#2a6240" };
    case "task":     return { icon: <IconCheck size={13} />,        bg: "#EFF5EB",                           color: "#3a7a4f" };
    case "memory":   return { icon: <IconSparkles size={13} />,    bg: "#F0EEF9",                           color: "#7c6fad" };
    case "aitl":     return { icon: <IconArrowTurnUp size={13} />, bg: "var(--ax-colors-bg-secondary)",     color: "var(--ax-colors-fg-secondary)" };
  }
}

function DMActivityView({ contact }: { contact: DMContact }) {
  const days = VAU_ACTIVITY[contact.id] ?? [];
  const firstName = contact.name.split(" ")[0];

  if (days.length === 0) {
    return (
      <Box flex="1" overflow="auto" style={{ background: "#F9FCF8", paddingBottom: 140 }}>
        <Box display="flex" flexDirection="column" alignItems="center" style={{ padding: "64px 32px 0", textAlign: "center" }}>
          <Text fontSize="sm" color="fg.tertiary" style={{ display: "block", maxWidth: 300, lineHeight: 1.6 }}>
            {firstName} hasn&apos;t done any work yet. Start a conversation to get going.
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flex="1" overflow="auto" style={{ background: "#F9FCF8", paddingBottom: 140 }}>
      <Box mx="auto" style={{ maxWidth: 720 }}>
        {days.map((day) => (
          <React.Fragment key={day.label}>
            <Box px="24" py="12">
              <Text fontSize="xs" color="fg.tertiary" style={{ textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>
                {day.label}
              </Text>
            </Box>
            {day.items.map((item) => {
              const meta = vauActivityMeta(item.type);
              return (
                <Box
                  key={item.id}
                  px="24"
                  style={{ borderTop: "1px solid var(--ax-colors-border-default)", cursor: "pointer" }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onMouseEnter={(e: any) => { e.currentTarget.style.background = "var(--ax-colors-bg-secondary)"; }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onMouseLeave={(e: any) => { e.currentTarget.style.background = ""; }}
                >
                  <Box display="flex" alignItems="center" gap="12" style={{ paddingTop: 14, paddingBottom: 14 }}>
                    <Box style={{ width: 30, height: 30, borderRadius: 8, background: meta.bg, color: meta.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {meta.icon}
                    </Box>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text fontSize="sm" color="fg.default" style={{ display: "block", lineHeight: 1.4 }}>
                        {item.description}
                      </Text>
                      <Box display="flex" alignItems="center" gap="6" mt="4">
                        {item.project && (
                          <>
                            <Box style={{ width: 8, height: 8, borderRadius: 2, background: item.projectBg ?? "var(--ax-colors-bg-secondary)", flexShrink: 0 }} />
                            <Text fontSize="xs" color="fg.tertiary">{item.project}</Text>
                            <Text fontSize="xs" color="fg.tertiary">·</Text>
                          </>
                        )}
                        {item.status && (
                          <>
                            <Text fontSize="xs" color="fg.tertiary">{item.status}</Text>
                            <Text fontSize="xs" color="fg.tertiary">·</Text>
                          </>
                        )}
                        <Text fontSize="xs" color="fg.tertiary">{item.time}</Text>
                      </Box>
                    </Box>
                    {item.actionLabel && (
                      <Button appearance="subtle" size="sm" style={{ flexShrink: 0 }}>
                        {item.actionLabel}
                      </Button>
                    )}
                  </Box>
                </Box>
              );
            })}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}

// ── DMNeedsReviewView ─────────────────────────────────────────────────────────
// VAU-only: persistent list of HITL items the VAU is waiting on the user for.
// Each row collapses when the user acts on it (Review / Approve / Reply) or
// dismisses via the overflow menu.
function needsReviewMeta(type: NeedsReviewType): { icon: React.ReactNode; bg: string; color: string } {
  switch (type) {
    case "artifact": return { icon: <IconFileLines size={15} />,     bg: "var(--ax-colors-bg-accent-subtle)", color: "#2a6240" };
    case "action":   return { icon: <IconPaperPlaneTop size={13} />, bg: "#E4F0DA",                           color: "#3a7a4f" };
    case "memory":   return { icon: <IconSparkles size={13} />,      bg: "#F0EEF9",                           color: "#7c6fad" };
    case "question": return { icon: <IconMessageLines size={13} />,  bg: "var(--ax-colors-bg-secondary)",     color: "var(--ax-colors-fg-secondary)" };
  }
}

function DMNeedsReviewView({
  items,
  onAction,
  onDismiss,
}: {
  items: NeedsReviewItem[];
  onAction: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  return (
    <Box flex="1" overflow="auto" style={{ background: "#F9FCF8", paddingBottom: 140 }}>
      <Box mx="auto" style={{ maxWidth: 720, padding: "24px 24px 0" }}>
        {items.map((item) => {
          const meta = needsReviewMeta(item.type);
          return (
            <Box
              key={item.id}
              rounded="lg"
              mb="12"
              style={{ border: "1px solid var(--ax-colors-border-default)", background: "var(--ax-colors-bg-default)", overflow: "hidden" }}
            >
              <Box display="flex" alignItems="center" gap="12" style={{ padding: "14px 16px" }}>
                <Box style={{ width: 36, height: 36, borderRadius: 8, background: meta.bg, color: meta.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {meta.icon}
                </Box>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text fontSize="sm" fontWeight="600" color="fg.default" style={{ display: "block", lineHeight: 1.4 }}>
                    {item.title}
                  </Text>
                  <Text fontSize="xs" color="fg.tertiary" style={{ display: "block", marginTop: 2 }}>
                    {item.subtitle}
                  </Text>
                </Box>
                <Group gap="4" alignItems="center" style={{ flexShrink: 0 }}>
                  <Button appearance="subtle" size="sm" onClick={() => onAction(item.id)}>
                    {item.primaryActionLabel}
                  </Button>
                  <Tooltip content="Dismiss">
                    <Button
                      appearance="subtle"
                      size="sm"
                      icon={<IconEllipsisStroke />}
                      aria-label="More options"
                      onClick={() => onDismiss(item.id)}
                    />
                  </Tooltip>
                </Group>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ── DMSharedPanel ─────────────────────────────────────────────────────────────
// Slide-in overlay showing artifacts and files shared in this conversation.
function DMSharedPanel({ contact: _contact, messages, onClose }: { contact: DMContact; messages: ChatMessage[]; onClose: () => void }) {
  const artifacts = messages.filter(m => m.artifact);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onClose]);

  return (
    <>
      {/* Transparent backdrop — click outside to close */}
      <Box onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 19 }} />
      {/* Panel */}
      <Box
        display="flex"
        flexDirection="column"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 360,
          zIndex: 20,
          background: "var(--ax-colors-bg-default)",
          borderLeft: "1px solid var(--ax-colors-border-default)",
          boxShadow: "-4px 0 20px rgba(0,0,0,0.07)",
        }}
      >
        {/* Header */}
        <Box
          px="20"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          style={{ height: 56, flexShrink: 0, borderBottom: "1px solid var(--ax-colors-border-default)" }}
        >
          <Text fontSize="md" fontWeight="600" color="fg.default">Shared</Text>
          <Button appearance="subtle" size="sm" icon={<IconXmark size={14} />} aria-label="Close" onClick={onClose} />
        </Box>

        {/* Content */}
        <Box flex="1" overflow="auto" px="20" py="16">
          {artifacts.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center" style={{ paddingTop: 48, textAlign: "center" }}>
              <Text fontSize="sm" color="fg.tertiary" style={{ display: "block", lineHeight: 1.6 }}>
                Nothing has been shared in this conversation yet.
              </Text>
            </Box>
          ) : (
            <Box>
              <Text fontSize="xs" color="fg.tertiary" style={{ display: "block", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 12 }}>
                Artifacts · {artifacts.length}
              </Text>
              {artifacts.map((msg) => (
                <Box
                  key={msg.id}
                  rounded="md"
                  mb="8"
                  style={{ border: "1px solid var(--ax-colors-border-default)", overflow: "hidden" }}
                >
                  <Box px="12" py="10" display="flex" alignItems="center" gap="10">
                    <Box style={{ width: 32, height: 32, borderRadius: 6, background: "var(--ax-colors-bg-accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <IconFileLines size={15} style={{ color: "#2a6240" }} />
                    </Box>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text fontSize="sm" fontWeight="600" color="fg.default" style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {msg.artifact!.title}
                      </Text>
                      <Text fontSize="xs" color="fg.tertiary" style={{ display: "block", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {msg.artifact!.subtitle}
                      </Text>
                    </Box>
                    <Button appearance="subtle" size="sm" icon={<IconArrowUpRightFromSquare size={13} />} aria-label="Open" />
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}

function DMMessageRow({ msg, contact, isGroupStart }: { msg: ChatMessage; contact: DMContact; isGroupStart: boolean }) {
  const [hovered, setHovered] = useState(false);
  const isYou = msg.sender === "you";
  const isVT = !isYou && (contact.isVT ?? false);
  const senderName = isYou ? "You" : contact.name.split(" ")[0];

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        gap: 12,
        paddingTop: isGroupStart ? 20 : 3,
        alignItems: "flex-start",
        flexDirection: isYou ? "row-reverse" : "row",
      }}
    >
      {/* Avatar column — mirrors side based on sender */}
      <Box style={{ width: 32, flexShrink: 0, paddingTop: isYou ? 0 : 2 }}>
        {isGroupStart && (
          isYou ? (
            <img src={YOU_PHOTO} alt="You" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", display: "block" }} />
          ) : (
            <CircleAvatar initials={contact.initials} bg={contact.bg} src={contact.photoUrl} size={32} />
          )
        )}
      </Box>

      {/* Content column */}
      <Box style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: isYou ? "flex-end" : "flex-start" }}>
        {isGroupStart && (
          <Group gap="8" alignItems="center" mb="4">
            {/* For "you", reverse order so time is on the outer edge */}
            {isYou ? (
              <>
                <Text fontSize="xs" color="fg.tertiary">{msg.time}</Text>
                <Text fontSize="sm" fontWeight="600" color="fg.default">{senderName}</Text>
              </>
            ) : (
              <>
                <Text fontSize="sm" fontWeight="600" color="fg.default">{senderName}</Text>
                {isVT && (
                  <Badge intent="success" variant="subtle" style={{ background: "#EFF5EB", color: "#202320" }}>
                    <Group gap="2" alignItems="center" asChild>
                      <span><IconSparkles size={9} />Virtual Teammate</span>
                    </Group>
                  </Badge>
                )}
                <Text fontSize="xs" color="fg.tertiary">{msg.time}</Text>
              </>
            )}
          </Group>
        )}

        {msg.text && (
          isYou ? (
            <Box
              style={{
                background: "#E4F0DA",
                borderRadius: 16,
                padding: "10px 14px",
                maxWidth: "75%",
              }}
            >
              <Text fontSize="sm" color="fg.default" style={{ lineHeight: 1.6, display: "block" }}>
                {msg.text}
              </Text>
            </Box>
          ) : (
            <Text fontSize="sm" color="fg.default" style={{ lineHeight: 1.6, display: "block", maxWidth: "75%" }}>
              {msg.text}
            </Text>
          )
        )}

        {msg.artifact && (
          <Box mt="8" rounded="lg" style={{ border: "1px solid var(--ax-colors-border-default)", background: "var(--ax-colors-bg-default)", overflow: "hidden", maxWidth: 340 }}>
            <Box px="16" py="12">
              <Group gap="12" alignItems="center">
                <Box style={{ width: 36, height: 36, borderRadius: 8, background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <IconFileLines size={16} style={{ color: "var(--ax-colors-fg-secondary)" }} />
                </Box>
                <Box style={{ minWidth: 0 }}>
                  <Text fontSize="sm" fontWeight="600" color="fg.default" style={{ display: "block", lineHeight: 1.4 }}>{msg.artifact.title}</Text>
                  <Text fontSize="xs" color="fg.tertiary" style={{ display: "block", marginTop: 2 }}>{msg.artifact.subtitle}</Text>
                </Box>
              </Group>
            </Box>
            <Box px="16" py="10" style={{ borderTop: "1px solid var(--ax-colors-border-default)" }}>
              <Button appearance="subtle" size="sm" icon={<IconArrowUpRightFromSquare size={13} />} style={{ width: "100%", justifyContent: "center" }}>Open to review</Button>
            </Box>
          </Box>
        )}

        {hovered && isVT && (
          <Group gap="2" alignItems="center" mt="4">
            <Tooltip content="Regenerate"><Button appearance="subtle" size="sm" icon={<IconArrowRotateLeft />} aria-label="Regenerate" /></Tooltip>
            <Tooltip content="Copy"><Button appearance="subtle" size="sm" icon={<IconCopy />} aria-label="Copy" /></Tooltip>
            <Tooltip content="Good response"><Button appearance="subtle" size="sm" icon={<IconThumbsUp />} aria-label="Good response" /></Tooltip>
            <Tooltip content="Bad response"><Button appearance="subtle" size="sm" icon={<IconThumbsDown />} aria-label="Bad response" /></Tooltip>
          </Group>
        )}
      </Box>
    </Box>
  );
}

function DMEmptyState({ contact }: { contact: DMContact }) {
  const isVT = contact.isVT ?? false;
  const STARTERS = ["What's on my calendar today?", "Draft an announcement", "Summarise my unread emails", "Help me write a brief"];
  if (!isVT) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" style={{ paddingTop: 64, textAlign: "center" }}>
        <CircleAvatar initials={contact.initials} bg={contact.bg} src={contact.photoUrl} size={48} status={contact.status} />
        <Text fontSize="md" color="fg.tertiary" style={{ display: "block", marginTop: 16 }}>
          Start a conversation with {contact.name}.
        </Text>
      </Box>
    );
  }
  return (
    <Box display="flex" flexDirection="column" alignItems="center" style={{ paddingTop: 64, textAlign: "center" }}>
      <CircleAvatar initials={contact.initials} bg={contact.bg} src={contact.photoUrl} size={56} />
      <Text fontSize="md" fontWeight="600" color="fg.default" style={{ display: "block", marginTop: 16, marginBottom: 6 }}>
        {contact.name}
      </Text>
      <Text fontSize="sm" color="fg.secondary" style={{ display: "block", maxWidth: 360, lineHeight: 1.6, marginBottom: 24 }}>
        {contact.role} — ask them to draft, summarise, or research anything in your workspace.
      </Text>
      <Box display="flex" style={{ flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {STARTERS.map((p) => (
          <Button key={p} appearance="subtle" size="sm" style={{ border: "1px solid var(--ax-colors-border-default)" }}>{p}</Button>
        ))}
      </Box>
    </Box>
  );
}

function DMComposerBar({ contact, value, onChange }: { contact: DMContact; value: string; onChange: (v: string) => void }) {
  const isVT = contact.isVT ?? false;
  const firstName = contact.name.split(" ")[0];
  return (
    <Box>
      <Textarea
        placeholder={isVT ? `Message ${firstName} or type / for actions…` : `Message ${firstName}…`}
        value={value}
        onValueChange={onChange}
        resize="auto"
        maxRows={5}
        rows={1}
        addonAfter={
          <Group p="8" alignItems="center" gap="4">
            <Tooltip content="Attach file">
              <Button appearance="subtle" size="sm" icon={<IconLink />} aria-label="Attach file" />
            </Tooltip>
            {isVT && (
              <Tooltip content="Slash commands">
                <Button appearance="subtle" size="sm" aria-label="Actions" style={{ fontWeight: 600, fontFamily: "monospace", fontSize: 15 }}>/</Button>
              </Tooltip>
            )}
            <Tooltip content="Send">
              <Button
                appearance={value.trim() ? "primary" : "subtle"}
                size="sm"
                icon={<IconPaperPlaneTop />}
                aria-label="Send"
                disabled={!value.trim()}
                ml="auto"
              />
            </Tooltip>
          </Group>
        }
        style={{ borderRadius: 12, border: "1px solid var(--ax-colors-border-default)", boxShadow: "0 -2px 12px rgba(0,0,0,0.04)" }}
      />
      {isVT && (
        <Text fontSize="xs" color="fg.tertiary" mt="6" style={{ textAlign: "center", display: "block" }}>
          {firstName} can draft, summarise, and research. Type / for actions.
        </Text>
      )}
    </Box>
  );
}

function DMChatView({ contact }: { contact: DMContact }) {
  const [draft, setDraft] = useState("");
  const [activeTab, setActiveTab] = useState<DMTab>("messages");
  const [sharedOpen, setSharedOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [clearedReviewIds, setClearedReviewIds] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const messages = DM_THREADS[contact.id] ?? [];
  const isVT = contact.isVT ?? false;

  // Reset state when switching contacts
  useEffect(() => {
    setActiveTab("messages");
    setSharedOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
    setClearedReviewIds(new Set());
  }, [contact.id]);

  // Needs-review items still pending for this VAU
  const visibleReview = (NEEDS_REVIEW[contact.id] ?? []).filter(item => !clearedReviewIds.has(item.id));
  const needsReviewCount = isVT ? visibleReview.length : 0;

  // If the user clears the last item while on the tab, fall back to Messages
  useEffect(() => {
    if (activeTab === "needs-review" && needsReviewCount === 0) {
      setActiveTab("messages");
    }
  }, [activeTab, needsReviewCount]);

  // Scroll to bottom when entering messages tab
  useEffect(() => {
    if (activeTab === "messages") {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [contact.id, activeTab]);

  const grouped = messages.map((msg, i) => {
    const prev = messages[i - 1];
    const sameSender = prev && prev.sender === msg.sender;
    const withinWindow = prev && parseTimeToMinutes(msg.time) - parseTimeToMinutes(prev.time) <= 5;
    return { msg, isGroupStart: !sameSender || !withinWindow };
  });

  const sharedCount = messages.filter(m => m.artifact).length;

  return (
    <Box display="flex" flex="1" overflow="hidden" style={{ position: "relative", background: "#F9FCF8", minWidth: 0 }}>
      <Box display="flex" flexDirection="column" flex="1" overflow="hidden" style={{ position: "relative", minWidth: 0 }}>
        <DMChatHeader contact={contact} />
        <DMNavRow
          contact={contact}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sharedOpen={sharedOpen}
          onSharedToggle={() => setSharedOpen(o => !o)}
          searchOpen={searchOpen}
          onSearchToggle={() => setSearchOpen(o => !o)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sharedCount={sharedCount}
          needsReviewCount={needsReviewCount}
        />

        {/* Messages tab */}
        {activeTab === "messages" && (
          <Box flex="1" overflow="auto" style={{ paddingBottom: 140, background: "#F9FCF8" }}>
            <Box mx="auto" style={{ maxWidth: 720, padding: "32px 24px 0" }}>
              {messages.length === 0 ? (
                <DMEmptyState contact={contact} />
              ) : (
                <>
                  <DMDayDivider label="Today" />
                  {grouped.map(({ msg, isGroupStart }) => (
                    <DMMessageRow key={msg.id} msg={msg} contact={contact} isGroupStart={isGroupStart} />
                  ))}
                </>
              )}
              <div ref={bottomRef} />
            </Box>
          </Box>
        )}

        {/* Pins tab */}
        {activeTab === "pins" && (
          <DMPinsView contact={contact} onJumpToMessages={() => setActiveTab("messages")} />
        )}

        {/* Needs-review tab — VAU chats only, only when items exist */}
        {activeTab === "needs-review" && isVT && needsReviewCount > 0 && (
          <DMNeedsReviewView
            items={visibleReview}
            onAction={(id) => setClearedReviewIds(prev => new Set(prev).add(id))}
            onDismiss={(id) => setClearedReviewIds(prev => new Set(prev).add(id))}
          />
        )}

        {/* Activity tab — VAU chats only */}
        {activeTab === "activity" && isVT && (
          <DMActivityView contact={contact} />
        )}

        {/* Composer: absolutely pinned 20px from bottom */}
        <Box style={{ position: "absolute", bottom: 20, left: 0, right: 0, pointerEvents: "none" }}>
          <Box mx="auto" style={{ maxWidth: 720, padding: "0 24px", pointerEvents: "auto" }}>
            <DMComposerBar contact={contact} value={draft} onChange={setDraft} />
          </Box>
        </Box>
      </Box>

      {/* Shared panel overlay */}
      {sharedOpen && (
        <DMSharedPanel
          contact={contact}
          messages={messages}
          onClose={() => setSharedOpen(false)}
        />
      )}
    </Box>
  );
}

// Legacy panel kept for reference but no longer rendered:
function DMChatPanel({ contact, fullWidth = false }: { contact: DMContact; fullWidth?: boolean }) {
  const messages = DM_THREADS[contact.id] ?? [];
  const [draft, setDraft] = useState("");
  const [tab, setTab] = useState("messages");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [contact.id]);

  const firstName = contact.name.split(" ")[0];

  return (
    <Box
      display="flex"
      flexDirection="column"
      overflow="hidden"
      flex={fullWidth ? "1" : undefined}
      style={{ ...(fullWidth ? { minWidth: 0 } : { width: 320, flexShrink: 0, borderLeft: "1px solid var(--ax-colors-border-default)" }) }}
    >
      <Tabs value={tab} onValueChange={setTab}>
        {/* Top bar: tabs left, actions right */}
        <Box display="flex" alignItems="center" justifyContent="space-between" px="24" borderB="1" style={{ flexShrink: 0 }}>
          <TabsList>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="pins">Pins</TabsTrigger>
          </TabsList>
          <Group gap="4" alignItems="center">
            <Button appearance="subtle" size="sm" icon={<IconImage />}>Artifacts</Button>
            <Button appearance="subtle" size="sm" icon={<IconFolder />}>Files</Button>
            <Button appearance="subtle" size="sm" icon={<IconSearch />}>Search</Button>
            <Button appearance="subtle" size="sm" icon={<IconEllipsisStrokeVertical />} aria-label="More options" />
          </Group>
        </Box>

        <TabsContent value="messages" asChild>
          <Box flex="1" overflow="auto" py="24" display="flex" flexDirection="column">
            <Box mx="auto" w="full" px="24" display="flex" flexDirection="column" gap="10" style={{ maxWidth: fullWidth ? 720 : "100%" }}>
              {messages.map((msg) => {
                const isYou = msg.sender === "you";
                return (
                  <Box key={msg.id} display="flex" gap="8" style={{ flexDirection: isYou ? "row-reverse" : "row", alignItems: "flex-end" }}>
                    {!isYou && <CircleAvatar initials={contact.initials} bg={contact.bg} src={contact.photoUrl} size={24} />}
                    <Box style={{ maxWidth: "78%", minWidth: 0 }}>
                      {!isYou && (
                        <Text fontSize="xs" color="fg.tertiary" style={{ paddingLeft: 4, marginBottom: 3, display: "block" }}>{msg.time}</Text>
                      )}
                      <Box
                        px="12"
                        py="8"
                        style={{
                          background: isYou ? "var(--ax-colors-bg-accent)" : "var(--ax-colors-bg-secondary)",
                          borderRadius: isYou ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          display: "inline-block",
                          maxWidth: "100%",
                        }}
                      >
                        <Text fontSize="sm" style={{ color: isYou ? "var(--ax-colors-fg-accent-on-accent)" : "var(--ax-colors-fg-default)" }}>{msg.text}</Text>
                      </Box>
                      {isYou && (
                        <Text fontSize="xs" color="fg.tertiary" style={{ textAlign: "right", paddingRight: 4, marginTop: 3, display: "block" }}>{msg.time}</Text>
                      )}
                    </Box>
                  </Box>
                );
              })}
              <div ref={bottomRef} />
            </Box>
          </Box>
        </TabsContent>

        <TabsContent value="pins" asChild>
          <Box flex="1" overflow="auto" display="flex" alignItems="center" justifyContent="center" px="24" py="32">
            <Box display="flex" flexDirection="column" alignItems="center" gap="8" style={{ maxWidth: 360, textAlign: "center" }}>
              <IconThumbtack size={28} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
              <Text fontSize="md" fontWeight="500" color="fg.default">No pinned messages yet</Text>
              <Text fontSize="sm" color="fg.secondary">Pin important messages in this conversation to keep them within reach.</Text>
            </Box>
          </Box>
        </TabsContent>
      </Tabs>

      {/* Input area */}
      <Box borderT="1" p="16" style={{ flexShrink: 0 }}>
        <Box mx="auto" w="full" style={{ maxWidth: fullWidth ? 720 : "100%" }}>
          <ChatInput
            placeholder={`Message ${firstName}…`}
            value={draft}
            onValueChange={setDraft}
          />
        </Box>
      </Box>
    </Box>
  );
}

// ChatActionToolbar — inline row of subtle actions below an agent message.
// Mirrors the reference: Edit in Canvas / regenerate / copy / thumbs.
function ChatActionToolbar() {
  return (
    <Group gap="2" alignItems="center" mt="6">
      <Tooltip content="Regenerate"><Button appearance="subtle" size="sm" icon={<IconArrowRotateLeft />} aria-label="Regenerate" /></Tooltip>
      <Tooltip content="Copy"><Button appearance="subtle" size="sm" icon={<IconCopy />} aria-label="Copy" /></Tooltip>
      <Tooltip content="Good response"><Button appearance="subtle" size="sm" icon={<IconThumbsUp />} aria-label="Good response" /></Tooltip>
      <Tooltip content="Bad response"><Button appearance="subtle" size="sm" icon={<IconThumbsDown />} aria-label="Bad response" /></Tooltip>
    </Group>
  );
}

function artifactRefIcon(type: ArtifactRefType, size = 16) {
  switch (type) {
    case "code":     return <IconCode size={size} />;
    case "audience": return <IconBullseyePointer size={size} />;
    case "image":    return <IconImage size={size} />;
    case "doc":
    default:         return <IconFileLines size={size} />;
  }
}

// ArtifactRefCard — compact lime-tinted inline reference to an artifact.
// Matches the reference card style (icon square + title + subtitle + open).
function ArtifactRefCard({
  title,
  subtitle,
  type,
}: {
  title: string;
  subtitle: string;
  type: ArtifactRefType;
}) {
  return (
    <Box
      rounded="md"
      px="12"
      py="10"
      display="flex"
      alignItems="center"
      gap="12"
      style={{
        background: "var(--ax-colors-bg-accent-subtle)",
        cursor: "pointer",
      }}
    >
      <Box
        style={{
          width: 36,
          height: 36,
          borderRadius: 6,
          background: "var(--ax-colors-bg-secondary)",
          color: "var(--ax-colors-fg-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {artifactRefIcon(type, 18)}
      </Box>
      <Box style={{ minWidth: 0, flex: 1 }}>
        <Text fontSize="sm" fontWeight="600" color="fg.default" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
          {title}
        </Text>
        <Text fontSize="xs" color="fg.secondary" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
          {subtitle}
        </Text>
      </Box>
      <IconArrowUpRightFromSquare size={16} style={{ color: "var(--ax-colors-fg-secondary)", flexShrink: 0 }} />
    </Box>
  );
}

// ArtifactRefActions — toolbar that appears under an artifact ref card.
// Same shape as ChatActionToolbar but with download swapped in.
function ArtifactRefActions() {
  return (
    <Group gap="2" alignItems="center" mt="6">
      <Tooltip content="Regenerate"><Button appearance="subtle" size="sm" icon={<IconArrowRotateLeft />} aria-label="Regenerate" /></Tooltip>
      <Tooltip content="Copy"><Button appearance="subtle" size="sm" icon={<IconCopy />} aria-label="Copy" /></Tooltip>
      <Tooltip content="Download"><Button appearance="subtle" size="sm" icon={<IconDownload />} aria-label="Download" /></Tooltip>
      <Tooltip content="Good response"><Button appearance="subtle" size="sm" icon={<IconThumbsUp />} aria-label="Good response" /></Tooltip>
      <Tooltip content="Bad response"><Button appearance="subtle" size="sm" icon={<IconThumbsDown />} aria-label="Bad response" /></Tooltip>
    </Group>
  );
}

// ApprovalCard — substantial in-chat card for HITL / AITL approvals.
// Reference: header avatar + agent label, title, subtitle, separator,
// gray inset (approval prompt), footer with Ask Changes link + Approve button.
function ApprovalCard({ msg }: { msg: ApprovalGroupMessage }) {
  return (
    <Box
      rounded="lg"
      style={{ border: "1px solid var(--ax-colors-border-default)", background: "var(--ax-colors-bg-default)", overflow: "hidden" }}
    >
      <Box px="16" py="12">
        <Text fontSize="md" fontWeight="600" color="fg.default" style={{ display: "block" }}>{msg.artifactTitle}</Text>
        <Text fontSize="sm" color="fg.secondary" mt="2" style={{ display: "block" }}>{msg.artifactSubtitle}</Text>
      </Box>
      <Separator />
      <Box px="16" py="12">
        <Box px="12" py="10" rounded="md" style={{ background: "var(--ax-colors-bg-secondary)" }}>
          <Text fontSize="sm" fontWeight="600" color="fg.default" mb="4" style={{ display: "block" }}>{msg.approvalTitle}</Text>
          <Text fontSize="sm" color="fg.secondary">{msg.approvalBody}</Text>
        </Box>
        <Group gap="8" alignItems="center" justifyContent="end" mt="12">
          <Button appearance="subtle" size="sm">Request Changes</Button>
          <Button appearance="primary" size="sm" icon={<IconCheck />}>Approve</Button>
        </Group>
      </Box>
    </Box>
  );
}

function GroupChatPanel({ group, width = 380, expanded, onCollapse, onExpandWorkspace }: { group: GroupChat; width?: number; expanded?: boolean; onCollapse?: () => void; onExpandWorkspace?: () => void }) {
  const messages = GROUP_THREADS[group.id] ?? [];
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [group.id]);

  return (
    <Box display="flex" flexDirection="column" overflow="hidden" style={{ width: expanded ? undefined : width, flex: expanded ? 1 : undefined, flexShrink: 0, background: "#F9FCF8" }}>
      {/* Header */}
      <Box px="20" py="12" display="flex" alignItems="center" justifyContent="space-between" style={{ borderBottom: "1px solid var(--ax-colors-border-default)", flexShrink: 0 }}>
        <Group gap="8" alignItems="center">
          {onExpandWorkspace && (
            <Tooltip content="Show workspace" delayDuration={300}>
              <Button
                appearance="subtle"
                size="sm"
                icon={<IconChevronRight />}
                aria-label="Show workspace"
                onClick={onExpandWorkspace}
                style={{ flexShrink: 0 }}
              />
            </Tooltip>
          )}
          <Box>
            <Text fontSize="md" fontWeight="500" color="fg.default">{group.name}</Text>
            {group.members ? (
              <Tooltip
                delayDuration={200}
                content={
                  <Box display="flex" flexDirection="column" gap="4" py="2">
                    {group.members.map((m) => (
                      <Text key={m} fontSize="xs" style={{ color: "#fff" }}>{m}</Text>
                    ))}
                  </Box>
                }
              >
                <Text fontSize="xs" color="fg.tertiary" style={{ cursor: "default" }}>{group.subtitle}</Text>
              </Tooltip>
            ) : (
              <Text fontSize="xs" color="fg.tertiary">{group.subtitle}</Text>
            )}
          </Box>
        </Group>
        <Group gap="4" alignItems="center">
          <Button appearance="subtle" size="sm" icon={<IconUserPlus />} aria-label="Add member" />
          {onCollapse && !expanded && (
            <Tooltip content="Collapse chat" delayDuration={300}>
              <Button appearance="subtle" size="sm" icon={<IconChevronRight />} aria-label="Collapse chat" onClick={onCollapse} />
            </Tooltip>
          )}
        </Group>
      </Box>

      {/* Messages */}
      <Box className="opal-chat-scroll" flex="1" overflow="auto" px="20" py="20" display="flex" flexDirection="column" gap="20">
        {messages.map((msg) => {
          const isYou = msg.senderId === "you";
          const kind = msg.kind ?? "text";
          // Photo lookup: humans get pravatar URLs, VTs get their illustration.
          // "you" is resolved separately; anyone unknown falls back to the colored circle.
          const senderPhoto = isYou
            ? YOU.photoUrl
            : DM_CONTACTS.find((c) => c.id === msg.senderId)?.photoUrl;
          return (
            <Box key={msg.id} display="flex" gap="10">
              {senderPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={senderPhoto}
                  alt={msg.initials}
                  width={28}
                  height={28}
                  style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0, marginTop: 2, display: "block" }}
                />
              ) : (
                <Box style={{ width: 28, height: 28, borderRadius: "50%", background: msg.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: msg.isVT ? 11 : 10, fontWeight: 700, color: "#fff", flexShrink: 0, marginTop: 2, boxShadow: msg.isVT ? `0 0 0 2px ${msg.bg}44` : undefined }}>
                  {msg.initials}
                </Box>
              )}
              <Box style={{ minWidth: 0, flex: 1 }}>
                <Group gap="8" alignItems="center" mb="10">
                  <Text fontSize="sm" fontWeight="500" color={isYou ? "fg.accent.strong" : "fg.default"}>{msg.senderName}</Text>
                  {msg.isVT && (
                    <Badge intent="success" variant="subtle" style={{ background: "#EFF5EB", color: "#202320" }}>
                      <Group gap="2" alignItems="center" asChild>
                        <span><IconSparkles size={10} />Virtual Teammate</span>
                      </Group>
                    </Badge>
                  )}
                  <Text fontSize="xs" color="fg.tertiary">{msg.time}</Text>
                </Group>

                {kind === "text" && (
                  <>
                    <Text fontSize="sm" color="fg.default">{(msg as TextGroupMessage).text}</Text>
                    {(msg as TextGroupMessage).showActions && msg.isVT && <ChatActionToolbar />}
                  </>
                )}

                {kind === "artifact" && (
                  <>
                    <ArtifactRefCard
                      title={(msg as ArtifactGroupMessage).artifactTitle}
                      subtitle={(msg as ArtifactGroupMessage).artifactSubtitle}
                      type={(msg as ArtifactGroupMessage).artifactType}
                    />
                    {msg.isVT && <ArtifactRefActions />}
                  </>
                )}

                {kind === "approval" && <ApprovalCard msg={msg as ApprovalGroupMessage} />}
              </Box>
            </Box>
          );
        })}
        <div ref={bottomRef} />
      </Box>

      {/* Input */}
      <Box borderT="1" p="16" style={{ flexShrink: 0 }}>
        <ChatInput
          placeholder={`Message ${group.name}…`}
          value={draft}
          onValueChange={setDraft}
        />
      </Box>
    </Box>
  );
}

// ProjectGlyph — small 2–3 char identifier used wherever a project name
// appears in a compact form (left rail, future cross-project Needs-you
// entries, search results). NOT used in the project header itself.
function ProjectGlyph({ initials: _initials, bg: _bg, size = 28 }: { initials: string; bg: string; size?: number }) {
  const iconSize = Math.max(12, Math.round(size * 0.54));
  return (
    <Box
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        background: "#D2DEC2",
        color: "#202320",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <IconFolderOpen size={iconSize} />
    </Box>
  );
}

// VAUPulseAvatar — small actor avatar with a pulsing dot in the bottom-right.
// Pulse is animated via the global `pulse` @keyframes (defined in globals.css);
// the avatar itself does NOT animate.
//
// FLAGGED: Axiom V3 has no dedicated VAU-activity color token. Using
// `fg.information` (blue family) as the closest semantic match — propose
// adding `color.vau` / `color.agent` to the design system.
function VAUPulseAvatar({ actor, size = 28 }: { actor: ActivityActor; size?: number }) {
  const dot = Math.max(8, Math.round(size * 0.32));
  return (
    <Box style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <CircleAvatar initials={actor.initials} bg={actor.bg} src={actor.photoUrl} size={size} />
      <Box
        style={{
          position: "absolute",
          right: -1,
          bottom: -1,
          width: dot,
          height: dot,
          borderRadius: "50%",
          background: "var(--ax-colors-fg-information)",
          border: "2px solid var(--ax-colors-bg-secondary)",
          animation: "pulse 1.4s ease-in-out infinite",
        }}
      />
    </Box>
  );
}

function ArtifactTypeIcon({ type }: { type: ArtifactType }) {
  const map: Record<ArtifactType, React.ReactNode> = {
    copy: <IconFileLines size={14} />,
    audience: <IconBullseyePointer size={14} />,
    brief: <IconFileLines size={14} />,
    image: <IconImage size={14} />,
  };
  return <Box style={{ color: "var(--ax-colors-fg-secondary)", display: "flex", flexShrink: 0 }}>{map[type]}</Box>;
}

function scrollToArtifact(artifactId?: string) {
  if (!artifactId) return;
  const el = document.getElementById(`artifact-${artifactId}`);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// WorkInMotionStrip — ambient surface between the project header and the
// Artifacts section. Project-scoped here, but the underlying item shapes
// (WorkingNowItem / ApprovalItem / RecentItem) carry projectId so a future
// cross-project surface (the left rail's "Needs you") can reuse them.
function WorkInMotionStrip({ projectId }: { projectId: string }) {
  const MAX = 3;

  const workingNow = WORKING_NOW.filter((i) => i.projectId === projectId);
  const approvals = APPROVALS.filter((i) => i.projectId === projectId);
  const recent = RECENT.filter((i) => i.projectId === projectId);

  if (workingNow.length + approvals.length + recent.length === 0) return null;

  const visibleWorking = workingNow.slice(0, MAX);
  const visibleApprovals = approvals.slice(0, MAX);
  const visibleRecent = recent.slice(0, MAX);

  return (
    <Box
      mx="24"
      mt="16"
      px="16"
      py="12"
      rounded="md"
      style={{ background: "var(--ax-colors-bg-secondary)", flexShrink: 0 }}
    >
      <Group flexDirection="column" gap="10" alignItems="stretch">
        {visibleWorking.length > 0 && (
          <Box>
            <Text
              fontSize="xs"
              fontWeight="500"
              color="fg.tertiary"
              mb="6"
              style={{ textTransform: "uppercase", letterSpacing: "0.07em", display: "block" }}
            >
              Working Now
            </Text>
            <Group flexDirection="column" gap="6" alignItems="stretch">
              {visibleWorking.map((item) => (
                <Group key={item.id} gap="8" alignItems="center">
                  {/* TODO (Session 5): open VAU detail slide-in panel on actor click */}
                  <Box
                    onClick={() => scrollToArtifact(item.artifactId)}
                    style={{ cursor: item.artifactId ? "pointer" : "default", display: "flex" }}
                    aria-label={`Open ${item.actor.name}`}
                  >
                    <VAUPulseAvatar actor={item.actor} size={24} />
                  </Box>
                  <Text fontSize="sm" fontWeight="500" color="fg.default">{item.actor.name}</Text>
                  <Text fontSize="sm" color="fg.tertiary">·</Text>
                  <Text
                    fontSize="sm"
                    color="fg.secondary"
                    onClick={() => scrollToArtifact(item.artifactId)}
                    style={{ cursor: item.artifactId ? "pointer" : "default", textDecoration: item.artifactId ? "none" : undefined }}
                  >
                    {item.taskDescription}
                  </Text>
                  {item.eta && (
                    <>
                      <Text fontSize="sm" color="fg.tertiary">·</Text>
                      <Text fontSize="sm" color="fg.tertiary">{item.eta}</Text>
                    </>
                  )}
                </Group>
              ))}
              {workingNow.length > MAX && (
                <Button appearance="subtle" size="sm" style={{ alignSelf: "flex-start" }}>
                  +{workingNow.length - MAX} more
                </Button>
              )}
            </Group>
          </Box>
        )}

        {visibleApprovals.length > 0 && (
          <Box>
            <Text
              fontSize="xs"
              fontWeight="500"
              color="fg.tertiary"
              mb="6"
              style={{ textTransform: "uppercase", letterSpacing: "0.07em", display: "block" }}
            >
              Needs Approval
            </Text>
            <Group flexDirection="column" gap="6" alignItems="stretch">
              {visibleApprovals.map((item) => (
                <Group key={item.id} gap="8" alignItems="center">
                  <ArtifactTypeIcon type={item.artifactType} />
                  <Text
                    fontSize="sm"
                    fontWeight="500"
                    color="fg.default"
                    onClick={() => scrollToArtifact(item.artifactId)}
                    style={{ cursor: "pointer" }}
                  >
                    {item.artifactName}
                  </Text>
                  <Text fontSize="sm" color="fg.tertiary">·</Text>
                  <Text fontSize="sm" color="fg.secondary">{item.status}</Text>
                  <Text fontSize="sm" color="fg.tertiary" style={{ marginLeft: 4 }}>{item.context}</Text>
                  <Box style={{ marginLeft: "auto", flexShrink: 0 }}>
                    <Button appearance="default" size="sm">{item.actionLabel}</Button>
                  </Box>
                </Group>
              ))}
              {approvals.length > MAX && (
                <Button appearance="subtle" size="sm" style={{ alignSelf: "flex-start" }}>
                  +{approvals.length - MAX} more
                </Button>
              )}
            </Group>
          </Box>
        )}

        {visibleRecent.length > 0 && (
          <Box>
            <Text
              fontSize="xs"
              fontWeight="500"
              color="fg.tertiary"
              mb="6"
              style={{ textTransform: "uppercase", letterSpacing: "0.07em", display: "block" }}
            >
              Recent
            </Text>
            <Group flexDirection="column" gap="6" alignItems="stretch">
              {visibleRecent.map((item) => (
                <Group key={item.id} gap="8" alignItems="center">
                  <CircleAvatar initials={item.actor.initials} bg={item.actor.bg} src={item.actor.photoUrl} size={20} />
                  <Text fontSize="sm" color="fg.secondary" fontWeight="500">{item.actor.name}</Text>
                  <Text
                    fontSize="sm"
                    color="fg.tertiary"
                    onClick={() => scrollToArtifact(item.artifactId)}
                    style={{ cursor: item.artifactId ? "pointer" : "default" }}
                  >
                    {item.description}
                  </Text>
                  <Text fontSize="sm" color="fg.tertiary">·</Text>
                  <Text fontSize="sm" color="fg.tertiary">{item.time}</Text>
                </Group>
              ))}
              {recent.length > MAX && (
                <Button appearance="subtle" size="sm" style={{ alignSelf: "flex-start" }}>
                  +{recent.length - MAX} more
                </Button>
              )}
            </Group>
          </Box>
        )}
      </Group>
    </Box>
  );
}

// ─── Pinned-to-workspace artifact cards ──────────────────────────────────────

interface PinnedArtifactBase {
  id: string;
  projectId: string;
  title: string;
  meta: string;
  isPrivate?: boolean;
  contributors?: { initials: string; bg: string; src?: string }[];
  tags?: string[];
}

interface ImageArtifact extends PinnedArtifactBase {
  kind: "image";
  imageUrl: string;
  objectPosition?: string;
  imageHeight?: number;
}

interface DataArtifact extends PinnedArtifactBase {
  kind: "data";
  kpis: { value: string; label: string; subtle?: boolean }[];
  rows: { name: string; cells: { value: string; intent?: "success" | "warning" | "neutral" }[] }[];
  columns: string[];
}

type PinnedArtifact = ImageArtifact | DataArtifact;

const PINNED_ARTIFACTS: PinnedArtifact[] = [
  {
    id: "p1", projectId: "q3", kind: "image",
    title: "Glow Drop · Foundation Campaign",
    meta: "Viewed 1 hour ago",
    imageUrl: "/genz.jpg",
    contributors: [
      { initials: "S", bg: "#7c6fad", src: "https://i.pravatar.cc/96?img=47" }, // Sofia
      { initials: "F", bg: "#3ecfb2", src: "/avatars/vau-frank.png?v=2" },           // Frank
    ],
    tags: ["BRAND", "A/B"],
  },
  {
    id: "p2", projectId: "q3", kind: "image",
    title: "Color Stories · Beauty Campaign",
    meta: "Shared 3 hours ago",
    imageUrl: "/products.jpg",
    contributors: [
      { initials: "R", bg: "#5b7fa6", src: "https://i.pravatar.cc/96?img=52" }, // Raj
      { initials: "H", bg: "#9b6fd4", src: "/avatars/vau-henry.png?v=2" },           // Henry
    ],
    tags: ["CAMPAIGN", "LIPSTICK"],
  },
  // ── Peticure Campaign ──
  {
    id: "p3", projectId: "q4", kind: "image",
    title: "Peticure · Brand Identity System",
    meta: "Updated 45 minutes ago",
    imageUrl: "/A.jpg",
    objectPosition: "top",
    imageHeight: 380,
    contributors: [
      { initials: "DV", bg: "#6a8abf", src: "https://i.pravatar.cc/96?img=12" }, // Daniel
      { initials: "F",  bg: "#3ecfb2", src: "/avatars/vau-frank.png?v=2" },
    ],
    tags: ["BRAND", "IDENTITY"],
  },
  {
    id: "p4", projectId: "q4", kind: "image",
    title: "Peticure · Product Launch Video Brief",
    meta: "Shared 2 hours ago",
    imageUrl: "/yo.jpg",
    objectPosition: "top",
    imageHeight: 380,
    contributors: [
      { initials: "YT", bg: "#8a6abf", src: "https://i.pravatar.cc/96?img=44" }, // Yuki
      { initials: "K",  bg: "#4a9e7a", src: "/avatars/vau-kerby.png?v=2" },
    ],
    tags: ["VIDEO", "LAUNCH"],
  },
];

function KpiCell({ value, label, subtle }: { value: string; label: string; subtle?: boolean }) {
  return (
    <Box
      flex="1"
      px="10"
      py="8"
      rounded="md"
      style={{ background: "var(--ax-colors-bg-default)", border: "1px solid var(--ax-colors-border-default)", minWidth: 0 }}
    >
      <Text
        fontSize={subtle ? "xs" : "md"}
        fontWeight={subtle ? "500" : "600"}
        color={subtle ? "fg.tertiary" : "fg.default"}
        style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
      >
        {value}
      </Text>
      {label && (
        <Text fontSize="xs" color="fg.tertiary" style={{ display: "block" }}>{label}</Text>
      )}
    </Box>
  );
}

function PinnedArtifactCard({ artifact, onOpen }: { artifact: PinnedArtifact; onOpen?: () => void }) {
  const [pinnedLocally, setPinnedLocally] = useState(false);
  return (
    <Box
      className="pinned-card"
      rounded="lg"
      onClick={onOpen}
      style={{
        flex: "1 1 0",
        minWidth: 240,
        height: 220,
        position: "relative",
        background: "var(--ax-colors-bg-default)",
        border: "1px solid var(--ax-colors-border-default)",
        overflow: "hidden",
        cursor: onOpen ? "pointer" : "default",
      }}
    >
      {/* Hero — fixed-height image at the top. The footer below is absolutely
          positioned and grows upward over this image on hover. */}
      <Box style={{ position: "relative" }}>
        {/* Top-right actions: pin + overflow — both revealed on hover; pin stays if pinned */}
        <Box
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 1,
            display: "flex",
            gap: 4,
            alignItems: "center",
          }}
        >
          {/* Pin button */}
          <Box
            className={pinnedLocally ? undefined : "pinned-pin-inactive"}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: "rgba(255,255,255,0.92)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
              cursor: "pointer",
            }}
            onClick={(e) => { e.stopPropagation(); setPinnedLocally((p) => !p); }}
          >
            {pinnedLocally
              ? <IconThumbtackSolid size={14} style={{ color: "#202320" }} />
              : <IconThumbtack size={14} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
            }
          </Box>
          {/* Overflow button */}
          <Box
            className="pinned-actions"
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: "rgba(255,255,255,0.92)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ax-colors-fg-secondary)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
              cursor: "pointer",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <IconEllipsisStroke size={14} />
          </Box>
        </Box>

        {artifact.kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artifact.imageUrl}
            alt={artifact.title}
            style={{ width: "100%", height: (artifact as ImageArtifact).imageHeight ?? 220, objectFit: "cover", objectPosition: (artifact as ImageArtifact).objectPosition ?? "center", display: "block" }}
          />
        ) : (
          <Box p="12" pt="48" style={{ background: "var(--ax-colors-bg-secondary)" }}>
            <Group gap="6" alignItems="stretch" mb="10">
              {artifact.kpis.map((k, i) => (
                <KpiCell key={i} value={k.value} label={k.label} subtle={k.subtle} />
              ))}
            </Group>
            <Box rounded="md" style={{ background: "var(--ax-colors-bg-default)", border: "1px solid var(--ax-colors-border-default)", overflow: "hidden" }}>
              <Box px="10" py="6" display="flex" alignItems="center" style={{ borderBottom: "1px solid var(--ax-colors-border-default)" }}>
                {artifact.columns.map((c, i) => (
                  <Text
                    key={c}
                    fontSize="xs"
                    fontWeight="500"
                    color="fg.tertiary"
                    style={{ flex: i === 0 ? "1.4" : "1", textAlign: i === 0 ? "left" : "right" }}
                  >
                    {c}
                  </Text>
                ))}
              </Box>
              {artifact.rows.map((row, ri) => (
                <Box
                  key={row.name}
                  px="10"
                  py="6"
                  display="flex"
                  alignItems="center"
                  style={{ borderBottom: ri < artifact.rows.length - 1 ? "1px solid var(--ax-colors-border-default)" : "none" }}
                >
                  <Text fontSize="xs" color="fg.default" style={{ flex: "1.4" }}>{row.name}</Text>
                  {row.cells.map((cell, ci) => (
                    <Box key={ci} style={{ flex: "1", textAlign: "right" }}>
                      {ci === row.cells.length - 1 && cell.intent ? (
                        <Box
                          px="6"
                          py="2"
                          rounded="full"
                          style={{
                            display: "inline-block",
                            background:
                              cell.intent === "success" ? "var(--ax-colors-bg-success-subtle)" :
                              cell.intent === "warning" ? "var(--ax-colors-bg-warning-subtle)" :
                              "var(--ax-colors-bg-secondary)",
                          }}
                        >
                          <Text
                            fontSize="xs"
                            fontWeight="500"
                            color={
                              cell.intent === "success" ? "fg.success" :
                              cell.intent === "warning" ? "fg.warning" :
                              "fg.secondary"
                            }
                          >
                            {cell.value}
                          </Text>
                        </Box>
                      ) : (
                        <Text fontSize="xs" color="fg.secondary">{cell.value}</Text>
                      )}
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Footer — anchored to the card's bottom edge. As .pinned-extras grows
          on hover, this Box gets taller, so its top edge rises upward over
          the image. Image is in normal flow at the top and stays static. */}
      <Box
        px="12"
        py="10"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          background: "var(--ax-colors-bg-default)",
          borderTop: "1px solid var(--ax-colors-border-default)",
        }}>
        <Text
          fontSize="sm"
          fontWeight="600"
          color="fg.default"
          style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
        >
          {artifact.title}
        </Text>
        <Group gap="6" alignItems="center" mt="4">
          {artifact.contributors && artifact.contributors.length > 0 ? (
            <>
              {artifact.contributors.slice(0, 2).map((c, i) => (
                <CircleAvatar key={i} initials={c.initials} bg={c.bg} src={c.src} size={16} />
              ))}
              <Text fontSize="xs" color="fg.tertiary">{artifact.meta}</Text>
            </>
          ) : (
            <>
              {artifact.isPrivate && <IconLock size={11} style={{ color: "var(--ax-colors-fg-tertiary)" }} />}
              {artifact.isPrivate && <Text fontSize="xs" color="fg.tertiary">Private</Text>}
              {artifact.isPrivate && <Text fontSize="xs" color="fg.tertiary">·</Text>}
              <Text fontSize="xs" color="fg.tertiary">{artifact.meta}</Text>
            </>
          )}
        </Group>

        {/* Hover-revealed extras — tags on left, View link on right */}
        <Box className="pinned-extras">
          <Box display="flex" alignItems="center" justifyContent="space-between" gap="8">
            <Group gap="4" alignItems="center" flexWrap="wrap" style={{ minWidth: 0 }}>
              {(artifact.tags ?? []).map((tag) => (
                <Box
                  key={tag}
                  px="8"
                  py="2"
                  rounded="full"
                  style={{ background: "var(--ax-colors-bg-secondary)" }}
                >
                  <Text fontSize="xs" fontWeight="500" color="fg.secondary" style={{ letterSpacing: "0.04em" }}>{tag}</Text>
                </Box>
              ))}
            </Group>
            <Group gap="4" alignItems="center" style={{ cursor: "pointer", flexShrink: 0 }}>
              <Text fontSize="xs" fontWeight="500" style={{ color: "var(--ax-colors-fg-link-default)" }}>View</Text>
              <IconArrowRight size={12} style={{ color: "var(--ax-colors-fg-link-default)" }} />
            </Group>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function PinnedToWorkspace({ projectId, onOpenArtifact, onAddArtifact }: { projectId: string; onOpenArtifact?: (id: string) => void; onAddArtifact?: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const items = PINNED_ARTIFACTS.filter((a) => a.projectId === projectId);
  if (items.length === 0) return null;

  // Chevrons appear only when there are more cards than fit in the row.
  const overflowing = items.length > 2;
  const scrollBy = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: 320 * dir, behavior: "smooth" });
  };

  return (
    <Box px="24" pt="20" pb="16" style={{ flexShrink: 0 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb="8">
        <Group gap="6" alignItems="center">
          <Text fontWeight="600" color="fg.default" style={{ fontSize: 18 }}>Artifacts</Text>
          {onAddArtifact && (
            <Tooltip content="Add artifact">
              <Button
                appearance="subtle"
                size="sm"
                icon={<IconPlus />}
                aria-label="Add artifact"
                onClick={onAddArtifact}
              />
            </Tooltip>
          )}
        </Group>
        <Group gap="4" alignItems="center">
          <Button
            appearance="subtle"
            size="sm"
            style={{ color: "var(--ax-colors-fg-link-default)" }}
          >
            See all
          </Button>
          {overflowing && (
            <>
              <Tooltip content="Previous">
                <Button appearance="subtle" size="sm" icon={<IconChevronLeft />} aria-label="Previous" onClick={() => scrollBy(-1)} />
              </Tooltip>
              <Tooltip content="Next">
                <Button appearance="subtle" size="sm" icon={<IconChevronRight />} aria-label="Next" onClick={() => scrollBy(1)} />
              </Tooltip>
            </>
          )}
        </Group>
      </Box>
      <Box
        ref={scrollRef}
        className={overflowing ? "opal-chat-scroll" : undefined}
        style={{
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
          overflowX: overflowing ? "auto" : "visible",
          overflowY: "hidden",
          paddingBottom: overflowing ? 8 : 0,
        }}
      >
        {items.map((a) => (
          <PinnedArtifactCard key={a.id} artifact={a} onOpen={onOpenArtifact ? () => onOpenArtifact(a.id) : undefined} />
        ))}
      </Box>
    </Box>
  );
}

// ─── Project Files ───────────────────────────────────────────────────────────

// Rich file cards for Claw Machine Campaign (q4)
type FileIconKind = "chart" | "image" | "doc";

interface FileV2 {
  id: string;
  projectId: string;
  name: string;
  iconKind: FileIconKind;
  privacy: "private" | "shared";
  sharedWith?: { initials: string; bg: string; src?: string }[];
  recency: string;
}

const PROJECT_FILES_V2: FileV2[] = [
  {
    id: "v1",
    projectId: "q4",
    name: "Competitor Analysis Report",
    iconKind: "chart",
    privacy: "private",
    recency: "Viewed 1 hour ago",
  },
  {
    id: "v2",
    projectId: "q4",
    name: "Hero Banner Variation 2025",
    iconKind: "image",
    privacy: "shared",
    sharedWith: [
      { initials: "H",  bg: "#9b6fd4", src: "/avatars/vau-henry.png?v=2" },
      { initials: "DV", bg: "#6a8abf", src: "https://i.pravatar.cc/96?img=12" },
    ],
    recency: "Viewed 3 hours ago",
  },
  {
    id: "v3",
    projectId: "q4",
    name: "Q1 Sales Deck",
    iconKind: "doc",
    privacy: "private",
    recency: "Viewed 1 day ago",
  },
];

function FileIconTile({ kind }: { kind: FileIconKind }) {
  const iconMap: Record<FileIconKind, React.ReactNode> = {
    chart: <IconGrid size={18} />,
    image: <IconImage size={18} />,
    doc:   <IconFileLines size={18} />,
  };
  return (
    <Box
      style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        background: "var(--ax-colors-bg-secondary)",
        color: "var(--ax-colors-fg-secondary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {iconMap[kind]}
    </Box>
  );
}

function FileCardV2({ file }: { file: FileV2 }) {
  const [pinned, setPinned] = useState(false);

  return (
    <Box
      className="file-card"
      rounded="lg"
      style={{
        position: "relative",
        background: "var(--ax-colors-bg-default)",
        border: "1px solid var(--ax-colors-border-default)",
        padding: "10px 12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      {/* Left — icon tile */}
      <FileIconTile kind={file.iconKind} />

      {/* Center — name + metadata + hover view link */}
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text
          fontSize="md"
          fontWeight="500"
          color="fg.default"
          style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {file.name}
        </Text>
        <Group gap="6" alignItems="center" mt="4">
          {file.privacy === "private" ? (
            <>
              <IconLock size={11} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
              <Text fontSize="xs" color="fg.tertiary">Private</Text>
              <Text fontSize="xs" color="fg.tertiary">·</Text>
            </>
          ) : file.sharedWith && file.sharedWith.length > 0 ? (
            <>
              <AvatarGroup size="xs">
                {file.sharedWith.map((a, i) => (
                  <Avatar key={i} name={a.initials} src={a.src} colorScheme={i % 2 === 0 ? "purple" : "neutral"} />
                ))}
              </AvatarGroup>
              <Text fontSize="xs" color="fg.tertiary">·</Text>
            </>
          ) : null}
          <Text fontSize="xs" color="fg.tertiary">{file.recency}</Text>
        </Group>

      </Box>

      {/* Right — pin (hover/always) + overflow */}
      <Group gap="4" alignItems="center" style={{ flexShrink: 0 }}>
        <Box
          className={pinned ? undefined : "file-hover-pin"}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={(e) => { e.stopPropagation(); setPinned((p) => !p); }}
        >
          {pinned
            ? <IconThumbtackSolid size={14} style={{ color: "#202320" }} />
            : <IconThumbtack size={14} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
          }
        </Box>
        <Box
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--ax-colors-fg-tertiary)",
            cursor: "pointer",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <IconEllipsisStroke size={14} />
        </Box>
      </Group>
    </Box>
  );
}

function ProjectFilesSection({ projectId }: { projectId: string }) {
  const files = PROJECT_FILES_V2.filter((f) => f.projectId === projectId);
  if (files.length === 0) return null;

  return (
    <Box px="24" pt="20" pb="16" style={{ flexShrink: 0 }}>
      {/* Section header */}
      <Box display="flex" alignItems="center" mb="12">
        <Group gap="6" alignItems="center">
          <Text fontWeight="600" color="fg.default" style={{ fontSize: 18 }}>Files</Text>
          <Tooltip content="Add file">
            <Button appearance="subtle" size="sm" icon={<IconPlus />} aria-label="Add file" />
          </Tooltip>
        </Group>
      </Box>

      {/* File cards — 2-column grid */}
      <Box style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
        {files.map((file) => (
          <FileCardV2 key={file.id} file={file} />
        ))}
      </Box>
    </Box>
  );
}

// ─── Project Activity ────────────────────────────────────────────────────────
// Curated narrative of the project (not an audit log). Priority order:
//   1. NEEDS YOUR ACTION   — reviews / approvals / handoffs awaiting you
//   2. VAU AUTONOMY        — AITL actions VAUs took, with undo where possible
//   3. ARTIFACT STATE      — significant artifact changes (versions, approvals,
//                            ships, status transitions)
//   4. PROJECT MILESTONES  — creation, phase transitions, integrations triggered
// File additions, views, micro-edits, plumbing, joins/leaves: NOT shown here.

type ActivityCategory = "action" | "vau" | "artifact" | "milestone";

interface ActivityEvent {
  id: string;
  projectId: string;
  category: ActivityCategory;
  // Either `actor` (renders an avatar chip) or `icon` (renders a small glyph)
  actor?: ActivityActor;
  icon?: React.ReactNode;
  // Primary one-line story. Actor name is rendered separately at fontWeight 600.
  text: string;
  // Optional secondary line; small print.
  detail?: string;
  // Optional inline action — Review / Approve / Undo / View
  action?: { label: "Review" | "Approve" | "Undo" | "View" };
  time: string;
  bucket: "today" | "yesterday" | "earlier";
}

const PROJECT_ACTIVITY: ActivityEvent[] = [
  // — Needs your action
  {
    id: "act-1", projectId: "q3", category: "action",
    actor: FRANK,
    text: "drafted Hero copy v3 — 3 variants ready",
    detail: "awaiting your review",
    action: { label: "Review" },
    time: "12m ago",
    bucket: "today",
  },
  {
    id: "act-1b", projectId: "q3", category: "action",
    actor: SOFIA,
    text: "asked you to review the campaign positioning",
    detail: "mentioned you on Hero copy v3",
    action: { label: "View" },
    time: "30m ago",
    bucket: "today",
  },
  // — VAU autonomy
  {
    id: "act-2", projectId: "q3", category: "vau",
    actor: FRANK,
    text: "sent the campaign brief to the team",
    action: { label: "Undo" },
    time: "2h ago",
    bucket: "today",
  },
  {
    id: "act-3", projectId: "q3", category: "vau",
    actor: FRANK,
    text: "added competitor research to memory",
    time: "4h ago",
    bucket: "today",
  },
  // — Artifact state
  {
    id: "act-4", projectId: "q3", category: "artifact",
    actor: YOU,
    text: "approved variant B for Hero copy",
    time: "Yesterday",
    bucket: "yesterday",
  },
  {
    id: "act-5", projectId: "q3", category: "artifact",
    icon: <IconBullseyePointer size={14} />,
    text: "Audience segment moved from draft to ready",
    time: "Yesterday",
    bucket: "yesterday",
  },
  // — Project milestones
  {
    id: "act-6", projectId: "q3", category: "milestone",
    icon: <IconArrowRight size={14} />,
    text: "Project moved from drafting to review",
    time: "3 days ago",
    bucket: "earlier",
  },
  {
    id: "act-7", projectId: "q3", category: "milestone",
    actor: SOFIA,
    text: "created Q3 Campaign Launch",
    time: "2 weeks ago",
    bucket: "earlier",
  },
  // ── Peticure Campaign activity ──
  {
    id: "pet-1", projectId: "q4", category: "action",
    actor: FRANK,
    text: "drafted the Peticure launch messaging guide — 4 tone variants ready",
    detail: "awaiting your review",
    action: { label: "Review" },
    time: "20m ago",
    bucket: "today",
  },
  {
    id: "pet-2", projectId: "q4", category: "action",
    actor: { name: "Yuki", initials: "YT", bg: "#8a6abf", photoUrl: "https://i.pravatar.cc/96?img=44" },
    text: "asked you to approve the SEO keyword strategy",
    detail: "mentioned you on target-personas-pets.md",
    action: { label: "View" },
    time: "1h ago",
    bucket: "today",
  },
  {
    id: "pet-3", projectId: "q4", category: "vau",
    actor: { name: "Kerby", initials: "K", bg: "#4a9e7a", isVT: true, photoUrl: "/avatars/vau-kerby.png?v=2" },
    text: "completed competitor landscape scan for pet wellness category",
    action: { label: "Undo" },
    time: "3h ago",
    bucket: "today",
  },
  {
    id: "pet-4", projectId: "q4", category: "vau",
    actor: FRANK,
    text: "scheduled social posts across Instagram and TikTok for launch week",
    time: "5h ago",
    bucket: "today",
  },
  {
    id: "pet-5", projectId: "q4", category: "artifact",
    actor: YOU,
    text: "approved the Peticure brand identity system",
    time: "Yesterday",
    bucket: "yesterday",
  },
  {
    id: "pet-6", projectId: "q4", category: "artifact",
    icon: <IconBullseyePointer size={14} />,
    text: "Audience segment updated to pet owners · 25–44 · urban",
    time: "Yesterday",
    bucket: "yesterday",
  },
  {
    id: "pet-7", projectId: "q4", category: "milestone",
    icon: <IconArrowRight size={14} />,
    text: "Project moved from ideation to production",
    time: "4 days ago",
    bucket: "earlier",
  },
  {
    id: "pet-8", projectId: "q4", category: "milestone",
    actor: { name: "Daniel", initials: "DV", bg: "#6a8abf", photoUrl: "https://i.pravatar.cc/96?img=12" },
    text: "created Peticure Campaign",
    time: "3 weeks ago",
    bucket: "earlier",
  },
];

// Avatar or icon tile for an activity row. 28px squareish.
function ActivityChip({ event }: { event: ActivityEvent }) {
  if (event.actor) {
    return <CircleAvatar initials={event.actor.initials} bg={event.actor.bg} src={event.actor.photoUrl} size={28} />;
  }
  return (
    <Box
      style={{
        width: 28,
        height: 28,
        borderRadius: 999,
        background: "var(--ax-colors-bg-secondary)",
        color: "var(--ax-colors-fg-secondary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {event.icon}
    </Box>
  );
}

function actorNameForEvent(event: ActivityEvent): string | undefined {
  if (!event.actor) return undefined;
  // Surface "You" / "Frank" / etc. as the leading bold noun.
  return event.actor.name;
}

function ActivityRow({ event }: { event: ActivityEvent }) {
  const actorName = actorNameForEvent(event);
  return (
    <Box display="flex" alignItems="start" gap="12" py="10">
      <Box style={{ flexShrink: 0, marginTop: 1 }}>
        <ActivityChip event={event} />
      </Box>
      <Box style={{ minWidth: 0, flex: 1 }}>
        <Text fontSize="sm" color="fg.default" style={{ display: "block", lineHeight: 1.45 }}>
          {actorName && (
            <strong style={{ fontWeight: 600, color: "var(--ax-colors-fg-default)" }}>
              {actorName}{" "}
            </strong>
          )}
          {event.text}
        </Text>
        {event.detail && (
          <Text fontSize="xs" color="fg.tertiary" mt="2" style={{ display: "block" }}>
            {event.detail}
          </Text>
        )}
      </Box>
      <Group gap="8" alignItems="center" style={{ flexShrink: 0, marginTop: 2 }}>
        <Text fontSize="xs" color="fg.tertiary">{event.time}</Text>
        {event.action && (
          <Button
            appearance="subtle"
            size="sm"
            style={{ color: "var(--ax-colors-fg-link-default)" }}
          >
            {event.action.label}
          </Button>
        )}
      </Group>
    </Box>
  );
}

function ActivityGroup({ label, events }: { label: string; events: ActivityEvent[] }) {
  return (
    <Box mb="8">
      <Text
        fontSize="xs"
        fontWeight="500"
        color="fg.tertiary"
        mt="8"
        mb="4"
        style={{ textTransform: "uppercase", letterSpacing: "0.07em", display: "block" }}
      >
        {label}
      </Text>
      <Box>
        {events.map((event) => (
          <ActivityRow key={event.id} event={event} />
        ))}
      </Box>
    </Box>
  );
}

// ─── Needs You ───────────────────────────────────────────────────────────────
// Curated action layer: items that require the current user's review, approval,
// or response. Distinct from Activity (which is the chronological record).

type NeedsYouAction = "Review" | "Approve" | "Reply" | "Open";

interface NeedsYouItem {
  id: string;
  projectId: string;
  actor: ActivityActor;
  actionStatement: string; // e.g. "drafted Hero copy v3"
  meta: string;            // e.g. "3 variants · awaiting your review · 12m ago"
  action: NeedsYouAction;
}

const NEEDS_YOU_ITEMS: NeedsYouItem[] = [
  {
    id: "ny1",
    projectId: "q3",
    actor: { name: "Frank", initials: "F", bg: "#3ecfb2", isVT: true, photoUrl: "/avatars/vau-frank.png?v=2" },
    actionStatement: "drafted Hero copy v3",
    meta: "3 variants · awaiting your review · 12m ago",
    action: "Review",
  },
  {
    id: "ny2",
    projectId: "q3",
    actor: { name: "Sofia", initials: "SA", bg: "#7c6fad", photoUrl: "https://i.pravatar.cc/96?img=47" },
    actionStatement: "asked you to review the campaign positioning",
    meta: "mentioned you on Hero copy v3 · 30m ago",
    action: "Reply",
  },
  {
    id: "ny3",
    projectId: "q3",
    actor: { name: "Frank", initials: "F", bg: "#3ecfb2", isVT: true, photoUrl: "/avatars/vau-frank.png?v=2" },
    actionStatement: "proposed Color Stories · Lipstick Campaign",
    meta: "draft ready · waiting for your approval · 1h ago",
    action: "Approve",
  },
];

function NeedsYouRow({ item, isLast }: { item: NeedsYouItem; isLast: boolean }) {
  const [hovered, setHovered] = useState(false);
  const actionAppearance: Record<NeedsYouAction, "primary" | "default" | "subtle"> = {
    Review:  "primary",
    Approve: "primary",
    Reply:   "default",
    Open:    "subtle",
  };

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: "pointer",
        background: hovered ? "var(--ax-colors-bg-secondary)" : "transparent",
        transition: "background 120ms ease",
      }}
    >
      <Box
        px="20"
        py="16"
        display="flex"
        alignItems="center"
        gap="12"
      >
        {/* Avatar */}
        <Box style={{ flexShrink: 0 }}>
          {item.actor.isVT
            ? <VAUPulseAvatar actor={item.actor} size={30} />
            : <CircleAvatar initials={item.actor.initials} bg={item.actor.bg} src={item.actor.photoUrl} size={30} />
          }
        </Box>

        {/* Content */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text
            fontSize="sm"
            color="fg.default"
            style={{ display: "block", lineHeight: 1.4 }}
          >
            <strong style={{ fontWeight: 600, color: "var(--ax-colors-fg-default)" }}>
              {item.actor.name}
            </strong>
            {" "}{item.actionStatement}
          </Text>
          <Text fontSize="xs" color="fg.tertiary" style={{ display: "block", marginTop: 2 }}>
            {item.meta}
          </Text>
        </Box>

        {/* Action button */}
        <Box style={{ flexShrink: 0 }}>
          <Button
            appearance={actionAppearance[item.action]}
            size="sm"
            onClick={(e) => e.stopPropagation()}
          >
            {item.action}
          </Button>
        </Box>
      </Box>

      {/* Hairline divider — omit after last item */}
      {!isLast && (
        <Box style={{ height: 1, background: "var(--ax-colors-border-default)", margin: "0 20px" }} />
      )}
    </Box>
  );
}

function NeedsYou({ projectId }: { projectId: string }) {
  const items = NEEDS_YOU_ITEMS.filter((i) => i.projectId === projectId);

  return (
    <Box px="24" pt="20" pb="16" style={{ flexShrink: 0 }}>
      {/* Section header */}
      <Box display="flex" alignItems="center" mb="8">
        <Group gap="8" alignItems="center">
          <Text fontWeight="600" color="fg.default" style={{ fontSize: 18 }}>Needs attention</Text>
          <Box
            px="6"
            style={{
              minWidth: 22,
              height: 20,
              borderRadius: 999,
              background: items.length > 0 ? "var(--ax-colors-fg-default)" : "var(--ax-colors-bg-secondary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              fontSize="xs"
              fontWeight="600"
              style={{ color: items.length > 0 ? "#fff" : "var(--ax-colors-fg-tertiary)" }}
            >
              {items.length}
            </Text>
          </Box>
        </Group>
      </Box>

      {items.length === 0 ? (
        <Box pt="8">
          <Text fontSize="sm" color="fg.tertiary" style={{ lineHeight: 1.5 }}>
            Nothing needs you right now. Your team will surface things here as work comes in.
          </Text>
        </Box>
      ) : (
        <Box
          rounded="lg"
          style={{
            background: "var(--ax-colors-bg-default)",
            border: "1px solid var(--ax-colors-border-default)",
            overflow: "hidden",
          }}
        >
          {items.map((item, idx) => (
            <NeedsYouRow key={item.id} item={item} isLast={idx === items.length - 1} />
          ))}
        </Box>
      )}
    </Box>
  );
}

function ProjectActivity({ projectId }: { projectId: string }) {
  // Show only the top 3 most-recent items here (per spec); "See all" reveals the
  // rest in a future expanded view. Items are already authored in priority order,
  // so slicing from the front respects priority too.
  const VISIBLE = 3;
  const all = PROJECT_ACTIVITY.filter((e) => e.projectId === projectId);
  if (all.length === 0) return null;
  const events = all.slice(0, VISIBLE);

  const today = events.filter((e) => e.bucket === "today");
  const yesterday = events.filter((e) => e.bucket === "yesterday");
  const earlier = events.filter((e) => e.bucket === "earlier");

  return (
    <Box px="24" pt="0" pb="24" style={{ flexShrink: 0 }}>
      {/* Section header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb="8">
        <Group gap="8" alignItems="center">
          <Text fontSize="sm" fontWeight="600" color="fg.default">Activity</Text>
          <Box
            px="6"
            style={{
              minWidth: 22,
              height: 22,
              borderRadius: 999,
              background: "var(--ax-colors-bg-secondary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text fontSize="xs" fontWeight="500" color="fg.secondary">{all.length}</Text>
          </Box>
        </Group>
        <Button
          appearance="subtle"
          size="sm"
          style={{ color: "var(--ax-colors-fg-link-default)" }}
        >
          See all
        </Button>
      </Box>

      {today.length > 0 && <ActivityGroup label="Today" events={today} />}
      {yesterday.length > 0 && <ActivityGroup label="Yesterday" events={yesterday} />}
      {earlier.length > 0 && <ActivityGroup label="Earlier" events={earlier} />}
    </Box>
  );
}

// ── Project workspace empty state ────────────────────────────────────────────
// Shown in the middle pane when a project has zero artifacts, zero
// needs-attention items, and zero work-in-motion entries. Renders a welcoming
// heading + four starter affordances + helper line. Sized to sit in the upper
// third of the available space (not dead-center) so users see it on mount.

interface ProjectStarterOption {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick?: () => void;
}

function ProjectEmptyState({ projectName, onAddArtifact }: { projectName: string; onAddArtifact: () => void }) {
  const starters: ProjectStarterOption[] = [
    {
      id: "add-artifact",
      icon: <IconFileLines size={18} style={{ color: "#2a6240" }} />,
      label: "Add an artifact",
      description: "Create a new piece of work — hero copy, brief, audience segment, etc.",
      onClick: onAddArtifact,
    },
    {
      id: "upload-file",
      icon: <IconFolderOpen size={18} style={{ color: "var(--ax-colors-fg-secondary)" }} />,
      label: "Upload a file",
      description: "Attach reference material — brand guidelines, research, decks.",
    },
    {
      id: "ask-vau",
      icon: <IconSparkles size={16} style={{ color: "#7c6fad" }} />,
      label: "Ask a virtual teammate",
      description: "Have Frank, Henry, or Kerby draft, research, or propose work.",
    },
  ];

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      style={{
        paddingTop: 20,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 32,
      }}
    >
      <Box style={{ maxWidth: 560, width: "100%" }}>
        {/* Heading */}
        <Text
          color="fg.default"
          fontFamily="heading"
          style={{ fontSize: 24, lineHeight: 1.2, fontWeight: 700, letterSpacing: "-0.01em", display: "block", marginBottom: 6, textAlign: "center" }}
        >
          A blank slate. Where to?
        </Text>
        <Text fontSize="md" color="fg.secondary" style={{ display: "block", lineHeight: 1.5, textAlign: "center" }}>
          Add artifacts, upload files, or ask your virtual teammates to draft something.
        </Text>

        {/* Hero image — sits between intro copy and the get-started affordances */}
        <Box
          rounded="lg"
          style={{
            marginTop: 24,
            overflow: "hidden",
            background: "var(--ax-colors-bg-secondary)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Sunset.jpg"
            alt=""
            style={{
              width: "100%",
              height: 200,
              objectFit: "cover",
              display: "block",
            }}
          />
        </Box>

        {/* Get-started affordances */}
        <Box style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          {starters.map((s) => (
            <Box
              key={s.id}
              onClick={s.onClick}
              rounded="lg"
              style={{
                background: "var(--ax-colors-bg-default)",
                border: "1px solid var(--ax-colors-border-default)",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                cursor: s.onClick ? "pointer" : "default",
                transition: "background 120ms ease, border-color 120ms ease",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onMouseEnter={(e: any) => { e.currentTarget.style.background = "var(--ax-colors-bg-secondary)"; }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onMouseLeave={(e: any) => { e.currentTarget.style.background = "var(--ax-colors-bg-default)"; }}
            >
              <Box style={{ width: 36, height: 36, borderRadius: 8, background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {s.icon}
              </Box>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text fontSize="sm" fontWeight="600" color="fg.default" style={{ display: "block", lineHeight: 1.4 }}>
                  {s.label}
                </Text>
                <Text fontSize="xs" color="fg.tertiary" style={{ display: "block", marginTop: 2, lineHeight: 1.4 }}>
                  {s.description}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Helper text */}
        <Text
          fontSize="xs"
          color="fg.tertiary"
          style={{ display: "block", marginTop: 12, lineHeight: 1.5, textAlign: "center" }}
        >
          Items will appear here as you and your team work — artifacts, files, and things needing your attention.
        </Text>
      </Box>
    </Box>
  );
}

// ── New artifact dialog ──────────────────────────────────────────────────────
// Lightweight Axiom Dialog opened from the "+" in the Artifacts header or from
// the empty-state "Add an artifact" row. Stubbed: creation is a no-op for now.
function NewArtifactDialog({ open, onOpenChange, projectName }: { open: boolean; onOpenChange: (o: boolean) => void; projectName: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("document");

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setType("document");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>New artifact in {projectName}</DialogHeader>
        <DialogForm
          onSubmit={(e) => {
            e.preventDefault();
            // Stub: in a real build this would persist the artifact and open
            // the editor. For now just close the dialog.
            onOpenChange(false);
          }}
        >
          <DialogBody>
            <Group flexDirection="column" gap="16" alignItems="stretch">
              <Field label="Title" required>
                <Input
                  placeholder="e.g. Holiday hero copy v1"
                  value={title}
                  onValueChange={setTitle}
                  required
                />
              </Field>

              <Field label="Type">
                <Select
                  value={type}
                  onValueChange={(v) => setType(typeof v === "string" ? v : "document")}
                  options={[
                    { label: "Document",         value: "document" },
                    { label: "Brief",            value: "brief" },
                    { label: "Email",            value: "email" },
                    { label: "Audience segment", value: "audience" },
                  ]}
                />
              </Field>

              <Field label="Description" description="Optional — a short note about what this artifact is for.">
                <Textarea
                  placeholder="What is this artifact for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </Field>
            </Group>
          </DialogBody>
          <DialogFooter>
            <Button appearance="subtle" onClick={() => onOpenChange(false)} type="button">Cancel</Button>
            <Button appearance="primary" type="submit" disabled={!title.trim()}>Create</Button>
          </DialogFooter>
        </DialogForm>
      </DialogContent>
    </Dialog>
  );
}

function WorkspacePanel({ projectId, title, subtitle, avatars, onToggleWorkspace, rightCollapsed, onToggleRight, onOpenArtifact }: { projectId: string; title: string; subtitle: string; avatars: { initials: string; bg: string; src?: string }[]; onToggleWorkspace?: () => void; rightCollapsed?: boolean; onToggleRight?: () => void; onOpenArtifact?: (id: string) => void }) {
  const [newArtifactOpen, setNewArtifactOpen] = useState(false);

  // The middle pane is "empty" when nothing in the workspace has populated yet —
  // no artifacts, no needs-attention items, no in-flight work-in-motion entries.
  // (Chat history lives in the right panel and is intentionally NOT a trigger
  // here; an empty middle pane with active chat is still empty.)
  const hasArtifacts   = PINNED_ARTIFACTS.some((a) => a.projectId === projectId);
  const hasNeedsYou    = NEEDS_YOU_ITEMS.some((i) => i.projectId === projectId);
  const hasInMotion    = WORKING_NOW.some((i) => i.projectId === projectId)
                       || APPROVALS.some((i) => i.projectId === projectId)
                       || RECENT.some((i) => i.projectId === projectId);
  const isEmpty = !hasArtifacts && !hasNeedsYou && !hasInMotion;

  return (
    <Box display="flex" flexDirection="column" h="full" overflow="hidden" flex="1" style={{ minWidth: 0, borderRight: "1px solid var(--ax-colors-border-default)", background: "#EEF5EA" }}>
      {/* Whole middle column scrolls together: header + strip + pinned + files + activity. */}
      <Box flex="1" overflow="auto" className="opal-chat-scroll">
      {/* Header */}
      <Box px="24" py="20" style={{ borderBottom: "1px solid var(--ax-colors-border-default)" }}>
        <Text fontSize="xs" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: "0.07em" }} mb="4">Project</Text>
        <Box display="flex" alignItems="start" justifyContent="space-between" mb="6">
          <Group gap="8" alignItems="center" style={{ minWidth: 0, flex: 1 }}>
            {onToggleWorkspace && (
              <Tooltip content="Collapse workspace" delayDuration={300}>
                <Button
                  appearance="subtle"
                  size="sm"
                  icon={<IconChevronLeft />}
                  aria-label="Collapse workspace"
                  onClick={onToggleWorkspace}
                  style={{ flexShrink: 0 }}
                />
              </Tooltip>
            )}
            {onToggleRight && rightCollapsed && (
              <Tooltip content="Show chat" delayDuration={300}>
                <Button
                  appearance="subtle"
                  size="sm"
                  icon={<IconMessageLines />}
                  aria-label="Show chat"
                  onClick={onToggleRight}
                  style={{ flexShrink: 0 }}
                />
              </Tooltip>
            )}
            <Text
              color="fg.default"
              fontFamily="heading"
              style={{ fontSize: 28, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-0.01em", minWidth: 0 }}
            >
              {title}
            </Text>
          </Group>
          <Group gap="8" alignItems="center" style={{ flexShrink: 0, marginLeft: 16 }}>
            <AvatarGroup size="sm">
              {avatars.map((a, i) => (
                <Avatar key={i} name={a.initials} src={a.src} colorScheme={i % 2 === 0 ? "purple" : "neutral"} />
              ))}
            </AvatarGroup>
            <Button appearance="default" size="sm" icon={<IconUserPlus />}>Invite</Button>
            <Tooltip content="More">
              <Button appearance="subtle" size="sm" icon={<IconEllipsisStroke />} aria-label="More options" />
            </Tooltip>
          </Group>
        </Box>
        <Text fontSize="sm" color="fg.secondary">{subtitle}</Text>
      </Box>

      {isEmpty ? (
        <ProjectEmptyState
          projectName={title}
          onAddArtifact={() => setNewArtifactOpen(true)}
        />
      ) : (
        <>
          <WorkInMotionStrip projectId={projectId} />
          <PinnedToWorkspace
            projectId={projectId}
            onOpenArtifact={onOpenArtifact}
            onAddArtifact={() => setNewArtifactOpen(true)}
          />
          {projectId === "q4" && <ProjectFilesSection projectId={projectId} />}
          <NeedsYou projectId={projectId} />
        </>
      )}
      </Box>

      <NewArtifactDialog
        open={newArtifactOpen}
        onOpenChange={setNewArtifactOpen}
        projectName={title}
      />
    </Box>
  );
}

function ArtifactCard({ icon, title, time, description, contributors }: ArtifactDef) {
  return (
    <Box p="16" rounded="md" style={{ border: "1px solid var(--ax-colors-border-default)" }}>
      <Box display="flex" alignItems="start" justifyContent="space-between" mb="6">
        <Group gap="8" alignItems="center">
          <Box style={{ color: "var(--ax-colors-fg-accent)", flexShrink: 0 }}>{icon}</Box>
          <Text fontSize="md" fontWeight="500" color="fg.default">{title}</Text>
        </Group>
        <Text fontSize="xs" color="fg.tertiary" style={{ flexShrink: 0, marginLeft: 16 }}>{time}</Text>
      </Box>
      <Text fontSize="sm" color="fg.secondary" style={{ marginBottom: 12 }}>{description}</Text>
      <Group gap="8" alignItems="center">
        <AvatarGroup size="xs">
          {contributors.map((a, i) => (
            <Avatar key={i} name={a.initials} colorScheme={i % 2 === 0 ? "purple" : "neutral"} />
          ))}
        </AvatarGroup>
        <Text fontSize="xs" color="fg.tertiary">
          {contributors.length} contributor{contributors.length !== 1 ? "s" : ""}
        </Text>
      </Group>
    </Box>
  );
}

// ── Canvas Overlay ────────────────────────────────────────────────────────────

const CURSOR_LABEL_FADE_MS = 2000;

function CollabCursor({ name, color }: { name: string; color: string }) {
  const [labelVisible, setLabelVisible] = useState(true);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleFade = () => {
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    fadeTimer.current = setTimeout(() => setLabelVisible(false), CURSOR_LABEL_FADE_MS);
  };

  useEffect(() => {
    scheduleFade();
    return () => { if (fadeTimer.current) clearTimeout(fadeTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      asChild
      style={{ display: "inline-block", position: "relative", verticalAlign: "middle" }}
    >
      <span>
        <Box
          style={{
            position: "absolute",
            bottom: "100%",
            left: 0,
            marginBottom: 3,
            background: color,
            color: "#fff",
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 6px",
            borderRadius: 4,
            whiteSpace: "nowrap",
            userSelect: "none",
            pointerEvents: "none",
            zIndex: 2,
            opacity: labelVisible ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        >
          {name}
        </Box>
        <Box
          style={{ display: "inline-block", width: 2, height: "1.2em", background: color, borderRadius: 1, verticalAlign: "text-bottom", pointerEvents: "auto", cursor: "default" }}
          onMouseEnter={() => {
            if (fadeTimer.current) clearTimeout(fadeTimer.current);
            setLabelVisible(true);
          }}
          onMouseLeave={scheduleFade}
        />
      </span>
    </Box>
  );
}

// Waypoints are in the coordinate space of the inner doc content box
// (i.e. after the 52px top padding + 48px left padding of the centred 720px column).
const COLLAB_CURSORS: { id: string; name: string; color: string; photoUrl: string; intervalMs: number; startIndex: number; waypoints: { x: number; y: number }[] }[] = [
  {
    id: "raj",
    name: "Raj P.",
    color: "#5b7fa6",
    photoUrl: "https://i.pravatar.cc/96?img=52",
    intervalMs: 3400,
    startIndex: 0,
    waypoints: [
      { x: 88,  y: 330 },  // "Beauty-curious"
      { x: 260, y: 330 },  // mid sentence
      { x: 440, y: 330 },  // end of first line
      { x: 88,  y: 378 },  // next line
      { x: 320, y: 378 },
      { x: 88,  y: 426 },  // third line — "non-negotiable"
      { x: 200, y: 426 },
    ],
  },
  {
    id: "henry",
    name: "Henry",
    color: "#9b6fd4",
    photoUrl: "/avatars/vau-henry.png?v=2",
    intervalMs: 4800,
    startIndex: 2,
    waypoints: [
      { x: 88,  y: 148 },  // "What products does it feature?"
      { x: 310, y: 148 },
      { x: 88,  y: 196 },  // body line
      { x: 490, y: 196 },
      { x: 88,  y: 244 },
      { x: 360, y: 244 },
      { x: 88,  y: 148 },
    ],
  },
  {
    id: "sofia",
    name: "Sofia A.",
    color: "#c06fad",
    photoUrl: "https://i.pravatar.cc/96?img=47",
    intervalMs: 5600,
    startIndex: 1,
    waypoints: [
      { x: 88,  y: 530 },  // "What is the creative concept?"
      { x: 380, y: 530 },
      { x: 88,  y: 578 },
      { x: 240, y: 578 },
      { x: 440, y: 578 },
      { x: 88,  y: 626 },
      { x: 160, y: 626 },
    ],
  },
];

// ─── Enhance with Opal — types, mock data, sub-components ─────────────────

type EnhancePhase = "idle" | "loading" | "diff" | "error";

interface SelectionMeta {
  text: string;
  wordCount: number;
  rect: DOMRect;
}

interface DiffData {
  original: string;
  enhanced: string;
  rationale: string;
}

const ENHANCE_SAMPLES: { match: RegExp; enhanced: string; rationale: string }[] = [
  {
    match: /Color Stories is the Q3 hero launch campaign/i,
    enhanced: "Color Stories is our Q3 flagship — a bold, editorial-first campaign built to own the Gen Z beauty conversation across TikTok, Reels, and Pinterest. Not a product catalogue. A mood, a point of view, a cultural moment.",
    rationale: "Removed hedging, sharpened the positioning, and gave the closing line more editorial punch",
  },
  {
    match: /Beauty-curious 18.28 year olds/i,
    enhanced: "Gen Z beauty seekers who follow creators, not campaigns. They demand shade range, authentic aesthetic, and sustainable values — and they share what genuinely feels like them.",
    rationale: "Tightened the demographic definition and foregrounded the key sharing-behaviour insight",
  },
  {
    match: /Each look is a .color story/i,
    enhanced: "Every look is a colour story — a three-product editorial built around a single unified mood: warm terracotta, cool chrome, or deep plum. Creator-led content anchors the campaign, with paid media mirroring the same visual language to hold coherence across every funnel stage.",
    rationale: "Adjusted rhythm for editorial flow and made the channel integration sharper",
  },
  {
    match: /15M organic impressions/i,
    enhanced: "15M organic impressions in the first 30 days · 8%+ save rate on editorial posts · 3× ROAS on paid · 40% of traffic from creator referral. Secondary KPI: hero SKU sell-through ≥ 70% within six weeks of launch.",
    rationale: "Standardised metric formatting and replaced '6 weeks' with 'six weeks' for editorial consistency",
  },
  {
    match: /Creative shoot/i,
    enhanced: "Creative shoot: June 3–5 · Creator seeding: June 12 · Paid media live: June 24 · Full launch: July 1. All dates are locked — any slip requires a written change request from the campaign lead.",
    rationale: "Added accountability framing to the timeline to signal dates are firm, not aspirational",
  },
];

const RETRY_SAMPLES: { enhanced: string; rationale: string }[] = [
  {
    enhanced: "This passage has been rewritten for rhythm and precision — shorter sentences, stronger verbs, no hedging.",
    rationale: "Applied a tighter editorial voice with active construction throughout",
  },
  {
    enhanced: "Clarity first. The original idea is intact but the excess framing has been removed — what's left says more with less.",
    rationale: "Cut redundant phrasing and removed passive voice to sharpen the through-line",
  },
  {
    enhanced: "Same idea, different energy. The tone is warmer and more direct — written for a reader who is skimming, not studying.",
    rationale: "Optimised for scannability while preserving the core message and brand voice",
  },
];

function getMockEnhancement(text: string): { enhanced: string; rationale: string } {
  for (const s of ENHANCE_SAMPLES) {
    if (s.match.test(text)) return { enhanced: s.enhanced, rationale: s.rationale };
  }
  const words = text.trim().split(/\s+/).filter(Boolean);
  const short = words.slice(0, Math.min(words.length, 18)).join(" ");
  return {
    enhanced: short + (words.length > 18 ? " — refined for clarity and confidence." : "."),
    rationale: "Removed redundancy, tightened phrasing, and strengthened the verb structure",
  };
}

function getRetryEnhancement(attempt: number): { enhanced: string; rationale: string } {
  return RETRY_SAMPLES[attempt % RETRY_SAMPLES.length];
}

// ── FloatingSelectionToolbar ─────────────────────────────────────────────────

function FloatingSelectionToolbar({
  selMeta,
  phase,
  onEnhance,
}: {
  selMeta: SelectionMeta;
  phase: EnhancePhase;
  onEnhance: () => void;
}) {
  const { rect, wordCount } = selMeta;
  const TOOLBAR_H = 44;
  const top = rect.top - TOOLBAR_H - 8;
  const centerX = rect.left + rect.width / 2;
  const tooShort = wordCount < 3;
  const tooLong = wordCount > 500;
  const enhanceDisabled = tooShort || tooLong || phase === "loading";
  const disabledTip = tooShort ? "Select at least 3 words" : tooLong ? "Selection too long — try a smaller passage" : undefined;

  return (
    <Box
      className="opal-toolbar-animate"
      onMouseDown={(e) => e.preventDefault()}
      style={{
        position: "fixed",
        top: Math.max(8, top),
        left: centerX,
        transform: "translateX(-50%)",
        zIndex: 100000,
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        background: "var(--ax-colors-bg-default)",
        border: "1px solid var(--ax-colors-border-default)",
        borderRadius: 10,
        padding: "4px 6px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.06)",
        whiteSpace: "nowrap",
        animation: "toolbarFadeIn 160ms ease-out",
        pointerEvents: "all",
        userSelect: "none",
      }}
    >
      <Tooltip content="Bold" delayDuration={400}><Button appearance="subtle" size="sm" icon={<IconBold />} aria-label="Bold" /></Tooltip>
      <Tooltip content="Italic" delayDuration={400}><Button appearance="subtle" size="sm" icon={<IconItalic />} aria-label="Italic" /></Tooltip>
      <Tooltip content="Underline" delayDuration={400}><Button appearance="subtle" size="sm" icon={<IconUnderline />} aria-label="Underline" /></Tooltip>
      <Tooltip content="Link" delayDuration={400}><Button appearance="subtle" size="sm" icon={<IconLink />} aria-label="Link" /></Tooltip>
      <Tooltip content="Comment" delayDuration={400}><Button appearance="subtle" size="sm" icon={<IconCommentPlus />} aria-label="Comment" /></Tooltip>
      <Box style={{ width: 1, height: 20, background: "var(--ax-colors-border-secondary)", margin: "0 6px", flexShrink: 0 }} />
      <Tooltip content={disabledTip ?? "Enhance with Opal (⌘⇧E)"} delayDuration={300}>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={enhanceDisabled ? undefined : onEnhance}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 11px",
            borderRadius: 999,
            border: "none",
            cursor: enhanceDisabled ? "default" : "pointer",
            background: enhanceDisabled
              ? "var(--ax-colors-bg-secondary)"
              : "linear-gradient(135deg, #d6edce 0%, #b5dda8 45%, #86c47f 100%)",
            opacity: enhanceDisabled ? 0.45 : 1,
            fontSize: 13,
            fontWeight: 500,
            color: "#202320",
            transition: "transform 140ms ease, box-shadow 140ms ease, opacity 140ms ease",
            outline: "none",
            fontFamily: "inherit",
            lineHeight: 1,
          }}
          onMouseEnter={(e) => { if (!enhanceDisabled) { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 3px 12px rgba(0,0,0,0.14)"; } }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1.02)"; }}
        >
          <img src="/opal-orb.svg" alt="" width={13} height={13} style={{ display: "block", flexShrink: 0, verticalAlign: "middle" }} />
          Enhance with Opal
        </button>
      </Tooltip>
    </Box>
  );
}

// ── SelectionShimmer — loading pulse over selected text ──────────────────────

function SelectionShimmer({ rect }: { rect: DOMRect }) {
  return (
    <Box
      className="opal-shimmer-animate"
      style={{
        position: "fixed",
        top: rect.top - 2,
        left: rect.left - 2,
        width: rect.width + 4,
        height: rect.height + 4,
        zIndex: 99997,
        borderRadius: 4,
        background: "linear-gradient(90deg, transparent 0%, rgba(134,196,127,0.22) 50%, transparent 100%)",
        backgroundSize: "200% 100%",
        animation: "opalShimmer 1.4s ease-in-out infinite",
        pointerEvents: "none",
      }}
    />
  );
}

// ── EnhanceDiffCard — inline diff with accept / reject / try again ───────────

function EnhanceDiffCard({
  selMeta,
  diffData,
  onAccept,
  onReject,
  onTryAgain,
}: {
  selMeta: SelectionMeta;
  diffData: DiffData;
  onAccept: () => void;
  onReject: () => void;
  onTryAgain: () => void;
}) {
  const { rect } = selMeta;
  const viewportW = typeof window !== "undefined" ? window.innerWidth : 1200;
  const cardW = Math.min(660, viewportW - 80);
  const leftEdge = Math.max(24, rect.left - 20);
  const clampedLeft = Math.min(leftEdge, viewportW - cardW - 24);
  const topPos = rect.bottom + 8;

  return (
    <Box
      className="opal-diff-animate"
      onMouseDown={(e) => e.preventDefault()}
      style={{
        position: "fixed",
        top: topPos,
        left: clampedLeft,
        width: cardW,
        zIndex: 99999,
        borderRadius: 10,
        background: "var(--ax-colors-bg-default)",
        border: "1px solid var(--ax-colors-border-default)",
        borderLeft: "3px solid #86c47f",
        boxShadow: "0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)",
        overflow: "hidden",
        animation: "diffFadeIn 220ms ease-out",
        pointerEvents: "all",
      }}
    >
      <Box px="16" style={{ paddingTop: 14, paddingBottom: 14, display: "flex", flexDirection: "column", gap: 6 }}>
        {/* Original — struck through, muted */}
        <Text
          fontSize="sm"
          style={{
            display: "block",
            lineHeight: 1.7,
            color: "var(--ax-colors-fg-tertiary)",
            textDecoration: "line-through",
          }}
        >
          {diffData.original}
        </Text>

        {/* Enhanced — full opacity, fades in */}
        <Text
          fontSize="sm"
          color="fg.default"
          style={{
            display: "block",
            lineHeight: 1.7,
            animation: "diffTextIn 250ms ease-out",
          }}
        >
          {diffData.enhanced}
        </Text>

        {/* Rationale + actions row */}
        <Box display="flex" alignItems="center" justifyContent="space-between" style={{ marginTop: 4 }}>
          <Text fontSize="xs" color="fg.tertiary" style={{ fontStyle: "italic", flex: 1, minWidth: 0 }}>
            {diffData.rationale}
          </Text>
          <Box display="flex" alignItems="center" style={{ gap: 10, flexShrink: 0, marginLeft: 16 }}>
            <button
              onClick={onTryAgain}
              style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, color: "var(--ax-colors-fg-tertiary)", fontSize: 12, fontFamily: "inherit", padding: "2px 4px", borderRadius: 4 }}
            >
              <IconArrowRotateLeft size={11} />Try again
            </button>
            <Box style={{ width: 1, height: 12, background: "var(--ax-colors-border-secondary)", flexShrink: 0 }} />
            <button
              onClick={onReject}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ax-colors-fg-tertiary)", fontSize: 12, fontFamily: "inherit", padding: "2px 6px", borderRadius: 4 }}
            >
              Reject
            </button>
            <button
              onClick={onAccept}
              style={{
                background: "linear-gradient(135deg, #b5dda8 0%, #86c47f 100%)",
                border: "none",
                cursor: "pointer",
                color: "#202320",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "inherit",
                padding: "5px 12px",
                borderRadius: 6,
              }}
            >
              Accept
            </button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function CanvasOverlay({ artifactId, onClose }: { artifactId: string; onClose: () => void }) {
  const artifact = PINNED_ARTIFACTS.find((a) => a.id === artifactId);
  const filename = artifact?.id === "p2" ? "color-stories-brief.md" : "artifact.md";
  const [draft, setDraft] = useState("");

  // Animate each cursor through its waypoints independently
  const [cursorWpIdx, setCursorWpIdx] = useState<Record<string, number>>(() =>
    Object.fromEntries(COLLAB_CURSORS.map((c) => [c.id, c.startIndex % c.waypoints.length]))
  );
  useEffect(() => {
    const timers = COLLAB_CURSORS.map((cursor) =>
      setInterval(() => {
        setCursorWpIdx((prev) => ({
          ...prev,
          [cursor.id]: (prev[cursor.id] + 1) % cursor.waypoints.length,
        }));
      }, cursor.intervalMs)
    );
    return () => timers.forEach(clearInterval);
  }, []);

  // Staggered cursor visibility — each cursor fades in after a delay so they
  // appear to "arrive" naturally rather than snapping into position on open.
  const [cursorVisible, setCursorVisible] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const timers = COLLAB_CURSORS.map((cursor, i) =>
      setTimeout(() => {
        setCursorVisible((prev) => ({ ...prev, [cursor.id]: true }));
      }, 1000 + i * 800)
    );
    return () => timers.forEach(clearTimeout);
  }, []);


  // ── Enhance with Opal state ─────────────────────────────────────────────
  const editorRef = useRef<HTMLDivElement>(null);
  const [selMeta, setSelMeta] = useState<SelectionMeta | null>(null);
  const [enhancePhase, setEnhancePhase] = useState<EnhancePhase>("idle");
  const [diffData, setDiffData] = useState<DiffData | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const handleSelChange = () => {
      if (enhancePhase !== "idle") return;
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) { setSelMeta(null); return; }
      const range = sel.getRangeAt(0);
      const text = sel.toString().trim();
      if (!text || !editorRef.current?.contains(range.commonAncestorContainer)) { setSelMeta(null); return; }
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) { setSelMeta(null); return; }
      setSelMeta({ text, wordCount: text.split(/\s+/).filter(Boolean).length, rect });
    };
    document.addEventListener("selectionchange", handleSelChange);
    return () => document.removeEventListener("selectionchange", handleSelChange);
  }, [enhancePhase]);

  // Keyboard shortcut: Cmd/Ctrl+Shift+E triggers enhance
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "e" && selMeta && enhancePhase === "idle") {
        e.preventDefault();
        handleEnhance();
      }
      if (e.key === "Escape" && (enhancePhase === "diff" || enhancePhase === "loading")) {
        handleReject();
      }
      if (e.key === "Enter" && enhancePhase === "diff") {
        handleAccept();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  });

  const handleEnhance = () => {
    if (!selMeta) return;
    setEnhancePhase("loading");
    const delay = 1400 + Math.random() * 600;
    setTimeout(() => {
      const result = getMockEnhancement(selMeta.text);
      setDiffData({ original: selMeta.text, ...result });
      setEnhancePhase("diff");
    }, delay);
  };

  const handleAccept = () => {
    setEnhancePhase("idle");
    setSelMeta(null);
    setDiffData(null);
    setRetryCount(0);
    window.getSelection()?.removeAllRanges();
  };

  const handleReject = () => {
    setEnhancePhase("idle");
    setDiffData(null);
    setRetryCount(0);
    window.getSelection()?.removeAllRanges();
    setSelMeta(null);
  };

  const handleTryAgain = () => {
    if (!selMeta) return;
    const next = retryCount + 1;
    setRetryCount(next);
    setEnhancePhase("loading");
    setDiffData(null);
    setTimeout(() => {
      const result = next <= 1 ? getMockEnhancement(selMeta.text) : getRetryEnhancement(next);
      setDiffData({ original: selMeta.text, ...result });
      setEnhancePhase("diff");
    }, 1200 + Math.random() * 400);
  };

  return (
    <Box
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        background: "var(--ax-colors-bg-default)",
      }}
    >
      {/* ── Top bar ── */}
      <Box
        px="16"
        py="10"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        style={{ borderBottom: "1px solid var(--ax-colors-border-default)", flexShrink: 0 }}
      >
        {/* Left */}
        <Group gap="8" alignItems="center">
          <Button appearance="subtle" size="sm" icon={<IconXmark />} aria-label="Close" onClick={onClose} />
          <Text fontSize="md" fontWeight="500" color="fg.default" style={{ whiteSpace: "nowrap" }}>
            {artifact?.title ?? "Untitled"}
          </Text>
          <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0 }} />
          <Button appearance="subtle" size="sm" icon={<IconCode />} aria-label="View source" />
          <Button appearance="subtle" size="sm" icon={<IconEye />} aria-label="Preview" />
          <Button appearance="subtle" size="sm" icon={<IconPen />} aria-label="Edit" />
          <Button appearance="subtle" size="sm" icon={<IconEllipsisStroke />} aria-label="More" />
        </Group>
        {/* Right */}
        <Group gap="8" alignItems="center">
          <Badge intent="success" variant="subtle" style={{ background: "#EFF5EB", color: "#202320", fontWeight: 600, letterSpacing: "0.04em", fontSize: 11 }}>SAVED</Badge>
          <Button appearance="default" size="sm" icon={<IconUserPlus />}>Share</Button>
          <Button appearance="subtle" size="sm" icon={<IconMessageLines />} aria-label="Comments" />
          {/* Access list — 4 avatars + overflow chip */}
          <Box display="flex" alignItems="center">
            {([
              { src: YOU_PHOTO,                             initials: "AS", bg: YOU_BG,     z: 5 },
              { src: "https://i.pravatar.cc/96?img=47",     initials: "SA", bg: "#7c6fad",  z: 4 },
              { src: "https://i.pravatar.cc/96?img=52",     initials: "RP", bg: "#5b7fa6",  z: 3 },
              { src: "/avatars/vau-henry.png?v=2",          initials: "H",  bg: "#9b6fd4",  z: 2 },
            ] as const).map((av, i) => (
              <Box key={i} style={{ position: "relative", zIndex: av.z, marginRight: i < 3 ? -8 : -8 }}>
                <img src={av.src} alt={av.initials} style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--ax-colors-bg-default)", display: "block" }} />
              </Box>
            ))}
            <Box style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--ax-colors-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "var(--ax-colors-fg-secondary)", border: "2px solid var(--ax-colors-bg-default)", zIndex: 1, flexShrink: 0 }}>
              +2
            </Box>
          </Box>
        </Group>
      </Box>

      {/* ── Body ── */}
      <Box display="flex" flex="1" overflow="hidden">

        {/* ── Document pane ── */}
        <Box display="flex" flexDirection="column" flex="1" overflow="hidden">
          {/* Formatting toolbar */}
          <Box
            px="16"
            display="flex"
            alignItems="center"
            gap="2"
            style={{ borderBottom: "1px solid var(--ax-colors-border-default)", flexShrink: 0, height: 44 }}
          >
            {(["H1", "H2", "H3"] as const).map((h) => (
              <Button key={h} appearance="subtle" size="sm" style={{ fontWeight: h === "H1" ? 700 : 500, minWidth: 32 }}>
                {h}
              </Button>
            ))}
            <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", margin: "0 4px" }} />
            <Button appearance="subtle" size="sm" icon={<IconBold />} aria-label="Bold" />
            <Button appearance="subtle" size="sm" icon={<IconItalic />} aria-label="Italic" />
            <Button appearance="subtle" size="sm" icon={<IconStrikethrough />} aria-label="Strikethrough" />
            <Button appearance="subtle" size="sm" icon={<IconCode />} aria-label="Inline code" />
            <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", margin: "0 4px" }} />
            <Button appearance="subtle" size="sm" icon={<IconList />} aria-label="Bullet list" />
            <Button appearance="subtle" size="sm" icon={<IconListOl />} aria-label="Numbered list" />
            <Button appearance="subtle" size="sm" icon={<IconLink />} aria-label="Link" />
            <Box style={{ flex: 1 }} />
            {/* Active collaborators — one per cursor, pulsing, fades in with cursor */}
            <Box display="flex" alignItems="center" gap="4">
              {COLLAB_CURSORS.map((cursor) => (
                <Box
                  key={cursor.id}
                  style={{
                    position: "relative",
                    width: 22,
                    height: 22,
                    flexShrink: 0,
                    opacity: cursorVisible[cursor.id] ? 1 : 0,
                    transition: "opacity 0.5s ease",
                  }}
                >
                  <img
                    src={cursor.photoUrl}
                    alt={cursor.name}
                    style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", display: "block" }}
                  />
                  <Box
                    style={{
                      position: "absolute",
                      right: -1,
                      bottom: -1,
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: cursor.color,
                      border: "1.5px solid #fff",
                      animation: cursorVisible[cursor.id] ? "pulse 1.4s ease-in-out infinite" : "none",
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          {/* Scrollable document */}
          <Box flex="1" overflow="auto" className="opal-chat-scroll" style={{ display: "flex", flexDirection: "column", background: "#fff" }}>

            {/* Hero banner — full bleed, uses the artifact card image */}
            {artifact && artifact.kind === "image" && artifact.imageUrl && (
              <Box style={{ width: "100%", height: 260, flexShrink: 0, overflow: "hidden" }}>
                <img
                  src={artifact.imageUrl}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </Box>
            )}

            <Box ref={editorRef} style={{ maxWidth: 720, width: "100%", margin: "0 auto", padding: "52px 48px 96px", position: "relative" }}>

              {/* ── Animated collaborative cursors ── */}
              <Box style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}>
                {COLLAB_CURSORS.map((cursor) => {
                  const wp = cursor.waypoints[cursorWpIdx[cursor.id] ?? 0];
                  return (
                    <Box
                      key={cursor.id}
                      style={{
                        position: "absolute",
                        left: wp.x,
                        top: wp.y,
                        opacity: cursorVisible[cursor.id] ? 1 : 0,
                        transition: "opacity 0.5s ease, left 0.85s cubic-bezier(0.25, 0.46, 0.45, 0.94), top 0.85s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        pointerEvents: "none",
                      }}
                    >
                      <CollabCursor name={cursor.name} color={cursor.color} />
                    </Box>
                  );
                })}
              </Box>

              {/* Doc title */}
              <Text
                fontFamily="heading"
                color="fg.default"
                style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em", display: "block", marginBottom: 6 }}
              >
                Color Stories: Beauty Campaign
              </Text>
              <Text fontSize="sm" color="fg.tertiary" style={{ display: "block", marginBottom: 40, fontStyle: "italic" }}>
                Campaign creative brief · Q3 · v2 (updated)
              </Text>

              {/* Section */}
              <Text color="fg.default" style={{ fontSize: 20, fontWeight: 700, display: "block", marginBottom: 8, marginTop: 32 }}>
                What is the Color Stories campaign?
              </Text>
              <Text fontSize="md" color="fg.secondary" style={{ display: "block", lineHeight: 1.7, marginBottom: 16 }}>
                Color Stories is the Q3 hero launch campaign for our new seasonal makeup collection — a bold, editorial-first visual narrative designed to resonate with Gen Z audiences across TikTok, Instagram Reels, and Pinterest. It is not a product list; it is a mood.
              </Text>

              <Text color="fg.default" style={{ fontSize: 20, fontWeight: 700, display: "block", marginBottom: 8, marginTop: 32 }}>
                What products does it feature?
              </Text>
              <Text fontSize="md" color="fg.secondary" style={{ display: "block", lineHeight: 1.7, marginBottom: 16 }}>
                The campaign leads with three hero SKUs: the <strong style={{ color: "var(--ax-colors-fg-default)", fontWeight: 600 }}>Velvet Luxe Lip Collection</strong> (12 new shades), the <strong style={{ color: "var(--ax-colors-fg-default)", fontWeight: 600 }}>Chromatic Eye Palette</strong> in Dusk and Dawn editions, and the <strong style={{ color: "var(--ax-colors-fg-default)", fontWeight: 600 }}>Illuminating Skin Tint</strong> in 8 inclusive shades.
              </Text>

              <Text color="fg.default" style={{ fontSize: 20, fontWeight: 700, display: "block", marginBottom: 8, marginTop: 32 }}>
                Who is the target audience?
              </Text>
              {/* Raj's cursor sits here */}
              <Text fontSize="md" color="fg.secondary" style={{ display: "block", lineHeight: 1.7, marginBottom: 16 }}>
                Beauty-curious 18–28 year olds who follow creators, not brands. They value authenticity, shade range, and editorial aesthetic — and they share content that feels genuinely them. Shade inclusivity and sustainable packaging are non-negotiable signals of trust for this cohort.
              </Text>

              <Text color="fg.default" style={{ fontSize: 20, fontWeight: 700, display: "block", marginBottom: 8, marginTop: 32 }}>
                What is the creative concept?
              </Text>
              <Text fontSize="md" color="fg.secondary" style={{ display: "block", lineHeight: 1.7, marginBottom: 16 }}>
                Each look is a "color story" — a three-product editorial pairing built around a unified mood: <em>warm terracotta</em>, <em>cool chrome</em>, or <em>deep plum</em>. Creator-led content anchors the campaign, with paid media using the same look-by-look visual language to maintain aesthetic coherence across the funnel.
              </Text>

              <Text color="fg.default" style={{ fontSize: 20, fontWeight: 700, display: "block", marginBottom: 8, marginTop: 32 }}>
                Where will it run?
              </Text>
              <Text fontSize="md" color="fg.secondary" style={{ display: "block", lineHeight: 1.7, marginBottom: 4 }}>
                <strong style={{ color: "var(--ax-colors-fg-default)", fontWeight: 600 }}>Primary:</strong> TikTok (organic + paid), Instagram Reels.
              </Text>
              <Text fontSize="md" color="fg.secondary" style={{ display: "block", lineHeight: 1.7, marginBottom: 16 }}>
                <strong style={{ color: "var(--ax-colors-fg-default)", fontWeight: 600 }}>Secondary:</strong> Pinterest boards, email editorial, in-store lookbook inserts.
              </Text>

              <Text color="fg.default" style={{ fontSize: 20, fontWeight: 700, display: "block", marginBottom: 8, marginTop: 32 }}>
                What does success look like?
              </Text>
              <Text fontSize="md" color="fg.secondary" style={{ display: "block", lineHeight: 1.7, marginBottom: 16 }}>
                15M organic impressions in first 30 days · 8%+ save rate on editorial posts · 3× ROAS on paid media · 40% of traffic from creator referral. Secondary KPI: hero SKU sell-through ≥ 70% within 6 weeks of launch.
              </Text>

              <Text color="fg.default" style={{ fontSize: 20, fontWeight: 700, display: "block", marginBottom: 8, marginTop: 32 }}>
                What is the production timeline?
              </Text>
              <Text fontSize="md" color="fg.secondary" style={{ display: "block", lineHeight: 1.7, marginBottom: 8 }}>
                Creative shoot: <strong style={{ color: "var(--ax-colors-fg-default)", fontWeight: 600 }}>June 3–5</strong> · Creator seeding: <strong style={{ color: "var(--ax-colors-fg-default)", fontWeight: 600 }}>June 12</strong> · Paid media live: <strong style={{ color: "var(--ax-colors-fg-default)", fontWeight: 600 }}>June 24</strong> · Full campaign launch: <strong style={{ color: "var(--ax-colors-fg-default)", fontWeight: 600 }}>July 1</strong>.
              </Text>

            </Box>
          </Box>

          {/* Status bar */}
          <Box
            px="20"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            style={{
              borderTop: "1px solid var(--ax-colors-border-default)",
              background: "var(--ax-colors-bg-secondary)",
              flexShrink: 0,
              height: 28,
            }}
          >
            <Text fontSize="xs" color="fg.tertiary">{filename}</Text>
            <Text fontSize="xs" color="fg.tertiary">Markdown · UTF-8</Text>
          </Box>
        </Box>

        {/* ── Opal chat pane ── */}
        <Box
          display="flex"
          flexDirection="column"
          overflow="hidden"
          style={{ width: 360, flexShrink: 0, borderLeft: "1px solid var(--ax-colors-border-default)", background: "#F9FCF8" }}
        >
          {/* Header */}
          <Box
            px="16"
            py="10"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            style={{ borderBottom: "1px solid var(--ax-colors-border-default)", flexShrink: 0 }}
          >
            <Group gap="8" alignItems="center">
              <Button appearance="subtle" size="sm" icon={<IconMessageLines />} aria-label="Menu" />
              <Button appearance="subtle" size="sm" icon={<IconPlus />} aria-label="New" />
            </Group>
            <Group gap="4" alignItems="center">
              <Text fontSize="md" fontWeight="500" color="fg.default">Opal</Text>
              <IconAngleDown size={14} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
            </Group>
          </Box>

          {/* Messages */}
          <Box flex="1" overflow="auto" className="opal-chat-scroll" px="16" py="16" display="flex" flexDirection="column" gap="20">

            {/* Henry VAU — text */}
            <Box display="flex" gap="10" alignItems="start">
              <VAUPulseAvatar actor={{ name: "Henry", initials: "H", bg: "#9b6fd4", isVT: true, photoUrl: "/avatars/vau-henry.png?v=2" }} size={32} />
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Group gap="6" alignItems="center" mb="4">
                  <Text fontSize="sm" fontWeight="600" color="fg.default">Henry</Text>
                  <Badge intent="success" variant="subtle" style={{ background: "#EFF5EB", color: "#202320" }}>
                    <Group gap="2" alignItems="center" asChild>
                      <span><IconSparkles size={9} />Virtual Teammate</span>
                    </Group>
                  </Badge>
                  <Text fontSize="xs" color="fg.tertiary">10:42</Text>
                </Group>
                <Text fontSize="sm" color="fg.secondary" style={{ lineHeight: 1.6 }}>
                  Campaign brief is updated with all 7 sections — Gen Z positioning, channel split, and the production timeline are all locked. Ready for your review.
                </Text>
                <Group gap="8" alignItems="center" mt="8">
                  <Button appearance="subtle" size="sm" icon={<IconArrowRotateLeft />} aria-label="Regenerate" />
                  <Button appearance="subtle" size="sm" icon={<IconCopy />} aria-label="Copy" />
                  <Button appearance="subtle" size="sm" icon={<IconThumbsUp />} aria-label="Good" />
                  <Button appearance="subtle" size="sm" icon={<IconThumbsDown />} aria-label="Bad" />
                </Group>
              </Box>
            </Box>

            {/* Henry VAU — artifact card */}
            <Box display="flex" gap="10" alignItems="start">
              <VAUPulseAvatar actor={{ name: "Henry", initials: "H", bg: "#9b6fd4", isVT: true, photoUrl: "/avatars/vau-henry.png?v=2" }} size={32} />
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Group gap="6" alignItems="center" mb="8">
                  <Text fontSize="sm" fontWeight="600" color="fg.default">Henry</Text>
                  <Badge intent="success" variant="subtle" style={{ background: "#EFF5EB", color: "#202320" }}>
                    <Group gap="2" alignItems="center" asChild>
                      <span><IconSparkles size={9} />Virtual Teammate</span>
                    </Group>
                  </Badge>
                  <Text fontSize="xs" color="fg.tertiary">10:44</Text>
                </Group>
                {/* Artifact card */}
                <Box
                  rounded="lg"
                  style={{ border: "1px solid var(--ax-colors-border-default)", background: "var(--ax-colors-bg-default)", overflow: "hidden" }}
                >
                  <Box px="12" py="12" display="flex" alignItems="center" justifyContent="space-between">
                    <Group gap="10" alignItems="center">
                      <Box
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: "var(--ax-colors-bg-accent-subtle)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <IconCode size={16} style={{ color: "#2a6240" }} />
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="600" color="fg.default" style={{ display: "block" }}>color-stories-brief.md</Text>
                        <Text fontSize="xs" color="fg.tertiary">Campaign brief · 7 sections · updated</Text>
                      </Box>
                    </Group>
                    <Button appearance="subtle" size="sm" icon={<IconArrowUpRightFromSquare />} aria-label="Open" />
                  </Box>
                  <Box
                    px="12"
                    py="10"
                    display="flex"
                    alignItems="center"
                    gap="8"
                    style={{ borderTop: "1px solid var(--ax-colors-border-default)" }}
                  >
                    <Button appearance="subtle" size="sm" icon={<IconPen />} style={{ flex: 1, justifyContent: "center" }}>Edit in Canvas</Button>
                    <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)" }} />
                    <Button appearance="subtle" size="sm" icon={<IconCopy />} aria-label="Copy" />
                    <Button appearance="subtle" size="sm" icon={<IconDownload />} aria-label="Download" />
                    <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)" }} />
                    <Button appearance="subtle" size="sm" icon={<IconThumbsUp />} aria-label="Good" />
                    <Button appearance="subtle" size="sm" icon={<IconThumbsDown />} aria-label="Bad" />
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Henry VAU — approval */}
            <Box display="flex" gap="10" alignItems="start">
              <VAUPulseAvatar actor={{ name: "Henry", initials: "H", bg: "#9b6fd4", isVT: true, photoUrl: "/avatars/vau-henry.png?v=2" }} size={32} />
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Group gap="6" alignItems="center" mb="8">
                  <Text fontSize="sm" fontWeight="600" color="fg.default">Henry</Text>
                  <Badge intent="success" variant="subtle" style={{ background: "#EFF5EB", color: "#202320" }}>
                    <Group gap="2" alignItems="center" asChild>
                      <span><IconSparkles size={9} />Virtual Teammate</span>
                    </Group>
                  </Badge>
                  <Text fontSize="xs" color="fg.tertiary">10:45</Text>
                </Group>
                <Box
                  rounded="lg"
                  style={{ border: "1px solid var(--ax-colors-border-default)", background: "var(--ax-colors-bg-default)", overflow: "hidden" }}
                >
                  <Box px="16" py="12">
                    <Text fontSize="md" fontWeight="600" color="fg.default" style={{ display: "block" }}>color-stories-brief.md</Text>
                    <Text fontSize="sm" color="fg.secondary" mt="2" style={{ display: "block" }}>Campaign creative brief</Text>
                  </Box>
                  <Separator />
                  <Box px="16" py="12">
                    <Box px="12" py="10" rounded="md" style={{ background: "var(--ax-colors-bg-secondary)" }}>
                      <Text fontSize="sm" fontWeight="600" color="fg.default" mb="4" style={{ display: "block" }}>Team approval needed</Text>
                      <Text fontSize="sm" color="fg.secondary" style={{ lineHeight: 1.55 }}>
                        Review the updated campaign brief. Approve to proceed with content production, or request further changes.
                      </Text>
                    </Box>
                    <Group gap="8" alignItems="center" justifyContent="end" mt="12">
                      <Button appearance="subtle" size="sm">Request Changes</Button>
                      <Button appearance="primary" size="sm" icon={<IconCheck />}>Approve</Button>
                    </Group>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Raj human reply */}
            <Box display="flex" gap="10" alignItems="start">
              <CircleAvatar initials="RP" bg="#5b7fa6" src="https://i.pravatar.cc/96?img=52" size={32} />
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Group gap="6" alignItems="center" mb="4">
                  <Text fontSize="sm" fontWeight="600" color="fg.default">Raj</Text>
                  <Text fontSize="xs" color="fg.tertiary">10:48</Text>
                </Group>
                <Text fontSize="sm" color="fg.secondary" style={{ lineHeight: 1.6 }}>
                  Reviewing now — the color palette section looks strong. Just leaving a note on the audience copy.
                </Text>
              </Box>
            </Box>

          </Box>

          {/* Chat input */}
          <Box
            px="12"
            py="10"
            style={{ borderTop: "1px solid var(--ax-colors-border-default)", flexShrink: 0 }}
          >
            <Box
              rounded="lg"
              style={{ border: "1px solid var(--ax-colors-border-default)", background: "var(--ax-colors-bg-default)", overflow: "hidden" }}
            >
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Collaborate with your team"
                style={{ border: "none", resize: "none", background: "transparent", padding: "10px 14px", fontSize: 14, minHeight: 44, outline: "none" }}
              />
              <Box
                px="10"
                py="8"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                style={{ borderTop: "1px solid var(--ax-colors-border-default)" }}
              >
                <Group gap="2" alignItems="center">
                  <Button appearance="subtle" size="sm" icon={<IconPlus />} aria-label="Attach" />
                  <Button appearance="subtle" size="sm" icon={<IconBold />} aria-label="Format" />
                </Group>
                <Button
                  appearance="primary"
                  size="sm"
                  icon={<IconPaperPlaneTop />}
                  aria-label="Send"
                  disabled={!draft.trim()}
                />
              </Box>
            </Box>
            <Text fontSize="xs" color="fg.tertiary" style={{ display: "block", textAlign: "center", marginTop: 6 }}>
              Opal can make mistakes. Double-check its responses.
            </Text>
          </Box>
        </Box>
      </Box>

      {/* ── Enhance with Opal overlays (fixed, above everything) ── */}
      {selMeta && enhancePhase === "idle" && (
        <FloatingSelectionToolbar selMeta={selMeta} phase={enhancePhase} onEnhance={handleEnhance} />
      )}
      {selMeta && enhancePhase === "loading" && (
        <>
          <FloatingSelectionToolbar selMeta={selMeta} phase={enhancePhase} onEnhance={handleEnhance} />
          <SelectionShimmer rect={selMeta.rect} />
        </>
      )}
      {selMeta && enhancePhase === "diff" && diffData && (
        <EnhanceDiffCard
          selMeta={selMeta}
          diffData={diffData}
          onAccept={handleAccept}
          onReject={handleReject}
          onTryAgain={handleTryAgain}
        />
      )}
    </Box>
  );
}

// ── Plus Picker ───────────────────────────────────────────────────────────────

function PlusPickerRow({ icon, label, description, onClick }: { icon: React.ReactNode; label: string; description: string; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <Box
      rounded="lg"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        cursor: "pointer",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "10px 12px",
        background: hov ? "#EEF5EA" : "transparent",
        transition: "background 100ms ease",
      }}
    >
      <Box style={{ width: 34, height: 34, borderRadius: 8, background: "#EEF5EA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#2a6240" }}>
        {icon}
      </Box>
      <Box style={{ minWidth: 0, paddingTop: 2 }}>
        <Text fontSize="sm" fontWeight="500" color="fg.default" style={{ display: "block", lineHeight: 1.4 }}>{label}</Text>
        <Text fontSize="xs" color="fg.tertiary" style={{ display: "block", lineHeight: 1.4, marginTop: 2 }}>{description}</Text>
      </Box>
    </Box>
  );
}

function PlusPicker({ anchorEl, onNewProject, onNewDM, onNewVAU }: { anchorEl: HTMLElement | null; onNewProject: () => void; onNewDM: () => void; onNewVAU: () => void }) {
  const rect = anchorEl?.getBoundingClientRect();
  const top = rect ? rect.bottom + 6 : 0;
  const right = rect ? window.innerWidth - rect.right : 0;

  return (
    <Box
      style={{
        position: "fixed",
        top,
        right,
        width: 300,
        zIndex: 1000,
        background: "var(--ax-colors-bg-default)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.07)",
        borderRadius: 12,
        border: "1px solid var(--ax-colors-border-default)",
        padding: 6,
      }}
    >
      {/* Connector pointer */}
      <Box style={{ position: "absolute", top: -7, right: 14, width: 14, height: 8, overflow: "hidden" }}>
        <Box style={{ position: "absolute", top: 2, left: "50%", transform: "translateX(-50%) rotate(45deg)", width: 10, height: 10, background: "var(--ax-colors-bg-default)", border: "1px solid var(--ax-colors-border-default)", borderRadius: 2 }} />
      </Box>

      <PlusPickerRow icon={<IconFolderOpen size={16} />} label="Start a new project" description="A workspace with artifacts, files, and chat" onClick={onNewProject} />
      <PlusPickerRow icon={<IconMessageLines size={16} />} label="Start a direct message" description="Chat with one or more people" onClick={onNewDM} />
      <PlusPickerRow icon={<IconSparkles size={16} />} label="Ask a virtual teammate" description="Quick chat with one of your VAUs" onClick={onNewVAU} />
    </Box>
  );
}

// ── New Project modal ─────────────────────────────────────────────────────────

function NewProjectModal({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (v: boolean) => void; onConfirm: (name: string, desc: string) => void }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    if (!open) { setName(""); setDesc(""); }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>Start a new project</DialogHeader>
        <DialogForm onSubmit={(e) => { e.preventDefault(); if (name.trim()) { onConfirm(name.trim(), desc.trim()); } }}>
          <DialogBody>
            <Group flexDirection="column" gap="16" alignItems="stretch">
              <Field label="Project name" required>
                <Input placeholder="e.g., Q4 Campaign" value={name} onValueChange={setName} required autoFocus />
              </Field>
              <Field label="Description" description="Optional — a short note about what this project is for.">
                <Textarea placeholder="What is this project for?" value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} />
              </Field>
            </Group>
          </DialogBody>
          <DialogFooter>
            <Button appearance="subtle" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button appearance="primary" type="submit" disabled={!name.trim()}>Create project</Button>
          </DialogFooter>
        </DialogForm>
      </DialogContent>
    </Dialog>
  );
}

// ── Start DM modal ────────────────────────────────────────────────────────────

const FREQUENT_IDS = ["sofia", "frank", "henry", "daniel"];

function NewDMModal({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (v: boolean) => void; onConfirm: (ids: string[]) => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) { setQuery(""); setSelected(new Set()); }
    else setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const toggle = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const filtered = DM_CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );
  const frequents = query ? [] : DM_CONTACTS.filter((c) => FREQUENT_IDS.includes(c.id));
  const allPeople = query ? filtered : DM_CONTACTS.filter((c) => !FREQUENT_IDS.includes(c.id));

  const PersonRow = ({ contact }: { contact: DMContact }) => {
    const sel = selected.has(contact.id);
    return (
      <Box
        onClick={() => toggle(contact.id)}
        display="flex"
        alignItems="center"
        gap="10"
        px="12"
        py="8"
        rounded="lg"
        style={{ cursor: "pointer", background: sel ? "#EEF5EA" : "transparent", transition: "background 100ms ease" }}
        onMouseEnter={(e) => { if (!sel) (e.currentTarget as HTMLElement).style.background = "#F5F8F3"; }}
        onMouseLeave={(e) => { if (!sel) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      >
        <Box style={{ position: "relative", flexShrink: 0 }}>
          <CircleAvatar initials={contact.initials} bg={contact.bg} src={contact.photoUrl} size={32} />
        </Box>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group gap="6" alignItems="center">
            <Text fontSize="sm" fontWeight="500" color="fg.default">{contact.name}</Text>
            {contact.isVT && (
              <Box px="4" py="2" rounded="full" style={{ background: "#EEF5EA", display: "inline-flex" }}>
                <Text fontSize="xs" fontWeight="500" style={{ color: "#2a6240", letterSpacing: "0.04em" }}>VAU</Text>
              </Box>
            )}
          </Group>
          {contact.role && <Text fontSize="xs" color="fg.tertiary" style={{ display: "block" }}>{contact.role}</Text>}
        </Box>
        {sel && <IconCheck size={16} style={{ color: "#2a6240", flexShrink: 0 }} />}
      </Box>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: 420 }}>
        <DialogHeader>Start a direct message</DialogHeader>
        <DialogBody style={{ padding: 0 }}>
          {/* Search */}
          <Box px="20" pb="12" style={{ borderBottom: "1px solid var(--ax-colors-border-default)" }}>
            <Box display="flex" alignItems="center" gap="8" px="12" py="8" rounded="lg" style={{ background: "var(--ax-colors-bg-secondary)" }}>
              <IconSearch size={14} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find someone to message…"
                style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 14, color: "var(--ax-colors-fg-default)" }}
              />
            </Box>
          </Box>

          {/* People list */}
          <Box style={{ maxHeight: 320, overflowY: "auto" }} className="opal-chat-scroll">
            {frequents.length > 0 && (
              <Box px="12" pt="12" pb="4">
                <Text fontSize="xs" fontWeight="500" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: "0.07em", paddingLeft: 12, display: "block", marginBottom: 4 }}>Frequent</Text>
                {frequents.map((c) => <PersonRow key={c.id} contact={c} />)}
              </Box>
            )}
            <Box px="12" pt={frequents.length > 0 ? "8" : "12"} pb="12">
              {!query && <Text fontSize="xs" fontWeight="500" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: "0.07em", paddingLeft: 12, display: "block", marginBottom: 4 }}>All people</Text>}
              {allPeople.map((c) => <PersonRow key={c.id} contact={c} />)}
              {query && filtered.length === 0 && (
                <Box px="12" py="16" display="flex" alignItems="center" justifyContent="center">
                  <Text fontSize="sm" color="fg.tertiary">No results for "{query}"</Text>
                </Box>
              )}
            </Box>
          </Box>
        </DialogBody>
        <DialogFooter>
          <Button appearance="subtle" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button appearance="primary" disabled={selected.size === 0} onClick={() => onConfirm(Array.from(selected))}>
            Start chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Ask VAU modal ─────────────────────────────────────────────────────────────

function NewVAUModal({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (v: boolean) => void; onConfirm: (id: string) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const vaus = DM_CONTACTS.filter((c) => c.isVT);

  useEffect(() => {
    if (!open) setSelectedId(null);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: 380 }}>
        <DialogHeader>Which teammate?</DialogHeader>
        <DialogBody style={{ padding: 0 }}>
          <Box px="12" py="8" style={{ maxHeight: 340, overflowY: "auto" }} className="opal-chat-scroll">
            {vaus.map((vau) => {
              const sel = selectedId === vau.id;
              return (
                <Box
                  key={vau.id}
                  onClick={() => setSelectedId(vau.id)}
                  display="flex"
                  alignItems="center"
                  gap="12"
                  px="12"
                  py="10"
                  rounded="lg"
                  style={{ cursor: "pointer", background: sel ? "#EEF5EA" : "transparent", transition: "background 100ms ease" }}
                  onMouseEnter={(e) => { if (!sel) (e.currentTarget as HTMLElement).style.background = "#F5F8F3"; }}
                  onMouseLeave={(e) => { if (!sel) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <VAUPulseAvatar actor={{ name: vau.name, initials: vau.initials, bg: vau.bg, isVT: true, photoUrl: vau.photoUrl }} size={38} />
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Group gap="6" alignItems="center">
                      <Text fontSize="sm" fontWeight="500" color="fg.default">{vau.name}</Text>
                      <Box px="4" py="2" rounded="full" style={{ background: "#EEF5EA" }}>
                        <Text fontSize="xs" fontWeight="500" style={{ color: "#2a6240", letterSpacing: "0.04em" }}>VAU</Text>
                      </Box>
                    </Group>
                    {vau.role && <Text fontSize="xs" color="fg.tertiary" style={{ display: "block" }}>{vau.role}</Text>}
                  </Box>
                  {sel && <IconCheck size={16} style={{ color: "#2a6240", flexShrink: 0 }} />}
                </Box>
              );
            })}
          </Box>
        </DialogBody>
        <DialogFooter>
          <Button appearance="subtle" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button appearance="primary" disabled={!selectedId} onClick={() => selectedId && onConfirm(selectedId)}>
            Start chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function LayoutCAna() {
  const [activeId, setActiveId] = useState<string>("q3");

  // Dynamic projects — start from static data, new ones are appended
  const [extraGroups, setExtraGroups] = useState<GroupChat[]>([]);
  const allGroups = [...GROUP_CHATS, ...extraGroups];

  const activeDM = DM_CONTACTS.find((c) => c.id === activeId);
  const [chatWidth, setChatWidth] = useState(380);
  const [isDragging, setIsDragging] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(true);
  const [workspaceCollapsed, setWorkspaceCollapsed] = useState(false);

  // Plus picker + creation flows
  const [plusPickerOpen, setPlusPickerOpen] = useState(false);
  const plusPickerRef = useRef<HTMLDivElement>(null);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newDMOpen, setNewDMOpen] = useState(false);
  const [newVAUOpen, setNewVAUOpen] = useState(false);

  // Click-outside to close picker
  useEffect(() => {
    if (!plusPickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (plusPickerRef.current && !plusPickerRef.current.contains(e.target as Node)) {
        setPlusPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [plusPickerOpen]);

  const handleCreateProject = (name: string, desc: string) => {
    const id = `proj-${Date.now()}`;
    const colors = ["#5b7fa6", "#4a9e7a", "#7c6fad", "#c97c3a", "#b25c5c"];
    const color = colors[extraGroups.length % colors.length];
    const newGroup: GroupChat = {
      id,
      name,
      initials: name.slice(0, 2).toUpperCase(),
      bg: color,
      subtitle: "Just you",
      description: desc || undefined,
    };
    setExtraGroups((prev) => [...prev, newGroup]);
    setActiveId(id);
    setNewProjectOpen(false);
  };

  const handleStartDM = (ids: string[]) => {
    if (ids.length === 1) setActiveId(ids[0]);
    setNewDMOpen(false);
  };

  const handleStartVAU = (id: string) => {
    setActiveId(id);
    setNewVAUOpen(false);
  };
  const [openArtifactId, setOpenArtifactId] = useState<string | null>(null);

  // Dynamic pin state — seeded from static pinned:true fields
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    DM_CONTACTS.filter((c) => c.pinned).forEach((c) => ids.add(c.id));
    GROUP_CHATS.filter((g) => g.pinned).forEach((g) => ids.add(g.id));
    return ids;
  });
  const togglePin = (id: string) =>
    setPinnedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      const next = window.innerWidth - e.clientX;
      setChatWidth(Math.max(280, Math.min(720, next)));
    };
    const onUp = () => setIsDragging(false);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]);

  return (
    <Box display="flex" h="full" overflow="hidden" style={{ background: "var(--ax-colors-bg-default)" }}>

      {/* ── Left panel ────────────────────────────────────────────────────── */}
      <Box
        display="flex"
        flexDirection="column"
        overflow="hidden"
        style={{
          width: leftCollapsed ? 0 : navCollapsed ? 56 : 280,
          flexShrink: 0,
          background: "#FFFFFF",
          borderLeft: leftCollapsed ? "none" : "1px solid var(--ax-colors-border-default)",
          borderRight: leftCollapsed ? "none" : "1px solid var(--ax-colors-border-default)",
          transition: "width 200ms ease",
        }}
      >
        {navCollapsed ? (
          /* ── Collapsed rail — avatars only ── */
          <Box display="flex" flexDirection="column" alignItems="center" pt="12" pb="12" gap="4" style={{ width: 56, overflow: "hidden" }}>
            {/* Expand toggle */}
            <Tooltip content="Expand sidebar" delayDuration={300}>
              <Button
                appearance="subtle"
                size="sm"
                icon={<IconChevronRight />}
                aria-label="Expand sidebar"
                onClick={() => setNavCollapsed(false)}
                style={{ marginBottom: 8 }}
              />
            </Tooltip>
            {/* All contacts/projects as avatar dots */}
            {(() => {
              const allItems: { id: string; avatar: React.ReactNode }[] = [];
              // pinned projects
              allGroups.filter((g) => pinnedIds.has(g.id)).forEach((g) => {
                allItems.push({ id: g.id, avatar: <ProjectGlyph initials={g.initials} bg={g.bg} size={32} /> });
              });
              // pinned DMs
              DM_CONTACTS.filter((c) => pinnedIds.has(c.id)).forEach((c) => {
                allItems.push({ id: c.id, avatar: c.isVT
                  ? <VAUPulseAvatar actor={c} size={32} />
                  : <CircleAvatar initials={c.initials} bg={c.bg} src={c.photoUrl} size={32} status={c.status} /> });
              });
              // projects
              allGroups.filter((g) => !pinnedIds.has(g.id)).forEach((g) => {
                allItems.push({ id: g.id, avatar: <ProjectGlyph initials={g.initials} bg={g.bg} size={32} /> });
              });
              // VTs
              DM_CONTACTS.filter((c) => c.isVT && !pinnedIds.has(c.id)).forEach((c) => {
                allItems.push({ id: c.id, avatar: <VAUPulseAvatar actor={c} size={32} /> });
              });
              // humans
              DM_CONTACTS.filter((c) => !c.isVT && !pinnedIds.has(c.id)).forEach((c) => {
                allItems.push({ id: c.id, avatar: <CircleAvatar initials={c.initials} bg={c.bg} src={c.photoUrl} size={32} status={c.status} /> });
              });
              return allItems.map(({ id, avatar }) => (
                <Tooltip key={id} content={
                  DM_CONTACTS.find((c) => c.id === id)?.name ??
                  allGroups.find((g) => g.id === id)?.name ?? id
                } delayDuration={200}>
                  <Box
                    onClick={() => setActiveId(id)}
                    style={{
                      cursor: "pointer",
                      borderRadius: 8,
                      padding: 4,
                      background: activeId === id ? "#EFF5EB" : "transparent",
                      transition: "background 120ms ease",
                      flexShrink: 0,
                    }}
                  >
                    {avatar}
                  </Box>
                </Tooltip>
              ));
            })()}
          </Box>
        ) : (
          /* ── Expanded full sidebar ── */
          <>
            {/* Workspace header */}
            <Box px="8" py="12" display="flex" alignItems="center" justifyContent="space-between">
              <Text fontSize="md" fontWeight="500" color="fg.default" style={{ paddingLeft: 4 }}>
                Chat
              </Text>
              <Box display="flex" alignItems="center" gap="2">
                <Tooltip content="Collapse sidebar" delayDuration={300}>
                  <Button appearance="subtle" size="sm" icon={<IconChevronLeft />} aria-label="Collapse sidebar" onClick={() => setNavCollapsed(true)} />
                </Tooltip>
                {/* Anchored plus picker */}
                <Box ref={plusPickerRef}>
                  <Tooltip content="Start something new" delayDuration={300}>
                    <Button
                      appearance="subtle"
                      size="sm"
                      icon={<IconPlus />}
                      aria-label="Start something new"
                      onClick={() => setPlusPickerOpen((v) => !v)}
                    />
                  </Tooltip>
                  {plusPickerOpen && (
                    <PlusPicker
                      anchorEl={plusPickerRef.current}
                      onNewProject={() => { setPlusPickerOpen(false); setNewProjectOpen(true); }}
                      onNewDM={() => { setPlusPickerOpen(false); setNewDMOpen(true); }}
                      onNewVAU={() => { setPlusPickerOpen(false); setNewVAUOpen(true); }}
                    />
                  )}
                </Box>
              </Box>
            </Box>

            {/* Scrollable list */}
            <Box className="opal-chat-scroll" display="flex" flexDirection="column" overflow="auto" flex="1" px="8" pb="12">
              {(() => {
                const pinnedDMs = DM_CONTACTS.filter((c) => pinnedIds.has(c.id));
                const pinnedProjects = allGroups.filter((g) => pinnedIds.has(g.id));
                const pinnedCount = pinnedDMs.length + pinnedProjects.length;
                const virtualTeammates = DM_CONTACTS.filter((c) => c.isVT);
                const humanDMs = DM_CONTACTS.filter((c) => !c.isVT);

                return (
                  <>
                    {/* Pinned */}
                    <Disclosure defaultOpen>
                      <DisclosureTrigger>
                        <SectionHeader label="Pinned" count={pinnedCount} />
                      </DisclosureTrigger>
                      <DisclosureContent>
                        <Box display="flex" flexDirection="column" gap="2" pt="4" pb="8">
                          {pinnedProjects.map((g) => (
                            <ProjectRow key={g.id} group={{ ...g, pinned: pinnedIds.has(g.id) }} active={activeId === g.id} onClick={() => setActiveId(g.id)} onTogglePin={() => togglePin(g.id)} />
                          ))}
                          {pinnedDMs.map((c) => (
                            <DMRow key={c.id} contact={{ ...c, pinned: pinnedIds.has(c.id) }} active={activeId === c.id} onClick={() => setActiveId(c.id)} onTogglePin={() => togglePin(c.id)} />
                          ))}
                        </Box>
                      </DisclosureContent>
                    </Disclosure>

                    {/* Projects */}
                    <Disclosure defaultOpen>
                      <DisclosureTrigger>
                        <SectionHeader label="Projects" />
                      </DisclosureTrigger>
                      <DisclosureContent>
                        <Box display="flex" flexDirection="column" gap="2" pt="4" pb="8">
                          {allGroups.map((g) => (
                            <ProjectRow key={g.id} group={{ ...g, pinned: pinnedIds.has(g.id) }} active={activeId === g.id} onClick={() => setActiveId(g.id)} onTogglePin={() => togglePin(g.id)} />
                          ))}
                        </Box>
                      </DisclosureContent>
                    </Disclosure>

                    {/* Virtual Teammates */}
                    {virtualTeammates.length > 0 && (
                      <Disclosure defaultOpen>
                        <DisclosureTrigger>
                          <SectionHeader label="Virtual Teammates" count={virtualTeammates.length} />
                        </DisclosureTrigger>
                        <DisclosureContent>
                          <Box display="flex" flexDirection="column" gap="2" pt="4" pb="8">
                            {virtualTeammates.map((c) => (
                              <DMRow key={c.id} contact={{ ...c, pinned: pinnedIds.has(c.id) }} active={activeId === c.id} onClick={() => setActiveId(c.id)} onTogglePin={() => togglePin(c.id)} />
                            ))}
                          </Box>
                        </DisclosureContent>
                      </Disclosure>
                    )}

                    {/* Direct Messages */}
                    <Disclosure defaultOpen>
                      <DisclosureTrigger>
                        <SectionHeader label="Direct Messages" />
                      </DisclosureTrigger>
                      <DisclosureContent>
                        <Box display="flex" flexDirection="column" gap="2" pt="4" pb="8">
                          {humanDMs.map((c) => (
                            <DMRow key={c.id} contact={{ ...c, pinned: pinnedIds.has(c.id) }} active={activeId === c.id} onClick={() => setActiveId(c.id)} onTogglePin={() => togglePin(c.id)} />
                          ))}
                        </Box>
                      </DisclosureContent>
                    </Disclosure>
                  </>
                );
              })()}
            </Box>
          </>
        )}
      </Box>

      {/* ── Middle + Right: context-aware ───────────────────────────────── */}
      {activeDM ? (
        <DMChatView contact={activeDM} />
      ) : (() => {
        const activeGroup = allGroups.find((g) => g.id === activeId);
        return activeGroup ? (
          <>
            {!workspaceCollapsed && (
              <WorkspacePanel
                projectId={activeGroup.id}
                title={activeGroup.name}
                subtitle={activeGroup.description ?? activeGroup.subtitle}
                avatars={activeGroup.id === "q4" ? [
                  { initials: "DV", bg: "#6a8abf", src: "https://i.pravatar.cc/96?img=12" }, // Daniel
                  { initials: "YT", bg: "#8a6abf", src: "https://i.pravatar.cc/96?img=44" }, // Yuki
                  { initials: "F",  bg: "#3ecfb2", src: "/avatars/vau-frank.png?v=2" },      // Frank
                ] : [
                  { initials: "SA", bg: "#7c6fad", src: "https://i.pravatar.cc/96?img=47" }, // Sofia
                  { initials: "RP", bg: "#5b7fa6", src: "https://i.pravatar.cc/96?img=52" }, // Raj
                  { initials: "F",  bg: "#3ecfb2", src: "/avatars/vau-frank.png?v=2" },      // Frank
                ]}
                onToggleWorkspace={() => setWorkspaceCollapsed(true)}
                rightCollapsed={rightCollapsed}
                onToggleRight={() => setRightCollapsed((v) => !v)}
                onOpenArtifact={(id) => setOpenArtifactId(id)}
              />
            )}
            {workspaceCollapsed ? (
              <GroupChatPanel
                group={activeGroup}
                expanded
                onExpandWorkspace={() => setWorkspaceCollapsed(false)}
                onCollapse={() => setRightCollapsed(true)}
              />
            ) : (
              !rightCollapsed && (
                <>
                  <Box
                    role="separator"
                    aria-orientation="vertical"
                    onMouseDown={(e) => { e.preventDefault(); setIsDragging(true); }}
                    style={{
                      width: 6,
                      flexShrink: 0,
                      cursor: "col-resize",
                      background: isDragging ? "var(--ax-colors-bg-accent-subtle)" : "transparent",
                      borderLeft: "1px solid var(--ax-colors-border-default)",
                      position: "relative",
                      transition: isDragging ? "none" : "background 120ms ease",
                    }}
                    onMouseEnter={(e) => { if (!isDragging) (e.currentTarget as HTMLDivElement).style.background = "var(--ax-colors-bg-secondary)"; }}
                    onMouseLeave={(e) => { if (!isDragging) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    <Box style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 2, height: 28, borderRadius: 2, background: "var(--ax-colors-border-default)" }} />
                  </Box>
                  <GroupChatPanel group={activeGroup} width={chatWidth} onCollapse={() => setRightCollapsed(true)} />
                </>
              )
            )}
          </>
        ) : null;
      })()}

      {openArtifactId && (
        <CanvasOverlay artifactId={openArtifactId} onClose={() => setOpenArtifactId(null)} />
      )}

      {/* Creation flow modals */}
      <NewProjectModal
        open={newProjectOpen}
        onOpenChange={setNewProjectOpen}
        onConfirm={handleCreateProject}
      />
      <NewDMModal
        open={newDMOpen}
        onOpenChange={setNewDMOpen}
        onConfirm={handleStartDM}
      />
      <NewVAUModal
        open={newVAUOpen}
        onOpenChange={setNewVAUOpen}
        onConfirm={handleStartVAU}
      />
    </Box>
  );
}
