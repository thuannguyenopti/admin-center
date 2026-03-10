"use client";

import {Box, SearchInput} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {Input} from "@/app/components/Input";
import {Flex} from "@/app/components/Flex";
import {IconPlus, IconSearch} from "@tabler/icons-react";
import {useState, useMemo, useEffect} from "react";
import usePersistentState from "@/app/usePersistentState";
import {PinnedResult, initialPinnedResults} from "@/app/db/initialData";
import PinnedResultsTable from "../components/PinnedResultsTable";
import PinnedResultDialog from "../components/PinnedResultDialog";
import AbstractDialog from "@/app/components/AbstractDialog";

const PAGE_SIZE = 10;

export default function PinnedResultsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [pinnedResults, setPinnedResults] = usePersistentState(
		"pinnedResults",
		initialPinnedResults
	) as [PinnedResult[], (val: PinnedResult[]) => void];

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingPinnedResult, setEditingPinnedResult] = useState<PinnedResult | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [pendingDeleteQuery, setPendingDeleteQuery] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery]);

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
		setPendingDeleteQuery(query);
		setIsDeleteDialogOpen(true);
	};

	const confirmRemovePinnedResult = () => {
		if (!pendingDeleteQuery) return;
		setPinnedResults(pinnedResults.filter((p: PinnedResult) => p.query !== pendingDeleteQuery));
		setPendingDeleteQuery(null);
		setIsDeleteDialogOpen(false);
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

	const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
	const effectivePage = Math.min(currentPage, totalPages);
	const paginatedResults = filteredData.slice(
		(effectivePage - 1) * PAGE_SIZE,
		effectivePage * PAGE_SIZE
	);
	const shouldShowPagination = filteredData.length > PAGE_SIZE;

	useEffect(() => {
		if (currentPage !== effectivePage) {
			setCurrentPage(effectivePage);
		}
	}, [currentPage, effectivePage]);

	return (
		<Box>
			<Flex
				flexDirection="row"
				justifyContent="space-between"
				alignItems="center"
				gap="16"
				mb="24"
			>
				<SearchInput
					size="lg"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder="Search pinned results..."
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
				pinnedResults={paginatedResults}
				onEdit={handleEditClick}
				onRemove={handleRemovePinnedResult}
				showStatus={false}
				pagination={
					shouldShowPagination
						? {
								page: effectivePage,
								total: totalPages,
								onPageChange: setCurrentPage,
							}
						: undefined
				}
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

			<AbstractDialog
				isAlert
				title="Remove Pinned Result"
				description={
					pendingDeleteQuery
						? `Are you sure you want to remove the pinned result "${pendingDeleteQuery}"? This action cannot be undone.`
						: "Are you sure you want to remove this pinned result? This action cannot be undone."
				}
				open={isDeleteDialogOpen}
				setOpen={(open: boolean) => {
					setIsDeleteDialogOpen(open);
					if (!open) setPendingDeleteQuery(null);
				}}
				footerPrimaryText="Remove"
				footerPrimaryAction={confirmRemovePinnedResult}
				footerAppearance="danger"
			/>
		</Box>
	);
}
