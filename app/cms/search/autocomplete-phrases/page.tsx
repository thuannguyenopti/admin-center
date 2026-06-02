"use client";

import {Box, SearchInput} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {Input} from "@/app/components/Input";
import {Flex} from "@/app/components/Flex";
import {IconPlus, IconSearch} from "@tabler/icons-react";
import {useState, useMemo, useEffect} from "react";
import usePersistentState from "@/app/usePersistentState";
import {AutocompletePhrase, initialAutocompletePhrases} from "@/app/db/initialData";
import AutocompletePhrasesTable from "../components/AutocompletePhrasesTable";
import AutocompletePhraseDialog from "../components/AutocompletePhraseDialog";
import AbstractDialog from "@/app/components/AbstractDialog";
import EmptyList from "@/app/components/EmptyList";

const PAGE_SIZE = 10;

export default function AutocompletePhrasesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [phrases, setPhrases] = usePersistentState(
		"autocompletePhrases",
		initialAutocompletePhrases
	) as [AutocompletePhrase[], (val: AutocompletePhrase[]) => void];

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingPhrase, setEditingPhrase] = useState<AutocompletePhrase | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery]);

	const handleCreatePhrase = (data: {phrase: string}) => {
		const newPhrase: AutocompletePhrase = {
			id: Date.now().toString(),
			phrase: data.phrase,
			owner: "Alice Johnson",
		};

		setPhrases([...phrases, newPhrase]);
		setIsCreateDialogOpen(false);
	};

	const handleRemovePhrase = (id: string) => {
		setPendingDeleteId(id);
		setIsDeleteDialogOpen(true);
	};

	const confirmRemovePhrase = () => {
		if (!pendingDeleteId) return;

		setPhrases(phrases.filter((p: AutocompletePhrase) => p.id !== pendingDeleteId));
		setPendingDeleteId(null);
		setIsDeleteDialogOpen(false);
	};

	const handleEditClick = (p: AutocompletePhrase) => {
		setEditingPhrase(p);
		setIsEditDialogOpen(true);
	};

	const handleUpdatePhrase = (data: {phrase: string}) => {
		if (!editingPhrase) return;

		const updatedPhrases = phrases.map((p) =>
			p.id === editingPhrase.id
				? {
						...p,
						phrase: data.phrase,
					}
				: p
		);

		setPhrases(updatedPhrases);
		setIsEditDialogOpen(false);
		setEditingPhrase(null);
	};

	const filteredData = useMemo(() => {
		if (!searchQuery) return phrases;

		const query = searchQuery.toLowerCase();
		return phrases.filter(
			(p) => p.phrase.toLowerCase().includes(query) || p.owner.toLowerCase().includes(query)
		);
	}, [searchQuery, phrases]);

	const pendingDeletePhrase = pendingDeleteId
		? phrases.find((p) => p.id === pendingDeleteId)?.phrase
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

	if (phrases.length === 0) {
		return (
			<Box>
				<EmptyList
					heading="No autocomplete phrases yet"
					body="Add autocomplete phrases to help users discover content faster by suggesting popular and relevant searches."
				>
					<Button
						icon={<IconPlus size={16} />}
						appearance="primary"
						onClick={() => setIsCreateDialogOpen(true)}
					>
						Create Autocomplete Phrase
					</Button>
				</EmptyList>

				<AutocompletePhraseDialog
					open={isCreateDialogOpen}
					setOpen={setIsCreateDialogOpen}
					mode="create"
					onSave={handleCreatePhrase}
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
					placeholder="Search autocomplete phrases..."
				/>
				<Button
					icon={<IconPlus size={16} />}
					appearance="primary"
					aria-label="Create Autocomplete Phrase"
					onClick={() => setIsCreateDialogOpen(true)}
				>
					Create Autocomplete Phrase
				</Button>
			</Flex>

			<AutocompletePhrasesTable
				phrases={paginatedData}
				onEdit={handleEditClick}
				onRemove={handleRemovePhrase}
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

			<AutocompletePhraseDialog
				open={isCreateDialogOpen}
				setOpen={setIsCreateDialogOpen}
				mode="create"
				onSave={handleCreatePhrase}
			/>

			<AutocompletePhraseDialog
				open={isEditDialogOpen}
				setOpen={setIsEditDialogOpen}
				mode="edit"
				initialData={editingPhrase || undefined}
				onSave={handleUpdatePhrase}
			/>

			<AbstractDialog
				isAlert
				title="Remove Autocomplete Phrase"
				description={
					pendingDeletePhrase
						? `Are you sure you want to remove the autocomplete phrase "${pendingDeletePhrase}"? This action cannot be undone.`
						: "Are you sure you want to remove this autocomplete phrase? This action cannot be undone."
				}
				open={isDeleteDialogOpen}
				setOpen={(open: boolean) => {
					setIsDeleteDialogOpen(open);
					if (!open) setPendingDeleteId(null);
				}}
				footerPrimaryText="Remove"
				footerPrimaryAction={confirmRemovePhrase}
				footerAppearance="danger"
			/>
		</Box>
	);
}
