const PRIORITY_KEYS = ["text", "label", "name", "title", "heading", "number", "summary", "description", "date"];

const SKIP_KEYS = new Set(["displaySettings", "displayTemplateKey", "template"]);

function isNonDisplayValue(val: string): boolean {
	return val.startsWith("/") || val.startsWith("http") || val === "true" || val === "false";
}

export function getPreviewLabel(properties: any): string | undefined {
	if (!properties || typeof properties !== "object") return undefined;

	for (const key of PRIORITY_KEYS) {
		const val = properties[key];
		if (typeof val === "string" && val.trim() && !isNonDisplayValue(val)) {
			return val.trim();
		}
	}

	for (const [key, val] of Object.entries(properties)) {
		if (PRIORITY_KEYS.includes(key) || SKIP_KEYS.has(key)) continue;
		if (typeof val === "string" && val.trim() && !isNonDisplayValue(val)) {
			return val.trim();
		}
	}

	return undefined;
}
