"use client";

import { useState } from "react";
import { Box, Button, Input, Select, Text } from "@optiaxiom/react";
import { IconCheck, IconPlus, IconXmark } from "@optimizely/axiom-icons";
import type { BrandPack } from "../../types";

type TypographyTabProps = {
	pack: BrandPack;
};

type FontEntry = {
	_id: string;
	role: string;
	family: string;
	weight: string;
	removable: boolean;
};

const WEIGHTS = [
	{ value: "300", label: "Light 300" },
	{ value: "400", label: "Regular 400" },
	{ value: "500", label: "Medium 500" },
	{ value: "600", label: "Semibold 600" },
	{ value: "700", label: "Bold 700" },
	{ value: "800", label: "Extra Bold 800" },
];

const ROLE_OPTIONS = ["Heading", "Body", "Display", "Caption", "Mono", "Label"]
	.map((role) => ({ label: role, value: role }));

const SAMPLE_TEXT: Record<string, string> = {
	Heading: "The quick brown fox",
	Display: "Make your brand speak",
	Body: "The quick brown fox jumps over the lazy dog.",
	Caption: "Caption text for supporting information",
	Mono: "const brand = 'optimizely';",
	Label: "Label Text",
};

function FontRow({
	entry,
	onChange,
	onRemove,
}: {
	entry: FontEntry;
	onChange: (e: FontEntry) => void;
	onRemove: () => void;
}) {
	const sample = SAMPLE_TEXT[entry.role] ?? entry.family;
	const isMono = entry.role === "Mono";

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			gap="0"
			overflow="hidden"
			rounded="xl"
		>
			{/* Preview */}
			<Box
				bg="bg.secondary"
				display="flex"
				flexDirection="column"
				gap="4"
				p="20"
				style={{ minHeight: 72 }}
			>
				<Text
					color="fg.tertiary"
					fontSize="xs"
					style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}
				>
					{entry.role}
				</Text>
				<Text
					style={{
						fontFamily: isMono ? "monospace" : entry.family || "inherit",
						fontSize: entry.role === "Heading" || entry.role === "Display" ? 28 : entry.role === "Caption" || entry.role === "Label" ? 13 : 16,
						fontWeight: parseInt(entry.weight, 10),
						lineHeight: 1.25,
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{sample}
				</Text>
			</Box>

			{/* Editable fields */}
			<Box
				alignItems="center"
				display="flex"
				gap="12"
				p="12"
				style={{ borderTop: "1px solid var(--ax-colors-border-tertiary)" }}
			>
				{/* Role select */}
				<Box style={{ width: 132 }}>
					<Select
						value={entry.role}
						onValueChange={(role) => onChange({ ...entry, role })}
						options={ROLE_OPTIONS}
					/>
				</Box>

				{/* Family name */}
				<Input
					value={entry.family}
					onChange={(e) => onChange({ ...entry, family: e.target.value })}
					placeholder="Typeface name"
					style={{ flex: 1, minWidth: 0 }}
				/>

				{/* Weight */}
				<Box style={{ width: 160 }}>
					<Select
						value={entry.weight}
						onValueChange={(weight) => onChange({ ...entry, weight })}
						options={WEIGHTS}
					/>
				</Box>

				{/* Remove */}
				{entry.removable && (
					<Button
						appearance="subtle"
						aria-label="Remove typeface"
						icon={<IconXmark />}
						onClick={onRemove}
						size="sm"
						style={{ flexShrink: 0 }}
					/>
				)}
			</Box>
		</Box>
	);
}

export function TypographyTab({ pack }: TypographyTabProps) {
	const [entries, setEntries] = useState<FontEntry[]>(() => {
		const base: FontEntry[] = [
			{ _id: "heading", role: "Heading", family: pack.typography.heading, weight: "700", removable: false },
			{ _id: "body", role: "Body", family: pack.typography.body, weight: "400", removable: false },
		];
		if (pack.typography.mono) {
			base.push({ _id: "mono", role: "Mono", family: pack.typography.mono, weight: "400", removable: false });
		}
		return base;
	});
	const [saved, setSaved] = useState(false);

	const update = (id: string, updated: FontEntry) =>
		setEntries((p) => p.map((e) => (e._id === id ? updated : e)));
	const remove = (id: string) =>
		setEntries((p) => p.filter((e) => e._id !== id));
	const add = () =>
		setEntries((p) => [
			...p,
			{ _id: `f${Date.now()}`, role: "Display", family: "", weight: "600", removable: true },
		]);
	const save = () => {
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	};

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{ maxWidth: 680 }}>
			{/* Font entry cards */}
			<Box display="flex" flexDirection="column" gap="10">
				{entries.map((e) => (
					<FontRow
						key={e._id}
						entry={e}
						onChange={(u) => update(e._id, u)}
						onRemove={() => remove(e._id)}
					/>
				))}
			</Box>

			{/* Add typeface */}
			<Button
				appearance="default"
				icon={<IconPlus />}
				onClick={add}
				size="md"
				style={{
					border: "1.5px dashed var(--ax-colors-border-default)",
					width: "100%",
				}}
			>
				Add typeface
			</Button>

			{/* Save */}
			<Box display="flex" justifyContent="end">
				<Button
					appearance="primary"
					size="md"
					icon={saved ? <IconCheck /> : undefined}
					onClick={save}
				>
					{saved ? "Saved" : "Save typography"}
				</Button>
			</Box>
		</Box>
	);
}
