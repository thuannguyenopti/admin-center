"use client";

import Item from "@/app/components/Item";
import {
	Box,
	DataTable,
	DataTableBody,
	Menu,
	MenuContent,
	MenuTrigger,
	LabelMenuButton,
} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {Button} from "@/app/components/Button";
import {Input} from "@/app/components/Input";
import {Flex} from "@/app/components/Flex";
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
import {initialAlgorithms, BestBet, initialBestBets, AlgorithmBestBet} from "@/app/db/initialData";
import {zeroResultQueries, ZeroResultQuery, scaleValue} from "@/app/db/analyticsData";
import usePersistentState from "@/app/usePersistentState";

const columnHelper = createColumnHelper<ZeroResultQuery>();

const allData: ZeroResultQuery[] = zeroResultQueries;

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
												destination: "",
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
										let algoBets: AlgorithmBestBet[] = storedAlgoBets
											? JSON.parse(storedAlgoBets)
											: [];

										if (!algoBets.some((b) => b.query === targetBet!.query)) {
											algoBets.push({...targetBet!, status: "Inactive"});
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
		let data = allData;

		// Filter by Time Range
		const now = new Date();
		data = data
			.filter((item) => {
				const itemDate = new Date(item.lastSeen);
				const diffTime = Math.abs(now.getTime() - itemDate.getTime());
				const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

				switch (timeRange) {
					case "24h":
						return diffDays <= 1; // Approximation
					case "7d":
						return diffDays <= 7;
					case "30d":
						return diffDays <= 30;
					case "90d":
						return diffDays <= 90;
					default:
						return true;
				}
			})
			.map((item) => ({
				...item,
				frequency: scaleValue(item.frequency, timeRange),
			}));

		if (!searchQuery) return data;

		const query = searchQuery.toLowerCase();
		return data.filter(
			(item) =>
				item.query.toLowerCase().includes(query) ||
				item.algorithm.toLowerCase().includes(query)
		);
	}, [searchQuery, timeRange]);

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
