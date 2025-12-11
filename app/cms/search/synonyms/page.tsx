"use client";

import {Box} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {Input} from "@/app/components/Input";
import {Flex} from "@/app/components/Flex";
import {IconPlus, IconSearch} from "@tabler/icons-react";
import {useState, useMemo} from "react";
import usePersistentState from "@/app/usePersistentState";
import {Synonym, initialSynonyms} from "@/app/db/initialData";
import SynonymsTable from "../components/SynonymsTable";
import SynonymDialog from "../components/SynonymDialog";

export default function SynonymsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [synonyms, setSynonyms] = usePersistentState("synonyms", initialSynonyms) as [
		Synonym[],
		(val: Synonym[]) => void
	];

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingSynonym, setEditingSynonym] = useState<Synonym | null>(null);

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
		setSynonyms(synonyms.filter((s) => s.id !== id));
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
					placeholder="Search synonyms..."
					style={{width: "320px"}}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
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
				synonyms={filteredData}
				onEdit={handleEditClick}
				onRemove={handleRemoveSynonym}
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
		</Box>
	);
}
