"use client";

import { useState, useEffect, useRef } from "react";
import { Box, Button, Text } from "@optiaxiom/react";
import {
  IconFileLines,
  IconCircleCheck,
  IconArrowRight,
  IconDatabase,
  IconTriangleExclamation,
  IconMagnifyingGlass,
  IconEnvelope,
  IconXmark,
} from "@optimizely/axiom-icons";
import type { ReactNode } from "react";

type ActivityAction = "review" | "open" | "undo" | null;

type ActivityItem = {
  id: string;
  icon: ReactNode;
  iconBg: string;
  iconColor?: string;
  action: string;
  subtitle?: string;
  project?: string;
  projectColor?: string;
  timeAgo: string;
  actionButton?: ActivityAction;
  artifactContent?: string;
};

type ActivityGroup = {
  label: string;
  items: ActivityItem[];
};

// ── Icon helpers ──────────────────────────────────────────────────────────────

function ActivityIcon({ icon, bg, color }: { icon: ReactNode; bg: string; color?: string }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      style={{
        width: 36,
        height: 36,
        borderRadius: 9,
        background: bg,
        flexShrink: 0,
        color: color ?? "var(--ax-colors-fg-secondary)",
      }}
    >
      {icon}
    </Box>
  );
}

// ── Mock data per VAU name ────────────────────────────────────────────────────

const FRANK_ACTIVITIES: ActivityGroup[] = [
  {
    label: "TODAY",
    items: [
      {
        id: "f1",
        icon: <IconFileLines size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Drafted discover-the-unknown-qa.md",
        subtitle: "GEO Q&A article · 7 Q&A pairs · updated",
        project: "Discover the Unknown",
        projectColor: "#4f46e5",
        timeAgo: "12m ago",
        actionButton: "review",
      },
      {
        id: "f2",
        icon: <IconMagnifyingGlass size={18} />,
        iconBg: "var(--ax-colors-bg-tertiary)",
        action: "Ran keyword cluster analysis",
        project: "Stride / GEO",
        projectColor: "#059669",
        timeAgo: "45m ago",
        actionButton: null,
      },
      {
        id: "f3",
        icon: <IconFileLines size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Updated SERP shift digest",
        subtitle: "14 position changes detected",
        project: "Stride / GEO",
        projectColor: "#059669",
        timeAgo: "1h ago",
        actionButton: "open",
      },
      {
        id: "f4",
        icon: <IconTriangleExclamation size={18} />,
        iconBg: "var(--ax-colors-bg-warning-subtle)",
        iconColor: "var(--ax-colors-fg-warning)",
        action: "Flagged topic gap: AI overview coverage",
        subtitle: "3 queries missing structured answer content",
        project: "Stride / GEO",
        projectColor: "#059669",
        timeAgo: "2h ago",
        actionButton: null,
      },
    ],
  },
  {
    label: "YESTERDAY",
    items: [
      {
        id: "f5",
        icon: <IconCircleCheck size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Completed schema audit",
        subtitle: "12 pages flagged for markup gaps",
        project: "Stride CMS",
        projectColor: "#0891b2",
        timeAgo: "1d ago",
        actionButton: "open",
      },
      {
        id: "f6",
        icon: <IconEnvelope size={18} />,
        iconBg: "var(--ax-colors-bg-tertiary)",
        action: "Sent weekly citation tracker",
        subtitle: "Sent to #seo-geo channel",
        project: "Stride / GEO",
        projectColor: "#059669",
        timeAgo: "1d ago",
        actionButton: null,
      },
      {
        id: "f7",
        icon: <IconArrowRight size={18} />,
        iconBg: "var(--ax-colors-bg-tertiary)",
        action: "Updated internal linking suggestions",
        project: "stride.com/discover",
        projectColor: "#7c3aed",
        timeAgo: "1d ago",
        actionButton: null,
      },
    ],
  },
];

const TONY_ACTIVITIES: ActivityGroup[] = [
  {
    label: "TODAY",
    items: [
      {
        id: "t1",
        icon: <IconTriangleExclamation size={18} />,
        iconBg: "var(--ax-colors-bg-warning-subtle)",
        iconColor: "var(--ax-colors-fg-warning)",
        action: "Flagged conversion drop on /pricing",
        subtitle: "–18% vs. 7-day avg · Variant B affected",
        project: "Stride Pricing",
        projectColor: "#d97706",
        timeAgo: "8m ago",
        actionButton: "review",
      },
      {
        id: "t2",
        icon: <IconFileLines size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Updated channel mix recommendation",
        subtitle: "Shifted +12% budget to paid social",
        project: "Q2 Media Plan",
        projectColor: "#059669",
        timeAgo: "1h ago",
        actionButton: "open",
      },
      {
        id: "t3",
        icon: <IconMagnifyingGlass size={18} />,
        iconBg: "var(--ax-colors-bg-tertiary)",
        action: "Ran landing page audit",
        subtitle: "7 friction points identified",
        project: "Stride / CRO",
        projectColor: "#0891b2",
        timeAgo: "2h ago",
        actionButton: null,
      },
    ],
  },
  {
    label: "YESTERDAY",
    items: [
      {
        id: "t4",
        icon: <IconCircleCheck size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Completed funnel teardown",
        subtitle: "Drop-off at checkout step 2 identified",
        project: "Q2 Funnel",
        projectColor: "#0891b2",
        timeAgo: "1d ago",
        actionButton: "open",
      },
      {
        id: "t5",
        icon: <IconEnvelope size={18} />,
        iconBg: "var(--ax-colors-bg-tertiary)",
        action: "Sent bid optimization brief",
        subtitle: "Google Search · 4 ad groups updated",
        project: "Paid Search",
        projectColor: "#d97706",
        timeAgo: "1d ago",
        actionButton: "undo",
      },
    ],
  },
];

const HENRY_ACTIVITIES: ActivityGroup[] = [
  {
    label: "TODAY",
    items: [
      {
        id: "h1",
        icon: <IconFileLines size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Drafted Stride Discover launch positioning",
        subtitle: "Messaging framework · 3 buyer segments",
        project: "Q3 Launch",
        projectColor: "#4f46e5",
        timeAgo: "20m ago",
        actionButton: "review",
      },
      {
        id: "h2",
        icon: <IconDatabase size={18} />,
        iconBg: "var(--ax-colors-bg-accent-subtle)",
        iconColor: "var(--ax-colors-fg-accent)",
        action: "Added competitor research to memory",
        subtitle: "Eventbrite, Spartan Race positioning",
        project: undefined,
        timeAgo: "1h ago",
        actionButton: null,
      },
      {
        id: "h3",
        icon: <IconFileLines size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Updated competitive positioning brief",
        subtitle: "Stride vs. Eventbrite — 2 new differentiators",
        project: "Q3 GTM",
        projectColor: "#7c3aed",
        timeAgo: "2h ago",
        actionButton: "open",
      },
    ],
  },
  {
    label: "YESTERDAY",
    items: [
      {
        id: "h4",
        icon: <IconCircleCheck size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Completed messaging framework refresh",
        subtitle: "3 personas · 5 value props updated",
        project: "Q3 GTM",
        projectColor: "#7c3aed",
        timeAgo: "1d ago",
        actionButton: null,
      },
      {
        id: "h5",
        icon: <IconEnvelope size={18} />,
        iconBg: "var(--ax-colors-bg-tertiary)",
        action: "Sent sales enablement kit",
        subtitle: "Sent to #sales-enablement",
        project: "Q3 Launch",
        projectColor: "#4f46e5",
        timeAgo: "1d ago",
        actionButton: "open",
      },
      {
        id: "h6",
        icon: <IconFileLines size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Drafted buyer persona update",
        subtitle: "Adventure Athlete · Corporate Team segments",
        project: "Q3 GTM",
        projectColor: "#7c3aed",
        timeAgo: "1d ago",
        actionButton: "open",
      },
    ],
  },
];

const POPPY_ACTIVITIES: ActivityGroup[] = [
  {
    label: "TODAY",
    items: [
      {
        id: "p1",
        icon: <IconFileLines size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Updated launch timeline",
        subtitle: "Q3 Discover — 4 dependencies resolved",
        project: "Q3 Launch",
        projectColor: "#4f46e5",
        timeAgo: "30m ago",
        actionButton: "review",
      },
      {
        id: "p2",
        icon: <IconEnvelope size={18} />,
        iconBg: "var(--ax-colors-bg-tertiary)",
        action: "Sent cross-team standup digest",
        subtitle: "Sent to #launch-q3",
        project: "Q3 Launch",
        projectColor: "#4f46e5",
        timeAgo: "1h ago",
        actionButton: "undo",
      },
      {
        id: "p3",
        icon: <IconTriangleExclamation size={18} />,
        iconBg: "var(--ax-colors-bg-warning-subtle)",
        iconColor: "var(--ax-colors-fg-warning)",
        action: "Flagged risk: content assets 3 days late",
        subtitle: "Creative team · design deliverable",
        project: "Q3 Launch",
        projectColor: "#4f46e5",
        timeAgo: "2h ago",
        actionButton: null,
      },
    ],
  },
  {
    label: "YESTERDAY",
    items: [
      {
        id: "p4",
        icon: <IconCircleCheck size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Completed launch readiness check",
        subtitle: "8/10 items green · 2 open",
        project: "Q3 Launch",
        projectColor: "#4f46e5",
        timeAgo: "1d ago",
        actionButton: "open",
      },
      {
        id: "p5",
        icon: <IconFileLines size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Updated rollout dependency map",
        subtitle: "CMS, CMP, and Paid channels mapped",
        project: "Q3 Launch",
        projectColor: "#4f46e5",
        timeAgo: "1d ago",
        actionButton: "open",
      },
    ],
  },
];

const KERBY_ACTIVITIES: ActivityGroup[] = [
  {
    label: "TODAY",
    items: [
      {
        id: "k1",
        icon: <IconFileLines size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Drafted outreach sequence for Accenture",
        subtitle: "5-step email + LinkedIn · 3 personas",
        project: "Target Accounts",
        projectColor: "#0891b2",
        timeAgo: "25m ago",
        actionButton: "review",
      },
      {
        id: "k2",
        icon: <IconDatabase size={18} />,
        iconBg: "var(--ax-colors-bg-accent-subtle)",
        iconColor: "var(--ax-colors-fg-accent)",
        action: "Refreshed target account list",
        subtitle: "12 accounts added · 3 removed",
        project: "ABM Q3",
        projectColor: "#0891b2",
        timeAgo: "1h ago",
        actionButton: null,
      },
      {
        id: "k3",
        icon: <IconTriangleExclamation size={18} />,
        iconBg: "var(--ax-colors-bg-warning-subtle)",
        iconColor: "var(--ax-colors-fg-warning)",
        action: "Flagged intent surge: Salesforce",
        subtitle: "3 contacts showing buying signals",
        project: "ABM Q3",
        projectColor: "#0891b2",
        timeAgo: "2h ago",
        actionButton: "open",
      },
    ],
  },
  {
    label: "YESTERDAY",
    items: [
      {
        id: "k4",
        icon: <IconCircleCheck size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Completed account heat map",
        subtitle: "Top 20 accounts scored",
        project: "ABM Q3",
        projectColor: "#0891b2",
        timeAgo: "1d ago",
        actionButton: "open",
      },
      {
        id: "k5",
        icon: <IconEnvelope size={18} />,
        iconBg: "var(--ax-colors-bg-tertiary)",
        action: "Sent sales handoff brief for Okta",
        subtitle: "Sent to #sales-enterprise",
        project: "Target Accounts",
        projectColor: "#0891b2",
        timeAgo: "1d ago",
        actionButton: "undo",
      },
    ],
  },
];

const JONAS_ACTIVITIES: ActivityGroup[] = [
  {
    label: "TODAY",
    items: [
      {
        id: "j1",
        icon: <IconFileLines size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Surfaced personalization opportunities",
        subtitle: "Homepage hero · 3 audience segments",
        project: "Stride Journey",
        projectColor: "#7c3aed",
        timeAgo: "15m ago",
        actionButton: "review",
      },
      {
        id: "j2",
        icon: <IconDatabase size={18} />,
        iconBg: "var(--ax-colors-bg-accent-subtle)",
        iconColor: "var(--ax-colors-fg-accent)",
        action: "Analyzed cohort behavior",
        subtitle: "Adventure Athlete segment · week-over-week",
        project: "Stride ODP",
        projectColor: "#0891b2",
        timeAgo: "1h ago",
        actionButton: null,
      },
      {
        id: "j3",
        icon: <IconFileLines size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Proposed A/B test: checkout CTA copy",
        subtitle: "Expected +4-8% conversion lift",
        project: "Stride / CRO",
        projectColor: "#0891b2",
        timeAgo: "2h ago",
        actionButton: "open",
      },
    ],
  },
  {
    label: "YESTERDAY",
    items: [
      {
        id: "j4",
        icon: <IconCircleCheck size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Completed journey friction report",
        subtitle: "Drop-off at step 3 of onboarding",
        project: "Stride Journey",
        projectColor: "#7c3aed",
        timeAgo: "1d ago",
        actionButton: "open",
      },
      {
        id: "j5",
        icon: <IconFileLines size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Groomed test backlog",
        subtitle: "8 hypotheses prioritized",
        project: "Stride / CRO",
        projectColor: "#0891b2",
        timeAgo: "1d ago",
        actionButton: null,
      },
    ],
  },
];

const MAYLING_ACTIVITIES: ActivityGroup[] = [
  {
    label: "TODAY",
    items: [
      {
        id: "m1",
        icon: <IconFileLines size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Drafted weekly social calendar",
        subtitle: "Instagram · LinkedIn · X · 14 posts",
        project: "Social May",
        projectColor: "#7c3aed",
        timeAgo: "10m ago",
        actionButton: "review",
      },
      {
        id: "m2",
        icon: <IconDatabase size={18} />,
        iconBg: "var(--ax-colors-bg-accent-subtle)",
        iconColor: "var(--ax-colors-fg-accent)",
        action: "Flagged trending topic: #AdventureChallenge",
        subtitle: "12K posts in 24h · brand fit: high",
        project: "Social May",
        projectColor: "#7c3aed",
        timeAgo: "45m ago",
        actionButton: null,
      },
      {
        id: "m3",
        icon: <IconFileLines size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Created post variants for Discover launch",
        subtitle: "Instagram + LinkedIn · 3 angles",
        project: "Q3 Launch",
        projectColor: "#4f46e5",
        timeAgo: "2h ago",
        actionButton: "open",
      },
    ],
  },
  {
    label: "YESTERDAY",
    items: [
      {
        id: "m4",
        icon: <IconCircleCheck size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Completed channel performance digest",
        subtitle: "LinkedIn outperforming by +22%",
        project: "Social May",
        projectColor: "#7c3aed",
        timeAgo: "1d ago",
        actionButton: "open",
      },
      {
        id: "m5",
        icon: <IconEnvelope size={18} />,
        iconBg: "var(--ax-colors-bg-tertiary)",
        action: "Sent influencer outreach list",
        subtitle: "8 creators · adventure niche",
        project: "Social May",
        projectColor: "#7c3aed",
        timeAgo: "1d ago",
        actionButton: "undo",
      },
    ],
  },
];

const PLT_PREREAD_HTML = `<h2>PLT Pre-read</h2><p class="doc-meta">Thu Jun 19 &middot; 10:00 AM &middot; 45 min &nbsp;&middot;&nbsp; Drafted by Chief of Staff</p><h3>&#x1F3AF; Purpose</h3><p>Three decisions need an owner and a recommendation before Thursday. This note frames each one so the room can decide, not deliberate.</p><h3>&#x1F4CB; Decision 1 &mdash; Positioning sign-off</h3><p><strong>Owner:</strong> You &nbsp;&middot;&nbsp; <strong>Due:</strong> Before the meeting<br>Mia has v2 ready. Sales is blocked at day 5. Approve or redline before Thursday — this can&apos;t go into the PLT open.</p><div class="status-row"><span style="flex:1">Current status</span><span class="pill pill-red">Day 5 carry</span></div><h3>&#x1F4CB; Decision 2 &mdash; Engineering scope</h3><p><strong>Owner:</strong> You + Alex &nbsp;&middot;&nbsp; <strong>Due:</strong> Before the meeting<br>&minus;4d on 2 modules. Options: cut scope, slip to Jul&nbsp;5, or add a contractor. Alex will present. Need a call before leadership hears it.</p><div class="status-row"><span style="flex:1">Jun 28 ship date</span><span class="pill pill-yellow">At risk</span></div><h3>&#x1F4CB; Decision 3 &mdash; Q3 GTM sequencing</h3><p><strong>Owner:</strong> You &nbsp;&middot;&nbsp; <strong>Due:</strong> During the meeting<br>Which workstream leads the launch narrative &mdash; Product or Marketing? Answer determines resourcing priority for the final 12 days.</p><div class="status-row"><span style="flex:1">Launch in</span><span class="pill pill-green">12 days</span></div><h3>&#x1F465; Attendees</h3><p>You &middot; Mia (Marketing) &middot; Alex (Engineering) &middot; Jamie (Product) &middot; Mary Anne (Sales) &middot; 2 others</p>`;

const ENG_RISK_HTML = `<h2>Engineering Scope Risk</h2><p class="doc-meta">Flagged Jun 16 &middot; Owner: Alex &middot; Escalation: Chief of Staff</p><h3>&#x26A0;&#xFE0F; Summary</h3><p>Engineering is 4 days behind on 2 modules. Jun 28 ship date is at risk without a scope or resource decision by Thursday PLT.</p><h3>&#x1F6A6; Module status</h3><div><div class="status-row"><span style="flex:1"><strong>Auth &amp; Onboarding</strong></span><span class="pill pill-yellow">&minus;2d behind</span></div><div class="status-row"><span style="flex:1"><strong>Data pipeline</strong></span><span class="pill pill-red">&minus;2d behind</span></div><div class="status-row"><span style="flex:1"><strong>Frontend / Discover</strong></span><span class="pill pill-green">On track</span></div></div><h3>&#x1F527; Options</h3><ol><li><strong>Cut scope</strong> &mdash; remove 2 lower-priority features; ship Jun 28 clean. Alex&apos;s preference.</li><li><strong>Slip to Jul 5</strong> &mdash; ship full feature set one week late. Impacts Marketing launch plan.</li><li><strong>Add resource</strong> &mdash; 1 contractor for 2 weeks. Cost: ~$8k. Decision needed today.</li></ol><h3>&#x23F0; Decision needed by</h3><p>Thursday PLT (Jun 19, 10am) — Alex needs confirmation to reprioritize the team. No decision = team stays on current path toward a missed date.</p>`;

const DECISION_LOG_HTML = `<h2>EOD Decision Log</h2><p class="doc-meta">Jun 15 &middot; End of day &middot; Logged by Chief of Staff</p><h3>&#x2705; Decisions logged today</h3><div><div class="status-row"><span style="flex:1"><strong>Hired Chief of Staff</strong></span><span class="pill pill-green">Done</span></div><div class="status-row"><span style="flex:1"><strong>Q2 budget reforecast</strong> &mdash; approved +$40k for paid social</span><span class="pill pill-green">Done</span></div></div><h3>&#x1F514; Follow-up flagged</h3><div><div class="status-row"><span style="flex:1"><strong>Positioning sign-off for Mia</strong> &mdash; no response yet</span><span class="pill pill-yellow">Day 1 carry</span></div></div><h3>&#x1F4DD; Notes</h3><p>PLT pre-read not yet distributed. Target: tomorrow morning before 9am. Mia&apos;s positioning v2 is in review — check Slack by noon.</p>`;

const COS_ACTIVITIES: ActivityGroup[] = [
  {
    label: "TODAY",
    items: [
      {
        id: "cos1",
        icon: <IconFileLines size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Generated daily brief",
        subtitle: "4 workstreams · 3 decisions · 3 meetings this week",
        project: "Stride Leadership",
        projectColor: "#4f46e5",
        timeAgo: "9:00 AM",
        actionButton: "review",
      },
      {
        id: "cos2",
        icon: <IconTriangleExclamation size={18} />,
        iconBg: "var(--ax-colors-bg-warning-subtle)",
        iconColor: "var(--ax-colors-fg-warning)",
        action: "Flagged positioning block — day 5 carry",
        subtitle: "Mia waiting on sign-off · unblocks Sales + Marketing",
        project: "Stride Q3 Launch",
        projectColor: "#059669",
        timeAgo: "9:01 AM",
        actionButton: null,
      },
      {
        id: "cos3",
        icon: <IconMagnifyingGlass size={18} />,
        iconBg: "var(--ax-colors-bg-tertiary)",
        action: "Pulled cross-team status",
        subtitle: "Product ✓ · Marketing ⚠ · Sales ⛔ · Engineering ⚠",
        project: "Stride Leadership",
        projectColor: "#4f46e5",
        timeAgo: "8:58 AM",
        actionButton: null,
      },
      {
        id: "cos4",
        icon: <IconFileLines size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Drafted PLT pre-read",
        subtitle: "3 decisions need framing before Thursday",
        project: "PLT Sync · Jun 19",
        projectColor: "#7c3aed",
        timeAgo: "8:55 AM",
        actionButton: "review",
        artifactContent: PLT_PREREAD_HTML,
      },
    ],
  },
  {
    label: "YESTERDAY",
    items: [
      {
        id: "cos5",
        icon: <IconEnvelope size={18} />,
        iconBg: "var(--ax-colors-bg-tertiary)",
        action: "Sent EOD decision log",
        subtitle: "2 decisions logged · 1 follow-up flagged",
        project: "Stride Leadership",
        projectColor: "#4f46e5",
        timeAgo: "1d ago",
        actionButton: null,
        artifactContent: DECISION_LOG_HTML,
      },
      {
        id: "cos6",
        icon: <IconTriangleExclamation size={18} />,
        iconBg: "var(--ax-colors-bg-warning-subtle)",
        iconColor: "var(--ax-colors-fg-warning)",
        action: "Flagged engineering scope risk",
        subtitle: "Jun 28 ship date at risk · −4d on 2 modules",
        project: "Engineering · Alex",
        projectColor: "#0891b2",
        timeAgo: "1d ago",
        actionButton: "open",
        artifactContent: ENG_RISK_HTML,
      },
      {
        id: "cos7",
        icon: <IconCircleCheck size={18} />,
        iconBg: "var(--ax-colors-bg-success-subtle)",
        iconColor: "var(--ax-colors-fg-success)",
        action: "Archived decisions: Jun 14 PLT",
        subtitle: "3 decisions logged · owners assigned",
        project: "Stride Leadership",
        projectColor: "#4f46e5",
        timeAgo: "1d ago",
        actionButton: null,
      },
    ],
  },
];

const ACTIVITIES_BY_VAU: Record<string, ActivityGroup[]> = {
  frank: FRANK_ACTIVITIES,
  tony: TONY_ACTIVITIES,
  henry: HENRY_ACTIVITIES,
  poppy: POPPY_ACTIVITIES,
  kerby: KERBY_ACTIVITIES,
  jonas: JONAS_ACTIVITIES,
  mayling: MAYLING_ACTIVITIES,
  timmy: COS_ACTIVITIES,
  "chief of staff": COS_ACTIVITIES,
};

// ── Action button labels ──────────────────────────────────────────────────────

const ACTION_LABELS: Record<NonNullable<ActivityAction>, string> = {
  review: "Review",
  open: "Open",
  undo: "Undo",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function IMActivityFeed({ vauName, vauTemplateKey, onOpenBrief }: { vauName?: string; vauTemplateKey?: string; onOpenBrief?: () => void }) {
  const key = vauTemplateKey?.toLowerCase() ?? vauName?.toLowerCase() ?? "";
  const groups = ACTIVITIES_BY_VAU[key] ?? ACTIVITIES_BY_VAU[vauName?.toLowerCase() ?? ""] ?? FRANK_ACTIVITIES;
  const [activeArtifact, setActiveArtifact] = useState<{ title: string; content: string } | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeArtifact) {
      rafRef.current = requestAnimationFrame(() => setPanelVisible(true));
    } else {
      setPanelVisible(false);
    }
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [activeArtifact]);

  function handleRowClick(item: ActivityItem) {
    if (item.id === "cos1" && onOpenBrief) { onOpenBrief(); return; }
    if (item.artifactContent) { setActiveArtifact({ title: item.action, content: item.artifactContent }); }
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      style={{ flex: 1, overflowY: "auto", padding: "24px 0", position: "relative" }}
    >
      <style>{`
        .activity-row { transition: background 120ms ease; cursor: pointer; }
        .activity-row:hover { background: var(--ax-colors-bg-secondary); }
        .cos-brief h2 { font-size: 17px; font-weight: 700; margin: 0 0 2px; color: var(--ax-colors-fg-default); }
        .cos-brief .doc-meta { font-size: 12px; color: var(--ax-colors-fg-tertiary); margin: 0 0 20px; }
        .cos-brief h3 { font-size: 13px; font-weight: 600; margin: 20px 0 8px; color: var(--ax-colors-fg-default); text-transform: uppercase; letter-spacing: 0.04em; }
        .cos-brief p { font-size: 13px; line-height: 1.6; color: var(--ax-colors-fg-secondary); margin: 0 0 10px; }
        .cos-brief ol, .cos-brief ul { font-size: 13px; line-height: 1.8; color: var(--ax-colors-fg-secondary); margin: 0 0 10px; padding-left: 0; list-style-position: inside; }
        .cos-brief li { margin-bottom: 2px; }
        .cos-brief strong { font-weight: 600; color: var(--ax-colors-fg-default); }
        .cos-brief .status-row { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--ax-colors-border-secondary); font-size: 13px; }
        .cos-brief .status-row:last-child { border-bottom: none; }
        .cos-brief .pill { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
        .cos-brief .pill-green { background: #dcfce7; color: #15803d; }
        .cos-brief .pill-yellow { background: #fef9c3; color: #854d0e; }
        .cos-brief .pill-red { background: #fee2e2; color: #b91c1c; }
      `}</style>

      {/* Artifact slide-in panel */}
      {activeArtifact && (
        <div
          style={{
            position: "absolute", top: 0, right: 0, bottom: 0, width: "100%",
            background: "var(--ax-colors-bg-default)",
            borderLeft: "1px solid var(--ax-colors-border-secondary)",
            zIndex: 10, overflowY: "auto", padding: "20px 24px",
            transform: panelVisible ? "translateX(0)" : "translateX(100%)",
            opacity: panelVisible ? 1 : 0,
            transition: "transform 200ms cubic-bezier(0.22,1,0.36,1), opacity 200ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <Text style={{ fontSize: 13, fontWeight: 600, color: "var(--ax-colors-fg-default)" }}>
              {activeArtifact.title}
            </Text>
            <button
              onClick={() => setActiveArtifact(null)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ax-colors-fg-tertiary)", padding: 4, display: "flex" }}
            >
              <IconXmark size={16} />
            </button>
          </div>
          <div className="cos-brief" dangerouslySetInnerHTML={{ __html: activeArtifact.content }} />
        </div>
      )}

      <Box style={{ maxWidth: 720, width: "100%", margin: "0 auto" }}>
      {groups.map((group) => (
        <Box key={group.label} display="flex" flexDirection="column" mb="24">
          {/* Section header */}
          <Text
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: "var(--ax-colors-fg-tertiary)",
              padding: "0 24px",
              marginBottom: 8,
            }}
          >
            {group.label}
          </Text>

          {/* Items */}
          {group.items.map((item) => (
            <Box
              key={item.id}
              className="activity-row"
              display="flex"
              alignItems="center"
              gap="12"
              onClick={() => handleRowClick(item)}
              style={{
                padding: "10px 24px",
                borderBottom: "1px solid var(--ax-colors-border-secondary)",
                minHeight: 52,
              }}
            >
              {/* Icon */}
              <ActivityIcon icon={item.icon} bg={item.iconBg} color={item.iconColor} />

              {/* Text block */}
              <Box display="flex" flexDirection="column" style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--ax-colors-fg-default)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.action}
                </Text>

                {/* Project tag + time */}
                <Box display="flex" alignItems="center" gap="6">
                  {item.project && (
                    <>
                      <Box
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 2,
                          background: item.projectColor ?? "var(--ax-colors-bg-accent)",
                          flexShrink: 0,
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          color: "var(--ax-colors-fg-secondary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.project}
                      </Text>
                      <Text style={{ fontSize: 12, color: "var(--ax-colors-fg-tertiary)" }}>·</Text>
                    </>
                  )}
                  <Text
                    style={{ fontSize: 12, color: "var(--ax-colors-fg-tertiary)", whiteSpace: "nowrap" }}
                  >
                    {item.timeAgo}
                  </Text>
                </Box>
              </Box>

              {/* Optional action button */}
              {item.actionButton && (
                <Button
                  appearance="subtle"
                  size="sm"
                  style={{ flexShrink: 0, fontWeight: 500 }}
                >
                  {ACTION_LABELS[item.actionButton]}
                </Button>
              )}
            </Box>
          ))}
        </Box>
      ))}
      </Box>
    </Box>
  );
}
