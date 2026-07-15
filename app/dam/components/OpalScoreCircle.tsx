"use client";

import { Box } from "@optiaxiom/react";
import { scoreIntent } from "../data";
import { Caption } from "./Caption";

const INTENT_COLOR = {
	success: "var(--ax-colors-fg-success)",
	warning: "var(--ax-colors-fg-warning)",
	danger: "var(--ax-colors-fg-danger)",
};

const SIZE = 88;
const STROKE = 5;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Single focal score — the one number an approver needs at a glance, drawn as a real radial progress ring (not just a static colored outline) so the ring itself carries the "how far along" signal, not only the number. */
export function OpalScoreCircle({ value, label }: { value: number; label: string }) {
	const color = INTENT_COLOR[scoreIntent(value)];
	const clamped = Math.min(100, Math.max(0, value));
	const offset = CIRCUMFERENCE * (1 - clamped / 100);

	return (
		<Box display="flex" flexDirection="column" alignItems="center" gap="10" style={{ flexShrink: 0 }}>
			<Box style={{ position: "relative", width: SIZE, height: SIZE }}>
				<svg width={SIZE} height={SIZE} style={{ display: "block", transform: "rotate(-90deg)" }}>
					<circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--ax-colors-bg-secondary)" strokeWidth={STROKE} />
					<circle
						cx={SIZE / 2}
						cy={SIZE / 2}
						r={RADIUS}
						fill="none"
						stroke={color}
						strokeWidth={STROKE}
						strokeLinecap="round"
						strokeDasharray={CIRCUMFERENCE}
						strokeDashoffset={offset}
						style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)" }}
					/>
				</svg>
				<Box alignItems="center" display="flex" justifyContent="center" style={{ inset: 0, position: "absolute" }}>
					<span
						style={{
							fontSize: 28,
							fontWeight: 700,
							lineHeight: 1,
							color,
							fontVariantNumeric: "tabular-nums",
							letterSpacing: "-0.02em",
						}}
					>
						{value}
					</span>
				</Box>
			</Box>
			<Caption>{label}</Caption>
		</Box>
	);
}
