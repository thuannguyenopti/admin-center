"use client";

import {
	Box,
	Button,
	Flex,
	Heading,
	Select,
	SelectContent,
	SelectTrigger,
	Text,
	Input,
	Field,
	Switch,
	Alert,
	Link,
} from "@optiaxiom/react";
import {useParams} from "next/navigation";
import {useState} from "react";
import usePersistentState from "@/app/usePersistentState";
import {BestBet, initialBestBets} from "@/app/db/initialData";
import {IconPlus, IconTrash} from "@tabler/icons-react";
import AbstractDialog from "@/app/components/AbstractDialog";
import searchResults from "@/app/db/searchResults.json";
import Preview from "../order/Preview";
import BestBetsTable from "../../../components/BestBetsTable";
import {Table, Tr, Td, Th} from "@/app/components/Table";

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
	) as [BestBet[], (val: BestBet[]) => void];

	const [similarQueries, setSimilarQueries] = usePersistentState(
		`algorithm_similar_queries_${id}`,
		[]
	) as [SimilarQuery[], (val: SimilarQuery[]) => void];

	const [selectedBestBetQuery, setSelectedBestBetQuery] = useState("");

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [newQuery, setNewQuery] = useState("");
	const [newDestination, setNewDestination] = useState("");
	const [newStatus, setNewStatus] = useState("Active");

	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingBestBet, setEditingBestBet] = useState<BestBet | null>(null);
	const [editQuery, setEditQuery] = useState("");
	const [editDestination, setEditDestination] = useState("");
	const [editStatus, setEditStatus] = useState("Active");

	const [isCreateSQDialogOpen, setIsCreateSQDialogOpen] = useState(false);
	const [newSimilarQuery, setNewSimilarQuery] = useState("");
	const [newSynonyms, setNewSynonyms] = useState("");

	const handleAddBestBet = () => {
		if (!selectedBestBetQuery) return;
		const betToAdd = allBestBets.find((b) => b.query === selectedBestBetQuery);
		if (betToAdd && !algorithmBestBets.some((b) => b.query === betToAdd.query)) {
			setAlgorithmBestBets([...algorithmBestBets, betToAdd]);
		}
		setSelectedBestBetQuery("");
	};

	const handleCreateBestBet = () => {
		if (!newQuery || !newDestination) return;

		const newBestBet: BestBet = {
			query: newQuery,
			destination: newDestination,
			status: newStatus as "Active" | "Inactive",
			owner: "Alice Johnson",
		};

		// Add to global list
		setAllBestBets([...allBestBets, newBestBet]);
		// Add to local algorithm list
		setAlgorithmBestBets([...algorithmBestBets, newBestBet]);

		setNewQuery("");
		setNewDestination("");
		setNewStatus("Active");
		setIsCreateDialogOpen(false);
	};

	const handleRemoveBestBet = (query: string) => {
		setAlgorithmBestBets(algorithmBestBets.filter((b) => b.query !== query));
	};

	const handleEditClick = (bet: BestBet) => {
		setEditingBestBet(bet);
		setEditQuery(bet.query);
		setEditDestination(bet.destination);
		setEditStatus(bet.status);
		setIsEditDialogOpen(true);
	};

	const handleUpdateBestBet = () => {
		if (!editingBestBet || !editQuery || !editDestination) return;

		const updatedBet = {
			...editingBestBet,
			query: editQuery,
			destination: editDestination,
			status: editStatus as "Active" | "Inactive",
		};

		// Update global list
		const updatedAllBestBets = allBestBets.map((b) =>
			b.query === editingBestBet.query ? updatedBet : b
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

		// Update global list
		const updatedAllBestBets = allBestBets.map((b) => (b.query === bet.query ? updatedBet : b));
		setAllBestBets(updatedAllBestBets);

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

	const handleRemoveSimilarQuery = (query: string) => {
		setSimilarQueries(similarQueries.filter((q) => q.query !== query));
	};

	// Filter out already added bets from the dropdown
	const availableOptions = allBestBets.filter(
		(b) => !algorithmBestBets.some((added) => added.query === b.query)
	);

	return (
		<Flex
			flexDirection="row"
			h="full"
			alignItems="stretch"
			gap="32"
		>
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
						onAdd={(bet) => setAlgorithmBestBets([...algorithmBestBets, bet])}
						onCreate={() => setIsCreateDialogOpen(true)}
						onToggleStatus={handleToggleStatus}
					/>
				) : (
					<Alert intent="information">
						<Text>
							No similar Best Bets defined yet. <Link></Link>
							<Link
								onClick={() => setIsCreateSQDialogOpen(true)}
								cursor="pointer"
							>
								Create one...
							</Link>
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
										<Th></Th>
									</Tr>
								</thead>
								<tbody>
									{similarQueries.map((item) => (
										<Tr key={item.query}>
											<Td>{item.query}</Td>
											<Td>{item.synonyms.join(", ")}</Td>
											<Td type="button">
												<Button
													icon={<IconTrash size={16} />}
													appearance="subtle"
													onClick={() =>
														handleRemoveSimilarQuery(item.query)
													}
													aria-label="Remove"
												/>
											</Td>
										</Tr>
									))}
								</tbody>
							</Table>

							<Button
								appearance="subtle"
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

				<AbstractDialog
					title="Create Best Bet"
					description="Add a new best bet to direct users to specific destinations."
					open={isCreateDialogOpen}
					setOpen={setIsCreateDialogOpen}
					footerPrimaryText="Create"
					footerPrimaryAction={handleCreateBestBet}
					footerAppearance="primary"
				>
					<Flex
						flexDirection="column"
						gap="16"
					>
						<Field
							label="Query"
							required
						>
							<Input
								size="lg"
								placeholder="e.g. return policy"
								value={newQuery}
								onChange={(e) => setNewQuery(e.target.value)}
							/>
						</Field>
						<Field
							label="Destination"
							required
						>
							<Select
								value={newDestination}
								onValueChange={setNewDestination}
								options={searchResults.map((r) => ({label: r.title, value: r.url}))}
							>
								<SelectTrigger size="lg">
									{newDestination
										? searchResults.find((r) => r.url === newDestination)
												?.title || newDestination
										: "Select Destination"}
								</SelectTrigger>
								<SelectContent />
							</Select>
						</Field>
						<Field
							label="Status"
							required
						>
							<Switch
								checked={newStatus === "Active"}
								onCheckedChange={(checked) =>
									setNewStatus(checked ? "Active" : "Inactive")
								}
							>
								{newStatus}
							</Switch>
						</Field>
					</Flex>
				</AbstractDialog>

				<AbstractDialog
					title="Edit Best Bet"
					description="Update the details of this best bet."
					open={isEditDialogOpen}
					setOpen={setIsEditDialogOpen}
					footerPrimaryText="Save Changes"
					footerPrimaryAction={handleUpdateBestBet}
					footerAppearance="primary"
				>
					<Flex
						flexDirection="column"
						gap="16"
					>
						<Field
							label="Query"
							required
						>
							<Input
								size="lg"
								value={editQuery}
								onChange={(e) => setEditQuery(e.target.value)}
							/>
						</Field>
						<Field
							label="Destination"
							required
						>
							<Select
								value={editDestination}
								onValueChange={setEditDestination}
								options={searchResults.map((r) => ({label: r.title, value: r.url}))}
							>
								<SelectTrigger size="lg">
									{editDestination
										? searchResults.find((r) => r.url === editDestination)
												?.title || editDestination
										: "Select Destination"}
								</SelectTrigger>
								<SelectContent />
							</Select>
						</Field>
						<Field
							label="Status"
							required
						>
							<Switch
								checked={editStatus === "Active"}
								onCheckedChange={(checked) =>
									setEditStatus(checked ? "Active" : "Inactive")
								}
							>
								{editStatus}
							</Switch>
						</Field>
					</Flex>
				</AbstractDialog>

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
			<Box
				alignSelf="start"
				style={{marginTop: "-100px", marginRight: "-24px"}}
			>
				<Preview
					algorithmBestBets={algorithmBestBets}
					similarQueries={similarQueries}
				/>
			</Box>
		</Flex>
	);
}
