"use client";

import { Box, Text } from "@optiaxiom/react";
import { PersonCard } from "./PersonCard";
import type { PersonItem } from "./types";

type GridProps = {
	items: PersonItem[];
	draggedId: string | null;
	dragTargetId: string | null;
	selectableIds?: Set<string>;
	selectedIds?: Set<string>;
	onOpenProfile?: (person: PersonItem) => void;
	onConfirmName: (id: string, name: string) => void;
	onDragStart: (id: string) => void;
	onDragEnd: () => void;
	onDragEnterTarget: (id: string) => void;
	onDragLeaveTarget: () => void;
	onDrop: (targetId: string) => void;
	onSelect?: (id: string) => void;
};

export function PeopleGrid({
	items,
	draggedId,
	dragTargetId,
	selectableIds,
	selectedIds,
	onOpenProfile,
	onConfirmName,
	onDragStart,
	onDragEnd,
	onDragEnterTarget,
	onDragLeaveTarget,
	onDrop,
	onSelect,
}: GridProps) {
	return (
		<Box
			display="grid"
			gap="16"
			style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
		>
			{items.map((person) => (
				<PersonCard
					key={person.id}
					person={person}
					isDragging={draggedId === person.id}
					isDragTarget={dragTargetId === person.id}
					isDragActive={draggedId !== null}
					selectable={selectableIds?.has(person.id) ?? false}
					selected={selectedIds?.has(person.id) ?? false}
					onOpenProfile={onOpenProfile}
					onConfirmName={(name) => onConfirmName(person.id, name)}
					onDragStart={() => onDragStart(person.id)}
					onDragEnd={onDragEnd}
					onDragEnterTarget={() => onDragEnterTarget(person.id)}
					onDragLeaveTarget={onDragLeaveTarget}
					onDrop={() => onDrop(person.id)}
					onSelect={onSelect ? () => onSelect(person.id) : undefined}
				/>
			))}
		</Box>
	);
}

export function PeopleSectionHeader({
	label,
	count,
	total,
	isSearching,
	muted = false,
}: {
	label: string;
	count: number;
	total: number;
	isSearching: boolean;
	muted?: boolean;
}) {
	return (
		<Box
			alignItems="center"
			borderB="1"
			borderColor="border.tertiary"
			display="flex"
			gap="10"
			pb="12"
		>
			<Text fontSize="md" fontWeight="600" color={muted ? "fg.secondary" : "fg.default"}>
				{label}
			</Text>
			<Box
				alignItems="center"
				display="flex"
				justifyContent="center"
					style={{
						background: muted
							? "var(--ax-colors-bg-tertiary)"
							: "var(--ax-colors-bg-secondary)",
						borderRadius: 10,
						color: muted
							? "var(--ax-colors-fg-secondary)"
							: "var(--ax-colors-fg-default)",
					fontSize: 12,
					fontWeight: 700,
					minWidth: 24,
					padding: "1px 8px",
				}}
			>
				{isSearching && count !== total ? `${count} / ${total}` : count}
			</Box>
		</Box>
	);
}
