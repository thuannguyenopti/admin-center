"use client";

import { useState } from "react";
import { Box, Button, Text } from "@optiaxiom/react";
import { IconUserGroup } from "@optimizely/axiom-icons";
import type { PersonItem } from "./types";

type Props = {
	people: PersonItem[];
	onOpenProfile?: (person: PersonItem) => void;
};

export function PopularFacesRail({ people, onOpenProfile }: Props) {
	const [expanded, setExpanded] = useState(false);
	const visiblePeople = expanded ? people : people.slice(0, 10);
	const hiddenCount = people.length - visiblePeople.length;

	return (
		<Box display="flex" flexDirection="column" gap="12">
			<Box alignItems="center" display="flex" gap="8" justifyContent="space-between">
				<Box alignItems="center" display="flex" gap="8">
					<IconUserGroup size={16} style={{ color: "var(--ax-colors-fg-secondary)" }} />
					<Text fontSize="sm" fontWeight="600" color="fg.default">
						Most recognized faces
					</Text>
				</Box>
				{people.length > 10 ? (
					<Button appearance="subtle" size="sm" onClick={() => setExpanded((value) => !value)}>
						{expanded ? "Show less" : `Show ${hiddenCount} more`}
					</Button>
				) : null}
			</Box>

			<Box display="flex" flexWrap="wrap" gap="16">
				{visiblePeople.map((person) => (
					<PopularFace
						key={person.id}
						person={person}
						onClick={() => onOpenProfile?.(person)}
					/>
				))}
			</Box>
		</Box>
	);
}

function PopularFace({
	person,
	onClick,
}: {
	person: PersonItem;
	onClick: () => void;
}) {
	const faceBox = person.faceBoxes[0];
	const firstName = person.name.split(" ")[0];

	return (
		<Box
			alignItems="center"
			display="flex"
			flexDirection="column"
			gap="6"
			role="button"
			tabIndex={0}
			style={{
				cursor: "pointer",
				flex: "0 0 auto",
				width: 74,
			}}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick();
				}
			}}
		>
				<Box
					bg="bg.secondary"
					border="2"
					borderColor="border.secondary"
					rounded="full"
				style={{
					height: 64,
					overflow: "hidden",
					width: 64,
				}}
			>
				{person.image ? (
					<img
						alt={person.name}
						src={person.image}
						style={{
							display: "block",
							height: "100%",
							objectFit: "cover",
							objectPosition: faceBox
								? `${faceBox.left + faceBox.width / 2}% ${faceBox.top + faceBox.height / 2}%`
								: "center",
							width: "100%",
						}}
					/>
				) : null}
			</Box>
			<Text
				fontSize="sm"
				fontWeight="500"
				color="fg.default"
				style={{
					maxWidth: 86,
					overflow: "hidden",
					textAlign: "center",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
				}}
			>
				{firstName}
			</Text>
		</Box>
	);
}
