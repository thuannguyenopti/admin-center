"use client";

import {useState} from "react";
import {Box, Button, Input, Select, Switch, Text} from "@optiaxiom/react";
import {IconPlus, IconXmark} from "@optiaxiom/icons";
import type {BrandPack, ToneOfVoice} from "../../types";
import {getToneOfVoice} from "../../adapters";
import {EditorField, EditorFieldStack, EditorHeader, EditorPage, EditorPanel} from "./EditorPrimitives";
import {ChipList} from "./VoiceChips";
import styles from "./VoiceAudience.module.css";

type ToneOfVoiceTabProps = {
	pack: BrandPack;
};

type TermRule = ToneOfVoice["preferred_terms"][number];

const STYLE_GUIDE_OPTIONS = [
	{label: "None / custom", value: ""},
	{label: "AP Style", value: "AP"},
	{label: "British English", value: "British_English"},
	{label: "American English", value: "American_English"},
	{label: "Custom", value: "custom"},
];

function PreferredTermsSection({
	terms,
	onAdd,
	onRemove,
}: {
	terms: TermRule[];
	onAdd: (term: TermRule) => void;
	onRemove: (index: number) => void;
}) {
	const [open, setOpen] = useState(false);
	const [avoid, setAvoid] = useState("");
	const [useInstead, setUseInstead] = useState("");
	const [context, setContext] = useState("");

	const reset = () => {
		setAvoid("");
		setUseInstead("");
		setContext("");
		setOpen(false);
	};

	const submit = () => {
		if (!avoid.trim() || !useInstead.trim()) {
			return;
		}

		onAdd({
			avoid: avoid.trim(),
			use_instead: useInstead.trim(),
			context: context.trim() || null,
		});
		reset();
	};

	return (
		<EditorPanel title="Preferred terms" description="Approved substitutions and blocked language.">
			<Box display="flex" flexDirection="column" gap="12">
				{open ? (
					<Box className={styles.termForm}>
						<Box className={styles.termGrid}>
							<Box display="flex" flexDirection="column" gap="6">
								<Text className={styles.termColLabel}>Do not use</Text>
								<Input
									placeholder='e.g. "users"'
									size="md"
									value={avoid}
									onChange={(event) => setAvoid(event.target.value)}
								/>
							</Box>
							<Box display="flex" flexDirection="column" gap="6">
								<Text className={styles.termColLabel}>Use instead</Text>
								<Input
									placeholder='e.g. "athletes"'
									size="md"
									value={useInstead}
									onChange={(event) => setUseInstead(event.target.value)}
								/>
							</Box>
							<Box display="flex" flexDirection="column" gap="6">
								<Text className={styles.termColLabel}>Context</Text>
								<Input
									placeholder="e.g. Campaign and social copy"
									size="md"
									value={context}
									onChange={(event) => setContext(event.target.value)}
								/>
							</Box>
						</Box>
						<Box alignItems="center" display="flex" gap="8" justifyContent="end">
							<Button appearance="subtle" onClick={reset} size="md">
								Cancel
							</Button>
							<Button
								appearance="default"
								disabled={!avoid.trim() || !useInstead.trim()}
								onClick={submit}
								size="md"
							>
								Add
							</Button>
						</Box>
					</Box>
				) : (
					<button className={styles.addTrigger} type="button" onClick={() => setOpen(true)}>
						<IconPlus size={14} />
						<span>Add term rule</span>
					</button>
				)}

				{terms.length === 0 ? (
					<Text color="fg.tertiary" style={{fontSize: 14}}>
						None added
					</Text>
				) : (
					<Box className={styles.termList}>
						{terms.map((term, index) => (
							<Box key={`${term.avoid}-${index}`} className={styles.termRow}>
								<Text className={styles.termAvoid}>{term.avoid}</Text>
								<Text className={styles.termUse}>{term.use_instead}</Text>
								<Text className={styles.termContext}>{term.context ?? "—"}</Text>
								<button
									aria-label={`Remove ${term.avoid}`}
									className={styles.cardDelete}
									type="button"
									onClick={() => onRemove(index)}
								>
									<IconXmark size={13} />
								</button>
							</Box>
						))}
					</Box>
				)}
			</Box>
		</EditorPanel>
	);
}

export function ToneOfVoiceTab({pack}: ToneOfVoiceTabProps) {
	const tone = getToneOfVoice(pack);

	// Tone of voice
	const [keyTraits, setKeyTraits] = useState<string[]>(tone.key_traits);
	const [summary, setSummary] = useState(tone.summary ?? "");
	const [formality, setFormality] = useState(tone.formality ?? "");
	const [person, setPerson] = useState(tone.person ?? "");
	const [recurring, setRecurring] = useState<string[]>(tone.recurring_language);
	const [whatToAvoid, setWhatToAvoid] = useState<string[]>(tone.what_to_avoid);
	const [terms, setTerms] = useState<TermRule[]>(tone.preferred_terms);

	// Audience and values
	const [audience, setAudience] = useState(pack.brand_values?.target_audience ?? "");
	const [values, setValues] = useState<string[]>(
		(pack.brand_values?.values ?? []).map((v) => v.name)
	);

	// Writing guidelines
	const writing = pack.writing_guidelines;
	const [styleGuide, setStyleGuide] = useState(writing?.style_guide_reference ?? "");
	const [sentenceCase, setSentenceCase] = useState(writing?.sentence_case_headlines ?? false);
	const [grammar, setGrammar] = useState<string[]>(writing?.grammar_rules ?? []);
	const [descriptors, setDescriptors] = useState<string[]>(writing?.approved_descriptors ?? []);

	const prepend = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (value: string) =>
		setter((current) => [value, ...current]);
	const removeAt = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (index: number) =>
		setter((current) => current.filter((_, i) => i !== index));

	return (
		<EditorPage>
			<EditorHeader
				eyebrow="Voice & Audience"
				title="Voice & Audience settings"
				description="Define how the brand sounds and who it speaks to. These rules guide Opal's tone, word choices, and content targeting across every output."
			/>

			<EditorPanel
				title="Tone of voice"
				description="How the brand communicates — voice traits, formality, person, and what to avoid."
			>
				<EditorFieldStack>
					<EditorField label="Key traits">
						<ChipList
							items={keyTraits}
							placeholder="Add trait"
							variant="positive"
							onAdd={prepend(setKeyTraits)}
							onRemove={removeAt(setKeyTraits)}
						/>
					</EditorField>
					<EditorField label="Summary">
						<Input
							placeholder="How the brand sounds in one or two sentences"
							size="md"
							value={summary}
							onChange={(event) => setSummary(event.target.value)}
						/>
					</EditorField>
					<EditorField label="Formality">
						<Input
							placeholder="e.g. Conversational and expert"
							size="md"
							value={formality}
							onChange={(event) => setFormality(event.target.value)}
						/>
					</EditorField>
					<EditorField label="Person">
						<Input
							placeholder="e.g. Second person for guidance"
							size="md"
							value={person}
							onChange={(event) => setPerson(event.target.value)}
						/>
					</EditorField>
					<EditorField label="Recurring language">
						<ChipList
							items={recurring}
							placeholder="Add phrase"
							variant="neutral"
							onAdd={prepend(setRecurring)}
							onRemove={removeAt(setRecurring)}
						/>
					</EditorField>
					<EditorField label="What to avoid">
						<ChipList
							items={whatToAvoid}
							placeholder="Add something to avoid"
							variant="dont"
							onAdd={prepend(setWhatToAvoid)}
							onRemove={removeAt(setWhatToAvoid)}
						/>
					</EditorField>
				</EditorFieldStack>
			</EditorPanel>

			<PreferredTermsSection
				terms={terms}
				onAdd={(term) => setTerms((current) => [term, ...current])}
				onRemove={(index) => setTerms((current) => current.filter((_, i) => i !== index))}
			/>

			<EditorPanel
				title="Audience and values"
				description="Who the brand speaks to and the principles Opal should reflect."
			>
				<EditorFieldStack>
					<EditorField label="Target audience">
						<Input
							placeholder="Who the brand is speaking to"
							size="md"
							value={audience}
							onChange={(event) => setAudience(event.target.value)}
						/>
					</EditorField>
					<EditorField label="Brand values">
						<ChipList
							items={values}
							placeholder="Add value"
							variant="neutral"
							onAdd={prepend(setValues)}
							onRemove={removeAt(setValues)}
						/>
					</EditorField>
				</EditorFieldStack>
			</EditorPanel>

			<EditorPanel
				title="Writing guidelines"
				description="Grammar, editorial style, and approved descriptors for text-on-image copy."
			>
				<EditorFieldStack>
					<EditorField label="Style reference">
						<Select
							options={STYLE_GUIDE_OPTIONS}
							value={styleGuide}
							onValueChange={(value) => setStyleGuide(value)}
						/>
					</EditorField>
					<EditorField label="Sentence case headlines">
						<Switch checked={sentenceCase} onCheckedChange={setSentenceCase}>
							Required
						</Switch>
					</EditorField>
					<EditorField label="Grammar rules">
						<ChipList
							items={grammar}
							placeholder="Add a grammar rule"
							variant="do"
							onAdd={prepend(setGrammar)}
							onRemove={removeAt(setGrammar)}
						/>
					</EditorField>
					<EditorField label="Approved descriptors">
						<ChipList
							items={descriptors}
							placeholder="Add descriptor"
							variant="neutral"
							onAdd={prepend(setDescriptors)}
							onRemove={removeAt(setDescriptors)}
						/>
					</EditorField>
				</EditorFieldStack>
			</EditorPanel>
		</EditorPage>
	);
}
