"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { useEffect, useRef } from "react";
import { richTextContentStyles } from "../../constants";
import { RichToolbar } from "./RichToolbar";

type EditorSurfaceProps = {
	content: string;
	onChange: (value: string) => void;
};

export function EditorSurface({ content, onChange }: EditorSurfaceProps) {
	const editorRef = useRef<HTMLDivElement | null>(null);
	const selectionRef = useRef<Range | null>(null);

	useEffect(() => {
		const editor = editorRef.current;

		if (!editor || editor.innerHTML === content) {
			return;
		}

		editor.innerHTML = content;
	}, [content]);

	const saveSelection = () => {
		const selection = window.getSelection();
		const editor = editorRef.current;

		if (!selection || selection.rangeCount === 0 || !editor) {
			return;
		}

		const range = selection.getRangeAt(0);

		if (editor.contains(range.commonAncestorContainer)) {
			selectionRef.current = range.cloneRange();
		}
	};

	const restoreSelection = () => {
		const selection = window.getSelection();
		const range = selectionRef.current;

		if (!selection || !range) {
			return;
		}

		selection.removeAllRanges();
		selection.addRange(range);
	};

	const commitEditorChange = () => {
		saveSelection();
		onChange(editorRef.current?.innerHTML ?? "");
	};

	const runCommand = (command: string, value?: string) => {
		editorRef.current?.focus();
		restoreSelection();
		document.execCommand("styleWithCSS", false, "true");
		document.execCommand(command, false, value);
		commitEditorChange();
	};

	const handleToolbarAction = (action: string, value?: string) => {
		switch (action) {
			case "paragraph":
				runCommand("formatBlock", "p");
				return;
			case "heading-two":
				runCommand("formatBlock", "h2");
				return;
			case "heading-three":
				runCommand("formatBlock", "h3");
				return;
			case "blockquote":
				runCommand("formatBlock", "blockquote");
				return;
			case "code-block":
				runCommand("formatBlock", "pre");
				return;
			case "font-size":
				runCommand("fontSize", value);
				return;
			case "create-link": {
				const url = window.prompt("Enter a URL");

				if (!url) {
					return;
				}

				runCommand("createLink", url);
				return;
			}
			case "text-color": {
				const color = window.prompt("Enter a text color", "#1D4ED8");

				if (!color) {
					return;
				}

				runCommand("foreColor", color);
				return;
			}
			default:
				runCommand(action, value);
		}
	};

	return (
		<Box bg="bg.default" border="1" borderColor="border.default" rounded="lg" style={{ overflow: "hidden" }}>
			<style>{richTextContentStyles}</style>
			<RichToolbar onAction={handleToolbarAction} />
			<Box p="20" style={{ lineHeight: 1.5, minHeight: 620 }}>
				<Text color="fg.tertiary" fontSize="sm">
					Last Modified by Sasha Thiel on Jan 25, 2026, 2:58 PM
				</Text>
				<Box mt="20">
					<div
						className="brief-editor-content"
						contentEditable
						onInput={commitEditorChange}
						onKeyUp={saveSelection}
						onMouseUp={saveSelection}
						ref={editorRef}
						style={{
							background: "transparent",
							border: "none",
							color: "var(--ax-colors-fg-default)",
							fontFamily: "Inter, sans-serif",
							fontSize: 14,
							letterSpacing: "-0.1px",
							lineHeight: "20px",
							minHeight: 520,
							outline: "none",
							padding: 0,
							whiteSpace: "normal",
							width: "100%",
						}}
						suppressContentEditableWarning
					/>
				</Box>
			</Box>
		</Box>
	);
}
