"use client";

import {Box} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {Input} from "@/app/components/Input";
import {Flex} from "@/app/components/Flex";
import {IconPlus, IconSearch} from "@tabler/icons-react";
import {useState, useMemo} from "react";
import usePersistentState from "@/app/usePersistentState";
import {BestBet, initialBestBets} from "@/app/db/initialData";
import BestBetsTable from "../components/BestBetsTable";
import BestBetDialog from "../components/BestBetDialog";

export default function BestBetsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [bestBets, setBestBets] = usePersistentState("bestBets", initialBestBets) as [
		BestBet[],
		(val: BestBet[]) => void
	];

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingBestBet, setEditingBestBet] = useState<BestBet | null>(null);

	const handleCreateBestBet = (data: {query: string; destination: string}) => {
		const newBestBet: BestBet = {
			id: Date.now().toString(),
			query: data.query,
			destination: data.destination,
			owner: "Alice Johnson",
		};

		setBestBets([...bestBets, newBestBet]);
		setIsCreateDialogOpen(false);
	};

	const handleRemoveBestBet = (query: string) => {
		setBestBets(bestBets.filter((b) => b.query !== query));
	};

	const handleEditClick = (bet: BestBet) => {
		setEditingBestBet(bet);
		setIsEditDialogOpen(true);
	};

	const handleUpdateBestBet = (data: {query: string; destination: string}) => {
		if (!editingBestBet) return;

		const updatedBestBets = bestBets.map((b) =>
			b.query === editingBestBet.query
				? {
						...b,
						query: data.query,
						destination: data.destination,
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
				showStatus={false}
			/>

			<BestBetDialog
				open={isCreateDialogOpen}
				setOpen={setIsCreateDialogOpen}
				mode="create"
				onSave={handleCreateBestBet}
			/>

			<BestBetDialog
				open={isEditDialogOpen}
				setOpen={setIsEditDialogOpen}
				mode="edit"
				initialData={editingBestBet || undefined}
				onSave={handleUpdateBestBet}
			/>
		</Box>
	);
}
