"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Badge, Box, Menu, MenuTrigger, MenuContent, toaster } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { initialContentTypes, type ContentType, type Page, type Application } from "@/app/db/initialData";
import { type ContentInstance, initialCmpContentModels } from "@/app/db/cmpInitialData";
import { convertCmpModelToContentType, convertCmpPropertyToCms } from "@/app/lib/contentTypeMigration";
import usePersistentState from "@/app/usePersistentState";
import { useRouter } from "next/navigation";
import { PropertyRenderer } from "@/app/components/property-renderers";
import "@/app/components/property-renderers";
import PreviewCanvas, { type Outline } from "@/app/components/vb/PreviewCanvas";
import PropertyBasedPageRenderer from "@/app/site/PropertyBasedPageRenderer";
import Grid2Icon from "@/app/cmp/assets/grid2.svg";
import SparklesIcon from "@/app/cmp/assets/sparkles 16.svg";
import {
	IconBroadcast,
	IconChevronDown,
	IconCopy,
	IconDots,
	IconEye,
	IconFileText,
	IconLink,
	IconPencil,
	IconPhoto,
	IconPlus,
	IconPuzzle,
	IconTag,
	IconTrash,
} from "@tabler/icons-react";
import type { AssetItem, TaskTab } from "../types";
import { figmaAssets } from "../data/assets";
import { PageHeader } from "./PageHeader";

export function ContentFilledPage({
	activeTab,
	onAddContent,
	onAddContentFromModel,
	onAddArticle,
	onOpenSuggested,
	onSelectTaskAsset,
	selectedTaskAssetId,

	taskAssets,
	taskArticles,
	selectedArticleId,
	onSelectArticle,
	contentInstances,
	setContentInstances,
	selectedContentInstanceId,
	onSelectContentInstance,
	onTabChange,
	selectedPageId,
	pages,
	onSelectPage,
	setPages,
	onAddToApplication,
	previewOutlines,
	previewCurrentEle,
	previewHoverEle,
	setPreviewCurrentEle,
	setPreviewHoverEle,
	setPreviewOutlines,
	applications,
	taskId,
}: {
	activeTab: TaskTab;
	onAddContent: () => void;
	onAddContentFromModel: (model: ContentType) => void;
	onAddArticle: () => void;
	onOpenSuggested: () => void;
	onSelectTaskAsset: (assetId: string | null) => void;
	selectedTaskAssetId: string | null;

	taskAssets: AssetItem[];
	taskArticles: Array<{ id: string; title: string }>;
	selectedArticleId: string | null;
	onSelectArticle: (id: string | null) => void;
	contentInstances: ContentInstance[];
	setContentInstances: (instances: ContentInstance[]) => void;
	selectedContentInstanceId: string | null;
	onSelectContentInstance: (id: string | null) => void;
	onTabChange: (tab: string) => void;
	selectedPageId: string | null;
	pages: Page[];
	onSelectPage: (id: string | null) => void;
	setPages: (pages: Page[] | ((prev: Page[]) => Page[])) => void;
	onAddToApplication: (instance: ContentInstance) => void;
	previewOutlines: Outline[];
	previewCurrentEle: string;
	previewHoverEle: string;
	setPreviewCurrentEle: (value: React.SetStateAction<string>) => void;
	setPreviewHoverEle: (value: React.SetStateAction<string>) => void;
	setPreviewOutlines: React.Dispatch<React.SetStateAction<Outline[]>>;
	applications: Application[];
	taskId: string;
}) {
	const [contentTypes] = usePersistentState("contentTypes", initialContentTypes) as [
		ContentType[],
		(value: ContentType[]) => void,
	];
	const [isEditingContentInstance, setIsEditingContentInstance] = useState(false);
	const router = useRouter();

	// Filter pages that belong to this task
	const taskPages = useMemo(() => {
		return pages.filter(page => page.cmpTaskMetadata?.taskId === taskId);
	}, [pages, taskId]);

	// Use CMP content models directly, converted to ContentType format
	const cmpContentModels = useMemo(
		() => initialCmpContentModels.map(convertCmpModelToContentType),
		[]
	);

	const selectedTaskAsset =
		taskAssets.find((asset) => asset.id === selectedTaskAssetId) ?? null;
	const selectedContentInstance =
		contentInstances.find((instance) => instance.id === selectedContentInstanceId) ?? null;
	const selectedArticle =
		taskArticles.find((article) => article.id === selectedArticleId) ?? null;
	const selectedPage =
		pages.find((page) => page.id === selectedPageId) ?? null;

	// Reset edit mode when switching content instances
	useEffect(() => {
		setIsEditingContentInstance(false);
	}, [selectedContentInstanceId]);

	return (
		<Box pb="32" style={{ position: "relative" }}>
			<PageHeader activeTab={activeTab} onTabChange={onTabChange} />
			<Box display="flex" flexDirection="column" style={{ gap: 18, maxWidth: 812, padding: "20px 32px 0" }}>
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Menu
						options={[
							{
								label: "Asset",
								addon: <IconPhoto size={20} />,
								description: "Add assets from recommendations",
								execute: () => onAddContent(),
							},
							{
								label: "Article",
								addon: <IconFileText size={20} />,
								description: "Add a hardcoded article example",
								execute: () => onAddArticle(),
							},
							{
								label: "From CMS",
								addon: <IconBroadcast size={20} />,
								description: "Add content from CMS",
								execute: () => { /* TODO: Implement CMS content selection */ },
							},
							{
								label: "Component",
								addon: <IconPuzzle size={20} />,
								description: "Add a reusable component",
								execute: () => { /* TODO: Implement component selection */ },
							},
							{
								label: "Content Type",
								addon: <IconFileText size={20} />,
								description: "Add content from a content model",
								subOptions: cmpContentModels
									.filter((model) => model.isActive !== false)
									.map((model) => ({
										label: model.displayName || model.name,
										description: model.description || `Create a new ${(model.displayName || model.name).toLowerCase()}`,
										execute: () => onAddContentFromModel(model),
									})),
							},
						]}
					>
						<MenuTrigger asChild>
							<Button
								appearance="primary"
								size="sm"
								style={{
									background: "#0037FF",
									borderRadius: 6,
									height: 40,
									padding: "0 12px",
								}}
							>
								<Box alignItems="center" display="flex" gap="4">
									<IconPlus size={16} />
									<span>Add Content</span>
									<IconChevronDown size={16} />
								</Box>
							</Button>
						</MenuTrigger>
						<MenuContent />
					</Menu>
					<Box alignItems="center" display="flex" style={{ gap: 12 }}>
						<Box alignItems="center" display="flex" justifyContent="center" rounded="md" style={{ flexShrink: 0, height: 32, width: 32 }}>
							<IconCopy size={16} color="var(--ax-colors-fg-secondary)" />
						</Box>
						<Text color="fg.secondary" style={{ fontSize: 14, lineHeight: "20px", maxWidth: "none" }}>8</Text>
						<Box alignItems="center" bg="bg.tertiary" display="flex" justifyContent="center" rounded="md" style={{ flexShrink: 0, height: 32, width: 32 }}>
							<Box style={{ border: "1.6px solid var(--ax-colors-fg-accent)", borderRadius: 2, height: 16, width: 16 }} />
						</Box>
						<Box alignItems="center" display="flex" justifyContent="center" rounded="md" style={{ flexShrink: 0, height: 32, width: 32 }}>
							<Grid2Icon aria-hidden="true" style={{ color: "var(--ax-colors-fg-tertiary)", display: "block", height: 16, width: 16 }} />
						</Box>
						<Box alignItems="center" display="flex" justifyContent="center" rounded="md" style={{ flexShrink: 0, height: 32, width: 32 }}>
							<Box display="flex" flexDirection="column" style={{ gap: 2, width: 14 }}>
								<Box bg="bg.tertiary" rounded="full" style={{ height: 2, width: "100%" }} />
								<Box bg="bg.tertiary" rounded="full" style={{ height: 2, width: "100%" }} />
								<Box bg="bg.tertiary" rounded="full" style={{ height: 2, width: "100%" }} />
							</Box>
						</Box>
					</Box>
				</Box>

				<Box alignItems="center" display="flex" gap="8">
					{[null, ...contentInstances, ...taskPages, ...taskArticles, ...taskAssets].map((item, index) => {
						// Determine button type
						const isSuggestedTrigger = index === 0;
						const isContentInstance = item && 'modelId' in item;
						const isPage = item && 'contentTypeId' in item && !('modelId' in item);
						const isArticle = item && 'title' in item && !('src' in item) && !('modelId' in item) && !('contentTypeId' in item);
						const isAsset = item && !isContentInstance && !isPage && !isArticle;

						// Determine if this button is selected
						const isSelected = isSuggestedTrigger
							? false // Sparkles button is never "selected", it just toggles the panel
							: (
								(isContentInstance && item.id === selectedContentInstanceId) ||
								(isPage && item.id === selectedPageId) ||
								(isArticle && item.id === selectedArticleId) ||
								(isAsset && item.id === selectedTaskAssetId)
							);

						// Handle click events
						const handleClick = () => {
							if (isSuggestedTrigger) {
								onOpenSuggested();
								return;
							}

							if (isContentInstance) {
								onSelectContentInstance(item.id);
								onSelectPage(null);
								onSelectArticle(null);
								onSelectTaskAsset(null);
								return;
							}

							if (isPage && item) {
								onSelectPage(item.id);
								onSelectContentInstance(null);
								onSelectArticle(null);
								onSelectTaskAsset(null);
								return;
							}

							if (isArticle && item) {
								if (selectedArticleId === item.id) return;
								onSelectArticle(item.id);
								onSelectPage(null);
								onSelectContentInstance(null);
								onSelectTaskAsset(null);
								return;
							}

							if (isAsset && item) {
								if (selectedTaskAssetId === item.id) return;
								onSelectTaskAsset(item.id);
								onSelectPage(null);
								onSelectContentInstance(null);
								onSelectArticle(null);
								return;
							}
						};

						return (
							<Box
								key={isSuggestedTrigger ? 'suggested' : item?.id ?? index}
								alignItems="center"
								bg={isSelected ? "bg.default" : "bg.secondary"}
								border="1"
								borderColor={isSelected ? "border.accent" : "border.tertiary"}
								display="flex"
								justifyContent="center"
								rounded="md"
								style={{
									background: "#FFF",
									boxShadow: isSelected
										? "0 0 0 1px #FFF, 0 0 0 3px #2E66F7"
										: "none",
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
										isSuggestedTrigger ? "Open suggested assets" :
										isContentInstance ? `View ${item.modelDisplayName}` :
										isPage ? `View ${(item as Page).name}` :
										isArticle ? `View ${(item as { title: string }).title}` :
										isAsset && item && 'title' in item ? `View ${(item as { title: string }).title}` :
										"View task item"
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
									{isSuggestedTrigger ? (
										<SparklesIcon height={14} style={{ color: "var(--ax-colors-fg-secondary)" }} width={14} />
									) : isContentInstance ? (
										<IconFileText size={16} color="var(--ax-colors-fg-secondary)" />
									) : isPage ? (
										<iframe
											src={`/cms/edit/${(item as Page).id}?preview=true`}
											style={{
												border: "none",
												display: "block",
												height: 32,
												objectFit: "cover",
												pointerEvents: "none",
												transform: "scale(0.15)",
												transformOrigin: "top left",
												width: 213,
											}}
											title={`Preview of ${(item as Page).name}`}
										/>
									) : isArticle ? (
										<IconFileText size={16} color="var(--ax-colors-fg-secondary)" />
									) : isAsset && item && 'src' in item ? (
										<img
											alt=""
											src={('thumbnailSrc' in item ? item.thumbnailSrc : item.src) as string}
											style={{
												display: "block",
												flexShrink: 0,
												height: 32,
												objectFit: "cover",
												width: 32,
											}}
										/>
									) : (
										<Text fontSize="lg">{
											isPage
												? ((item as Page)?.name?.charAt(0) ?? "?")
												: ('title' in (item ?? {}) ? (item as { title: string }).title.charAt(0) : "?")
										}</Text>
									)}
								</button>
							</Box>
						);
					})}
				</Box>

				<Box
					bg="bg.default"
					border="1"
					borderColor="border.tertiary"
					rounded="lg"
					style={{ overflow: "hidden" }}
				>
					<Box alignItems="center" display="flex" justifyContent="space-between" style={{ padding: "18px 18px 14px" }}>
						<Text color="fg.default" style={{ fontSize: 20, fontWeight: 500, lineHeight: "28px", maxWidth: "none" }}>
							{selectedContentInstance
								? selectedContentInstance.modelDisplayName
								: selectedPage
								? selectedPage.name
								: selectedArticle
								? selectedArticle.title
								: selectedTaskAsset?.title
								?? `Couldn't load content with id: ${selectedContentInstanceId ?? selectedPageId ?? selectedArticleId ?? selectedTaskAssetId ?? 'unknown'}`}
						</Text>
						<Box alignItems="center" display="flex" style={{ gap: 12 }}>
							<IconTag size={16} color="var(--ax-colors-fg-secondary)" />
							<button
								aria-label="Open suggested assets"
								onClick={onOpenSuggested}
								style={{
									alignItems: "center",
									background: "transparent",
									border: "none",
									cursor: "pointer",
									display: "flex",
									justifyContent: "center",
									padding: 0,
								}}
								type="button"
							>
								<SparklesIcon height={16} style={{ color: "var(--ax-colors-fg-secondary)" }} width={16} />
							</button>
							<IconLink size={16} color="var(--ax-colors-fg-secondary)" />
							{selectedContentInstance && (
								<IconPencil
									size={16}
									color={isEditingContentInstance ? "var(--ax-colors-fg-accent)" : "var(--ax-colors-fg-secondary)"}
									style={{ cursor: "pointer" }}
									onClick={() => setIsEditingContentInstance(!isEditingContentInstance)}
								/>
							)}
							<Menu
								options={
									selectedPage
										? [
												// Menu options for CMS pages
												{
													label: "Edit in CMS",
													addon: <IconPencil size={16} />,
													description: "Open page in Visual Builder",
													execute: () => {
														router.push(`/cms/edit/${selectedPage.id}`);
													},
												},
												{
													label: "Review",
													addon: <IconEye size={16} />,
													description: "View page on website",
													execute: () => {
														const slug = selectedPage.slug || selectedPage.name.toLowerCase().replace(/\s+/g, '-');
														window.open(`/site/${slug}`, '_blank');
													},
												},
												{
													label: "Remove",
													addon: <IconTrash size={16} />,
													description: "Remove page from task",
													execute: () => {
														// Clear cmpTaskMetadata from page
														setPages((prev: Page[]) =>
															prev.map(p =>
																p.id === selectedPage.id
																	? { ...p, cmpTaskMetadata: undefined }
																	: p
															)
														);
														toaster.create(
															"Page removed from task",
															{ intent: "success" },
														);
														onSelectPage(null);
													},
												},
											]
										: selectedContentInstance
										? [
												// Menu options for CMP content instances
												applications.length === 1
													? {
															label: "Add to CMS",
															addon: <IconPlus size={16} />,
															description: "Create CMS page from this content",
															execute: () => onAddToApplication(selectedContentInstance),
													  }
													: {
															label: "Add to CMS",
															addon: <IconPlus size={16} />,
															description: "Create CMS page from this content",
															subOptions: applications.map((app: Application) => ({
																label: app.name,
																description: `Add to ${app.name}`,
																execute: () => onAddToApplication(selectedContentInstance),
															})),
													  },
												{
													label: "Remove from task",
													addon: <IconTrash size={16} />,
													description: "Remove this item from the task",
													execute: () => {
														const updatedInstances = contentInstances.filter(inst => inst.id !== selectedContentInstance.id);
														setContentInstances(updatedInstances);

														// Check if any items remain (content instances, pages, articles, or assets)
														const hasRemainingItems = updatedInstances.length > 0 || taskPages.length > 0 || taskArticles.length > 0 || taskAssets.length > 0;

														if (hasRemainingItems) {
															// Select first remaining item
															if (updatedInstances.length > 0) {
																onSelectContentInstance(updatedInstances[0].id);
															} else if (taskPages.length > 0) {
																onSelectPage(taskPages[0].id);
															} else if (taskArticles.length > 0) {
																onSelectArticle(taskArticles[0].id);
															} else if (taskAssets.length > 0) {
																onSelectTaskAsset(taskAssets[0].id);
															}
														} else {
															// No items left - navigate to empty state
															onSelectContentInstance(null);
															onTabChange('content'); // Trigger re-evaluation of hasTaskContent
														}
													},
												},
											]
										: selectedArticle || selectedTaskAsset
										? [
												{
													label: "Remove from task",
													addon: <IconTrash size={16} />,
													description: "Remove this item from the task",
													execute: () => {
														if (selectedArticle) {
															const updatedArticles = taskArticles.filter(article => article.id !== selectedArticle.id);
															console.log('Remove article:', selectedArticle.id);
														} else if (selectedTaskAsset) {
															console.log('Remove asset:', selectedTaskAsset.id);
														}
													},
												},
											]
										: []
								}
							>
								<MenuTrigger asChild>
									<button
										aria-label="More options"
										style={{
											alignItems: "center",
											background: "transparent",
											border: "none",
											cursor: "pointer",
											display: "flex",
											padding: 0,
										}}
										type="button"
									>
										<IconDots size={16} color="var(--ax-colors-fg-secondary)" />
									</button>
								</MenuTrigger>
								<MenuContent />
							</Menu>
						</Box>
					</Box>

					{selectedContentInstance ? (
						<Box display="flex" flexDirection="column" style={{ gap: 16, padding: "18px" }}>
							<Text color="fg.secondary" fontSize="sm">
								Content instance created on {new Date(selectedContentInstance.createdAt).toLocaleDateString()}
							</Text>
							{(() => {
								// Find the content model for this instance
								const contentModel = cmpContentModels.find(model => model.id === selectedContentInstance.modelId);
								if (!contentModel) {
									return (
										<Text color="fg.tertiary" fontSize="sm">
											Content model not found
										</Text>
									);
								}

								// Render each property using PropertyRenderer
								return contentModel.properties?.map((cmpProperty) => {
									const fieldValue = selectedContentInstance.fields[cmpProperty.name];
									// Convert CMP property to CMS Property format
									const cmsProperty = convertCmpPropertyToCms(cmpProperty);

									const handleChange = (newValue: any) => {
										// Update the content instance in localStorage
										const updatedInstance = {
											...selectedContentInstance,
											fields: {
												...selectedContentInstance.fields,
												[cmpProperty.name]: newValue
											}
										};

										// Update the instances array
										const updatedInstances = contentInstances.map(inst =>
											inst.id === selectedContentInstance.id ? updatedInstance : inst
										);
										setContentInstances(updatedInstances);
									};

									return (
										<PropertyRenderer
											key={cmpProperty.id}
											property={cmsProperty}
											value={fieldValue}
											onChange={handleChange}
											enableAI={isEditingContentInstance}
											context={{ runtimeContentTypes: contentTypes }}
											mode={isEditingContentInstance ? "edit" : "readonly"}
										/>
									);
								});
							})()}
						</Box>
					) : selectedPage ? (
						previewOutlines.length > 0 ? (
							<Box display="flex" flexDirection="column" style={{ height: "100%", overflow: "hidden" }}>
								<PreviewCanvas
									outlines={previewOutlines}
									theEles={{}}
									currentEle={previewCurrentEle}
									currentHoverEle={previewHoverEle}
									setCurrentEle={setPreviewCurrentEle}
									setCurrentHoverEle={setPreviewHoverEle}
									setOutlines={setPreviewOutlines}
									preview={{ mode: "responsive", width: 1440, maxWidth: 1440 }}
								/>
							</Box>
						) : (
							<Box display="flex" flexDirection="column" style={{ height: "100%", overflow: "auto" }}>
								<PropertyBasedPageRenderer
									contentTypeId={selectedPage.contentTypeId}
									properties={selectedPage.data || {}}
									pageId={selectedPage.id}
								/>
							</Box>
						)
					) : selectedArticle ? (
						<>
							<img
								alt="Runner sponsorship package"
								src={figmaAssets.contentHero}
								style={{ display: "block", height: 272, objectFit: "cover", width: "100%" }}
							/>

							<Box display="flex" flexDirection="column" style={{ gap: 14, padding: "12px 18px 0" }}>
								<Box asChild>
									<div style={{
										color: "var(--ax-colors-fg-default)",
										fontFamily: "Inter, sans-serif",
										fontSize: 14,
										fontStyle: "normal" as const,
										fontWeight: 400,
										letterSpacing: "-0.1px",
										lineHeight: "20px",
									}}>
										<>
											<p style={{ margin: 0 }}>
												When the whole world is gearing up for the Ironman Miami 2026 triathlon, here's a sneak peek at the Runner Sponsorship Package:
											</p>
											<div style={{ marginTop: 10 }}>
												<p style={{ fontWeight: 600, margin: 0 }}>Title Sponsor: The 'Victory Lap' Package ($5M)</p>
												<ul style={{ margin: "0 0 10px 18px", padding: 0 }}>
													<li>Headline billing on all event promotions.</li>
													<li>Logo placement on runner jerseys.</li>
													<li>Exclusive naming rights for the finish line.</li>
													<li>VIP access for 50 guests.</li>
													<li>Full-page ad in the event program.</li>
												</ul>
												<p style={{ fontWeight: 600, margin: 0 }}>Platinum Tier: The 'Sprint' Package ($3M)</p>
												<ul style={{ margin: "0 0 10px 18px", padding: 0 }}>
													<li>Prominent logo placement on event banners.</li>
													<li>Opportunity to set up an interactive booth at the event.</li>
													<li>VIP access for 30 guests.</li>
													<li>Half-page ad in the event program.</li>
												</ul>
												<p style={{ fontWeight: 600, margin: 0 }}>Gold Tier: The 'Marathon' Package ($1.5M)</p>
												<ul style={{ margin: "0 0 0 18px", padding: 0 }}>
													<li>Logo placement on event signage.</li>
													<li>Opportunity to distribute promotional materials.</li>
												</ul>
											</div>
										</>
									</div>
								</Box>
							</Box>

							<Box display="flex" flexDirection="column" gap="10" style={{ borderTop: "1px solid var(--ax-colors-border-tertiary)", marginTop: 12, padding: "12px 18px 18px" }}>
								<Box alignItems="center" display="flex" gap="6">
									<Box alignItems="center" bg="bg.secondary" display="flex" justifyContent="center" rounded="full" style={{ height: 20, padding: "0 8px" }}>
										<Text color="fg.secondary" style={{ fontSize: 11, fontWeight: 500, lineHeight: "16px", maxWidth: "none" }}>Image</Text>
									</Box>
									<Box alignItems="center" bg="bg.secondary" display="flex" justifyContent="center" rounded="full" style={{ height: 20, padding: "0 8px" }}>
										<Text color="fg.secondary" style={{ fontSize: 11, fontWeight: 500, lineHeight: "16px", maxWidth: "none" }}>Marathoner</Text>
									</Box>
									<Box alignItems="center" bg="bg.secondary" display="flex" justifyContent="center" rounded="full" style={{ height: 20, padding: "0 8px" }}>
										<Text color="fg.secondary" style={{ fontSize: 11, fontWeight: 500, lineHeight: "16px", maxWidth: "none" }}>Millenials</Text>
									</Box>
									<Text color="fg.accent" style={{ fontSize: 12, fontWeight: 500, lineHeight: "16px", maxWidth: "none" }}>+ 6</Text>
								</Box>
							</Box>
						</>
					) : selectedTaskAsset ? (
						<Box display="flex" flexDirection="column" style={{ gap: 16, padding: "18px" }}>
							<Text color="fg.secondary" fontSize="sm">
								Task asset selected
							</Text>
							<Text color="fg.tertiary" fontSize="sm">
								Task asset rendering not yet implemented
							</Text>
						</Box>
					) : (
						<Box display="flex" flexDirection="column" style={{ gap: 16, padding: "18px" }}>
							<Text color="fg.error" fontSize="sm">
								No content selected
							</Text>
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	);
}
