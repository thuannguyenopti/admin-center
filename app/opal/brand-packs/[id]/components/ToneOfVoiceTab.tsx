"use client";

import { useRef, useState } from "react";
import { Badge, Box, Button, Input, Text, Textarea } from "@optiaxiom/react";
import { IconCheck, IconPlus, IconXmark } from "@optimizely/axiom-icons";
import type { BrandPack } from "../../types";

type ToneOfVoiceTabProps = {
	pack: BrandPack;
};

const INITIAL_RULES = [
	"Write in the second person when possible.",
	"Lead with the outcome, not the feature.",
	"Use short sentences and active verbs.",
	"Avoid jargon, inflated AI claims, and corporate filler.",
];

function TonePill({ label, onRemove }: { label: string; onRemove: () => void }) {
	return (
		<Box alignItems="center" display="inline-flex" gap="4">
			<Badge intent="success" variant="subtle" style={{ width: "fit-content", whiteSpace: "nowrap" }}>
				{label}
			</Badge>
			<Button appearance="subtle" aria-label={`Remove ${label}`} icon={<IconXmark />} onClick={onRemove} size="sm" />
		</Box>
	);
}

function SectionCard({
	children,
	description,
	title,
}: {
	children: React.ReactNode;
	description: string;
	title: string;
}) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			gap="16"
			p="20"
			rounded="xl"
			shadow="sm"
		>
			<Box display="flex" flexDirection="column" gap="4">
				<Text fontWeight="600" style={{ fontSize: 14 }}>{title}</Text>
				<Text color="fg.secondary" fontSize="sm">{description}</Text>
			</Box>
			{children}
		</Box>
	);
}

export function ToneOfVoiceTab({ pack }: ToneOfVoiceTabProps) {
	const [keywords, setKeywords] = useState<string[]>(pack.toneKeywords);
	const [rules, setRules] = useState(INITIAL_RULES.join("\n"));
	const [goodExample, setGoodExample] = useState("Train smarter. Race faster.");
	const [avoidExample, setAvoidExample] = useState("Our AI-powered platform optimizes your training schedule.");
	const [draft, setDraft] = useState("");
	const [saved, setSaved] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const addKeyword = () => {
		const value = draft.trim();
		if (!value || keywords.includes(value)) return;
		setKeywords((current) => [...current, value]);
		setDraft("");
		inputRef.current?.focus();
	};

	const save = () => {
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	};

	return (
		<Box display="grid" gap="16" style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 420px)", maxWidth: 980 }}>
			<Box display="flex" flexDirection="column" gap="16">
				<SectionCard
					title="Tone Keywords"
					description="Short traits Opal should preserve across copy and generated assets."
				>
					<Box display="flex" gap="8" style={{ flexWrap: "wrap" }}>
						{keywords.map((keyword) => (
							<TonePill
								key={keyword}
								label={keyword}
								onRemove={() => setKeywords((current) => current.filter((item) => item !== keyword))}
							/>
						))}
					</Box>
					<Box alignItems="center" display="flex" gap="8">
						<Input
							ref={inputRef}
							value={draft}
							onChange={(event) => setDraft(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									event.preventDefault();
									addKeyword();
								}
							}}
							placeholder="Add tone keyword"
						/>
						<Button appearance="default" icon={<IconPlus />} onClick={addKeyword} size="md">
							Add
						</Button>
					</Box>
				</SectionCard>

				<SectionCard
					title="Voice Rules"
					description="Operational language rules used by Opal before generation."
				>
					<Textarea
						value={rules}
						onChange={(event) => setRules(event.target.value)}
						rows={6}
						style={{ lineHeight: 1.6 }}
					/>
				</SectionCard>
			</Box>

			<Box display="flex" flexDirection="column" gap="16">
				<SectionCard
					title="Examples"
					description="Give Opal a good direction and a pattern to avoid."
				>
					<Box display="flex" flexDirection="column" gap="12">
						<Box display="flex" flexDirection="column" gap="6">
							<Text color="fg.secondary" fontSize="xs" fontWeight="600">Good</Text>
							<Input value={goodExample} onChange={(event) => setGoodExample(event.target.value)} />
						</Box>
						<Box display="flex" flexDirection="column" gap="6">
							<Text color="fg.secondary" fontSize="xs" fontWeight="600">Avoid</Text>
							<Input value={avoidExample} onChange={(event) => setAvoidExample(event.target.value)} />
						</Box>
					</Box>
				</SectionCard>

				<SectionCard
					title="Channels"
					description="Tone applies across these approved channels."
				>
					<Box display="flex" gap="6" style={{ flexWrap: "wrap" }}>
						{pack.channels.map((channel) => (
							<Badge key={channel} intent="neutral" variant="subtle" style={{ width: "fit-content", whiteSpace: "nowrap" }}>
								{channel}
							</Badge>
						))}
					</Box>
				</SectionCard>

				<Box display="flex" justifyContent="end">
					<Button appearance="primary" icon={saved ? <IconCheck /> : undefined} onClick={save} size="md">
						{saved ? "Saved" : "Save tone"}
					</Button>
				</Box>
			</Box>
		</Box>
	);
}
