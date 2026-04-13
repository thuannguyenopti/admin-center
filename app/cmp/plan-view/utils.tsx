import { IconChevronDown } from "@tabler/icons-react";

export const parseDate = (dateStr: string): Date | null => {
	if (dateStr === "No start date" || dateStr === "No end date" || !dateStr) return null;
	const date = new Date(dateStr);
	return isNaN(date.getTime()) ? null : date;
};

export const getStatusColor = (status: string): string => {
	switch (status) {
		case "On Track":
			return "#10b981";
		case "In Progress":
			return "#3b82f6";
		case "At Risk":
			return "#f59e0b";
		case "Overdue":
			return "#ef4444";
		case "Completed":
			return "#8b5cf6";
		case "Not Started":
			return "#9ca3af";
		default:
			return "#9ca3af";
	}
};

export const IconChevronLeft = ({ size }: { size: number }) => (
	<IconChevronDown size={size} style={{ transform: "rotate(90deg)" }} />
);
