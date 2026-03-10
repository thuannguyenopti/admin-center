"use client";

import {Box, SearchInput} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {Input} from "@/app/components/Input";
import {Flex} from "@/app/components/Flex";
import {IconPlus, IconSearch} from "@tabler/icons-react";
import {useState, useMemo, useEffect} from "react";
import usePersistentState from "@/app/usePersistentState";
import {Synonym, initialSynonyms} from "@/app/db/initialData";
import SynonymsTable from "../components/SynonymsTable";
import SynonymDialog from "../components/SynonymDialog";
import AbstractDialog from "@/app/components/AbstractDialog";

const PAGE_SIZE = 10;

export default function SynonymsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [synonyms, setSynonyms] = usePersistentState("synonyms", initialSynonyms) as [
		Synonym[],
		(val: Synonym[]) => void,
	];

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingSynonym, setEditingSynonym] = useState<Synonym | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery]);

	const handleCreateSynonym = (data: {
		term: string;
		synonyms: string[];
		type: "One-way" | "Two-way";
	}) => {
		const newSynonym: Synonym = {
			id: Date.now().toString(),
			term: data.term,
			synonyms: data.synonyms,
			type: data.type,
			owner: "Alice Johnson",
		};

		setSynonyms([...synonyms, newSynonym]);
		setIsCreateDialogOpen(false);
	};

	const handleRemoveSynonym = (id: string) => {
		setPendingDeleteId(id);
		setIsDeleteDialogOpen(true);
	};

	const confirmRemoveSynonym = () => {
		if (!pendingDeleteId) return;

		setSynonyms(synonyms.filter((s) => s.id !== pendingDeleteId));
		setPendingDeleteId(null);
		setIsDeleteDialogOpen(false);
	};

	const handleEditClick = (s: Synonym) => {
		setEditingSynonym(s);
		setIsEditDialogOpen(true);
	};

	const handleUpdateSynonym = (data: {
		term: string;
		synonyms: string[];
		type: "One-way" | "Two-way";
	}) => {
		if (!editingSynonym) return;

		const updatedSynonyms = synonyms.map((s) =>
			s.id === editingSynonym.id
				? {
						...s,
						term: data.term,
						synonyms: data.synonyms,
						type: data.type,
					}
				: s
		);

		setSynonyms(updatedSynonyms);
		setIsEditDialogOpen(false);
		setEditingSynonym(null);
	};

	const filteredData = useMemo(() => {
		if (!searchQuery) return synonyms;

		const query = searchQuery.toLowerCase();
		return synonyms.filter(
			(s) =>
				s.term.toLowerCase().includes(query) ||
				s.synonyms.some((syn) => syn.toLowerCase().includes(query)) ||
				s.owner.toLowerCase().includes(query)
		);
	}, [searchQuery, synonyms]);

	const pendingDeleteTerm = pendingDeleteId
		? synonyms.find((s) => s.id === pendingDeleteId)?.term
		: undefined;

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
					placeholder="Search synonyms..."
				/>
				<Button
					icon={<IconPlus size={16} />}
					appearance="primary"
					aria-label="Create Synonym"
					onClick={() => setIsCreateDialogOpen(true)}
				>
					Create Synonym
				</Button>
			</Flex>

			<SynonymsTable
				synonyms={paginatedData}
				onEdit={handleEditClick}
				onRemove={handleRemoveSynonym}
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

			<SynonymDialog
				open={isCreateDialogOpen}
				setOpen={setIsCreateDialogOpen}
				mode="create"
				onSave={handleCreateSynonym}
			/>

			<SynonymDialog
				open={isEditDialogOpen}
				setOpen={setIsEditDialogOpen}
				mode="edit"
				initialData={editingSynonym || undefined}
				onSave={handleUpdateSynonym}
			/>

			<AbstractDialog
				isAlert
				title="Remove Synonym"
				description={
					pendingDeleteTerm
						? `Are you sure you want to remove the synonym "${pendingDeleteTerm}"? This action cannot be undone.`
						: "Are you sure you want to remove this synonym? This action cannot be undone."
				}
				open={isDeleteDialogOpen}
				setOpen={(open: boolean) => {
					setIsDeleteDialogOpen(open);
					if (!open) setPendingDeleteId(null);
				}}
				footerPrimaryText="Remove"
				footerPrimaryAction={confirmRemoveSynonym}
				footerAppearance="danger"
			/>
		</Box>
	);
}
