"use client";

import { useState } from "react";
import { Box } from "@optiaxiom/react";
import { PersonCardFooter } from "./PersonCardFooter";
import { PersonCardMedia } from "./PersonCardMedia";
import type { PersonItem } from "./types";

type Props = {
	person: PersonItem;
	isDragging?: boolean;
	isDragTarget?: boolean;
	isDragActive?: boolean;
	selected?: boolean;
	selectable?: boolean;
	onOpenProfile?: (person: PersonItem) => void;
	onConfirmName?: (name: string) => void;
	onDragStart?: () => void;
	onDragEnd?: () => void;
	onDragEnterTarget?: () => void;
	onDragLeaveTarget?: () => void;
	onDrop?: () => void;
	onSelect?: () => void;
};

export function PersonCard({
	person,
	isDragging = false,
	isDragTarget = false,
	isDragActive = false,
	selected = false,
	selectable = false,
	onOpenProfile,
	onConfirmName,
	onDragStart,
	onDragEnd,
	onDragEnterTarget,
	onDragLeaveTarget,
	onDrop,
	onSelect,
}: Props) {
	const [hovered, setHovered] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [draftName, setDraftName] = useState("");
	const isNamed = person.status === "named";
	const canDrop = isNamed && isDragActive && !isDragging;
	const canDrag = !isNamed;

	const startEditing = () => {
		setDraftName("");
		setIsEditing(true);
	};

	const confirmEdit = () => {
		if (draftName.trim()) {
			onConfirmName?.(draftName.trim());
		}
		setIsEditing(false);
		setDraftName("");
	};

	const cancelEdit = () => {
		setIsEditing(false);
		setDraftName("");
	};

	const handleCardClick = () => {
		if (isEditing) return;
		if (isNamed) {
			onOpenProfile?.(person);
			return;
		}
		startEditing();
	};

	const handleDragOver = (event: React.DragEvent) => {
		if (!canDrop) return;
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	};

	const handleDragEnter = (event: React.DragEvent) => {
		if (!canDrop) return;
		event.preventDefault();
		onDragEnterTarget?.();
	};

	const handleDragLeave = (event: React.DragEvent) => {
		if (!event.currentTarget.contains(event.relatedTarget as Node)) {
			onDragLeaveTarget?.();
		}
	};

	const handleDropEvent = (event: React.DragEvent) => {
		if (!canDrop) return;
		event.preventDefault();
		onDrop?.();
	};

	const borderColor = isDragTarget || selected
		? "border.secondary"
		: hovered
			? "border.secondary"
			: "border.tertiary";

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor={borderColor}
			className="cmp-library-person-card"
			display="flex"
			draggable={canDrag}
			flexDirection="column"
			overflow="hidden"
			role={isEditing ? undefined : "button"}
			rounded="md"
				shadow={hovered || isDragTarget || selected ? "md" : "sm"}
				tabIndex={isEditing ? undefined : 0}
				style={{
					boxShadow: isDragTarget || selected ? "0 0 0 2px var(--ax-colors-border-secondary)" : undefined,
				cursor: isEditing ? "default" : isDragging ? "grabbing" : canDrag ? "grab" : "pointer",
				opacity: isDragging ? 0.45 : 1,
				transform: hovered && !isDragging && !isDragActive ? "translateY(-1px)" : "none",
				transition: "border-color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease, transform 0.15s ease",
			}}
			onClick={handleCardClick}
			onDragEnd={onDragEnd}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
			onDragStart={(event) => {
				if (!canDrag) return;
				event.dataTransfer.effectAllowed = "move";
				event.dataTransfer.setData("text/plain", person.id);
				onDragStart?.();
			}}
			onDrop={handleDropEvent}
			onKeyDown={(event) => {
				if (isEditing) return;
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					handleCardClick();
				}
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<PersonCardMedia
				person={person}
				hovered={hovered}
				isDragActive={isDragActive}
				isDragTarget={isDragTarget}
				isEditing={isEditing}
				isNamed={isNamed}
				selected={selected}
				selectable={selectable}
				onOpenProfile={onOpenProfile}
				onSelect={onSelect}
			/>
			<PersonCardFooter
				draftName={draftName}
				hovered={hovered}
				isEditing={isEditing}
				isNamed={isNamed}
				name={person.name}
				onCancelEdit={cancelEdit}
				onConfirmEdit={confirmEdit}
				onDraftNameChange={setDraftName}
			/>
		</Box>
	);
}
