"use client";

<<<<<<< HEAD
import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { renderMermaid } from "./mermaid-renderer";
import type { RenderOutcome } from "./mermaid-renderer";
import type { MermaidEditRequestDetail } from "./mermaid-codeblock-extension";
import {
  Box,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogClose,
  Text,
} from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "@tiptap/markdown";
import { createLowlight, common } from "lowlight";
import { MermaidCodeBlock } from "./mermaid-codeblock-extension";
import type { CollabDoc } from "./useCollabDoc";
=======
import {useEditor, EditorContent} from "@tiptap/react";
import {useEffect, useRef, useState, useCallback, useMemo} from "react";
import {renderMermaid} from "./mermaid-renderer";
import type {RenderOutcome} from "./mermaid-renderer";
import type {MermaidEditRequestDetail} from "./mermaid-codeblock-extension";
import {
	Box,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogBody,
	DialogFooter,
	DialogClose,
	Text,
} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import Placeholder from "@tiptap/extension-placeholder";
import {Markdown} from "@tiptap/markdown";
import {createLowlight, common} from "lowlight";
import {MermaidCodeBlock} from "./mermaid-codeblock-extension";
import type {CollabDoc} from "./useCollabDoc";
>>>>>>> origin/main

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
<<<<<<< HEAD
  border-left: 3px solid var(--ax-colors-border-accent);
=======
  border-left: 3px solid var(--ax-colors-border-default);
>>>>>>> origin/main
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
.tiptap-mermaid-source {
  width: 100%;
  min-height: 60vh;
  padding: 10px 12px;
  font-family: var(--ax-fonts-mono, monospace);
  font-size: 13px;
  line-height: 1.6;
  border: 1px solid var(--ax-colors-border-secondary);
  border-radius: 6px;
  background: var(--ax-colors-bg-secondary);
  color: var(--ax-colors-fg-default);
  resize: vertical;
  box-sizing: border-box;
  outline: none;
}
.tiptap-mermaid-source:focus {
<<<<<<< HEAD
  border-color: var(--ax-colors-border-accent);
=======
  border-color: var(--ax-colors-border-focus);
>>>>>>> origin/main
}
/* Mermaid diagram blocks */
.tiptap-editor .me-mermaid-block {
  position: relative;
  margin: 0.75em 0;
  border: 1px solid var(--ax-colors-border-secondary);
  border-radius: 8px;
  background: var(--ax-colors-bg-default);
  padding: 16px;
  overflow: hidden;
}
.tiptap-editor .me-mermaid-block.me-mermaid-selected {
<<<<<<< HEAD
  outline: 2px solid var(--ax-colors-border-accent);
=======
  outline: 2px solid var(--ax-colors-border-focus);
>>>>>>> origin/main
  outline-offset: 1px;
}
.tiptap-editor .me-mermaid-render {
  display: flex;
  justify-content: center;
  min-height: 48px;
}
.tiptap-editor .me-mermaid-render svg {
  max-width: 100%;
  height: auto;
}
.tiptap-editor .me-mermaid-render.me-mermaid-error {
  background: var(--ax-colors-bg-danger-subtle, #fff0f0);
  border-radius: 4px;
  padding: 8px;
}
.tiptap-editor .me-mermaid-error-text {
  color: var(--ax-colors-fg-danger);
  font-size: 12px;
  font-family: var(--ax-fonts-mono, monospace);
  white-space: pre-wrap;
  margin: 0;
}
.tiptap-editor .me-mermaid-edit-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--ax-colors-border-secondary);
  border-radius: 6px;
  background: var(--ax-colors-bg-default);
  color: var(--ax-colors-fg-secondary);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
}
.tiptap-editor .me-mermaid-block:hover .me-mermaid-edit-btn {
  opacity: 1;
}
.tiptap-editor .me-mermaid-edit-btn:hover {
  background: var(--ax-colors-bg-secondary);
  color: var(--ax-colors-fg-default);
}
`;

type TiptapEditorProps = {
<<<<<<< HEAD
  collabDoc?: CollabDoc | null;
  editable?: boolean;
  initialHtml?: string;
  initialMarkdown?: string;
};

export function TiptapEditor({ collabDoc, editable = true, initialHtml, initialMarkdown }: TiptapEditorProps) {
  const isSeeded = !!(initialHtml || initialMarkdown);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mermaidEdit, setMermaidEdit] = useState<MermaidEditRequestDetail | null>(null);
  const [editSource, setEditSource] = useState("");
  const [previewOutcome, setPreviewOutcome] = useState<RenderOutcome | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // replaced by MermaidCodeBlock (extends CodeBlockLowlight)
      }),
      MermaidCodeBlock.configure({ lowlight }),
      Markdown,
      // Skip Collaboration when seeding with static content or when no collab doc provided
      ...(isSeeded || !collabDoc ? [] : [Collaboration.configure({ fragment: collabDoc.xmlFragment })]),
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: initialHtml ?? undefined,
    editable,
    immediatelyRender: false,
  });

  // Seed markdown content after editor + Markdown extension are ready
  useEffect(() => {
    if (!editor || !initialMarkdown) return;
    const manager = editor.storage.markdown?.manager;
    if (manager?.parse) {
      editor.commands.setContent(manager.parse(initialMarkdown));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  // Listen for mermaid edit requests fired by the node view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<MermaidEditRequestDetail>).detail;
      setEditSource(detail.source);
      setMermaidEdit(detail);
    };
    el.addEventListener("mermaid-edit-request", handler);
    return () => el.removeEventListener("mermaid-edit-request", handler);
  }, []);

  // Debounced live preview rendering
  useEffect(() => {
    if (!mermaidEdit) return;
    const timer = setTimeout(async () => {
      if (!editSource.trim()) { setPreviewOutcome(null); return; }
      const outcome = await renderMermaid(editSource);
      setPreviewOutcome(outcome);
    }, 400);
    return () => clearTimeout(timer);
  }, [editSource, mermaidEdit]);

  // Inject SVG into preview container
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    el.innerHTML = "";
    if (previewOutcome?.ok) {
      el.appendChild(previewOutcome.svg);
    }
  }, [previewOutcome]);

  const handleSaveMermaid = useCallback(() => {
    if (!editor || !mermaidEdit) return;
    const { from, to } = mermaidEdit;
    const { state } = editor;
    const node = state.doc.nodeAt(from);
    if (node) {
      const newNode = node.type.create(
        node.attrs,
        editSource.trim() ? state.schema.text(editSource) : undefined,
      );
      editor.view.dispatch(state.tr.replaceWith(from, to, newNode));
    }
    setMermaidEdit(null);
  }, [editor, mermaidEdit, editSource]);

  return (
    <div ref={containerRef} className="tiptap-editor" style={{ height: "100%", minHeight: 0 }}>
      <style>{TIPTAP_STYLES}</style>
      <EditorContent
        editor={editor}
        style={{ height: "100%", minHeight: 0, cursor: "text" }}
      />

      <Dialog open={!!mermaidEdit} onOpenChange={(open) => { if (!open) setMermaidEdit(null); }}>
        <DialogContent size="lg">
          <DialogHeader>Edit Mermaid diagram</DialogHeader>
          <DialogBody>
            <Box display="flex" gap="12" alignItems="stretch">
              {/* Keep as raw textarea: needs ref + className for Mermaid source editing */}
              <textarea
                className="tiptap-mermaid-source"
                style={{ flex: 1 }}
                value={editSource}
                onChange={(e) => setEditSource(e.target.value)}
                autoFocus
                spellCheck={false}
              />
              <Box
                border="1"
                borderColor="border.secondary"
                rounded="md"
                bg="bg.default"
                display="flex"
                flexDirection="column"
                alignItems="center"
                p="16"
                style={{
                  flex: 1,
                  minHeight: "60vh",
                  overflow: "auto",
                  justifyContent: previewOutcome?.ok ? "flex-start" : "center",
                }}
              >
                {!editSource.trim() && (
                  <Text fontSize="sm" color="fg.tertiary">Preview will appear here</Text>
                )}
                {previewOutcome && !previewOutcome.ok && (
                  <pre style={{ fontSize: 12, color: "var(--ax-colors-fg-danger)", fontFamily: "var(--ax-fonts-mono, monospace)", whiteSpace: "pre-wrap", margin: 0 }}>
                    {previewOutcome.message}
                  </pre>
                )}
                {/* Raw div required: mermaid SVG is injected via innerHTML into a real DOM node */}
                <div ref={previewRef} style={{ width: "100%", maxWidth: "100%" }} />
              </Box>
            </Box>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button appearance="subtle">Cancel</Button>
            </DialogClose>
            <Button appearance="primary" onClick={handleSaveMermaid}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export type { TiptapEditorProps };
export { useEditor };
=======
	collabDoc?: CollabDoc | null;
	editable?: boolean;
	initialHtml?: string;
	initialMarkdown?: string;
};

export function TiptapEditor({
	collabDoc,
	editable = true,
	initialHtml,
	initialMarkdown,
}: TiptapEditorProps) {
	const isSeeded = !!(initialHtml || initialMarkdown);
	const containerRef = useRef<HTMLDivElement>(null);
	const [mermaidEdit, setMermaidEdit] = useState<MermaidEditRequestDetail | null>(null);
	const [editSource, setEditSource] = useState("");
	const [previewOutcome, setPreviewOutcome] = useState<RenderOutcome | null>(null);
	const previewRef = useRef<HTMLDivElement>(null);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				codeBlock: false, // replaced by MermaidCodeBlock (extends CodeBlockLowlight)
			}),
			MermaidCodeBlock.configure({lowlight}),
			Markdown,
			// Skip Collaboration when seeding with static content or when no collab doc provided
			...(isSeeded || !collabDoc
				? []
				: [Collaboration.configure({fragment: collabDoc.xmlFragment})]),
			Placeholder.configure({placeholder: "Start writing…"}),
		],
		content: initialHtml ?? undefined,
		editable,
		immediatelyRender: false,
	});

	// Seed markdown content after editor + Markdown extension are ready
	useEffect(() => {
		if (!editor || !initialMarkdown) return;
		const manager = editor.storage.markdown?.manager;
		if (manager?.parse) {
			editor.commands.setContent(manager.parse(initialMarkdown));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editor]);

	// Listen for mermaid edit requests fired by the node view
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const handler = (e: Event) => {
			const detail = (e as CustomEvent<MermaidEditRequestDetail>).detail;
			setEditSource(detail.source);
			setMermaidEdit(detail);
		};
		el.addEventListener("mermaid-edit-request", handler);
		return () => el.removeEventListener("mermaid-edit-request", handler);
	}, []);

	// Debounced live preview rendering
	useEffect(() => {
		if (!mermaidEdit) return;
		const timer = setTimeout(async () => {
			if (!editSource.trim()) {
				setPreviewOutcome(null);
				return;
			}
			const outcome = await renderMermaid(editSource);
			setPreviewOutcome(outcome);
		}, 400);
		return () => clearTimeout(timer);
	}, [editSource, mermaidEdit]);

	// Inject SVG into preview container
	useEffect(() => {
		const el = previewRef.current;
		if (!el) return;
		el.innerHTML = "";
		if (previewOutcome?.ok) {
			el.appendChild(previewOutcome.svg);
		}
	}, [previewOutcome]);

	const handleSaveMermaid = useCallback(() => {
		if (!editor || !mermaidEdit) return;
		const {from, to} = mermaidEdit;
		const {state} = editor;
		const node = state.doc.nodeAt(from);
		if (node) {
			const newNode = node.type.create(
				node.attrs,
				editSource.trim() ? state.schema.text(editSource) : undefined
			);
			editor.view.dispatch(state.tr.replaceWith(from, to, newNode));
		}
		setMermaidEdit(null);
	}, [editor, mermaidEdit, editSource]);

	return (
		<div ref={containerRef} className="tiptap-editor" style={{height: "100%", minHeight: 0}}>
			<style>{TIPTAP_STYLES}</style>
			<EditorContent editor={editor} style={{height: "100%", minHeight: 0, cursor: "text"}} />

			<Dialog
				open={!!mermaidEdit}
				onOpenChange={(open) => {
					if (!open) setMermaidEdit(null);
				}}
			>
				<DialogContent size="lg">
					<DialogHeader>Edit Mermaid diagram</DialogHeader>
					<DialogBody>
						<Box display="flex" gap="12" alignItems="stretch">
							{/* Keep as raw textarea: needs ref + className for Mermaid source editing */}
							<textarea
								className="tiptap-mermaid-source"
								style={{flex: 1}}
								value={editSource}
								onChange={(e) => setEditSource(e.target.value)}
								autoFocus
								spellCheck={false}
							/>
							<Box
								border="1"
								borderColor="border.secondary"
								rounded="md"
								bg="bg.default"
								display="flex"
								flexDirection="column"
								alignItems="center"
								p="16"
								style={{
									flex: 1,
									minHeight: "60vh",
									overflow: "auto",
									justifyContent: previewOutcome?.ok ? "flex-start" : "center",
								}}
							>
								{!editSource.trim() && (
									<Text fontSize="sm" color="fg.tertiary">
										Preview will appear here
									</Text>
								)}
								{previewOutcome && !previewOutcome.ok && (
									<pre
										style={{
											fontSize: 12,
											color: "var(--ax-colors-fg-danger)",
											fontFamily: "var(--ax-fonts-mono, monospace)",
											whiteSpace: "pre-wrap",
											margin: 0,
										}}
									>
										{previewOutcome.message}
									</pre>
								)}
								{/* Raw div required: mermaid SVG is injected via innerHTML into a real DOM node */}
								<div ref={previewRef} style={{width: "100%", maxWidth: "100%"}} />
							</Box>
						</Box>
					</DialogBody>
					<DialogFooter>
						<DialogClose asChild>
							<Button appearance="subtle">Cancel</Button>
						</DialogClose>
						<Button appearance="primary" onClick={handleSaveMermaid}>
							Save
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export type {TiptapEditorProps};
export {useEditor};
>>>>>>> origin/main
