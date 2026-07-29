"use client";

import { Box, Button } from "@optiaxiom/react";
import { IconChevronDown, IconDownload, IconPen } from "@optiaxiom/icons";
import { Text } from "@/app/components/Text";
import { EditableText } from "./EditableText";

// Matches Figma "Image Gen II - 10 Channel Pack Items" (node 6708:89886): title + chevron,
// "Created {date}" subline, photo, an Alt Text sub-card, and an Edit/Download button row.
// `variant="hero"` overlays Edit on the image (the LinkedIn 1:1 card in the Figma spec);
// `variant="standard"` puts Edit inline with Download below Alt Text (the other two cards).
// Title and Alt Text are inline-editable (EditableText) — the one shared card component
// covers editing on every blog/social/email surface that renders through it.
export function ChannelCard({
	altText,
	aspectRatio,
	createdLabel,
	image,
	imageAlt,
	objectPosition = "50% 50%",
	onAltTextChange,
	onDownload,
	onEdit,
	onTitleChange,
	title,
	variant = "standard",
	width,
}: {
	altText: string;
	aspectRatio: string;
	createdLabel: string;
	image: string;
	imageAlt: string;
	objectPosition?: string;
	onAltTextChange: (next: string) => void;
	onDownload?: () => void;
	onEdit: () => void;
	onTitleChange: (next: string) => void;
	title: string;
	variant?: "hero" | "standard";
	width?: number;
}) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.secondary"
			rounded="md"
			p="16"
			display="flex"
			flexDirection="column"
			gap="16"
			style={width ? { flexShrink: 0, width } : { flex: 1, minWidth: 280 }}
		>
			<Box display="flex" flexDirection="column" gap="4">
				<Box display="flex" alignItems="center" gap="8">
					<Box style={{ flex: 1, minWidth: 0 }}>
						<EditableText ariaLabel="asset title" value={title} onChange={onTitleChange} style={{ fontSize: 16, fontWeight: 700 }} />
					</Box>
					<IconChevronDown size={16} color="var(--ax-colors-fg-tertiary)" />
				</Box>
				<Text fontSize="sm" color="fg.tertiary">
					{createdLabel}
				</Text>
			</Box>

			<Box style={{ aspectRatio, borderRadius: 8, overflow: "hidden", position: "relative" }}>
				<img
					alt={imageAlt}
					src={image}
					style={{
						height: "100%",
						inset: 0,
						objectFit: "cover",
						objectPosition,
						position: "absolute",
						width: "100%",
					}}
				/>
				{variant === "hero" && (
					<Box style={{ bottom: 12, left: 12, position: "absolute" }}>
						<Button appearance="default" size="sm" icon={<IconPen size={14} />} onClick={onEdit}>
							Edit
						</Button>
					</Box>
				)}
			</Box>

			<Box border="1" borderColor="border.secondary" rounded="md" px="16" py="12" display="flex" flexDirection="column" gap="8">
				<Text fontWeight="500" fontSize="sm">
					Alt Text
				</Text>
				<EditableText ariaLabel="alt text" multiline value={altText} onChange={onAltTextChange} style={{ color: "var(--ax-colors-fg-secondary)", fontSize: 14 }} />
			</Box>

			<Box display="flex" gap="16" justifyContent="flex-end">
				{variant === "standard" && (
					<Button appearance="default" size="sm" icon={<IconPen size={14} />} onClick={onEdit}>
						Edit
					</Button>
				)}
				<Button appearance="default" size="sm" icon={<IconDownload size={14} />} onClick={onDownload}>
					Download
				</Button>
			</Box>
		</Box>
	);
}
