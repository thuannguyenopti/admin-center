"use client";

import React from "react";
import { Box } from "@optiaxiom/react";
import { AdaptiveBlock } from "../AdaptiveBlock";
import type { AdaptiveBlockComponentProps } from "../AdaptiveBlockRegistry";
import { useLayout } from "@/app/context/LayoutContext";
import { WORK_REQUEST_FIELDS } from "@/app/cmp/settings/templates/form/data";
import type { Node } from "@xyflow/react";

export type FormGeneratedBlockMetadata = {
	blockType: "form-generated";
	fieldCount: number;
	sectionCount: number;
	nodes: Node[];
	edges?: any[];
};

function enrichNodes(rawNodes: Node[]): Node[] {
	const fieldMap = new Map(WORK_REQUEST_FIELDS.map((f) => [f.id, f]));
	return rawNodes.map((node) => {
		const fieldId = (node.data as any).fieldDefId;
		const fieldDef = fieldId ? fieldMap.get(fieldId) : undefined;
		return {
			...node,
			data: {
				...node.data,
				icon: fieldDef?.icon ?? null,
				typeLabel: fieldDef?.typeLabel ?? (node.data as any).typeLabel,
				required: fieldDef?.required ?? (node.data as any).required ?? false,
			},
		};
	});
}

export const FormGeneratedBlock: React.FC<AdaptiveBlockComponentProps> = ({ metadata }) => {
	const { formBuilderControls } = useLayout();
	const { fieldCount, sectionCount, nodes, edges = [] } = metadata as FormGeneratedBlockMetadata;
	const [applied, setApplied] = React.useState(false);

	const handleApply = () => {
		if (!formBuilderControls) return;
		const enriched = enrichNodes(nodes as Node[]);
		formBuilderControls.applyGraph(enriched, edges);
		setApplied(true);
	};

	return (
		<AdaptiveBlock title="Form generated">
			<Box display="flex" flexDirection="column" gap="12">
				<Box style={{ fontSize: "13px", color: "var(--ax-colors-fg-secondary)" }}>
					Generated <strong>{fieldCount} field{fieldCount !== 1 ? "s" : ""}</strong>
					{sectionCount > 0 && <> across <strong>{sectionCount} section{sectionCount !== 1 ? "s" : ""}</strong></>}.
				</Box>
				{applied ? (
					<Box style={{ fontSize: "13px", color: "#16a34a", fontWeight: 600 }}>
						✓ Applied to canvas
					</Box>
				) : (
					<button
						onClick={handleApply}
						disabled={!formBuilderControls}
						style={{
							padding: "6px 14px",
							background: "var(--ax-colors-bg-accent)",
							border: "none",
							borderRadius: "6px",
							fontSize: "13px",
							fontWeight: 600,
							color: "#fff",
							cursor: formBuilderControls ? "pointer" : "not-allowed",
							opacity: formBuilderControls ? 1 : 0.5,
							alignSelf: "flex-start",
						}}
					>
						Apply to canvas
					</button>
				)}
			</Box>
		</AdaptiveBlock>
	);
};
