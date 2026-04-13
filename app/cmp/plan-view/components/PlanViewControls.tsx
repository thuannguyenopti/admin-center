import { Box, Switch, Button } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { IconChevronDown, IconArrowsSort, IconSettings } from "@tabler/icons-react";

type PlanViewControlsProps = {
	activeView: string;
	showHierarchy: boolean;
	onShowHierarchyChange: (value: boolean) => void;
};

export function PlanViewControls({ activeView, showHierarchy, onShowHierarchyChange }: PlanViewControlsProps) {
	return (
		<Box px="16" py="8" display="flex" alignItems="center" justifyContent="space-between" borderB="1" borderColor="border.tertiary" bg="bg.default">
			{activeView === "list" && (
				<>
					<Switch checked={showHierarchy} onCheckedChange={onShowHierarchyChange}>
						Show campaign hierarchy
					</Switch>
					<Box display="flex" alignItems="center" gap="8">
						<Button appearance="subtle" size="sm">
							Add <IconChevronDown size={14} style={{ marginLeft: "4px" }} />
						</Button>
						<Button appearance="subtle" size="sm">
							Columns <IconChevronDown size={14} style={{ marginLeft: "4px" }} />
						</Button>
					</Box>
				</>
			)}

			{activeView === "board" && (
				<>
					<Box display="flex" alignItems="center" gap="16">
						<Box display="flex" alignItems="center" gap="4">
							<Text fontSize="sm" color="fg.secondary">View</Text>
							<Text fontSize="sm" fontWeight="500">Tasks</Text>
							<IconChevronDown size={14} />
						</Box>
						<Box display="flex" alignItems="center" gap="4">
							<Text fontSize="sm" color="fg.secondary">Columns</Text>
							<Text fontSize="sm" fontWeight="500">Status</Text>
							<IconChevronDown size={14} />
						</Box>
						<Button appearance="subtle" size="sm" icon={<IconArrowsSort size={16} />} aria-label="Sort" />
						<Box display="flex" alignItems="center" gap="4">
							<Text fontSize="sm" color="fg.secondary">Group by</Text>
							<Text fontSize="sm" fontWeight="500">None</Text>
							<IconChevronDown size={14} />
						</Box>
						<Text fontSize="sm" color="fg.tertiary">Showing 5 tasks</Text>
					</Box>
					<Box display="flex" alignItems="center" gap="4" style={{ cursor: "pointer" }}>
						<IconSettings size={16} />
						<Text fontSize="sm">Display</Text>
					</Box>
				</>
			)}

			{activeView === "calendar" && (
				<>
					<Box display="flex" alignItems="center" gap="16">
						<Box display="flex" alignItems="center" gap="4">
							<Text fontSize="sm" color="fg.secondary">View</Text>
							<Text fontSize="sm" fontWeight="500">Tasks</Text>
							<IconChevronDown size={14} />
						</Box>
						<Box display="flex" alignItems="center" gap="8">
							<Text fontSize="sm" color="fg.secondary">Planning</Text>
							<Switch checked={true} />
							<Text fontSize="sm" color="fg.secondary">Scheduled</Text>
						</Box>
					</Box>
					<Box display="flex" alignItems="center" gap="4" style={{ cursor: "pointer" }}>
						<IconSettings size={16} />
						<Text fontSize="sm">Display</Text>
					</Box>
				</>
			)}

			{activeView === "timeline" && (
				<>
					<Box display="flex" alignItems="center" gap="16">
						<Switch checked={showHierarchy} onCheckedChange={onShowHierarchyChange}>
							Show campaign hierarchy
						</Switch>
						<Box display="flex" alignItems="center" gap="4">
							<Text fontSize="sm" color="fg.secondary">Color by</Text>
							<Text fontSize="sm" fontWeight="500">Campaign</Text>
							<IconChevronDown size={14} />
						</Box>
					</Box>
					<Box display="flex" alignItems="center" gap="16">
						<Box display="flex" alignItems="center" gap="4" style={{ cursor: "pointer" }}>
							<IconSettings size={16} />
							<Text fontSize="sm">Zoom:</Text>
							<Text fontSize="sm" fontWeight="500" color="fg.accent">Month</Text>
							<IconChevronDown size={14} />
						</Box>
						<Button appearance="subtle" size="sm">
							Add <IconChevronDown size={14} style={{ marginLeft: "4px" }} />
						</Button>
					</Box>
				</>
			)}
		</Box>
	);
}
