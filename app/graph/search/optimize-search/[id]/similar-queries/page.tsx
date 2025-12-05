"use client";

import {Box, Heading, Field} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {Button} from "@/app/components/Button";
import {Input} from "@/app/components/Input";
import {Flex} from "@/app/components/Flex";
import {useParams} from "next/navigation";
import {useState} from "react";
import usePersistentState from "@/app/usePersistentState";
import {IconPlus, IconTrash} from "@tabler/icons-react";
import {Table, Tr, Td, Th} from "@/app/components/Table";
import Preview from "../order/Preview";
import {Aside} from "@/app/context/LayoutContext";
import {AlgorithmBestBet} from "@/app/db/initialData";

type SimilarQuery = {
	query: string;
	synonyms: string[];
};

export default function SimilarQueriesPage() {
	const params = useParams();
	const id = params.id as string;

	const [algorithmBestBets] = usePersistentState(`algorithm_best_bets_${id}`, []) as [
		AlgorithmBestBet[],
		any
	];

	const [similarQueries, setSimilarQueries] = usePersistentState(
		`algorithm_similar_queries_${id}`,
		[]
	) as [SimilarQuery[], (val: SimilarQuery[]) => void];

	const [newQuery, setNewQuery] = useState("");
	const [newSynonyms, setNewSynonyms] = useState("");

	const handleAddSimilarQuery = () => {
		if (!newQuery || !newSynonyms) return;

		const synonymsList = newSynonyms
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);

		setSimilarQueries([
			...similarQueries,
			{
				query: newQuery,
				synonyms: synonymsList,
			},
		]);

		setNewQuery("");
		setNewSynonyms("");
	};

	const handleRemoveSimilarQuery = (query: string) => {
		setSimilarQueries(similarQueries.filter((q) => q.query !== query));
	};

	return (
		<Flex
			flexDirection="row"
			h="full"
			alignItems="stretch"
			gap="32"
		>
			<Box flex="1">
				<Text
					mb="16"
					color="fg.secondary"
				>
					Define groups of queries that should be treated as synonyms to improve search
					recall.
				</Text>

				{similarQueries.length > 0 && (
					<Table>
						<thead>
							<Tr>
								<Th>Primary Query</Th>
								<Th>Synonyms</Th>
								<Th></Th>
							</Tr>
						</thead>
						<tbody>
							{similarQueries.map((item) => (
								<Tr key={item.query}>
									<Td>{item.query}</Td>
									<Td>{item.synonyms.join(", ")}</Td>
									<Td type="button">
										<Button
											icon={<IconTrash size={16} />}
											appearance="subtle"
											onClick={() => handleRemoveSimilarQuery(item.query)}
											aria-label="Remove"
										/>
									</Td>
								</Tr>
							))}
						</tbody>
					</Table>
				)}

				<Flex
					flexDirection="column"
					gap="16"
					mt="24"
					maxW="lg"
					p="16"
					bg="bg.accent.subtle"
					rounded="md"
				>
					<Heading level="4">Add New Synonym Group</Heading>
					<Field
						label="Primary Query"
						required
					>
						<Input
							placeholder="e.g. sneakers"
							value={newQuery}
							onChange={(e) => setNewQuery(e.target.value)}
						/>
					</Field>
					<Field
						label="Synonyms (comma separated)"
						required
					>
						<Input
							placeholder="e.g. trainers, running shoes, kicks"
							value={newSynonyms}
							onChange={(e) => setNewSynonyms(e.target.value)}
						/>
					</Field>
					<Button
						icon={<IconPlus size={16} />}
						onClick={handleAddSimilarQuery}
						appearance="primary"
						disabled={!newQuery || !newSynonyms}
						alignSelf="start"
					>
						Add Group
					</Button>
				</Flex>
			</Box>
			<Aside>
				<Preview
					algorithmBestBets={algorithmBestBets}
					similarQueries={similarQueries}
				/>
			</Aside>
		</Flex>
	);
}
