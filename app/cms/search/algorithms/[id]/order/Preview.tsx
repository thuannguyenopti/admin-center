import {
	Box,
	Heading,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
	Badge,
	Menu,
	MenuTrigger,
	MenuContent,
} from "@optiaxiom/react";
import {Flex} from "@/app/components/Flex";
import {Text} from "@/app/components/Text";
import {Input} from "@/app/components/Input";
import {Button} from "@/app/components/Button";
import {
	IconSearch,
	IconSettings,
	IconCongruentTo,
	IconPlus,
	IconArrowsExchange,
	IconPinned,
} from "@tabler/icons-react";
import {useState, useMemo, useEffect, useRef} from "react";
import {useParams} from "next/navigation";
import {use} from "react";
import usePersistentState from "@/app/usePersistentState";
import {
	Algorithm,
	AlgorithmPinnedResultReference,
	initialAlgorithms,
	PinnedResult,
	initialPinnedResults,
	RelatedQuery,
	AlgorithmRelatedQueryReference,
	initialRelatedQueries,
	AutocompletePhrase,
	AlgorithmAutocompletePhraseReference,
	initialAutocompletePhrases,
	Synonym,
	AlgorithmSynonymReference,
	initialSynonyms,
} from "@/app/db/initialData";
import searchResults from "@/app/db/searchResults.json";
import PinnedResultDialog from "../../../components/PinnedResultDialog";

export default function Preview({
	algorithmPinnedResults: externalAlgorithmPinnedResults,
	onAlgorithmPinnedResultsChange: setExternalAlgorithmPinnedResults,
	globalPinnedResults: externalGlobalPinnedResults,
	onGlobalPinnedResultsChange: setExternalGlobalPinnedResults,

	algorithmRelatedQueries: externalAlgorithmRelatedQueries,
	globalRelatedQueries: externalGlobalRelatedQueries,

	algorithmSynonyms: externalAlgorithmSynonyms,
	globalSynonyms: externalGlobalSynonyms,

	algorithmAutocompletePhrases: externalAlgorithmAutocompletePhrases,
	globalAutocompletePhrases: externalGlobalAutocompletePhrases,
}: {
	algorithmPinnedResults?: AlgorithmPinnedResultReference[];
	onAlgorithmPinnedResultsChange?: (val: AlgorithmPinnedResultReference[]) => void;
	globalPinnedResults?: PinnedResult[];
	onGlobalPinnedResultsChange?: (val: PinnedResult[]) => void;

	algorithmRelatedQueries?: AlgorithmRelatedQueryReference[];
	globalRelatedQueries?: RelatedQuery[];

	algorithmSynonyms?: AlgorithmSynonymReference[];
	globalSynonyms?: Synonym[];

	algorithmAutocompletePhrases?: AlgorithmAutocompletePhraseReference[];
	globalAutocompletePhrases?: AutocompletePhrase[];
} = {}) {
	const params = useParams();
	const resolvedParams = params instanceof Promise ? use(params) : params;
	const id = (resolvedParams?.id ?? "") as string;
	const [activeTab, setActiveTab] = usePersistentState(`preview_tab_${id}`, "search demo");
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [showPinnedResults, setShowPinnedResults] = useState(true);
	const [showRelatedQueries, setShowRelatedQueries] = useState(true);
	const [showSynonyms, setShowSynonyms] = useState(true);

	const [isPinnedResultDialogOpen, setIsPinnedResultDialogOpen] = useState(false);
	const [pinnedResultQuery, setPinnedResultQuery] = useState("");

	const [algorithms] = usePersistentState("algorithms", initialAlgorithms) as [Algorithm[], any];
	const currentAlgorithm = algorithms.find((a) => a.id === id);
	const isCustom = currentAlgorithm?.type === "Custom";
	const searchBar = !isCustom;

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedQuery(query);
		}, 1000);

		return () => {
			clearTimeout(handler);
		};
	}, [query]);

	const [localAlgorithmPinnedResults, setLocalAlgorithmPinnedResults] = usePersistentState(
		`algorithm_pinned_results_${id}`,
		[]
	) as [AlgorithmPinnedResultReference[], (val: AlgorithmPinnedResultReference[]) => void];

	const algorithmPinnedResults = externalAlgorithmPinnedResults ?? localAlgorithmPinnedResults;
	const setAlgorithmPinnedResults =
		setExternalAlgorithmPinnedResults ?? setLocalAlgorithmPinnedResults;

	const [localGlobalPinnedResults, setLocalGlobalPinnedResults] = usePersistentState(
		"pinnedResults",
		initialPinnedResults
	) as [PinnedResult[], (val: PinnedResult[]) => void];

	const globalPinnedResults = externalGlobalPinnedResults ?? localGlobalPinnedResults;
	const setGlobalPinnedResults = setExternalGlobalPinnedResults ?? setLocalGlobalPinnedResults;

	const [localGlobalAutocompletePhrases] = usePersistentState(
		"autocompletePhrases",
		initialAutocompletePhrases
	) as [AutocompletePhrase[], any];
	const globalAutocompletePhrases =
		externalGlobalAutocompletePhrases ?? localGlobalAutocompletePhrases;

	const [localAlgorithmAutocompletePhrases] = usePersistentState(
		`algorithm_autocomplete_phrases_${id}`,
		[]
	) as [AlgorithmAutocompletePhraseReference[], any];
	const algorithmAutocompletePhrases =
		externalAlgorithmAutocompletePhrases ?? localAlgorithmAutocompletePhrases;

	const [localGlobalSynonyms] = usePersistentState("synonyms", initialSynonyms) as [
		Synonym[],
		any
	];
	const globalSynonyms = externalGlobalSynonyms ?? localGlobalSynonyms;

	const [localAlgorithmSynonyms] = usePersistentState(`algorithm_synonyms_${id}`, []) as [
		AlgorithmSynonymReference[],
		any
	];
	const algorithmSynonyms = externalAlgorithmSynonyms ?? localAlgorithmSynonyms;

	const [optimisticPinnedResults, setOptimisticPinnedResults] = useState<
		(PinnedResult & {status: "Active" | "Inactive"})[]
	>([]);

	const onCreatePinnedResult = (query: string) => {
		setPinnedResultQuery(query);
		setIsPinnedResultDialogOpen(true);
	};

	const handleSavePinnedResult = (data: {
		query: string;
		destination: string;
		status?: "Active" | "Inactive";
	}) => {
		const newId = Date.now().toString();
		const newGlobalPinnedResult: PinnedResult = {
			id: newId,
			query: data.query,
			destination: data.destination,
			owner: "Current User",
		};
		setGlobalPinnedResults([...globalPinnedResults, newGlobalPinnedResult]);

		const newPinnedResult: AlgorithmPinnedResultReference = {
			pinnedResultId: newId,
			status: data.status || "Active",
		};
		setAlgorithmPinnedResults([...algorithmPinnedResults, newPinnedResult]);

		setOptimisticPinnedResults((prev) => [
			...prev,
			{...newGlobalPinnedResult, status: newPinnedResult.status},
		]);

		setIsPinnedResultDialogOpen(false);
	};

	const [localAlgorithmRelatedQueries] = usePersistentState(
		`algorithm_related_queries_${id}`,
		[]
	) as [AlgorithmRelatedQueryReference[], any];
	const algorithmRelatedQueries = externalAlgorithmRelatedQueries ?? localAlgorithmRelatedQueries;

	const [localGlobalRelatedQueries] = usePersistentState(
		"relatedQueries",
		initialRelatedQueries
	) as [RelatedQuery[], any];
	const globalRelatedQueries = externalGlobalRelatedQueries ?? localGlobalRelatedQueries;

	const hydratedRelatedQueries = useMemo(() => {
		if (!algorithmRelatedQueries) return [];
		return algorithmRelatedQueries
			.map((ref) => globalRelatedQueries.find((rq) => rq.id === ref.relatedQueryId))
			.filter((item): item is RelatedQuery => item !== undefined);
	}, [algorithmRelatedQueries, globalRelatedQueries]);

	const hydratedPinnedResults = useMemo(() => {
		if (!algorithmPinnedResults) return [];
		return algorithmPinnedResults
			.map((ref) => {
				const bb = globalPinnedResults.find((g) => g.id === ref.pinnedResultId);
				if (!bb) return null;
				return {...bb, status: ref.status};
			})
			.filter(
				(item): item is PinnedResult & {status: "Active" | "Inactive"} => item !== null
			);
	}, [algorithmPinnedResults, globalPinnedResults]);

	const effectivePinnedResults = useMemo(() => {
		const hydratedIds = new Set(hydratedPinnedResults.map((b) => b.id));
		const uniqueOptimistic = optimisticPinnedResults.filter((b) => !hydratedIds.has(b.id));
		return [...hydratedPinnedResults, ...uniqueOptimistic];
	}, [hydratedPinnedResults, optimisticPinnedResults]);

	useEffect(() => {
		if (optimisticPinnedResults.length === 0) return;
		const hydratedIds = new Set(hydratedPinnedResults.map((b) => b.id));
		const remainingOptimistic = optimisticPinnedResults.filter((b) => !hydratedIds.has(b.id));
		if (remainingOptimistic.length !== optimisticPinnedResults.length) {
			setOptimisticPinnedResults(remainingOptimistic);
		}
	}, [hydratedPinnedResults, optimisticPinnedResults]);

	const activeRelatedQueryTerms = useMemo(() => {
		if (!query || !showRelatedQueries) return [];
		const lowerQuery = query.toLowerCase();
		const synonyms: string[] = [];

		hydratedRelatedQueries.forEach((group) => {
			const groupTerms = [group.query, ...group.synonyms].map((s) => s.toLowerCase());
			if (groupTerms.includes(lowerQuery)) {
				const otherTerms = [group.query, ...group.synonyms].filter(
					(s) => s.toLowerCase() !== lowerQuery
				);
				synonyms.push(...otherTerms);
			}
		});

		return Array.from(new Set(synonyms));
	}, [query, hydratedRelatedQueries, showRelatedQueries]);

	const hydratedSynonyms = useMemo(() => {
		return globalSynonyms.filter((syn) =>
			algorithmSynonyms.some((ref) => ref.synonymId === syn.id)
		);
	}, [globalSynonyms, algorithmSynonyms]);

	const activeSynonyms = useMemo(() => {
		if (!query || !showSynonyms) return [];
		const lowerQuery = query.toLowerCase();
		const expanded: string[] = [];

		hydratedSynonyms.forEach((syn) => {
			const term = syn.term.toLowerCase();
			const synonyms = syn.synonyms.map((s) => s.toLowerCase());

			if (syn.type === "Two-way") {
				const allTerms = [term, ...synonyms];
				if (allTerms.includes(lowerQuery)) {
					expanded.push(...allTerms.filter((t) => t !== lowerQuery));
				}
			} else {
				// One-way: term -> synonyms
				if (term === lowerQuery) {
					expanded.push(...synonyms);
				}
			}
		});

		return Array.from(new Set(expanded));
	}, [query, hydratedSynonyms, showSynonyms]);

	const activeAutocompletePhrases = useMemo(() => {
		return globalAutocompletePhrases.filter((phrase) =>
			algorithmAutocompletePhrases.some((ref) => ref.autocompletePhraseId === phrase.id)
		);
	}, [globalAutocompletePhrases, algorithmAutocompletePhrases]);

	const autocompleteSuggestions = useMemo(() => {
		if (!query) return [];
		return activeAutocompletePhrases.filter((phrase) =>
			phrase.phrase.toLowerCase().startsWith(query.toLowerCase())
		);
	}, [query, activeAutocompletePhrases]);

	const [highlightedIndex, setHighlightedIndex] = useState(-1);
	const [isInputFocused, setIsInputFocused] = useState(false);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (autocompleteSuggestions.length === 0) return;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			setHighlightedIndex((prev) =>
				prev < autocompleteSuggestions.length - 1 ? prev + 1 : prev
			);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
		} else if (e.key === "Enter") {
			if (highlightedIndex >= 0) {
				e.preventDefault();
				setQuery(autocompleteSuggestions[highlightedIndex].phrase);
				setHighlightedIndex(-1);
				setIsInputFocused(false);
			}
		}
	};

	// Filter results based on query
	const filteredResults = searchResults.filter((result) => {
		if (!query) return true;

		const lowerQuery = query.toLowerCase();
		const queriesToCheck = [lowerQuery];

		if (showRelatedQueries) {
			queriesToCheck.push(...activeRelatedQueryTerms.map((s) => s.toLowerCase()));
		}

		if (showSynonyms) {
			queriesToCheck.push(...activeSynonyms.map((s) => s.toLowerCase()));
		}

		console.log("queriesToCheck:", queriesToCheck, "active Synonyms:", activeSynonyms);

		return queriesToCheck.some(
			(q) =>
				result.title.toLowerCase().includes(q) ||
				result.description.toLowerCase().includes(q)
		);
	});

	// Check for active pinned results matching the query
	const activePinnedResults = showPinnedResults
		? effectivePinnedResults.filter(
				(bb) =>
					bb.status === "Active" &&
					query &&
					bb.query
						.split(";")
						.some((phrase) => phrase.trim().toLowerCase().includes(query.toLowerCase()))
		  )
		: [];

	return (
		<Box
			h="full"
			className="w-[420px]"
			display="flex"
			flexDirection="column"
			overflowY="auto"
		>
			<Box pb="0">
				<Heading
					level="4"
					mb="16"
					p="24"
					pb="0"
				>
					Preview
				</Heading>
				<Tabs
					value={activeTab as string}
					onValueChange={setActiveTab}
				>
					<Box px="24">
						{searchBar && (
							<TabsList>
								<TabsTrigger value="search demo">Search demo</TabsTrigger>
								<TabsTrigger value="detailed">Detailed</TabsTrigger>
							</TabsList>
						)}
						<Box mt="16">
							{searchBar && (
								<Flex
									gap="8"
									flexDirection="row"
								>
									<Box
										flex="1"
										position="relative"
									>
										<Input
											placeholder="Search Preview"
											addonBefore={<IconSearch size={16} />}
											value={query}
											onChange={(e) => {
												setQuery(e.target.value);
												setHighlightedIndex(-1);
											}}
											onFocus={() => setIsInputFocused(true)}
											onBlur={() => {
												setTimeout(() => setIsInputFocused(false), 200);
											}}
											onKeyDown={handleKeyDown}
										/>
										{isInputFocused && autocompleteSuggestions.length > 0 && (
											<Box
												position="absolute"
												top="100%"
												left="0"
												right="0"
												bg="bg.default"
												shadow="md"
												z="10"
												mt="4"
												rounded="md"
												borderColor="border.secondary"
												className="max-h-[200px] overflow-y-auto"
												p="4"
												border="1"
											>
												{autocompleteSuggestions.map((s, index) => (
													<Box
														key={s.id}
														p="8"
														rounded="sm"
														bg={
															index === highlightedIndex
																? "bg.default.hovered"
																: undefined
														}
														cursor="pointer"
														onClick={() => {
															setQuery(s.phrase);
															setHighlightedIndex(-1);
															setIsInputFocused(false);
														}}
														onMouseEnter={() =>
															setHighlightedIndex(index)
														}
													>
														<Text>{s.phrase}</Text>
													</Box>
												))}
											</Box>
										)}
									</Box>
									<Menu
										options={[
											{
												addon: <IconPinned size={16} />,
												label: "Pinned Results",
												execute: () =>
													setShowPinnedResults(!showPinnedResults),
												selected: showPinnedResults,
												switch: true,
											},
											{
												addon: <IconCongruentTo size={16} />,
												label: "Related Queries",
												execute: () =>
													setShowRelatedQueries(!showRelatedQueries),
												selected: showRelatedQueries,
												switch: true,
											},
											{
												addon: <IconArrowsExchange size={16} />,
												label: "Synonyms",
												execute: () => setShowSynonyms(!showSynonyms),
												selected: showSynonyms,
												switch: true,
											},
										]}
									>
										<MenuTrigger
											icon={<IconSettings size={16} />}
											aria-label="Settings"
											size="lg"
										/>
										<MenuContent />
									</Menu>
								</Flex>
							)}
						</Box>
						{activeRelatedQueryTerms.length > 0 && (
							<Box
								mt="16"
								bg="bg.accent.subtle"
								p="8"
								rounded="sm"
							>
								<Text
									fontSize="md"
									fontWeight="600"
									mb="4"
								>
									Related Queries Applied
								</Text>
								<Flex
									gap="8"
									flexWrap="wrap"
									color="fg.secondary"
									fontSize="sm"
								>
									{activeRelatedQueryTerms.join(", ")}
								</Flex>
							</Box>
						)}
						{activeSynonyms.length > 0 && (
							<Box
								mt="16"
								bg="bg.accent.subtle"
								p="8"
								rounded="sm"
							>
								<Text
									fontSize="md"
									fontWeight="600"
									mb="4"
								>
									Synonyms Applied
								</Text>
								<Flex
									gap="8"
									flexWrap="wrap"
									color="fg.secondary"
									fontSize="sm"
								>
									{activeSynonyms.join(", ")}
								</Flex>
							</Box>
						)}
					</Box>

					<TabsContent value="search demo">
						<Box
							flex="1"
							px="16"
							py="24"
						>
							<Flex
								flexDirection="column"
								gap="4"
							>
								{activePinnedResults.map((bb, i) => {
									const result = searchResults.find(
										(r) => r.url === bb.destination
									);
									return (
										<ResultItem
											key={`bb-${i}`}
											isPinnedResult
											title={result?.title || bb.query}
											description={`Pinned Result for "${bb.query}"`}
											url={bb.destination}
										/>
									);
								})}
								{filteredResults.map((result, i) => (
									<ResultItem
										key={i}
										title={result.title}
										description={result.description}
										url={result.url}
									/>
								))}
								{filteredResults.length === 0 &&
									activePinnedResults.length === 0 && (
										<Flex
											flexDirection="column"
											alignItems="center"
											gap="8"
											py="24"
										>
											<Text color="fg.secondary">No results found.</Text>
											{onCreatePinnedResult && debouncedQuery.trim() && (
												<Button
													size="lg"
													icon={<IconPlus />}
													onClick={() =>
														onCreatePinnedResult(debouncedQuery)
													}
													style={{
														animation:
															"appearDown 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
														animationDelay: "1s",
														animationFillMode: "both",
													}}
												>
													Create Pinned Result for "{debouncedQuery}"
												</Button>
											)}
										</Flex>
									)}
							</Flex>
						</Box>
					</TabsContent>

					<TabsContent value="detailed">
						<Box
							flex="1"
							mt="24"
						>
							<Flex
								flexDirection="column"
								gap="0"
							>
								{activePinnedResults.map((bb, i) => {
									const result = searchResults.find(
										(r) => r.url === bb.destination
									);
									return (
										<DetailedResultItem
											key={`bb-${i}`}
											isPinnedResult
											score={0.0}
											id="some-content-id"
											data={{
												title: result?.title || bb.query,
												description: `Pinned Result for "${bb.query}"`,
												author: "Steven King",
												array: '["lorem dolor", "dolor"]',
												_fulltext:
													"Lorem ipsum dolor sit amet. Products ipsum dolor",
											}}
											query={query}
										/>
									);
								})}
								{filteredResults.map((result, i) => (
									<DetailedResultItem
										key={i}
										score={3.125}
										id="some-content-id"
										data={{
											title: result.title,
											description: result.description,
											author: "Steven King",
											array: '["lorem dolor", "dolor"]',
											_fulltext:
												"Lorem ipsum dolor sit amet. Products ipsum dolor",
										}}
										query={query}
									/>
								))}
							</Flex>
						</Box>
					</TabsContent>
				</Tabs>
			</Box>
			<PinnedResultDialog
				open={isPinnedResultDialogOpen}
				setOpen={setIsPinnedResultDialogOpen}
				mode="create"
				initialData={{query: pinnedResultQuery, destination: ""}}
				onSave={handleSavePinnedResult}
				showStatus={true}
			/>
		</Box>
	);
}

function DetailedResultItem({
	isPinnedResult,
	score,
	id,
	data,
	query,
}: {
	isPinnedResult?: boolean;
	score: number;
	id: string;
	data: {
		title: string;
		description: string;
		author: string;
		array: string;
		_fulltext: string;
	};
	query: string;
}) {
	const highlight = (text: string) => {
		if (!query) return text;
		const parts = text.split(new RegExp(`(${query})`, "gi"));
		return parts.map((part, i) =>
			part.toLowerCase() === query.toLowerCase() ? (
				<span
					key={i}
					style={{color: "#0066CC", fontWeight: "bold"}}
				>
					{part}
				</span>
			) : (
				part
			)
		);
	};

	return (
		<Box
			bg="bg.default"
			style={{borderBottom: "1px solid #e2e8f0"}}
		>
			<Flex
				flexDirection="row"
				justifyContent="space-between"
				alignItems="start"
				mb="8"
			>
				<Flex
					flexDirection="column"
					gap="4"
				>
					{isPinnedResult && (
						<Text
							color="fg.accent"
							fontWeight="600"
							fontSize="sm"
						>
							Pinned Result
						</Text>
					)}
					<Flex
						flexDirection="row"
						gap="8"
						alignItems="center"
					>
						<Text
							color="fg.secondary"
							fontSize="sm"
							style={{textTransform: "uppercase"}}
						>
							SCORE:
						</Text>
						<Text
							fontWeight="700"
							fontSize="md"
						>
							{score.toFixed(1)}
						</Text>
					</Flex>
				</Flex>
				<Text
					color="fg.tertiary"
					fontSize="sm"
				>
					ID: {id}
				</Text>
			</Flex>

			<Box pl="24">
				<GridRow
					label="title"
					value={highlight(data.title)}
					multiplier={3}
				/>
				<GridRow
					label="description"
					value={highlight(data.description)}
				/>
				<GridRow
					label="author"
					value={highlight(data.author)}
					multiplier={5}
				/>
				<GridRow
					label="array"
					value={highlight(data.array)}
				/>
				<GridRow
					label="_fulltext"
					value={highlight(data._fulltext)}
				/>
			</Box>
		</Box>
	);
}

function GridRow({
	label,
	value,
	multiplier,
}: {
	label: string;
	value: React.ReactNode;
	multiplier?: number;
}) {
	return (
		<Flex
			flexDirection="row"
			gap="8"
			mb="4"
		>
			<Flex
				style={{width: "100px"}}
				justifyContent="flex-end"
				alignItems="center"
				gap="4"
			>
				{multiplier && (
					<Badge
						intent="information"
						size="sm"
						variant="subtle"
					>
						x{multiplier}
					</Badge>
				)}
				<Text
					color="fg.secondary"
					fontSize="sm"
					textAlign="end"
				>
					{label}:
				</Text>
			</Flex>
			<Text
				color="fg.default"
				fontSize="sm"
				fontWeight={label === "title" ? "600" : "400"}
			>
				{value}
			</Text>
		</Flex>
	);
}

function ResultItem({
	isPinnedResult,
	title,
	description,
	url,
}: {
	isPinnedResult?: boolean;
	title: string;
	description: string;
	url: string;
}) {
	return (
		<Box
			bg={isPinnedResult ? "bg.accent.subtle" : "bg.default"}
			p="8"
			rounded="sm"
		>
			<Flex
				flexDirection="row"
				justifyContent="space-between"
			>
				<Text
					color="fg.default"
					fontWeight="600"
					fontSize="md"
					mb="4"
				>
					{title}
				</Text>
				<Flex
					justifyContent="end"
					alignItems="start"
					flexDirection="row"
					mb="4"
				>
					{isPinnedResult && <Badge intent="information">Pinned Result</Badge>}
				</Flex>
			</Flex>
			<Text
				fontSize="sm"
				color="fg.secondary"
				mb="4"
			>
				{description}
			</Text>
			<Flex>
				<Text
					fontSize="xs"
					color="fg.tertiary"
				>
					{url}
				</Text>
			</Flex>
		</Box>
	);
}
