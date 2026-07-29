"use client";

import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

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
	data,
}: EdgeProps) {
	const isHighlighted = (data as any)?.isHighlighted;

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
			{label && isHighlighted && (
				<EdgeLabelRenderer>
					<div
						style={{
							position: "absolute",
							transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
							pointerEvents: "all",
						}}
						className="nodrag nopan"
					>
						<div
							style={{
								background: "var(--ax-colors-bg-accent)",
								borderRadius: 999,
								padding: "4px 12px",
								boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
							}}
						>
							<span
								style={{
									color: "#fff",
									fontSize: "11px",
									fontWeight: 700,
									letterSpacing: "0.06em",
									textTransform: "uppercase",
								}}
							>
								{label as string}
							</span>
						</div>
					</div>
				</EdgeLabelRenderer>
			)}
		</>
	);
}
