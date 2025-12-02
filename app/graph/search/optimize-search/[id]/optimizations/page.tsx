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
	Menu,
	MenuTrigger,
	MenuContent,
	Input,
	Field,
} from "@optiaxiom/react";
import {useParams} from "next/navigation";
import {useState} from "react";
import usePersistentState from "@/app/usePersistentState";
import {BestBet, initialBestBets} from "@/app/db/initialData";
import {Table, Tr, Td, Th} from "@/app/components/Table";
import Item from "@/app/components/Item";
import {IconRocket, IconTrash, IconPlus, IconDots, IconPencil} from "@tabler/icons-react";
import AbstractDialog from "@/app/components/AbstractDialog";

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

	const [selectedBestBetQuery, setSelectedBestBetQuery] = useState("");

	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingBestBet, setEditingBestBet] = useState<BestBet | null>(null);
	const [editQuery, setEditQuery] = useState("");
	const [editDestination, setEditDestination] = useState("");
	const [editStatus, setEditStatus] = useState("Active");

	const handleAddBestBet = () => {
		if (!selectedBestBetQuery) return;
		const betToAdd = allBestBets.find((b) => b.query === selectedBestBetQuery);
		if (betToAdd && !algorithmBestBets.some((b) => b.query === betToAdd.query)) {
			setAlgorithmBestBets([...algorithmBestBets, betToAdd]);
		}
		setSelectedBestBetQuery("");
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

	// Filter out already added bets from the dropdown
	const availableOptions = allBestBets.filter(
		(b) => !algorithmBestBets.some((added) => added.query === b.query)
	);

	return (
		<Box>
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

			{algorithmBestBets.length > 0 && (
				<Table>
					<thead>
						<Tr>
							<Th>Query</Th>
							<Th>Destination</Th>
							<Th></Th>
						</Tr>
					</thead>
					<tbody>
						{algorithmBestBets.map((bet) => (
							<Tr key={bet.query}>
								<Td type="raw">
									<Item
										icon={<IconRocket size={16} />}
										title={bet.query}
									/>
								</Td>
								<Td>{bet.destination}</Td>
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
												size="sm"
											/>
											<MenuContent />
										</Menu>
									</div>
								</Td>
							</Tr>
						))}
					</tbody>
				</Table>
			)}

			<Flex
				flexDirection="row"
				gap="8"
				alignItems="end"
				mt="24"
				maxW="lg"
			>
				<Select
					value={selectedBestBetQuery}
					onValueChange={setSelectedBestBetQuery}
					options={availableOptions.map((b) => ({label: b.query, value: b.query}))}
					disabled={availableOptions.length === 0}
				>
					<SelectTrigger size="lg">
						{selectedBestBetQuery || "Select a Best Bet to add..."}
					</SelectTrigger>
					<SelectContent />
				</Select>
				<Button
					size="lg"
					icon={<IconPlus size={16} />}
					onClick={handleAddBestBet}
					appearance="primary"
					disabled={!selectedBestBetQuery}
				>
					Add
				</Button>
			</Flex>

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
