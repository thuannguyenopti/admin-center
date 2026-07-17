import { Badge } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";

export const StatusBadge = ({ status }: { status: string }) => {
	const getIntent = () => {
		switch (status) {
			case "On Track":
				return "success";
			case "Not Started":
				return "neutral";
			case "Overdue":
				return "danger";
			case "Completed":
				return "primary";
			case "In Progress":
				return "information";
			case "At Risk":
				return "warning";
			default:
				return "neutral";
		}
	};

	return <Badge intent={getIntent() as any}>{status}</Badge>;
};

export const StepBadge = ({ step }: { step: string | null }) => {
	if (!step) return <Text color="fg.tertiary">—</Text>;
	return (
		<Badge intent="neutral" className="font-normal">
			{step}
		</Badge>
	);
};
