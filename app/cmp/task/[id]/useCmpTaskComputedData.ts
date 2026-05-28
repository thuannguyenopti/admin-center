"use client";

import { useDeferredValue, useMemo } from "react";

import { searchAssets, workflowTemplates } from "./mockData";
import type { ContentType, Page } from "@/app/db/initialData";
import type { ContentInstance } from "@/app/db/cmpInitialData";
import { initialContentInstances } from "@/app/db/cmpInitialData";
import type { AssetItem, Scene, SearchAssetItem, TaskArticle, TaskTab } from "./types";
import { getBriefAssetMatch, getPlainTextFromHtml, getSearchAssetMatch } from "./utils";

type UseCmpTaskComputedDataArgs = {
	briefContent: string;
	contentInstances: ContentInstance[];
	currentTaskId: string;
	contentTypes: ContentType[];
	draftBriefContent: string;
	exclude: string;
	instanceToAdd: ContentInstance | null;
	pages: Page[];
	perspectives: string[];
	scene: Scene;
	selectedPanelAssetIds: string[];
	selectedSearchAssetIds: string[];
	selectedWorkflowId: string | null;
	taskArticles: TaskArticle[];
	taskAssets: AssetItem[];
	workflowSearch: string;
};

export function useCmpTaskComputedData({
	briefContent,
	contentInstances,
	contentTypes,
	currentTaskId,
	draftBriefContent,
	exclude,
	instanceToAdd,
	pages,
	perspectives,
	scene,
	selectedPanelAssetIds,
	selectedSearchAssetIds,
	selectedWorkflowId,
	taskArticles,
	taskAssets,
	workflowSearch,
}: UseCmpTaskComputedDataArgs) {
	const taskPages = useMemo(() => pages.filter((page) => page.cmpTaskMetadata?.taskId === currentTaskId), [currentTaskId, pages]);
	const taskContentInstances = useMemo(() => contentInstances.filter((instance) => {
		const taskId = instance.taskId ?? initialContentInstances.find((i) => i.id === instance.id)?.taskId;
		return taskId === currentTaskId;
	}), [contentInstances, currentTaskId]);
	const hasTaskContent = taskContentInstances.length > 0 || taskPages.length > 0 || taskArticles.length > 0 || taskAssets.length > 0;
	const activeTab: TaskTab = scene === "brief" || scene === "brief-edit" ? "brief" : "content";
	const effectiveBriefContent = scene === "brief-edit" ? draftBriefContent : briefContent;
	const effectiveBriefText = useMemo(() => getPlainTextFromHtml(effectiveBriefContent), [effectiveBriefContent]);
	const deferredBriefContent = useDeferredValue(effectiveBriefText);
	const deferredWorkflowSearch = useDeferredValue(workflowSearch);
	const deferredPerspectives = useDeferredValue(perspectives);
	const deferredExclude = useDeferredValue(exclude);
	const activeWorkflowId = selectedWorkflowId ?? (scene === "content-empty" ? "starter" : "newsletter");
	const activeWorkflow = workflowTemplates.find((template) => template.id === activeWorkflowId) ?? workflowTemplates[0];

	const rankedSearchAssets = useMemo(
		() =>
			searchAssets
				.map((asset, index) => ({
					...asset,
					match: getSearchAssetMatch({
						asset,
						exclude: deferredExclude,
						perspectives: deferredPerspectives,
					}),
					originalIndex: index,
					selected: selectedSearchAssetIds.includes(asset.id),
				}))
				.sort((left, right) => (right.match !== left.match ? right.match - left.match : left.originalIndex - right.originalIndex))
				.map(({ originalIndex, ...asset }) => asset),
		[deferredExclude, deferredPerspectives, selectedSearchAssetIds],
	);

	const panelAssetsWithSelection = useMemo(() => {
		const taskAssetIds = new Set(taskAssets.map((asset) => asset.id));

		return searchAssets
			.filter((asset) => !taskAssetIds.has(asset.id))
			.map((asset, index) => ({
				...asset,
				match: getBriefAssetMatch({
					asset,
					brief: deferredBriefContent,
				}),
				originalIndex: index,
				selected: selectedPanelAssetIds.includes(asset.id),
			}))
			.sort((left, right) => {
				if (left.selected !== right.selected) {
					return left.selected ? -1 : 1;
				}

				return right.match !== left.match ? right.match - left.match : left.originalIndex - right.originalIndex;
			})
			.map(({ originalIndex, ...asset }) => asset);
	}, [deferredBriefContent, selectedPanelAssetIds, taskAssets]);

	const filteredWorkflowTemplates = useMemo(() => {
		const query = deferredWorkflowSearch.trim().toLowerCase();

		if (!query) {
			return workflowTemplates;
		}

		return workflowTemplates.filter((template) =>
			`${template.name} ${template.subtitle ?? ""}`.toLowerCase().includes(query),
		);
	}, [deferredWorkflowSearch]);

	const targetDialogAvailableTargets = useMemo(
		() =>
			instanceToAdd
				? (contentTypes
						.find((contentType) => contentType.id === instanceToAdd.modelId)
						?.mappings?.map((mapping) => ({
							mapping,
							targetType: contentTypes.find((contentType) => contentType.id === mapping.targetContentTypeId)!,
						}))
						.filter((item) => item.targetType) ?? [])
				: [],
		[contentTypes, instanceToAdd],
	);

	return {
		activeTab,
		activeWorkflow,
		activeWorkflowId,
		filteredWorkflowTemplates,
		hasTaskContent,
		panelAssetsWithSelection,
		rankedSearchAssets,
		targetDialogAvailableTargets,
		taskPages,
	};
}
