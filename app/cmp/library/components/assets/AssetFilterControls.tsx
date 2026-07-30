"use client";

import { Box, Button, Checkbox, SearchInput, Text } from "@optiaxiom/react";
import {
	IconCalendar,
	IconGlobe,
	IconSearch,
	IconStar,
} from "@optimizely/axiom-icons";
import { peopleItems } from "../people/data";
import type { FilterSection } from "./assetFilterData";

export function CheckboxFilter({
	section,
	selected,
	onToggleValue,
}: {
	section: FilterSection;
	selected: Set<string>;
	onToggleValue: (value: string) => void;
}) {
	return (
		<>
			<Button appearance="subtle" size="sm">
				Select All
			</Button>
			{section.searchable ? (
				<SearchInput placeholder="Search..." size="md" value="" onChange={() => {}} />
			) : null}
			{section.items?.map((item) => (
				<CheckboxRow
					key={`${section.id}-${item}`}
					label={item}
					checked={selected.has(`${section.id}:${item}`)}
					onCheckedChange={() => onToggleValue(`${section.id}:${item}`)}
				/>
			))}
			{section.showAll ? (
				<Button appearance="subtle" size="sm">
					Show All
				</Button>
			) : null}
		</>
	);
}

export function PeopleFilter({
	people,
	selected,
	onToggleValue,
}: {
	people: typeof peopleItems;
	selected: Set<string>;
	onToggleValue: (value: string) => void;
}) {
	return (
		<>
			<Button appearance="subtle" size="sm">
				Select All
			</Button>
			<SearchInput placeholder="Search people..." size="md" value="" onChange={() => {}} />
			<CheckboxRow
				label="Unnamed faces"
				checked={selected.has("people:unnamed")}
				onCheckedChange={() => onToggleValue("people:unnamed")}
			/>
			<CheckboxRow
				label="Multiple detected people"
				checked={selected.has("people:multiple")}
				onCheckedChange={() => onToggleValue("people:multiple")}
			/>
			{people.map((person) => (
				<CheckboxRow
					key={person.id}
					label={person.name}
					thumbnail={person.image}
					checked={selected.has(`people:${person.id}`)}
					onCheckedChange={() => onToggleValue(`people:${person.id}`)}
				/>
			))}
			<Button appearance="subtle" size="sm">
				Show All
			</Button>
		</>
	);
}

export function QuickFilter({
	selected,
	onToggleValue,
}: {
	selected: Set<string>;
	onToggleValue: (value: string) => void;
}) {
	return (
		<Box alignItems="center" display="flex" gap="8" px="4">
			<IconStar size={14} style={{ color: "var(--ax-colors-fg-secondary)" }} />
			<Checkbox
				checked={selected.has("quick:starred")}
				onCheckedChange={() => onToggleValue("quick:starred")}
			>
				Starred
			</Checkbox>
		</Box>
	);
}

export function DateField() {
	return (
		<Box
			alignItems="center"
			border="1"
			borderColor="border.control"
			display="flex"
			gap="8"
			px="10"
			py="8"
			rounded="md"
		>
			<IconCalendar size={14} style={{ color: "var(--ax-colors-fg-secondary)" }} />
			<Text fontSize="sm" color="fg.secondary">
				All time
			</Text>
		</Box>
	);
}

export function CampaignSelector() {
	return (
		<Button appearance="default" size="sm" icon={<IconSearch size={14} />} iconPosition="start">
			Select Campaigns
		</Button>
	);
}

function CheckboxRow({
	label,
	thumbnail,
	checked,
	onCheckedChange,
}: {
	label: string;
	thumbnail?: string;
	checked: boolean;
	onCheckedChange: () => void;
}) {
	return (
		<Box alignItems="center" display="flex" gap="8" px="4">
			<Checkbox checked={checked} onCheckedChange={onCheckedChange} />
			{thumbnail ? (
				<Box
					bg="bg.secondary"
					rounded="full"
					style={{ height: 20, overflow: "hidden", width: 20, flexShrink: 0 }}
				>
					<img
						alt=""
						src={thumbnail}
						style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }}
					/>
				</Box>
			) : label === "MTG4" ? (
				<IconGlobe size={14} style={{ color: "var(--ax-colors-fg-secondary)" }} />
			) : null}
			<Text fontSize="sm" color="fg.secondary" style={{ lineHeight: "20px" }}>
				{label}
			</Text>
		</Box>
	);
}
