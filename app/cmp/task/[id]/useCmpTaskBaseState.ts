"use client";

import type { Outline } from "@/app/components/vb/PreviewCanvas";
import type { ContentInstance } from "@/app/db/cmpInitialData";
import { initialContentInstances } from "@/app/db/cmpInitialData";
import type { Application, ContentType, Page } from "@/app/db/initialData";
import { initialApplications, initialContentTypes, initialPages } from "@/app/db/initialData";
import usePersistentState from "@/app/usePersistentState";
import { useState } from "react";
import { initialTaskAssets, searchAssets, suggestedAssets } from "./mockData";
import { perspectiveSeeds } from "./constants";
import type { AssetItem, Scene, TaskArticle } from "./types";
import { initialBriefHtml } from "./utils";

export function useCmpTaskBaseState() {
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
	const [briefContent, setBriefContent] = useState(initialBriefHtml);
	const [draftBriefContent, setDraftBriefContent] = useState(initialBriefHtml);
	const [searchReturnScene, setSearchReturnScene] = useState<Scene>("brief-edit");
	const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
	const [workflowMenuOpen, setWorkflowMenuOpen] = useState(false);
	const [workflowSearch, setWorkflowSearch] = useState("");
	const [pendingWorkflowId, setPendingWorkflowId] = useState<string | null>(null);
	const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);

	return {
		applications,
		briefContent,
		contentInstances,
		contentTypes,
		draftBriefContent,
		exclude,
		instanceToAdd,
		isTargetSelectionOpen,
		pages,
		pendingWorkflowId,
		perspectives,
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
		selectedWorkflowId,
		setBriefContent,
		setContentInstances,
		setDraftBriefContent,
		setExclude,
		setInstanceToAdd,
		setIsTargetSelectionOpen,
		setPages,
		setPendingWorkflowId,
		setPerspectives,
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
		setSelectedWorkflowId,
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
