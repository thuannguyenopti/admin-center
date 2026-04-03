import type { AssetType, SearchAssetItem } from "./types";
import { initialBriefContent } from "./constants";

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

export function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

export function formatInitialBriefHtml(content: string) {
	const lines = content
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);

	const html: string[] = [];
	let pendingList: string[] = [];

	const flushList = () => {
		if (pendingList.length > 0) {
			html.push(`<ul>${pendingList.join("")}</ul>`);
			pendingList = [];
		}
	};

	for (const line of lines) {
		if (line.startsWith("•")) {
			const item = line.replace(/^•\s*/, "");
			const labelMatch = item.match(/^([^:]+:)\s*(.+)$/);

			if (labelMatch) {
				pendingList.push(`<li><strong>${escapeHtml(labelMatch[1])}</strong> ${escapeHtml(labelMatch[2])}</li>`);
				continue;
			}

			pendingList.push(`<li>${escapeHtml(item)}</li>`);
			continue;
		}

		flushList();

		if (/^Content #\d+:/i.test(line)) {
			html.push(`<h3>${escapeHtml(line)}</h3>`);
			continue;
		}

		if (line.endsWith(":")) {
			html.push(`<h2>${escapeHtml(line.slice(0, -1))}</h2>`);
			continue;
		}

		html.push(`<p>${escapeHtml(line)}</p>`);
	}

	flushList();

	return html.join("");
}

export function getPlainTextFromHtml(content: string) {
	if (typeof document === "undefined") {
		return content.replace(/<[^>]+>/g, " ");
	}

	const container = document.createElement("div");
	container.innerHTML = content;
	return container.textContent ?? container.innerText ?? "";
}

export const initialBriefHtml = formatInitialBriefHtml(initialBriefContent);
