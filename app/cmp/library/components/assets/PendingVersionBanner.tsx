"use client";

import { Badge, Box } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import type { PendingVersionDetail } from "@/app/dam/versions/data";

/**
 * Persistent "there's a pending version" call-to-action — always visible when a version is
 * awaiting review, rather than tucked behind a collapsible "Version History" row. Opens the
 * existing VersionReviewDialog unchanged; this is just the entry point.
 */
export function PendingVersionBanner({
	pendingVersion,
	onReviewChanges,
	showStatusBadge = true,
}: {
	pendingVersion: PendingVersionDetail;
	onReviewChanges: () => void;
	/** False when the OPAL summary above this banner already shows a "Pending review" badge for the same item — avoids saying the same status twice. */
	showStatusBadge?: boolean;
}) {
	return (
		<Box bg="bg.warning.subtle" display="flex" flexDirection="column" gap="8" p="12" rounded="md">
			<Box alignItems="center" display="flex" gap="8" justifyContent="space-between">
				{showStatusBadge ? <Badge intent="warning">Pending review</Badge> : <Box />}
				<Text color="fg.tertiary" fontSize="sm">{pendingVersion.submittedAt}</Text>
			</Box>
			<Text color="fg.default" fontSize="sm" fontWeight="500">{pendingVersion.versionLabel}</Text>
			<Text color="fg.secondary" fontSize="sm">&ldquo;{pendingVersion.whatChanged}&rdquo;</Text>
			<Button appearance="default" size="md" onClick={onReviewChanges} style={{ alignSelf: "flex-start" }}>
				Review changes
			</Button>
		</Box>
	);
}
