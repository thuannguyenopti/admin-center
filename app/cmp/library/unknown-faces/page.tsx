"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLayout } from "@/app/context/LayoutContext";
import { Box, Heading, Text } from "@optiaxiom/react";
import { peopleItems } from "../components/people/data";
import { AllClearState } from "./components/AllClearState";
import { QueueCard } from "./components/QueueCard";
import { ReviewDecisionPanel } from "./components/ReviewDecisionPanel";
import { ReviewHeader } from "./components/ReviewHeader";
import { UnknownFaceHero } from "./components/UnknownFaceHero";
import { unknownFaces, type UnknownFace } from "./data";

type Decision = "named" | "dismissed" | "merged";
type FaceBox = UnknownFace["faceBox"];

const PEOPLE_LIBRARY_URL = "/cmp/library?tab=people";

export default function UnknownFacesPage() {
	const router = useRouter();
	const { setHidePageHeader } = useLayout();
	const [decisions, setDecisions] = useState<Record<string, Decision>>({});
	const [currentIndex, setCurrentIndex] = useState(0);
	const [draftName, setDraftName] = useState("");
	const [manualBox, setManualBox] = useState<FaceBox | null>(null);

	useEffect(() => {
		setHidePageHeader?.(true);
		return () => setHidePageHeader?.(false);
	}, [setHidePageHeader]);

	const queue = useMemo(
		() => unknownFaces.filter((face) => !decisions[face.id]),
		[decisions],
	);

	const current = queue[currentIndex] ?? queue[0];
	const completed = unknownFaces.length - queue.length;

	const matchedPerson = useMemo(() => {
		const query = draftName.trim().toLowerCase();
		if (query.length < 2) return null;

		return (
			peopleItems.find(
				(person) =>
					person.status === "named" &&
					(person.name.toLowerCase() === query ||
						person.name.toLowerCase().includes(query)),
			) ?? null
		);
	}, [draftName]);

	const referenceImages = useMemo(() => {
		if (!current) return [];

		const candidates = [
			matchedPerson?.image,
			current.heroImage,
			...(current.otherAppearances ?? []),
			...peopleItems
				.filter((person) => person.status === "named" && person.id !== matchedPerson?.id)
				.slice(0, 5)
				.map((person) => person.image),
		].filter(Boolean) as string[];

		return Array.from(new Set(candidates)).slice(0, 5);
	}, [current, matchedPerson]);

	const resetDraft = () => {
		setDraftName("");
		setManualBox(null);
	};

	const advance = () => {
		setCurrentIndex((index) => (index >= queue.length - 1 ? 0 : index));
		resetDraft();
	};

	const handleAcceptSuggestion = () => {
		if (!current) return;
		setDecisions((prev) => ({ ...prev, [current.id]: "named" }));
		advance();
	};

	const handleConfirmName = () => {
		if (!current || !draftName.trim()) return;
		setDecisions((prev) => ({ ...prev, [current.id]: "named" }));
		advance();
	};

	const handleDismiss = () => {
		if (!current) return;
		setDecisions((prev) => ({ ...prev, [current.id]: "dismissed" }));
		advance();
	};

	const handleSkip = () => {
		setCurrentIndex((index) => (index + 1) % Math.max(queue.length, 1));
		resetDraft();
	};

	if (!current) {
		return <AllClearState onBack={() => router.push(PEOPLE_LIBRARY_URL)} />;
	}

	return (
		<Box
			className="axiom-v3-recognition"
			display="flex"
			flexDirection="column"
			gap="20"
			pb="32"
		>
			<ReviewHeader
				completed={completed}
				total={unknownFaces.length}
				onBack={() => router.push(PEOPLE_LIBRARY_URL)}
			/>

			<Box
				alignItems="start"
				display="grid"
				gap="24"
				style={{ gridTemplateColumns: "minmax(0, 1.45fr) minmax(360px, 0.9fr)" }}
			>
				<UnknownFaceHero
					face={current}
					manualBox={manualBox}
					onPlaceManualBox={setManualBox}
				/>
				<ReviewDecisionPanel
					current={current}
					draftName={draftName}
					manualBox={manualBox}
					matchedPerson={matchedPerson}
					referenceImages={referenceImages}
					onAcceptSuggestion={handleAcceptSuggestion}
					onChangeDraftName={setDraftName}
					onConfirmName={handleConfirmName}
					onDismiss={handleDismiss}
					onSkip={handleSkip}
				/>
			</Box>

			<Box display="flex" flexDirection="column" gap="12">
				<Box alignItems="center" display="flex" gap="8" justifyContent="space-between">
					<Heading level="3" fontSize="md" style={{ margin: 0 }}>
						Up next
					</Heading>
					<Text fontSize="sm" color="fg.secondary">
						{queue.length - 1} faces remaining
					</Text>
				</Box>
				<Box display="flex" gap="10" overflow="auto" pb="4">
					{queue.slice(1, 8).map((face) => (
						<QueueCard key={face.id} face={face} />
					))}
				</Box>
			</Box>
		</Box>
	);
}
