"use client";

import { useEffect, useState } from "react";
import { Badge, Box, Button } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { useLayout } from "@/app/context/LayoutContext";
import { useTheme } from "@/app/hooks/useTheme";
import { IconChevronLeft, IconChevronRight, IconFilter } from "@tabler/icons-react";
import type { ResourceTab, PlannerCard } from "./types";
import { weekColumns } from "./constants";
import {
	normalizePlannerCardLanes,
	getPlannerViewportLabel,
	getPlannerViewportWeeks,
	buildWorkloadRows,
	generatePlannerCardsFromTargets,
} from "./utils";
import { WorkloadTabButton, WorkloadGrid } from "./components/WorkloadView";
import { PlannerGrid } from "./components/PlannerView";

export default function CMPResourceManagementPage() {
	const { setHidePageHeader } = useLayout();
	const { theme } = useTheme();
	const [activeTab, setActiveTab] = useState<ResourceTab>("workload");
	const [plannerWeekIndex, setPlannerWeekIndex] = useState(0);
	const [selectedPlannerPersonId, setSelectedPlannerPersonId] = useState<string | undefined>();
	const [plannerCards, setPlannerCards] = useState<PlannerCard[]>(
		() => normalizePlannerCardLanes(generatePlannerCardsFromTargets())
	);
	const visiblePlannerWeeks = getPlannerViewportWeeks(plannerWeekIndex);
	const workloadRows = buildWorkloadRows(plannerCards);

	const handleSelectWorkloadCell = (personId: string, weekIndex: number) => {
		setSelectedPlannerPersonId(personId);
		setPlannerWeekIndex(weekIndex);
		setActiveTab("planner");
	};

	const handlePlannerWeekChange = (direction: -1 | 1) => {
		setPlannerWeekIndex((current) =>
			Math.min(weekColumns.length - 1, Math.max(0, current + direction))
		);
	};

	useEffect(() => {
		setHidePageHeader(true);
		return () => setHidePageHeader(false);
	}, [setHidePageHeader]);

	return (
		<Box
			bg="bg.default"
			display="flex"
			flexDirection="column"
			w="full"
			style={{
				marginLeft: -32,
				marginRight: -32,
				minHeight: "calc(100vh - 136px)",
			}}
		>
			<Box borderB="1" borderColor="border.tertiary" display="flex" style={{ gap: 28 }}>
				<WorkloadTabButton active={activeTab === "workload"} onClick={() => setActiveTab("workload")}>
					Workload
				</WorkloadTabButton>
				<WorkloadTabButton active={activeTab === "planner"} onClick={() => setActiveTab("planner")}>
					Planner
				</WorkloadTabButton>
				<WorkloadTabButton active={activeTab === "reports"} onClick={() => setActiveTab("reports")}>
					Reports
				</WorkloadTabButton>
			</Box>

			<Box
				display="flex"
				flex="1"
				flexDirection="column"
				px="32"
				pt="20"
				pb="24"
				style={{ minHeight: 0 }}
			>
				{activeTab === "workload" ? (
					<Box display="flex" flex="1" flexDirection="column" gap="16" w="full" style={{ minHeight: 0 }}>
						<Box alignItems="center" display="flex" gap="12" justifyContent="space-between" flexWrap="wrap">
							<Box alignItems="center" display="flex" gap="12" flexWrap="wrap">
								<div style={{ position: "relative" }}>
									<Button appearance="subtle" aria-label="Filter workload" size="md">
										<IconFilter size={16} />
									</Button>
									<div style={{ position: "absolute", right: -4, top: -6 }}>
										<Badge intent="primary">2</Badge>
									</div>
								</div>

								<Button appearance="default" onClick={() => setPlannerWeekIndex(0)} size="md">
									Today
								</Button>

								<Box alignItems="center" display="flex" gap="8">
									<Button
										appearance="subtle"
										aria-label="Previous date range"
										disabled={plannerWeekIndex === 0}
										onClick={() => handlePlannerWeekChange(-1)}
										size="sm"
									>
										<IconChevronLeft size={16} />
									</Button>
									<Text color="fg.default" fontSize="sm" fontWeight="600" style={{ maxWidth: "none" }}>
										Jun 1 - Aug 30 2025
									</Text>
									<Button
										appearance="subtle"
										aria-label="Next date range"
										disabled={plannerWeekIndex === weekColumns.length - 1}
										onClick={() => handlePlannerWeekChange(1)}
										size="sm"
									>
										<IconChevronRight size={16} />
									</Button>
								</Box>
							</Box>
						</Box>

						<Box flex="1" w="full" style={{ minHeight: 0 }}>
							<WorkloadGrid
								onSelectCell={handleSelectWorkloadCell}
								rows={workloadRows}
								selectedPersonId={selectedPlannerPersonId}
								selectedWeekIndex={plannerWeekIndex}
								theme={theme}
							/>
						</Box>
					</Box>
				) : null}

				{activeTab === "planner" ? (
					<Box display="flex" flex="1" flexDirection="column" gap="16" w="full" style={{ minHeight: 0 }}>
						<Box alignItems="center" display="flex" gap="12" justifyContent="space-between" flexWrap="wrap">
							<Box alignItems="center" display="flex" gap="12" flexWrap="wrap">
								<div style={{ position: "relative" }}>
									<Button appearance="subtle" aria-label="Filter planner" size="md">
										<IconFilter size={16} />
									</Button>
									<div style={{ position: "absolute", right: -4, top: -6 }}>
										<Badge intent="primary">2</Badge>
									</div>
								</div>

								<Button appearance="default" onClick={() => setPlannerWeekIndex(0)} size="md">
									Today
								</Button>

								<Box alignItems="center" display="flex" gap="8">
									<Button
										appearance="subtle"
										aria-label="Previous planner range"
										disabled={plannerWeekIndex === 0}
										onClick={() => handlePlannerWeekChange(-1)}
										size="sm"
									>
										<IconChevronLeft size={16} />
									</Button>
									<Text color="fg.default" fontSize="sm" fontWeight="600" style={{ maxWidth: "none" }}>
										{getPlannerViewportLabel(visiblePlannerWeeks)}
									</Text>
									<Button
										appearance="subtle"
										aria-label="Next planner range"
										disabled={plannerWeekIndex === weekColumns.length - 1}
										onClick={() => handlePlannerWeekChange(1)}
										size="sm"
									>
										<IconChevronRight size={16} />
									</Button>
								</Box>
							</Box>

							<Box alignItems="center" display="flex" gap="8">
								<Text color="fg.default" fontSize="sm" style={{ maxWidth: "none" }}>
									Unscoped Steps
								</Text>
								<Badge intent="primary">24</Badge>
							</Box>
						</Box>

						<Box flex="1" style={{ minHeight: 0 }}>
							<PlannerGrid
								cards={plannerCards}
								selectedPersonId={selectedPlannerPersonId}
								setCards={setPlannerCards}
								theme={theme}
								visibleWeeks={visiblePlannerWeeks}
							/>
						</Box>
					</Box>
				) : null}

				{activeTab === "reports" ? (
					<Box
						alignItems="center"
						bg="bg.default"
						border="1"
						borderColor="border.tertiary"
						display="flex"
						flex="1"
						justifyContent="center"
						rounded="lg"
						style={{ minHeight: 320 }}
					>
						<Box display="flex" flexDirection="column" gap="8" textAlign="center">
							<Text color="fg.default" fontSize="lg" fontWeight="600">
								Reports
							</Text>
							<Text color="fg.secondary" fontSize="sm" style={{ maxWidth: 320 }}>
								The Reports tab can be implemented next once we lock the Planner interactions and scheduling model.
							</Text>
						</Box>
					</Box>
				) : null}
			</Box>
		</Box>
	);
}
