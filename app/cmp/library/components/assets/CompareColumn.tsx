"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";

/** Labeled thumbnail + title + submission metadata — one side of a two-up comparison. Shared by DuplicateMatchCard (your upload vs. existing asset) and the Edit Submissions queue (current vs. pending version) so the "compare two things" pattern isn't recreated per file. */
export function CompareColumn({
	label,
	title,
	image,
	submittedBy,
	submittedAt,
}: {
	label: string;
	title: string;
	image?: string;
	submittedBy?: string;
	submittedAt?: string;
}) {
	return (
		<Box display="flex" flexDirection="column" gap="6" style={{ flex: 1, minWidth: 0 }}>
			<Text color="fg.tertiary" fontSize="sm" fontWeight="600" style={{ letterSpacing: "0.02em", textTransform: "uppercase" }}>{label}</Text>
			<Box bg="bg.page" rounded="md" style={{ aspectRatio: "4 / 3", overflow: "hidden" }}>
				{image && <img alt={title} src={image} style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }} />}
			</Box>
			<Text color="fg.default" fontSize="sm" fontWeight="500" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</Text>
			{submittedBy && <Text color="fg.tertiary" fontSize="sm">{submittedBy}{submittedAt ? ` · ${submittedAt}` : ""}</Text>}
		</Box>
	);
}
