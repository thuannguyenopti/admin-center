import React from "react";
import type { GrammarError } from "../ProofreadingProvider";
import { ErrorUnderline } from "../ErrorUnderline";

interface TextSegment {
	text: string;
	errors: GrammarError[];
	start: number;
	end: number;
}

export function renderTextWithErrors(
	text: string,
	errors: GrammarError[],
	onApplySuggestion: (error: GrammarError) => void
): React.ReactNode[] {
	if (!errors.length || !text) {
		return [text];
	}

	// Create segments from error boundaries
	const boundaries = new Set<number>([0, text.length]);
	errors.forEach(error => {
		boundaries.add(error.start);
		boundaries.add(error.end);
	});

	const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b);
	const segments: TextSegment[] = [];

	for (let i = 0; i < sortedBoundaries.length - 1; i++) {
		const start = sortedBoundaries[i];
		const end = sortedBoundaries[i + 1];
		const segmentText = text.substring(start, end);

		// Find errors that cover this segment
		const segmentErrors = errors.filter(
			error => error.start <= start && error.end >= end
		);

		segments.push({ text: segmentText, errors: segmentErrors, start, end });
	}

	// Render segments
	return segments.map((segment, idx) => {
		if (segment.errors.length === 0) {
			return <React.Fragment key={idx}>{segment.text}</React.Fragment>;
		}

		// Has errors - render with ErrorUnderline component (has popover)
		return (
			<ErrorUnderline
				key={idx}
				errors={segment.errors}
				text={segment.text}
				onApply={onApplySuggestion}
			/>
		);
	});
}
