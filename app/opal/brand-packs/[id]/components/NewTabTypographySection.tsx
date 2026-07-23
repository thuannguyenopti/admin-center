"use client";

import { useState } from "react";
import { Box, Button, Text } from "@optiaxiom/react";
import { IconPlus, IconXmark } from "@optimizely/axiom-icons";
import type { BrandPack } from "../../types";
import { EditableText } from "./NewTabShared";

type TypefaceEntry = {
	id: string;
	name: string;
	use: string;
	label: string;
};

const USE_OPTIONS = ["Heading", "Body", "Mono", "Display", "Caption", "UI"];
const WEIGHT_OPTIONS = ["Regular", "Medium", "Semibold", "Bold"];

type Props = { pack: BrandPack; onSave: () => void };

export function TypographySection({ pack, onSave }: Props) {
	const [typefaces, setTypefaces] = useState<TypefaceEntry[]>([
		{ id: "heading", name: pack.typography.heading, use: "Heading", label: "Primary Typeface" },
		{ id: "body", name: pack.typography.body, use: "Body", label: "Secondary Typeface" },
		...(pack.typography.mono
			? [{ id: "mono", name: pack.typography.mono, use: "Mono", label: "Mono Typeface" }]
			: []),
	]);
	const [selectedWeights, setSelectedWeights] = useState<Record<string, string>>({});

	const update = (id: string, updates: Partial<TypefaceEntry>) => {
		setTypefaces((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
		onSave();
	};

	const cycleUse = (id: string, current: string) => {
		const idx = USE_OPTIONS.indexOf(current);
		update(id, { use: USE_OPTIONS[(idx + 1) % USE_OPTIONS.length] });
	};

	const addTypeface = () => {
		setTypefaces((prev) => [
			...prev,
			{ id: `new-${Date.now()}`, name: "", use: "Display", label: "Additional Typeface" },
		]);
		onSave();
	};

	const remove = (id: string) => {
		setTypefaces((prev) => prev.filter((t) => t.id !== id));
		onSave();
	};

	const primary = typefaces[0];
	const rest = typefaces.slice(1);

	return (
		<Box
			bg="bg.default"
			display="flex"
			flexDirection="column"
			id="section-typography"
			overflow="hidden"
			rounded="xl"
			style={{ border: "1px solid rgba(0,0,0,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
		>
			{/* Top bar: label + Add typeface button */}
			<Box alignItems="center" display="flex" justifyContent="space-between" p="24" pb="20">
				<Box
					style={{
						background: "var(--ax-colors-bg-accent-subtle)",
						borderRadius: 4,
						color: "var(--ax-colors-fg-accent-strong)",
						fontSize: 11,
						fontWeight: 700,
						letterSpacing: "0.08em",
						padding: "3px 8px",
						textTransform: "uppercase",
					}}
				>
					Typography
				</Box>
				<Button appearance="primary" icon={<IconPlus />} onClick={addTypeface} size="sm">
					Add typeface
				</Button>
			</Box>

			{/* Primary typeface — full header card */}
			{primary && (
				<>
					<Box style={{ background: "rgba(0,0,0,0.08)", height: 1 }} />
					<PrimaryCard
						typeface={primary}
						selectedWeight={selectedWeights[primary.id] ?? "Semibold"}
						onWeightSelect={(w) => setSelectedWeights((prev) => ({ ...prev, [primary.id]: w }))}
						onNameChange={(v) => update(primary.id, { name: v })}
						onCycleUse={() => cycleUse(primary.id, primary.use)}
						onRemove={typefaces.length > 1 ? () => remove(primary.id) : undefined}
					/>
				</>
			)}

			{/* Additional typefaces — table rows */}
			{rest.map((typeface) => (
				<Box key={typeface.id}>
					<Box style={{ background: "rgba(0,0,0,0.08)", height: 1 }} />
					<TypefaceRow
						typeface={typeface}
						onNameChange={(v) => update(typeface.id, { name: v })}
						onCycleUse={() => cycleUse(typeface.id, typeface.use)}
						onRemove={() => remove(typeface.id)}
					/>
				</Box>
			))}
		</Box>
	);
}

function PrimaryCard({
	onCycleUse,
	onNameChange,
	onRemove,
	onWeightSelect,
	selectedWeight,
	typeface,
}: {
	onCycleUse: () => void;
	onNameChange: (v: string) => void;
	onRemove?: () => void;
	onWeightSelect: (w: string) => void;
	selectedWeight: string;
	typeface: TypefaceEntry;
}) {
	return (
		<Box display="flex" p="32" style={{ gap: 32, position: "relative" }}>
			{/* Left */}
			<Box display="flex" flexDirection="column" gap="16" style={{ flex: 1 }}>
				<Box
					style={{
						background: "var(--ax-colors-bg-accent-subtle)",
						borderRadius: 4,
						color: "var(--ax-colors-fg-accent-strong)",
						display: "inline-block",
						fontSize: 11,
						fontWeight: 700,
						letterSpacing: "0.08em",
						padding: "3px 8px",
						textTransform: "uppercase",
						width: "fit-content",
					}}
				>
					{typeface.label}
				</Box>

				<EditableText
					value={typeface.name}
					onChange={onNameChange}
					placeholder="Typeface name"
					style={{
						fontFamily: typeface.name || "inherit",
						fontSize: 52,
						fontWeight: 700,
						letterSpacing: "-0.02em",
						lineHeight: 1.1,
					}}
				/>

				<Text style={{ fontFamily: typeface.name || "inherit", fontSize: 18, fontWeight: 600, lineHeight: 1.4 }}>
					The quick brown fox jumps over the lazy dog.
				</Text>

				<Text color="fg.tertiary" fontSize="sm">
					Sans-serif · Variable · Optimized for UI and Web
				</Text>

				<Box>
					<Box
						onClick={onCycleUse}
						style={{
							background: "var(--ax-colors-bg-accent-subtle)",
							border: "1px solid var(--ax-colors-border-accent)",
							borderRadius: 4,
							color: "var(--ax-colors-fg-accent-strong)",
							cursor: "pointer",
							display: "inline-block",
							fontSize: 11,
							fontWeight: 700,
							letterSpacing: "0.06em",
							padding: "2px 8px",
							textTransform: "uppercase",
						}}
						title="Click to change use"
					>
						{typeface.use}
					</Box>
				</Box>
			</Box>

			{/* Right: Aa specimen + weight dots */}
			<Box alignItems="center" display="flex" flexDirection="column" gap="16" justifyContent="center" style={{ flexShrink: 0, width: 200 }}>
				<Text style={{ fontFamily: typeface.name || "inherit", fontSize: 96, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}>
					Aa
				</Text>
				<Box alignItems="center" display="flex" flexDirection="column" gap="8">
					<Box display="flex" gap="12">
						{WEIGHT_OPTIONS.map((w) => (
							<Text
								key={w}
								onClick={() => onWeightSelect(w)}
								fontSize="xs"
								style={{
									color: w === selectedWeight ? "var(--ax-colors-fg-accent)" : "var(--ax-colors-fg-tertiary)",
									cursor: "pointer",
									fontFamily: typeface.name || "inherit",
									fontWeight: w === selectedWeight ? 600 : 400,
								}}
							>
								{w}
							</Text>
						))}
					</Box>
					<Box display="flex" gap="6">
						{WEIGHT_OPTIONS.map((w) => (
							<Box
								key={w}
								onClick={() => onWeightSelect(w)}
								rounded="full"
								style={{
									background: w === selectedWeight ? "var(--ax-colors-fg-accent)" : "var(--ax-colors-border-default)",
									cursor: "pointer",
									height: 8,
									width: 8,
								}}
							/>
						))}
					</Box>
				</Box>
			</Box>

			{onRemove && (
				<Box style={{ position: "absolute", right: 16, top: 16 }}>
					<Button appearance="subtle" aria-label="Remove typeface" icon={<IconXmark />} onClick={onRemove} size="sm" />
				</Box>
			)}
		</Box>
	);
}

function TypefaceRow({
	onCycleUse,
	onNameChange,
	onRemove,
	typeface,
}: {
	onCycleUse: () => void;
	onNameChange: (v: string) => void;
	onRemove: () => void;
	typeface: TypefaceEntry;
}) {
	return (
		<Box alignItems="center" display="flex" gap="24" p="20" px="32" style={{ position: "relative" }}>
			{/* Col 1: large Ag glyph */}
			<Box style={{ flexShrink: 0, width: 88 }}>
				<Text
					style={{
						color: "var(--ax-colors-fg-default)",
						fontFamily: typeface.name || "inherit",
						fontSize: 72,
						fontWeight: 700,
						letterSpacing: "-0.03em",
						lineHeight: 1,
					}}
				>
					Ag
				</Text>
			</Box>

			{/* Col 2: name + metadata */}
			<Box display="flex" flexDirection="column" gap="4" style={{ flexShrink: 0, width: 180 }}>
				<Box alignItems="center" display="flex" gap="8">
					<EditableText
						value={typeface.name}
						onChange={onNameChange}
						placeholder="Typeface name"
						style={{ fontWeight: 700, fontSize: 14 }}
					/>
					<Box
						onClick={onCycleUse}
						style={{
							background: "var(--ax-colors-bg-accent-subtle)",
							border: "1px solid var(--ax-colors-border-accent)",
							borderRadius: 4,
							color: "var(--ax-colors-fg-accent-strong)",
							cursor: "pointer",
							fontSize: 10,
							fontWeight: 700,
							letterSpacing: "0.06em",
							padding: "1px 6px",
							textTransform: "uppercase",
							whiteSpace: "nowrap",
						}}
						title="Click to change use"
					>
						{typeface.use}
					</Box>
				</Box>
				<Text color="fg.tertiary" fontSize="xs">Sans-serif</Text>
				<Text color="fg.tertiary" fontSize="xs">Variable · web</Text>
			</Box>

			{/* Col 3: specimen text */}
			<Box display="flex" flexDirection="column" gap="4" style={{ flex: 1, minWidth: 0 }}>
				<Text
					style={{
						fontFamily: typeface.name || "inherit",
						fontSize: 18,
						fontWeight: 700,
						lineHeight: 1.3,
					}}
				>
					The quick brown fox jumps over the lazy dog.
				</Text>
				<Text
					color="fg.tertiary"
					style={{ fontFamily: typeface.name || "inherit", fontSize: 12, letterSpacing: "0.02em" }}
				>
					ABCDEFGHIJKLMNOPQRSTUVWXYZ
				</Text>
				<Text
					color="fg.tertiary"
					style={{ fontFamily: typeface.name || "inherit", fontSize: 12 }}
				>
					abcdefghijklmnopqrstuvwxyz 0123456789
				</Text>
			</Box>

			{/* Remove */}
			<Box style={{ flexShrink: 0 }}>
				<Button appearance="subtle" aria-label="Remove typeface" icon={<IconXmark />} onClick={onRemove} size="sm" />
			</Box>
		</Box>
	);
}
