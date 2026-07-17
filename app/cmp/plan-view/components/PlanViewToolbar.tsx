import { Box, SearchInput, Button } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import {
	IconFilter,
	IconChevronRight,
	IconDots,
	IconUserPlus,
} from "@tabler/icons-react";
import { IconChevronLeft } from "../utils";

type PlanViewToolbarProps = {
	activeView: string;
	searchQuery: string;
	onSearchChange: (value: string) => void;
};

export function PlanViewToolbar({ activeView, searchQuery, onSearchChange }: PlanViewToolbarProps) {
	return (
		<Box px="16" py="12" display="flex" alignItems="center" justifyContent="space-between" bg="bg.default">
			{/* Left - Filter & Search */}
			<Box display="flex" alignItems="center" gap="12">
				<Box display="inline-flex" className="relative">
					<Button icon={<IconFilter size={16} />} size="md" appearance="subtle" aria-label="Filter" />
					<Box
						style={{
							position: "absolute",
							top: "-4px",
							left: "-4px",
							minWidth: "18px",
							height: "18px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: "11px",
							borderRadius: "50%",
							backgroundColor: "#0037FF",
							color: "white",
							fontWeight: 600,
							padding: "0 5px",
							zIndex: 1,
						}}
					>
						5
					</Box>
				</Box>
				<SearchInput
					placeholder="Search..."
					size="md"
					style={{ width: "280px" }}
					value={searchQuery}
					onValueChange={onSearchChange}
				/>

				{(activeView === "calendar" || activeView === "timeline") && (
					<Box display="flex" alignItems="center" gap="8" style={{ marginLeft: "8px" }}>
						<Button
							appearance="subtle"
							size="sm"
							style={{
								border: "1px solid var(--ax-colors-border-default)",
								borderRadius: "6px",
								padding: "4px 12px",
							}}
						>
							Today
						</Button>
						<Box display="flex" alignItems="center" gap="4">
							<Button appearance="subtle" size="sm" icon={<IconChevronLeft size={16} />} aria-label="Previous" />
							<Text fontSize="sm" fontWeight="500" style={{ whiteSpace: "nowrap" }}>
								Feb 22 - Mar 23, 2026
							</Text>
							<Button appearance="subtle" size="sm" icon={<IconChevronRight size={16} />} aria-label="Next" />
						</Box>
					</Box>
				)}
			</Box>

			{/* Right - Actions */}
			<Box display="flex" alignItems="center" gap="8">
				<Button
					appearance="subtle"
					icon={<IconUserPlus size={20} />}
					aria-label="Share"
					style={{
						border: "1px dashed var(--ax-colors-border-default)",
						borderRadius: "50%",
						width: "36px",
						height: "36px",
						padding: 0,
					}}
				/>
				<Button
					appearance="subtle"
					size="md"
					style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: "6px" }}
				>
					Save View
				</Button>
				<Button appearance="subtle" icon={<IconDots size={20} />} aria-label="More options" />
			</Box>
		</Box>
	);
}
