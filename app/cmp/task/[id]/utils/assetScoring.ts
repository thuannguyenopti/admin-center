import type { AssetType, SearchAssetItem } from "../types";

export function getAssetMatch({
	id,
	label,
	selected = false,
	tooltip = false,
}: {
	id: string;
	label: AssetType;
	selected?: boolean;
	tooltip?: boolean;
}) {
	const baseByLabel: Record<AssetType, number> = {
		JPG: 90,
		PNG: 90,
		MP4: 89,
		PDF: 86,
	};
	const spreadByLabel: Record<AssetType, number> = {
		JPG: 8,
		PNG: 8,
		MP4: 9,
		PDF: 7,
	};

	const hash = Array.from(id).reduce((total, char, index) => total + char.charCodeAt(0) * (index + 1), 0);
	let score = baseByLabel[label] + (hash % spreadByLabel[label]);

	if (selected) score += 2;
	if (tooltip) score += 2;
	if (label === "PDF") score = Math.min(score, 94);

	return Math.min(score, 99);
}

export function tokenizePrompt(value: string) {
	return value
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter((token) => token.length > 2);
}

export function getSearchAssetMatch({
	asset,
	exclude,
	perspectives,
}: {
	asset: SearchAssetItem;
	exclude: string;
	perspectives: string[];
}) {
	const includeTokens = perspectives.flatMap(tokenizePrompt);
	const excludeTokens = tokenizePrompt(exclude);
	const keywordSet = new Set(asset.keywords.map((keyword) => keyword.toLowerCase()));

	let score = asset.match;

	for (const token of includeTokens) {
		if (keywordSet.has(token)) {
			score += 2;
			continue;
		}

		if (asset.title.toLowerCase().includes(token)) {
			score += 1;
		}
	}

	for (const token of excludeTokens) {
		if (keywordSet.has(token) || asset.title.toLowerCase().includes(token)) {
			score -= 6;
		}
	}

	if (asset.selected) score += 1;
	if (asset.tooltip) score += 1;

	return Math.max(72, Math.min(score, 99));
}

export function getBriefAssetMatch({
	asset,
	brief,
}: {
	asset: SearchAssetItem;
	brief: string;
}) {
	const briefTokens = tokenizePrompt(brief);
	const keywordSet = new Set(asset.keywords.map((keyword) => keyword.toLowerCase()));

	let score = getAssetMatch({ id: asset.id, label: asset.label });

	for (const token of briefTokens) {
		if (keywordSet.has(token)) {
			score += 5;
			continue;
		}

		if (asset.title.toLowerCase().includes(token)) {
			score += 2;
		}
	}

	if (asset.selected) score += 1;

	return Math.max(72, Math.min(score, 99));
}
