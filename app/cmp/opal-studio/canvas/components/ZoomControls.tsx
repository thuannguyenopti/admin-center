"use client";

import { Box, Button, Text } from "@optiaxiom/react";
import {IconMinus, IconPlus, IconMaximize} from "@/app/lib/axiom-icons";

export function ZoomControls({
	zoom,
	onZoomIn,
	onZoomOut,
	onFit,
	bottomOffset = 160,
}: {
	zoom: number;
	onZoomIn: () => void;
	onZoomOut: () => void;
	onFit: () => void;
	bottomOffset?: number;
}) {
	return (
		<Box
			display="flex"
			alignItems="center"
			gap="4"
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			rounded="lg"
			shadow="md"
			style={{
				position: "absolute",
				bottom: bottomOffset + 20,
				left: 24,
				zIndex: 12,
				padding: "4px 6px",
			}}
		>
			<Button
				appearance="subtle"
				size="sm"
				icon={<IconMinus size={14} />}
				aria-label="Zoom out"
				onClick={onZoomOut}
			/>
			<Text
				fontSize="xs"
				fontWeight="600"
				color="fg.secondary"
				style={{ minWidth: 40, textAlign: "center", userSelect: "none" }}
			>
				{Math.round(zoom * 100)}%
			</Text>
			<Button
				appearance="subtle"
				size="sm"
				icon={<IconPlus size={14} />}
				aria-label="Zoom in"
				onClick={onZoomIn}
			/>
			<Box
				style={{ width: 1, height: 20 }}
				bg="bg.tertiary"
			/>
			<Button
				appearance="subtle"
				size="sm"
				icon={<IconMaximize size={14} />}
				aria-label="Fit to canvas"
				onClick={onFit}
			/>
		</Box>
	);
}
