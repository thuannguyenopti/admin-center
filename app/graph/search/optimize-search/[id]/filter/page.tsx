"use client";

import {Box, Heading} from "@optiaxiom/react";
import {Aside} from "@/app/context/LayoutContext";
import Preview from "../order/Preview";
import {useParams} from "next/navigation";
import usePersistentState from "@/app/usePersistentState";
import {AlgorithmBestBet} from "@/app/db/initialData";

type SimilarQuery = {
	query: string;
	synonyms: string[];
};

export default function FilterPage() {
	const params = useParams();
	const id = params.id as string;

	const [algorithmBestBets] = usePersistentState(`algorithm_best_bets_${id}`, []) as [
		AlgorithmBestBet[],
		any
	];

	const [similarQueries] = usePersistentState(`algorithm_similar_queries_${id}`, []) as [
		SimilarQuery[],
		any
	];

	return (
		<>
			<Box maxW="lg">
				<Heading
					level="4"
					mb="16"
				>
					Filter
				</Heading>
				<Box>Filter settings content goes here.</Box>
			</Box>
			<Aside>
				<Preview
					algorithmBestBets={algorithmBestBets}
					similarQueries={similarQueries}
				/>
			</Aside>
		</>
	);
}
