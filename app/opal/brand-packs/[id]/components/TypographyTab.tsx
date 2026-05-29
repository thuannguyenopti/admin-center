"use client";

import { useState } from "react";
import { Badge, Box, Button, SearchInput, Select, Text } from "@optiaxiom/react";
import { IconCheck, IconPlus, IconSparkles } from "@optiaxiom/icons";
import type { BrandPack } from "../../types";
import { AddTypefaceDialog } from "./TypographyAddTypefaceDialog";
import { ManageTypeSystemDialog } from "./TypographyManageTypeSystemDialog";
import styles from "./TypographyTab.module.css";

type TypographyTabProps = {
	pack: BrandPack;
};

export type Typeface = {
	category: "Primary" | "Secondary" | "Mono" | "Display" | "System";
	family: string;
	inUse?: boolean;
	meta: string;
	role: string;
	source: "library" | "upload" | "web" | "custom";
	styles: number;
	weight: number;
};

const PANGRAM = "The quick brown fox jumps over the lazy dog.";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMERALS = "0123456789";

const CATEGORY_OPTIONS = [
	{ label: "All categories", value: "all" },
	{ label: "Primary", value: "Primary" },
	{ label: "Secondary", value: "Secondary" },
	{ label: "Mono", value: "Mono" },
	{ label: "Display", value: "Display" },
];

const FONT_LIBRARY: Typeface[] = [
	{ family: "Inter", category: "Primary", role: "Product UI", meta: "Humanist sans-serif", styles: 14, weight: 700, source: "library", inUse: true },
	{ family: "Inter Tight", category: "Secondary", role: "Marketing", meta: "Tight spacing variant", styles: 12, weight: 500, source: "library" },
	{ family: "JetBrains Mono", category: "Mono", role: "Code and tokens", meta: "Monospace", styles: 10, weight: 700, source: "library", inUse: true },
	{ family: "Overpass", category: "Display", role: "Campaign display", meta: "Condensed sans-serif", styles: 1, weight: 800, source: "web" },
	{ family: "Manrope", category: "Secondary", role: "Accent", meta: "Geometric sans-serif", styles: 7, weight: 700, source: "web" },
	{ family: "Source Serif 4", category: "Secondary", role: "Long-form editorial", meta: "Serif", styles: 7, weight: 400, source: "upload" },
];

function fontStack(typeface: Typeface) {
	if (typeface.category === "Mono") return `"${typeface.family}", monospace`;
	return `"${typeface.family}", Inter, sans-serif`;
}

function SpecimenBadge({ children, intent = "neutral" }: { children: React.ReactNode; intent?: "neutral" | "success" }) {
	return (
		<Badge
			intent={intent}
			variant="subtle"
			style={{
				width: "fit-content",
				whiteSpace: "nowrap",
			}}
		>
			{children}
		</Badge>
	);
}

function MetadataLine({ items }: { items: string[] }) {
	return (
		<Box alignItems="center" display="flex" gap="10" style={{ flexWrap: "wrap" }}>
			{items.map((item, index) => (
				<Box key={item} alignItems="center" display="flex" gap="10">
					{index > 0 && <Box bg="bg.tertiary" rounded="full" style={{ height: 4, width: 4 }} />}
					<Text color="fg.secondary" fontSize="sm">{item}</Text>
				</Box>
			))}
		</Box>
	);
}

function HeroSpecimen({ onAddTypeface, onManageTypeSystem, saved, typeface }: { onAddTypeface: () => void; onManageTypeSystem: () => void; saved: boolean; typeface: Typeface }) {
	const family = fontStack(typeface);
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			className={styles.heroSpecimen}
			display="grid"
			gap="32"
			p="32"
			rounded="xl"
			shadow="sm"
		>
			<Box display="flex" flexDirection="column" gap="20">
				<Box display="flex" flexDirection="column" gap="12">
					<SpecimenBadge intent="success">Primary typeface</SpecimenBadge>
					<Text className={styles.familyName} style={{ fontFamily: family, fontWeight: typeface.weight, letterSpacing: 0, lineHeight: 0.95 }}>
						{typeface.family}
					</Text>
					<Text className={styles.pangram} style={{ fontFamily: family, fontWeight: 700, lineHeight: 1.2 }}>
						{PANGRAM}
					</Text>
				</Box>

				<Box display="flex" flexDirection="column" gap="12">
					<MetadataLine items={[typeface.meta, `${typeface.styles} styles`, "Variable", "Optimized for UI and Web"]} />
					<Box display="flex" gap="6" style={{ flexWrap: "wrap" }}>
						{["Product UI", "Marketing", "Emails", "Docs"].map((label) => (
							<SpecimenBadge key={label}>{label}</SpecimenBadge>
						))}
					</Box>
				</Box>
			</Box>

			<Box alignItems="end" className={styles.heroSide} display="flex" flexDirection="column" gap="24" justifyContent="space-between">
				<Box alignItems="center" className={styles.heroControls} display="flex" gap="8" style={{ flexWrap: "wrap" }}>
					<Button appearance="primary" icon={<IconPlus />} onClick={onAddTypeface} size="md">Add typeface</Button>
					<Button appearance="default" icon={saved ? <IconCheck /> : undefined} onClick={onManageTypeSystem} size="md">
						{saved ? "Saved" : "Manage type system"}
					</Button>
				</Box>
				<Box className={styles.heroDisplay} display="flex" flexDirection="column" gap="16">
					<Text
						aria-label="Typeface specimen"
						className={styles.specimenLetters}
						style={{
							color: "var(--ax-colors-fg-default)",
							fontFamily: family,
							fontWeight: typeface.weight,
							letterSpacing: 0,
							lineHeight: 0.8,
						}}
					>
						Aa
					</Text>
					<Box alignItems="center" display="flex" gap="20">
						{["Regular", "Medium", "Semibold", "Bold"].map((weight) => (
							<Text key={weight} color={weight === "Semibold" ? "fg.success" : "fg.secondary"} fontSize="sm" fontWeight={weight === "Semibold" ? "600" : "400"}>
								{weight}
							</Text>
						))}
					</Box>
					<Box alignItems="center" display="flex" gap="8">
						{Array.from({ length: 7 }).map((_, index) => (
							<Box
								key={index}
								bg={index === 0 ? "bg.success" : "bg.secondary"}
								rounded="full"
								style={{ height: 8, width: 8 }}
							/>
						))}
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

function TypefaceRow({ typeface }: { typeface: Typeface }) {
	const family = fontStack(typeface);
	return (
		<Box alignItems="center" bg="bg.default" borderB="1" borderColor="border.tertiary" className={styles.typefaceRow} display="grid" gap="24" p="20">
			<Text style={{ fontFamily: family, fontSize: 62, fontWeight: typeface.weight, letterSpacing: 0, lineHeight: 1 }}>Ag</Text>
			<Box display="flex" flexDirection="column" gap="4">
				<Box alignItems="center" display="flex" gap="8">
					<Text fontWeight="600">{typeface.family}</Text>
					{typeface.inUse && <SpecimenBadge intent="success">Primary</SpecimenBadge>}
				</Box>
				<Text color="fg.secondary" fontSize="xs">{typeface.meta}</Text>
				<Text color="fg.tertiary" fontSize="xs">{typeface.styles} styles · {typeface.source}</Text>
			</Box>
			<Box className={styles.typefacePreview} display="flex" flexDirection="column" gap="6">
				<Text style={{ fontFamily: family, fontSize: 17, fontWeight: typeface.weight, lineHeight: 1.25 }}>{PANGRAM}</Text>
				<Text color="fg.secondary" style={{ fontFamily: family, fontSize: 11, lineHeight: 1.4 }}>{ALPHABET}</Text>
				<Text color="fg.secondary" style={{ fontFamily: family, fontSize: 11, lineHeight: 1.4 }}>{LOWERCASE} {NUMERALS}</Text>
			</Box>
			<Box alignItems="center" className={styles.typefaceAction} display="flex" justifyContent="end">
				<Button appearance="subtle" size="sm">
					{typeface.inUse ? "In use" : "Add to pack"}
				</Button>
			</Box>
		</Box>
	);
}

export function TypographyTab({ pack }: TypographyTabProps) {
	const [addTypefaceOpen, setAddTypefaceOpen] = useState(false);
	const [category, setCategory] = useState("all");
	const [manageTypeSystemOpen, setManageTypeSystemOpen] = useState(false);
	const [saved, setSaved] = useState(false);
	const primaryTypeface = FONT_LIBRARY.find((font) => font.family === pack.typography.heading) ?? FONT_LIBRARY[0];
	const filtered = category === "all" ? FONT_LIBRARY : FONT_LIBRARY.filter((font) => font.category === category);

	const save = () => {
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	};

	return (
		<Box className={styles.typographyTab} display="flex" flexDirection="column" gap="24">
			<HeroSpecimen
				onAddTypeface={() => setAddTypefaceOpen(true)}
				onManageTypeSystem={() => setManageTypeSystemOpen(true)}
				saved={saved}
				typeface={primaryTypeface}
			/>

			<Box alignItems="center" display="flex" justifyContent="space-between" style={{ flexWrap: "wrap", gap: 12 }}>
				<Box display="flex" flexDirection="column" gap="4">
					<Text fontWeight="600" style={{ fontSize: 18 }}>All typefaces</Text>
					<Text color="fg.secondary" fontSize="sm">Showing {filtered.length} of {FONT_LIBRARY.length} available typefaces</Text>
				</Box>
				<Box alignItems="center" display="flex" gap="8">
					<Select value={category} onValueChange={setCategory} options={CATEGORY_OPTIONS} />
					<Box style={{ width: 240 }}>
						<SearchInput aria-label="Search typefaces" placeholder="Search typefaces..." />
					</Box>
				</Box>
			</Box>

			<Box className={styles.libraryLayout} display="grid" gap="20">
				<Box display="flex" flexDirection="column" gap="8">
					{["All typefaces", "Primary", "Secondary", "Mono", "Display", "System"].map((label) => (
						<Box key={label} alignItems="center" bg={label === "All typefaces" ? "bg.success.subtle" : undefined} display="flex" justifyContent="space-between" p="12" rounded="lg">
							<Text color={label === "All typefaces" ? "fg.success" : "fg.secondary"} fontSize="sm" fontWeight={label === "All typefaces" ? "600" : "400"}>{label}</Text>
							<Text color="fg.tertiary" fontSize="xs">{label === "All typefaces" ? FONT_LIBRARY.length : FONT_LIBRARY.filter((font) => font.category === label).length}</Text>
						</Box>
					))}
					<Box bg="bg.secondary" display="flex" flexDirection="column" gap="12" mt="24" p="16" rounded="xl">
						<IconSparkles size={15} style={{ color: "var(--ax-colors-fg-success)" }} />
						<Text fontWeight="600" fontSize="sm">Need a typeface?</Text>
						<Text color="fg.secondary" fontSize="sm">Upload a font file or request a new one.</Text>
						<Button appearance="default" icon={<IconPlus />} onClick={() => setAddTypefaceOpen(true)} size="sm">Add typeface</Button>
					</Box>
				</Box>

				<Box border="1" borderColor="border.tertiary" display="flex" flexDirection="column" overflow="hidden" rounded="xl" shadow="sm">
					{filtered.map((typeface) => <TypefaceRow key={typeface.family} typeface={typeface} />)}
				</Box>
			</Box>
			<AddTypefaceDialog open={addTypefaceOpen} onOpenChange={setAddTypefaceOpen} />
			<ManageTypeSystemDialog
				fonts={FONT_LIBRARY}
				onOpenChange={setManageTypeSystemOpen}
				onSave={save}
				open={manageTypeSystemOpen}
			/>
		</Box>
	);
}
