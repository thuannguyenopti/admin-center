"use client";

import { useMemo, useRef, useState, useEffect, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLayout } from "@/app/context/LayoutContext";
import type { OpalDuplicateMatch, OpalFlag } from "@/app/shared/types/opal";
import type { PendingVersionDetail } from "@/app/dam/versions/data";
import { AssetFocusViewer } from "./components/assets/AssetFocusViewer";
import { AssetFilterPanel } from "./components/assets/AssetFilterPanel";
import { MasonryGrid } from "./components/assets/MasonryGrid";
import { AssetsReviewTab } from "./components/assets-review/AssetsReviewTab";
import { DamDashboard } from "./components/dashboards/DamDashboard";
import { PeopleTab } from "./components/people/PeopleTab";
import { UploadRecognitionDialog } from "./components/upload/UploadRecognitionDialog";
import {
	Badge,
	Box,
	Button as AxiomButton,
	LabelMenuButton,
	Menu,
	MenuContent,
	MenuTrigger,
	Pagination,
	SearchInput,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
	Text,
} from "@optiaxiom/react";
import {
	IconSliders as IconAdjustmentsHorizontal,
	IconBoxArchive as IconArchive,
	IconCheck,
	IconChevronDown,
	IconChevronRight,
	IconCopy,
	IconInputText as IconCursorText,
	IconDownload,
	IconEllipsisSolid as IconDots,
	IconPenToSquare as IconEdit,
	IconArrowUpRightFromSquare as IconExternalLink,
	IconEye,
	IconFile,
	IconFolder,
	IconFolderPlus,
	IconFolderOpen,
	IconLink,
	IconGrid2 as IconGridDots,
	IconImage as IconPhoto,
	IconPlus,
	IconPaperPlaneTop as IconSend,
	IconShareNodes as IconShare3,
	IconSparkles,
	IconTrashCan as IconTrash,
	IconUpload,
} from "@optimizely/axiom-icons";
import { IconFaceId, IconMinus } from "@/app/lib/axiom-icons";

type LibraryTab = "assets-review" | "assets-approved" | "collections" | "templates" | "dashboards" | "saved-views";
type AssetViewMode = "grid" | "masonry" | "faces";
type AssetLabel = "JPG" | "Word" | "Folder" | "File" | "PDF" | "MSG" | "ZIP" | "PNG" | "Structured Content" | "Article" | "TIFF";
type AssetKind = "folder" | "image" | "document" | "file" | "structured";

export type LibraryItem = {
	id: string;
	title: string;
	label: AssetLabel;
	type: AssetKind;
	image?: string;
	icon?: "file" | "folder";
	expired?: boolean;
	bgColor?: string;
	/** OPAL governance status — drives the Waiting Room filter and the detail panel's OPAL Review section. Assets with no status are treated as already cleared. */
	opalStatus?: "cleared" | "flagged" | "pending" | "processing";
	/** Brand compliance score, 0-100 — how well the asset matches brand guidelines. Drives severity color. */
	opalConfidence?: number;
	/** How sure OPAL is in its own assessment — a separate axis from the compliance score above. */
	opalConfidenceLevel?: "high" | "medium" | "low";
	opalFlags?: OpalFlag[];
	/** General submission metadata for the Waiting Room queue — distinct from pendingVersion's submitter/submittedAt, which is scoped to the versioning flow. */
	submittedBy?: string;
	submittedAt?: string;
	/** Set when OPAL finds a visual match against an existing library asset — renders a side-by-side comparison in place of the marker-annotated preview. */
	duplicateOf?: OpalDuplicateMatch;
	/** Set when a revised version is awaiting approval (Pillar 3 — Edit Submission & Versioning). */
	pendingVersion?: PendingVersionDetail;
};

function getTabFromParam(tab: string | null): LibraryTab | null {
	const valid: LibraryTab[] = ["assets-review", "assets-approved", "collections", "templates", "dashboards", "saved-views"];
	return valid.includes(tab as LibraryTab) ? (tab as LibraryTab) : null;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const tabs: Array<{ label: string; value: LibraryTab }> = [
	{ label: "Assets Review", value: "assets-review" },
	{ label: "Assets Approved", value: "assets-approved" },
	{ label: "Collections", value: "collections" },
	{ label: "Template", value: "templates" },
	{ label: "Dashboard", value: "dashboards" },
	{ label: "Saved Views", value: "saved-views" },
];

export const libraryItems: LibraryItem[] = [
	{
		id: "item-1",
		title: "Stride_Morning_Run.jpg",
		label: "JPG",
		type: "image",
		image: "https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=900&q=80",
		expired: true,
		opalStatus: "pending",
		opalConfidence: 58,
		opalConfidenceLevel: "medium",
		submittedBy: "Maya Chen",
		submittedAt: "40 min ago",
		pendingVersion: {
			versionLabel: "v2 — race-day angle + logo reposition",
			submitter: "Maya Chen",
			submittedAt: "40 min ago",
			pendingImage: "/brand-packs/templates/tdf-cyclist-road-wide.png",
			whatChanged: "Swapped the hero shot for the new race-day aerial angle the brand team asked for, and moved the logo to the bottom-right corner so it's clear of the rider.",
			reviewDeadline: "End of day Friday",
			confidence: 58,
			changesSummary: [
				{ type: "modified", detail: "Hero photograph replaced with an aerial race-day forest-road angle." },
				{ type: "modified", detail: "Logo lockup moved from top-left to bottom-right." },
				{ type: "added", detail: "Subtle vignette added behind the logo for contrast." },
			],
			brandRegressions: [
				{
					severity: "medium",
					category: "Brand Regression",
					detail: "The repositioned logo now sits directly over the rider's shoulder — v1 had clear space above the treeline.",
					fix: "Nudge the logo up into the open sky area, or crop tighter to exclude that corner.",
					marker: { x: 29, y: 61 },
				},
			],
			discrepancy: "Maya's note says the logo is now clear of the rider — OPAL detected it overlapping the shoulder instead.",
			recommendation: "flag",
			clearances: ["Colour palette still within approved Stride range", "Usage rights unchanged from v1"],
			reasoning: "The aerial race-day angle is a strong improvement in energy and storytelling. The logo reposition introduces a placement conflict that v1 didn't have. Net assessment is mixed — recommend a quick nudge before this replaces the live asset.",
			approveNote: "v2 approved. Aerial race-day angle replaces v1; logo repositioned bottom-right. Approver confirmed the shoulder overlap is acceptable at published crop widths.",
			changesDraft: "Hi Maya — OPAL flagged one issue with v2 of Stride_Morning_Run.jpg:\n\nThe bottom-right logo placement overlaps the rider's shoulder at common crop widths. Please nudge the logo or adjust the crop so it sits in clear space, the way v1 did.\n\nPlease resubmit when this is resolved. — Optimizely DAM",
			rejectDraft: "Hi Maya — v2 of Stride_Morning_Run.jpg has been rejected:\n\nThe logo placement overlaps the rider's shoulder, which is a brand guideline violation. This needs to be corrected before the revision can replace the live asset.\n\n— Optimizely DAM",
		},
	},
	{
		id: "item-2",
		title: "Stride_Brand_Guidelines.jpg",
		label: "JPG",
		type: "image",
		image: "/brand-packs/templates/tdf-stride-race-sq.png",
		opalStatus: "flagged",
		opalConfidence: 61,
		opalConfidenceLevel: "high",
		submittedBy: "Jordan Lee",
		submittedAt: "2 hours ago",
		opalFlags: [
			{
				severity: "high",
				category: "Brand Colour",
				detail: "Background yellow measures #FFC700 — 5% off the approved Stride Yellow (#FFD200) used across the Tour de France 2026 pack.",
				fix: "Resample the background from the approved Stride Yellow swatch in Brand Setup.",
				marker: { x: 88, y: 90 },
			},
			{
				severity: "medium",
				category: "Logo Usage",
				detail: "STRIDE lockup sits 8px from the frame edge — below the 16px minimum clearspace.",
				fix: "Increase the margin around the lockup to at least 16px on all sides.",
				marker: { x: 20, y: 12 },
			},
		],
	},
	{
		id: "item-1c",
		title: "Stride_Finish_Line_Sprint.jpg",
		label: "JPG",
		type: "image",
		image: "/brand-packs/templates/tdf-cyclist-mountain-sq.png",
		opalStatus: "processing",
		submittedBy: "Aisha Patel",
		submittedAt: "12 min ago",
	},
	{
		id: "item-1d",
		title: "Stride_Race_Day_Photos_v2.jpg",
		label: "JPG",
		type: "image",
		image: "/brand-packs/templates/tdf-finish-port.png",
		opalStatus: "flagged",
		opalConfidence: 64,
		opalConfidenceLevel: "high",
		submittedBy: "Priya Nair",
		submittedAt: "25 min ago",
		opalFlags: [
			{
				severity: "medium",
				category: "Duplicate Risk",
				detail: "94% visual match to Stride_Do_Not_Use_Sample.png (lib-0042), already in the library.",
				fix: "Confirm this is a genuinely new asset before approving, or reject in favor of the existing file.",
			},
		],
		duplicateOf: {
			assetId: "lib-0042",
			title: "Stride_Do_Not_Use_Sample.png",
			image: "/brand-packs/templates/tdf-finish-port.png",
			submittedBy: "Library seed data",
			submittedAt: "8 months ago",
			matchPct: 94,
		},
	},
	{
		id: "item-1e",
		title: "Stride_Trailhead_Signage.jpg",
		label: "JPG",
		type: "image",
		image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80",
		opalStatus: "cleared",
		opalConfidence: 96,
		opalConfidenceLevel: "high",
		submittedBy: "Jordan Lee",
		submittedAt: "1 hour ago",
	},
	{
		id: "item-3",
		title: "Campaign Planning",
		label: "Folder",
		type: "folder",
	},
	{
		id: "item-4",
		title: "Social Media Assets",
		label: "Folder",
		type: "folder",
	},
	{
		id: "item-5",
		title: "Stride_Athlete_Enrollment.docx",
		label: "Word",
		type: "document",
		bgColor: "#7B61FF",
	},
	{
		id: "item-6",
		title: "Training_Schedule.docx",
		label: "Word",
		type: "document",
		bgColor: "#7B61FF",
	},
	{
		id: "item-7",
		title: "Stride_Q1_Report.pdf",
		label: "File",
		type: "file",
		bgColor: "#7B61FF",
	},
	{
		id: "item-8",
		title: "Brand_Strategy.pdf",
		label: "PDF",
		type: "document",
		bgColor: "#D97706",
	},
	{
		id: "item-9",
		title: "Campaign_Brief.msg",
		label: "MSG",
		type: "file",
		bgColor: "#64748B",
	},
	{
		id: "item-10",
		title: "Stride_Assets.zip",
		label: "ZIP",
		type: "file",
		bgColor: "#6B7280",
	},
	{
		id: "item-11",
		title: "Stride_Logo.png",
		label: "PNG",
		type: "image",
		image: "/brand-packs/templates/tdf-engineered-wide.png",
		bgColor: "#10B981",
	},
	{
		id: "item-12",
		title: "Stride social content layout",
		label: "Structured Content",
		type: "image",
		image: "/brand-packs/templates/tdf-race-register-port.png",
		bgColor: "#3B82F6",
	},
	{
		id: "item-13",
		title: "Stride_Lake_Swim_Training.jpg",
		label: "Article",
		type: "image",
		image: "/brand-packs/templates/tdf-stride-race-sq.png",
		bgColor: "#3B82F6",
	},
	{
		id: "item-14",
		title: "Stride_Championship.jpg",
		label: "Structured Content",
		type: "image",
		image: "/brand-packs/templates/tdf-finish-port.png",
		bgColor: "#3B82F6",
		expired: true,
	},
	{
		id: "item-15",
		title: "Stride_Bike_Race.tiff",
		label: "TIFF",
		type: "image",
		image: "/brand-packs/templates/tdf-cyclist-road-wide.png",
		bgColor: "#10B981",
	},
	{
		id: "item-16",
		title: "Stride_Open_Water.jpg",
		label: "Folder",
		type: "folder",
	},
	{
		id: "item-17",
		title: "Race_Day_Photos.jpg",
		label: "JPG",
		type: "image",
		image: "/brand-packs/templates/tdf-finish-port.png",
		pendingVersion: {
			versionLabel: "v2 — tighter crop + warmer color grade",
			submitter: "Priya Nair",
			submittedAt: "3 hours ago",
			pendingImage: "/brand-packs/templates/tdf-finish-port.png",
			whatChanged: "Cropped tighter on the lead pack and warmed up the color grade to match the Autumn Series campaign look.",
			confidence: 91,
			changesSummary: [
				{ type: "modified", detail: "Crop tightened by roughly 10% to bring the lead pack closer to frame." },
				{ type: "modified", detail: "Colour grade warmed slightly to match the Autumn Series look." },
			],
			brandRegressions: [],
			recommendation: "approve",
			clearances: [
				"Crop still preserves the sponsor-safe zone around jerseys",
				"Colour grade stays within the approved Stride warmth range",
				"No metadata fields altered",
			],
			reasoning: "Straightforward crop and colour-grade refinement — no regressions introduced. Straightforward approve.",
			approveNote: "v2 approved. Crop tightened on the lead pack and colour grade warmed for the Autumn Series look. No regressions.",
			changesDraft: "Hi Priya — OPAL reviewed v2 of Race_Day_Photos.jpg and it looks ready to approve. No changes requested.\n\n— Optimizely DAM",
			rejectDraft: "Hi Priya — v2 of Race_Day_Photos.jpg has been rejected.\n\n— Optimizely DAM",
		},
	},
	{
		id: "item-18",
		title: "Stride_Bike_Fit.jpg",
		label: "JPG",
		type: "image",
		image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80",
	},
	{
		id: "item-19",
		title: "Training_Plans",
		label: "Folder",
		type: "folder",
	},
	{
		id: "item-20",
		title: "Stride_Transition.jpg",
		label: "JPG",
		type: "image",
		image: "https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?auto=format&fit=crop&w=900&q=80",
	},
];

function getBadgeIntent(label: AssetLabel): "information" | "neutral" | "success" | "warning" | null {
	const intents: Record<AssetLabel, "information" | "neutral" | "success" | "warning" | null> = {
		"JPG": "success",
		"PNG": "success",
		"TIFF": "success",
		"Word": "information",
		"File": "information",
		"Structured Content": "information",
		"Article": "information",
		"PDF": "warning",
		"MSG": "neutral",
		"ZIP": "neutral",
		"Folder": null,
	};

	return intents[label];
}

function LabelBadge({ label }: { label: AssetLabel }) {
	const intent = getBadgeIntent(label);

	if (!intent) {
		return (
			<Text color="fg.secondary" fontSize="sm" fontWeight="500" style={{ alignSelf: "flex-start" }}>
				{label}
			</Text>
		);
	}

	return <Badge intent={intent} style={{ alignSelf: "flex-start" }}>{label}</Badge>;
}

function ContextMenu({ type, onClose }: { type: "folder" | "asset"; onClose: () => void }) {
	const menuRef = useRef<HTMLDivElement>(null);
	const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				onClose();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [onClose]);

	const folderMenuItems = [
		{ icon: <IconEye size={16} />, label: "Open" },
		{ icon: <IconShare3 size={16} />, label: "Share" },
		{ divider: true },
		{ icon: <IconPlus size={16} />, label: "Add to", hasSubmenu: true, submenuKey: "addTo" },
		{ icon: <IconFolderOpen size={16} />, label: "Move" },
		{ icon: <IconEdit size={16} />, label: "Edit", hasSubmenu: true, submenuKey: "edit" },
		{ icon: <IconTrash size={16} />, label: "Delete", danger: true },
	];

	const assetMenuItems = [
		{ icon: <IconSend size={16} />, label: "Send" },
		{ icon: <IconExternalLink size={16} />, label: "Send to OneDrive", disabled: true },
		{ icon: <IconShare3 size={16} />, label: "Share" },
		{ icon: <IconDownload size={16} />, label: "Download" },
		{ divider: true },
		{ icon: <IconPlus size={16} />, label: "Add to", hasSubmenu: true, submenuKey: "addTo" },
		{ icon: <IconFolderOpen size={16} />, label: "Move" },
		{ icon: <IconEdit size={16} />, label: "Edit", hasSubmenu: true, submenuKey: "edit" },
		{ icon: <IconCursorText size={16} />, label: "Adjust Focal Point" },
		{ icon: <IconLink size={16} />, label: "Copy Public Link" },
		{ icon: <IconMinus size={16} />, label: "Versions & History" },
		{ icon: <IconDownload size={16} />, label: "Download As", hasSubmenu: true, submenuKey: "downloadAs" },
		{ icon: <IconArchive size={16} />, label: "Archive" },
		{ divider: true },
		{ icon: <IconTrash size={16} />, label: "Delete", danger: true },
	];

	const menuItems = type === "folder" ? folderMenuItems : assetMenuItems;

	const submenuContent: Record<string, Array<{ label: string; icon?: ReactNode }>> = {
		addTo: [
			{ label: "Favorite" },
			{ label: "Collection" },
			{ label: "Campaign" },
		],
		edit: [
			{ label: "Title", icon: <IconEdit size={16} /> },
			{ label: "Image", icon: <IconPhoto size={16} /> },
			{ label: "Expiry Date", icon: <IconMinus size={16} /> },
		],
		downloadAs: [
			{ label: "JPG" },
			{ label: "Other formats (Original Size)" },
			{ label: "PNG" },
			{ label: "PDF" },
			{ label: "WEBP" },
		],
	};

	return (
		<Box
			ref={menuRef}
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			rounded="xl"
			shadow="lg"
			style={{
				position: "absolute",
				right: 8,
				top: 40,
				width: 200,
				zIndex: 50,
			}}
		>
			{type === "asset" && (
				<Box borderB="1" borderColor="border.tertiary" p="8">
					<Box
						alignItems="center"
						border="1"
						borderColor="border.tertiary"
						display="flex"
						gap="8"
						rounded="md"
						px="10"
						py="8"
					>
						<IconEye size={14} color="var(--ax-colors-fg-secondary)" />
						<input
							placeholder="Filter..."
							style={{
								background: "transparent",
								border: 0,
								flex: 1,
								fontSize: 14,
								outline: "none",
								color: "var(--ax-colors-fg-default)",
							}}
						/>
					</Box>
				</Box>
			)}
			<Box display="flex" flexDirection="column" py="6">
				{menuItems.map((item, index) =>
					item.divider ? (
						<Box key={index} borderT="1" borderColor="border.tertiary" my="4" />
					) : (
						<Box key={index} style={{ position: "relative" }}>
							<button
								type="button"
								disabled={Boolean("disabled" in item && item.disabled)}
								className="menu-item"
								style={{
									alignItems: "center",
									background: "transparent",
									border: 0,
									color: "disabled" in item && item.disabled
										? "var(--ax-colors-fg-tertiary)"
										: "danger" in item && item.danger
											? "var(--ax-colors-fg-error)"
											: "var(--ax-colors-fg-default)",
									cursor: "disabled" in item && item.disabled ? "not-allowed" : "pointer",
									display: "flex",
									fontSize: 14,
									height: 40,
									justifyContent: "space-between",
									padding: "0 12px",
									textAlign: "left",
									width: "100%",
									transition: "background-color 0.15s",
								}}
								onMouseEnter={(e) => {
									if (!("disabled" in item && item.disabled)) {
										e.currentTarget.style.background = "var(--ax-colors-bg-secondary)";
										if ("submenuKey" in item && item.submenuKey) {
											setActiveSubmenu(item.submenuKey);
										}
									}
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = "transparent";
									if (!("hasSubmenu" in item && item.hasSubmenu)) {
										setActiveSubmenu(null);
									}
								}}
							>
								<Box alignItems="center" display="flex" gap="8">
									{"icon" in item && item.icon}
									<span>{"label" in item ? item.label : ""}</span>
								</Box>
								{"hasSubmenu" in item && item.hasSubmenu && <IconChevronRight size={14} />}
							</button>

							{/* Submenu */}
							{"submenuKey" in item && activeSubmenu === item.submenuKey && (
								<Box
									bg="bg.default"
									border="1"
									borderColor="border.tertiary"
									rounded="xl"
									shadow="lg"
									style={{
										position: "absolute",
										left: 190,
										top: -2,
										width: 200,
										zIndex: 60,
									}}
									onMouseEnter={() => {
										if ("submenuKey" in item && item.submenuKey) {
											setActiveSubmenu(item.submenuKey);
										}
									}}
									onMouseLeave={() => setActiveSubmenu(null)}
								>
									<Box display="flex" flexDirection="column" py="6">
										{submenuContent[item.submenuKey]?.map((subItem, subIndex) => (
											<button
												key={subIndex}
												type="button"
												style={{
													alignItems: "center",
													background: "transparent",
													border: 0,
													color: "var(--ax-colors-fg-default)",
													cursor: "pointer",
													display: "flex",
													fontSize: 14,
													height: 40,
													justifyContent: "flex-start",
													padding: "0 12px",
													textAlign: "left",
													width: "100%",
													transition: "background-color 0.15s",
												}}
												onMouseEnter={(e) => {
													e.currentTarget.style.background = "var(--ax-colors-bg-secondary)";
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.background = "transparent";
												}}
											>
												<Box alignItems="center" display="flex" gap="8">
													{subItem.icon}
													<span>{subItem.label}</span>
												</Box>
											</button>
										))}
									</Box>
								</Box>
							)}
						</Box>
					),
				)}
			</Box>
		</Box>
	);
}

function AddMenu({
	onClose,
	onGenerateImage,
	onCreateDropZone,
}: {
	onClose: () => void;
	onGenerateImage: () => void;
	onCreateDropZone: () => void;
}) {
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				onClose();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [onClose]);

	const menuItems = [
		{ icon: <IconFolderPlus size={18} />, label: "Create Folder" },
		{ icon: <IconUpload size={18} />, label: "Upload" },
		{ divider: true },
		{ icon: <IconSparkles size={18} />, label: "Generate Image", highlighted: true, onClick: onGenerateImage },
		{ divider: true },
		{ icon: <IconLink size={18} />, label: "Create Drop Zone Link", onClick: onCreateDropZone },
	];

	return (
		<Box
			ref={menuRef}
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			rounded="xl"
			shadow="lg"
			style={{
				position: "absolute",
				right: 0,
				top: 48,
				width: 280,
				zIndex: 80,
			}}
		>
			<Box display="flex" flexDirection="column" p="6">
				{menuItems.map((item, index) =>
					item.divider ? (
						<Box key={index} borderT="1" borderColor="border.tertiary" my="6" />
					) : (
						<button
							key={item.label}
							type="button"
							style={{
								alignItems: "center",
								background: item.highlighted ? "var(--ax-colors-bg-secondary)" : "transparent",
								border: 0,
								borderRadius: 10,
								color: "var(--ax-colors-fg-default)",
								cursor: "pointer",
								display: "flex",
								fontSize: 16,
								fontWeight: 500,
								gap: 12,
								height: 48,
								padding: "0 14px",
								textAlign: "left",
								width: "100%",
							}}
							onClick={() => {
								if (item.onClick) {
									item.onClick();
								}
								onClose();
							}}
							onMouseEnter={(event) => {
								event.currentTarget.style.background = "var(--ax-colors-bg-secondary)";
							}}
							onMouseLeave={(event) => {
								event.currentTarget.style.background = item.highlighted
									? "var(--ax-colors-bg-secondary)"
									: "transparent";
							}}
						>
							{item.icon}
							<span>{item.label}</span>
						</button>
					),
				)}
			</Box>
		</Box>
	);
}

function AssetCard({ item, onOpen }: { item: LibraryItem; onOpen: () => void }) {
	const [isHovered, setIsHovered] = useState(false);
	const [isSelected, setIsSelected] = useState(false);
	const [showMenu, setShowMenu] = useState(false);
	const hasImage = item.type === "image" && !!item.image;
	// Any item with a bgColor gets a colored tile (includes image-type with no URL)
	const isFolder = item.type === "folder";
	const coloredBg = item.bgColor || (!hasImage && !isFolder ? "#7B61FF" : null);

	return (
		<Box style={{ position: "relative" }}>
			<Box
				bg="bg.default"
				border="1"
				borderColor="border.tertiary"
				display="flex"
				flexDirection="column"
				overflow="hidden"
				rounded="lg"
				role="button"
				tabIndex={0}
				style={{ cursor: "pointer", height: 180 }}
				onClick={onOpen}
				onKeyDown={(e) => { if (e.key === "Enter") onOpen(); }}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				{/* Thumbnail */}
				<Box style={{ flex: 1, minHeight: 0, position: "relative" }}>
					{hasImage ? (
						<img
							alt={item.title}
							src={item.image}
							style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }}
						/>
					) : isFolder ? (
						<Box
							alignItems="center"
							display="flex"
							justifyContent="center"
							style={{ background: "#6B7280", height: "100%", width: "100%" }}
						>
							<IconFolder color="rgba(255,255,255,0.8)" size={32} strokeWidth={1.5} />
						</Box>
					) : (
						<Box
							alignItems="center"
							display="flex"
							justifyContent="center"
							style={{ background: coloredBg ?? "#6B7280", height: "100%", width: "100%" }}
						>
							<IconFile color="rgba(255,255,255,0.85)" size={32} strokeWidth={1.5} />
						</Box>
					)}

					{/* Hover: checkbox top-left */}
					{isHovered && (
						<Box
							alignItems="center"
							bg="bg.default"
							border="1"
							borderColor="border.secondary"
							display="flex"
							justifyContent="center"
							rounded="sm"
							style={{ cursor: "pointer", height: 16, left: 10, position: "absolute", top: 10, width: 16 }}
							onClick={(e) => { e.stopPropagation(); setIsSelected(!isSelected); }}
						>
							{isSelected && <IconCheck color="var(--ax-colors-fg-default)" size={12} />}
						</Box>
					)}

					{/* Hover: ⋯ top-right */}
					{isHovered && (
						<Box style={{ position: "absolute", right: 8, top: 8 }}>
							<AxiomButton
								appearance="default"
								size="sm"
								aria-label="Open item actions"
								onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
								style={{
									background: "rgba(255,255,255,0.92)",
									borderColor: "var(--ax-colors-border-tertiary)",
									height: 28,
									minWidth: 28,
									padding: 0,
									width: 28,
								}}
							>
								<IconDots size={16} />
							</AxiomButton>
						</Box>
					)}

					{/* OPAL status — surfaces items needing review directly in the grid */}
					{item.opalStatus === "flagged" && (
						<Box style={{ position: "absolute", bottom: 8, left: 8 }}>
							<Badge intent="warning">Flagged</Badge>
						</Box>
					)}
					{item.opalStatus === "pending" && (
						<Box style={{ position: "absolute", bottom: 8, left: 8 }}>
							<Badge intent="warning">Needs Review</Badge>
						</Box>
					)}
				</Box>

				{/* Footer — badge + filename, inside the card border */}
				<Box display="flex" flexDirection="column" gap="6" px="10" py="8" style={{ flexShrink: 0 }}>
					<LabelBadge label={item.label} />
					<Box alignItems="center" display="flex" gap="6">
						<IconFile color="var(--ax-colors-fg-tertiary)" size={13} style={{ flexShrink: 0 }} />
						<Text
							fontSize="md"
							fontWeight="500"
							style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
						>
							{item.title}
						</Text>
					</Box>
					{item.expired && (
						<Text color="fg.error" fontSize="sm" fontWeight="500">
							Expired
						</Text>
					)}
				</Box>
			</Box>

			{showMenu && <ContextMenu type={isFolder ? "folder" : "asset"} onClose={() => setShowMenu(false)} />}
		</Box>
	);
}

export default function CMPLibraryPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { opalPanelControls, setAsideContent, setHidePageHeader } = useLayout();
	const [activeTab, setActiveTab] = useState<LibraryTab>("assets-approved");
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const [showAssetFilters, setShowAssetFilters] = useState(false);
	const [showAddMenu, setShowAddMenu] = useState(false);
	const [showUploadDialog, setShowUploadDialog] = useState(false);
	const [selectedDetailItem, setSelectedDetailItem] = useState<LibraryItem | null>(null);
	// Counts distinct assets needing attention across both Assets Review pillars — OPAL
	// review (image-only, since brand review is inherently an image concern) and pending
	// edit submissions. A Set avoids double-counting an item that qualifies both ways
	// (e.g. a new upload that's also mid-revision). Drives the "Assets Review" tab-trigger
	// badge (the anticipatory signal that replaced the old toolbar icon) — Drop Zones
	// stays excluded, since it's a management list, not a queue of pending decisions.
	const assetsReviewCount = new Set(
		libraryItems
			.filter((item) =>
				(item.type === "image" && (item.opalStatus === "pending" || item.opalStatus === "flagged" || item.opalStatus === "processing"))
				|| item.pendingVersion,
			)
			.map((item) => item.id),
	).size;
	const [assetFilters, setAssetFilters] = useState<Set<string>>(() => new Set());
	const toggleAssetFilter = (value: string) => {
		setAssetFilters((current) => {
			const next = new Set(current);
			if (next.has(value)) next.delete(value);
			else next.add(value);
			return next;
		});
	};
	const [assetView, setAssetView] = useState<AssetViewMode>(() => {
		const view = searchParams.get("view");
		return view === "faces" || view === "masonry" ? view : "grid";
	});

	useEffect(() => {
		setHidePageHeader?.(true);

		return () => {
			setAsideContent?.(null);
			setHidePageHeader?.(false);
		};
	}, [setAsideContent, setHidePageHeader]);

	useEffect(() => {
		const tabFromUrl = getTabFromParam(searchParams.get("tab"));
		if (tabFromUrl && tabFromUrl !== activeTab) {
			setActiveTab(tabFromUrl);
		}
	}, [activeTab, searchParams]);

	const handleViewChange = (view: AssetViewMode) => {
		setAssetView(view);
		const url = view === "grid" ? "/cmp/library" : `/cmp/library?view=${view}`;
		router.replace(url, { scroll: false });
	};

	const handleTabChange = (value: string) => {
		const nextTab = getTabFromParam(value) ?? "assets-approved";
		setActiveTab(nextTab);
		if (nextTab !== "assets-approved") setAssetView("grid");
		router.replace(
			nextTab === "assets-approved" ? "/cmp/library" : `/cmp/library?tab=${nextTab}`,
			{ scroll: false },
		);
	};

	const filteredItems = useMemo(() => {
		const expiredOnly = assetFilters.has("status:Expired");

		return libraryItems.filter((item) => {
			// No asset with an open OPAL review or a pending edit awaiting review is ever
			// allowed into the approved library — enforced here, in the data itself, not as
			// a UI-level hide. An approved asset with a pending version still needs a
			// decision, so it belongs in Assets Review until that version is resolved.
			if (item.opalStatus === "flagged" || item.opalStatus === "pending" || item.opalStatus === "processing") return false;
			if (item.pendingVersion) return false;
			if (searchQuery.trim() && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
			if (expiredOnly && !item.expired) return false;
			return true;
		});
	}, [searchQuery, assetFilters]);

	const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
	const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

	useEffect(() => {
		setCurrentPage(1);
	}, [filteredItems, pageSize]);

	// Prev/next in the asset focus viewer browses whichever list was on screen when it opened:
	// the current page of approved assets, or the review queue's default "needs attention" set
	// (the queue's own filter/pagination state isn't visible here, so this matches its default view).
	const focusViewerItems = useMemo(
		() => (activeTab === "assets-review"
			? libraryItems.filter((item) => item.opalStatus === "pending" || item.opalStatus === "flagged" || item.pendingVersion)
			: paginatedItems),
		[activeTab, paginatedItems],
	);

	const handleGenerateImage = () => {
		window.localStorage.setItem("cmp_opal_mode", "image-gen");
		opalPanelControls?.clearHistory();
		opalPanelControls?.openPanel();
		opalPanelControls?.addMessage({
			role: "assistant",
			content:
				"Hi, I'm Opal, Optimizely's AI. I can help create brand-safe visuals for campaigns, social, and event content.\n\nWhat do you want to create? I can generate a quick image draft here first, then you can decide whether to open the advanced editor.",
		});
		opalPanelControls?.setInputValue("Create a new dynamic image for a triathlon poster");
	};

	return (
		<Box
			display="flex"
			flexDirection="column"
			style={{ minHeight: "calc(100vh - 80px)", margin: -32, position: "relative" }}
		>
			<Box display="flex" flex="1" flexDirection="column" style={{ minHeight: 0 }}>
				{selectedDetailItem && (activeTab === "assets-approved" || activeTab === "assets-review") ? (
					<Box display="flex" flexDirection="column" px="32" py="20" style={{ height: "calc(100vh - 80px)" }}>
						<AssetFocusViewer
							item={selectedDetailItem}
							items={focusViewerItems}
							onClose={() => setSelectedDetailItem(null)}
							onNavigate={setSelectedDetailItem}
						/>
					</Box>
				) : (
					<>
				<Box borderB="1" borderColor="border.tertiary" px="32" pt="20">
					<Tabs value={activeTab} onValueChange={handleTabChange}>
						<TabsList>
							{tabs.map((tab) => (
								<TabsTrigger key={tab.value} value={tab.value}>
									{tab.value === "assets-review" && assetsReviewCount > 0 ? (
										<Box alignItems="center" display="flex" gap="8">
											<span>{tab.label}</span>
											<Badge intent="warning" variant="subtle">{assetsReviewCount}</Badge>
										</Box>
									) : (
										tab.label
									)}
								</TabsTrigger>
							))}
						</TabsList>

						<TabsContent value="assets-approved">
							<Box alignItems="center" display="flex" gap="8" pb="20" pt="20">
								<AxiomButton
									appearance={showAssetFilters ? "primary" : "default"}
									size="md"
									icon={<IconAdjustmentsHorizontal />}
									aria-label="Filter assets"
									aria-pressed={showAssetFilters}
									onClick={() => setShowAssetFilters((current) => !current)}
								/>
								<Box style={{ width: 200 }}>
									<SearchInput
										placeholder={assetView === "faces" ? "Search people…" : "Search"}
										size="md"
										value={searchQuery}
										onChange={(event) => setSearchQuery(event.target.value)}
									/>
								</Box>
								{/* View-toggle group — flexShrink:0 prevents icons squishing in a flex row */}
								<Box alignItems="center" display="flex" gap="4" style={{ flexShrink: 0 }}>
									<AxiomButton
										appearance="default"
										size="lg"
										icon={<IconCopy size={16} />}
										aria-label="Grid view"
										style={{ flexShrink: 0 }}
										onClick={() => handleViewChange("grid")}
									/>
									<AxiomButton
										appearance="default"
										size="lg"
										icon={<IconFaceId size={16} />}
										aria-label="Face recognition view"
										aria-pressed={assetView === "faces"}
										data-state={assetView === "faces" ? "active" : undefined}
										style={{ flexShrink: 0 }}
										onClick={() => handleViewChange(assetView === "faces" ? "grid" : "faces")}
									/>
									<Menu
										options={[
											{ label: "Masonry View", addon: <IconGridDots size={16} />, execute: () => handleViewChange("masonry"), ...(assetView === "masonry" && { selected: true }) },
											{ label: "Category View", addon: <IconGridDots size={16} />, disabledReason: "Coming soon" },
											{ label: "Grid View", addon: <IconGridDots size={16} />, execute: () => handleViewChange("grid"), ...(assetView === "grid" && { selected: true }) },
											{ label: "List View", addon: <IconGridDots size={16} />, disabledReason: "Coming soon" },
										]}
									>
										<MenuTrigger asChild>
											<AxiomButton
												appearance="default"
												size="lg"
												icon={<IconGridDots size={16} />}
												iconPosition="start"
												aria-label="Media view options"
												style={{ flexShrink: 0 }}
											>
												<IconChevronDown size={16} />
											</AxiomButton>
										</MenuTrigger>
										<MenuContent />
									</Menu>
								</Box>
								<AxiomButton appearance="subtle" size="lg" iconPosition="end" icon={<IconChevronDown />}>
									Last Modified
								</AxiomButton>
								<Box flex="1" />
									<AxiomButton appearance="default" size="lg">Save View</AxiomButton>
									<Box style={{ position: "relative" }}>
										<AxiomButton
											appearance="primary"
											size="lg"
											icon={<IconChevronDown size={16} />}
											iconPosition="end"
											onClick={() => setShowAddMenu((current) => !current)}
										>
											Add
										</AxiomButton>
										{showAddMenu ? (
											<AddMenu
												onClose={() => setShowAddMenu(false)}
												onGenerateImage={handleGenerateImage}
												onCreateDropZone={() => router.push("/dam/drop-zone/new")}
											/>
										) : null}
									</Box>
								</Box>
							</TabsContent>

						{/* Assets Review has no toolbar-row content of its own — its SegmentedControl
							and body live in the content row below, not this TabsContent slot. */}
						<TabsContent value="assets-review" />

						<TabsContent value="dashboards">
							<Box pb="20" pt="20">
								<DamDashboard />
							</Box>
						</TabsContent>

						{tabs
							.filter((tab) => tab.value !== "assets-approved" && tab.value !== "assets-review" && tab.value !== "dashboards")
							.map((tab) => (
								<TabsContent key={tab.value} value={tab.value}>
									<Box py="20">
										<Text color="fg.secondary" fontSize="sm">
											{tab.label} content coming soon.
										</Text>
									</Box>
								</TabsContent>
							))}
					</Tabs>
				</Box>

				<Box flex="1" overflow="auto" px="32" py="20">
					{activeTab === "assets-approved" && assetView === "grid" && (
						<Box alignItems="start" display="flex">
							<AssetFilterPanel open={showAssetFilters} selected={assetFilters} onToggleValue={toggleAssetFilter} />
							<Box
								className="cmp-library-grid"
								display="grid"
								flex="1"
								gap="16"
								style={{
									gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
									marginLeft: showAssetFilters ? 20 : 0,
									minWidth: 0,
									transition: "margin-left 240ms ease",
								}}
							>
								{paginatedItems.map((item) => (
									<AssetCard key={item.id} item={item} onOpen={() => setSelectedDetailItem(item)} />
								))}
							</Box>
						</Box>
					)}
					{activeTab === "assets-approved" && assetView === "masonry" && (
						<Box alignItems="start" display="flex">
							<AssetFilterPanel open={showAssetFilters} selected={assetFilters} onToggleValue={toggleAssetFilter} />
							<Box flex="1" style={{ marginLeft: showAssetFilters ? 20 : 0, minWidth: 0, transition: "margin-left 240ms ease" }}>
								<MasonryGrid items={paginatedItems} onOpen={setSelectedDetailItem} />
							</Box>
						</Box>
					)}
					{activeTab === "assets-approved" && assetView === "faces" && (
						<PeopleTab
							hideToolbar
							externalSearch={searchQuery}
							onOpenProfile={(p) => router.push(`/cmp/library/people/${p.id}`)}
							onOpenUnknownInbox={() => router.push("/cmp/library/unknown-faces")}
						/>
					)}
					{activeTab === "assets-review" && (
						<AssetsReviewTab items={libraryItems} onOpenItem={setSelectedDetailItem} />
					)}
				</Box>

				{activeTab === "assets-approved" && assetView === "grid" && totalPages > 1 && (
					<Box
						alignItems="center"
						bg="bg.page"
						borderT="1"
						borderColor="border.tertiary"
						display="flex"
						justifyContent="space-between"
						px="32"
						py="12"
					>
						<Menu
							options={PAGE_SIZE_OPTIONS.map((size) => ({
								label: String(size),
								execute: () => setPageSize(size),
								...(pageSize === size && { selected: true }),
							}))}
						>
							<MenuTrigger asChild>
								<LabelMenuButton label="Page Size">{pageSize}</LabelMenuButton>
							</MenuTrigger>
							<MenuContent />
						</Menu>
						<Pagination page={currentPage} total={totalPages} onPageChange={setCurrentPage} />
						<Box style={{ width: 120 }} />
					</Box>
				)}
					</>
				)}
			</Box>
		</Box>
	);
}
