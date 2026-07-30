<<<<<<< HEAD
"use client";

import { Box, Text } from "@optiaxiom/react";
import { ColorPalette } from "../../components/ColorSwatchBar";
import type { BrandPack } from "../../types";

type OverviewTabProps = {
	pack: BrandPack;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<Text
			color="fg.secondary"
			fontSize="xs"
			fontWeight="600"
			style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}
		>
			{children}
		</Text>
	);
}

function OverviewCard({ children }: { children: React.ReactNode }) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			gap="16"
			p="24"
			rounded="xl"
			shadow="sm"
		>
			{children}
		</Box>
	);
}

export function OverviewTab({ pack }: OverviewTabProps) {
	return (
		<Box display="grid" gap="16" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
			{/* Colors */}
			<OverviewCard>
				<SectionLabel>Color Palette</SectionLabel>
				<ColorPalette colors={pack.colors} size="lg" />
				<Box display="flex" flexDirection="column" gap="8">
					{pack.colors.map((color) => (
						<Box key={color.hex} alignItems="center" display="flex" gap="12">
							<Box
								rounded="md"
								style={{
									background: color.hex,
									border: "1px solid rgba(0,0,0,0.08)",
									height: 24,
									width: 24,
									flexShrink: 0,
								}}
							/>
							<Box display="flex" flexDirection="column" gap="2">
								<Text fontWeight="500" style={{ fontSize: 13 }}>
									{color.name}
								</Text>
								<Text color="fg.tertiary" fontSize="xs">
									{color.hex} · {color.role}
								</Text>
							</Box>
						</Box>
					))}
				</Box>
			</OverviewCard>

			{/* Typography */}
			<OverviewCard>
				<SectionLabel>Typography</SectionLabel>
				<Box display="flex" flexDirection="column" gap="20">
					<Box display="flex" flexDirection="column" gap="6">
						<Text color="fg.tertiary" fontSize="xs">Heading</Text>
						<Text fontWeight="700" style={{ fontSize: 32, lineHeight: 1 }}>
							{pack.typography.heading}
						</Text>
						<Text color="fg.secondary" style={{ fontSize: 13 }}>
							ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
							abcdefghijklmnopqrstuvwxyz<br />
							0123456789
						</Text>
					</Box>
					<Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)" }} />
					<Box display="flex" flexDirection="column" gap="6">
						<Text color="fg.tertiary" fontSize="xs">Body</Text>
						<Text fontWeight="400" style={{ fontSize: 15 }}>
							The quick brown fox jumps over the lazy dog.
						</Text>
						<Text color="fg.secondary" fontSize="xs">
							{pack.typography.body} Regular · 15px / 24px
						</Text>
					</Box>
					{pack.typography.mono && (
						<>
							<Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)" }} />
							<Box display="flex" flexDirection="column" gap="6">
								<Text color="fg.tertiary" fontSize="xs">Monospace</Text>
								<Text style={{ fontFamily: "monospace", fontSize: 13 }}>
									const brand = "stride";
								</Text>
								<Text color="fg.secondary" fontSize="xs">{pack.typography.mono}</Text>
							</Box>
						</>
					)}
				</Box>
			</OverviewCard>

			{/* Tone of Voice */}
			<OverviewCard>
				<SectionLabel>Tone of Voice</SectionLabel>
				<Box display="flex" gap="8" style={{ flexWrap: "wrap" }}>
					{pack.toneKeywords.map((kw) => (
						<Box
							key={kw}
							bg="bg.accent.subtle"
							rounded="full"
							style={{ padding: "6px 14px" }}
						>
							<Text color="fg.accent" fontWeight="500" style={{ fontSize: 13 }}>
								{kw}
							</Text>
						</Box>
					))}
				</Box>
				<Box display="flex" flexDirection="column" gap="4">
					<Text color="fg.tertiary" fontSize="xs">Channels</Text>
					<Box display="flex" gap="6" style={{ flexWrap: "wrap" }}>
						{pack.channels.map((ch) => (
							<Box key={ch} bg="bg.secondary" rounded="full" style={{ padding: "4px 10px" }}>
								<Text color="fg.secondary" fontSize="xs" fontWeight="500">{ch}</Text>
							</Box>
						))}
					</Box>
				</Box>
			</OverviewCard>

			{/* Stats */}
			<OverviewCard>
				<SectionLabel>Pack Details</SectionLabel>
				<Box display="flex" flexDirection="column" gap="12">
					{[
						{ label: "Templates", value: String(pack.templateCount) },
						{ label: "Assets", value: String(pack.assets.length) },
						{ label: "Created by", value: pack.createdBy },
						{ label: "Last updated", value: new Date(pack.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
						...(pack.sourceFigma ? [{ label: "Source", value: "Figma library" }] : []),
						...(pack.sourceUrl ? [{ label: "Source", value: pack.sourceUrl }] : []),
					].map(({ label, value }) => (
						<Box key={label} alignItems="start" display="flex" justifyContent="space-between" gap="12">
							<Text color="fg.secondary" fontSize="sm">{label}</Text>
							<Text fontSize="sm" fontWeight="500" style={{ textAlign: "right", maxWidth: 200, wordBreak: "break-all" }}>
								{value}
							</Text>
						</Box>
					))}
				</Box>
			</OverviewCard>
		</Box>
	);
}
=======
"use client";

import { Badge, Box, Button, Text } from "@optiaxiom/react";
import { IconPenToSquare as IconEdit } from "@optimizely/axiom-icons";
import { ColorPalette } from "../../components/ColorSwatchBar";
import type { BrandPack } from "../../types";

type OverviewTabKey =
	| "colours"
	| "typography"
	| "logos"
	| "images"
	| "descriptors"
	| "tone"
	| "templates"
	| "brief"
	| "publish";

type OverviewTabProps = {
	pack: BrandPack;
	onSelectTab: (tab: OverviewTabKey) => void;
};

function Tile({
	children,
	description,
	featured = false,
	metric,
	onSelect,
	title,
}: {
	children: React.ReactNode;
	description: string;
	featured?: boolean;
	metric?: string;
	onSelect: () => void;
	title: string;
}) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			gap="16"
			onClick={onSelect}
			p={featured ? "24" : "20"}
			rounded="xl"
			shadow={featured ? "sm" : undefined}
			style={{
				cursor: "pointer",
				minHeight: featured ? 240 : 212,
				transition: "box-shadow 0.18s ease, transform 0.18s ease",
			}}
			onMouseEnter={(event) => {
				event.currentTarget.style.transform = "translateY(-1px)";
				event.currentTarget.style.boxShadow = "var(--ax-shadows-md)";
			}}
			onMouseLeave={(event) => {
				event.currentTarget.style.transform = "none";
				event.currentTarget.style.boxShadow = "var(--ax-shadows-sm)";
			}}
		>
			<Box alignItems="start" display="flex" gap="12" justifyContent="space-between">
				<Box display="flex" flexDirection="column" gap="4">
					<Text fontWeight="600" style={{ fontSize: 14 }}>
						{title}
					</Text>
					<Text color="fg.secondary" fontSize="sm" style={{ lineHeight: 1.45 }}>
						{description}
					</Text>
				</Box>
				<Button
					appearance="subtle"
					aria-label={`Edit ${title}`}
					icon={<IconEdit />}
					onClick={(event) => {
						event.stopPropagation();
						onSelect();
					}}
					size="sm"
				/>
			</Box>
			<Box display="flex" flexDirection="column" gap="12" style={{ flex: 1 }}>
				{children}
			</Box>
			{metric && (
				<Text color="fg.tertiary" fontSize="xs" fontWeight="500">
					{metric}
				</Text>
			)}
		</Box>
	);
}

function SmallPill({ children }: { children: React.ReactNode }) {
	return (
		<Badge intent="neutral" variant="subtle" style={{ whiteSpace: "nowrap", width: "fit-content" }}>
			{children}
		</Badge>
	);
}

export function OverviewTab({ pack, onSelectTab }: OverviewTabProps) {
	const logos = pack.assets.filter((asset) => asset.type === "logo");
	const images = pack.assets.filter((asset) => asset.type !== "logo");
	const updatedAt = new Date(pack.updatedAt).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});

	return (
		<Box
			display="grid"
			gap="16"
			style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
		>
			<Tile
				title="Colors"
				description="Palette roles, hex values, and brand-safe color usage."
				metric={`${pack.colors.length} colors`}
				onSelect={() => onSelectTab("colours")}
			>
				<ColorPalette colors={pack.colors} size="lg" />
				<Box display="flex" gap="6" style={{ flexWrap: "wrap" }}>
					{pack.colors.slice(0, 4).map((color) => (
						<SmallPill key={color.hex}>{color.name}</SmallPill>
					))}
				</Box>
			</Tile>

			<Tile
				title="Typography"
				description="Typeface roles and weights for generated assets."
				featured
				metric={`${pack.typography.heading} heading`}
				onSelect={() => onSelectTab("typography")}
			>
				<Box alignItems="end" display="grid" gap="16" style={{ gridTemplateColumns: "minmax(0, 1fr) 120px" }}>
					<Box display="flex" flexDirection="column" gap="8">
						<Text fontWeight="700" style={{ fontSize: 42, letterSpacing: 0, lineHeight: 1 }}>
							{pack.typography.heading}
						</Text>
						<Text fontWeight="600" style={{ fontSize: 20, lineHeight: 1.25 }}>
							The quick brown fox jumps over the lazy dog.
						</Text>
						<Text color="fg.secondary" fontSize="sm">
							Body: {pack.typography.body}
							{pack.typography.mono ? ` · Mono: ${pack.typography.mono}` : ""}
						</Text>
					</Box>
					<Text color="fg.secondary" style={{ fontSize: 74, fontWeight: 700, letterSpacing: 0, lineHeight: 0.8 }}>
						Aa
					</Text>
				</Box>
			</Tile>

			<Tile
				title="Logos"
				description="Approved marks and manual classification."
				metric={`${logos.length} logo assets`}
				onSelect={() => onSelectTab("logos")}
			>
				<Box display="flex" gap="8">
					{logos.slice(0, 2).map((asset) => (
						<Box
							key={asset.id}
							alignItems="center"
							bg="bg.secondary"
							display="flex"
							justifyContent="center"
							rounded="lg"
							style={{ height: 72, overflow: "hidden", width: 96 }}
						>
							<img alt={asset.name} src={asset.url} style={{ maxHeight: 48, maxWidth: 72, objectFit: "contain" }} />
						</Box>
					))}
				</Box>
			</Tile>

			<Tile
				title="Images"
				description="Style references, constraints, and generation guidance."
				metric={`${images.length} image assets`}
				onSelect={() => onSelectTab("images")}
			>
				<Box display="flex" gap="8">
					{images.slice(0, 3).map((asset) => (
						<Box key={asset.id} rounded="lg" style={{ height: 72, overflow: "hidden", width: 96 }}>
							<img alt={asset.name} src={asset.url} style={{ height: "100%", objectFit: "cover", width: "100%" }} />
						</Box>
					))}
				</Box>
			</Tile>

			<Tile
				title="Style Descriptors"
				description="Photography, composition, mood, and visual constraints."
				metric="4 descriptor groups"
				onSelect={() => onSelectTab("descriptors")}
			>
				<Box display="flex" gap="6" style={{ flexWrap: "wrap" }}>
					{["Photography", "Color mood", "Composition", "Do not use"].map((label) => (
						<SmallPill key={label}>{label}</SmallPill>
					))}
				</Box>
			</Tile>

			<Tile
				title="Tone of Voice"
				description="Reusable language rules, channels, and examples."
				metric={`${pack.toneKeywords.length} tone keywords`}
				onSelect={() => onSelectTab("tone")}
			>
				<Box display="flex" gap="6" style={{ flexWrap: "wrap" }}>
					{pack.toneKeywords.map((keyword) => (
						<SmallPill key={keyword}>{keyword}</SmallPill>
					))}
				</Box>
			</Tile>

			<Tile
				title="Templates"
				description="Approved formats for social, email, paid, and web."
				featured
				metric={`${pack.templateCount} templates`}
				onSelect={() => onSelectTab("templates")}
			>
				<Box display="flex" gap="8">
					{pack.templates.slice(0, 3).map((template) => (
						<Box key={template.id} rounded="lg" style={{ flex: 1, height: 104, overflow: "hidden" }}>
							<img alt={template.name} src={template.thumb} style={{ height: "100%", objectFit: "cover", width: "100%" }} />
						</Box>
					))}
				</Box>
			</Tile>

			<Tile
				title="Brand Brief"
				description="Narrative brand instruction and source-of-truth notes."
				metric={`Updated ${updatedAt}`}
				onSelect={() => onSelectTab("brief")}
			>
				<Text color="fg.secondary" fontSize="sm" style={{ lineHeight: 1.55 }}>
					{pack.description}
				</Text>
			</Tile>

			<Tile
				title="Test & Publish"
				description="Run readiness checks before making the pack available."
				metric={pack.status === "active" ? "Active now" : "Ready for review"}
				onSelect={() => onSelectTab("publish")}
			>
				<Box display="flex" flexDirection="column" gap="8">
					{["Colors", "Typography", "Tone", "Assets"].map((label) => (
						<Box key={label} alignItems="center" display="flex" gap="8">
							<Box bg="bg.success.subtle" rounded="full" style={{ height: 8, width: 8 }} />
							<Text color="fg.secondary" fontSize="sm">{label} configured</Text>
						</Box>
					))}
				</Box>
			</Tile>
		</Box>
	);
}
>>>>>>> origin/main
