"use client";

import {useState} from "react";
import {Badge, Box, Button, SearchInput, Select, Text} from "@optiaxiom/react";
import {IconCheck, IconPlus, IconSparkles} from "@optiaxiom/icons";
import type {BrandPack, BrandTypographyRule} from "../../types";
import {getBrandTypographyRules, getBrandTypographySummary} from "../../adapters";
import {AddTypefaceDialog, type AddedTypefacePayload} from "./TypographyAddTypefaceDialog";
import {ManageTypeSystemDialog} from "./TypographyManageTypeSystemDialog";
import {PrimaryCtaIcon} from "./PrimaryCtaIcon";
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

const USAGE_LABELS: Record<BrandTypographyRule["usage"], string> = {
	accent: "Accent",
	body: "Body",
	caption: "Caption",
	display: "Display",
	heading: "Heading",
	mono: "Mono",
	ui: "UI",
};

const CATEGORY_OPTIONS = [
	{label: "All categories", value: "all"},
	{label: "Primary", value: "Primary"},
	{label: "Secondary", value: "Secondary"},
	{label: "Mono", value: "Mono"},
	{label: "Display", value: "Display"},
];

const FONT_LIBRARY: Typeface[] = [
	{
		family: "Inter",
		category: "Primary",
		role: "Product UI",
		meta: "Humanist sans-serif",
		styles: 14,
		weight: 700,
		source: "library",
		inUse: true,
	},
	{
		family: "Inter Tight",
		category: "Secondary",
		role: "Marketing",
		meta: "Tight spacing variant",
		styles: 12,
		weight: 500,
		source: "library",
	},
	{
		family: "JetBrains Mono",
		category: "Mono",
		role: "Code and tokens",
		meta: "Monospace",
		styles: 10,
		weight: 700,
		source: "library",
		inUse: true,
	},
	{
		family: "Overpass",
		category: "Display",
		role: "Campaign display",
		meta: "Condensed sans-serif",
		styles: 1,
		weight: 800,
		source: "web",
	},
	{
		family: "Manrope",
		category: "Secondary",
		role: "Accent",
		meta: "Geometric sans-serif",
		styles: 7,
		weight: 700,
		source: "web",
	},
	{
		family: "Source Serif 4",
		category: "Secondary",
		role: "Long-form editorial",
		meta: "Serif",
		styles: 7,
		weight: 400,
		source: "upload",
	},
];

function fontStack(typeface: Typeface) {
	if (typeface.category === "Mono") return `"${typeface.family}", monospace`;
	return `"${typeface.family}", Inter, sans-serif`;
}

function SpecimenBadge({
	children,
	intent = "neutral",
}: {
	children: React.ReactNode;
	intent?: "neutral" | "success";
}) {
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

function AttributeGrid({
	items,
	variant = "default",
}: {
	items: Array<{label: string; value: string | null | undefined}>;
	variant?: "default" | "hero";
}) {
	return (
		<Box
			className={
				variant === "hero"
					? `${styles.attributeGrid} ${styles.attributeGridHero}`
					: styles.attributeGrid
			}
		>
			{items.map((item) => (
				<Box key={item.label} className={styles.attributeCard}>
					<Text
						color="fg.tertiary"
						fontWeight="700"
						style={{fontSize: 12, lineHeight: 1.15}}
					>
						{item.label}
					</Text>
					<Text
						color="fg.default"
						fontWeight="500"
						style={{fontSize: 14, lineHeight: 1.25}}
					>
						{item.value || "Not set"}
					</Text>
				</Box>
			))}
		</Box>
	);
}

function HeroSpecimen({
	onAddTypeface,
	onManageTypeSystem,
	saved,
	typeface,
}: {
	onAddTypeface: () => void;
	onManageTypeSystem: () => void;
	saved: boolean;
	typeface: Typeface;
}) {
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
					<Text
						className={styles.familyName}
						style={{
							fontFamily: family,
							fontWeight: typeface.weight,
							letterSpacing: 0,
							lineHeight: 0.95,
						}}
					>
						{typeface.family}
					</Text>
					<Text
						className={styles.pangram}
						style={{fontFamily: family, fontWeight: 700, lineHeight: 1.2}}
					>
						{PANGRAM}
					</Text>
				</Box>

				<Box display="flex" flexDirection="column" gap="12">
					<AttributeGrid
						items={[
							{label: "Class", value: typeface.meta},
							{label: "Styles", value: `${typeface.styles} styles`},
							{label: "Format", value: "Variable"},
							{label: "Use", value: "UI and Web"},
						]}
						variant="hero"
					/>
					<Box display="flex" gap="6" style={{flexWrap: "wrap"}}>
						{["Product UI", "Marketing", "Emails", "Docs"].map((label) => (
							<SpecimenBadge key={label}>{label}</SpecimenBadge>
						))}
					</Box>
				</Box>
			</Box>

			<Box
				alignItems="end"
				className={styles.heroSide}
				display="flex"
				flexDirection="column"
				gap="24"
				justifyContent="space-between"
			>
				<Box
					alignItems="center"
					className={styles.heroControls}
					display="flex"
					gap="8"
					style={{flexWrap: "wrap"}}
				>
					<Button
						appearance="default"
						icon={saved ? <IconCheck /> : undefined}
						onClick={onManageTypeSystem}
						size="md"
					>
						{saved ? "Saved" : "Manage type system"}
					</Button>
					<Button
						appearance="primary"
						icon={
							<PrimaryCtaIcon>
								<IconPlus />
							</PrimaryCtaIcon>
						}
						onClick={onAddTypeface}
						size="md"
					>
						Add typeface
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
							<Text
								key={weight}
								color={weight === "Semibold" ? "fg.success" : "fg.secondary"}
								fontSize="sm"
								fontWeight={weight === "Semibold" ? "600" : "400"}
							>
								{weight}
							</Text>
						))}
					</Box>
					<Box alignItems="center" display="flex" gap="8">
						{Array.from({length: 7}).map((_, index) => (
							<Box
								key={index}
								bg={index === 0 ? "bg.success" : "bg.secondary"}
								rounded="full"
								style={{height: 8, width: 8}}
							/>
						))}
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

function TypefaceRow({
	onAddToPack,
	typeface,
}: {
	onAddToPack: (typeface: Typeface) => void;
	typeface: Typeface;
}) {
	const family = fontStack(typeface);
	return (
		<Box
			alignItems="center"
			bg="bg.default"
			borderB="1"
			borderColor="border.tertiary"
			className={styles.typefaceRow}
			display="grid"
			gap="24"
			p="20"
		>
			<Box display="flex" flexDirection="column" gap="8">
				<Box alignItems="center" display="flex" gap="8" style={{flexWrap: "wrap"}}>
					<Text fontWeight="700" style={{fontSize: 16, lineHeight: 1.25}}>
						{typeface.family}
					</Text>
					{typeface.inUse && <SpecimenBadge intent="success">Primary</SpecimenBadge>}
				</Box>
				<Text color="fg.secondary" style={{fontSize: 14, lineHeight: 1.35}}>
					{typeface.meta}
				</Text>
				<Text color="fg.tertiary" style={{fontSize: 12, lineHeight: 1.35}}>
					{typeface.styles} styles · {typeface.source} · {typeface.role}
				</Text>
			</Box>
			<Box className={styles.typefacePreview} display="flex" flexDirection="column" gap="8">
				<Text
					style={{
						fontFamily: family,
						fontSize: 28,
						fontWeight: typeface.weight,
						lineHeight: 1.18,
					}}
				>
					{PANGRAM}
				</Text>
				<Text
					color="fg.secondary"
					style={{fontFamily: family, fontSize: 14, lineHeight: 1.45}}
				>
					{ALPHABET}
				</Text>
				<Text
					color="fg.secondary"
					style={{fontFamily: family, fontSize: 14, lineHeight: 1.45}}
				>
					{LOWERCASE} {NUMERALS}
				</Text>
			</Box>
			<Box
				alignItems="center"
				className={styles.typefaceAction}
				display="flex"
				justifyContent="end"
			>
				<Button
					appearance={typeface.inUse ? "default" : "subtle"}
					onClick={() => {
						if (!typeface.inUse) onAddToPack(typeface);
					}}
					size="sm"
				>
					{typeface.inUse ? "In use" : "Add to pack"}
				</Button>
			</Box>
		</Box>
	);
}

function TypographyRuleRow({
	onEditRole,
	rule,
}: {
	onEditRole: () => void;
	rule: BrandTypographyRule;
}) {
	const family = `"${rule.font_family}", ${rule.usage === "mono" ? "monospace" : "Inter, sans-serif"}`;
	const metadata = [
		{label: "Weight", value: rule.weight},
		{label: "Case", value: rule.case_rule ? `${rule.case_rule} case` : null},
		{label: "Align", value: rule.alignment ? `${rule.alignment} aligned` : null},
		{label: "Source", value: rule.source ? `${rule.source} source` : null},
	];

	return (
		<Box
			alignItems="center"
			bg="bg.default"
			borderB="1"
			borderColor="border.tertiary"
			className={styles.hierarchyRow}
			display="grid"
			gap="24"
			p="16"
		>
			<Box display="flex" flexDirection="column" gap="6">
				<SpecimenBadge intent={rule.usage === "heading" ? "success" : "neutral"}>
					{USAGE_LABELS[rule.usage]}
				</SpecimenBadge>
				<Text color="fg.secondary" style={{fontSize: 12, lineHeight: 1.35}}>
					{rule.confidence} confidence
				</Text>
			</Box>
			<Box className={styles.typefacePreview} display="flex" flexDirection="column" gap="8">
				<Text fontWeight="700" style={{fontFamily: family, fontSize: 20, lineHeight: 1.18}}>
					{rule.font_family}
				</Text>
				<Text
					style={{
						fontFamily: family,
						fontSize: 20,
						fontWeight: rule.weight.toLowerCase().includes("bold") ? 700 : 400,
						lineHeight: 1.22,
					}}
				>
					The quick brown fox jumps over the lazy dog.
				</Text>
				<Text color="fg.secondary" style={{fontSize: 14, lineHeight: 1.45}}>
					{rule.notes}
				</Text>
				{rule.colour_application && rule.colour_application.length > 0 && (
					<Box display="flex" gap="6" style={{flexWrap: "wrap"}}>
						{rule.colour_application.map((color) => (
							<SpecimenBadge key={color}>{color}</SpecimenBadge>
						))}
					</Box>
				)}
			</Box>
			<AttributeGrid items={metadata} />
			<Box
				alignItems="center"
				className={styles.typefaceAction}
				display="flex"
				justifyContent="end"
			>
				<Button appearance="subtle" onClick={onEditRole} size="sm">
					Edit role
				</Button>
			</Box>
		</Box>
	);
}

function TypeHierarchySection({
	onEditRole,
	rules,
}: {
	onEditRole: () => void;
	rules: BrandTypographyRule[];
}) {
	return (
		<Box display="flex" flexDirection="column" gap="12">
			<Box
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				style={{flexWrap: "wrap", gap: 12}}
			>
				<Box display="flex" flexDirection="column" gap="4">
					<Text fontWeight="600" style={{fontSize: 18}}>
						Type hierarchy
					</Text>
					<Text color="fg.secondary" fontSize="sm">
						Role-level rules used by generation, templates, and brand checks.
					</Text>
				</Box>
				<Badge intent="neutral" variant="subtle">
					{rules.length} roles
				</Badge>
			</Box>
			<Box
				border="1"
				borderColor="border.tertiary"
				display="flex"
				flexDirection="column"
				overflow="hidden"
				rounded="xl"
				shadow="sm"
			>
				{rules.map((rule) => (
					<TypographyRuleRow
						key={`${rule.usage}-${rule.font_family}-${rule.weight}`}
						onEditRole={onEditRole}
						rule={rule}
					/>
				))}
			</Box>
		</Box>
	);
}

export function TypographyTab({pack}: TypographyTabProps) {
	const [addTypefaceOpen, setAddTypefaceOpen] = useState(false);
	const [category, setCategory] = useState("all");
	const [manageTypeSystemOpen, setManageTypeSystemOpen] = useState(false);
	const [saved, setSaved] = useState(false);
	const [typefaces, setTypefaces] = useState(FONT_LIBRARY);
	const typographySummary = getBrandTypographySummary(pack);
	const typographyRules = getBrandTypographyRules(pack);
	const primaryTypeface =
		typefaces.find((font) => font.family === typographySummary.heading) ??
		typefaces.find((font) => font.inUse) ??
		typefaces[0];
	const filtered =
		category === "all" ? typefaces : typefaces.filter((font) => font.category === category);

	const addToPack = (typeface: Typeface) => {
		setTypefaces((current) =>
			current.map((font) => (font.family === typeface.family ? {...font, inUse: true} : font))
		);
	};

	const addTypeface = (typeface: AddedTypefacePayload) => {
		setTypefaces((current) => {
			const nextTypeface: Typeface = {
				category: typeface.category,
				family: typeface.family,
				inUse: true,
				meta: typeface.meta,
				role: typeface.role,
				source: typeface.source,
				styles: typeface.styles,
				weight: typeface.weight,
			};
			const existing = current.find((font) => font.family === typeface.family);
			if (existing) {
				return current.map((font) =>
					font.family === typeface.family ? {...font, ...nextTypeface} : font
				);
			}
			return [nextTypeface, ...current];
		});
	};

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

			<TypeHierarchySection
				onEditRole={() => setManageTypeSystemOpen(true)}
				rules={typographyRules}
			/>

			<Box
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				style={{flexWrap: "wrap", gap: 12}}
			>
				<Box display="flex" flexDirection="column" gap="4">
					<Text fontWeight="600" style={{fontSize: 18}}>
						All typefaces
					</Text>
					<Text color="fg.secondary" fontSize="sm">
						Showing {filtered.length} of {typefaces.length} available typefaces
					</Text>
				</Box>
				<Box alignItems="center" display="flex" gap="8">
					<Select
						value={category}
						onValueChange={setCategory}
						options={CATEGORY_OPTIONS}
					/>
					<Box style={{width: 240}}>
						<SearchInput
							aria-label="Search typefaces"
							placeholder="Search typefaces..."
						/>
					</Box>
				</Box>
			</Box>

			<Box
				border="1"
				borderColor="border.tertiary"
				display="flex"
				flexDirection="column"
				overflow="hidden"
				rounded="xl"
				shadow="sm"
			>
				{filtered.map((typeface) => (
					<TypefaceRow
						key={typeface.family}
						onAddToPack={addToPack}
						typeface={typeface}
					/>
				))}
			</Box>
			<AddTypefaceDialog
				open={addTypefaceOpen}
				onAddTypeface={addTypeface}
				onOpenChange={setAddTypefaceOpen}
			/>
			<ManageTypeSystemDialog
				fonts={typefaces}
				onOpenChange={setManageTypeSystemOpen}
				onSave={save}
				open={manageTypeSystemOpen}
			/>
		</Box>
	);
}
