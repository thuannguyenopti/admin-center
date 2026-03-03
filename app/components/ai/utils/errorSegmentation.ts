import type { GrammarError } from "../ProofreadingProvider";

export interface TextSegment {
	content: string;
	start: number;
	end: number;
	errors: GrammarError[];
}

/**
 * Split text into segments based on error ranges, handling overlapping errors
 * @param text The full text content
 * @param errors Array of grammar errors with start/end positions
 * @returns Array of text segments with associated errors
 */
export function splitTextWithErrors(text: string, errors: GrammarError[]): TextSegment[] {
	if (errors.length === 0) {
		return [{
			content: text,
			start: 0,
			end: text.length,
			errors: []
		}];
	}

	// Collect all boundary points (start and end of each error)
	const boundaries = new Set<number>([0, text.length]);
	errors.forEach(error => {
		boundaries.add(error.start);
		boundaries.add(error.end);
	});

	// Sort boundaries
	const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b);

	// Create segments between consecutive boundaries
	const segments: TextSegment[] = [];
	for (let i = 0; i < sortedBoundaries.length - 1; i++) {
		const start = sortedBoundaries[i];
		const end = sortedBoundaries[i + 1];
		const content = text.substring(start, end);

		// Skip empty segments
		if (content.length === 0) continue;

		// Find all errors that cover this segment
		const applicableErrors = errors.filter(
			err => err.start <= start && err.end >= end
		);

		segments.push({
			content,
			start,
			end,
			errors: applicableErrors
		});
	}

	return segments;
}
