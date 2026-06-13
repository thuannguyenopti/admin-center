"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Box,
  Text,
  Heading,
  Button,
  Badge,
  SearchInput,
  Progress,
  Tooltip,
  ToggleButton,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  LabelMenuButton,
  Checkbox,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "@optiaxiom/react";
import {
  IconAngleDown,
  IconFile,
  IconFolder,
  IconFolderOpen,
  IconUpload,
  IconFileArrowUp,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconPen,
  IconCode,
  IconEye,
  IconClockRotateLeft,
  IconUserPlus,
  IconEllipsisSolid,
  IconUser,
  IconUsers,
  IconTrashCan,
  IconLock,
  IconImage,
  IconTableCells,
  IconDownload,
  IconFolderArrowDown,
  IconFiles,
  IconFileLines,
  IconFilePdf,
  IconFileImage,
  IconFileSpreadsheet,
  IconFileWord,
} from "@optiaxiom/icons";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { FileUpload, FileUploadDropzone } from "@optiaxiom/react/unstable";
import { CollaborativeEditorPanel } from "@/app/components/Opal/CollaborativeEditorPanel";
import { OpalShareDialog } from "@/app/components/Opal/CodeCanvasPanel";
import { TiptapEditor } from "@/app/components/Opal/editor/TiptapEditor";
import { useCollabDoc } from "@/app/components/Opal/editor/useCollabDoc";
import { VersionHistory } from "@/app/opal/agents/setup/components/VersionHistory";
import type { Version } from "@/app/opal/agents/setup/components/VersionHistory";
import { BrandPacksOverview } from "@/app/opal/brand-packs/components/BrandPacksOverview";

const CodeMirrorEditor = dynamic(
  () => import("@/app/components/Opal/editor/CodeMirrorEditor").then((m) => m.CodeMirrorEditor),
  { ssr: false }
);

// ── File tree data ────────────────────────────────────────────────────────────

interface FileNode {
  id: string;
  label: string;
  type: "file" | "folder";
  contentType?: "markdown" | "pdf" | "image" | "spreadsheet" | "csv" | "word";
  owner?: "personal" | "team";
  expanded?: boolean;
  children?: FileNode[];
}

const INITIAL_FILE_TREE: FileNode[] = [
  {
    id: "1",
    label: "Playbooks",
    type: "folder",
    expanded: true,
    children: [
      { id: "1-1", label: "Opal Agent Playbook.md", type: "file", contentType: "markdown", owner: "personal" },
      { id: "1-2", label: "Sales Enablement.md", type: "file", contentType: "markdown", owner: "team" },
    ],
  },
  {
    id: "4",
    label: "Reports",
    type: "folder",
    expanded: true,
    children: [
      { id: "4-1", label: "Q1 Performance Report.md", type: "file", contentType: "markdown", owner: "team" },
    ],
  },
  {
    id: "5",
    label: "Diagrams",
    type: "folder",
    expanded: true,
    children: [
      { id: "5-1", label: "Content Pipeline.md", type: "file", contentType: "markdown", owner: "personal" },
    ],
  },
  {
    id: "6",
    label: "Assets",
    type: "folder",
    expanded: true,
    children: [
      { id: "6-1", label: "Brand Guidelines.pdf", type: "file", contentType: "pdf", owner: "team" },
      { id: "6-2", label: "Campaign Banner.png", type: "file", contentType: "image", owner: "team" },
      { id: "6-3", label: "Q1 Budget Tracker.xlsx", type: "file", contentType: "spreadsheet", owner: "personal" },
      { id: "6-4", label: "Leads Export.csv", type: "file", contentType: "csv", owner: "team" },
      { id: "6-5", label: "Product Brief.docx", type: "file", contentType: "word", owner: "personal" },
    ],
  },
];

function findFileById(tree: FileNode[], id: string): FileNode | null {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findFileById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function getAllFileIds(tree: FileNode[]): string[] {
  const ids: string[] = [];
  for (const node of tree) {
    if (node.type === "file") ids.push(node.id);
    if (node.children) ids.push(...getAllFileIds(node.children));
  }
  return ids;
}

function hasAnyFiles(tree: FileNode[]): boolean {
  for (const node of tree) {
    if (node.type === "file") return true;
    if (node.children && hasAnyFiles(node.children)) return true;
  }
  return false;
}

function removeEmptyFolders(nodes: FileNode[]): FileNode[] {
  return nodes
    .map((n) => n.children ? { ...n, children: removeEmptyFolders(n.children) } : n)
    .filter((n) => n.type !== "folder" || (n.children !== undefined && n.children.length > 0));
}

function getContentTypeIcon(contentType: FileNode["contentType"]) {
  switch (contentType) {
    case "pdf":         return IconFilePdf;
    case "image":       return IconFileImage;
    case "spreadsheet": return IconFileSpreadsheet;
    case "csv":         return IconTableCells;
    case "word":        return IconFileWord;
    case "markdown":
    default:            return IconFileLines;
  }
}

// ── Version history mock ──────────────────────────────────────────────────────

const VERSIONS: Version[] = [
  { id: "v3", version: "V3", mode: "agent", timestamp: "2h ago", author: "Opal", authorInitials: "O", isCurrent: true },
  { id: "v2", version: "V2", mode: "agent", timestamp: "Yesterday", author: "Opal", authorInitials: "O", isCurrent: false },
  { id: "v1", version: "V1", mode: "human", timestamp: "3 days ago", author: "Jamie S.", authorInitials: "JS", isCurrent: false },
];

// ── File content ──────────────────────────────────────────────────────────────

const PLAYBOOK_MD = `# Opal Agent Playbook

This playbook defines how Opal agents should behave when generating content for Optimizely campaigns. Use it as a reference when configuring new agents or auditing existing ones.

## Goals

- Produce on-brand content that matches our tone of voice guidelines
- Prioritize clarity and conciseness over length
- Always cite sources when referencing statistics or third-party claims
- Adapt output format to the channel (email, blog, social, in-app)

## Content Types

### Blog Posts

Blog posts should follow a clear narrative arc: hook → problem → solution → call to action. Target a reading level of Grade 8–10. Aim for 600–900 words unless specified otherwise.

**Checklist before publishing:**
- [ ] Headline passes the "so what?" test
- [ ] Opening paragraph does not start with "In today's..."
- [ ] At least one internal link to a product page
- [ ] Meta description is 120–155 characters

### Email Campaigns

Keep subject lines under 50 characters. Preheader text should complement, not repeat, the subject. Body copy should have a single, clear CTA per email.

> **Note:** All email copy must go through the brand review queue before scheduling.

### Social Media

| Platform | Max length | Tone | Hashtags |
|---|---|---|---|
| LinkedIn | 1,300 chars | Professional | 3–5 |
| Twitter/X | 280 chars | Conversational | 1–2 |
| Instagram | 2,200 chars | Aspirational | 5–10 |

## Prohibited Content

The following must never appear in Opal-generated content:

- Competitor brand names (Salesforce, HubSpot, Adobe)
- Unverified performance claims ("increase revenue by 10x")
- Legal or compliance language without approval from Legal

## Escalation Path

If Opal produces content that violates these guidelines, flag it via the \`#opal-content-review\` Slack channel with a link to the artifact and a brief note on the issue.
`;

const SALES_ENABLEMENT_MD = `# Sales Enablement Guide

Opal-assisted sales content should accelerate deal cycles without overpromising. This guide covers the approved use cases and constraints.

## Approved Use Cases

- **Case study drafts** — Opal can draft from a structured brief; Sales must review before sharing
- **Email sequences** — First-touch and follow-up templates only; no contract or pricing language
- **Battle cards** — Factual comparison content; sourced from approved product documentation only

## Tone for Sales

Sales content should be confident but not aggressive. Lead with outcomes, not features.

> Always personalise the opener. Generic intros reduce reply rates by 40% (internal A/B test, Nov 2024).

## Handoff Checklist

- [ ] Customer name and role are correct
- [ ] Pricing and SKU references reviewed by Sales Ops
- [ ] Legal boilerplate removed from AI drafts
- [ ] Signed off by regional sales lead before sending
`;

const REPORT_MD = `# Q1 Performance Report

**Period:** January 1 – March 31, 2025 · **Prepared by:** Analytics Team · **Status:** Final

## Executive Summary

Q1 exceeded pipeline targets by 12% driven by strong organic search growth and a high-performing email re-engagement campaign. Content production velocity increased 31% YoY following the Opal rollout in February.

## Key Metrics

| Metric | Q1 Target | Q1 Actual | vs. Target | QoQ |
|---|---|---|---|---|
| MQLs | 1,200 | 1,348 | +12.3% | +8.1% |
| Content pieces published | 80 | 105 | +31.3% | +22.1% |
| Avg. time-to-publish | 6 days | 3.8 days | −36.7% | −28.4% |
| Email open rate | 24% | 27.4% | +3.4 pts | +1.9 pts |
| Organic sessions | 420K | 461K | +9.8% | +14.2% |

## MQL Trend — Q1 Weekly

\`\`\`mermaid
xychart-beta
  title "Weekly MQLs vs. Target"
  x-axis ["W1","W2","W3","W4","W5","W6","W7","W8","W9","W10","W11","W12"]
  y-axis "MQLs" 0 --> 160
  bar [88, 92, 95, 101, 98, 107, 110, 112, 108, 118, 122, 127]
  line [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
\`\`\`

## Channel Mix

\`\`\`mermaid
pie title MQL Source by Channel
  "Organic Search" : 38
  "Email" : 27
  "Paid Search" : 19
  "LinkedIn" : 11
  "Referral" : 5
\`\`\`

## Channel Performance

### Organic Search

Organic sessions grew 9.8% vs. target, driven by 14 net-new SEO articles published in February and March. Three articles entered the top-3 position within 30 days of publication.

**Top performing articles:**

| Article | Sessions | Avg. position |
|---|---|---|
| "What is content experimentation?" | 18,420 | 2.1 |
| "Personalization vs. targeting" | 14,880 | 3.4 |
| "CMS headless architecture guide" | 11,230 | 1.8 |

### Email

The March re-engagement campaign delivered a 31.2% open rate and 6.4% CTR against a 5% CTR benchmark. Segments older than 18 months were excluded to protect sender reputation.

### Paid Media

Paid search CPL decreased 8% QoQ after keyword negative-list cleanup. LinkedIn Sponsored Content underperformed at $340 CPL vs. $280 target; creative refresh scheduled for Q2.

## Opal Impact

Since enabling Opal for content teams in mid-February:

- First drafts reviewed and approved 2.1× faster than manual drafts
- 78% of published pieces used an Opal-generated first draft
- Brand compliance score improved from 71% → 89% (measured by brand audit tool)

\`\`\`mermaid
xychart-beta
  title "Draft Approval Time (days) — Before vs. After Opal"
  x-axis ["Blog","Email","Social","Case Study","Landing Page"]
  y-axis "Days" 0 --> 8
  bar [6.8, 5.2, 3.1, 7.4, 5.9]
  bar [2.9, 2.1, 1.2, 3.8, 2.6]
\`\`\`

## Q2 Priorities

1. Launch account-based content programme targeting 50 named accounts
2. Expand Opal to the EMEA content team (target: April 15)
3. A/B test AI-personalised email subject lines at scale
4. Reduce paid social CPL to ≤ $280 with new creative variants
`;

const MERMAID_MD = `# Content Pipeline

This diagram shows how content moves through the Optimizely production pipeline from brief to analytics.

\`\`\`mermaid
flowchart LR
  A[Brief] --> B[Opal Draft]
  B --> C{Brand Review}
  C -->|Approved| D[Edit & Polish]
  C -->|Revise| B
  D --> E{Legal Check}
  E -->|Clear| F[Publish]
  E -->|Hold| G[Legal Review]
  G --> D
  F --> H[Analytics]
  H -->|Insights| A
\`\`\`

## Stage Descriptions

### Brief
Content requests enter via the CMS intake form. Each brief must include target audience, channel, goal, and deadline.

### Opal Draft
Opal generates a first draft using the brief, relevant playbooks from the Files library, and current brand guidelines. Average draft time: 45 seconds.

### Brand Review
The brand team reviews for tone, messaging alignment, and prohibited content. Turnaround SLA: 1 business day.

### Edit & Polish
Content editors refine the approved draft. This stage typically takes 2–4 hours depending on content type.

### Legal Check
Required for any content referencing pricing, compliance claims, or competitive comparisons. Legal turnaround SLA: 2 business days.

### Publish
Approved content is published via the CMS. Metadata, tags, and distribution channels are set at this stage.

### Analytics
Published content is tracked for 30 days. Performance insights feed back into future briefs.
`;

const FILE_CONTENT: Record<string, string> = {
  "1-1": PLAYBOOK_MD,
  "1-2": SALES_ENABLEMENT_MD,
  "4-1": REPORT_MD,
  "5-1": MERMAID_MD,
};

// ── File type badge ───────────────────────────────────────────────────────────

const EXT_COLORS: Record<string, { bg: string; fg: string }> = {
  md:   { bg: "var(--ax-colors-bg-information-subtle)", fg: "var(--ax-colors-fg-information)" },
  pdf:  { bg: "var(--ax-colors-bg-danger-subtle)",    fg: "var(--ax-colors-fg-danger)" },
  png:  { bg: "var(--ax-colors-bg-success-subtle)",   fg: "var(--ax-colors-fg-success)" },
  jpg:  { bg: "var(--ax-colors-bg-success-subtle)",   fg: "var(--ax-colors-fg-success)" },
  jpeg: { bg: "var(--ax-colors-bg-success-subtle)",   fg: "var(--ax-colors-fg-success)" },
  gif:  { bg: "var(--ax-colors-bg-success-subtle)",   fg: "var(--ax-colors-fg-success)" },
  webp: { bg: "var(--ax-colors-bg-success-subtle)",   fg: "var(--ax-colors-fg-success)" },
  xlsx: { bg: "var(--ax-colors-bg-success-subtle)",   fg: "var(--ax-colors-fg-success)" },
  csv:  { bg: "var(--ax-colors-bg-warning-subtle)",   fg: "var(--ax-colors-fg-warning)" },
  docx: { bg: "var(--ax-colors-bg-information-subtle)", fg: "var(--ax-colors-fg-information)" },
  doc:  { bg: "var(--ax-colors-bg-information-subtle)", fg: "var(--ax-colors-fg-information)" },
};

function FileTypeBadge({ ext = "md" }: { ext?: string }) {
  const { bg, fg } = EXT_COLORS[ext.toLowerCase()] ?? { bg: "var(--ax-colors-bg-secondary)", fg: "var(--ax-colors-fg-secondary)" };
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      rounded="sm"
      style={{
        height: 18,
        padding: "0 4px",
        background: bg,
        color: fg,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.02em",
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      {ext.toUpperCase()}
    </Box>
  );
}

// ── File tree ─────────────────────────────────────────────────────────────────

const FILE_TREE_ROW_STYLES = `
.ft-row { position: relative; }
.ft-row .ft-menu-btn { opacity: 0; pointer-events: none; }
.ft-row:hover .ft-menu-btn { opacity: 1; pointer-events: auto; }
.ft-folder-drop { background: var(--ax-colors-bg-accent-subtle) !important; outline: 2px solid var(--ax-colors-border-accent); outline-offset: -1px; border-radius: 6px; }
`;

function FileTree({
  tree,
  selectedId,
  onSelect,
  expandedFolders,
  onToggleFolder,
  bulkMode,
  selectedFiles,
  onToggleFile,
  onToggleFolderSelect,
  onEditFile,
  onDropToFolder,
  onDeleteFile,
}: {
  tree: FileNode[];
  selectedId: string;
  onSelect: (id: string) => void;
  expandedFolders: Set<string>;
  onToggleFolder: (id: string) => void;
  bulkMode: boolean;
  selectedFiles: Set<string>;
  onToggleFile: (id: string) => void;
  onToggleFolderSelect: (childIds: string[]) => void;
  onEditFile: (id: string) => void;
  onDropToFolder: (fileId: string, targetFolderId: string) => void;
  onDeleteFile: (id: string) => void;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropFolderId, setDropFolderId] = useState<string | null>(null);
  const draggingIdRef = useRef<string | null>(null);

  return (
    <>
      <style>{FILE_TREE_ROW_STYLES}</style>
      <Box display="flex" flexDirection="column" gap="4">
        {tree.map((node) => {
          const childIds = node.children?.map((c) => c.id) ?? [];
          const checkedCount = childIds.filter((id) => selectedFiles.has(id)).length;
          const allChecked = childIds.length > 0 && checkedCount === childIds.length;
          const someChecked = checkedCount > 0 && !allChecked;
          const isDropTarget = dropFolderId === node.id;

          return (
            <Box key={node.id}>
              {/* Folder row */}
              <Box
                display="flex"
                alignItems="center"
                gap="4"
                py="4"
                pl="4"
                pr="4"
                rounded="md"
                className={`ft-row${isDropTarget ? " ft-folder-drop" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={() => onToggleFolder(node.id)}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDropFolderId(node.id); }}
                onDragLeave={(e) => { e.stopPropagation(); setDropFolderId(null); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (draggingIdRef.current) {
                    onDropToFolder(draggingIdRef.current, node.id);
                  }
                  setDropFolderId(null);
                  setDraggingId(null);
                  draggingIdRef.current = null;
                }}
              >
                {bulkMode && (
                  <span onClick={(e) => { e.stopPropagation(); onToggleFolderSelect(childIds); }}>
                    <Checkbox
                      size="sm"
                      checked={allChecked}
                      indeterminate={someChecked}
                      onChange={() => onToggleFolderSelect(childIds)}
                    />
                  </span>
                )}
                <IconAngleDown
                  size={12}
                  color="var(--ax-colors-fg-tertiary)"
                  style={{
                    transform: expandedFolders.has(node.id) ? "rotate(0deg)" : "rotate(-90deg)",
                    transition: "transform 0.15s",
                    flexShrink: 0,
                  }}
                />
                {expandedFolders.has(node.id)
                  ? <IconFolderOpen size={14} color="var(--ax-colors-fg-tertiary)" style={{ flexShrink: 0 }} />
                  : <IconFolder size={14} color="var(--ax-colors-fg-tertiary)" style={{ flexShrink: 0 }} />
                }
                <Text fontSize="md" color="fg.default" style={{ flex: 1, minWidth: 0 }}>{node.label}</Text>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <span
                      className="ft-menu-btn"
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: "inline-flex" }}
                    >
                      <Button
                        appearance="subtle"
                        size="sm"
                        icon={<IconEllipsisSolid size={12} />}
                        aria-label="Folder actions"
                        style={{ width: 22, height: 22, minWidth: 22, padding: 0 }}
                      />
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Box display="flex" alignItems="center" gap="8">
                        <IconFile size={13} />
                        Add File
                      </Box>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Box display="flex" alignItems="center" gap="8">
                        <IconFolder size={13} />
                        Add Folder
                      </Box>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Box display="flex" alignItems="center" gap="8">
                        <IconPen size={13} />
                        Rename
                      </Box>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Box display="flex" alignItems="center" gap="8">
                        <IconDownload size={13} />
                        Download
                      </Box>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Box display="flex" alignItems="center" gap="8">
                        <IconLock size={13} />
                        Manage Permissions
                      </Box>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDeleteFile(node.id)}
                      intent="danger"
                    >
                      <Box display="flex" alignItems="center" gap="8">
                        <IconTrashCan size={13} />
                        Delete
                      </Box>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Box>

              {/* Child file rows */}
              {node.children && expandedFolders.has(node.id) && (
                node.children.map((child) => {
                  const isSelected = child.id === selectedId;
                  const isBulkChecked = selectedFiles.has(child.id);
                  const OwnerIcon = child.owner === "team" ? IconUsers : IconUser;
                  const ContentIcon = getContentTypeIcon(child.contentType);
                  return (
                    <Box
                      key={child.id}
                      className="ft-row"
                      display="flex"
                      alignItems="center"
                      gap="6"
                      py="4"
                      pr="4"
                      rounded="md"
                      draggable={!bulkMode}
                      style={{
                        paddingLeft: 22,
                        cursor: bulkMode ? "default" : "pointer",
                        background: isSelected ? "var(--ax-colors-bg-accent-subtle)" : undefined,
                        opacity: draggingId === child.id ? 0.4 : 1,
                      }}
                      onClick={() => !bulkMode && onSelect(child.id)}
                      onDragStart={() => { setDraggingId(child.id); draggingIdRef.current = child.id; }}
                      onDragEnd={() => { setDraggingId(null); setDropFolderId(null); draggingIdRef.current = null; }}
                    >
                      {bulkMode ? (
                        <span onClick={(e) => { e.stopPropagation(); onToggleFile(child.id); }}>
                          <Checkbox size="sm" checked={isBulkChecked} onChange={() => onToggleFile(child.id)} />
                        </span>
                      ) : (
                        <ContentIcon
                          size={16}
                          color={isSelected ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)"}
                          style={{ flexShrink: 0 }}
                        />
                      )}
                      <Box
                        display="flex"
                        alignItems="center"
                        gap="4"
                        style={{ flex: 1, minWidth: 0, overflow: "hidden" }}
                      >
                        <Text
                          fontSize="md"
                          color="fg.default"
                          fontWeight={isSelected ? "500" : "400"}
                          style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        >
                          {child.label.replace(/\.[^.]+$/, "")}
                        </Text>
                        {!bulkMode && (
                          <OwnerIcon
                            size={12}
                            color="var(--ax-colors-fg-tertiary)"
                            style={{ flexShrink: 0 }}
                          />
                        )}
                      </Box>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <span
                            className="ft-menu-btn"
                            onClick={(e) => e.stopPropagation()}
                            style={{ display: "inline-flex" }}
                          >
                            <Button
                              appearance="subtle"
                              size="sm"
                              icon={<IconEllipsisSolid size={12} />}
                              aria-label="File actions"
                              style={{ width: 22, height: 22, minWidth: 22, padding: 0 }}
                            />
                          </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Box display="flex" alignItems="center" gap="8">
                              <IconPen size={13} />
                              Rename
                            </Box>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditFile(child.id)}>
                            <Box display="flex" alignItems="center" gap="8">
                              <IconFile size={13} />
                              Edit
                            </Box>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Box display="flex" alignItems="center" gap="8">
                              <IconDownload size={13} />
                              Download
                            </Box>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Box display="flex" alignItems="center" gap="8">
                              <IconLock size={13} />
                              Manage Permissions
                            </Box>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDeleteFile(child.id)}
                            intent="danger"
                          >
                            <Box display="flex" alignItems="center" gap="8">
                              <IconTrashCan size={13} />
                              Delete
                            </Box>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </Box>
                  );
                })
              )}
            </Box>
          );
        })}
      </Box>
    </>
  );
}

// ── Markdown source view (CodeMirror) ─────────────────────────────────────────

function MarkdownSourceView({ markdown }: { markdown: string }) {
  const collabDoc = useCollabDoc(markdown);
  return (
    <Box style={{ height: "100%", overflow: "hidden" }}>
      <CodeMirrorEditor collabDoc={collabDoc} language="markdown" darkMode={false} />
    </Box>
  );
}

// ── Markdown / Mermaid preview (read-only Tiptap) ─────────────────────────────

function TiptapPreview({ markdown, fileId }: { markdown: string; fileId: string }) {
  return (
    <Box
      key={fileId}
      style={{
        padding: "24px 28px",
        overflowY: "auto",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <TiptapEditor key={fileId} initialMarkdown={markdown} editable={false} />
    </Box>
  );
}

// ── PDF preview ───────────────────────────────────────────────────────────────

function PdfPreview() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      style={{ height: "100%", overflowY: "auto", padding: "24px 28px", boxSizing: "border-box" }}
    >
      {/* PDF page mockup */}
      <Box
        bg="bg.default"
        rounded="sm"
        shadow="sm"
        style={{
          width: "100%",
          maxWidth: 600,
          minHeight: 800,
          padding: "64px 72px",
          boxSizing: "border-box",
        }}
      >
        {/* Header bar */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          pb="24"
          style={{ borderBottom: "2px solid #2E3442" }}
        >
          <Box>
            <Text style={{ fontSize: 20, fontWeight: 700, color: "#2E3442" }}>Optimizely</Text>
            <Text style={{ fontSize: 11, color: "#66708C", marginTop: 2 }}>Brand Guidelines 2025</Text>
          </Box>
          <Box
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "linear-gradient(135deg, #6066F2 0%, #2E82F5 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>O</Text>
          </Box>
        </Box>

        {/* Title */}
        <Box mt="32">
          <Text style={{ fontSize: 28, fontWeight: 700, color: "#2E3442", lineHeight: 1.2 }}>
            Brand Identity &amp; Usage Guidelines
          </Text>
          <Text style={{ fontSize: 13, color: "#66708C", marginTop: 8 }}>
            Version 4.2 · Effective January 2025 · Confidential
          </Text>
        </Box>

        {/* Section */}
        <Box mt="32">
          <Text style={{ fontSize: 13, fontWeight: 700, color: "#2E82F5", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            01 — Color System
          </Text>
          <Box mt="12" display="flex" gap="8">
            {[
              { name: "Navy", hex: "#2E3442" },
              { name: "Blue", hex: "#2E82F5" },
              { name: "Violet", hex: "#6066F2" },
              { name: "Cloud", hex: "#F5F6FA" },
            ].map((c) => (
              <Box key={c.name} display="flex" flexDirection="column" alignItems="center" gap="4">
                <Box style={{ width: 48, height: 48, borderRadius: 8, background: c.hex }} />
                <Text style={{ fontSize: 10, color: "#66708C", fontWeight: 600 }}>{c.name}</Text>
                <Text style={{ fontSize: 9, color: "#838DA4", fontFamily: "monospace" }}>{c.hex}</Text>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Section */}
        <Box mt="24">
          <Text style={{ fontSize: 13, fontWeight: 700, color: "#2E82F5", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            02 — Typography
          </Text>
          <Box mt="12" style={{ borderLeft: "3px solid #E9EDF5", paddingLeft: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: 700, color: "#2E3442" }}>Display / 24px Bold</Text>
            <Text style={{ fontSize: 18, fontWeight: 600, color: "#2E3442", marginTop: 8 }}>Heading / 18px Semibold</Text>
            <Text style={{ fontSize: 14, color: "#4F576E", marginTop: 8, lineHeight: 1.6 }}>
              Body text / 14px Regular — Our typeface is Inter. It combines warmth with precision,
              designed for clarity at every size across digital and print.
            </Text>
          </Box>
        </Box>

        {/* Section */}
        <Box mt="24">
          <Text style={{ fontSize: 13, fontWeight: 700, color: "#2E82F5", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            03 — Logo Usage
          </Text>
          <Box mt="12" display="flex" gap="12">
            {["Light background", "Dark background"].map((label, i) => (
              <Box
                key={label}
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap="6"
                style={{ flex: 1 }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  style={{
                    height: 64,
                    width: "100%",
                    borderRadius: 6,
                    background: i === 0 ? "#F5F6FA" : "#2E3442",
                    border: i === 0 ? "1px solid #DADFEB" : "none",
                  }}
                >
                  <Text style={{ fontWeight: 700, fontSize: 15, color: i === 0 ? "#2E3442" : "#F5F6FA" }}>
                    Optimizely
                  </Text>
                </Box>
                <Text style={{ fontSize: 10, color: "#66708C" }}>{label}</Text>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Footer */}
        <Box
          mt="48"
          pt="16"
          style={{ borderTop: "1px solid #DADFEB" }}
          display="flex"
          justifyContent="space-between"
        >
          <Text style={{ fontSize: 10, color: "#838DA4" }}>© 2025 Optimizely Inc. — Confidential</Text>
          <Text style={{ fontSize: 10, color: "#838DA4" }}>Page 1 of 12</Text>
        </Box>
      </Box>
    </Box>
  );
}

// ── PDF edit mode ─────────────────────────────────────────────────────────────

function PdfEditView() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap="16"
      style={{ height: "100%", padding: "40px 28px", boxSizing: "border-box" }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap="12"
        rounded="xl"
        style={{
          border: "1.5px dashed var(--ax-colors-border-secondary)",
          padding: "40px 48px",
          width: "100%",
          maxWidth: 440,
          textAlign: "center",
        }}
      >
        <IconFileArrowUp size={32} color="var(--ax-colors-fg-tertiary)" />
        <Box display="flex" flexDirection="column" gap="4">
          <Text fontWeight="500" color="fg.default">Replace PDF</Text>
          <Text fontSize="sm" color="fg.tertiary">
            Drag a new file here or click to upload. Max file size 50 MB.
          </Text>
        </Box>
        <Button appearance="subtle" size="sm" icon={<IconUpload size={13} />}>
          Choose file
        </Button>
      </Box>
      <Text fontSize="sm" color="fg.tertiary">
        Or view the current file below
      </Text>
      <Box rounded="lg" style={{ width: "100%", maxHeight: 320, overflow: "hidden", border: "1px solid var(--ax-colors-border-secondary)" }}>
        <PdfPreview />
      </Box>
    </Box>
  );
}

// ── Image preview ─────────────────────────────────────────────────────────────

function ImagePreview() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      style={{ height: "100%", padding: "40px 28px", boxSizing: "border-box" }}
    >
      <Box
        rounded="lg"
        shadow="sm"
        style={{
          width: "100%",
          maxWidth: 560,
          border: "1px solid var(--ax-colors-border-secondary)",
          overflow: "hidden",
        }}
      >
        {/* Simulated image — gradient placeholder with checkerboard suggestion */}
        <Box
          style={{
            height: 320,
            background: "linear-gradient(135deg, #6066F2 0%, #2E82F5 50%, #7FC8F8 100%)",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.12,
              backgroundImage:
                "repeating-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff), repeating-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 10px 10px",
            }}
          />
          <Box
            style={{
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(4px)",
              borderRadius: 12,
              padding: "16px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <IconImage size={32} color="var(--ax-colors-fg-inverse)" />
            <Text style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Campaign Banner.png</Text>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>1920 × 1080 px · 2.1 MB</Text>
          </Box>
        </Box>
        <Box
          px="16"
          py="10"
          bg="bg.secondary"
          style={{ borderTop: "1px solid var(--ax-colors-border-secondary)" }}
        >
          <Text fontSize="sm" fontWeight="500" color="fg.default">Campaign Banner.png</Text>
          <Text fontSize="xs" color="fg.tertiary">PNG · 1920×1080 · 2.1 MB · Uploaded Apr 28</Text>
        </Box>
      </Box>
    </Box>
  );
}

// ── Spreadsheet preview ───────────────────────────────────────────────────────

const SHEET_HEADERS = ["Campaign", "Channel", "Budget", "Spent", "Remaining", "ROI"];
const SHEET_ROWS = [
  ["Q1 Brand Awareness", "Paid Social", "$48,000", "$44,200", "$3,800", "3.2×"],
  ["SEO Content Push", "Organic", "$12,000", "$11,800", "$200", "8.7×"],
  ["Email Re-engagement", "Email", "$6,500", "$6,500", "$0", "11.4×"],
  ["LinkedIn Sponsored", "Paid Social", "$22,000", "$19,400", "$2,600", "2.1×"],
  ["Webinar Series", "Events", "$15,000", "$13,200", "$1,800", "5.6×"],
  ["Retargeting", "Display", "$9,000", "$8,750", "$250", "4.0×"],
];

function SpreadsheetPreview() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      style={{ height: "100%", overflow: "hidden" }}
    >
      {/* Sheet tab bar */}
      <Box
        display="flex"
        alignItems="center"
        gap="2"
        px="16"
        pt="12"
        pb="0"
        bg="bg.secondary"
        style={{ borderBottom: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0 }}
      >
        {["Q1 Budget", "Q2 Forecast", "YTD Summary"].map((tab, i) => (
          <Box
            key={tab}
            px="12"
            py="6"
            style={{
              borderRadius: "6px 6px 0 0",
              background: i === 0 ? "var(--ax-colors-bg-default)" : "transparent",
              border: i === 0 ? "1px solid var(--ax-colors-border-secondary)" : "none",
              borderBottom: i === 0 ? "1px solid var(--ax-colors-bg-default)" : "none",
              cursor: "pointer",
              marginBottom: i === 0 ? -1 : 0,
            }}
          >
            <Text fontSize="xs" fontWeight={i === 0 ? "500" : "400"} color={i === 0 ? "fg.default" : "fg.tertiary"}>
              {tab}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Table */}
      <Box style={{ flex: 1, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--ax-colors-bg-secondary)", position: "sticky", top: 0, zIndex: 1 }}>
              <th style={{ width: 32, padding: "8px 12px", borderBottom: "1px solid var(--ax-colors-border-secondary)", textAlign: "center" }}>
                <Text fontSize="xs" color="fg.tertiary">#</Text>
              </th>
              {SHEET_HEADERS.map((h) => (
                <th key={h} style={{ padding: "8px 12px", borderBottom: "1px solid var(--ax-colors-border-secondary)", textAlign: "left", fontWeight: 600, color: "var(--ax-colors-fg-secondary)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SHEET_ROWS.map((row, ri) => (
              <tr
                key={ri}
                style={{
                  background: ri % 2 === 0 ? "var(--ax-colors-bg-default)" : "var(--ax-colors-bg-secondary)",
                  borderBottom: "1px solid var(--ax-colors-border-tertiary)",
                }}
              >
                <td style={{ padding: "7px 12px", textAlign: "center", color: "var(--ax-colors-fg-tertiary)", fontSize: 11 }}>{ri + 1}</td>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: "7px 12px", color: ci === 5 ? "var(--ax-colors-fg-success)" : "var(--ax-colors-fg-default)", fontWeight: ci === 5 ? 600 : 400 }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      {/* Footer */}
      <Box
        display="flex"
        alignItems="center"
        gap="8"
        px="16"
        py="8"
        bg="bg.secondary"
        style={{ borderTop: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0 }}
      >
        <IconTableCells size={12} color="var(--ax-colors-fg-tertiary)" />
        <Text fontSize="xs" color="fg.tertiary">6 rows · Last edited Apr 29 by Jamie Chen</Text>
      </Box>
    </Box>
  );
}

// ── CSV preview ──────────────────────────────────────────────────────────────

const CSV_HEADERS = ["Email", "First Name", "Last Name", "Company", "Lead Score", "Source"];
const CSV_ROWS = [
  ["m.johnson@acme.com", "Marcus", "Johnson", "Acme Corp", "87", "Webinar"],
  ["s.lee@brightco.io", "Sara", "Lee", "BrightCo", "74", "Organic"],
  ["t.patel@novalabs.ai", "Tariq", "Patel", "Nova Labs", "91", "LinkedIn"],
  ["c.nguyen@zipstream.net", "Clara", "Nguyen", "ZipStream", "62", "Email"],
  ["r.smith@optiflow.com", "Ryan", "Smith", "OptiFlow", "83", "Paid Search"],
  ["a.kim@devhub.io", "Amy", "Kim", "DevHub", "55", "Referral"],
];

function CsvPreview() {
  return (
    <Box display="flex" flexDirection="column" style={{ height: "100%", overflow: "hidden" }}>
      {/* Toolbar */}
      <Box
        display="flex"
        alignItems="center"
        gap="8"
        px="16"
        py="8"
        bg="bg.secondary"
        style={{ borderBottom: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0 }}
      >
        <IconTableCells size={13} color="var(--ax-colors-fg-tertiary)" />
        <Text fontSize="xs" color="fg.secondary" fontWeight="500">Leads Export.csv</Text>
        <Text fontSize="xs" color="fg.tertiary">· {CSV_ROWS.length} rows · {CSV_HEADERS.length} columns</Text>
      </Box>
      {/* Table */}
      <Box style={{ flex: 1, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--ax-colors-bg-secondary)", position: "sticky", top: 0, zIndex: 1 }}>
              <th style={{ width: 32, padding: "8px 12px", borderBottom: "1px solid var(--ax-colors-border-secondary)" }} />
              {CSV_HEADERS.map((h) => (
                <th key={h} style={{ padding: "8px 12px", borderBottom: "1px solid var(--ax-colors-border-secondary)", textAlign: "left", fontWeight: 600, color: "var(--ax-colors-fg-secondary)", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CSV_ROWS.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", background: ri % 2 === 0 ? "var(--ax-colors-bg-default)" : "var(--ax-colors-bg-secondary)" }}>
                <td style={{ padding: "7px 12px", textAlign: "center", color: "var(--ax-colors-fg-tertiary)", fontSize: 11 }}>{ri + 1}</td>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: "7px 12px", color: "var(--ax-colors-fg-default)", fontFamily: ci === 0 ? "var(--ax-fonts-mono, monospace)" : undefined, fontSize: ci === 0 ? 12 : 13 }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
      <Box px="16" py="8" bg="bg.secondary" style={{ borderTop: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0 }}>
        <Text fontSize="xs" color="fg.tertiary">UTF-8 · comma-separated · exported Apr 29</Text>
      </Box>
    </Box>
  );
}

// ── Word preview ──────────────────────────────────────────────────────────────

function WordPreview() {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" style={{ minHeight: "calc(100dvh - 48px)", padding: "24px 28px", boxSizing: "border-box" }}>
      <Box
        bg="bg.default"
        rounded="sm"
        shadow="sm"
        style={{ width: "100%", maxWidth: 600, minHeight: 760, padding: "64px 72px", boxSizing: "border-box" }}
      >
        {/* Word-like header bar */}
        <Box display="flex" alignItems="center" gap="8" pb="24" style={{ borderBottom: "3px solid #2E82F5", marginBottom: 32 }}>
          <Box style={{ width: 28, height: 28, borderRadius: 4, background: "#2E82F5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Text style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>W</Text>
          </Box>
          <Box>
            <Text style={{ fontSize: 13, fontWeight: 600, color: "#2E3442" }}>Product Brief</Text>
            <Text style={{ fontSize: 10, color: "#66708C" }}>Optimizely · Confidential Draft</Text>
          </Box>
        </Box>

        <Text style={{ fontSize: 22, fontWeight: 700, color: "#2E3442", lineHeight: 1.2 }}>
          Opal Files — Product Brief
        </Text>
        <Text style={{ fontSize: 12, color: "#66708C", marginTop: 6 }}>
          Version 0.3 · April 2025 · Jamie Chen
        </Text>

        {[
          {
            heading: "Overview",
            body: "This document outlines the product direction for the Opal Files feature, a persistent file layer that allows users to upload, organize, and reference documents directly within their Opal workspace.",
          },
          {
            heading: "Problem Statement",
            body: "Users currently paste context from working documents into Opal manually. There is no persistent file layer, no organization, and no way to connect existing repositories. This creates friction and makes agents less knowledgeable to set up.",
          },
          {
            heading: "Goals",
            body: "Enable users to systematically update personal context. Support team and org-level file sharing. Integrate with external repositories including Confluence, SharePoint, Notion, and Google Drive. Enforce tiered storage limits.",
          },
          {
            heading: "Out of Scope",
            body: "Real-time co-editing of documents, version conflict resolution, and offline access are not included in the initial release.",
          },
        ].map(({ heading, body }) => (
          <Box key={heading} mt="24">
            <Text style={{ fontSize: 14, fontWeight: 700, color: "#2E3442", marginBottom: 6 }}>{heading}</Text>
            <Text style={{ fontSize: 13, color: "#4F576E", lineHeight: 1.7 }}>{body}</Text>
          </Box>
        ))}

        <Box mt="48" pt="16" style={{ borderTop: "1px solid #DADFEB" }} display="flex" justifyContent="space-between">
          <Text style={{ fontSize: 10, color: "#838DA4" }}>Optimizely Internal — Do Not Distribute</Text>
          <Text style={{ fontSize: 10, color: "#838DA4" }}>Page 1 of 3</Text>
        </Box>
      </Box>
    </Box>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FilesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [treeData, setTreeData] = useState<FileNode[]>(INITIAL_FILE_TREE);
  const [selectedFileId, setSelectedFileId] = useState("1-1");
  const [activeContextTab, setActiveContextTab] = useState<"skills" | "files" | "memory" | "rag">("files");
  const activeTab = searchParams.get("tab") === "brand-packs" ? "brand-packs" : activeContextTab;
  const isBrandPacksTab = activeTab === "brand-packs";
  const [isEditing, setIsEditing] = useState(false);
  const [editorMode, setEditorMode] = useState<"source" | "preview">("preview");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewingVersionId, setViewingVersionId] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const contentPaneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = contentPaneRef.current;
    if (!el) return;
    const onScroll = (e: Event) => {
      setIsScrolled((e.target as Element).scrollTop > 20);
    };
    el.addEventListener("scroll", onScroll, true);
    return () => el.removeEventListener("scroll", onScroll, true);
  }, []);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const pendingEditRef = useRef(false);

  const initialExpandedSet = new Set(treeData.map((n) => n.id));
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(initialExpandedSet);

  const handleToggleFile = (id: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleFolderSelect = (childIds: string[]) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      const allSelected = childIds.every((id) => next.has(id));
      if (allSelected) childIds.forEach((id) => next.delete(id));
      else childIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleEditFile = (id: string) => {
    pendingEditRef.current = true;
    setSelectedFileId(id);
    setIsEditing(true);
    setTimeout(() => { pendingEditRef.current = false; }, 150);
  };

  const handleMoveToFolder = useCallback((fileId: string, targetFolderId: string) => {
    setTreeData((prev) => {
      // Find the file node
      let moved: FileNode | null = null;
      const removeFrom = (nodes: FileNode[]): FileNode[] =>
        nodes.map((n) => {
          if (n.children) {
            const idx = n.children.findIndex((c) => c.id === fileId);
            if (idx !== -1) {
              moved = n.children[idx];
              return { ...n, children: n.children.filter((c) => c.id !== fileId) };
            }
            return { ...n, children: removeFrom(n.children) };
          }
          return n;
        });
      const withoutFile = removeFrom(prev);
      if (!moved) return prev;
      const file = moved;
      const addTo = (nodes: FileNode[]): FileNode[] =>
        nodes.map((n) => {
          if (n.id === targetFolderId && n.type === "folder") {
            return { ...n, children: [...(n.children ?? []), file] };
          }
          if (n.children) return { ...n, children: addTo(n.children) };
          return n;
        });
      return addTo(withoutFile);
    });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deletingFileId) return;
    setTreeData((prev) => {
      const remove = (nodes: FileNode[]): FileNode[] =>
        nodes
          .filter((n) => n.id !== deletingFileId)
          .map((n) => n.children ? { ...n, children: remove(n.children) } : n);
      const next = removeEmptyFolders(remove(prev));
      if (!hasAnyFiles(next)) setSelectedFileId("");
      else if (selectedFileId === deletingFileId) setSelectedFileId("");
      return next;
    });
    setIsEditing(false);
    setDeletingFileId(null);
  }, [deletingFileId, selectedFileId]);

  const handleBulkDelete = useCallback(() => {
    if (selectedFiles.size === 0) return;
    const ids = selectedFiles;
    setTreeData((prev) => {
      const remove = (nodes: FileNode[]): FileNode[] =>
        nodes
          .filter((n) => !ids.has(n.id))
          .map((n) => n.children ? { ...n, children: remove(n.children) } : n);
      const next = removeEmptyFolders(remove(prev));
      if (!hasAnyFiles(next) || ids.has(selectedFileId)) setSelectedFileId("");
      return next;
    });
    setSelectedFiles(new Set());
    setIsEditing(false);
    setBulkMode(false);
  }, [selectedFiles, selectedFileId]);

  const handleToggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Only activate the upload overlay for external file drags (from OS), not internal tree drags
  const isExternalFileDrag = (e: React.DragEvent) => e.dataTransfer.types.includes("Files");

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    if (!isExternalFileDrag(e)) return;
    e.preventDefault();
    setDragCounter((c) => c + 1);
    setIsDragOver(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!isExternalFileDrag(e)) return;
    setDragCounter((c) => {
      const next = c - 1;
      if (next <= 0) setIsDragOver(false);
      return next;
    });
  }, []);
  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!isExternalFileDrag(e)) return;
    e.preventDefault();
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    if (!isExternalFileDrag(e)) return;
    e.preventDefault();
    setIsDragOver(false);
    setDragCounter(0);
  }, []);

  const treeHasFiles = hasAnyFiles(treeData);
  const selectedFile = findFileById(treeData, selectedFileId);
  const selectedFilename = selectedFile?.label ?? "";
  const selectedExt = selectedFilename.split(".").pop() ?? "md";
  const selectedContentType = selectedFile?.contentType ?? "markdown";
  const selectedMarkdown = FILE_CONTENT[selectedFileId] ?? "";

  return (
    <Box
      display="flex"
      flexDirection="column"
      style={{ height: "calc(100dvh - 48px)", overflow: "hidden" }}
    >
      {/* Collapsible header */}
      <Box
        px="32"
        style={{
          flexShrink: 0,
          background: "var(--ax-colors-bg-page)",
          transition: "padding 0.2s ease",
          paddingTop: isScrolled ? 12 : 24,
          paddingBottom: isScrolled ? 12 : 0,
        }}
      >
        {/* Page heading — hides on scroll */}
        <Box
          style={{
            overflow: "hidden",
            maxHeight: isScrolled ? 0 : 120,
            opacity: isScrolled ? 0 : 1,
            marginBottom: isScrolled ? 0 : 16,
            transition: "max-height 0.2s ease, opacity 0.15s ease, margin-bottom 0.2s ease",
          }}
        >
          <Box display="flex" flexDirection="column" gap="8">
            <Heading level="1">Context</Heading>
            <Text color="fg.secondary">
              Tailor Opal&apos;s output for yourself or your organization by providing specific context and guidance in the form of files, skills, memory, and RAG.
            </Text>
          </Box>
        </Box>

        {/* Tabs */}
        <Box display="flex" gap="24" borderB="1" borderColor="border.tertiary" mb="16">
          {(["skills", "files", "brand-packs", "rag"] as const).map((tab) => (
            <Box
              key={tab}
              pb="12"
              cursor="pointer"
              borderB={activeTab === tab ? "2" : "0"}
              borderColor={activeTab === tab ? "border.default" : "transparent"}
              onClick={() => {
                if (tab === "brand-packs") {
                  router.push("/opal/context?tab=brand-packs");
                } else {
                  setActiveContextTab(tab);
                  router.push("/opal/context");
                }
              }}
              style={activeTab === tab ? { borderBottomColor: "var(--ax-colors-fg-default)" } : {}}
            >
              <Text
                fontWeight={activeTab === tab ? "500" : "400"}
                color={activeTab === tab ? "fg.default" : "fg.secondary"}
              >
                {tab === "rag" ? "RAG" : tab === "brand-packs" ? "Brand Packs" : tab === "files" ? "Memory" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Filter bar */}
        {!isBrandPacksTab && (
          <Box display="flex" gap="12" alignItems="center">
            <Box style={{ flex: 1, maxWidth: 264 }}>
              <SearchInput size="lg" placeholder="Search files..." />
            </Box>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <LabelMenuButton label="File Type">All</LabelMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>All</DropdownMenuItem>
                <DropdownMenuSeparator />
                {[
                  { label: "Documents",    sub: "PDF, Word, Markdown, HTML" },
                  { label: "Spreadsheets", sub: "CSV, Excel" },
                  { label: "Media",        sub: "PNG, JPEG, GIF, WebP, SVG" },
                  { label: "Code",         sub: "JS, TS, HTML, CSS" },
                ].map(({ label, sub }) => (
                  <DropdownMenuItem key={label}>
                    <Box display="flex" flexDirection="column" gap="2" style={{ alignItems: "flex-start" }}>
                      <Text fontSize="sm" fontWeight="500">{label}</Text>
                      <Text fontSize="xs" color="fg.tertiary">{sub}</Text>
                    </Box>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <LabelMenuButton label="Owner">Jamie Chen (You)</LabelMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {["Jamie Chen (You)", "Organization"].map((o) => (
                  <DropdownMenuItem key={o}>{o}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Box style={{ flex: 1 }} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button appearance="primary" size="lg" icon={<IconAngleDown />} iconPosition="end">
                  Add
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Box display="flex" alignItems="center" gap="8">
                    <IconUpload size={14} />
                    Upload Files
                  </Box>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Box display="flex" alignItems="center" gap="8">
                    <IconFile size={14} />
                    New File
                  </Box>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Box display="flex" alignItems="center" gap="8">
                    <IconFolder size={14} />
                    New Folder
                  </Box>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Box>
        )}
      </Box>

      {/* Content body */}
      {isBrandPacksTab ? (
        <Box style={{ flex: 1, minHeight: 0 }}>
          <BrandPacksOverview embedded />
        </Box>
      ) : (
      <Box
        px="32"
        pt="16"
        pb="16"
        style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
      >
      <Box
        display="flex"
        flexDirection="row"
        gap="12"
        style={{ flex: 1, minHeight: 0 }}
      >
        {/* Left file tree panel */}
        <Box
          display={isMaximized ? "none" : "flex"}
          flexDirection="column"
          bg="bg.default"
          rounded="lg"
          border="1"
          borderColor={isDragOver ? "border.accent" : "border.secondary"}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{ width: 264, flexShrink: 0, overflow: "hidden", position: "relative", transition: "border-color 0.15s" }}
        >
          {/* Tree header */}
          <Box
            display="flex"
            alignItems="center"
            py="10"
            pl="12"
            pr="8"
            gap="8"
            borderB="1"
            borderColor="border.secondary"
          >
            <Text fontWeight="500" fontSize="md" color="fg.default" style={{ flex: 1 }}>Files</Text>
            {bulkMode && selectedFiles.size > 0 && (
              <>
                <Text fontSize="xs" color="fg.tertiary" style={{ flexShrink: 0 }}>{selectedFiles.size} selected</Text>
                <Tooltip delayDuration={300} content="Move to folder">
                  <span>
                    <Button appearance="subtle" size="sm" icon={<IconFolderArrowDown size={13} />} aria-label="Move" />
                  </span>
                </Tooltip>
                <Tooltip delayDuration={300} content="Download">
                  <span>
                    <Button appearance="subtle" size="sm" icon={<IconDownload size={13} />} aria-label="Download" />
                  </span>
                </Tooltip>
                <Tooltip delayDuration={300} content="Delete">
                  <span>
                    <Button
                      appearance="subtle"
                      size="sm"
                      icon={<IconTrashCan size={13} />}
                      aria-label="Delete"
                      style={{ color: "var(--ax-colors-fg-danger)" }}
                      onClick={handleBulkDelete}
                    />
                  </span>
                </Tooltip>
              </>
            )}
            <Button
              appearance="subtle"
              size="sm"
              onClick={() => { setBulkMode((v) => !v); setSelectedFiles(new Set()); }}
              style={bulkMode ? { background: "var(--ax-colors-bg-secondary)" } : undefined}
            >
              {bulkMode ? "Done" : "Select"}
            </Button>
          </Box>

          {/* Tree body */}
          <Box
            display="flex"
            flexDirection="column"
            p="8"
            gap="4"
            style={{ flex: 1, overflowY: "auto" }}
          >
            {bulkMode && (() => {
              const allIds = getAllFileIds(treeData);
              const allSelected = allIds.length > 0 && allIds.every((id) => selectedFiles.has(id));
              return (
                <Box
                  display="flex"
                  alignItems="center"
                  px="4"
                  py="2"
                  borderB="1"
                  borderColor="border.secondary"
                  style={{ marginBottom: 4 }}
                >
                  <Button
                    appearance="subtle"
                    size="sm"
                    onClick={() => {
                      if (allSelected) setSelectedFiles(new Set());
                      else setSelectedFiles(new Set(allIds));
                    }}
                  >
                    {allSelected ? "Deselect all" : "Select all"}
                  </Button>
                </Box>
              );
            })()}
            {!treeHasFiles && (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                style={{ flex: 1, paddingTop: 32 }}
              >
                <Text fontSize="sm" color="fg.tertiary">No files found</Text>
              </Box>
            )}
            <FileTree
              tree={treeData}
              selectedId={selectedFileId}
              onSelect={(id) => {
                setSelectedFileId(id);
                if (!pendingEditRef.current) setIsEditing(false);
              }}
              expandedFolders={expandedFolders}
              onToggleFolder={handleToggleFolder}
              bulkMode={bulkMode}
              selectedFiles={selectedFiles}
              onToggleFile={handleToggleFile}
              onToggleFolderSelect={handleToggleFolderSelect}
              onEditFile={handleEditFile}
              onDropToFolder={handleMoveToFolder}
              onDeleteFile={(id) => setDeletingFileId(id)}
            />
          </Box>

          {/* Drop zone */}
          <Box px="8" pb="8" style={{ flexShrink: 0 }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap="6"
              py="6"
              rounded="md"
              style={{ border: "1.5px dashed var(--ax-colors-border-secondary)" }}
            >
              <IconFileArrowUp size={13} color="var(--ax-colors-fg-tertiary)" />
              <Text fontSize="sm" color="fg.tertiary">Drop files here to upload</Text>
            </Box>
          </Box>

          {/* Drag overlay */}
          {isDragOver && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              gap="8"
              rounded="lg"
              style={{ position: "absolute", inset: 0, zIndex: 10, border: "2px dashed var(--ax-colors-border-accent)", pointerEvents: "none", background: "var(--ax-colors-bg-accent-subtle)" }}
            >
              <IconFileArrowUp size={24} color="var(--ax-colors-fg-accent)" />
              <Text fontSize="sm" fontWeight="500" color="fg.accent">Drop files to upload</Text>
            </Box>
          )}

          {/* Storage footer */}
          <Box
            display="flex"
            flexDirection="column"
            gap="6"
            px="12"
            py="10"
            borderT="1"
            borderColor="border.secondary"
            style={{ flexShrink: 0 }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Badge intent="neutral" style={{ fontSize: 10, padding: "1px 6px" }}>Essential</Badge>
              <Text fontSize="xs" color="fg.tertiary">{treeHasFiles ? "2.4 MB" : "0 MB"} / 2 GB</Text>
            </Box>
            <Progress value={treeHasFiles ? 2.4 : 0} max={2048} />
          </Box>
        </Box>

        {/* Right preview/edit area */}
        <Box
          display="flex"
          flexDirection="column"
          bg="bg.default"
          rounded={isMaximized ? undefined : "lg"}
          border="1"
          borderColor="border.secondary"
          style={isMaximized
            ? { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, overflow: "hidden" }
            : { flex: 1, minWidth: 0, overflow: "hidden" }
          }
        >
          {!treeHasFiles ? (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              style={{ height: "100%", padding: "40px" }}
            >
              <FileUpload w="384" onFilesDrop={() => {}}>
                <FileUploadDropzone description="PDF, Word, Markdown, CSV, images and more" />
              </FileUpload>
            </Box>
          ) : (
          <>
          {/* Panel header */}
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            pl="20"
            pr="12"
            py="8"
            borderB="1"
            borderColor="border.secondary"
            style={{ flexShrink: 0 }}
          >
            <Box display="flex" alignItems="center" gap="8">
              <FileTypeBadge ext={selectedExt} />
              <Text fontWeight="500" fontSize="md" color="fg.default">
                {selectedFilename.replace(/\.[^.]+$/, "")}
              </Text>
              <Badge intent={isEditing ? "neutral" : "success"}>
                {isEditing ? "Editing" : "Saved"}
              </Badge>
              {selectedContentType === "markdown" && (
                <>
                  <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0, margin: "0 4px" }} />
                  <Box display="flex" alignItems="center" gap="4">
                    <Tooltip content="Source" delayDuration={400}>
                      <span>
                        <ToggleButton
                          size="md"
                          appearance="subtle"
                          pressed={editorMode === "source"}
                          onPressedChange={() => setEditorMode("source")}
                          icon={<IconCode size={15} />}
                          aria-label="Source"
                        />
                      </span>
                    </Tooltip>
                    <Tooltip content="Preview" delayDuration={400}>
                      <span>
                        <ToggleButton
                          size="md"
                          appearance="subtle"
                          pressed={editorMode === "preview"}
                          onPressedChange={() => setEditorMode("preview")}
                          icon={<IconEye size={15} />}
                          aria-label="Preview"
                        />
                      </span>
                    </Tooltip>
                  </Box>
                </>
              )}
            </Box>

            <Box display="flex" alignItems="center" gap="8">
              {isEditing ? (
                <>
                  <Button
                    appearance="subtle"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    appearance="primary"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Save
                  </Button>
                </>
              ) : (
                selectedContentType !== "image" && (
                  <Tooltip delayDuration={300} content="Edit">
                    <span>
                      <Button
                        appearance="subtle"
                        size="sm"
                        icon={<IconPen size={14} />}
                        aria-label="Edit"
                        onClick={() => setIsEditing(true)}
                      />
                    </span>
                  </Tooltip>
                )
              )}
              {selectedContentType === "image" && (
                <Tooltip delayDuration={300} content="Download">
                  <span>
                    <Button
                      appearance="subtle"
                      size="sm"
                      icon={<IconDownload size={14} />}
                      aria-label="Download"
                    />
                  </span>
                </Tooltip>
              )}
              <Tooltip delayDuration={300} content={isMaximized ? "Restore" : "Expand"}>
                <span>
                  <Button
                    appearance="subtle"
                    size="sm"
                    icon={isMaximized ? <IconArrowsMinimize size={14} /> : <IconArrowsMaximize size={14} />}
                    aria-label={isMaximized ? "Restore" : "Expand"}
                    onClick={() => setIsMaximized((v) => !v)}
                    style={isMaximized ? { background: "var(--ax-colors-bg-secondary)" } : undefined}
                  />
                </span>
              </Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <span>
                    <Button
                      appearance="subtle"
                      size="sm"
                      icon={<IconEllipsisSolid size={14} />}
                      aria-label="More"
                    />
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Box display="flex" alignItems="center" gap="8">
                      <IconPen size={13} />
                      Rename
                    </Box>
                  </DropdownMenuItem>
                  {selectedContentType !== "image" && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Box display="flex" alignItems="center" gap="8">
                        <IconFile size={13} />
                        Edit
                      </Box>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem>
                    <Box display="flex" alignItems="center" gap="8">
                      <IconDownload size={13} />
                      Download
                    </Box>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setDetailsOpen(true)}>
                    <Box display="flex" alignItems="center" gap="8">
                      <IconClockRotateLeft size={13} />
                      Version history
                    </Box>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeletingFileId(selectedFileId)}
                    intent="danger"
                  >
                    <Box display="flex" alignItems="center" gap="8">
                      <IconTrashCan size={13} />
                      Delete
                    </Box>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Box>
          </Box>

          {/* Content + VersionHistory row */}
          <Box
            display="flex"
            flexDirection="row"
            style={{ flex: 1, minHeight: 0, overflow: "hidden" }}
          >
            <Box ref={contentPaneRef} style={{ flex: 1, minWidth: 0, overflow: "hidden", height: "100%" }}>
              {selectedContentType === "pdf" ? (
                isEditing ? (
                  <PdfEditView key={selectedFileId} />
                ) : (
                  <PdfPreview key={selectedFileId} />
                )
              ) : selectedContentType === "image" ? (
                <ImagePreview key={selectedFileId} />
              ) : selectedContentType === "spreadsheet" ? (
                <SpreadsheetPreview key={selectedFileId} />
              ) : selectedContentType === "csv" ? (
                <CsvPreview key={selectedFileId} />
              ) : selectedContentType === "word" ? (
                <WordPreview key={selectedFileId} />
              ) : editorMode === "source" ? (
                <MarkdownSourceView key={selectedFileId} markdown={selectedMarkdown} />
              ) : isEditing ? (
                <CollaborativeEditorPanel
                  key={selectedFileId}
                  open={true}
                  onClose={() => setIsEditing(false)}
                  filename={selectedFilename}
                  fileType="markdown"
                  fluid={true}
                  initialMarkdown={selectedMarkdown}
                />
              ) : (
                <TiptapPreview key={selectedFileId} markdown={selectedMarkdown} fileId={selectedFileId} />
              )}
            </Box>

            <VersionHistory
              isOpen={detailsOpen}
              onClose={() => setDetailsOpen(false)}
              versions={VERSIONS}
              viewingVersionId={viewingVersionId}
              onViewVersion={(id) => setViewingVersionId(id)}
              onRestoreVersion={() => setViewingVersionId(null)}
              onDuplicateVersion={() => {}}
              onHideVersion={() => {}}
              onNameVersion={() => {}}
              onCompareVersion={() => {}}
              onExitVersionView={() => setViewingVersionId(null)}
            />
          </Box>
          </>
          )}
        </Box>
      </Box>
      </Box>
      )}

      {/* Share dialog */}
      <OpalShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        artifactTitle={selectedFilename.replace(/\.[^.]+$/, "")}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={!!deletingFileId} onOpenChange={(open) => { if (!open) setDeletingFileId(null); }}>
        <DialogContent>
          <DialogHeader>Delete file?</DialogHeader>
          <DialogBody>
            <Text color="fg.secondary">
              {(() => {
                const f = deletingFileId ? findFileById(treeData, deletingFileId) : null;
                return f ? `"${f.label.replace(/\.[^.]+$/, "")}" will be permanently deleted and cannot be recovered.` : "This file will be permanently deleted and cannot be recovered.";
              })()}
            </Text>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button appearance="subtle">Cancel</Button>
            </DialogClose>
            <Button appearance="danger" onClick={handleConfirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
