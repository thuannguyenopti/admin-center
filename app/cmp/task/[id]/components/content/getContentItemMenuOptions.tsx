"use client";

import { toaster } from "@optiaxiom/react";
import type { ContentInstance } from "@/app/db/cmpInitialData";
import type { Application, Page } from "@/app/db/initialData";
import { IconEye, IconPencil, IconTag, IconTrash } from "@tabler/icons-react";

import type { AssetItem, TaskArticle } from "../../types";
import { selectFirstRemainingTaskItem } from "./selectFirstRemainingTaskItem";

type GetContentItemMenuOptionsArgs = {
	applications: Application[];
	contentInstances: ContentInstance[];
	currentTaskId: string;
	onAddToApplication: (instance: ContentInstance) => void;
	onSelectArticle: (id: string | null) => void;
	onSelectContentInstance: (id: string | null) => void;
	onSelectPage: (id: string | null) => void;
	onSelectTaskAsset: (id: string | null) => void;
	onTabChange: (tab: string) => void;
	openPageEditor: (pageId: string) => void;
	pages: Page[];
	reviewPage: (page: Page) => void;
	selectedArticle: TaskArticle | null;
	selectedContentInstance: ContentInstance | null;
	selectedPage: Page | null;
	selectedTaskAsset: AssetItem | null;
	setContentInstances: React.Dispatch<React.SetStateAction<ContentInstance[]>>;
	setPages: React.Dispatch<React.SetStateAction<Page[]>>;
	setTaskArticles: React.Dispatch<React.SetStateAction<TaskArticle[]>>;
	setTaskAssets: React.Dispatch<React.SetStateAction<AssetItem[]>>;
	taskArticles: TaskArticle[];
	taskAssets: AssetItem[];
	taskPages: Page[];
};

export function getContentItemMenuOptions({
	applications,
	contentInstances,
	currentTaskId,
	onAddToApplication,
	onSelectArticle,
	onSelectContentInstance,
	onSelectPage,
	onSelectTaskAsset,
	onTabChange,
	openPageEditor,
	pages,
	reviewPage,
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
}: GetContentItemMenuOptionsArgs) {
	if (selectedPage) {
		return [
			{
				label: "Edit in CMS",
				addon: <IconPencil size={16} />,
				description: "Open page in Visual Builder",
				execute: () => openPageEditor(selectedPage.id),
			},
			{
				label: "Review",
				addon: <IconEye size={16} />,
				description: "View page on website",
				execute: () => reviewPage(selectedPage),
			},
			{
				label: "Remove",
				addon: <IconTrash size={16} />,
				description: "Remove page from task",
				execute: () => {
					const nextPages = pages.map((page) => (page.id === selectedPage.id ? { ...page, cmpTaskMetadata: undefined } : page));
					const nextTaskPages = nextPages.filter((page) => page.cmpTaskMetadata?.taskId === currentTaskId);
					setPages(nextPages);
					toaster.create("Page removed from task", { intent: "success" });
					selectFirstRemainingTaskItem({
						contentInstances,
						onSelectArticle,
						onSelectContentInstance,
						onSelectPage,
						onSelectTaskAsset,
						onTabChange,
						pages: nextTaskPages,
						taskArticles,
						taskAssets,
					});
				},
			},
		];
	}

	if (selectedContentInstance) {
		return [
			applications.length === 1
				? {
						label: "Add to CMS",
						addon: <IconTag size={16} />,
						description: "Create CMS page from this content",
						execute: () => onAddToApplication(selectedContentInstance),
					}
				: {
						label: "Add to CMS",
						addon: <IconTag size={16} />,
						description: "Create CMS page from this content",
						subOptions: applications.map((application) => ({
							label: application.name,
							description: `Add to ${application.name}`,
							execute: () => onAddToApplication(selectedContentInstance),
						})),
					},
			{
				label: "Remove from task",
				addon: <IconTrash size={16} />,
				description: "Remove this item from the task",
				execute: () => {
					const nextInstances = contentInstances.filter((instance) => instance.id !== selectedContentInstance.id);
					setContentInstances(nextInstances);
					selectFirstRemainingTaskItem({
						contentInstances: nextInstances,
						onSelectArticle,
						onSelectContentInstance,
						onSelectPage,
						onSelectTaskAsset,
						onTabChange,
						pages: taskPages,
						taskArticles,
						taskAssets,
					});
				},
			},
		];
	}

	if (selectedArticle) {
		return [
			{
				label: "Remove from task",
				addon: <IconTrash size={16} />,
				description: "Remove this item from the task",
				execute: () => {
					const nextArticles = taskArticles.filter((article) => article.id !== selectedArticle.id);
					setTaskArticles(nextArticles);
					selectFirstRemainingTaskItem({
						contentInstances,
						onSelectArticle,
						onSelectContentInstance,
						onSelectPage,
						onSelectTaskAsset,
						onTabChange,
						pages: taskPages,
						taskArticles: nextArticles,
						taskAssets,
					});
				},
			},
		];
	}

	if (selectedTaskAsset) {
		return [
			{
				label: "Remove from task",
				addon: <IconTrash size={16} />,
				description: "Remove this item from the task",
				execute: () => {
					const nextAssets = taskAssets.filter((asset) => asset.id !== selectedTaskAsset.id);
					setTaskAssets(nextAssets);
					selectFirstRemainingTaskItem({
						contentInstances,
						onSelectArticle,
						onSelectContentInstance,
						onSelectPage,
						onSelectTaskAsset,
						onTabChange,
						pages: taskPages,
						taskArticles,
						taskAssets: nextAssets,
					});
				},
			},
		];
	}

	return [];
}
