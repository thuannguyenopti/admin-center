/** Parse the structured "Run the Experiment Creation agent" user message from the adaptive card. */
export function parseExperimentCreationRunMessage(content: string): {
	name: string;
	description: string;
	hypothesis: string;
	targetBy: string;
	destination: string;
	includeMetadata: boolean;
} {
	const name =
		content.match(/(?:^|\n)Name:\s*([^\n]+)/)?.[1]?.trim() || "New A/B test";
	const description =
		content
			.match(
				/(?:^|\n)Description:\s*([\s\S]*?)(?=\nHypothesis:|\nTarget by:|\nDestination:|\nURL:|\nInclude metadata:|$)/,
			)?.[1]
			?.trim() ?? "";
	const hypothesis =
		content
			.match(
				/(?:^|\n)Hypothesis:\s*([\s\S]*?)(?=\nTarget by:|\nDestination:|\nURL:|\nInclude metadata:|$)/,
			)?.[1]
			?.trim() ?? "";
	const targetBy = content.match(/(?:^|\n)Target by:\s*([^\n]+)/)?.[1]?.trim() ?? "";
	const destination =
		content
			.match(/(?:^|\n)(?:URL|Destination):\s*([\s\S]*?)(?=\nInclude metadata:|$)/)?.[1]
			?.trim() ?? "";
	const metaLine =
		content.match(/(?:^|\n)Include metadata in output:\s*([^\n]+)/)?.[1]?.toLowerCase() ?? "";
	const includeMetadata = metaLine.includes("yes");
	return { name, description, hypothesis, targetBy, destination, includeMetadata };
}

export function buildExperimentCreatedRationale(fields: {
	description: string;
	hypothesis: string;
	destination: string;
	targetBy: string;
}): string {
	const parts: string[] = [
		"It was set up from your draft context so you can move straight into building and QA.",
	];
	if (fields.hypothesis) {
		parts.push(`The hypothesis we captured—${fields.hypothesis.slice(0, 220)}${fields.hypothesis.length > 220 ? "…" : ""}—is attached to this experiment for your team to align on success criteria.`);
	}
	if (fields.destination) {
		parts.push(`Targeting is scoped to ${fields.targetBy || "your selection"}: ${fields.destination.slice(0, 180)}${fields.destination.length > 180 ? "…" : ""}.`);
	}
	if (fields.description) {
		parts.push(`Change summary: ${fields.description.slice(0, 160)}${fields.description.length > 160 ? "…" : ""}.`);
	}
	return parts.join("\n\n");
}
