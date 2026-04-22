"use client";

import { Box, Avatar } from "@optiaxiom/react";
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
  IconExpand,
  IconXmark,
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
};

const MOCK_USERS = [
  { name: "Mary Anne", color: "#7C3AED" },
  { name: "Stefan S.", color: "#0EA5E9" },
];

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
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        background: active ? "var(--ax-colors-bg-accent-subtle)" : "transparent",
        color: active ? "var(--ax-colors-fg-accent)" : "var(--ax-colors-fg-secondary)",
        fontSize: 11,
        fontWeight: 700,
        lineHeight: 1,
        transition: "background 0.1s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!active)
          (e.currentTarget as HTMLButtonElement).style.background =
            "var(--ax-colors-bg-secondary)";
      }}
      onMouseLeave={(e) => {
        if (!active)
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      {children}
    </button>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function CollaborativeEditorPanel({
  open,
  onClose,
  filename = "document.md",
  language = "markdown",
}: CollaborativeEditorPanelProps) {
  const [mode, setMode] = useState<ToolbarMode>("wysiwyg");
  const collabDoc = useCollabDoc();

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
      borderL="1"
      borderColor="border.secondary"
      bg="bg.default"
      style={{
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
            <button
              key={m}
              type="button"
              onClick={() => handleModeSwitch(m)}
              style={{
                padding: "3px 10px",
                borderRadius: 4,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                background: mode === m ? "var(--ax-colors-bg-default)" : "transparent",
                color: mode === m ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)",
                boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                transition: "all 0.1s",
              }}
            >
              {m === "wysiwyg" ? "WYSIWYG" : "Source"}
            </button>
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
          <span style={{ fontFamily: "monospace" }}>{"{}"}</span>
        </ToolbarBtn>

        <Box style={{ flex: 1 }} />

        <Button appearance="subtle" size="sm" icon={<IconExpand size={14} />} aria-label="Expand" />
        <Button appearance="subtle" size="sm" icon={<IconXmark size={14} />} onClick={onClose} aria-label="Close" />
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
          <TiptapEditor collabDoc={collabDoc} />
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
        justifyContent="space-between"
        px="16"
        py="8"
        borderT="1"
        borderColor="border.secondary"
        bg="bg.secondary"
        style={{ flexShrink: 0 }}
      >
        <Box display="flex" alignItems="center" gap="8">
          <Box
            rounded="full"
            style={{ width: 8, height: 8, backgroundColor: "#22c55e", flexShrink: 0 }}
          />
          <Text fontSize="xs" color="fg.tertiary">Connected</Text>
          <Text fontSize="xs" color="fg.tertiary" style={{ opacity: 0.4 }}>·</Text>
          <Text fontSize="xs" color="fg.tertiary">{filename}</Text>
        </Box>

        <Box display="flex" alignItems="center" gap="4">
          {MOCK_USERS.map((u) => (
            <Avatar
              key={u.name}
              name={u.name}
              size="xs"
              colorScheme="purple"
              style={{ border: `2px solid ${u.color}` } as React.CSSProperties}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
