"use client";

import { useState, type CSSProperties } from "react";
import { Box } from "@optiaxiom/react";
import { IconCommentPlus } from "@optiaxiom/icons";
import { Text } from "@/app/components/Text";
import { EditPopover } from "./EditPopover";
import type { ImageSlotId } from "./assets";

// Replaces ChannelCard on the canvas — Image Gen II's real canvas shows
// content full-bleed with no card chrome (title/alt-text-box/download all
// live only in the chat panel's compact reference, not here). Editing is
// commenting directly on the image: hover reveals a comment affordance,
// clicking opens a "describe your edit" popover, and the queued edit shows
// as a small pin badge until Run Now resolves it (see OpalPanel).
export function EditableImage({
	aspectRatio,
	image,
	imageAlt,
	label,
	objectPosition = "50% 50%",
	onQueueEdit,
	onRemoveQueuedEdit,
	queuedEdit,
	slot,
	style,
}: {
	aspectRatio: string;
	image: string;
	imageAlt: string;
	label: string;
	objectPosition?: string;
	onQueueEdit: (slot: ImageSlotId, description: string) => void;
	onRemoveQueuedEdit: (slot: ImageSlotId) => void;
	queuedEdit?: { description: string };
	slot: ImageSlotId;
	style?: CSSProperties;
}) {
	const [open, setOpen] = useState(false);
	const [hovered, setHovered] = useState(false);

	return (
		<Box
			style={{ aspectRatio, position: "relative", ...style }}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<Box style={{ borderRadius: 8, height: "100%", overflow: "hidden", position: "relative", width: "100%" }}>
				<img
					alt={imageAlt}
					src={image}
					style={{ height: "100%", inset: 0, objectFit: "cover", objectPosition, position: "absolute", width: "100%" }}
				/>
			</Box>

			{queuedEdit && (
				<Box
					bg="bg.default"
					border="1"
					borderColor="border.default"
					rounded="full"
					display="flex"
					alignItems="center"
					justifyContent="center"
					style={{ boxShadow: "0 1px 3px rgba(16,24,40,0.16)", height: 24, position: "absolute", right: -8, top: -8, width: 24 }}
				>
					<Text fontSize="xs" fontWeight="700">
						1
					</Text>
				</Box>
			)}

			{(hovered || open) && (
				<button
					type="button"
					onClick={() => setOpen((v) => !v)}
					aria-label={queuedEdit ? "Edit queued change" : "Add a comment to request an edit"}
					style={{
						alignItems: "center",
						background: "var(--ax-colors-bg-default)",
						border: "1px solid var(--ax-colors-border-default)",
						borderRadius: "50%",
						bottom: 10,
						boxShadow: "0 2px 8px rgba(16,24,40,0.18)",
						cursor: "pointer",
						display: "flex",
						height: 32,
						justifyContent: "center",
						position: "absolute",
						right: 10,
						width: 32,
					}}
				>
					<IconCommentPlus size={16} />
				</button>
			)}

			{open && (
				<Box style={{ bottom: 48, position: "absolute", right: 10, zIndex: 20 }}>
					<EditPopover
						title={`Edit ${label}`}
						initialValue={queuedEdit?.description ?? ""}
						onCancel={() => setOpen(false)}
						onRemove={
							queuedEdit
								? () => {
										onRemoveQueuedEdit(slot);
										setOpen(false);
									}
								: undefined
						}
						onSubmit={(description) => {
							onQueueEdit(slot, description);
							setOpen(false);
						}}
					/>
				</Box>
			)}
		</Box>
	);
}
