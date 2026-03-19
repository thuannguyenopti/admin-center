import React from "react";
import type { GrammarError } from "../ProofreadingProvider";
import { ErrorUnderline } from "../ErrorUnderline";
import { splitTextWithErrors } from "./errorSegmentation";

/**
 * Convert text with grammar errors into React nodes with inline error highlighting
 * @param text The full text content
 * @param errors Array of grammar errors
 * @param onApplySuggestion Callback when user applies a suggestion
 * @returns Array of React nodes
 */
export function textToNodes(
	text: string,
	errors: GrammarError[],
	onApplySuggestion: (error: GrammarError) => void
): React.ReactNode[] {
	if (!text) return [];
	if (errors.length === 0) return [text];

	const segments = splitTextWithErrors(text, errors);

	return segments.map((segment, index) => {
		if (segment.errors.length === 0) {
			// Plain text segment
			return <React.Fragment key={index}>{segment.content}</React.Fragment>;
		}

		// Segment with errors - render with ErrorUnderline
		return (
			<ErrorUnderline
				key={index}
				errors={segment.errors}
				text={segment.content}
				onApply={onApplySuggestion}
			/>
		);
	});
}
