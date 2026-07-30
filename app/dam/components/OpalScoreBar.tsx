"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Caption } from "./Caption";
import type { AssetItem } from "../data";

/** Compact metric bar — used for brand score, metadata score, etc. */
export function ScoreBar({ label, value, intent }: { label: string; value: number; intent: "success" | "warning" | "danger" }) {
	return (
		<Box display="flex" flexDirection="column" gap="6">
			<Box display="flex" justifyContent="space-between" alignItems="center">
				<Caption>{label}</Caption>
				<Text color="fg.secondary" fontWeight="500" fontSize="md" style={{ fontVariantNumeric: "tabular-nums" }}>
					{value}
				</Text>
			</Box>
			<Box style={{ height: 3, background: "var(--ax-colors-bg-secondary)", borderRadius: 2 }}>
				<Box
					style={{
						height: 3,
						width: `${value}%`,
						background: `var(--ax-colors-fg-${intent})`,
						borderRadius: 2,
						transition: "width 0.6s cubic-bezier(.4,0,.2,1)",
					}}
				/>
			</Box>
		</Box>
	);
}

const RISK_LEVELS = ["none", "low", "medium", "high"] as const;

/** Discrete duplicate-risk indicator — same visual language as ScoreBar, four steps instead of a percentage. */
export function DupRiskBar({ risk }: { risk: AssetItem["duplicateRisk"] }) {
	const idx = RISK_LEVELS.indexOf(risk);
	const intent = risk === "none" || risk === "low" ? "success" : risk === "medium" ? "warning" : "danger";

	return (
		<Box display="flex" flexDirection="column" gap="6">
			<Box display="flex" justifyContent="space-between" alignItems="center">
				<Caption>Duplicate risk</Caption>
				<Text color="fg.secondary" fontWeight="500" fontSize="md" style={{ textTransform: "capitalize" }}>
					{risk}
				</Text>
			</Box>
			<Box display="flex" style={{ gap: 3 }}>
				{RISK_LEVELS.map((level) => (
					<Box
						key={level}
						style={{
							flex: 1,
							height: 3,
							borderRadius: 2,
							background: RISK_LEVELS.indexOf(level) <= idx
								? `var(--ax-colors-fg-${intent})`
								: "var(--ax-colors-bg-secondary)",
							transition: "background 0.3s",
						}}
					/>
				))}
			</Box>
		</Box>
	);
}
