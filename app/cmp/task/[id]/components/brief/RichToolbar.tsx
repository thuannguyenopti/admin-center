"use client";

import { Box } from "@optiaxiom/react";

type RichToolbarProps = {
	onAction: (action: string, value?: string) => void;
};

export function RichToolbar({ onAction }: RichToolbarProps) {
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
			<Box
				alignItems="center"
				display="flex"
				gap="4"
				px="8"
				py="8"
				style={{ borderBottom: "1px solid var(--ax-colors-border-default)" }}
			>
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
			<Box
				alignItems="center"
				display="flex"
				gap="4"
				px="8"
				py="8"
				style={{ borderBottom: "1px solid var(--ax-colors-border-default)" }}
			>
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
