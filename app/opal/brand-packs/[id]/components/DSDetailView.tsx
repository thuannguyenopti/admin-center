"use client";

import { useEffect, useState } from "react";
import { Box, Button, Text } from "@optiaxiom/react";
import { IconAngleDown, IconAngleRight, IconArrowLeft } from "@optiaxiom/icons";
import { useLayout } from "@/app/context/LayoutContext";
import { EditablePanel } from "./EditablePanel";
import styles from "../BrandPackDetailPage.module.css";

// ── Section type ──────────────────────────────────────────────────────────────

type DSSection =
	| "overview"
	| "tokens-colours"
	| "tokens-spacing"
	| "tokens-radius"
	| "tokens-shadows"
	| "blueprints"
	| "instructions";

// ── Token data ────────────────────────────────────────────────────────────────

const DS_TOKEN_COLORS = [
	{ name: "--color-primary", value: "#C1F15A", label: "Primary (Lime)" },
	{ name: "--color-primary-dk", value: "#0F1810", label: "Primary Dark" },
	{ name: "--color-bg", value: "#F4F5F0", label: "Background" },
	{ name: "--color-surface", value: "#FFFFFF", label: "Surface" },
	{ name: "--color-text-1", value: "#1A1A1A", label: "Text Primary" },
	{ name: "--color-text-2", value: "#6B7280", label: "Text Secondary" },
	{ name: "--color-border", value: "#E5E7EB", label: "Border" },
	{ name: "--color-success", value: "#16A34A", label: "Success" },
	{ name: "--color-warning", value: "#D97706", label: "Warning" },
	{ name: "--color-danger", value: "#DC2626", label: "Danger" },
];

const DS_TOKEN_SPACING = [4, 8, 12, 16, 24, 32, 48, 64, 96];

const DS_TOKEN_RADIUS = [
	{ token: "--radius-sm", value: "4px" },
	{ token: "--radius-md", value: "8px" },
	{ token: "--radius-lg", value: "12px" },
	{ token: "--radius-xl", value: "16px" },
	{ token: "--radius-full", value: "9999px" },
];

const DS_SHADOWS = [
	{ label: "SM", token: "--shadow-sm", css: "0 1px 2px rgba(0,0,0,0.06)" },
	{ label: "MD", token: "--shadow-md", css: "0 2px 8px rgba(0,0,0,0.10)" },
	{ label: "LG", token: "--shadow-lg", css: "0 4px 16px rgba(0,0,0,0.12)" },
	{ label: "XL", token: "--shadow-xl", css: "0 8px 32px rgba(0,0,0,0.16)" },
];

const BLUEPRINT_DEFS = [
	{ id: "hero-cards", label: "Hero + Cards" },
	{ id: "two-col", label: "Two-column" },
	{ id: "dashboard", label: "Dashboard Grid" },
	{ id: "marketing", label: "Marketing Page" },
	{ id: "detail", label: "Detail View" },
	{ id: "form", label: "Form Layout" },
];

const DS_INSTRUCTIONS = [
	{
		title: "Do's and Don'ts",
		defaultContent:
			"✓ Use primary buttons only once per viewport.\n✓ Always pair inputs with visible labels.\n✓ Reference design tokens for all colour and spacing values.\n\n✕ Don't nest cards inside cards.\n✕ Don't use placeholder text as a label substitute.\n✕ Don't override component border-radius values directly.",
	},
	{
		title: "Accessibility",
		defaultContent:
			"All interactive elements must meet a minimum contrast ratio of 4.5:1 (WCAG 2.1 AA).\nProvide keyboard navigation for all interactive components.\nEnsure focus indicators are visible and meet contrast requirements.\nUse semantic HTML elements — headings, lists, buttons, and landmarks.",
	},
	{
		title: "Heading Hierarchy",
		defaultContent:
			"Each page should have exactly one H1 — the primary page title.\nH2 for major sections. H3 for sub-sections within an H2.\nDo not skip heading levels (e.g., H1 → H3).\nAvoid using heading elements for styling — use CSS classes instead.",
	},
];

// ── Accordion nav ─────────────────────────────────────────────────────────────

type NavState = {
	activeSection: DSSection;
	blueprintsOpen: boolean;
	onBack: () => void;
	onSelect: (s: DSSection) => void;
	onToggleBlueprints: () => void;
	onToggleTokens: () => void;
	packName: string;
	tokensOpen: boolean;
};

function DSNavItem({
	compact = false,
	expandable = false,
	expanded = false,
	label,
	onClick,
	selected,
}: {
	compact?: boolean;
	expandable?: boolean;
	expanded?: boolean;
	label: string;
	onClick: () => void;
	selected: boolean;
}) {
	return (
		<Box
			asChild
			className={
				selected
					? `${styles.sectionNavItem} ${styles.sectionNavItemSelected}`
					: styles.sectionNavItem
			}
			style={compact ? { minHeight: 30, padding: "4px 10px" } : undefined}
		>
			<button
				aria-current={selected ? "page" : undefined}
				type="button"
				onClick={onClick}
			>
				<span className={styles.sectionNavItemTitle}>
					<span
						className={
							selected
								? `${styles.sectionNavItemLabel} ${styles.sectionNavItemLabelSelected}`
								: styles.sectionNavItemLabel
						}
						style={compact ? { fontSize: 12 } : undefined}
					>
						{label}
					</span>
					{expandable && (
						<span className={styles.sectionNavChevron}>
							{expanded ? <IconAngleDown size={12} /> : <IconAngleRight size={12} />}
						</span>
					)}
				</span>
			</button>
		</Box>
	);
}

function DSNav({
	activeSection,
	blueprintsOpen,
	onBack,
	onSelect,
	onToggleBlueprints,
	onToggleTokens,
	packName,
	tokensOpen,
}: NavState) {
	const isTokens = activeSection.startsWith("tokens-");

	return (
		<Box className={styles.sectionNavPanel} display="flex" flexDirection="column">
			<Box className={styles.sectionNavHeader}>
				<Button
					appearance="subtle"
					icon={<IconArrowLeft />}
					onClick={onBack}
					size="sm"
					style={{ marginLeft: -6 }}
				>
					{packName}
				</Button>
			</Box>
			<Box display="flex" flexDirection="column" gap="2">
				<DSNavItem
					label="Overview"
					selected={activeSection === "overview"}
					onClick={() => onSelect("overview")}
				/>

				<DSNavItem
					label="Design Tokens"
					selected={false}
					expandable
					expanded={tokensOpen}
					onClick={() => {
						onToggleTokens();
						if (!isTokens) onSelect("tokens-colours");
					}}
				/>
				{tokensOpen && (
					<Box display="flex" flexDirection="column" style={{ display: "flex", flexDirection: "column", paddingLeft: 14 }}>
						{(
							[
								{ id: "tokens-colours" as DSSection, label: "Colours" },
								{ id: "tokens-spacing" as DSSection, label: "Spacing" },
								{ id: "tokens-radius" as DSSection, label: "Border Radius" },
								{ id: "tokens-shadows" as DSSection, label: "Box Shadows" },
							] as const
						).map((item) => (
							<DSNavItem
								key={item.id}
								compact
								label={item.label}
								selected={activeSection === item.id}
								onClick={() => onSelect(item.id)}
							/>
						))}
					</Box>
				)}

				<DSNavItem
					label="Components"
					selected={false}
					expandable
					expanded={false}
					onClick={() => {}}
				/>

				<DSNavItem
					label="Blueprints"
					selected={false}
					expandable
					expanded={blueprintsOpen}
					onClick={() => {
						onToggleBlueprints();
						if (!blueprintsOpen) onSelect("blueprints");
					}}
				/>
				{blueprintsOpen && (
					<Box display="flex" flexDirection="column" style={{ display: "flex", flexDirection: "column", paddingLeft: 14 }}>
						{BLUEPRINT_DEFS.map((bp) => (
							<DSNavItem
								key={bp.id}
								compact
								label={bp.label}
								selected={false}
								onClick={() => onSelect("blueprints")}
							/>
						))}
					</Box>
				)}

				<DSNavItem
					label="Instructions"
					selected={activeSection === "instructions"}
					onClick={() => onSelect("instructions")}
				/>
			</Box>
		</Box>
	);
}

// ── Content panels ────────────────────────────────────────────────────────────

function SectionTitle({ subtitle, title }: { subtitle: string; title: string }) {
	return (
		<Box mb="24" style={{ flexShrink: 0 }}>
			<Text fontWeight="700" style={{ color: "var(--ax-colors-fg-default)", fontSize: 20, marginBottom: 4 }}>
				{title}
			</Text>
			<Text color="fg.secondary" style={{ fontSize: 14 }}>{subtitle}</Text>
		</Box>
	);
}

function ColourTokensPanel() {
	return (
		<Box style={{ flex: 1, overflowY: "auto", padding: "28px 40px", scrollbarWidth: "none" }}>
			<SectionTitle title="Colour Tokens" subtitle="Brand palette and semantic colour assignments." />
			<Box display="grid" gap="12" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))" }}>
				{DS_TOKEN_COLORS.map((c) => (
					<Box key={c.name} rounded="xl" style={{ border: "1px solid var(--ax-colors-border-secondary)", overflow: "hidden" }}>
						<Box style={{ background: c.value, height: 68 }} />
						<Box style={{ padding: "10px 14px" }}>
							<Text fontWeight="600" style={{ color: "var(--ax-colors-fg-default)", fontSize: 13 }}>{c.label}</Text>
							<Text style={{ color: "var(--ax-colors-fg-tertiary)", fontFamily: "monospace", fontSize: 11, marginTop: 2 }}>{c.value}</Text>
							<Text style={{ color: "var(--ax-colors-fg-tertiary)", fontFamily: "monospace", fontSize: 10 }}>{c.name}</Text>
						</Box>
					</Box>
				))}
			</Box>
		</Box>
	);
}

function SpacingPanel() {
	return (
		<Box style={{ flex: 1, overflowY: "auto", padding: "28px 40px", scrollbarWidth: "none" }}>
			<SectionTitle title="Spacing Tokens" subtitle="Scale for margins, padding, and gaps." />
			<Box display="flex" flexDirection="column" gap="2">
				{DS_TOKEN_SPACING.map((px) => (
					<Box
						key={px}
						alignItems="center"
						display="flex"
						gap="16"
						style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", padding: "10px 0" }}
					>
						<Box
							style={{
								background: "var(--ax-colors-bg-accent)",
								borderRadius: 3,
								flexShrink: 0,
								height: Math.min(px, 28),
								width: Math.min(px * 1.5, 96),
							}}
						/>
						<Text fontWeight="600" style={{ color: "var(--ax-colors-fg-default)", fontSize: 13, width: 36 }}>{px}px</Text>
						<Text style={{ color: "var(--ax-colors-fg-tertiary)", fontFamily: "monospace", fontSize: 11 }}>
							--spacing-{px}
						</Text>
					</Box>
				))}
			</Box>
		</Box>
	);
}

function RadiusPanel() {
	return (
		<Box style={{ flex: 1, overflowY: "auto", padding: "28px 40px", scrollbarWidth: "none" }}>
			<SectionTitle title="Border Radius" subtitle="Radius values for components and containers." />
			<Box display="flex" flexDirection="column" gap="12" mb="40">
				{DS_TOKEN_RADIUS.map((r) => (
					<Box
						key={r.token}
						alignItems="center"
						display="flex"
						gap="20"
						style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", padding: "12px 0" }}
					>
						<Box
							style={{
								background: "var(--ax-colors-bg-secondary)",
								border: "2px solid var(--ax-colors-border-default)",
								borderRadius: r.token === "--radius-full" ? 9999 : r.value,
								flexShrink: 0,
								height: 44,
								width: 72,
							}}
						/>
						<Box>
							<Text fontWeight="600" style={{ color: "var(--ax-colors-fg-default)", fontSize: 13 }}>{r.value}</Text>
							<Text style={{ color: "var(--ax-colors-fg-tertiary)", fontFamily: "monospace", fontSize: 11, marginTop: 2 }}>{r.token}</Text>
						</Box>
					</Box>
				))}
			</Box>
			<Text fontWeight="600" style={{ color: "var(--ax-colors-fg-default)", fontSize: 16, marginBottom: 20 }}>Box Shadows</Text>
			<Box display="flex" flexDirection="column" gap="20">
				{DS_SHADOWS.map((s) => (
					<Box key={s.token} alignItems="center" display="flex" gap="24">
						<Box bg="bg.default" rounded="lg" style={{ boxShadow: s.css, flexShrink: 0, height: 60, width: 88 }} />
						<Box>
							<Text fontWeight="600" style={{ color: "var(--ax-colors-fg-default)", fontSize: 13 }}>Shadow {s.label}</Text>
							<Text style={{ color: "var(--ax-colors-fg-tertiary)", fontFamily: "monospace", fontSize: 11, marginTop: 2 }}>{s.token}</Text>
							<Text style={{ color: "var(--ax-colors-fg-tertiary)", fontSize: 11, marginTop: 2 }}>{s.css}</Text>
						</Box>
					</Box>
				))}
			</Box>
		</Box>
	);
}

function ShadowsPanel() {
	return (
		<Box style={{ flex: 1, overflowY: "auto", padding: "28px 40px", scrollbarWidth: "none" }}>
			<SectionTitle title="Box Shadows" subtitle="Elevation tokens for depth and layering." />
			<Box display="flex" flexDirection="column" gap="20">
				{DS_SHADOWS.map((s) => (
					<Box key={s.token} alignItems="center" display="flex" gap="24">
						<Box bg="bg.default" rounded="lg" style={{ boxShadow: s.css, flexShrink: 0, height: 60, width: 88 }} />
						<Box>
							<Text fontWeight="600" style={{ color: "var(--ax-colors-fg-default)", fontSize: 13 }}>Shadow {s.label}</Text>
							<Text style={{ color: "var(--ax-colors-fg-tertiary)", fontFamily: "monospace", fontSize: 11, marginTop: 2 }}>{s.token}</Text>
							<Text style={{ color: "var(--ax-colors-fg-tertiary)", fontSize: 11, marginTop: 2 }}>{s.css}</Text>
						</Box>
					</Box>
				))}
			</Box>
		</Box>
	);
}

function InstructionsPanel() {
	return (
		<Box style={{ flex: 1, overflowY: "auto", padding: "28px 40px", scrollbarWidth: "none" }}>
			<Box alignItems="center" display="flex" justifyContent="space-between" mb="24" style={{ flexShrink: 0 }}>
				<Box>
					<Text fontWeight="700" style={{ color: "var(--ax-colors-fg-default)", fontSize: 20, marginBottom: 4 }}>
						Instructions
					</Text>
					<Text color="fg.secondary" style={{ fontSize: 14 }}>Design guidelines — edit manually or with Opal.</Text>
				</Box>
				<Button appearance="subtle" size="md">
					<Box asChild alignItems="center" display="inline-flex" gap="8">
						<span>
							<img alt="" height={14} src="/opal-icon-nav.png" style={{ display: "block", flexShrink: 0 }} width={14} />
							Edit with Opal
						</span>
					</Box>
				</Button>
			</Box>
			<Box display="flex" flexDirection="column" gap="16">
				{DS_INSTRUCTIONS.map((p) => (
					<EditablePanel key={p.title} defaultContent={p.defaultContent} title={p.title} />
				))}
			</Box>
		</Box>
	);
}

// ── Overview 2×2 card grid ────────────────────────────────────────────────────

function TokensVisual() {
	const swatches = [
		["#1e3a8a", "#1d4ed8", "#3b82f6", "#93c5fd", "#dbeafe"],
		["#5b21b6", "#7c3aed", "#a78bfa", "#c4b5fd", "#ede9fe"],
		["#064e3b", "#065f46", "#10b981", "#6ee7b7", "#d1fae5"],
		["#78350f", "#92400e", "#f59e0b", "#fcd34d", "#fef3c7"],
	];
	return (
		<Box alignItems="center" display="flex" flexDirection="column" gap="6">
			{swatches.map((row, ri) => (
				<Box key={ri} display="flex" gap="4">
					{row.map((color, ci) => (
						<Box key={ci} style={{ background: color, borderRadius: 5, flexShrink: 0, height: 22, width: 22 }} />
					))}
				</Box>
			))}
		</Box>
	);
}

function ComponentsVisual() {
	return (
		<Box alignItems="center" display="flex" flexDirection="column" gap="12">
			<Box alignItems="center" display="flex" gap="8">
				<Box style={{ alignItems: "center", background: "var(--ax-colors-bg-primary)", borderRadius: 7, color: "var(--ax-colors-fg-accent, #fff)", display: "flex", fontSize: 12, fontWeight: 600, height: 30, justifyContent: "center", padding: "0 14px" }}>
					Primary
				</Box>
				<Box style={{ alignItems: "center", background: "transparent", border: "1px solid var(--ax-colors-border-secondary)", borderRadius: 7, color: "var(--ax-colors-fg-default)", display: "flex", fontSize: 12, height: 30, justifyContent: "center", padding: "0 14px" }}>
					Default
				</Box>
				<Box style={{ alignItems: "center", background: "transparent", borderRadius: 7, color: "var(--ax-colors-fg-secondary)", display: "flex", fontSize: 12, height: 30, justifyContent: "center", padding: "0 10px" }}>
					Subtle
				</Box>
			</Box>
			<Box alignItems="center" display="flex" gap="6">
				{(
					[["Active", "#d1fae5", "#065f46"], ["Beta", "#fef3c7", "#92400e"], ["Error", "#fee2e2", "#991b1b"], ["Info", "#dbeafe", "#1e40af"]] as [string, string, string][]
				).map(([label, bg, color]) => (
					<Box key={label} style={{ background: bg, borderRadius: 12, color, fontSize: 10, fontWeight: 700, padding: "2px 8px" }}>
						{label}
					</Box>
				))}
			</Box>
			<Box style={{ alignItems: "center", background: "var(--ax-colors-bg-secondary)", border: "1px solid var(--ax-colors-border-secondary)", borderRadius: 7, color: "var(--ax-colors-fg-secondary)", display: "flex", fontSize: 12, justifyContent: "space-between", padding: "7px 12px", width: 200 }}>
				<span>Search…</span>
				<span style={{ color: "var(--ax-colors-fg-tertiary)", fontSize: 10 }}>⌘K</span>
			</Box>
		</Box>
	);
}

function BlueprintsVisual() {
	const cols = [
		[
			{ h: 18, w: "100%" },
			{ h: 40, w: "48%" },
			{ h: 40, w: "48%" },
		],
		[
			{ h: 18, w: "100%" },
			{ h: 64, w: "100%" },
		],
		[
			{ h: 14, w: "60%" },
			{ h: 14, w: "60%" },
			{ h: 40, w: "100%" },
		],
	];
	return (
		<Box alignItems="center" display="flex" gap="12" justifyContent="center">
			{cols.map((blocks, bi) => (
				<Box
					key={bi}
					display="flex"
					flexDirection="column"
					gap="4"
					style={{ background: "var(--ax-colors-bg-default)", border: "1px solid var(--ax-colors-border-secondary)", borderRadius: 6, padding: 8, width: 76 }}
				>
					{blocks.map((block, bk) => (
						<Box
							key={bk}
							style={{
								background: "var(--ax-colors-bg-accent-subtle, #e8f5d4)",
								borderRadius: 3,
								height: block.h,
								width: block.w,
							}}
						/>
					))}
				</Box>
			))}
		</Box>
	);
}

function InstructionsVisual() {
	const rows = [
		{ h: 7, opacity: 0.18, w: "100%" },
		{ h: 5, opacity: 0.11, w: "72%" },
		{ h: 5, opacity: 0.1, w: "88%" },
		{ h: 7, opacity: 0.18, w: "100%" },
		{ h: 5, opacity: 0.11, w: "65%" },
		{ h: 5, opacity: 0.1, w: "80%" },
	];
	return (
		<Box display="flex" flexDirection="column" gap="6" style={{ width: 200 }}>
			{rows.map((row, i) => (
				<Box key={i} style={{ background: "var(--ax-colors-fg-default)", borderRadius: 3, height: row.h, opacity: row.opacity, width: row.w }} />
			))}
		</Box>
	);
}

function OverviewCard({
	description,
	onClick,
	stats,
	title,
	visual,
}: {
	description: string;
	onClick: () => void;
	stats: string;
	title: string;
	visual: React.ReactNode;
}) {
	return (
		<Box
			asChild
			rounded="xl"
			style={{
				border: "1px solid var(--ax-colors-border-secondary)",
				cursor: "pointer",
				display: "block",
				overflow: "hidden",
				textAlign: "left",
				transition: "border-color 0.15s, box-shadow 0.15s",
			}}
		>
			<button
				type="button"
				onClick={onClick}
				onMouseEnter={(e) => {
					e.currentTarget.style.borderColor = "var(--ax-colors-border-default)";
					e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.borderColor = "var(--ax-colors-border-secondary)";
					e.currentTarget.style.boxShadow = "none";
				}}
			>
				<Box
					alignItems="center"
					bg="bg.secondary"
					display="flex"
					justifyContent="center"
					overflow="hidden"
					style={{ borderBottom: "1px solid var(--ax-colors-border-secondary)", height: 150 }}
				>
					{visual}
				</Box>
				<Box style={{ padding: "14px 18px" }}>
					<Box alignItems="center" display="flex" justifyContent="space-between" style={{ marginBottom: 4 }}>
						<Text style={{ color: "var(--ax-colors-fg-default)", fontSize: 15, fontWeight: 700 }}>{title}</Text>
						<Text style={{ color: "var(--ax-colors-fg-tertiary)", fontSize: 12 }}>{stats}</Text>
					</Box>
					<Text style={{ color: "var(--ax-colors-fg-secondary)", fontSize: 13, lineHeight: 1.4 }}>{description}</Text>
				</Box>
			</button>
		</Box>
	);
}

function OverviewPanel({
	packName,
	onGoToBlueprints,
	onGoToComponents,
	onGoToInstructions,
	onGoToTokens,
}: {
	packName: string;
	onGoToBlueprints: () => void;
	onGoToComponents: () => void;
	onGoToInstructions: () => void;
	onGoToTokens: () => void;
}) {
	return (
		<Box style={{ flex: 1, overflowY: "auto", padding: "32px 40px 60px", scrollbarWidth: "none" }}>
			<Box mb="8">
				<Text fontWeight="700" style={{ color: "var(--ax-colors-fg-default)", fontSize: 28, lineHeight: 1.15 }}>
					Design System
				</Text>
				<Text color="fg.secondary" style={{ fontSize: 14, marginTop: 4 }}>
					{packName} Design System
				</Text>
			</Box>
			<Box mb="32" style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", paddingBottom: 24 }} />

			<Text color="fg.secondary" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 32, maxWidth: 560 }}>
				Tokens, components, layout blueprints, and brand instructions — everything your team needs to build consistently with {packName}.
			</Text>

			<Box display="grid" gap="20" style={{ gridTemplateColumns: "1fr 1fr" }}>
				<OverviewCard
					title="Design Tokens"
					description="Brand palette, spacing scale, border radius, and box shadows"
					stats="4 categories"
					visual={<TokensVisual />}
					onClick={onGoToTokens}
				/>
				<OverviewCard
					title="Components"
					description="Reusable UI building blocks with variants and Opal instructions"
					stats="30 components · 7 groups"
					visual={<ComponentsVisual />}
					onClick={onGoToComponents}
				/>
				<OverviewCard
					title="Blueprints"
					description="Approved full-page layout patterns for common content types"
					stats={`${BLUEPRINT_DEFS.length} layouts`}
					visual={<BlueprintsVisual />}
					onClick={onGoToBlueprints}
				/>
				<OverviewCard
					title="Instructions"
					description="Do's and don'ts, accessibility rules, brand voice and tone"
					stats="Guidelines"
					visual={<InstructionsVisual />}
					onClick={onGoToInstructions}
				/>
			</Box>
		</Box>
	);
}

// ── Main view ─────────────────────────────────────────────────────────────────

type Props = {
	onBack: () => void;
	packName: string;
};

export function DSDetailView({ onBack, packName }: Props) {
	const { setSubNavContent } = useLayout();
	const [section, setSection] = useState<DSSection>("overview");
	const [tokensOpen, setTokensOpen] = useState(false);
	const [blueprintsOpen, setBlueprintsOpen] = useState(false);

	useEffect(() => {
		setSubNavContent(
			<DSNav
				activeSection={section}
				blueprintsOpen={blueprintsOpen}
				onBack={onBack}
				onSelect={setSection}
				onToggleBlueprints={() => setBlueprintsOpen((v) => !v)}
				onToggleTokens={() => setTokensOpen((v) => !v)}
				packName={packName}
				tokensOpen={tokensOpen}
			/>
		);
	}, [section, tokensOpen, blueprintsOpen, onBack, packName, setSubNavContent]);

	// Restore null on unmount so page.tsx can re-inject the brand-pack nav
	useEffect(() => {
		return () => {
			setSubNavContent(null);
		};
	}, [setSubNavContent]);

	return (
		<Box display="flex" flexDirection="column" style={{ height: "100%", overflow: "hidden" }}>
			{section === "overview" && (
				<OverviewPanel
					packName={packName}
					onGoToBlueprints={() => {
						setBlueprintsOpen(true);
						setSection("blueprints");
					}}
					onGoToComponents={() => {}}
					onGoToInstructions={() => setSection("instructions")}
					onGoToTokens={() => {
						setTokensOpen(true);
						setSection("tokens-colours");
					}}
				/>
			)}
			{section === "tokens-colours" && <ColourTokensPanel />}
			{section === "tokens-spacing" && <SpacingPanel />}
			{section === "tokens-radius" && <RadiusPanel />}
			{section === "tokens-shadows" && <ShadowsPanel />}
			{section === "blueprints" && (
				<Box style={{ flex: 1, overflowY: "auto", padding: "28px 40px", scrollbarWidth: "none" }}>
					<SectionTitle title="Blueprints" subtitle="Approved layout patterns for common page types." />
					<Box display="grid" gap="12" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))" }}>
						{BLUEPRINT_DEFS.map((bp) => (
							<Box
								key={bp.id}
								rounded="xl"
								style={{ border: "1px solid var(--ax-colors-border-tertiary)", overflow: "hidden" }}
							>
								<Box alignItems="center" bg="bg.secondary" display="flex" justifyContent="center" style={{ height: 120 }}>
									<BlueprintsVisual />
								</Box>
								<Box style={{ padding: "10px 14px" }}>
									<Text fontWeight="600" style={{ fontSize: 13 }}>{bp.label}</Text>
								</Box>
							</Box>
						))}
					</Box>
				</Box>
			)}
			{section === "instructions" && <InstructionsPanel />}
		</Box>
	);
}
