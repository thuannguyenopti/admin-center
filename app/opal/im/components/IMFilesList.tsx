"use client";

import { Box, Button, Text } from "@optiaxiom/react";
import {
  IconFileLines,
  IconFilePdf,
  IconFileSpreadsheet,
  IconFileWord,
  IconPresentationScreen,
  IconArrowUpRightFromSquare,
} from "@optimizely/axiom-icons";
import type { ReactNode } from "react";

type IMFile = {
  id: string;
  name: string;
  type: "md" | "pdf" | "xlsx" | "docx" | "pptx";
  description: string;
  date: string;
  size: string;
};

// ── File type icons + colors ──────────────────────────────────────────────────

function FileTypeIcon({ type }: { type: IMFile["type"] }): ReactNode {
  const config: Record<IMFile["type"], { icon: ReactNode; bg: string; color: string }> = {
    md: { icon: <IconFileLines size={18} />, bg: "var(--ax-colors-bg-secondary)", color: "var(--ax-colors-fg-success)" },
    pdf: { icon: <IconFilePdf size={18} />, bg: "var(--ax-colors-bg-secondary)", color: "var(--ax-colors-fg-error)" },
    xlsx: { icon: <IconFileSpreadsheet size={18} />, bg: "var(--ax-colors-bg-secondary)", color: "var(--ax-colors-fg-success-strong)" },
    docx: { icon: <IconFileWord size={18} />, bg: "var(--ax-colors-bg-secondary)", color: "var(--ax-colors-fg-information)" },
    pptx: { icon: <IconPresentationScreen size={18} />, bg: "var(--ax-colors-bg-secondary)", color: "var(--ax-colors-fg-warning)" },
  };
  const c = config[type];
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        background: c.bg,
        color: c.color,
        flexShrink: 0,
      }}
    >
      {c.icon}
    </Box>
  );
}

// ── Mock data per VAU ─────────────────────────────────────────────────────────

const FRANK_FILES: IMFile[] = [
  { id: "f1", name: "discover-the-unknown-qa.md", type: "md", description: "GEO Q&A article · 7 Q&A pairs · updated", date: "Today", size: "12 KB" },
  { id: "f2", name: "serp-shift-digest-may-29.pdf", type: "pdf", description: "SERP position changes · 14 flagged", date: "Today", size: "84 KB" },
  { id: "f3", name: "stride-keyword-clusters-may26.xlsx", type: "xlsx", description: "Keyword cluster analysis · 6 topic areas", date: "Today", size: "48 KB" },
  { id: "f4", name: "stride-schema-audit-may28.pdf", type: "pdf", description: "Schema markup audit · 12 pages flagged", date: "Yesterday", size: "102 KB" },
  { id: "f5", name: "content-brief-new-terrain.md", type: "md", description: "GEO content brief · Discover the Unknown", date: "May 27", size: "8 KB" },
  { id: "f6", name: "citation-tracker-may26.pdf", type: "pdf", description: "Monthly citation report · 22 sources tracked", date: "May 26", size: "56 KB" },
  { id: "f7", name: "geo-strategy-deck-q3.pptx", type: "pptx", description: "GEO strategy deck · Q3 planning · 18 slides", date: "May 25", size: "2.4 MB" },
];

const TONY_FILES: IMFile[] = [
  { id: "t1", name: "homepage-pricing-test-report.pdf", type: "pdf", description: "A/B test analysis · Variant B –18% conversion", date: "Today", size: "148 KB" },
  { id: "t2", name: "channel-mix-Q2-2025.xlsx", type: "xlsx", description: "Media plan · Q2 channel allocation", date: "Today", size: "64 KB" },
  { id: "t3", name: "landing-page-audit-may28.pdf", type: "pdf", description: "CRO audit · 7 friction points", date: "Yesterday", size: "92 KB" },
  { id: "t4", name: "paid-creative-brief-may27.docx", type: "docx", description: "Google Ads · 3 new creative angles", date: "May 27", size: "36 KB" },
  { id: "t5", name: "funnel-teardown-Q2.pdf", type: "pdf", description: "Q2 funnel analysis · checkout step 2 drop", date: "May 27", size: "210 KB" },
  { id: "t6", name: "growth-strategy-H2.pptx", type: "pptx", description: "H2 growth strategy · traffic + CRO priorities", date: "May 26", size: "3.1 MB" },
];

const HENRY_FILES: IMFile[] = [
  { id: "h1", name: "stride-discover-launch-positioning.docx", type: "docx", description: "Launch messaging · 3 buyer segments", date: "Today", size: "28 KB" },
  { id: "h2", name: "competitive-brief-eventbrite-may28.pdf", type: "pdf", description: "Competitive brief · Stride vs. Eventbrite", date: "Yesterday", size: "76 KB" },
  { id: "h3", name: "messaging-framework-Q3.docx", type: "docx", description: "Q3 GTM messaging framework · 5 value props", date: "May 27", size: "44 KB" },
  { id: "h4", name: "sales-enablement-kit-may27.pdf", type: "pdf", description: "Sales kit · pitch deck + objection guide", date: "May 27", size: "320 KB" },
  { id: "h5", name: "buyer-persona-update-may26.docx", type: "docx", description: "Persona update · Adventure Athlete + Corporate Team", date: "May 26", size: "32 KB" },
  { id: "h6", name: "stride-q3-launch-deck.pptx", type: "pptx", description: "Q3 launch presentation · exec review · 22 slides", date: "May 25", size: "4.2 MB" },
];

const POPPY_FILES: IMFile[] = [
  { id: "p1", name: "q3-launch-timeline.xlsx", type: "xlsx", description: "Launch timeline · Q3 Discover", date: "Today", size: "58 KB" },
  { id: "p2", name: "launch-readiness-check-may28.pdf", type: "pdf", description: "Launch checklist · 8/10 green", date: "Yesterday", size: "44 KB" },
  { id: "p3", name: "rollout-dependency-map.pdf", type: "pdf", description: "CMS, CMP, Paid channels mapped", date: "Yesterday", size: "62 KB" },
  { id: "p4", name: "stakeholder-update-may27.docx", type: "docx", description: "Stakeholder update · milestone summary", date: "May 27", size: "22 KB" },
  { id: "p5", name: "q3-launch-readout.pptx", type: "pptx", description: "Launch readout deck · leadership · 16 slides", date: "May 26", size: "2.8 MB" },
];

const KERBY_FILES: IMFile[] = [
  { id: "k1", name: "accenture-outreach-sequence.docx", type: "docx", description: "5-step email + LinkedIn sequence · 3 personas", date: "Today", size: "28 KB" },
  { id: "k2", name: "target-account-list-may29.xlsx", type: "xlsx", description: "ABM target list · 87 accounts scored", date: "Today", size: "72 KB" },
  { id: "k3", name: "account-heat-map-may28.pdf", type: "pdf", description: "Intent heat map · top 20 accounts", date: "Yesterday", size: "88 KB" },
  { id: "k4", name: "okta-sales-handoff-brief.pdf", type: "pdf", description: "Account brief + buying group map", date: "Yesterday", size: "56 KB" },
  { id: "k5", name: "abm-program-overview-q3.pptx", type: "pptx", description: "ABM program deck · Q3 strategy · 14 slides", date: "May 26", size: "1.9 MB" },
];

const JONAS_FILES: IMFile[] = [
  { id: "j1", name: "personalization-opportunities-may29.pdf", type: "pdf", description: "3 segment opportunities · homepage hero", date: "Today", size: "48 KB" },
  { id: "j2", name: "checkout-cta-ab-test-proposal.docx", type: "docx", description: "A/B test brief · expected +4-8% lift", date: "Today", size: "24 KB" },
  { id: "j3", name: "journey-friction-report-may28.pdf", type: "pdf", description: "Onboarding step 3 drop-off analysis", date: "Yesterday", size: "96 KB" },
  { id: "j4", name: "test-backlog-may28.xlsx", type: "xlsx", description: "8 prioritized hypotheses", date: "Yesterday", size: "34 KB" },
  { id: "j5", name: "personalization-strategy-q3.pptx", type: "pptx", description: "Personalization roadmap deck · 12 slides", date: "May 26", size: "2.2 MB" },
];

const MAYLING_FILES: IMFile[] = [
  { id: "m1", name: "social-calendar-week-may29.xlsx", type: "xlsx", description: "14 posts · Instagram + LinkedIn + X", date: "Today", size: "42 KB" },
  { id: "m2", name: "discover-launch-post-variants.docx", type: "docx", description: "3 post angles · Instagram + LinkedIn", date: "Today", size: "18 KB" },
  { id: "m3", name: "channel-performance-may28.pdf", type: "pdf", description: "Weekly digest · LinkedIn +22%", date: "Yesterday", size: "64 KB" },
  { id: "m4", name: "influencer-outreach-list-may28.xlsx", type: "xlsx", description: "8 adventure creators shortlisted", date: "Yesterday", size: "28 KB" },
  { id: "m5", name: "social-strategy-q3.pptx", type: "pptx", description: "Q3 social strategy deck · channel mix · 10 slides", date: "May 26", size: "1.6 MB" },
];

const FILES_BY_VAU: Record<string, IMFile[]> = {
  frank: FRANK_FILES,
  tony: TONY_FILES,
  henry: HENRY_FILES,
  poppy: POPPY_FILES,
  kerby: KERBY_FILES,
  jonas: JONAS_FILES,
  mayling: MAYLING_FILES,
};

// ── Component ─────────────────────────────────────────────────────────────────

export function IMFilesList({ vauName }: { vauName?: string }) {
  const key = vauName?.toLowerCase() ?? "";
  const files = FILES_BY_VAU[key] ?? FRANK_FILES;

  return (
    <Box
      display="flex"
      flexDirection="column"
      style={{ flex: 1, overflowY: "auto", padding: "16px 0" }}
    >
      <Box style={{ maxWidth: 720, width: "100%", margin: "0 auto" }}>

      {files.map((file) => (
        <Box
          key={file.id}
          display="flex"
          alignItems="center"
          gap="12"
          style={{
            padding: "10px 24px",
            borderBottom: "1px solid var(--ax-colors-border-secondary)",
            minHeight: 56,
          }}
        >
          <FileTypeIcon type={file.type} />

          {/* File info */}
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
              {file.name}
            </Text>
            <Box display="flex" alignItems="center" gap="6">
              <Text style={{ fontSize: 12, color: "var(--ax-colors-fg-secondary)" }}>
                {file.description}
              </Text>
              <Text style={{ fontSize: 12, color: "var(--ax-colors-fg-tertiary)" }}>·</Text>
              <Text style={{ fontSize: 12, color: "var(--ax-colors-fg-tertiary)", whiteSpace: "nowrap" }}>
                {file.date}
              </Text>
              <Text style={{ fontSize: 12, color: "var(--ax-colors-fg-tertiary)" }}>·</Text>
              <Text style={{ fontSize: 12, color: "var(--ax-colors-fg-tertiary)", whiteSpace: "nowrap" }}>
                {file.size}
              </Text>
            </Box>
          </Box>

          {/* Open button */}
          <Button
            appearance="subtle"
            size="sm"
            aria-label="Open file"
            style={{ flexShrink: 0, padding: 0, minWidth: "auto", width: 32, height: 32 }}
          >
            <IconArrowUpRightFromSquare size={14} />
          </Button>
        </Box>
      ))}
      </Box>
    </Box>
  );
}
