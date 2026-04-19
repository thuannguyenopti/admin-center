"use client";

import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from "@xyflow/react";
import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";

export function FormConditionEdge({
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	style = {},
	markerEnd,
	label,
}: EdgeProps) {
	const [edgePath, labelX, labelY] = getSmoothStepPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});

	return (
		<>
			<BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
			{label && (
				<EdgeLabelRenderer>
					<div
						style={{
							position: "absolute",
							transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
							pointerEvents: "all",
						}}
						className="nodrag nopan"
					>
						<Box bg="bg.default" px="4" rounded="sm" border="1" borderColor="border.accent">
							<Text fontSize="xs" fontWeight="700" color="fg.accent">
								{label as string}
							</Text>
						</Box>
					</div>
				</EdgeLabelRenderer>
			)}
		</>
	);
}
