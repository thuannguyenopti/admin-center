"use client";

import {
	useDeferredValue,
	useEffect,
	useMemo,
	useState,
	useCallback,
} from "react";
import { Box, toaster } from "@optiaxiom/react";
import { initialContentTypes, type ContentType, initialPages, type Page, initialApplications, type Application, initialCmpTasks } from "@/app/db/initialData";
import { initialContentInstances, type ContentInstance } from "@/app/db/cmpInitialData";
import { createPageFromInstance } from "@/app/lib/contentConnection";
import usePersistentState from "@/app/usePersistentState";
import { useRouter, useParams } from "next/navigation";
import TargetContentTypeDialog from "@/app/components/TargetContentTypeDialog";
import type { Outline } from "@/app/components/vb/PreviewCanvas";

import type { AssetItem, Scene, TaskTab } from "./types";
import { suggestedAssets, initialTaskAssets, searchAssets } from "./data/assets";
import { initialBriefHtml } from "./data/brief";
import { perspectiveSeeds, workflowTemplates } from "./data/workflow";
import { getSearchAssetMatch, getBriefAssetMatch } from "./utils/assetScoring";
import { getPlainTextFromHtml } from "./utils/html";
import { TaskCanvas } from "./components/TaskCanvas";
import { BriefPage } from "./components/BriefPage";
import { BriefEditPage } from "./components/BriefEditPage";
import { SearchPage } from "./components/SearchPage";
import { PreviewPage } from "./components/PreviewPage";
import { ContentEmptyPage } from "./components/ContentEmptyPage";
import { ContentFilledPage } from "./components/ContentFilledPage";
import { WorkflowSidebar } from "./components/WorkflowSidebar";
import { SuggestedAssetsPanel } from "./components/SuggestedAssetsPanel";
import { WorkflowChangeModal } from "./components/WorkflowChangeModal";

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
	const [pages, setPages] = usePersistentState("pages_v5", initialPages) as [Page[], any];
	const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
	const [isTargetSelectionOpen, setIsTargetSelectionOpen] = useState(false);
	const [instanceToAdd, setInstanceToAdd] = useState<ContentInstance | null>(null);

	// Preview state for PreviewCanvas
	const [previewCurrentEle, setPreviewCurrentEle] = useState<string>("");
	const [previewHoverEle, setPreviewHoverEle] = useState<string>("");
	const [previewOutlines, setPreviewOutlines] = useState<Outline[]>([]);

	const [contentTypes] = usePersistentState("contentTypes", initialContentTypes) as [ContentType[], any];
	const [applications] = usePersistentState("applications", initialApplications) as [Application[], any];

	// Get task ID from route params and derive task name from task data
	const params = useParams();
	const CURRENT_TASK_ID = (params?.id as string) ?? "1";
	const CURRENT_TASK_NAME = useMemo(() => {
		const task = initialCmpTasks.find(t => t.id === CURRENT_TASK_ID);
		return task?.title ?? "Unknown task";
	}, [CURRENT_TASK_ID]);

	const taskPages = useMemo(() => {
		return pages.filter(page =>
			page.cmpTaskMetadata?.taskId === CURRENT_TASK_ID
		);
	}, [pages]);

	// Add to Application handlers
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
	}, [contentTypes, createAndAddPage]);

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

	// Stable callback handlers for selections
	const handleSelectPage = useCallback((id: string | null) => {
		setSelectedPageId(id);
	}, []);

	const handleSelectContentInstance = useCallback((id: string | null) => {
		setSelectedContentInstanceId(id);
	}, []);

	const handleSelectArticle = useCallback((id: string | null) => {
		setSelectedArticleId(id);
	}, []);

	const handleSelectTaskAsset = useCallback((id: string | null) => {
		setSelectedTaskAssetId(id);
	}, []);

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
	}, [contentInstances.length, taskAssets.length, taskArticles.length]);

	// Update preview outlines when selected page changes
	useEffect(() => {
		if (selectedPageId) {
			const page = pages.find((p) => p.id === selectedPageId);
			if (page) {
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
								onSelectTaskAsset={handleSelectTaskAsset}

								selectedTaskAssetId={selectedTaskAssetId}
								taskAssets={taskAssets}
								taskArticles={taskArticles}
								selectedArticleId={selectedArticleId}
								onSelectArticle={handleSelectArticle}
								contentInstances={contentInstances}
								setContentInstances={setContentInstances}
								selectedContentInstanceId={selectedContentInstanceId}
								onSelectContentInstance={handleSelectContentInstance}
								onTabChange={handleTabChange}
								selectedPageId={selectedPageId}
								pages={pages}
								setPages={setPages}
								onSelectPage={handleSelectPage}
								onAddToApplication={handleAddToApplication}
								previewOutlines={previewOutlines}
								previewCurrentEle={previewCurrentEle}
								previewHoverEle={previewHoverEle}
								setPreviewCurrentEle={setPreviewCurrentEle}
								setPreviewHoverEle={setPreviewHoverEle}
								setPreviewOutlines={setPreviewOutlines}
								applications={applications}
								taskId={CURRENT_TASK_ID}
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
	}, [
		activeTab,
		activeWorkflow,
		briefContent,
		draftBriefContent,
		exclude,
		filteredWorkflowTemplates,
		hasTaskContent,
		panelAssetsWithSelection,
		perspectives,
		rankedSearchAssets,
		scene,
		searchReturnScene,
		selectedAsset,
		selectedTaskAssetId,
		selectedContentInstanceId,
		selectedArticleId,
		selectedPageId,
		taskAssets,
		taskArticles,
		contentInstances,
		pages,
		suggestedPanelOpen,
		workflowMenuOpen,
		workflowSearch,
		previewOutlines,
		previewCurrentEle,
		previewHoverEle,
		applications,
		addArticle,
		addContentInstanceFromModel,
		addAssetsToTask,
		applyWorkflowChange,
		cancelBriefEdit,
		handleAddToApplication,
		handleSelectArticle,
		handleSelectContentInstance,
		handleSelectPage,
		handleSelectTaskAsset,
		handleTabChange,
		handleWorkflowSelect,
		openBriefEdit,
		openSearch,
		saveBriefEdit,
		setContentInstances,
		setPages,
		setPreviewCurrentEle,
		setPreviewHoverEle,
		setPreviewOutlines,
		setPerspectives,
		setScene,
		setSelectedPanelAssetIds,
		setSuggestedPanelOpen,
		setWorkflowMenuOpen,
		setWorkflowSearch,
	]);

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
