"use client";

import type { CSSProperties, ReactNode } from "react";
import {
	Alert,
	Badge,
	Box,
	Button,
	Checkbox,
	Input,
	Link,
	Radio,
	RadioGroup,
	Select,
	SelectContent,
	SelectTrigger,
	Spinner,
	Switch,
	Text,
	Textarea,
} from "@optiaxiom/react";
import { IconGear } from "@optiaxiom/icons";
import type { BrandPack } from "../../types";
import { contrastRatio, getReadableTextColor, READABLE_DARK, READABLE_LIGHT } from "./DSDetailView";

// ── Brand-driven style derivation ───────────────────────────────────────────

type BrandStyle = {
	accentHex: string;
	bodyFont: string;
	headingFont: string;
	primaryHex: string;
	radius: number;
	radiusSm: number;
	secondaryHex: string;
	// primaryHex nudged darker only if needed so a solid fill always has a
	// legible white-or-black overlay (see ensureSolidBackgroundContrast) —
	// use this, not primaryHex, for any solid background carrying text/icons.
	solidPrimaryHex: string;
};

// Corner-radius language derived from each brand's own visual character — the
// one shape cue their real identity gives us beyond color and type.
const BRAND_RADIUS: Record<string, { radius: number; radiusSm: number }> = {
	// Contour bottle curves + flowing script logo -> soft, rounded-forward shapes
	"coca-cola": { radius: 14, radiusSm: 8 },
	// Bold, playful extruded wordmark -> generous, friendly rounding
	fanta: { radius: 16, radiusSm: 10 },
	// Sleek, modern geometric wordmark (Refraktiv) -> crisp, tight corners
	sprite: { radius: 6, radiusSm: 4 },
	// Warm, hand-drawn wordmark -> soft, approachable rounding
	"minute-maid": { radius: 18, radiusSm: 10 },
};
const DEFAULT_RADIUS = { radius: 10, radiusSm: 6 };

function fontStack(family: string) {
	return `"${family}", Inter, sans-serif`;
}

// getReadableTextColor only understands plain #RRGGBB hex — a CSS color-mix()
// string can't be parsed by it (this is exactly how the earlier Logo-badge
// contrast bug happened: passing an unparseable value silently produced a
// default that turned out illegible). Blend in real RGB math instead so the
// result is always a genuine hex value.
function mixHexTowardWhite(hex: string, whiteWeight: number): string {
	const clean = hex.replace("#", "");
	const mix = (start: number) => {
		const c = parseInt(clean.substring(start, start + 2), 16);
		return Math.round(c + (255 - c) * whiteWeight);
	};
	const toHex = (c: number) => c.toString(16).padStart(2, "0");
	return `#${toHex(mix(0))}${toHex(mix(2))}${toHex(mix(4))}`;
}

// Card backgrounds in this panel are the app's real bg.secondary (#EFF5EB).
// A brand's accent colour isn't guaranteed to be dark/saturated enough to
// read as small text on that surface — darken it step by step until it is,
// rather than trusting every brand colour to already qualify as legible text.
const LIGHT_CARD_BG = "#EFF5EB";

function ensureReadableOnLight(hex: string, minRatio = 4.5): string {
	const clean = hex.replace("#", "");
	let r = parseInt(clean.substring(0, 2), 16);
	let g = parseInt(clean.substring(2, 4), 16);
	let b = parseInt(clean.substring(4, 6), 16);
	const toHex = (c: number) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0");
	let current = hex;
	for (let i = 0; i < 12 && contrastRatio(current, LIGHT_CARD_BG) < minRatio; i++) {
		r *= 0.88;
		g *= 0.88;
		b *= 0.88;
		current = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	}
	return current;
}

// A brand's primary colour can sit in a mid-dark zone where neither white nor
// near-black text quite reaches 4.5:1 (e.g. Coca-Cola red, Sprite green both
// landed at ~4.2:1) — darken it slightly until the better of the two options
// clears the bar, instead of shipping a near-miss.
function ensureSolidBackgroundContrast(hex: string, minRatio = 4.5): string {
	const clean = hex.replace("#", "");
	let r = parseInt(clean.substring(0, 2), 16);
	let g = parseInt(clean.substring(2, 4), 16);
	let b = parseInt(clean.substring(4, 6), 16);
	const toHex = (c: number) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0");
	let current = hex;
	// Must match getReadableTextColor's actual candidates (off-black/off-white,
	// not pure #000/#FFF) or this will predict a pass that getReadableTextColor
	// then fails to deliver.
	const bestAvailableRatio = () =>
		Math.max(contrastRatio(current, READABLE_DARK), contrastRatio(current, READABLE_LIGHT));
	for (let i = 0; i < 12 && bestAvailableRatio() < minRatio; i++) {
		r *= 0.9;
		g *= 0.9;
		b *= 0.9;
		current = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	}
	return current;
}

function getBrandStyle(pack: BrandPack): BrandStyle {
	const byRole = (role: string) => pack.colors.find((c) => c.role === role)?.hex;
	const primaryHex = byRole("primary") ?? pack.colors[0]?.hex ?? "#000000";
	const shape = BRAND_RADIUS[pack.id] ?? DEFAULT_RADIUS;
	return {
		accentHex: byRole("accent") ?? primaryHex,
		bodyFont: fontStack(pack.typography.body),
		headingFont: fontStack(pack.typography.heading),
		primaryHex,
		radius: shape.radius,
		radiusSm: shape.radiusSm,
		secondaryHex: byRole("secondary") ?? primaryHex,
		solidPrimaryHex: ensureSolidBackgroundContrast(primaryHex),
	};
}

// ── Shared chrome ────────────────────────────────────────────────────────────

function GroupHeader({ subtitle, title }: { subtitle: string; title: string }) {
	return (
		<Box mb="16" mt="8">
			<Text
				fontWeight="700"
				style={{
					color: "var(--ax-colors-fg-tertiary)",
					fontSize: 12,
					letterSpacing: 0.6,
					textTransform: "uppercase",
				}}
			>
				{title}
			</Text>
			<Text color="fg.secondary" style={{ fontSize: 13, marginTop: 2 }}>
				{subtitle}
			</Text>
		</Box>
	);
}

function ComponentCard({
	children,
	description,
	name,
	variants,
}: {
	children: ReactNode;
	description: string;
	name: string;
	variants: string[];
}) {
	return (
		<Box rounded="xl" style={{ border: "1px solid var(--ax-colors-border-secondary)", overflow: "hidden" }}>
			<Box
				alignItems="center"
				bg="bg.secondary"
				display="flex"
				style={{ flexWrap: "wrap", gap: 12, minHeight: 96, padding: "20px 24px" }}
			>
				{children}
			</Box>
			<Box style={{ padding: "14px 18px" }}>
				<Text fontWeight="700" style={{ color: "var(--ax-colors-fg-default)", fontSize: 14 }}>
					{name}
				</Text>
				<Text color="fg.tertiary" style={{ fontSize: 12, marginTop: 2 }}>
					{variants.join(" · ")}
				</Text>
				<Text color="fg.secondary" style={{ fontSize: 12, lineHeight: 1.4, marginTop: 6 }}>
					{description}
				</Text>
			</Box>
		</Box>
	);
}

const CARD_GRID_STYLE: CSSProperties = {
	display: "grid",
	gap: 16,
	gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
};

// ── Panel ────────────────────────────────────────────────────────────────────

export function ComponentsPanel({ pack }: { pack: BrandPack }) {
	const s = getBrandStyle(pack);
	// CheckboxControl/Radio/Switch paint their checked state from the shared
	// --ax-colors-bg-accent token (confirmed in Axiom's compiled ToggleInput
	// CSS) — overriding that custom property on a wrapping scope reskins all
	// three without fighting their internal recipe classes.
	const toggleScopeStyle = { "--ax-colors-bg-accent": s.primaryHex } as CSSProperties;

	return (
		<Box style={{ flex: 1, overflowY: "auto", padding: "28px 40px 60px", scrollbarWidth: "none" }}>
			<Box mb="24">
				<Text fontWeight="700" style={{ color: "var(--ax-colors-fg-default)", fontSize: 20 }}>
					Components
				</Text>
				<Text color="fg.secondary" style={{ fontSize: 14, marginTop: 4 }}>
					UI primitives rendered in {pack.name}&apos;s real colours, typography, and shape.
				</Text>
			</Box>

			<GroupHeader title="Actions" subtitle="Buttons and links for triggering work." />
			<Box style={{ ...CARD_GRID_STYLE, marginBottom: 32 }}>
				<ComponentCard
					name="Button"
					description="Primary carries the brand colour and heading type. Danger stays a universal signal, never brand-tinted."
					variants={["Primary", "Default", "Subtle", "Danger"]}
				>
					<Button
						style={{
							background: s.solidPrimaryHex,
							border: "none",
							borderRadius: s.radius,
							color: getReadableTextColor(s.solidPrimaryHex),
							fontFamily: s.headingFont,
						}}
					>
						Primary
					</Button>
					<Button
						appearance="default"
						style={{ borderRadius: s.radius, fontFamily: s.headingFont }}
					>
						Default
					</Button>
					<Button appearance="subtle" style={{ borderRadius: s.radius, fontFamily: s.headingFont }}>
						Subtle
					</Button>
					<Button appearance="danger" style={{ borderRadius: s.radius, fontFamily: s.headingFont }}>
						Danger
					</Button>
				</ComponentCard>

				<ComponentCard
					name="Icon Button"
					description="This design system has no separate icon-button primitive — it's a Button with only an icon."
					variants={["Default", "Square"]}
				>
					<Button
						aria-label="Settings"
						icon={<IconGear />}
						style={{
							background: s.solidPrimaryHex,
							border: "none",
							borderRadius: 999,
							color: getReadableTextColor(s.solidPrimaryHex),
						}}
					/>
					<Button
						appearance="default"
						aria-label="Settings"
						icon={<IconGear />}
						style={{ borderRadius: s.radiusSm }}
					/>
				</ComponentCard>

				<ComponentCard
					name="Link"
					description="Inline text links in the brand's primary colour and body typeface."
					variants={["Default", "Subtle", "Visited"]}
				>
					<Link href="#" style={{ color: ensureReadableOnLight(s.primaryHex), fontFamily: s.bodyFont, fontSize: 14 }}>
						View brand guide
					</Link>
					<Link href="#" style={{ color: "var(--ax-colors-fg-secondary)", fontFamily: s.bodyFont, fontSize: 14 }}>
						Learn more
					</Link>
				</ComponentCard>
			</Box>

			<GroupHeader title="Forms" subtitle="Inputs for capturing user data." />
			<Box style={{ ...CARD_GRID_STYLE, marginBottom: 32 }}>
				<ComponentCard
					name="Input"
					description="Text entry in the brand's body typeface."
					variants={["Text", "Number", "Password", "Search"]}
				>
					<Input
						placeholder="Type here…"
						style={{ borderRadius: s.radiusSm, fontFamily: s.bodyFont, width: 200 }}
					/>
				</ComponentCard>

				<ComponentCard name="Textarea" description="Multi-line text entry." variants={["Resizable", "Fixed height"]}>
					<Textarea
						placeholder="Add a note…"
						rows={2}
						style={{ borderRadius: s.radiusSm, fontFamily: s.bodyFont, width: 220 }}
					/>
				</ComponentCard>

				<ComponentCard name="Select" description="Single and multi-select dropdowns." variants={["Single", "Multi-select"]}>
					<Box style={{ width: 180 }}>
						<Select
							onValueChange={() => {}}
							options={[
								{ label: "Option A", value: "a" },
								{ label: "Option B", value: "b" },
							]}
							value="a"
						>
							<SelectTrigger placeholder="Choose an option" />
							<SelectContent />
						</Select>
					</Box>
				</ComponentCard>

				<ComponentCard
					name="Checkbox"
					description="Selection control, filled with the brand's primary colour when checked."
					variants={["Checked", "Indeterminate", "Disabled"]}
				>
					<Box alignItems="center" display="flex" gap="16" style={toggleScopeStyle}>
						<Checkbox aria-label="Checked" checked />
						<Checkbox aria-label="Indeterminate" checked indeterminate />
						<Checkbox aria-label="Disabled" checked disabled />
					</Box>
				</ComponentCard>

				<ComponentCard name="Radio" description="Single-choice selection." variants={["Group", "Standalone"]}>
					<Box style={toggleScopeStyle}>
						<RadioGroup onValueChange={() => {}} value="a">
							<Box display="flex" gap="16">
								<Radio value="a">Option A</Radio>
								<Radio value="b">Option B</Radio>
							</Box>
						</RadioGroup>
					</Box>
				</ComponentCard>

				<ComponentCard name="Switch" description="On/off toggle." variants={["On", "Off", "Disabled"]}>
					<Box alignItems="center" display="flex" gap="16" style={toggleScopeStyle}>
						<Switch aria-label="On" checked onCheckedChange={() => {}} />
						<Switch aria-label="Off" checked={false} onCheckedChange={() => {}} />
						<Switch aria-label="Disabled" checked disabled onCheckedChange={() => {}} />
					</Box>
				</ComponentCard>
			</Box>

			<GroupHeader
				title="Feedback"
				subtitle="Status, confirmation, and progress signals — colour stays semantic so it always means what it says."
			/>
			<Box style={CARD_GRID_STYLE}>
				<ComponentCard
					name="Alert"
					description="Inline status messaging. Colour is universal; type and shape follow the brand."
					variants={["Info", "Success", "Warning", "Error"]}
				>
					<Alert intent="success" style={{ borderRadius: s.radius, fontFamily: s.bodyFont, width: "100%" }}>
						Saved successfully.
					</Alert>
				</ComponentCard>

				<ComponentCard
					name="Badge"
					description="Compact status or category label using the brand's colour roles."
					variants={["Solid", "Subtle", "Outline"]}
				>
					<Box
						style={{
							background: s.solidPrimaryHex,
							borderRadius: 999,
							color: getReadableTextColor(s.solidPrimaryHex),
							fontSize: 12,
							fontWeight: 700,
							padding: "3px 10px",
						}}
					>
						Solid
					</Box>
					<Box
						style={{
							background: mixHexTowardWhite(s.secondaryHex, 0.8),
							borderRadius: 999,
							color: getReadableTextColor(mixHexTowardWhite(s.secondaryHex, 0.8)),
							fontSize: 12,
							fontWeight: 700,
							padding: "3px 10px",
						}}
					>
						Subtle
					</Box>
					<Box
						style={{
							background: "transparent",
							border: `1px solid ${ensureReadableOnLight(s.accentHex)}`,
							borderRadius: 999,
							color: ensureReadableOnLight(s.accentHex),
							fontSize: 12,
							fontWeight: 700,
							padding: "3px 10px",
						}}
					>
						Outline
					</Box>
				</ComponentCard>

				<ComponentCard
					name="Toast"
					description="Transient confirmation, shown here as a static specimen — no toast-trigger wiring exists in this app yet."
					variants={["Success", "Error", "Loading"]}
				>
					<Box
						style={{
							background: "var(--ax-colors-bg-default)",
							border: "1px solid var(--ax-colors-border-secondary)",
							borderRadius: s.radiusSm,
							boxShadow: "var(--ax-shadows-md)",
							fontFamily: s.bodyFont,
							fontSize: 13,
							padding: "10px 14px",
							width: "100%",
						}}
					>
						Changes saved
					</Box>
				</ComponentCard>

				<ComponentCard
					name="Spinner"
					description="Loading indicator in the brand's primary colour."
					variants={["Default", "Inverse"]}
				>
					<Spinner style={{ color: ensureReadableOnLight(s.primaryHex) }} />
					<Box style={{ background: s.solidPrimaryHex, borderRadius: 999, display: "inline-flex", padding: 8 }}>
						<Spinner style={{ color: getReadableTextColor(s.solidPrimaryHex) }} />
					</Box>
				</ComponentCard>
			</Box>
		</Box>
	);
}
