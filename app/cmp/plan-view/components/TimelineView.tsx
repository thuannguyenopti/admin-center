import { Box, Badge, Button } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import { parseDate, getStatusColor } from "../utils";
import type { PlanItem } from "../types";

type TimelineViewProps = {
	data: PlanItem[];
	expandedGroups: string[];
	toggleGroup: (id: string) => void;
};

export function TimelineView({ data, expandedGroups, toggleGroup }: TimelineViewProps) {
	const today = new Date();

	const dates = data
		.map((item) => [parseDate(item.startDate), parseDate(item.endDate)])
		.flat()
		.filter(Boolean) as Date[];

	let minDate = new Date(today.getFullYear(), today.getMonth(), 1);
	let maxDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);

	if (dates.length > 0) {
		const min = new Date(Math.min(...dates.map((d) => d.getTime())));
		const max = new Date(Math.max(...dates.map((d) => d.getTime())));
		minDate = new Date(Math.min(minDate.getTime(), min.getTime()));
		maxDate = new Date(Math.max(maxDate.getTime(), max.getTime()));
	}

	const months: { date: Date; label: string }[] = [];
	const current = new Date(minDate);
	while (current <= maxDate) {
		months.push({
			date: new Date(current),
			label: current.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
		});
		current.setMonth(current.getMonth() + 1);
	}

	const daysInRange = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
	const pixelsPerDay = 40;
	const timelineWidth = daysInRange * pixelsPerDay;

	const getBarPosition = (date: Date | null) => {
		if (!date) return 0;
		return Math.max(0, (date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) * pixelsPerDay;
	};

	const getTodayPosition = () => {
		return ((today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) * pixelsPerDay;
	};

	return (
		<Box
			display="flex"
			flexDirection="column"
			overflow="hidden"
			style={{ height: "100%", width: "100%" }}
		>
			{/* Timeline header with months */}
			<Box display="flex" overflow="auto" borderB="1" borderColor="border.tertiary" bg="bg.secondary">
				<Box style={{ width: "280px", minWidth: "280px", flexShrink: 0 }} />
				<Box style={{ display: "flex", position: "relative", width: timelineWidth }}>
					{months.map((month, idx) => (
						<Box
							key={idx}
							style={{
								flex: 1,
								minWidth: "120px",
								padding: "12px 8px",
								borderRight: "1px solid var(--ax-colors-border-tertiary)",
								fontSize: "12px",
								fontWeight: 500,
								color: "var(--ax-colors-fg-secondary)",
							}}
						>
							{month.label}
						</Box>
					))}
				</Box>
			</Box>

			{/* Timeline content */}
			<Box display="flex" flex="1" overflow="auto" bg="bg.default">
				{/* Left column with item names */}
				<Box
					style={{
						width: "280px",
						minWidth: "280px",
						flexShrink: 0,
						borderRight: "1px solid var(--ax-colors-border-tertiary)",
						overflow: "auto",
					}}
				>
					{data.map((item) => (
						<Box
							key={item.id}
							style={{
								padding: "12px 16px",
								height: "52px",
								display: "flex",
								alignItems: "center",
								gap: "8px",
								borderBottom: "1px solid var(--ax-colors-border-tertiary)",
								backgroundColor: item.isGroup ? "var(--ax-colors-bg-secondary)" : "transparent",
								fontWeight: item.isGroup ? 500 : 400,
							}}
						>
							{item.isGroup && (
								<Button
									appearance="subtle"
									size="sm"
									icon={
										expandedGroups.includes(item.id) ? (
											<IconChevronDown size={16} />
										) : (
											<IconChevronRight size={16} />
										)
									}
									onClick={() => toggleGroup(item.id)}
									aria-label={expandedGroups.includes(item.id) ? "Collapse" : "Expand"}
									style={{ marginLeft: "-8px" }}
								/>
							)}
							<Text fontSize="sm" fontWeight={item.isGroup ? "500" : "400"} className="truncate">
								{item.title}
							</Text>
							{item.badge && <Badge intent="neutral">{item.badge}</Badge>}
						</Box>
					))}
				</Box>

				{/* Timeline bars */}
				<Box style={{ position: "relative", flex: 1, overflow: "auto" }}>
					{/* Today line */}
					<Box
						style={{
							position: "absolute",
							left: `${getTodayPosition()}px`,
							top: 0,
							bottom: 0,
							width: "2px",
							backgroundColor: "var(--ax-colors-fg-error)",
							zIndex: 10,
							pointerEvents: "none",
						}}
					/>

					{data.map((item) => (
						<Box
							key={`bg-${item.id}`}
							style={{
								height: "52px",
								borderBottom: "1px solid var(--ax-colors-border-tertiary)",
								backgroundColor: item.isGroup ? "var(--ax-colors-bg-secondary)" : "transparent",
								position: "relative",
							}}
						>
							{!item.isGroup && parseDate(item.startDate) && parseDate(item.endDate) && (
								<Box
									style={{
										position: "absolute",
										top: "12px",
										left: `${getBarPosition(parseDate(item.startDate))}px`,
										height: "28px",
										backgroundColor: getStatusColor(item.status),
										borderRadius: "4px",
										width: `${Math.max(
											60,
											getBarPosition(parseDate(item.endDate)) -
												getBarPosition(parseDate(item.startDate)),
										)}px`,
										opacity: 0.8,
										cursor: "pointer",
										transition: "opacity 0.2s",
									}}
									onMouseEnter={(e) => {
										(e.currentTarget as HTMLElement).style.opacity = "1";
									}}
									onMouseLeave={(e) => {
										(e.currentTarget as HTMLElement).style.opacity = "0.8";
									}}
									title={`${item.title}: ${item.startDate} to ${item.endDate}`}
								/>
							)}
						</Box>
					))}

					{/* Grid lines */}
					<Box
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							display: "flex",
							pointerEvents: "none",
						}}
					>
						{Array.from({ length: months.length }).map((_, idx) => (
							<Box
								key={idx}
								style={{
									flex: 1,
									minWidth: "120px",
									borderRight: "1px solid var(--ax-colors-border-tertiary)",
									opacity: 0.3,
								}}
							/>
						))}
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
