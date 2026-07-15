"use client";

import { Badge, Box, Checkbox } from "@optiaxiom/react";
import {
	IconArrowRight,
	IconArrowUpRightFromSquare,
	IconCheck,
	IconCircleQuestion,
} from "@optimizely/axiom-icons";
import { FaceBoundingBox } from "./FaceBoundingBox";
import type { PersonItem } from "./types";

type Props = {
	person: PersonItem;
	hovered: boolean;
	isDragActive: boolean;
	isDragTarget: boolean;
	isEditing: boolean;
	isNamed: boolean;
	selected?: boolean;
	selectable?: boolean;
	onOpenProfile?: (person: PersonItem) => void;
	onSelect?: () => void;
};

export function PersonCardMedia({
	person,
	hovered,
	isDragActive,
	isDragTarget,
	isEditing,
	isNamed,
	selected = false,
	selectable = false,
	onOpenProfile,
	onSelect,
}: Props) {
	const primaryBox = person.faceBoxes[0];

	return (
		<Box
			bg="bg.secondary"
			style={{
				aspectRatio: "1 / 1",
				overflow: "hidden",
				position: "relative",
				width: "100%",
			}}
		>
			{person.image ? (
				<img
					alt={person.name}
					src={person.image}
					style={{
						display: "block",
						filter: isNamed ? "none" : "saturate(0.7)",
						height: "100%",
						objectFit: "cover",
						objectPosition: primaryBox
							? `${primaryBox.left + primaryBox.width / 2}% ${primaryBox.top + primaryBox.height / 2}%`
							: "center 20%",
						transition: "filter 0.15s ease",
						width: "100%",
					}}
				/>
			) : null}

			{!isNamed ? <FaceBoundingBox boxes={person.faceBoxes} tone="warning" /> : null}

			<Box style={{ left: 8, position: "absolute", top: 8 }}>
				<Badge intent="neutral">{person.appearsInAssets}</Badge>
			</Box>

			{selectable ? (
				<Box
					style={{
						opacity: hovered || selected ? 1 : 0,
						position: "absolute",
						right: 8,
						top: 8,
						transition: "opacity 0.15s ease",
					}}
					onClick={(event) => event.stopPropagation()}
				>
					<Checkbox
						checked={selected}
						aria-label={`Select ${person.name}`}
						onCheckedChange={onSelect}
					/>
				</Box>
			) : null}

			{!isNamed && (
				<Box
					alignItems="center"
					display="flex"
					gap="4"
					style={{
						background: "rgba(0,0,0,0.52)",
						backdropFilter: "blur(4px)",
						borderRadius: 20,
						bottom: 8,
						color: "#fff",
						fontSize: 11,
						fontWeight: 500,
						left: 8,
						padding: "3px 8px",
						position: "absolute",
					}}
				>
					<IconCircleQuestion size={11} />
					<span>Unnamed</span>
				</Box>
			)}

			{!isNamed && hovered && !isEditing && !selectable && (
				<Box
					alignItems="center"
					display="flex"
					justifyContent="center"
					style={{
						background: "rgba(0,0,0,0.52)",
						backdropFilter: "blur(4px)",
						borderRadius: 6,
						color: "#fff",
						cursor: "pointer",
						height: 28,
						position: "absolute",
						right: 8,
						top: 8,
						width: 28,
					}}
					onClick={(event) => {
						event.stopPropagation();
						onOpenProfile?.(person);
					}}
				>
					<IconArrowUpRightFromSquare size={13} />
				</Box>
			)}

			{isNamed && hovered && !isDragActive && (
				<Box
					alignItems="center"
					display="flex"
					gap="4"
					justifyContent="center"
					style={{
						background: "rgba(0,0,0,0.35)",
						bottom: 0,
						left: 0,
						position: "absolute",
						right: 0,
						top: 0,
					}}
				>
					<Box
						alignItems="center"
						display="flex"
						gap="6"
						style={{
							background: "rgba(255,255,255,0.92)",
							borderRadius: 20,
							color: "var(--ax-colors-fg-default)",
							fontSize: 12,
							fontWeight: 600,
							padding: "5px 12px",
						}}
					>
						<span>See related</span>
						<IconArrowRight size={12} />
					</Box>
				</Box>
			)}

			{isDragTarget && (
				<Box
					alignItems="center"
					display="flex"
					gap="4"
						justifyContent="center"
						style={{
							backgroundColor: "color-mix(in srgb, var(--ax-colors-border-secondary) 30%, transparent)",
							bottom: 0,
						left: 0,
						position: "absolute",
						right: 0,
						top: 0,
					}}
				>
					<Box
						alignItems="center"
						display="flex"
						gap="6"
						style={{
								background: "rgba(255,255,255,0.95)",
								borderRadius: 20,
								color: "var(--ax-colors-fg-default)",
								fontSize: 12,
							fontWeight: 700,
							padding: "5px 12px",
						}}
					>
						<IconCheck size={12} />
						<span>Merge as {person.name}</span>
					</Box>
				</Box>
			)}
		</Box>
	);
}
