import { useState } from "react";
import { Box, Button } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { IconChevronRight } from "@tabler/icons-react";
import { parseDate, getStatusColor, IconChevronLeft } from "../utils";
import type { PlanItem } from "../types";

type CalendarViewProps = {
	data: PlanItem[];
};

export function CalendarView({ data }: CalendarViewProps) {
	const [currentDate, setCurrentDate] = useState(new Date());
	const today = new Date();

	const getDaysInMonth = (date: Date) => {
		return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
	};

	const getFirstDayOfMonth = (date: Date) => {
		return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
	};

	const goToPreviousMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
	};

	const goToNextMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
	};

	const daysInMonth = getDaysInMonth(currentDate);
	const firstDay = getFirstDayOfMonth(currentDate);
	const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
	const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

	const getItemsForDate = (day: number) => {
		const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
			.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
		return data.filter(
			(item) =>
				!item.isGroup &&
				(item.startDate === dateStr || item.endDate === dateStr),
		);
	};

	return (
		<Box
			display="flex"
			flexDirection="column"
			overflow="hidden"
			bg="bg.default"
			p="16"
			style={{ height: "100%", width: "100%" }}
		>
			<Box display="flex" alignItems="center" justifyContent="space-between" mb="16">
				<Button appearance="subtle" onClick={goToPreviousMonth}>
					<IconChevronLeft size={20} />
				</Button>
				<Text fontWeight="600" fontSize="lg">
					{currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
				</Text>
				<Button appearance="subtle" onClick={goToNextMonth}>
					<IconChevronRight size={20} />
				</Button>
			</Box>

			<Box style={{ flex: 1, display: "flex", flexDirection: "column" }}>
				<Box
					display="grid"
					style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", marginBottom: "8px" }}
				>
					{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
						<Box
							key={day}
							style={{
								textAlign: "center",
								fontWeight: 600,
								fontSize: "12px",
								color: "var(--ax-colors-fg-secondary)",
								padding: "8px",
							}}
						>
							{day}
						</Box>
					))}
				</Box>

				<Box display="grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", flex: 1 }}>
					{emptyDays.map((_, idx) => (
						<Box
							key={`empty-${idx}`}
							style={{
								backgroundColor: "var(--ax-colors-bg-secondary)",
								borderRadius: "6px",
								border: "1px solid transparent",
							}}
						/>
					))}

					{days.map((day) => {
						const isToday =
							day === today.getDate() &&
							currentDate.getMonth() === today.getMonth() &&
							currentDate.getFullYear() === today.getFullYear();
						const items = getItemsForDate(day);

						return (
							<Box
								key={day}
								style={{
									backgroundColor: isToday ? "var(--ax-colors-bg-tertiary)" : "var(--ax-colors-bg-secondary)",
									border: isToday
										? "2px solid var(--ax-colors-fg-accent)"
										: "1px solid var(--ax-colors-border-tertiary)",
									borderRadius: "6px",
									padding: "8px",
									display: "flex",
									flexDirection: "column",
									cursor: "pointer",
									transition: "all 0.2s",
									minHeight: "80px",
								}}
								onMouseEnter={(e) => {
									const el = e.currentTarget as HTMLElement;
									if (!isToday) el.style.backgroundColor = "var(--ax-colors-bg-default)";
								}}
								onMouseLeave={(e) => {
									const el = e.currentTarget as HTMLElement;
									if (!isToday) el.style.backgroundColor = "var(--ax-colors-bg-secondary)";
								}}
							>
								<Text fontWeight={isToday ? "600" : "500"} fontSize="sm">
									{day}
								</Text>
								<Box
									style={{
										marginTop: "4px",
										display: "flex",
										flexDirection: "column",
										gap: "2px",
										flex: 1,
										overflow: "hidden",
									}}
								>
									{items.map((item) => (
										<Box
											key={item.id}
											style={{
												backgroundColor: getStatusColor(item.status),
												height: "6px",
												borderRadius: "2px",
												opacity: 0.7,
											}}
											title={item.title}
										/>
									))}
								</Box>
							</Box>
						);
					})}
				</Box>
			</Box>
		</Box>
	);
}
