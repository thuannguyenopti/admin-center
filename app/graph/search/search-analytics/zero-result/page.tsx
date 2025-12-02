"use client";

import Item from "@/app/components/Item";
import {
	Box,
	Button,
	DataTable,
	DataTableBody,
	Flex,
	Input,
	Menu,
	MenuContent,
	MenuTrigger,
	Text,
	LabelMenuButton,
} from "@optiaxiom/react";
import {
	IconSearch,
	IconAlertCircle,
	IconDots,
	IconAnalyze,
	IconRocket,
	IconBook,
	IconReportSearch,
} from "@tabler/icons-react";
import {useReactTable, getCoreRowModel, createColumnHelper} from "@tanstack/react-table";
import {useState, useMemo} from "react";
import {useRouter} from "next/navigation";
import {initialAlgorithms, BestBet, initialBestBets} from "@/app/db/initialData";
import usePersistentState from "@/app/usePersistentState";

type ZeroResultQuery = {
	query: string;
	frequency: number;
	lastSeen: string;
	algorithm: string;
};

const columnHelper = createColumnHelper<ZeroResultQuery>();

const allData: ZeroResultQuery[] = [
	{
		query: "vintage leather wallet",
		frequency: 127,
		lastSeen: "2024-11-27 14:32",
		algorithm: "Semantic Search v2",
	},
	{
		query: "waterproof hiking boots size 12",
		frequency: 98,
		lastSeen: "2024-11-27 13:45",
		algorithm: "Product Boost Algorithm",
	},
	{
		query: "organic cotton t-shirt blue",
		frequency: 84,
		lastSeen: "2024-11-27 12:18",
		algorithm: "Category Relevance",
	},
	{
		query: "wireless earbuds noise cancelling",
		frequency: 76,
		lastSeen: "2024-11-27 11:02",
		algorithm: "Semantic Search v2",
	},
	{
		query: "bamboo cutting board large",
		frequency: 62,
		lastSeen: "2024-11-27 09:54",
		algorithm: "Personalized Ranking",
	},
	{
		query: "stainless steel water bottle 32oz",
		frequency: 58,
		lastSeen: "2024-11-27 08:21",
		algorithm: "Trending Items Boost",
	},
	{
		query: "memory foam pillow king size",
		frequency: 51,
		lastSeen: "2024-11-26 22:15",
		algorithm: "Category Relevance",
	},
	{
		query: "yoga mat extra thick purple",
		frequency: 47,
		lastSeen: "2024-11-26 19:33",
		algorithm: "Semantic Search v2",
	},
	{
		query: "ceramic coffee mug set of 4",
		frequency: 43,
		lastSeen: "2024-11-26 16:47",
		algorithm: "Product Boost Algorithm",
	},
	{
		query: "electric standing desk adjustable",
		frequency: 39,
		lastSeen: "2024-11-26 14:28",
		algorithm: "Personalized Ranking",
	},
];

type TimeRange = "24h" | "7d" | "30d" | "90d";

export default function ZeroResultPage() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [timeRange, setTimeRange] = useState<TimeRange>("7d");
	const [bestBets, setBestBets] = usePersistentState("bestBets", initialBestBets) as [
		BestBet[],
		(val: BestBet[]) => void
	];

	const columns = useMemo(
		() => [
			columnHelper.accessor("query", {
				header: "Query",
				cell: (info) => (
					<Flex
						gap="8"
						alignItems="center"
					>
						<Text>{info.getValue()}</Text>
					</Flex>
				),
			}),
			columnHelper.accessor("frequency", {
				header: "Frequency",
				cell: (info) => `${info.getValue()} times`,
			}),
			columnHelper.accessor("lastSeen", {header: "Last Seen"}),
			columnHelper.accessor("algorithm", {
				header: "Algorithm Reference",
				cell: (info) => (
					<Item
						icon={<IconReportSearch size={16} />}
						title={info.getValue()}
					/>
				),
			}),
			columnHelper.display({
				id: "actions",
				header: "",
				size: 24,
				maxSize: 24,
				cell: (info) => (
					<Menu
						options={[
							// {
							// 	group: {label: "Manage Algorithm", separator: false},
							// 	addon: <IconAnalyze size={16} />,
							// 	label: "Suggest Optimization",
							// 	execute: () => {
							// 		// Edit action
							// 	},
							// },
							{
								addon: <IconRocket size={16} />,
								label: "Add Best Bet",
								execute: () => {
									const algoName = info.row.original.algorithm;
									const query = info.row.original.query;
									const algo = initialAlgorithms.find((a) => a.name === algoName);

									if (algo) {
										// 1. Create/Find Best Bet in Global List
										let currentBestBets = [...bestBets];
										let targetBet = currentBestBets.find(
											(b) => b.query === query
										);

										if (!targetBet) {
											targetBet = {
												query: query,
												destination: `/${query.replace(/\s+/g, "-")}`,
												status: "Active",
												owner: "Alice Johnson",
											};
											currentBestBets.push(targetBet);
											// Manually update localStorage to ensure next page sees it immediately
											localStorage.setItem(
												"bestBets",
												JSON.stringify(currentBestBets)
											);
											setBestBets(currentBestBets);
										}

										// 2. Add to Algorithm Specific List
										const algoKey = `algorithm_best_bets_${algo.id}`;
										const storedAlgoBets = localStorage.getItem(algoKey);
										let algoBets: BestBet[] = storedAlgoBets
											? JSON.parse(storedAlgoBets)
											: [];

										if (!algoBets.some((b) => b.query === targetBet!.query)) {
											algoBets.push(targetBet!);
											localStorage.setItem(algoKey, JSON.stringify(algoBets));
										}

										router.push(
											`/graph/search/optimize-search/${algo.id}/optimizations`
										);
									}
								},
							},
							// {
							// 	addon: <IconBook size={16} />,
							// 	label: "Add Synonym",
							// 	execute: () => {
							// 		// Edit action
							// 	},
							// },
						]}
					>
						<MenuTrigger
							icon={<IconDots />}
							aria-label="add ele"
							appearance="subtle"
							size="sm"
							iconPosition="start"
						/>
						<MenuContent />
					</Menu>
				),
			}),
		],
		[router, bestBets, setBestBets]
	);

	const timeRangeLabels = {
		"24h": "Last 24 hours",
		"7d": "Last 7 days",
		"30d": "Last 30 days",
		"90d": "Last 90 days",
	};

	const filteredData = useMemo(() => {
		if (!searchQuery) return allData;

		const query = searchQuery.toLowerCase();
		return allData.filter(
			(item) =>
				item.query.toLowerCase().includes(query) ||
				item.algorithm.toLowerCase().includes(query)
		);
	}, [searchQuery]);

	const table = useReactTable({
		columns,
		data: filteredData,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<Box>
			<Flex
				flexDirection="row"
				justifyContent="space-between"
				alignItems="center"
				gap="16"
				mb="24"
			>
				<Flex
					gap="8"
					flexDirection="row"
				>
					<Input
						size="lg"
						addonBefore={<IconSearch size={16} />}
						placeholder="Search queries..."
						style={{width: "320px"}}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<Menu
						options={[
							{label: "Last 24 hours", execute: () => setTimeRange("24h")},
							{label: "Last 7 days", execute: () => setTimeRange("7d")},
							{label: "Last 30 days", execute: () => setTimeRange("30d")},
							{label: "Last 90 days", execute: () => setTimeRange("90d")},
						]}
					>
						<MenuTrigger asChild>
							<LabelMenuButton label="Time Range">
								{timeRangeLabels[timeRange]}
							</LabelMenuButton>
						</MenuTrigger>
						<MenuContent />
					</Menu>
				</Flex>
				<Button
					appearance="primary-opal"
					size="lg"
				>
					Suggest Optimization
				</Button>
			</Flex>

			<DataTable table={table}>
				<DataTableBody />
			</DataTable>
		</Box>
	);
}
