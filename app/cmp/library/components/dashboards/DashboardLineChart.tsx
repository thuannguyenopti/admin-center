"use client";

import { useState } from "react";
import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { getDataVizCategoricalColor } from "@/app/styles/dataVizColors";
import { CardOverflowMenu } from "./CardOverflowMenu";
import { MONTHS, type LineChartSpec } from "./data";

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

function smoothPath(points: Array<[number, number]>): string {
	if (points.length < 2) return "";
	let d = `M ${points[0][0]} ${points[0][1]}`;
	for (let i = 0; i < points.length - 1; i++) {
		const [x0, y0] = points[i];
		const [x1, y1] = points[i + 1];
		const midX = (x0 + x1) / 2;
		d += ` C ${midX} ${y0}, ${midX} ${y1}, ${x1} ${y1}`;
	}
	return d;
}

export function DashboardLineChart({ onDelete, spec }: { onDelete: () => void; spec: LineChartSpec }) {
	const [editing, setEditing] = useState(false);
	const allValues = spec.series.flat();
	const rawMax = Math.max(...allValues);
	const step = niceStep(rawMax / TICKS);
	const max = step * TICKS;

	const xFor = (i: number) => PAD.left + (i / (MONTHS.length - 1)) * CHART_W;
	const yFor = (v: number) => PAD.top + CHART_H - (v / max) * CHART_H;

	const annotationX = spec.annotation ? xFor(spec.annotation.monthIndex) : null;

	return (
		<Box bg="bg.default" border="1" borderColor="border.tertiary" display="flex" flexDirection="column" gap="12" p="20" rounded="lg">
			<Box alignItems="start" display="flex" justifyContent="space-between">
				<Box display="flex" flexDirection="column" gap="2">
					<Text color="fg.default" fontSize="md" fontWeight="600">{spec.title}</Text>
					<Text color="fg.tertiary" fontSize="sm">by {spec.author}</Text>
				</Box>
				<CardOverflowMenu editing={editing} onDelete={onDelete} onToggleEdit={() => setEditing((v) => !v)} />
			</Box>

			<Box style={{ position: "relative" }}>
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

					{spec.annotation && annotationX !== null && (
						<line stroke="var(--ax-colors-fg-tertiary)" strokeDasharray="3 3" strokeWidth={1} x1={annotationX} x2={annotationX} y1={PAD.top} y2={PAD.top + CHART_H} />
					)}

					{spec.series.map((values, seriesIndex) => (
						<path key={seriesIndex} d={smoothPath(values.map((v, i) => [xFor(i), yFor(v)]))} fill="none" stroke={getDataVizCategoricalColor(seriesIndex)} strokeLinecap="round" strokeWidth={2} />
					))}

					{MONTHS.map((month, i) => (
						<text key={month} fill="var(--ax-colors-fg-tertiary)" fontSize={10} textAnchor="middle" x={xFor(i)} y={HEIGHT - 6}>
							{month}
						</text>
					))}
				</svg>

				{spec.annotation && annotationX !== null && (
					<Box
						bg="bg.default.inverse"
						px="8"
						py="4"
						rounded="md"
						style={{
							left: `${(annotationX / WIDTH) * 100}%`,
							position: "absolute",
							top: 0,
							transform: "translate(-50%, -50%)",
							whiteSpace: "nowrap",
						}}
					>
						<Text color="fg.default.inverse" fontSize="xs" fontWeight="600">{spec.annotation.label}</Text>
					</Box>
				)}
			</Box>

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
