"use client";

import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, drawSelection, highlightActiveLine } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { yCollab } from "y-codemirror.next";
import type { CollabDoc } from "./useCollabDoc";

export type CodeMirrorLanguage = "markdown" | "html" | "javascript" | "python";

const LANGUAGE_EXTS: Record<CodeMirrorLanguage, ReturnType<typeof markdown>> = {
  markdown: markdown(),
  html: html(),
  javascript: javascript({ jsx: true, typescript: true }),
  python: python(),
};

const CM_STYLES = `
.cm-editor {
  height: 100%;
  font-size: 13px;
  font-family: var(--ax-fonts-mono, 'JetBrains Mono', 'Fira Code', monospace);
}
.cm-editor.cm-focused { outline: none; }
.cm-scroller { height: 100%; }
`;

type CodeMirrorEditorProps = {
  collabDoc: CollabDoc;
  language?: CodeMirrorLanguage;
  darkMode?: boolean;
};

export function CodeMirrorEditor({
  collabDoc,
  language = "markdown",
  darkMode = true,
}: CodeMirrorEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const extensions = [
      lineNumbers(),
      drawSelection(),
      highlightActiveLine(),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      LANGUAGE_EXTS[language],
      yCollab(collabDoc.ytext, null as any),
      EditorView.lineWrapping,
      ...(darkMode ? [oneDark] : []),
    ];

    // Seed initial doc from ytext so the editor isn't blank on first mount.
    // yCollab keeps subsequent edits in sync — providing doc here is safe.
    const state = EditorState.create({ doc: collabDoc.ytext.toString(), extensions });
    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Re-create when language or dark mode changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, darkMode]);

  return (
    <>
      <style>{CM_STYLES}</style>
      <div
        ref={containerRef}
        style={{ height: "100%", minHeight: 0, overflow: "hidden" }}
      />
    </>
  );
}
