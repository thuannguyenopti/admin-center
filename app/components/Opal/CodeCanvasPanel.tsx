"use client";

import {
  Box, Button, ToggleButton, Tooltip, Avatar, Badge, Menu, MenuContent, MenuTrigger, toaster,
  Dialog, DialogContent, DialogBody, DialogClose, DialogFooter, DialogHeader,
  Select, SelectContent, SelectTrigger,
  Field, Checkbox,
  Text as AxiomText,
} from "@optiaxiom/react";
import { Pill } from "@optiaxiom/react/unstable";
import { Text } from "../Text";
import {
  IconXmark,
  IconCode,
  IconEye,
  IconPen,
  IconCopy,
  IconDownload,
  IconChevronDown,
  IconArrowRotateLeft,
  IconCircleCheck,
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconListUl,
  IconListOl,
  IconQuoteRight,
  IconLink,
  IconFileWord,
  IconFilePdf,
  IconFileLines,
  IconFile,
  IconClockRotateLeft,
  IconUserGroup,
  IconArrowRotateRight,
  IconFloppyDisk,
  IconArrowLeft,
  IconCirclePlus,
  IconAgent,
  IconCodeBranch,
  IconComments,
  IconEllipsisSolid,
  IconUserPlus,
  IconUsers,
  IconGlobe,
  IconShieldCheck,
  IconTrashCan,
  IconLock,
} from "@optiaxiom/icons";
import { useState, useCallback, useEffect, useRef, type ReactNode, type KeyboardEvent } from "react";
import dynamic from "next/dynamic";
import { InitialsAvatar, initialsFromName } from "@/app/opal/components/InitialsAvatar";
import { useCollabDoc } from "./editor/useCollabDoc";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import type { EditorFileType } from "./EditorOutputCard";
import type { CodeMirrorLanguage } from "./editor/CodeMirrorEditor";
import { BlameEngine, type BlameSegment } from "./editor/collab/blame-engine";
import { createBlamePlugin, blamePluginKey } from "./editor/collab/blame-tiptap-plugin";
import { LocalVersionManager, type LocalVersion, type DiffLine } from "./editor/collab/local-version-manager";
import { computeLineDiff } from "./editor/collab/diff-engine";
import { createCollabCursorPlugin, collabCursorKey, type CollabCursor } from "./editor/collab-cursor-plugin";

const CodeMirrorEditor = dynamic(
  () => import("./editor/CodeMirrorEditor").then((m) => m.CodeMirrorEditor),
  { ssr: false }
);

type CanvasMode = "source" | "preview";

type CodeCanvasPanelProps = {
  onClose: () => void;
  filename?: string;
  fileType?: EditorFileType;
  language?: CodeMirrorLanguage;
  artifactTitle?: string;
  artifactStatus?: string;
  artifactVersion?: string;
  artifactSource?: { type: string; name: string };
  artifactCreator?: { name: string };
  contentNode?: ReactNode;
  initialHtml?: string;
  chatOpen?: boolean;
  onChatToggle?: () => void;
};

// ── Example HTML content ──────────────────────────────────────────────────────

const EXAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Product Landing Page</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; }
    .hero { background: linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%); color: white; padding: 80px 24px; text-align: center; }
    .hero h1 { font-size: 48px; font-weight: 700; line-height: 1.15; margin-bottom: 20px; }
    .hero p { font-size: 20px; opacity: 0.85; max-width: 560px; margin: 0 auto 36px; }
    .hero .cta { display: inline-block; background: white; color: #6d28d9; padding: 14px 36px; border-radius: 8px; font-weight: 600; font-size: 16px; text-decoration: none; }
    .features { padding: 64px 24px; max-width: 960px; margin: 0 auto; }
    .features h2 { text-align: center; font-size: 32px; font-weight: 700; margin-bottom: 48px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
    .card { padding: 28px; border: 1px solid #e5e7eb; border-radius: 12px; }
    footer { background: #f9fafb; padding: 32px 24px; text-align: center; color: #9ca3af; font-size: 14px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <section class="hero">
    <h1>Build something people love</h1>
    <p>The fastest way to launch, test, and optimize your product with AI-powered insights.</p>
    <a href="#" class="cta">Get started free →</a>
  </section>
  <section class="features">
    <h2>Everything you need to grow</h2>
    <div class="grid">
      <div class="card"><div class="icon">⚡</div><h3>Lightning fast</h3><p>Deploy in minutes, not months.</p></div>
      <div class="card"><div class="icon">🎯</div><h3>Data-driven</h3><p>Make decisions backed by real user behavior.</p></div>
      <div class="card"><div class="icon">🔒</div><h3>Enterprise-ready</h3><p>SOC 2 compliant, SSO support, RBAC.</p></div>
    </div>
  </section>
  <footer><p>© 2025 Your Company · All rights reserved.</p></footer>
</body>
</html>`;

const WYSIWYG_CONTENT = `<h1>Build something people love</h1>
<p>The fastest way to launch, test, and optimize your product with AI-powered insights.</p>
<h2>Everything you need to grow</h2>
<h3>⚡ Lightning fast</h3>
<p>Deploy in minutes, not months. Our platform handles the heavy lifting so you can focus on what matters.</p>
<h3>🎯 Data-driven</h3>
<p>Make decisions backed by real user behavior. Built-in A/B testing and analytics out of the box.</p>
<h3>🔒 Enterprise-ready</h3>
<p>SOC 2 compliant, SSO support, and role-based access control — built for teams of any size.</p>`;

type CollabUser =
  | { name: string; type: "ai"; src: string }
  | { name: string; type: "human"; colorScheme: "purple" | "neutral"; lightPurple?: boolean; imageUrl?: string };

const COLLAB_USERS: CollabUser[] = [
  { name: "Frank", type: "ai", src: "/avatars/vau-frank.png" },
  { name: "Jamie Chen", type: "human", colorScheme: "purple", lightPurple: true, imageUrl: "/avatars/avatar-3.png" },
  { name: "James S.", type: "human", colorScheme: "purple" },
  { name: "Mary Anne", type: "human", colorScheme: "neutral", imageUrl: "/avatars/avatar-2.png" },
];

const MOCK_CURSORS: CollabCursor[] = [
  { id: "jc", name: "Jamie Chen", color: "#7c3aed", position: 80 },
  { id: "js", name: "James S.", color: "#2563eb", position: 260 },
];

// ── Blame segment helpers ─────────────────────────────────────────────────────

/** Split `text` into 3 mock-attributed regions. */
function mockSegments(text: string): BlameSegment[] {
  const len = text.length;
  if (len === 0) return [];
  const third = Math.floor(len / 3);
  return [
    { start: 0,         end: third,     userName: "Mary K."  },
    { start: third,     end: third * 2, userName: "James S." },
    { start: third * 2, end: len,       userName: "You"      },
  ];
}

/**
 * Rebuild segments whenever the doc changes.
 * Content that existed at blame-activation time → mock 3-way split.
 * Any new/changed content since then → attributed to "You".
 */
function buildBlameSegments(baselineText: string, currentText: string): BlameSegment[] {
  if (!currentText) return [];

  // Find how much of the start is still identical to baseline (common prefix)
  let commonLen = 0;
  const maxCommon = Math.min(baselineText.length, currentText.length);
  while (commonLen < maxCommon && baselineText[commonLen] === currentText[commonLen]) commonLen++;

  // Pure deletion with no additions — re-split the remaining text
  if (currentText.length <= baselineText.length && commonLen === currentText.length) {
    return mockSegments(currentText);
  }

  // Common prefix → mock attribution; everything from commonLen onward → "You"
  const segs: BlameSegment[] = mockSegments(currentText.slice(0, commonLen));
  if (currentText.length > commonLen) {
    segs.push({ start: commonLen, end: currentText.length, userName: "You" });
  }
  return segs;
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const BORDER = "1px solid var(--ax-colors-border-secondary)";

const WYSIWYG_STYLES = `
@keyframes collab-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
.tiptap-canvas .tiptap { outline: none; font-size: 14px; line-height: 1.75; color: var(--ax-colors-fg-default); font-family: var(--ax-fonts-sans, system-ui, sans-serif); }
.tiptap-canvas .tiptap > * + * { margin-top: 0.75em; }
.tiptap-canvas .tiptap h1 { font-size: 22px; font-weight: 700; line-height: 1.3; }
.tiptap-canvas .tiptap h2 { font-size: 18px; font-weight: 600; line-height: 1.4; }
.tiptap-canvas .tiptap h3 { font-size: 15px; font-weight: 600; }
.tiptap-canvas .tiptap p { margin: 0; }
.tiptap-canvas .tiptap ul, .tiptap-canvas .tiptap ol { padding-left: 1.4em; }
.tiptap-canvas .tiptap blockquote { border-left: 3px solid var(--ax-colors-border-accent); padding-left: 12px; color: var(--ax-colors-fg-secondary); font-style: italic; margin: 0; }
.tiptap-canvas .tiptap code { background: var(--ax-colors-bg-secondary); border-radius: 4px; padding: 1px 5px; font-size: 12px; }
.tiptap-canvas .tiptap pre { background: var(--ax-colors-bg-secondary); border-radius: 8px; padding: 12px 16px; overflow-x: auto; }
.tiptap-canvas .tiptap pre code { background: none; padding: 0; font-size: 13px; }
`;

function FmtBtn({ title, active, onClick, children }: { title: string; active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 26,
        height: 26,
        flexShrink: 0,
        padding: 0,
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        background: active ? "var(--ax-colors-bg-accent-subtle)" : "transparent",
        color: active ? "var(--ax-colors-fg-accent)" : "var(--ax-colors-fg-default)",
      }}
    >
      {children}
    </button>
  );
}
function FmtDivider() {
  return <span style={{ display: "inline-block", width: 1, height: 16, background: "var(--ax-colors-border-secondary)", margin: "0 4px", flexShrink: 0, alignSelf: "center" }} />;
}

// ── WYSIWYG panel ─────────────────────────────────────────────────────────────

function WysiwygPanel({ initialHtml, editable = true, blameSegments, onContentChange }: { initialHtml: string; editable?: boolean; blameSegments?: BlameSegment[]; onContentChange?: (text: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight: createLowlight(common) }),
      Extension.create({ name: "blame", addProseMirrorPlugins: () => [createBlamePlugin()] }),
      Extension.create({ name: "collabCursor", addProseMirrorPlugins: () => [createCollabCursorPlugin(MOCK_CURSORS)] }),
    ],
    content: initialHtml,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => {
      onContentChange?.(e.getText());
    },
  });

  // Keep Tiptap's editable state in sync with the prop
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  // Push blame decorations into TipTap when segments change
  useEffect(() => {
    if (!editor) return;
    editor.view.dispatch(
      editor.view.state.tr.setMeta(blamePluginKey, blameSegments && blameSegments.length > 0 ? blameSegments : null)
    );
  }, [editor, blameSegments]);

  // Simulate live cursor movement
  useEffect(() => {
    if (!editor) return;
    const tick = setInterval(() => {
      const maxPos = editor.state.doc.content.size;
      if (maxPos < 20) return;
      const updated: CollabCursor[] = [
        { id: "jc", name: "Jamie Chen", color: "#7c3aed", position: Math.min(maxPos - 1, Math.floor(Math.random() * maxPos * 0.45) + 15) },
        { id: "js", name: "James S.", color: "#2563eb", position: Math.min(maxPos - 1, Math.floor(Math.random() * maxPos * 0.4) + Math.floor(maxPos * 0.5)) },
      ];
      editor.view.dispatch(editor.view.state.tr.setMeta(collabCursorKey, updated));
    }, 2800);
    return () => clearInterval(tick);
  }, [editor]);

  if (!editor) return null;

  return (
    <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Formatting toolbar + avatars — formatting buttons hide in preview, avatars always visible */}
      <Box display="flex" alignItems="center" px="8" style={{ flexShrink: 0, height: 40, gap: 2, overflowX: "auto" }}>
        {editable && (
          <>
            <FmtBtn title="H1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><span style={{ fontWeight: 700, fontSize: 13, fontFamily: "monospace" }}>H1</span></FmtBtn>
            <FmtBtn title="H2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><span style={{ fontWeight: 700, fontSize: 13, fontFamily: "monospace" }}>H2</span></FmtBtn>
            <FmtBtn title="H3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><span style={{ fontWeight: 700, fontSize: 13, fontFamily: "monospace" }}>H3</span></FmtBtn>
            <FmtDivider />
            <FmtBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><IconBold size={15} /></FmtBtn>
            <FmtBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><IconItalic size={15} /></FmtBtn>
            <FmtBtn title="Strike" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><IconStrikethrough size={15} /></FmtBtn>
            <FmtBtn title="Code" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><IconCode size={15} /></FmtBtn>
            <FmtDivider />
            <FmtBtn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><IconListUl size={15} /></FmtBtn>
            <FmtBtn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><IconListOl size={15} /></FmtBtn>
            <FmtBtn title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><IconQuoteRight size={15} /></FmtBtn>
            <FmtBtn title="Link"><IconLink size={15} /></FmtBtn>
          </>
        )}
        <Box style={{ flex: 1 }} />
        <Box display="flex" alignItems="center" style={{ gap: 0, flexShrink: 0 }}>
          {COLLAB_USERS.map((u, i) => (
            <Tooltip key={u.name} content={u.name} delayDuration={300}>
              <span style={{ marginLeft: i > 0 ? -6 : 0, zIndex: COLLAB_USERS.length - i, position: "relative", display: "inline-flex" }}>
                {u.type === "ai" ? (
                  <span style={{ width: 24, height: 24, borderRadius: "50%", overflow: "hidden", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--ax-colors-bg-default)", flexShrink: 0 }}>
                    <img src={u.src} alt={u.name} width={24} height={24} style={{ display: "block", borderRadius: "50%" }} />
                  </span>
                ) : (
                  <InitialsAvatar initials={initialsFromName(u.name)} size={24} imageUrl={u.imageUrl} />
                )}
              </span>
            </Tooltip>
          ))}
        </Box>
      </Box>
      <Box style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "24px 32px" }}>
        <style>{WYSIWYG_STYLES}</style>
        <div className="tiptap-canvas"><EditorContent editor={editor} /></div>
      </Box>
    </Box>
  );
}

// ── Version History Panel ─────────────────────────────────────────────────────

function VersionHistoryPanel({
  versions,
  onSave,
  onRevert,
  onClose,
}: {
  versions: LocalVersion[];
  onSave: () => void;
  onRevert: (v: LocalVersion) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<LocalVersion | null>(null);
  const [diff, setDiff] = useState<DiffLine[] | null>(null);
  const [diffBase, setDiffBase] = useState<LocalVersion | null>(null);

  function handleSelect(v: LocalVersion) {
    if (selected?.id === v.id) { setSelected(null); setDiff(null); setDiffBase(null); return; }
    setSelected(v);
    setDiff(null);
    setDiffBase(null);
  }

  function handleDiff(v: LocalVersion) {
    // Diff against the next older version, or against itself if only one
    const idx = versions.indexOf(v);
    const base = versions[idx + 1] ?? v;
    setDiff(computeLineDiff(base.content, v.content));
    setDiffBase(base);
    setSelected(v);
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      bg="bg.default"
      style={{
        position: "absolute", top: 0, right: 0, bottom: 0,
        width: 320, zIndex: 10,
        borderLeft: BORDER,
        boxShadow: "-4px 0 12px var(--ax-colors-border-secondary)",
      }}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" px="16" py="12" style={{ borderBottom: BORDER, flexShrink: 0, gap: 8 }}>
        <IconClockRotateLeft size={15} style={{ color: "var(--ax-colors-fg-secondary)", flexShrink: 0 }} />
        <Text fontSize="sm" fontWeight="600" style={{ flex: 1 }}>Version History</Text>
        <Tooltip content="Save current version" delayDuration={300}>
          <span style={{ display: "inline-flex" }}>
            <Button appearance="subtle" size="sm" icon={<IconFloppyDisk size={14} />} onClick={onSave}>Save</Button>
          </span>
        </Tooltip>
        <Button appearance="subtle" size="sm" icon={<IconXmark size={14} />} aria-label="Close" onClick={onClose} />
      </Box>

      {/* Version list */}
      <Box style={{ flex: 1, overflowY: "auto" }}>
        {versions.map((v) => {
          const isSelected = selected?.id === v.id;
          return (
            <Box
              key={v.id}
              display="flex"
              flexDirection="column"
              px="16"
              py="10"
              style={{
                borderBottom: "1px solid var(--ax-colors-border-tertiary)",
                cursor: "pointer",
                background: isSelected ? "var(--ax-colors-bg-accent-subtle)" : "transparent",
                transition: "background 0.1s",
              }}
              onClick={() => handleSelect(v)}
            >
              <Box display="flex" alignItems="center" gap="8">
                <Badge intent={v.type === "manual" ? "neutral" : "information"} style={{ flexShrink: 0 }}>
                  {v.type === "manual" ? "Manual" : "Auto"}
                </Badge>
                <Text fontSize="xs" color="fg.tertiary" style={{ flex: 1 }}>{formatDate(v.created_at)}</Text>
                {/* Diff + Revert actions on hover */}
                {isSelected && (
                  <Box display="flex" gap="4" onClick={(e) => e.stopPropagation()}>
                    <Tooltip content="Compare with previous" delayDuration={300}>
                      <span style={{ display: "inline-flex" }}>
                        <Button appearance="subtle" size="sm" icon={<IconCode size={12} />} aria-label="Diff" onClick={() => handleDiff(v)} />
                      </span>
                    </Tooltip>
                    <Tooltip content="Restore this version" delayDuration={300}>
                      <span style={{ display: "inline-flex" }}>
                        <Button appearance="subtle" size="sm" icon={<IconArrowRotateLeft size={12} />} aria-label="Restore" onClick={() => { onRevert(v); onClose(); }} />
                      </span>
                    </Tooltip>
                  </Box>
                )}
              </Box>
              {v.label && <Text fontSize="xs" fontWeight="500" style={{ marginTop: 2 }}>{v.label}</Text>}
              <Text fontSize="xs" color="fg.tertiary" style={{ marginTop: 2 }}>by {v.creator}</Text>
            </Box>
          );
        })}
      </Box>

      {/* Diff view */}
      {diff && selected && (
        <Box style={{ borderTop: BORDER, flexShrink: 0 }}>
          {/* Diff header */}
          <Box display="flex" alignItems="center" px="12" py="8" gap="8" style={{ borderBottom: BORDER }}>
            <Button appearance="subtle" size="sm" icon={<IconArrowLeft size={12} />} aria-label="Back" onClick={() => { setDiff(null); setDiffBase(null); }} />
            <Text fontSize="xs" color="fg.secondary" style={{ flex: 1 }}>
              vs. {diffBase?.label ?? formatDate(diffBase?.created_at ?? '')}
            </Text>
            <Box display="flex" gap="6" alignItems="center">
              <Box style={{ width: 8, height: 8, borderRadius: 2, background: "var(--ax-colors-fg-success)", flexShrink: 0 }} />
              <Text fontSize="xs" color="fg.tertiary">{diff.filter(d => d.type === 'added').length}</Text>
              <Box style={{ width: 8, height: 8, borderRadius: 2, background: "var(--ax-colors-fg-error)", flexShrink: 0 }} />
              <Text fontSize="xs" color="fg.tertiary">{diff.filter(d => d.type === 'removed').length}</Text>
            </Box>
          </Box>
          {/* Diff lines */}
          <Box style={{ maxHeight: 260, overflowY: "auto", fontFamily: "var(--ax-fonts-mono, monospace)", fontSize: 11 }}>
            {diff.map((line, i) => (
              <Box
                key={i}
                display="flex"
                gap="8"
                px="12"
                style={{
                  lineHeight: "18px",
                  background: line.type === 'added' ? "var(--ax-colors-bg-success-subtle)" : line.type === 'removed' ? "var(--ax-colors-bg-error-subtle)" : "transparent",
                  color: line.type === 'added' ? "var(--ax-colors-fg-success)" : line.type === 'removed' ? "var(--ax-colors-fg-error)" : "var(--ax-colors-fg-secondary)",
                  whiteSpace: "pre",
                  overflowX: "hidden",
                }}
              >
                <span style={{ flexShrink: 0, opacity: 0.5, minWidth: 16, textAlign: "right" }}>
                  {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                </span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{line.content || ' '}</span>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ── Share dialog ──────────────────────────────────────────────────────────────

type PermissionRole = "Owner" | "Admin" | "Editor" | "Viewer" | "None";

type AccessSubject = {
  id: string;
  name: string;
  detail: string;
  role: PermissionRole;
  kind: "user" | "team" | "org" | "vau";
  colorScheme: "purple" | "neutral";
  avatar?: string;
  avatarName?: string;
  badges?: string[];
};

// Rows with system status (Owner, Principal, or org-level) appear in the top card.
function isTopCardRow(subject: AccessSubject): boolean {
  return (
    subject.role === "Owner" ||
    subject.kind === "org" ||
    !!subject.badges?.includes("Principal")
  );
}

const ROLE_OPTIONS = [
  { label: "Can manage", value: "Admin", description: "Can change content, share access, and remove the artifact." },
  { label: "Can edit",   value: "Editor", description: "Can change content and share with others." },
  { label: "Can view",   value: "Viewer", description: "Can open and comment on the artifact." },
] as const;

// Org-wide audiences (e.g. "Anyone in Stride") cannot be granted manage rights,
// but can be set to no access without removing the row.
const ORG_ROLE_OPTIONS = [
  { label: "Can edit",  value: "Editor",  description: "Can change content and share with others." },
  { label: "Can view",  value: "Viewer",  description: "Can open and comment on the artifact." },
  { label: "No access", value: "None",    description: "Cannot open or comment on the artifact.", addon: <IconLock size={14} /> },
];

const SHARE_DIALOG_BORDER = "1px solid var(--ax-colors-border-secondary)";

const ROLE_LABELS: Record<PermissionRole, string> = {
  Owner: "Owner", Admin: "Can manage", Editor: "Can edit", Viewer: "Can view", None: "No access",
};

const DEFAULT_ARTIFACT_CREATOR = { name: "Jamie Chen" };

function getStrideEmail(name: string) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/(^\.|\.$)/g, "")}@stride.com`;
}

function getInitialAccess(
  artifactCreator: { name: string; avatar?: string },
  artifactOwner?: { name: string; avatar?: string }
): AccessSubject[] {
  const creatorName = artifactCreator.name || DEFAULT_ARTIFACT_CREATOR.name;
  const ownerName = artifactOwner?.name || "Jamie Chen";
  const ownerAvatar = artifactOwner?.avatar ?? (ownerName === "Jamie Chen" ? "/avatars/avatar-3.png" : undefined);
  return [
    { id: "owner", name: ownerName, detail: getStrideEmail(ownerName), role: "Owner", kind: "user", colorScheme: "purple", avatar: ownerAvatar, badges: ownerName === "Jamie Chen" ? ["Principal"] : undefined },
    ...(creatorName !== ownerName ? [{ id: "creator", name: creatorName, detail: getStrideEmail(creatorName), role: "Admin" as PermissionRole, kind: "user" as const, colorScheme: "purple" as const, avatar: artifactCreator.avatar ?? (creatorName === "Jamie Chen" ? "/avatars/avatar-3.png" : undefined), badges: creatorName === "Jamie Chen" ? ["Principal"] : undefined }] : []),
    ...(ownerName !== "Jamie Chen" && creatorName !== "Jamie Chen" ? [{ id: "jamie-chen", name: "Jamie Chen", detail: "jamie.chen@stride.com", role: "Admin" as PermissionRole, kind: "user" as const, colorScheme: "purple" as const, avatar: "/avatars/avatar-3.png", badges: ["Principal"] }] : []),
    { id: "stride-org", name: "Stride", detail: "stride@stride.com", role: "Viewer", kind: "org", colorScheme: "neutral" },
    { id: "mary-anne-torres", name: "Mary Anne Torres", detail: "mary.anne@stride.com", role: "Editor", kind: "user", colorScheme: "neutral", avatar: "/avatars/avatar-2.png" },
    { id: "content-ops", name: "Content Operations", detail: "content-operations@stride.com", role: "Admin", kind: "team", colorScheme: "neutral" },
    { id: "map", name: "Tony", detail: "tony@stride.com", role: "Editor", kind: "vau", colorScheme: "purple", avatar: "/avatars/vau-tony.png" },
    { id: "kerby", name: "Kerby", detail: "kerby@stride.com", role: "Viewer", kind: "vau", colorScheme: "neutral", avatar: "/avatars/vau-kerby.png" },
  ];
}

function PermissionRoleSelect({ role, subjectKind, allowOwnershipTransfer, disabled, onChange }: { role: PermissionRole; subjectKind?: AccessSubject["kind"]; allowOwnershipTransfer?: boolean; disabled?: boolean; onChange: (role: PermissionRole) => void }) {
  if (role === "Owner" || disabled) {
    return <Badge intent={role === "Owner" ? "information" : "neutral"} style={{ flexShrink: 0 }}>{ROLE_LABELS[role]}</Badge>;
  }
  type RoleSelectValue = PermissionRole | "Make owner";
  const baseOptions = subjectKind === "org" ? ORG_ROLE_OPTIONS : ROLE_OPTIONS;
  return (
    <Select
      value={role}
      onValueChange={(value) => onChange(value === "Make owner" ? "Owner" : value as PermissionRole)}
      options={[
        ...baseOptions,
        ...(allowOwnershipTransfer ? [{ label: "Make owner", value: "Make owner" as RoleSelectValue, description: "Transfer ownership to this person." }] : []),
      ]}
    >
      <SelectTrigger size="md" style={{ minWidth: 132 }}>{ROLE_LABELS[role]}</SelectTrigger>
      <SelectContent />
    </Select>
  );
}

function AccessAvatar({ subject }: { subject: AccessSubject }) {
  if (subject.kind === "team") {
    return <Box display="flex" alignItems="center" justifyContent="center" bg="bg.secondary" rounded="full" style={{ width: 32, height: 32, flexShrink: 0 }}><IconUsers size={15} style={{ color: "var(--ax-colors-fg-secondary)" }} /></Box>;
  }
  if (subject.kind === "org") {
    return <Box display="flex" alignItems="center" justifyContent="center" bg="bg.secondary" rounded="full" style={{ width: 32, height: 32, flexShrink: 0 }}><IconGlobe size={15} style={{ color: "var(--ax-colors-fg-secondary)" }} /></Box>;
  }
  if (subject.kind === "vau") {
    if (subject.avatar) {
      return <Avatar name={subject.name} src={subject.avatar} size="md" colorScheme={subject.colorScheme} style={{ flexShrink: 0 } as React.CSSProperties} />;
    }
    return <Box display="flex" alignItems="center" justifyContent="center" bg="bg.secondary" rounded="full" style={{ width: 32, height: 32, flexShrink: 0 }}><IconAgent size={15} style={{ color: "var(--ax-colors-fg-secondary)" }} /></Box>;
  }
  return <Avatar name={subject.name} src={subject.avatar} size="md" colorScheme={subject.colorScheme} style={{ flexShrink: 0 } as React.CSSProperties} />;
}

function AccessRow({ subject, showMakeOwner, showTopBorder, onRoleChange, onRemove }: { subject: AccessSubject; showMakeOwner: boolean; showTopBorder?: boolean; onRoleChange: (role: PermissionRole) => void; onRemove: () => void }) {
  const isOwner = subject.role === "Owner";
  const canBecomeOwner = showMakeOwner && (subject.kind === "user" || subject.kind === "vau");
  return (
    <Box
      display="flex"
      alignItems="center"
      gap="12"
      px="16"
      py="12"
      style={{ borderTop: showTopBorder ? "1px solid var(--ax-colors-border-tertiary)" : undefined }}
    >
      <AccessAvatar subject={subject} />
      <Box style={{ minWidth: 0, flex: 1 }}>
        <Box display="flex" alignItems="center" gap="8" style={{ minWidth: 0 }}>
          <AxiomText fontSize="sm" fontWeight="600" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{subject.name}</AxiomText>
          {(subject.kind === "org" || subject.kind === "vau") && <Badge intent="neutral">{subject.kind === "org" ? "ORG" : "Virtual Teammate"}</Badge>}
          {subject.badges?.map((badge) => <Badge key={badge} intent="neutral">{badge}</Badge>)}
        </Box>
        <AxiomText fontSize="sm" color="fg.tertiary">{subject.detail}</AxiomText>
      </Box>
      {isOwner ? (
        <PermissionRoleSelect role={subject.role} subjectKind={subject.kind} allowOwnershipTransfer={false} disabled onChange={() => {}} />
      ) : (
        <Box display="flex" alignItems="center" gap="8" style={{ flexShrink: 0, minWidth: 172 }}>
          <PermissionRoleSelect role={subject.role} subjectKind={subject.kind} allowOwnershipTransfer={canBecomeOwner} onChange={onRoleChange} />
          <Tooltip content="Remove access" delayDuration={300}>
            <span style={{ display: "inline-flex" }}>
              <Button appearance="subtle" size="sm" icon={<IconTrashCan size={14} />} aria-label={`Remove ${subject.name}`} onClick={onRemove} />
            </span>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
}

export function OpalShareDialog({ open, onOpenChange, artifactTitle, artifactCreator = DEFAULT_ARTIFACT_CREATOR, artifactOwner }: { open: boolean; onOpenChange: (open: boolean) => void; artifactTitle?: string; artifactCreator?: { name: string; avatar?: string }; artifactOwner?: { name: string; avatar?: string } }) {
  const [inviteQuery, setInviteQuery] = useState("");
  const [inviteTokens, setInviteTokens] = useState<string[]>([]);
  const [inviteRole, setInviteRole] = useState<PermissionRole>("Editor");
  const [accessList, setAccessList] = useState<AccessSubject[]>(() => getInitialAccess(artifactCreator, artifactOwner));
  const [notifyPeople, setNotifyPeople] = useState(true);
  const [notifyMessage, setNotifyMessage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [chipInputFocused, setChipInputFocused] = useState(false);
  const chipInputRef = useRef<HTMLInputElement>(null);
  const shareUrl = "https://stride.com/artifacts/landing-page";
  const showMakeOwner = (artifactOwner?.name ?? artifactCreator.name) === "Jamie Chen";

  const q = inviteQuery.trim().toLowerCase();
  const filteredAccessList = q
    ? accessList.filter(s => s.name.toLowerCase().includes(q) || s.detail.toLowerCase().includes(q))
    : accessList;

  const showNotify = inviteTokens.length > 0 || (q.length > 0 && filteredAccessList.length === 0);

  useEffect(() => { setAccessList(getInitialAccess(artifactCreator, artifactOwner)); }, [artifactCreator, artifactOwner]);
  useEffect(() => { if (!open) { setInviteTokens([]); setInviteQuery(""); setNotifyMessage(""); setHasChanges(false); } }, [open]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    toaster.create("Share link copied", { intent: "success" });
  }, [shareUrl]);

  const addInviteToken = useCallback((value: string) => {
    const token = value.trim().replace(/,$/, "");
    if (!token) return;
    setInviteTokens((tokens) => (tokens.includes(token) ? tokens : [...tokens, token]));
    setInviteQuery("");
  }, []);

  const handleInviteKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addInviteToken(inviteQuery);
      return;
    }
    if (event.key === "Backspace" && !inviteQuery && inviteTokens.length > 0) {
      setInviteTokens((tokens) => tokens.slice(0, -1));
    }
  }, [addInviteToken, inviteQuery, inviteTokens.length]);

  const handleSend = useCallback(() => {
    const pending = inviteQuery.trim() ? [inviteQuery.trim(), ...inviteTokens] : inviteTokens;
    const invitees = [...new Set(pending)].filter(Boolean);
    if (invitees.length === 0) { onOpenChange(false); return; }
    setAccessList((items) => [...items, ...invitees.map((invitee, index) => ({
      id: `${invitee.toLowerCase().replace(/\W+/g, "-")}-${Date.now()}-${index}`,
      name: invitee,
      detail: invitee.includes("@") ? "Pending invite" : "Direct invite",
      role: inviteRole,
      kind: "user" as const,
      colorScheme: "neutral" as const,
    }))]);
    toaster.create(`Invited ${invitees.join(", ")}`, { intent: "success" });
    onOpenChange(false);
  }, [inviteQuery, inviteRole, inviteTokens, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" maxH="full">
        <DialogHeader>
          <AxiomText fontSize="lg" fontWeight="600">
            Share &quot;{artifactTitle ?? "Untitled artifact"}&quot;
          </AxiomText>
        </DialogHeader>

        <DialogBody display="flex" flexDirection="column" gap="16">
          {/* Invite row — in DialogBody so it has the same width as the access box */}
          <Box display="flex" alignItems="end" gap="8">
            <Box display="flex" flexDirection="column" gap="4" style={{ flex: 1 }}>
            <AxiomText fontSize="sm" color="fg.secondary">Share with</AxiomText>
            <div
              role="textbox"
              aria-label="Add people"
              onClick={() => chipInputRef.current?.focus()}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 6,
                minHeight: 40,
                padding: "4px 10px",
                border: chipInputFocused
                  ? "1px solid var(--ax-colors-border-focus)"
                  : "1px solid var(--ax-colors-border-control)",
                borderRadius: 6,
                background: "var(--ax-colors-bg-default)",
                cursor: "text",
                boxShadow: chipInputFocused ? "0 0 0 2px color-mix(in srgb, var(--ax-colors-border-focus) 20%, transparent)" : "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
            >
              {inviteTokens.map((token) => (
                <Pill
                  key={token}
                  onDismiss={() => { setInviteTokens((tokens) => tokens.filter((t) => t !== token)); }}
                >
                  {token}
                </Pill>
              ))}
              <input
                ref={chipInputRef}
                type="text"
                value={inviteQuery}
                onChange={(e) => setInviteQuery(e.target.value)}
                onKeyDown={handleInviteKeyDown}
                onFocus={() => setChipInputFocused(true)}
                onBlur={() => setChipInputFocused(false)}
                placeholder={inviteTokens.length === 0 ? "Add people, groups..." : ""}
                style={{
                  flex: 1,
                  minWidth: 140,
                  height: 26,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 14,
                  color: "var(--ax-colors-fg-default)",
                  fontFamily: "inherit",
                }}
              />
            </div>
            </Box>
            <Box display="flex" flexDirection="column" gap="4">
              <AxiomText fontSize="sm" color="fg.secondary">Access</AxiomText>
              <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as PermissionRole)} options={[...ROLE_OPTIONS]}>
                <SelectTrigger size="md" style={{ flexShrink: 0, minWidth: 132, height: 40 }}>{ROLE_LABELS[inviteRole]}</SelectTrigger>
                <SelectContent />
              </Select>
            </Box>
          </Box>
          {!showNotify ? (<>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <AxiomText fontSize="md" fontWeight="600">Who has access</AxiomText>
              <Button appearance="subtle" size="sm" icon={<IconLink size={14} />} onClick={handleCopyLink}>Copy link</Button>
            </Box>
            {(() => {
              const topRows = filteredAccessList.filter(isTopCardRow);
              const bottomRows = filteredAccessList.filter(s => !isTopCardRow(s));
              const orgRowNoAccess = topRows.some(s => s.kind === "org" && s.role === "None");
              const handleRoleChange = (subject: AccessSubject) => (role: PermissionRole) => {
                setHasChanges(true);
                setAccessList((items) => items.map((item) => {
                  if (item.id === subject.id) return { ...item, role };
                  if (role === "Owner" && item.role === "Owner") return { ...item, role: "Admin" as PermissionRole };
                  return item;
                }));
              };
              const handleRemove = (subject: AccessSubject) => () => {
                setHasChanges(true);
                setAccessList((items) => items.filter((item) => item.id !== subject.id));
              };
              return (
                <>
                  {topRows.length > 0 && (
                    <Box rounded="lg" style={{ border: SHARE_DIALOG_BORDER, overflow: "hidden" }}>
                      {topRows.map((subject, idx) => (
                        <AccessRow
                          key={subject.id}
                          subject={subject}
                          showMakeOwner={showMakeOwner}
                          showTopBorder={idx > 0}
                          onRoleChange={handleRoleChange(subject)}
                          onRemove={handleRemove(subject)}
                        />
                      ))}
                    </Box>
                  )}
                  {orgRowNoAccess && (
                    <Box display="flex" alignItems="center" gap="6" px="4">
                      <IconLock size={12} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
                      <AxiomText fontSize="sm" color="fg.tertiary">Only invited users can access</AxiomText>
                    </Box>
                  )}
                  {bottomRows.length > 0 && (
                    <Box rounded="lg" style={{ border: SHARE_DIALOG_BORDER, overflow: "hidden" }}>
                      {bottomRows.map((subject, idx) => (
                        <AccessRow
                          key={subject.id}
                          subject={subject}
                          showMakeOwner={showMakeOwner}
                          showTopBorder={idx > 0}
                          onRoleChange={handleRoleChange(subject)}
                          onRemove={handleRemove(subject)}
                        />
                      ))}
                    </Box>
                  )}
                </>
              );
            })()}
          </>) : (<>
            <Checkbox checked={notifyPeople} onCheckedChange={(v) => setNotifyPeople(!!v)}>
              Notify people
            </Checkbox>
            {notifyPeople && (
              <textarea
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
                placeholder="Message"
                rows={6}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: "var(--ax-colors-fg-default)",
                  background: "var(--ax-colors-bg-default)",
                  border: "1px solid var(--ax-colors-border-control)",
                  borderRadius: 8,
                  resize: "vertical",
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--ax-colors-border-focus)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--ax-colors-border-control)"; }}
              />
            )}
          </>)}
        </DialogBody>

        <DialogFooter>
          {showNotify ? (<>
            <Button appearance="subtle" size="md" icon={<IconArrowLeft size={14} />} onClick={() => { setInviteQuery(""); setInviteTokens([]); }} style={{ marginRight: "auto" }}>Back</Button>
            <Button appearance="primary" size="md" onClick={handleSend}>Send</Button>
          </>) : (
            <DialogClose asChild><Button appearance="primary" size="md">{hasChanges ? "Update" : "Done"}</Button></DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Blame legend ──────────────────────────────────────────────────────────────

function BlameLegend({ segments }: { segments: BlameSegment[] }) {
  const seen = new Map<string, string>();
  for (const seg of segments) {
    if (!seen.has(seg.userName)) {
      seen.set(seg.userName, BlameEngine.assignColor(seg.userName));
    }
  }
  return (
    <Box display="flex" alignItems="center" gap="12" px="16" style={{ flexShrink: 0, height: 28, borderBottom: BORDER, background: "var(--ax-colors-bg-secondary)" }}>
      <Text fontSize="xs" color="fg.tertiary">Contributors:</Text>
      {[...seen.entries()].map(([name, color]) => (
        <Box key={name} display="flex" alignItems="center" gap="4">
          <Box style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
          <Text fontSize="xs" color="fg.secondary">{name}</Text>
        </Box>
      ))}
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CodeCanvasPanel({
  onClose,
  filename = "landing-page.html",
  fileType = "html",
  artifactTitle,
  artifactStatus,
  artifactVersion,
  artifactSource,
  artifactCreator,
  contentNode,
  initialHtml,
  chatOpen,
  onChatToggle,
}: CodeCanvasPanelProps) {
  const collabDoc = useCollabDoc(EXAMPLE_HTML);
  const [mode, setMode] = useState<CanvasMode>("preview");
  const [isEditing, setIsEditing] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(initialHtml ?? WYSIWYG_CONTENT);
  const [isNarrow, setIsNarrow] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setIsNarrow(width < 640);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Contributors (blame) ──────────────────────────────────────────────────
  const [blameActive, setBlameActive] = useState(false);
  const [blameSegments, setBlameSegments] = useState<BlameSegment[]>([]);
  const blameEngineRef = useRef<BlameEngine | null>(null);
  const baselineTextRef = useRef<string>("");
  const blameObserverRef = useRef<((update: Uint8Array, origin: unknown) => void) | null>(null);
  const wysiwygTextRef = useRef<string>(WYSIWYG_CONTENT);

  useEffect(() => {
    blameEngineRef.current = new BlameEngine(collabDoc.ydoc, "canvas-doc");
    return () => { blameEngineRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleBlame = useCallback(() => {
    if (!blameActive) {
      // Snapshot current text — use WYSIWYG text in preview mode, ytext in source mode
      const baseline = mode === "preview" ? wysiwygTextRef.current : collabDoc.ytext.toString();
      baselineTextRef.current = baseline;
      setBlameSegments(buildBlameSegments(baseline, baseline));

      // Source mode: observe Y.doc updates (CodeMirror writes to ytext)
      const observer = () => {
        const current = collabDoc.ytext.toString();
        setBlameSegments(buildBlameSegments(baselineTextRef.current, current));
      };
      blameObserverRef.current = observer;
      collabDoc.ydoc.on("update", observer);
    } else {
      if (blameObserverRef.current) {
        collabDoc.ydoc.off("update", blameObserverRef.current);
        blameObserverRef.current = null;
      }
      setBlameSegments([]);
    }
    setBlameActive((v) => !v);
  }, [blameActive, collabDoc, mode]);

  // Always clean up observer on unmount
  useEffect(() => {
    return () => {
      if (blameObserverRef.current) {
        collabDoc.ydoc.off("update", blameObserverRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Version History ───────────────────────────────────────────────────────
  const [versionPanelOpen, setVersionPanelOpen] = useState(false);
  const [versions, setVersions] = useState<LocalVersion[]>([]);
  const versionManagerRef = useRef<LocalVersionManager | null>(null);

  useEffect(() => {
    versionManagerRef.current = new LocalVersionManager(collabDoc.ydoc, "canvas-doc", EXAMPLE_HTML);
    setVersions(versionManagerRef.current.listVersions());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveVersion = useCallback(() => {
    const vm = versionManagerRef.current;
    if (!vm) return;
    const v = vm.createVersion(undefined, 'You');
    setVersions(vm.listVersions());
    toaster.create(`Version saved — ${new Date(v.created_at).toLocaleTimeString()}`, { intent: "success" });
  }, []);

  const handleRevertVersion = useCallback((v: LocalVersion) => {
    const vm = versionManagerRef.current;
    if (!vm) return;
    vm.revertToVersion(v);
    // Refresh preview
    setPreviewHtml(v.content);
    toaster.create(`Restored to "${v.label ?? new Date(v.created_at).toLocaleTimeString()}"`, { intent: "success" });
  }, []);

  // ── Mode switch ───────────────────────────────────────────────────────────
  const handleSetMode = useCallback((next: CanvasMode) => {
    if (next === "preview") setPreviewHtml(collabDoc.ytext.toString() || WYSIWYG_CONTENT);
    setMode(next);
  }, [collabDoc]);

  return (
    <Box
      ref={panelRef as unknown as React.Ref<HTMLDivElement>}
      display="flex"
      flexDirection="column"
      bg="bg.secondary"
      style={{ flex: 1, minWidth: 0, height: "100%", overflow: "hidden", borderRight: BORDER }}
    >
      {/* ── Toolbar ── */}
      <Box
        display="flex"
        alignItems="center"
        gap="4"
        px="12"
        bg="bg.default"
        style={{ flexShrink: 0, borderBottom: BORDER, height: 48, flexWrap: "nowrap", overflow: "hidden" }}
      >
        <Button appearance="subtle" size="md" icon={<IconXmark size={18} />} onClick={onClose} aria-label="Close editor" />
        <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0, margin: "0 4px" }} />

        {/* Artifact title */}
        {artifactTitle && (
          <>
            <Text fontSize="md" fontWeight="600" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 300, flexShrink: 1, minWidth: 0 }}>
              {artifactTitle}
            </Text>
            {artifactStatus && (
              <Badge intent={artifactStatus === "Ready" ? "success" : artifactStatus === "Failed" ? "danger" : "neutral"} style={{ flexShrink: 0 }}>
                {artifactStatus}
              </Badge>
            )}
            <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0, margin: "0 4px" }} />
          </>
        )}

        {/* Mode toggle */}
        {!contentNode && (
          <Box display="flex" alignItems="center" gap="8" style={{ flexShrink: 0 }}>
            <Tooltip content="Source code" delayDuration={400}>
              <span>
                <ToggleButton size="md" appearance="subtle" pressed={mode === "source"} onPressedChange={() => handleSetMode("source")} icon={<IconCode size={18} />} aria-label="Source" />
              </span>
            </Tooltip>
            <Tooltip content="Preview / WYSIWYG" delayDuration={400}>
              <span>
                <ToggleButton size="md" appearance="subtle" pressed={mode === "preview"} onPressedChange={() => handleSetMode("preview")} icon={<IconEye size={18} />} aria-label="Preview" />
              </span>
            </Tooltip>
          </Box>
        )}

        <Box style={{ flex: 1 }} />

        {/* Right cluster */}
        <Box display="flex" alignItems="center" gap="8" style={{ flexShrink: 0 }}>
          {/* Editing / Saved badge */}
          <Badge intent={isEditing ? "neutral" : "success"} style={{ flexShrink: 0 }}>
            {isEditing ? "Editing" : "Saved"}
          </Badge>

          {/* Edit / Cancel + Save */}
          {isEditing ? (
            <Box display="flex" alignItems="center" gap="4">
              <Button appearance="subtle" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button appearance="primary" size="sm" onClick={() => setIsEditing(false)}>Save</Button>
            </Box>
          ) : (
            <Tooltip content="Edit" delayDuration={400}>
              <span>
                <Button appearance="subtle" size="md" icon={<IconPen size={18} />} aria-label="Edit" onClick={() => setIsEditing(true)} />
              </span>
            </Tooltip>
          )}

          {isEditing && (
            <Box display="flex" alignItems="center" gap="4">
              <Tooltip content="Undo" delayDuration={400}><span><Button appearance="subtle" size="md" icon={<IconArrowRotateLeft size={18} />} aria-label="Undo" /></span></Tooltip>
              <Tooltip content="Redo" delayDuration={400}><span><Button appearance="subtle" size="md" icon={<IconArrowRotateRight size={18} />} aria-label="Redo" /></span></Tooltip>
            </Box>
          )}

          <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0 }} />

          {/* More actions menu */}
          <Menu
            options={[
              { label: "Copy", addon: <IconCopy size={14} />, execute: () => { navigator.clipboard.writeText(collabDoc.ytext.toString()).catch(() => {}); toaster.create("Copied to clipboard", { intent: "success" }); } },
              { label: "Add to", addon: <IconCirclePlus size={14} />, execute: () => {} },
              ...(!contentNode ? [
                { label: blameActive ? "Hide contributors" : "Show contributors", addon: <IconUserGroup size={14} />, execute: handleToggleBlame },
              ] : []),
              ...(onChatToggle !== undefined ? [
                { label: chatOpen ? "Hide thread" : "Show thread", addon: <IconComments size={14} />, execute: onChatToggle },
              ] : []),
              ...(isNarrow && !isEditing ? [
                { label: "Share", addon: <IconUserPlus size={14} />, execute: () => setShareDialogOpen(true) },
              ] : []),
            ]}
          >
            <MenuTrigger asChild>
              <Button appearance="subtle" size="md" icon={<IconEllipsisSolid size={18} />} aria-label="More editor actions" />
            </MenuTrigger>
            <MenuContent />
          </Menu>

          {!isEditing && !isNarrow && (
            <>
              <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0 }} />

              {/* Share */}
              <Button appearance="default" size="md" icon={<IconUserPlus size={18} />} onClick={() => setShareDialogOpen(true)} style={{ whiteSpace: "nowrap" }}>Share</Button>
            </>
          )}

          {/* Thread toggle */}
          {onChatToggle !== undefined && (
            <Tooltip content={chatOpen ? "Hide thread" : "Show thread"} delayDuration={400}>
              <span>
                <ToggleButton
                  size="md"
                  appearance="subtle"
                  pressed={!!chatOpen}
                  onPressedChange={onChatToggle}
                  icon={<IconComments size={18} />}
                  aria-label={chatOpen ? "Hide thread" : "Show thread"}
                />
              </span>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* ── Blame legend bar ── */}
      {blameActive && blameSegments.length > 0 && <BlameLegend segments={blameSegments} />}

      {/* ── Editor card ── */}
      <Box style={{ flex: 1, minHeight: 0, overflow: "hidden", padding: "16px", display: "flex", flexDirection: "column" }}>
        <Box
          bg="bg.default"
          rounded="xl"
          shadow="sm"
          style={{ flex: 1, minHeight: 0, outline: "1px solid var(--ax-colors-border-secondary)", overflow: "hidden", position: "relative" }}
        >
          {contentNode ? (
            <Box style={{ position: "absolute", inset: 0 }}>{contentNode}</Box>
          ) : (
            <>
              {/* Source — always mounted to keep Y.js state alive */}
              <Box style={{ position: "absolute", inset: 0, visibility: mode === "source" ? "visible" : "hidden", pointerEvents: mode === "source" ? "auto" : "none" }}>
                <CodeMirrorEditor collabDoc={collabDoc} language="html" darkMode={false} blameSegments={blameActive ? blameSegments : undefined} />
              </Box>

              {/* Preview / WYSIWYG */}
              {mode === "preview" && (
                <Box style={{ position: "absolute", inset: 0 }}>
                  <WysiwygPanel
                    key={previewHtml}
                    initialHtml={previewHtml}
                    editable={isEditing}
                    blameSegments={blameActive ? blameSegments : undefined}
                    onContentChange={(text) => {
                      wysiwygTextRef.current = text;
                      if (blameActive) {
                        setBlameSegments(buildBlameSegments(baselineTextRef.current, text));
                      }
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* ── Status bar ── */}
      {!contentNode && (
        <Box display="flex" alignItems="center" px="20" py="6" gap="8" style={{ flexShrink: 0, borderTop: BORDER }}>
          <Text fontSize="xs" color="fg.tertiary" style={{ fontFamily: "var(--ax-fonts-mono, monospace)" }}>{filename}</Text>
          <Box style={{ flex: 1 }} />
          {artifactSource && (
            <Box display="flex" alignItems="center" gap="4" color="fg.tertiary">
              <Text fontSize="xs" color="fg.tertiary">From</Text>
              <Box style={{ width: 1, height: 10, background: "var(--ax-colors-border-secondary)" }} />
              {artifactSource.type === "workflow" ? <IconCodeBranch size={12} /> : artifactSource.type === "chat" ? <IconComments size={12} /> : <IconAgent size={12} />}
              <Text fontSize="xs" color="fg.tertiary">{artifactSource.type === "chat" ? "Chat" : artifactSource.name}</Text>
              <Box style={{ width: 1, height: 10, background: "var(--ax-colors-border-secondary)" }} />
            </Box>
          )}
          {blameActive && <Text fontSize="xs" color="fg.accent" style={{ marginRight: 12 }}>Contributors</Text>}
          <Text fontSize="xs" color="fg.tertiary">{fileType === "markdown" ? "Markdown" : fileType === "code" ? "Plain Text" : "HTML"} · UTF-8</Text>
        </Box>
      )}

      <OpalShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        artifactTitle={artifactTitle ?? filename}
        artifactCreator={artifactCreator ?? DEFAULT_ARTIFACT_CREATOR}
      />
    </Box>
  );
}
