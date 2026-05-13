"use client";

import { Box, Button, ToggleButton, Tooltip, Avatar, Badge, Menu, MenuContent, MenuTrigger, toaster } from "@optiaxiom/react";
import { Text } from "../Text";
import {
  IconXmark,
  IconCode,
  IconEye,
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
} from "@optimizely/axiom-icons";
import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import dynamic from "next/dynamic";
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
  contentNode?: ReactNode;
  initialHtml?: string;
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

const COLLAB_USERS = [
  { name: "Mary K.", colorScheme: "purple" as const },
  { name: "James S.", colorScheme: "neutral" as const },
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
    <Button
      type="button"
      title={title}
      onClick={onClick}
      appearance="subtle"
      size="sm"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        flexShrink: 0,
        ...(active && {
          background: "var(--ax-colors-bg-accent-subtle)",
          color: "var(--ax-colors-fg-accent)",
        }),
      }}
    >
      {children}
    </Button>
  );
}
function FmtDivider() {
  return <span style={{ display: "inline-block", width: 1, height: 16, background: "var(--ax-colors-border-secondary)", margin: "0 4px", flexShrink: 0, alignSelf: "center" }} />;
}

// ── WYSIWYG panel ─────────────────────────────────────────────────────────────

function WysiwygPanel({ initialHtml, blameSegments, onContentChange }: { initialHtml: string; blameSegments?: BlameSegment[]; onContentChange?: (text: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight: createLowlight(common) }),
      Extension.create({ name: "blame", addProseMirrorPlugins: () => [createBlamePlugin()] }),
    ],
    content: initialHtml,
    editable: true,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => {
      onContentChange?.(e.getText());
    },
  });

  // Push blame decorations into TipTap when segments change
  useEffect(() => {
    if (!editor) return;
    editor.view.dispatch(
      editor.view.state.tr.setMeta(blamePluginKey, blameSegments && blameSegments.length > 0 ? blameSegments : null)
    );
  }, [editor, blameSegments]);

  if (!editor) return null;

  return (
    <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Formatting toolbar + avatars */}
      <Box display="flex" alignItems="center" px="8" style={{ flexShrink: 0, height: 40, borderBottom: BORDER, gap: 2, overflowX: "auto" }}>
        <FmtBtn title="H1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><span style={{ fontWeight: 700, fontSize: 11, fontFamily: "monospace" }}>H1</span></FmtBtn>
        <FmtBtn title="H2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><span style={{ fontWeight: 700, fontSize: 11, fontFamily: "monospace" }}>H2</span></FmtBtn>
        <FmtBtn title="H3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><span style={{ fontWeight: 700, fontSize: 11, fontFamily: "monospace" }}>H3</span></FmtBtn>
        <FmtDivider />
        <FmtBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><IconBold size={13} /></FmtBtn>
        <FmtBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><IconItalic size={13} /></FmtBtn>
        <FmtBtn title="Strike" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><IconStrikethrough size={13} /></FmtBtn>
        <FmtBtn title="Code" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><IconCode size={13} /></FmtBtn>
        <FmtDivider />
        <FmtBtn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><IconListUl size={13} /></FmtBtn>
        <FmtBtn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><IconListOl size={13} /></FmtBtn>
        <FmtBtn title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><IconQuoteRight size={13} /></FmtBtn>
        <FmtBtn title="Link"><IconLink size={13} /></FmtBtn>
        <Box style={{ flex: 1 }} />
        <Box display="flex" alignItems="center" style={{ gap: 0, flexShrink: 0 }}>
          {COLLAB_USERS.map((u, i) => (
            <Tooltip key={u.name} content={u.name} delayDuration={300}>
              <span style={{ marginLeft: i > 0 ? -6 : 0, zIndex: COLLAB_USERS.length - i, position: "relative", display: "inline-flex" }}>
                <Avatar name={u.name} size="xs" colorScheme={u.colorScheme} style={{ width: 32, height: 32, fontSize: 11, border: "2px solid var(--ax-colors-bg-default)" } as React.CSSProperties} />
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
  artifactTitle,
  artifactStatus,
  artifactVersion,
  artifactSource,
  contentNode,
  initialHtml,
}: CodeCanvasPanelProps) {
  const collabDoc = useCollabDoc(EXAMPLE_HTML);
  const [mode, setMode] = useState<CanvasMode>("preview");
  const [previewHtml, setPreviewHtml] = useState(initialHtml ?? WYSIWYG_CONTENT);

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
        <Button appearance="subtle" size="sm" icon={<IconXmark size={16} />} onClick={onClose} aria-label="Close editor" />
        <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0, margin: "0 4px" }} />

        {/* Artifact title */}
        {artifactTitle && (
          <>
            <Box display="flex" alignItems="center" gap="8" style={{ flexShrink: 1, minWidth: 0, overflow: "hidden" }}>
              <Text fontSize="sm" fontWeight="600" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}>
                {artifactTitle}
              </Text>
              {artifactStatus && (
                <Badge intent={artifactStatus === "Ready" ? "success" : artifactStatus === "Failed" ? "danger" : "neutral"} style={{ flexShrink: 0 }}>
                  {artifactStatus}
                </Badge>
              )}
              {artifactVersion && (
                <Text fontSize="xs" color="fg.tertiary" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>v{artifactVersion}</Text>
              )}
            </Box>
            <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0, margin: "0 4px" }} />
          </>
        )}

        {/* Mode toggle */}
        {!contentNode && (
          <Box display="flex" alignItems="center" gap="8" style={{ flexShrink: 0 }}>
            <Tooltip content="Source code" delayDuration={400}>
              <span>
                <ToggleButton size="sm" appearance="subtle" pressed={mode === "source"} onPressedChange={() => handleSetMode("source")} icon={<IconCode size={15} />} aria-label="Source" />
              </span>
            </Tooltip>
            <Tooltip content="Preview / WYSIWYG" delayDuration={400}>
              <span>
                <ToggleButton size="sm" appearance="subtle" pressed={mode === "preview"} onPressedChange={() => handleSetMode("preview")} icon={<IconEye size={15} />} aria-label="Preview" />
              </span>
            </Tooltip>
          </Box>
        )}

        <Box style={{ flex: 1 }} />

        {/* Right cluster */}
        <Box display="flex" alignItems="center" gap="8" style={{ flexShrink: 0 }}>
          {/* Saved indicator */}
          <Box display="flex" alignItems="center" gap="4">
            <IconCircleCheck size={16} style={{ color: "var(--ax-colors-fg-success)", flexShrink: 0 }} />
            <Text fontSize="sm" color="fg.tertiary" style={{ whiteSpace: "nowrap" }}>Change saved.</Text>
          </Box>

          <Box display="flex" alignItems="center" gap="4">
            <Tooltip content="Undo" delayDuration={400}><span><Button appearance="subtle" size="sm" icon={<IconArrowRotateLeft size={15} />} aria-label="Undo" /></span></Tooltip>
            <Tooltip content="Redo" delayDuration={400}><span><Button appearance="subtle" size="sm" icon={<IconArrowRotateRight size={15} />} aria-label="Redo" /></span></Tooltip>
            <Tooltip content="Copy" delayDuration={400}><span><Button appearance="subtle" size="sm" icon={<IconCopy size={15} />} aria-label="Copy" /></span></Tooltip>
          </Box>

          <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0 }} />

          {/* Contributors toggle */}
          {!contentNode && (
            <Tooltip content={blameActive ? "Hide contributors" : "Show contributors"} delayDuration={300}>
              <span>
                <ToggleButton
                  size="sm"
                  appearance="subtle"
                  pressed={blameActive}
                  onPressedChange={handleToggleBlame}
                  icon={<IconUserGroup size={15} />}
                  aria-label="Toggle contributors"
                />
              </span>
            </Tooltip>
          )}

          {/* Version History */}
          {!contentNode && (
            <Tooltip content="Version history" delayDuration={300}>
              <span>
                <ToggleButton
                  size="sm"
                  appearance="subtle"
                  pressed={versionPanelOpen}
                  onPressedChange={() => setVersionPanelOpen((v) => !v)}
                  icon={<IconClockRotateLeft size={15} />}
                  aria-label="Version history"
                />
              </span>
            </Tooltip>
          )}

          <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0 }} />

          {/* Share */}
          <Menu
            options={[
              { label: "Copy link", addon: <IconLink size={14} />, execute: () => { navigator.clipboard.writeText(window.location.href).catch(() => {}); toaster.create("Link copied to clipboard", { intent: "success" }); } },
              { label: "Microsoft Word (.docx)", addon: <IconFileWord size={14} />, group: { label: "Download as" }, execute: () => {} },
              { label: "PDF Document (.pdf)", addon: <IconFilePdf size={14} />, group: { label: "Download as", hidden: true }, execute: () => {} },
              { label: "Plain Text (.txt)", addon: <IconFileLines size={14} />, group: { label: "Download as", hidden: true }, execute: () => {} },
              { label: "Rich Text Format (.rtf)", addon: <IconFile size={14} />, group: { label: "Download as", hidden: true }, execute: () => {} },
              { label: "Markdown (.md)", addon: <IconFileLines size={14} />, group: { label: "Download as", hidden: true }, execute: () => {} },
            ]}
          >
            <MenuTrigger asChild>
              <Button appearance="default" size="sm" style={{ whiteSpace: "nowrap" }}>Share</Button>
            </MenuTrigger>
            <MenuContent />
          </Menu>

          <Button appearance="primary" size="sm" icon={<IconChevronDown size={13} />} iconPosition="end" style={{ whiteSpace: "nowrap" }}>
            Add to
          </Button>
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

              {/* Version History panel — overlays right side of editor card */}
              {versionPanelOpen && (
                <VersionHistoryPanel
                  versions={versions}
                  onSave={handleSaveVersion}
                  onRevert={handleRevertVersion}
                  onClose={() => setVersionPanelOpen(false)}
                />
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
          <Text fontSize="xs" color="fg.tertiary">HTML · UTF-8</Text>
        </Box>
      )}
    </Box>
  );
}
