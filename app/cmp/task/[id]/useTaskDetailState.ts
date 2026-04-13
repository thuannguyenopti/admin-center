"use client";

import { toaster } from "@optiaxiom/react";
import { type ContentInstance, initialCmpTasks } from "@/app/db/cmpInitialData";
import type { ContentType } from "@/app/db/initialData";
import { createPageFromInstance } from "@/app/lib/contentConnection";
import { useCallback, useEffect, useRef } from "react";
import type { TaskWorkflowState } from "./workflowTypes";
import { workflowTemplates } from "./mockData";
import type { AssetItem, Scene } from "./types";
import { useCmpTaskBaseState } from "./useCmpTaskBaseState";
import { useCmpTaskComputedData } from "./useCmpTaskComputedData";
import {
	createTaskWorkflowFromTemplate,
	markAllStepsDone,
	markAllStepsUndone,
	toggleChecklistItem,
	toggleStepDone,
	toggleStepExpanded,
	setStepAssignee,
} from "./utils/workflowState";

export function useTaskDetailState(taskId: string) {
	const currentTaskName = initialCmpTasks.find((t) => t.id === taskId)?.title ?? "Unknown Task";
	const state = useCmpTaskBaseState(taskId);
	const computed = useCmpTaskComputedData({
		briefContent: state.briefContent,
		contentInstances: state.contentInstances,
		contentTypes: state.contentTypes,
		currentTaskId: taskId,
		draftBriefContent: state.draftBriefContent,
		exclude: state.exclude,
		instanceToAdd: state.instanceToAdd,
		pages: state.pages,
		perspectives: state.perspectives,
		scene: state.scene,
		selectedPanelAssetIds: state.selectedPanelAssetIds,
		selectedSearchAssetIds: state.selectedSearchAssetIds,
		taskWorkflows: state.taskWorkflows,
		taskArticles: state.taskArticles,
		taskAssets: state.taskAssets,
		workflowSearch: state.workflowSearch,
	});

	useEffect(() => {
		if (!state.selectedContentInstanceId && !state.selectedTaskAssetId && !state.selectedArticleId && !state.selectedPageId) {
			if (state.contentInstances.length > 0) {
				state.setSelectedContentInstanceId(state.contentInstances[0].id);
			} else if (computed.taskPages.length > 0) {
				state.setSelectedPageId(computed.taskPages[0].id);
			} else if (state.taskArticles.length > 0) {
				state.setSelectedArticleId(state.taskArticles[0].id);
			} else if (state.taskAssets.length > 0) {
				state.setSelectedTaskAssetId(state.taskAssets[0].id);
			}
		}
	}, [
		computed.taskPages,
		state.contentInstances,
		state.selectedArticleId,
		state.selectedContentInstanceId,
		state.selectedPageId,
		state.selectedTaskAssetId,
		state.taskArticles,
		state.taskAssets,
	]);
	useEffect(() => {
		if (!computed.hasTaskContent && (state.scene === "content" || state.scene === "content-panel")) {
			state.setScene("content-empty");
			state.setSuggestedPanelOpen(false);
		}
	}, [computed.hasTaskContent, state.scene, state.setScene, state.setSuggestedPanelOpen]);
	useEffect(() => {
		if (state.selectedPageId) {
			const page = state.pages.find((candidate) => candidate.id === state.selectedPageId);
			state.setPreviewOutlines(page?.variations?.[0]?.outlines || page?.outlines || []);
			return;
		}

		state.setPreviewOutlines([]);
	}, [state.pages, state.selectedPageId, state.setPreviewOutlines]);
	useEffect(() => {
		const availablePanelAssetIds = new Set(computed.panelAssetsWithSelection.map((asset) => asset.id));

		state.setSelectedPanelAssetIds((current) => {
			const next = current.filter((id) => availablePanelAssetIds.has(id));
			return next.length === current.length && next.every((id, index) => id === current[index]) ? current : next;
		});
	}, [computed.panelAssetsWithSelection, state.setSelectedPanelAssetIds]);
	const selectOnlyAsset = (assetId: string | null) => {
		state.setSelectedTaskAssetId(assetId);
		state.setSelectedContentInstanceId(null);
		state.setSelectedPageId(null);
		state.setSelectedArticleId(null);
	};
	const createAndAddPage = useCallback(
		(instance: ContentInstance, targetContentTypeId: string) => {
			const result = createPageFromInstance(instance, targetContentTypeId, state.contentTypes, state.pages, {
				taskId,
				taskName: currentTaskName,
			});

			if (result.error) {
				toaster.create(result.error, { intent: "danger" });
				return;
			}

			state.setPages((current) => [...current, result.page!]);
			state.setSelectedPageId(result.page!.id);
			state.setSelectedContentInstanceId(null);
			state.setSelectedTaskAssetId(null);
			state.setSelectedArticleId(null);
			toaster.create(`Page "${result.page!.name}" created successfully`, { intent: "success" });
			state.setIsTargetSelectionOpen(false);
			state.setInstanceToAdd(null);
		},
		[state.contentTypes, state.pages, state.setIsTargetSelectionOpen, state.setInstanceToAdd, state.setPages, state.setSelectedArticleId, state.setSelectedContentInstanceId, state.setSelectedPageId, state.setSelectedTaskAssetId],
	);
	const handleAddToApplication = useCallback(
		(instance: ContentInstance) => {
			const sourceType = state.contentTypes.find((contentType) => contentType.id === instance.modelId);
			if (!sourceType || !sourceType.mappings) {
				toaster.create("No mappings configured for this content type", { intent: "danger" });
				return;
			}

			const availableTargets = sourceType.mappings
				.map((mapping) => ({
					mapping,
					targetType: state.contentTypes.find((contentType) => contentType.id === mapping.targetContentTypeId),
				}))
				.filter((item) => item.targetType) as Array<{ mapping: unknown; targetType: ContentType }>;

			if (availableTargets.length === 0) {
				toaster.create("No CMS content types available for this content", { intent: "danger" });
				return;
			}

			if (availableTargets.length === 1) {
				createAndAddPage(instance, availableTargets[0].targetType.id);
				return;
			}

			state.setInstanceToAdd(instance);
			state.setIsTargetSelectionOpen(true);
		},
		[state.contentTypes, state.setInstanceToAdd, state.setIsTargetSelectionOpen, createAndAddPage],
	);
	const openContentTab = () => state.setScene(computed.hasTaskContent ? "content" : "content-empty");
	const openBriefEdit = () => {
		state.setDraftBriefContent(state.briefContent);
		state.setScene("brief-edit");
	};
	const cancelBriefEdit = () => {
		state.setDraftBriefContent(state.briefContent);
		state.setScene("brief");
	};
	const saveBriefEdit = () => {
		state.setBriefContent(state.draftBriefContent);
		state.setScene("brief");
	};
	const openSearch = (returnScene: Scene) => {
		state.setSearchReturnScene(returnScene);
		state.setWorkflowMenuOpen(false);
		state.setScene("search");
	};
	const handleTabChange = (tab: string) => {
		if (tab === "brief") {
			state.setWorkflowMenuOpen(false);
			state.setScene("brief");
			return;
		}

		if (tab === "content") {
			openContentTab();
			return;
		}

		if (tab === "publishing") {
			state.setScene("publishing");
			return;
		}
	};
	const handleWorkflowSelect = (workflowId: string) => {
		if (workflowId === computed.activeWorkflowId) {
			state.setWorkflowMenuOpen(false);
			return;
		}

		state.setPendingWorkflowId(workflowId);
		state.setWorkflowMenuOpen(false);
		state.setWorkflowDialogOpen(true);
	};
	const applyWorkflowChange = () => {
		if (state.pendingWorkflowId) {
			const template = workflowTemplates.find((t) => t.id === state.pendingWorkflowId);
			if (template) {
				state.setTaskWorkflows((prev) => ({
					...prev,
					[taskId]: createTaskWorkflowFromTemplate(template),
				}));
			}
		}

		state.setWorkflowDialogOpen(false);
		state.setPendingWorkflowId(null);
		state.setWorkflowSearch("");
	};
	const toggleChecklistItemForTask = (stepId: string, checklistItemId: string) => {
		state.setTaskWorkflows((prev) => {
			const current = prev[taskId] ?? computed.taskWorkflowState;
			return { ...prev, [taskId]: toggleChecklistItem(current, stepId, checklistItemId) };
		});
	};
	const setStepAssigneeForTask = (stepId: string, userId: string | undefined) => {
		state.setTaskWorkflows((prev) => {
			const current = prev[taskId] ?? computed.taskWorkflowState;
			return { ...prev, [taskId]: setStepAssignee(current, stepId, userId) };
		});
	};
	// Snapshot of workflow state before dialog-triggering action, so we can restore on cancel
	const preDialogWorkflowRef = useRef<TaskWorkflowState | null>(null);

	const toggleStepDoneForTask = (stepId: string) => {
		const step = computed.taskWorkflowState.steps.find((s) => s.id === stepId);
		const stepName = step?.title?.replace(/^\d+\.\s*/, "") ?? "Step";
		const wasDone = step?.done ?? false;

		// If completing the last remaining step, save snapshot so cancel can revert
		if (!wasDone) {
			const remainingUndone = computed.taskWorkflowState.steps.filter((s) => !s.done && s.id !== stepId);
			if (remainingUndone.length === 0) {
				preDialogWorkflowRef.current = computed.taskWorkflowState;
			}
		}

		state.setTaskWorkflows((prev) => {
			const current = prev[taskId] ?? computed.taskWorkflowState;
			return { ...prev, [taskId]: toggleStepDone(current, stepId) };
		});
		if (wasDone) {
			toaster.create(`"${stepName}" marked incomplete`, { intent: "neutral" });
		} else {
			toaster.create(`"${stepName}" completed`, { intent: "success" });
		}
	};
	const toggleStepExpandedForTask = (stepId: string) => {
		state.setTaskWorkflows((prev) => {
			const current = prev[taskId] ?? computed.taskWorkflowState;
			return { ...prev, [taskId]: toggleStepExpanded(current, stepId) };
		});
	};
	const markTaskComplete = () => {
		preDialogWorkflowRef.current = computed.taskWorkflowState;
		state.setTaskWorkflows((prev) => {
			const current = prev[taskId] ?? computed.taskWorkflowState;
			return { ...prev, [taskId]: markAllStepsDone(current) };
		});
		state.setPublishConfirmOpen(true);
		toaster.create("All steps completed", { intent: "success" });
	};
	const undoTaskComplete = () => {
		state.setTaskWorkflows((prev) => {
			const current = prev[taskId] ?? computed.taskWorkflowState;
			return { ...prev, [taskId]: markAllStepsUndone(current) };
		});
		toaster.create("Task completion undone", { intent: "neutral" });
	};
	const confirmPublish = () => {
		preDialogWorkflowRef.current = null;
		state.setPublishConfirmOpen(false);
		toaster.create("Content published successfully", { intent: "success" });
	};
	const cancelPublishConfirm = () => {
		// Restore workflow state to before the action that triggered the dialog
		if (preDialogWorkflowRef.current) {
			const snapshot = preDialogWorkflowRef.current;
			state.setTaskWorkflows((prev) => ({ ...prev, [taskId]: snapshot }));
			preDialogWorkflowRef.current = null;
		}
		state.setPublishConfirmOpen(false);
	};
	const addAssetsToTask = (assetsToAdd: AssetItem[]) => {
		if (assetsToAdd.length === 0) {
			return;
		}

		const normalizedAssets = assetsToAdd.map((asset) => ({
			...asset,
			thumbnailSrc: asset.thumbnailSrc ?? asset.previewSrc ?? asset.src,
		}));

		state.setTaskAssets((current) => {
			const existing = current.filter((asset) => !normalizedAssets.some((candidate) => candidate.id === asset.id));
			return [...normalizedAssets, ...existing];
		});
		selectOnlyAsset(normalizedAssets[0]?.id ?? null);
		state.setSelectedPanelAssetIds([]);
		state.setScene("content");
	};
	const addContentInstanceFromModel = (model: ContentType) => {
		const instanceId = `ci-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
		const fields: Record<string, unknown> = {};

		model.properties.forEach((property: any) => {
			if (property.type === "text" || property.type === "longText" || property.type === "richText") {
				fields[property.name] = "";
			} else if (property.type === "datetime") {
				fields[property.name] = new Date().toISOString();
			} else if (property.list) {
				fields[property.name] = [];
			} else {
				fields[property.name] = null;
			}
		});

		const newInstance: ContentInstance = {
			createdAt: new Date().toISOString(),
			fields,
			id: instanceId,
			modelDisplayName: model.displayName || model.name,
			modelId: model.id,
			taskId,
		};

		state.setContentInstances((current) => [newInstance, ...current]);
		state.setSelectedContentInstanceId(instanceId);
		state.setSelectedTaskAssetId(null);
		state.setSelectedArticleId(null);
		state.setSelectedPageId(null);
		state.setScene("content");
	};
	const addArticle = () => {
		const articleId = `article-${Date.now()}`;
		state.setTaskArticles((current) => [{ id: articleId, title: "The runner sponsoring package" }, ...current]);
		state.setSelectedArticleId(articleId);
		state.setSelectedContentInstanceId(null);
		state.setSelectedTaskAssetId(null);
		state.setSelectedPageId(null);
		state.setScene("content");
	};
	const closeWorkflowDialog = () => {
		state.setWorkflowDialogOpen(false);
		state.setPendingWorkflowId(null);
	};
	const togglePanelAssetSelection = (assetId: string) =>
		state.setSelectedPanelAssetIds((current: string[]) =>
			current.includes(assetId) ? current.filter((id) => id !== assetId) : [...current, assetId],
		);
	const toggleSearchAssetSelection = (assetId: string) =>
		state.setSelectedSearchAssetIds((current: string[]) =>
			current.includes(assetId) ? current.filter((id) => id !== assetId) : [...current, assetId],
		);
	const updatePerspective = (index: number, value: string) =>
		state.setPerspectives((current: string[]) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));

	// Publishing channel actions
	const addPublishingChannel = (channelTypeId: string) => {
		// CMS channels only accept CMS pages; other channels only accept CMP content instances
		const allContentIds = channelTypeId === "cms-12"
			? computed.taskPages.map((p) => p.id)
			: computed.taskContentInstances.map((i) => i.id);
		state.setPublishingChannels((current) => [
			...current,
			{
				id: `ch-${Date.now()}`,
				channelTypeId,
				selectedContentIds: allContentIds,
			},
		]);
	};
	const removePublishingChannel = (channelId: string) => {
		state.setPublishingChannels((current) => current.filter((ch) => ch.id !== channelId));
	};
	const updateChannelContent = (channelId: string, contentIds: string[]) => {
		state.setPublishingChannels((current) =>
			current.map((ch) => (ch.id === channelId ? { ...ch, selectedContentIds: contentIds } : ch)),
		);
	};

	return {
		...state,
		...computed,
		taskId,
		taskTitle: currentTaskName,
		addArticle,
		addContentInstanceFromModel,
		addPublishingChannel,
		removePublishingChannel,
		updateChannelContent,
		addSelectedPanelAssetsToTask: () => addAssetsToTask(computed.panelAssetsWithSelection.filter((asset) => asset.selected)),
		addSelectedSearchAssetsToTask: () => addAssetsToTask(computed.rankedSearchAssets.filter((asset) => asset.selected)),
		addSelectedSingleAssetToTask: () => addAssetsToTask([state.selectedAsset]),
		applyWorkflowChange,
		cancelBriefEdit,
		clearPanelAssetSelection: () => state.setSelectedPanelAssetIds([]),
		closePreview: () => state.setScene("search"),
		returnFromSearch: () => state.setScene(state.searchReturnScene),
		closeTargetSelection: () => {
			state.setIsTargetSelectionOpen(false);
			state.setInstanceToAdd(null);
		},
		closeWorkflowDialog,
		createAndAddPage,
		handleAddToApplication,
		handleTabChange,
		handleWorkflowSelect,
		openBriefEdit,
		openSearch,
		openSelectedAssetPreview: (asset: AssetItem) => {
			state.setSelectedAsset(asset);
			state.setScene("preview");
		},
		pendingWorkflowName:
			workflowTemplates.find((template) => template.id === state.pendingWorkflowId)?.name ?? "workflow",
		saveBriefEdit,
		cancelPublishConfirm,
		confirmPublish,
		markTaskComplete,
		setStepAssigneeForTask,
		toggleChecklistItemForTask,
		togglePanelAssetSelection,
		toggleSearchAssetSelection,
		toggleStepDoneForTask,
		toggleStepExpandedForTask,
		toggleWorkflowMenu: () => state.setWorkflowMenuOpen((open) => !open),
		undoTaskComplete,
		updatePerspective,
	};
}
