"use client";

import { Badge, Box, Checkbox } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { IconFile, IconFileImage, IconFileVideo, IconFileZipper } from "@optimizely/axiom-icons";
import type { DropZoneSubmission } from "@/app/dam/drop-zone/data";

export const SUBMISSION_STATUS_BADGE = {
	pending: { label: "Pending", intent: "warning" as const },
	approved: { label: "Approved", intent: "success" as const },
	rejected: { label: "Rejected", intent: "danger" as const },
};

function fileKind(name: string): { Icon: typeof IconFile; label: string } {
	const ext = name.split(".").pop()?.toLowerCase();
	if (ext === "zip") return { Icon: IconFileZipper, label: "Archive" };
	if (ext === "mp4" || ext === "mov") return { Icon: IconFileVideo, label: "Video" };
	if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "raw") return { Icon: IconFileImage, label: "Image" };
	return { Icon: IconFile, label: "File" };
}

/**
 * Thumbnail-forward card matching Collections' asset-card anatomy: a dominant preview tile,
 * format label, filename, then "Submitted by / Submitted on" in the same visual slot
 * Collections uses for "Owned by / Last Modified on". Seeded mock submissions carry a real
 * preview (`submission.image`, reused from the Brand Pack template library) and render it
 * cover-fit; a submission with no curated preview (e.g. one just added through the internal
 * upload tile) falls back to a centered file-type icon on a tinted background.
 */
export function DropZoneSubmissionCard({
	submission,
	selected,
	onToggleSelect,
	onApprove,
	onReject,
}: {
	submission: DropZoneSubmission;
	selected: boolean;
	onToggleSelect: () => void;
	onApprove: () => void;
	onReject: () => void;
}) {
	const badge = SUBMISSION_STATUS_BADGE[submission.status];
	const primaryFile = submission.files[0];
	const { Icon: PrimaryIcon, label: kindLabel } = primaryFile ? fileKind(primaryFile.name) : { Icon: IconFile, label: "File" };
	const extraFiles = submission.files.length - 1;

	return (
		<Box bg="bg.default" border="1" borderColor={selected ? "border.accent" : "border.tertiary"} display="flex" flexDirection="column" overflow="hidden" rounded="lg">
			<Box alignItems="center" bg="bg.secondary" display="flex" justifyContent="center" style={{ height: 140, overflow: "hidden", position: "relative" }}>
				{submission.image ? (
					<img alt={primaryFile?.name ?? ""} src={submission.image} style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }} />
				) : (
					<PrimaryIcon size={40} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
				)}
				<Box style={{ left: 10, position: "absolute", top: 10 }}>
					<Checkbox checked={selected} aria-label={`Select submission from ${submission.submitterName}`} onCheckedChange={onToggleSelect} />
				</Box>
				<Badge intent={badge.intent} style={{ position: "absolute", right: 10, top: 10 }}>{badge.label}</Badge>
			</Box>

			<Box display="flex" flexDirection="column" gap="6" p="12">
				<Box alignItems="center" display="flex" gap="6" justifyContent="space-between">
					<Text color="fg.tertiary" fontSize="sm">{kindLabel}{extraFiles > 0 ? ` +${extraFiles} more` : ""}</Text>
				</Box>
				<Text color="fg.default" fontSize="md" fontWeight="600" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
					{primaryFile?.name ?? "Untitled submission"}
				</Text>
				<Text color="fg.tertiary" fontSize="sm">Submitted by {submission.submitterName}</Text>
				<Text color="fg.tertiary" fontSize="sm">Submitted on {submission.submittedAt}</Text>

				{submission.notes && (
					<Text color="fg.secondary" fontSize="sm" style={{ display: "-webkit-box", overflow: "hidden", WebkitBoxOrient: "vertical", WebkitLineClamp: 2 }}>
						&ldquo;{submission.notes}&rdquo;
					</Text>
				)}

				{submission.status === "pending" && (
					<Box display="flex" gap="8" style={{ marginTop: 4 }}>
						<Button appearance="subtle" size="sm" style={{ color: "var(--ax-colors-fg-error)", flex: 1 }} onClick={onReject}>Reject</Button>
						<Button appearance="primary" size="sm" style={{ flex: 1 }} onClick={onApprove}>Approve</Button>
					</Box>
				)}
			</Box>
		</Box>
	);
}
