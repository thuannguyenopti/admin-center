"use client";

import {useState, useMemo} from "react";
import {Box, Button, Tooltip, ToggleButton} from "@optiaxiom/react";
import {IconCode, IconEye, IconPen} from "@optiaxiom/icons";
import {TiptapEditor} from "@/app/components/Opal/editor/TiptapEditor";
import {STRIDE_SB_BASE, type DSComponent} from "../../data/designSystem";

function getInitialCompMarkdown(component: DSComponent): string {
	const url = `${STRIDE_SB_BASE}${component.story}`;
	return `\`\`\`storybook_url\n${url}\n\`\`\`\n\nDescribe how **${component.label}** is used in your design system — variants, when to use it, accessibility notes, restrictions.`;
}

function parseStorybookBlock(markdown: string): {url: string | null; rest: string} {
	const match = markdown.match(/^```storybook_url\n([\s\S]*?)\n```\n*/);
	if (!match) return {url: null, rest: markdown};
	return {url: match[1].trim(), rest: markdown.slice(match[0].length)};
}

export function DSComponentPanel({component}: {component: DSComponent}) {
	const [content, setContent] = useState(() => getInitialCompMarkdown(component));
	const [draft, setDraft] = useState(content);
	const [isEditing, setIsEditing] = useState(false);
	const [editorMode, setEditorMode] = useState<"preview" | "source">("preview");

	const {url: storybookUrl, rest: contextMarkdown} = useMemo(
		() => parseStorybookBlock(content),
		[content]
	);

	const handleEdit = () => {
		setDraft(content);
		setIsEditing(true);
		setEditorMode("source");
	};
	const handleSave = () => {
		setContent(draft);
		setIsEditing(false);
		setEditorMode("preview");
	};
	const handleCancel = () => {
		setDraft(content);
		setIsEditing(false);
	};

	return (
		<Box display="flex" flexDirection="column" style={{height: "100%", overflow: "hidden"}}>
			{/* Header */}
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				px="16"
				py="8"
				style={{
					borderBottom: "1px solid var(--ax-colors-border-secondary)",
					flexShrink: 0,
				}}
			>
				<Box display="flex" alignItems="center" gap="4">
					<Tooltip content="Source" delayDuration={400}>
						<span>
							<ToggleButton
								size="md"
								appearance="subtle"
								pressed={editorMode === "source"}
								onPressedChange={() => setEditorMode("source")}
								icon={<IconCode size={16} />}
								aria-label="Source"
							/>
						</span>
					</Tooltip>
					<Tooltip content="Preview" delayDuration={400}>
						<span>
							<ToggleButton
								size="md"
								appearance="subtle"
								pressed={editorMode === "preview"}
								onPressedChange={() => setEditorMode("preview")}
								icon={<IconEye size={16} />}
								aria-label="Preview"
							/>
						</span>
					</Tooltip>
				</Box>
				<Box display="flex" alignItems="center" gap="8">
					{isEditing ? (
						<>
							<Button appearance="subtle" size="sm" onClick={handleCancel}>
								Cancel
							</Button>
							<Button appearance="primary" size="sm" onClick={handleSave}>
								Save
							</Button>
						</>
					) : (
						<Tooltip delayDuration={300} content="Edit">
							<span>
								<Button
									appearance="subtle"
									size="sm"
									icon={<IconPen size={14} />}
									aria-label="Edit"
									onClick={handleEdit}
								/>
							</span>
						</Tooltip>
					)}
				</Box>
			</Box>

			{/* Content */}
			<Box style={{flex: 1, minHeight: 0, overflow: "hidden"}}>
				{editorMode === "source" ? (
					<textarea
						value={isEditing ? draft : content}
						readOnly={!isEditing}
						onChange={isEditing ? (e) => setDraft(e.target.value) : undefined}
						style={{
							width: "100%",
							height: "100%",
							padding: "14px 16px",
							border: 0,
							outline: 0,
							resize: "none",
							fontSize: 13,
							lineHeight: 1.6,
							color: "var(--ax-colors-fg-default)",
							background: "var(--ax-colors-bg-default)",
							fontFamily: "monospace",
							boxSizing: "border-box",
						}}
					/>
				) : (
					<Box style={{height: "100%", overflowY: "auto", boxSizing: "border-box"}}>
						{storybookUrl && (
							<Box
								style={{
									height: 280,
									flexShrink: 0,
									overflow: "hidden",
									borderBottom: "1px solid var(--ax-colors-border-secondary)",
								}}
							>
								<iframe
									key={component.id}
									src={storybookUrl}
									style={{width: "100%", height: "100%", border: 0}}
									title={component.label}
									sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
								/>
							</Box>
						)}
						{contextMarkdown.trim() && (
							<Box style={{padding: "24px 28px"}}>
								<TiptapEditor
									key={`${component.id}-ctx`}
									initialMarkdown={contextMarkdown}
									editable={false}
								/>
							</Box>
						)}
					</Box>
				)}
			</Box>
		</Box>
	);
}
