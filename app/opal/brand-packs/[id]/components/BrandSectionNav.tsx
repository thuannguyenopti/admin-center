"use client";

import type { ReactNode } from "react";
import { Badge, Box, Nav, NavBody, NavItem, Sidebar, Text } from "@optiaxiom/react";
import {
	IconDroplet,
	IconFileLines,
	IconGauge,
	IconHeading,
	IconImages,
	IconMessageLines,
	IconRocket,
	IconStar,
	IconTableLayout,
	IconTag,
} from "@optiaxiom/icons";

export type BrandSection =
	| "overview"
	| "colours"
	| "typography"
	| "logos"
	| "images"
	| "descriptors"
	| "tone"
	| "templates"
	| "brief"
	| "publish";

type SectionDef = { id: BrandSection; icon: ReactNode; label: string };

const BRAND_SECTIONS: SectionDef[] = [
	{ id: "overview", icon: <IconGauge />, label: "Overview" },
	{ id: "colours", icon: <IconDroplet />, label: "Colors" },
	{ id: "typography", icon: <IconHeading />, label: "Typography" },
	{ id: "logos", icon: <IconStar />, label: "Logos" },
	{ id: "images", icon: <IconImages />, label: "Images" },
	{ id: "descriptors", icon: <IconTag />, label: "Style Descriptors" },
	{ id: "tone", icon: <IconMessageLines />, label: "Tone of Voice" },
	{ id: "templates", icon: <IconTableLayout />, label: "Templates" },
];

const SYSTEM_SECTIONS: SectionDef[] = [
	{ id: "brief", icon: <IconFileLines />, label: "Brand Brief" },
	{ id: "publish", icon: <IconRocket />, label: "Test & Publish" },
];

/**
 * Detail-page section nav for Brand — structurally the same pattern as
 * app/opal/settings/layout.tsx's OpalSettingsSubNav (Sidebar/Nav/NavBody/NavItem,
 * grouped by section labels, one active item at a time), not Tabs. Sections here
 * are in-page state switches rather than separate routes, so onSelect updates
 * local state instead of navigating.
 */
export function BrandSectionNav({
	active,
	counts,
	onSelect,
}: {
	active: BrandSection;
	counts?: Partial<Record<BrandSection, number>>;
	onSelect: (section: BrandSection) => void;
}) {
	function renderItem(section: SectionDef) {
		const count = counts?.[section.id];
		return (
			<NavItem
				key={section.id}
				active={active === section.id}
				addonAfter={count !== undefined ? <Badge intent="neutral" variant="subtle">{count}</Badge> : undefined}
				icon={section.icon}
				onClick={() => onSelect(section.id)}
			>
				{section.label}
			</NavItem>
		);
	}

	return (
		<Box h="full" style={{ width: 272, flexShrink: 0, overflow: "hidden" }}>
			<Sidebar expanded h="full">
				<Nav>
					<NavBody>
						<Box px="12" py="16">
							<Text color="fg.default" fontSize="md" fontWeight="600">Brand</Text>
						</Box>
						{BRAND_SECTIONS.map(renderItem)}
						<Box pb="4" pt="16" px="12">
							<Text color="fg.tertiary" fontSize="sm">System</Text>
						</Box>
						{SYSTEM_SECTIONS.map(renderItem)}
					</NavBody>
				</Nav>
			</Sidebar>
		</Box>
	);
}
