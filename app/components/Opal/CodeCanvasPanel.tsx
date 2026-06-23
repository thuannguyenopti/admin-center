"use client";

import {
  Box, Button, ToggleButton, Tooltip, Avatar, Badge, Menu, MenuContent, MenuTrigger, toaster,
  Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogClose,
  Select, SelectContent, SelectTrigger,
  Textarea, Field, Checkbox,
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
  IconGear,
} from "@optimizely/axiom-icons";
import { useState, useCallback, useEffect, useRef, type ReactNode, type KeyboardEvent } from "react";
import dynamic from "next/dynamic";
import { useCollabDoc } from "./editor/useCollabDoc";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import type { EditorFileType } from "./EditorOutputCard";
import type { CodeMirrorLanguage } from "./editor/CodeMirrorEditor";
import { BlameEngine, type BlameSegment } from "./editor/blame-engine";
import { createBlamePlugin, blamePluginKey } from "./editor/blame-tiptap-plugin";
import { LocalVersionManager, type LocalVersion, type DiffLine } from "./editor/local-version-manager";
import { computeLineDiff } from "./editor/diff-engine";
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
  artifactCreator?: { name: string; avatar?: string };
  contentNode?: ReactNode;
  initialHtml?: string;
  chatOpen?: boolean;
  onChatToggle?: () => void;
};

// ── Example HTML content ──────────────────────────────────────────────────────

// Shared demo content — source view and preview render the same document.
// Prettified with blank lines between sections for readable source view;
// TipTap collapses inter-block whitespace so the rendered preview is unchanged.
const EXAMPLE_HTML = `<h1>Build something people love</h1>
<p>The fastest way to launch, test, and optimize your product with AI-powered insights.</p>

<h2>Everything you need to grow</h2>

<h3>⚡ Lightning fast</h3>
<p>Deploy in minutes, not months. Our platform handles the heavy lifting so you can focus on what matters.</p>

<h3>🎯 Data-driven</h3>
<p>Make decisions backed by real user behavior. Built-in A/B testing and analytics out of the box.</p>

<h3>🔒 Enterprise-ready</h3>
<p>SOC 2 compliant, SSO support, and role-based access control — built for teams of any size.</p>
`;

const WYSIWYG_CONTENT = EXAMPLE_HTML;

type CollabUser =
  | { name: string; templateName?: string; type: "ai"; src: string }
  | { name: string; templateName?: string; type: "human"; src?: string; colorScheme: "purple" | "neutral"; lightPurple?: boolean; customStyle?: React.CSSProperties };

const COLLAB_USERS: CollabUser[] = [
  { name: "Frank", templateName: "GEO Content Strategist", type: "ai", src: "/avatars/im-telescope.png" },
  { name: "Jamie Chen", type: "human", src: "/avatars/avatar-3.png", colorScheme: "purple", lightPurple: true },
  { name: "Mary Anne Torres", type: "human", src: "/avatars/avatar-2.png", colorScheme: "neutral" },
];

const MOCK_CURSORS: CollabCursor[] = [
  { id: "jc", name: "Jamie Chen", color: "#7c3aed", position: 80 },
  { id: "ma", name: "Mary Anne Torres", color: "#065f46", position: 260 },
];

// ── Blame segment helpers ─────────────────────────────────────────────────────

/** Split `text` into 3 mock-attributed regions. */
function mockSegments(text: string): BlameSegment[] {
  const len = text.length;
  if (len === 0) return [];
  const third = Math.floor(len / 3);
  return [
    { start: 0,         end: third,     userName: "Mary K."  },
    { start: third,     end: third * 2, userName: "Mary Anne Torres" },
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
        { id: "ma", name: "Mary Anne Torres", color: "#065f46", position: Math.min(maxPos - 1, Math.floor(Math.random() * maxPos * 0.4) + Math.floor(maxPos * 0.5)) },
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
            <Tooltip key={u.name} content={u.templateName ? `${u.name} · ${u.templateName}` : u.name} delayDuration={300}>
              <span style={{ marginLeft: i > 0 ? -6 : 0, zIndex: COLLAB_USERS.length - i, position: "relative", display: "inline-flex" }}>
                {u.type === "ai" ? (
                  <span style={{ width: 24, height: 24, borderRadius: "50%", overflow: "hidden", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--ax-colors-bg-default)", flexShrink: 0, boxSizing: "border-box" }}>
                    <img src={u.src} alt={u.name} width={20} height={20} style={{ display: "block", borderRadius: "50%", objectFit: "cover" }} />
                  </span>
                ) : u.src ? (
                  <span style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--ax-colors-bg-default)", flexShrink: 0, boxSizing: "border-box" }}>
                    <img src={u.src} alt={u.name} width={24} height={24} style={{ display: "block", borderRadius: "50%", objectFit: "cover" }} />
                  </span>
                ) : (
                  <Avatar
                    name={u.name}
                    size="xs"
                    colorScheme={u.lightPurple || u.customStyle ? undefined : u.colorScheme}
                    style={{
                      width: 28, height: 28, fontSize: 10, boxSizing: "border-box" as const,
                      border: "2px solid var(--ax-colors-bg-default)",
                      ...(u.lightPurple && { background: "#ede9fe", color: "#7c3aed" }),
                      ...u.customStyle,
                    } as React.CSSProperties}
                  />
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
              <Box rounded="xs" style={{ width: 8, height: 8, background: "var(--ax-colors-fg-success)", flexShrink: 0 }} />
              <Text fontSize="xs" color="fg.tertiary">{diff.filter(d => d.type === 'added').length}</Text>
              <Box rounded="xs" style={{ width: 8, height: 8, background: "var(--ax-colors-fg-error)", flexShrink: 0 }} />
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

// Rows with system status (Owner or Principal) appear in the top card.
function isTopCardRow(subject: AccessSubject): boolean {
  return subject.role === "Owner" || !!subject.badges?.includes("Principal");
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
  _artifactCreator: { name: string; avatar?: string },
  _artifactOwner?: { name: string; avatar?: string }
): AccessSubject[] {
  return [
    { id: "frank-vau", name: "Frank", detail: "frank@stride.com", role: "Owner", kind: "vau", colorScheme: "neutral", avatar: "/avatars/im-telescope.png" },
    { id: "jamie-chen", name: "Jamie Chen", detail: "jamie.chen@stride.com", role: "Admin", kind: "user", colorScheme: "purple", avatar: "/avatars/avatar-3.png", badges: ["Principal"] },
    { id: "stride-org", name: "Stride", detail: "stride@stride.com", role: "Viewer", kind: "org", colorScheme: "neutral" },
    { id: "marie-anne-torres", name: "Marie Anne Torres", detail: "marie.anne@stride.com", role: "Editor", kind: "user", colorScheme: "neutral", avatar: "/avatars/avatar-2.png" },
    { id: "content-ops", name: "Content Operations", detail: "content-operations@stride.com", role: "Admin", kind: "team", colorScheme: "neutral" },
    { id: "tony-vau", name: "Tony", detail: "tony@stride.com", role: "Editor", kind: "vau", colorScheme: "purple", avatar: "/avatars/im-compass.png" },
    { id: "jonas-vau", name: "Jonas", detail: "jonas@stride.com", role: "Viewer", kind: "vau", colorScheme: "neutral", avatar: "/avatars/im-key-wand.png" },
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
    return <Box display="flex" alignItems="center" justifyContent="center" bg="bg.avatar.purple" rounded="full" style={{ width: 32, height: 32, flexShrink: 0 }}><IconGlobe size={15} style={{ color: "var(--ax-colors-fg-avatar-purple)" }} /></Box>;
  }
  if (subject.kind === "vau") {
    if (subject.avatar) {
      return <Avatar name={subject.name} src={subject.avatar} size="md" colorScheme={subject.colorScheme} style={{ flexShrink: 0 } as React.CSSProperties} />;
    }
    return <Box display="flex" alignItems="center" justifyContent="center" bg="bg.secondary" rounded="full" style={{ width: 32, height: 32, flexShrink: 0 }}><IconAgent size={15} style={{ color: "var(--ax-colors-fg-secondary)" }} /></Box>;
  }
  return <Avatar name={subject.name} src={subject.avatar} size="md" colorScheme={subject.colorScheme} style={{ flexShrink: 0 } as React.CSSProperties} />;
}

function AccessRow({ subject, showMakeOwner, showTopBorder, removable = true, onRoleChange, onRemove }: { subject: AccessSubject; showMakeOwner: boolean; showTopBorder?: boolean; removable?: boolean; onRoleChange: (role: PermissionRole) => void; onRemove: () => void }) {
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
        <Box display="flex" alignItems="center" gap="8" style={{ flexShrink: 0, minWidth: removable ? 172 : 140 }}>
          <PermissionRoleSelect role={subject.role} subjectKind={subject.kind} allowOwnershipTransfer={canBecomeOwner} onChange={onRoleChange} />
          {removable && (
            <Tooltip content="Remove access" delayDuration={300}>
              <span style={{ display: "inline-flex" }}>
                <Button appearance="subtle" size="sm" icon={<IconTrashCan size={14} />} aria-label={`Remove ${subject.name}`} onClick={onRemove} />
              </span>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
}

function GeneralAccessRow({ subject, onRoleChange }: { subject: AccessSubject; onRoleChange: (role: PermissionRole) => void }) {
  const isNoAccess = subject.role === "None";
  const accessLabel = isNoAccess
    ? "Only invited users can access this artifact."
    : `Anyone in ${subject.name} with the link can ${subject.role === "Editor" ? "edit" : "view"} this artifact.`;
  const leftIcon = isNoAccess
    ? <Box display="flex" alignItems="center" justifyContent="center" bg="bg.avatar.purple" rounded="full" style={{ width: 32, height: 32, flexShrink: 0 }}><IconLock size={15} style={{ color: "var(--ax-colors-fg-avatar-purple)" }} /></Box>
    : <Box display="flex" alignItems="center" justifyContent="center" bg="bg.avatar.purple" rounded="full" style={{ width: 32, height: 32, flexShrink: 0 }}><IconGlobe size={15} style={{ color: "var(--ax-colors-fg-avatar-purple)" }} /></Box>;
  return (
    <Box display="flex" flexDirection="column" gap="8">
      <Box display="flex" alignItems="center" gap="12">
        {leftIcon}
        <Box style={{ flex: 1 }}>
          <Menu
            options={[
              { label: `Anyone in ${subject.name}`, selected: !isNoAccess, addon: <IconGlobe size={14} />, execute: () => { if (isNoAccess) onRoleChange("Viewer"); } },
              { label: "Only invited users", selected: isNoAccess, addon: <IconLock size={14} />, execute: () => { if (!isNoAccess) onRoleChange("None"); } },
            ]}
          >
            <MenuTrigger asChild>
              <Button appearance="subtle" size="sm" style={{ paddingInline: 0, fontWeight: 500 }}>
                <Box asChild display="inline-flex" alignItems="center" gap="4">
                  <span>
                    {isNoAccess ? "Only invited users" : `Anyone in ${subject.name}`}
                    <IconChevronDown size={12} style={{ color: "var(--ax-colors-fg-secondary)" }} />
                  </span>
                </Box>
              </Button>
            </MenuTrigger>
            <MenuContent />
          </Menu>
        </Box>
        {!isNoAccess && (
          <Box style={{ flexShrink: 0 }}>
            <PermissionRoleSelect role={subject.role} subjectKind="org" allowOwnershipTransfer={false} onChange={onRoleChange} />
          </Box>
        )}
      </Box>
      <AxiomText fontSize="sm" color="fg.tertiary" style={{ paddingLeft: 44 }}>{accessLabel}</AxiomText>
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
  const showMakeOwner = false;

  // Filter access list by current query
  const q = inviteQuery.trim().toLowerCase();
  const filteredAccessList = q
    ? accessList.filter(s => s.name.toLowerCase().includes(q) || s.detail.toLowerCase().includes(q))
    : accessList;

  // Switch to message view only when there are committed tokens OR query has text with zero matches
  const showNotify = inviteTokens.length > 0 || (q.length > 0 && filteredAccessList.length === 0);

  useEffect(() => { setAccessList(getInitialAccess(artifactCreator, artifactOwner)); }, [artifactCreator, artifactOwner]);
  useEffect(() => { if (!open) { setInviteTokens([]); setInviteQuery(""); setNotifyMessage(""); setHasChanges(false); } }, [open]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    toaster.create("Share link copied", { intent: "success" });
  }, [shareUrl]);

  // Commit a token (Enter / comma) — stays in message view, clears input so user can type next email
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

  // Send — commits typed query (if any) + tokens to access list
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

        {/* ── Body — access list OR message view ── */}
        <DialogBody display="flex" flexDirection="column" gap="16">
          {/* Invite row — in DialogBody so it has the same width as the access box */}
          <Box display="flex" alignItems="end" gap="8">
            <Box display="flex" flexDirection="column" gap="4" style={{ flex: 1 }}>
            <AxiomText fontSize="sm" color="fg.secondary">Share with</AxiomText>
            <Box
              role="textbox"
              aria-label="Add people"
              onClick={() => chipInputRef.current?.focus()}
              display="flex"
              flexWrap="wrap"
              alignItems="center"
              gap="6"
              rounded="sm"
              style={{
                minHeight: 40,
                padding: "4px 10px",
                border: chipInputFocused
                  ? "1px solid var(--ax-colors-border-focus)"
                  : "1px solid var(--ax-colors-border-control)",
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
            </Box>
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
            <AxiomText fontSize="md" fontWeight="600">Who has access</AxiomText>
            {(() => {
              const topRows = filteredAccessList.filter(isTopCardRow);
              const bottomRows = filteredAccessList.filter(s => !isTopCardRow(s) && s.kind !== "org");
              const orgRows = filteredAccessList.filter(s => s.kind === "org");
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
                          removable={!subject.badges?.includes("Principal")}
                          onRoleChange={handleRoleChange(subject)}
                          onRemove={handleRemove(subject)}
                        />
                      ))}
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
                  {orgRows.length > 0 && (
                    <>
                      <AxiomText fontSize="md" fontWeight="600">General access</AxiomText>
                      <Box bg="bg.secondary" rounded="lg" px="16" py="12">
                        {orgRows.map((subject) => (
                          <GeneralAccessRow key={subject.id} subject={subject} onRoleChange={handleRoleChange(subject)} />
                        ))}
                      </Box>
                    </>
                  )}
                </>
              );
            })()}
          </>) : (<>
            <Checkbox checked={notifyPeople} onCheckedChange={(v) => setNotifyPeople(!!v)}>
              Notify people
            </Checkbox>
            {notifyPeople && (
              <Textarea
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
                placeholder="Message"
                resize="vertical"
                style={{ minHeight: 120 }}
              />
            )}
          </>)}
        </DialogBody>

        {/* ── Footer ── */}
        <DialogFooter>
          {showNotify ? (<>
            <Button appearance="subtle" size="md" icon={<IconArrowLeft size={14} />} onClick={() => { setInviteQuery(""); setInviteTokens([]); }} style={{ marginRight: "auto" }}>Back</Button>
            <Button appearance="primary" size="md" onClick={handleSend}>Send</Button>
          </>) : (<>
            <Button appearance="default" size="md" icon={<IconLink size={14} />} onClick={handleCopyLink}>Copy link</Button>
            <DialogClose asChild><Button appearance="primary" size="md">Save</Button></DialogClose>
          </>)}
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
          <Box rounded="xs" style={{ width: 10, height: 10, background: color, flexShrink: 0 }} />
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
  // Seed source + preview from the same content so the two views stay in sync.
  // Captured once on mount via useRef so later prop changes don't desync Yjs.
  const sourceSeedRef = useRef(initialHtml ?? EXAMPLE_HTML);
  const collabDoc = useCollabDoc(sourceSeedRef.current);
  const [mode, setMode] = useState<CanvasMode>("preview");
  const [isEditing, setIsEditing] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(initialHtml ?? WYSIWYG_CONTENT);
  const [layoutVariant, setLayoutVariant] = useState<"A" | "B">("B");
  const [layoutOpen, setLayoutOpen] = useState(false);
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
  // Only sync source → preview when the user has actually edited the source
  // (ytext differs from the captured seed). Without this guard, every toggle
  // would overwrite the preview, dropping any in-progress WYSIWYG edits.
  const handleSetMode = useCallback((next: CanvasMode) => {
    if (next === "preview") {
      const current = collabDoc.ytext.toString();
      if (current && current !== sourceSeedRef.current) {
        setPreviewHtml(current);
      }
    }
    setMode(next);
  }, [collabDoc]);

  return (
    <Box
      ref={panelRef}
      display="flex"
      flexDirection="column"
      bg="bg.secondary"
      style={{ flex: 1, minWidth: 0, height: "100%", overflow: "hidden", borderRight: BORDER, position: "relative" }}
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
        <Button appearance="subtle" size="sm" icon={<IconXmark size={16} />} onClick={onClose} aria-label="Close editor" />
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
                <ToggleButton size="md" appearance="subtle" pressed={mode === "source"} onPressedChange={() => handleSetMode("source")} icon={<IconCode size={15} />} aria-label="Source" />
              </span>
            </Tooltip>
            <Tooltip content="Preview / WYSIWYG" delayDuration={400}>
              <span>
                <ToggleButton size="md" appearance="subtle" pressed={mode === "preview"} onPressedChange={() => handleSetMode("preview")} icon={<IconEye size={15} />} aria-label="Preview" />
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
                <Button appearance="subtle" size="md" icon={<IconPen size={14} />} aria-label="Edit" onClick={() => setIsEditing(true)} />
              </span>
            </Tooltip>
          )}

          {isEditing && (
            <Box display="flex" alignItems="center" gap="4">
              <Tooltip content="Undo" delayDuration={400}><span><Button appearance="subtle" size="md" icon={<IconArrowRotateLeft size={15} />} aria-label="Undo" /></span></Tooltip>
              <Tooltip content="Redo" delayDuration={400}><span><Button appearance="subtle" size="md" icon={<IconArrowRotateRight size={15} />} aria-label="Redo" /></span></Tooltip>
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
              <Button appearance="subtle" size="md" icon={<IconEllipsisSolid size={15} />} aria-label="More editor actions" />
            </MenuTrigger>
            <MenuContent />
          </Menu>

          {!isEditing && !isNarrow && (
            <>
              <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0 }} />

              {/* Share */}
              <Button appearance="default" size="md" icon={<IconUserPlus size={15} />} onClick={() => setShareDialogOpen(true)} style={{ whiteSpace: "nowrap" }}>Share</Button>
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
                  icon={<IconComments size={11} />}
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
      <Box style={{ flex: 1, minHeight: 0, overflow: "hidden", padding: layoutVariant === "A" ? "16px" : 0, display: "flex", flexDirection: "column" }}>
        <Box
          bg="bg.default"
          rounded={layoutVariant === "A" ? "xl" : undefined}
          shadow={layoutVariant === "A" ? "sm" : undefined}
          style={{ flex: 1, minHeight: 0, outline: layoutVariant === "A" ? "1px solid var(--ax-colors-border-secondary)" : "none", overflow: "hidden", position: "relative" }}
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

      {/* Layout variant switcher — collapsed to gear icon, expands on click */}
      <Box
        style={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: 0,
          background: "var(--ax-colors-bg-default)",
          border: "1px solid var(--ax-colors-border-secondary)",
          borderRadius: 999,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          overflow: "hidden",
          transition: "all 0.18s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <Tooltip content="Layout" delayDuration={400}>
          <button
            type="button"
            onClick={() => setLayoutOpen((v) => !v)}
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: layoutOpen ? "var(--ax-colors-fg-accent)" : "var(--ax-colors-fg-tertiary)",
              flexShrink: 0,
            }}
          >
            <IconGear size={14} />
          </button>
        </Tooltip>
        {layoutOpen && (
          <>
            <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0 }} />
            <AxiomText fontSize="sm" color="fg.tertiary" style={{ padding: "0 6px 0 8px", whiteSpace: "nowrap" }}>Layout:</AxiomText>
            {(["A", "B"] as const).map((k) => {
              const isActive = layoutVariant === k;
              const label = k === "A" ? "Card" : "Edge-to-edge";
              return (
                <Tooltip key={k} delayDuration={200} content={label}>
                  <button
                    type="button"
                    onClick={() => { setLayoutVariant(k); setLayoutOpen(false); }}
                    style={{
                      width: 28,
                      height: 28,
                      padding: 0,
                      margin: "0 2px",
                      borderRadius: 999,
                      background: isActive ? "var(--ax-colors-bg-accent-subtle)" : "transparent",
                      color: isActive ? "var(--ax-colors-fg-accent)" : "var(--ax-colors-fg-default)",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: isActive ? 600 : 500,
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {k}
                  </button>
                </Tooltip>
              );
            })}
            <Box style={{ width: 4 }} />
          </>
        )}
      </Box>
    </Box>
  );
}
