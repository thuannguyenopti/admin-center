"use client";

import { Badge, Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import type { AssetType } from "../../types";

export function AssetBadge({ kind, label }: { kind: AssetType; label: string }) {
	const intent = kind === "MP4" ? "information" : kind === "PDF" ? "warning" : "success";

	return <Badge intent={intent}>{label}</Badge>;
}

export function ScoreBadge({ score }: { score: number }) {
	return (
		<Box
			alignItems="center"
			display="flex"
			justifyContent="center"
			rounded="full"
			style={{
				background: "var(--ax-colors-fg-white)",
				borderRadius: 12,
				padding: "2px 8px",
			}}
		>
			<Text
				style={{
					color: "#6F33D1",
					fontFamily: "Inter, sans-serif",
					fontSize: 12,
					fontWeight: 500,
					letterSpacing: "0.01px",
					lineHeight: "16px",
					maxWidth: "none",
				}}
			>
				{score}%
			</Text>
		</Box>
	);
}
