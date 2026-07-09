"use client";

import {Box, Text} from "@optiaxiom/react";
import {
	IconArrowUpRightFromSquare,
	IconBullseyePointer,
	IconCode,
	IconFileLines,
	IconImage,
} from "@optimizely/axiom-icons";

export type ArtifactRefType = "doc" | "code" | "image" | "audience";

function artifactRefIcon(type: ArtifactRefType, size = 18) {
	switch (type) {
		case "code":
			return <IconCode size={size} />;
		case "audience":
			return <IconBullseyePointer size={size} />;
		case "image":
			return <IconImage size={size} />;
		case "doc":
		default:
			return <IconFileLines size={size} />;
	}
}

export function ArtifactRefCard({
	title,
	subtitle,
	type,
	onClick,
}: {
	title: string;
	subtitle: string;
	type: ArtifactRefType;
	onClick?: () => void;
}) {
	return (
		<Box
			rounded="md"
			px="12"
			py="10"
			display="flex"
			alignItems="center"
			gap="12"
			onClick={onClick}
			style={{
				background: "var(--ax-colors-bg-information-subtle)",
				cursor: onClick ? "pointer" : "default",
			}}
		>
			<Box
				style={{
					width: 36,
					height: 36,
					borderRadius: 6,
					background: "var(--ax-colors-bg-secondary)",
					color: "var(--ax-colors-fg-secondary)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexShrink: 0,
				}}
			>
				{artifactRefIcon(type)}
			</Box>
			<Box style={{minWidth: 0, flex: 1}}>
				<Text
					fontSize="sm"
					fontWeight="600"
					color="fg.default"
					style={{
						whiteSpace: "nowrap",
						overflow: "hidden",
						textOverflow: "ellipsis",
						display: "block",
					}}
				>
					{title}
				</Text>
				<Text
					fontSize="xs"
					color="fg.secondary"
					style={{
						whiteSpace: "nowrap",
						overflow: "hidden",
						textOverflow: "ellipsis",
						display: "block",
					}}
				>
					{subtitle}
				</Text>
			</Box>
			<IconArrowUpRightFromSquare
				size={16}
				style={{color: "var(--ax-colors-fg-secondary)", flexShrink: 0}}
			/>
		</Box>
	);
}
