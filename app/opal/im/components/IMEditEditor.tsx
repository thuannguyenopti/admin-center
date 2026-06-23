"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "@tiptap/markdown";

type IMEditEditorProps = {
  initialContent: string;
  onSave: (markdown: string) => void;
  onCancel: () => void;
};

export function IMEditEditor({ initialContent, onSave, onCancel }: IMEditEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Placeholder.configure({ placeholder: "Edit message…" }),
    ],
    content: initialContent,
    contentType: "markdown",
    autofocus: "end",
    editorProps: {
      attributes: { class: "im-edit-editor-content" },
      handleKeyDown(_, event) {
        if (event.key === "Escape") {
          onCancel();
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor) editor.commands.focus("end");
  }, [editor]);

  const handleSave = () => {
    if (!editor) return;
    const md = editor.getMarkdown().trim();
    if (md) onSave(md);
  };

  return (
    <div style={{ width: "100%" }}>
      <style>{`
        .im-edit-editor-wrap {
          border: 1.5px solid var(--ax-colors-border-accent);
          border-radius: 10px;
          background: var(--ax-colors-bg-default);
          box-shadow: 0 0 0 3px var(--ax-colors-bg-accent-subtle);
          padding: 8px 12px;
          cursor: text;
        }
        .im-edit-editor-content {
          font-size: 14px;
          line-height: 20px;
          font-family: inherit;
          color: var(--ax-colors-fg-default);
          outline: none;
          min-height: 24px;
          word-break: break-word;
        }
        .im-edit-editor-content p { margin: 0; }
        .im-edit-editor-content p + p { margin-top: 4px; }
        .im-edit-editor-content strong { font-weight: 600; }
        .im-edit-editor-content em { font-style: italic; }
        .im-edit-editor-content code {
          background: var(--ax-colors-bg-secondary);
          border-radius: 3px;
          padding: 1px 4px;
          font-size: 13px;
          font-family: ui-monospace, monospace;
        }
        .im-edit-editor-content .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: var(--ax-colors-fg-tertiary);
          float: left;
          pointer-events: none;
          height: 0;
        }
      `}</style>

      <div className="im-edit-editor-wrap" onClick={() => editor?.commands.focus()}>
        <EditorContent editor={editor} />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 6 }}>
        <button
          onClick={onCancel}
          style={{
            padding: "4px 10px", borderRadius: 6,
            border: "1px solid var(--ax-colors-border-default)",
            background: "var(--ax-colors-bg-default)",
            color: "var(--ax-colors-fg-default)",
            fontSize: 12, fontFamily: "inherit", cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ax-colors-bg-secondary)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--ax-colors-bg-default)")}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: "4px 10px", borderRadius: 6, border: "none",
            background: "var(--ax-colors-bg-accent)",
            color: "var(--ax-colors-fg-default-inverse)",
            fontSize: 12, fontFamily: "inherit", cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Save
        </button>
      </div>
    </div>
  );
}
