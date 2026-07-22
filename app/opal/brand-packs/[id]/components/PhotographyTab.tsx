"use client";

import {useState} from "react";
import {IconPlus, IconXmark} from "@optiaxiom/icons";
import {Box, Button, Input, Text, Textarea} from "@optiaxiom/react";
import type {BrandPack, PhotographyMoodBrief} from "../../types";
import {EditorField, EditorFieldStack, EditorHeader, EditorPage, EditorPanel} from "./EditorPrimitives";
import styles from "./PhotographyTab.module.css";

type PhotographyTabProps = {
	pack: BrandPack;
};

const DEFAULT_MOOD_BRIEF: PhotographyMoodBrief = {
	summary:
		"Bold endurance-sport photography with visible motion, natural race-day environments, and confident athletes in forward-moving contexts.",
	lighting: "Natural or controlled lighting with high contrast and no harsh flash.",
	colour_treatment:
		"High contrast with crisp blacks, whites, and electric lime accents. Avoid warm, muted, or pastel grades.",
	subject_matter:
		"Confident athletes and teams shown active and moving forward in real race-day environments.",
	// Migrated from the previous "hard constraints" list — a single what_to_avoid list per schema v2.
	what_to_avoid: [
		"Do not use generic corporate wellness scenes.",
		"Do not generate or redraw logos inside photography.",
		"Do not use low-energy still lifes unless the category explicitly calls for product detail.",
	],
};

function WhatToAvoidList({
	items,
	onAdd,
	onRemove,
}: {
	items: string[];
	onAdd: (value: string) => void;
	onRemove: (index: number) => void;
}) {
	const [text, setText] = useState("");

	const submit = () => {
		const trimmed = text.trim();
		if (!trimmed) {
			return;
		}

		onAdd(trimmed);
		setText("");
	};

	return (
		<Box display="flex" flexDirection="column" gap="10">
			<Box className={styles.avoidAddRow}>
				<Input
					placeholder="Add something to avoid…"
					size="md"
					value={text}
					onChange={(event) => setText(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							submit();
						}
					}}
				/>
				<Button appearance="default" icon={<IconPlus />} onClick={submit} size="md">
					Add
				</Button>
			</Box>

			{items.length === 0 ? (
				<Text color="fg.tertiary" style={{fontSize: 14}}>
					None added
				</Text>
			) : (
				<Box display="flex" flexDirection="column" gap="8">
					{items.map((item, index) => (
						<Box key={`${item}-${index}`} className={styles.avoidChip}>
							<Text style={{fontSize: 14, lineHeight: 1.45, minWidth: 0}}>{item}</Text>
							<button
								aria-label={`Remove "${item}"`}
								className={styles.avoidChipDelete}
								type="button"
								onClick={() => onRemove(index)}
							>
								<IconXmark size={12} />
							</button>
						</Box>
					))}
				</Box>
			)}
		</Box>
	);
}

export function PhotographyTab({pack}: PhotographyTabProps) {
	const [brief, setBrief] = useState<PhotographyMoodBrief>(
		() => pack.photography_mood_brief ?? DEFAULT_MOOD_BRIEF
	);

	const update = (patch: Partial<PhotographyMoodBrief>) =>
		setBrief((current) => ({...current, ...patch}));

	const addAvoid = (value: string) =>
		setBrief((current) => ({...current, what_to_avoid: [value, ...current.what_to_avoid]}));

	const removeAvoid = (index: number) =>
		setBrief((current) => ({
			...current,
			what_to_avoid: current.what_to_avoid.filter((_, i) => i !== index),
		}));

	return (
		<EditorPage>
			<EditorHeader
				eyebrow="Photography"
				title="Photography generation settings"
				description="Configure how Opal selects, crops, references, and generates photography. Image files live in Assets; this page stores the LLM rules around them."
			/>

			<EditorPanel
				title="LLM photography rules"
				description="Operational rules used by generation, compositing, template matching, and brand checks."
			>
				<EditorFieldStack>
					<EditorField label="Summary">
						<Textarea
							placeholder="Describe the photographic tone — the feel of brand imagery."
							rows={3}
							value={brief.summary}
							onChange={(event) => update({summary: event.target.value})}
						/>
					</EditorField>
					<EditorField label="Lighting">
						<Input
							placeholder="e.g. Natural or practical — no studio setups. High contrast, deep shadows."
							size="md"
							value={brief.lighting ?? ""}
							onChange={(event) => update({lighting: event.target.value || null})}
						/>
					</EditorField>
					<EditorField label="Colour treatment">
						<Input
							placeholder="Any specified colour grade or post-processing treatment."
							size="md"
							value={brief.colour_treatment ?? ""}
							onChange={(event) =>
								update({colour_treatment: event.target.value || null})
							}
						/>
					</EditorField>
					<EditorField label="Subject matter">
						<Input
							placeholder="Who or what is typically depicted."
							size="md"
							value={brief.subject_matter ?? ""}
							onChange={(event) =>
								update({subject_matter: event.target.value || null})
							}
						/>
					</EditorField>
					<EditorField label="What to avoid">
						<WhatToAvoidList
							items={brief.what_to_avoid}
							onAdd={addAvoid}
							onRemove={removeAvoid}
						/>
					</EditorField>
				</EditorFieldStack>
			</EditorPanel>
		</EditorPage>
	);
}
