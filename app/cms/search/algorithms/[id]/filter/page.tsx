"use client";

import {Box, Heading} from "@optiaxiom/react";
import {Aside} from "@/app/context/LayoutContext";
import Preview from "../order/Preview";
import {useParams} from "next/navigation";
import {use} from "react";
import usePersistentState from "@/app/usePersistentState";
import {AlgorithmPinnedResult, Algorithm, initialAlgorithms} from "@/app/db/initialData";
import {Text} from "@/app/components/Text";

type RelatedQuery = {
	query: string;
	synonyms: string[];
};

export default function FilterPage() {
	const params = useParams();
	const resolvedParams = params instanceof Promise ? use(params) : params;
	const id = (resolvedParams?.id ?? "") as string;

	const [algorithms] = usePersistentState("algorithms", initialAlgorithms) as [Algorithm[], any];
	const currentAlgorithm = algorithms.find((a) => a.id === id);

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
				<Preview />
			</Aside>
		</>
	);
}
