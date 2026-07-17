"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { IconFileExport } from "@optimizely/axiom-icons";
import { CURRENT_USER } from "../../auditTrail";
import { useDropZoneUpload } from "@/app/shared/hooks/useDropZoneUpload";
import type { DropZoneLink } from "@/app/dam/drop-zone/data";
import { addSubmission } from "@/app/dam/drop-zone/submissions";

/**
 * First tile in the submissions grid — lets someone on the internal team drop a file
 * straight into this Drop Zone without going through the public link. Built from the real
 * Axiom "File Drag&drop" component (Figma node 15454:35306): dashed bg.secondary tile,
 * FileExport icon, "Drag and drop or click to upload" + size-limit copy. The installed
 * Axiom version has no `border.default.hovered` token to match the spec's dragging-state
 * border exactly, so `border.accent` is used instead — the same substitution already used
 * for "actively being dragged over" elsewhere in this codebase (e.g. UploadAssetCard.tsx).
 */
export function DropZoneUploadTile({ zone }: { zone: DropZoneLink }) {
	const upload = useDropZoneUpload();

	function handleFiles(files: File[]) {
		if (files.length === 0) return;
		addSubmission({
			dropZoneId: zone.id,
			submitterName: CURRENT_USER,
			submitterEmail: "team-upload@stride-agency.com",
			files: files.map((file) => ({ name: file.name, sizeMb: file.size / (1024 * 1024) })),
			notes: "Uploaded directly by the internal team.",
		});
		upload.reset();
	}

	return (
		<Box
			alignItems="center"
			bg="bg.secondary"
			border="1"
			borderColor={upload.isDragging ? "border.accent" : "border.default"}
			display="flex"
			flexDirection="column"
			justifyContent="center"
			gap="8"
			role="button"
			tabIndex={0}
			style={{ borderStyle: "dashed", cursor: "pointer", minHeight: 220, padding: 16, transition: "border-color 0.15s" }}
			onClick={upload.triggerFileInput}
			onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); upload.triggerFileInput(); } }}
			onDragOver={upload.handleDragOver}
			onDragLeave={upload.handleDragLeave}
			onDrop={(event) => {
				event.preventDefault();
				event.stopPropagation();
				upload.handleDrop(event);
				if (event.dataTransfer.files.length > 0) handleFiles(Array.from(event.dataTransfer.files));
			}}
		>
			<input
				ref={upload.fileInputRef}
				type="file"
				multiple
				hidden
				accept={zone.allowedFileTypes.map((type) => `.${type.toLowerCase()}`).join(",")}
				onChange={(event) => {
					upload.handleFileSelect(event);
					if (event.target.files?.length) handleFiles(Array.from(event.target.files));
				}}
			/>
			<IconFileExport size={24} style={{ color: "var(--ax-colors-fg-default)" }} />
			<Box display="flex" flexDirection="column" gap="2" style={{ textAlign: "center" }}>
				<Text color="fg.default" fontSize="sm">Drag and drop or click to upload</Text>
				<Text color="fg.tertiary" fontSize="sm">Up to {zone.maxFileSizeMb}MB per file.</Text>
			</Box>
		</Box>
	);
}
