"use client";

import type { Outline } from "@/app/components/vb/PreviewCanvas";
import type { ContentInstance } from "@/app/db/cmpInitialData";
import { initialContentInstances } from "@/app/db/cmpInitialData";
import type { Application, ContentType, Page } from "@/app/db/initialData";
import { initialApplications, initialContentTypes, initialPages } from "@/app/db/initialData";
import usePersistentState from "@/app/usePersistentState";
import { useEffect, useState } from "react";
import { initialTaskAssets, searchAssets, suggestedAssets } from "./mockData";
import { initialBriefContent, perspectiveSeeds, taskBriefContents } from "./constants";
import type { AssetItem, PublishingChannel, Scene, TaskArticle } from "./types";
import type { TaskWorkflowState } from "./workflowTypes";
import { formatInitialBriefHtml } from "./utils";

export function useCmpTaskBaseState(taskId: string) {
	const taskBriefHtml = formatInitialBriefHtml(taskBriefContents[taskId] ?? initialBriefContent);
	const [scene, setScene] = useState<Scene>("brief");
	const [selectedAsset, setSelectedAsset] = useState<AssetItem>(suggestedAssets[6]);
	const [selectedTaskAssetId, setSelectedTaskAssetId] = useState<string | null>(null);
	const [selectedPanelAssetIds, setSelectedPanelAssetIds] = useState<string[]>([]);
	const [selectedSearchAssetIds, setSelectedSearchAssetIds] = useState<string[]>(
		searchAssets.filter((asset) => asset.selected).map((asset) => asset.id),
	);
	const [taskAssets, setTaskAssets] = useState<AssetItem[]>(initialTaskAssets);
	const [taskArticles, setTaskArticles] = useState<TaskArticle[]>([]);
	const [contentInstances, setContentInstances] = usePersistentState("cmpContentInstances", initialContentInstances) as [
		ContentInstance[],
		React.Dispatch<React.SetStateAction<ContentInstance[]>>,
	];
	// Merge taskId from initial data into cached instances
	useEffect(() => {
		if (!contentInstances?.length) return;
		let changed = false;
		const merged = contentInstances.map((cached: ContentInstance) => {
			const initial = initialContentInstances.find((i: ContentInstance) => i.id === cached.id);
			if (!initial) return cached;
			if (initial.taskId && cached.taskId !== initial.taskId) {
				changed = true;
				return { ...cached, taskId: initial.taskId };
			}
			return cached;
		});
		if (changed) setContentInstances(merged);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [selectedContentInstanceId, setSelectedContentInstanceId] = useState<string | null>(null);
	const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
	const [suggestedPanelOpen, setSuggestedPanelOpen] = useState(false);
	const [pages, setPages] = usePersistentState("pages_v5", initialPages) as [
		Page[],
		React.Dispatch<React.SetStateAction<Page[]>>,
	];
	const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
	const [isTargetSelectionOpen, setIsTargetSelectionOpen] = useState(false);
	const [instanceToAdd, setInstanceToAdd] = useState<ContentInstance | null>(null);
	const [previewCurrentEle, setPreviewCurrentEle] = useState("");
	const [previewHoverEle, setPreviewHoverEle] = useState("");
	const [previewOutlines, setPreviewOutlines] = useState<Outline[]>([]);
	const [contentTypes] = usePersistentState("contentTypes", initialContentTypes) as [ContentType[], unknown];
	const [applications] = usePersistentState("applications", initialApplications) as [Application[], unknown];
	const [perspectives, setPerspectives] = useState(perspectiveSeeds);
	const [exclude, setExclude] = useState("bicycles, skateboards, longboards");
	const [briefContent, setBriefContent] = useState(taskBriefHtml);
	const [draftBriefContent, setDraftBriefContent] = useState(taskBriefHtml);
	const [searchReturnScene, setSearchReturnScene] = useState<Scene>("brief-edit");
	const [taskWorkflows, setTaskWorkflows] = usePersistentState("cmpTaskWorkflows", {} as Record<string, TaskWorkflowState>) as [
		Record<string, TaskWorkflowState>,
		React.Dispatch<React.SetStateAction<Record<string, TaskWorkflowState>>>,
	];
	const [workflowMenuOpen, setWorkflowMenuOpen] = useState(false);
	const [workflowSearch, setWorkflowSearch] = useState("");
	const [pendingWorkflowId, setPendingWorkflowId] = useState<string | null>(null);
	const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
	const [publishingChannels, setPublishingChannels] = usePersistentState("cmpPublishingChannels", {} as Record<string, PublishingChannel[]>) as [
		Record<string, PublishingChannel[]>,
		React.Dispatch<React.SetStateAction<Record<string, PublishingChannel[]>>>,
	];
	const [publishedTasks, setPublishedTasks] = usePersistentState("cmpPublishedTasks", [] as string[]) as [
		string[],
		React.Dispatch<React.SetStateAction<string[]>>,
	];
	const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);

	// Migrate old array format to new record format
	useEffect(() => {
		if (Array.isArray(publishingChannels)) {
			setPublishingChannels({});
		}
	}, [publishingChannels, setPublishingChannels]);

	return {
		applications,
		briefContent,
		contentInstances,
		contentTypes,
		draftBriefContent,
		exclude,
		instanceToAdd,
		isTargetSelectionOpen,
		isTaskPublished: publishedTasks.includes(taskId),
		pages,
		pendingWorkflowId,
		perspectives,
		publishConfirmOpen,
		publishingChannels: publishingChannels[taskId] ?? [],
		previewCurrentEle,
		previewHoverEle,
		previewOutlines,
		scene,
		searchReturnScene,
		selectedArticleId,
		selectedAsset,
		selectedContentInstanceId,
		selectedPageId,
		selectedPanelAssetIds,
		selectedSearchAssetIds,
		selectedTaskAssetId,
		taskId,
		taskWorkflows,
		setBriefContent,
		setContentInstances,
		setDraftBriefContent,
		setExclude,
		setInstanceToAdd,
		setIsTargetSelectionOpen,
		setPages,
		setPendingWorkflowId,
		setPerspectives,
		setPublishConfirmOpen,
		setPublishingChannels,
		setPublishedTasks,
		setPreviewCurrentEle,
		setPreviewHoverEle,
		setPreviewOutlines,
		setScene,
		setSearchReturnScene,
		setSelectedArticleId,
		setSelectedAsset,
		setSelectedContentInstanceId,
		setSelectedPageId,
		setSelectedPanelAssetIds,
		setSelectedSearchAssetIds,
		setSelectedTaskAssetId,
		setTaskWorkflows,
		setSuggestedPanelOpen,
		setTaskArticles,
		setTaskAssets,
		setWorkflowDialogOpen,
		setWorkflowMenuOpen,
		setWorkflowSearch,
		suggestedPanelOpen,
		taskArticles,
		taskAssets,
		workflowDialogOpen,
		workflowMenuOpen,
		workflowSearch,
	};
}
