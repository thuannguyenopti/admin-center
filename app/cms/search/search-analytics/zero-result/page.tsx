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
	BestBet,
	initialBestBets,
	AlgorithmBestBet,
	AlgorithmBestBetReference,
	Algorithm,
} from "@/app/db/initialData";
import {zeroResultQueries, ZeroResultQuery, scaleValue} from "@/app/db/analyticsData";
import usePersistentState from "@/app/usePersistentState";
import BestBetDialog from "../../components/BestBetDialog";
import {Table, Tr, Td, Th} from "@/app/components/Table";
import Link from "next/link";

const allData: ZeroResultQuery[] = zeroResultQueries;

type TimeRange = "24h" | "7d" | "30d" | "90d";

export default function ZeroResultPage() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [timeRange, setTimeRange] = useState<TimeRange>("7d");
	const [algorithms] = usePersistentState("algorithms", initialAlgorithms) as [Algorithm[], any];
	const [bestBets, setBestBets] = usePersistentState("bestBets", initialBestBets) as [
		BestBet[],
		(val: BestBet[]) => void
	];

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [createBestBetInitialData, setCreateBestBetInitialData] = useState<
		{query: string; destination: string} | undefined
	>(undefined);
	const [targetAlgorithm, setTargetAlgorithm] = useState<Algorithm | null>(null);

	const handleCreateBestBet = (data: {
		query: string;
		destination: string;
		status?: "Active" | "Inactive";
	}) => {
		if (!targetAlgorithm) return;

		// 1. Create/Find Best Bet in Global List
		let currentBestBets = [...bestBets];
		let targetBet = currentBestBets.find((b) => b.query === data.query);

		if (!targetBet) {
			targetBet = {
				id: Date.now().toString(),
				query: data.query,
				destination: data.destination,
				owner: "Alice Johnson",
			};
			currentBestBets.push(targetBet);
			// Manually update localStorage to ensure next page sees it immediately
			localStorage.setItem("bestBets", JSON.stringify(currentBestBets));
			setBestBets(currentBestBets);
		} else {
			if (targetBet.destination !== data.destination) {
				targetBet.destination = data.destination;
				localStorage.setItem("bestBets", JSON.stringify(currentBestBets));
				setBestBets(currentBestBets);
			}
		}

		// 2. Add to Algorithm Specific List
		const algoKey = `algorithm_best_bets_${targetAlgorithm.id}`;
		const storedAlgoBets = localStorage.getItem(algoKey);
		let algoBets: AlgorithmBestBetReference[] = storedAlgoBets
			? JSON.parse(storedAlgoBets)
			: [];

		if (!algoBets.some((b) => b.bestBetId === targetBet!.id)) {
			algoBets.push({bestBetId: targetBet!.id, status: data.status || "Active"});
			localStorage.setItem(algoKey, JSON.stringify(algoBets));
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
											label: "Add Best Bet",
											execute: () => {
												const algoName = row.algorithm;
												const query = row.query;
												const algo = algorithms.find(
													(a) => a.name === algoName
												);

												if (algo) {
													setTargetAlgorithm(algo);
													setCreateBestBetInitialData({
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
										iconPosition="start"
									/>
									<MenuContent />
								</Menu>
							</Td>
						</Tr>
					))}
				</tbody>
			</Table>

			<BestBetDialog
				open={isCreateDialogOpen}
				setOpen={setIsCreateDialogOpen}
				mode="create"
				initialData={createBestBetInitialData}
				onSave={handleCreateBestBet}
				showStatus={true}
			/>
		</Box>
	);
}
