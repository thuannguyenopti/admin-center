"use client";

import {Box} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {Input} from "@/app/components/Input";
import {Flex} from "@/app/components/Flex";
import {IconPlus, IconSearch} from "@tabler/icons-react";
import {useState, useMemo} from "react";
import usePersistentState from "@/app/usePersistentState";
import {PinnedResult, initialPinnedResults} from "@/app/db/initialData";
import PinnedResultsTable from "../components/PinnedResultsTable";
import PinnedResultDialog from "../components/PinnedResultDialog";

export default function PinnedResultsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [pinnedResults, setPinnedResults] = usePersistentState(
		"pinnedResults",
		initialPinnedResults
	) as [PinnedResult[], (val: PinnedResult[]) => void];

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingPinnedResult, setEditingPinnedResult] = useState<PinnedResult | null>(null);

	const handleCreatePinnedResult = (data: {query: string; destination: string}) => {
		const newPinnedResult: PinnedResult = {
			id: Date.now().toString(),
			query: data.query,
			destination: data.destination,
			owner: "Alice Johnson",
		};

		setPinnedResults([...pinnedResults, newPinnedResult]);
		setIsCreateDialogOpen(false);
	};

	const handleRemovePinnedResult = (query: string) => {
		setPinnedResults(pinnedResults.filter((b) => b.query !== query));
	};

	const handleEditClick = (bet: PinnedResult) => {
		setEditingPinnedResult(bet);
		setIsEditDialogOpen(true);
	};

	const handleUpdatePinnedResult = (data: {query: string; destination: string}) => {
		if (!editingPinnedResult) return;

		const updatedPinnedResults = pinnedResults.map((b) =>
			b.query === editingPinnedResult.query
				? {
						...b,
						query: data.query,
						destination: data.destination,
				  }
				: b
		);

		setPinnedResults(updatedPinnedResults);
		setIsEditDialogOpen(false);
		setEditingPinnedResult(null);
	};

	const filteredData = useMemo(() => {
		if (!searchQuery) return pinnedResults;

		const query = searchQuery.toLowerCase();
		return pinnedResults.filter(
			(bet) =>
				bet.query.toLowerCase().includes(query) ||
				bet.destination.toLowerCase().includes(query) ||
				bet.owner.toLowerCase().includes(query)
		);
	}, [searchQuery, pinnedResults]);

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
					placeholder="Search pinned results..."
					style={{width: "320px"}}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
				<Button
					size="lg"
					icon={<IconPlus size={16} />}
					appearance="primary"
					aria-label="Create Pinned Result"
					onClick={() => setIsCreateDialogOpen(true)}
				>
					Create Pinned Result
				</Button>
			</Flex>

			<PinnedResultsTable
				pinnedResults={filteredData}
				onEdit={handleEditClick}
				onRemove={handleRemovePinnedResult}
				showStatus={false}
			/>

			<PinnedResultDialog
				open={isCreateDialogOpen}
				setOpen={setIsCreateDialogOpen}
				mode="create"
				onSave={handleCreatePinnedResult}
			/>

			<PinnedResultDialog
				open={isEditDialogOpen}
				setOpen={setIsEditDialogOpen}
				mode="edit"
				initialData={editingPinnedResult || undefined}
				onSave={handleUpdatePinnedResult}
			/>
		</Box>
	);
}
