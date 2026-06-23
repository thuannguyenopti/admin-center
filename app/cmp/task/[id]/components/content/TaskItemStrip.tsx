"use client";

import { Box } from "@optiaxiom/react";
import SparklesIcon from "@/app/cmp/assets/sparkles 16.svg";
import { IconBrowser, IconFileText } from "@tabler/icons-react";
import type { Page } from "@/app/db/initialData";
import type { ContentInstance } from "@/app/db/cmpInitialData";
import type { AssetItem, TaskArticle } from "../../types";

type TaskItemStripProps = {
	contentInstances: ContentInstance[];
	pages: Page[];
	selectedArticleId: string | null;
	selectedContentInstanceId: string | null;
	selectedPageId: string | null;
	selectedTaskAssetId: string | null;
	taskArticles: TaskArticle[];
	taskAssets: AssetItem[];
	onOpenSuggested: () => void;
	onSelectArticle: (id: string | null) => void;
	onSelectContentInstance: (id: string | null) => void;
	onSelectPage: (id: string | null) => void;
	onSelectTaskAsset: (id: string | null) => void;
};

export function TaskItemStrip({
	contentInstances,
	pages,
	selectedArticleId,
	selectedContentInstanceId,
	selectedPageId,
	selectedTaskAssetId,
	taskArticles,
	taskAssets,
	onOpenSuggested,
	onSelectArticle,
	onSelectContentInstance,
	onSelectPage,
	onSelectTaskAsset,
}: TaskItemStripProps) {
	const items = [
		{ kind: "suggested" as const },
		...contentInstances.map((item) => ({ kind: "content-instance" as const, item })),
		...pages.map((item) => ({ kind: "page" as const, item })),
		...taskArticles.map((item) => ({ kind: "article" as const, item })),
		...taskAssets.map((item) => ({ kind: "asset" as const, item })),
	];

	return (
		<Box alignItems="center" display="flex" gap="8">
			{items.map((entry, index) => {
				const isSelected =
					entry.kind === "content-instance"
						? entry.item.id === selectedContentInstanceId
						: entry.kind === "page"
							? entry.item.id === selectedPageId
							: entry.kind === "article"
								? entry.item.id === selectedArticleId
								: entry.kind === "asset"
									? entry.item.id === selectedTaskAssetId
									: false;

				const handleClick = () => {
					switch (entry.kind) {
						case "suggested":
							onOpenSuggested();
							return;
						case "content-instance":
							onSelectContentInstance(entry.item.id);
							onSelectPage(null);
							onSelectArticle(null);
							onSelectTaskAsset(null);
							return;
						case "page":
							onSelectPage(entry.item.id);
							onSelectContentInstance(null);
							onSelectArticle(null);
							onSelectTaskAsset(null);
							return;
						case "article":
							onSelectArticle(entry.item.id);
							onSelectPage(null);
							onSelectContentInstance(null);
							onSelectTaskAsset(null);
							return;
						case "asset":
							onSelectTaskAsset(entry.item.id);
							onSelectPage(null);
							onSelectContentInstance(null);
							onSelectArticle(null);
							return;
					}
				};

				return (
					<Box
						alignItems="center"
						bg={isSelected ? "bg.default" : "bg.secondary"}
						border="1"
						borderColor={isSelected ? "border.accent" : "border.tertiary"}
						display="flex"
						justifyContent="center"
						key={entry.kind === "suggested" ? "suggested" : entry.item.id ?? index}
						rounded="md"
						style={{
							background: "#FFF",
							boxShadow: isSelected ? "0 0 0 1px #FFF, 0 0 0 3px #2E66F7" : "none",
							flexShrink: 0,
							height: 32,
							minHeight: 32,
							minWidth: 32,
							overflow: "hidden",
							width: 32,
						}}
					>
						<button
							aria-label={
								entry.kind === "suggested"
									? "Open suggested assets"
									: entry.kind === "content-instance"
										? `View ${entry.item.modelDisplayName}`
										: entry.kind === "page"
											? `View ${entry.item.name}`
											: entry.kind === "article"
												? `View ${entry.item.title}`
												: `View ${entry.item.title}`
							}
							onClick={handleClick}
							style={{
								alignItems: "center",
								background: "transparent",
								border: "none",
								cursor: "pointer",
								display: "flex",
								flexShrink: 0,
								height: 32,
								justifyContent: "center",
								padding: 0,
								width: 32,
							}}
							type="button"
						>
							{entry.kind === "suggested" ? (
								<SparklesIcon height={14} style={{ color: "var(--ax-colors-fg-secondary)" }} width={14} />
							) : entry.kind === "content-instance" ? (
								<IconFileText color="var(--ax-colors-fg-secondary)" size={16} />
							) : entry.kind === "page" ? (
								<IconBrowser color="var(--ax-colors-fg-secondary)" size={16} />
							) : entry.kind === "article" ? (
								<IconFileText color="var(--ax-colors-fg-secondary)" size={16} />
							) : (
								<img
									alt=""
									src={entry.item.thumbnailSrc ?? entry.item.src}
									style={{
										display: "block",
										flexShrink: 0,
										height: 32,
										objectFit: "cover",
										width: 32,
									}}
								/>
							)}
						</button>
					</Box>
				);
			})}
		</Box>
	);
}
