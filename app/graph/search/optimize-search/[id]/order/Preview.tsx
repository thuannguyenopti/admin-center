import {
	Box,
	Heading,
	Switch,
	Tabs,
	TabsList,
	TabsTrigger,
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
import {AlgorithmBestBet} from "@/app/db/initialData";
import searchResults from "@/app/db/searchResults.json";

export default function Preview({
	algorithmBestBets,
	relatedQueries = [],
	onCreateBestBet,
}: {
	algorithmBestBets?: AlgorithmBestBet[];
	relatedQueries?: {query: string; synonyms: string[]}[];
	onCreateBestBet?: (query: string) => void;
}) {
	const params = useParams();
	const id = params.id as string;
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [showBestBets, setShowBestBets] = useState(true);
	const [showRelatedQueries, setShowRelatedQueries] = useState(true);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedQuery(query);
		}, 1000);

		return () => {
			clearTimeout(handler);
		};
	}, [query]);

	// Use local state if props are not provided (fallback)
	const [localAlgorithmBestBets] = usePersistentState(`algorithm_best_bets_${id}`, []) as [
		AlgorithmBestBet[],
		any
	];

	const effectiveBestBets =
		algorithmBestBets !== undefined ? algorithmBestBets : localAlgorithmBestBets;

	const activeSynonyms = useMemo(() => {
		if (!query || !showRelatedQueries) return [];
		const lowerQuery = query.toLowerCase();
		const synonyms: string[] = [];

		relatedQueries.forEach((group) => {
			const groupTerms = [group.query, ...group.synonyms].map((s) => s.toLowerCase());
			if (groupTerms.includes(lowerQuery)) {
				const otherTerms = [group.query, ...group.synonyms].filter(
					(s) => s.toLowerCase() !== lowerQuery
				);
				synonyms.push(...otherTerms);
			}
		});

		return Array.from(new Set(synonyms));
	}, [query, relatedQueries, showRelatedQueries]);

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
			display="flex"
			flexDirection="column"
		>
			<Box
				p="24"
				pb="0"
			>
				<Heading
					level="4"
					mb="16"
				>
					Preview
				</Heading>
				<Tabs defaultValue="demo">
					{/* <TabsList>
						<TabsTrigger value="detailed">Detailed</TabsTrigger>
						<TabsTrigger value="top10">Top 10 Queries</TabsTrigger>
						<TabsTrigger value="demo">Demo</TabsTrigger>
					</TabsList> */}
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
									execute: () => setShowRelatedQueries(!showRelatedQueries),
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
				</Tabs>
			</Box>
			<Box
				flex="1"
				px="16"
				mt="24"
			>
				<Flex
					flexDirection="column"
					gap="4"
				>
					{activeBestBets.map((bb, i) => {
						const result = searchResults.find((r) => r.url === bb.destination);
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
		</Box>
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
