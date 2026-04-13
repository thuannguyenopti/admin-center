"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
	Box,
	Badge,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
	SearchInput,
	Text as AxiomText,
	Menu,
	MenuTrigger,
	MenuContent,
	LabelMenuButton,
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
} from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { IconChevronDown, IconDots } from "@tabler/icons-react";
import { IconChartColumn, IconColumns3, IconSortSolid } from "@optimizely/axiom-icons";
import type { Optimization, OptimizationStatus } from "./mockData";
import { mockOptimizations } from "./mockData";
import { getDynamicOptimizations, removeDynamicOptimization } from "./dynamicOptimizationStorage";
import { clearStoredExtraVariations } from "./optimizationVariationsStorage";

function statusIntent(status: OptimizationStatus): "success" | "neutral" | "warning" {
	if (status === "Running") return "success";
	if (status === "Paused" || status === "Not Started") return "warning";
	return "neutral";
}

type SortColumn = "name" | "type" | "status" | "modified";
type SortDirection = "asc" | "desc";

export default function OptimizationsPage() {
	const router = useRouter();
	const pathname = usePathname();
	const [removedOptimizationIds, setRemovedOptimizationIds] = useState<string[]>([]);
	const [archiveTarget, setArchiveTarget] = useState<Optimization | null>(null);

	const removedSet = useMemo(() => new Set(removedOptimizationIds), [removedOptimizationIds]);

	const allOptimizations = useMemo(() => {
		void pathname;
		const dyn = getDynamicOptimizations();
		const seen = new Set(dyn.map((o: Optimization) => o.id));
		const rest = mockOptimizations.filter((o: Optimization) => !seen.has(o.id));
		return [...dyn, ...rest].filter((o) => !removedSet.has(o.id));
	}, [pathname, removedSet]);

	useEffect(() => {
		for (const opt of allOptimizations) {
			router.prefetch(`/web-experimentation/optimizations/${opt.id}`);
			router.prefetch(`/web-experimentation/optimizations/${opt.id}/results`);
		}
	}, [router, allOptimizations]);
	const [activeTab, setActiveTab] = useState("overview");
	const [statusFilter, setStatusFilter] = useState("All");
	const [typeFilter, setTypeFilter] = useState("All");
	const [searchQuery, setSearchQuery] = useState("");
	const [sortColumn, setSortColumn] = useState<SortColumn | null>("modified");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

	const filtered = allOptimizations.filter((opt) => {
		const matchSearch =
			!searchQuery ||
			opt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			opt.description.toLowerCase().includes(searchQuery.toLowerCase());
		const matchStatus =
			statusFilter === "All" ||
			(statusFilter === "Active" && (opt.status === "Running" || opt.status === "Not Started")) ||
			(statusFilter === "Paused" && opt.status === "Paused") ||
			(statusFilter === "Archived" && opt.status === "Archived") ||
			(statusFilter === "Concluded" && opt.status === "Concluded");
		const matchType = typeFilter === "All" || opt.type === typeFilter;
		return matchSearch && matchStatus && matchType;
	});

	const handleSort = (column: SortColumn) => {
		if (sortColumn === column) {
			setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortColumn(column);
			setSortDirection("asc");
		}
	};

	const sorted = [...filtered].sort((a, b) => {
		if (!sortColumn) return 0;
		const aVal = a[sortColumn];
		const bVal = b[sortColumn];
		const cmp =
			sortColumn === "modified"
				? new Date(aVal).getTime() - new Date(bVal).getTime()
				: String(aVal).localeCompare(String(bVal), undefined, { sensitivity: "base" });
		return sortDirection === "asc" ? cmp : -cmp;
	});

	return (
		<Box display="flex" flexDirection="column" gap="24" w="full" style={{ minHeight: 0 }}>
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList mb="24">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="experiments">Experiments</TabsTrigger>
					<TabsTrigger value="personalization">Personalization Campaigns</TabsTrigger>
					<TabsTrigger value="exclusion">Exclusion Groups</TabsTrigger>
				</TabsList>

				<TabsContent value="overview">
					<Box display="flex" flexDirection="column" gap="16">
						<Box
							display="flex"
							flexWrap="wrap"
							gap="12"
							alignItems="center"
							justifyContent="space-between"
						>
							<Box display="flex" gap="12" flexWrap="wrap" alignItems="center">
								<Box style={{ minWidth: "280px", flex: "1 1 280px" }}>
									<SearchInput
										size="lg"
										placeholder="Filter by name, key, or description"
										value={searchQuery}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
									/>
								</Box>
								<Menu
									options={[
										{ label: "All", execute: () => setStatusFilter("All") },
										{ label: "Active", execute: () => setStatusFilter("Active") },
										{ label: "Paused", execute: () => setStatusFilter("Paused") },
										{ label: "Archived", execute: () => setStatusFilter("Archived") },
										{ label: "Concluded", execute: () => setStatusFilter("Concluded") },
									]}
								>
									<MenuTrigger asChild>
										<LabelMenuButton label="Status">{statusFilter}</LabelMenuButton>
									</MenuTrigger>
									<MenuContent />
								</Menu>
								<Menu
									options={[
										{ label: "All", execute: () => setTypeFilter("All") },
										{ label: "A/B Test", execute: () => setTypeFilter("A/B Test") },
										{ label: "Multivariate Test", execute: () => setTypeFilter("Multivariate Test") },
										{ label: "Multi-armed Bandit", execute: () => setTypeFilter("Multi-armed Bandit") },
										{ label: "Personalization Campaign", execute: () => setTypeFilter("Personalization Campaign") },
										{ label: "Stats Accelerator", execute: () => setTypeFilter("Stats Accelerator") },
									]}
								>
									<MenuTrigger asChild>
										<LabelMenuButton label="Type">{typeFilter}</LabelMenuButton>
									</MenuTrigger>
									<MenuContent />
								</Menu>
							</Box>
							<Box display="flex" gap="8" alignItems="center">
								<Button
									appearance="subtle"
									size="lg"
									icon={<IconColumns3 size={20} style={{ color: "var(--ax-colors-fg-secondary)" }} />}
									aria-label="Display columns"
									style={{
										backgroundColor: "var(--ax-colors-bg-default)",
										border: "1px solid var(--ax-colors-border-secondary)",
										borderRadius: "8px",
										minWidth: "40px",
										minHeight: "40px",
										width: "40px",
										height: "40px",
										padding: 0,
										display: "inline-flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								/>
								<Menu
									options={[
										{ label: "Experiment", execute: () => { } },
										{ label: "Personalization Campaign", execute: () => { } },
										{ label: "Exclusion Group", execute: () => { } },
									]}
								>
									<MenuTrigger asChild>
										<Button
											appearance="primary"
											size="lg"
											icon={<IconChevronDown size={16} />}
											iconPosition="end"
										>
											Create
										</Button>
									</MenuTrigger>
									<MenuContent />
								</Menu>
							</Box>
						</Box>

						<Table style={{ width: "100%" }}>
							<thead>
								<Tr>
									<Th
										style={{ width: "40%", cursor: "pointer", userSelect: "none" }}
										onClick={() => handleSort("name")}
									>
										<Box display="inline-flex" alignItems="center" gap="4">
											Name
											{sortColumn === "name" && (
												<IconSortSolid size={12} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
											)}
										</Box>
									</Th>
									<Th
										style={{ width: "18%", cursor: "pointer", userSelect: "none" }}
										onClick={() => handleSort("type")}
									>
										<Box display="inline-flex" alignItems="center" gap="4">
											Type
											{sortColumn === "type" && (
												<IconSortSolid size={12} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
											)}
										</Box>
									</Th>
									<Th
										style={{ width: "14%", cursor: "pointer", userSelect: "none" }}
										onClick={() => handleSort("status")}
									>
										<Box display="inline-flex" alignItems="center" gap="4">
											Status
											{sortColumn === "status" && (
												<IconSortSolid size={12} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
											)}
										</Box>
									</Th>
									<Th
										style={{ width: "18%", cursor: "pointer", userSelect: "none" }}
										onClick={() => handleSort("modified")}
									>
										<Box display="inline-flex" alignItems="center" gap="4">
											Modified
											{sortColumn === "modified" && (
												<IconSortSolid size={12} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
											)}
										</Box>
									</Th>
									<Th style={{ width: "120px" }} />
								</Tr>
							</thead>
							<tbody>
								{sorted.map((opt) => (
									<Tr key={opt.id} url={`/web-experimentation/optimizations/${opt.id}`}>
										<Td style={{ borderRight: "none", width: "40%" }}>
											<Box display="flex" flexDirection="column" gap="2">
												<AxiomText fontSize="sm" fontWeight="500" color="fg.default">
													{opt.name}
												</AxiomText>
												{opt.description ? (
													<AxiomText fontSize="xs" color="fg.secondary">
														{opt.description}
													</AxiomText>
												) : null}
											</Box>
										</Td>
										<Td style={{ width: "18%" }}>
											<AxiomText fontSize="sm" color="fg.secondary">
												{opt.type}
											</AxiomText>
										</Td>
										<Td style={{ width: "14%" }}>
											<Badge
												size="sm"
												variant="subtle"
												intent={statusIntent(opt.status)}
												style={{
													display: "inline-flex",
													justifyContent: "center",
													alignItems: "center",
													textAlign: "center",
													width: "fit-content",
													minWidth: "unset",
													whiteSpace: "nowrap",
												}}
											>
												{opt.status}
											</Badge>
										</Td>
										<Td style={{ width: "18%" }}>
											<AxiomText fontSize="sm" color="fg.secondary">
												{opt.modified}
											</AxiomText>
										</Td>
										<Td style={{ borderLeft: "none", width: "120px" }}>
											<Box display="flex" gap="8" alignItems="center" onClick={(e) => e.stopPropagation()}>
												<Button
													appearance="subtle"
													size="sm"
													icon={<IconChartColumn size={16} />}
													aria-label="View results"
													style={{ width: 56 }}
													onClick={() => router.push(`/web-experimentation/optimizations/${opt.id}/results`)}
												/>
												<Menu
													options={[
														{ label: "Edit", execute: () => {} },
														{ label: "Duplicate", execute: () => {} },
														{
															label: "Archive",
															execute: () => setArchiveTarget(opt),
														},
													]}
												>
													<MenuTrigger asChild>
														<Button
															appearance="subtle"
															size="sm"
															icon={<IconDots size={16} />}
															aria-label="More actions"
															style={{ width: 56 }}
														/>
													</MenuTrigger>
													<MenuContent />
												</Menu>
											</Box>
										</Td>
									</Tr>
								))}
							</tbody>
						</Table>
					</Box>
				</TabsContent>

				<TabsContent value="experiments">
					<Box p="24" mt="24">
						<AxiomText color="fg.secondary">Experiments view — same table filtered by experiments.</AxiomText>
					</Box>
				</TabsContent>
				<TabsContent value="personalization">
					<Box p="24" mt="24">
						<AxiomText color="fg.secondary">
							Personalization Campaigns view — same table filtered by campaigns.
						</AxiomText>
					</Box>
				</TabsContent>
				<TabsContent value="exclusion">
					<Box p="24" mt="24">
						<AxiomText color="fg.secondary">Exclusion Groups view — manage exclusion groups.</AxiomText>
					</Box>
				</TabsContent>
			</Tabs>

			<AlertDialog
				open={archiveTarget != null}
				onOpenChange={(open) => {
					if (!open) setArchiveTarget(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>Archive experiment?</AlertDialogHeader>
					<AlertDialogBody>
						{archiveTarget ? (
							<>
								<AxiomText display="block" mb="8">
									This will remove{" "}
									<AxiomText asChild fontWeight="600" color="fg.default">
										<span>{archiveTarget.name}</span>
									</AxiomText>{" "}
									from your optimizations list. You can’t undo this in this demo.
								</AxiomText>
							</>
						) : null}
					</AlertDialogBody>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							appearance="danger"
							onClick={() => {
								if (!archiveTarget) return;
								removeDynamicOptimization(archiveTarget.id);
								clearStoredExtraVariations(archiveTarget.id);
								setRemovedOptimizationIds((prev) =>
									prev.includes(archiveTarget.id) ? prev : [...prev, archiveTarget.id],
								);
								setArchiveTarget(null);
							}}
						>
							Archive
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Box>
	);
}
