"use client";

import { useState } from "react";
import { Badge, Box } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import type { OpalDuplicateMatch } from "@/app/shared/types/opal";
import { CompareColumn } from "./CompareColumn";
import type { LibraryItem } from "../../page";

type Resolution = "kept" | "replaced" | "rejected";

const RESOLUTION_COPY: Record<Resolution, { headline: string; sub: string }> = {
	kept: { headline: "Keeping both assets", sub: "Both assets will remain in the library." },
	replaced: { headline: "Existing asset will be replaced", sub: "The existing asset will be replaced with this upload." },
	rejected: { headline: "Upload rejected", sub: "This upload will not be added to the library." },
};

/** Side-by-side duplicate comparison, shown in place of the marker-annotated preview when OPAL finds a visual match against an existing asset. No OpalAssessmentPanel reuse here — these 3 actions need no draft text, unlike Request Changes/Reject. */
export function DuplicateMatchCard({ current, match }: { current: LibraryItem; match: OpalDuplicateMatch }) {
	const [resolved, setResolved] = useState<Resolution | null>(null);

	if (resolved) {
		const copy = RESOLUTION_COPY[resolved];
		return (
			<Box bg="bg.secondary" display="flex" flexDirection="column" gap="4" p="16" rounded="md">
				<Text color="fg.default" fontSize="md" fontWeight="600">{copy.headline}</Text>
				<Text color="fg.secondary" fontSize="sm">{copy.sub}</Text>
			</Box>
		);
	}

	return (
		<Box display="flex" flexDirection="column" gap="12">
			<Box alignItems="center" display="flex" justifyContent="space-between">
				<Text color="fg.default" fontSize="md" fontWeight="600">Possible duplicate found</Text>
				{match.matchPct !== undefined && <Badge intent="warning">{match.matchPct}% match</Badge>}
			</Box>
			<Box display="flex" gap="12">
				<CompareColumn image={current.image} label="Your upload" submittedAt={current.submittedAt} submittedBy={current.submittedBy} title={current.title} />
				<CompareColumn image={match.image} label="Existing asset" submittedAt={match.submittedAt} submittedBy={match.submittedBy} title={match.title} />
			</Box>
			<Box display="flex" gap="8">
				<Button appearance="default" size="sm" style={{ flex: 1 }} onClick={() => setResolved("kept")}>Keep both</Button>
				<Button appearance="primary" size="sm" style={{ flex: 1 }} onClick={() => setResolved("replaced")}>Replace existing</Button>
				<Button appearance="subtle" size="sm" style={{ color: "var(--ax-colors-fg-error)" }} onClick={() => setResolved("rejected")}>Reject</Button>
			</Box>
		</Box>
	);
}
