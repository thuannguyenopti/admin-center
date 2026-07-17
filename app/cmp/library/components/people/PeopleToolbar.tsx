"use client";

import { Box, Button, SearchInput } from "@optiaxiom/react";
import {
	IconArrowUp,
	IconChevronDown,
	IconCopy,
	IconGrid,
	IconSliders,
} from "@optimizely/axiom-icons";

type Props = {
	search: string;
	showFilters: boolean;
	onSearchChange: (search: string) => void;
	onToggleFilters: () => void;
};

export function PeopleToolbar({
	search,
	showFilters,
	onSearchChange,
	onToggleFilters,
}: Props) {
	return (
		<Box alignItems="center" display="flex" flexWrap="wrap" gap="8" pb="4" pt="20">
			<Button
				appearance={showFilters ? "primary" : "default"}
				aria-label="Filter people"
				aria-pressed={showFilters}
				icon={<IconSliders />}
				size="md"
				onClick={onToggleFilters}
			/>
			<Box style={{ width: 360 }}>
				<SearchInput
					placeholder={'Try "Maria", "women cyclist", "tour climb"...'}
					size="md"
					value={search}
					onChange={(event) => onSearchChange(event.target.value)}
				/>
			</Box>
			<Button appearance="default" aria-label="Duplicate view" icon={<IconCopy />} size="md" />
			<Button
				appearance="default"
				aria-label="View options"
				icon={<IconGrid />}
				iconPosition="start"
				size="md"
			>
				<IconChevronDown size={16} />
			</Button>
			<Button appearance="subtle" icon={<IconChevronDown />} iconPosition="end" size="md">
				Last Modified
			</Button>
			<Button appearance="subtle" aria-label="Sort ascending" icon={<IconArrowUp />} size="md" />
			<Box style={{ flex: 1 }} />
		</Box>
	);
}
