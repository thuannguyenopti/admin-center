"use client";

import {useState} from "react";
import {Box, Button, Text} from "@optiaxiom/react";
import {IconAngleDown, IconAngleRight, IconArrowLeft} from "@optiaxiom/icons";
import type {BrandPack} from "../../types";
import {getBrandColors, getBrandTemplates, getImageAssets, getLogoAssets} from "../../adapters";
import styles from "../BrandPackDetailPage.module.css";

export type SectionId =
	| "overview"
	| "setup"
	| "brief"
	| "colours"
	| "typography"
	| "photography"
	| "logos-devices"
	| "design-systems"
	| "voice-audience"
	| "assets";

type SectionDef = {
	description: string;
	id: SectionId;
	label: string;
	count?: (pack: BrandPack) => number | undefined;
};

const SECTION_DEFS: SectionDef[] = [
	{id: "overview", label: "Overview", description: "Health, coverage, quick actions"},
	{
		id: "assets",
		label: "Assets",
		description: "Files, logos, photos, templates",
		count: (pack) => pack.assets.length + getBrandTemplates(pack).length,
	},
	{
		id: "colours",
		label: "Colors",
		description: "Palette, purpose palettes, triggers",
		count: (pack) => getBrandColors(pack).length,
	},
	{id: "typography", label: "Typography", description: "Typefaces, fallbacks, hierarchy"},
	{
		id: "logos-devices",
		label: "Logos & Devices",
		description: "Logo assets, rules, brand devices",
		count: (pack) => getLogoAssets(pack).length,
	},
	{
		id: "photography",
		label: "Photography",
		description: "Mood, categories, visual references",
		count: (pack) => getImageAssets(pack).length,
	},
	{
		id: "design-systems",
		label: "Design Systems",
		description: "Illustration, icons, layout, data viz",
	},
	{
		id: "voice-audience",
		label: "Voice & Audience",
		description: "Tone, writing, values, audience",
		count: (pack) => pack.brand_values?.values.length,
	},
];

const SYSTEM_DEFS: SectionDef[] = [
	{id: "setup", label: "Brand Setup", description: "Identity, source, metadata"},
	{id: "brief", label: "Brand Instruction", description: "Structured fields and full brief"},
];

type BrandPackSectionNavProps = {
	activeSection: SectionId;
	onBack: () => void;
	onSelectSection: (section: SectionId) => void;
	pack: BrandPack;
	packName: string;
};

export function BrandPackSectionNav({
	activeSection,
	onBack,
	onSelectSection,
	pack,
	packName,
}: BrandPackSectionNavProps) {
	const systemActive = SYSTEM_DEFS.some((section) => section.id === activeSection);
	const [systemExpanded, setSystemExpanded] = useState(false);
	const showSystemChildren = systemExpanded || systemActive;

	const renderItem = (section: SectionDef) => {
		const count = section.count?.(pack);
		const selected = activeSection === section.id;

		return (
			<Box
				key={section.id}
				asChild
				className={
					selected
						? `${styles.sectionNavItem} ${styles.sectionNavItemSelected}`
						: styles.sectionNavItem
				}
			>
				<button
					aria-current={selected ? "page" : undefined}
					aria-label={`${section.label} section`}
					onClick={() => onSelectSection(section.id)}
					type="button"
				>
					<span className={styles.sectionNavItemContent}>
						<span className={styles.sectionNavItemTitle}>
							<span
								className={
									selected
										? `${styles.sectionNavItemLabel} ${styles.sectionNavItemLabelSelected}`
										: styles.sectionNavItemLabel
								}
							>
								{section.label}
							</span>
							{count !== undefined && (
								<span className={styles.sectionNavCount}>{count}</span>
							)}
						</span>
						<span className={styles.sectionNavItemDescription}>
							{section.description}
						</span>
					</span>
				</button>
			</Box>
		);
	};

	return (
		<Box className={styles.sectionNavPanel} display="flex" flexDirection="column">
			<Box className={styles.sectionNavHeader}>
				<Button
					appearance="subtle"
					aria-label="Back to Brand"
					icon={<IconArrowLeft />}
					onClick={onBack}
					size="sm"
					style={{marginLeft: -6}}
				>
					Brand
				</Button>
				<Text color="fg.secondary" style={{fontSize: 12, lineHeight: 1.35, paddingLeft: 2}}>
					{packName}
				</Text>
			</Box>

			<Box display="flex" flexDirection="column" gap="4">
				{SECTION_DEFS.map((section) => renderItem(section))}

				<Box asChild className={styles.sectionNavItem}>
					<button
						aria-controls="brand-pack-system-group"
						aria-expanded={showSystemChildren}
						aria-label="System group"
						onClick={() => setSystemExpanded((current) => !current)}
						type="button"
					>
						<span className={styles.sectionNavItemContent}>
							<span className={styles.sectionNavItemTitle}>
								<span className={styles.sectionNavItemLabel}>System</span>
								<span style={{alignItems: "center", display: "inline-flex", marginLeft: "auto"}}>
									{showSystemChildren ? (
										<IconAngleDown size={14} />
									) : (
										<IconAngleRight size={14} />
									)}
								</span>
							</span>
							<span className={styles.sectionNavItemDescription}>
								Setup and instruction
							</span>
						</span>
					</button>
				</Box>

				{showSystemChildren && (
					<Box
						display="flex"
						flexDirection="column"
						gap="4"
						id="brand-pack-system-group"
						style={{paddingLeft: 12}}
					>
						{SYSTEM_DEFS.map((section) => renderItem(section))}
					</Box>
				)}
			</Box>
		</Box>
	);
}
