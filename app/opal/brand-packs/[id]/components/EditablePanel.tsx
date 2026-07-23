"use client";

import { useState } from "react";
import { Box, Button, Text } from "@optiaxiom/react";

export function EditablePanel({
	defaultContent,
	placeholder = "Click to add content…",
	title,
}: {
	defaultContent: string;
	placeholder?: string;
	title: string;
}) {
	const [content, setContent] = useState(defaultContent);
	const [editing, setEditing] = useState(false);

	return (
		<Box
			bg="bg.default"
			rounded="xl"
			style={{ border: "1px solid var(--ax-colors-border-secondary)", padding: "20px 24px" }}
		>
			<Box alignItems="center" display="flex" justifyContent="space-between" mb="12">
				<Text fontWeight="600" style={{ fontSize: 14, color: "var(--ax-colors-fg-default)" }}>
					{title}
				</Text>
			</Box>

			{editing ? (
				<Box display="flex" flexDirection="column" gap="8">
					<textarea
						autoFocus
						value={content}
						onChange={(e) => setContent(e.target.value)}
						rows={6}
						style={{
							background: "var(--ax-colors-bg-secondary)",
							border: "1px solid var(--ax-colors-border-primary)",
							borderRadius: 8,
							boxSizing: "border-box",
							color: "var(--ax-colors-fg-default)",
							fontFamily: "inherit",
							fontSize: 13,
							lineHeight: 1.65,
							outline: "none",
							padding: "10px 12px",
							resize: "vertical",
							width: "100%",
						}}
						placeholder={placeholder}
					/>
					<Box display="flex" gap="8">
						<Button appearance="primary" size="sm" onClick={() => setEditing(false)}>Save</Button>
						<Button appearance="subtle" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
					</Box>
				</Box>
			) : content ? (
				<Text
					color="fg.secondary"
					style={{ cursor: "text", fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap" }}
					onClick={() => setEditing(true)}
				>
					{content}
				</Text>
			) : (
				<Text
					style={{ color: "var(--ax-colors-fg-tertiary)", cursor: "text", fontStyle: "italic", fontSize: 13 }}
					onClick={() => setEditing(true)}
				>
					{placeholder}
				</Text>
			)}
		</Box>
	);
}
