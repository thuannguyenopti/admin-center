"use client";

import {Box, Heading, Field, Alert, Link} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {Button} from "@/app/components/Button";
import {Input} from "@/app/components/Input";
import {Flex} from "@/app/components/Flex";
import {useParams} from "next/navigation";
import {useState} from "react";
import usePersistentState from "@/app/usePersistentState";
import {BestBet, initialBestBets, AlgorithmBestBet} from "@/app/db/initialData";
import {IconCongruentTo, IconPlus, IconTrash, IconEdit, IconDots} from "@tabler/icons-react";
import AbstractDialog from "@/app/components/AbstractDialog";
import searchResults from "@/app/db/searchResults.json";
import Preview from "../order/Preview";
import BestBetsTable from "../../../components/BestBetsTable";
import BestBetDialog from "../../../components/BestBetDialog";
import {Table, Tr, Td, Th} from "@/app/components/Table";
import {Aside} from "@/app/context/LayoutContext";
import Item from "@/app/components/Item";
import {Menu, MenuTrigger, MenuContent} from "@optiaxiom/react";

type SimilarQuery = {
	query: string;
	synonyms: string[];
};

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

	const [similarQueries, setSimilarQueries] = usePersistentState(
		`algorithm_similar_queries_${id}`,
		[]
	) as [SimilarQuery[], (val: SimilarQuery[]) => void];

	const [selectedBestBetQuery, setSelectedBestBetQuery] = useState("");

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingBestBet, setEditingBestBet] = useState<AlgorithmBestBet | null>(null);
	const [createBestBetInitialData, setCreateBestBetInitialData] = useState<
		{query: string; destination: string} | undefined
	>(undefined);

	const handleCreateBestBetFromPreview = (query: string) => {
		setCreateBestBetInitialData({query, destination: ""});
		setIsCreateDialogOpen(true);
	};

	const [isCreateSQDialogOpen, setIsCreateSQDialogOpen] = useState(false);
	const [newSimilarQuery, setNewSimilarQuery] = useState("");
	const [newSynonyms, setNewSynonyms] = useState("");

	const [isEditSQDialogOpen, setIsEditSQDialogOpen] = useState(false);
	const [editingSQ, setEditingSQ] = useState<SimilarQuery | null>(null);
	const [editSQQuery, setEditSQQuery] = useState("");
	const [editSQSynonyms, setEditSQSynonyms] = useState("");

	const handleAddBestBet = () => {
		if (!selectedBestBetQuery) return;
		const betToAdd = allBestBets.find((b) => b.query === selectedBestBetQuery);
		if (betToAdd && !algorithmBestBets.some((b) => b.query === betToAdd.query)) {
			setAlgorithmBestBets([...algorithmBestBets, {...betToAdd, status: "Active"}]);
		}
		setSelectedBestBetQuery("");
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

		// Add to global list
		setAllBestBets([...allBestBets, newBestBet]);
		// Add to local algorithm list
		setAlgorithmBestBets([
			...algorithmBestBets,
			{...newBestBet, status: data.status || "Active"},
		]);

		setIsCreateDialogOpen(false);
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

	const handleToggleStatus = (bet: BestBet, newStatus: "Active" | "Inactive") => {
		const updatedBet = {...bet, status: newStatus};

		// Update local algorithm list
		const updatedAlgorithmBestBets = algorithmBestBets.map((b) =>
			b.query === bet.query ? updatedBet : b
		);
		setAlgorithmBestBets(updatedAlgorithmBestBets);
	};

	const handleAddSimilarQuery = () => {
		if (!newSimilarQuery || !newSynonyms) return;

		const synonymsList = newSynonyms
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);

		setSimilarQueries([
			...similarQueries,
			{
				query: newSimilarQuery,
				synonyms: synonymsList,
			},
		]);

		setNewSimilarQuery("");
		setNewSynonyms("");
		setIsCreateSQDialogOpen(false);
	};

	const handleEditSQClick = (sq: SimilarQuery) => {
		setEditingSQ(sq);
		setEditSQQuery(sq.query);
		setEditSQSynonyms(sq.synonyms.join(", "));
		setIsEditSQDialogOpen(true);
	};

	const handleUpdateSimilarQuery = () => {
		if (!editingSQ) return;
		const updatedSynonyms = editSQSynonyms
			.split(",")
			.map((s) => s.trim())
			.filter((s) => s);

		const updatedList = similarQueries.map((item) =>
			item.query === editingSQ.query ? {query: editSQQuery, synonyms: updatedSynonyms} : item
		);

		setSimilarQueries(updatedList);
		setIsEditSQDialogOpen(false);
		setEditingSQ(null);
	};

	const handleRemoveSimilarQuery = (query: string) => {
		setSimilarQueries(similarQueries.filter((q) => q.query !== query));
	};

	// Filter out already added bets from the dropdown
	const availableOptions = allBestBets.filter(
		(b) => !algorithmBestBets.some((added) => added.query === b.query)
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
						Similar Queries
					</Heading>
					<Text
						mb="16"
						color="fg.secondary"
					>
						Define groups of queries that should be treated as synonyms to improve
						search recall.
					</Text>

					{similarQueries.length > 0 ? (
						<>
							<Table>
								<thead>
									<Tr>
										<Th>Primary Query</Th>
										<Th>Synonyms</Th>
										<Th align="right">Actions</Th>
									</Tr>
								</thead>
								<tbody>
									{similarQueries.map((item) => (
										<Tr
											key={item.query}
											onClick={() => handleEditSQClick(item)}
										>
											<Td type="header">
												<Item
													icon={<IconCongruentTo size={16} />}
													title={item.query}
												/>
											</Td>
											<Td>{item.synonyms.join(", ")}</Td>
											<Td type="button">
												<div onClick={(e) => e.stopPropagation()}>
													<Menu
														options={[
															{
																label: "Edit",
																addon: <IconEdit size={16} />,
																execute: () =>
																	handleEditSQClick(item),
															},
															{
																label: "Remove",
																addon: <IconTrash size={16} />,
																execute: () =>
																	handleRemoveSimilarQuery(
																		item.query
																	),
																intent: "danger",
															},
														]}
													>
														<MenuTrigger
															appearance="subtle"
															aria-label="Edit"
															icon={<IconDots size={16} />}
														/>
														<MenuContent align="end" />
													</Menu>
												</div>
											</Td>
										</Tr>
									))}
								</tbody>
							</Table>

							<Button
								mt="16"
								size="lg"
								icon={<IconPlus size={16} />}
								onClick={() => setIsCreateSQDialogOpen(true)}
							>
								Create New
							</Button>
						</>
					) : (
						<Alert intent="information">
							<Text>
								No Similar Queries defined yet. <Link></Link>
								<Link
									onClick={() => setIsCreateSQDialogOpen(true)}
									cursor="pointer"
								>
									Create one...
								</Link>
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

				<AbstractDialog
					title="Create Similar Query Group"
					description="Define a group of queries that should be treated as synonyms."
					open={isCreateSQDialogOpen}
					setOpen={setIsCreateSQDialogOpen}
					footerPrimaryText="Create"
					footerPrimaryAction={handleAddSimilarQuery}
					footerAppearance="primary"
				>
					<Flex
						flexDirection="column"
						gap="16"
					>
						<Field
							label="Primary Query"
							required
						>
							<Input
								placeholder="e.g. sneakers"
								value={newSimilarQuery}
								onChange={(e) => setNewSimilarQuery(e.target.value)}
							/>
						</Field>
						<Field
							label="Synonyms (comma separated)"
							required
						>
							<Input
								placeholder="e.g. trainers, running shoes, kicks"
								value={newSynonyms}
								onChange={(e) => setNewSynonyms(e.target.value)}
							/>
						</Field>
					</Flex>
				</AbstractDialog>
			</Box>

			<AbstractDialog
				title="Edit Synonym Group"
				description="Update the primary query and its synonyms."
				open={isEditSQDialogOpen}
				setOpen={setIsEditSQDialogOpen}
				footerPrimaryText="Save Changes"
				footerPrimaryAction={handleUpdateSimilarQuery}
				footerAppearance="primary"
			>
				<Flex
					flexDirection="column"
					gap="16"
				>
					<Field
						label="Primary Query"
						required
					>
						<Input
							placeholder="e.g. sneakers"
							value={editSQQuery}
							onChange={(e) => setEditSQQuery(e.target.value)}
						/>
					</Field>
					<Field
						label="Synonyms (comma separated)"
						required
					>
						<Input
							placeholder="e.g. trainers, running shoes, kicks"
							value={editSQSynonyms}
							onChange={(e) => setEditSQSynonyms(e.target.value)}
						/>
					</Field>
				</Flex>
			</AbstractDialog>

			<Aside>
				<Preview
					algorithmBestBets={algorithmBestBets}
					similarQueries={similarQueries}
					onCreateBestBet={handleCreateBestBetFromPreview}
				/>
			</Aside>
		</>
	);
}
