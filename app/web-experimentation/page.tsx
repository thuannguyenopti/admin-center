"use client";

import {
	Box,
	Badge,
	Card,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogBody,
	DialogFooter,
	DialogClose,
	Disclosure,
	DisclosureContent,
	DisclosureTrigger,
	Field,
	Select,
	SelectTrigger,
	SelectContent,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
	Textarea,
	Text as AxiomText,
	SearchInput,
	Skeleton,
} from "@optiaxiom/react";
import {useState, useRef, useEffect, type ChangeEvent} from "react";
import {Button} from "@/app/components/Button";
import {Input} from "@/app/components/Input";
import {Flex} from "@/app/components/Flex";
import {Text} from "@/app/components/Text";
import {Table, Tr, Th, Td} from "@/app/components/Table";
import {mockAudiences, Audience} from "@/app/web-experimentation/saved/mockData";
import {useOpalPanelActions} from "@/app/context/OpalPanelActionsContext";
import type {ExperimentCreationAgentPayload} from "@/app/components/Opal/experimentCreationAgentTypes";
import {
	IconPlus,
	IconTrash,
	IconSearch,
	IconChevronDown,
	IconDots,
	IconX,
} from "@tabler/icons-react";
import {IconAgent, IconFolderArrowDown, IconSparkles} from "@optimizely/axiom-icons";
import Link from "next/link";
import {UploadContextDropZone} from "@/app/web-experimentation/UploadContextDropZone";
import {SavedPagesPicker} from "@/app/web-experimentation/SavedPagesPicker";
import {MOCK_SAVED_PAGES} from "@/app/web-experimentation/savedPagesMock";

type GeneratedTestIdea = {
	id: string;
	title: string;
	description: string;
	opportunity: string;
	hypothesis: string;
	whyThisWillWork: string;
	sources: string[];
};

const MOCK_GENERATED_TEST_IDEAS: GeneratedTestIdea[] = [
	{
		id: "gen-1",
		title: "Optimize Hero CTA Button",
		description:
			"Increase CTA visibility with a larger, higher contrast button and urgency driven copy to drive more clicks",
		opportunity:
			"62% of users abandon the form before completion (session recording data).",
		hypothesis:
			"Adding a sticky CTA bar that remains visible while scrolling on mobile will reduce friction in the conversion path and increase mobile conversion rate by making the action always accessible.",
		whyThisWillWork:
			"Based on past similar tests that showed 12% lift with larger CTAs, and heatmap data showing users focus on hero area but miss current Get Test Ideas. Industry best practices also suggest high-contrast CTAs perform 2x better.",
		sources: [
			"Past test: Larger CTA - 12% lift",
			"Heatmap analysis showing low CTA visibility",
			"Industry benchmark comparison",
		],
	},
	{
		id: "gen-2",
		title: "Add Social Proof Above Fold",
		description:
			"Build immediate trust with customer logos and testimonials displayed prominently on initial page view",
		opportunity:
			"New visitors scroll past the hero without seeing credibility signals, weakening motivation to register.",
		hypothesis:
			"Displaying recognizable customer logos and a short testimonial block immediately below the headline will increase trust and lift registration starts.",
		whyThisWillWork:
			"Qualitative feedback cites trust as a top barrier; similar programs report higher conversion when social proof is visible without scrolling.",
		sources: [
			"User interviews (n=12) on signup hesitation",
			"Scroll-depth analytics on landing page",
			"Competitor audit: proof placement patterns",
		],
	},
	{
		id: "gen-3",
		title: "Add Exit-Intent Popup",
		description: "Capture abandoning visitors with a popup offering a discount",
		opportunity:
			"High exit rate on pricing step suggests last-chance offers could recover sessions that would otherwise churn.",
		hypothesis:
			"Showing a limited-time discount in an exit-intent modal will increase return visits and completed registrations without hurting brand perception.",
		whyThisWillWork:
			"Exit-intent tests in comparable funnels often recover 3–8% of abandons; guardrails on frequency limit fatigue.",
		sources: [
			"Funnel drop-off report: pricing step",
			"Prior campaign: exit offer A/B summary",
			"Email promo performance benchmarks",
		],
	},
	{
		id: "gen-4",
		title: "Surface Registration Count in Header",
		description:
			"Show “X people registered” near the hero to build trust and encourage sign-ups",
		opportunity:
			"Users hesitate when they cannot tell if others are registering for the same event.",
		hypothesis:
			"Displaying a live or daily-updated registration count in the header will reduce uncertainty and increase sign-up rate.",
		whyThisWillWork:
			"Social proof counters are a lightweight change with consistent lifts in peer programs when numbers are credible and updated.",
		sources: [
			"Heatmap: attention on header area",
			"Survey: ‘social proof’ as decision factor",
			"Events industry case studies",
		],
	},
	{
		id: "gen-5",
		title: "Simplify Registration Form",
		description:
			"Reduce the number of required fields to lower friction and lift completion rates for event sign-ups",
		opportunity:
			"Long forms correlate with higher abandonment, especially on mobile where typing is costly.",
		hypothesis:
			"Collecting only name, email, and role on the first step—deferring optional questions—will increase form completion.",
		whyThisWillWork:
			"Field-reduction tests routinely improve completion; progressive profiling can capture the rest post-signup.",
		sources: [
			"Form analytics: per-field drop-off",
			"Mobile vs desktop completion split",
			"Internal guideline: progressive profiling",
		],
	},
];

const TARGET_BY_OPTIONS = [
	{ label: "URL", value: "url" },
	{ label: "Saved Pages", value: "saved-pages" },
	{ label: "Screenshot", value: "screenshot" },
];

function buildExperimentCreationPayload(
	idea: GeneratedTestIdea,
	targetByValue: string,
	urlList: string[],
	savedPageIds: string[],
	savedPagesSearch: string,
): ExperimentCreationAgentPayload {
	const targetByLabel =
		TARGET_BY_OPTIONS.find((o) => o.value === targetByValue)?.label ?? targetByValue;
	let urlPrefill = "";
	if (targetByValue === "url") {
		const parts = urlList.map((u) => u.trim()).filter(Boolean);
		urlPrefill = parts.length ? parts.join("\n") : "Add target URLs in Test Setup (none entered yet).";
	} else if (targetByValue === "saved-pages") {
		const names: string[] = [];
		for (const id of savedPageIds) {
			const p = MOCK_SAVED_PAGES.find((x) => x.id === id);
			if (p) names.push(p.name);
		}
		urlPrefill = names.length ? names.join(", ") : "Select saved pages below (none selected yet).";
	} else {
		urlPrefill = "Switch Target by to URL or Saved Pages to set a destination.";
	}

	return {
		intro:
			"The Experiment Creation agent is ready to draft your experiment from this test idea and the context you entered on the page. Fields below are prefilled—edit if needed, then run the agent.",
		name: idea.title,
		description: idea.description,
		hypothesis: idea.hypothesis,
		targetBy: targetByLabel === "Screenshot" ? "URL" : targetByLabel,
		url: urlPrefill,
		savedPagesCatalog: MOCK_SAVED_PAGES.map((p) => ({ ...p })),
		savedPagesSearchInitial: savedPagesSearch,
		savedPageIdsInitial: [...savedPageIds],
	};
}

function UrlListField({
	label,
	placeholder,
	value,
	onChange,
}: {
	label: string;
	placeholder: string;
	value: string[];
	onChange: (v: string[]) => void;
}) {
	const add = () => onChange([...value, ""]);
	const remove = (i: number) => {
		const next = value.filter((_, j) => j !== i);
		onChange(next.length > 0 ? next : [""]);
	};
	const set = (i: number, v: string) => {
		const next = [...value];
		next[i] = v;
		onChange(next);
	};
	return (
		<Field label={label}>
			<Box display="flex" flexDirection="column" gap="8" w="full">
				{value.map((url, i) => (
					<Box key={i} display="flex" gap="8" alignItems="center" w="full">
						<Box flex="1" style={{ minWidth: 0 }}>
							<Input
								placeholder={placeholder}
								value={url}
								onChange={(e) => set(i, e.target.value)}
								w="full"
							/>
						</Box>
						<Box display="flex" gap="8" style={{ flexShrink: 0 }}>
							{i === value.length - 1 && (
								<Button
									appearance="default"
									size="lg"
									icon={<IconPlus size={16} />}
									onClick={add}
									aria-label="Add"
								/>
							)}
							{value.length > 1 && (
								<Button
									appearance="default"
									size="lg"
									icon={<IconTrash size={16} />}
									onClick={() => remove(i)}
									aria-label="Remove"
								/>
							)}
						</Box>
					</Box>
				))}
			</Box>
		</Field>
	);
}

export default function WebExperimentationIdeasPage() {
	const [tab, setTab] = useState<"draft" | "saved">("draft");
	const [targetBy, setTargetBy] = useState<string>("url");
	const [hasRunGetTestIdeas, setHasRunGetTestIdeas] = useState(false);
	const [urls, setUrls] = useState<string[]>([""]);
	const [savedPagesSearch, setSavedPagesSearch] = useState("");
	const [selectedSavedPageIds, setSelectedSavedPageIds] = useState<string[]>([]);
	const [goal, setGoal] = useState("");
	const [researchNotes, setResearchNotes] = useState("");
	const [ga4Metrics, setGa4Metrics] = useState<string[]>(["", "", ""]);
	const [competitorUrls, setCompetitorUrls] = useState<string[]>(["", "", ""]);
	const [previousTestsSearch, setPreviousTestsSearch] = useState("");
	const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
	const [generatedTestIdeas, setGeneratedTestIdeas] = useState<GeneratedTestIdea[]>([]);
	const [testIdeasLoading, setTestIdeasLoading] = useState(false);
	const getTestIdeasTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const {openExperimentCreationAgent} = useOpalPanelActions();

	useEffect(() => {
		return () => {
			if (getTestIdeasTimeoutRef.current != null) {
				clearTimeout(getTestIdeasTimeoutRef.current);
			}
		};
	}, []);

	const selectedIdea = selectedIdeaId != null ? mockAudiences.find((a) => a.id === selectedIdeaId) : null;

	return (
		<Box display="flex" flexDirection="column" gap="0" w="full" style={{ minHeight: 0 }}>
			<Tabs value={tab} onValueChange={(v) => setTab(v as "draft" | "saved")}>
				<TabsList mb="16" w="full">
					<TabsTrigger value="draft">
						<Box display="flex" gap="8" alignItems="center">
							<span>Draft</span>
							<Badge
								size="sm"
								variant="subtle"
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									minWidth: "20px",
								}}
							>
								{testIdeasLoading ? 0 : generatedTestIdeas.length}
							</Badge>
						</Box>
					</TabsTrigger>
					<TabsTrigger value="saved">
						<Box display="flex" gap="8" alignItems="center">
							<span>Saved</span>
							<Badge
								size="sm"
								variant="subtle"
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									minWidth: "20px",
								}}
							>
								{mockAudiences.length}
							</Badge>
						</Box>
					</TabsTrigger>
				</TabsList>

				<Box display="flex" gap="24" w="full" flex="1" style={{ minWidth: 0, minHeight: 0 }}>
					<Box flex="1" display="flex" flexDirection="column" style={{ minWidth: 0, minHeight: 0 }}>
						<Box flex="1" overflow="auto" display="flex" flexDirection="column" style={{ minHeight: 0 }}>
							<TabsContent value="draft">
								<Card p="24" w="full">
									<Box mb="16" w="full">
										<AxiomText fontWeight="600">Context</AxiomText>
										<AxiomText fontSize="sm" color="fg.secondary" mt="4">
											Provide context to get experimentation suggestions.
										</AxiomText>
									</Box>

									{/* Test Setup */}
									<Box borderB="1" borderColor="border.tertiary" pb="16" w="full">
										<Disclosure defaultOpen>
											<DisclosureTrigger chevronPosition="start">
												<Box display="flex" flexDirection="column" style={{ gap: "4px" }} w="full">
													<AxiomText asChild fontSize="sm" fontWeight="600" color="fg.default">
														<span>Test Setup</span>
													</AxiomText>
													<AxiomText fontSize="sm" color="fg.secondary" mb="0">
														Define where the test runs and what you want to improve.
													</AxiomText>
												</Box>
											</DisclosureTrigger>
											<DisclosureContent asChild>
												<Box
													display="flex"
													flexDirection="column"
													gap="12"
													mt="12"
													w="full"
													style={{ paddingLeft: "24px" }}
												>
													<Field label="Target by">
														<Select
															value={targetBy}
															onValueChange={setTargetBy}
															options={TARGET_BY_OPTIONS}
														>
															<SelectTrigger placeholder="Select target type" size="lg" w="full">
																{TARGET_BY_OPTIONS.find((o) => o.value === targetBy)
																	?.label ?? "Select target type"}
															</SelectTrigger>
															<SelectContent />
														</Select>
													</Field>

													{targetBy === "saved-pages" ? (
														<SavedPagesPicker
															pages={MOCK_SAVED_PAGES}
															searchQuery={savedPagesSearch}
															onSearchChange={setSavedPagesSearch}
															selectedIds={selectedSavedPageIds}
															onChangeSelectedIds={setSelectedSavedPageIds}
														/>
													) : targetBy === "screenshot" ? (
														<UploadContextDropZone label="Screenshot" />
													) : (
														<UrlListField
															label="URL"
															placeholder="Add a URL"
															value={urls}
															onChange={setUrls}
														/>
													)}

													<Field label="Goal">
														<Textarea
															placeholder="What do you want to improve?"
															w="full"
															value={goal}
															onChange={(e) => setGoal((e.target as HTMLTextAreaElement).value)}
														/>
													</Field>
												</Box>
											</DisclosureContent>
								</Disclosure>
							</Box>

									{/* Research */}
									<Box borderB="1" borderColor="border.tertiary" py="16" w="full">
										<Disclosure>
											<DisclosureTrigger chevronPosition="start">
												<Box display="flex" flexDirection="column" style={{ gap: "4px" }} w="full">
													<AxiomText asChild fontSize="sm" fontWeight="600" color="fg.default">
														<span>Research</span>
													</AxiomText>
													<AxiomText fontSize="sm" color="fg.secondary" mb="0">
														Add qualitative insights or files to explain user behavior and problem
														areas.
													</AxiomText>
												</Box>
											</DisclosureTrigger>
											<DisclosureContent asChild>
												<Box
													display="flex"
													flexDirection="column"
													gap="12"
													mt="12"
													w="full"
													style={{ paddingLeft: "24px" }}
												>
													<UploadContextDropZone label="Additional context" />
													<Box w="full">
														<Textarea
															placeholder="Any other relevant information..."
															w="full"
															value={researchNotes}
															onChange={(e) =>
																setResearchNotes((e.target as HTMLTextAreaElement).value)
															}
														/>
													</Box>
												</Box>
											</DisclosureContent>
										</Disclosure>
									</Box>

									{/* Analytics */}
									<Box borderB="1" borderColor="border.tertiary" py="16" w="full">
										<Disclosure>
											<DisclosureTrigger chevronPosition="start">
												<Box display="flex" flexDirection="column" style={{ gap: "4px" }} w="full">
													<AxiomText asChild fontSize="sm" fontWeight="600" color="fg.default">
														<span>Analytics</span>
													</AxiomText>
													<AxiomText fontSize="sm" color="fg.secondary" mb="0">
														Reference GA4 metrics used to evaluate test outcomes.
													</AxiomText>
												</Box>
											</DisclosureTrigger>
											<DisclosureContent asChild>
												<Box
													display="flex"
													flexDirection="column"
													gap="12"
													mt="12"
													w="full"
													style={{ paddingLeft: "24px" }}
												>
													<UrlListField
														label="GA4 Metrics"
														placeholder="Add a Metric"
														value={ga4Metrics}
														onChange={setGa4Metrics}
													/>
													<AxiomText fontSize="sm" color="fg.secondary">
														Don&apos;t have GA4 connected?{" "}
														<Link
															href="#"
															style={{ color: "var(--ax-colors-fg-accent)", textDecoration: "underline" }}
														>
															Enable it
														</Link>{" "}
														to start pulling in your metrics.
													</AxiomText>
												</Box>
											</DisclosureContent>
										</Disclosure>
									</Box>

									{/* Sources */}
									<Box py="16" w="full">
										<Disclosure>
											<DisclosureTrigger chevronPosition="start">
												<Box display="flex" flexDirection="column" style={{ gap: "4px" }} w="full">
													<AxiomText asChild fontSize="sm" fontWeight="600" color="fg.default">
														<span>Sources</span>
													</AxiomText>
													<AxiomText fontSize="sm" color="fg.secondary" mb="0">
														Reference competitors and past tests to inform ideas and avoid
														duplication.
													</AxiomText>
												</Box>
											</DisclosureTrigger>
											<DisclosureContent asChild>
												<Box
													display="flex"
													flexDirection="column"
													gap="12"
													mt="12"
													w="full"
													style={{ paddingLeft: "24px" }}
												>
													<UrlListField
														label="Competitor URLs"
														placeholder="Add a URL"
														value={competitorUrls}
														onChange={setCompetitorUrls}
													/>
													<Field label="Previous Tests">
														<Box display="flex" gap="8" w="full">
															<Box flex="1" style={{ minWidth: 0 }}>
																<Input
																	placeholder="Search to add tests"
																	value={previousTestsSearch}
																	onChange={(e) => setPreviousTestsSearch(e.target.value)}
																	addonBefore={<IconSearch size={16} />}
																	w="full"
																/>
															</Box>
															<Button appearance="subtle" size="lg">
																Load previous tests
															</Button>
														</Box>
													</Field>
												</Box>
											</DisclosureContent>
										</Disclosure>
									</Box>

									<Box
										mt="16"
										pt="16"
										borderT="1"
										borderColor="border.secondary"
										w="full"
									>
										<Box display="flex" justifyContent="end" gap="8" w="full">
											<Button
												appearance="subtle"
												size="lg"
												onClick={() => {
													if (getTestIdeasTimeoutRef.current != null) {
														clearTimeout(getTestIdeasTimeoutRef.current);
														getTestIdeasTimeoutRef.current = null;
													}
													setTestIdeasLoading(false);
													setHasRunGetTestIdeas(false);
													setGeneratedTestIdeas([]);
													setUrls([""]);
													setSavedPagesSearch("");
													setSelectedSavedPageIds([]);
													setGoal("");
													setResearchNotes("");
													setGa4Metrics([""]);
													setCompetitorUrls([""]);
													setPreviousTestsSearch("");
												}}
											>
												Clear
											</Button>
											<Button
												appearance="primary-opal"
												size="lg"
												disabled={testIdeasLoading}
												onClick={() => {
													if (getTestIdeasTimeoutRef.current != null) {
														clearTimeout(getTestIdeasTimeoutRef.current);
													}
													setHasRunGetTestIdeas(true);
													setGeneratedTestIdeas([]);
													setTestIdeasLoading(true);
													getTestIdeasTimeoutRef.current = setTimeout(() => {
														setGeneratedTestIdeas([...MOCK_GENERATED_TEST_IDEAS]);
														setTestIdeasLoading(false);
														getTestIdeasTimeoutRef.current = null;
													}, 900);
												}}
											>
												Get Test Ideas
											</Button>
										</Box>
									</Box>
								</Card>
							</TabsContent>

							<TabsContent value="saved" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "visible" }}>
								<Box w="full" display="flex" flexDirection="column" gap="24" style={{ overflow: "visible" }}>
									<Box flex="1" style={{ maxWidth: "266px", padding: "2px" }}>
										<SearchInput
											size="lg"
											placeholder="Search"
											style={{ borderRadius: "6px" }}
											w="full"
										/>
									</Box>
									<Table>
										<thead>
											<Tr>
												<Th style={{ width: "95%" }}>
													<Flex gap="4" alignItems="center">
														<Text fontSize="md" color="fg.secondary" style={{ letterSpacing: "0.01px" }}>
															Name
														</Text>
														<IconChevronDown size={8} color="#66708c" />
													</Flex>
												</Th>
												<Th style={{ minWidth: "120px", width: "120px" }}>
													<Flex gap="4" alignItems="center">
														<Text fontSize="md" color="fg.secondary" style={{ letterSpacing: "0.01px" }}>
															Added
														</Text>
														<IconChevronDown size={8} color="#66708c" />
													</Flex>
												</Th>
												<Th style={{ width: "56px" }} />
											</Tr>
										</thead>
										<tbody>
											{mockAudiences.map((audience: Audience) => (
												<Tr
													key={audience.id}
													onClick={() => setSelectedIdeaId(audience.id)}
												>
													<Td type="header" description={audience.description} style={{ borderRight: "none" }}>
														{audience.name}
													</Td>
													<Td type="date">{audience.addedDate}</Td>
													<Td type="button" style={{ borderLeft: "none" }}>
														<div onClick={(e) => e.stopPropagation()}>
															<Button
																aria-label="Actions"
																size="md"
																icon={<IconDots size={16} />}
																appearance="subtle"
															/>
														</div>
													</Td>
												</Tr>
											))}
										</tbody>
									</Table>
								</Box>
							</TabsContent>
						</Box>
					</Box>

					{tab === "draft" && (
					<Box flex="1" display="flex" flexDirection="column" style={{ minWidth: 0, minHeight: 0 }}>
						<Box
							p="24"
							w="full"
							flex="1"
							display="flex"
							flexDirection="column"
							style={{ minHeight: 0 }}
						>
							<Box w="full">
								<AxiomText fontWeight="600">Test Ideas</AxiomText>
								<AxiomText fontSize="sm" color="fg.secondary" mt="4">
									List of test ideas based on your context
								</AxiomText>
							</Box>

							{testIdeasLoading ? (
								<Box
									flex="1"
									w="full"
									display="flex"
									flexDirection="column"
									overflow="auto"
									style={{ minHeight: 0 }}
									mt="16"
									gap="12"
								>
									{[0, 1, 2].map((i) => (
										<Card
											key={i}
											p="16"
											w="full"
											border="1"
											borderColor="border.tertiary"
											rounded="md"
											bg="bg.default"
										>
											<Box display="flex" flexDirection="column" style={{ gap: "8px" }} w="full" pl="24">
												<Skeleton
													h="16"
													className="opal-skeleton-shimmer"
													style={{ width: "52%", borderRadius: "4px" }}
												/>
												<Skeleton
													h="12"
													className="opal-skeleton-shimmer"
													style={{ width: "100%", borderRadius: "4px" }}
												/>
												<Skeleton
													h="12"
													className="opal-skeleton-shimmer"
													style={{ width: "78%", borderRadius: "4px" }}
												/>
											</Box>
										</Card>
									))}
								</Box>
							) : generatedTestIdeas.length === 0 ? (
								<Box
									flex="1"
									w="full"
									display="flex"
									flexDirection="column"
									alignItems="center"
									justifyContent="center"
									textAlign="center"
									px="24"
									style={{ minHeight: 0 }}
								>
									<AxiomText fontWeight="600" mb="4">
										{hasRunGetTestIdeas ? "No ideas left" : "No test ideas yet"}
									</AxiomText>
									<AxiomText color="fg.secondary">
										{hasRunGetTestIdeas
											? "Dismissed ideas are removed from this list. Run Get Test Ideas again to regenerate."
											: "Add context and click “Get Test Ideas” to get started."}
									</AxiomText>
								</Box>
							) : (
								<Box
									flex="1"
									w="full"
									display="flex"
									flexDirection="column"
									overflow="auto"
									style={{ minHeight: 0 }}
									mt="16"
									gap="12"
								>
									{generatedTestIdeas.map((idea) => {
										return (
											<Card
												key={idea.id}
												p="16"
												w="full"
												border="1"
												borderColor="border.tertiary"
												rounded="md"
												bg="bg.default"
											>
												<Box w="full" pr="32" mb="8" style={{ position: "relative" }}>
													<Box
														style={{ position: "absolute", top: 0, right: 0, zIndex: 1 }}
													>
														<Button
															type="button"
															appearance="subtle"
															size="md"
															icon={<IconX size={16} />}
															aria-label={`Dismiss ${idea.title}`}
															onClick={(e) => {
																e.stopPropagation();
																setGeneratedTestIdeas((prev) => prev.filter((x) => x.id !== idea.id));
															}}
														/>
													</Box>
													<Disclosure>
														<DisclosureTrigger chevronPosition="start">
															<Box display="flex" flexDirection="column" style={{ gap: "4px" }} w="full">
																<AxiomText
																	asChild
																	fontSize="sm"
																	fontWeight="600"
																	color="fg.default"
																	style={{
																		lineHeight: 1.15,
																		margin: 0,
																		padding: 0,
																		paddingRight: "8px",
																	}}
																>
																	<span>{idea.title}</span>
																</AxiomText>
																<AxiomText
																	fontSize="sm"
																	color="fg.secondary"
																	mb="0"
																	style={{
																		lineHeight: 1.35,
																		margin: 0,
																		padding: 0,
																	}}
																>
																	{idea.description}
																</AxiomText>
															</Box>
														</DisclosureTrigger>
														<DisclosureContent asChild>
															<Box
																display="flex"
																flexDirection="column"
																gap="16"
																mt="12"
																w="full"
																style={{ paddingLeft: "24px" }}
															>
																<Box>
																	<AxiomText fontWeight="600" fontSize="sm" display="block" mb="4">
																		Opportunity
																	</AxiomText>
																	<AxiomText fontSize="sm" color="fg.secondary">
																		{idea.opportunity}
																	</AxiomText>
																</Box>
																<Box>
																	<AxiomText fontWeight="600" fontSize="sm" display="block" mb="4">
																		Hypothesis
																	</AxiomText>
																	<AxiomText fontSize="sm" color="fg.secondary">
																		{idea.hypothesis}
																	</AxiomText>
																</Box>
																<Box
																	rounded="md"
																	p="12"
																	bg="bg.secondary"
																	border="1"
																	borderColor="border.tertiary"
																	display="flex"
																	flexDirection="column"
																	gap="12"
																	w="full"
																>
																	<Box>
																		<AxiomText fontWeight="600" fontSize="sm" display="block" mb="4">
																			Why this will work
																		</AxiomText>
																		<AxiomText fontSize="sm" color="fg.secondary">
																			{idea.whyThisWillWork}
																		</AxiomText>
																	</Box>
																	<Box>
																		<AxiomText fontWeight="600" fontSize="sm" display="block" mb="4">
																			Sources
																		</AxiomText>
																		<Box
																			display="flex"
																			flexDirection="column"
																			gap="4"
																			style={{ paddingLeft: "4px" }}
																		>
																			{idea.sources.map((src, i) => (
																				<Box key={i} display="flex" gap="8" alignItems="start">
																					<AxiomText fontSize="sm" color="fg.secondary" mt="2">
																						•
																					</AxiomText>
																					<AxiomText fontSize="sm" color="fg.secondary" style={{ flex: 1 }}>
																						{src}
																					</AxiomText>
																				</Box>
																			))}
																		</Box>
																	</Box>
																</Box>
															</Box>
														</DisclosureContent>
													</Disclosure>
												</Box>
												<Box
													display="flex"
													flexWrap="wrap"
													gap="8"
													w="full"
													style={{ paddingLeft: "24px" }}
												>
													<Button
														appearance="default"
														size="md"
														rounded="md"
														icon={<IconFolderArrowDown size={16} />}
														iconPosition="start"
													>
														Save
													</Button>
													<Button
														appearance="default-opal"
														size="md"
														rounded="md"
														icon={<IconSparkles size={16} />}
														iconPosition="start"
													>
														Refine
													</Button>
													<Button
														type="button"
														appearance="default-opal"
														size="md"
														rounded="md"
														icon={<IconAgent size={16} />}
														iconPosition="start"
														onClick={() => {
															openExperimentCreationAgent(
																buildExperimentCreationPayload(
																	idea,
																	targetBy,
																	urls,
																	selectedSavedPageIds,
																	savedPagesSearch,
																),
															);
														}}
													>
														Build
													</Button>
												</Box>
											</Card>
										);
									})}
								</Box>
							)}
						</Box>
					</Box>
					)}
				</Box>
			</Tabs>

			<Dialog
				open={selectedIdeaId != null}
				onOpenChange={(open) => !open && setSelectedIdeaId(null)}
			>
				<DialogContent
					size="lg"
					style={{
						maxWidth: "736px",
						maxHeight: "90vh",
						display: "flex",
						flexDirection: "column",
						overflow: "hidden",
					}}
				>
					<DialogHeader style={{ flexShrink: 0 }}>{selectedIdea?.name ?? ""}</DialogHeader>
					<DialogBody
						pt="0"
						style={{ flex: 1, minHeight: 0, overflowY: "auto" }}
					>
						<Box display="flex" flexDirection="column" gap="16">
							{selectedIdea?.description && (
								<AxiomText fontSize="sm" color="fg.secondary">
									{selectedIdea.description}
								</AxiomText>
							)}
							{selectedIdea?.problem && (
								<Box>
									<AxiomText fontWeight="600" fontSize="sm" mb="4" display="block">
										Problem
									</AxiomText>
									<AxiomText fontSize="sm" color="fg.secondary">
										{selectedIdea.problem}
									</AxiomText>
								</Box>
							)}
							{selectedIdea?.hypothesis && (
								<Box>
									<AxiomText fontWeight="600" fontSize="sm" mb="4" display="block">
										Hypothesis
									</AxiomText>
									<AxiomText fontSize="sm" color="fg.secondary">
										{selectedIdea.hypothesis}
									</AxiomText>
								</Box>
							)}
							{selectedIdea?.basedOn && selectedIdea.basedOn.length > 0 && (
								<Box>
									<AxiomText fontWeight="600" fontSize="sm" mb="4" display="block">
										Based on
									</AxiomText>
									<ul
										style={{
											margin: 0,
											paddingLeft: "20px",
											listStyleType: "disc",
										}}
									>
										{selectedIdea.basedOn.map((item, i) => (
											<li key={i} style={{ marginBottom: "4px" }}>
												<AxiomText fontSize="sm" color="fg.secondary" asChild>
													<span>{item}</span>
												</AxiomText>
											</li>
										))}
									</ul>
								</Box>
							)}
							{selectedIdea?.whyThisWillWork && (
								<Box>
									<AxiomText fontWeight="600" fontSize="sm" mb="4" display="block">
										Why this will work
									</AxiomText>
									<AxiomText fontSize="sm" color="fg.secondary">
										{selectedIdea.whyThisWillWork}
									</AxiomText>
								</Box>
							)}
						</Box>
					</DialogBody>
					<DialogFooter style={{ flexShrink: 0 }}>
						<DialogClose asChild>
							<Button appearance="primary" size="lg" onClick={() => setSelectedIdeaId(null)}>
								Close
							</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Box>
	);
}

