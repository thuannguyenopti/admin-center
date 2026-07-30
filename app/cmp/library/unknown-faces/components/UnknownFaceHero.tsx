"use client";

import { Box, Text } from "@optiaxiom/react";
import { IconCircleQuestion, IconUserPlus } from "@optimizely/axiom-icons";
import { FaceBoundingBox } from "../../components/people/FaceBoundingBox";
import type { UnknownFace } from "../data";

type FaceBox = UnknownFace["faceBox"];

type Props = {
	face: UnknownFace;
	manualBox: FaceBox | null;
	onPlaceManualBox: (box: FaceBox) => void;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function UnknownFaceHero({ face, manualBox, onPlaceManualBox }: Props) {
	const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
		const rect = event.currentTarget.getBoundingClientRect();
		const x = ((event.clientX - rect.left) / rect.width) * 100;
		const y = ((event.clientY - rect.top) / rect.height) * 100;

		onPlaceManualBox({
			left: clamp(x - 6, 2, 86),
			top: clamp(y - 8, 2, 82),
			width: 12,
			height: 16,
		});
	};

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			overflow="hidden"
			rounded="md"
			style={{ position: "relative", aspectRatio: "16 / 10", cursor: "crosshair" }}
			onClick={handleClick}
		>
			<img
				alt={face.label}
				src={face.heroImage}
				style={{
					display: "block",
					height: "100%",
					width: "100%",
					objectFit: "cover",
				}}
			/>
			<FaceBoundingBox
				boxes={manualBox ? [face.faceBox, manualBox] : [face.faceBox]}
				cornerStyle="frame"
			/>

			<Box
				alignItems="center"
				bg="bg.overlay"
				color="fg.white"
				display="flex"
				gap="6"
				px="10"
				py="4"
				rounded="full"
				style={{
					position: "absolute",
					top: 12,
					left: 12,
					backdropFilter: "blur(4px)",
				}}
			>
				<IconCircleQuestion size={12} />
				<Text fontSize="sm" color="fg.white" fontWeight="500">
					{face.label}
				</Text>
			</Box>

			<Box
				alignItems="center"
				bg="bg.default"
				border="1"
				borderColor="border.tertiary"
				display="flex"
				gap="6"
				px="10"
				py="6"
				rounded="full"
				style={{
					position: "absolute",
					right: 12,
					top: 12,
					boxShadow: "var(--ax-shadows-sm)",
				}}
			>
				<IconUserPlus size={14} style={{ color: "var(--ax-colors-fg-accent)" }} />
				<Text fontSize="sm" fontWeight="500">
					Click image to tag another face
				</Text>
			</Box>

			{manualBox ? (
				<Box
					bg="bg.default"
					border="1"
					borderColor="border.accent"
					px="8"
					py="4"
					rounded="full"
					style={{
						position: "absolute",
						left: `${manualBox.left}%`,
						top: `calc(${manualBox.top}% + ${manualBox.height}% + 8px)`,
						boxShadow: "var(--ax-shadows-sm)",
					}}
				>
					<Text fontSize="sm" fontWeight="600">
						New face tag
					</Text>
				</Box>
			) : null}
		</Box>
	);
}
