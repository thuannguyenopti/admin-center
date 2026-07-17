"use client";

import React from "react";
import { Box, Button } from "@optiaxiom/react";
import { AdaptiveBlock } from "../AdaptiveBlock";
import type { AdaptiveBlockComponentProps } from "../AdaptiveBlockRegistry";
import { useLayout } from "@/app/context/LayoutContext";
import type { FormConflict } from "@/app/cmp/settings/templates/form/utils/detectFormConflicts";

export type FormConflictsBlockMetadata = {
	blockType: "form-conflicts";
	conflicts: FormConflict[];
};

const SEVERITY_DOT: Record<string, string> = {
	error: "var(--ax-colors-fg-critical, #dc2626)",
	warning: "#ca8a04",
};

function fixDescription(conflict: FormConflict): string {
	if (!conflict.fix) return "Dismiss this issue";
	if (conflict.fix.type === "remove_edge") return "Remove the conflicting connection";
	if (conflict.fix.type === "delete_node") return "Remove the disconnected node";
	return "Apply fix";
}

export const FormConflictsBlock: React.FC<AdaptiveBlockComponentProps> = ({ metadata }) => {
	const { formBuilderControls: actions } = useLayout();
	const { conflicts } = metadata as FormConflictsBlockMetadata;

	const [dismissed, setDismissed] = React.useState<Set<string>>(new Set());
	const [applied, setApplied] = React.useState<Set<string>>(new Set());

	const visible = conflicts.filter((c) => !dismissed.has(c.id));
	const fixable = visible.filter((c) => c.fix && !applied.has(c.id));

	const applyFix = (conflict: FormConflict) => {
		if (!actions || !conflict.fix) return;
		if (conflict.fix.type === "remove_edge") actions.removeEdge(conflict.fix.edgeId);
		if (conflict.fix.type === "delete_node") actions.deleteNode(conflict.fix.nodeId);
		setApplied((prev) => new Set([...prev, conflict.id]));
	};

	const applyAll = () => {
		for (const conflict of fixable) applyFix(conflict);
	};

	if (visible.length === 0) {
		return (
			<AdaptiveBlock title="All issues resolved" >
				<Box style={{ fontSize: "13px", color: "var(--ax-colors-fg-secondary)" }}>
					Your form looks good — no issues remaining.
				</Box>
			</AdaptiveBlock>
		);
	}

	return (
		<AdaptiveBlock title={`${visible.length} issue${visible.length === 1 ? "" : "s"} found`} >
			<Box display="flex" flexDirection="column" gap="8">

				{/* Issue cards */}
				{visible.map((conflict) => {
					const dotColor = SEVERITY_DOT[conflict.severity] ?? SEVERITY_DOT.warning;
					const isApplied = applied.has(conflict.id);

					return (
						<Box
							key={conflict.id}
							rounded="sm"
							style={{
								border: "1px solid var(--ax-colors-border-tertiary)",
								overflow: "hidden",
							}}
						>
							{/* Message row */}
							<Box
								px="12"
								py="10"
								display="flex"
								alignItems="start"
								gap="8"
								style={{ background: "var(--ax-colors-bg-secondary)" }}
							>
								<Box style={{
									width: 6,
									height: 6,
									borderRadius: "50%",
									background: dotColor,
									flexShrink: 0,
									marginTop: 5,
								}} />
								<Box style={{ fontSize: 13, color: "var(--ax-colors-fg-default)", lineHeight: 1.5 }}>
									{conflict.message}
								</Box>
							</Box>

							{/* Fix row */}
							{conflict.fix && (
								<Box
									px="12"
									py="8"
									display="flex"
									alignItems="center"
									justifyContent="space-between"
									gap="8"
									style={{
										background: "var(--ax-colors-bg-default)",
										borderTop: "1px solid var(--ax-colors-border-tertiary)",
									}}
								>
									<Box style={{ fontSize: 12, color: "var(--ax-colors-fg-secondary)", flex: 1 }}>
										<span style={{ fontWeight: 600, color: "var(--ax-colors-fg-default)" }}>Suggested fix:</span>{" "}
										{fixDescription(conflict)}
									</Box>
									<Box display="flex" gap="6" style={{ flexShrink: 0 }}>
										{isApplied ? (
											<Box style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>✓ Applied</Box>
										) : (
											<>
												<Button
													size="sm"
													appearance="default"
													onClick={() => applyFix(conflict)}
													disabled={!actions}
												>
													Apply fix
												</Button>
												<Button
													size="sm"
													appearance="subtle"
													onClick={() => setDismissed((prev) => new Set([...prev, conflict.id]))}
												>
													Dismiss
												</Button>
											</>
										)}
									</Box>
								</Box>
							)}

							{/* No fix — dismiss only */}
							{!conflict.fix && !isApplied && (
								<Box
									px="12"
									py="8"
									display="flex"
									justifyContent="end"
									style={{ background: "var(--ax-colors-bg-default)", borderTop: "1px solid var(--ax-colors-border-tertiary)" }}
								>
									<Button
										size="sm"
										appearance="subtle"
										onClick={() => setDismissed((prev) => new Set([...prev, conflict.id]))}
									>
										Dismiss
									</Button>
								</Box>
							)}
						</Box>
					);
				})}

				{/* Apply all */}
				{fixable.length > 1 && (
					<Box display="flex" justifyContent="end" pt="4">
						<Button
							size="sm"
							appearance="default"
							onClick={applyAll}
							disabled={!actions}
						>
							Apply all {fixable.length} fixes
						</Button>
					</Box>
				)}
			</Box>
		</AdaptiveBlock>
	);
};
