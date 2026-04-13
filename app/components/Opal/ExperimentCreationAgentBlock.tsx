"use client";

import { useMemo, useState } from "react";
import {
	Box,
	Field,
	Select,
	SelectTrigger,
	SelectContent,
	Switch,
	Text as AxiomText,
	Textarea,
} from "@optiaxiom/react";
import { IconAgent } from "@optimizely/axiom-icons";
import { Button } from "../Button";
import { Input } from "../Input";
import type { ExperimentCreationAgentPayload } from "./experimentCreationAgentTypes";
import { SavedPagesPicker } from "@/app/web-experimentation/SavedPagesPicker";
import { MOCK_SAVED_PAGES } from "@/app/web-experimentation/savedPagesMock";

const TARGET_BY_OPTIONS = [
	{ label: "URL", value: "url" },
	{ label: "Saved Pages", value: "saved-pages" },
] as const;

function initialTargetValueFromPayload(payloadTargetByLabel: string): string {
	const v = TARGET_BY_OPTIONS.find((o) => o.label === payloadTargetByLabel)?.value;
	return v ?? "url";
}

type ExperimentCreationAgentBlockProps = {
	payload: ExperimentCreationAgentPayload;
	onSubmitPrompt: (message: string) => void;
	disabled?: boolean;
};

function buildRunAgentMessage(values: {
	name: string;
	description: string;
	hypothesis: string;
	targetByLabel: string;
	destination: string;
	destinationLineLabel: "URL" | "Destination";
	includeMetadata: boolean;
}): string {
	return [
		"Run the Experiment Creation agent with the following inputs:",
		"",
		`Name: ${values.name}`,
		`Description: ${values.description}`,
		`Hypothesis: ${values.hypothesis}`,
		`Target by: ${values.targetByLabel}`,
		`${values.destinationLineLabel}: ${values.destination}`,
		`Include metadata in output: ${values.includeMetadata ? "yes" : "no"}`,
	].join("\n");
}

export function ExperimentCreationAgentBlock({
	payload,
	onSubmitPrompt,
	disabled = false,
}: ExperimentCreationAgentBlockProps) {
	const catalog =
		payload.savedPagesCatalog != null && payload.savedPagesCatalog.length > 0
			? payload.savedPagesCatalog
			: [...MOCK_SAVED_PAGES];
	const [name, setName] = useState(payload.name);
	const [description, setDescription] = useState(payload.description);
	const [hypothesis, setHypothesis] = useState(payload.hypothesis);
	const [targetByValue, setTargetByValue] = useState<string>(() =>
		initialTargetValueFromPayload(payload.targetBy),
	);
	const [urlDestination, setUrlDestination] = useState(payload.url);
	const [selectedSavedPageIds, setSelectedSavedPageIds] = useState<string[]>(() => [
		...(payload.savedPageIdsInitial ?? []),
	]);
	const [savedPagesSearch, setSavedPagesSearch] = useState(
		payload.savedPagesSearchInitial ?? "",
	);
	const [includeMetadata, setIncludeMetadata] = useState(false);

	const targetByLabel =
		TARGET_BY_OPTIONS.find((o) => o.value === targetByValue)?.label ?? payload.targetBy;

	const destinationForRun = useMemo(() => {
		if (targetByValue === "saved-pages") {
			const names: string[] = [];
			for (const id of selectedSavedPageIds) {
				const p = catalog.find((x) => x.id === id);
				if (p) names.push(p.name);
			}
			return names.join(", ");
		}
		return urlDestination.trim();
	}, [targetByValue, selectedSavedPageIds, catalog, urlDestination]);

	const canRun = useMemo(() => {
		if (!name.trim()) return false;
		if (targetByValue === "saved-pages") return selectedSavedPageIds.length > 0;
		return urlDestination.trim().length > 0;
	}, [name, targetByValue, selectedSavedPageIds.length, urlDestination]);

	return (
		<Box display="flex" flexDirection="column" gap="16" w="full">
			<AxiomText fontSize="sm" style={{ margin: 0, color: "var(--opal-text-body)", lineHeight: 1.45 }}>
				{payload.intro}
			</AxiomText>

			<Box
				rounded="md"
				border="1"
				borderColor="border.tertiary"
				bg="bg.default"
				p="16"
				display="flex"
				flexDirection="column"
				gap="16"
				w="full"
			>
				<Box display="flex" flexDirection="row" gap="12" alignItems="start" w="full">
					<Box
						style={{
							width: 40,
							height: 40,
							borderRadius: 8,
							flexShrink: 0,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							background: "linear-gradient(135deg, #5B4CE8 0%, #7C5CF0 100%)",
						}}
					>
						<IconAgent size={22} color="#FFFFFF" />
					</Box>
					<Box display="flex" flexDirection="column" gap="4" style={{ minWidth: 0, flex: 1 }}>
						<AxiomText fontWeight="600" fontSize="md" style={{ margin: 0 }}>
							Experiment Creation
						</AxiomText>
						<AxiomText fontSize="sm" color="fg.secondary" style={{ margin: 0, lineHeight: 1.4 }}>
							Drafts an experiment from your test idea and page context—targets, URLs, and hypothesis—so
							you can launch faster with Opal.
						</AxiomText>
					</Box>
				</Box>

				<Field label="Name" required>
					<Input
						value={name}
						onChange={(e) => setName((e.target as HTMLInputElement).value)}
						placeholder="e.g., Hero CTA contrast test"
						w="full"
					/>
				</Field>

				<Field label="Description">
					<Textarea
						value={description}
						onChange={(e) => setDescription((e.target as HTMLTextAreaElement).value)}
						placeholder="e.g., Larger high-contrast CTA with urgency copy in the hero"
						w="full"
						rows={3}
					/>
				</Field>

				<Field label="Hypothesis">
					<Textarea
						value={hypothesis}
						onChange={(e) => setHypothesis((e.target as HTMLTextAreaElement).value)}
						placeholder="e.g., A persistent mobile CTA will reduce scroll friction and lift conversions."
						w="full"
						rows={3}
					/>
				</Field>

				<Field label="Target by">
					<Select value={targetByValue} onValueChange={setTargetByValue} options={[...TARGET_BY_OPTIONS]}>
						<SelectTrigger placeholder="Select target type" size="lg" w="full">
							{targetByLabel}
						</SelectTrigger>
						<SelectContent />
					</Select>
				</Field>

				{targetByValue === "url" ? (
					<Field label="URL" required>
						<Textarea
							value={urlDestination}
							onChange={(e) => setUrlDestination((e.target as HTMLTextAreaElement).value)}
							placeholder="e.g., https://example.com/pricing"
							w="full"
							rows={2}
						/>
					</Field>
				) : (
					<SavedPagesPicker
						pages={catalog}
						searchQuery={savedPagesSearch}
						onSearchChange={setSavedPagesSearch}
						selectedIds={selectedSavedPageIds}
						onChangeSelectedIds={setSelectedSavedPageIds}
					/>
				)}

				<Box display="flex" flexDirection="row" alignItems="center" gap="12" w="full" mt="4" flexWrap="wrap">
					<Switch checked={includeMetadata} onCheckedChange={setIncludeMetadata}>
						Include metadata
					</Switch>
					<Box flex="1" style={{ minWidth: "8px" }} />
					<Button
						type="button"
						appearance="primary"
						size="md"
						disabled={!canRun || disabled}
						style={{ flexShrink: 0 }}
						onClick={() => {
							onSubmitPrompt(
								buildRunAgentMessage({
									name: name.trim(),
									description: description.trim(),
									hypothesis: hypothesis.trim(),
									targetByLabel,
									destination: destinationForRun,
									destinationLineLabel:
										targetByValue === "url" ? "URL" : "Destination",
									includeMetadata,
								}),
							);
						}}
					>
						Run agent
					</Button>
				</Box>
			</Box>
		</Box>
	);
}
