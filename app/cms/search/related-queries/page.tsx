"use client";

import {Box, SearchInput} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {Input} from "@/app/components/Input";
import {Flex} from "@/app/components/Flex";
import {IconPlus, IconSearch} from "@/app/lib/axiom-icons";
import {useState, useMemo, useEffect} from "react";
import usePersistentState from "@/app/usePersistentState";
import {RelatedQuery, initialRelatedQueries} from "@/app/db/initialData";
import RelatedQueriesTable from "../components/RelatedQueriesTable";
import RelatedQueryDialog from "../components/RelatedQueryDialog";
import AbstractDialog from "@/app/components/AbstractDialog";
import EmptyList from "@/app/components/EmptyList";

const PAGE_SIZE = 10;

export default function RelatedQueriesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [relatedQueries, setRelatedQueries] = usePersistentState(
		"relatedQueries",
		initialRelatedQueries
	) as [RelatedQuery[], (val: RelatedQuery[]) => void];

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingRelatedQuery, setEditingRelatedQuery] = useState<RelatedQuery | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [pendingDeleteQuery, setPendingDeleteQuery] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery]);

	const handleCreateRelatedQuery = (data: {query: string; synonyms: string[]}) => {
		const newRelatedQuery: RelatedQuery = {
			id: Date.now().toString(),
			query: data.query,
			synonyms: data.synonyms,
			owner: "Alice Johnson",
		};

		setRelatedQueries([...relatedQueries, newRelatedQuery]);
		setIsCreateDialogOpen(false);
	};

	const handleRemoveRelatedQuery = (query: string) => {
		setPendingDeleteQuery(query);
		setIsDeleteDialogOpen(true);
	};

	const confirmRemoveRelatedQuery = () => {
		if (!pendingDeleteQuery) return;

		setRelatedQueries(relatedQueries.filter((sq) => sq.query !== pendingDeleteQuery));
		setPendingDeleteQuery(null);
		setIsDeleteDialogOpen(false);
	};

	const handleEditClick = (sq: RelatedQuery) => {
		setEditingRelatedQuery(sq);
		setIsEditDialogOpen(true);
	};

	const handleUpdateRelatedQuery = (data: {query: string; synonyms: string[]}) => {
		if (!editingRelatedQuery) return;

		const updatedRelatedQueries = relatedQueries.map((sq) =>
			sq.id === editingRelatedQuery.id
				? {
						...sq,
						query: data.query,
						synonyms: data.synonyms,
					}
				: sq
		);

		setRelatedQueries(updatedRelatedQueries);
		setIsEditDialogOpen(false);
		setEditingRelatedQuery(null);
	};

	const filteredData = useMemo(() => {
		if (!searchQuery) return relatedQueries;

		const query = searchQuery.toLowerCase();
		return relatedQueries.filter(
			(sq) =>
				sq.query.toLowerCase().includes(query) ||
				sq.synonyms.some((s) => s.toLowerCase().includes(query)) ||
				sq.owner.toLowerCase().includes(query)
		);
	}, [searchQuery, relatedQueries]);

	const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
	const effectivePage = Math.min(currentPage, totalPages);
	const paginatedData = filteredData.slice(
		(effectivePage - 1) * PAGE_SIZE,
		effectivePage * PAGE_SIZE
	);
	const shouldShowPagination = filteredData.length > PAGE_SIZE;

	useEffect(() => {
		if (currentPage !== effectivePage) {
			setCurrentPage(effectivePage);
		}
	}, [currentPage, effectivePage]);

	if (relatedQueries.length === 0) {
		return (
			<Box>
				<EmptyList
					heading="No related queries yet"
					body="Define related queries to surface relevant content when users search for similar terms."
				>
					<Button
						icon={<IconPlus size={16} />}
						appearance="primary"
						onClick={() => setIsCreateDialogOpen(true)}
					>
						Create Related Query
					</Button>
				</EmptyList>

				<RelatedQueryDialog
					open={isCreateDialogOpen}
					setOpen={setIsCreateDialogOpen}
					mode="create"
					onSave={handleCreateRelatedQuery}
				/>
			</Box>
		);
	}

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
					placeholder="Search related queries..."
				/>
				<Button
					icon={<IconPlus size={16} />}
					appearance="primary"
					aria-label="Create Related Query"
					onClick={() => setIsCreateDialogOpen(true)}
				>
					Create Related Query
				</Button>
			</Flex>

			<RelatedQueriesTable
				relatedQueries={paginatedData}
				onEdit={handleEditClick}
				onRemove={handleRemoveRelatedQuery}
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

			<RelatedQueryDialog
				open={isCreateDialogOpen}
				setOpen={setIsCreateDialogOpen}
				mode="create"
				onSave={handleCreateRelatedQuery}
			/>

			<RelatedQueryDialog
				open={isEditDialogOpen}
				setOpen={setIsEditDialogOpen}
				mode="edit"
				initialData={editingRelatedQuery || undefined}
				onSave={handleUpdateRelatedQuery}
			/>

			<AbstractDialog
				isAlert
				title="Remove Related Query"
				description={
					pendingDeleteQuery
						? `Are you sure you want to remove the related query "${pendingDeleteQuery}"? This action cannot be undone.`
						: "Are you sure you want to remove this related query? This action cannot be undone."
				}
				open={isDeleteDialogOpen}
				setOpen={(open: boolean) => {
					setIsDeleteDialogOpen(open);
					if (!open) setPendingDeleteQuery(null);
				}}
				footerPrimaryText="Remove"
				footerPrimaryAction={confirmRemoveRelatedQuery}
				footerAppearance="danger"
			/>
		</Box>
	);
}
