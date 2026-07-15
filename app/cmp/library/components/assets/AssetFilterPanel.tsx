"use client";

import { useMemo, useState } from "react";
import { Box, Button, Text } from "@optiaxiom/react";
import { IconChevronDown, IconChevronRight } from "@optimizely/axiom-icons";
import { peopleItems } from "../people/data";
import {
	CampaignSelector,
	CheckboxFilter,
	DateField,
	PeopleFilter,
	QuickFilter,
} from "./AssetFilterControls";
import { FILTER_SECTIONS, type FilterSection } from "./assetFilterData";

type Props = {
	open: boolean;
	/** Omit for an uncontrolled panel (its own local selection, not wired to any grid) — pass both to control filtering from the parent. */
	selected?: Set<string>;
	onToggleValue?: (value: string) => void;
};

export function AssetFilterPanel({ open, selected: selectedProp, onToggleValue: onToggleValueProp }: Props) {
	const [openSections, setOpenSections] = useState<Set<string>>(
		() => new Set(FILTER_SECTIONS.filter((section) => section.defaultOpen).map((section) => section.id)),
	);
	const [internalSelected, setInternalSelected] = useState<Set<string>>(() => new Set());
	const selected = selectedProp ?? internalSelected;
	const onToggleValue =
		onToggleValueProp ??
		((value: string) => {
			setInternalSelected((current) => {
				const next = new Set(current);
				if (next.has(value)) next.delete(value);
				else next.add(value);
				return next;
			});
		});
	const people = useMemo(
		() =>
			[...peopleItems]
				.filter((person) => person.status === "named")
				.sort((a, b) => b.appearsInAssets - a.appearsInAssets)
				.slice(0, 7),
		[],
	);

	const toggleSection = (id: string) => {
		setOpenSections((current) => {
			const next = new Set(current);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	return (
		<Box
			aria-hidden={!open}
			style={{
				flex: open ? "0 0 252px" : "0 0 0px",
				maxWidth: open ? 252 : 0,
				opacity: open ? 1 : 0,
				overflow: "hidden",
				transform: open ? "translateX(0)" : "translateX(-12px)",
				transition:
					"max-width 240ms ease, flex-basis 240ms ease, opacity 180ms ease, transform 240ms ease",
			}}
		>
			<Box
				bg="bg.default"
				border="1"
				borderColor="border.tertiary"
				display="flex"
				flexDirection="column"
				style={{ height: "calc(100vh - 230px)", minHeight: 520, width: 252 }}
			>
				<Box borderB="1" borderColor="border.tertiary" px="20" py="16">
					<Text fontSize="md" fontWeight="600">
						Filters
					</Text>
				</Box>

				<Box display="flex" flexDirection="column" gap="0" overflow="auto" px="16" py="8">
					<Button appearance="subtle" size="sm" onClick={() => setOpenSections(new Set())}>
						Collapse All
					</Button>

					{FILTER_SECTIONS.map((section) => (
						<FilterSectionView
							key={section.id}
							section={section}
							open={openSections.has(section.id)}
							people={people}
							selected={selected}
							onToggleOpen={() => toggleSection(section.id)}
							onToggleValue={onToggleValue}
						/>
					))}
				</Box>
			</Box>
		</Box>
	);
}

function FilterSectionView({
	section,
	open,
	people,
	selected,
	onToggleOpen,
	onToggleValue,
}: {
	section: FilterSection;
	open: boolean;
	people: typeof peopleItems;
	selected: Set<string>;
	onToggleOpen: () => void;
	onToggleValue: (value: string) => void;
}) {
	return (
		<Box borderT="1" borderColor="border.tertiary" py="10">
			<Box
				alignItems="center"
				display="flex"
				gap="8"
				role="button"
				tabIndex={0}
				style={{ cursor: "pointer" }}
				onClick={onToggleOpen}
				onKeyDown={(event) => {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						onToggleOpen();
					}
				}}
			>
				{open ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
				<Text fontSize="sm" color="fg.default">
					{section.title}
				</Text>
			</Box>

			<Box
				display="flex"
				flexDirection="column"
				gap="8"
				style={{
					maxHeight: open ? 520 : 0,
					opacity: open ? 1 : 0,
					overflow: "hidden",
					paddingTop: open ? 10 : 0,
					transition: "max-height 260ms ease, opacity 180ms ease, padding-top 220ms ease",
				}}
			>
				{section.type === "date" ? <DateField /> : null}
				{section.type === "people" ? (
					<PeopleFilter people={people} selected={selected} onToggleValue={onToggleValue} />
				) : null}
				{section.type === "quick" ? (
					<QuickFilter selected={selected} onToggleValue={onToggleValue} />
				) : null}
				{section.id === "campaigns" ? <CampaignSelector /> : null}
				{section.type === "checks" ? (
					<CheckboxFilter section={section} selected={selected} onToggleValue={onToggleValue} />
				) : null}
			</Box>
		</Box>
	);
}
