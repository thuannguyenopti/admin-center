"use client";

import { useRef, useState } from "react";
import { Box, Button, Input, Text } from "@optiaxiom/react";
import { IconPlus } from "@optimizely/axiom-icons";

// ---------------------------------------------------------------------------
// SectionHeader
// Large document-style heading with an optional inline action on the right.
// ---------------------------------------------------------------------------
export function SectionHeader({
	action,
	description,
	title,
}: {
	action?: React.ReactNode;
	description?: string;
	title: string;
}) {
	return (
		<Box
			alignItems="start"
			display="flex"
			justifyContent="space-between"
			mb="24"
		>
			<Box>
				<Text
					fontWeight="700"
					style={{ fontSize: 26, letterSpacing: "-0.02em", lineHeight: 1.15 }}
				>
					{title}
				</Text>
				{description && (
					<Text
						color="fg.secondary"
						fontSize="sm"
						mt="6"
						style={{ lineHeight: 1.55 }}
					>
						{description}
					</Text>
				)}
			</Box>
			{action && <Box style={{ flexShrink: 0, marginTop: 2 }}>{action}</Box>}
		</Box>
	);
}

// ---------------------------------------------------------------------------
// EditableText
// Renders as plain text; becomes an Input on click.
// ---------------------------------------------------------------------------
export function EditableText({
	onChange,
	placeholder,
	style,
	value,
}: {
	onChange: (v: string) => void;
	placeholder?: string;
	style?: React.CSSProperties;
	value: string;
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [draft, setDraft] = useState(value);

	const commit = () => {
		onChange(draft);
		setIsEditing(false);
	};

	if (isEditing) {
		return (
			<Input
				// eslint-disable-next-line jsx-a11y/no-autofocus
				autoFocus
				value={draft}
				onChange={(e) => setDraft(e.target.value)}
				onBlur={commit}
				onKeyDown={(e) => {
					if (e.key === "Enter") commit();
					if (e.key === "Escape") {
						setDraft(value);
						setIsEditing(false);
					}
				}}
				style={style}
			/>
		);
	}

	return (
		<Box
			onClick={() => {
				setDraft(value);
				setIsEditing(true);
			}}
			rounded="sm"
			style={{
				cursor: "text",
				minHeight: 32,
				padding: "5px 8px",
				transition: "background 0.1s",
			}}
			onMouseEnter={(e) => {
				(e.currentTarget as HTMLElement).style.background =
					"var(--ax-colors-bg-secondary)";
			}}
			onMouseLeave={(e) => {
				(e.currentTarget as HTMLElement).style.background = "transparent";
			}}
		>
			{value ? (
				<span style={style}>{value}</span>
			) : (
				<span
					style={{
						...style,
						color: "var(--ax-colors-fg-tertiary)",
						fontStyle: "italic",
					}}
				>
					{placeholder}
				</span>
			)}
		</Box>
	);
}

// ---------------------------------------------------------------------------
// UploadZone
// Dashed drag-and-drop target with clear affordance.
// ---------------------------------------------------------------------------
export function UploadZone({
	accept,
	hint,
	isDragOver,
	label,
	onBrowse,
	onDragLeave,
	onDragOver,
	onDrop,
}: {
	accept?: string;
	hint: string;
	isDragOver: boolean;
	label: string;
	onBrowse: () => void;
	onDragLeave: () => void;
	onDragOver: () => void;
	onDrop: () => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);

	return (
		<>
			<Box
				alignItems="center"
				display="flex"
				flexDirection="column"
				gap="10"
				justifyContent="center"
				p="24"
				rounded="lg"
				style={{
					background: isDragOver
						? "var(--ax-colors-bg-accent-subtle)"
						: "var(--ax-colors-bg-secondary)",
					border: `2px dashed ${isDragOver ? "var(--ax-colors-border-accent)" : "var(--ax-colors-border-default)"}`,
					cursor: "pointer",
					transition: "border-color 0.15s, background 0.15s",
				}}
				onDragLeave={onDragLeave}
				onDragOver={(e) => {
					e.preventDefault();
					onDragOver();
				}}
				onDrop={(e) => {
					e.preventDefault();
					onDrop();
				}}
				onClick={() => inputRef.current?.click()}
			>
				<Box
					alignItems="center"
					bg="bg.default"
					display="flex"
					justifyContent="center"
					rounded="md"
					style={{
						border: "1px solid var(--ax-colors-border-default)",
						height: 40,
						width: 40,
					}}
				>
					<IconPlus
						style={{
							color: "var(--ax-colors-fg-tertiary)",
							height: 18,
							width: 18,
						}}
					/>
				</Box>
				<Box alignItems="center" display="flex" flexDirection="column" gap="2">
					<Text fontSize="sm" fontWeight="500">
						{label},{" "}
						<span
							style={{
								color: "var(--ax-colors-fg-accent)",
								textDecoration: "underline",
							}}
						>
							or browse to upload
						</span>
					</Text>
					<Text color="fg.tertiary" fontSize="xs">
						{hint}
					</Text>
				</Box>
			</Box>
			<input
				ref={inputRef}
				accept={accept}
				multiple
				style={{ display: "none" }}
				type="file"
			/>
		</>
	);
}
