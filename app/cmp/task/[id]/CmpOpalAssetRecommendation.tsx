"use client";

import { type ComponentType, type ReactNode, type SVGProps, useDeferredValue, useMemo, useState } from "react";
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
	Tabs,
	TabsList,
	TabsTrigger,
	Textarea,
} from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { Text } from "@/app/components/Text";
import Grid2Icon from "@/app/cmp/assets/grid2.svg";
import Grid3Icon from "@/app/cmp/assets/grid3.svg";
import Grid4Icon from "@/app/cmp/assets/grid4.svg";
import {
	IconCalendar,
	IconCheck,
	IconChevronDown,
	IconChevronLeft,
	IconChevronRight,
	IconCopy,
	IconDots,
	IconEye,
	IconLink,
	IconMaximize,
	IconMinus,
	IconPlus,
	IconSearch,
	IconSparkles,
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

type AssetType = "JPG" | "MP4" | "PDF";

type AssetItem = {
	id: string;
	label: AssetType;
	match: number;
	src: string;
	title: string;
	selected?: boolean;
	tooltip?: string;
	preview: "image" | "pdf";
	previewSrc?: string;
};

type SearchAssetItem = AssetItem & {
	height: number;
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

type BriefBlock =
	| { type: "heading"; text: string }
	| { type: "paragraph"; text: string }
	| { type: "list"; items: string[] };

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

function parseBriefContent(content: string): BriefBlock[] {
	const lines = content
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);

	const blocks: BriefBlock[] = [];
	let pendingList: string[] = [];

	const flushList = () => {
		if (pendingList.length > 0) {
			blocks.push({ items: pendingList, type: "list" });
			pendingList = [];
		}
	};

	for (const line of lines) {
		if (line.startsWith("•")) {
			pendingList.push(line.replace(/^•\s*/, ""));
			continue;
		}

		flushList();

		if (line.endsWith(":")) {
			blocks.push({ text: line, type: "heading" });
			continue;
		}

		blocks.push({ text: line, type: "paragraph" });
	}

	flushList();

	return blocks;
}

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
	{ id: "a1", label: "JPG", match: 97, src: figmaAssets.card1, title: "Open water runners", preview: "image", selected: true },
	{ id: "a2", label: "JPG", match: 97, src: figmaAssets.card2, title: "Swimmer in surf", preview: "image" },
	{ id: "a3", label: "JPG", match: 97, src: figmaAssets.card5, title: "Cyclist in desert", preview: "image" },
	{ id: "a4", label: "JPG", match: 97, src: figmaAssets.card3, title: "Swimming pack", preview: "image" },
	{ id: "a5", label: "JPG", match: 97, src: figmaAssets.card8, title: "Sports cover art", preview: "image", tooltip: "highly relevant to fitness, cycling and health in general" },
	{ id: "a6", label: "JPG", match: 97, src: figmaAssets.card6, title: "Cyclists on road", preview: "image", selected: true },
	{ id: "a7", label: "PDF", match: 94, src: figmaAssets.vespaThumb, title: "Vespa brochure", preview: "pdf", previewSrc: figmaAssets.vespaPreview },
	{ id: "a8", label: "MP4", match: 97, src: figmaAssets.card9, title: "Time trial cyclist", preview: "image" },
	{ id: "a9", label: "MP4", match: 97, src: figmaAssets.card10, title: "Runner in red", preview: "image" },
	{ id: "a10", label: "MP4", match: 97, src: figmaAssets.card11, title: "Runner on course", preview: "image" },
	{ id: "a11", label: "MP4", match: 97, src: figmaAssets.card12, title: "Triathlon finish", preview: "image", selected: true },
	{ id: "a12", label: "MP4", match: 97, src: figmaAssets.card18, title: "Cyclist in tunnel", preview: "image" },
];

const panelAssets: AssetItem[] = [
	{ id: "p1", label: "JPG", match: 97, src: figmaAssets.panel1, title: "Open-water athlete", preview: "image" },
	{ id: "p2", label: "JPG", match: 97, src: figmaAssets.panel2, title: "Swimmer overhead", preview: "image" },
	{ id: "p3", label: "JPG", match: 97, src: figmaAssets.panel3, title: "Cyclists pack", preview: "image" },
	{ id: "p4", label: "JPG", match: 97, src: figmaAssets.panel4, title: "Open-water group", preview: "image", tooltip: "highly relevant to fitness, cycling and health in general" },
	{ id: "p5", label: "JPG", match: 97, src: figmaAssets.panel5, title: "Crowd cheering", preview: "image" },
	{ id: "p6", label: "JPG", match: 97, src: figmaAssets.panel6, title: "Race runners", preview: "image" },
	{ id: "p7", label: "JPG", match: 97, src: figmaAssets.panel7, title: "Beach runners", preview: "image" },
	{ id: "p8", label: "JPG", match: 97, src: figmaAssets.panel8, title: "Cyclist in desert", preview: "image" },
];

const searchAssets: SearchAssetItem[] = [
	{ id: "s1", label: "JPG", match: 97, src: figmaAssets.searchFortniteWide, title: "Fortnite screen", preview: "image", selected: true, height: 180 },
	{ id: "s2", label: "JPG", match: 97, src: figmaAssets.searchSwimPack, title: "Swim pack", preview: "image", selected: true, height: 180 },
	{ id: "s3", label: "PDF", match: 94, src: figmaAssets.searchFortnitePdf, title: "Fortnite brochure", preview: "pdf", height: 256 },
	{ id: "s4", label: "MP4", match: 97, src: figmaAssets.searchBook, title: "Magazine spread", preview: "image", height: 170 },
	{ id: "s5", label: "MP4", match: 97, src: figmaAssets.searchRedCyclist, title: "Red cyclist", preview: "image", height: 144 },
	{ id: "s6", label: "JPG", match: 97, src: figmaAssets.searchOpenWaterWide, title: "Open-water runners", preview: "image", height: 180 },
	{ id: "s7", label: "JPG", match: 97, src: figmaAssets.panel1, title: "Swimmer sprint", preview: "image", height: 180 },
	{ id: "s8", label: "MP4", match: 97, src: figmaAssets.searchRoadCyclists, title: "Road cyclists", preview: "image", height: 256 },
	{ id: "s9", label: "MP4", match: 97, src: figmaAssets.searchStockChart, title: "Stock chart", preview: "image", height: 180 },
	{ id: "s10", label: "MP4", match: 97, src: figmaAssets.searchDarkCyclist, title: "Night cyclist", preview: "image", height: 144 },
	{ id: "s11", label: "JPG", match: 97, src: figmaAssets.searchCyclistDesert, title: "Cyclist in desert", preview: "image", height: 180 },
	{ id: "s12", label: "JPG", match: 97, src: figmaAssets.card3, title: "Open-water group", preview: "image", height: 180 },
	{ id: "s13", label: "MP4", match: 97, src: figmaAssets.searchTimeTrial, title: "Time trial cyclist", preview: "image", height: 180 },
	{ id: "s14", label: "MP4", match: 97, src: figmaAssets.searchTriathlonFinish, title: "Triathlon finish", preview: "image", selected: true, height: 144 },
	{ id: "s15", label: "MP4", match: 97, src: figmaAssets.searchOrangeCyclist, title: "Orange cyclist", preview: "image", height: 144, tooltip: "highly relevant to fitness, cycling and health in general" },
];

const searchMasonryColumns = [
	["s1", "s2", "s3", "s4", "s5"],
	["s6", "s8", "s9", "s10"],
	["s11", "s12", "s13", "s14", "s15"],
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
	const [scene, setScene] = useState<Scene>("brief");
	const [hasTaskContent, setHasTaskContent] = useState(false);
	const [selectedAsset, setSelectedAsset] = useState<AssetItem>(suggestedAssets[6]);
	const [perspectives, setPerspectives] = useState(perspectiveSeeds);
	const [exclude, setExclude] = useState("bicycles, skateboards, longboards");
	const [briefContent, setBriefContent] = useState(initialBriefContent);
	const [draftBriefContent, setDraftBriefContent] = useState(initialBriefContent);
	const [searchReturnScene, setSearchReturnScene] = useState<Scene>("brief-edit");
	const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
	const [workflowMenuOpen, setWorkflowMenuOpen] = useState(false);
	const [workflowSearch, setWorkflowSearch] = useState("");
	const [pendingWorkflowId, setPendingWorkflowId] = useState<string | null>(null);
	const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);

	const activeTab: TaskTab = scene === "brief" || scene === "brief-edit" ? "brief" : "content";
	const deferredWorkflowSearch = useDeferredValue(workflowSearch);
	const activeWorkflowId = selectedWorkflowId ?? (scene === "content-empty" ? "starter" : "newsletter");
	const activeWorkflow = workflowTemplates.find((template) => template.id === activeWorkflowId) ?? workflowTemplates[0];
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
		setScene(hasTaskContent ? "content" : "content-empty");
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

	const closeWorkflowDialog = () => {
		setWorkflowDialogOpen(false);
		setPendingWorkflowId(null);
	};

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
								assets={panelAssets}
								onClose={() => setScene("brief")}
								onEditSearch={() => openSearch("brief-edit")}
							/>
						}
					/>
				);
			case "search":
				return (
					<SearchPage
						assets={searchAssets}
						exclude={exclude}
						onAdd={() => {
							setHasTaskContent(true);
							setScene("content");
						}}
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
						perspectives={perspectives}
					/>
				);
			case "preview":
				return (
					<PreviewPage
						asset={selectedAsset}
						onAdd={() => {
							setHasTaskContent(true);
							setScene("content");
						}}
						onClose={() => setScene("search")}
					/>
				);
			case "content-empty":
				return (
					<TaskCanvas
						left={<ContentEmptyPage activeTab={activeTab} onAddContent={() => openSearch("content-empty")} onTabChange={handleTabChange} />}
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
				return (
					<TaskCanvas
						left={
							<ContentFilledPage
								activeTab={activeTab}
								onAddContent={() => openSearch("content")}
								onOpenSuggested={() => setScene("content-panel")}
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
			case "content-panel":
				return (
					<TaskCanvas
						left={
							<ContentFilledPage
								activeTab={activeTab}
								onAddContent={() => openSearch("content")}
								onOpenSuggested={() => setScene("content-panel")}
								onTabChange={handleTabChange}
							/>
						}
						right={
							<SuggestedAssetsPanel
								assets={panelAssets}
								onClose={() => setScene("content")}
								onEditSearch={() => openSearch("content-panel")}
							/>
						}
					/>
				);
			default:
				return null;
		}
	}, [activeTab, activeWorkflow, exclude, filteredWorkflowTemplates, hasTaskContent, perspectives, scene, searchReturnScene, selectedAsset, workflowMenuOpen, workflowSearch]);

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
				gridTemplateColumns: "minmax(0, 1fr) 444px",
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
		<Box display="flex" flexDirection="column" style={{ gap: 18, padding: "18px 28px 0" }}>
			<Box alignItems="center" display="flex" style={{ gap: 14 }}>
				<Text color="fg.tertiary" fontSize="sm">Label</Text>
				<Text color="fg.tertiary" fontSize="sm">/</Text>
				<Text color="fg.tertiary" fontSize="sm">Ca...</Text>
				<Text color="fg.tertiary" fontSize="sm">/</Text>
				<Text color="fg.tertiary" fontSize="sm">TSK...</Text>
			</Box>

			<Text color="fg.default" fontSize="4xl" fontWeight="600">
				Ironman Miami triathlon 2026 Sponsor Package
			</Text>

			<Tabs onValueChange={onTabChange} value={activeTab}>
				<TabsList>
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
	const blocks = useMemo(() => parseBriefContent(content), [content]);

	return (
		<Box display="flex" flexDirection="column" style={{ gap: 18 }}>
			{blocks.map((block, blockIndex) => {
				if (block.type === "paragraph") {
					return (
						<Text
							key={`paragraph-${blockIndex}`}
							color="fg.default"
							fontSize="lg"
							style={{ maxWidth: "none" }}
						>
							{block.text}
						</Text>
					);
				}

				if (block.type === "heading") {
					return (
						<Text
							key={`heading-${blockIndex}`}
							color="fg.default"
							fontSize="xl"
							fontWeight="600"
							style={{ maxWidth: "none" }}
						>
							{block.text}
						</Text>
					);
				}

				return (
					<Box asChild key={`list-${blockIndex}`}>
						<ul style={{ margin: "0 0 0 24px", padding: 0 }}>
							{block.items.map((item, itemIndex) => (
								<li key={`${item}-${itemIndex}`}>
									<Text color="fg.default" fontSize="lg" style={{ maxWidth: "none" }}>
										{item}
									</Text>
								</li>
							))}
						</ul>
					</Box>
				);
			})}
		</Box>
	);
}

function RichToolbar() {
	const iconButtons = [
		"↶",
		"↷",
		"P",
		"15px",
		"≡",
		"≣",
		"≢",
		"•",
		"1.",
		"⇤",
		"⇥",
		"⛶",
		"?",
	];

	return (
		<Box bg="bg.default">
			<Box alignItems="center" display="flex" gap="4" px="8" py="8" style={{ borderBottom: "1px solid var(--ax-colors-border-default)" }}>
				{iconButtons.map((item, index) => (
					<Box
						key={item + index}
						alignItems="center"
						display="flex"
						justifyContent="center"
						rounded="sm"
						style={{
							color: "var(--ax-colors-fg-secondary)",
							fontSize: index < 2 ? 18 : 14,
							height: 28,
							minWidth: item.length > 3 ? 58 : 28,
						}}
					>
						{item}
					</Box>
				))}
			</Box>
			<Box alignItems="center" display="flex" gap="4" px="8" py="8" style={{ borderBottom: "1px solid var(--ax-colors-border-default)" }}>
				{["B", "I", "U", "A", "⋯", "🖼", "🎞", "🔗", "❝", "―", "▦", "Ω", "✓", "✕", "</>", "⎘"].map((item, index) => (
					<Box
						key={item + index}
						alignItems="center"
						display="flex"
						justifyContent="center"
						rounded="sm"
						style={{
							color: "var(--ax-colors-fg-secondary)",
							fontSize: 14,
							height: 28,
							minWidth: 28,
						}}
					>
						{item}
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
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.default"
			rounded="lg"
			style={{ overflow: "hidden" }}
		>
			<RichToolbar />
			<Box p="20" style={{ lineHeight: 1.5, minHeight: 620 }}>
				<Text color="fg.tertiary" fontSize="sm">
					Last Modified by Sasha Thiel on Jan 25, 2026, 2:58 PM
				</Text>
				<Box mt="20">
					<textarea
						onChange={(event) => onChange(event.target.value)}
						spellCheck={false}
						style={{
							background: "transparent",
							border: "none",
							color: "var(--ax-colors-fg-default)",
							fontFamily: "Inter, sans-serif",
							fontSize: 18,
							lineHeight: "30px",
							minHeight: 520,
							outline: "none",
							padding: 0,
							resize: "vertical",
							width: "100%",
						}}
						value={content}
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
		<Box bg="bg.default" display="flex" flexDirection="column" style={{ padding: 16, position: "relative" }}>
			<Box display="flex" flexDirection="column" style={{ gap: 24 }}>
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Box alignItems="center" display="flex" style={{ gap: 16 }}>
						<WorkflowAvatarGroup />
						<Box alignItems="center" display="flex" gap="8">
							<IconEye size={18} color="var(--ax-colors-fg-secondary)" />
							<Text color="fg.default" style={{ fontSize: 16, fontWeight: 500, lineHeight: "24px", maxWidth: "none" }}>
								8
							</Text>
						</Box>
					</Box>
					<Box alignItems="center" display="flex" gap="8">
						<Button appearance="default" size="sm" style={{ height: 40 }}>
							Mark Complete
						</Button>
						<Button appearance="subtle" aria-label="More" icon={<IconDots size={18} />} size="sm" />
					</Box>
				</Box>

				<Box alignItems="center" display="flex" style={{ gap: 24 }}>
					<Badge intent="information">In Progress</Badge>
					<InlineDate label="Started • May 11" />
					<InlineDate label="Due • Jun 28" />
				</Box>

				<Box bg="bg.tertiary" rounded="full" style={{ height: 8, overflow: "hidden" }}>
					<Box bg="bg.accent" style={{ height: "100%", width: "70%" }} />
				</Box>
			</Box>

			<Box
				display="flex"
				flexDirection="column"
				mt="24"
				style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}
			>
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Box alignItems="center" display="flex" style={{ gap: 24 }}>
						<WorkflowTab active>Workflow</WorkflowTab>
						<WorkflowTab>Comments</WorkflowTab>
						<WorkflowTab>Attachments</WorkflowTab>
					</Box>
					<Button appearance="subtle" aria-label="Collapse" icon={<IconChevronRight size={18} />} size="sm" />
				</Box>
			</Box>

			<Box
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", padding: "24px 0" }}
			>
				<Button
					appearance="subtle"
					onClick={onToggleWorkflowMenu}
					size="sm"
					style={{
						background: workflow.id === "starter" ? "var(--ax-colors-bg-secondary)" : "transparent",
						borderRadius: 8,
						height: 48,
						justifyContent: "flex-start",
						padding: workflow.id === "starter" ? "0 16px" : 0,
					}}
				>
					<Box alignItems="center" display="flex" gap="8">
					<Text color="fg.default" style={{ fontSize: 16, lineHeight: "24px", maxWidth: "none" }}>
						{workflow.name}
					</Text>
					<IconChevronDown size={18} color="var(--ax-colors-fg-secondary)" />
					</Box>
				</Button>
				<Button appearance="subtle" aria-label="Workflow menu" icon={<IconDots size={18} />} size="sm" />
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

			<Button appearance="subtle" size="sm" style={{ justifyContent: "flex-start", marginTop: 12 }}>
				<Box alignItems="center" display="flex" gap="8">
					<IconPlus size={18} />
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
			<Avatar size="sm" src="/avatars/aamr-fakhry.png" style={{ marginLeft: 6 }} />
			<Avatar size="sm" src="/avatars/benjamin-holme.svg" style={{ marginLeft: -2 }} />
			<Avatar size="sm" src="/avatars/stefan-svebeck.svg" style={{ marginLeft: -2 }} />
			<Box
				alignItems="center"
				bg="bg.secondary"
				display="flex"
				justifyContent="center"
				rounded="full"
				style={{ height: 24, marginLeft: -2, width: 24 }}
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
				top: 244,
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
			return <IconSparkles {...common} />;
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
				paddingBottom: 12,
			}}
		>
			<Text
				color={active ? "fg.default" : "fg.tertiary"}
				style={{ fontSize: 16, fontWeight: 500, lineHeight: "24px", maxWidth: "none" }}
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
				style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", padding: "16px 0" }}
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
				<Text color="fg.default" style={{ fontSize: 16, fontWeight: 500, lineHeight: "24px", maxWidth: "none" }}>{step.title}</Text>
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
				<Avatar size="xs" src="/avatars/aamr-fakhry.png" />
				<Box
					alignItems="center"
					bg="bg.secondary"
					display="flex"
					justifyContent="center"
					rounded="full"
					style={{ height: 20, width: 20 }}
				>
					<Text fontSize="xs">WM</Text>
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
				style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)", gap: 20, padding: "16px 0" }}
			>
			<Box alignItems="center" display="flex" justifyContent="space-between">
				<Box alignItems="center" display="flex" gap="12">
					<IconChevronDown size={16} color="var(--ax-colors-fg-secondary)" />
					<DashedCircle />
					<Text color="fg.default" style={{ fontSize: 16, fontWeight: 500, lineHeight: "24px", maxWidth: "none" }}>{step.title}</Text>
				</Box>
				<Box alignItems="center" display="flex" gap="12">
					{step.showCalendarAction && <DashedCircle><IconCalendar size={12} /></DashedCircle>}
					<Avatar size="xs" src="/avatars/aamr-fakhry.png" />
					<Box
						alignItems="center"
						bg="bg.secondary"
						display="flex"
						justifyContent="center"
						rounded="full"
						style={{ height: 20, width: 20 }}
					>
						<Text fontSize="xs">WM</Text>
					</Box>
				</Box>
			</Box>

				<Box display="flex" flexDirection="column" style={{ gap: 16, paddingLeft: 80 }}>
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
				<Badge intent="neutral" style={{ width: "fit-content" }}>{step.badgeLabel ?? "Not Started"}</Badge>
				<Box alignItems="center" display="flex" gap="8" pt="4">
					<Button appearance="subtle" aria-label="Comment" icon={<IconPlus size={14} />} size="sm" />
					<Button appearance="subtle" aria-label="Delete" icon={<IconX size={14} />} size="sm" />
					<Button appearance="subtle" aria-label="More" icon={<IconDots size={14} />} size="sm" />
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
				style={{ height: 24, width: 24 }}
			>
				<IconCalendar size={12} color="var(--ax-colors-fg-secondary)" />
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

function SuggestedAssetsPanel({
	assets,
	onClose,
	onEditSearch,
}: {
	assets: AssetItem[];
	onClose: () => void;
	onEditSearch: () => void;
}) {
	const masonryRows = useMemo(() => {
		const rows: AssetItem[][] = [];

		for (let index = 0; index < assets.length; index += 2) {
			rows.push(assets.slice(index, index + 2));
		}

		return rows;
	}, [assets]);

	return (
			<Box display="flex" flexDirection="column" style={{ gap: 16, padding: 20 }}>
				<Box alignItems="start" display="flex" justifyContent="space-between">
				<Box display="flex" flexDirection="column" gap="4">
					<Text color="fg.default" fontSize="3xl" fontWeight="600">Suggested Assets</Text>
					<Text color="fg.tertiary" fontSize="md">Based on your brief</Text>
				</Box>
				<Button appearance="subtle" aria-label="Close" icon={<IconX size={18} />} onClick={onClose} size="sm" />
			</Box>

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
								span={useNarrowCard ? 4 : 6}
							/>
						);
					}),
				)}
			</Box>

			<Box alignItems="center" display="flex" justifyContent="flex-end" pt="6">
				<Button appearance="subtle" onClick={onEditSearch} size="sm">
					<Box alignItems="center" display="flex" gap="8">
						<span>Edit Search</span>
						<IconChevronRight size={14} />
					</Box>
				</Button>
			</Box>
		</Box>
	);
}

function PanelAssetCard({
	asset,
	span,
}: {
	asset: AssetItem;
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
			<Box
				rounded="lg"
				style={{
					background: `url(${asset.src}) center / cover`,
					height: 116,
					position: "relative",
				}}
			>
				<Box alignItems="center" display="flex" gap="8" style={{ left: 8, bottom: 8, position: "absolute" }}>
					<AssetBadge label={asset.label} kind={asset.label} />
					<ScoreBadge score={asset.match} />
				</Box>
				{asset.tooltip && isHovered && (
					<Box
						alignItems="start"
						bg="bg.default.inverse"
						display="flex"
						flexDirection="column"
						p="8"
						rounded="md"
						style={{
							justifyContent: "center",
							maxWidth: 272,
							position: "absolute",
							right: -24,
							top: 52,
							width: 163,
							zIndex: 2,
						}}
					>
						<Text color="fg.default.inverse" fontSize="xs">
							{asset.tooltip}
						</Text>
					</Box>
				)}
			</Box>
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
	perspectives,
}: {
	assets: SearchAssetItem[];
	exclude: string;
	onAdd: () => void;
	onAssetClick: (asset: AssetItem) => void;
	onBack: () => void;
	onExcludeChange: (value: string) => void;
	onPerspectiveChange: (index: number, value: string) => void;
	perspectives: string[];
}) {
	const [layoutMode, setLayoutMode] = useState<"masonry" | "grid">("masonry");
	const assetMap = useMemo(
		() => new Map(assets.map((asset) => [asset.id, asset])),
		[assets],
	);

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
						display="grid"
						gap="12"
						overflow="auto"
						pb="20"
						style={{
							alignContent: "start",
							gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
						}}
					>
						{searchMasonryColumns.map((column, columnIndex) => (
							<Box key={`search-column-${columnIndex}`} display="flex" flexDirection="column" gap="12">
								{column.map((assetId) => {
									const asset = assetMap.get(assetId);

									if (!asset) {
										return null;
									}

									return (
										<SearchAssetCard
											key={asset.id}
											asset={asset}
											height={asset.height}
											onClick={() => onAssetClick(asset)}
										/>
									);
								})}
							</Box>
						))}
					</Box>
				) : (
					<Box
						display="grid"
						gap="12"
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
						icon={
							<Box style={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(18, 1px)", gridTemplateRows: "repeat(14, 1px)", height: 14, width: 18 }}>
								<Box rounded="sm" style={{ backgroundColor: "currentColor", gridColumn: "1 / span 8", gridRow: "1 / span 6" }} />
								<Box rounded="sm" style={{ backgroundColor: "currentColor", gridColumn: "11 / span 8", gridRow: "1 / span 6" }} />
								<Box rounded="sm" style={{ backgroundColor: "currentColor", gridColumn: "1 / span 5", gridRow: "9 / span 6" }} />
								<Box rounded="sm" style={{ backgroundColor: "currentColor", gridColumn: "8 / span 11", gridRow: "9 / span 6" }} />
							</Box>
						}
						onClick={() => setLayoutMode("masonry")}
					/>
					<FooterViewButton
						active={layoutMode === "grid"}
						icon={<GridIconAsset active={layoutMode === "grid"} Icon={Grid2Icon} />}
						onClick={() => setLayoutMode("grid")}
					/>
					<FooterViewButton
						icon={<GridIconAsset Icon={Grid3Icon} />}
					/>
					<FooterViewButton icon={<GridIconAsset Icon={Grid4Icon} />} />
				</Box>
				<Box alignItems="center" display="flex" gap="8" justifyContent="flex-end" style={{ minWidth: 0 }}>
					<Button appearance="subtle" size="lg">Cancel</Button>
					<Button appearance="primary" onClick={onAdd} size="lg">Add to Content</Button>
				</Box>
			</Box>
		</Box>
	);
}

function SearchAssetCard({
	asset,
	height,
	onClick,
}: {
	asset: AssetItem;
	height: number;
	onClick: () => void;
}) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<Box
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={onClick}
			rounded="lg"
			style={{
				background: `url(${asset.src}) center / cover`,
				cursor: "pointer",
				height,
				position: "relative",
			}}
		>
			{asset.selected && (
				<Box
					alignItems="center"
					bg="bg.accent"
					display="flex"
					justifyContent="center"
					rounded="md"
					style={{ height: 24, position: "absolute", right: 10, top: 10, width: 24 }}
				>
					<IconCheck color="white" size={16} stroke={2.5} />
				</Box>
			)}
			<Box alignItems="center" display="flex" gap="8" style={{ bottom: 10, left: 10, position: "absolute" }}>
				<AssetBadge label={asset.label} kind={asset.label} />
				<ScoreBadge score={asset.match} />
			</Box>
			{asset.tooltip && isHovered && (
				<Box
					alignItems="start"
					bg="bg.default.inverse"
					display="flex"
					flexDirection="column"
					p="8"
					rounded="md"
					style={{
						justifyContent: "center",
						left: 62,
						maxWidth: 272,
						position: "absolute",
						top: "50%",
						transform: "translateY(-50%)",
						width: 163,
						zIndex: 2,
					}}
				>
					<Text color="fg.default.inverse" fontSize="xs">
						{asset.tooltip}
					</Text>
				</Box>
			)}
		</Box>
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
	onTabChange,
}: {
	activeTab: TaskTab;
	onAddContent: () => void;
	onTabChange: (tab: string) => void;
}) {
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
					<Button appearance="primary" onClick={onAddContent} size="sm">
						<Box alignItems="center" display="flex" gap="8">
							<IconPlus size={16} />
							<span>Add Content</span>
						</Box>
					</Button>
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
	onOpenSuggested,
	onTabChange,
}: {
	activeTab: TaskTab;
	onAddContent: () => void;
	onOpenSuggested: () => void;
	onTabChange: (tab: string) => void;
}) {
	return (
		<Box pb="40" style={{ position: "relative" }}>
			<PageHeader activeTab={activeTab} onTabChange={onTabChange} />
			<Box display="flex" flexDirection="column" style={{ gap: 20, maxWidth: 980, padding: "22px 28px 0" }}>
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Button appearance="primary" onClick={onAddContent} size="sm">
						<Box alignItems="center" display="flex" gap="8">
							<IconPlus size={16} />
							<span>Add Content</span>
						</Box>
					</Button>
					<Box alignItems="center" display="flex" style={{ gap: 14 }}>
						<IconCopy size={18} color="var(--ax-colors-fg-secondary)" />
						<Box alignItems="center" bg="bg.secondary" display="flex" gap="8" px="8" py="4" rounded="full">
							<Text fontSize="sm">8</Text>
						</Box>
						<Box alignItems="center" bg="bg.tertiary" display="flex" justifyContent="center" rounded="md" style={{ height: 40, width: 40 }}>
							<Box style={{ border: "2px solid var(--ax-colors-bg-accent)", borderRadius: 2, height: 16, width: 16 }} />
						</Box>
						<Box alignItems="center" display="flex" gap="10">
							{["▦", "≣"].map((item) => (
								<Text key={item} color="fg.tertiary" fontSize="lg">{item}</Text>
							))}
						</Box>
					</Box>
				</Box>

				<Box alignItems="center" display="flex" gap="10">
					{[
						{ label: "✦", src: undefined, selected: false },
						{ label: "", src: figmaAssets.contentThumbDoc, selected: true },
						{ label: "", src: figmaAssets.contentThumbOne, selected: false },
						{ label: "", src: figmaAssets.contentThumbTwo, selected: false },
						{ label: "", src: figmaAssets.contentThumbThree, selected: false },
						{ label: "", src: figmaAssets.vespaThumb, selected: false },
					].map((thumb, index) => (
						<Box
							key={index}
							alignItems="center"
							bg={thumb.selected ? "bg.information.subtle" : "bg.secondary"}
							border={thumb.selected ? "1" : undefined}
							borderColor={thumb.selected ? "border.accent" : undefined}
							display="flex"
							justifyContent="center"
							rounded="md"
							style={{
								height: 38,
								overflow: "hidden",
								width: 38,
							}}
						>
							{thumb.src ? (
								<img alt="" src={thumb.src} style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }} />
							) : (
								<Text fontSize="lg">{thumb.label}</Text>
							)}
						</Box>
					))}
				</Box>

				<Box
					bg="bg.default"
					border="1"
					borderColor="border.tertiary"
					p="20"
					rounded="lg"
				>
					<Box alignItems="center" display="flex" justifyContent="space-between">
						<Text color="fg.default" fontSize="2xl" fontWeight="500">The runner sponsoring package</Text>
						<Box alignItems="center" display="flex" style={{ gap: 14 }}>
							<IconTag size={18} color="var(--ax-colors-fg-secondary)" />
							<IconSparkles size={18} color="var(--ax-colors-fg-secondary)" />
							<IconLink size={18} color="var(--ax-colors-fg-secondary)" />
							<IconDots size={18} color="var(--ax-colors-fg-secondary)" />
						</Box>
					</Box>

						<Box mt="16" rounded="lg" style={{ overflow: "hidden" }}>
						<img alt="Runner sponsorship package" src={figmaAssets.contentHero} style={{ display: "block", width: "100%" }} />
					</Box>

						<Box display="flex" flexDirection="column" mt="16" style={{ gap: 18 }}>
						<Text color="fg.default" fontSize="lg">
							When the whole world is gearing up for the Ironman Miami 2026 triathlon, here's a sneak peek at the Runner Sponsorship Package:
						</Text>
						<Box asChild>
							<div style={{ lineHeight: 1.55 }}>
								<Text color="fg.default" fontSize="lg" fontWeight="600">Title Sponsor: The 'Victory Lap' Package ($5M)</Text>
								<ul style={{ margin: "6px 0 18px 24px", padding: 0 }}>
									<li><Text color="fg.default" fontSize="lg">Headline billing on all event promotions.</Text></li>
									<li><Text color="fg.default" fontSize="lg">Logo placement on runner jerseys.</Text></li>
									<li><Text color="fg.default" fontSize="lg">Exclusive naming rights for the finish line.</Text></li>
									<li><Text color="fg.default" fontSize="lg">VIP access for 50 guests.</Text></li>
									<li><Text color="fg.default" fontSize="lg">Full-page ad in the event program.</Text></li>
								</ul>
								<Text color="fg.default" fontSize="lg" fontWeight="600">Platinum Tier: The 'Sprint' Package ($3M)</Text>
								<ul style={{ margin: "6px 0 18px 24px", padding: 0 }}>
									<li><Text color="fg.default" fontSize="lg">Prominent logo placement on event banners.</Text></li>
									<li><Text color="fg.default" fontSize="lg">Opportunity to set up an interactive booth at the event.</Text></li>
									<li><Text color="fg.default" fontSize="lg">VIP access for 30 guests.</Text></li>
									<li><Text color="fg.default" fontSize="lg">Half-page ad in the event program.</Text></li>
								</ul>
								<Text color="fg.default" fontSize="lg" fontWeight="600">Gold Tier: The 'Marathon' Package ($1.5M)</Text>
								<ul style={{ margin: "6px 0 0 24px", padding: 0 }}>
									<li><Text color="fg.default" fontSize="lg">Logo placement on event signage.</Text></li>
									<li><Text color="fg.default" fontSize="lg">Opportunity to distribute promotional materials.</Text></li>
								</ul>
							</div>
						</Box>
					</Box>

					<Box display="flex" flexDirection="column" gap="12" mt="24">
						<Box alignItems="center" display="flex" gap="8">
							<Badge intent="neutral">Image</Badge>
							<Badge intent="neutral">Marathoner</Badge>
							<Badge intent="neutral">Millenials</Badge>
							<Text color="fg.accent" fontSize="sm">+ 6</Text>
						</Box>
						<MetadataRow icon={<IconCalendar size={16} />} label="Instance Name here • By Author name" />
						<MetadataRow icon={<IconCopy size={16} />} label="Will be saved in Library > Images" />
						<MetadataRow icon={<IconCalendar size={16} />} label="Expiry Date" />
						<MetadataRow icon={<IconLink size={16} />} label="Preview URL: https://www.stride.com/ironmanmiami" link />
					</Box>
				</Box>
			</Box>

			<button
				aria-label="Start AI"
				onClick={onOpenSuggested}
				style={{
					alignItems: "center",
					background: "linear-gradient(135deg, #3f34d1 10%, #7c40ec 72%)",
					border: "none",
					borderRadius: 999,
					bottom: 20,
					cursor: "pointer",
					display: "flex",
					height: 48,
					justifyContent: "center",
					position: "fixed",
					right: 20,
					width: 48,
					zIndex: 10,
				}}
			>
				<img alt="Opal" src="/opal-orb.png" style={{ height: 18, width: 18 }} />
			</button>
		</Box>
	);
}

function MetadataRow({
	icon,
	label,
	link = false,
}: {
	icon: ReactNode;
	label: string;
	link?: boolean;
}) {
	return (
		<Box alignItems="center" display="flex" gap="10">
			<Box alignItems="center" bg="bg.secondary" display="flex" justifyContent="center" rounded="full" style={{ height: 22, width: 22 }}>
				{icon}
			</Box>
			<Text color={link ? "fg.accent" : "fg.default"} fontSize="sm">{label}</Text>
		</Box>
	);
}

function AssetBadge({ kind, label }: { kind: AssetType; label: string }) {
	const color =
		kind === "PDF"
			? { bg: "#fff1d6", fg: "#a25d00" }
			: { bg: "#dbeafe", fg: "#2457c5" };

	return (
		<Box
			alignItems="center"
			display="flex"
			justifyContent="center"
			rounded="full"
			style={{
				backgroundColor: color.bg,
				height: 28,
				minWidth: 46,
				padding: "0 10px",
			}}
		>
			<Text fontSize="sm" style={{ color: color.fg, fontWeight: 600 }}>{label}</Text>
		</Box>
	);
}

function ScoreBadge({ score }: { score: number }) {
	return (
		<Box
			alignItems="center"
			bg="bg.default"
			display="flex"
			justifyContent="center"
			rounded="full"
			style={{ height: 28, minWidth: 54, padding: "0 10px" }}
		>
			<Text color="fg.accent" fontSize="sm" fontWeight="600">{score}%</Text>
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
				display: "block",
				filter: active ? "none" : "grayscale(1) brightness(1.02)",
				height: 14,
				opacity: active ? 1 : 0.9,
				width: 18,
			}}
		/>
	);
}

function FooterViewButton({
	active = false,
	icon,
	onClick,
}: {
	active?: boolean;
	icon: ReactNode;
	onClick?: () => void;
}) {
	return (
		<Box
			alignItems="center"
			bg={active ? "bg.secondary" : undefined}
			display="flex"
			justifyContent="center"
			onClick={onClick}
			rounded="md"
			style={{
				color: active ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)",
				cursor: onClick ? "pointer" : "default",
				height: 32,
				opacity: active ? 1 : 0.55,
				padding: 0,
				width: 32,
			}}
		>
			{icon}
		</Box>
	);
}
