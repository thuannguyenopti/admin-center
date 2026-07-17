"use client";

import { useState } from "react";
import { Box, Checkbox } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { IconChevronDown, IconChevronRight } from "@optimizely/axiom-icons";

export type DropZoneFilterSection = { id: string; title: string; items: string[] };

/**
 * Left Filters sidebar for the Drop Zone detail view — same bordered-panel/Collapse-All/
 * collapsible-checkbox-section shell as AssetFilterPanel.tsx (used for the Assets Approved
 * grid), rebuilt standalone rather than sharing that component directly: its sections
 * (campaigns, people, quick-filters) are asset-grid-specific and don't apply to submissions.
 */
export function DropZoneFilterPanel({
	sections,
	selected,
	onToggleValue,
}: {
	sections: DropZoneFilterSection[];
	selected: Set<string>;
	onToggleValue: (value: string) => void;
}) {
	const [openSections, setOpenSections] = useState<Set<string>>(() => new Set(sections.map((section) => section.id)));

	function toggleSection(id: string) {
		setOpenSections((current) => {
			const next = new Set(current);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	return (
		<Box bg="bg.default" border="1" borderColor="border.tertiary" display="flex" flexDirection="column" style={{ flexShrink: 0, width: 220 }}>
			<Box borderB="1" borderColor="border.tertiary" px="16" py="12">
				<Text color="fg.default" fontSize="md" fontWeight="600">Filters</Text>
			</Box>
			<Box display="flex" flexDirection="column" gap="0" px="12" py="8">
				<Button appearance="subtle" size="sm" style={{ alignSelf: "flex-start" }} onClick={() => setOpenSections(new Set())}>
					Collapse All
				</Button>
				{sections.map((section) => {
					const open = openSections.has(section.id);
					return (
						<Box key={section.id} borderT="1" borderColor="border.tertiary" py="10">
							<Box
								alignItems="center"
								display="flex"
								gap="8"
								role="button"
								tabIndex={0}
								style={{ cursor: "pointer" }}
								onClick={() => toggleSection(section.id)}
								onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggleSection(section.id); } }}
							>
								{open ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
								<Text color="fg.default" fontSize="sm">{section.title}</Text>
							</Box>
							{open && (
								<Box display="flex" flexDirection="column" gap="8" style={{ paddingTop: 10 }}>
									{section.items.map((item) => (
										<Box key={item} alignItems="center" display="flex" gap="8" px="4">
											<Checkbox
												checked={selected.has(`${section.id}:${item}`)}
												onCheckedChange={() => onToggleValue(`${section.id}:${item}`)}
											/>
											<Text color="fg.secondary" fontSize="sm">{item}</Text>
										</Box>
									))}
								</Box>
							)}
						</Box>
					);
				})}
			</Box>
		</Box>
	);
}
