"use client";

import {Box} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {Input} from "@/app/components/Input";
import {Flex} from "@/app/components/Flex";
import {IconPlus, IconSearch} from "@tabler/icons-react";
import {useState, useMemo} from "react";
import usePersistentState from "@/app/usePersistentState";
import {RelatedQuery, initialRelatedQueries} from "@/app/db/initialData.clean";
import RelatedQueriesTable from "../components/RelatedQueriesTable";
import RelatedQueryDialog from "../components/RelatedQueryDialog";

export default function RelatedQueriesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [relatedQueries, setRelatedQueries] = usePersistentState(
		"relatedQueries",
		initialRelatedQueries
	) as [RelatedQuery[], (val: RelatedQuery[]) => void];

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingRelatedQuery, setEditingRelatedQuery] = useState<RelatedQuery | null>(null);

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
		setRelatedQueries(relatedQueries.filter((sq) => sq.query !== query));
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
					placeholder="Search related queries..."
					style={{width: "320px"}}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
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
				relatedQueries={filteredData}
				onEdit={handleEditClick}
				onRemove={handleRemoveRelatedQuery}
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
		</Box>
	);
}
