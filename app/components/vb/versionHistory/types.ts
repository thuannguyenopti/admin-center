import type { Outline } from "@/app/db/initialData";

/**
 * A single version snapshot for version history.
 */
export type Version = {
	id: string;
	label: string;
	author: string;
	timestamp: Date;
	status: "draft" | "published" | "previously-published";
	variationId: string;
	variationName: string;
	/** The outlines snapshot for this version */
	outlines: Outline[];
	/** Optional custom name given by user */
	customName?: string;
	/** True for the current editing state (the live draft) */
	isCurrent?: boolean;
};

/**
 * Generate mock version history from the current page state.
 * In a real CMS this would come from the server.
 * Creates visibly different outlines for each version by mutating text properties.
 */
export function generateMockVersions(
	variations: { id: string; name: string; status: string; outlines?: Outline[]; data?: any }[] | undefined,
	pageOutlines: Outline[] | undefined,
): Version[] {
	const now = new Date();
	const versions: Version[] = [];

	const authors = ["Stefan Svebeck", "Craig Woollard", "Tien Le", "Sofia Kim"];
	const pickAuthor = (i: number) => authors[i % authors.length];

	// For each variation, create a set of versions
	const vars = variations ?? [{ id: "original", name: "Original", status: "Published", outlines: pageOutlines }];

	vars.forEach((v, vi) => {
		const baseOutlines = v.outlines ?? pageOutlines ?? [];

		// Draft = the current editing state (the real outlines the user is working on)
		versions.push({
			id: `ver-${v.id}-draft`,
			label: formatDate(now),
			author: pickAuthor(vi + 1),
			timestamp: now,
			status: "draft",
			variationId: v.id,
			variationName: v.name,
			outlines: baseOutlines,
			customName: "Current version",
			isCurrent: true,
		});

		// Published version — the last published snapshot (simulated as slightly different)
		versions.push({
			id: `ver-${v.id}-pub`,
			label: formatDate(new Date(now.getTime() - (vi * 3 + 2) * 86400000)),
			author: pickAuthor(vi),
			timestamp: new Date(now.getTime() - (vi * 3 + 2) * 86400000),
			status: "published",
			variationId: v.id,
			variationName: v.name,
			outlines: mutateOutlines(baseOutlines, "published"),
		});

		// Previously published versions — each progressively older / more different
		const prevLabels = [
			"Before hero redesign",
			"Updated CTA copy",
			undefined,
			"Initial layout",
			undefined,
		];
		for (let i = 0; i < 5; i++) {
			const daysAgo = (vi * 3 + 5) + i * 7;
			versions.push({
				id: `ver-${v.id}-prev-${i}`,
				label: formatDate(new Date(now.getTime() - daysAgo * 86400000)),
				author: pickAuthor(i),
				timestamp: new Date(now.getTime() - daysAgo * 86400000),
				status: "previously-published",
				variationId: v.id,
				variationName: v.name,
				outlines: mutateOutlines(baseOutlines, `prev-${i}`),
				customName: prevLabels[i],
			});
		}
	});

	return versions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Deep-clone outlines and mutate text/heading/button property values
 * to make each version visually distinct.
 */
function mutateOutlines(outlines: Outline[], seed: string): Outline[] {
	// Deep clone to avoid mutating original
	const cloned: Outline[] = JSON.parse(JSON.stringify(outlines));

	const textMutations: Record<string, Record<string, string>> = {
		"published": {
			"text": "Build, launch, and scale your digital storefront with the platform trusted by leading brands.",
			"heading": "Your Digital Commerce Platform",
			"buttonText": "Get Started",
		},
		"prev-0": {
			"text": "Build, launch, and optimize your digital storefront with Stride's all-in-one platform.",
			"heading": "Build Your Digital Future",
			"buttonText": "Start Free Trial",
		},
		"prev-1": {
			"text": "From content to commerce, Stride powers the experiences your customers love.",
			"heading": "Power Your Content",
			"buttonText": "Learn More",
		},
		"prev-2": {
			"text": "Stride helps teams deliver personalized digital experiences at scale.",
			"heading": "Scale Your Experiences",
			"buttonText": "Book a Demo",
		},
		"prev-3": {
			"text": "The all-in-one platform for content, commerce, and experimentation.",
			"heading": "One Platform, Infinite Possibilities",
			"buttonText": "Explore Features",
		},
		"prev-4": {
			"text": "Create compelling digital experiences with our intuitive content platform.",
			"heading": "Welcome to Stride",
			"buttonText": "Sign Up Free",
		},
	};

	const mutations = textMutations[seed] ?? {};
	let headingCount = 0;
	let textCount = 0;
	let buttonCount = 0;

	for (const outline of cloned) {
		for (const eleId of Object.keys(outline.elements)) {
			const ele = outline.elements[eleId];
			if (!ele || !ele.properties) continue;

			const props = ele.properties;

			// Mutate based on element type
			if (ele.type === "ct-heading" && mutations.heading && headingCount === 0) {
				mutatePropertyValue(props, "text", mutations.heading);
				headingCount++;
			} else if ((ele.type === "ct-text" || ele.type === "ct-rich-text") && mutations.text && textCount === 0) {
				mutatePropertyValue(props, "text", mutations.text);
				textCount++;
			} else if (ele.type === "ct-button" && mutations.buttonText && buttonCount === 0) {
				mutatePropertyValue(props, "text", mutations.buttonText);
				buttonCount++;
			}
		}
	}

	// For older versions, also remove the last section to simulate structural differences
	if (seed.startsWith("prev-")) {
		const idx = parseInt(seed.split("-")[1], 10);
		if (idx >= 2) {
			for (const outline of cloned) {
				if (outline.tree.length > 1) {
					outline.tree = outline.tree.slice(0, -1);
				}
			}
		}
	}

	return cloned;
}

function mutatePropertyValue(properties: any, key: string, newValue: string) {
	if (Array.isArray(properties)) {
		const prop = properties.find((p: any) => p.key === key || p.label === key);
		if (prop) prop.value = newValue;
	} else if (properties && typeof properties === "object") {
		if (properties[key]) {
			properties[key] = { ...properties[key], value: newValue };
		}
	}
}

function formatDate(date: Date): string {
	return date.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
}
