"use client";

import Item from "@/app/components/Item";
import {Box, Menu, MenuContent, MenuTrigger, LabelMenuButton} from "@optiaxiom/react";
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
import {useState, useMemo} from "react";
import {useRouter} from "next/navigation";
import {
	initialAlgorithms,
	PinnedResult,
	initialPinnedResults,
	AlgorithmPinnedResult,
	AlgorithmPinnedResultReference,
	Algorithm,
} from "@/app/db/initialData";
import {zeroResultQueries, ZeroResultQuery, scaleValue} from "@/app/db/analyticsData";
import usePersistentState from "@/app/usePersistentState";
import PinnedResultDialog from "../../components/PinnedResultDialog";
import {Table, Tr, Td, Th} from "@/app/components/Table";
import Link from "next/link";

const allData: ZeroResultQuery[] = zeroResultQueries;

type TimeRange = "24h" | "7d" | "30d" | "90d";

export default function ZeroResultPage() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [timeRange, setTimeRange] = useState<TimeRange>("7d");
	const [algorithms] = usePersistentState("algorithms", initialAlgorithms) as [Algorithm[], any];
	const [pinnedResults, setPinnedResults] = usePersistentState(
		"pinnedResults",
		initialPinnedResults
	) as [PinnedResult[], (val: PinnedResult[]) => void];

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [createPinnedResultInitialData, setCreatePinnedResultInitialData] = useState<
		{query: string; destination: string} | undefined
	>(undefined);
	const [targetAlgorithm, setTargetAlgorithm] = useState<Algorithm | null>(null);

	const handleCreatePinnedResult = (data: {
		query: string;
		destination: string;
		status?: "Active" | "Inactive";
	}) => {
		if (!targetAlgorithm) return;

		// 1. Create/Find Pinned Result in Global List
		let currentPinnedResults = [...pinnedResults];
		let targetResult = currentPinnedResults.find((b) => b.query === data.query);

		if (!targetResult) {
			targetResult = {
				id: Date.now().toString(),
				query: data.query,
				destination: data.destination,
				owner: "Alice Johnson",
			};
			currentPinnedResults.push(targetResult);
			// Manually update localStorage to ensure next page sees it immediately
			localStorage.setItem("pinnedResults", JSON.stringify(currentPinnedResults));
			setPinnedResults(currentPinnedResults);
		} else {
			if (targetResult.destination !== data.destination) {
				targetResult.destination = data.destination;
				localStorage.setItem("pinnedResults", JSON.stringify(currentPinnedResults));
				setPinnedResults(currentPinnedResults);
			}
		}

		// 2. Add to Algorithm Specific List
		const algoKey = `algorithm_pinned_results_${targetAlgorithm.id}`;
		const storedAlgoResults = localStorage.getItem(algoKey);
		let algoResults: AlgorithmPinnedResultReference[] = storedAlgoResults
			? JSON.parse(storedAlgoResults)
			: [];

		if (!algoResults.some((b) => b.pinnedResultId === targetResult!.id)) {
			algoResults.push({pinnedResultId: targetResult!.id, status: data.status || "Active"});
			localStorage.setItem(algoKey, JSON.stringify(algoResults));
		}

		setIsCreateDialogOpen(false);
		router.push(`/cms/search/algorithms/${targetAlgorithm.id}/optimizations`);
	};

	const timeRangeLabels = {
		"24h": "Last 24 hours",
		"7d": "Last 7 days",
		"30d": "Last 30 days",
		"90d": "Last 90 days",
	};

	const filteredData = useMemo(() => {
		let data = allData;

		// Filter by Time Range
		const dates = data.map((d) => new Date(d.lastSeen).getTime());
		const latestDate = dates.length > 0 ? Math.max(...dates) : Date.now();
		const now = new Date(latestDate);
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

	return (
		<Box>
			<Flex
				flexDirection="row"
				justifyContent="space-between"
				alignItems="center"
				gap="16"
				mb="24"
			>
				<Flex gap="8" flexDirection="row">
					<Input
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
				<Button appearance="primary-opal" size="lg">
					Suggest Optimization
				</Button>
			</Flex>

			<Table>
				<thead>
					<Tr>
						<Th>Query</Th>
						<Th>Frequency</Th>
						<Th>Last Seen</Th>
						<Th>Algorithm</Th>
						<Th></Th>
					</Tr>
				</thead>
				<tbody>
					{filteredData.map((row, i) => (
						<Tr key={i}>
							<Td type="header">{row.query}</Td>
							<Td>{row.frequency} times</Td>
							<Td>{row.lastSeen}</Td>
							<Td type="raw">
								<Link
									href={`/cms/search/algorithms/${
										algorithms.find((a) => a.name === row.algorithm)?.id
									}/optimizations`}
								>
									<Item
										icon={<IconReportSearch size={16} />}
										title={row.algorithm}
									/>
								</Link>
							</Td>
							<Td type="button">
								<Menu
									options={[
										{
											addon: <IconRocket size={16} />,
											label: "Add Pinned Result",
											execute: () => {
												const algoName = row.algorithm;
												const query = row.query;
												const algo = algorithms.find(
													(a) => a.name === algoName
												);

												if (algo) {
													setTargetAlgorithm(algo);
													setCreatePinnedResultInitialData({
														query,
														destination: "",
													});
													setIsCreateDialogOpen(true);
												}
											},
										},
									]}
								>
									<MenuTrigger
										icon={<IconDots />}
										aria-label="add ele"
										appearance="subtle"
										size="sm"
									/>
									<MenuContent />
								</Menu>
							</Td>
						</Tr>
					))}
				</tbody>
			</Table>

			<PinnedResultDialog
				open={isCreateDialogOpen}
				setOpen={setIsCreateDialogOpen}
				mode="create"
				initialData={createPinnedResultInitialData}
				onSave={handleCreatePinnedResult}
				showStatus={true}
			/>
		</Box>
	);
}
