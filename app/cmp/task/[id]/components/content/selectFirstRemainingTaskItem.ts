import type { ContentInstance } from "@/app/db/cmpInitialData";
import type { Page } from "@/app/db/initialData";
import type { AssetItem, TaskArticle } from "../../types";

type SelectFirstRemainingTaskItemArgs = {
	contentInstances: ContentInstance[];
	onSelectArticle: (id: string | null) => void;
	onSelectContentInstance: (id: string | null) => void;
	onSelectPage: (id: string | null) => void;
	onSelectTaskAsset: (id: string | null) => void;
	onTabChange: (tab: string) => void;
	pages: Page[];
	taskArticles: TaskArticle[];
	taskAssets: AssetItem[];
};

export function selectFirstRemainingTaskItem({
	contentInstances,
	onSelectArticle,
	onSelectContentInstance,
	onSelectPage,
	onSelectTaskAsset,
	onTabChange,
	pages,
	taskArticles,
	taskAssets,
}: SelectFirstRemainingTaskItemArgs) {
	if (contentInstances.length > 0) {
		onSelectContentInstance(contentInstances[0].id);
		onSelectPage(null);
		onSelectArticle(null);
		onSelectTaskAsset(null);
		return;
	}

	if (pages.length > 0) {
		onSelectPage(pages[0].id);
		onSelectContentInstance(null);
		onSelectArticle(null);
		onSelectTaskAsset(null);
		return;
	}

	if (taskArticles.length > 0) {
		onSelectArticle(taskArticles[0].id);
		onSelectPage(null);
		onSelectContentInstance(null);
		onSelectTaskAsset(null);
		return;
	}

	if (taskAssets.length > 0) {
		onSelectTaskAsset(taskAssets[0].id);
		onSelectPage(null);
		onSelectContentInstance(null);
		onSelectArticle(null);
		return;
	}

	onSelectContentInstance(null);
	onSelectPage(null);
	onSelectArticle(null);
	onSelectTaskAsset(null);
	onTabChange("content");
}
