"use client";

import { useState } from "react";
import { Box, Button, Input, Select, Text } from "@optiaxiom/react";
import { IconCheck, IconEllipsisStroke, IconStar, IconMagnifyingGlass, IconPlus } from "@optimizely/axiom-icons";
import type { BrandPack } from "../../types";

type TypographyTabProps = {
	pack: BrandPack;
};

type Typeface = {
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
	{ family: "Source Serif 4", category: "Secondary", role: "Long-form editorial", meta: "Serif", styles: 7, weight: 400, source: "upload" },
];

function fontStack(typeface: Typeface) {
	if (typeface.category === "Mono") return `"${typeface.family}", monospace`;
	return `"${typeface.family}", Inter, sans-serif`;
}

function Pill({ children }: { children: React.ReactNode }) {
	return (
		<Box bg="bg.success.subtle" rounded="full" style={{ padding: "5px 12px" }}>
			<Text color="fg.success" fontSize="xs" fontWeight="500">{children}</Text>
		</Box>
	);
}

function HeroSpecimen({ typeface }: { typeface: Typeface }) {
	const family = fontStack(typeface);
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="grid"
			gap="24"
			p="24"
			rounded="xl"
			shadow="sm"
			style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 420px)" }}
		>
			<Box display="flex" flexDirection="column" gap="20">
				<Box display="flex" flexDirection="column" gap="12">
					<Pill>Primary typeface</Pill>
					<Text style={{ fontFamily: family, fontSize: 72, fontWeight: typeface.weight, letterSpacing: 0, lineHeight: 0.95 }}>
						{typeface.family}
					</Text>
					<Text style={{ fontFamily: family, fontSize: 28, fontWeight: 700, lineHeight: 1.2, maxWidth: 560 }}>
						{PANGRAM}
					</Text>
				</Box>

				<Box display="flex" flexDirection="column" gap="12">
					<Text color="fg.secondary" fontSize="sm">
						{typeface.meta} · {typeface.styles} styles · Variable · Optimized for UI and Web
					</Text>
					<Box display="flex" gap="8" style={{ flexWrap: "wrap" }}>
						{["Product UI", "Marketing", "Emails", "Documentation"].map((label) => <Pill key={label}>{label}</Pill>)}
					</Box>
				</Box>
			</Box>

			<Box alignItems="center" display="flex" flexDirection="column" gap="20" justifyContent="center">
				<Text style={{ fontFamily: family, fontSize: 176, fontWeight: typeface.weight, letterSpacing: 0, lineHeight: 0.8 }}>
					Aa
				</Text>
				<Box alignItems="center" display="flex" gap="20">
					{["Regular", "Medium", "Semibold", "Bold"].map((weight) => (
						<Text key={weight} color={weight === "Semibold" ? "fg.success" : "fg.secondary"} fontSize="sm" fontWeight={weight === "Semibold" ? "600" : "400"}>
							{weight}
						</Text>
					))}
				</Box>
				<Box display="flex" gap="6">
					{Array.from({ length: 6 }).map((_, index) => (
						<Box key={index} bg={index === 0 ? "bg.success" : "bg.secondary"} rounded="full" style={{ height: 8, width: 8 }} />
					))}
				</Box>
			</Box>
		</Box>
	);
}

function TypefaceRow({ typeface }: { typeface: Typeface }) {
	const family = fontStack(typeface);
	return (
		<Box alignItems="center" bg="bg.default" borderB="1" borderColor="border.tertiary" display="grid" gap="20" p="20" style={{ gridTemplateColumns: "120px 180px minmax(260px, 1fr) 132px" }}>
			<Text style={{ fontFamily: family, fontSize: 62, fontWeight: typeface.weight, letterSpacing: 0, lineHeight: 1 }}>Ag</Text>
			<Box display="flex" flexDirection="column" gap="4">
				<Box alignItems="center" display="flex" gap="8">
					<Text fontWeight="600">{typeface.family}</Text>
					{typeface.inUse && <Pill>Primary</Pill>}
				</Box>
				<Text color="fg.secondary" fontSize="sm">{typeface.meta}</Text>
				<Text color="fg.tertiary" fontSize="xs">{typeface.styles} styles · {typeface.source}</Text>
			</Box>
			<Box display="flex" flexDirection="column" gap="6">
				<Text style={{ fontFamily: family, fontSize: 17, fontWeight: typeface.weight, lineHeight: 1.25 }}>{PANGRAM}</Text>
				<Text color="fg.secondary" style={{ fontFamily: family, fontSize: 12, lineHeight: 1.4 }}>{ALPHABET}</Text>
				<Text color="fg.secondary" style={{ fontFamily: family, fontSize: 12, lineHeight: 1.4 }}>{LOWERCASE} {NUMERALS}</Text>
			</Box>
			<Box alignItems="center" display="flex" gap="8" justifyContent="end">
				<Button appearance="subtle" aria-label={`Favorite ${typeface.family}`} icon={<IconStar />} size="sm" />
				<Button appearance="subtle" aria-label={`More actions for ${typeface.family}`} icon={<IconEllipsisStroke />} size="sm" />
				<Button appearance={typeface.inUse ? "subtle" : "default"} size="md">
					{typeface.inUse ? "In use" : "Add to pack"}
				</Button>
			</Box>
		</Box>
	);
}

export function TypographyTab({ pack }: TypographyTabProps) {
	const [category, setCategory] = useState("all");
	const [saved, setSaved] = useState(false);
	const primaryTypeface = FONT_LIBRARY.find((font) => font.family === pack.typography.heading) ?? FONT_LIBRARY[0];
	const filtered = category === "all" ? FONT_LIBRARY : FONT_LIBRARY.filter((font) => font.category === category);

	const save = () => {
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	};

	return (
		<Box display="flex" flexDirection="column" gap="24">
			<Box alignItems="end" display="grid" gap="24" style={{ gridTemplateColumns: "minmax(0, 1fr) 320px" }}>
				<Box display="flex" flexDirection="column" gap="12">
					<Text style={{ fontSize: 56, fontWeight: 800, letterSpacing: 0, lineHeight: 1 }}>Typography</Text>
					<Text color="fg.secondary" fontSize="md" style={{ lineHeight: 1.55, maxWidth: 520 }}>
						Type systems that shape our voice and create consistency across every Opal-generated experience.
					</Text>
				</Box>
				<Box alignItems="center" display="flex" justifyContent="end">
					<Text color="fg.success" style={{ fontSize: 118, fontWeight: 300, letterSpacing: 0, lineHeight: 0.8 }}>
						Aa
					</Text>
				</Box>
			</Box>

			<HeroSpecimen typeface={primaryTypeface} />

			<Box alignItems="center" display="flex" justifyContent="space-between" style={{ flexWrap: "wrap", gap: 12 }}>
				<Box display="flex" flexDirection="column" gap="4">
					<Text fontWeight="600" style={{ fontSize: 18 }}>All typefaces</Text>
					<Text color="fg.secondary" fontSize="sm">Showing {filtered.length} of {FONT_LIBRARY.length} available typefaces</Text>
				</Box>
				<Box alignItems="center" display="flex" gap="8">
					<Select value={category} onValueChange={setCategory} options={CATEGORY_OPTIONS} />
					<Box style={{ width: 240 }}>
						<Input placeholder="Search typefaces..." />
					</Box>
					<Button appearance="default" icon={<IconPlus />} size="md">Add typeface</Button>
					<Button appearance="primary" icon={saved ? <IconCheck /> : undefined} onClick={save} size="md">
						{saved ? "Saved" : "Manage type system"}
					</Button>
				</Box>
			</Box>

			<Box display="grid" gap="20" style={{ gridTemplateColumns: "180px minmax(0, 1fr)" }}>
				<Box display="flex" flexDirection="column" gap="8">
					{["All typefaces", "Primary", "Secondary", "Mono", "Display", "System"].map((label) => (
						<Box key={label} alignItems="center" bg={label === "All typefaces" ? "bg.success.subtle" : undefined} display="flex" justifyContent="space-between" p="12" rounded="lg">
							<Text color={label === "All typefaces" ? "fg.success" : "fg.secondary"} fontSize="sm" fontWeight={label === "All typefaces" ? "600" : "400"}>{label}</Text>
							<Text color="fg.tertiary" fontSize="xs">{label === "All typefaces" ? FONT_LIBRARY.length : FONT_LIBRARY.filter((font) => font.category === label).length}</Text>
						</Box>
					))}
					<Box bg="bg.secondary" display="flex" flexDirection="column" gap="12" mt="24" p="16" rounded="xl">
						<IconMagnifyingGlass size={15} style={{ color: "var(--ax-colors-fg-success)" }} />
						<Text fontWeight="600" fontSize="sm">Need a typeface?</Text>
						<Text color="fg.secondary" fontSize="sm">Upload a font file or request a new one.</Text>
						<Button appearance="subtle" icon={<IconPlus />} size="sm">Add typeface</Button>
					</Box>
				</Box>

				<Box border="1" borderColor="border.tertiary" display="flex" flexDirection="column" overflow="hidden" rounded="xl" shadow="sm">
					{filtered.map((typeface) => <TypefaceRow key={typeface.family} typeface={typeface} />)}
				</Box>
			</Box>
		</Box>
	);
}
