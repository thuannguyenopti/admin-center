"use client";

import { useState } from "react";
import { Box, Button, Input, Select, Text } from "@optiaxiom/react";
import { IconCheck, IconPlus, IconXmark } from "@optimizely/axiom-icons";
import type { BrandPack } from "../../types";

type TypographyTabProps = {
	pack: BrandPack;
};

type FontSource = "library" | "web" | "upload" | "custom";

type FontEntry = {
	_id: string;
	family: string;
	removable: boolean;
	role: string;
	source: FontSource;
	url: string;
	weight: string;
};

const FONT_OPTIONS = [
	"Inter",
	"JetBrains Mono",
	"Helvetica Neue",
	"Georgia",
	"Arial",
	"Times New Roman",
	"Courier New",
].map((font) => ({ label: font, value: font }));

const ROLE_OPTIONS = ["Heading", "Body", "Display", "Caption", "Mono", "Label"]
	.map((role) => ({ label: role, value: role }));

const SOURCE_OPTIONS: Array<{ label: string; value: FontSource }> = [
	{ label: "Font library", value: "library" },
	{ label: "Web font URL", value: "web" },
	{ label: "Uploaded file", value: "upload" },
	{ label: "Name only", value: "custom" },
];

const WEIGHT_OPTIONS = [
	{ value: "300", label: "Light 300" },
	{ value: "400", label: "Regular 400" },
	{ value: "500", label: "Medium 500" },
	{ value: "600", label: "Semibold 600" },
	{ value: "700", label: "Bold 700" },
	{ value: "800", label: "Extra Bold 800" },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMERALS = "0123456789 & @ ? !";
const PANGRAM = "The quick brown fox jumps over the lazy dog.";

function fontStack(entry: FontEntry) {
	if (entry.role === "Mono") return `"${entry.family}", monospace`;
	return `"${entry.family}", Inter, sans-serif`;
}

function sourceLabel(source: FontSource) {
	return SOURCE_OPTIONS.find((option) => option.value === source)?.label ?? "Name only";
}

function TypefaceCard({
	entry,
	onChange,
	onRemove,
}: {
	entry: FontEntry;
	onChange: (entry: FontEntry) => void;
	onRemove: () => void;
}) {
	const specimenStyle = {
		fontFamily: fontStack(entry),
		fontWeight: Number(entry.weight),
	};

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			overflow="hidden"
			rounded="xl"
			shadow="sm"
		>
			<Box bg="bg.secondary" display="grid" gap="20" p="24" style={{ gridTemplateColumns: "minmax(0, 1fr) 160px" }}>
				<Box display="flex" flexDirection="column" gap="16">
					<Box alignItems="start" display="flex" gap="16" justifyContent="space-between">
						<Box display="flex" flexDirection="column" gap="4">
							<Text color="fg.tertiary" fontSize="xs" fontWeight="600" style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>
								{entry.role}
							</Text>
							<Text style={{ ...specimenStyle, fontSize: 44, lineHeight: 1 }}>
								{entry.family || "Typeface"}
							</Text>
						</Box>
						{entry.removable && (
							<Button appearance="subtle" aria-label="Remove typeface" icon={<IconXmark />} onClick={onRemove} size="sm" />
						)}
					</Box>

					<Box display="flex" flexDirection="column" gap="8">
						<Text style={{ ...specimenStyle, fontSize: 22, lineHeight: 1.25 }}>
							{PANGRAM}
						</Text>
						<Text color="fg.secondary" style={{ ...specimenStyle, fontSize: 15, lineHeight: 1.45 }}>
							{ALPHABET}
						</Text>
						<Text color="fg.secondary" style={{ ...specimenStyle, fontSize: 15, lineHeight: 1.45 }}>
							{LOWERCASE}
						</Text>
						<Text color="fg.secondary" style={{ ...specimenStyle, fontSize: 15, lineHeight: 1.45 }}>
							{NUMERALS}
						</Text>
					</Box>
				</Box>

				<Box alignItems="end" display="flex" flexDirection="column" gap="8" justifyContent="space-between">
					<Box bg="bg.default" p="16" rounded="xl" style={{ textAlign: "right" }}>
						<Text style={{ ...specimenStyle, fontSize: 52, lineHeight: 1 }}>Aa</Text>
					</Box>
					<Box display="flex" flexDirection="column" gap="4" style={{ textAlign: "right" }}>
						<Text color="fg.secondary" fontSize="xs" fontWeight="600">{sourceLabel(entry.source)}</Text>
						<Text color="fg.tertiary" fontSize="xs">{entry.weight} weight</Text>
					</Box>
				</Box>
			</Box>

			<Box display="grid" gap="12" p="16" style={{ gridTemplateColumns: "132px minmax(180px, 1fr) 160px 152px" }}>
				<Select value={entry.role} onValueChange={(role) => onChange({ ...entry, role })} options={ROLE_OPTIONS} />
				{entry.source === "library" ? (
					<Select value={entry.family} onValueChange={(family) => onChange({ ...entry, family })} options={FONT_OPTIONS} />
				) : (
					<Input
						value={entry.family}
						onChange={(event) => onChange({ ...entry, family: event.target.value })}
						placeholder="Typeface name"
					/>
				)}
				<Select value={entry.weight} onValueChange={(weight) => onChange({ ...entry, weight })} options={WEIGHT_OPTIONS} />
				<Select value={entry.source} onValueChange={(source) => onChange({ ...entry, source: source as FontSource })} options={SOURCE_OPTIONS} />
			</Box>

			{entry.source === "web" && (
				<Box p="16" pt="0">
					<Input
						value={entry.url}
						onChange={(event) => onChange({ ...entry, url: event.target.value })}
						placeholder="https://fonts.example.com/typeface.woff2"
					/>
				</Box>
			)}

			{entry.source === "upload" && (
				<Box alignItems="center" display="flex" gap="12" p="16" pt="0">
					<Button appearance="default" size="md">Upload font file</Button>
					<Text color="fg.tertiary" fontSize="xs">Supports WOFF, WOFF2, TTF, and OTF.</Text>
				</Box>
			)}
		</Box>
	);
}

export function TypographyTab({ pack }: TypographyTabProps) {
	const [entries, setEntries] = useState<FontEntry[]>(() => {
		const base: FontEntry[] = [
			{ _id: "heading", role: "Heading", family: pack.typography.heading, weight: "700", source: "library", url: "", removable: false },
			{ _id: "body", role: "Body", family: pack.typography.body, weight: "400", source: "library", url: "", removable: false },
		];
		if (pack.typography.mono) {
			base.push({ _id: "mono", role: "Mono", family: pack.typography.mono, weight: "400", source: "library", url: "", removable: false });
		}
		return base;
	});
	const [saved, setSaved] = useState(false);

	const update = (id: string, updated: FontEntry) =>
		setEntries((current) => current.map((entry) => (entry._id === id ? updated : entry)));
	const remove = (id: string) =>
		setEntries((current) => current.filter((entry) => entry._id !== id));
	const add = () =>
		setEntries((current) => [
			...current,
			{ _id: `font-${Date.now()}`, role: "Display", family: "Inter", weight: "700", source: "library", url: "", removable: true },
		]);
	const save = () => {
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	};

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{ maxWidth: 980 }}>
			<Box display="grid" gap="16" style={{ gridTemplateColumns: "minmax(0, 1fr) 260px" }}>
				<Box display="flex" flexDirection="column" gap="4">
					<Text fontWeight="600" style={{ fontSize: 16 }}>Typeface system</Text>
					<Text color="fg.secondary" fontSize="sm">
						Manage the fonts Opal can actually resolve: choose from the library, link a web font, upload a file, or keep a name-only reference.
					</Text>
				</Box>
				<Box alignItems="center" display="flex" gap="8" justifyContent="end">
					<Button appearance="default" icon={<IconPlus />} onClick={add} size="md">Add typeface</Button>
					<Button appearance="primary" icon={saved ? <IconCheck /> : undefined} onClick={save} size="md">
						{saved ? "Saved" : "Save typography"}
					</Button>
				</Box>
			</Box>

			<Box display="flex" flexDirection="column" gap="12">
				{entries.map((entry) => (
					<TypefaceCard
						key={entry._id}
						entry={entry}
						onChange={(updated) => update(entry._id, updated)}
						onRemove={() => remove(entry._id)}
					/>
				))}
			</Box>
		</Box>
	);
}
