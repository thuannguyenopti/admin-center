"use client";

import { Box, Text } from "@optiaxiom/react";
import { FaceBoundingBox } from "../../components/people/FaceBoundingBox";
import type { UnknownFace } from "../data";

type Props = {
	face: UnknownFace;
};

export function QueueCard({ face }: Props) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			overflow="hidden"
			rounded="md"
			style={{
				width: 132,
				flexShrink: 0,
				aspectRatio: "1.4 / 1",
				position: "relative",
			}}
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
			<FaceBoundingBox boxes={[face.faceBox]} cornerStyle="rect" />
			<Box
				alignItems="center"
				bg="bg.overlay"
				color="fg.white"
				display="flex"
				gap="4"
				px="6"
				py="2"
				rounded="sm"
				style={{
					position: "absolute",
					left: 6,
					right: 6,
					bottom: 6,
				}}
			>
				<Text fontSize="sm" color="fg.white" fontWeight="500">
					{face.label}
				</Text>
			</Box>
		</Box>
	);
}
