"use client";

import {
	Box,
	Badge,
	Card,
	Disclosure,
	DisclosureTrigger,
	DisclosureContent,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
	Menu,
	MenuTrigger,
	MenuContent,
	LabelMenuButton,
	SearchInput,
	Text as AxiomText,
	Textarea,
} from "@optiaxiom/react";
import { useState, useMemo, useRef, useEffect, useCallback, Fragment } from "react";
import { useLayout } from "@/app/context/LayoutContext";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
	mockProgramSnapshot,
	getProgramHealth,
	mockLearnings,
	mockOpportunities,
} from "./mockData";
import type { TimeRange, SnapshotExperiment, Opportunity, LearningsPeriod } from "./types";

const LEARNINGS_PERIOD_LABELS: Record<LearningsPeriod, string> = {
	"30d": "Last 30 days",
	"3mo": "Last 3 months",
	"6mo": "Last 6 months",
	"1y": "Last year",
	all: "All",
};

function learningMatchesPeriod(lastActivityAt: string, period: LearningsPeriod, now: Date): boolean {
	if (period === "all") return true;
	const t = new Date(lastActivityAt).getTime();
	const msPerDay = 1000 * 60 * 60 * 24;
	const daysAgo = (now.getTime() - t) / msPerDay;
	if (daysAgo < 0) return false;
	const maxDays = period === "30d" ? 30 : period === "3mo" ? 90 : period === "6mo" ? 180 : 365;
	return daysAgo <= maxDays;
}
<<<<<<< HEAD
import {
	IconAlertTriangle,
	IconClock,
	IconBulb,
	IconTarget,
	IconChartBar,
	IconFileText,
	IconUsers,
	IconSearch,
	IconMicrophone,
	IconChevronLeft,
	IconChevronRight,
	IconChevronDown,
} from "@tabler/icons-react";
=======
import {IconTriangleExclamation, IconClock, IconBulb, IconTarget, IconChartColumn as IconChartBar, IconFileLines, IconUsers, IconSearch, IconMicrophone, IconChevronLeft, IconChevronRight, IconChevronDown} from "@/app/lib/axiom-icons";
>>>>>>> origin/main
import {
	IconChartColumn,
	IconDownload,
	IconShareNodes,
	IconEllipsisStroke,
} from "@optimizely/axiom-icons";
import Link from "next/link";

const CARD_WIDTH = 300;
const CARD_GAP = 16;
const CAROUSEL_STEP = CARD_WIDTH + CARD_GAP;

function OpportunitiesCarousel({ opportunities }: { opportunities: Opportunity[] }) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(true);

	const updateScrollState = useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;
		setCanScrollLeft(el.scrollLeft > 2);
		setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
	}, []);

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		updateScrollState();
		const onScroll = () => updateScrollState();
		el.addEventListener("scroll", onScroll);
		return () => el.removeEventListener("scroll", onScroll);
	}, [opportunities.length, updateScrollState]);

	const scroll = (direction: "left" | "right") => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollBy({ left: direction === "left" ? -CAROUSEL_STEP : CAROUSEL_STEP, behavior: "smooth" });
	};

	return (
		<Box display="flex" flexDirection="column" gap="24" w="full">
			<Box display="flex" flexDirection="column" gap="12">
				<Box display="flex" alignItems="center" justifyContent="space-between" gap="8">
					<Text fontSize="lg" fontWeight="600" color="fg.default">
						Opportunities
					</Text>
					<Box display="flex" gap="4">
						<Button
							appearance="subtle"
							size="sm"
							icon={<IconChevronLeft size={16} />}
							onClick={() => scroll("left")}
							disabled={!canScrollLeft}
							aria-label="Previous opportunity"
						/>
						<Button
							appearance="subtle"
							size="sm"
							icon={<IconChevronRight size={16} />}
							onClick={() => scroll("right")}
							disabled={!canScrollRight}
							aria-label="Next opportunity"
						/>
					</Box>
				</Box>
				<Box
					ref={scrollRef}
					display="flex"
					gap="16"
					w="full"
					overflowX="auto"
					overflowY="hidden"
					py="8"
					style={{
						scrollSnapType: "x mandatory",
						scrollBehavior: "smooth",
						WebkitOverflowScrolling: "touch",
					}}
					className="scrollbar-hide"
				>
					{opportunities.map((o) => (
						<Card
							key={o.id}
							p="16"
							display="flex"
							flexDirection="column"
							gap="12"
							style={{
								flexShrink: 0,
								width: "300px",
								minWidth: "300px",
								scrollSnapAlign: "start",
							}}
						>
							<AxiomText fontSize="sm" fontWeight="600" display="block">
								{o.title}
							</AxiomText>
							<AxiomText fontSize="xs" color="fg.secondary">
								{o.dataSummary}
							</AxiomText>
							<AxiomText fontSize="xs" color="fg.secondary">
								<strong>Why it matters:</strong> {o.whyItMatters}
							</AxiomText>
							<Box
								display="flex"
								gap="8"
								flexWrap="wrap"
								style={{ marginTop: "auto", paddingBottom: 0 }}
							>
								<Menu
									options={[
										{ label: "Test Plan", execute: () => {} },
										{ label: "Variation", execute: () => {} },
									]}
								>
									<MenuTrigger asChild>
										<Button
											appearance="default-opal"
											size="md"
											icon={<IconChevronDown size={16} />}
											iconPosition="end"
										>
											Build
										</Button>
									</MenuTrigger>
									<MenuContent />
								</Menu>
							</Box>
						</Card>
					))}
				</Box>
			</Box>
		</Box>
	);
}

function ExperimentTable({ experiments }: { experiments: SnapshotExperiment[] }) {
	if (experiments.length === 0) return null;
	return (
		<Table style={{ width: "100%" }}>
			<thead>
				<Tr>
					<Th style={{ width: "25%" }}>Name</Th>
					<Th style={{ width: "18%" }}>Start date</Th>
					<Th style={{ width: "22%" }}>Primary metric</Th>
					<Th style={{ width: "12%" }}>Duration</Th>
					<Th style={{ width: "12%" }}>Lift</Th>
					<Th style={{ width: "56px" }} />
				</Tr>
			</thead>
			<tbody>
				{experiments.map((exp) => (
					<Tr key={exp.id} url={exp.resultsUrl}>
						<Td style={{ borderRight: "none", width: "25%" }}>
							<Box display="flex" flexDirection="column" gap="4">
								<Link
									href={exp.resultsUrl}
									onClick={(e) => e.stopPropagation()}
									style={{ color: "var(--ax-colors-fg-default)", fontWeight: 500, textDecoration: "none" }}
								>
									{exp.name}
								</Link>
								{exp.description && (
									<AxiomText fontSize="xs" color="fg.tertiary" style={{ lineHeight: 1.4 }}>
										{exp.description}
									</AxiomText>
								)}
							</Box>
						</Td>
						<Td style={{ width: "18%" }}>{exp.startDate}</Td>
						<Td style={{ width: "22%" }}>{exp.primaryMetric}</Td>
						<Td style={{ width: "12%" }}>{exp.duration}</Td>
						<Td style={{ width: "12%" }}>{exp.lift}</Td>
						<Td style={{ borderLeft: "none", width: "56px" }}>
							<Link
								href={exp.resultsUrl}
								onClick={(e) => e.stopPropagation()}
								aria-label="View results"
								style={{ display: "inline-flex", alignItems: "center", color: "var(--ax-colors-fg-secondary)" }}
							>
								<IconChartColumn size={16} />
							</Link>
						</Td>
					</Tr>
				))}
			</tbody>
		</Table>
	);
}

type SnapshotOutcomeTab = "winning" | "losing" | "inconclusive" | "closeToSignificance" | "atRisk";

export default function ExperimentationHomePage() {
	const { setTitleActions } = useLayout();
	const [snapshotOutcomeTab, setSnapshotOutcomeTab] = useState<SnapshotOutcomeTab>("winning");
	const [healthTimeRange, setHealthTimeRange] = useState<TimeRange>("90");
	const [learningsSearch, setLearningsSearch] = useState("");
	const [learningsTagFilter, setLearningsTagFilter] = useState<string>("");
	const [learningsPeriodFilter, setLearningsPeriodFilter] = useState<LearningsPeriod>("all");
	const [expandedLearningId, setExpandedLearningId] = useState<string | null>(() => mockLearnings[0]?.id ?? null);

	useEffect(() => {
		setTitleActions(
			<Box display="flex" gap="8" style={{ gap: "8px" }}>
				<Button
					appearance="subtle"
					size="lg"
					icon={<IconDownload size={20} />}
					aria-label="Download"
				/>
				<Button
					appearance="subtle"
					size="lg"
					icon={<IconShareNodes size={20} />}
					aria-label="Share"
				/>
				<Button
					appearance="subtle"
					size="lg"
					icon={<IconEllipsisStroke size={20} />}
					aria-label="More options"
				/>
			</Box>,
		);
		return () => setTitleActions(null);
	}, [setTitleActions]);

	const snapshot = mockProgramSnapshot;

	const experimentIdToName = useMemo(() => {
		const map = new Map<string, string>();
		const add = (list: { id: string; name: string }[]) =>
			list.forEach((e) => map.set(e.id, e.name));
		add(snapshot.winningExperiments);
		add(snapshot.losingExperiments);
		add(snapshot.inconclusiveExperiments);
		add(snapshot.closeToSignificance);
		add(snapshot.atRisk);
		return map;
	}, [snapshot]);

	const experimentIdToResultUrl = useMemo(() => {
		const map = new Map<string, string>();
		const add = (list: { id: string; resultsUrl?: string }[]) =>
			list.forEach((e) => {
				if (e.resultsUrl) map.set(e.id, e.resultsUrl);
			});
		add(snapshot.winningExperiments);
		add(snapshot.losingExperiments);
		add(snapshot.inconclusiveExperiments);
		add(snapshot.closeToSignificance);
		add(snapshot.atRisk);
		return map;
	}, [snapshot]);

	const experimentIdToDescription = useMemo(() => {
		const map = new Map<string, string>();
		const add = (list: { id: string; description?: string }[]) =>
			list.forEach((e) => {
				if (e.description) map.set(e.id, e.description);
			});
		add(snapshot.winningExperiments);
		add(snapshot.losingExperiments);
		add(snapshot.inconclusiveExperiments);
		add(snapshot.closeToSignificance);
		add(snapshot.atRisk);
		return map;
	}, [snapshot]);

	const health = useMemo(() => getProgramHealth(healthTimeRange), [healthTimeRange]);

	const allTags = useMemo(() => {
		const set = new Set<string>();
		mockLearnings.forEach((l) => l.tags.forEach((t) => set.add(t)));
		return Array.from(set);
	}, []);

	const filteredLearnings = useMemo(() => {
		const now = new Date();
		return mockLearnings.filter((l) => {
			const matchSearch =
				!learningsSearch ||
				l.statement.toLowerCase().includes(learningsSearch.toLowerCase()) ||
				l.tags.some((t) => t.toLowerCase().includes(learningsSearch.toLowerCase()));
			const matchTag = !learningsTagFilter || l.tags.includes(learningsTagFilter);
			const matchPeriod = learningMatchesPeriod(l.lastActivityAt, learningsPeriodFilter, now);
			return matchSearch && matchTag && matchPeriod;
		});
	}, [learningsSearch, learningsTagFilter, learningsPeriodFilter]);

	/** Keep expanded row valid when filters hide the current learning */
	useEffect(() => {
		setExpandedLearningId((prev) => {
			if (filteredLearnings.some((l) => l.id === prev)) return prev;
			return filteredLearnings[0]?.id ?? null;
		});
	}, [filteredLearnings]);

	const [opalInputValue, setOpalInputValue] = useState("");
	const [opalInputFocused, setOpalInputFocused] = useState(false);
	const opalTextareaRef = useRef<HTMLTextAreaElement>(null);
	useEffect(() => {
		if (opalTextareaRef.current) {
			opalTextareaRef.current.style.height = "auto";
			opalTextareaRef.current.style.height = `${Math.min(opalTextareaRef.current.scrollHeight, window.innerHeight / 3)}px`;
		}
	}, [opalInputValue]);

	const opalPrimary = "#7C3AED";
	const opalFooterBg = "rgba(124, 58, 237, 0.06)";
	const opalCarouselRef = useRef<HTMLDivElement>(null);
	const opalSuggestions = [
		{
			icon: <IconTarget size={24} style={{ color: opalPrimary }} />,
			title: "Competitive analysis",
			description: "Analyze competitor positioning and find differentiation gaps.",
			prompt: "Help me run competitive analysis for [product/area]. I want to find untested messaging and differentiation opportunities.",
			href: "/web-experimentation/home/competitive-research",
		},
		{
<<<<<<< HEAD
			icon: <IconFileText size={24} style={{ color: opalPrimary }} />,
=======
			icon: <IconFileLines size={24} style={{ color: opalPrimary }} />,
>>>>>>> origin/main
			title: "Building hypothesis",
			description: "Draft a clear hypothesis with problem, audience, and expected impact.",
			prompt: "Help me build a hypothesis for [experiment idea]. Include problem statement, target audience, proposed change, and primary metric.",
			href: "/web-experimentation/home/hypothesis",
		},
		{
			icon: <IconBulb size={24} style={{ color: opalPrimary }} />,
			title: "Test ideas",
			description: "Get ranked ideas from context, drop-offs, and past experiments.",
			prompt: "Suggest test ideas based on our funnel drop-offs and past experiment learnings. Prioritize by impact and confidence.",
			href: "/web-experimentation",
		},
		{
			icon: <IconUsers size={24} style={{ color: opalPrimary }} />,
			title: "Building test plan",
			description: "Create an execution-ready test plan with variants and rollout.",
			prompt: "Help me create a test plan for [experiment]. Include variants, audience targeting, traffic allocation, and rollout steps.",
			href: "/web-experimentation/home/test-plan",
		},
		{
			icon: <IconChartBar size={24} style={{ color: opalPrimary }} />,
			title: "Success metrics assistant",
			description: "Define primary metric, guardrails, and sample size.",
			prompt: "Help me define success metrics for [experiment]. Suggest a primary metric, guardrail metrics, and sample size or duration.",
			href: "/web-experimentation/home/metrics",
		},
		{
			icon: <IconSearch size={24} style={{ color: opalPrimary }} />,
			title: "Review experiment results",
			description: "Interpret results, statistical significance, and next steps.",
			prompt: "Review my experiment results for [experiment name]. Help me interpret lift, confidence, and recommend next steps (ship, iterate, or kill).",
			href: "#",
		},
	];

	return (
		<Box display="flex" flexDirection="column" w="full" style={{ minHeight: 0, gap: "24px" }}>
			{/* 1. Program Snapshot */}
			<Box>
				<Text fontSize="lg" fontWeight="600" color="fg.default" mb="16">
					Program Snapshot
				</Text>
				<Box display="flex" flexDirection="column" gap="16">
					{/* Active count + Win rate */}
					<Box display="flex" flexWrap="wrap" gap="16">
						<Card p="16" style={{ minWidth: "140px" }}>
							<AxiomText fontSize="xs" color="fg.tertiary">
								Active experiments
							</AxiomText>
							<AxiomText fontSize="xl" fontWeight="600">
								{snapshot.activeCount}
							</AxiomText>
						</Card>
						<Card p="16" style={{ minWidth: "140px" }}>
							<AxiomText fontSize="xs" color="fg.tertiary">
								Win rate (overall)
							</AxiomText>
							<AxiomText fontSize="xl" fontWeight="600">
								{snapshot.winRateOverall}%
							</AxiomText>
						</Card>
						<Card p="16" style={{ minWidth: "140px" }}>
							<AxiomText fontSize="xs" color="fg.tertiary">
								Win rate (this week)
							</AxiomText>
							<AxiomText fontSize="xl" fontWeight="600">
								{snapshot.winRateThisWeek}%
							</AxiomText>
						</Card>
						<Card p="16" style={{ minWidth: "140px" }}>
							<AxiomText fontSize="xs" color="fg.tertiary">
								Avg lift (winners)
							</AxiomText>
							<AxiomText fontSize="xl" fontWeight="600">
								{health.avgLiftWinners}%
							</AxiomText>
						</Card>
					</Box>

					{/* Winning / Losing / Inconclusive tables (tabs) */}
					<Tabs value={snapshotOutcomeTab} onValueChange={(v) => setSnapshotOutcomeTab(v as SnapshotOutcomeTab)}>
						<TabsList mb="16" w="full">
							<TabsTrigger value="winning">
								<Box display="flex" gap="8" alignItems="center">
									<span>Winning</span>
									<Badge
										intent="neutral"
										size="sm"
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											minWidth: "20px",
										}}
									>
										{snapshot.winningExperiments.length}
									</Badge>
								</Box>
							</TabsTrigger>
							<TabsTrigger value="losing">
								<Box display="flex" gap="8" alignItems="center">
									<span>Losing</span>
									<Badge
										intent="neutral"
										size="sm"
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											minWidth: "20px",
										}}
									>
										{snapshot.losingExperiments.length}
									</Badge>
								</Box>
							</TabsTrigger>
							<TabsTrigger value="inconclusive">
								<Box display="flex" gap="8" alignItems="center">
									<span>Inconclusive</span>
									<Badge
										intent="neutral"
										size="sm"
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											minWidth: "20px",
										}}
									>
										{snapshot.inconclusiveExperiments.length}
									</Badge>
								</Box>
							</TabsTrigger>
							<TabsTrigger value="closeToSignificance">
								<Box display="flex" gap="8" alignItems="center">
									<span>Close to significance</span>
									<Badge
										intent="neutral"
										size="sm"
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											minWidth: "20px",
										}}
									>
										{snapshot.closeToSignificance.length}
									</Badge>
								</Box>
							</TabsTrigger>
							<TabsTrigger value="atRisk">
								<Box display="flex" gap="8" alignItems="center">
									<span>At Risk</span>
									<Badge
										intent="neutral"
										size="sm"
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											minWidth: "20px",
										}}
									>
										{snapshot.atRisk.length}
									</Badge>
								</Box>
							</TabsTrigger>
						</TabsList>
						<TabsContent value="winning">
							<ExperimentTable experiments={snapshot.winningExperiments} />
						</TabsContent>
						<TabsContent value="losing">
							<ExperimentTable experiments={snapshot.losingExperiments} />
						</TabsContent>
						<TabsContent value="inconclusive">
							<ExperimentTable experiments={snapshot.inconclusiveExperiments} />
						</TabsContent>
						<TabsContent value="closeToSignificance">
							{snapshot.closeToSignificance.length === 0 ? null : (
								<Table style={{ width: "100%" }}>
									<thead>
										<Tr>
											<Th style={{ width: "25%" }}>Name</Th>
											<Th style={{ width: "18%" }}>Start date</Th>
											<Th style={{ width: "22%" }}>Primary metric</Th>
											<Th style={{ width: "12%" }}>Duration</Th>
											<Th style={{ width: "10%" }}>Days left</Th>
											<Th style={{ width: "10%" }}>Confidence</Th>
											<Th style={{ width: "56px" }} />
										</Tr>
									</thead>
									<tbody>
										{snapshot.closeToSignificance.map((e) => (
											<Tr key={e.id} url={e.resultsUrl}>
												<Td style={{ borderRight: "none", width: "25%" }}>
													<Box display="flex" flexDirection="column" gap="4">
														<Link
															href={e.resultsUrl}
															onClick={(ev) => ev.stopPropagation()}
															style={{ color: "var(--ax-colors-fg-default)", fontWeight: 500, textDecoration: "none" }}
														>
															{e.name}
														</Link>
														{e.description && (
															<AxiomText fontSize="xs" color="fg.tertiary" style={{ lineHeight: 1.4 }}>
																{e.description}
															</AxiomText>
														)}
													</Box>
												</Td>
												<Td style={{ width: "18%" }}>{e.startDate}</Td>
												<Td style={{ width: "22%" }}>{e.primaryMetric}</Td>
												<Td style={{ width: "12%" }}>{e.duration}</Td>
												<Td style={{ width: "10%" }}>
													<AxiomText fontSize="sm" color="fg.secondary">
														~{e.daysRemaining} days
													</AxiomText>
												</Td>
												<Td style={{ width: "10%" }}>
													<AxiomText fontSize="sm" color="fg.tertiary">
														{e.confidenceCurrent}%
													</AxiomText>
												</Td>
												<Td style={{ borderLeft: "none", width: "56px" }}>
													<Link
														href={e.resultsUrl}
														onClick={(ev) => ev.stopPropagation()}
														aria-label="View results"
														style={{ display: "inline-flex", alignItems: "center", color: "var(--ax-colors-fg-secondary)" }}
													>
														<IconChartColumn size={16} />
													</Link>
												</Td>
											</Tr>
										))}
									</tbody>
								</Table>
							)}
						</TabsContent>
						<TabsContent value="atRisk">
							{snapshot.atRisk.length === 0 ? null : (
								<Table style={{ width: "100%" }}>
									<thead>
										<Tr>
											<Th style={{ width: "25%" }}>Name</Th>
											<Th style={{ width: "18%" }}>Start date</Th>
											<Th style={{ width: "22%" }}>Primary metric</Th>
											<Th style={{ width: "12%" }}>Duration</Th>
											<Th style={{ width: "10%" }}>Reason</Th>
											<Th style={{ width: "10%" }}>Suggested action</Th>
											<Th style={{ width: "56px" }} />
										</Tr>
									</thead>
									<tbody>
										{snapshot.atRisk.map((e) => (
											<Tr key={e.id} url={e.resultsUrl}>
												<Td style={{ borderRight: "none", width: "25%" }}>
													<Box display="flex" flexDirection="column" gap="4">
														<Link
															href={e.resultsUrl}
															onClick={(ev) => ev.stopPropagation()}
															style={{ color: "var(--ax-colors-fg-default)", fontWeight: 500, textDecoration: "none" }}
														>
															{e.name}
														</Link>
														{e.description && (
															<AxiomText fontSize="xs" color="fg.tertiary" style={{ lineHeight: 1.4 }}>
																{e.description}
															</AxiomText>
														)}
													</Box>
												</Td>
												<Td style={{ width: "18%" }}>{e.startDate}</Td>
												<Td style={{ width: "22%" }}>{e.primaryMetric}</Td>
												<Td style={{ width: "12%" }}>{e.duration}</Td>
												<Td style={{ width: "10%" }}>
													<AxiomText fontSize="sm" color="fg.secondary">
														{e.reason.replace(/_/g, " ")}
													</AxiomText>
												</Td>
												<Td style={{ width: "10%" }}>
													<AxiomText fontSize="sm" color="fg.secondary">
														{e.suggestedAction}
													</AxiomText>
												</Td>
												<Td style={{ borderLeft: "none", width: "56px" }}>
													<Link
														href={e.resultsUrl}
														onClick={(ev) => ev.stopPropagation()}
														aria-label="View results"
														style={{ display: "inline-flex", alignItems: "center", color: "var(--ax-colors-fg-secondary)" }}
													>
														<IconChartColumn size={16} />
													</Link>
												</Td>
											</Tr>
										))}
									</tbody>
								</Table>
							)}
						</TabsContent>
					</Tabs>
				</Box>
			</Box>

			<OpportunitiesCarousel opportunities={mockOpportunities} />

			{/* Learnings */}
			<Box display="flex" flexDirection="column" gap="16" w="full">
				<Text fontSize="lg" fontWeight="600" color="fg.default" mb="16">
					Learnings
				</Text>
				<Box display="flex" gap="16" flexWrap="wrap" alignItems="center">
					<Box style={{ width: "280px", minWidth: "280px" }}>
						<SearchInput
							size="lg"
							placeholder="Search learnings"
							value={learningsSearch}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLearningsSearch(e.target.value)}
						/>
					</Box>
					<Menu
						options={[
							{ label: "All", execute: () => setLearningsTagFilter("") },
							...allTags.map((t) => ({ label: t, execute: () => setLearningsTagFilter(t) })),
						]}
					>
						<MenuTrigger asChild>
							<LabelMenuButton label="Tags">{learningsTagFilter || "All"}</LabelMenuButton>
						</MenuTrigger>
						<MenuContent />
					</Menu>
					<Menu
						options={[
							{ label: LEARNINGS_PERIOD_LABELS["30d"], execute: () => setLearningsPeriodFilter("30d") },
							{ label: LEARNINGS_PERIOD_LABELS["3mo"], execute: () => setLearningsPeriodFilter("3mo") },
							{ label: LEARNINGS_PERIOD_LABELS["6mo"], execute: () => setLearningsPeriodFilter("6mo") },
							{ label: LEARNINGS_PERIOD_LABELS["1y"], execute: () => setLearningsPeriodFilter("1y") },
							{ label: LEARNINGS_PERIOD_LABELS.all, execute: () => setLearningsPeriodFilter("all") },
						]}
					>
						<MenuTrigger asChild>
							<LabelMenuButton label="Date Range">
								{LEARNINGS_PERIOD_LABELS[learningsPeriodFilter]}
							</LabelMenuButton>
						</MenuTrigger>
						<MenuContent />
					</Menu>
				</Box>
				<Table style={{ width: "100%" }}>
					<thead>
						<Tr>
							<Th style={{ width: "38%" }}>Key Learnings</Th>
							<Th style={{ width: "20%" }}>Tags</Th>
							<Th style={{ width: "16%" }}>Experiments</Th>
							<Th style={{ width: "26%" }} />
						</Tr>
					</thead>
					<tbody>
						{filteredLearnings.map((l) => {
							const isExpanded = expandedLearningId === l.id;
							const runs =
								l.experimentsByRun ??
								l.relatedExperimentIds.map((experimentId) => ({
									experimentId,
									keyLearnings: [] as string[],
									tags: undefined as string[] | undefined,
								}));
							const expandRowCount = runs.length;
							/** Match parent <Td> padding (p-4) so columns align with the row above */
							const baseTd = {
								padding: "16px",
								borderTop: "1px solid var(--ax-colors-border-tertiary)",
								verticalAlign: "top" as const,
								borderColor: "var(--ax-colors-border-tertiary)",
							};
							return (
								<Fragment key={l.id}>
									<Tr onClick={() => setExpandedLearningId(isExpanded ? null : l.id)}>
										<Td style={{ borderRight: "none", width: "38%" }}>
											<Box display="flex" alignItems="center" gap="8" style={{ minWidth: 0 }}>
												<Box display="flex" alignItems="center" style={{ flexShrink: 0 }}>
													<Button
														size="sm"
														appearance="subtle"
														icon={
															isExpanded ? (
																<IconChevronDown size={16} />
															) : (
																<IconChevronRight size={16} />
															)
														}
														aria-label={isExpanded ? "Collapse row" : "Expand row"}
													/>
												</Box>
												{l.statement}
											</Box>
										</Td>
										<Td style={{ width: "20%" }}>
											<Box display="flex" gap="6" flexWrap="wrap" alignItems="center" style={{ minWidth: 0 }}>
												{l.tags.map((t) => (
													<Badge
														key={t}
														size="sm"
														variant="subtle"
														style={{
															width: "fit-content",
															minWidth: "unset",
															whiteSpace: "nowrap",
															display: "inline-flex",
															alignItems: "center",
															justifyContent: "center",
															textAlign: "center",
														}}
													>
														{t}
													</Badge>
												))}
											</Box>
										</Td>
										<Td style={{ width: "16%" }}>
											<AxiomText fontSize="sm" color="fg.default">
												{l.relatedExperimentIds.length}
											</AxiomText>
										</Td>
										<Td style={{ borderLeft: "none", width: "26%" }}>
											<Box
												display="flex"
												justifyContent="flex-end"
												w="full"
												onClick={(e) => e.stopPropagation()}
											>
												<Button appearance="default-opal" size="md">
													Get Test Ideas
												</Button>
											</Box>
										</Td>
									</Tr>
									{isExpanded &&
										(expandRowCount > 0 ? (
											runs.map((run, i) => {
												const expId = run.experimentId;
												const name = experimentIdToName.get(expId) ?? expId;
												const resultsUrl = experimentIdToResultUrl.get(expId);
												const description = experimentIdToDescription.get(expId);
												const runTags = run.tags?.length ? run.tags : l.tags;
												const bullets =
													run.keyLearnings.length > 0
														? run.keyLearnings
														: ["No per-run key learnings captured for this test."];
												return (
													<tr
														key={`${l.id}-${expId}-${i}`}
														style={{ backgroundColor: "var(--ax-colors-bg-secondary)" }}
													>
														<td style={{ width: "38%", ...baseTd }}>
															{/*
																40px = same inset as parent row text (sm icon-only expand control ~32px + gap 8px).
															*/}
															<Box style={{ paddingLeft: 40, minWidth: 0 }}>
																<ul
																	style={{
																		margin: 0,
																		paddingLeft: 0,
																		listStylePosition: "inside",
																		fontSize: "var(--ax-font-sizes-sm)",
																		color: "var(--ax-colors-fg-secondary)",
																	}}
																>
																	{bullets.map((line, li) => (
																		<li key={li} style={{ marginBottom: 4, paddingLeft: 0 }}>
																			{line}
																		</li>
																	))}
																</ul>
															</Box>
														</td>
														<td style={{ width: "20%", ...baseTd }}>
															<Box display="flex" gap="6" flexWrap="wrap" alignItems="center" style={{ minWidth: 0 }}>
																{runTags.map((t) => (
																	<Badge
																		key={t}
																		size="sm"
																		variant="subtle"
																		style={{
																			width: "fit-content",
																			minWidth: "unset",
																			whiteSpace: "nowrap",
																			display: "inline-flex",
																			alignItems: "center",
																			justifyContent: "center",
																			textAlign: "center",
																		}}
																	>
																		{t}
																	</Badge>
																))}
															</Box>
														</td>
														<td style={{ width: "16%", ...baseTd }}>
															<Box
																display="flex"
																flexDirection="column"
																gap="4"
																style={{ minWidth: 0 }}
																onClick={(e) => e.stopPropagation()}
															>
																{resultsUrl ? (
																	<Link
																		href={resultsUrl}
																		onClick={(e) => e.stopPropagation()}
																		style={{
																			color: "var(--ax-colors-fg-default)",
																			fontWeight: 500,
																			textDecoration: "none",
																		}}
																	>
																		{name}
																	</Link>
																) : (
																	<AxiomText fontWeight="500" color="fg.default" style={{ margin: 0 }}>
																		{name}
																	</AxiomText>
																)}
																{description ? (
																	<AxiomText fontSize="xs" color="fg.tertiary" style={{ lineHeight: 1.4 }}>
																		{description}
																	</AxiomText>
																) : null}
															</Box>
														</td>
														<td style={{ width: "26%", ...baseTd }} />
													</tr>
												);
											})
										) : (
											<tr style={{ backgroundColor: "var(--ax-colors-bg-secondary)" }}>
												<td
													colSpan={4}
													style={{
														padding: "12px 16px",
														borderTop: "1px solid var(--ax-colors-border-tertiary)",
														verticalAlign: "middle",
														fontSize: "var(--ax-font-sizes-sm)",
														color: "var(--ax-colors-fg-tertiary)",
													}}
												>
													No experiments
												</td>
											</tr>
										))}
								</Fragment>
							);
						})}
					</tbody>
				</Table>
			</Box>

			{/* Footer: Ask Opal for anything — subtle moving gradient, aligned to bottom */}
			<Box
				mt="32"
				pt="32"
				pb="24"
				px="24"
				w="full"
				display="flex"
				flexDirection="column"
				alignItems="center"
				gap="24"
				className="opal-footer-gradient-bg"
				style={{
					width: "100%",
					borderTop: "1px solid var(--ax-colors-border-tertiary)",
					borderRadius: "16px 16px 0 0",
				}}
			>
				<AxiomText asChild fontSize="xl" fontWeight="600" color="fg.default">
					<span>Ask Opal for anything</span>
				</AxiomText>
				<Box
					w="full"
					style={{
						maxWidth: "800px",
						position: "relative",
						borderColor: opalInputFocused ? opalPrimary : undefined,
						transition: "border-color 0.2s ease-in-out",
					}}
					bg="bg.default"
					px="16"
					py="4"
					rounded="lg"
					border="1"
					borderColor={opalInputFocused ? undefined : "border.tertiary"}
					shadow="sm"
				>
					<Textarea
						ref={opalTextareaRef}
						className="w-full text-md outline-none bg-transparent resize-none"
						placeholder='Ask Opal anything—e.g. "Suggest test ideas" or "Help me build a hypothesis"'
						value={opalInputValue}
						onFocus={() => setOpalInputFocused(true)}
						onBlur={() => setOpalInputFocused(false)}
						onChange={(e) => setOpalInputValue(e.target.value)}
						rows={1}
						style={{
							minHeight: "22px",
							maxHeight: "33vh",
							border: "none",
							padding: 0,
							paddingBottom: "32px",
							overflowY: "auto",
							boxShadow: "none",
							outline: "none",
							backgroundColor: "transparent",
						}}
					/>
					<Box
						display="flex"
						justifyContent="flex-end"
						alignItems="center"
						style={{
							position: "absolute",
							bottom: "4px",
							left: "16px",
							right: "16px",
							pointerEvents: "none",
							zIndex: 10,
						}}
					>
						<Box style={{ pointerEvents: "auto" }}>
							<Button
								appearance="primary"
								size="md"
								icon={<IconMicrophone size={18} />}
								rounded="full"
								aria-label="Voice input"
								style={{ backgroundColor: opalPrimary }}
							/>
						</Box>
					</Box>
				</Box>
				<Box w="full" display="flex" flexDirection="column" gap="12" alignItems="center">
					<Box
						ref={opalCarouselRef}
						display="flex"
						gap="16"
						w="full"
						overflowX="auto"
						overflowY="hidden"
						py="8"
						style={{
							scrollSnapType: "x mandatory",
							scrollBehavior: "smooth",
							WebkitOverflowScrolling: "touch",
							scrollbarWidth: "thin",
						}}
						className="axiom-scrollbar"
					>
						{opalSuggestions.map((card, index) => (
							<Box
								key={index}
								p="24"
								border="1"
								borderColor="border.tertiary"
								rounded="lg"
								bg="bg.default"
								display="flex"
								flexDirection="column"
								gap="12"
								style={{
									flexShrink: 0,
									width: "268px",
									minWidth: "268px",
									scrollSnapAlign: "start",
								}}
								className="hover:border-[var(--ax-colors-border-secondary)] cursor-pointer transition-colors"
								onClick={() => setOpalInputValue(card.prompt)}
							>
								<Box display="flex" justifyContent="flex-end" mb="4">
									{card.icon}
								</Box>
								<AxiomText asChild fontSize="lg" fontWeight="600" color="fg.default">
									<span>{card.title}</span>
								</AxiomText>
								<AxiomText fontSize="md" color="fg.secondary">
									{card.description}
								</AxiomText>
							</Box>
						))}
					</Box>
					<Link href="/web-experimentation" style={{ textDecoration: "none" }}>
						<Button appearance="subtle" size="md">
							See more &gt;
						</Button>
					</Link>
				</Box>
			</Box>
		</Box>
	);
}
