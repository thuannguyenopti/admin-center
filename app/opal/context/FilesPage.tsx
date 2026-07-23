"use client";

import {useState, useCallback, useRef, useEffect, useMemo} from "react";
import {
	Box,
	Text,
	Button,
	Badge,
	SearchInput,
	Progress,
	Tooltip,
	ToggleButton,
	Menu,
	MenuTrigger,
	MenuContent,
	LabelMenuButton,
	Checkbox,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogBody,
	DialogFooter,
	DialogClose,
	Tabs,
	TabsList,
	TabsTrigger,
} from "@optiaxiom/react";
import {
	IconAngleDown,
	IconFile,
	IconFolder,
	IconArrowsMaximize,
	IconArrowsMinimize,
	IconPen,
	IconCode,
	IconEye,
	IconClockRotateLeft,
	IconUserPlus,
	IconEllipsisSolid,
	IconTrashCan,
	IconFileArrowUp,
	IconDownload,
	IconFolderArrowDown,
	IconPlus,
	IconUpload,
	IconPaintRoller,
	IconAgent,
} from "@optiaxiom/icons";
import {useRouter, useSearchParams} from "next/navigation";
import {FileUpload, FileUploadDropzone} from "@optiaxiom/react/unstable";
import {CollaborativeEditorPanel} from "@/app/components/Opal/CollaborativeEditorPanel";
import {OpalShareDialog} from "@/app/components/Opal/CodeCanvasPanel";
import {VersionHistory} from "@/app/opal/agents/setup/components/VersionHistory";
import {BrandPacksOverview} from "@/app/opal/brand-packs/components/BrandPacksOverview";
import EmptyList from "@/app/components/EmptyList";

import {
	type FileNode,
	INITIAL_FILE_TREE,
	findFileById,
	getAllFileIds,
	hasAnyFiles,
	removeEmptyFolders,
} from "./data/fileTree";
import {VERSIONS} from "./data/versionHistory";
import {FILE_CONTENT} from "./data/fileContent";
import {
	STRIDE_SB_BASE,
	DS_COMPONENT_LIST,
	DS_GUIDELINES_MD,
	type DSComponent,
} from "./data/designSystem";

import {FileTree} from "./components/FileTree";
import {MarkdownSourceView} from "./components/MarkdownSourceView";
import {TiptapPreview} from "./components/TiptapPreview";
import {PdfPreview} from "./components/PdfPreview";
import {PdfEditView} from "./components/PdfEditView";
import {ImagePreview} from "./components/ImagePreview";
import {SpreadsheetPreview} from "./components/SpreadsheetPreview";
import {CsvPreview} from "./components/CsvPreview";
import {WordPreview} from "./components/WordPreview";
import {DSFileTree} from "./components/ds/DSFileTree";
import {DSTokensPanel} from "./components/ds/DSTokensPanel";
import {DSOverviewPanel} from "./components/ds/DSOverviewPanel";
import {DSComponentPanel} from "./components/ds/DSComponentPanel";

export function FilesPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [treeData, setTreeData] = useState<FileNode[]>(INITIAL_FILE_TREE);
	const [selectedFileId, setSelectedFileId] = useState("1-1");
	const [activeContextTab, setActiveContextTab] = useState<
		"skills" | "files" | "design-system" | "memory" | "rag"
	>("files");
	const [dsSelectedId, setDsSelectedId] = useState("ds-overview");
	const [dsComponentsExpanded, setDsComponentsExpanded] = useState(true);
	const [dsRegistryJson, setDsRegistryJson] = useState<string | null>(null);
	const [dsHydrated, setDsHydrated] = useState(false);
	useEffect(() => {
		try {
			const stored = localStorage.getItem("opal:artifacts:generated");
			if (stored) {
				const artifacts = JSON.parse(stored) as Array<{id: string; previewText?: string}>;
				const reg = artifacts.find((a) => a.id === "stride-cms-registry-artifact");
				if (reg?.previewText) setDsRegistryJson(reg.previewText);
			}
		} catch {}
		setDsHydrated(true);
	}, []);
	const dsComponentList = useMemo((): DSComponent[] => {
		if (!dsRegistryJson) return DS_COMPONENT_LIST;
		try {
			const parsed = JSON.parse(dsRegistryJson) as {
				registry?: Record<string, {"storybook url"?: string}>;
			};
			if (!parsed.registry) return DS_COMPONENT_LIST;
			return Object.entries(parsed.registry).map(([name, entry]) => {
				const fullUrl = entry["storybook url"] ?? "";
				const story = fullUrl.startsWith(STRIDE_SB_BASE)
					? fullUrl.slice(STRIDE_SB_BASE.length)
					: fullUrl;
				return {
					id: `ds-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
					label: name,
					story,
					status: "done" as const,
				};
			});
		} catch {
			return DS_COMPONENT_LIST;
		}
	}, [dsRegistryJson]);
	const activeTab = searchParams.get("tab") === "brand" ? "brand" : activeContextTab;
	const isBrandTab = activeTab === "brand";
	const [isEditing, setIsEditing] = useState(false);
	const [editorMode, setEditorMode] = useState<"source" | "preview">("preview");
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [viewingVersionId, setViewingVersionId] = useState<string | null>(null);
	const [shareOpen, setShareOpen] = useState(false);
	const [isMaximized, setIsMaximized] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);
	const contentPaneRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const el = contentPaneRef.current;
		if (!el) return;
		const onScroll = (e: Event) => {
			setIsScrolled((e.target as Element).scrollTop > 20);
		};
		el.addEventListener("scroll", onScroll, true);
		return () => el.removeEventListener("scroll", onScroll, true);
	}, []);
	const [isDragOver, setIsDragOver] = useState(false);
	const [dragCounter, setDragCounter] = useState(0);
	const [bulkMode, setBulkMode] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
	const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
	const pendingEditRef = useRef(false);

	const initialExpandedSet = new Set(treeData.map((n) => n.id));
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(initialExpandedSet);

	const handleToggleFile = (id: string) => {
		setSelectedFiles((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const handleToggleFolderSelect = (childIds: string[]) => {
		setSelectedFiles((prev) => {
			const next = new Set(prev);
			const allSelected = childIds.every((id) => next.has(id));
			if (allSelected) childIds.forEach((id) => next.delete(id));
			else childIds.forEach((id) => next.add(id));
			return next;
		});
	};

	const handleEditFile = (id: string) => {
		pendingEditRef.current = true;
		setSelectedFileId(id);
		setIsEditing(true);
		setTimeout(() => {
			pendingEditRef.current = false;
		}, 150);
	};

	const handleMoveToFolder = useCallback((fileId: string, targetFolderId: string) => {
		setTreeData((prev) => {
			// Find the file node
			let moved: FileNode | null = null;
			const removeFrom = (nodes: FileNode[]): FileNode[] =>
				nodes.map((n) => {
					if (n.children) {
						const idx = n.children.findIndex((c) => c.id === fileId);
						if (idx !== -1) {
							moved = n.children[idx];
							return {...n, children: n.children.filter((c) => c.id !== fileId)};
						}
						return {...n, children: removeFrom(n.children)};
					}
					return n;
				});
			const withoutFile = removeFrom(prev);
			if (!moved) return prev;
			const file = moved;
			const addTo = (nodes: FileNode[]): FileNode[] =>
				nodes.map((n) => {
					if (n.id === targetFolderId && n.type === "folder") {
						return {...n, children: [...(n.children ?? []), file]};
					}
					if (n.children) return {...n, children: addTo(n.children)};
					return n;
				});
			return addTo(withoutFile);
		});
	}, []);

	const handleConfirmDelete = useCallback(() => {
		if (!deletingFileId) return;
		setTreeData((prev) => {
			const remove = (nodes: FileNode[]): FileNode[] =>
				nodes
					.filter((n) => n.id !== deletingFileId)
					.map((n) => (n.children ? {...n, children: remove(n.children)} : n));
			const next = removeEmptyFolders(remove(prev));
			if (!hasAnyFiles(next)) setSelectedFileId("");
			else if (selectedFileId === deletingFileId) setSelectedFileId("");
			return next;
		});
		setIsEditing(false);
		setDeletingFileId(null);
	}, [deletingFileId, selectedFileId]);

	const handleBulkDelete = useCallback(() => {
		if (selectedFiles.size === 0) return;
		const ids = selectedFiles;
		setTreeData((prev) => {
			const remove = (nodes: FileNode[]): FileNode[] =>
				nodes
					.filter((n) => !ids.has(n.id))
					.map((n) => (n.children ? {...n, children: remove(n.children)} : n));
			const next = removeEmptyFolders(remove(prev));
			if (!hasAnyFiles(next) || ids.has(selectedFileId)) setSelectedFileId("");
			return next;
		});
		setSelectedFiles(new Set());
		setIsEditing(false);
		setBulkMode(false);
	}, [selectedFiles, selectedFileId]);

	const handleToggleFolder = (id: string) => {
		setExpandedFolders((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	// Only activate the upload overlay for external file drags (from OS), not internal tree drags
	const isExternalFileDrag = (e: React.DragEvent) => e.dataTransfer.types.includes("Files");

	const handleDragEnter = useCallback((e: React.DragEvent) => {
		if (!isExternalFileDrag(e)) return;
		e.preventDefault();
		setDragCounter((c) => c + 1);
		setIsDragOver(true);
	}, []);
	const handleDragLeave = useCallback((e: React.DragEvent) => {
		if (!isExternalFileDrag(e)) return;
		setDragCounter((c) => {
			const next = c - 1;
			if (next <= 0) setIsDragOver(false);
			return next;
		});
	}, []);
	const handleDragOver = useCallback((e: React.DragEvent) => {
		if (!isExternalFileDrag(e)) return;
		e.preventDefault();
	}, []);
	const handleDrop = useCallback((e: React.DragEvent) => {
		if (!isExternalFileDrag(e)) return;
		e.preventDefault();
		setIsDragOver(false);
		setDragCounter(0);
	}, []);

	const treeHasFiles = hasAnyFiles(treeData);
	const selectedFile = findFileById(treeData, selectedFileId);
	const selectedFilename = selectedFile?.label ?? "";
	const selectedExt = selectedFilename.split(".").pop() ?? "md";
	const selectedContentType = selectedFile?.contentType ?? "markdown";
	const selectedMarkdown = FILE_CONTENT[selectedFileId] ?? "";

	return (
		<Box px="32">
			{/* Collapsible header */}
			{/* Tabs */}
			<Tabs
				value={activeTab}
				onValueChange={(val: string) => {
					if (val === "brand") {
						router.push("/opal/context?tab=brand");
					} else {
						setActiveContextTab(val as typeof activeContextTab);
						router.push("/opal/context");
					}
				}}
			>
				<TabsList mb="16">
					<TabsTrigger value="skills">Skills</TabsTrigger>
					<TabsTrigger value="files">Files</TabsTrigger>
					<TabsTrigger value="design-system">Design System</TabsTrigger>
					<TabsTrigger value="brand">Brand</TabsTrigger>
					<TabsTrigger value="memory">Memory</TabsTrigger>
					<TabsTrigger value="rag">RAG</TabsTrigger>
				</TabsList>
			</Tabs>
			{/* Filter bar */}
			{!isBrandTab && dsRegistryJson && (
				<Box display="flex" gap="12" alignItems="center">
					<Box style={{flex: 1, maxWidth: 264}}>
						<SearchInput size="lg" placeholder="Search files..." />
					</Box>
					<Menu
						options={[
							{label: "All"},
							...[
								{label: "Documents", sub: "PDF, Word, Markdown, HTML"},
								{label: "Spreadsheets", sub: "CSV, Excel"},
								{label: "Media", sub: "PNG, JPEG, GIF, WebP, SVG"},
								{label: "Code", sub: "JS, TS, HTML, CSS"},
							].map(({label, sub}) => ({
								label,
								description: sub,
								group: {label: "types", hidden: true, separator: true},
							})),
						]}
					>
						<MenuTrigger asChild>
							<LabelMenuButton label="File Type">All</LabelMenuButton>
						</MenuTrigger>
						<MenuContent />
					</Menu>
					<Menu
						options={["Jamie Chen (You)", "Organization"].map((o) => ({label: o}))}
					>
						<MenuTrigger asChild>
							<LabelMenuButton label="Owner">Jamie Chen (You)</LabelMenuButton>
						</MenuTrigger>
						<MenuContent />
					</Menu>
					<Box style={{flex: 1}} />
					{activeTab === "design-system" ? (
						<Button
							appearance="primary"
							size="lg"
							icon={<IconAgent />}
							onClick={() => router.push("/opal/context/stride-ds-setup")}
						>
							Edit with Opal
						</Button>
					) : (
						<Menu
							options={[
								{
									label: "Upload Files",
									addon: <IconUpload size={14} />,
								},
								{
									label: "New File",
									addon: <IconFile size={14} />,
									group: {label: "new", hidden: true, separator: true},
								},
								{
									label: "New Folder",
									addon: <IconFolder size={14} />,
									group: {label: "new", hidden: true, separator: true},
								},
							]}
						>
							<MenuTrigger asChild>
								<Button
									appearance="primary"
									size="lg"
									icon={<IconPlus />}
									addonAfter={<IconAngleDown size={20} />}
								>
									Add
								</Button>
							</MenuTrigger>
							<MenuContent align="end" />
						</Menu>
					)}
				</Box>
			)}
			{/* Content body */}
			{isBrandTab ? (
				<Box style={{flex: 1, minHeight: 0, marginLeft: -32, marginRight: -32}}>
					<BrandPacksOverview embedded />
				</Box>
			) : activeTab === "design-system" ? (
				<Box
					pt="16"
					style={{flex: 1, minHeight: 0, display: "flex", flexDirection: "column"}}
				>
					{dsHydrated && !dsRegistryJson ? (
						<Box py="0">
							<EmptyList
								image="/images/toast.png"
								heading="No design system connected"
								body="Run the Stride DS setup to scan your Storybook, extract design tokens, and build a component registry."
							>
								<Button
									appearance="primary"
									size="lg"
									icon={<IconPaintRoller />}
									onClick={() => router.push("/opal/context/stride-ds-setup?autostart=1")}
								>
									Set up Design System
								</Button>
							</EmptyList>
						</Box>
					) : (
						<Box
							display="flex"
							flexDirection="row"
							gap="12"
							style={{flex: 1, minHeight: 0}}
						>
							{/* DS tree panel */}
							<Box
								display="flex"
								flexDirection="column"
								bg="bg.default"
								rounded="lg"
								border="1"
								borderColor="border.secondary"
								style={{width: 264, flexShrink: 0, overflow: "hidden"}}
							>
								<Box
									display="flex"
									alignItems="center"
									py="10"
									pl="12"
									pr="8"
									gap="8"
									borderB="1"
									borderColor="border.secondary"
								>
									<Text fontWeight="500">Design System</Text>
								</Box>
								<Box
									display="flex"
									flexDirection="column"
									p="8"
									style={{flex: 1, overflowY: "auto"}}
								>
									<DSFileTree
										selectedId={dsSelectedId}
										onSelect={setDsSelectedId}
										componentsExpanded={dsComponentsExpanded}
										onToggleComponents={() =>
											setDsComponentsExpanded((v) => !v)
										}
										componentList={dsComponentList}
									/>
								</Box>
							</Box>

							{/* DS content panel */}
							<Box
								display="flex"
								flexDirection="column"
								bg="bg.default"
								rounded="lg"
								border="1"
								borderColor="border.secondary"
								style={{flex: 1, minWidth: 0, overflow: "hidden"}}
							>
								{/* Content header */}
								<Box
									display="flex"
									alignItems="center"
									pl="20"
									pr="12"
									py="8"
									borderB="1"
									borderColor="border.secondary"
									style={{flexShrink: 0}}
								>
									{dsSelectedId === "ds-overview" ? (
										<Text fontWeight="500">Overview</Text>
									) : dsSelectedId === "ds-tokens" ? (
										<Box display="flex" alignItems="center" gap="8">
											<Badge intent="neutral">JSON</Badge>
											<Text fontWeight="500">Design Tokens</Text>
										</Box>
									) : dsSelectedId === "ds-guidelines" ? (
										<Box display="flex" alignItems="center" gap="8">
											<Badge intent="neutral">MD</Badge>
											<Text fontWeight="500">Design System Guidelines</Text>
										</Box>
									) : (
										(() => {
											const comp = dsComponentList.find(
												(c) => c.id === dsSelectedId
											);
											return comp ? (
												<Box display="flex" alignItems="center" gap="8">
													<Badge>MD</Badge>
													<Text
														fontWeight="500"
														fontSize="md"
														color="fg.default"
													>
														{comp.label}
													</Text>
												</Box>
											) : null;
										})()
									)}
								</Box>
								{/* Content body */}
								<Box style={{flex: 1, minHeight: 0, overflow: "hidden"}}>
									{dsSelectedId === "ds-overview" ? (
										<DSOverviewPanel componentList={dsComponentList} />
									) : dsSelectedId === "ds-tokens" ? (
										<DSTokensPanel />
									) : dsSelectedId === "ds-guidelines" ? (
										<TiptapPreview
											key="ds-guidelines"
											markdown={DS_GUIDELINES_MD}
											fileId="ds-guidelines"
										/>
									) : (
										(() => {
											const comp = dsComponentList.find(
												(c) => c.id === dsSelectedId
											);
											return comp ? (
												<DSComponentPanel key={comp.id} component={comp} />
											) : null;
										})()
									)}
								</Box>
							</Box>
						</Box>
					)}
				</Box>
			) : (
				<Box
					pt="16"
					pb="16"
					style={{flex: 1, minHeight: 0, display: "flex", flexDirection: "column"}}
				>
					<Box
						display="flex"
						flexDirection="row"
						gap="12"
						style={{flex: 1, minHeight: 0}}
					>
						{/* Left file tree panel */}
						<Box
							display={isMaximized ? "none" : "flex"}
							flexDirection="column"
							bg="bg.default"
							rounded="lg"
							border="1"
							borderColor={isDragOver ? "border.default" : "border.secondary"}
							onDragEnter={handleDragEnter}
							onDragLeave={handleDragLeave}
							onDragOver={handleDragOver}
							onDrop={handleDrop}
							style={{
								width: 264,
								flexShrink: 0,
								overflow: "hidden",
								position: "relative",
								transition: "border-color 0.15s",
							}}
						>
							{/* Tree header */}
							<Box
								display="flex"
								alignItems="center"
								py="10"
								pl="12"
								pr="8"
								gap="8"
								borderB="1"
								borderColor="border.secondary"
							>
								<Text
									fontWeight="500"
									fontSize="md"
									color="fg.default"
									style={{flex: 1}}
								>
									Files
								</Text>
								{bulkMode && selectedFiles.size > 0 && (
									<>
										<Text
											fontSize="xs"
											color="fg.tertiary"
											style={{flexShrink: 0}}
										>
											{selectedFiles.size} selected
										</Text>
										<Tooltip delayDuration={300} content="Move to folder">
											<span>
												<Button
													appearance="subtle"
													size="sm"
													icon={<IconFolderArrowDown size={16} />}
													aria-label="Move"
												/>
											</span>
										</Tooltip>
										<Tooltip delayDuration={300} content="Download">
											<span>
												<Button
													appearance="subtle"
													size="sm"
													icon={<IconDownload size={16} />}
													aria-label="Download"
												/>
											</span>
										</Tooltip>
										<Tooltip delayDuration={300} content="Delete">
											<span>
												<Button
													appearance="subtle"
													size="sm"
													icon={<IconTrashCan size={16} />}
													aria-label="Delete"
													style={{
														color: "var(--ax-colors-fg-danger)",
													}}
													onClick={handleBulkDelete}
												/>
											</span>
										</Tooltip>
									</>
								)}
								<Button
									appearance="subtle"
									size="sm"
									onClick={() => {
										setBulkMode((v) => !v);
										setSelectedFiles(new Set());
									}}
									style={
										bulkMode
											? {background: "var(--ax-colors-bg-secondary)"}
											: undefined
									}
								>
									{bulkMode ? "Done" : "Select"}
								</Button>
							</Box>
							{/* Tree body */}
							<Box
								display="flex"
								flexDirection="column"
								p="8"
								gap="4"
								style={{flex: 1, overflowY: "auto"}}
							>
								{bulkMode &&
									(() => {
										const allIds = getAllFileIds(treeData);
										const allSelected =
											allIds.length > 0 &&
											allIds.every((id) => selectedFiles.has(id));
										return (
											<Box
												display="flex"
												alignItems="center"
												px="4"
												py="2"
												borderB="1"
												borderColor="border.secondary"
												style={{marginBottom: 4}}
											>
												<Button
													appearance="subtle"
													size="sm"
													onClick={() => {
														if (allSelected)
															setSelectedFiles(new Set());
														else setSelectedFiles(new Set(allIds));
													}}
												>
													{allSelected
														? "Deselect all"
														: "Select all"}{" "}
												</Button>
											</Box>
										);
									})()}
								{!treeHasFiles && (
									<Box
										display="flex"
										alignItems="center"
										justifyContent="center"
										style={{flex: 1, paddingTop: 32}}
									>
										<Text fontSize="sm" color="fg.tertiary">
											No files found
										</Text>
									</Box>
								)}
								<FileTree
									tree={treeData}
									selectedId={selectedFileId}
									onSelect={(id) => {
										setSelectedFileId(id);
										if (!pendingEditRef.current) setIsEditing(false);
									}}
									expandedFolders={expandedFolders}
									onToggleFolder={handleToggleFolder}
									bulkMode={bulkMode}
									selectedFiles={selectedFiles}
									onToggleFile={handleToggleFile}
									onToggleFolderSelect={handleToggleFolderSelect}
									onEditFile={handleEditFile}
									onDropToFolder={handleMoveToFolder}
									onDeleteFile={(id) => setDeletingFileId(id)}
								/>
							</Box>
							{/* Drop zone */}
							<Box px="8" pb="8" style={{flexShrink: 0}}>
								<Box
									display="flex"
									alignItems="center"
									justifyContent="center"
									gap="6"
									py="6"
									rounded="md"
									style={{
										border: "1.5px dashed var(--ax-colors-border-secondary)",
									}}
								>
									<IconFileArrowUp
										size={16}
										color="var(--ax-colors-fg-tertiary)"
									/>
									<Text fontSize="sm" color="fg.tertiary">
										Drop files here to upload
									</Text>
								</Box>
							</Box>
							{/* Drag overlay */}
							{isDragOver && (
								<Box
									display="flex"
									flexDirection="column"
									alignItems="center"
									justifyContent="center"
									gap="8"
									rounded="lg"
									style={{
										position: "absolute",
										inset: 0,
										zIndex: 10,
										border: "2px dashed var(--ax-colors-border-default)",
										pointerEvents: "none",
										background: "var(--ax-colors-bg-default-pressed)",
									}}
								>
									<IconFileArrowUp
										size={24}
										color="var(--ax-colors-fg-default)"
									/>
									<Text fontSize="sm" fontWeight="500" color="fg.default">
										Drop files to upload
									</Text>
								</Box>
							)}
							{/* Storage footer */}
							<Box
								display="flex"
								flexDirection="column"
								gap="6"
								px="12"
								py="10"
								borderT="1"
								borderColor="border.secondary"
								style={{flexShrink: 0}}
							>
								<Box
									display="flex"
									justifyContent="space-between"
									alignItems="center"
								>
									<Badge
										intent="neutral"
										style={{fontSize: 10, padding: "1px 6px"}}
									>
										Essential
									</Badge>
									<Text fontSize="xs" color="fg.tertiary">
										{treeHasFiles ? "2.4 MB" : "0 MB"} / 2 GB
									</Text>
								</Box>
								<Progress value={treeHasFiles ? 2.4 : 0} max={2048} />
							</Box>
						</Box>

						{/* Right preview/edit area */}
						<Box
							display="flex"
							flexDirection="column"
							bg="bg.default"
							rounded={isMaximized ? undefined : "lg"}
							border="1"
							borderColor="border.secondary"
							style={
								isMaximized
									? {
											position: "fixed",
											top: 0,
											left: 0,
											right: 0,
											bottom: 0,
											zIndex: 100,
											overflow: "hidden",
										}
									: {flex: 1, minWidth: 0, overflow: "hidden"}
							}
						>
							{!treeHasFiles ? (
								<Box
									display="flex"
									alignItems="center"
									justifyContent="center"
									style={{height: "100%", padding: "40px"}}
								>
									<FileUpload w="384" onFilesDrop={() => {}}>
										<FileUploadDropzone description="PDF, Word, Markdown, CSV, images and more" />
									</FileUpload>
								</Box>
							) : (
								<>
									{/* Panel header */}
									<Box
										display="flex"
										flexDirection="row"
										alignItems="center"
										justifyContent="space-between"
										pl="20"
										pr="12"
										py="8"
										borderB="1"
										borderColor="border.secondary"
										style={{flexShrink: 0}}
									>
										<Box display="flex" alignItems="center" gap="8">
											<Badge intent="neutral">
												{selectedExt.toUpperCase()}
											</Badge>
											<Text fontWeight="500" fontSize="md" color="fg.default">
												{selectedFilename.replace(/\.[^.]+$/, "")}
											</Text>
											<Badge intent={isEditing ? "neutral" : "success"}>
												{isEditing ? "Editing" : "Saved"}
											</Badge>
											{selectedContentType === "markdown" && (
												<>
													<Box
														style={{
															width: 1,
															height: 16,
															background:
																"var(--ax-colors-border-secondary)",
															flexShrink: 0,
															margin: "0 4px",
														}}
													/>
													<Box display="flex" alignItems="center" gap="4">
														<Tooltip
															content="Source"
															delayDuration={400}
														>
															<span>
																<ToggleButton
																	size="md"
																	appearance="subtle"
																	pressed={
																		editorMode === "source"
																	}
																	onPressedChange={() =>
																		setEditorMode("source")
																	}
																	icon={<IconCode size={16} />}
																	aria-label="Source"
																/>
															</span>
														</Tooltip>
														<Tooltip
															content="Preview"
															delayDuration={400}
														>
															<span>
																<ToggleButton
																	size="md"
																	appearance="subtle"
																	pressed={
																		editorMode === "preview"
																	}
																	onPressedChange={() =>
																		setEditorMode("preview")
																	}
																	icon={<IconEye size={16} />}
																	aria-label="Preview"
																/>
															</span>
														</Tooltip>
													</Box>
												</>
											)}
										</Box>

										<Box display="flex" alignItems="center" gap="8">
											{isEditing ? (
												<>
													<Button
														appearance="subtle"
														size="sm"
														onClick={() => setIsEditing(false)}
													>
														Cancel
													</Button>
													<Button
														appearance="primary"
														size="sm"
														onClick={() => setIsEditing(false)}
													>
														Save
													</Button>
												</>
											) : (
												selectedContentType !== "image" && (
													<Tooltip delayDuration={300} content="Edit">
														<span>
															<Button
																appearance="subtle"
																size="sm"
																icon={<IconPen size={14} />}
																aria-label="Edit"
																onClick={() => setIsEditing(true)}
															/>
														</span>
													</Tooltip>
												)
											)}
											{selectedContentType === "image" && (
												<Tooltip delayDuration={300} content="Download">
													<span>
														<Button
															appearance="subtle"
															size="sm"
															icon={<IconDownload size={14} />}
															aria-label="Download"
														/>
													</span>
												</Tooltip>
											)}
											<Tooltip
												delayDuration={300}
												content={isMaximized ? "Restore" : "Expand"}
											>
												<span>
													<Button
														appearance="subtle"
														size="sm"
														icon={
															isMaximized ? (
																<IconArrowsMinimize size={14} />
															) : (
																<IconArrowsMaximize size={14} />
															)
														}
														aria-label={
															isMaximized ? "Restore" : "Expand"
														}
														onClick={() => setIsMaximized((v) => !v)}
														style={
															isMaximized
																? {
																		background:
																			"var(--ax-colors-bg-secondary)",
																	}
																: undefined
														}
													/>
												</span>
											</Tooltip>
											<Menu
												options={[
													{
														label: "Rename",
														addon: <IconPen size={16} />,
													},
													...(selectedContentType !== "image"
														? [
																{
																	label: "Edit",
																	addon: <IconFile size={16} />,
																	execute: () =>
																		setIsEditing(true),
																},
															]
														: []),
													{
														label: "Share",
														addon: <IconUserPlus size={16} />,
														execute: () => setShareOpen(true),
													},
													{
														label: "Download",
														addon: <IconDownload size={16} />,
													},
													{
														label: "Version history",
														addon: <IconClockRotateLeft size={16} />,
														execute: () => setDetailsOpen(true),
														group: {
															label: "history",
															hidden: true,
															separator: true,
														},
													},
													{
														label: "Delete",
														addon: <IconTrashCan size={16} />,
														intent: "danger",
														execute: () =>
															setDeletingFileId(selectedFileId),
														group: {
															label: "danger",
															hidden: true,
															separator: true,
														},
													},
												]}
											>
												<MenuTrigger asChild>
													<Button
														appearance="subtle"
														size="sm"
														icon={<IconEllipsisSolid size={16} />}
														aria-label="More"
													/>
												</MenuTrigger>
												<MenuContent align="end" />
											</Menu>
										</Box>
									</Box>

									{/* Content + VersionHistory row */}
									<Box
										display="flex"
										flexDirection="row"
										style={{flex: 1, minHeight: 0, overflow: "hidden"}}
									>
										<Box
											ref={contentPaneRef}
											style={{
												flex: 1,
												minWidth: 0,
												overflow: "hidden",
												height: "100%",
											}}
										>
											{selectedContentType === "pdf" ? (
												isEditing ? (
													<PdfEditView key={selectedFileId} />
												) : (
													<PdfPreview key={selectedFileId} />
												)
											) : selectedContentType === "image" ? (
												<ImagePreview key={selectedFileId} />
											) : selectedContentType === "spreadsheet" ? (
												<SpreadsheetPreview key={selectedFileId} />
											) : selectedContentType === "csv" ? (
												<CsvPreview key={selectedFileId} />
											) : selectedContentType === "word" ? (
												<WordPreview key={selectedFileId} />
											) : editorMode === "source" ? (
												<MarkdownSourceView
													key={selectedFileId}
													markdown={selectedMarkdown}
												/>
											) : isEditing ? (
												<CollaborativeEditorPanel
													key={selectedFileId}
													open={true}
													onClose={() => setIsEditing(false)}
													filename={selectedFilename}
													fileType="markdown"
													fluid={true}
													initialMarkdown={selectedMarkdown}
												/>
											) : (
												<TiptapPreview
													key={selectedFileId}
													markdown={selectedMarkdown}
													fileId={selectedFileId}
												/>
											)}
										</Box>

										<VersionHistory
											isOpen={detailsOpen}
											onClose={() => setDetailsOpen(false)}
											versions={VERSIONS}
											viewingVersionId={viewingVersionId}
											onViewVersion={(id) => setViewingVersionId(id)}
											onRestoreVersion={() => setViewingVersionId(null)}
											onDuplicateVersion={() => {}}
											onHideVersion={() => {}}
											onNameVersion={() => {}}
											onCompareVersion={() => {}}
											onExitVersionView={() => setViewingVersionId(null)}
										/>
									</Box>
								</>
							)}
						</Box>
					</Box>
				</Box>
			)}

			{/* Share dialog */}
			<OpalShareDialog
				open={shareOpen}
				onOpenChange={setShareOpen}
				artifactTitle={selectedFilename.replace(/\.[^.]+$/, "")}
			/>

			{/* Delete confirmation dialog */}
			<Dialog
				open={!!deletingFileId}
				onOpenChange={(open) => {
					if (!open) setDeletingFileId(null);
				}}
			>
				<DialogContent>
					<DialogHeader>Delete file?</DialogHeader>
					<DialogBody>
						<Text color="fg.secondary">
							{(() => {
								const f = deletingFileId
									? findFileById(treeData, deletingFileId)
									: null;
								return f
									? `"${f.label.replace(/\.[^.]+$/, "")}" will be permanently deleted and cannot be recovered.`
									: "This file will be permanently deleted and cannot be recovered.";
							})()}
						</Text>
					</DialogBody>
					<DialogFooter>
						<DialogClose asChild>
							<Button appearance="subtle">Cancel</Button>
						</DialogClose>
						<Button appearance="danger" onClick={handleConfirmDelete}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
