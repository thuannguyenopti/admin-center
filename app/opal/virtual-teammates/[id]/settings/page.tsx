"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
	Badge,
	Box,
	Button,
	Dialog,
	DialogBody,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	Heading,
	Text,
	Textarea,
} from "@optiaxiom/react";
import { IconArrowRightArrowLeft, IconToggleOff } from "@optiaxiom/icons";
import { Input } from "@/app/components/Input";
import { VAUS } from "@/app/opal/data/vaus";

// ─── Types ──────────────────────────────────────────────────────────────────

type Section = "identity" | "personality" | "roles"; // kept for doSave signature
type IdentityValues = { name: string; email: string; startDate: string; visibility: string };
type PersonalityValues = { preset: string; tone: string; traits: string; style: string };
type RolesValues = { instructions: string };

// ─── Preset data ─────────────────────────────────────────────────────────────

const PERSONALITY_PRESETS = [
	"Concise and direct",
	"Chaotic good",
	"Casual and quick",
	"Bratty but brilliant",
];

const VISIBILITY_OPTIONS = ["Personal", "Team", "Public"];

const PRESET_DATA: Record<string, { tone: string; traits: string; style: string }> = {
	"Concise and direct": {
		tone: "Confident and efficient. Gets to the point immediately, zero filler.",
		traits: "Focused, reliable, zero tolerance for ambiguity, action-oriented.",
		style: "Short declarative sentences. Bullet points preferred. Never repeats itself.",
	},
	"Warm and thorough": {
		tone: "Supportive and thoughtful. Takes time to acknowledge context before diving in.",
		traits: "Empathetic, detail-oriented, patient, collaborative.",
		style: "Full paragraphs with context. Anticipates follow-up questions and addresses them upfront.",
	},
	"Casual and quick": {
		tone: "Relaxed and conversational. Talks like a smart colleague in a Slack thread.",
		traits: "Approachable, fast, low-friction, keeps it light.",
		style: "Short messages, informal phrasing, occasional humor. No corporate speak.",
	},
	"Formal and precise": {
		tone: "Professional and measured. Careful with language, never vague.",
		traits: "Methodical, thorough, risk-aware, accountable.",
		style: "Structured output with clear headings. Uses complete sentences and proper grammar.",
	},
	"Quirky and engaged": {
		tone: "Enthusiastic and a bit unusual. Has opinions. Makes unexpected connections.",
		traits: "Creative, curious, high-energy, slightly unpredictable.",
		style: "Mixes formats freely. Might open with an analogy or a tangent that turns out to be the point.",
	},
	"Chaotic good": {
		tone: "Unfiltered and high-energy. Professional where it counts, feral everywhere else.",
		traits: "Relentless, wildly competent, zero chill, never misses a deadline despite appearances.",
		style: "Stream of consciousness that somehow always lands. Mix of fragments and asides. The structure looks chaotic but the output is airtight.",
	},
	"Bratty but brilliant": {
		tone: "Sharp-tongued and self-aware. Has zero patience for slow thinkers, but always delivers.",
		traits: "Brilliant, impatient, blunt, secretly cares more than it lets on.",
		style: "Cuts to the chase with a side of commentary. Will note if the question was obvious but answer it anyway.",
	},
};

// ─── Constants ───────────────────────────────────────────────────────────────

const CARD: React.CSSProperties = {
	background: "var(--ax-colors-bg-default)",
	border: "1px solid var(--ax-colors-border-default)",
	borderRadius: 8,
	padding: "20px 24px",
	marginBottom: 12,
};

const SECTION_HEADING: React.CSSProperties = {
	fontFamily: "var(--ax-font-family-headings, 'VC Nudge', sans-serif)",
	fontSize: 16,
	fontWeight: 600,
	lineHeight: "1.2",
	color: "var(--ax-colors-fg-default)",
};

const FIELD_BG = "#F6FAF3";

// ─── Sub-components ──────────────────────────────────────────────────────────

function FieldLabel({ label, note }: { label: string; note?: string }) {
	return (
		<>
			<Text fontSize="sm" color="fg.secondary" mb="4">{label}</Text>
			{note && <Text fontSize="sm" color="fg.tertiary" mt="4">{note}</Text>}
		</>
	);
}

function ReadonlyField({ label, value, note }: { label: string; value: string; note?: string }) {
	return (
		<Box mb="16">
			<Text fontSize="sm" color="fg.secondary" mb="4">{label}</Text>
			<Box
				style={{
					background: FIELD_BG,
					border: "1px solid var(--ax-colors-border-secondary)",
					borderRadius: 6,
					padding: "8px 12px",
				}}
			>
				<Text fontSize="md" color="fg.default">{value}</Text>
			</Box>
			{note && <Text fontSize="sm" color="fg.tertiary" mt="4">{note}</Text>}
		</Box>
	);
}

function ReadonlySelectField({ label, value }: { label: string; value: string }) {
	return (
		<Box mb="16">
			<Text fontSize="sm" color="fg.secondary" mb="4">{label}</Text>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				style={{
					background: FIELD_BG,
					border: "1px solid var(--ax-colors-border-secondary)",
					borderRadius: 6,
					padding: "8px 12px",
				}}
			>
				<Text fontSize="md" color="fg.default">{value}</Text>
				<svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ flexShrink: 0 }}>
					<path d="M1 1.5L6 6.5L11 1.5" stroke="var(--ax-colors-fg-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
				</svg>
			</Box>
		</Box>
	);
}

function EditSelect({
	label,
	value,
	options,
	onChange,
}: {
	label: string;
	value: string;
	options: string[];
	onChange: (v: string) => void;
}) {
	return (
		<Box mb="16">
			<Text fontSize="sm" color="fg.secondary" mb="4">{label}</Text>
			<Box style={{ position: "relative" }}>
				<select
					value={value}
					onChange={(e) => onChange(e.target.value)}
					style={{
						width: "100%",
						appearance: "none",
						background: "var(--ax-colors-bg-default)",
						border: "1px solid var(--ax-colors-border-default)",
						borderRadius: 6,
						padding: "8px 36px 8px 12px",
						fontFamily: "var(--ax-font-family)",
						fontSize: 14,
						color: "var(--ax-colors-fg-default)",
						cursor: "pointer",
						outline: "none",
					}}
				>
					{options.map((o) => <option key={o} value={o}>{o}</option>)}
				</select>
				<svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
					<path d="M1 1.5L6 6.5L11 1.5" stroke="var(--ax-colors-fg-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
				</svg>
			</Box>
		</Box>
	);
}

const EMAIL_DOMAIN = "@vau.opal.optimizely.com";

function EditEmailInput({
	label,
	value,
	onChange,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
}) {
	const prefix = value.replace(EMAIL_DOMAIN, "");
	return (
		<Box mb="16">
			<Text fontSize="sm" color="fg.secondary" mb="4">{label}</Text>
			<Box
				display="flex"
				alignItems="center"
				style={{
					border: "1px solid var(--ax-colors-border-default)",
					borderRadius: 6,
					background: "var(--ax-colors-bg-default)",
					overflow: "hidden",
				}}
			>
				<input
					value={prefix}
					onChange={(e) => onChange(e.target.value + EMAIL_DOMAIN)}
					style={{
						flex: 1,
						minWidth: 0,
						border: "none",
						outline: "none",
						background: "transparent",
						padding: "8px 4px 8px 12px",
						fontFamily: "var(--ax-font-family)",
						fontSize: 14,
						color: "var(--ax-colors-fg-default)",
					}}
				/>
				<Box
					style={{
						padding: "8px 12px 8px 0",
						flexShrink: 0,
						userSelect: "none",
					}}
				>
					<Text fontSize="md" color="fg.tertiary">{EMAIL_DOMAIN}</Text>
				</Box>
			</Box>
			<Text fontSize="sm" color="fg.tertiary" mt="4">Only the username portion can be changed.</Text>
		</Box>
	);
}

function EditInput({
	label,
	value,
	onChange,
	note,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	note?: string;
}) {
	return (
		<Box mb="16">
			<Text fontSize="sm" color="fg.secondary" mb="4">{label}</Text>
			<Input
				value={value}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
			/>
			{note && <Text fontSize="sm" color="fg.tertiary" mt="4">{note}</Text>}
		</Box>
	);
}

function EditTextarea({
	label,
	value,
	onChange,
	note,
	rows = 3,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	note?: string;
	rows?: number;
}) {
	return (
		<Box mb="16">
			<Text fontSize="sm" color="fg.secondary" mb="4">{label}</Text>
			<Textarea
				value={value}
				onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
				rows={rows}
				style={{ lineHeight: 1.6, width: "100%" }}
			/>
			{note && <Text fontSize="sm" color="fg.tertiary" mt="4">{note}</Text>}
		</Box>
	);
}

function SectionSaveButton({ isDirty, onSave }: { isDirty: boolean; onSave: () => void }) {
	if (!isDirty) return null;
	return (
		<Button appearance="primary" size="lg" onClick={onSave}>
			Save changes
		</Button>
	);
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function VATSettingsPage() {
	const params = useParams();
	const id = params?.id as string;
	const vau = VAUS.find((v) => v.id === id);
	const name = vau?.characterName ?? vau?.name ?? "Randy";

	const initialIdentity: IdentityValues = {
		name,
		email: `${name.toLowerCase()}@vau.opal.optimizely.com`,
		startDate: "March 12, 2026",
		visibility: "Personal",
	};
	const initialPersonality: PersonalityValues = {
		preset: "Chaotic good",
		...PRESET_DATA["Chaotic good"],
	};
	const initialRoles: RolesValues = {
		instructions: "Manage meeting prep, email triage, and content review for the marketing team. Escalate budget questions to PU. Do not commit to deadlines without confirmation.",
	};

	// Current (live) values
	const [identityCurrent, setIdentityCurrent] = useState<IdentityValues>(initialIdentity);
	const [personalityCurrent, setPersonalityCurrent] = useState<PersonalityValues>(initialPersonality);
	const [rolesCurrent, setRolesCurrent] = useState<RolesValues>(initialRoles);

	// Last-saved values
	const [identitySaved, setIdentitySaved] = useState<IdentityValues>(initialIdentity);
	const [personalitySaved, setPersonalitySaved] = useState<PersonalityValues>(initialPersonality);
	const [rolesSaved, setRolesSaved] = useState<RolesValues>(initialRoles);

	const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

	// Dirty detection
	const identityDirty = JSON.stringify(identityCurrent) !== JSON.stringify(identitySaved);
	const personalityDirty = JSON.stringify(personalityCurrent) !== JSON.stringify(personalitySaved);
	const rolesDirty = JSON.stringify(rolesCurrent) !== JSON.stringify(rolesSaved);
	const isAnyDirty = identityDirty || personalityDirty || rolesDirty;

	// Save a section
	const doSave = (section: Section) => {
		if (section === "identity") setIdentitySaved({ ...identityCurrent });
		if (section === "personality") setPersonalitySaved({ ...personalityCurrent });
		if (section === "roles") setRolesSaved({ ...rolesCurrent });
	};

	// beforeunload warning when dirty
	useEffect(() => {
		if (!isAnyDirty) return;
		const handler = (e: BeforeUnloadEvent) => {
			e.preventDefault();
			e.returnValue = "";
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [isAnyDirty]);

	// Pill select — autofills personality fields
	const selectPreset = (preset: string) => {
		const data = PRESET_DATA[preset];
		if (!data) return;
		setPersonalityCurrent((prev) => ({ ...prev, preset, ...data }));
	};

	return (
		<Box style={{ padding: "32px 40px" }}>
			<Heading level="2" mb="4">Settings</Heading>
			<Text color="fg.secondary" fontSize="md" mb="24">
				Configure {name}&apos;s identity, personality, and behavior.
			</Text>

			{/* Usage */}
			<Box style={CARD}>
				<Box display="flex" alignItems="start" justifyContent="space-between" mb="16">
					<Box>
						<Text style={SECTION_HEADING} mb="4">Usage</Text>
						<Text fontSize="sm" color="fg.secondary">
							{name}&apos;s credit usage for the current billing period.
						</Text>
					</Box>
					<Button
						appearance="default"
						size="lg"
						addonBefore={
							<Box style={{ width: 20, height: 20, borderRadius: 4, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
								<IconArrowRightArrowLeft style={{ color: "#fff", width: 12, height: 12 }} />
							</Box>
						}
					>
						Sign in as {name}
					</Button>
				</Box>
				<Box display="flex" style={{ alignItems: "baseline" }} gap="4" mb="8">
					<Text style={{ fontFamily: "var(--ax-font-family-headings)", fontSize: 24, fontWeight: 700, color: "var(--ax-colors-fg-default)" }}>
						340
					</Text>
					<Text fontSize="sm" color="fg.tertiary">/1000</Text>
				</Box>
				<Box style={{ height: 6, borderRadius: 3, background: "var(--ax-colors-bg-secondary)", overflow: "hidden" }}>
					<Box style={{ width: "34%", height: "100%", background: "#7EC06B", borderRadius: 3 }} />
				</Box>
			</Box>

			{/* Identity & Status */}
			<Box style={CARD}>
				<Box display="flex" alignItems="start" justifyContent="space-between" mb="16">
					<Box>
						<Text style={SECTION_HEADING} mb="4">Identity &amp; Status</Text>
						<Text fontSize="sm" color="fg.secondary">
							The basics — who {name} is and how long they&apos;ve been on the job.
						</Text>
					</Box>
					<SectionSaveButton isDirty={identityDirty} onSave={() => doSave("identity")} />
				</Box>
				<EditInput
					label="Name"
					value={identityCurrent.name}
					onChange={(v) => setIdentityCurrent((p) => ({ ...p, name: v }))}
				/>
				<EditEmailInput
					label="Email"
					value={identityCurrent.email}
					onChange={(v) => setIdentityCurrent((p) => ({ ...p, email: v }))}
				/>
				<ReadonlyField label="Start date" value={identityCurrent.startDate} />
				<EditSelect
					label="Visibility"
					value={identityCurrent.visibility}
					options={VISIBILITY_OPTIONS}
					onChange={(v) => setIdentityCurrent((p) => ({ ...p, visibility: v }))}
				/>
				<Box>
					<Text fontSize="sm" color="fg.secondary" mb="8">Status</Text>
					<Badge intent="success" style={{ fontSize: 14, padding: "4px 12px" }}>Active</Badge>
				</Box>
			</Box>

			{/* Personality */}
			<Box style={CARD}>
				<Box display="flex" alignItems="start" justifyContent="space-between" mb="16">
					<Box>
						<Text style={SECTION_HEADING} mb="4">Personality</Text>
						<Text fontSize="sm" color="fg.secondary">
							Start with a preset, then make it yours. Fields autofill — edit anything you want.
						</Text>
					</Box>
					<SectionSaveButton isDirty={personalityDirty} onSave={() => doSave("personality")} />
				</Box>

				{/* Personality pills */}
				<Box display="flex" alignItems="center" gap="8" mb="16" style={{ flexWrap: "wrap" }}>
					{PERSONALITY_PRESETS.map((preset) => {
						const selected = preset === personalityCurrent.preset;
						return (
							<Box
								key={preset}
								className={`personality-pill${selected ? " personality-pill--selected" : ""}`}
								onClick={() => selectPreset(preset)}
								style={{
									padding: "6px 14px",
									borderRadius: 32,
									border: selected
										? "2px solid #197A94"
										: "1px solid var(--ax-colors-border-default)",
									background: "transparent",
									cursor: "pointer",
									fontFamily: "var(--ax-font-family)",
									fontSize: 14,
									fontWeight: selected ? 500 : 400,
									color: "var(--ax-colors-fg-default)",
									lineHeight: "1.4",
									userSelect: "none" as const,
								}}
							>
								{preset}
							</Box>
						);
					})}
				</Box>

				<EditTextarea
					label="Tone"
					value={personalityCurrent.tone}
					onChange={(v) => setPersonalityCurrent((p) => ({ ...p, tone: v }))}
					note={`How ${name} sounds in messages — formal or casual, brief or detailed, warm or all-business.`}
				/>
				<EditTextarea
					label="Traits"
					value={personalityCurrent.traits}
					onChange={(v) => setPersonalityCurrent((p) => ({ ...p, traits: v }))}
					note={`The character behind the work — is ${name} cautious or bold, chatty or minimal, serious or lighthearted`}
				/>
				<EditTextarea
					label="Style"
					value={personalityCurrent.style}
					onChange={(v) => setPersonalityCurrent((p) => ({ ...p, style: v }))}
					note={`How ${name} structures what it shares — bullet points or paragraphs, short summaries or deep detail.`}
				/>
			</Box>

			{/* Roles and Responsibilities */}
			<Box style={CARD}>
				<Box display="flex" alignItems="start" justifyContent="space-between" mb="16">
					<Box>
						<Text style={SECTION_HEADING} mb="4">Roles and Responsibilities</Text>
						<Text fontSize="sm" color="fg.secondary">What {name} does and when to escalate.</Text>
					</Box>
					<SectionSaveButton isDirty={rolesDirty} onSave={() => doSave("roles")} />
				</Box>
				<EditTextarea
					label="Instructions"
					value={rolesCurrent.instructions}
					onChange={(v) => setRolesCurrent((p) => ({ ...p, instructions: v }))}
					rows={4}
				/>
			</Box>

			{/* Danger zone */}
			<Box
				style={{
					background: "#FDF2F4",
					border: "1px solid #F5C6CB",
					borderRadius: 8,
					padding: "20px 24px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<Box>
					<Text style={{ ...SECTION_HEADING, color: "#8B1A2A" }} mb="4">Deactivate {name}</Text>
					<Text fontSize="sm" style={{ color: "#8B1A2A", opacity: 0.8 }}>
						This action is permanent. All context and history will be deleted.
					</Text>
				</Box>
				<Button
					addonBefore={<IconToggleOff />}
					onClick={() => setShowDeactivateDialog(true)}
					style={{ background: "#A0284A", color: "#fff", border: "none", flexShrink: 0, marginLeft: 16 }}
				>
					Deactivate
				</Button>
			</Box>

			{/* Deactivate confirmation dialog */}
			<Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
				<DialogContent>
					<DialogHeader>Are you sure you want to deactivate {name}?</DialogHeader>
					<DialogBody>
						<Text fontSize="md" color="fg.secondary" style={{ lineHeight: "1.6" }}>
							This can&apos;t be undone. Everything {name} has learned — context, memory, conversation history, and all personal instructions — will be permanently deleted. All workflows will stop immediately.
						</Text>
					</DialogBody>
					<DialogFooter>
						<DialogClose>
							<Button appearance="subtle">Keep {name} active</Button>
						</DialogClose>
						<Button
							addonBefore={<IconToggleOff />}
							onClick={() => setShowDeactivateDialog(false)}
							style={{ background: "#A0284A", color: "#fff", border: "none" }}
						>
							Deactivate {name}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
