"use client";

import { useMemo, useRef, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
	Box,
	Button as AxiomButton,
	Pagination,
	SearchInput,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
	Text,
} from "@optiaxiom/react";
import {
	IconAdjustmentsHorizontal,
	IconArchive,
	IconArrowUp,
	IconCheck,
	IconChevronDown,
	IconChevronRight,
	IconCopy,
	IconCursorText,
	IconDownload,
	IconDots,
	IconEdit,
	IconExternalLink,
	IconEye,
	IconFile,
	IconFolder,
	IconFolderPlus,
	IconFolderOpen,
	IconLink,
	IconMinus,
	IconPhoto,
	IconPlus,
	IconSend,
	IconShare3,
	IconSparkles,
	IconTrash,
	IconUpload,
} from "@tabler/icons-react";

type LibraryTab = "assets" | "collections" | "templates" | "dashboards" | "saved-views";
type AssetLabel = "JPG" | "Word" | "Folder" | "File" | "PDF" | "MSG" | "ZIP" | "PNG" | "Structured Content" | "Article" | "TIFF";
type AssetKind = "folder" | "image" | "document" | "file" | "structured";

type LibraryItem = {
	id: string;
	title: string;
	label: AssetLabel;
	type: AssetKind;
	image?: string;
	icon?: "file" | "folder";
	expired?: boolean;
	bgColor?: string;
};

const tabs: Array<{ label: string; value: LibraryTab }> = [
	{ label: "Assets", value: "assets" },
	{ label: "Collections", value: "collections" },
	{ label: "Templates", value: "templates" },
	{ label: "Dashboards", value: "dashboards" },
	{ label: "Saved Views", value: "saved-views" },
];

const libraryItems: LibraryItem[] = [
	{
		id: "item-1",
		title: "Stride_Morning_Run.jpg",
		label: "JPG",
		type: "image",
		image: "https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=900&q=80",
		expired: true,
	},
	{
		id: "item-2",
		title: "Stride_Brand_Guidelines.jpg",
		label: "JPG",
		type: "image",
		image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80",
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
		bgColor: "#10B981",
	},
	{
		id: "item-12",
		title: "Stride social content layout",
		label: "Structured Content",
		type: "structured",
		bgColor: "#3B82F6",
	},
	{
		id: "item-13",
		title: "Stride_Lake_Swim_Training.jpg",
		label: "Article",
		type: "structured",
		bgColor: "#3B82F6",
	},
	{
		id: "item-14",
		title: "Stride_Championship.jpg",
		label: "Structured Content",
		type: "structured",
		bgColor: "#3B82F6",
		expired: true,
	},
	{
		id: "item-15",
		title: "Stride_Bike_Race.tiff",
		label: "TIFF",
		type: "image",
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
		image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=900&q=80",
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

function getBadgeStyle(label: AssetLabel) {
	const styles: Record<AssetLabel, { bg: string; color: string; border?: boolean }> = {
		"JPG": {
			bg: "var(--ax-colors-bg-success-subtle)",
			color: "var(--ax-colors-fg-success)",
		},
		"Word": {
			bg: "var(--ax-colors-bg-information-subtle)",
			color: "var(--ax-colors-fg-information-strong)",
		},
		"Folder": {
			bg: "transparent",
			color: "var(--ax-colors-fg-secondary)",
		},
		"File": {
			bg: "var(--ax-colors-bg-information-subtle)",
			color: "var(--ax-colors-fg-information-strong)",
		},
		"PDF": {
			bg: "#FEF3C7",
			color: "#D97706",
		},
		"MSG": {
			bg: "var(--ax-colors-bg-secondary)",
			color: "var(--ax-colors-fg-secondary)",
		},
		"ZIP": {
			bg: "var(--ax-colors-bg-secondary)",
			color: "var(--ax-colors-fg-secondary)",
		},
		"PNG": {
			bg: "#D1FAE5",
			color: "#059669",
		},
		"Structured Content": {
			bg: "var(--ax-colors-bg-information-subtle)",
			color: "var(--ax-colors-fg-information-strong)",
		},
		"Article": {
			bg: "var(--ax-colors-bg-information-subtle)",
			color: "var(--ax-colors-fg-information-strong)",
		},
		"TIFF": {
			bg: "var(--ax-colors-bg-success-subtle)",
			color: "var(--ax-colors-fg-success)",
		},
	};

	return styles[label] || styles["File"];
}

function LabelBadge({ label }: { label: AssetLabel }) {
	const style = getBadgeStyle(label);

	return (
		<Box
			alignItems="center"
			display="inline-flex"
			justifyContent="center"
			rounded="full"
			style={{
				background: style.bg,
				color: style.color,
				height: 20,
				padding: "0 10px",
				width: "fit-content",
			}}
		>
			<Text fontSize="xs" fontWeight="500" style={{ color: style.color }}>
				{label}
			</Text>
		</Box>
	);
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
		{ label: "Create Task" },
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
								disabled={"disabled" in item ? item.disabled : false}
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
}: {
	onClose: () => void;
	onGenerateImage: () => void;
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
				top: 52,
				width: 320,
				zIndex: 80,
			}}
		>
			<Box display="flex" flexDirection="column" p="8">
				{menuItems.map((item, index) =>
					item.divider ? (
						<Box key={index} borderT="1" borderColor="border.tertiary" my="8" />
					) : (
						<button
							key={item.label}
							type="button"
							style={{
								alignItems: "center",
								background: item.highlighted ? "var(--ax-colors-bg-secondary)" : "transparent",
								border: 0,
								borderRadius: 12,
								color: "var(--ax-colors-fg-default)",
								cursor: "pointer",
								display: "flex",
								fontSize: 18,
								fontWeight: 400,
								gap: 16,
								height: 56,
								padding: "0 16px",
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

function AssetCard({ item }: { item: LibraryItem }) {
	const [isHovered, setIsHovered] = useState(false);
	const [isSelected, setIsSelected] = useState(false);
	const [showMenu, setShowMenu] = useState(false);
	const hasImage = item.type === "image" && item.image;
	const hasIcon = item.type === "file" || item.type === "document" || item.type === "structured";
	const isFolder = item.type === "folder";

	return (
		<Box
			style={{
				position: "relative",
			}}
		>
			<Box
				bg="bg.default"
				border="1"
				borderColor="border.tertiary"
				display="flex"
				flexDirection="column"
				overflow="hidden"
				rounded="xl"
				style={{
					cursor: "pointer",
					transition: "border-color 0.2s",
				}}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				<Box
					style={{
						aspectRatio: hasImage ? "1.56 / 1" : isFolder ? "1.56 / 1" : "1.56 / 1",
						overflow: "hidden",
						position: "relative",
					}}
				>
				{hasImage ? (
					<img
						alt={item.title}
						src={item.image}
						style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }}
					/>
				) : hasIcon ? (
					<Box
						alignItems="center"
						display="flex"
						justifyContent="center"
						style={{
							background: item.bgColor || "#7B61FF",
							height: "100%",
							width: "100%",
						}}
					>
						<IconFile color="white" size={48} strokeWidth={1.5} />
					</Box>
				) : isFolder ? (
					<Box
						alignItems="center"
						display="flex"
						justifyContent="center"
						style={{
							background: "var(--ax-colors-bg-secondary)",
							height: "100%",
							width: "100%",
						}}
					>
						<IconFolder color="var(--ax-colors-fg-tertiary)" size={48} strokeWidth={1.5} />
					</Box>
				) : null}

				{/* Checkbox */}
				{isHovered && (
					<Box
						alignItems="center"
						bg={isSelected ? "bg.accent" : "bg.default"}
						border="1"
						borderColor={isSelected ? "border.accent" : "border.secondary"}
						display="flex"
						justifyContent="center"
						rounded="sm"
						style={{
							height: 16,
							left: 12,
							position: "absolute",
							top: 12,
							width: 16,
							cursor: "pointer",
						}}
						onClick={(e) => {
							e.stopPropagation();
							setIsSelected(!isSelected);
						}}
					>
						{isSelected && <IconCheck color="white" size={12} />}
					</Box>
				)}

				{/* Ellipsis Menu Button */}
				{isHovered && (
					<Box style={{ position: "absolute", right: 12, top: 12 }}>
						<AxiomButton
							appearance="default"
							size="sm"
							onClick={(e) => {
								e.stopPropagation();
								setShowMenu(!showMenu);
							}}
							style={{
								background: "rgba(255, 255, 255, 0.96)",
								borderColor: "var(--ax-colors-border-tertiary)",
								boxShadow: "var(--ax-boxShadow-sm)",
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
			</Box>
				<Box display="flex" flexDirection="column" gap="8" px="16" py="12">
					<LabelBadge label={item.label} />
					<Box display="flex" flexDirection="column" gap="4">
						<Text
							fontSize="sm"
							fontWeight="500"
							style={{
								lineHeight: "20px",
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
							}}
						>
							{item.title}
						</Text>
						{item.expired ? (
							<Text color="fg.error" fontSize="xs" fontWeight="500">
								Expired
							</Text>
						) : null}
					</Box>
				</Box>
			</Box>

			{/* Context Menu */}
			{showMenu && <ContextMenu type={isFolder ? "folder" : "asset"} onClose={() => setShowMenu(false)} />}
		</Box>
	);
}

export default function CMPLibraryPage() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<LibraryTab>("assets");
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [showAddMenu, setShowAddMenu] = useState(false);

	const filteredItems = useMemo(() => {
		if (!searchQuery.trim()) {
			return libraryItems;
		}

		return libraryItems.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
	}, [searchQuery]);

	return (
		<Box
			bg="bg.default"
			display="flex"
			flexDirection="column"
			style={{
				marginLeft: -32,
				marginRight: -32,
				minHeight: "calc(100vh - 184px)",
			}}
		>
			<Box display="flex" flex="1" flexDirection="column" style={{ minHeight: 0 }}>
				<Box borderB="1" borderColor="border.tertiary" px="32" pt="20">
					<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LibraryTab)}>
						<TabsList>
							{tabs.map((tab) => (
								<TabsTrigger key={tab.value} value={tab.value}>
									{tab.label}
								</TabsTrigger>
							))}
						</TabsList>

						<TabsContent value="assets">
							<Box alignItems="center" display="flex" gap="8" pb="20" pt="20">
								<AxiomButton appearance="default" size="lg" icon={<IconAdjustmentsHorizontal />} />
								<Box style={{ width: 264 }}>
									<SearchInput
										placeholder="Search..."
										size="lg"
										value={searchQuery}
										onChange={(event) => setSearchQuery(event.target.value)}
									/>
								</Box>
								<AxiomButton appearance="default" size="lg" icon={<IconCopy />} />
								<AxiomButton appearance="default" size="lg" icon={<IconPhoto />} iconPosition="start">
									<IconChevronDown size={16} />
								</AxiomButton>
								<AxiomButton appearance="subtle" size="lg" iconPosition="end" icon={<IconChevronDown />}>
									Last Modified
								</AxiomButton>
								<AxiomButton appearance="subtle" size="lg" icon={<IconArrowUp />} />
								<Box flex="1" />
									<AxiomButton appearance="default" size="lg">Save View</AxiomButton>
									<Box style={{ position: "relative" }}>
										<AxiomButton
											appearance="primary"
											size="lg"
											iconPosition="end"
											icon={<IconChevronDown />}
											onClick={() => setShowAddMenu((current) => !current)}
										>
											Add
										</AxiomButton>
										{showAddMenu ? (
											<AddMenu
												onClose={() => setShowAddMenu(false)}
												onGenerateImage={() => {
													router.push("/cmp/opal-studio?flow=create&asset=image&entry=library-add");
												}}
											/>
										) : null}
									</Box>
								</Box>
							</TabsContent>

						{tabs
							.filter((tab) => tab.value !== "assets")
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
					<Box
						display="grid"
						gap="16"
						style={{
							gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
						}}
					>
						{filteredItems.map((item) => (
							<AssetCard key={item.id} item={item} />
						))}
					</Box>
				</Box>

				<Box
					alignItems="center"
					bg="bg.default"
					borderT="1"
					borderColor="border.tertiary"
					display="flex"
					justifyContent="space-between"
					px="32"
					py="12"
				>
					<Box alignItems="center" display="flex" gap="8">
						<Text fontSize="sm">Page Size</Text>
						<AxiomButton appearance="subtle" size="sm">
							20
							<IconChevronDown size={14} />
						</AxiomButton>
					</Box>
					<Pagination page={currentPage} total={58} onPageChange={setCurrentPage} />
					<Box style={{ width: 120 }} />
				</Box>
			</Box>
		</Box>
	);
}
