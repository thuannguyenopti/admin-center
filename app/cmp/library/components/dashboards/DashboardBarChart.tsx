"use client";

import { useState } from "react";
import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { getDataVizCategoricalColor } from "@/app/styles/dataVizColors";
import { CardOverflowMenu } from "./CardOverflowMenu";
import type { BarChartSpec } from "./data";

const WIDTH = 480;
const HEIGHT = 200;
const PAD = { bottom: 24, left: 34, right: 12, top: 12 };
const CHART_W = WIDTH - PAD.left - PAD.right;
const CHART_H = HEIGHT - PAD.top - PAD.bottom;
const TICKS = 4;

function niceStep(rough: number): number {
	const exponent = Math.floor(Math.log10(rough));
	const fraction = rough / 10 ** exponent;
	const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
	return niceFraction * 10 ** exponent;
}

export function DashboardBarChart({ onDelete, spec }: { onDelete: () => void; spec: BarChartSpec }) {
	const [editing, setEditing] = useState(false);
	const step = niceStep(Math.max(...spec.values) / TICKS);
	const max = step * TICKS;
	const barWidth = 56;
	const slot = CHART_W / spec.values.length;

	const yFor = (v: number) => PAD.top + CHART_H - (v / max) * CHART_H;

	return (
		<Box bg="bg.default" border="1" borderColor="border.tertiary" display="flex" flexDirection="column" gap="12" p="20" rounded="lg">
			<Box alignItems="start" display="flex" justifyContent="space-between">
				<Box display="flex" flexDirection="column" gap="2">
					<Text color="fg.default" fontSize="md" fontWeight="600">{spec.title}</Text>
					<Text color="fg.tertiary" fontSize="sm">by {spec.author}</Text>
				</Box>
				<CardOverflowMenu editing={editing} onDelete={onDelete} onToggleEdit={() => setEditing((v) => !v)} />
			</Box>

			<svg role="img" aria-label={spec.title} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ width: "100%" }}>
				{Array.from({ length: TICKS + 1 }).map((_, i) => {
					const y = PAD.top + (CHART_H / TICKS) * i;
					return (
						<g key={i}>
							<line stroke="var(--ax-colors-border-tertiary)" strokeWidth={1} x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} />
							<text fill="var(--ax-colors-fg-tertiary)" fontSize={10} textAnchor="end" x={PAD.left - 8} y={y + 3}>
								{Math.round(step * (TICKS - i)).toLocaleString()}
							</text>
						</g>
					);
				})}

				{spec.values.map((value, i) => {
					const x = PAD.left + slot * i + (slot - barWidth) / 2;
					const y = yFor(value);
					return <rect key={i} fill={getDataVizCategoricalColor(i)} height={PAD.top + CHART_H - y} rx={4} width={barWidth} x={x} y={y} />;
				})}

				{spec.seriesLabels.map((label, i) => (
					<text key={label} fill="var(--ax-colors-fg-tertiary)" fontSize={10} textAnchor="middle" x={PAD.left + slot * i + slot / 2} y={HEIGHT - 6}>
						{label}
					</text>
				))}
			</svg>

			<Box display="flex" gap="16" style={{ flexWrap: "wrap" }}>
				{spec.seriesLabels.map((label, i) => (
					<Box key={label} alignItems="center" display="flex" gap="6">
						<Box rounded="full" style={{ background: getDataVizCategoricalColor(i), height: 8, width: 8 }} />
						<Text color="fg.tertiary" fontSize="sm">{label}</Text>
					</Box>
				))}
			</Box>
		</Box>
	);
}
