"use client";

import { Box, Field, Textarea } from "@optiaxiom/react";
import { PropertyRendererProps } from "../types";
import { AITextArea } from "@/app/components/ai/AITextArea";
import { FieldWithAIActions } from "@/app/components/vb/FieldWithAIActions";
import { usePropertyEditorActions } from "@/app/hooks/usePropertyEditorActions";

// Helper to check if value is a TipTap document
const isTipTapDoc = (val: any) => val && typeof val === "object" && val.type === "doc";

// Convert TipTap doc to markdown
const tiptapToMarkdown = (val: any): string => {
	if (!isTipTapDoc(val)) return typeof val === "string" ? val : "";
	const paragraphs = (val.content || []).map((p: any) => {
		if (!p || p.type !== "paragraph") return "";
		return (p.content || []).map((node: any) => {
			if (!node || node.type !== "text") return "";
			let text = node.text || "";
			const marks = node.marks || [];
			marks.forEach((m: any) => {
				if (!m || !m.type) return;
				if (m.type === "bold" || m.type === "strong") text = `**${text}**`;
				if (m.type === "italic" || m.type === "em") text = `*${text}*`;
				if (m.type === "link" && m.attrs?.href) text = `[${text}](${m.attrs.href})`;
			});
			return text;
		}).join("");
	}).join("\n");
	return paragraphs;
};

// Convert markdown to TipTap doc
const markdownToTipTap = (text: string) => {
	const lines = (text || "").split(/\n/);
	const paragraphFromLine = (line: string) => {
		const tokens = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^\)]+\))/g).filter(Boolean);
		const content = tokens.map((tok) => {
			// link
			const linkMatch = tok.match(/^\[(.+)\]\((.+)\)$/);
			if (linkMatch) {
				return {
					type: "text",
					text: linkMatch[1],
					marks: [{ type: "link", attrs: { href: linkMatch[2] } }],
				};
			}
			// bold
			const boldMatch = tok.match(/^\*\*(.+)\*\*$/);
			if (boldMatch) {
				return { type: "text", text: boldMatch[1], marks: [{ type: "bold" }] };
			}
			// italic
			const italicMatch = tok.match(/^\*(.+)\*$/);
			if (italicMatch) {
				return { type: "text", text: italicMatch[1], marks: [{ type: "italic" }] };
			}
			// plain
			return { type: "text", text: tok };
		});
		return { type: "paragraph", content };
	};

	return {
		type: "doc",
		content: lines.map(paragraphFromLine),
	};
};

export const XhtmlStringRenderer: React.FC<PropertyRendererProps> = ({
	property,
	value,
	onChange,
	enableAI = true,
	error,
	mode = "edit",
}) => {
	const markdownValue = isTipTapDoc(value) ? tiptapToMarkdown(value) : (value || "");

	const aiActions = enableAI ? usePropertyEditorActions(
		"XhtmlString",
		markdownValue,
		(suggestion: string) => onChange(markdownToTipTap(suggestion))
	) : undefined;

	if (mode === "readonly") {
		return (
			<Field label={property.displayName || property.name}>
				<Textarea
					value={markdownValue || ""}
					disabled
					rows={4}
				/>
			</Field>
		);
	}

	return (
		<Box className="pr-1 py-2">
			{enableAI && aiActions ? (
				<FieldWithAIActions label={property.displayName || property.name} aiActions={aiActions}>
					<AITextArea
						value={markdownValue}
						onChange={(e: any) => onChange(markdownToTipTap(e.currentTarget.value))}
						rows={4}
						enableAutoComplete={true}
					/>
				</FieldWithAIActions>
			) : (
				<Field label={property.displayName || property.name} error={error} info={property.description}>
					<Textarea
						value={markdownValue}
						onChange={(e: any) => onChange(markdownToTipTap(e.currentTarget.value))}
						rows={4}
						required={property.required}
					/>
				</Field>
			)}
		</Box>
	);
};
