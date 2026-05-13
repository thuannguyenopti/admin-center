"use client";

import { Box, Tooltip } from "@optiaxiom/react";
import { Text } from "../Text";
import { Button } from "../Button";
import {
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconCode,
  IconListUl,
  IconListOl,
  IconQuoteRight,
  IconHorizontalRule,
  IconLink,
  IconArrowRotateLeft,
  IconArrowRotateRight,
} from "@optimizely/axiom-icons";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useCollabDoc } from "./editor/useCollabDoc";
import type { EditorFileType } from "./EditorOutputCard";

// Both editors are client-only (DOM APIs) — load lazily
const TiptapEditor = dynamic(
  () => import("./editor/TiptapEditor").then((m) => m.TiptapEditor),
  { ssr: false }
);
const CodeMirrorEditor = dynamic(
  () => import("./editor/CodeMirrorEditor").then((m) => m.CodeMirrorEditor),
  { ssr: false }
);

type ToolbarMode = "wysiwyg" | "source";

export type CodeMirrorLanguage = "markdown" | "html" | "javascript" | "python";

type CollaborativeEditorPanelProps = {
  open: boolean;
  onClose: () => void;
  filename?: string;
  fileType?: EditorFileType;
  language?: CodeMirrorLanguage;
  /** Fill the parent container instead of using a fixed 520px width */
  fluid?: boolean;
  /** Seed the editor with this markdown string on first open */
  initialMarkdown?: string;
};

// ── Toolbar helpers ──────────────────────────────────────────────────────────

function ToolbarDivider() {
  return (
    <Box
      style={{
        width: 1,
        height: 16,
        background: "var(--ax-colors-border-secondary)",
        flexShrink: 0,
        margin: "0 2px",
      }}
    />
  );
}

function ToolbarBtn({
  title,
  active,
  onClick,
  children,
}: {
  title?: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      appearance="subtle"
      size="sm"
      title={title}
      onClick={onClick}
      style={{
        width: 28,
        minWidth: 28,
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

// ── Main component ───────────────────────────────────────────────────────────

export function CollaborativeEditorPanel({
  open,
  onClose,
  filename = "document.md",
  language = "markdown",
  fluid = false,
  initialMarkdown,
}: CollaborativeEditorPanelProps) {
  const [mode, setMode] = useState<ToolbarMode>("wysiwyg");
  const collabDoc = useCollabDoc(initialMarkdown);

  const handleModeSwitch = useCallback(
    (next: ToolbarMode) => {
      if (next === mode) return;
      setMode(next);
    },
    [mode]
  );

  if (!open) return null;

  const cmLang: CodeMirrorLanguage =
    language === "html" ? "html"
    : language === "javascript" ? "javascript"
    : language === "python" ? "python"
    : "markdown";

  return (
    <Box
      display="flex"
      flexDirection="column"
      {...(!fluid && { borderL: "1", borderColor: "border.secondary" })}
      bg="bg.default"
      style={fluid ? {
        flex: 1,
        minWidth: 0,
        height: "100%",
        overflow: "hidden",
      } : {
        width: 520,
        minWidth: 360,
        maxWidth: "45vw",
        height: "100%",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* ── Toolbar ── */}
      <Box
        display="flex"
        alignItems="center"
        gap="4"
        px="12"
        py="6"
        borderB="1"
        borderColor="border.secondary"
        bg="bg.default"
        style={{ flexShrink: 0, flexWrap: "wrap", minHeight: 44 }}
      >
        {/* Mode toggle */}
        <Box display="flex" bg="bg.secondary" rounded="md" p="2" gap="2" style={{ flexShrink: 0 }}>
          {(["wysiwyg", "source"] as ToolbarMode[]).map((m) => (
            <Button
              key={m}
              appearance="subtle"
              size="sm"
              onClick={() => handleModeSwitch(m)}
              style={{
                padding: "3px 10px",
                fontSize: 12,
                fontWeight: 600,
                ...(mode === m && {
                  background: "var(--ax-colors-bg-default)",
                  color: "var(--ax-colors-fg-default)",
                }),
              }}
            >
              {m === "wysiwyg" ? "Visual" : "Source"}
            </Button>
          ))}
        </Box>

        <ToolbarDivider />

        {/* Inline formatting — only meaningful in WYSIWYG, shown in both modes */}
        <ToolbarBtn title="Bold"><IconBold size={13} /></ToolbarBtn>
        <ToolbarBtn title="Italic"><IconItalic size={13} /></ToolbarBtn>
        <ToolbarBtn title="Strikethrough"><IconStrikethrough size={13} /></ToolbarBtn>
        <ToolbarBtn title="Inline code"><IconCode size={13} /></ToolbarBtn>

        <ToolbarDivider />

        <ToolbarBtn title="Heading 1">H1</ToolbarBtn>
        <ToolbarBtn title="Heading 2">H2</ToolbarBtn>
        <ToolbarBtn title="Heading 3">H3</ToolbarBtn>

        <ToolbarDivider />

        <ToolbarBtn title="Bullet list"><IconListUl size={13} /></ToolbarBtn>
        <ToolbarBtn title="Ordered list"><IconListOl size={13} /></ToolbarBtn>
        <ToolbarBtn title="Blockquote"><IconQuoteRight size={13} /></ToolbarBtn>
        <ToolbarBtn title="Horizontal rule"><IconHorizontalRule size={13} /></ToolbarBtn>

        <ToolbarDivider />

        <ToolbarBtn title="Link"><IconLink size={13} /></ToolbarBtn>
        <ToolbarBtn title="Code block">
          <Box style={{ fontFamily: "monospace" }}>{"{}"}</Box>
        </ToolbarBtn>

        <Box style={{ flex: 1 }} />

        <ToolbarDivider />

        <Tooltip content="Undo" delayDuration={400}>
          <span><Button appearance="subtle" size="sm" icon={<IconArrowRotateLeft size={13} />} aria-label="Undo" /></span>
        </Tooltip>
        <Tooltip content="Redo" delayDuration={400}>
          <span><Button appearance="subtle" size="sm" icon={<IconArrowRotateRight size={13} />} aria-label="Redo" /></span>
        </Tooltip>
      </Box>

      {/* ── Editor area ── */}
      <Box
        flex="1"
        style={{ overflow: "hidden", minHeight: 0, position: "relative" }}
      >
        {/* WYSIWYG */}
        <Box
          style={{
            position: "absolute",
            inset: 0,
            padding: "24px 28px",
            overflowY: "auto",
            visibility: mode === "wysiwyg" ? "visible" : "hidden",
            pointerEvents: mode === "wysiwyg" ? "auto" : "none",
          }}
        >
          <TiptapEditor collabDoc={collabDoc} initialMarkdown={initialMarkdown} />
        </Box>

        {/* Source */}
        <Box
          style={{
            position: "absolute",
            inset: 0,
            visibility: mode === "source" ? "visible" : "hidden",
            pointerEvents: mode === "source" ? "auto" : "none",
          }}
        >
          <CodeMirrorEditor collabDoc={collabDoc} language={cmLang} darkMode />
        </Box>
      </Box>

      {/* ── Status bar ── */}
      <Box
        display="flex"
        alignItems="center"
        gap="8"
        px="16"
        py="8"
        borderT="1"
        borderColor="border.secondary"
        bg="bg.secondary"
        style={{ flexShrink: 0 }}
      >
        <Box
          rounded="full"
          style={{ width: 8, height: 8, background: "var(--ax-colors-fg-positive)", flexShrink: 0 }}
        />
        <Text fontSize="sm" color="fg.tertiary" style={{ fontSize: 12 }}>Connected</Text>
        <Text fontSize="sm" color="fg.tertiary" style={{ fontSize: 12, opacity: 0.4 }}>·</Text>
        <Text fontSize="sm" color="fg.tertiary" style={{ fontSize: 12 }}>{filename}</Text>
      </Box>
    </Box>
  );
}
