"use client";

import { useState } from "react";
import { Box, Button, Text } from "@optiaxiom/react";
import { EditablePanel } from "./EditablePanel";

// ── Token data (generic reference design system, not tied to a specific brand) ──

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

const DS_TOKEN_TYPE = [
	{ token: "--font-display", size: "32px", weight: "700", sample: "Display heading" },
	{ token: "--font-h1", size: "28px", weight: "700", sample: "Page title" },
	{ token: "--font-h2", size: "24px", weight: "600", sample: "Section heading" },
	{ token: "--font-h3", size: "20px", weight: "600", sample: "Sub-heading" },
	{ token: "--font-body-lg", size: "18px", weight: "400", sample: "Large body text" },
	{ token: "--font-body", size: "16px", weight: "400", sample: "Default body text" },
	{ token: "--font-sm", size: "14px", weight: "400", sample: "Small / caption" },
	{ token: "--font-label", size: "13px", weight: "500", sample: "Label" },
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

// ── Sub-tab IDs ───────────────────────────────────────────────────────────────

type DSTab = "colors" | "type" | "spacing" | "radius" | "instructions";

const DS_TABS: Array<{ id: DSTab; label: string }> = [
	{ id: "colors", label: "Colors" },
	{ id: "type", label: "Type Scale" },
	{ id: "spacing", label: "Spacing" },
	{ id: "radius", label: "Radius & Shadows" },
	{ id: "instructions", label: "Instructions" },
];

// ── Section heading ───────────────────────────────────────────────────────────

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

// ── Tab panels ────────────────────────────────────────────────────────────────

function ColorsPanel() {
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

function TypePanel() {
	return (
		<Box style={{ flex: 1, overflowY: "auto", padding: "28px 40px", scrollbarWidth: "none" }}>
			<SectionTitle title="Type Scale" subtitle="Typography tokens for headings, body, and labels." />
			<Box display="flex" flexDirection="column">
				{DS_TOKEN_TYPE.map((t) => (
					<Box
						key={t.token}
						alignItems="center"
						display="flex"
						gap="24"
						style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", padding: "16px 0" }}
					>
						<Box style={{ flexShrink: 0, minWidth: 200 }}>
							<Text
								style={{
									color: "var(--ax-colors-fg-default)",
									fontSize: parseInt(t.size),
									fontWeight: parseInt(t.weight),
									lineHeight: 1.2,
								}}
							>
								{t.sample}
							</Text>
						</Box>
						<Box display="flex" flexDirection="column" gap="2">
							<Text fontWeight="500" style={{ color: "var(--ax-colors-fg-default)", fontSize: 13 }}>
								{t.size} / {t.weight}
							</Text>
							<Text style={{ color: "var(--ax-colors-fg-tertiary)", fontFamily: "monospace", fontSize: 11 }}>
								{t.token}
							</Text>
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
						<Box
							bg="bg.default"
							rounded="lg"
							style={{ boxShadow: s.css, flexShrink: 0, height: 60, width: 88 }}
						/>
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

// ── Main view ─────────────────────────────────────────────────────────────────

export function DSView() {
	const [activeTab, setActiveTab] = useState<DSTab>("colors");

	return (
		<Box display="flex" flexDirection="column" style={{ height: "100%", overflow: "hidden" }}>
			{/* Sub-tab bar */}
			<Box
				display="flex"
				style={{
					borderBottom: "1px solid var(--ax-colors-border-secondary)",
					flexShrink: 0,
					gap: 2,
					padding: "0 32px",
				}}
			>
				{DS_TABS.map((tab) => {
					const active = activeTab === tab.id;
					return (
						<button
							key={tab.id}
							type="button"
							onClick={() => setActiveTab(tab.id)}
							style={{
								background: "transparent",
								border: "none",
								borderBottom: active ? "2px solid var(--ax-colors-fg-default)" : "2px solid transparent",
								color: active ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)",
								cursor: "pointer",
								fontSize: 13,
								fontWeight: active ? 600 : 400,
								marginBottom: -1,
								padding: "12px 14px",
								transition: "color 0.12s",
								whiteSpace: "nowrap",
							}}
						>
							{tab.label}
						</button>
					);
				})}
			</Box>

			{/* Content */}
			<Box style={{ flex: 1, overflow: "hidden" }}>
				{activeTab === "colors" && <ColorsPanel />}
				{activeTab === "type" && <TypePanel />}
				{activeTab === "spacing" && <SpacingPanel />}
				{activeTab === "radius" && <RadiusPanel />}
				{activeTab === "instructions" && <InstructionsPanel />}
			</Box>
		</Box>
	);
}
