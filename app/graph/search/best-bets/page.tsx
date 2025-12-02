"use client";

import Item from "@/app/components/Item";
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
	Menu,
	MenuTrigger,
	MenuContent,
} from "@optiaxiom/react";
import {
	IconPlus,
	IconRocket,
	IconSearch,
	IconDots,
	IconPencil,
	IconTrash,
} from "@tabler/icons-react";
import {useState, useMemo} from "react";
import usePersistentState from "@/app/usePersistentState";
import {BestBet, initialBestBets} from "@/app/db/initialData";
import {Table, Tr, Td, Th} from "@/app/components/Table";

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

			<Table>
				<thead>
					<Tr>
						<Th>Query</Th>
						<Th>Destination</Th>
						<Th>Status</Th>
						<Th>Owner</Th>
						<Th></Th>
					</Tr>
				</thead>
				<tbody>
					{filteredData.map((bet) => (
						<Tr key={bet.query}>
							<Td type="raw">
								<Item
									icon={<IconRocket size={16} />}
									title={bet.query}
								/>
							</Td>
							<Td>{bet.destination}</Td>
							<Td
								type="badge"
								data={bet.status === "Active" ? "success" : "neutral"}
							>
								{bet.status}
							</Td>
							<Td type="avatar">{bet.owner}</Td>
							<Td type="button">
								<div onClick={(e) => e.stopPropagation()}>
									<Menu
										options={[
											{
												label: "Edit",
												addon: <IconPencil size={16} />,
												execute: () => handleEditClick(bet),
											},
											{
												label: "Remove",
												addon: <IconTrash size={16} />,
												intent: "danger",
												execute: () => handleRemoveBestBet(bet.query),
											},
										]}
									>
										<MenuTrigger
											aria-label="Actions"
											icon={<IconDots size={16} />}
											appearance="subtle"
										/>
										<MenuContent />
									</Menu>
								</div>
							</Td>
						</Tr>
					))}
				</tbody>
			</Table>

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
						<Input
							size="lg"
							placeholder="e.g. /help/returns"
							value={newDestination}
							onChange={(e) => setNewDestination(e.target.value)}
						/>
					</Field>
					<Field
						label="Status"
						required
					>
						<Select
							value={newStatus}
							onValueChange={setNewStatus}
							options={[
								{label: "Active", value: "Active"},
								{label: "Inactive", value: "Inactive"},
							]}
						>
							<SelectTrigger size="lg">{newStatus}</SelectTrigger>
							<SelectContent />
						</Select>
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
						<Input
							size="lg"
							value={editDestination}
							onChange={(e) => setEditDestination(e.target.value)}
						/>
					</Field>
					<Field
						label="Status"
						required
					>
						<Select
							value={editStatus}
							onValueChange={setEditStatus}
							options={[
								{label: "Active", value: "Active"},
								{label: "Inactive", value: "Inactive"},
							]}
						>
							<SelectTrigger size="lg">{editStatus}</SelectTrigger>
							<SelectContent />
						</Select>
					</Field>
				</Flex>
			</AbstractDialog>
		</Box>
	);
}
