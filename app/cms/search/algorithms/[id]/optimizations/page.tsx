"use client";

import {Box, Heading, Alert, Link} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {Button} from "@/app/components/Button";
import {Flex} from "@/app/components/Flex";
import {useParams, useRouter} from "next/navigation";
import {useState, useEffect} from "react";
import usePersistentState from "@/app/usePersistentState";
import {
	PinnedResult,
	initialPinnedResults,
	AlgorithmPinnedResult,
	AlgorithmPinnedResultReference,
	RelatedQuery,
	AlgorithmRelatedQueryReference,
	initialRelatedQueries,
	Synonym,
	AlgorithmSynonymReference,
	initialSynonyms,
	AutocompletePhrase,
	AlgorithmAutocompletePhraseReference,
	initialAutocompletePhrases,
	Algorithm,
	initialAlgorithms,
} from "@/app/db/initialData";
import {IconPlus} from "@tabler/icons-react";
import Preview from "../order/Preview";
import PinnedResultsTable from "../../../components/PinnedResultsTable";
import PinnedResultDialog from "../../../components/PinnedResultDialog";
import RelatedQueriesTable from "../../../components/RelatedQueriesTable";
import RelatedQueryDialog from "../../../components/RelatedQueryDialog";
import SynonymsTable from "../../../components/SynonymsTable";
import SynonymDialog from "../../../components/SynonymDialog";
import AutocompletePhrasesTable from "../../../components/AutocompletePhrasesTable";
import AutocompletePhraseDialog from "../../../components/AutocompletePhraseDialog";
import {Aside} from "@/app/context/LayoutContext";
import searchResults from "@/app/db/searchResults.json";
import {Menu, MenuTrigger, MenuContent} from "@optiaxiom/react";
import {Table, Tr, Td, Th} from "@/app/components/Table";

export default function OptimizationsPage() {
	const params = useParams();
	const router = useRouter();
	const id = params.id as string;

	const [algorithms] = usePersistentState("algorithms", initialAlgorithms) as [Algorithm[], any];
	const currentAlgorithm = algorithms.find((a) => a.id === id);
	const isCustom = currentAlgorithm?.type === "Custom";

	useEffect(() => {
		if (isCustom) {
			router.replace(`/cms/search/algorithms/${id}/filter`);
		}
	}, [isCustom, id, router]);

	// Global list of pinned results
	const [allPinnedResults, setAllPinnedResults] = usePersistentState(
		"pinnedResults",
		initialPinnedResults
	) as [PinnedResult[], (val: PinnedResult[]) => void];

	// Pinned results associated with this algorithm
	const [algorithmPinnedResults, setAlgorithmPinnedResults] = usePersistentState(
		`algorithm_pinned_results_${id}`,
		[]
	) as [AlgorithmPinnedResultReference[], (val: AlgorithmPinnedResultReference[]) => void];

	const hydratedPinnedResults = algorithmPinnedResults
		.map((ref) => {
			const bb = allPinnedResults.find((g) => g.id === ref.pinnedResultId);
			if (!bb) return null;
			return {...bb, status: ref.status};
		})
		.filter((item): item is PinnedResult & {status: "Active" | "Inactive"} => item !== null);

	const [allRelatedQueries, setAllRelatedQueries] = usePersistentState(
		"relatedQueries",
		initialRelatedQueries
	) as [RelatedQuery[], (val: RelatedQuery[]) => void];

	const [relatedQueries, setRelatedQueries] = usePersistentState(
		`algorithm_related_queries_${id}`,
		[]
	) as [AlgorithmRelatedQueryReference[], (val: AlgorithmRelatedQueryReference[]) => void];

	const hydratedRelatedQueries = relatedQueries
		.map((ref) => allRelatedQueries.find((rq) => rq.id === ref.relatedQueryId))
		.filter((item): item is RelatedQuery => item !== undefined);

	const [allSynonyms, setAllSynonyms] = usePersistentState("synonyms", initialSynonyms) as [
		Synonym[],
		(val: Synonym[]) => void
	];

	const [synonyms, setSynonyms] = usePersistentState(`algorithm_synonyms_${id}`, []) as [
		AlgorithmSynonymReference[],
		(val: AlgorithmSynonymReference[]) => void
	];

	const hydratedSynonyms = synonyms
		.map((ref) => allSynonyms.find((s) => s.id === ref.synonymId))
		.filter((item): item is Synonym => item !== undefined);

	const [allAutocompletePhrases, setAllAutocompletePhrases] = usePersistentState(
		"autocompletePhrases",
		initialAutocompletePhrases
	) as [AutocompletePhrase[], (val: AutocompletePhrase[]) => void];

	const [autocompletePhrases, setAutocompletePhrases] = usePersistentState(
		`algorithm_autocomplete_phrases_${id}`,
		[]
	) as [
		AlgorithmAutocompletePhraseReference[],
		(val: AlgorithmAutocompletePhraseReference[]) => void
	];

	const hydratedAutocompletePhrases = autocompletePhrases
		.map((ref) => allAutocompletePhrases.find((p) => p.id === ref.autocompletePhraseId))
		.filter((item): item is AutocompletePhrase => item !== undefined);

	const [selectedPinnedResultQuery, setSelectedPinnedResultQuery] = useState("");

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingPinnedResult, setEditingPinnedResult] = useState<
		(PinnedResult & {status: "Active" | "Inactive"}) | null
	>(null);
	const [createPinnedResultInitialData, setCreatePinnedResultInitialData] = useState<
		{query: string; destination: string} | undefined
	>(undefined);

	const [isCreateRQDialogOpen, setIsCreateRQDialogOpen] = useState(false);
	const [isEditRQDialogOpen, setIsEditRQDialogOpen] = useState(false);
	const [editingRQ, setEditingRQ] = useState<RelatedQuery | null>(null);

	const [isCreateSynonymDialogOpen, setIsCreateSynonymDialogOpen] = useState(false);
	const [isEditSynonymDialogOpen, setIsEditSynonymDialogOpen] = useState(false);
	const [editingSynonym, setEditingSynonym] = useState<Synonym | null>(null);

	const [isCreateAPDialogOpen, setIsCreateAPDialogOpen] = useState(false);
	const [isEditAPDialogOpen, setIsEditAPDialogOpen] = useState(false);
	const [editingAP, setEditingAP] = useState<AutocompletePhrase | null>(null);

	const handleCreatePinnedResultFromPreview = (query: string) => {
		setCreatePinnedResultInitialData({query, destination: ""});
		setIsCreateDialogOpen(true);
	};

	const handleCreatePinnedResult = (data: {
		query: string;
		destination: string;
		status?: "Active" | "Inactive";
	}) => {
		const newId = Date.now().toString();
		const newPinnedResult: PinnedResult = {
			id: newId,
			query: data.query,
			destination: data.destination,
			owner: "Alice Johnson",
		};

		// Add to global list if not exists
		if (!allPinnedResults.some((b) => b.query === newPinnedResult.query)) {
			setAllPinnedResults([...allPinnedResults, newPinnedResult]);
		}

		// Add to local algorithm list
		const newAlgorithmPinnedResult: AlgorithmPinnedResultReference = {
			pinnedResultId: newId,
			status: data.status || "Active",
		};
		setAlgorithmPinnedResults([...algorithmPinnedResults, newAlgorithmPinnedResult]);

		setIsCreateDialogOpen(false);
		setCreatePinnedResultInitialData(undefined);
	};

	const handleRemovePinnedResult = (query: string) => {
		// Find the ID for this query
		const bet = hydratedPinnedResults.find((b) => b.query === query);
		if (bet) {
			setAlgorithmPinnedResults(
				algorithmPinnedResults.filter((b) => b.pinnedResultId !== bet.id)
			);
		}
	};

	const handleEditClick = (
		bet: PinnedResult | (PinnedResult & {status: "Active" | "Inactive"})
	) => {
		const algoBet = bet as PinnedResult & {status: "Active" | "Inactive"};
		setEditingPinnedResult(algoBet);
		setIsEditDialogOpen(true);
	};

	const handleUpdatePinnedResult = (data: {
		query: string;
		destination: string;
		status?: "Active" | "Inactive";
	}) => {
		if (!editingPinnedResult) return;

		// Update global list
		const updatedAllPinnedResults = allPinnedResults.map((b) =>
			b.id === editingPinnedResult.id
				? {
						...b,
						query: data.query,
						destination: data.destination,
				  }
				: b
		);
		setAllPinnedResults(updatedAllPinnedResults);

		// Update local algorithm list status
		const updatedAlgorithmPinnedResults = algorithmPinnedResults.map((b) =>
			b.pinnedResultId === editingPinnedResult.id
				? {...b, status: data.status || "Active"}
				: b
		);
		setAlgorithmPinnedResults(updatedAlgorithmPinnedResults);

		setIsEditDialogOpen(false);
		setEditingPinnedResult(null);
	};

	const handleToggleStatus = (
		bet: PinnedResult & {status: "Active" | "Inactive"},
		newStatus: "Active" | "Inactive"
	) => {
		// Update local algorithm list
		const updatedAlgorithmPinnedResults = algorithmPinnedResults.map((b) =>
			b.pinnedResultId === bet.id ? {...b, status: newStatus} : b
		);
		setAlgorithmPinnedResults(updatedAlgorithmPinnedResults);
	};

	const handleAddRelatedQuery = (data: {query: string; synonyms: string[]}) => {
		const newId = Date.now().toString();
		const newRQ: RelatedQuery = {
			id: newId,
			query: data.query,
			synonyms: data.synonyms,
			owner: "Alice Johnson",
		};

		if (!allRelatedQueries.some((rq) => rq.query === newRQ.query)) {
			setAllRelatedQueries([...allRelatedQueries, newRQ]);
		}

		setRelatedQueries([...relatedQueries, {relatedQueryId: newId}]);
		setIsCreateRQDialogOpen(false);
	};

	const handleEditRQClick = (rq: RelatedQuery) => {
		setEditingRQ(rq);
		setIsEditRQDialogOpen(true);
	};

	const handleUpdateRelatedQuery = (data: {query: string; synonyms: string[]}) => {
		if (!editingRQ) return;

		const updatedList = allRelatedQueries.map((item) =>
			item.id === editingRQ.id
				? {
						...item,
						query: data.query,
						synonyms: data.synonyms,
				  }
				: item
		);

		setAllRelatedQueries(updatedList);
		setIsEditRQDialogOpen(false);
		setEditingRQ(null);
	};

	const handleRemoveRelatedQuery = (query: string) => {
		const rq = hydratedRelatedQueries.find((r) => r.query === query);
		if (rq) {
			setRelatedQueries(relatedQueries.filter((ref) => ref.relatedQueryId !== rq.id));
		}
	};

	const handleAddSynonym = (data: {
		term: string;
		synonyms: string[];
		type: "One-way" | "Two-way";
	}) => {
		const newId = Date.now().toString();
		const newSynonym: Synonym = {
			id: newId,
			term: data.term,
			synonyms: data.synonyms,
			type: data.type,
			owner: "Alice Johnson",
		};

		if (!allSynonyms.some((s) => s.term === newSynonym.term)) {
			setAllSynonyms([...allSynonyms, newSynonym]);
		}

		setSynonyms([...synonyms, {synonymId: newId}]);
		setIsCreateSynonymDialogOpen(false);
	};

	const handleEditSynonymClick = (s: Synonym) => {
		setEditingSynonym(s);
		setIsEditSynonymDialogOpen(true);
	};

	const handleUpdateSynonym = (data: {
		term: string;
		synonyms: string[];
		type: "One-way" | "Two-way";
	}) => {
		if (!editingSynonym) return;

		const updatedList = allSynonyms.map((item) =>
			item.id === editingSynonym.id
				? {
						...item,
						term: data.term,
						synonyms: data.synonyms,
						type: data.type,
				  }
				: item
		);

		setAllSynonyms(updatedList);
		setIsEditSynonymDialogOpen(false);
		setEditingSynonym(null);
	};

	const handleRemoveSynonym = (id: string) => {
		setSynonyms(synonyms.filter((ref) => ref.synonymId !== id));
	};

	const handleAddAutocompletePhrase = (data: {phrase: string}) => {
		const newId = Date.now().toString();
		const newPhrase: AutocompletePhrase = {
			id: newId,
			phrase: data.phrase,
			owner: "Alice Johnson",
		};

		if (!allAutocompletePhrases.some((p) => p.phrase === newPhrase.phrase)) {
			setAllAutocompletePhrases([...allAutocompletePhrases, newPhrase]);
		}

		setAutocompletePhrases([...autocompletePhrases, {autocompletePhraseId: newId}]);
		setIsCreateAPDialogOpen(false);
	};

	const handleEditAPClick = (p: AutocompletePhrase) => {
		setEditingAP(p);
		setIsEditAPDialogOpen(true);
	};

	const handleUpdateAutocompletePhrase = (data: {phrase: string}) => {
		if (!editingAP) return;

		const updatedList = allAutocompletePhrases.map((item) =>
			item.id === editingAP.id
				? {
						...item,
						phrase: data.phrase,
				  }
				: item
		);

		setAllAutocompletePhrases(updatedList);
		setIsEditAPDialogOpen(false);
		setEditingAP(null);
	};

	const handleRemoveAutocompletePhrase = (id: string) => {
		setAutocompletePhrases(
			autocompletePhrases.filter((ref) => ref.autocompletePhraseId !== id)
		);
	};

	// Filter out already added bets from the dropdown
	const availableOptions = allPinnedResults.filter(
		(b) => !algorithmPinnedResults.some((added) => added.pinnedResultId === b.id)
	);

	const availableRelatedQueries = allRelatedQueries.filter(
		(rq) => !relatedQueries.some((added) => added.relatedQueryId === rq.id)
	);

	const availableSynonyms = allSynonyms.filter(
		(s) => !synonyms.some((added) => added.synonymId === s.id)
	);

	const availableAutocompletePhrases = allAutocompletePhrases.filter(
		(p) => !autocompletePhrases.some((added) => added.autocompletePhraseId === p.id)
	);

	if (isCustom) {
		const customObjects = [
			{id: "1", name: "Object A", status: "Active", lastModified: "2023-10-25"},
			{id: "2", name: "Object B", status: "Inactive", lastModified: "2023-10-26"},
			{id: "3", name: "Object C", status: "Active", lastModified: "2023-10-27"},
		];

		return (
			<Box flex="1">
				<Heading
					level="4"
					mb="16"
				>
					Objects
				</Heading>
				<Text mb="16">Manage the objects associated with this custom algorithm.</Text>
				<Table>
					<thead>
						<Tr>
							<Th>Name</Th>
							<Th>Status</Th>
							<Th>Last Modified</Th>
						</Tr>
					</thead>
					<tbody>
						{customObjects.map((obj) => (
							<Tr key={obj.id}>
								<Td>{obj.name}</Td>
								<Td>{obj.status}</Td>
								<Td>{obj.lastModified}</Td>
							</Tr>
						))}
					</tbody>
				</Table>
			</Box>
		);
	}

	return (
		<>
			<Box flex="1">
				<Heading
					level="4"
					mb="16"
				>
					Pinned Results
				</Heading>
				<Text mb="16">
					Associate specific pinned results with this algorithm to override default
					behavior.
				</Text>

				{hydratedPinnedResults.length > 0 ? (
					<PinnedResultsTable
						pinnedResults={hydratedPinnedResults}
						onEdit={handleEditClick}
						onRemove={handleRemovePinnedResult}
						availablePinnedResults={availableOptions}
						onAdd={(bet) =>
							setAlgorithmPinnedResults([
								...algorithmPinnedResults,
								{pinnedResultId: bet.id, status: "Active"},
							])
						}
						onCreate={() => {
							setCreatePinnedResultInitialData(undefined);
							setIsCreateDialogOpen(true);
						}}
						onToggleStatus={handleToggleStatus}
					/>
				) : (
					<Alert intent="information">
						<Text>
							No similar Pinned Results defined yet.{" "}
							<Menu
								options={[
									{
										group: {label: "", hidden: true, separator: true},
										label: "Create New Pinned Result",
										addon: <IconPlus size={16} />,
										execute: () => {
											setCreatePinnedResultInitialData(undefined);
											setIsCreateDialogOpen(true);
										},
									},
									...(availableOptions.length > 0
										? availableOptions.map((bet) => ({
												label:
													searchResults.find(
														(r) => r.url === bet.destination
													)?.title || bet.destination,
												value: bet.query,
												description: bet.query,
												execute: () =>
													setAlgorithmPinnedResults([
														...algorithmPinnedResults,
														{
															pinnedResultId: bet.id,
															status: "Active" as const,
														},
													]),
										  }))
										: []),
								]}
							>
								<MenuTrigger asChild>
									<Link cursor="pointer">Add one...</Link>
								</MenuTrigger>
								<MenuContent />
							</Menu>
						</Text>
					</Alert>
				)}

				<Box mt="32">
					<Heading
						level="4"
						mb="16"
					>
						Related Queries
					</Heading>
					<Text mb="16">
						Define groups of queries that should be treated as synonyms to improve
						search recall.
					</Text>

					{hydratedRelatedQueries.length > 0 ? (
						<>
							<RelatedQueriesTable
								relatedQueries={hydratedRelatedQueries}
								onEdit={handleEditRQClick}
								onRemove={handleRemoveRelatedQuery}
								showOwner={false}
							/>

							<Menu
								options={[
									{
										group: {label: "", hidden: true, separator: true},
										label: "Create New Related Query",
										addon: <IconPlus size={16} />,
										execute: () => setIsCreateRQDialogOpen(true),
									},
									...(availableRelatedQueries.length > 0
										? availableRelatedQueries.map((rq) => ({
												label: rq.query,
												value: rq.query,
												description: rq.synonyms.join(", "),
												execute: () =>
													setRelatedQueries([
														...relatedQueries,
														{relatedQueryId: rq.id},
													]),
										  }))
										: []),
								]}
							>
								<MenuTrigger
									size="lg"
									mt="16"
									addonBefore={<IconPlus size={16} />}
								>
									Add Related Query...
								</MenuTrigger>
								<MenuContent />
							</Menu>
						</>
					) : (
						<Alert intent="information">
							<Text>
								No Related Queries defined yet.{" "}
								<Menu
									options={[
										{
											group: {label: "", hidden: true, separator: true},
											label: "Create New Related Query",
											addon: <IconPlus size={16} />,
											execute: () => setIsCreateRQDialogOpen(true),
										},
										...(availableRelatedQueries.length > 0
											? availableRelatedQueries.map((rq) => ({
													label: rq.query,
													value: rq.query,
													description: rq.synonyms.join(", "),
													execute: () =>
														setRelatedQueries([
															...relatedQueries,
															{relatedQueryId: rq.id},
														]),
											  }))
											: []),
									]}
								>
									<MenuTrigger asChild>
										<Link cursor="pointer">Add one...</Link>
									</MenuTrigger>
									<MenuContent />
								</Menu>
							</Text>
						</Alert>
					)}
				</Box>

				<Box mt="32">
					<Heading
						level="4"
						mb="16"
					>
						Synonyms
					</Heading>
					<Text mb="16">Define equivalent terms to expand search results.</Text>

					{hydratedSynonyms.length > 0 ? (
						<>
							<SynonymsTable
								synonyms={hydratedSynonyms}
								onEdit={handleEditSynonymClick}
								onRemove={handleRemoveSynonym}
								showOwner={false}
							/>

							<Menu
								options={[
									{
										group: {label: "", hidden: true, separator: true},
										label: "Create New Synonym",
										addon: <IconPlus size={16} />,
										execute: () => setIsCreateSynonymDialogOpen(true),
									},
									...(availableSynonyms.length > 0
										? availableSynonyms.map((s) => ({
												label: s.term,
												value: s.term,
												description: s.synonyms.join(", "),
												execute: () =>
													setSynonyms([...synonyms, {synonymId: s.id}]),
										  }))
										: []),
								]}
							>
								<MenuTrigger
									size="lg"
									mt="16"
									addonBefore={<IconPlus size={16} />}
								>
									Add Synonym...
								</MenuTrigger>
								<MenuContent />
							</Menu>
						</>
					) : (
						<Alert intent="information">
							<Text>
								No Synonyms defined yet.{" "}
								<Menu
									options={[
										{
											group: {label: "", hidden: true, separator: true},
											label: "Create New Synonym",
											addon: <IconPlus size={16} />,
											execute: () => setIsCreateSynonymDialogOpen(true),
										},
										...(availableSynonyms.length > 0
											? availableSynonyms.map((s) => ({
													label: s.term,
													value: s.term,
													description: s.synonyms.join(", "),
													execute: () =>
														setSynonyms([
															...synonyms,
															{synonymId: s.id},
														]),
											  }))
											: []),
									]}
								>
									<MenuTrigger asChild>
										<Link cursor="pointer">Add one...</Link>
									</MenuTrigger>
									<MenuContent />
								</Menu>
							</Text>
						</Alert>
					)}
				</Box>

				<Box mt="32">
					<Heading
						level="4"
						mb="16"
					>
						Autocomplete Phrases
					</Heading>
					<Text mb="16">Define phrases to appear in autocomplete suggestions.</Text>

					{hydratedAutocompletePhrases.length > 0 ? (
						<>
							<AutocompletePhrasesTable
								phrases={hydratedAutocompletePhrases}
								onEdit={handleEditAPClick}
								onRemove={handleRemoveAutocompletePhrase}
								showOwner={false}
							/>

							<Menu
								options={[
									{
										group: {label: "", hidden: true, separator: true},
										label: "Create New Phrase",
										addon: <IconPlus size={16} />,
										execute: () => setIsCreateAPDialogOpen(true),
									},
									...(availableAutocompletePhrases.length > 0
										? availableAutocompletePhrases.map((p) => ({
												label: p.phrase,
												value: p.phrase,
												execute: () =>
													setAutocompletePhrases([
														...autocompletePhrases,
														{autocompletePhraseId: p.id},
													]),
										  }))
										: []),
								]}
							>
								<MenuTrigger
									size="lg"
									mt="16"
									addonBefore={<IconPlus size={16} />}
								>
									Add Phrase...
								</MenuTrigger>
								<MenuContent />
							</Menu>
						</>
					) : (
						<Alert intent="information">
							<Text>
								No Autocomplete Phrases defined yet.{" "}
								<Menu
									options={[
										{
											group: {label: "", hidden: true, separator: true},
											label: "Create New Phrase",
											addon: <IconPlus size={16} />,
											execute: () => setIsCreateAPDialogOpen(true),
										},
										...(availableAutocompletePhrases.length > 0
											? availableAutocompletePhrases.map((p) => ({
													label: p.phrase,
													value: p.phrase,
													execute: () =>
														setAutocompletePhrases([
															...autocompletePhrases,
															{autocompletePhraseId: p.id},
														]),
											  }))
											: []),
									]}
								>
									<MenuTrigger asChild>
										<Link cursor="pointer">Add one...</Link>
									</MenuTrigger>
									<MenuContent />
								</Menu>
							</Text>
						</Alert>
					)}
				</Box>

				<PinnedResultDialog
					open={isCreateDialogOpen}
					setOpen={setIsCreateDialogOpen}
					mode="create"
					initialData={createPinnedResultInitialData}
					onSave={handleCreatePinnedResult}
					showStatus={true}
				/>

				<PinnedResultDialog
					open={isEditDialogOpen}
					setOpen={setIsEditDialogOpen}
					mode="edit"
					initialData={editingPinnedResult || undefined}
					onSave={handleUpdatePinnedResult}
					showStatus={true}
				/>

				<RelatedQueryDialog
					open={isCreateRQDialogOpen}
					setOpen={setIsCreateRQDialogOpen}
					mode="create"
					onSave={handleAddRelatedQuery}
				/>

				<RelatedQueryDialog
					open={isEditRQDialogOpen}
					setOpen={setIsEditRQDialogOpen}
					mode="edit"
					initialData={editingRQ || undefined}
					onSave={handleUpdateRelatedQuery}
				/>

				<SynonymDialog
					open={isCreateSynonymDialogOpen}
					setOpen={setIsCreateSynonymDialogOpen}
					mode="create"
					onSave={handleAddSynonym}
				/>

				<SynonymDialog
					open={isEditSynonymDialogOpen}
					setOpen={setIsEditSynonymDialogOpen}
					mode="edit"
					initialData={editingSynonym || undefined}
					onSave={handleUpdateSynonym}
				/>

				<AutocompletePhraseDialog
					open={isCreateAPDialogOpen}
					setOpen={setIsCreateAPDialogOpen}
					mode="create"
					onSave={handleAddAutocompletePhrase}
				/>

				<AutocompletePhraseDialog
					open={isEditAPDialogOpen}
					setOpen={setIsEditAPDialogOpen}
					mode="edit"
					initialData={editingAP || undefined}
					onSave={handleUpdateAutocompletePhrase}
				/>
			</Box>

			<Aside>
				<Preview
					algorithmPinnedResults={algorithmPinnedResults}
					onAlgorithmPinnedResultsChange={setAlgorithmPinnedResults}
					globalPinnedResults={allPinnedResults}
					onGlobalPinnedResultsChange={setAllPinnedResults}
					algorithmRelatedQueries={relatedQueries}
					globalRelatedQueries={allRelatedQueries}
					algorithmSynonyms={synonyms}
					globalSynonyms={allSynonyms}
					algorithmAutocompletePhrases={autocompletePhrases}
					globalAutocompletePhrases={allAutocompletePhrases}
				/>
			</Aside>
		</>
	);
}
