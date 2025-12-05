import {
	Box,
	Flex,
	Heading,
	Text,
	Input,
	Switch,
	Tabs,
	TabsList,
	TabsTrigger,
	Badge,
	Separator,
} from "@optiaxiom/react";
import {IconSearch, IconActivity} from "@tabler/icons-react";
import {useState, useMemo} from "react";
import {useParams} from "next/navigation";
import usePersistentState from "@/app/usePersistentState";
import {BestBet} from "@/app/db/initialData";
import searchResults from "@/app/db/searchResults.json";

export default function Preview({
	algorithmBestBets,
	similarQueries = [],
}: {
	algorithmBestBets?: BestBet[];
	similarQueries?: {query: string; synonyms: string[]}[];
}) {
	const params = useParams();
	const id = params.id as string;
	const [query, setQuery] = useState("");
	const [showBestBets, setShowBestBets] = useState(true);
	const [showSimilarQueries, setShowSimilarQueries] = useState(true);

	// Use local state if props are not provided (fallback)
	const [localAlgorithmBestBets] = usePersistentState(`algorithm_best_bets_${id}`, []) as [
		BestBet[],
		any
	];

	const effectiveBestBets =
		algorithmBestBets !== undefined ? algorithmBestBets : localAlgorithmBestBets;

	const activeSynonyms = useMemo(() => {
		if (!query || !showSimilarQueries) return [];
		const lowerQuery = query.toLowerCase();
		const synonyms: string[] = [];

		similarQueries.forEach((group) => {
			const groupTerms = [group.query, ...group.synonyms].map((s) => s.toLowerCase());
			if (groupTerms.includes(lowerQuery)) {
				const otherTerms = [group.query, ...group.synonyms].filter(
					(s) => s.toLowerCase() !== lowerQuery
				);
				synonyms.push(...otherTerms);
			}
		});

		return Array.from(new Set(synonyms));
	}, [query, similarQueries, showSimilarQueries]);

	// Filter results based on query
	const filteredResults = searchResults.filter((result) => {
		if (!query) return true;

		const lowerQuery = query.toLowerCase();
		const queriesToCheck = [lowerQuery];

		if (showSimilarQueries) {
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
					bb.query.toLowerCase().includes(query.toLowerCase())
		  )
		: [];

	return (
		<Box
			bg="bg.default"
			borderL="1"
			borderColor="border.tertiary"
			h="full"
			style={{width: "400px"}}
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
					<TabsList>
						<TabsTrigger value="detailed">Detailed</TabsTrigger>
						<TabsTrigger value="top10">Top 10 Queries</TabsTrigger>
						<TabsTrigger value="demo">Demo</TabsTrigger>
					</TabsList>
					<Box mt="16">
						<Input
							placeholder="Products"
							addonBefore={<IconSearch size={16} />}
							value={query}
							onChange={(e) => setQuery(e.target.value)}
						/>
					</Box>
					<Flex
						gap="16"
						mt="16"
						alignItems="center"
					>
						<Flex
							gap="32"
							alignItems="center"
							flexDirection="row"
							justifyContent="space-around"
						>
							<Flex
								flexDirection="row"
								gap="8"
							>
								<Switch
									checked={showSimilarQueries}
									onCheckedChange={setShowSimilarQueries}
								/>
								<Text fontSize="sm">Similar Queries</Text>
							</Flex>
							<Flex
								flexDirection="row"
								gap="8"
							>
								<Switch
									checked={showBestBets}
									onCheckedChange={setShowBestBets}
								/>
								<Text fontSize="sm">Best bets</Text>
							</Flex>
						</Flex>
					</Flex>
					{activeSynonyms.length > 0 && (
						<Box mt="16">
							<Text
								fontSize="md"
								fontWeight="600"
								mb="4"
							>
								Similar Queries Applied
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
			<Separator my="16" />
			<Box
				flex="1"
				overflow="auto"
				px="24"
			>
				<Flex
					flexDirection="column"
					gap="16"
				>
					{activeBestBets.map((bb, i) => (
						<ResultItem
							key={`bb-${i}`}
							isBestBet
							title={bb.query} // Using query as title for now, or we could look up a matching result
							description={`Best Bet for "${bb.query}"`}
							url={bb.destination}
						/>
					))}
					{filteredResults.map((result, i) => (
						<ResultItem
							key={i}
							title={result.title}
							description={result.description}
							url={result.url}
						/>
					))}
					{filteredResults.length === 0 && activeBestBets.length === 0 && (
						<Text color="fg.secondary">No results found.</Text>
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
				justifyContent="flex-end"
				alignItems="start"
				flexDirection="row"
				mb="4"
			>
				{isBestBet && <Badge intent="information">Best bet</Badge>}
				<Badge>Page</Badge>
			</Flex>
			<Text
				fontWeight="600"
				fontSize="md"
				mb="4"
			>
				{title}
			</Text>
			<Text
				fontSize="sm"
				color="fg.secondary"
				mb="4"
			>
				{description}
			</Text>
			<Flex
				justifyContent="space-between"
				alignItems="end"
			>
				<Text
					fontSize="xs"
					color="fg.tertiary"
				>
					{url}
				</Text>
				<IconActivity
					size={16}
					color="var(--fg-accent)"
				/>
			</Flex>
		</Box>
	);
}
