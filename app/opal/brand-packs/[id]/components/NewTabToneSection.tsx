"use client";

import { useEffect, useState } from "react";
import { Box, Text, Textarea } from "@optiaxiom/react";
import type { BrandPack } from "../../types";

type Props = { pack: BrandPack; onSave: () => void; onFilledChange: (filled: boolean) => void };

export function ToneSection({ pack, onSave, onFilledChange }: Props) {
	const [tone, setTone] = useState(
		`Acme Corporation communicates with authority and clarity. Our voice is confident but never arrogant — we let results speak, and we expect our visuals to do the same.

We are direct. We avoid jargon and filler language. Every word and every visual element must earn its place.

We are optimistic but grounded. We do not over-promise or use hyperbole. Instead, we use precision and evidence to inspire confidence.

We are human. Despite our scale, we speak to individuals — not audiences. Imagery should reflect real people in real situations, not abstract concepts or staged scenarios.

Visual tone should mirror verbal tone: clean, purposeful, and assured. Avoid decorative elements that do not serve the message. Prefer depth and texture over flat minimalism.`
	);

	const handleChange = (value: string) => {
		setTone(value);
		onSave();
	};

	useEffect(() => {
		onFilledChange(tone.trim().length > 0);
	}, [tone, onFilledChange]);

	return (
		<Box
			bg="bg.default"
			display="flex"
			flexDirection="column"
			id="section-tone"
			overflow="hidden"
			rounded="xl"
			style={{ border: "1px solid rgba(0,0,0,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
		>
			{/* Header */}
			<Box
				display="flex"
				flexDirection="column"
				gap="8"
				p="32"
				pb="24"
				style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}
			>
				<Box
					style={{
						background: "var(--ax-colors-bg-accent-subtle)",
						borderRadius: 4,
						color: "var(--ax-colors-fg-accent)",
						display: "inline-block",
						fontSize: 11,
						fontWeight: 700,
						letterSpacing: "0.08em",
						padding: "3px 8px",
						textTransform: "uppercase",
						width: "fit-content",
					}}
				>
					Tone of Voice
				</Box>
				<Text style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
					How the brand speaks
				</Text>
				<Text color="fg.secondary" fontSize="sm" style={{ lineHeight: 1.55 }}>
					Describe the brand&apos;s voice in full — how it speaks, what it sounds like, and what it never says.
					Write in paragraphs, not keywords.
				</Text>
			</Box>

			{/* Textarea */}
			<Box p="24">
				<Textarea
					value={tone}
					onChange={(e) => handleChange(e.target.value)}
					placeholder={
						"Write in the second person. Lead with outcomes, not features. Use short, confident sentences and active verbs. Avoid jargon, inflated AI claims, and corporate filler.\n\nThe brand is bold and direct — it earns trust through specificity, not enthusiasm. It acknowledges effort and celebrates real performance. It never oversells and never hedges."
					}
					rows={10}
					style={{ lineHeight: 1.75, resize: "vertical", width: "100%" }}
				/>
			</Box>
		</Box>
	);
}
