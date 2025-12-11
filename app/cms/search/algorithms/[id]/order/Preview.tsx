import {
	Box,
	Heading,
	Switch,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
	Badge,
	Separator,
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
	IconActivity,
	IconSettings,
	IconRocket,
	IconCongruentTo,
	IconPlus,
} from "@tabler/icons-react";
import {useState, useMemo, useEffect} from "react";
import {useParams} from "next/navigation";
import usePersistentState from "@/app/usePersistentState";
import {
	Algorithm,
	AlgorithmBestBet,
	AlgorithmBestBetReference,
	initialAlgorithms,
	BestBet,
	initialBestBets,
	RelatedQuery,
	AlgorithmRelatedQueryReference,
	initialRelatedQueries,
} from "@/app/db/initialData";
import searchResults from "@/app/db/searchResults.json";
import BestBetDialog from "../../../components/BestBetDialog";

export default function Preview({
	algorithmBestBets: externalAlgorithmBestBets,
	onAlgorithmBestBetsChange: setExternalAlgorithmBestBets,
	globalBestBets: externalGlobalBestBets,
	onGlobalBestBetsChange: setExternalGlobalBestBets,
}: {
	algorithmBestBets?: AlgorithmBestBetReference[];
	onAlgorithmBestBetsChange?: (val: AlgorithmBestBetReference[]) => void;
	globalBestBets?: BestBet[];
	onGlobalBestBetsChange?: (val: BestBet[]) => void;
} = {}) {
	const params = useParams();
	const id = params.id as string;
	const [activeTab, setActiveTab] = usePersistentState(`preview_tab_${id}`, "search demo");
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [showBestBets, setShowBestBets] = useState(true);
	const [showRelatedQueries, setShowRelatedQueries] = useState(true);

	const [isBestBetDialogOpen, setIsBestBetDialogOpen] = useState(false);
	const [bestBetQuery, setBestBetQuery] = useState("");

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

	const [localAlgorithmBestBets, setLocalAlgorithmBestBets] = usePersistentState(
		`algorithm_best_bets_${id}`,
		[]
	) as [AlgorithmBestBetReference[], (val: AlgorithmBestBetReference[]) => void];

	const algorithmBestBets = externalAlgorithmBestBets ?? localAlgorithmBestBets;
	const setAlgorithmBestBets = setExternalAlgorithmBestBets ?? setLocalAlgorithmBestBets;

	const [localGlobalBestBets, setLocalGlobalBestBets] = usePersistentState(
		"bestBets",
		initialBestBets
	) as [BestBet[], (val: BestBet[]) => void];

	const globalBestBets = externalGlobalBestBets ?? localGlobalBestBets;
	const setGlobalBestBets = setExternalGlobalBestBets ?? setLocalGlobalBestBets;

	const [optimisticBestBets, setOptimisticBestBets] = useState<
		(BestBet & {status: "Active" | "Inactive"})[]
	>([]);

	const onCreateBestBet = (query: string) => {
		setBestBetQuery(query);
		setIsBestBetDialogOpen(true);
	};

	const handleSaveBestBet = (data: {
		query: string;
		destination: string;
		status?: "Active" | "Inactive";
	}) => {
		const newId = Date.now().toString();
		const newGlobalBestBet: BestBet = {
			id: newId,
			query: data.query,
			destination: data.destination,
			owner: "Current User",
		};
		setGlobalBestBets([...globalBestBets, newGlobalBestBet]);

		const newBestBet: AlgorithmBestBetReference = {
			bestBetId: newId,
			status: data.status || "Active",
		};
		setAlgorithmBestBets([...algorithmBestBets, newBestBet]);

		setOptimisticBestBets((prev) => [
			...prev,
			{...newGlobalBestBet, status: newBestBet.status},
		]);

		setIsBestBetDialogOpen(false);
	};

	const [relatedQueries] = usePersistentState(`algorithm_related_queries_${id}`, []) as [
		AlgorithmRelatedQueryReference[],
		any
	];

	const [globalRelatedQueries] = usePersistentState("relatedQueries", initialRelatedQueries) as [
		RelatedQuery[],
		any
	];

	const hydratedRelatedQueries = useMemo(() => {
		if (!relatedQueries) return [];
		return relatedQueries
			.map((ref) => globalRelatedQueries.find((rq) => rq.id === ref.relatedQueryId))
			.filter((item): item is RelatedQuery => item !== undefined);
	}, [relatedQueries, globalRelatedQueries]);

	const hydratedBestBets = useMemo(() => {
		if (!algorithmBestBets) return [];
		return algorithmBestBets
			.map((ref) => {
				const bb = globalBestBets.find((g) => g.id === ref.bestBetId);
				if (!bb) return null;
				return {...bb, status: ref.status};
			})
			.filter((item): item is BestBet & {status: "Active" | "Inactive"} => item !== null);
	}, [algorithmBestBets, globalBestBets]);

	const effectiveBestBets = useMemo(() => {
		const hydratedIds = new Set(hydratedBestBets.map((b) => b.id));
		const uniqueOptimistic = optimisticBestBets.filter((b) => !hydratedIds.has(b.id));
		return [...hydratedBestBets, ...uniqueOptimistic];
	}, [hydratedBestBets, optimisticBestBets]);

	useEffect(() => {
		if (optimisticBestBets.length === 0) return;
		const hydratedIds = new Set(hydratedBestBets.map((b) => b.id));
		const remainingOptimistic = optimisticBestBets.filter((b) => !hydratedIds.has(b.id));
		if (remainingOptimistic.length !== optimisticBestBets.length) {
			setOptimisticBestBets(remainingOptimistic);
		}
	}, [hydratedBestBets, optimisticBestBets]);

	const activeSynonyms = useMemo(() => {
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

	// Filter results based on query
	const filteredResults = searchResults.filter((result) => {
		if (!query) return true;

		const lowerQuery = query.toLowerCase();
		const queriesToCheck = [lowerQuery];

		if (showRelatedQueries) {
			queriesToCheck.push(...activeSynonyms.map((s) => s.toLowerCase()));
		}

		return queriesToCheck.some(
			(q) =>
				result.title.toLowerCase().includes(q) ||
				result.description.toLowerCase().includes(q)
		);
	});

	// Check for active best bets matching the query
	const activeBestBets = showBestBets
		? effectiveBestBets.filter(
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
									<Box flex="1">
										<Input
											placeholder="Products"
											addonBefore={<IconSearch size={16} />}
											value={query}
											onChange={(e) => setQuery(e.target.value)}
										/>
									</Box>
									<Menu
										options={[
											{
												addon: <IconRocket size={16} />,
												label: "Best bets",
												execute: () => setShowBestBets(!showBestBets),
												selected: showBestBets,
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
						{activeSynonyms.length > 0 && (
							<Box mt="16">
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
									{activeSynonyms.map((term) => activeSynonyms.join(", "))}
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
								{activeBestBets.map((bb, i) => {
									const result = searchResults.find(
										(r) => r.url === bb.destination
									);
									return (
										<ResultItem
											key={`bb-${i}`}
											isBestBet
											title={result?.title || bb.query}
											description={`Best Bet for "${bb.query}"`}
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
								{filteredResults.length === 0 && activeBestBets.length === 0 && (
									<Flex
										flexDirection="column"
										alignItems="center"
										gap="8"
										py="24"
									>
										<Text color="fg.secondary">No results found.</Text>
										{onCreateBestBet && debouncedQuery.trim() && (
											<Button
												size="lg"
												icon={<IconPlus />}
												onClick={() => onCreateBestBet(debouncedQuery)}
												style={{
													animation:
														"appearDown 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
													animationDelay: "1s",
													animationFillMode: "both",
												}}
											>
												Create Best Bet for "{debouncedQuery}"
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
								{activeBestBets.map((bb, i) => {
									const result = searchResults.find(
										(r) => r.url === bb.destination
									);
									return (
										<DetailedResultItem
											key={`bb-${i}`}
											isBestBet
											score={0.0}
											id="some-content-id"
											data={{
												title: result?.title || bb.query,
												description: `Best Bet for "${bb.query}"`,
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
			<BestBetDialog
				open={isBestBetDialogOpen}
				setOpen={setIsBestBetDialogOpen}
				mode="create"
				initialData={{query: bestBetQuery, destination: ""}}
				onSave={handleSaveBestBet}
				showStatus={true}
			/>
		</Box>
	);
}

function DetailedResultItem({
	isBestBet,
	score,
	id,
	data,
	query,
}: {
	isBestBet?: boolean;
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
					{isBestBet && (
						<Text
							color="fg.accent"
							fontWeight="600"
							fontSize="sm"
						>
							Best bet
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
	isBestBet,
	title,
	description,
	url,
}: {
	isBestBet?: boolean;
	title: string;
	description: string;
	url: string;
}) {
	return (
		<Box
			bg={isBestBet ? "bg.accent.subtle" : "bg.default"}
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
					{isBestBet && <Badge intent="information">Best bet</Badge>}
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
