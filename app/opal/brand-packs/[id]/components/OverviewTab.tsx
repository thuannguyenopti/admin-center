"use client";

import { Box, Button, Text } from "@optiaxiom/react";
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
	metric,
	onSelect,
	title,
}: {
	children: React.ReactNode;
	description: string;
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
			p="20"
			rounded="xl"
			shadow="sm"
			style={{
				cursor: "pointer",
				minHeight: 220,
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
		<Box bg="bg.secondary" rounded="full" style={{ padding: "4px 10px" }}>
			<Text color="fg.secondary" fontSize="xs" fontWeight="500">
				{children}
			</Text>
		</Box>
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
				title="Colours"
				description="Palette roles, hex values, and brand-safe color usage."
				metric={`${pack.colors.length} colours`}
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
				metric={`${pack.typography.heading} heading`}
				onSelect={() => onSelectTab("typography")}
			>
				<Text fontWeight="700" style={{ fontSize: 34, lineHeight: 1 }}>
					{pack.typography.heading}
				</Text>
				<Text color="fg.secondary" fontSize="sm">
					Body: {pack.typography.body}
					{pack.typography.mono ? ` · Mono: ${pack.typography.mono}` : ""}
				</Text>
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
					{["Photography", "Colour mood", "Composition", "Do not use"].map((label) => (
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
				metric={`${pack.templateCount} templates`}
				onSelect={() => onSelectTab("templates")}
			>
				<Box display="flex" gap="8">
					{pack.templates.slice(0, 3).map((template) => (
						<Box key={template.id} rounded="lg" style={{ height: 72, overflow: "hidden", width: 96 }}>
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
					{["Colours", "Typography", "Tone", "Assets"].map((label) => (
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
