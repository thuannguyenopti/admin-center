"use client";

import {Box, Heading, Alert, Link} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {Button} from "@/app/components/Button";
import {Flex} from "@/app/components/Flex";
import {useParams, useRouter} from "next/navigation";
import {use} from "react";
import {useState, useEffect} from "react";
import usePersistentState from "@/app/usePersistentState";
import {
	BestBet,
	initialBestBets,
	AlgorithmBestBet,
	AlgorithmBestBetReference,
	RelatedQuery,
	AlgorithmRelatedQueryReference,
	initialRelatedQueries,
	Algorithm,
	initialAlgorithms,
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
import {Table, Tr, Td, Th} from "@/app/components/Table";

export default function OptimizationsPage() {
	const params = useParams();
	const router = useRouter();
	const resolvedParams = params instanceof Promise ? use(params) : params;
	const id = (resolvedParams?.id ?? "") as string;

	const [algorithms] = usePersistentState("algorithms", initialAlgorithms) as [Algorithm[], any];
	const currentAlgorithm = algorithms.find((a) => a.id === id);
	const isCustom = currentAlgorithm?.type === "Custom";

	useEffect(() => {
		if (isCustom) {
			router.replace(`/cms/search/algorithms/${id}/filter`);
		}
	}, [isCustom, id, router]);

	// Global list of best bets
	const [allBestBets, setAllBestBets] = usePersistentState("bestBets", initialBestBets) as [
		BestBet[],
		(val: BestBet[]) => void
	];

	// Best bets associated with this algorithm
	const [algorithmBestBets, setAlgorithmBestBets] = usePersistentState(
		`algorithm_best_bets_${id}`,
		[]
	) as [AlgorithmBestBetReference[], (val: AlgorithmBestBetReference[]) => void];

	const hydratedBestBets = algorithmBestBets
		.map((ref) => {
			const bb = allBestBets.find((g) => g.id === ref.bestBetId);
			if (!bb) return null;
			return {...bb, status: ref.status};
		})
		.filter((item): item is BestBet & {status: "Active" | "Inactive"} => item !== null);

	const [allRelatedQueries, setAllRelatedQueries] = usePersistentState(
		"relatedQueries",
		initialRelatedQueries
	) as [RelatedQuery[], (val: RelatedQuery[]) => void];

	const [relatedQueries, setRelatedQueries] = usePersistentState(
		`algorithm_related_queries_${id}`,
		[]
	) as [AlgorithmRelatedQueryReference[], (val: AlgorithmRelatedQueryReference[]) => void];

	const hydratedRelatedQueries = relatedQueries
		.map((ref) => allRelatedQueries.find((rq) => rq.id === ref.relatedQueryId))
		.filter((item): item is RelatedQuery => item !== undefined);

	const [selectedBestBetQuery, setSelectedBestBetQuery] = useState("");

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingBestBet, setEditingBestBet] = useState<
		(BestBet & {status: "Active" | "Inactive"}) | null
	>(null);
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
		const newId = Date.now().toString();
		const newBestBet: BestBet = {
			id: newId,
			query: data.query,
			destination: data.destination,
			owner: "Alice Johnson",
		};

		// Add to global list if not exists
		if (!allBestBets.some((b) => b.query === newBestBet.query)) {
			setAllBestBets([...allBestBets, newBestBet]);
		}

		// Add to local algorithm list
		const newAlgorithmBestBet: AlgorithmBestBetReference = {
			bestBetId: newId,
			status: data.status || "Active",
		};
		setAlgorithmBestBets([...algorithmBestBets, newAlgorithmBestBet]);

		setIsCreateDialogOpen(false);
		setCreateBestBetInitialData(undefined);
	};

	const handleRemoveBestBet = (query: string) => {
		// Find the ID for this query
		const bet = hydratedBestBets.find((b) => b.query === query);
		if (bet) {
			setAlgorithmBestBets(algorithmBestBets.filter((b) => b.bestBetId !== bet.id));
		}
	};

	const handleEditClick = (bet: BestBet | (BestBet & {status: "Active" | "Inactive"})) => {
		const algoBet = bet as BestBet & {status: "Active" | "Inactive"};
		setEditingBestBet(algoBet);
		setIsEditDialogOpen(true);
	};

	const handleUpdateBestBet = (data: {
		query: string;
		destination: string;
		status?: "Active" | "Inactive";
	}) => {
		if (!editingBestBet) return;

		// Update global list
		const updatedAllBestBets = allBestBets.map((b) =>
			b.id === editingBestBet.id
				? {
						...b,
						query: data.query,
						destination: data.destination,
				  }
				: b
		);
		setAllBestBets(updatedAllBestBets);

		// Update local algorithm list status
		const updatedAlgorithmBestBets = algorithmBestBets.map((b) =>
			b.bestBetId === editingBestBet.id ? {...b, status: data.status || "Active"} : b
		);
		setAlgorithmBestBets(updatedAlgorithmBestBets);

		setIsEditDialogOpen(false);
		setEditingBestBet(null);
	};

	const handleToggleStatus = (
		bet: BestBet & {status: "Active" | "Inactive"},
		newStatus: "Active" | "Inactive"
	) => {
		// Update local algorithm list
		const updatedAlgorithmBestBets = algorithmBestBets.map((b) =>
			b.bestBetId === bet.id ? {...b, status: newStatus} : b
		);
		setAlgorithmBestBets(updatedAlgorithmBestBets);
	};

	const handleAddRelatedQuery = (data: {query: string; synonyms: string[]}) => {
		const newId = Date.now().toString();
		const newRQ: RelatedQuery = {
			id: newId,
			query: data.query,
			synonyms: data.synonyms,
			owner: "Alice Johnson",
		};

		if (!allRelatedQueries.some((rq) => rq.query === newRQ.query)) {
			setAllRelatedQueries([...allRelatedQueries, newRQ]);
		}

		setRelatedQueries([...relatedQueries, {relatedQueryId: newId}]);
		setIsCreateRQDialogOpen(false);
	};

	const handleEditRQClick = (rq: RelatedQuery) => {
		setEditingRQ(rq);
		setIsEditRQDialogOpen(true);
	};

	const handleUpdateRelatedQuery = (data: {query: string; synonyms: string[]}) => {
		if (!editingRQ) return;

		const updatedList = allRelatedQueries.map((item) =>
			item.id === editingRQ.id
				? {
						...item,
						query: data.query,
						synonyms: data.synonyms,
				  }
				: item
		);

		setAllRelatedQueries(updatedList);
		setIsEditRQDialogOpen(false);
		setEditingRQ(null);
	};

	const handleRemoveRelatedQuery = (query: string) => {
		const rq = hydratedRelatedQueries.find((r) => r.query === query);
		if (rq) {
			setRelatedQueries(relatedQueries.filter((ref) => ref.relatedQueryId !== rq.id));
		}
	};

	// Filter out already added bets from the dropdown
	const availableOptions = allBestBets.filter(
		(b) => !algorithmBestBets.some((added) => added.bestBetId === b.id)
	);

	const availableRelatedQueries = allRelatedQueries.filter(
		(rq) => !relatedQueries.some((added) => added.relatedQueryId === rq.id)
	);

	if (isCustom) {
		const customObjects = [
			{id: "1", name: "Object A", status: "Active", lastModified: "2023-10-25"},
			{id: "2", name: "Object B", status: "Inactive", lastModified: "2023-10-26"},
			{id: "3", name: "Object C", status: "Active", lastModified: "2023-10-27"},
		];

		return (
			<Box flex="1">
				<Heading
					level="4"
					mb="16"
				>
					Objects
				</Heading>
				<Text
					mb="16"
					color="fg.secondary"
				>
					Manage the objects associated with this custom algorithm.
				</Text>
				<Table>
					<thead>
						<Tr>
							<Th>Name</Th>
							<Th>Status</Th>
							<Th>Last Modified</Th>
						</Tr>
					</thead>
					<tbody>
						{customObjects.map((obj) => (
							<Tr key={obj.id}>
								<Td>{obj.name}</Td>
								<Td>{obj.status}</Td>
								<Td>{obj.lastModified}</Td>
							</Tr>
						))}
					</tbody>
				</Table>
			</Box>
		);
	}

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

				{hydratedBestBets.length > 0 ? (
					<BestBetsTable
						bestBets={hydratedBestBets}
						onEdit={handleEditClick}
						onRemove={handleRemoveBestBet}
						availableBestBets={availableOptions}
						onAdd={(bet) =>
							setAlgorithmBestBets([
								...algorithmBestBets,
								{bestBetId: bet.id, status: "Active"},
							])
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
														{
															bestBetId: bet.id,
															status: "Active" as const,
														},
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

					{hydratedRelatedQueries.length > 0 ? (
						<>
							<RelatedQueriesTable
								relatedQueries={hydratedRelatedQueries}
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
													setRelatedQueries([
														...relatedQueries,
														{relatedQueryId: rq.id},
													]),
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
														setRelatedQueries([
															...relatedQueries,
															{relatedQueryId: rq.id},
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
					onAlgorithmBestBetsChange={setAlgorithmBestBets}
					globalBestBets={allBestBets}
					onGlobalBestBetsChange={setAllBestBets}
				/>
			</Aside>
		</>
	);
}
