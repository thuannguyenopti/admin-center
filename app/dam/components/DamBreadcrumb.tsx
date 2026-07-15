"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import type { ReactNode } from "react";

export type BreadcrumbSegment = {
	label: string;
	href?: string;
};

/** Shared top bar for every /dam/* route — these pages are intentionally chromeless (no product sidebar). */
export function DamBreadcrumb({
	segments,
	trailing,
}: {
	segments: BreadcrumbSegment[];
	trailing?: ReactNode;
}) {
	return (
		<Box
			bg="bg.default"
			borderB="1"
			borderColor="border.secondary"
			display="flex"
			alignItems="center"
			gap="4"
			px="20"
			py="10"
			style={{ flexShrink: 0 }}
		>
			{segments.map((seg, i) => (
				<Box key={seg.label} display="flex" alignItems="center" gap="4">
					{i > 0 && <Text color="fg.tertiary" fontSize="sm">›</Text>}
					<Text
						color={seg.href ? "fg.secondary" : "fg.default"}
						fontWeight={seg.href ? "400" : "500"}
						fontSize="sm"
						style={{
							cursor: seg.href ? "pointer" : "default",
							textDecoration: seg.href ? "underline" : "none",
							textDecorationColor: "var(--ax-colors-border-secondary)",
							textUnderlineOffset: 2,
						}}
					>
						{seg.label}
					</Text>
				</Box>
			))}
			{trailing && (
				<Box display="flex" alignItems="center" gap="8" style={{ marginLeft: "auto" }}>
					{trailing}
				</Box>
			)}
		</Box>
	);
}
