"use client";

import {
	type ComponentType,
	type ReactNode,
	type SVGProps,
	useDeferredValue,
	useEffect,
	useMemo,
	useRef,
	useState,
	useCallback,
} from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogBody,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	Avatar,
	Badge,
	Box,
	Menu,
	MenuTrigger,
	MenuContent,
	Tabs,
	TabsList,
	TabsTrigger,
	Textarea,
	Tooltip,
	toaster,
} from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { Text } from "@/app/components/Text";
import { initialContentTypes, type ContentType, initialPages, type Page, initialApplications, type Application } from "@/app/db/initialData";
import { initialContentInstances, type ContentInstance, initialCmpContentModels } from "@/app/db/cmpInitialData";
import { isCmpType, convertCmpModelToContentType, convertCmpPropertyToCms } from "@/app/lib/contentTypeMigration";
import { createPageFromInstance } from "@/app/lib/contentConnection";
import usePersistentState from "@/app/usePersistentState";
import { useRouter } from "next/navigation";
import TargetContentTypeDialog from "@/app/components/TargetContentTypeDialog";
import { PropertyRenderer } from "@/app/components/property-renderers";
// Import to register all property renderers
import "@/app/components/property-renderers";
import PreviewCanvas, { type Outline, type EleMap } from "@/app/components/vb/PreviewCanvas";
import type { PreviewSettings } from "@/app/components/vb/PreviewSettings";
import PropertyBasedPageRenderer from "@/app/site/PropertyBasedPageRenderer";
import Grid1Icon from "@/app/cmp/assets/Grid1.svg";
import Grid2Icon from "@/app/cmp/assets/grid2.svg";
import Grid3Icon from "@/app/cmp/assets/grid3.svg";
import Grid4Icon from "@/app/cmp/assets/grid4.svg";
import SparklesIcon from "@/app/cmp/assets/sparkles 16.svg";
import {
	IconBroadcast,
	IconCalendar,
	IconCheck,
	IconChevronDown,
	IconChevronLeft,
	IconChevronRight,
	IconCopy,
	IconDots,
	IconEye,
	IconFileText,
	IconLink,
	IconMaximize,
	IconMinus,
	IconPencil,
	IconPhoto,
	IconPlus,
	IconTrash,
	IconPuzzle,
	IconSearch,
	IconTag,
	IconUpload,
	IconX,
} from "@tabler/icons-react";

type Scene =
	| "brief"
	| "brief-edit"
	| "search"
	| "preview"
	| "content-empty"
	| "content"
	| "content-panel";

type TaskTab = "brief" | "content";

type AssetType = "JPG" | "PNG" | "MP4" | "PDF";

type AssetItem = {
	id: string;
	heroSrc?: string;
	label: AssetType;
	match: number;
	metaDescription?: string;
	src: string;
	title: string;
	selected?: boolean;
	thumbnailSrc?: string;
	tooltip?: string;
	preview: "image" | "pdf";
	previewSrc?: string;
};

type SearchAssetItem = AssetItem & {
	height: number;
	keywords: string[];
	thumbnailSrc?: string;
	width: number;
};

type WorkflowTemplateIconKind = "calendar" | "copy" | "sparkles" | "tag" | "check";

type WorkflowStep = {
	id: string;
	title: string;
	date?: string;
	done?: boolean;
	danger?: boolean;
	expanded?: boolean;
	assignee?: string;
	description?: string;
	checklist?: string[];
	badgeLabel?: string;
	showCalendarAction?: boolean;
};

type WorkflowTemplate = {
	id: string;
	icon: WorkflowTemplateIconKind;
	name: string;
	subtitle?: string;
	steps: WorkflowStep[];
};

function getAssetMatch({
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

function tokenizePrompt(value: string) {
	return value
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter((token) => token.length > 2);
}

function getSearchAssetMatch({
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

function getBriefAssetMatch({
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

const initialBriefContent = `Objective:
Enhance sponsorship opportunities and visibility for the 2026 March IRONMAN/STRIDE triathlon.

Event Sponsor Package Strategy:
This package will include key marketing materials designed to attract potential sponsors:

Content #1: Sponsorship Overview Document
• Title: Unlocking Opportunities: Sponsor the 2026 IRONMAN/STRIDE Triathlon
• Asset Type: PDF Brochure
• Brief: Create a comprehensive overview that outlines the benefits of sponsoring the event, including brand exposure, audience engagement, and community impact. Use an enthusiastic and engaging tone.
• Target Audience: Brands looking to enhance their visibility and connect with active lifestyle consumers.
• Distribution Channels: Direct outreach to potential sponsors, event website, and email campaigns.
• Social Channels: Instagram, Facebook, and LinkedIn.`;

function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function formatInitialBriefHtml(content: string) {
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

function getPlainTextFromHtml(content: string) {
	if (typeof document === "undefined") {
		return content.replace(/<[^>]+>/g, " ");
	}

	const container = document.createElement("div");
	container.innerHTML = content;
	return container.textContent ?? container.innerText ?? "";
}

const initialBriefHtml = formatInitialBriefHtml(initialBriefContent);

const richTextContentStyles = `
.brief-rich-content,
.brief-editor-content {
	color: var(--ax-colors-fg-default);
	font-family: Inter, sans-serif;
	font-size: 14px;
	letter-spacing: -0.1px;
	line-height: 20px;
}

.brief-rich-content h2,
.brief-editor-content h2 {
	font-size: 24px;
	font-weight: 600;
	line-height: 32px;
	letter-spacing: -0.4px;
	margin: 0 0 12px;
}

.brief-rich-content h3,
.brief-editor-content h3 {
	font-size: 18px;
	font-weight: 600;
	line-height: 26px;
	letter-spacing: -0.2px;
	margin: 12px 0 8px;
}

.brief-rich-content p,
.brief-editor-content p,
.brief-rich-content ul,
.brief-editor-content ul,
.brief-rich-content ol,
.brief-editor-content ol,
.brief-rich-content blockquote,
.brief-editor-content blockquote {
	margin: 0 0 12px;
}

.brief-rich-content ul,
.brief-editor-content ul,
.brief-rich-content ol,
.brief-editor-content ol {
	padding-left: 22px;
}

.brief-rich-content li,
.brief-editor-content li {
	margin: 0 0 8px;
}

.brief-rich-content blockquote,
.brief-editor-content blockquote {
	border-left: 3px solid var(--ax-colors-border-accent);
	color: var(--ax-colors-fg-secondary);
	padding-left: 12px;
}

.brief-rich-content hr,
.brief-editor-content hr {
	border: 0;
	border-top: 1px solid var(--ax-colors-border-default);
	margin: 16px 0;
}

.brief-editor-content a,
.brief-rich-content a {
	color: var(--ax-colors-fg-accent);
	text-decoration: underline;
}
`;

const figmaAssets = {
	card1: "https://www.figma.com/api/mcp/asset/52391482-2cbe-4357-9192-a0149afc8ef4",
	card2: "https://www.figma.com/api/mcp/asset/6ec8c7db-e6b0-4d5a-b581-0409aaf9d71d",
	card3: "https://www.figma.com/api/mcp/asset/31ed5377-43b9-4ad4-a8f4-63b8436415ae",
	card4: "https://www.figma.com/api/mcp/asset/d7809dfd-52ff-4998-8af0-f6923d662cc5",
	card5: "https://www.figma.com/api/mcp/asset/01b7a317-0cff-4b3b-9bd2-f31b6b7ff05b",
	card6: "https://www.figma.com/api/mcp/asset/94f3812b-8e85-4220-8d35-cea8a01764dc",
	card7: "https://www.figma.com/api/mcp/asset/a9e4cb62-48b0-4775-a9b6-5186696809b5",
	card8: "https://www.figma.com/api/mcp/asset/ca8825ae-7d87-4715-842c-1eded8650144",
	card9: "https://www.figma.com/api/mcp/asset/044af426-49f4-4d27-9b74-55f4f9ac431f",
	card10: "https://www.figma.com/api/mcp/asset/dadfe6ee-7758-46bb-a591-a938fee49c03",
	card11: "https://www.figma.com/api/mcp/asset/1075b84c-1e72-43dc-a0dc-1003fdf1fc30",
	card12: "https://www.figma.com/api/mcp/asset/2abbfe96-bc0e-4d46-94b1-34f2bd1a18b9",
	card13: "https://www.figma.com/api/mcp/asset/2fda6b73-9994-47b6-a171-96e8eb046eca",
	card14: "https://www.figma.com/api/mcp/asset/d713a7e9-e9f3-455e-a493-da88efd18840",
	card15: "https://www.figma.com/api/mcp/asset/63eca535-2149-4e87-844d-00804e82b854",
	card16: "https://www.figma.com/api/mcp/asset/8e10271a-e404-40d4-81f5-cbdc8156f46e",
	card17: "https://www.figma.com/api/mcp/asset/a3e21247-397b-46b1-a02d-bd4b8022a21d",
	card18: "https://www.figma.com/api/mcp/asset/1d002a23-9d13-41fa-ae92-278c6d02b8e3",
	card19: "https://www.figma.com/api/mcp/asset/d49a1ec9-69d7-4cff-97a8-f401670fdb8a",
	vespaPreview: "https://www.figma.com/api/mcp/asset/00678207-1a20-439d-aa6c-8a246c924bb8",
	vespaThumb: "https://www.figma.com/api/mcp/asset/7a89632b-cf46-4402-b1ec-64005fdd6862",
	contentHero: "https://www.figma.com/api/mcp/asset/20c53de0-7914-41c6-b418-44c1d5cc5d16",
	contentThumbDoc: "https://www.figma.com/api/mcp/asset/91d23d70-6d96-4679-a458-e2ee391f19fb",
	contentThumbOne: "https://www.figma.com/api/mcp/asset/c622308d-589a-47b4-80a1-da6847fcb3fe",
	contentThumbTwo: "https://www.figma.com/api/mcp/asset/2ce82fcf-82aa-4e6f-aec8-362e3dc3760d",
	contentThumbThree: "https://www.figma.com/api/mcp/asset/a09e97eb-63b7-4d5d-8039-372b0f28bdf6",
	contentThumbFour: "https://www.figma.com/api/mcp/asset/e3bfebc5-bf23-4963-b481-6a5a1a2ff3a2",
	searchFortniteWide: "https://www.figma.com/api/mcp/asset/fc767124-df19-4ec9-bb81-7567a6beba1f",
	searchOpenWaterWide: "https://www.figma.com/api/mcp/asset/a51a9caa-a050-4aed-bd25-573af397ae7b",
	searchCyclistDesert: "https://www.figma.com/api/mcp/asset/2ebd2f9a-69a5-4605-8fa5-4df3b366d8da",
	searchSwimPack: "https://www.figma.com/api/mcp/asset/d203e90f-5bde-4d3b-8e70-b2928fa3d0db",
	searchRoadCyclists: "https://www.figma.com/api/mcp/asset/76e2249e-36c9-48f3-8f61-1e8161a6b042",
	searchFortnitePdf: "https://www.figma.com/api/mcp/asset/ba1bb099-3976-47aa-b31f-95b7c9f5133d",
	searchStockChart: "https://www.figma.com/api/mcp/asset/c325aa68-a0b0-4b49-9f32-d45a638a13d2",
	searchTimeTrial: "https://www.figma.com/api/mcp/asset/351c8034-ec8b-4aed-ac3c-0ec78c13af0f",
	searchBook: "https://www.figma.com/api/mcp/asset/4485ea66-2e97-4106-88d1-098fa26ff250",
	searchRedCyclist: "https://www.figma.com/api/mcp/asset/9caf352b-db79-4f87-bc1e-49bbab873f6f",
	searchTriathlonFinish: "https://www.figma.com/api/mcp/asset/9697e1a4-cbe2-46cb-b532-ed3968acd55e",
	searchOrangeCyclist: "https://www.figma.com/api/mcp/asset/f031da9a-2b97-49cb-b434-83f4790e4ed0",
	searchDarkCyclist: "https://www.figma.com/api/mcp/asset/7591bdff-86ed-4029-a44c-0467aaea917e",
	searchSunsetCyclist: "https://www.figma.com/api/mcp/asset/e18dcc1d-b2d9-43d6-97eb-4e1954669232",
	panel1: "https://www.figma.com/api/mcp/asset/5de633a8-d993-4011-81a4-148b8cd7a5a0",
	panel2: "https://www.figma.com/api/mcp/asset/7b9e2adb-ca19-4058-8f98-e7375dd21af0",
	panel3: "https://www.figma.com/api/mcp/asset/27ebaf30-6ff9-4c7a-bc94-282a51903db9",
	panel4: "https://www.figma.com/api/mcp/asset/7eacc459-f07b-49f2-b460-b54195bb3e58",
	panel5: "https://www.figma.com/api/mcp/asset/25e15803-08a9-4c53-9e31-ed0c61bff86b",
	panel6: "https://www.figma.com/api/mcp/asset/c3ea432b-3776-471a-907a-ea5a5d016ace",
	panel7: "https://www.figma.com/api/mcp/asset/178cfde5-335e-46f3-93e6-234841311403",
	panel8: "https://www.figma.com/api/mcp/asset/d0442430-159b-4af8-9880-ac65488aa1a6",
	emptyContentBg: "https://www.figma.com/api/mcp/asset/5ce2fc90-812c-42a7-910d-f797b34089f1",
};

const suggestedAssets: AssetItem[] = [
	{ id: "a1", label: "JPG", match: getAssetMatch({ id: "a1", label: "JPG", selected: true }), src: figmaAssets.card1, title: "Open water runners", preview: "image", selected: true },
	{ id: "a2", label: "JPG", match: getAssetMatch({ id: "a2", label: "JPG" }), src: figmaAssets.card2, title: "Swimmer in surf", preview: "image" },
	{ id: "a3", label: "JPG", match: getAssetMatch({ id: "a3", label: "JPG" }), src: figmaAssets.card5, title: "Cyclist in desert", preview: "image" },
	{ id: "a4", label: "JPG", match: getAssetMatch({ id: "a4", label: "JPG" }), src: figmaAssets.card3, title: "Swimming pack", preview: "image" },
	{ id: "a5", label: "JPG", match: getAssetMatch({ id: "a5", label: "JPG", tooltip: true }), src: figmaAssets.card8, title: "Sports cover art", preview: "image", tooltip: "highly relevant to fitness, cycling and health in general" },
	{ id: "a6", label: "JPG", match: getAssetMatch({ id: "a6", label: "JPG", selected: true }), src: figmaAssets.card6, title: "Cyclists on road", preview: "image", selected: true },
	{ id: "a7", label: "PDF", match: getAssetMatch({ id: "a7", label: "PDF" }), src: figmaAssets.vespaThumb, title: "Vespa brochure", preview: "pdf", previewSrc: figmaAssets.vespaPreview },
	{ id: "a8", label: "MP4", match: getAssetMatch({ id: "a8", label: "MP4" }), src: figmaAssets.card9, title: "Time trial cyclist", preview: "image" },
	{ id: "a9", label: "MP4", match: getAssetMatch({ id: "a9", label: "MP4" }), src: figmaAssets.card10, title: "Runner in red", preview: "image" },
	{ id: "a10", label: "MP4", match: getAssetMatch({ id: "a10", label: "MP4" }), src: figmaAssets.card11, title: "Runner on course", preview: "image" },
	{ id: "a11", label: "MP4", match: getAssetMatch({ id: "a11", label: "MP4", selected: true }), src: figmaAssets.card12, title: "Triathlon finish", preview: "image", selected: true },
	{ id: "a12", label: "MP4", match: getAssetMatch({ id: "a12", label: "MP4" }), src: figmaAssets.card18, title: "Cyclist in tunnel", preview: "image" },
];

const initialTaskAssets: AssetItem[] = [];

const searchAssets: SearchAssetItem[] = [
	{
		id: "s1",
		label: "JPG",
		match: getAssetMatch({ id: "s1", label: "JPG", selected: true }),
		metaDescription: "Energetic open-water triathlon scene that works well as a sponsor-package hero or campaign thumbnail.",
		src: "https://www.figma.com/api/mcp/asset/4a6043d8-95cb-44da-a9d2-edbf7b2394b8",
		selected: true,
		height: 180,
		preview: "image",
		keywords: ["swim", "swimmer", "openwater", "ocean", "fitness", "athlete", "triathlon", "event", "outdoor", "runners"],
		thumbnailSrc: "https://www.figma.com/api/mcp/asset/22588afa-c07d-4a18-8d10-62383a3569dd",
		title: "Open-water runners",
		width: 291,
	},
	{
		id: "s2",
		label: "PNG",
		match: getAssetMatch({ id: "s2", label: "PNG" }),
		metaDescription: "Strong motion-led water shot for endurance storytelling, event promotion, and athlete-focused content.",
		src: "https://www.figma.com/api/mcp/asset/15d6a52f-25f6-44c0-9385-b98b3948946a",
		height: 180,
		keywords: ["swim", "swimmer", "ocean", "fitness", "athlete", "triathlon", "sprint", "water"],
		preview: "image",
		title: "Runner in surf",
		width: 162,
	},
	{
		id: "s3",
		label: "MP4",
		match: getAssetMatch({ id: "s3", label: "MP4" }),
		metaDescription: "A clean cycling visual with wide landscape context, useful for sport-performance and outdoor event messaging.",
		src: "https://www.figma.com/api/mcp/asset/695da0de-de11-413c-b480-7c47fa6aa827",
		height: 180,
		keywords: ["cycling", "cyclist", "bike", "bicycle", "road", "desert", "outdoor", "athlete", "triathlon"],
		preview: "image",
		thumbnailSrc: "https://www.figma.com/api/mcp/asset/a395fdf0-d2d4-48f3-ba6c-9cfd5befab68",
		title: "Cyclist in desert",
		width: 219.2,
	},
	{
		id: "s4",
		label: "MP4",
		match: getAssetMatch({ id: "s4", label: "MP4" }),
		metaDescription: "Graphic overhead swim image that adds variety to triathlon coverage and works well in editorial layouts.",
		src: "https://www.figma.com/api/mcp/asset/cf7a16a6-4f37-4110-a35b-5a2cdba859da",
		height: 180,
		keywords: ["swim", "swimmer", "water", "fitness", "athlete", "triathlon", "outdoor"],
		preview: "image",
		title: "Swimmer overhead",
		width: 132,
	},
	{
		id: "s5",
		label: "JPG",
		match: getAssetMatch({ id: "s5", label: "JPG" }),
		metaDescription: "Poster-style creative asset suited for campaign moodboards, sponsor collateral, or concept exploration.",
		src: "https://www.figma.com/api/mcp/asset/ac293cba-d3a8-4dc7-b10e-8ac84509d3a6",
		height: 180,
		keywords: ["music", "poster", "editorial", "print", "magazine", "cover", "collateral", "design"],
		preview: "image",
		title: "Swing poster",
		width: 245,
	},
	{
		id: "s6",
		label: "MP4",
		match: getAssetMatch({ id: "s6", label: "MP4", selected: true }),
		metaDescription: "Road-cycling image with strong event energy, useful for hero banners, recaps, and sponsor storytelling.",
		src: "https://www.figma.com/api/mcp/asset/9d728d71-337d-4acc-af17-9f73f0df342c",
		selected: true,
		height: 180,
		keywords: ["cycling", "cyclist", "bike", "bicycle", "road", "event", "outdoor", "athlete", "triathlon", "sales"],
		preview: "image",
		title: "Cyclists on road",
		width: 294,
	},
	{
		id: "s7",
		label: "PDF",
		match: getAssetMatch({ id: "s7", label: "PDF", tooltip: true }),
		metaDescription: "Reference brochure asset for sales and sponsorship collateral when you need document-style supporting content.",
		src: "https://www.figma.com/api/mcp/asset/45ad4624-294e-41d4-871e-b40c09e2466e",
		height: 180,
		keywords: ["pdf", "brochure", "collateral", "sales", "vespa", "brand", "print", "document", "webinar"],
		preview: "pdf",
		thumbnailSrc: "https://www.figma.com/api/mcp/asset/a6d8d1c5-5278-4d90-bcf3-68097aa99ba9",
		title: "Vespa brochure",
		tooltip: "highly relevant to fitness, cycling and health in general",
		width: 219.2,
	},
	{
		id: "s8",
		label: "MP4",
		match: getAssetMatch({ id: "s8", label: "MP4" }),
		metaDescription: "Tight action image that emphasizes performance, speed, and race-day intensity for premium sports content.",
		src: "https://www.figma.com/api/mcp/asset/30b06ce8-347c-4779-990e-fdc42fc3e551",
		height: 180,
		keywords: ["cycling", "cyclist", "bike", "bicycle", "timetrial", "athlete", "triathlon", "outdoor", "fitness"],
		preview: "image",
		title: "Time trial cyclist",
		width: 305,
	},
	{
		id: "s9",
		label: "JPG",
		match: getAssetMatch({ id: "s9", label: "JPG" }),
		metaDescription: "Editorial print spread useful for mixing brand collateral and document-like references into the recommendation set.",
		src: "https://www.figma.com/api/mcp/asset/7e502c56-9fa8-4b89-851d-513822fd33ca",
		height: 180,
		keywords: ["magazine", "book", "editorial", "print", "collateral", "document", "brochure"],
		preview: "image",
		title: "Magazine spread",
		width: 148,
	},
	{
		id: "s10",
		label: "MP4",
		match: getAssetMatch({ id: "s10", label: "MP4" }),
		metaDescription: "Distinct cycling portrait that works well for athlete spotlights, training stories, and product-led race narratives.",
		src: "https://www.figma.com/api/mcp/asset/229731dd-cb80-4092-b5cc-bd8b0ad1be10",
		height: 180,
		keywords: ["cycling", "cyclist", "bike", "bicycle", "orange", "athlete", "triathlon", "outdoor"],
		preview: "image",
		title: "Orange cyclist",
		width: 132,
	},
	{
		id: "s11",
		label: "MP4",
		match: getAssetMatch({ id: "s11", label: "MP4" }),
		metaDescription: "Minimal profile shot that gives the panel a calmer visual option for editorial or supporting placements.",
		src: "https://www.figma.com/api/mcp/asset/f74d40ed-ef4f-4d03-a260-e9e28eba7642",
		height: 180,
		keywords: ["cycling", "cyclist", "bike", "bicycle", "profile", "athlete", "triathlon", "fitness"],
		preview: "image",
		thumbnailSrc: "https://www.figma.com/api/mcp/asset/6ae6d557-81a4-4f2b-86c2-1e7145cd2088",
		title: "Cyclist profile",
		width: 219.2,
	},
	{
		id: "s12",
		label: "JPG",
		match: getAssetMatch({ id: "s12", label: "JPG", selected: true }),
		metaDescription: "Clear race-action image with visible event context, ideal for sponsor package pages and campaign recaps.",
		src: "https://www.figma.com/api/mcp/asset/9b218406-8645-48ed-9187-4ef28953a8df",
		selected: true,
		height: 180,
		keywords: ["running", "runners", "race", "event", "fitness", "athlete", "triathlon", "outdoor", "sports"],
		preview: "image",
		title: "Race runners",
		width: 322,
	},
	{
		id: "s13",
		label: "MP4",
		match: getAssetMatch({ id: "s13", label: "MP4" }),
		metaDescription: "Simple urban cycling frame that supports lifestyle-oriented messaging without overpowering the surrounding content.",
		src: "https://www.figma.com/api/mcp/asset/6678964d-2dae-43e0-aab0-373519af65a2",
		height: 180,
		keywords: ["cycling", "cyclist", "bike", "bicycle", "road", "athlete", "triathlon", "outdoor"],
		preview: "image",
		title: "Cyclist against wall",
		width: 219.2,
	},
	{
		id: "s14",
		label: "JPG",
		match: getAssetMatch({ id: "s14", label: "JPG" }),
		metaDescription: "Fast, dynamic blur treatment for moments where you want more motion and less literal event coverage.",
		src: "https://www.figma.com/api/mcp/asset/f388b2f9-b082-4a5b-ae07-e8436878d1ca",
		height: 180,
		keywords: ["cycling", "cyclist", "bike", "bicycle", "motion", "athlete", "triathlon", "outdoor", "speed"],
		preview: "image",
		thumbnailSrc: "https://www.figma.com/api/mcp/asset/e695f977-ef1f-485a-bd69-070dfdc9b2ca",
		title: "Cyclist motion blur",
		width: 287,
	},
	{
		id: "s15",
		label: "MP4",
		match: getAssetMatch({ id: "s15", label: "MP4" }),
		metaDescription: "Event-focused cycling image with approachable framing, good for secondary cards and supporting recommendations.",
		src: "https://www.figma.com/api/mcp/asset/2792d536-0151-47c0-92b7-fbbf8662da69",
		height: 180,
		keywords: ["cycling", "cyclist", "bike", "bicycle", "athlete", "triathlon", "outdoor", "webinar", "event"],
		preview: "image",
		title: "Cyclist in coral jersey",
		width: 163,
	},
];

const perspectiveSeeds = [
	"Images related to fitness, healthy people, runners, outdoor activities, professional events",
	"Top things to know about cycling",
	"Sales collateral for selling bicycles during Miami 2025 triathlon event",
	"Webinar sign up event pages",
];

const workflowTemplates: WorkflowTemplate[] = [
	{
		id: "starter",
		icon: "copy",
		name: "Select Workflow",
		subtitle: "Choose a company or predefined template",
		steps: [
			{
				id: "starter-1",
				title: "1. Step 1",
				expanded: true,
				assignee: "Mary Anne",
				description: "Add Description",
				badgeLabel: "Not Started",
				checklist: ["Write Content"],
			},
			{
				id: "starter-2",
				title: "2. Step",
				showCalendarAction: true,
			},
		],
	},
	{
		id: "newsletter",
		icon: "copy",
		name: "Newsletter Workflow",
		steps: [
			{ id: "newsletter-1", title: "1. Review", date: "Jun 7", done: true },
			{ id: "newsletter-2", title: "2. Competitive Analysis", date: "Jun 10", done: true },
			{ id: "newsletter-3", title: "3. Concept", date: "Jun 14", danger: true, done: true },
			{
				id: "newsletter-4",
				title: "4. Hi-fi mockups",
				expanded: true,
				assignee: "Mary Anne",
				description: "Write description",
				checklist: ["Write Content", "Write Your Share", "Select Interesting Images"],
				badgeLabel: "Not Started",
				showCalendarAction: true,
			},
			{ id: "newsletter-5", title: "5. Publish to CC", date: "Jun 30" },
		],
	},
	{
		id: "legal-approval",
		icon: "calendar",
		name: "Legal Approval Workflow",
		subtitle: "Content + legal + executive signoff",
		steps: [
			{ id: "legal-1", title: "1. Request Intake", date: "Jul 3", done: true },
			{ id: "legal-2", title: "2. Draft Creation", date: "Jul 6", done: true },
			{ id: "legal-3", title: "3. Legal Review", date: "Jul 10", danger: true },
			{
				id: "legal-4",
				title: "4. Revisions",
				expanded: true,
				assignee: "Mary Anne",
				description: "Consolidate legal feedback",
				checklist: ["Update claims", "Confirm disclaimers", "Attach final proof"],
				badgeLabel: "In Progress",
				showCalendarAction: true,
			},
			{ id: "legal-5", title: "5. Executive Approval", date: "Jul 15" },
			{ id: "legal-6", title: "6. Publish to CC", date: "Jul 18" },
		],
	},
	{
		id: "event-sponsorship",
		icon: "tag",
		name: "Event Sponsorship Workflow",
		subtitle: "Sponsor package with legal approval",
		steps: [
			{ id: "sponsor-1", title: "1. Review", date: "Jun 7", done: true },
			{ id: "sponsor-2", title: "2. Competitive Analysis", date: "Jun 10", done: true },
			{ id: "sponsor-3", title: "3. Concept", date: "Jun 14", done: true, danger: true },
			{ id: "sponsor-4", title: "4. Legal Approval", date: "Jun 18" },
			{
				id: "sponsor-5",
				title: "5. Sponsor Review",
				expanded: true,
				assignee: "Mary Anne",
				description: "Collect sponsor edits and final requirements",
				checklist: ["Confirm package tiers", "Validate rights language", "Lock approved imagery"],
				badgeLabel: "In Review",
				showCalendarAction: true,
			},
			{ id: "sponsor-6", title: "6. Hi-fi mockups", date: "Jun 24" },
			{ id: "sponsor-7", title: "7. Publish to CC", date: "Jun 30" },
		],
	},
	{
		id: "social-campaign",
		icon: "sparkles",
		name: "Social Campaign Workflow",
		subtitle: "Lightweight social asset production",
		steps: [
			{ id: "social-1", title: "1. Campaign Brief", date: "Aug 2", done: true },
			{ id: "social-2", title: "2. Draft Copy", date: "Aug 4", done: true },
			{
				id: "social-3",
				title: "3. Creative Review",
				expanded: true,
				assignee: "Mary Anne",
				description: "Review hook, CTA, and asset pairing",
				checklist: ["Approve caption", "Approve image crop"],
				badgeLabel: "Not Started",
				showCalendarAction: true,
			},
			{ id: "social-4", title: "4. Schedule & Publish", date: "Aug 8" },
		],
	},
	{
		id: "webinar",
		icon: "check",
		name: "Webinar Launch Workflow",
		subtitle: "Registration, promotion, and follow-up",
		steps: [
			{ id: "webinar-1", title: "1. Kickoff", date: "Sep 1", done: true },
			{ id: "webinar-2", title: "2. Landing Page", date: "Sep 3", done: true },
			{ id: "webinar-3", title: "3. Paid Media", date: "Sep 5" },
			{
				id: "webinar-4",
				title: "4. Legal Approval",
				expanded: true,
				assignee: "Mary Anne",
				description: "Check registration language and offer terms",
				checklist: ["Approve registration copy", "Approve confirmation email", "Approve follow-up CTA"],
				badgeLabel: "Not Started",
				showCalendarAction: true,
			},
			{ id: "webinar-5", title: "5. Speaker Assets", date: "Sep 9" },
			{ id: "webinar-6", title: "6. Launch", date: "Sep 12" },
		],
	},
];

export function CmpOpalAssetRecommendation() {
	const router = useRouter();
	const [scene, setScene] = useState<Scene>("brief");
	const [hasTaskContent, setHasTaskContent] = useState(false);
	const [selectedAsset, setSelectedAsset] = useState<AssetItem>(suggestedAssets[6]);
	const [selectedTaskAssetId, setSelectedTaskAssetId] = useState<string | null>(null);
	const [selectedPanelAssetIds, setSelectedPanelAssetIds] = useState<string[]>([]);
	const [selectedSearchAssetIds, setSelectedSearchAssetIds] = useState<string[]>(
		searchAssets.filter((asset) => asset.selected).map((asset) => asset.id),
	);
	const [taskAssets, setTaskAssets] = useState<AssetItem[]>(initialTaskAssets);
	const [taskArticles, setTaskArticles] = useState<Array<{ id: string; title: string }>>([]);
	const [contentInstances, setContentInstances] = usePersistentState("cmpContentInstances", initialContentInstances) as [ContentInstance[], any];
	const [selectedContentInstanceId, setSelectedContentInstanceId] = useState<string | null>(null);
	const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
	const [suggestedPanelOpen, setSuggestedPanelOpen] = useState(false);

	// Add to Application state
	const [pages, setPages] = usePersistentState("pages", initialPages) as [Page[], any];
	const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
	const [isTargetSelectionOpen, setIsTargetSelectionOpen] = useState(false);
	const [instanceToAdd, setInstanceToAdd] = useState<ContentInstance | null>(null);

	// Preview state for PreviewCanvas
	const [previewCurrentEle, setPreviewCurrentEle] = useState<string>("");
	const [previewHoverEle, setPreviewHoverEle] = useState<string>("");
	const [previewOutlines, setPreviewOutlines] = useState<Outline[]>([]);

	const [contentTypes] = usePersistentState("contentTypes", initialContentTypes) as [ContentType[], any];
	const [applications] = usePersistentState("applications", initialApplications) as [Application[], any];

	// Computed values
	const CURRENT_TASK_ID = "1"; // TODO: Get from router params or context
	const CURRENT_TASK_NAME = "Ironman Miami triathlon 2026 Sponsor Package task"; // TODO: Get from task data

	const taskPages = useMemo(() => {
		return pages.filter(page =>
			page.cmpTaskMetadata?.taskId === CURRENT_TASK_ID
		);
	}, [pages]);

	// Add to Application handlers
	const handleAddToApplication = useCallback((instance: ContentInstance) => {
		// Find all content types that this instance can map to
		const sourceType = contentTypes.find(ct => ct.id === instance.modelId);
		if (!sourceType || !sourceType.mappings) {
			toaster.create(
				"No mappings configured for this content type",
				{ intent: "danger" },
			);
			return;
		}

		const availableTargets = sourceType.mappings.map(mapping => {
			const targetType = contentTypes.find(ct => ct.id === mapping.targetContentTypeId);
			return { mapping, targetType };
		}).filter(t => t.targetType) as Array<{ mapping: any; targetType: ContentType }>;

		if (availableTargets.length === 0) {
			toaster.create(
				"No CMS content types available for this content",
				{ intent: "danger" },
			);
			return;
		}

		if (availableTargets.length === 1) {
			// Single target - create page immediately
			createAndAddPage(instance, availableTargets[0].targetType.id);
		} else {
			// Multiple targets - show selection dialog
			setInstanceToAdd(instance);
			setIsTargetSelectionOpen(true);
		}
	}, [contentTypes]);

	const createAndAddPage = useCallback((instance: ContentInstance, targetContentTypeId: string) => {
		const result = createPageFromInstance(
			instance,
			targetContentTypeId,
			contentTypes,
			pages,
			{ taskId: CURRENT_TASK_ID, taskName: CURRENT_TASK_NAME }
		);

		if (result.error) {
			toaster.create(
				result.error,
				{ intent: "danger" },
			);
			return;
		}

		// Add page to global pages state
		setPages((prev: Page[]) => [...prev, result.page!]);

		// Auto-select the newly created page
		setSelectedPageId(result.page!.id);
		setSelectedContentInstanceId(null);
		setSelectedTaskAssetId(null);
		setSelectedArticleId(null);

		// Show success message
		toaster.create(
			`Page "${result.page!.name}" created successfully`,
			{ intent: "success" },
		);

		// Close dialog if open
		setIsTargetSelectionOpen(false);
		setInstanceToAdd(null);
	}, [contentTypes, pages, setPages, CURRENT_TASK_ID, CURRENT_TASK_NAME]);

	// Auto-select first item on load if nothing is selected
	useEffect(() => {
		if (!selectedContentInstanceId && !selectedTaskAssetId && !selectedArticleId && !selectedPageId) {
			if (contentInstances.length > 0) {
				setSelectedContentInstanceId(contentInstances[0].id);
			} else if (taskPages.length > 0) {
				setSelectedPageId(taskPages[0].id);
			} else if (taskArticles.length > 0) {
				setSelectedArticleId(taskArticles[0].id);
			} else if (taskAssets.length > 0) {
				setSelectedTaskAssetId(taskAssets[0].id);
			}
		}
	}, [contentInstances, taskPages, taskArticles, taskAssets, selectedContentInstanceId, selectedTaskAssetId, selectedArticleId, selectedPageId]);

	// Switch to empty state when all items are removed
	useEffect(() => {
		const hasContent = contentInstances.length > 0 || taskArticles.length > 0 || taskAssets.length > 0;
		if (!hasContent && (scene === "content" || scene === "content-panel")) {
			setScene("content-empty");
			setHasTaskContent(false);
			setSuggestedPanelOpen(false);
		}
	}, [contentInstances.length, taskArticles.length, taskAssets.length, scene]);

	const [perspectives, setPerspectives] = useState(perspectiveSeeds);
	const [exclude, setExclude] = useState("bicycles, skateboards, longboards");
	const [briefContent, setBriefContent] = useState(initialBriefHtml);
	const [draftBriefContent, setDraftBriefContent] = useState(initialBriefHtml);
	const [searchReturnScene, setSearchReturnScene] = useState<Scene>("brief-edit");
	const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
	const [workflowMenuOpen, setWorkflowMenuOpen] = useState(false);
	const [workflowSearch, setWorkflowSearch] = useState("");
	const [pendingWorkflowId, setPendingWorkflowId] = useState<string | null>(null);
	const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);

	// Initialize hasTaskContent based on existing content instances, task assets, or articles
	useEffect(() => {
		if (contentInstances.length > 0 || taskAssets.length > 0 || taskArticles.length > 0) {
			setHasTaskContent(true);
		}
	}, [contentInstances.length, taskAssets.length, taskArticles.length]); // Re-check when content loads from localStorage

	// Update preview outlines when selected page changes
	useEffect(() => {
		if (selectedPageId) {
			const page = pages.find((p) => p.id === selectedPageId);
			if (page) {
				// Try to get outlines from variations first, then fall back to page.outlines
				const outlines = page.variations?.[0]?.outlines || page.outlines || [];
				setPreviewOutlines(outlines);
			} else {
				setPreviewOutlines([]);
			}
		} else {
			setPreviewOutlines([]);
		}
	}, [selectedPageId, pages]);

	const activeTab: TaskTab = scene === "brief" || scene === "brief-edit" ? "brief" : "content";
	const effectiveBriefContent = scene === "brief-edit" ? draftBriefContent : briefContent;
	const effectiveBriefText = useMemo(() => getPlainTextFromHtml(effectiveBriefContent), [effectiveBriefContent]);
	const deferredBriefContent = useDeferredValue(effectiveBriefText);
	const deferredWorkflowSearch = useDeferredValue(workflowSearch);
	const deferredPerspectives = useDeferredValue(perspectives);
	const deferredExclude = useDeferredValue(exclude);
	const activeWorkflowId = selectedWorkflowId ?? (scene === "content-empty" ? "starter" : "newsletter");
	const activeWorkflow = workflowTemplates.find((template) => template.id === activeWorkflowId) ?? workflowTemplates[0];
	const rankedSearchAssets = useMemo(() => {
		return searchAssets
			.map((asset, index) => ({
				...asset,
				match: getSearchAssetMatch({
					asset,
					exclude: deferredExclude,
					perspectives: deferredPerspectives,
				}),
				selected: selectedSearchAssetIds.includes(asset.id),
				originalIndex: index,
			}))
			.sort((left, right) => {
				if (right.match !== left.match) {
					return right.match - left.match;
				}

				return left.originalIndex - right.originalIndex;
			})
			.map(({ originalIndex, ...asset }) => asset);
	}, [deferredExclude, deferredPerspectives, selectedSearchAssetIds]);
	const panelAssetsWithSelection = useMemo(
		() => {
			const taskAssetIds = new Set(taskAssets.map((asset) => asset.id));

			return searchAssets
				.filter((asset) => !taskAssetIds.has(asset.id))
				.map((asset, index) => {
					const isSelected = selectedPanelAssetIds.includes(asset.id);

					return {
						...asset,
						match: getBriefAssetMatch({
							asset,
							brief: deferredBriefContent,
						}),
						originalIndex: index,
						selected: isSelected,
					};
				})
				.sort((left, right) => {
					if (left.selected !== right.selected) {
						return left.selected ? -1 : 1;
					}

					if (right.match !== left.match) {
						return right.match - left.match;
					}

					return left.originalIndex - right.originalIndex;
				})
				.map(({ originalIndex, ...asset }) => asset);
		},
		[deferredBriefContent, selectedPanelAssetIds, taskAssets],
	);
	const filteredWorkflowTemplates = useMemo(() => {
		const query = deferredWorkflowSearch.trim().toLowerCase();

		if (!query) {
			return workflowTemplates;
		}

		return workflowTemplates.filter((template) =>
			`${template.name} ${template.subtitle ?? ""}`.toLowerCase().includes(query),
		);
	}, [deferredWorkflowSearch]);

	const openContentTab = () => {
		// Check if there's actually content (instances, assets, or articles)
		const hasContent = contentInstances.length > 0 || taskAssets.length > 0 || taskArticles.length > 0;
		setScene(hasContent ? "content" : "content-empty");
		if (hasContent) {
			setHasTaskContent(true);
		}
	};

	const openBriefEdit = () => {
		setDraftBriefContent(briefContent);
		setScene("brief-edit");
	};

	const cancelBriefEdit = () => {
		setDraftBriefContent(briefContent);
		setScene("brief");
	};

	const saveBriefEdit = () => {
		setBriefContent(draftBriefContent);
		setScene("brief");
	};

	const openSearch = (returnScene: Scene) => {
		setSearchReturnScene(returnScene);
		setWorkflowMenuOpen(false);
		setScene("search");
	};

	const handleTabChange = (tab: string) => {
		if (tab === "brief") {
			setWorkflowMenuOpen(false);
			setScene("brief");
			return;
		}

		if (tab === "content") {
			openContentTab();
		}
	};

	const handleWorkflowSelect = (workflowId: string) => {
		if (workflowId === activeWorkflowId) {
			setWorkflowMenuOpen(false);
			return;
		}

		setPendingWorkflowId(workflowId);
		setWorkflowMenuOpen(false);
		setWorkflowDialogOpen(true);
	};

	const applyWorkflowChange = () => {
		if (pendingWorkflowId) {
			setSelectedWorkflowId(pendingWorkflowId);
		}

		setWorkflowDialogOpen(false);
		setPendingWorkflowId(null);
		setWorkflowSearch("");
	};

	const addAssetsToTask = (assetsToAdd: AssetItem[]) => {
		if (assetsToAdd.length === 0) {
			return;
		}

		const normalizedAssets = assetsToAdd.map((asset) => ({
			...asset,
			thumbnailSrc: asset.thumbnailSrc ?? asset.previewSrc ?? asset.src,
		}));
		const firstImage = normalizedAssets.find((asset) => asset.preview === "image");

		setTaskAssets((current) => {
			const existing = current.filter(
				(asset) => !normalizedAssets.some((candidate) => candidate.id === asset.id),
			);

			return [...normalizedAssets, ...existing];
		});

		if (firstImage) {
			setSelectedTaskAssetId(firstImage.id);
		}

		setSelectedPanelAssetIds([]);
		setHasTaskContent(true);
		setScene("content");
	};

	const addContentInstanceFromModel = (model: ContentType) => {
		const instanceId = `ci-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		// Initialize field values based on model properties
		const fields: Record<string, any> = {};
		model.properties.forEach((prop: any) => {
			if (prop.type === "text") {
				fields[prop.name] = "";
			} else if (prop.type === "longText" || prop.type === "richText") {
				fields[prop.name] = "";
			} else if (prop.type === "datetime") {
				fields[prop.name] = new Date().toISOString();
			} else if (prop.list) {
				fields[prop.name] = [];
			} else {
				fields[prop.name] = null;
			}
		});

		const newInstance: ContentInstance = {
			id: instanceId,
			modelId: model.id,
			modelDisplayName: model.displayName || model.name,
			createdAt: new Date().toISOString(),
			fields,
		};

		setContentInstances((current: ContentInstance[]) => [newInstance, ...current]);
		setSelectedContentInstanceId(instanceId);
		setSelectedTaskAssetId(null);
		setSelectedArticleId(null);
		setHasTaskContent(true);
		setScene("content");
	};

	const addArticle = () => {
		const articleId = `article-${Date.now()}`;
		const newArticle = {
			id: articleId,
			title: "The runner sponsoring package",
		};
		setTaskArticles((current) => [...current, newArticle]);
		setSelectedArticleId(articleId);
		setSelectedContentInstanceId(null);
		setSelectedTaskAssetId(null);
		setHasTaskContent(true);
		setScene("content");
	};

	const closeWorkflowDialog = () => {
		setWorkflowDialogOpen(false);
		setPendingWorkflowId(null);
	};

	useEffect(() => {
		const availablePanelAssetIds = new Set(panelAssetsWithSelection.map((asset) => asset.id));

		setSelectedPanelAssetIds((current) => {
			const next = current.filter((id) => availablePanelAssetIds.has(id));

			if (next.length === current.length && next.every((id, index) => id === current[index])) {
				return current;
			}

			return next;
		});
	}, [panelAssetsWithSelection]);

	const mainContent = useMemo(() => {
		switch (scene) {
			case "brief":
				return (
					<TaskCanvas
						left={
							<BriefPage
								activeTab={activeTab}
								briefContent={briefContent}
								onOpenEdit={openBriefEdit}
								onTabChange={handleTabChange}
							/>
						}
						right={
							<WorkflowSidebar
								filteredTemplates={filteredWorkflowTemplates}
								isMenuOpen={workflowMenuOpen}
								onRequestWorkflowChange={handleWorkflowSelect}
								onToggleWorkflowMenu={() => setWorkflowMenuOpen((open) => !open)}
								onWorkflowSearchChange={setWorkflowSearch}
								searchValue={workflowSearch}
								workflow={activeWorkflow}
							/>
						}
					/>
				);
			case "brief-edit":
				return (
					<TaskCanvas
						left={
							<BriefEditPage
								activeTab={activeTab}
								briefContent={draftBriefContent}
								onBriefContentChange={setDraftBriefContent}
								onCancel={cancelBriefEdit}
								onSave={saveBriefEdit}
								onTabChange={handleTabChange}
							/>
						}
							right={
								<SuggestedAssetsPanel
									assets={panelAssetsWithSelection}
									onAddToTask={() =>
										addAssetsToTask(panelAssetsWithSelection.filter((asset) => asset.selected))
									}
									onClearSelection={() => setSelectedPanelAssetIds([])}
									onClose={() => setScene("brief")}
									onEditSearch={() => openSearch("brief-edit")}
									onToggleSelect={(assetId) =>
										setSelectedPanelAssetIds((current) =>
											current.includes(assetId)
												? current.filter((id) => id !== assetId)
												: [...current, assetId],
										)
									}
								/>
							}
						/>
				);
			case "search":
				return (
					<SearchPage
						assets={rankedSearchAssets}
						exclude={exclude}
						onAdd={() => addAssetsToTask(rankedSearchAssets.filter((asset) => asset.selected))}
						onAssetClick={(asset) => {
							setSelectedAsset(asset);
							setScene("preview");
						}}
						onBack={() => setScene(searchReturnScene)}
						onExcludeChange={setExclude}
						onPerspectiveChange={(index, value) =>
							setPerspectives((current) =>
								current.map((item, itemIndex) => (itemIndex === index ? value : item)),
							)
						}
						onToggleSelect={(assetId) =>
							setSelectedSearchAssetIds((current) =>
								current.includes(assetId)
									? current.filter((id) => id !== assetId)
									: [...current, assetId],
							)
						}
						perspectives={perspectives}
					/>
				);
			case "preview":
				return (
					<PreviewPage
						asset={selectedAsset}
						onAdd={() => addAssetsToTask([selectedAsset])}
						onClose={() => setScene("search")}
					/>
				);
			case "content-empty":
				return (
					<TaskCanvas
						left={<ContentEmptyPage activeTab={activeTab} onAddContent={() => openSearch("content-empty")} onAddContentFromModel={addContentInstanceFromModel} onAddArticle={addArticle} onTabChange={handleTabChange} />}
						right={
							<WorkflowSidebar
								filteredTemplates={filteredWorkflowTemplates}
								isMenuOpen={workflowMenuOpen}
								onRequestWorkflowChange={handleWorkflowSelect}
								onToggleWorkflowMenu={() => setWorkflowMenuOpen((open) => !open)}
								onWorkflowSearchChange={setWorkflowSearch}
								searchValue={workflowSearch}
								workflow={activeWorkflow}
							/>
						}
					/>
				);
			case "content":
			case "content-panel":
				return (
					<TaskCanvas
						left={
							<ContentFilledPage
								activeTab={activeTab}
								onAddContent={() => openSearch(scene)}
								onAddContentFromModel={addContentInstanceFromModel}
								onAddArticle={addArticle}
								onOpenSuggested={() => setSuggestedPanelOpen(true)}
								onSelectTaskAsset={(id) => {
									console.log('[Main] setSelectedTaskAssetId called with:', id);
									setSelectedTaskAssetId(id);
								}}
								suggestedOpen={suggestedPanelOpen}
								selectedTaskAssetId={selectedTaskAssetId}
								taskAssets={taskAssets}
								taskArticles={taskArticles}
								selectedArticleId={selectedArticleId}
								onSelectArticle={(id) => {
									console.log('[Main] setSelectedArticleId called with:', id);
									setSelectedArticleId(id);
								}}
								contentInstances={contentInstances}
								setContentInstances={setContentInstances}
								selectedContentInstanceId={selectedContentInstanceId}
								onSelectContentInstance={(id) => {
									console.log('[Main] setSelectedContentInstanceId called with:', id);
									setSelectedContentInstanceId(id);
								}}
								onTabChange={handleTabChange}
								selectedPageId={selectedPageId}
								pages={pages}
								setPages={setPages}
								onSelectPage={(id) => {
									console.log('[Main] setSelectedPageId called with:', id);
									setSelectedPageId(id);
								}}
								onAddToApplication={handleAddToApplication}
								previewOutlines={previewOutlines}
								previewCurrentEle={previewCurrentEle}
								previewHoverEle={previewHoverEle}
								setPreviewCurrentEle={setPreviewCurrentEle}
								setPreviewHoverEle={setPreviewHoverEle}
								setPreviewOutlines={setPreviewOutlines}
								applications={applications}
							/>
						}
						right={
							suggestedPanelOpen ? (
								<SuggestedAssetsPanel
									assets={panelAssetsWithSelection}
									onAddToTask={() =>
										addAssetsToTask(panelAssetsWithSelection.filter((asset) => asset.selected))
									}
									onClearSelection={() => setSelectedPanelAssetIds([])}
									onClose={() => setSuggestedPanelOpen(false)}
									onEditSearch={() => openSearch(scene)}
									onToggleSelect={(assetId) =>
										setSelectedPanelAssetIds((current) =>
											current.includes(assetId)
												? current.filter((id) => id !== assetId)
												: [...current, assetId],
										)
									}
								/>
							) : (
								<WorkflowSidebar
									filteredTemplates={filteredWorkflowTemplates}
									isMenuOpen={workflowMenuOpen}
									onRequestWorkflowChange={handleWorkflowSelect}
									onToggleWorkflowMenu={() => setWorkflowMenuOpen((open) => !open)}
									onWorkflowSearchChange={setWorkflowSearch}
									searchValue={workflowSearch}
									workflow={activeWorkflow}
								/>
							)
						}
					/>
				);
			default:
				return null;
		}
	}, [activeTab, activeWorkflow, exclude, filteredWorkflowTemplates, hasTaskContent, panelAssetsWithSelection, perspectives, rankedSearchAssets, scene, searchReturnScene, selectedAsset, selectedTaskAssetId, selectedContentInstanceId, selectedArticleId, taskAssets, taskArticles, contentInstances, suggestedPanelOpen, workflowMenuOpen, workflowSearch]);

	return (
		<Box
			style={{
				minHeight: "calc(100vh - 48px)",
			}}
		>
			{mainContent}
			{workflowDialogOpen && (
				<WorkflowChangeModal
					onCancel={closeWorkflowDialog}
					onConfirm={applyWorkflowChange}
					workflowName={
						workflowTemplates.find((template) => template.id === pendingWorkflowId)?.name ?? "workflow"
					}
				/>
			)}
			{/* Target Content Type Selection Dialog */}
			{instanceToAdd && (
				<TargetContentTypeDialog
					open={isTargetSelectionOpen}
					onClose={() => {
						setIsTargetSelectionOpen(false);
						setInstanceToAdd(null);
					}}
					availableTargets={
						contentTypes
							.find(ct => ct.id === instanceToAdd.modelId)
							?.mappings?.map(mapping => ({
								mapping,
								targetType: contentTypes.find(ct => ct.id === mapping.targetContentTypeId)!,
							}))
							.filter(t => t.targetType) || []
					}
					onSelect={(targetContentTypeId) => createAndAddPage(instanceToAdd, targetContentTypeId)}
				/>
			)}
		</Box>
	);
}

function TaskCanvas({ left, right }: { left: ReactNode; right?: ReactNode }) {
	if (!right) {
		return (
			<Box style={{ minHeight: "calc(100vh - 48px)" }}>
				{left}
			</Box>
		);
	}

	return (
		<Box
			display="grid"
			style={{
				gridTemplateColumns: "minmax(0, 1fr) 392px",
				height: "calc(100vh - 48px)",
			}}
		>
			<Box overflow="auto">{left}</Box>
			<Box
				bg="bg.default"
				borderL="1"
				borderColor="border.tertiary"
				overflow="auto"
				style={{ boxShadow: "0 6px 24px rgba(16, 24, 40, 0.04)" }}
			>
				{right}
			</Box>
		</Box>
	);
}

function PageHeader({
	activeTab,
	onTabChange,
}: {
	activeTab: TaskTab;
	onTabChange: (tab: string) => void;
}) {
	return (
		<Box display="flex" flexDirection="column" style={{ gap: 14, padding: "18px 32px 0" }}>
			<Box alignItems="center" display="flex" style={{ gap: 10 }}>
				<Text color="fg.tertiary" style={{ fontSize: 12, lineHeight: "16px", maxWidth: "none" }}>Label</Text>
				<Text color="fg.tertiary" style={{ fontSize: 12, lineHeight: "16px", maxWidth: "none" }}>/</Text>
				<Text color="fg.tertiary" style={{ fontSize: 12, lineHeight: "16px", maxWidth: "none" }}>Ca...</Text>
				<Text color="fg.tertiary" style={{ fontSize: 12, lineHeight: "16px", maxWidth: "none" }}>/</Text>
				<Text color="fg.tertiary" style={{ fontSize: 12, lineHeight: "16px", maxWidth: "none" }}>TSK...</Text>
			</Box>

			<Text
				color="fg.default"
				style={{
					fontSize: 28,
					fontWeight: 500,
					letterSpacing: "-0.8px",
					lineHeight: "40px",
					maxWidth: "none",
				}}
			>
				Ironman Miami triathlon 2026 Sponsor Package
			</Text>

			<Tabs onValueChange={onTabChange} value={activeTab}>
				<TabsList style={{ gap: 20 }}>
					<TabsTrigger value="brief">Brief</TabsTrigger>
					<TabsTrigger value="content">Content</TabsTrigger>
					<TabsTrigger value="fields">Fields</TabsTrigger>
					<TabsTrigger value="publishing">Publishing</TabsTrigger>
					<TabsTrigger value="related">Related</TabsTrigger>
					<TabsTrigger value="financial">Financial</TabsTrigger>
					<TabsTrigger value="history">History</TabsTrigger>
				</TabsList>
			</Tabs>
		</Box>
	);
}

function BriefPage({
	activeTab,
	briefContent,
	onOpenEdit,
	onTabChange,
}: {
	activeTab: TaskTab;
	briefContent: string;
	onOpenEdit: () => void;
	onTabChange: (tab: string) => void;
}) {
	return (
		<Box pb="32">
			<PageHeader activeTab={activeTab} onTabChange={onTabChange} />
			<Box display="flex" flexDirection="column" style={{ gap: 18, padding: "24px 28px 0", width: "100%" }}>
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Text color="fg.default" fontSize="xl" fontWeight="500" style={{ maxWidth: "none" }}>
						Brief - Create Sponsor Package for Ironman / STRIDE event in March 2026
					</Text>
					<Button appearance="subtle" aria-label="More" icon={<IconDots size={18} />} size="sm" />
				</Box>

				<Box
					bg="bg.default"
					border="1"
					borderColor="border.tertiary"
					rounded="lg"
					style={{ lineHeight: 1.5, padding: 16 }}
				>
					<Box display="flex" flexDirection="column" style={{ gap: 16 }}>
						<Box
							alignItems="center"
							display="flex"
							gap="12"
							justifyContent="space-between"
							onClick={onOpenEdit}
							style={{
								alignItems: "center",
								background:
									"radial-gradient(375.64% 231.08% at 4.42% 18.63%, #f5f3ff 5.25%, #e5efff 61%, #ddd6fe 85%)",
								borderRadius: 8,
								cursor: "pointer",
								height: 52,
								maxWidth: "100%",
								minHeight: 48,
								padding: 12,
							}}
						>
							<Text color="fg.secondary" fontSize="md" style={{ flex: 1 }}>
								Opal can suggest existing assets that meet the goals of your brief
							</Text>
							<Button
								appearance="primary-opal"
								onClick={(event) => {
									event.stopPropagation();
									onOpenEdit();
								}}
								icon={<img alt="Opal" height={18} src="/opal-orb.png" width={18} />}
								size="lg"
								style={{
									borderRadius: 6,
									height: 40,
									minHeight: 40,
									padding: "0 12px",
								}}
							>
								Generate
							</Button>
						</Box>

						<Text color="fg.tertiary" fontSize="sm" style={{ maxWidth: "none" }}>
							Last Modified by Sasha Thiel on Jan 25, 2026, 2:58 PM
						</Text>

						<BriefBody content={briefContent} />
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

function BriefEditPage({
	activeTab,
	briefContent,
	onBriefContentChange,
	onCancel,
	onSave,
	onTabChange,
}: {
	activeTab: TaskTab;
	briefContent: string;
	onBriefContentChange: (value: string) => void;
	onCancel: () => void;
	onSave: () => void;
	onTabChange: (tab: string) => void;
}) {
	return (
		<Box pb="32">
			<PageHeader activeTab={activeTab} onTabChange={onTabChange} />
			<Box display="flex" flexDirection="column" style={{ gap: 18, padding: "24px 28px 0", width: "100%" }}>
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Text color="fg.default" fontSize="xl" fontWeight="500" style={{ maxWidth: "none" }}>
						Brief - Create Sponsor Package for Ironman / STRIDE event in...
					</Text>
					<Box alignItems="center" display="flex" style={{ gap: 14 }}>
						<Button appearance="subtle" onClick={onCancel} size="sm">Cancel Changes</Button>
						<Button appearance="primary" onClick={onSave} size="sm">Save</Button>
					</Box>
				</Box>

				<EditorSurface content={briefContent} onChange={onBriefContentChange} />
			</Box>
		</Box>
	);
}

function BriefBody({ content }: { content: string }) {
	return (
		<>
			<style>{richTextContentStyles}</style>
			<Box style={{ maxWidth: "none" }}>
				<div className="brief-rich-content" dangerouslySetInnerHTML={{ __html: content }} />
			</Box>
		</>
	);
}

function RichToolbar({
	onAction,
}: {
	onAction: (action: string, value?: string) => void;
}) {
	const topRow = [
		{ label: "↶", action: "undo", title: "Undo" },
		{ label: "↷", action: "redo", title: "Redo" },
		{ label: "P", action: "paragraph", title: "Paragraph" },
		{ label: "H2", action: "heading-two", title: "Heading 2" },
		{ label: "H3", action: "heading-three", title: "Heading 3" },
		{ label: "14px", action: "font-size", title: "14px", value: "3" },
		{ label: "18px", action: "font-size", title: "18px", value: "4" },
		{ label: "24px", action: "font-size", title: "24px", value: "5" },
		{ label: "≡", action: "justifyLeft", title: "Align left" },
		{ label: "≣", action: "justifyCenter", title: "Align center" },
		{ label: "≢", action: "justifyRight", title: "Align right" },
		{ label: "•", action: "insertUnorderedList", title: "Bulleted list" },
		{ label: "1.", action: "insertOrderedList", title: "Numbered list" },
		{ label: "⇤", action: "outdent", title: "Outdent" },
		{ label: "⇥", action: "indent", title: "Indent" },
		{ label: "⎯", action: "insertHorizontalRule", title: "Divider" },
		{ label: "?", action: "removeFormat", title: "Clear formatting" },
	];
	const bottomRow = [
		{ label: "B", action: "bold", title: "Bold" },
		{ label: "I", action: "italic", title: "Italic" },
		{ label: "U", action: "underline", title: "Underline" },
		{ label: "A", action: "text-color", title: "Text color" },
		{ label: "⋯", action: "strikeThrough", title: "Strikethrough" },
		{ label: "🔗", action: "create-link", title: "Insert link" },
		{ label: "❝", action: "blockquote", title: "Quote" },
		{ label: "</>", action: "code-block", title: "Code block" },
	];

	return (
		<Box bg="bg.default">
			<Box alignItems="center" display="flex" gap="4" px="8" py="8" style={{ borderBottom: "1px solid var(--ax-colors-border-default)" }}>
				{topRow.map((item) => (
					<Box
						asChild
						key={item.action + item.label}
						alignItems="center"
						display="flex"
						justifyContent="center"
						rounded="sm"
					>
						<button
							onMouseDown={(event) => {
								event.preventDefault();
								onAction(item.action, item.value);
							}}
							style={{
								background: "transparent",
								border: "none",
								color: "var(--ax-colors-fg-secondary)",
								cursor: "pointer",
								fontSize: 14,
								height: 28,
								minWidth: item.label.length > 2 ? 48 : 28,
								padding: "0 8px",
							}}
							title={item.title}
							type="button"
						>
							{item.label}
						</button>
					</Box>
				))}
			</Box>
			<Box alignItems="center" display="flex" gap="4" px="8" py="8" style={{ borderBottom: "1px solid var(--ax-colors-border-default)" }}>
				{bottomRow.map((item) => (
					<Box
						asChild
						key={item.action + item.label}
						alignItems="center"
						display="flex"
						justifyContent="center"
						rounded="sm"
					>
						<button
							onMouseDown={(event) => {
								event.preventDefault();
								onAction(item.action);
							}}
							style={{
								background: "transparent",
								border: "none",
								color: "var(--ax-colors-fg-secondary)",
								cursor: "pointer",
								fontSize: 14,
								height: 28,
								minWidth: item.label.length > 2 ? 40 : 28,
								padding: "0 8px",
							}}
							title={item.title}
							type="button"
						>
							{item.label}
						</button>
					</Box>
				))}
			</Box>
		</Box>
	);
}

function EditorSurface({
	content,
	onChange,
}: {
	content: string;
	onChange: (value: string) => void;
}) {
	const editorRef = useRef<HTMLDivElement | null>(null);
	const selectionRef = useRef<Range | null>(null);

	useEffect(() => {
		const editor = editorRef.current;

		if (!editor || editor.innerHTML === content) {
			return;
		}

		editor.innerHTML = content;
	}, [content]);

	const saveSelection = () => {
		const selection = window.getSelection();
		const editor = editorRef.current;

		if (!selection || selection.rangeCount === 0 || !editor) {
			return;
		}

		const range = selection.getRangeAt(0);

		if (editor.contains(range.commonAncestorContainer)) {
			selectionRef.current = range.cloneRange();
		}
	};

	const restoreSelection = () => {
		const selection = window.getSelection();
		const range = selectionRef.current;

		if (!selection || !range) {
			return;
		}

		selection.removeAllRanges();
		selection.addRange(range);
	};

	const commitEditorChange = () => {
		saveSelection();
		onChange(editorRef.current?.innerHTML ?? "");
	};

	const runCommand = (command: string, value?: string) => {
		editorRef.current?.focus();
		restoreSelection();
		document.execCommand("styleWithCSS", false, "true");
		document.execCommand(command, false, value);
		commitEditorChange();
	};

	const handleToolbarAction = (action: string, value?: string) => {
		switch (action) {
			case "paragraph":
				runCommand("formatBlock", "p");
				return;
			case "heading-two":
				runCommand("formatBlock", "h2");
				return;
			case "heading-three":
				runCommand("formatBlock", "h3");
				return;
			case "blockquote":
				runCommand("formatBlock", "blockquote");
				return;
			case "code-block":
				runCommand("formatBlock", "pre");
				return;
			case "font-size":
				runCommand("fontSize", value);
				return;
			case "create-link": {
				const url = window.prompt("Enter a URL");

				if (!url) {
					return;
				}

				runCommand("createLink", url);
				return;
			}
			case "text-color": {
				const color = window.prompt("Enter a text color", "#1D4ED8");

				if (!color) {
					return;
				}

				runCommand("foreColor", color);
				return;
			}
			default:
				runCommand(action, value);
		}
	};

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.default"
			rounded="lg"
			style={{ overflow: "hidden" }}
		>
			<style>{richTextContentStyles}</style>
			<RichToolbar onAction={handleToolbarAction} />
			<Box p="20" style={{ lineHeight: 1.5, minHeight: 620 }}>
				<Text color="fg.tertiary" fontSize="sm">
					Last Modified by Sasha Thiel on Jan 25, 2026, 2:58 PM
				</Text>
				<Box mt="20">
					<div
						className="brief-editor-content"
						contentEditable
						onInput={commitEditorChange}
						onKeyUp={saveSelection}
						onMouseUp={saveSelection}
						ref={editorRef}
						suppressContentEditableWarning
						style={{
							background: "transparent",
							border: "none",
							color: "var(--ax-colors-fg-default)",
							fontFamily: "Inter, sans-serif",
							fontSize: 14,
							letterSpacing: "-0.1px",
							lineHeight: "20px",
							minHeight: 520,
							outline: "none",
							padding: 0,
							whiteSpace: "normal",
							width: "100%",
						}}
					/>
				</Box>
			</Box>
		</Box>
	);
}

function WorkflowSidebar({
	filteredTemplates,
	isMenuOpen,
	onRequestWorkflowChange,
	onToggleWorkflowMenu,
	onWorkflowSearchChange,
	searchValue,
	workflow,
}: {
	filteredTemplates: WorkflowTemplate[];
	isMenuOpen: boolean;
	onRequestWorkflowChange: (workflowId: string) => void;
	onToggleWorkflowMenu: () => void;
	onWorkflowSearchChange: (value: string) => void;
	searchValue: string;
	workflow: WorkflowTemplate;
}) {
	return (
		<Box bg="bg.default" display="flex" flexDirection="column" style={{ padding: "14px 16px 18px", position: "relative" }}>
			<Box display="flex" flexDirection="column" style={{ gap: 18 }}>
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Box alignItems="center" display="flex" style={{ gap: 14 }}>
						<WorkflowAvatarGroup />
						<Box alignItems="center" display="flex" gap="8">
							<IconEye size={18} color="var(--ax-colors-fg-secondary)" />
							<Text color="fg.default" style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", maxWidth: "none" }}>
								8
							</Text>
						</Box>
					</Box>
					<Box alignItems="center" display="flex" gap="8">
						<Button appearance="default" size="sm" style={{ borderRadius: 6, height: 28, padding: "0 10px" }}>
							Mark Complete
						</Button>
						<Button appearance="subtle" aria-label="More" icon={<IconDots size={16} />} size="sm" style={{ height: 28, width: 28 }} />
					</Box>
				</Box>

				<Box alignItems="center" display="flex" style={{ gap: 18 }}>
					<Badge intent="information" style={{ fontSize: 12, height: 22, padding: "0 8px" }}>In Progress</Badge>
					<InlineDate label="Started • May 11" />
					<InlineDate label="Due • Jun 28" />
				</Box>

				<Box bg="bg.tertiary" rounded="full" style={{ height: 6, overflow: "hidden" }}>
					<Box bg="bg.accent" style={{ height: "100%", width: "70%" }} />
				</Box>
			</Box>

			<Box
				display="flex"
				flexDirection="column"
				mt="20"
				style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}
			>
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Box alignItems="center" display="flex" style={{ gap: 18 }}>
						<WorkflowTab active>Workflow</WorkflowTab>
						<WorkflowTab>Comments</WorkflowTab>
						<WorkflowTab>Attachments</WorkflowTab>
					</Box>
					<Button appearance="subtle" aria-label="Collapse" icon={<IconChevronRight size={16} />} size="sm" style={{ height: 28, width: 28 }} />
				</Box>
			</Box>

			<Box
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", padding: "14px 0" }}
			>
				<Button
					appearance="subtle"
					onClick={onToggleWorkflowMenu}
					size="sm"
					style={{
						background: workflow.id === "starter" ? "var(--ax-colors-bg-secondary)" : "transparent",
						borderRadius: 8,
						height: 32,
						justifyContent: "flex-start",
						padding: workflow.id === "starter" ? "0 16px" : 0,
					}}
				>
					<Box alignItems="center" display="flex" gap="8">
					<Text color="fg.default" style={{ fontSize: 16, lineHeight: "24px", maxWidth: "none" }}>
						{workflow.name}
					</Text>
					<IconChevronDown size={16} color="var(--ax-colors-fg-secondary)" />
					</Box>
				</Button>
				<Button appearance="subtle" aria-label="Workflow menu" icon={<IconDots size={16} />} size="sm" style={{ height: 28, width: 28 }} />
			</Box>

			{isMenuOpen && (
				<WorkflowTemplateMenu
					templates={filteredTemplates}
					onSearchChange={onWorkflowSearchChange}
					onSelect={onRequestWorkflowChange}
					searchValue={searchValue}
				/>
			)}

			<Box display="flex" flexDirection="column">
				{workflow.steps.map((step) => (
					<WorkflowStepItem key={step.id} step={step} />
				))}
			</Box>

			<Button appearance="subtle" size="sm" style={{ justifyContent: "flex-start", marginTop: 10, paddingLeft: 0 }}>
				<Box alignItems="center" display="flex" gap="8">
					<IconPlus size={16} />
					<span>Add Step</span>
				</Box>
			</Button>
		</Box>
	);
}

function WorkflowAvatarGroup() {
	return (
		<Box alignItems="center" display="flex">
			<DashedCircle>
				<IconPlus size={12} stroke={1.8} />
			</DashedCircle>
			<Avatar size="sm" src="/avatars/aamr-fakhry.png" style={{ height: 24, marginLeft: 6, width: 24 }} />
			<Avatar size="sm" src="/avatars/benjamin-holme.svg" style={{ height: 24, marginLeft: -4, width: 24 }} />
			<Avatar size="sm" src="/avatars/stefan-svebeck.svg" style={{ height: 24, marginLeft: -4, width: 24 }} />
			<Box
				alignItems="center"
				bg="bg.secondary"
				display="flex"
				justifyContent="center"
				rounded="full"
				style={{ height: 24, marginLeft: -4, width: 24 }}
			>
				<Text style={{ fontSize: 12, fontWeight: 500, lineHeight: "16px", maxWidth: "none" }}>+3</Text>
			</Box>
		</Box>
	);
}

function WorkflowTemplateMenu({
	templates,
	onSearchChange,
	onSelect,
	searchValue,
}: {
	templates: WorkflowTemplate[];
	onSearchChange: (value: string) => void;
	onSelect: (workflowId: string) => void;
	searchValue: string;
}) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.default"
			rounded="lg"
			style={{
				boxShadow: "0 12px 32px rgba(22, 34, 51, 0.18)",
				left: 16,
				maxHeight: 560,
				overflow: "hidden",
				position: "absolute",
				right: 16,
				top: 164,
				zIndex: 30,
			}}
		>
			<Box display="flex" flexDirection="column" style={{ gap: 8, padding: 8 }}>
				<Input
					addonBefore={<IconSearch size={16} />}
					onChange={(event) => onSearchChange(event.target.value)}
					placeholder="Search by workflow Name"
					value={searchValue}
				/>
				<Box display="flex" flexDirection="column" overflow="auto" style={{ maxHeight: 470 }}>
					{templates.map((template) => (
						<button
							key={template.id}
							onClick={() => onSelect(template.id)}
							style={{
								alignItems: "flex-start",
								background: "transparent",
								border: "none",
								borderRadius: 8,
								cursor: "pointer",
								display: "flex",
								gap: 12,
								padding: "14px 12px",
								textAlign: "left",
								width: "100%",
							}}
						>
							<WorkflowTemplateIcon icon={template.icon} />
							<Box display="flex" flexDirection="column" style={{ gap: template.subtitle ? 4 : 0 }}>
								<Text color="fg.default" style={{ fontSize: 16, lineHeight: "24px", maxWidth: "none" }}>
									{template.name}
								</Text>
								{template.subtitle && (
									<Text color="fg.tertiary" style={{ fontSize: 14, lineHeight: "20px", maxWidth: "none" }}>
										{template.subtitle}
									</Text>
								)}
							</Box>
						</button>
					))}
				</Box>
			</Box>
		</Box>
	);
}

function WorkflowTemplateIcon({ icon }: { icon: WorkflowTemplateIconKind }) {
	const common = { color: "var(--ax-colors-fg-secondary)", size: 18 };

	switch (icon) {
		case "calendar":
			return <IconCalendar {...common} />;
		case "sparkles":
			return <SparklesIcon height={common.size} style={{ color: common.color }} width={common.size} />;
		case "tag":
			return <IconTag {...common} />;
		case "check":
			return <IconCheck {...common} />;
		case "copy":
		default:
			return <IconCopy {...common} />;
	}
}

function WorkflowTab({ active = false, children }: { active?: boolean; children: ReactNode }) {
	return (
		<Box
			style={{
				borderBottom: active ? "2px solid var(--ax-colors-border-accent)" : "2px solid transparent",
				paddingBottom: 10,
			}}
		>
			<Text
				color={active ? "fg.default" : "fg.tertiary"}
				style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", maxWidth: "none" }}
			>
				{children}
			</Text>
		</Box>
	);
}

function WorkflowStepItem({ step }: { step: WorkflowStep }) {
	if (step.expanded) {
		return <WorkflowExpandedStep step={step} />;
	}

	return (
			<Box
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", padding: "14px 0" }}
			>
			<Box alignItems="center" display="flex" gap="12">
				<IconChevronRight size={16} color="var(--ax-colors-fg-secondary)" />
				{step.done ? (
					<Box
						alignItems="center"
						bg="bg.success.light"
						display="flex"
						justifyContent="center"
						rounded="full"
						style={{ height: 24, width: 24 }}
					>
						<IconCheck size={14} color="var(--ax-colors-fg-success-strong)" />
					</Box>
				) : (
					<DashedCircle />
				)}
				<Text color="fg.default" style={{ fontSize: 15, fontWeight: 500, lineHeight: "22px", maxWidth: "none" }}>{step.title}</Text>
			</Box>
			<Box alignItems="center" display="flex" gap="12">
				{step.date && (
					<Text
						color={step.danger ? "fg.error.strong" : "fg.secondary"}
						style={{ fontSize: 12, fontWeight: 500, lineHeight: "16px", maxWidth: "none" }}
					>
						{step.date}
					</Text>
				)}
				{step.showCalendarAction && <DashedCircle><IconCalendar size={12} /></DashedCircle>}
				<Avatar size="xs" src="/avatars/aamr-fakhry.png" style={{ height: 20, width: 20 }} />
				<Box
					alignItems="center"
					bg="bg.secondary"
					display="flex"
					justifyContent="center"
					rounded="full"
					style={{ height: 20, width: 20 }}
				>
					<Text fontSize="xs" style={{ fontSize: 10, lineHeight: "14px" }}>WM</Text>
				</Box>
			</Box>
		</Box>
	);
}

function WorkflowExpandedStep({ step }: { step: WorkflowStep }) {
	return (
			<Box
				display="flex"
				flexDirection="column"
				style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", gap: 16, padding: "14px 0" }}
			>
			<Box alignItems="center" display="flex" justifyContent="space-between">
				<Box alignItems="center" display="flex" gap="12">
					<IconChevronDown size={16} color="var(--ax-colors-fg-secondary)" />
					<DashedCircle />
					<Text color="fg.default" style={{ fontSize: 15, fontWeight: 500, lineHeight: "22px", maxWidth: "none" }}>{step.title}</Text>
				</Box>
				<Box alignItems="center" display="flex" gap="12">
					{step.showCalendarAction && <DashedCircle><IconCalendar size={12} /></DashedCircle>}
					<Avatar size="xs" src="/avatars/aamr-fakhry.png" style={{ height: 20, width: 20 }} />
					<Box
						alignItems="center"
						bg="bg.secondary"
						display="flex"
						justifyContent="center"
						rounded="full"
						style={{ height: 20, width: 20 }}
					>
						<Text fontSize="xs" style={{ fontSize: 10, lineHeight: "14px" }}>WM</Text>
					</Box>
				</Box>
			</Box>

				<Box display="flex" flexDirection="column" style={{ gap: 12, paddingLeft: 76 }}>
				<Box alignItems="center" display="flex" gap="10">
					<Text color="fg.tertiary" style={{ fontSize: 12, lineHeight: "16px", maxWidth: "none" }}>Assigned to</Text>
					<Text color="fg.default" style={{ fontSize: 14, lineHeight: "20px", maxWidth: "none" }}>{step.assignee ?? "Mary Anne"}</Text>
				</Box>
				<Text color="fg.tertiary" style={{ fontSize: 14, lineHeight: "20px", maxWidth: "none" }}>
					{step.description ?? "Write description"}
				</Text>
				{step.checklist?.map((item) => (
					<ChecklistItem key={item} label={item} />
				))}
				<Badge intent="neutral" style={{ fontSize: 12, height: 22, width: "fit-content" }}>{step.badgeLabel ?? "Not Started"}</Badge>
				<Box alignItems="center" display="flex" gap="8" pt="4">
					<Button appearance="subtle" aria-label="Comment" icon={<IconPlus size={14} />} size="sm" style={{ height: 28, width: 28 }} />
					<Button appearance="subtle" aria-label="Delete" icon={<IconX size={14} />} size="sm" style={{ height: 28, width: 28 }} />
					<Button appearance="subtle" aria-label="More" icon={<IconDots size={14} />} size="sm" style={{ height: 28, width: 28 }} />
				</Box>
			</Box>
		</Box>
	);
}

function ChecklistItem({ label }: { label: string }) {
	return (
		<Box alignItems="center" display="flex" gap="10">
			<Box
				style={{
					border: "1px solid var(--ax-colors-border-control)",
					borderRadius: 2,
					height: 16,
					width: 16,
				}}
			/>
			<Text color="fg.default" style={{ fontSize: 14, lineHeight: "20px", maxWidth: "none" }}>{label}</Text>
		</Box>
	);
}

function InlineDate({ label }: { label: string }) {
	return (
		<Box alignItems="center" display="flex" gap="8">
			<Box
				alignItems="center"
				bg="bg.tertiary"
				display="flex"
				justifyContent="center"
				rounded="full"
				style={{ height: 20, width: 20 }}
			>
				<IconCalendar size={11} color="var(--ax-colors-fg-secondary)" />
			</Box>
			<Text
				color="fg.default"
				style={{
					fontSize: 12,
					fontWeight: 600,
					letterSpacing: "0.01px",
					lineHeight: "16px",
					maxWidth: "none",
					textAlign: "center",
					whiteSpace: "nowrap",
				}}
			>
				{label}
			</Text>
		</Box>
	);
}

function WorkflowChangeModal({
	onCancel,
	onConfirm,
	workflowName,
}: {
	onCancel: () => void;
	onConfirm: () => void;
	workflowName: string;
}) {
	return (
		<>
			<Box
				style={{
					backdropFilter: "blur(8px)",
					background: "rgba(231, 239, 255, 0.42)",
					inset: 0,
					position: "fixed",
					zIndex: 79,
				}}
			/>
			<AlertDialog
				open
				onOpenChange={(open) => {
					if (!open) {
						onCancel();
					}
				}}
			>
				<AlertDialogContent
					size="md"
					style={{
						borderRadius: 12,
						boxShadow:
							"0 4px 4px 1px rgba(9, 30, 66, 0.04), 0 6px 12px -3px rgba(9, 30, 66, 0.08), 0 6px 18px 0 rgba(9, 30, 66, 0.04)",
						maxWidth: 600,
						overflow: "hidden",
						width: "min(600px, calc(100vw - 48px))",
					}}
				>
					<AlertDialogHeader addonBefore={null} style={{ padding: "24px 24px 16px" }}>
						<Text
							color="fg.default"
							style={{
								fontSize: 24,
								fontWeight: 500,
								letterSpacing: "-0.6px",
								lineHeight: "32px",
								maxWidth: "none",
							}}
						>
							Change Workflow
						</Text>
					</AlertDialogHeader>
					<AlertDialogBody style={{ padding: "16px 24px" }}>
						<Box display="flex" flexDirection="column" style={{ gap: 24 }}>
							<Text
								color="fg.default"
								style={{
									fontSize: 14,
									fontWeight: 400,
									letterSpacing: "-0.1px",
									lineHeight: "20px",
									maxWidth: "none",
								}}
							>
								This action will remove all steps from this task and replace them with
								{" "}
								{workflowName}
								.
							</Text>
							<Text
								color="fg.default"
								style={{
									fontSize: 14,
									fontWeight: 400,
									letterSpacing: "-0.1px",
									lineHeight: "20px",
									maxWidth: "none",
								}}
							>
								Do you want to continue?
							</Text>
						</Box>
					</AlertDialogBody>
					<AlertDialogFooter
						alignItems="center"
						borderT="1"
						borderColor="border.tertiary"
						display="flex"
						justifyContent="flex-end"
						style={{ gap: 16, padding: "20px 24px" }}
					>
						<AlertDialogCancel appearance="subtle" onClick={onCancel} size="lg">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction appearance="danger" onClick={onConfirm} size="lg">
							Yes, Change
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

function DashedCircle({ children }: { children?: ReactNode }) {
	return (
		<Box
			alignItems="center"
			display="flex"
			justifyContent="center"
			rounded="full"
			style={{
				border: "1px dashed var(--ax-colors-border-default)",
				height: 24,
				width: 24,
			}}
		>
			{children}
		</Box>
	);
}

function AssetTooltipContent({ asset }: { asset: AssetItem }) {
	return (
		<Box display="flex" flexDirection="column" style={{ gap: 4, maxWidth: 240 }}>
			<Text color="fg.default.inverse" fontSize="sm" fontWeight="600" style={{ maxWidth: "none" }}>
				{asset.title}
			</Text>
			{asset.metaDescription && (
				<Text color="fg.default.inverse" fontSize="xs" style={{ lineHeight: "16px", maxWidth: "none" }}>
					{asset.metaDescription}
				</Text>
			)}
			{asset.tooltip && (
				<Text color="fg.default.inverse" fontSize="xs" style={{ lineHeight: "16px", maxWidth: "none", opacity: 0.8 }}>
					Why suggested: {asset.tooltip}
				</Text>
			)}
		</Box>
	);
}

function SuggestedAssetsPanel({
	assets,
	onAddToTask,
	onClearSelection,
	onClose,
	onEditSearch,
	onToggleSelect,
}: {
	assets: AssetItem[];
	onAddToTask: () => void;
	onClearSelection: () => void;
	onClose: () => void;
	onEditSearch: () => void;
	onToggleSelect: (assetId: string) => void;
}) {
	const pageSize = 8;
	const [visibleCount, setVisibleCount] = useState(pageSize);
	const selectedAssetsCount = assets.filter((asset) => asset.selected).length;

	useEffect(() => {
		setVisibleCount((current) => {
			if (assets.length === 0) {
				return pageSize;
			}

			return Math.min(Math.max(current, pageSize), assets.length);
		});
	}, [assets.length]);

	const visibleAssets = useMemo(() => assets.slice(0, visibleCount), [assets, visibleCount]);
	const hasMoreAssets = visibleCount < assets.length;
	const masonryRows = useMemo(() => {
		const rows: AssetItem[][] = [];

		for (let index = 0; index < visibleAssets.length; index += 2) {
			rows.push(visibleAssets.slice(index, index + 2));
		}

		return rows;
	}, [visibleAssets]);

	return (
			<Box display="flex" flexDirection="column" style={{ gap: 16, padding: 20 }}>
				<Box alignItems="start" display="flex" justifyContent="space-between">
				<Box display="flex" flexDirection="column" gap="4">
					<Text
						color="fg.default"
						style={{
							fontFamily: "Inter, sans-serif",
							fontSize: 20,
							fontWeight: 500,
							letterSpacing: "-0.35px",
							lineHeight: "28px",
							maxWidth: "none",
						}}
					>
						Suggested Assets
					</Text>
					<Text color="fg.tertiary" fontSize="md">Based on your brief</Text>
				</Box>
				<Button appearance="subtle" aria-label="Close" icon={<IconX size={18} />} onClick={onClose} size="sm" />
			</Box>

			{selectedAssetsCount > 0 && (
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Box alignItems="center" display="flex" gap="8">
						<Text
							color="fg.default"
							style={{
								fontFamily: "Inter, sans-serif",
								fontSize: 14,
								fontWeight: 500,
								letterSpacing: "-0.1px",
								lineHeight: "20px",
								maxWidth: "none",
							}}
						>
							{selectedAssetsCount} {selectedAssetsCount === 1 ? "asset" : "assets"} selected
						</Text>
						<Button
							appearance="subtle"
							aria-label="Clear selected assets"
							icon={<IconX size={16} />}
							onClick={onClearSelection}
							size="sm"
						/>
					</Box>
					<Button appearance="primary" onClick={onAddToTask} size="sm">
						Add to task
					</Button>
				</Box>
			)}

			<Box
				display="grid"
				gap="10"
				style={{ gridTemplateColumns: "repeat(10, minmax(0, 1fr))" }}
			>
				{masonryRows.flatMap((row, rowIndex) =>
					row.map((asset, itemIndex) => {
						const useNarrowCard = rowIndex % 2 === itemIndex;

							return (
								<PanelAssetCard
									key={asset.id}
									asset={asset}
									onToggleSelect={() => onToggleSelect(asset.id)}
									span={useNarrowCard ? 4 : 6}
								/>
							);
					}),
				)}
			</Box>

				<Box alignItems="center" display="flex" justifyContent="space-between" pt="6" style={{ gap: 12 }}>
					<Box alignItems="center" display="flex" gap="8" style={{ minHeight: 32 }}>
						{hasMoreAssets && (
							<Button
								appearance="subtle"
								icon={<IconChevronDown size={16} />}
								iconPosition="end"
								onClick={() => setVisibleCount((current) => Math.min(current + pageSize, assets.length))}
								size="sm"
							>
								Show more
							</Button>
						)}
					</Box>
					<Box alignItems="center" display="flex" gap="8">
						<Button appearance="subtle" icon={<IconPencil size={16} />} onClick={onEditSearch} size="sm">
							Edit Search
						</Button>
					</Box>
				</Box>
			</Box>
		);
}

function PanelAssetCard({
	asset,
	onToggleSelect,
	span,
}: {
	asset: AssetItem;
	onToggleSelect: () => void;
	span: 4 | 6;
}) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<Box
			display="flex"
			flexDirection="column"
			gap="8"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			style={{
				gridColumn: `span ${span}`,
				position: "relative",
			}}
		>
			<Tooltip align="start" content={<AssetTooltipContent asset={asset} />} side="top">
				<Box
					rounded="lg"
					style={{
						background: `url(${asset.src}) center / cover`,
						height: 116,
						position: "relative",
					}}
				>
						<button
							aria-label={asset.selected ? `Deselect ${asset.title}` : `Select ${asset.title}`}
							onClick={onToggleSelect}
							style={{
								alignItems: "center",
								background: asset.selected ? "var(--ax-colors-bg-accent)" : "var(--ax-colors-bg-default)",
								border: asset.selected ? "none" : "1px solid var(--ax-colors-border-control)",
								borderRadius: 4,
								boxShadow: asset.selected ? "0 0 0 1px rgba(0,0,0,0.02)" : "0 1px 2px rgba(16,24,40,0.12)",
								cursor: "pointer",
								display: "flex",
								height: 18,
								justifyContent: "center",
								opacity: isHovered || asset.selected ? 1 : 0,
								padding: 0,
								pointerEvents: isHovered || asset.selected ? "auto" : "none",
								position: "absolute",
								right: 8,
								top: 8,
								transition: "opacity 120ms ease",
								width: 18,
								zIndex: 1,
							}}
						type="button"
					>
						{asset.selected && <IconCheck color="white" size={12} stroke={3} />}
					</button>
					<Box alignItems="center" display="flex" gap="8" style={{ left: 8, bottom: 8, position: "absolute" }}>
					<AssetBadge label={asset.label} kind={asset.label} />
					<ScoreBadge score={asset.match} />
				</Box>
				</Box>
			</Tooltip>
		</Box>
	);
}

function SearchPage({
	assets,
	exclude,
	onAdd,
	onAssetClick,
	onBack,
	onExcludeChange,
	onPerspectiveChange,
	onToggleSelect,
	perspectives,
}: {
	assets: SearchAssetItem[];
	exclude: string;
	onAdd: () => void;
	onAssetClick: (asset: AssetItem) => void;
	onBack: () => void;
	onExcludeChange: (value: string) => void;
	onPerspectiveChange: (index: number, value: string) => void;
	onToggleSelect: (assetId: string) => void;
	perspectives: string[];
}) {
	const [layoutMode, setLayoutMode] = useState<"masonry" | "grid">("masonry");
	return (
		<Box display="flex" flexDirection="column" style={{ height: "calc(100vh - 48px)" }}>
			<Box alignItems="center" display="flex" justifyContent="space-between" style={{ padding: "20px 28px" }}>
				<Text color="fg.default" fontSize="4xl" fontWeight="600">Suggested Assets</Text>
			</Box>

			<Box
				display="grid"
				flex="1"
				gap="20"
				style={{ gridTemplateColumns: "minmax(0, 1fr) 444px", minHeight: 0, paddingLeft: 28, paddingRight: 28 }}
			>
				{layoutMode === "masonry" ? (
					<Box
						display="flex"
						flexDirection="column"
						gap="10"
						overflow="auto"
						pb="20"
						style={{
							alignContent: "start",
						}}
					>
						{Array.from({ length: Math.ceil(assets.length / 3) }, (_, rowIndex) => {
							const rowAssets = assets.slice(rowIndex * 3, rowIndex * 3 + 3);

							return (
								<Box
									key={`search-row-${rowIndex}`}
									display="grid"
									gap="10"
									style={{
										gridTemplateColumns: rowAssets
											.map((asset) => `minmax(0, ${asset.width}fr)`)
											.join(" "),
										width: "100%",
									}}
								>
										{rowAssets.map((asset) => (
											<SearchAssetCard
												key={asset.id}
												asset={asset}
												height={asset.height}
												onClick={() => onAssetClick(asset)}
												onToggleSelect={() => onToggleSelect(asset.id)}
												showTooltip
												width="100%"
											/>
										))}
								</Box>
							);
						})}
					</Box>
				) : (
					<Box
						display="grid"
						gap="10"
						overflow="auto"
						pb="20"
						style={{
							alignContent: "start",
							gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
						}}
					>
							{assets.map((asset) => (
								<SearchAssetCard
									key={asset.id}
									asset={asset}
									height={180}
									onClick={() => onAssetClick(asset)}
									onToggleSelect={() => onToggleSelect(asset.id)}
									width="100%"
								/>
							))}
					</Box>
				)}

				<Box bg="bg.default" border="1" borderColor="border.tertiary" rounded="lg" style={{ padding: 16 }}>
					<Text color="fg.default" fontSize="4xl" fontWeight="600">Edit Search Perspectives</Text>
					<Box display="flex" flexDirection="column" mt="24" style={{ gap: 24 }}>
						{perspectives.map((item, index) => (
							<Box key={index} display="flex" flexDirection="column" style={{ gap: 4 }}>
								<Text color="fg.secondary" fontSize="lg">#{index + 1}</Text>
								<Textarea
									onChange={(event) => onPerspectiveChange(index, event.target.value)}
									style={{ minHeight: index === 0 || index === 2 ? 72 : 40 }}
									value={item}
									w="full"
								/>
							</Box>
						))}
						<Box display="flex" flexDirection="column" mt="8" style={{ gap: 4 }}>
							<Text color="fg.secondary" fontSize="lg">Exclude</Text>
							<Textarea
								onChange={(event) => onExcludeChange(event.target.value)}
								style={{ minHeight: 40 }}
								value={exclude}
								w="full"
							/>
						</Box>
					</Box>
				</Box>
			</Box>

			<Box
				alignItems="center"
				bg="bg.default"
				borderT="1"
				borderColor="border.tertiary"
				display="grid"
				style={{
					backgroundColor: "var(--ax-colors-bg-default)",
					bottom: 0,
					flexShrink: 0,
					gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
					padding: "12px",
					position: "sticky",
					width: "100%",
					zIndex: 4,
				}}
			>
				<Box style={{ minWidth: 0 }}>
					<Button appearance="subtle" onClick={onBack} size="lg">
						<Box alignItems="center" display="flex" gap="8">
							<IconChevronLeft size={16} />
							<span>Go Back</span>
						</Box>
					</Button>
				</Box>
				<Box alignItems="center" display="flex" gap="16" justifyContent="center" style={{ padding: "0 12px" }}>
					<FooterViewButton
						active={layoutMode === "masonry"}
						icon={<GridIconAsset active={layoutMode === "masonry"} Icon={Grid1Icon} />}
						onClick={() => setLayoutMode("masonry")}
					/>
					<FooterViewButton
						active={layoutMode === "grid"}
						icon={<GridIconAsset active={layoutMode === "grid"} Icon={Grid2Icon} />}
						onClick={() => setLayoutMode("grid")}
					/>
					<FooterViewButton
						disabled
						icon={<GridIconAsset Icon={Grid3Icon} />}
					/>
					<FooterViewButton disabled icon={<GridIconAsset Icon={Grid4Icon} />} />
				</Box>
					<Box alignItems="center" display="flex" gap="8" justifyContent="flex-end" style={{ minWidth: 0 }}>
						<Button appearance="subtle" size="lg">Cancel</Button>
						<Button appearance="primary" disabled={!assets.some((asset) => asset.selected)} onClick={onAdd} size="lg">Add to Content</Button>
					</Box>
				</Box>
			</Box>
		);
}

function SearchAssetCard({
	asset,
	height,
	onClick,
	onToggleSelect,
	showTooltip = false,
	width,
}: {
	asset: SearchAssetItem;
	height: number;
	onClick: () => void;
	onToggleSelect: () => void;
	showTooltip?: boolean;
	width?: number | string;
}) {
	const [isHovered, setIsHovered] = useState(false);
	const card = (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={onClick}
			overflow="hidden"
			rounded="lg"
			style={{
				cursor: "pointer",
				height,
				position: "relative",
				width: width ?? "100%",
			}}
		>
			{"thumbnailSrc" in asset && asset.thumbnailSrc && (
				<img
					alt={asset.title}
					src={asset.thumbnailSrc}
					style={{ height: "100%", inset: 0, objectFit: "cover", position: "absolute", width: "100%" }}
				/>
			)}
			<img
				alt={asset.title}
				src={asset.src}
				style={{ height: "100%", inset: 0, objectFit: "cover", position: "absolute", width: "100%" }}
			/>
				<button
					aria-label={asset.selected ? `Deselect ${asset.title}` : `Select ${asset.title}`}
					onClick={(event) => {
						event.stopPropagation();
						onToggleSelect();
					}}
					style={{
						alignItems: "center",
						background: asset.selected ? "var(--ax-colors-bg-accent)" : "var(--ax-colors-bg-default)",
						border: asset.selected ? "none" : "1px solid var(--ax-colors-border-control)",
						borderRadius: 4,
						boxShadow: asset.selected ? "0 0 0 1px rgba(0,0,0,0.02)" : "0 1px 2px rgba(16,24,40,0.12)",
						cursor: "pointer",
						display: "flex",
						height: 18,
						justifyContent: "center",
						opacity: isHovered || asset.selected ? 1 : 0,
						padding: 0,
						pointerEvents: isHovered || asset.selected ? "auto" : "none",
						position: "absolute",
						right: 16,
						top: 16,
						transition: "opacity 120ms ease",
						width: 18,
						zIndex: 1,
					}}
				type="button"
			>
				{asset.selected && <IconCheck color="white" size={11} stroke={3} />}
			</button>
			<Box alignItems="center" display="flex" gap="8" style={{ bottom: 16, left: 16, position: "absolute" }}>
				<AssetBadge label={asset.label} kind={asset.label} />
				<ScoreBadge score={asset.match} />
			</Box>
		</Box>
	);

	if (!showTooltip) {
		return card;
	}

	return (
		<Tooltip align="start" content={<AssetTooltipContent asset={asset} />} side="top">
			{card}
		</Tooltip>
	);
}

function PreviewPage({
	asset,
	onAdd,
	onClose,
}: {
	asset: AssetItem;
	onAdd: () => void;
	onClose: () => void;
}) {
	const fileTitle = asset.preview === "pdf" ? "pdf.pdf" : `${asset.title}.jpg`;

	return (
		<Box display="flex" flexDirection="column" style={{ height: "calc(100vh - 48px)" }}>
			<Box display="flex" flex="1" overflow="auto">
				<Box flex="1" px="40" py="24">
					<Box alignItems="center" display="flex" justifyContent="space-between">
						<Box display="flex" flexDirection="column" gap="10">
							<Text color="fg.tertiary" fontSize="lg">File</Text>
							<Text color="fg.default" fontSize="4xl" fontWeight="500">{fileTitle}</Text>
							<Text color="fg.secondary" fontSize="2xl">Updated on Jun 9, 2020</Text>
						</Box>
						<Box alignItems="center" display="flex" style={{ gap: 18 }}>
							<img alt="brand" height={28} src="/opal-orb.png" width={28} />
							<Box alignItems="center" display="flex" gap="8">
								<IconCopy size={16} color="var(--ax-colors-fg-secondary)" />
								<Text fontSize="lg">Share</Text>
							</Box>
							<Box alignItems="center" display="flex" gap="8">
								<IconEye size={16} color="var(--ax-colors-fg-secondary)" />
								<Text fontSize="lg">1</Text>
							</Box>
						</Box>
					</Box>

					<Box alignItems="center" display="flex" justifyContent="flex-end" mt="20">
						<Box alignItems="center" display="flex" gap="8">
							<IconLink size={18} color="var(--ax-colors-fg-secondary)" />
							<Text color="fg.secondary" fontSize="lg">Public Link</Text>
						</Box>
					</Box>

					<Box
						bg="bg.default"
						border="1"
						borderColor="border.default"
						mt="12"
						style={{ maxWidth: 980 }}
					>
						<Box
							alignItems="center"
							display="flex"
							gap="16"
							px="16"
							py="12"
							style={{ borderBottom: "1px solid var(--ax-colors-border-default)" }}
						>
							{["▥", "📄", "117 %", "⊖", "⊕", "🙈", "☞", "⬚"].map((item, index) => (
								<Box key={item + index} alignItems="center" display="flex" justifyContent="center" style={{ color: "var(--ax-colors-fg-secondary)", minWidth: 28 }}>
									{item}
								</Box>
							))}
							<Box style={{ flex: 1 }} />
							<IconSearch size={18} color="var(--ax-colors-fg-secondary)" />
							<IconUpload size={18} color="var(--ax-colors-fg-secondary)" />
							<IconMaximize size={18} color="var(--ax-colors-fg-secondary)" />
						</Box>
						<Box p="10">
							<img
								alt={asset.title}
								src={asset.preview === "pdf" ? asset.previewSrc || asset.src : asset.src}
								style={{ display: "block", width: "100%" }}
							/>
						</Box>
					</Box>

						<Box display="flex" flexDirection="column" mt="24" style={{ gap: 22 }}>
						{["File Information", "Related Assets", "Fields", "Tags", "Usage"].map((section) => (
							<Box key={section} alignItems="center" display="flex" style={{ gap: 14 }}>
								<IconChevronRight size={16} color="var(--ax-colors-fg-secondary)" />
								<Text color="fg.default" fontSize="2xl">{section}</Text>
							</Box>
						))}
						<Box alignItems="center" display="flex" gap="10" style={{ paddingLeft: 28 }}>
							<Badge intent="neutral">v1</Badge>
							<Text fontSize="lg">{fileTitle}</Text>
						</Box>
					</Box>
				</Box>
			</Box>

			<Box
				alignItems="center"
				bg="bg.default"
				borderT="1"
				borderColor="border.tertiary"
				display="flex"
				justifyContent="center"
				style={{ gap: 14, padding: "14px 18px" }}
			>
				<Button appearance="subtle" onClick={onClose} size="sm">Close</Button>
				<Button appearance="primary" onClick={onAdd} size="sm">Add to Task</Button>
			</Box>
		</Box>
	);
}

function ContentEmptyPage({
	activeTab,
	onAddContent,
	onAddContentFromModel,
	onAddArticle,
	onTabChange,
}: {
	activeTab: TaskTab;
	onAddContent: () => void;
	onAddContentFromModel: (model: ContentType) => void;
	onAddArticle: () => void;
	onTabChange: (tab: string) => void;
}) {
	const [contentTypes] = usePersistentState("contentTypes", initialContentTypes) as [
		ContentType[],
		(value: ContentType[]) => void,
	];

	// Use CMP content models directly, converted to ContentType format
	const cmpContentModels = useMemo(
		() => initialCmpContentModels.map(convertCmpModelToContentType),
		[]
	);

	return (
		<Box pb="40" style={{ minHeight: "calc(100vh - 48px)", position: "relative" }}>
			<PageHeader activeTab={activeTab} onTabChange={onTabChange} />
			<Box
				alignItems="center"
				display="flex"
				justifyContent="center"
				style={{ minHeight: "calc(100vh - 230px)", padding: "0 28px", position: "relative" }}
			>
				<Box
					alignItems="center"
					display="flex"
					flexDirection="column"
					style={{ gap: 32, maxWidth: 435, position: "relative", textAlign: "center", zIndex: 1 }}
				>
					<Box display="flex" flexDirection="column" style={{ gap: 8 }}>
						<Text color="fg.default" fontSize="3xl" fontWeight="500">
							Add Content
						</Text>
						<Text color="fg.secondary" fontSize="md" style={{ maxWidth: 360 }}>
							Use this workspace to add, revise, and optimize content. You can add assets by clicking the
							{" "}
							"Add Content" button.
						</Text>
					</Box>
					<Menu
						options={[
							{
								label: "Asset",
								addon: <IconPhoto size={20} />,
								description: "Add assets from recommendations",
								execute: () => onAddContent(),
							},
							{
								label: "Article",
								addon: <IconFileText size={20} />,
								description: "Add a hardcoded article example",
								execute: () => onAddArticle(),
							},
							{
								label: "From CMS",
								addon: <IconBroadcast size={20} />,
								description: "Add content from CMS",
								execute: () => { /* TODO: Implement CMS content selection */ },
							},
							{
								label: "Component",
								addon: <IconPuzzle size={20} />,
								description: "Add a reusable component",
								execute: () => { /* TODO: Implement component selection */ },
							},
							{
								label: "Content Type",
								addon: <IconFileText size={20} />,
								description: "Add content from a content model",
								subOptions: cmpContentModels
									.filter((model) => model.isActive !== false)
									.map((model) => ({
										label: model.displayName || model.name,
										description: model.description || `Create a new ${(model.displayName || model.name).toLowerCase()}`,
										execute: () => onAddContentFromModel(model),
									})),
							},
						]}
					>
						<MenuTrigger asChild>
							<Button appearance="primary" size="lg">
								<Box alignItems="center" display="flex" gap="8">
									<IconPlus size={16} />
									<span>Add Content</span>
									<IconChevronDown size={16} />
								</Box>
							</Button>
						</MenuTrigger>
						<MenuContent />
					</Menu>
				</Box>

				<img
					alt=""
					aria-hidden="true"
					src={figmaAssets.emptyContentBg}
					style={{
						left: "50%",
						maxWidth: 452,
						opacity: 0.92,
						pointerEvents: "none",
						position: "absolute",
						top: "50%",
						transform: "translate(-50%, -5%)",
						width: "40vw",
					}}
				/>
			</Box>
		</Box>
	);
}

function ContentFilledPage({
	activeTab,
	onAddContent,
	onAddContentFromModel,
	onAddArticle,
	onOpenSuggested,
	onSelectTaskAsset,
	selectedTaskAssetId,
	suggestedOpen = false,
	taskAssets,
	taskArticles,
	selectedArticleId,
	onSelectArticle,
	contentInstances,
	setContentInstances,
	selectedContentInstanceId,
	onSelectContentInstance,
	onTabChange,
	selectedPageId,
	pages,
	onSelectPage,
	setPages,
	onAddToApplication,
	previewOutlines,
	previewCurrentEle,
	previewHoverEle,
	setPreviewCurrentEle,
	setPreviewHoverEle,
	setPreviewOutlines,
	applications,
}: {
	activeTab: TaskTab;
	onAddContent: () => void;
	onAddContentFromModel: (model: ContentType) => void;
	onAddArticle: () => void;
	onOpenSuggested: () => void;
	onSelectTaskAsset: (assetId: string | null) => void;
	selectedTaskAssetId: string | null;
	suggestedOpen?: boolean;
	taskAssets: AssetItem[];
	taskArticles: Array<{ id: string; title: string }>;
	selectedArticleId: string | null;
	onSelectArticle: (id: string | null) => void;
	contentInstances: ContentInstance[];
	setContentInstances: (instances: ContentInstance[]) => void;
	selectedContentInstanceId: string | null;
	onSelectContentInstance: (id: string | null) => void;
	onTabChange: (tab: string) => void;
	selectedPageId: string | null;
	pages: Page[];
	onSelectPage: (id: string | null) => void;
	setPages: (pages: Page[] | ((prev: Page[]) => Page[])) => void;
	onAddToApplication: (instance: ContentInstance) => void;
	previewOutlines: Outline[];
	previewCurrentEle: string;
	previewHoverEle: string;
	setPreviewCurrentEle: (value: React.SetStateAction<string>) => void;
	setPreviewHoverEle: (value: React.SetStateAction<string>) => void;
	setPreviewOutlines: React.Dispatch<React.SetStateAction<Outline[]>>;
	applications: Application[];
}) {
	const [contentTypes] = usePersistentState("contentTypes", initialContentTypes) as [
		ContentType[],
		(value: ContentType[]) => void,
	];
	const [isEditingContentInstance, setIsEditingContentInstance] = useState(false);
	const router = useRouter();

	// Filter pages that belong to this task
	const CURRENT_TASK_ID = "1";
	const taskPages = useMemo(() => {
		return pages.filter(page => page.cmpTaskMetadata?.taskId === CURRENT_TASK_ID);
	}, [pages]);

	// Component mount/unmount logging
	useEffect(() => {
		console.log('[ContentFilledPage] MOUNTED');
		return () => {
			console.log('[ContentFilledPage] UNMOUNTED');
		};
	}, []);

	// Render logging
	console.log('[ContentFilledPage] RENDER:', {
		selectedContentInstanceId,
		selectedTaskAssetId,
		suggestedOpen,
	});

	// Use CMP content models directly, converted to ContentType format
	const cmpContentModels = useMemo(
		() => initialCmpContentModels.map(convertCmpModelToContentType),
		[]
	);

	const selectedTaskAsset =
		taskAssets.find((asset) => asset.id === selectedTaskAssetId) ?? null;
	const selectedContentInstance =
		contentInstances.find((instance) => instance.id === selectedContentInstanceId) ?? null;
	const selectedArticle =
		taskArticles.find((article) => article.id === selectedArticleId) ?? null;
	const selectedPage =
		pages.find((page) => page.id === selectedPageId) ?? null;

	// Debug: Log what we found
	console.log('[ContentFilledPage] Selected items:', {
		selectedContentInstanceId,
		foundInstance: selectedContentInstance ? { id: selectedContentInstance.id, name: selectedContentInstance.modelDisplayName } : null,
		selectedArticleId,
		foundArticle: selectedArticle,
		selectedTaskAssetId,
		foundAsset: selectedTaskAsset,
	});

	// Reset edit mode when switching content instances
	useEffect(() => {
		setIsEditingContentInstance(false);
	}, [selectedContentInstanceId]);

	// Debug logging for content instances and assets
	useEffect(() => {
		console.log('[ContentTab] Content instances updated:', {
			count: contentInstances.length,
			instances: contentInstances.map(ci => ({ id: ci.id, modelDisplayName: ci.modelDisplayName })),
		});
	}, [contentInstances]);

	useEffect(() => {
		console.log('[ContentTab] Task assets updated:', {
			count: taskAssets.length,
			assets: taskAssets.map(a => ({ id: a.id, title: a.title })),
		});
	}, [taskAssets]);

	// Debug logging for selection state
	useEffect(() => {
		console.log('[ContentTab] Selection state:', {
			selectedContentInstanceId,
			selectedTaskAssetId,
			suggestedOpen,
			contentInstancesCount: contentInstances.length,
			taskAssetsCount: taskAssets.length,
		});
	}, [selectedContentInstanceId, selectedTaskAssetId, suggestedOpen, contentInstances.length, taskAssets.length]);

	return (
		<Box pb="32" style={{ position: "relative" }}>
			<PageHeader activeTab={activeTab} onTabChange={onTabChange} />
			<Box display="flex" flexDirection="column" style={{ gap: 18, maxWidth: 812, padding: "20px 32px 0" }}>
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Menu
						options={[
							{
								label: "Asset",
								addon: <IconPhoto size={20} />,
								description: "Add assets from recommendations",
								execute: () => onAddContent(),
							},
							{
								label: "Article",
								addon: <IconFileText size={20} />,
								description: "Add a hardcoded article example",
								execute: () => onAddArticle(),
							},
							{
								label: "From CMS",
								addon: <IconBroadcast size={20} />,
								description: "Add content from CMS",
								execute: () => { /* TODO: Implement CMS content selection */ },
							},
							{
								label: "Component",
								addon: <IconPuzzle size={20} />,
								description: "Add a reusable component",
								execute: () => { /* TODO: Implement component selection */ },
							},
							{
								label: "Content Type",
								addon: <IconFileText size={20} />,
								description: "Add content from a content model",
								subOptions: cmpContentModels
									.filter((model) => model.isActive !== false)
									.map((model) => ({
										label: model.displayName || model.name,
										description: model.description || `Create a new ${(model.displayName || model.name).toLowerCase()}`,
										execute: () => onAddContentFromModel(model),
									})),
							},
						]}
					>
						<MenuTrigger asChild>
							<Button
								appearance="primary"
								size="sm"
								style={{
									background: "#0037FF",
									borderRadius: 6,
									height: 40,
									padding: "0 12px",
								}}
							>
								<Box alignItems="center" display="flex" gap="4">
									<IconPlus size={16} />
									<span>Add Content</span>
									<IconChevronDown size={16} />
								</Box>
							</Button>
						</MenuTrigger>
						<MenuContent />
					</Menu>
					<Box alignItems="center" display="flex" style={{ gap: 12 }}>
						<Box alignItems="center" display="flex" justifyContent="center" rounded="md" style={{ flexShrink: 0, height: 32, width: 32 }}>
							<IconCopy size={16} color="var(--ax-colors-fg-secondary)" />
						</Box>
						<Text color="fg.secondary" style={{ fontSize: 14, lineHeight: "20px", maxWidth: "none" }}>8</Text>
						<Box alignItems="center" bg="bg.tertiary" display="flex" justifyContent="center" rounded="md" style={{ flexShrink: 0, height: 32, width: 32 }}>
							<Box style={{ border: "1.6px solid var(--ax-colors-fg-accent)", borderRadius: 2, height: 16, width: 16 }} />
						</Box>
						<Box alignItems="center" display="flex" justifyContent="center" rounded="md" style={{ flexShrink: 0, height: 32, width: 32 }}>
							<Grid2Icon aria-hidden="true" style={{ color: "var(--ax-colors-fg-tertiary)", display: "block", height: 16, width: 16 }} />
						</Box>
						<Box alignItems="center" display="flex" justifyContent="center" rounded="md" style={{ flexShrink: 0, height: 32, width: 32 }}>
							<Box display="flex" flexDirection="column" style={{ gap: 2, width: 14 }}>
								<Box bg="bg.tertiary" rounded="full" style={{ height: 2, width: "100%" }} />
								<Box bg="bg.tertiary" rounded="full" style={{ height: 2, width: "100%" }} />
								<Box bg="bg.tertiary" rounded="full" style={{ height: 2, width: "100%" }} />
							</Box>
						</Box>
					</Box>
				</Box>

				<Box alignItems="center" display="flex" gap="8">
					{(() => {
						const buttonList = [null, ...contentInstances, ...taskPages, ...taskArticles, ...taskAssets];
						console.log('[ContentTab] Rendering button list:', {
							totalButtons: buttonList.length,
							items: buttonList.map((item, i) => ({
								index: i,
								type: i === 0 ? 'suggested' :
									item && 'modelId' in item ? 'content-instance' :
									item && 'contentTypeId' in item && !('modelId' in item) ? 'page' :
									item && 'title' in item && !('src' in item) ? 'article' :
									'asset',
								id: item?.id,
								key: i === 0 ? 'suggested' : item?.id ?? i,
							})),
						});
						return buttonList;
					})().map((item, index) => {
						// Determine button type
						const isSuggestedTrigger = index === 0;
						const isContentInstance = item && 'modelId' in item;
						const isPage = item && 'contentTypeId' in item && !('modelId' in item);
						const isArticle = item && 'title' in item && !('src' in item) && !('modelId' in item) && !('contentTypeId' in item);
						const isAsset = item && !isContentInstance && !isPage && !isArticle;

						// Determine if this button is selected
						const isSelected = isSuggestedTrigger
							? false // Sparkles button is never "selected", it just toggles the panel
							: (
								(isContentInstance && item.id === selectedContentInstanceId) ||
								(isPage && item.id === selectedPageId) ||
								(isArticle && item.id === selectedArticleId) ||
								(isAsset && item.id === selectedTaskAssetId)
							);

						// Handle click events
						const handleClick = () => {
							console.log('[ContentTab] Button clicked:', {
								index,
								isSuggestedTrigger,
								isContentInstance,
								isPage,
								isArticle,
								isAsset,
								itemId: item?.id,
								itemType: isContentInstance ? 'content-instance' : isPage ? 'page' : isArticle ? 'article' : isAsset ? 'asset' : 'suggested',
							});

							if (isSuggestedTrigger) {
								console.log('[ContentTab] Opening suggested assets');
								onOpenSuggested();
								return;
							}

							if (isContentInstance) {
								// Select this content instance, deselect others
								console.log('[ContentTab] Selecting content instance:', item.id);
								onSelectContentInstance(item.id);
								onSelectPage(null);
								onSelectArticle(null);
								onSelectTaskAsset(null);
								return;
							}

							if (isPage && item) {
								// Select this page, deselect others
								console.log('[ContentTab] Selecting page:', item.id);
								onSelectPage(item.id);
								onSelectContentInstance(null);
								onSelectArticle(null);
								onSelectTaskAsset(null);
								return;
							}

							if (isArticle && item) {
								// Select this article, deselect others
								console.log('[ContentTab] Selecting article:', item.id);
								onSelectArticle(item.id);
								onSelectPage(null);
								onSelectContentInstance(null);
								onSelectTaskAsset(null);
								return;
							}

							if (isAsset && item) {
								// Select this asset, deselect others
								console.log('[ContentTab] Selecting task asset:', item.id);
								onSelectTaskAsset(item.id);
								onSelectPage(null);
								onSelectContentInstance(null);
								onSelectArticle(null);
								return;
							}

							console.warn('[ContentTab] Click handler did not match any condition');
						};

						return (
							<Box
								key={isSuggestedTrigger ? 'suggested' : item?.id ?? index}
								alignItems="center"
								bg={isSelected ? "bg.default" : "bg.secondary"}
								border="1"
								borderColor={isSelected ? "border.accent" : "border.tertiary"}
								display="flex"
								justifyContent="center"
								rounded="md"
								style={{
									background: "#FFF",
									boxShadow: isSelected
										? "0 0 0 1px #FFF, 0 0 0 3px #2E66F7"
										: "none",
									flexShrink: 0,
									height: 32,
									minHeight: 32,
									minWidth: 32,
									overflow: "hidden",
									width: 32,
								}}
							>
								<button
									aria-label={
										isSuggestedTrigger ? "Open suggested assets" :
										isContentInstance ? `View ${item.modelDisplayName}` :
										isPage ? `View ${(item as Page).name}` :
										isArticle ? `View ${(item as { title: string }).title}` :
										isAsset && item && 'title' in item ? `View ${(item as { title: string }).title}` :
										"View task item"
									}
									onClick={handleClick}
									style={{
										alignItems: "center",
										background: "transparent",
										border: "none",
										cursor: "pointer",
										display: "flex",
										flexShrink: 0,
										height: 32,
										justifyContent: "center",
										padding: 0,
										width: 32,
									}}
									type="button"
								>
									{isSuggestedTrigger ? (
										<SparklesIcon height={14} style={{ color: "var(--ax-colors-fg-secondary)" }} width={14} />
									) : isContentInstance ? (
										<IconFileText size={16} color="var(--ax-colors-fg-secondary)" />
									) : isPage ? (
										<iframe
											src={`/cms/edit/${(item as Page).id}?preview=true`}
											style={{
												border: "none",
												display: "block",
												height: 32,
												objectFit: "cover",
												pointerEvents: "none",
												transform: "scale(0.15)",
												transformOrigin: "top left",
												width: 213,
											}}
											title={`Preview of ${(item as Page).name}`}
										/>
									) : isArticle ? (
										<IconFileText size={16} color="var(--ax-colors-fg-secondary)" />
									) : isAsset && item && 'src' in item ? (
										<img
											alt=""
											src={('thumbnailSrc' in item ? item.thumbnailSrc : item.src) as string}
											style={{
												display: "block",
												flexShrink: 0,
												height: 32,
												objectFit: "cover",
												width: 32,
											}}
										/>
									) : (
										<Text fontSize="lg">{
											isPage
												? ((item as Page)?.name?.charAt(0) ?? "?")
												: ('title' in (item ?? {}) ? (item as { title: string }).title.charAt(0) : "?")
										}</Text>
									)}
								</button>
							</Box>
						);
					})}
				</Box>

				<Box
					bg="bg.default"
					border="1"
					borderColor="border.tertiary"
					rounded="lg"
					style={{ overflow: "hidden" }}
				>
					<Box alignItems="center" display="flex" justifyContent="space-between" style={{ padding: "18px 18px 14px" }}>
						<Text color="fg.default" style={{ fontSize: 20, fontWeight: 500, lineHeight: "28px", maxWidth: "none" }}>
							{selectedContentInstance
								? selectedContentInstance.modelDisplayName
								: selectedPage
								? selectedPage.name
								: selectedArticle
								? selectedArticle.title
								: selectedTaskAsset?.title
								?? `Couldn't load content with id: ${selectedContentInstanceId ?? selectedPageId ?? selectedArticleId ?? selectedTaskAssetId ?? 'unknown'}`}
						</Text>
						<Box alignItems="center" display="flex" style={{ gap: 12 }}>
							<IconTag size={16} color="var(--ax-colors-fg-secondary)" />
							<button
								aria-label="Open suggested assets"
								onClick={onOpenSuggested}
								style={{
									alignItems: "center",
									background: "transparent",
									border: "none",
									cursor: "pointer",
									display: "flex",
									justifyContent: "center",
									padding: 0,
								}}
								type="button"
							>
								<SparklesIcon height={16} style={{ color: "var(--ax-colors-fg-secondary)" }} width={16} />
							</button>
							<IconLink size={16} color="var(--ax-colors-fg-secondary)" />
							{selectedContentInstance && (
								<IconPencil
									size={16}
									color={isEditingContentInstance ? "var(--ax-colors-fg-accent)" : "var(--ax-colors-fg-secondary)"}
									style={{ cursor: "pointer" }}
									onClick={() => setIsEditingContentInstance(!isEditingContentInstance)}
								/>
							)}
							<Menu
								options={
									selectedPage
										? [
												// Menu options for CMS pages
												{
													label: "Edit in CMS",
													addon: <IconPencil size={16} />,
													description: "Open page in Visual Builder",
													execute: () => {
														router.push(`/cms/edit/${selectedPage.id}`);
													},
												},
												{
													label: "Review",
													addon: <IconEye size={16} />,
													description: "View page on website",
													execute: () => {
														// TODO: Build page slug and open in new tab
														const slug = selectedPage.slug || selectedPage.name.toLowerCase().replace(/\s+/g, '-');
														window.open(`/site/${slug}`, '_blank');
													},
												},
												{
													label: "Remove",
													addon: <IconTrash size={16} />,
													description: "Remove page from task",
													execute: () => {
														// Clear cmpTaskMetadata from page
														setPages((prev: Page[]) =>
															prev.map(p =>
																p.id === selectedPage.id
																	? { ...p, cmpTaskMetadata: undefined }
																	: p
															)
														);
														toaster.create(
															"Page removed from task",
															{ intent: "success" },
														);
														onSelectPage(null);
													},
												},
											]
										: selectedContentInstance
										? [
												// Menu options for CMP content instances
												applications.length === 1
													? {
															label: "Add to CMS",
															addon: <IconPlus size={16} />,
															description: "Create CMS page from this content",
															execute: () => onAddToApplication(selectedContentInstance),
													  }
													: {
															label: "Add to CMS",
															addon: <IconPlus size={16} />,
															description: "Create CMS page from this content",
															subOptions: applications.map((app: Application) => ({
																label: app.name,
																description: `Add to ${app.name}`,
																execute: () => onAddToApplication(selectedContentInstance),
															})),
													  },
												{
													label: "Remove from task",
													addon: <IconTrash size={16} />,
													description: "Remove this item from the task",
													execute: () => {
														const updatedInstances = contentInstances.filter(inst => inst.id !== selectedContentInstance.id);
														setContentInstances(updatedInstances);

														// Check if any items remain (content instances, pages, articles, or assets)
														const hasRemainingItems = updatedInstances.length > 0 || taskPages.length > 0 || taskArticles.length > 0 || taskAssets.length > 0;

														if (hasRemainingItems) {
															// Select first remaining item
															if (updatedInstances.length > 0) {
																onSelectContentInstance(updatedInstances[0].id);
															} else if (taskPages.length > 0) {
																onSelectPage(taskPages[0].id);
															} else if (taskArticles.length > 0) {
																onSelectArticle(taskArticles[0].id);
															} else if (taskAssets.length > 0) {
																onSelectTaskAsset(taskAssets[0].id);
															}
														} else {
															// No items left - navigate to empty state
															onSelectContentInstance(null);
															onTabChange('content'); // Trigger re-evaluation of hasTaskContent
														}
													},
												},
											]
										: selectedArticle || selectedTaskAsset
										? [
												{
													label: "Remove from task",
													addon: <IconTrash size={16} />,
													description: "Remove this item from the task",
													execute: () => {
														if (selectedArticle) {
															const updatedArticles = taskArticles.filter(article => article.id !== selectedArticle.id);
															// TODO: Need setTaskArticles setter to properly update
															console.log('Remove article:', selectedArticle.id);
														} else if (selectedTaskAsset) {
															// TODO: Need setTaskAssets setter to properly update
															console.log('Remove asset:', selectedTaskAsset.id);
														}
													},
												},
											]
										: []
								}
							>
								<MenuTrigger asChild>
									<button
										aria-label="More options"
										style={{
											alignItems: "center",
											background: "transparent",
											border: "none",
											cursor: "pointer",
											display: "flex",
											padding: 0,
										}}
										type="button"
									>
										<IconDots size={16} color="var(--ax-colors-fg-secondary)" />
									</button>
								</MenuTrigger>
								<MenuContent />
							</Menu>
						</Box>
					</Box>

					{selectedContentInstance ? (
						<Box display="flex" flexDirection="column" style={{ gap: 16, padding: "18px" }}>
							<Text color="fg.secondary" fontSize="sm">
								Content instance created on {new Date(selectedContentInstance.createdAt).toLocaleDateString()}
							</Text>
							{(() => {
								// Find the content model for this instance
								const contentModel = cmpContentModels.find(model => model.id === selectedContentInstance.modelId);
								if (!contentModel) {
									return (
										<Text color="fg.tertiary" fontSize="sm">
											Content model not found
										</Text>
									);
								}

								// Render each property using PropertyRenderer
								return contentModel.properties?.map((cmpProperty) => {
									const fieldValue = selectedContentInstance.fields[cmpProperty.name];
									// Convert CMP property to CMS Property format
									const cmsProperty = convertCmpPropertyToCms(cmpProperty);

									const handleChange = (newValue: any) => {
										// Update the content instance in localStorage
										const updatedInstance = {
											...selectedContentInstance,
											fields: {
												...selectedContentInstance.fields,
												[cmpProperty.name]: newValue
											}
										};

										// Update the instances array
										const updatedInstances = contentInstances.map(inst =>
											inst.id === selectedContentInstance.id ? updatedInstance : inst
										);
										setContentInstances(updatedInstances);
									};

									return (
										<PropertyRenderer
											key={cmpProperty.id}
											property={cmsProperty}
											value={fieldValue}
											onChange={handleChange}
											enableAI={isEditingContentInstance}
											context={{ runtimeContentTypes: contentTypes }}
											mode={isEditingContentInstance ? "edit" : "readonly"}
										/>
									);
								});
							})()}
						</Box>
					) : selectedPage ? (
						previewOutlines.length > 0 ? (
							<Box display="flex" flexDirection="column" style={{ height: "100%", overflow: "hidden" }}>
								<PreviewCanvas
									outlines={previewOutlines}
									theEles={{}}
									currentEle={previewCurrentEle}
									currentHoverEle={previewHoverEle}
									setCurrentEle={setPreviewCurrentEle}
									setCurrentHoverEle={setPreviewHoverEle}
									setOutlines={setPreviewOutlines}
									preview={{ mode: "responsive", width: 1440, maxWidth: 1440 }}
								/>
							</Box>
						) : (
							<Box display="flex" flexDirection="column" style={{ height: "100%", overflow: "auto" }}>
								<PropertyBasedPageRenderer
									contentTypeId={selectedPage.contentTypeId}
									properties={selectedPage.data || {}}
									pageId={selectedPage.id}
								/>
							</Box>
						)
					) : selectedArticle ? (
						<>
							<img
								alt="Runner sponsorship package"
								src={figmaAssets.contentHero}
								style={{ display: "block", height: 272, objectFit: "cover", width: "100%" }}
							/>

							<Box display="flex" flexDirection="column" style={{ gap: 14, padding: "12px 18px 0" }}>
								<Box asChild>
									<div style={{
										color: "var(--ax-colors-fg-default)",
										fontFamily: "Inter, sans-serif",
										fontSize: 14,
										fontStyle: "normal" as const,
										fontWeight: 400,
										letterSpacing: "-0.1px",
										lineHeight: "20px",
									}}>
										<>
											<p style={{ margin: 0 }}>
												When the whole world is gearing up for the Ironman Miami 2026 triathlon, here's a sneak peek at the Runner Sponsorship Package:
											</p>
											<div style={{ marginTop: 10 }}>
												<p style={{ fontWeight: 600, margin: 0 }}>Title Sponsor: The 'Victory Lap' Package ($5M)</p>
												<ul style={{ margin: "0 0 10px 18px", padding: 0 }}>
													<li>Headline billing on all event promotions.</li>
													<li>Logo placement on runner jerseys.</li>
													<li>Exclusive naming rights for the finish line.</li>
													<li>VIP access for 50 guests.</li>
													<li>Full-page ad in the event program.</li>
												</ul>
												<p style={{ fontWeight: 600, margin: 0 }}>Platinum Tier: The 'Sprint' Package ($3M)</p>
												<ul style={{ margin: "0 0 10px 18px", padding: 0 }}>
													<li>Prominent logo placement on event banners.</li>
													<li>Opportunity to set up an interactive booth at the event.</li>
													<li>VIP access for 30 guests.</li>
													<li>Half-page ad in the event program.</li>
												</ul>
												<p style={{ fontWeight: 600, margin: 0 }}>Gold Tier: The 'Marathon' Package ($1.5M)</p>
												<ul style={{ margin: "0 0 0 18px", padding: 0 }}>
													<li>Logo placement on event signage.</li>
													<li>Opportunity to distribute promotional materials.</li>
												</ul>
											</div>
										</>
									</div>
								</Box>
							</Box>

							<Box display="flex" flexDirection="column" gap="10" style={{ borderTop: "1px solid var(--ax-colors-border-tertiary)", marginTop: 12, padding: "12px 18px 18px" }}>
								<Box alignItems="center" display="flex" gap="6">
									<Box alignItems="center" bg="bg.secondary" display="flex" justifyContent="center" rounded="full" style={{ height: 20, padding: "0 8px" }}>
										<Text color="fg.secondary" style={{ fontSize: 11, fontWeight: 500, lineHeight: "16px", maxWidth: "none" }}>Image</Text>
									</Box>
									<Box alignItems="center" bg="bg.secondary" display="flex" justifyContent="center" rounded="full" style={{ height: 20, padding: "0 8px" }}>
										<Text color="fg.secondary" style={{ fontSize: 11, fontWeight: 500, lineHeight: "16px", maxWidth: "none" }}>Marathoner</Text>
									</Box>
									<Box alignItems="center" bg="bg.secondary" display="flex" justifyContent="center" rounded="full" style={{ height: 20, padding: "0 8px" }}>
										<Text color="fg.secondary" style={{ fontSize: 11, fontWeight: 500, lineHeight: "16px", maxWidth: "none" }}>Millenials</Text>
									</Box>
									<Text color="fg.accent" style={{ fontSize: 12, fontWeight: 500, lineHeight: "16px", maxWidth: "none" }}>+ 6</Text>
								</Box>
							</Box>
						</>
					) : selectedTaskAsset ? (
						<Box display="flex" flexDirection="column" style={{ gap: 16, padding: "18px" }}>
							<Text color="fg.secondary" fontSize="sm">
								Task asset selected
							</Text>
							<Text color="fg.tertiary" fontSize="sm">
								Task asset rendering not yet implemented
							</Text>
						</Box>
					) : (
						<Box display="flex" flexDirection="column" style={{ gap: 16, padding: "18px" }}>
							<Text color="fg.error" fontSize="sm">
								No content selected
							</Text>
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	);
}

function AssetBadge({ kind, label }: { kind: AssetType; label: string }) {
	const intent = kind === "MP4" ? "information" : kind === "PDF" ? "warning" : "success";

	return <Badge intent={intent}>{label}</Badge>;
}

function ScoreBadge({ score }: { score: number }) {
	return (
		<Box
			alignItems="center"
			display="flex"
			justifyContent="center"
			rounded="full"
			style={{
				background: "var(--ax-colors-fg-white)",
				borderRadius: 12,
				padding: "2px 8px",
			}}
		>
			<Text
				style={{
					color: "#6F33D1",
					fontFamily: "Inter, sans-serif",
					fontSize: 12,
					fontWeight: 500,
					letterSpacing: "0.01px",
					lineHeight: "16px",
					maxWidth: "none",
				}}
			>
				{score}%
			</Text>
		</Box>
	);
}

function GridIconAsset({
	active = false,
	Icon,
}: {
	active?: boolean;
	Icon: ComponentType<SVGProps<SVGSVGElement>>;
}) {
	return (
		<Icon
			aria-hidden="true"
			style={{
				color: active ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)",
				display: "block",
				height: 14,
				opacity: active ? 1 : 0.5,
				flexShrink: 0,
				width: 18,
			}}
		/>
	);
}

function FooterViewButton({
	active = false,
	disabled = false,
	icon,
	onClick,
}: {
	active?: boolean;
	disabled?: boolean;
	icon: ReactNode;
	onClick?: () => void;
}) {
	return (
		<Box
			alignItems="center"
			bg={active ? "bg.secondary" : undefined}
			display="flex"
			justifyContent="center"
			onClick={disabled ? undefined : onClick}
			rounded="md"
			style={{
				color: active ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)",
				cursor: disabled ? "default" : onClick ? "pointer" : "default",
				height: 32,
				opacity: disabled ? 0.28 : active ? 1 : 0.55,
				padding: 0,
				width: 32,
			}}
		>
			{icon}
		</Box>
	);
}
