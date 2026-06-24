"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
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
} from "@optiaxiom/react";
import { IconPen, IconUserRobot } from "@optiaxiom/icons";
import { VAUS } from "@/app/opal/data/vaus";

const CAPTION = {
	fontFamily: "Roboto Mono, monospace",
	fontSize: 10,
	fontWeight: 400,
	lineHeight: "1.25",
	letterSpacing: "0.36px",
	textTransform: "uppercase" as const,
};

const SECTION_HEADING = {
	fontFamily: "var(--ax-font-family-headings, 'VC Nudge', sans-serif)",
	fontSize: 16,
	fontWeight: 600,
	lineHeight: "1.2",
	color: "var(--ax-colors-fg-default)",
};

const CARD = {
	background: "var(--ax-colors-bg-default)",
	border: "1px solid var(--ax-colors-border-default)",
	borderRadius: 8,
	padding: "20px 24px",
	marginBottom: 12,
};

function ReadonlyField({ label, value, note }: { label: string; value: string; note?: string }) {
	return (
		<Box mb="16">
			<Text fontSize="sm" color="fg.secondary" mb="4">{label}</Text>
			<Box
				style={{
					background: "var(--ax-colors-bg-secondary)",
					border: "1px solid var(--ax-colors-border-secondary)",
					borderRadius: 6,
					padding: "8px 12px",
				}}
			>
				<Text fontSize="md" color="fg.default">{value}</Text>
			</Box>
			{note && (
				<Text fontSize="sm" color="fg.tertiary" mt="4">{note}</Text>
			)}
		</Box>
	);
}

const PERSONALITY_PRESETS = [
	"Concise and direct",
	"Warm and thorough",
	"Casual and quick",
	"Formal and precise",
	"Quirky and engaged",
	"Chaotic good",
	"Bratty but brilliant",
];

const SELECTED_PRESET = "Chaotic good";

export default function VATSettingsPage() {
	const params = useParams();
	const id = params?.id as string;
	const vau = VAUS.find((v) => v.id === id);
	const name = vau?.characterName ?? vau?.name ?? "Randy";
	const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

	return (
		<Box style={{ padding: "32px 40px", maxWidth: 800 }}>
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
					<Button appearance="default" size="sm" addonBefore={<IconUserRobot />}>
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
					<Button appearance="default" size="sm" addonBefore={<IconPen />}>Edit</Button>
				</Box>
				<ReadonlyField label="Name" value={name} />
				<ReadonlyField label="Email" value={`${name.toLowerCase()}@vau.opal.optimizely.com`} />
				<ReadonlyField label="Start date" value="March 12, 2026" />
				<Box>
					<Text fontSize="sm" color="fg.secondary" mb="4">Status</Text>
					<Box display="flex" alignItems="center" gap="8">
						<Box style={{ width: 8, height: 8, borderRadius: "50%", background: "#3DAA6A", flexShrink: 0 }} />
						<span style={{ ...CAPTION, color: "var(--ax-colors-fg-default)" }}>Active</span>
					</Box>
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
					<Button appearance="default" size="sm" addonBefore={<IconPen />}>Edit</Button>
				</Box>
				<Box display="flex" alignItems="center" gap="8" mb="16" style={{ flexWrap: "wrap" }}>
					{PERSONALITY_PRESETS.map((preset) => {
						const selected = preset === SELECTED_PRESET;
						return (
							<Box
								key={preset}
								style={{
									padding: "6px 14px",
									borderRadius: 32,
									border: selected
										? "2px solid var(--ax-colors-fg-default)"
										: "1px solid var(--ax-colors-border-default)",
									background: "transparent",
									cursor: "pointer",
									fontFamily: "var(--ax-font-family)",
									fontSize: 14,
									fontWeight: selected ? 500 : 400,
									color: "var(--ax-colors-fg-default)",
									lineHeight: "1.4",
								}}
							>
								{preset}
							</Box>
						);
					})}
				</Box>
				<ReadonlyField
					label="Tone"
					value="Unfiltered and high-energy. Professional where it counts, feral everywhere else."
					note={`How ${name} sounds in messages — formal or casual, brief or detailed, warm or all-business.`}
				/>
				<ReadonlyField
					label="Traits"
					value="Relentless, wildly competent, zero chill, never misses a deadline despite appearances."
					note={`The character behind the work — is ${name} cautious or bold, chatty or minimal, serious or lighthearted`}
				/>
				<ReadonlyField
					label="Style"
					value="Stream of consciousness that somehow always lands. Mix of fragments and asides. The structure looks chaotic but the output is airtight."
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
					<Button appearance="default" size="sm" addonBefore={<IconPen />}>Edit</Button>
				</Box>
				<ReadonlyField
					label="Instructions"
					value="Manage meeting prep, email triage, and content review for the marketing team. Escalate budget questions to PU. Do not commit to deadlines without confirmation."
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
					addonBefore={<IconUserRobot />}
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
							addonBefore={<IconUserRobot />}
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
