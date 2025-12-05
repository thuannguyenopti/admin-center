"use client";

import AbstractDialog from "@/app/components/AbstractDialog";
import {
	Box,
	Button,
	Flex,
	Input,
	Field,
	Select,
	SelectTrigger,
	SelectContent,
	Switch,
} from "@optiaxiom/react";
import {IconPlus, IconSearch} from "@tabler/icons-react";
import {useState, useMemo} from "react";
import usePersistentState from "@/app/usePersistentState";
import {BestBet, initialBestBets} from "@/app/db/initialData";
import searchResults from "@/app/db/searchResults.json";
import BestBetsTable from "../components/BestBetsTable";

export default function BestBetsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [bestBets, setBestBets] = usePersistentState("bestBets", initialBestBets) as [
		BestBet[],
		(val: BestBet[]) => void
	];

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [newQuery, setNewQuery] = useState("");
	const [newDestination, setNewDestination] = useState("");
	const [newStatus, setNewStatus] = useState("Active");

	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingBestBet, setEditingBestBet] = useState<BestBet | null>(null);
	const [editQuery, setEditQuery] = useState("");
	const [editDestination, setEditDestination] = useState("");
	const [editStatus, setEditStatus] = useState("Active");

	const handleCreateBestBet = () => {
		if (!newQuery || !newDestination) return;

		const newBestBet: BestBet = {
			query: newQuery,
			destination: newDestination,
			status: newStatus as "Active" | "Inactive",
			owner: "Alice Johnson",
		};

		setBestBets([...bestBets, newBestBet]);
		setNewQuery("");
		setNewDestination("");
		setNewStatus("Active");
		setIsCreateDialogOpen(false);
	};

	const handleRemoveBestBet = (query: string) => {
		setBestBets(bestBets.filter((b) => b.query !== query));
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

		const updatedBestBets = bestBets.map((b) =>
			b.query === editingBestBet.query
				? {
						...b,
						query: editQuery,
						destination: editDestination,
						status: editStatus as "Active" | "Inactive",
				  }
				: b
		);

		setBestBets(updatedBestBets);
		setIsEditDialogOpen(false);
		setEditingBestBet(null);
	};

	const handleToggleStatus = (bet: BestBet, newStatus: "Active" | "Inactive") => {
		const updatedBestBets = bestBets.map((b) =>
			b.query === bet.query ? {...b, status: newStatus} : b
		);
		setBestBets(updatedBestBets);
	};

	const filteredData = useMemo(() => {
		if (!searchQuery) return bestBets;

		const query = searchQuery.toLowerCase();
		return bestBets.filter(
			(bet) =>
				bet.query.toLowerCase().includes(query) ||
				bet.destination.toLowerCase().includes(query) ||
				bet.owner.toLowerCase().includes(query)
		);
	}, [searchQuery, bestBets]);

	return (
		<Box>
			<Flex
				flexDirection="row"
				justifyContent="space-between"
				alignItems="center"
				gap="16"
				mb="24"
			>
				<Input
					size="lg"
					addonBefore={<IconSearch size={16} />}
					placeholder="Search best bets..."
					style={{width: "320px"}}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
				<Button
					size="lg"
					icon={<IconPlus size={16} />}
					appearance="primary"
					aria-label="Create Best Bet"
					onClick={() => setIsCreateDialogOpen(true)}
				>
					Create Best Bet
				</Button>
			</Flex>

			<BestBetsTable
				bestBets={filteredData}
				onEdit={handleEditClick}
				onRemove={handleRemoveBestBet}
				onToggleStatus={handleToggleStatus}
			/>

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
									? searchResults.find((r) => r.url === newDestination)?.title ||
									  newDestination
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
									? searchResults.find((r) => r.url === editDestination)?.title ||
									  editDestination
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
		</Box>
	);
}
