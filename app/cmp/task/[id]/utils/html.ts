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
