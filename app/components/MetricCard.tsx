import {Box, Card, Text} from "@optiaxiom/react";

type MetricCardProps = {
	label: string;
	unit?: string;
	data: number[];
	smooth?: boolean;
};

export default function MetricCard({label, unit = "", data, smooth = false}: MetricCardProps) {
	// Get current and previous values from data array
	const value = data[data.length - 1];
	const previousValue = data.length > 1 ? data[data.length - 2] : undefined;

	// Format value with unit
	const formatValue = (val: number) => {
		return (val + unit).toString();
	};

	// Calculate change percentage and determine if trend is positive
	const calculateChange = () => {
		if (previousValue === undefined) return null;

		if (previousValue === 0) return null;

		const percentChange = ((value - previousValue) / previousValue) * 100;
		const isIncreasing = percentChange >= 0;

		// Determine overall trend by comparing first and last values
		const trendUp = value > data[0];

		return {
			value: Math.abs(percentChange).toFixed(1) + "%",
			isPositive: percentChange >= 0,
			isGood: trendUp, // Green if overall trend is up, red if down
		};
	};

	const changeData = calculateChange();

	// Normalize data to 0-1 range
	const max = Math.max(...data);
	const min = Math.min(...data);
	const range = max - min;
	const normalized = data.map((d) => (d - min) / range);

	// Create SVG path using viewBox for scaling
	const viewBoxWidth = 100;
	const viewBoxHeight = 40;
	const padding = 4; // Padding to prevent clipping
	const usableWidth = viewBoxWidth - padding * 2;
	const usableHeight = viewBoxHeight - padding * 2;

	const points = normalized.map((value, index) => {
		const x = padding + (index / (data.length - 1)) * usableWidth;
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

	return (
		<Card p="20">
			<Text
				fontSize="md"
				fontWeight="600"
				mb="16"
				color="fg.default"
			>
				{label}
			</Text>

			<Box
				display="flex"
				alignItems="end"
				gap="12"
				mb="12"
				w="full"
			>
				<Box
					style={{flex: 1, minWidth: 0, position: "relative"}}
					color="fg.disabled"
				>
					<svg
						width="100%"
						height="60"
						viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
						preserveAspectRatio="none"
						style={{display: "block"}}
					>
						<path
							d={pathData}
							fill="none"
							stroke="currentColor"
							strokeWidth="1"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					{points.map((point, index) => (
						<Box
							key={index}
							color={index === points.length - 1 ? "fg.information" : "fg.disabled"}
							style={{
								position: "absolute",
								left: `${(point.x / viewBoxWidth) * 100}%`,
								top: `${(point.y / viewBoxHeight) * 100}%`,
								borderRadius: "50%",
								width: index === points.length - 1 ? "8px" : "4px",
								height: index === points.length - 1 ? "8px" : "4px",
								backgroundColor: "currentcolor",
								transform: "translate(-50%, -50%)",
							}}
						/>
					))}
				</Box>
				<Text
					fontSize="3xl"
					fontWeight="600"
					color="fg.default"
					style={{lineHeight: 1}}
				>
					{formatValue(value)}
				</Text>
			</Box>

			{(previousValue !== undefined || changeData) && (
				<Box
					display="flex"
					gap="12"
					justifyContent="space-between"
					w="full"
				>
					{previousValue !== undefined && (
						<Text
							fontSize="sm"
							color="fg.information.light"
						>
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
}
