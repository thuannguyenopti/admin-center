"use client";

import React from "react";
import { Box, Button } from "@optiaxiom/react";
import { AdaptiveBlock } from "../AdaptiveBlock";
import type { AdaptiveBlockComponentProps } from "../AdaptiveBlockRegistry";

export type DuplicateGroup = {
	fieldIds: string[];
	labels: string[];
};

export type OptimizeSuggestion = {
	id: string;
	type: "reorder" | "group" | "simplify_logic" | "ux_risk";
	message: string;
	nodeIds?: string[];
};

export type FormOptimizeBlockMetadata = {
	blockType: "form-optimize";
	duplicates: DuplicateGroup[];
	suggestions: OptimizeSuggestion[];
};

export const FormOptimizeBlock: React.FC<AdaptiveBlockComponentProps> = ({ metadata }) => {
	const { duplicates, suggestions } = metadata as FormOptimizeBlockMetadata;
	const [dismissed, setDismissed] = React.useState<Set<string>>(new Set());
	const [applied, setApplied] = React.useState<Set<string>>(new Set());

	const visibleDuplicates = duplicates.filter((_, i) => !dismissed.has(`dup-${i}`) && !applied.has(`dup-${i}`));
	const visibleSuggestions = suggestions.filter((s) => !dismissed.has(s.id) && !applied.has(s.id));

	const dismiss = (key: string) => setDismissed((prev) => new Set([...prev, key]));
	const apply = (key: string) => setApplied((prev) => new Set([...prev, key]));

	const hasAnything = visibleDuplicates.length > 0 || visibleSuggestions.length > 0;

	return (
		<AdaptiveBlock title="Form optimization">
			<Box display="flex" flexDirection="column" gap="8">
				{visibleDuplicates.map((group, i) => (
					<Box
						key={`dup-${i}`}
						p="12"
						rounded="sm"
						display="flex"
						flexDirection="column"
						gap="8"
						style={{
							background: "var(--ax-colors-bg-warning-subtle, #fefce8)",
							border: "1px solid var(--ax-colors-border-warning, #fde047)",
						}}
					>
						<Box style={{ fontSize: "13px", color: "var(--ax-colors-fg-default)" }}>
							⚠️ <strong>{group.labels.join(" · ")}</strong> — consider consolidating into one field.
						</Box>
						<Box display="flex" gap="8">
							<Button size="sm" appearance="default" onClick={() => apply(`dup-${i}`)}>
								Apply
							</Button>
							<Button size="sm" appearance="subtle" onClick={() => dismiss(`dup-${i}`)}>
								Dismiss
							</Button>
						</Box>
					</Box>
				))}

				{visibleSuggestions.map((s) => (
					<Box
						key={s.id}
						p="12"
						rounded="sm"
						display="flex"
						flexDirection="column"
						gap="8"
						style={{
							background: "var(--ax-colors-bg-secondary)",
							border: "1px solid var(--ax-colors-border-tertiary)",
						}}
					>
						<Box style={{ fontSize: "13px", color: "var(--ax-colors-fg-default)" }}>
							{s.message}
						</Box>
						<Box display="flex" gap="8">
							<Button size="sm" appearance="default" onClick={() => apply(s.id)}>
								Apply
							</Button>
							<Button size="sm" appearance="subtle" onClick={() => dismiss(s.id)}>
								Dismiss
							</Button>
						</Box>
					</Box>
				))}

				{!hasAnything && (
					<Box style={{ fontSize: "13px", color: "var(--ax-colors-fg-secondary)" }}>
						No improvements suggested. Your form looks well-structured!
					</Box>
				)}
			</Box>
		</AdaptiveBlock>
	);
};
