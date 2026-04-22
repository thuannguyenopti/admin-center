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
} from "@optimizely/axiom-icons";
import { useState, useCallback, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useCollabDoc } from "./editor/useCollabDoc";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import type { EditorFileType } from "./EditorOutputCard";
import type { CodeMirrorLanguage } from "./CollaborativeEditorPanel";

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
  /** When set, shows artifact title/status/version in the toolbar (artifact viewer mode) */
  artifactTitle?: string;
  artifactStatus?: string;
  artifactVersion?: string;
  /** When set, renders this node filling the editor card instead of source/WYSIWYG panels.
   *  Also hides the source/preview toggle buttons and the status bar. */
  contentNode?: ReactNode;
};

// ── Example landing page HTML ─────────────────────────────────────────────────

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
    .hero .cta:hover { opacity: 0.9; }
    .features { padding: 64px 24px; max-width: 960px; margin: 0 auto; }
    .features h2 { text-align: center; font-size: 32px; font-weight: 700; margin-bottom: 48px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
    .card { padding: 28px; border: 1px solid #e5e7eb; border-radius: 12px; }
    .card .icon { font-size: 28px; margin-bottom: 12px; }
    .card h3 { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
    .card p { color: #6b7280; line-height: 1.6; font-size: 15px; }
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
      <div class="card"><div class="icon">⚡</div><h3>Lightning fast</h3><p>Deploy in minutes, not months. Our platform handles the heavy lifting so you can focus on what matters.</p></div>
      <div class="card"><div class="icon">🎯</div><h3>Data-driven</h3><p>Make decisions backed by real user behavior. Built-in A/B testing and analytics out of the box.</p></div>
      <div class="card"><div class="icon">🔒</div><h3>Enterprise-ready</h3><p>SOC 2 compliant, SSO support, and role-based access control — built for teams of any size.</p></div>
    </div>
  </section>
  <footer><p>© 2025 Your Company · All rights reserved.</p></footer>
</body>
</html>`;

// ── Prose-only content for Tiptap WYSIWYG (no DOCTYPE / head / style tags) ───

const WYSIWYG_CONTENT = `<h1>Build something people love</h1>
<p>The fastest way to launch, test, and optimize your product with AI-powered insights.</p>
<h2>Everything you need to grow</h2>
<h3>⚡ Lightning fast</h3>
<p>Deploy in minutes, not months. Our platform handles the heavy lifting so you can focus on what matters.</p>
<h3>🎯 Data-driven</h3>
<p>Make decisions backed by real user behavior. Built-in A/B testing and analytics out of the box.</p>
<h3>🔒 Enterprise-ready</h3>
<p>SOC 2 compliant, SSO support, and role-based access control — built for teams of any size.</p>`;

// ── Mock concurrent users ─────────────────────────────────────────────────────

const COLLAB_USERS = [
  { name: "Mary K.", colorScheme: "purple" as const, borderColor: "#7c3aed" },
  { name: "James S.", colorScheme: "neutral" as const, borderColor: "#0ea5e9" },
];

// ── Formatting toolbar helpers ────────────────────────────────────────────────

const WYSIWYG_STYLES = `
.tiptap-canvas .tiptap { outline: none; font-size: 14px; line-height: 1.75; color: var(--ax-colors-fg-default); font-family: var(--ax-fonts-sans, system-ui, sans-serif); }
.tiptap-canvas .tiptap > * + * { margin-top: 0.75em; }
.tiptap-canvas .tiptap h1 { font-size: 22px; font-weight: 700; line-height: 1.3; }
.tiptap-canvas .tiptap h2 { font-size: 18px; font-weight: 600; line-height: 1.4; }
.tiptap-canvas .tiptap h3 { font-size: 15px; font-weight: 600; }
.tiptap-canvas .tiptap p { margin: 0; }
.tiptap-canvas .tiptap ul, .tiptap-canvas .tiptap ol { padding-left: 1.4em; }
.tiptap-canvas .tiptap li { margin-bottom: 2px; }
.tiptap-canvas .tiptap blockquote { border-left: 3px solid var(--ax-colors-border-accent); padding-left: 12px; color: var(--ax-colors-fg-secondary); font-style: italic; margin: 0; }
.tiptap-canvas .tiptap code { background: var(--ax-colors-bg-secondary); border-radius: 4px; padding: 1px 5px; font-family: var(--ax-fonts-mono, monospace); font-size: 12px; }
.tiptap-canvas .tiptap pre { background: var(--ax-colors-bg-secondary); border-radius: 8px; padding: 12px 16px; overflow-x: auto; }
.tiptap-canvas .tiptap pre code { background: none; padding: 0; font-size: 13px; font-family: var(--ax-fonts-mono, monospace); color: inherit; }
`;

function FmtBtn({ title, active, onClick, children }: { title: string; active?: boolean; onClick?: () => void; children: React.ReactNode; }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 28, height: 28, border: "none", borderRadius: 4, cursor: "pointer",
        background: active ? "var(--ax-colors-bg-accent-subtle)" : "transparent",
        color: active ? "var(--ax-colors-fg-accent)" : "var(--ax-colors-fg-secondary)",
        transition: "background 0.1s", flexShrink: 0,
      }}
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "var(--ax-colors-bg-secondary)"; }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
    >
      {children}
    </button>
  );
}

function FmtDivider() {
  return <span style={{ display: "inline-block", width: 1, height: 16, background: "var(--ax-colors-border-secondary)", margin: "0 4px", flexShrink: 0, alignSelf: "center" }} />;
}

// ── WYSIWYG panel with formatting toolbar + avatars ───────────────────────────

function WysiwygPanel({ initialHtml }: { initialHtml: string }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight: createLowlight(common) }),
    ],
    content: initialHtml,
    editable: true,
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Formatting toolbar + concurrent users */}
      <Box
        display="flex"
        alignItems="center"
        px="8"
        style={{ flexShrink: 0, height: 40, borderBottom: "1px solid var(--ax-colors-border-secondary)", gap: 2, overflowX: "auto" }}
      >
        <FmtBtn title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <span style={{ fontWeight: 700, fontSize: 11, fontFamily: "monospace" }}>H1</span>
        </FmtBtn>
        <FmtBtn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <span style={{ fontWeight: 700, fontSize: 11, fontFamily: "monospace" }}>H2</span>
        </FmtBtn>
        <FmtBtn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <span style={{ fontWeight: 700, fontSize: 11, fontFamily: "monospace" }}>H3</span>
        </FmtBtn>
        <FmtDivider />
        <FmtBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><IconBold size={13} /></FmtBtn>
        <FmtBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><IconItalic size={13} /></FmtBtn>
        <FmtBtn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><IconStrikethrough size={13} /></FmtBtn>
        <FmtBtn title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><IconCode size={13} /></FmtBtn>
        <FmtDivider />
        <FmtBtn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><IconListUl size={13} /></FmtBtn>
        <FmtBtn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><IconListOl size={13} /></FmtBtn>
        <FmtBtn title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><IconQuoteRight size={13} /></FmtBtn>
        <FmtBtn title="Link" onClick={() => {}}><IconLink size={13} /></FmtBtn>

        {/* Spacer + concurrent user avatars */}
        <Box style={{ flex: 1 }} />
        <Box display="flex" alignItems="center" style={{ gap: 0, flexShrink: 0 }}>
          {COLLAB_USERS.map((u, i) => (
            <Tooltip key={u.name} content={u.name} delayDuration={300}>
              <span style={{ marginLeft: i > 0 ? -6 : 0, zIndex: COLLAB_USERS.length - i, position: "relative", display: "inline-flex" }}>
                <Avatar
                  name={u.name}
                  size="xs"
                  colorScheme={u.colorScheme}
                  style={{ width: 32, height: 32, fontSize: 11, border: `2px solid var(--ax-colors-bg-default)` } as React.CSSProperties}
                />
              </span>
            </Tooltip>
          ))}
        </Box>
      </Box>

      {/* Editable content */}
      <Box style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "24px 32px" }}>
        <style>{WYSIWYG_STYLES}</style>
        <div className="tiptap-canvas"><EditorContent editor={editor} /></div>
      </Box>
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
  contentNode,
}: CodeCanvasPanelProps) {
  const collabDoc = useCollabDoc(EXAMPLE_HTML);
  const [mode, setMode] = useState<CanvasMode>("preview");
  const [previewHtml, setPreviewHtml] = useState(WYSIWYG_CONTENT);

  const handleSetMode = useCallback((next: CanvasMode) => {
    if (next === "preview") setPreviewHtml(collabDoc.ytext.toString() || WYSIWYG_CONTENT);
    setMode(next);
  }, [collabDoc]);


  return (
    <Box
      display="flex"
      flexDirection="column"
      bg="bg.secondary"
      style={{ flex: 1, minWidth: 0, height: "100%", overflow: "hidden", borderRight: "1px solid var(--ax-colors-border-secondary)" }}
    >
      {/* ── Toolbar ── */}
      <Box
        display="flex"
        alignItems="center"
        gap="4"
        px="12"
        bg="bg.default"
        style={{ flexShrink: 0, borderBottom: "1px solid var(--ax-colors-border-secondary)", height: 48, flexWrap: "nowrap", overflow: "hidden" }}
      >
        <Button appearance="subtle" size="sm" icon={<IconXmark size={16} />} onClick={onClose} aria-label="Close editor" />
        <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0, margin: "0 4px" }} />

        {/* Artifact title — only shown in artifact viewer mode */}
        {artifactTitle && (
          <>
            <Box display="flex" alignItems="center" gap="8" style={{ flexShrink: 1, minWidth: 0, overflow: "hidden" }}>
              <Text
                fontSize="sm"
                fontWeight="600"
                style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}
              >
                {artifactTitle}
              </Text>
              {artifactStatus && (
                <Badge
                  intent={artifactStatus === "Ready" ? "success" : artifactStatus === "Failed" ? "danger" : "neutral"}
                  style={{ flexShrink: 0 }}
                >
                  {artifactStatus}
                </Badge>
              )}
              {artifactVersion && (
                <Text fontSize="xs" color="fg.tertiary" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
                  v{artifactVersion}
                </Text>
              )}
            </Box>
            <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0, margin: "0 4px" }} />
          </>
        )}

        {!contentNode && (
          <Box display="flex" alignItems="center" gap="8" style={{ flexShrink: 0 }}>
            <Tooltip content="Source code" delayDuration={400}>
              <span>
                <ToggleButton size="sm" appearance="subtle" pressed={mode === "source"} onPressedChange={() => handleSetMode("source")} icon={<IconCode size={15} />} aria-label="Source" />
              </span>
            </Tooltip>
            <Tooltip content="Preview" delayDuration={400}>
              <span>
                <ToggleButton size="sm" appearance="subtle" pressed={mode === "preview"} onPressedChange={() => handleSetMode("preview")} icon={<IconEye size={15} />} aria-label="Preview" />
              </span>
            </Tooltip>
          </Box>
        )}

        <Box style={{ flex: 1 }} />

        {/* Right cluster */}
        <Box display="flex" alignItems="center" gap="12" style={{ flexShrink: 0 }}>
          {/* Saved indicator */}
          <Box display="flex" alignItems="center" gap="4">
            <IconCircleCheck size={16} style={{ color: "var(--ax-colors-fg-success)", flexShrink: 0 }} />
            <Text fontSize="sm" color="fg.tertiary" style={{ whiteSpace: "nowrap" }}>Change saved.</Text>
          </Box>

          <Box display="flex" alignItems="center" gap="8">
            <Tooltip content="Undo" delayDuration={400}><span><Button appearance="subtle" size="sm" icon={<IconArrowRotateLeft size={15} />} aria-label="Undo" /></span></Tooltip>
            <Tooltip content="Redo" delayDuration={400}><span><Button appearance="subtle" size="sm" icon={<IconArrowRotateLeft size={15} style={{ transform: "scaleX(-1)" }} />} aria-label="Redo" /></span></Tooltip>
            <Tooltip content="Copy" delayDuration={400}><span><Button appearance="subtle" size="sm" icon={<IconCopy size={15} />} aria-label="Copy" /></span></Tooltip>
          </Box>

          <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0 }} />

          {/* Share — Axiom Menu with Copy link + Download as */}
          <Menu
            options={[
              {
                label: "Copy link",
                addon: <IconLink size={14} />,
                execute: () => {
                  navigator.clipboard.writeText(window.location.href).catch(() => {});
                  toaster.create("Link copied to clipboard", { intent: "success" });
                },
              },
              {
                label: "Microsoft Word (.docx)",
                addon: <IconFileWord size={14} />,
                group: { label: "Download as" },
                execute: () => {},
              },
              {
                label: "PDF Document (.pdf)",
                addon: <IconFilePdf size={14} />,
                group: { label: "Download as", hidden: true },
                execute: () => {},
              },
              {
                label: "Plain Text (.txt)",
                addon: <IconFileLines size={14} />,
                group: { label: "Download as", hidden: true },
                execute: () => {},
              },
              {
                label: "Rich Text Format (.rtf)",
                addon: <IconFile size={14} />,
                group: { label: "Download as", hidden: true },
                execute: () => {},
              },
              {
                label: "Markdown (.md)",
                addon: <IconFileLines size={14} />,
                group: { label: "Download as", hidden: true },
                execute: () => {},
              },
            ]}
          >
            <MenuTrigger asChild>
              <Button appearance="default" size="sm" style={{ whiteSpace: "nowrap" }}>
                Share
              </Button>
            </MenuTrigger>
            <MenuContent />
          </Menu>

          {/* Add to */}
          <Button appearance="primary" size="sm" icon={<IconChevronDown size={13} />} iconPosition="end" style={{ whiteSpace: "nowrap" }}>
            Add to
          </Button>
        </Box>
      </Box>

      {/* ── Editor card ── */}
      <Box style={{ flex: 1, minHeight: 0, overflow: "hidden", padding: "16px", display: "flex", flexDirection: "column" }}>
        <Box
          bg="bg.default"
          style={{ flex: 1, minHeight: 0, borderRadius: 10, boxShadow: "0 1px 8px rgba(0,0,0,0.08), 0 0 0 1px var(--ax-colors-border-secondary)", overflow: "hidden", position: "relative" }}
        >
          {contentNode ? (
            <Box style={{ position: "absolute", inset: 0 }}>
              {contentNode}
            </Box>
          ) : (
            <>
              {/* Source — always mounted to keep Yjs state alive */}
              <Box
                style={{
                  position: "absolute", inset: 0,
                  visibility: mode === "source" ? "visible" : "hidden",
                  pointerEvents: mode === "source" ? "auto" : "none",
                }}
              >
                <CodeMirrorEditor collabDoc={collabDoc} language="html" darkMode={false} />
              </Box>

              {/* Preview (WYSIWYG + formatting toolbar + avatars) */}
              {mode === "preview" && (
                <Box style={{ position: "absolute", inset: 0 }}>
                  <WysiwygPanel key={previewHtml} initialHtml={previewHtml} />
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* ── Status bar — hidden when contentNode is provided ── */}
      {!contentNode && (
        <Box
          display="flex"
          alignItems="center"
          px="20"
          py="6"
          style={{ flexShrink: 0, borderTop: "1px solid var(--ax-colors-border-secondary)" }}
        >
          <Text fontSize="xs" color="fg.tertiary" style={{ fontFamily: "var(--ax-fonts-mono, monospace)" }}>{filename}</Text>
          <Box style={{ flex: 1 }} />
          <Text fontSize="xs" color="fg.tertiary">HTML · UTF-8</Text>
        </Box>
      )}
    </Box>
  );
}
