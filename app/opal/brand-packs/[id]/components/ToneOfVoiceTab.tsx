"use client";

import { useState, useRef } from "react";
import { Box, Button, Text } from "@optiaxiom/react";
import {
	IconPenToSquare as IconEdit,
	IconCheck,
	IconSparkles,
} from "@optimizely/axiom-icons";
import type { BrandPack } from "../../types";

type ToneOfVoiceTabProps = {
	pack: BrandPack;
};

function ToneChip({
	label,
	onRemove,
}: {
	label: string;
	onRemove: () => void;
}) {
	return (
		<Box
			alignItems="center"
			bg="bg.accent.subtle"
			display="inline-flex"
			gap="6"
			rounded="full"
			style={{ padding: "5px 10px 5px 14px" }}
		>
			<Text color="fg.accent" fontWeight="500" style={{ fontSize: 13 }}>
				{label}
			</Text>
			<button
				type="button"
				onClick={onRemove}
				aria-label={`Remove ${label}`}
				style={{
					alignItems: "center",
					background: "transparent",
					border: 0,
					borderRadius: "50%",
					color: "var(--ax-colors-fg-accent)",
					cursor: "pointer",
					display: "flex",
					fontSize: 15,
					fontWeight: 300,
					lineHeight: 1,
					opacity: 0.55,
					padding: 0,
					transition: "opacity 0.12s",
				}}
				onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
				onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.55"; }}
			>
				×
			</button>
		</Box>
	);
}

export function ToneOfVoiceTab({ pack }: ToneOfVoiceTabProps) {
	const [isEditingBrief, setIsEditingBrief] = useState(false);
	const [briefText, setBriefText] = useState(pack.brandBrief);
	const [saved, setSaved] = useState(false);

	const [toneKeywords, setToneKeywords] = useState<string[]>(pack.toneKeywords);
	const [draft, setDraft] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const handleSaveBrief = () => {
		setSaved(true);
		setIsEditingBrief(false);
		setTimeout(() => setSaved(false), 2000);
	};

	const addKeyword = () => {
		const val = draft.trim();
		if (!val || toneKeywords.includes(val)) return;
		setToneKeywords((p) => [...p, val]);
		setDraft("");
		inputRef.current?.focus();
	};

	const removeKeyword = (kw: string) =>
		setToneKeywords((p) => p.filter((k) => k !== kw));

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{ maxWidth: 760 }}>
			{/* Brand Brief */}
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
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Box display="flex" flexDirection="column" gap="2">
						<Text fontWeight="600" style={{ fontSize: 14 }}>Brand Brief</Text>
						<Text color="fg.tertiary" fontSize="xs">
							A narrative description of this brand — voice, values, audience
						</Text>
					</Box>
					<Box alignItems="center" display="flex" gap="8">
						{!isEditingBrief && (
							<Button
								appearance="subtle"
								size="sm"
								icon={<IconSparkles />}
								style={{ color: "var(--ax-colors-fg-accent)" }}
							>
								Regenerate with Opal
							</Button>
						)}
						{isEditingBrief ? (
							<>
								<Button
									appearance="subtle"
									size="sm"
									onClick={() => setIsEditingBrief(false)}
								>
									Cancel
								</Button>
								<Button
									appearance="primary"
									size="sm"
									icon={saved ? <IconCheck /> : undefined}
									onClick={handleSaveBrief}
								>
									{saved ? "Saved" : "Save"}
								</Button>
							</>
						) : (
							<Button
								appearance="subtle"
								size="sm"
								icon={<IconEdit />}
								onClick={() => setIsEditingBrief(true)}
							>
								Edit
							</Button>
						)}
					</Box>
				</Box>

				{isEditingBrief ? (
					<textarea
						value={briefText}
						onChange={(e) => setBriefText(e.target.value)}
						rows={8}
						style={{
							background: "var(--ax-colors-bg-secondary)",
							border: "1.5px solid var(--ax-colors-border-accent)",
							borderRadius: 10,
							color: "var(--ax-colors-fg-default)",
							fontFamily: "inherit",
							fontSize: 14,
							lineHeight: 1.7,
							outline: "none",
							padding: "12px 16px",
							resize: "vertical",
							width: "100%",
						}}
					/>
				) : (
					<Text
						color="fg.secondary"
						fontSize="sm"
						style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}
					>
						{briefText}
					</Text>
				)}
			</Box>

			{/* Tone Keywords */}
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
				<Box display="flex" flexDirection="column" gap="2">
					<Text fontWeight="600" style={{ fontSize: 14 }}>Tone Keywords</Text>
					<Text color="fg.tertiary" fontSize="xs">
						These guide Opal's language — word choice, sentence structure, communication style
					</Text>
				</Box>

				{/* Chips */}
				<Box display="flex" gap="8" style={{ flexWrap: "wrap" }}>
					{toneKeywords.map((kw) => (
						<ToneChip key={kw} label={kw} onRemove={() => removeKeyword(kw)} />
					))}
				</Box>

				{/* Add keyword */}
				<Box alignItems="center" display="flex" gap="8">
					<input
						ref={inputRef}
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						placeholder="Add a tone keyword…"
						onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
						style={{
							background: "var(--ax-colors-bg-secondary)",
							border: "1px solid var(--ax-colors-border-default)",
							borderRadius: 6,
							color: "var(--ax-colors-fg-default)",
							flex: 1,
							fontFamily: "inherit",
							fontSize: 13,
							outline: "none",
							padding: "6px 10px",
							transition: "border-color 0.15s",
						}}
						onFocus={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-accent)"; }}
						onBlur={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-default)"; }}
					/>
					<Button appearance="subtle" size="sm" onClick={addKeyword} style={{ flexShrink: 0 }}>
						Add
					</Button>
				</Box>
			</Box>
		</Box>
	);
}
