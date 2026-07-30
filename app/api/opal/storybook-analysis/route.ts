import {NextRequest, NextResponse} from "next/server";

const DEFAULT_STORYBOOK_URL = "https://stide-mock.vercel.app/storybook";

type AnalyzedComponent = {
	name: string;
	storyId: string;
	storybookUrl: string;
	title: string;
	storyName: string;
	importPath: string;
	cmsElementType: string;
	suggestedSchema: Record<string, string>;
};

type StorybookStory = {
	id?: string;
	title?: string;
	name?: string;
	importPath?: string;
};

function normalizeStorybookBase(url: string): string {
	return url.replace(/\/$/, "");
}

function toPascalCase(value: string): string {
	return value
		.replace(/[^a-zA-Z0-9]+/g, " ")
		.split(" ")
		.filter(Boolean)
		.map((token) => token.charAt(0).toUpperCase() + token.slice(1))
		.join("");
}

function inferCmsElementType(componentName: string, title: string, storyName: string): string {
	const lc = `${componentName} ${title} ${storyName}`.toLowerCase();
	if (lc.includes("button") || lc.includes("cta")) return "action_element";
	if (lc.includes("input") || lc.includes("field") || lc.includes("form") || lc.includes("select")) {
		return "form_element";
	}
	if (lc.includes("nav") || lc.includes("menu") || lc.includes("breadcrumb") || lc.includes("sidebar")) {
		return "navigation_element";
	}
	if (lc.includes("modal") || lc.includes("dialog") || lc.includes("drawer")) return "overlay_element";
	if (lc.includes("table") || lc.includes("list") || lc.includes("grid") || lc.includes("carousel")) {
		return "collection_element";
	}
	if (lc.includes("hero") || lc.includes("banner") || lc.includes("section") || lc.includes("footer")) {
		return "layout_block";
	}
	return "content_block";
}

function inferSchema(componentName: string, title: string, storyName: string, importPath: string): Record<string, string> {
	const lc = `${componentName} ${title} ${storyName} ${importPath}`.toLowerCase();

	if (lc.includes("button") || lc.includes("cta")) {
		return {
			label: "string",
			variant: "default | primary | secondary | subtle | disabled",
			href: "string | null",
		};
	}

	if (lc.includes("input") || lc.includes("field") || lc.includes("form") || lc.includes("select")) {
		return {
			label: "string",
			placeholder: "string",
			required: "boolean",
		};
	}

	if (lc.includes("nav") || lc.includes("menu") || lc.includes("breadcrumb") || lc.includes("sidebar")) {
		return {
			items: "Array<{ label: string; href: string }>",
			activeItem: "string | null",
			orientation: "horizontal | vertical",
		};
	}

	if (lc.includes("modal") || lc.includes("dialog") || lc.includes("drawer")) {
		return {
			title: "string",
			body: "string",
			size: "sm | md | lg",
		};
	}

	if (lc.includes("table") || lc.includes("list") || lc.includes("grid") || lc.includes("carousel")) {
		return {
			items: "Array<object>",
			layout: "list | grid | carousel",
			emptyState: "string | null",
		};
	}

	if (lc.includes("hero") || lc.includes("banner") || lc.includes("section")) {
		return {
			title: "string",
			subtitle: "string",
			img: "string",
		};
	}

	if (lc.includes("card") || lc.includes("tile") || lc.includes("testimonial")) {
		return {
			title: "string",
			description: "string",
			img: "string | null",
		};
	}

	if (lc.includes("badge") || lc.includes("tag") || lc.includes("label")) {
		return {
			text: "string",
			intent: "neutral | success | warning | danger | info",
		};
	}

	return {
		title: "string",
		description: "string",
		img: "string | null",
	};
}

function extractStoriesFromJson(payload: unknown): StorybookStory[] {
	if (!payload || typeof payload !== "object") {
		return [];
	}

	const maybeEntriesRecord = (payload as {entries?: Record<string, StorybookStory>}).entries;
	if (maybeEntriesRecord && typeof maybeEntriesRecord === "object") {
		return Object.values(maybeEntriesRecord);
	}

	const maybeStoriesRecord = (payload as {stories?: Record<string, StorybookStory>}).stories;
	if (maybeStoriesRecord && typeof maybeStoriesRecord === "object") {
		return Object.values(maybeStoriesRecord);
	}

	const maybeStoriesArray = (payload as {stories?: StorybookStory[]}).stories;
	if (Array.isArray(maybeStoriesArray)) {
		return maybeStoriesArray;
	}

	return [];
}

function buildComponentsFromStories(base: string, stories: StorybookStory[]): AnalyzedComponent[] {
	return stories
		.map((story) => {
			const storyId = typeof story.id === "string" ? story.id : "";
			if (!storyId) {
				return null;
			}

			const title = typeof story.title === "string" ? story.title : "";
			const storyName = typeof story.name === "string" ? story.name : "";
			const importPath = typeof story.importPath === "string" ? story.importPath : "";
			const titleLeaf = title.split("/").filter(Boolean).pop() ?? storyId;
			const name = toPascalCase(titleLeaf);

			return {
				name,
				storyId,
				storybookUrl: `${base}/iframe.html?id=${storyId}&viewMode=story`,
				title,
				storyName,
				importPath,
				cmsElementType: inferCmsElementType(name, title, storyName),
				suggestedSchema: inferSchema(name, title, storyName, importPath),
			};
		})
		.filter((component): component is AnalyzedComponent => component !== null);
}

function buildComponentsFromHtml(base: string, html: string): AnalyzedComponent[] {
	const storyIds = new Set<string>();
	const storyIdRegex = /path=\/story\/([a-z0-9-]+)/gi;
	for (const match of html.matchAll(storyIdRegex)) {
		if (match[1]) {
			storyIds.add(match[1]);
		}
	}

	return Array.from(storyIds).map((storyId) => {
		const [titlePart] = storyId.split("--");
		return {
			name: toPascalCase(titlePart),
			storyId,
			storybookUrl: `${base}/iframe.html?id=${storyId}&viewMode=story`,
			title: titlePart,
			storyName: "",
			importPath: "",
			cmsElementType: inferCmsElementType(titlePart, titlePart, ""),
			suggestedSchema: inferSchema(titlePart, titlePart, "", ""),
		};
	});
}

function dedupeComponents(components: AnalyzedComponent[]): AnalyzedComponent[] {
	// Only filter out "Docs" pseudo-stories — keep every real story variant.
	return components.filter((c) => c.storyName.toLowerCase() !== "docs");
}

async function fetchCandidate(url: string): Promise<{ok: boolean; text: string; contentType: string}> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 10000);

	try {
		const response = await fetch(url, {
			headers: {"User-Agent": "AxiomPlayStorybookAnalyzer/1.0"},
			signal: controller.signal,
		});

		if (!response.ok) {
			return {ok: false, text: "", contentType: ""};
		}

		const text = await response.text();
		return {
			ok: true,
			text,
			contentType: response.headers.get("content-type") ?? "",
		};
	} catch {
		return {ok: false, text: "", contentType: ""};
	} finally {
		clearTimeout(timer);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = (await request.json().catch(() => ({}))) as {url?: string};
		const sourceUrl =
			typeof body.url === "string" && body.url.trim().length > 0 ? body.url.trim() : DEFAULT_STORYBOOK_URL;
		const base = normalizeStorybookBase(sourceUrl);

		const candidates = [
			`${base}/index.json`,
			`${base}/stories.json`,
			`${base}/index.html`,
			`${base}/iframe.html`,
			base,
		];

		let components: AnalyzedComponent[] = [];
		let fetchedFrom = "";

		for (const candidate of candidates) {
			const result = await fetchCandidate(candidate);
			if (!result.ok || !result.text) {
				continue;
			}

			if (result.contentType.includes("json") || result.text.trim().startsWith("{")) {
				try {
					const json = JSON.parse(result.text) as unknown;
					const stories = extractStoriesFromJson(json);
					components = buildComponentsFromStories(base, stories);
					if (components.length > 0) {
						fetchedFrom = candidate;
						break;
					}
				} catch {
					// Continue to next candidate.
				}
			}

			const htmlComponents = buildComponentsFromHtml(base, result.text);
			if (htmlComponents.length > 0) {
				components = htmlComponents;
				fetchedFrom = candidate;
				break;
			}
		}

		const deduped = dedupeComponents(components);

		return NextResponse.json({
			sourceUrl,
			analyzedAt: new Date().toISOString(),
			fetchedFrom,
			componentCount: deduped.length,
			components: deduped,
		});
	} catch (error) {
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Storybook analysis failed",
			},
			{status: 500}
		);
	}
}