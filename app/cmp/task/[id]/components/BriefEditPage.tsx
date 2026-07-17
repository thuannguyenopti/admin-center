"use client";

import { useEffect, useRef } from "react";
import { Box } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import type { TaskTab } from "../types";
import { richTextContentStyles } from "../data/brief";
import { PageHeader } from "./PageHeader";

function RichToolbar({
	onAction,
}: {
	onAction: (action: string, value?: string) => void;
}) {
	const topRow = [
		{ label: "↶", action: "undo", title: "Undo" },
		{ label: "↷", action: "redo", title: "Redo" },
		{ label: "P", action: "paragraph", title: "Paragraph" },
		{ label: "H2", action: "heading-two", title: "Heading 2" },
		{ label: "H3", action: "heading-three", title: "Heading 3" },
		{ label: "14px", action: "font-size", title: "14px", value: "3" },
		{ label: "18px", action: "font-size", title: "18px", value: "4" },
		{ label: "24px", action: "font-size", title: "24px", value: "5" },
		{ label: "≡", action: "justifyLeft", title: "Align left" },
		{ label: "≣", action: "justifyCenter", title: "Align center" },
		{ label: "≢", action: "justifyRight", title: "Align right" },
		{ label: "•", action: "insertUnorderedList", title: "Bulleted list" },
		{ label: "1.", action: "insertOrderedList", title: "Numbered list" },
		{ label: "⇤", action: "outdent", title: "Outdent" },
		{ label: "⇥", action: "indent", title: "Indent" },
		{ label: "⎯", action: "insertHorizontalRule", title: "Divider" },
		{ label: "?", action: "removeFormat", title: "Clear formatting" },
	];
	const bottomRow = [
		{ label: "B", action: "bold", title: "Bold" },
		{ label: "I", action: "italic", title: "Italic" },
		{ label: "U", action: "underline", title: "Underline" },
		{ label: "A", action: "text-color", title: "Text color" },
		{ label: "⋯", action: "strikeThrough", title: "Strikethrough" },
		{ label: "🔗", action: "create-link", title: "Insert link" },
		{ label: "❝", action: "blockquote", title: "Quote" },
		{ label: "</>", action: "code-block", title: "Code block" },
	];

	return (
		<Box bg="bg.default">
			<Box alignItems="center" display="flex" gap="4" px="8" py="8" style={{ borderBottom: "1px solid var(--ax-colors-border-default)" }}>
				{topRow.map((item) => (
					<Box
						asChild
						key={item.action + item.label}
						alignItems="center"
						display="flex"
						justifyContent="center"
						rounded="sm"
					>
						<button
							onMouseDown={(event) => {
								event.preventDefault();
								onAction(item.action, item.value);
							}}
							style={{
								background: "transparent",
								border: "none",
								color: "var(--ax-colors-fg-secondary)",
								cursor: "pointer",
								fontSize: 14,
								height: 28,
								minWidth: item.label.length > 2 ? 48 : 28,
								padding: "0 8px",
							}}
							title={item.title}
							type="button"
						>
							{item.label}
						</button>
					</Box>
				))}
			</Box>
			<Box alignItems="center" display="flex" gap="4" px="8" py="8" style={{ borderBottom: "1px solid var(--ax-colors-border-default)" }}>
				{bottomRow.map((item) => (
					<Box
						asChild
						key={item.action + item.label}
						alignItems="center"
						display="flex"
						justifyContent="center"
						rounded="sm"
					>
						<button
							onMouseDown={(event) => {
								event.preventDefault();
								onAction(item.action);
							}}
							style={{
								background: "transparent",
								border: "none",
								color: "var(--ax-colors-fg-secondary)",
								cursor: "pointer",
								fontSize: 14,
								height: 28,
								minWidth: item.label.length > 2 ? 40 : 28,
								padding: "0 8px",
							}}
							title={item.title}
							type="button"
						>
							{item.label}
						</button>
					</Box>
				))}
			</Box>
		</Box>
	);
}

function EditorSurface({
	content,
	onChange,
}: {
	content: string;
	onChange: (value: string) => void;
}) {
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
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.default"
			rounded="lg"
			style={{ overflow: "hidden" }}
		>
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
						suppressContentEditableWarning
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
					/>
				</Box>
			</Box>
		</Box>
	);
}

export function BriefEditPage({
	activeTab,
	briefContent,
	onBriefContentChange,
	onCancel,
	onSave,
	onTabChange,
}: {
	activeTab: TaskTab;
	briefContent: string;
	onBriefContentChange: (value: string) => void;
	onCancel: () => void;
	onSave: () => void;
	onTabChange: (tab: string) => void;
}) {
	return (
		<Box pb="32">
			<PageHeader activeTab={activeTab} onTabChange={onTabChange} />
			<Box display="flex" flexDirection="column" style={{ gap: 18, padding: "24px 28px 0", width: "100%" }}>
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Text color="fg.default" fontSize="xl" fontWeight="500" style={{ maxWidth: "none" }}>
						Brief - Create Sponsor Package for Ironman / STRIDE event in...
					</Text>
					<Box alignItems="center" display="flex" style={{ gap: 14 }}>
						<Button appearance="subtle" onClick={onCancel} size="sm">Cancel Changes</Button>
						<Button appearance="primary" onClick={onSave} size="sm">Save</Button>
					</Box>
				</Box>

				<EditorSurface content={briefContent} onChange={onBriefContentChange} />
			</Box>
		</Box>
	);
}
