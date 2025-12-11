"use client";

import {Box} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {Input} from "@/app/components/Input";
import {Flex} from "@/app/components/Flex";
import {IconPlus, IconSearch} from "@tabler/icons-react";
import {useState, useMemo} from "react";
import usePersistentState from "@/app/usePersistentState";
import {AutocompletePhrase, initialAutocompletePhrases} from "@/app/db/initialData";
import AutocompletePhrasesTable from "../components/AutocompletePhrasesTable";
import AutocompletePhraseDialog from "../components/AutocompletePhraseDialog";

export default function AutocompletePhrasesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [phrases, setPhrases] = usePersistentState(
		"autocompletePhrases",
		initialAutocompletePhrases
	) as [AutocompletePhrase[], (val: AutocompletePhrase[]) => void];

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingPhrase, setEditingPhrase] = useState<AutocompletePhrase | null>(null);

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
		setPhrases(phrases.filter((p) => p.id !== id));
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
					placeholder="Search autocomplete phrases..."
					style={{width: "320px"}}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
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
				phrases={filteredData}
				onEdit={handleEditClick}
				onRemove={handleRemovePhrase}
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
		</Box>
	);
}
