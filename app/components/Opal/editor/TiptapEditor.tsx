"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import type { CollabDoc } from "./useCollabDoc";

const lowlight = createLowlight(common);

const TIPTAP_STYLES = `
.tiptap-editor .tiptap {
  outline: none;
  min-height: 100%;
  font-size: 14px;
  line-height: 1.7;
  color: var(--ax-colors-fg-default);
  font-family: var(--ax-fonts-sans, system-ui, sans-serif);
}
.tiptap-editor .tiptap > * + * { margin-top: 0.75em; }
.tiptap-editor .tiptap h1 { font-size: 22px; font-weight: 700; line-height: 1.3; }
.tiptap-editor .tiptap h2 { font-size: 18px; font-weight: 600; line-height: 1.4; }
.tiptap-editor .tiptap h3 { font-size: 15px; font-weight: 600; line-height: 1.4; }
.tiptap-editor .tiptap p { margin: 0; }
.tiptap-editor .tiptap ul,
.tiptap-editor .tiptap ol { padding-left: 1.4em; }
.tiptap-editor .tiptap li { margin-bottom: 2px; }
.tiptap-editor .tiptap blockquote {
  border-left: 3px solid var(--ax-colors-border-accent);
  padding-left: 12px;
  color: var(--ax-colors-fg-secondary);
  font-style: italic;
}
.tiptap-editor .tiptap hr {
  border: none;
  border-top: 1px solid var(--ax-colors-border-secondary);
  margin: 16px 0;
}
.tiptap-editor .tiptap code {
  background: var(--ax-colors-bg-secondary);
  border-radius: 4px;
  padding: 1px 5px;
  font-family: var(--ax-fonts-mono, monospace);
  font-size: 12px;
}
.tiptap-editor .tiptap pre {
  background: #1e1e2e;
  border-radius: 8px;
  padding: 12px 16px;
  overflow-x: auto;
}
.tiptap-editor .tiptap pre code {
  background: none;
  padding: 0;
  font-size: 13px;
  color: #cdd6f4;
  font-family: var(--ax-fonts-mono, monospace);
}
.tiptap-editor .tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: var(--ax-colors-fg-tertiary);
  float: left;
  height: 0;
  pointer-events: none;
}
/* Collaboration cursor */
.tiptap-editor .collaboration-cursor__caret {
  border-left: 2px solid;
  border-right: 2px solid;
  margin-left: -1px;
  margin-right: -1px;
  pointer-events: none;
  position: relative;
  word-break: normal;
}
.tiptap-editor .collaboration-cursor__label {
  border-radius: 3px 3px 3px 0;
  color: #fff;
  font-size: 11px;
  font-style: normal;
  font-weight: 600;
  left: -1px;
  line-height: normal;
  padding: 1px 5px;
  position: absolute;
  top: -1.4em;
  user-select: none;
  white-space: nowrap;
}
`;

type TiptapEditorProps = {
  collabDoc: CollabDoc;
  editable?: boolean;
};

export function TiptapEditor({ collabDoc, editable = true }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        
        codeBlock: false, // replaced by CodeBlockLowlight
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Collaboration.configure({ fragment: collabDoc.xmlFragment }),
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    editable,
    immediatelyRender: false,
  });

  return (
    <div className="tiptap-editor" style={{ height: "100%", minHeight: 0 }}>
      <style>{TIPTAP_STYLES}</style>
      <EditorContent
        editor={editor}
        style={{ height: "100%", minHeight: 0, cursor: "text" }}
      />
    </div>
  );
}

export type { TiptapEditorProps };
export { useEditor };
