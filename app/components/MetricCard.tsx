import {Box, Card, Tooltip} from "@optiaxiom/react";
import {Text} from "./Text";
import {useMemo} from "react";
import {cn} from "@/utils/cn";
import Link from "next/link";

type MetricCardProps = {
	label: string;
	unit?: string;
	data: number[];
	smooth?: boolean;
	desiredDirection?: "up" | "down";
	interval?: "hour" | "day" | "week" | "month";
	aggregation?: "sum" | "average" | "last";
	previousValue?: number;
	height?: number;
	href?: string;
};

export default function MetricCard({
	label,
	unit = "",
	data,
	smooth = false,
	desiredDirection = "up",
	interval,
	aggregation = "last",
	height = 60,
	previousValue: explicitPreviousValue,
	href,
}: MetricCardProps) {
	// Get current value based on aggregation type
	const value = (() => {
		if (data.length === 0) return 0;
		switch (aggregation) {
			case "sum":
				return data.reduce((a, b) => a + b, 0);
			case "average":
				return data.reduce((a, b) => a + b, 0) / data.length;
			case "last":
			default:
				return data[data.length - 1];
		}
	})();

	const previousValue =
		explicitPreviousValue !== undefined
			? explicitPreviousValue
			: data.length > 1
				? data[data.length - 2]
				: undefined;

	// Format value with unit
	const formatValue = (val: number) => {
		if (val >= 10000) {
			return (
				new Intl.NumberFormat("en-US", {
					notation: "compact",
					maximumFractionDigits: 1,
				}).format(val) + unit
			);
		}
		return (
			val.toLocaleString(undefined, {
				maximumFractionDigits: 1,
				minimumFractionDigits: 0,
			}) + unit
		);
	};

	// Calculate change percentage and determine if trend is positive
	const calculateChange = () => {
		if (previousValue === undefined) return null;

		if (previousValue === 0) return null;

		const percentChange = ((value - previousValue) / previousValue) * 100;
		const isIncreasing = percentChange >= 0;

		// Use consistent logic for both arrow direction and color
		// Both should be based on the same comparison (current vs previous)
		const isGoodTrend = desiredDirection === "up" ? isIncreasing : !isIncreasing;

		return {
			value: Math.abs(percentChange).toFixed(1) + "%",
			isPositive: isIncreasing,
			isGood: isGoodTrend,
		};
	};

	const changeData = calculateChange();

	// Downsample data for chart
	const maxPoints = 12;
	const chartData = useMemo(() => {
		if (data.length <= maxPoints) {
			return data.map((v, i) => ({value: v, originalIndex: i}));
		}
		const sampled = [];
		for (let i = 0; i < maxPoints; i++) {
			const index = Math.round((i * (data.length - 1)) / (maxPoints - 1));
			sampled.push({value: data[index], originalIndex: index});
		}
		return sampled;
	}, [data]);

	// Normalize data to 0-1 range
	const values = chartData.map((d) => d.value);
	const max = Math.max(...values);
	const min = Math.min(...values);
	const range = max - min;
	const normalized = values.map((d) => (range === 0 ? 0.5 : (d - min) / range));

	// Create SVG path using viewBox for scaling
	const viewBoxWidth = 100;
	const viewBoxHeight = 40;
	const padding = 4; // Padding to prevent clipping
	const usableWidth = viewBoxWidth - padding * 2;
	const usableHeight = viewBoxHeight - padding * 2;

	const points = normalized.map((value, index) => {
		const x = padding + (index / (chartData.length - 1)) * usableWidth;
		const y = padding + usableHeight - value * usableHeight;
		return {x, y};
	});

	// Create smooth curve using cubic bezier
	const createSmoothPath = (points: {x: number; y: number}[]) => {
		if (points.length < 2) return "";

		let path = `M ${points[0].x},${points[0].y}`;

		for (let i = 0; i < points.length - 1; i++) {
			const current = points[i];
			const next = points[i + 1];
			const controlPointX = (current.x + next.x) / 2;

			path += ` C ${controlPointX},${current.y} ${controlPointX},${next.y} ${next.x},${next.y}`;
		}

		return path;
	};

	// Create straight line path
	const createLinePath = (points: {x: number; y: number}[]) => {
		if (points.length < 2) return "";
		return `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`;
	};

	const pathData = smooth ? createSmoothPath(points) : createLinePath(points);

	const getDateLabel = (index: number) => {
		if (!interval) return null;
		const diff = data.length - 1 - index;
		const date = new Date();

		switch (interval) {
			case "hour":
				date.setHours(date.getHours() - diff);
				return date.toLocaleTimeString([], {hour: "numeric", minute: "2-digit"});
			case "day":
				date.setDate(date.getDate() - diff);
				return date.toLocaleDateString([], {month: "short", day: "numeric"});
			case "week":
				date.setDate(date.getDate() - diff * 7);
				return `Week of ${date.toLocaleDateString([], {
					month: "short",
					day: "numeric",
				})}`;
			case "month":
				date.setMonth(date.getMonth() - diff);
				return date.toLocaleDateString([], {month: "short", year: "numeric"});
			default:
				return "";
		}
	};

	const cardContent = (
		<Card
			p="16"
			color="fg.disabled"
			className={cn("transition-all duration-200", {
				"cursor-pointer hover:shadow-[currentColor_0_0_0_2px]": !!href,
			})}
		>
			<Text fontSize="md" fontWeight="600" color="fg.default">
				{label}
			</Text>

			<Box display="flex" alignItems="end" gap="12" mb="12" w="full">
				<Box style={{flex: 1, minWidth: 0, position: "relative"}} color="fg.disabled">
					<svg
						width="100%"
						height={height}
						viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
						preserveAspectRatio="none"
						style={{display: "block"}}
					>
						<path
							d={pathData}
							fill="none"
							stroke="currentColor"
							vectorEffect="non-scaling-stroke"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					{points.map((point, index) => (
						<Tooltip
							content={
								<Box>
									<Text fontWeight="600">
										{formatValue(chartData[index].value)}
									</Text>
									<Text
										fontSize="sm"
										color="fg.default.inverse"
										suppressHydrationWarning
									>
										{getDateLabel(chartData[index].originalIndex)}
									</Text>
								</Box>
							}
							key={index}
							delayDuration={0}
						>
							<Box
								color={
									index === points.length - 1 ? "fg.information" : "fg.disabled"
								}
								className="after:content-[''] after:absolute after:-inset-1 after:-inset-y-8"
								style={{
									position: "absolute",
									left: `${(point.x / viewBoxWidth) * 100}%`,
									top: `${(point.y / viewBoxHeight) * 100}%`,
									borderRadius: "50%",
									width: index === points.length - 1 ? "8px" : "6px",
									height: index === points.length - 1 ? "8px" : "6px",
									backgroundColor: "currentcolor",
									transform: "translate(-50%, -50%)",
									cursor: "pointer",
								}}
							/>
						</Tooltip>
					))}
				</Box>
				<Text
					fontSize="3xl"
					fontWeight="600"
					color="fg.information"
					style={{lineHeight: 1}}
				>
					{formatValue(value)}
				</Text>
			</Box>

			{(previousValue !== undefined || changeData) && (
				<Box display="flex" gap="12" justifyContent="space-between" w="full">
					{previousValue !== undefined && (
						<Text fontSize="sm" color="fg.information">
							Prev: {formatValue(previousValue)}
						</Text>
					)}
					{changeData && (
						<Text
							fontSize="sm"
							fontWeight="500"
							color={changeData.isGood ? "fg.success" : "fg.error"}
						>
							{changeData.isPositive ? "▲" : "▼"} {changeData.value}
						</Text>
					)}
				</Box>
			)}
		</Card>
	);

	return href ? <Link href={href}>{cardContent}</Link> : cardContent;
}
