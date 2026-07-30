import {IconChevronDown} from "@/app/lib/axiom-icons";

export const parseDate = (dateStr: string): Date | null => {
	if (dateStr === "No start date" || dateStr === "No end date" || !dateStr) return null;
	const date = new Date(dateStr);
	return isNaN(date.getTime()) ? null : date;
};

export const getStatusColor = (status: string): string => {
	switch (status) {
		case "On Track":
			return "var(--ax-colors-fg-success)";
		case "In Progress":
			return "var(--ax-colors-fg-information)";
		case "At Risk":
			return "var(--ax-colors-fg-warning)";
		case "Overdue":
			return "var(--ax-colors-fg-error)";
		case "Completed":
			return "var(--ax-colors-fg-success)";
		case "Not Started":
			return "var(--ax-colors-fg-tertiary)";
		default:
			return "var(--ax-colors-fg-tertiary)";
	}
};

export const IconChevronLeft = ({size}: {size: number}) => (
	<IconChevronDown size={size} style={{transform: "rotate(90deg)"}} />
);
