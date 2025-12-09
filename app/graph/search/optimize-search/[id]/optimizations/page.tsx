"use client";

import {Box, Heading, Alert, Link} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {Button} from "@/app/components/Button";
import {Flex} from "@/app/components/Flex";
import {useParams} from "next/navigation";
import {useState} from "react";
import usePersistentState from "@/app/usePersistentState";
import {
	BestBet,
	initialBestBets,
	AlgorithmBestBet,
	RelatedQuery,
	initialRelatedQueries,
} from "@/app/db/initialData";
import {IconPlus} from "@tabler/icons-react";
import Preview from "../order/Preview";
import BestBetsTable from "../../../components/BestBetsTable";
import BestBetDialog from "../../../components/BestBetDialog";
import RelatedQueriesTable from "../../../components/RelatedQueriesTable";
import RelatedQueryDialog from "../../../components/RelatedQueryDialog";
import {Aside} from "@/app/context/LayoutContext";
import searchResults from "@/app/db/searchResults.json";
import {Menu, MenuTrigger, MenuContent} from "@optiaxiom/react";

export default function OptimizationsPage() {
	const params = useParams();
	const id = params.id as string;

	// Global list of best bets
	const [allBestBets, setAllBestBets] = usePersistentState("bestBets", initialBestBets) as [
		BestBet[],
		(val: BestBet[]) => void
	];

	// Best bets associated with this algorithm
	const [algorithmBestBets, setAlgorithmBestBets] = usePersistentState(
		`algorithm_best_bets_${id}`,
		[]
	) as [AlgorithmBestBet[], (val: AlgorithmBestBet[]) => void];

	const [allRelatedQueries, setAllRelatedQueries] = usePersistentState(
		"relatedQueries",
		initialRelatedQueries
	) as [RelatedQuery[], (val: RelatedQuery[]) => void];

	const [relatedQueries, setRelatedQueries] = usePersistentState(
		`algorithm_related_queries_${id}`,
		[]
	) as [RelatedQuery[], (val: RelatedQuery[]) => void];

	const [selectedBestBetQuery, setSelectedBestBetQuery] = useState("");

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingBestBet, setEditingBestBet] = useState<AlgorithmBestBet | null>(null);
	const [createBestBetInitialData, setCreateBestBetInitialData] = useState<
		{query: string; destination: string} | undefined
	>(undefined);

	const [isCreateRQDialogOpen, setIsCreateRQDialogOpen] = useState(false);
	const [isEditRQDialogOpen, setIsEditRQDialogOpen] = useState(false);
	const [editingRQ, setEditingRQ] = useState<RelatedQuery | null>(null);

	const handleCreateBestBetFromPreview = (query: string) => {
		setCreateBestBetInitialData({query, destination: ""});
		setIsCreateDialogOpen(true);
	};

	const handleCreateBestBet = (data: {
		query: string;
		destination: string;
		status?: "Active" | "Inactive";
	}) => {
		const newBestBet: BestBet = {
			query: data.query,
			destination: data.destination,
			owner: "Alice Johnson",
		};

		// Add to global list if not exists
		if (!allBestBets.some((b) => b.query === newBestBet.query)) {
			setAllBestBets([...allBestBets, newBestBet]);
		}

		// Add to local algorithm list
		const newAlgorithmBestBet: AlgorithmBestBet = {
			...newBestBet,
			status: data.status || "Active",
		};
		setAlgorithmBestBets([...algorithmBestBets, newAlgorithmBestBet]);

		setIsCreateDialogOpen(false);
		setCreateBestBetInitialData(undefined);
	};

	const handleRemoveBestBet = (query: string) => {
		setAlgorithmBestBets(algorithmBestBets.filter((b) => b.query !== query));
	};

	const handleEditClick = (bet: BestBet | AlgorithmBestBet) => {
		const algoBet = bet as AlgorithmBestBet;
		setEditingBestBet(algoBet);
		setIsEditDialogOpen(true);
	};

	const handleUpdateBestBet = (data: {
		query: string;
		destination: string;
		status?: "Active" | "Inactive";
	}) => {
		if (!editingBestBet) return;

		const updatedBet = {
			...editingBestBet,
			query: data.query,
			destination: data.destination,
			status: data.status || "Active",
		};

		// Update global list
		const updatedAllBestBets = allBestBets.map((b) =>
			b.query === editingBestBet.query
				? {
						...b,
						query: data.query,
						destination: data.destination,
				  }
				: b
		);
		setAllBestBets(updatedAllBestBets);

		// Update local algorithm list
		const updatedAlgorithmBestBets = algorithmBestBets.map((b) =>
			b.query === editingBestBet.query ? updatedBet : b
		);
		setAlgorithmBestBets(updatedAlgorithmBestBets);

		setIsEditDialogOpen(false);
		setEditingBestBet(null);
	};

	const handleToggleStatus = (bet: AlgorithmBestBet, newStatus: "Active" | "Inactive") => {
		const updatedBet = {...bet, status: newStatus};

		// Update local algorithm list
		const updatedAlgorithmBestBets = algorithmBestBets.map((b) =>
			b.query === bet.query ? updatedBet : b
		);
		setAlgorithmBestBets(updatedAlgorithmBestBets);
	};

	const handleAddRelatedQuery = (data: {query: string; synonyms: string[]}) => {
		const newRQ = {
			query: data.query,
			synonyms: data.synonyms,
			owner: "Alice Johnson",
		};

		if (!allRelatedQueries.some((rq) => rq.query === newRQ.query)) {
			setAllRelatedQueries([...allRelatedQueries, newRQ]);
		}

		setRelatedQueries([...relatedQueries, newRQ]);
		setIsCreateRQDialogOpen(false);
	};

	const handleEditRQClick = (rq: RelatedQuery) => {
		setEditingRQ(rq);
		setIsEditRQDialogOpen(true);
	};

	const handleUpdateRelatedQuery = (data: {query: string; synonyms: string[]}) => {
		if (!editingRQ) return;

		const updatedList = relatedQueries.map((item) =>
			item.query === editingRQ.query
				? {
						...item,
						query: data.query,
						synonyms: data.synonyms,
				  }
				: item
		);

		setRelatedQueries(updatedList);
		setIsEditRQDialogOpen(false);
		setEditingRQ(null);
	};

	const handleRemoveRelatedQuery = (query: string) => {
		setRelatedQueries(relatedQueries.filter((rq) => rq.query !== query));
	};

	// Filter out already added bets from the dropdown
	const availableOptions = allBestBets.filter(
		(b) => !algorithmBestBets.some((added) => added.query === b.query)
	);

	const availableRelatedQueries = allRelatedQueries.filter(
		(rq) => !relatedQueries.some((added) => added.query === rq.query)
	);

	return (
		<>
			<Box flex="1">
				<Heading
					level="4"
					mb="16"
				>
					Best Bets
				</Heading>
				<Text
					mb="16"
					color="fg.secondary"
				>
					Associate specific best bets with this algorithm to override default behavior.
				</Text>

				{algorithmBestBets.length > 0 ? (
					<BestBetsTable
						bestBets={algorithmBestBets}
						onEdit={handleEditClick}
						onRemove={handleRemoveBestBet}
						availableBestBets={availableOptions}
						onAdd={(bet) =>
							setAlgorithmBestBets([...algorithmBestBets, {...bet, status: "Active"}])
						}
						onCreate={() => {
							setCreateBestBetInitialData(undefined);
							setIsCreateDialogOpen(true);
						}}
						onToggleStatus={handleToggleStatus}
					/>
				) : (
					<Alert intent="information">
						<Text>
							No similar Best Bets defined yet.{" "}
							<Menu
								options={[
									{
										group: {label: "", hidden: true, separator: true},
										label: "Create New Best Bet",
										addon: <IconPlus size={16} />,
										execute: () => {
											setCreateBestBetInitialData(undefined);
											setIsCreateDialogOpen(true);
										},
									},
									...(availableOptions.length > 0
										? availableOptions.map((bet) => ({
												label:
													searchResults.find(
														(r) => r.url === bet.destination
													)?.title || bet.destination,
												value: bet.query,
												description: bet.query,
												execute: () =>
													setAlgorithmBestBets([
														...algorithmBestBets,
														{...bet, status: "Active" as const},
													]),
										  }))
										: []),
								]}
							>
								<MenuTrigger asChild>
									<Link cursor="pointer">Add one...</Link>
								</MenuTrigger>
								<MenuContent />
							</Menu>
						</Text>
					</Alert>
				)}

				<Box mt="32">
					<Heading
						level="4"
						mb="16"
					>
						Related Queries
					</Heading>
					<Text
						mb="16"
						color="fg.secondary"
					>
						Define groups of queries that should be treated as synonyms to improve
						search recall.
					</Text>

					{relatedQueries.length > 0 ? (
						<>
							<RelatedQueriesTable
								relatedQueries={relatedQueries}
								onEdit={handleEditRQClick}
								onRemove={handleRemoveRelatedQuery}
								showOwner={false}
							/>

							<Menu
								options={[
									{
										group: {label: "", hidden: true, separator: true},
										label: "Create New Related Query",
										addon: <IconPlus size={16} />,
										execute: () => setIsCreateRQDialogOpen(true),
									},
									...(availableRelatedQueries.length > 0
										? availableRelatedQueries.map((rq) => ({
												label: rq.query,
												value: rq.query,
												description: rq.synonyms.join(", "),
												execute: () =>
													setRelatedQueries([...relatedQueries, rq]),
										  }))
										: []),
								]}
							>
								<MenuTrigger
									size="lg"
									mt="16"
									addonBefore={<IconPlus size={16} />}
								>
									Add Related Query...
								</MenuTrigger>
								<MenuContent />
							</Menu>
						</>
					) : (
						<Alert intent="information">
							<Text>
								No Related Queries defined yet.{" "}
								<Menu
									options={[
										{
											group: {label: "", hidden: true, separator: true},
											label: "Create New Related Query",
											addon: <IconPlus size={16} />,
											execute: () => setIsCreateRQDialogOpen(true),
										},
										...(availableRelatedQueries.length > 0
											? availableRelatedQueries.map((rq) => ({
													label: rq.query,
													value: rq.query,
													description: rq.synonyms.join(", "),
													execute: () =>
														setRelatedQueries([...relatedQueries, rq]),
											  }))
											: []),
									]}
								>
									<MenuTrigger asChild>
										<Link cursor="pointer">Add one...</Link>
									</MenuTrigger>
									<MenuContent />
								</Menu>
							</Text>
						</Alert>
					)}
				</Box>

				<BestBetDialog
					open={isCreateDialogOpen}
					setOpen={setIsCreateDialogOpen}
					mode="create"
					initialData={createBestBetInitialData}
					onSave={handleCreateBestBet}
					showStatus={true}
				/>

				<BestBetDialog
					open={isEditDialogOpen}
					setOpen={setIsEditDialogOpen}
					mode="edit"
					initialData={editingBestBet || undefined}
					onSave={handleUpdateBestBet}
					showStatus={true}
				/>

				<RelatedQueryDialog
					open={isCreateRQDialogOpen}
					setOpen={setIsCreateRQDialogOpen}
					mode="create"
					onSave={handleAddRelatedQuery}
				/>

				<RelatedQueryDialog
					open={isEditRQDialogOpen}
					setOpen={setIsEditRQDialogOpen}
					mode="edit"
					initialData={editingRQ || undefined}
					onSave={handleUpdateRelatedQuery}
				/>
			</Box>

			<Aside>
				<Preview
					algorithmBestBets={algorithmBestBets}
					relatedQueries={relatedQueries}
					onCreateBestBet={handleCreateBestBetFromPreview}
				/>
			</Aside>
		</>
	);
}
