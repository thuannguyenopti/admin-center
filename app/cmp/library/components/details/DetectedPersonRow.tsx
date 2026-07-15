"use client";

import { useState } from "react";
import { Box, Button, Input, Text } from "@optiaxiom/react";
import {
	IconCheck,
	IconPen,
	IconXmark,
} from "@optimizely/axiom-icons";
import type { DetectedPerson } from "./types";

type Props = {
	person: DetectedPerson;
	heroImage: string;
	variant?: "default" | "featured";
	onConfirmName?: (id: string, name: string) => void;
	onMarkNotThisPerson?: (id: string) => void;
};

export function DetectedPersonRow({
	person,
	heroImage,
	variant = "default",
	onConfirmName,
	onMarkNotThisPerson,
}: Props) {
	const [editing, setEditing] = useState(false);
	const [draftName, setDraftName] = useState(
		person.suggestedName ?? (person.isNamed ? person.displayName : ""),
	);
	const featured = variant === "featured";

	const confidenceColor =
		person.confidencePct >= 90
			? "var(--ax-colors-fg-success)"
			: person.confidencePct >= 75
				? "var(--ax-colors-fg-warning)"
				: "var(--ax-colors-fg-tertiary)";

	const handleConfirm = () => {
		if (draftName.trim()) {
			onConfirmName?.(person.id, draftName.trim());
			setEditing(false);
		}
	};

	const handleAcceptSuggestion = () => {
		if (!person.suggestedName) return;
		setDraftName(person.suggestedName);
		onConfirmName?.(person.id, person.suggestedName);
		setEditing(false);
	};

	return (
		<Box
			alignItems={featured ? "start" : "center"}
			bg="bg.default"
			border="1"
			borderColor={featured ? "border.secondary" : "border.tertiary"}
			display="flex"
			gap="12"
			px={featured ? "16" : "12"}
			py={featured ? "16" : "10"}
			rounded="md"
			style={{
				boxShadow: featured
					? "0 0 0 1px color-mix(in srgb, var(--ax-colors-border-secondary) 28%, transparent)"
					: undefined,
				transition: "border-color 0.15s",
			}}
		>
			{/* Face crop */}
			<Box
				bg="bg.secondary"
				rounded="md"
				style={{
					flexShrink: 0,
					height: featured ? 56 : 44,
					overflow: "hidden",
					position: "relative",
					width: featured ? 56 : 44,
				}}
			>
				<img
					alt={person.displayName}
					src={heroImage}
					style={{
						display: "block",
						height: "100%",
						objectFit: "cover",
						objectPosition: `${person.faceBox.left + person.faceBox.width / 2}% ${person.faceBox.top + person.faceBox.height / 2}%`,
						width: "100%",
					}}
				/>
				<Box
					aria-hidden
					style={{
						borderRadius: 4,
						boxShadow: "inset 0 0 0 2px var(--ax-colors-border-secondary)",
						inset: 0,
						position: "absolute",
					}}
				/>
			</Box>

			{/* Name + suggestion */}
			<Box display="flex" flex="1" flexDirection="column" gap="4" style={{ minWidth: 0 }}>
				{editing ? (
					<Box alignItems="center" display="flex" gap="6">
						<Input
							autoFocus
							placeholder="Name this person…"
							size="md"
							value={draftName}
							onChange={(e) => setDraftName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleConfirm();
								if (e.key === "Escape") setEditing(false);
							}}
							style={{ flex: 1 }}
						/>
						<Button
							appearance="primary"
							size="sm"
							icon={<IconCheck size={13} />}
							aria-label="Confirm"
							onClick={handleConfirm}
						/>
						<Button
							appearance="subtle"
							size="sm"
							icon={<IconXmark size={13} />}
							aria-label="Cancel"
							onClick={() => setEditing(false)}
						/>
					</Box>
				) : (
					<>
						<Text
							fontSize={featured ? "md" : "sm"}
							fontWeight={person.isNamed ? "600" : "500"}
							color={person.isNamed ? "fg.default" : "fg.secondary"}
							style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
						>
							{person.displayName}
						</Text>
						<Text fontSize="xs" color="fg.tertiary">
							{person.isNamed
								? "Confirmed identity"
								: person.suggestedName
									? `Suggested match: ${person.suggestedName}`
									: "Unidentified face"}
						</Text>
					</>
				)}

				{person.linkedAssets > 0 && !editing && (
					<Text fontSize="xs" color="fg.tertiary">
						Seen in {person.linkedAssets} {person.linkedAssets === 1 ? "asset" : "assets"}
					</Text>
				)}
			</Box>

			<Box
				alignItems="center"
				display="flex"
				gap="4"
				style={{ flexShrink: 0 }}
			>
				<Text
					fontSize="xs"
					fontWeight="500"
					style={{ color: confidenceColor, flexShrink: 0, minWidth: 34, textAlign: "right" }}
				>
					{person.confidencePct}%
				</Text>
				{person.suggestedName && !person.isNamed && !editing && (
					<Button
						appearance="primary"
						size="sm"
						icon={<IconCheck size={12} />}
						aria-label={`Accept ${person.suggestedName}`}
						onClick={handleAcceptSuggestion}
					>
						Accept
					</Button>
				)}
				{!editing && (
					<Button
						appearance="subtle"
						size="sm"
						icon={<IconPen size={12} />}
						aria-label="Edit name"
						onClick={() => setEditing(true)}
					/>
				)}
				<Button
					appearance="subtle"
					size="sm"
					icon={<IconXmark size={12} />}
					aria-label="Remove detection"
					onClick={() => onMarkNotThisPerson?.(person.id)}
				/>
			</Box>
		</Box>
	);
}
