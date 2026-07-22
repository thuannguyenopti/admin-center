"use client";

import {useState} from "react";
import {Badge, Box, Button, Text} from "@optiaxiom/react";
import {IconPenToSquare as IconEdit, IconPlay} from "@optiaxiom/icons";
import {ColorPalette} from "../../components/ColorSwatchBar";
import type {BrandPack} from "../../types";
import {
	getBrandColors,
	getBrandTemplates,
	getBrandTypographySummary,
	getImageAssets,
	getLogoAssets,
	getToneOfVoice,
} from "../../adapters";
import {OpalOnboardingPanel} from "./OpalOnboardingPanel";

type OverviewTabKey =
	| "setup"
	| "brief"
	| "colours"
	| "typography"
	| "photography"
	| "logos-devices"
	| "design-systems"
	| "voice-audience"
	| "assets";

type OverviewTabProps = {
	pack: BrandPack;
	onSelectTab: (tab: OverviewTabKey) => void;
};

const GHOST_SECTIONS: Array<{description: string; title: string}> = [
	{description: "Palette roles, purpose palettes, topic triggers, and accessibility.", title: "Colors"},
	{description: "Typeface roles and weights for generated assets.", title: "Typography"},
	{description: "Mood, categories, style references, and composite rules.", title: "Photography"},
	{description: "Logo guidance powered by files classified in Assets.", title: "Logos & Devices"},
	{description: "Illustration, icons, layout grid, and data visualization.", title: "Design Systems"},
	{description: "Tone traits, writing rules, brand values, and target audience.", title: "Voice & Audience"},
	{description: "Source files and approved template starting points in one library.", title: "Assets"},
];

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
					<Text fontWeight="600" style={{fontSize: 14}}>
						{title}
					</Text>
					<Text color="fg.secondary" fontSize="sm" style={{lineHeight: 1.45}}>
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
			<Box display="flex" flexDirection="column" gap="12" style={{flex: 1}}>
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

function SmallPill({children}: {children: React.ReactNode}) {
	return (
		<Badge
			intent="neutral"
			variant="subtle"
			style={{whiteSpace: "nowrap", width: "fit-content"}}
		>
			{children}
		</Badge>
	);
}

function GhostCard({description, title}: {description: string; title: string}) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			gap="8"
			p="20"
			rounded="xl"
			style={{minHeight: 120}}
		>
			<Text fontWeight="600" style={{fontSize: 14}}>
				{title}
			</Text>
			<Text color="fg.secondary" fontSize="sm" style={{lineHeight: 1.45}}>
				{description}
			</Text>
		</Box>
	);
}

export function OverviewTab({pack, onSelectTab}: OverviewTabProps) {
	const [built, setBuilt] = useState(() => {
		if (typeof window !== "undefined") {
			const params = new URLSearchParams(window.location.search);
			if (params.get("built") === "true") return true;
			if (params.get("built") === "false") return false;
		}
		return false;
	});
	const [panelOpen, setPanelOpen] = useState(false);

	const colors = getBrandColors(pack);
	const logos = getLogoAssets(pack);
	const images = getImageAssets(pack);
	const templates = getBrandTemplates(pack);
	const tone = getToneOfVoice(pack);
	const typography = getBrandTypographySummary(pack);
	const templateCount =
		pack.template_metadata?.template_count ?? pack.templateCount ?? templates.length;
	const designSystemCount = [
		pack.illustration_system,
		pack.icon_system,
		pack.layout_grid,
		pack.data_visualisation,
	].filter(Boolean).length;

	const panel = (
		<OpalOnboardingPanel
			open={panelOpen}
			onClose={() => setPanelOpen(false)}
			onComplete={() => {
				setPanelOpen(false);
				setBuilt(true);
			}}
		/>
	);

	if (!built) {
		return (
			<>
				<Box display="flex" flexDirection="column" gap="24">
					<Box alignItems="start" display="flex" flexDirection="column" gap="8">
						<Text color="fg.tertiary" fontSize="sm">
							{pack.name}
						</Text>
						<Text fontWeight="700" style={{fontSize: 28, lineHeight: 1.2}}>
							Your brand is empty.
						</Text>
						<Text
							color="fg.secondary"
							fontSize="md"
							style={{lineHeight: 1.5, maxWidth: 520}}
						>
							Add your brand to Opal so it can apply your identity during content
							generation.
						</Text>
						<Button
							appearance="primary"
							icon={<IconPlay size={14} />}
							onClick={() => setPanelOpen(true)}
							size="md"
							style={{marginTop: 8}}
						>
							Create with Opal
						</Button>
					</Box>

					<Box
						style={{background: "var(--ax-colors-border-tertiary)", height: 1, width: "100%"}}
					/>

					<Box
						display="grid"
						gap="16"
						style={{
							gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
							opacity: 0.4,
							pointerEvents: "none",
						}}
					>
						{GHOST_SECTIONS.map((section) => (
							<GhostCard
								key={section.title}
								description={section.description}
								title={section.title}
							/>
						))}
					</Box>
				</Box>
				{panel}
			</>
		);
	}

	return (
		<>
			<Box
				display="grid"
				gap="16"
				style={{
					animation: "fadeIn 0.4s ease",
					gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
				}}
			>
				<Tile
					title="Colors"
					description="Palette roles, purpose palettes, topic triggers, and accessibility."
					metric={`${colors.length} colors`}
					onSelect={() => onSelectTab("colours")}
				>
					<ColorPalette colors={colors} size="lg" />
					<Box display="flex" gap="6" style={{flexWrap: "wrap"}}>
						{colors.slice(0, 4).map((color) => (
							<SmallPill key={color.hex}>{color.name}</SmallPill>
						))}
					</Box>
				</Tile>

				<Tile
					title="Typography"
					description="Typeface roles and weights for generated assets."
					featured
					metric={`${typography.heading} heading`}
					onSelect={() => onSelectTab("typography")}
				>
					<Box
						alignItems="end"
						display="grid"
						gap="16"
						style={{gridTemplateColumns: "minmax(0, 1fr) 120px"}}
					>
						<Box display="flex" flexDirection="column" gap="8">
							<Text
								fontWeight="700"
								style={{fontSize: 42, letterSpacing: 0, lineHeight: 1}}
							>
								{typography.heading}
							</Text>
							<Text fontWeight="600" style={{fontSize: 20, lineHeight: 1.25}}>
								The quick brown fox jumps over the lazy dog.
							</Text>
							<Text color="fg.secondary" fontSize="sm">
								Body: {typography.body}
								{typography.mono ? ` · Mono: ${typography.mono}` : ""}
							</Text>
						</Box>
						<Text
							color="fg.secondary"
							style={{fontSize: 74, fontWeight: 700, letterSpacing: 0, lineHeight: 0.8}}
						>
							Aa
						</Text>
					</Box>
				</Tile>

				<Tile
					title="Photography"
					description="Mood, categories, style references, and composite rules."
					metric={`${images.length} image assets · ${pack.photography_categories?.length ?? 0} categories`}
					onSelect={() => onSelectTab("photography")}
				>
					<Box display="flex" gap="8">
						{images.slice(0, 3).map((asset) => (
							<Box
								key={asset.id}
								rounded="lg"
								style={{height: 72, overflow: "hidden", width: 96}}
							>
								<img
									alt={asset.name}
									src={asset.url}
									style={{height: "100%", objectFit: "cover", width: "100%"}}
								/>
							</Box>
						))}
					</Box>
					<Box display="flex" gap="6" style={{flexWrap: "wrap"}}>
						{(pack.photography_categories ?? []).slice(0, 3).map((category) => (
							<SmallPill key={category.name}>{category.name}</SmallPill>
						))}
					</Box>
				</Tile>

				<Tile
					title="Logos & Devices"
					description="Logo guidance powered by files classified in Assets."
					metric={`${logos.length} logos · ${pack.brand_devices?.length ?? 0} devices`}
					onSelect={() => onSelectTab("logos-devices")}
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
								style={{height: 72, overflow: "hidden", width: 96}}
							>
								<img
									alt={asset.name}
									src={asset.url}
									style={{maxHeight: 48, maxWidth: 72, objectFit: "contain"}}
								/>
							</Box>
						))}
					</Box>
					<Box display="flex" gap="6" style={{flexWrap: "wrap"}}>
						{(pack.brand_devices ?? []).slice(0, 3).map((device) => (
							<SmallPill key={device.name}>{device.name}</SmallPill>
						))}
					</Box>
				</Tile>

				<Tile
					title="Design Systems"
					description="Illustration, icons, layout grid, and data visualization."
					metric={`${designSystemCount} systems documented`}
					onSelect={() => onSelectTab("design-systems")}
				>
					<Box display="flex" gap="6" style={{flexWrap: "wrap"}}>
						{[
							pack.illustration_system ? "Illustration" : null,
							pack.icon_system ? "Icon system" : null,
							pack.layout_grid ? "Layout grid" : null,
							pack.data_visualisation ? "Data viz" : null,
						]
							.filter(Boolean)
							.map((label) => (
								<SmallPill key={label}>{label}</SmallPill>
							))}
					</Box>
				</Tile>

				<Tile
					title="Voice & Audience"
					description="Tone traits, writing rules, brand values, and target audience."
					metric={`${tone.key_traits.length} traits · ${pack.brand_values?.values.length ?? 0} values`}
					onSelect={() => onSelectTab("voice-audience")}
				>
					<Box display="flex" gap="6" style={{flexWrap: "wrap"}}>
						{tone.key_traits.map((keyword) => (
							<SmallPill key={keyword}>{keyword}</SmallPill>
						))}
					</Box>
				</Tile>

				<Tile
					title="Assets"
					description="Source files and approved template starting points in one library."
					featured
					metric={`${pack.assets.length} files · ${templateCount} templates`}
					onSelect={() => onSelectTab("assets")}
				>
					<Box display="flex" gap="8">
						{templates.slice(0, 3).map((template) => (
							<Box
								key={template.id}
								rounded="lg"
								style={{flex: 1, height: 104, overflow: "hidden"}}
							>
								<img
									alt={template.name}
									src={template.thumb}
									style={{height: "100%", objectFit: "cover", width: "100%"}}
								/>
							</Box>
						))}
					</Box>
					<Box display="flex" gap="6" style={{flexWrap: "wrap"}}>
						{["All", "Logos", "Photos", "Templates", "Icons", "Illustrations", "Backgrounds", "Misc"].map(
							(label) => (
								<SmallPill key={label}>{label}</SmallPill>
							)
						)}
					</Box>
					<Text color="fg.secondary" fontSize="sm" style={{lineHeight: 1.5}}>
						Templates are sorted as an asset category beside logos, photos, and misc files.
					</Text>
				</Tile>
			</Box>
			{panel}
		</>
	);
}
