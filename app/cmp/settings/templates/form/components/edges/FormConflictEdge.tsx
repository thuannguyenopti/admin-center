"use client";

import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

export function FormConflictEdge({
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	style = {},
	markerEnd,
	data,
}: EdgeProps) {
	const severity = (data as any)?.conflictSeverity ?? "warning";
	const color = severity === "error" ? "#dc2626" : "#ca8a04";
	const bgColor = severity === "error" ? "#fef2f2" : "#fefce8";

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
			<BaseEdge
				path={edgePath}
				markerEnd={markerEnd}
				style={{ ...style, stroke: color, strokeWidth: 2, strokeDasharray: "4 2" }}
			/>
			<EdgeLabelRenderer>
				<div
					style={{
						position: "absolute",
						transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
						pointerEvents: "none",
						zIndex: 10,
					}}
				>
					<div
						style={{
							background: bgColor,
							border: `1.5px solid ${color}`,
							borderRadius: "50%",
							width: 20,
							height: 20,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: 11,
							fontWeight: 700,
							color,
							boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
						}}
					>
						⚠
					</div>
				</div>
			</EdgeLabelRenderer>
		</>
	);
}
