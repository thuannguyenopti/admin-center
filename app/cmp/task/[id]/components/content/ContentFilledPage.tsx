"use client";

import { Badge, Box, Menu, MenuContent, MenuTrigger } from "@optiaxiom/react";
import { Button } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import Grid2Icon from "@/app/cmp/assets/grid2.svg";
import type { ContentInstance } from "@/app/db/cmpInitialData";
import { initialContentInstances } from "@/app/db/cmpInitialData";
import type { Application, ContentType, Page } from "@/app/db/initialData";
import { initialContentTypes } from "@/app/db/initialData";
import usePersistentState from "@/app/usePersistentState";
import { IconChevronDown, IconCopy, IconDots, IconLink, IconPencil, IconPlus, IconTag } from "@tabler/icons-react";
import { IconBolt } from "@/app/lib/axiom-icons";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Outline } from "@/app/components/vb/PreviewCanvas";
import type { AssetItem, TaskArticle, TaskTab } from "../../types";
import { buildPageSlug } from "@/app/site/resolveSlug";

import { PageHeader } from "../shared/PageHeader";
import { AddContentButtonLabel, buildAddContentMenuOptions } from "./buildAddContentMenuOptions";
import { getContentItemMenuOptions } from "./getContentItemMenuOptions";
import { TaskItemStrip } from "./TaskItemStrip";
import { SelectedContentBody } from "./SelectedContentBody";

type ContentFilledPageProps = {
	activeTab: TaskTab;
	applications: Application[];
	contentInstances: ContentInstance[];
	currentTaskId: string;
	onAddArticle: () => void;
	onAddContent: () => void;
	onAddContentFromModel: (model: ContentType) => void;
	onAddToApplication: (instance: ContentInstance, applicationName?: string) => void;
	onOpenSuggested: () => void;
	onSelectArticle: (id: string | null) => void;
	onSelectContentInstance: (id: string | null) => void;
	onSelectPage: (id: string | null) => void;
	onSelectTaskAsset: (assetId: string | null) => void;
	onTabChange: (tab: string) => void;
	pages: Page[];
	previewCurrentEle: string;
	previewHoverEle: string;
	previewOutlines: Outline[];
	selectedArticleId: string | null;
	selectedContentInstanceId: string | null;
	selectedPageId: string | null;
	selectedTaskAssetId: string | null;
	setContentInstances: React.Dispatch<React.SetStateAction<ContentInstance[]>>;
	setPages: React.Dispatch<React.SetStateAction<Page[]>>;
	setPreviewCurrentEle: React.Dispatch<React.SetStateAction<string>>;
	setPreviewHoverEle: React.Dispatch<React.SetStateAction<string>>;
	setPreviewOutlines: React.Dispatch<React.SetStateAction<Outline[]>>;
	setTaskArticles: React.Dispatch<React.SetStateAction<TaskArticle[]>>;
	setTaskAssets: React.Dispatch<React.SetStateAction<AssetItem[]>>;
	taskArticles: TaskArticle[];
	taskAssets: AssetItem[];
	taskTitle: string;
};

export function ContentFilledPage({
	activeTab,
	applications,
	contentInstances,
	currentTaskId,
	onAddArticle,
	onAddContent,
	onAddContentFromModel,
	onAddToApplication,
	onOpenSuggested,
	onSelectArticle,
	onSelectContentInstance,
	onSelectPage,
	onSelectTaskAsset,
	onTabChange,
	pages,
	previewCurrentEle,
	previewHoverEle,
	previewOutlines,
	selectedArticleId,
	selectedContentInstanceId,
	selectedPageId,
	selectedTaskAssetId,
	setContentInstances,
	setPages,
	setPreviewCurrentEle,
	setPreviewHoverEle,
	setPreviewOutlines,
	setTaskArticles,
	setTaskAssets,
	taskArticles,
	taskAssets,
	taskTitle,
}: ContentFilledPageProps) {
	const [contentTypes] = usePersistentState("contentTypes", initialContentTypes) as [ContentType[], (value: ContentType[]) => void];
	const [isEditingContentInstance, setIsEditingContentInstance] = useState(false);
	const router = useRouter();
	const taskPages = useMemo(() => pages.filter((page) => page.cmpTaskMetadata?.taskId === currentTaskId), [currentTaskId, pages]);
	const taskContentInstances = useMemo(() => contentInstances.filter((instance) => {
		const taskId = instance.taskId ?? initialContentInstances.find((i) => i.id === instance.id)?.taskId;
		return taskId === currentTaskId;
	}), [contentInstances, currentTaskId]);
	const selectedTaskAsset = taskAssets.find((asset) => asset.id === selectedTaskAssetId) ?? null;
	const selectedContentInstance = taskContentInstances.find((instance) => instance.id === selectedContentInstanceId) ?? null;
	const selectedArticle = taskArticles.find((article) => article.id === selectedArticleId) ?? null;
	const selectedPage = pages.find((page) => page.id === selectedPageId) ?? null;
	// Auto-select first task content instance if none selected
	useEffect(() => {
		if (!selectedContentInstance && taskContentInstances.length > 0 && !selectedPageId && !selectedTaskAssetId && !selectedArticleId) {
			onSelectContentInstance(taskContentInstances[0].id);
		}
	}, [taskContentInstances, selectedContentInstance, selectedPageId, selectedTaskAssetId, selectedArticleId, onSelectContentInstance]);

	useEffect(() => {
		setIsEditingContentInstance(false);
	}, [selectedContentInstanceId]);
	const menuOptions = getContentItemMenuOptions({
		contentInstances,
		currentTaskId,
		onSelectArticle,
		onSelectContentInstance,
		onSelectPage,
		onSelectTaskAsset,
		onTabChange,
		openPageEditor: (pageId) => router.push(`/cms/edit/${pageId}`),
		pages,
		reviewPage: (page) => {
			const slug = buildPageSlug(page, pages);
			window.open(`/site/${slug}`, "_blank");
		},
		selectedArticle,
		selectedContentInstance,
		selectedPage,
		selectedTaskAsset,
		setContentInstances,
		setPages,
		setTaskArticles,
		setTaskAssets,
		taskArticles,
		taskAssets,
		taskPages,
	});

	const getStatusBadge = () => {
		let status: string | undefined;
		if (selectedPage) {
			status = selectedPage.status;
		} else if (selectedContentInstance) {
			status = selectedContentInstance.publishStatus;
		}

		if (!status) return null;

		const intent = status === "Published" ? "success" : status === "Changed" ? "warning" : "neutral";

		return <Badge intent={intent} style={{ marginRight: 8 }}>{status}</Badge>;
	};

	return (
		<Box pb="32" style={{ position: "relative" }}>
			<PageHeader activeTab={activeTab} onTabChange={onTabChange} taskTitle={taskTitle} />
			<Box display="flex" flexDirection="column" style={{ gap: 18, maxWidth: 812, padding: "20px 32px 0" }}>
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Menu options={buildAddContentMenuOptions({ onAddArticle, onAddAsset: onAddContent, onAddContentFromModel })}>
						<MenuTrigger asChild>
							<Button appearance="primary" icon={<IconChevronDown size={14} />} iconPosition="end">
								<Box asChild display="inline-flex" alignItems="center" gap="4">
									<span><IconPlus size={16} />Add Content</span>
								</Box>
							</Button>
						</MenuTrigger>
						<MenuContent />
					</Menu>
					<Box alignItems="center" display="flex" style={{ gap: 12 }}>
						<IconCopy color="var(--ax-colors-fg-secondary)" size={16} />
						<Text color="fg.secondary" style={{ fontSize: 14, lineHeight: "20px", maxWidth: "none" }}>
							8
						</Text>
						<Box alignItems="center" bg="bg.tertiary" display="flex" justifyContent="center" rounded="md" style={{ flexShrink: 0, height: 32, width: 32 }}>
							<Box style={{ border: "1.6px solid var(--ax-colors-fg-accent)", borderRadius: 2, height: 16, width: 16 }} />
						</Box>
						<Box alignItems="center" display="flex" justifyContent="center" rounded="md" style={{ flexShrink: 0, height: 32, width: 32 }}>
							<Grid2Icon aria-hidden="true" style={{ color: "var(--ax-colors-fg-tertiary)", display: "block", height: 16, width: 16 }} />
						</Box>
					</Box>
				</Box>

				<TaskItemStrip
					contentInstances={taskContentInstances}
					onOpenSuggested={onOpenSuggested}
					onSelectArticle={onSelectArticle}
					onSelectContentInstance={onSelectContentInstance}
					onSelectPage={onSelectPage}
					onSelectTaskAsset={onSelectTaskAsset}
					pages={taskPages}
					selectedArticleId={selectedArticleId}
					selectedContentInstanceId={selectedContentInstanceId}
					selectedPageId={selectedPageId}
					selectedTaskAssetId={selectedTaskAssetId}
					taskArticles={taskArticles}
					taskAssets={taskAssets}
				/>

				<Box bg="bg.default" border="1" borderColor="border.tertiary" rounded="lg" style={{ overflow: "hidden" }}>
					<Box alignItems="center" display="flex" justifyContent="space-between" style={{ padding: "18px 18px 14px" }}>
						<Box alignItems="center" display="flex" gap="8">
							<Text color="fg.default" style={{ fontSize: 20, fontWeight: 500, lineHeight: "28px", maxWidth: "none" }}>
								{selectedContentInstance?.fields.headline ||
									selectedContentInstance?.fields.title ||
									selectedContentInstance?.modelDisplayName ||
									selectedPage?.name ||
									selectedArticle?.title ||
									selectedTaskAsset?.title ||
									"No content selected"}
							</Text>
							{getStatusBadge()}
						</Box>
						<Box alignItems="center" display="flex" style={{ gap: 12 }}>
							<IconTag color="var(--ax-colors-fg-secondary)" size={16} />
							<Button
								appearance="subtle"
								aria-label="Open suggested assets"
								icon={<IconBolt size={16} />}
								onClick={onOpenSuggested}
								size="sm"
							/>
							<IconLink color="var(--ax-colors-fg-secondary)" size={16} />
							{selectedContentInstance && (
								<>
									<IconPencil
										color={isEditingContentInstance ? "var(--ax-colors-fg-accent)" : "var(--ax-colors-fg-secondary)"}
										onClick={() => setIsEditingContentInstance((value) => !value)}
										size={16}
										style={{ cursor: "pointer" }}
									/>
									<Menu
										options={applications.map((app) => ({
											label: app.name,
											description: "Website",
											execute: () => onAddToApplication(selectedContentInstance, app.name),
										}))}
									>
										<MenuTrigger asChild>
											<Button appearance="default" size="sm" style={{ borderRadius: 6, height: 32 }}>
												<Box alignItems="center" display="flex" gap="4">
													<span>Add to CMS</span>
													<IconChevronDown size={14} />
												</Box>
											</Button>
										</MenuTrigger>
										<MenuContent />
									</Menu>
								</>
							)}
							<Menu options={menuOptions}>
								<MenuTrigger asChild>
									<button aria-label="More options" style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", padding: 0 }} type="button">
										<IconDots color="var(--ax-colors-fg-secondary)" size={16} />
									</button>
								</MenuTrigger>
								<MenuContent />
							</Menu>
						</Box>
					</Box>

					<SelectedContentBody
						contentTypes={contentTypes}
						isEditingContentInstance={isEditingContentInstance}
						onContentInstanceChange={(nextInstance) => {
							setContentInstances((current) =>
								current.map((instance) => (instance.id === nextInstance.id ? nextInstance : instance)),
							);
						}}
						previewCurrentEle={previewCurrentEle}
						previewHoverEle={previewHoverEle}
						previewOutlines={previewOutlines}
						selectedArticle={selectedArticle}
						selectedContentInstance={selectedContentInstance}
						selectedPage={selectedPage}
						selectedTaskAsset={selectedTaskAsset}
						setPreviewCurrentEle={setPreviewCurrentEle}
						setPreviewHoverEle={setPreviewHoverEle}
						setPreviewOutlines={setPreviewOutlines}
					/>
				</Box>
			</Box>
		</Box>
	);
}
