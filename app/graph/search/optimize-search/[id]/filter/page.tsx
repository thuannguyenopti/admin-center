"use client";

import {Box, Heading} from "@optiaxiom/react";
import {Aside} from "@/app/context/LayoutContext";
import Preview from "../order/Preview";
import {useParams} from "next/navigation";
import usePersistentState from "@/app/usePersistentState";
import {AlgorithmBestBet} from "@/app/db/initialData";
import {Text} from "@/app/components/Text";

type RelatedQuery = {
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

	const [relatedQueries] = usePersistentState(`algorithm_related_queries_${id}`, []) as [
		RelatedQuery[],
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
				<Text>Filter settings content goes here.</Text>
			</Box>
			<Aside>
				<Preview
					algorithmBestBets={algorithmBestBets}
					relatedQueries={relatedQueries}
				/>
			</Aside>
		</>
	);
}
