"use client";

import { Box, Tabs, TabsList, TabsTrigger } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { IconChevronDown } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { usePlanViewState } from "./hooks/usePlanViewState";
import { ListView } from "./components/ListView";
import { CalendarView } from "./components/CalendarView";
import { TimelineView } from "./components/TimelineView";
import { BoardView } from "./components/BoardView";
import { PlanViewToolbar } from "./components/PlanViewToolbar";
import { PlanViewControls } from "./components/PlanViewControls";
import { PlanViewFooter } from "./components/PlanViewFooter";
import type { PlanItem } from "./types";

export function PlanViewPage() {
	const router = useRouter();
	const state = usePlanViewState();

	const handleRowClick = (item: PlanItem) => {
		if (item.type === "Task") {
			router.push(`/cmp/task/${item.id}`);
		}
	};

	return (
		<Box style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
			{/* Row 1 - Tab Navigation */}
			<Box borderB="1" borderColor="border.tertiary" bg="bg.default" px="16" display="flex" alignItems="center">
				<Tabs value={state.activeView} onValueChange={state.setActiveView}>
					<TabsList>
						<TabsTrigger value="list">List</TabsTrigger>
						<TabsTrigger value="calendar">Calendar</TabsTrigger>
						<TabsTrigger value="timeline">Timeline</TabsTrigger>
						<TabsTrigger value="board">Board</TabsTrigger>
					</TabsList>
				</Tabs>
				<Box display="flex" alignItems="center" gap="8" style={{ cursor: "pointer", marginLeft: "16px" }}>
					<Text fontSize="sm" color="fg.tertiary">Saved Views</Text>
					<IconChevronDown size={14} />
				</Box>
			</Box>

			{/* Row 2 - Toolbar */}
			<PlanViewToolbar
				activeView={state.activeView}
				searchQuery={state.searchQuery}
				onSearchChange={state.setSearchQuery}
			/>

			{/* Row 3 - View Controls */}
			<PlanViewControls
				activeView={state.activeView}
				showHierarchy={state.showHierarchy}
				onShowHierarchyChange={state.setShowHierarchy}
			/>

			{/* Content */}
			<Box bg="bg.default" style={{ flex: 1, overflow: "hidden", position: "relative" }}>
				{state.activeView === "list" && (
					<ListView
						data={state.paginatedItems}
						expandedGroups={state.expandedGroups}
						toggleGroup={state.toggleGroup}
						onRowClick={handleRowClick}
					/>
				)}

				{state.activeView === "calendar" && (
					<Box style={{ position: "absolute", inset: 0, overflow: "auto" }}>
						<CalendarView data={state.allItems} />
					</Box>
				)}

				{state.activeView === "timeline" && (
					<Box style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
						<TimelineView data={state.allItems} expandedGroups={state.expandedGroups} toggleGroup={state.toggleGroup} />
					</Box>
				)}

				{state.activeView === "board" && (
					<Box style={{ position: "absolute", inset: 0, overflow: "auto" }}>
						<BoardView data={state.allItems} />
					</Box>
				)}
			</Box>

			{/* Footer */}
			<PlanViewFooter
				page={state.page}
				onPageChange={state.setPage}
				pageSize={state.pageSize}
				totalItems={state.totalItems}
				totalPages={state.totalPages}
			/>
		</Box>
	);
}
