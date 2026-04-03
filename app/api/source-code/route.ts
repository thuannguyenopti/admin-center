import { readFile, readdir } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import {
	buildPageFilePathFromRoute,
	getSourceInspectorManifest,
	type SourceInspectorSelector,
} from "@/app/lib/source-inspector";

type SourceBundle = Record<string, { content: string; language: string }>;

type ApiFileOption = {
	description?: string;
	id: string;
	label: string;
	path: string;
};

let sourceBundle: SourceBundle | null = null;

async function loadSourceBundle() {
	if (sourceBundle) {
		return sourceBundle;
	}

	try {
		const bundlePath = join(process.cwd(), "public", "source-bundle.json");
		const bundleContent = await readFile(bundlePath, "utf-8");
		sourceBundle = JSON.parse(bundleContent);
		return sourceBundle;
	} catch {
		console.warn("Source bundle not found - falling back to filesystem reads");
		return null;
	}
}

function getLanguageFromPath(filePath: string) {
	if (filePath.endsWith(".tsx") || filePath.endsWith(".ts")) return "typescript";
	if (filePath.endsWith(".jsx") || filePath.endsWith(".js")) return "javascript";
	if (filePath.endsWith(".css")) return "css";
	if (filePath.endsWith(".json")) return "json";
	return "typescript";
}

async function canReadFile(filePath: string) {
	try {
		await readFile(join(process.cwd(), filePath), "utf-8");
		return true;
	} catch {
		return false;
	}
}

function buildCandidatePaths(filePath: string) {
	const segments = filePath.split("/");
	const candidates = new Set<string>([filePath]);

	for (let index = 1; index < segments.length - 1; index += 1) {
		const segment = segments[index];
		if (!segment || segment.startsWith("[")) {
			continue;
		}

		const nextSegments = [...segments];
		nextSegments[index] = "[id]";
		candidates.add(nextSegments.join("/"));
	}

	return Array.from(candidates);
}

async function resolveFilePath(filePath: string, bundle: SourceBundle | null) {
	const candidates = buildCandidatePaths(filePath);

	for (const candidate of candidates) {
		if (bundle?.[candidate]) {
			return candidate;
		}

		if (await canReadFile(candidate)) {
			return candidate;
		}
	}

	return null;
}

function getRelatedFiles(resolvedFilePath: string, bundle: SourceBundle | null) {
	const directory = resolvedFilePath.substring(0, resolvedFilePath.lastIndexOf("/"));
	const baseDepth = directory.split("/").length;
	const bundleKeys = Object.keys(bundle ?? {});

	return bundleKeys
		.filter((bundlePath) => bundlePath.startsWith(`${directory}/`))
		.filter((bundlePath) => bundlePath.split("/").length - baseDepth <= 3)
		.filter((bundlePath) => /\.(tsx?|jsx?|css|json)$/.test(bundlePath))
		.sort((left, right) => {
			if (left === resolvedFilePath) return -1;
			if (right === resolvedFilePath) return 1;
			if (left.endsWith("/page.tsx")) return -1;
			if (right.endsWith("/page.tsx")) return 1;
			return left.localeCompare(right);
		})
		.map((path) => ({
			id: path,
			label: path,
			path,
		}));
}

async function getRelatedFilesFromFilesystem(resolvedFilePath: string) {
	const directory = resolvedFilePath.substring(0, resolvedFilePath.lastIndexOf("/"));
	const absoluteDirectory = join(process.cwd(), directory);
	const relatedPaths: string[] = [];

	async function walk(currentDirectory: string, depth: number) {
		if (depth > 2) {
			return;
		}

		const entries = await readdir(currentDirectory, { withFileTypes: true });
		for (const entry of entries) {
			if (entry.name.startsWith(".")) {
				continue;
			}

			const absolutePath = join(currentDirectory, entry.name);
			const relativePath = absolutePath.replace(`${process.cwd()}/`, "");

			if (entry.isDirectory()) {
				await walk(absolutePath, depth + 1);
				continue;
			}

			if (/\.(tsx?|jsx?|css|json)$/.test(entry.name)) {
				relatedPaths.push(relativePath);
			}
		}
	}

	await walk(absoluteDirectory, 0);

	return relatedPaths
		.sort((left, right) => {
			if (left === resolvedFilePath) return -1;
			if (right === resolvedFilePath) return 1;
			if (left.endsWith("/page.tsx")) return -1;
			if (right.endsWith("/page.tsx")) return 1;
			return left.localeCompare(right);
		})
		.map((path) => ({
			id: path,
			label: path,
			path,
		}));
}

function escapeRegExp(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findSymbolStartLine(lines: string[], symbol: string) {
	const escapedSymbol = escapeRegExp(symbol);
	const patterns = [
		new RegExp(`^\\s*export\\s+default\\s+function\\s+${escapedSymbol}\\b`),
		new RegExp(`^\\s*export\\s+function\\s+${escapedSymbol}\\b`),
		new RegExp(`^\\s*function\\s+${escapedSymbol}\\b`),
		new RegExp(`^\\s*export\\s+const\\s+${escapedSymbol}\\s*=`),
		new RegExp(`^\\s*const\\s+${escapedSymbol}\\s*=`),
	];

	const startIndex = lines.findIndex((line) => patterns.some((pattern) => pattern.test(line)));
	if (startIndex < 0) {
		return -1;
	}

	let commentStart = startIndex;
	while (commentStart > 0) {
		const previousLine = lines[commentStart - 1].trim();
		if (!previousLine) {
			break;
		}

		if (
			previousLine.startsWith("//") ||
			previousLine.startsWith("/*") ||
			previousLine.startsWith("*") ||
			previousLine.startsWith("*/")
		) {
			commentStart -= 1;
			continue;
		}

		break;
	}

	return commentStart;
}

function findSymbolEndLine(lines: string[], startLine: number) {
	let foundOpeningBrace = false;
	let braceDepth = 0;

	for (let lineIndex = startLine; lineIndex < lines.length; lineIndex += 1) {
		for (const character of lines[lineIndex]) {
			if (character === "{") {
				braceDepth += 1;
				foundOpeningBrace = true;
			} else if (character === "}") {
				braceDepth = Math.max(0, braceDepth - 1);
			}
		}

		if (foundOpeningBrace && braceDepth === 0 && lineIndex > startLine) {
			return lineIndex;
		}
	}

	return Math.min(lines.length - 1, startLine + 120);
}

function extractSnippet(content: string, selector?: SourceInspectorSelector) {
	const lines = content.split("\n");

	if (!selector) {
		return {
			content,
			endLine: lines.length,
			isSnippet: false,
			startLine: 1,
		};
	}

	if (selector.type === "lines") {
		const startLine = Math.max(1, selector.start);
		const endLine = Math.min(lines.length, selector.end);

		return {
			content: lines.slice(startLine - 1, endLine).join("\n"),
			endLine,
			isSnippet: true,
			startLine,
		};
	}

	const symbolStart = findSymbolStartLine(lines, selector.symbol);
	if (symbolStart < 0) {
		return {
			content,
			endLine: lines.length,
			isSnippet: false,
			startLine: 1,
		};
	}

	const symbolEnd = findSymbolEndLine(lines, symbolStart);
	return {
		content: lines.slice(symbolStart, symbolEnd + 1).join("\n"),
		endLine: symbolEnd + 1,
		isSnippet: true,
		startLine: symbolStart + 1,
	};
}

function createNotFoundResponse(filePath: string) {
	return NextResponse.json(
		{
			error: "Source file not found",
			hint: "This page might use a different file structure, or the file may not exist.",
			message: `File not found: ${filePath}`,
		},
		{ status: 404 }
	);
}

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const directFilePath = searchParams.get("file");
		const route = searchParams.get("route");
		const requestedViewId = searchParams.get("view");

		if (!directFilePath && !route) {
			return NextResponse.json({ error: "File path or route is required" }, { status: 400 });
		}

		const bundle = await loadSourceBundle();
		const manifestInfo = route ? getSourceInspectorManifest(route) : null;
		const manifest = manifestInfo?.manifest ?? null;
		const selectedManifestView =
			manifest?.views.find((view) => view.id === requestedViewId) ??
			manifest?.views.find((view) => view.id === manifest.defaultViewId) ??
			manifest?.views[0] ??
			null;
		const requestedFilePath =
			selectedManifestView?.path ??
			directFilePath ??
			(route ? buildPageFilePathFromRoute(route) : null);

		if (!requestedFilePath) {
			return NextResponse.json({ error: "Unable to resolve a source file for this request" }, { status: 400 });
		}

		if (!requestedFilePath.startsWith("app/")) {
			return NextResponse.json(
				{ error: "Access denied: Only app directory files are allowed" },
				{ status: 403 }
			);
		}

		if (requestedFilePath.includes("..")) {
			return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
		}

		const resolvedFilePath = await resolveFilePath(requestedFilePath, bundle);
		if (!resolvedFilePath) {
			return createNotFoundResponse(requestedFilePath);
		}

		const availableFiles: ApiFileOption[] =
			manifest?.views.map((view) => ({
				description: view.description,
				id: view.id,
				label: view.label,
				path: view.path,
			})) ??
			(bundle && Object.keys(bundle).length > 0
				? getRelatedFiles(resolvedFilePath, bundle)
				: await getRelatedFilesFromFilesystem(resolvedFilePath));

		const sourceContent =
			bundle?.[resolvedFilePath]?.content ??
			(await readFile(join(process.cwd(), resolvedFilePath), "utf-8"));
		const snippet = extractSnippet(sourceContent, selectedManifestView?.selector);

		return NextResponse.json({
			availableFiles,
			content: snippet.content,
			endLine: snippet.endLine,
			filePath: resolvedFilePath,
			isSnippet: snippet.isSnippet,
			language: bundle?.[resolvedFilePath]?.language ?? getLanguageFromPath(resolvedFilePath),
			panelDescription: manifest?.description ?? null,
			panelTitle: manifest?.title ?? null,
			selectedViewDescription: selectedManifestView?.description ?? null,
			selectedViewId: selectedManifestView?.id ?? resolvedFilePath,
			selectedViewLabel: selectedManifestView?.label ?? resolvedFilePath,
			startLine: snippet.startLine,
		});
	} catch (error: any) {
		console.error("Source code API error:", error);
		return NextResponse.json(
			{
				error: "Failed to read source file",
				message: error.message || "Unknown error occurred",
			},
			{ status: 500 }
		);
	}
}
