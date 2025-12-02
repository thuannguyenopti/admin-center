"use client";

import {
	Box,
	Button,
	Flex,
	Heading,
	Select,
	SelectContent,
	SelectTrigger,
	Text,
} from "@optiaxiom/react";
import {useParams} from "next/navigation";
import {useState} from "react";
import usePersistentState from "@/app/usePersistentState";
import {BestBet, initialBestBets} from "@/app/db/initialData";
import {Table, Tr, Td, Th} from "@/app/components/Table";
import Item from "@/app/components/Item";
import {IconRocket, IconTrash, IconPlus} from "@tabler/icons-react";

export default function OptimizationsPage() {
	const params = useParams();
	const id = params.id as string;

	// Global list of best bets
	const [allBestBets] = usePersistentState("bestBets", initialBestBets) as [BestBet[], any];

	// Best bets associated with this algorithm
	const [algorithmBestBets, setAlgorithmBestBets] = usePersistentState(
		`algorithm_best_bets_${id}`,
		[]
	) as [BestBet[], (val: BestBet[]) => void];

	const [selectedBestBetQuery, setSelectedBestBetQuery] = useState("");

	const handleAddBestBet = () => {
		if (!selectedBestBetQuery) return;
		const betToAdd = allBestBets.find((b) => b.query === selectedBestBetQuery);
		if (betToAdd && !algorithmBestBets.some((b) => b.query === betToAdd.query)) {
			setAlgorithmBestBets([...algorithmBestBets, betToAdd]);
		}
		setSelectedBestBetQuery("");
	};

	const handleRemoveBestBet = (query: string) => {
		setAlgorithmBestBets(algorithmBestBets.filter((b) => b.query !== query));
	};

	// Filter out already added bets from the dropdown
	const availableOptions = allBestBets.filter(
		(b) => !algorithmBestBets.some((added) => added.query === b.query)
	);

	return (
		<Box>
			<Heading
				level="4"
				mb="16"
			>
				Best Bets
			</Heading>
			<Text
				mb="16"
				color="fg.secondary"
			>
				Associate specific best bets with this algorithm to override default behavior.
			</Text>

			<Flex
				flexDirection="row"
				gap="8"
				alignItems="end"
				mb="24"
				maxW="lg"
			>
				<Box flex="1">
					<Select
						value={selectedBestBetQuery}
						onValueChange={setSelectedBestBetQuery}
						options={availableOptions.map((b) => ({label: b.query, value: b.query}))}
						disabled={availableOptions.length === 0}
					>
						<SelectTrigger size="lg">
							{selectedBestBetQuery || "Select a Best Bet to add..."}
						</SelectTrigger>
						<SelectContent />
					</Select>
				</Box>
				<Button
					size="lg"
					icon={<IconPlus size={16} />}
					onClick={handleAddBestBet}
					disabled={!selectedBestBetQuery}
				>
					Add
				</Button>
			</Flex>

			{algorithmBestBets.length > 0 && (
				<Table>
					<thead>
						<Tr>
							<Th>Query</Th>
							<Th>Destination</Th>
							<Th></Th>
						</Tr>
					</thead>
					<tbody>
						{algorithmBestBets.map((bet) => (
							<Tr key={bet.query}>
								<Td type="raw">
									<Item
										icon={<IconRocket size={16} />}
										title={bet.query}
									/>
								</Td>
								<Td>{bet.destination}</Td>
								<Td type="button">
									<Flex justifyContent="end">
										<Button
											appearance="subtle"
											icon={<IconTrash size={16} />}
											onClick={() => handleRemoveBestBet(bet.query)}
											aria-label="Remove"
										/>
									</Flex>
								</Td>
							</Tr>
						))}
					</tbody>
				</Table>
			)}
		</Box>
	);
}
