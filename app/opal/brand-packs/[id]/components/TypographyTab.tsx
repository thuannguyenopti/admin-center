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

const FONT_LIBRARY_BY_BRAND: Record<string, Typeface[]> = {
	"coca-cola": [
		{ family: "Trade Gothic Bold Condensed No. 20", category: "Primary", role: "Headlines & Campaign", meta: "Condensed grotesque sans-serif", styles: 6, weight: 700, source: "library", inUse: true },
		{ family: "Gotham", category: "Secondary", role: "Body & Documents", meta: "Geometric sans-serif", styles: 12, weight: 400, source: "library", inUse: true },
		{ family: "Spencerian Script (Coca-Cola Script)", category: "Display", role: "Logotype only", meta: "Custom script typeface", styles: 1, weight: 400, source: "custom", inUse: true },
	],
	fanta: [
		{ family: "Fanta Bespoke Sans", category: "Primary", role: "Wordmark & Headlines", meta: "Custom extruded sans (Colophon Foundry)", styles: 1, weight: 700, source: "custom", inUse: true },
		{ family: "Poppins", category: "Secondary", role: "Body & Packaging Copy", meta: "Geometric sans-serif", styles: 9, weight: 400, source: "library", inUse: true },
	],
	sprite: [
		{ family: "Refraktiv", category: "Primary", role: "Wordmark & Headlines", meta: "Custom display face (Turner Duckworth)", styles: 3, weight: 700, source: "custom", inUse: true },
		{ family: "Aktiv Grotesk", category: "Secondary", role: "Body & UI", meta: "Neutral grotesque sans-serif", styles: 10, weight: 400, source: "library", inUse: true },
	],
	"minute-maid": [
		{ family: "Minute Maid Hand", category: "Primary", role: "Wordmark & Headlines", meta: "Custom hand-drawn type (JKR + Erik Marinovich)", styles: 1, weight: 400, source: "custom", inUse: true },
		{ family: "Museo Sans", category: "Secondary", role: "Body & Packaging Copy", meta: "Warm humanist sans-serif", styles: 9, weight: 400, source: "library", inUse: true },
	],
};

const DEFAULT_FONT_LIBRARY: Typeface[] = [
	{ family: "Inter", category: "Primary", role: "Product UI", meta: "Humanist sans-serif", styles: 14, weight: 700, source: "library", inUse: true },
];

function getFontLibraryForPack(pack: BrandPack): Typeface[] {
	return FONT_LIBRARY_BY_BRAND[pack.id] ?? DEFAULT_FONT_LIBRARY;
}

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
	const fontLibrary = getFontLibraryForPack(pack);
	const primaryTypeface = fontLibrary.find((font) => font.family === pack.typography.heading) ?? fontLibrary[0];
	const filtered = category === "all" ? fontLibrary : fontLibrary.filter((font) => font.category === category);

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
					<Text color="fg.secondary" fontSize="sm">Showing {filtered.length} of {fontLibrary.length} available typefaces</Text>
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
							<Text color={label === "All typefaces" ? "fg.success.strong" : "fg.secondary"} fontSize="sm" fontWeight={label === "All typefaces" ? "600" : "400"}>{label}</Text>
							<Text color="fg.tertiary" fontSize="xs">{label === "All typefaces" ? fontLibrary.length : fontLibrary.filter((font) => font.category === label).length}</Text>
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
				fonts={fontLibrary}
				onOpenChange={setManageTypeSystemOpen}
				onSave={save}
				open={manageTypeSystemOpen}
			/>
		</Box>
	);
}
