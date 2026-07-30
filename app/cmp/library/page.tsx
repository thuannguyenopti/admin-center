"use client";

import { useMemo, useRef, useState, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLayout } from "@/app/context/LayoutContext";
import { AssetFocusViewer } from "./components/assets/AssetFocusViewer";
import { AssetFilterPanel } from "./components/assets/AssetFilterPanel";
import { MasonryGrid } from "./components/assets/MasonryGrid";
import { AssetsReviewTab } from "./components/assets-review/AssetsReviewTab";
import { DamDashboard } from "./components/dashboards/DamDashboard";
import { PeopleTab } from "./components/people/PeopleTab";
import { UploadRecognitionDialog } from "./components/upload/UploadRecognitionDialog";
import { getAllLibraryItems, subscribeLibraryItems, type AssetKind, type AssetLabel, type LibraryItem } from "./libraryItems";

export type { LibraryItem } from "./libraryItems";
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
	const libraryItems = useSyncExternalStore(subscribeLibraryItems, getAllLibraryItems, getAllLibraryItems);
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
	}, [searchQuery, assetFilters, libraryItems]);

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
		[activeTab, paginatedItems, libraryItems],
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
