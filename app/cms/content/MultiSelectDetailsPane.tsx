"use client";

import {
	Box,
	Disclosure,
	DisclosureTrigger,
	DisclosureContent,
	Button,
	Input,
	Badge,
	Popover,
	PopoverTrigger,
	PopoverContent,
	Tooltip,
	Skeleton,
	Alert,
} from "@optiaxiom/react";
import {
	IconXmark,
	IconStack2,
	IconFile,
	IconImage,
	IconShoppingBag,
	IconBlocks,
	IconBox,
	IconLayoutGrid,
	IconCheck,
	IconArrowLeft,
	IconChevronLeft,
	IconChevronRight,
	IconSparkles,
} from "@/app/lib/axiom-icons";
import {Text} from "@/app/components/Text";
import {ContentItem} from "./page";
import {useMultiSelectMetadata} from "./useMultiSelectMetadata";
import {useState, useEffect, useRef, useMemo} from "react";
import {useGlobalTags} from "../hooks/useGlobalTags";
import {useGlobalCategories} from "../hooks/useGlobalCategories";
import type {Tag} from "../settings/tags/types";
import {getThumbnailForContent} from "./contentThumbnails";

type AutocompleteOption = {label: string; value: string; isSelected: boolean};

function getIconForType(type: ContentItem["baseType"]) {
	switch (type) {
		case "Page":
		case "Experience":
			return <IconFile size={16} />;
		case "Product":
			return <IconBox size={16} />;
		case "Block":
			return <IconLayoutGrid size={16} />;
		case "Media":
			return <IconImage size={16} />;
	}
}

interface MultiSelectDetailsPaneProps {
	items: ContentItem[];
	controlledTags?: string[] | null;
	setControlledTags?: (tags: string[] | null) => void;
	controlledCategories?: string[] | null;
	setControlledCategories?: (categories: string[] | null) => void;
	onTagsChange?: (contentId: string, tags: string[]) => void;
	onTagsChangeBatch?: (updates: Array<{id: string; tags: string[]}>) => void;
	onCategoriesChange?: (contentId: string, categories: string[]) => void;
	onCategoriesChangeBatch?: (updates: Array<{id: string; categories: string[]}>) => void;
	onClose: () => void;
	/** When provided, parent will not overwrite controlled tags/categories while batch edit is active. */
	onBatchEditModeChange?: (mode: {tags: boolean; categories: boolean}) => void;
}

export default function MultiSelectDetailsPane({
	items,
	controlledTags,
	setControlledTags,
	controlledCategories,
	setControlledCategories,
	onTagsChange,
	onTagsChangeBatch,
	onCategoriesChange,
	onCategoriesChangeBatch,
	onClose,
	onBatchEditModeChange,
}: MultiSelectDetailsPaneProps) {
	const metadata = useMultiSelectMetadata(items);
	const isControlled = setControlledTags != null;
	const isCategoriesControlled = setControlledCategories != null;

	// Get global tags and categories
	const {tags: globalTags, addTag: addGlobalTag, tagExists} = useGlobalTags();
	const {
		categoriesWithSlugs: globalCategories,
		addCategory: addGlobalCategory,
		categoryExists,
	} = useGlobalCategories();

	const nameToSlug = (name: string) =>
		name
			.toLowerCase()
			.trim()
			.replace(/\s+/g, "-")
			.replace(/[^a-z0-9-]/g, "");

	const getTagBySlug = (slug: string): Tag | undefined =>
		globalTags.find((t: Tag) => t.slug === slug);
	const slugToDisplayName = (slug: string): string =>
		slug
			.split("-")
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
			.join(" ");
	const getDisplayName = (slug: string): string =>
		getTagBySlug(slug)?.name ?? slugToDisplayName(slug);
	const getSlugByName = (name: string): string => {
		const t = globalTags.find((tag: Tag) => tag.name.toLowerCase() === name.toLowerCase());
		return t?.slug ?? nameToSlug(name);
	};

	// Tags state: controlled from parent (Option 2) or local
	const [localTags, setLocalTags] = useState<string[]>(metadata.tags);
	const tags = isControlled ? (controlledTags ?? metadata.tags) : localTags;
	const setTags = (next: string[] | ((prev: string[]) => string[])) => {
		const value = typeof next === "function" ? next(tags) : next;
		if (isControlled) setControlledTags(value);
		else setLocalTags(value);
	};

	const [localCategories, setLocalCategories] = useState<string[]>(metadata.categories);
	const categories = isCategoriesControlled
		? (controlledCategories ?? metadata.categories)
		: localCategories;
	const setCategories = (next: string[] | ((prev: string[]) => string[])) => {
		const value = typeof next === "function" ? next(categories) : next;
		if (isCategoriesControlled) setControlledCategories(value);
		else setLocalCategories(value);
	};

	const getCategoryDisplayName = (slug: string): string =>
		globalCategories.find((c) => c.slug === slug)?.name ??
		slug
			.split("-")
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
			.join(" ");
	const getCategorySlugByName = (name: string): string => {
		const c = globalCategories.find((cat) => cat.name.toLowerCase() === name.toLowerCase());
		return c?.slug ?? nameToSlug(name);
	};

	const [newTag, setNewTag] = useState("");
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [tagsExpanded, setTagsExpanded] = useState(false);
	const [hoveredTagSlug, setHoveredTagSlug] = useState<string | null>(null);
	const [isBatchEditMode, setIsBatchEditMode] = useState(false);
	const [isCategoryBatchEditMode, setIsCategoryBatchEditMode] = useState(false);
	const [categoriesExpanded, setCategoriesExpanded] = useState(false);
	const [hoveredCategorySlug, setHoveredCategorySlug] = useState<string | null>(null);
	const [categoriesHoveredIndex, setCategoriesHoveredIndex] = useState<number | null>(null);
	const [newCategory, setNewCategory] = useState("");
	const [isPanelExpanded, setIsPanelExpanded] = useState(false);
	const [lastSummary, setLastSummary] = useState<string | null>(null);
	const [suggestLoading, setSuggestLoading] = useState(false);
	const [suggestedSlugs, setSuggestedSlugs] = useState<string[]>([]);
	const [suggestError, setSuggestError] = useState<string | null>(null);
	const [suggestEmpty, setSuggestEmpty] = useState(false);
	const [batchTagsExpanded, setBatchTagsExpanded] = useState(false);
	const [batchCategoriesExpanded, setBatchCategoriesExpanded] = useState(true);
	const initialTagsRef = useRef<string[]>([]);
	const initialCategoriesRef = useRef<string[]>([]);
	const hoverCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const categoryHoverCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	useEffect(
		() => () => {
			if (hoverCloseTimeoutRef.current) clearTimeout(hoverCloseTimeoutRef.current);
			if (categoryHoverCloseTimeoutRef.current)
				clearTimeout(categoryHoverCloseTimeoutRef.current);
		},
		[]
	);

	// When controlled and parent passes null, init from union
	useEffect(() => {
		if (isControlled && controlledTags === null && setControlledTags && items.length > 0) {
			setControlledTags(metadata.tags);
		}
	}, [isControlled, controlledTags, setControlledTags, items.length, metadata.tags.join(",")]);

	useEffect(() => {
		if (
			isCategoriesControlled &&
			controlledCategories === null &&
			setControlledCategories &&
			items.length > 0
		) {
			setControlledCategories(metadata.categories);
		}
	}, [
		isCategoriesControlled,
		controlledCategories,
		setControlledCategories,
		items.length,
		metadata.categories.join(","),
	]);

	// Sync tags when selection changes (new union) — only when not controlled and not in batch edit
	useEffect(() => {
		if (!isControlled && !isBatchEditMode) setLocalTags(metadata.tags);
	}, [isControlled, isBatchEditMode, metadata.tags.join(","), metadata.count]);

	useEffect(() => {
		if (!isCategoriesControlled && !isCategoryBatchEditMode)
			setLocalCategories(metadata.categories);
	}, [
		isCategoriesControlled,
		isCategoryBatchEditMode,
		metadata.categories.join(","),
		metadata.count,
	]);

	// Clear last summary when selection count changes
	useEffect(() => {
		setLastSummary(null);
	}, [metadata.count]);

	// When selection changes during batch edit, merge the new union into the batch so "union" works with subsequent items (different tags)
	const batchEditSelectionKeyRef = useRef<string>("");
	const selectionKeyForBatch = useMemo(
		() => (items.length > 0 ? [...items.map((i) => i.id)].sort().join(",") : ""),
		[items]
	);
	useEffect(() => {
		if (
			!isBatchEditMode ||
			items.length === 0 ||
			selectionKeyForBatch === batchEditSelectionKeyRef.current
		)
			return;
		batchEditSelectionKeyRef.current = selectionKeyForBatch;
		setTags((prev) => [...new Set([...prev, ...metadata.tags])]);
	}, [isBatchEditMode, selectionKeyForBatch, metadata.tags, items.length]);

	const TAGS_INITIAL_VISIBLE = 10;
	const CATEGORIES_INITIAL_VISIBLE = 10;
	// When not in batch edit, show only applied tags (union on items); when in batch edit, show draft tags
	const displayTags = isBatchEditMode ? tags : metadata.tags;
	const visibleTags = tagsExpanded ? displayTags : displayTags.slice(0, TAGS_INITIAL_VISIBLE);
	const hasMoreTags = displayTags.length > TAGS_INITIAL_VISIBLE;
	const hiddenCount = displayTags.length - TAGS_INITIAL_VISIBLE;

	const displayCategories = isCategoryBatchEditMode ? categories : metadata.categories;
	const visibleCategories = categoriesExpanded
		? displayCategories
		: displayCategories.slice(0, CATEGORIES_INITIAL_VISIBLE);
	const hasMoreCategories = displayCategories.length > CATEGORIES_INITIAL_VISIBLE;
	const hiddenCategoriesCount = displayCategories.length - CATEGORIES_INITIAL_VISIBLE;

	// Tags added in this batch (not in initial set when batch edit started)
	const addedTagsInBatch = isBatchEditMode
		? tags.filter((slug) => !initialTagsRef.current.includes(slug))
		: [];
	// Categories added in this batch
	const addedCategoriesInBatch = isCategoryBatchEditMode
		? categories.filter((slug) => !initialCategoriesRef.current.includes(slug))
		: [];

	const enterBatchEdit = () => {
		initialTagsRef.current = [...tags];
		setIsCategoryBatchEditMode(false);
		setIsBatchEditMode(true);
		setIsPanelExpanded(true);
		setLastSummary(null);
		setSuggestedSlugs([]);
		setSuggestError(null);
		setSuggestEmpty(false);
		onBatchEditModeChange?.({tags: true, categories: false});
	};
	const exitBatchEdit = (apply: boolean) => {
		if (!apply) setTags(metadata.tags);
		setIsBatchEditMode(false);
		setIsPanelExpanded(false);
		setSuggestedSlugs([]);
		setSuggestError(null);
		setSuggestEmpty(false);
		onBatchEditModeChange?.({tags: false, categories: isCategoryBatchEditMode});
	};

	const enterCategoryBatchEdit = () => {
		initialCategoriesRef.current = [...categories];
		setIsBatchEditMode(false);
		setIsCategoryBatchEditMode(true);
		setIsPanelExpanded(true);
		onBatchEditModeChange?.({tags: false, categories: true});
	};
	const exitCategoryBatchEdit = (apply: boolean) => {
		if (!apply) setCategories(metadata.categories);
		setIsCategoryBatchEditMode(false);
		onBatchEditModeChange?.({tags: isBatchEditMode, categories: false});
	};
	const handleApplyCategories = () => {
		if (!onCategoriesChangeBatch || items.length === 0) return;
		const initial = initialCategoriesRef.current;
		const removed = initial.filter((s) => !categories.includes(s));
		const added = categories.filter((s) => !initial.includes(s));
		const updates = items.map((item) => {
			const existing = item.categories ?? [];
			const withoutRemoved = existing.filter((slug) => !removed.includes(slug));
			const merged = Array.from(new Set([...withoutRemoved, ...added]));
			return {id: item.id, categories: merged};
		});
		onCategoriesChangeBatch(updates);
		exitCategoryBatchEdit(true);
	};

	const handleRemoveCategory = (slugToRemove: string) => {
		setCategories(categories.filter((slug) => slug !== slugToRemove));
	};
	const handleAddCategory = (value: string) => {
		if (!value.trim()) return;
		const isSlug = globalCategories.some((c) => c.slug === value);
		const slug = isSlug ? value : getCategorySlugByName(value);
		if (categories.includes(slug)) {
			setNewCategory("");
			return;
		}
		if (!isSlug && !categoryExists(value)) addGlobalCategory(value);
		setCategories([...categories, slug]);
		setNewCategory("");
	};

	const handleApply = () => {
		if (!onTagsChangeBatch || items.length === 0) return;
		const initial = initialTagsRef.current;
		const removed = initial.filter((s) => !tags.includes(s));
		const added = tags.filter((s) => !initial.includes(s));
		// Apply changes as per-item deltas so we don't overwrite
		// each item's unique tags with a single shared list.
		const updates = items.map((item) => {
			const existing = item.tags ?? [];
			const withoutRemoved = existing.filter((slug) => !removed.includes(slug));
			const merged = Array.from(new Set([...withoutRemoved, ...added]));
			return {id: item.id, tags: merged};
		});
		onTagsChangeBatch(updates);
		const parts: string[] = [];
		removed.forEach((slug) => {
			const count = items.filter((i) => (i.tags ?? []).includes(slug)).length;
			parts.push(
				`Removed ${getDisplayName(slug)} from ${count} ${count === 1 ? "item" : "items"}`
			);
		});
		if (added.length > 0) {
			parts.push(
				`Added ${added.map((s) => getDisplayName(s)).join(", ")} to ${items.length} ${items.length === 1 ? "item" : "items"}`
			);
		}
		setLastSummary(
			parts.length > 0
				? parts.join(". ")
				: `Updated tags on ${items.length} ${items.length === 1 ? "item" : "items"}`
		);
		exitBatchEdit(true);
	};

	// Tags are only persisted when user clicks Apply in batch edit (no auto-persist)

	const handleRemoveTag = (slugToRemove: string) => {
		setTags(tags.filter((slug) => slug !== slugToRemove));
	};

	const handleAddTag = (value: string) => {
		if (!value.trim()) return;
		const isSlug = globalTags.some((t: Tag) => t.slug === value);
		const slug = isSlug ? value : getSlugByName(value);
		if (tags.includes(slug)) {
			setNewTag("");
			return;
		}
		if (!isSlug && !tagExists(value)) addGlobalTag(value);
		setTags([...tags, slug]);
		setNewTag("");
	};

	const handleSuggestTagsForSelected = async () => {
		if (items.length === 0) return;
		setSuggestLoading(true);
		setSuggestError(null);
		setSuggestEmpty(false);
		setSuggestedSlugs([]);
		try {
			const settled = await Promise.allSettled(
				items.map((item) => {
					const imageUrl = getThumbnailForContent({
						id: item.id,
						name: item.name,
						baseType: item.baseType,
					});
					const payload: any = {
						itemName: item.name,
						contentTypeId: item.contentTypeId,
						imageUrl,
					};
					if (globalTags.length > 0) {
						payload.tagTaxonomy = globalTags.map((t: Tag) => ({
							name: t.name,
							slug: t.slug,
						}));
					}
					return fetch("/api/tags/suggest", {
						method: "POST",
						headers: {"Content-Type": "application/json"},
						body: JSON.stringify(payload),
					}).then(async (res) => {
						const data = await res.json();
						if (!res.ok) throw new Error(data.error || "Request failed");
						return {
							suggestedSlugs: data.suggestedSlugs ?? [],
							suggestedNewNames: data.suggestedNewNames ?? [],
						};
					});
				})
			);
			const allExisting = settled.flatMap((r) =>
				r.status === "fulfilled" ? r.value.suggestedSlugs : []
			);
			const allNewNames = settled.flatMap((r) =>
				r.status === "fulfilled" ? r.value.suggestedNewNames : []
			);
			const uniqueNewNames = Array.from(
				new Set(allNewNames.filter((n) => typeof n === "string" && n.trim()))
			);
			uniqueNewNames.forEach((name) => {
				const trimmed = name.trim();
				if (trimmed && !tagExists(trimmed)) addGlobalTag(trimmed);
			});
			const newSlugs = uniqueNewNames.map((n) => nameToSlug(n)).filter(Boolean);
			const merged = Array.from(new Set([...allExisting, ...newSlugs]));
			const notAlreadyApplied = merged.filter((s) => !tags.includes(s));
			setSuggestedSlugs(notAlreadyApplied);
			setSuggestEmpty(
				notAlreadyApplied.length === 0 && settled.some((r) => r.status === "fulfilled")
			);
			const allFailed = settled.every((r) => r.status === "rejected");
			if (allFailed && settled.length > 0) {
				setSuggestError("Tag suggestion isn't available");
			}
		} catch {
			setSuggestError("Tag suggestion isn't available");
		} finally {
			setSuggestLoading(false);
		}
	};

	const handleAddSuggestedTag = (slug: string) => {
		handleAddTag(slug);
		setSuggestedSlugs((prev) => prev.filter((s) => s !== slug));
	};

	const handleAddAllSuggested = () => {
		const combined = [...tags];
		suggestedSlugs.forEach((slug) => {
			if (!combined.includes(slug)) combined.push(slug);
		});
		setTags(combined);
		setSuggestedSlugs([]);
	};

	const filteredTags = globalTags.filter(
		(tag: Tag) => !newTag || tag.name.toLowerCase().includes(newTag.toLowerCase())
	);

	const autocompleteOptions = filteredTags.map((tag: Tag) => ({
		label: tag.name,
		value: tag.slug,
		isSelected: tags.includes(tag.slug),
	}));

	const customTagName = newTag.trim();
	const hasCustomOption =
		customTagName &&
		!globalTags.some((t: Tag) => t.name.toLowerCase() === customTagName.toLowerCase());
	if (hasCustomOption) {
		autocompleteOptions.push({
			label: `+ Add "${customTagName}" tag`,
			value: customTagName,
			isSelected: tags.some((s) => getDisplayName(s) === customTagName),
		});
	}

	const filteredCategories = globalCategories.filter(
		(c) => !newCategory || c.name.toLowerCase().includes(newCategory.toLowerCase())
	);
	const categoryAutocompleteOptions: AutocompleteOption[] = filteredCategories.map((c) => ({
		label: c.name,
		value: c.slug,
		isSelected: categories.includes(c.slug),
	}));
	const customCategoryName = newCategory.trim();
	const hasCustomCategoryOption =
		customCategoryName &&
		!globalCategories.some((c) => c.name.toLowerCase() === customCategoryName.toLowerCase());
	if (hasCustomCategoryOption) {
		categoryAutocompleteOptions.push({
			label: `+ Add "${customCategoryName}" category`,
			value: customCategoryName,
			isSelected: categories.some((s) => getCategoryDisplayName(s) === customCategoryName),
		});
	}

	const paneWidth = isPanelExpanded ? "480px" : "316px";

	return (
		<Box
			display="flex"
			flexDirection="column"
			h="full"
			overflow="hidden"
			style={{width: paneWidth, transition: "width 0.2s ease"}}
		>
			{/* Header */}
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				px="24"
				py="24"
				style={{flexShrink: 0, borderBottom: "1px solid var(--ax-colors-border-tertiary)"}}
			>
				<Box display="flex" alignItems="center" gap="8">
					{(isBatchEditMode || isCategoryBatchEditMode) && (
						<Button
							appearance="subtle"
							size="sm"
							onClick={() => {
								if (isBatchEditMode) exitBatchEdit(false);
								else exitCategoryBatchEdit(false);
							}}
							aria-label="Back to summary"
							icon={<IconArrowLeft size={16} />}
						/>
					)}
					<Text fontSize="lg" fontWeight="600">
						{isBatchEditMode
							? `Batch edit tags (${metadata.count})`
							: isCategoryBatchEditMode
								? `Batch edit categories (${metadata.count})`
								: `${metadata.count} items selected`}
					</Text>
				</Box>
				<Box display="flex" alignItems="center" gap="4">
					{isBatchEditMode && (
						<Button
							appearance="subtle"
							size="sm"
							onClick={() => setIsPanelExpanded(!isPanelExpanded)}
							aria-label={isPanelExpanded ? "Collapse panel" : "Expand panel"}
							icon={
								isPanelExpanded ? (
									<IconChevronRight size={16} />
								) : (
									<IconChevronLeft size={16} />
								)
							}
						/>
					)}
					{isCategoryBatchEditMode && (
						<Button
							appearance="subtle"
							size="sm"
							onClick={() => setIsPanelExpanded(!isPanelExpanded)}
							aria-label={isPanelExpanded ? "Collapse panel" : "Expand panel"}
							icon={
								isPanelExpanded ? (
									<IconChevronRight size={16} />
								) : (
									<IconChevronLeft size={16} />
								)
							}
						/>
					)}
					<Button
						appearance="subtle"
						size="sm"
						onClick={onClose}
						aria-label="Close details pane"
						icon={<IconXmark size={16} />}
					/>
				</Box>
			</Box>

			{/* Batch-edit view (pane takeover) */}
			{isBatchEditMode || isCategoryBatchEditMode ? (
				<Box
					flex="1"
					display="flex"
					flexDirection="column"
					gap="16"
					px="24"
					py="24"
					overflow="hidden"
					style={{minHeight: 0}}
				>
					{isBatchEditMode && (
						<>
							{/* Tags */}
							<Box
								display="flex"
								flexDirection="column"
								gap="8"
								style={{flexShrink: 0}}
							>
								<Text fontSize="sm" fontWeight="600" color="fg.default">
									Tags
								</Text>
								<Popover
									open={newTag.length > 0 && autocompleteOptions.length > 0}
									onOpenChange={() => {}}
								>
									<PopoverTrigger asChild>
										<Box>
											<Input
												value={newTag}
												onChange={(e) => setNewTag(e.target.value)}
												onKeyPress={(e) => {
													if (
														e.key === "Enter" &&
														autocompleteOptions.length > 0
													) {
														handleAddTag(autocompleteOptions[0].value);
													}
												}}
												placeholder="Search..."
												size="md"
												addonAfter={
													<Tooltip content="Generate tag suggestions for the selected items using Opal">
														<Button
															appearance="default-opal"
															size="sm"
															rounded="sm"
															px="8"
															className="opalGenerateButton"
															icon={<IconSparkles />}
															onClick={(e) => {
																e.preventDefault();
																handleSuggestTagsForSelected();
															}}
															disabled={suggestLoading}
															loading={suggestLoading}
															aria-label="Suggest tags for selected with Opal"
														/>
													</Tooltip>
												}
											/>
										</Box>
									</PopoverTrigger>
									<PopoverContent
										side="bottom"
										sideOffset={4}
										align="start"
										style={{width: "var(--radix-popover-trigger-width)"}}
										onOpenAutoFocus={(e) => e.preventDefault()}
										onCloseAutoFocus={(e) => e.preventDefault()}
									>
										<Box
											display="flex"
											flexDirection="column"
											gap="0"
											py="2"
											style={{maxHeight: "200px"}}
											overflow="auto"
										>
											{autocompleteOptions.map(
												(option: AutocompleteOption, index: number) => (
													<Box
														key={option.value}
														display="flex"
														alignItems="center"
														gap="8"
														px="8"
														py="6"
														rounded="sm"
														cursor="pointer"
														transition="colors"
														bg={
															hoveredIndex === index
																? "bg.secondary"
																: "transparent"
														}
														onClick={() => handleAddTag(option.value)}
														onMouseEnter={() => setHoveredIndex(index)}
														onMouseLeave={() => setHoveredIndex(null)}
													>
														{option.isSelected && (
															<IconCheck
																size={14}
																style={{flexShrink: 0}}
															/>
														)}
														<Text
															fontSize="sm"
															color="fg.default"
															style={{
																marginLeft: option.isSelected
																	? 0
																	: undefined,
															}}
														>
															{option.label}
														</Text>
													</Box>
												)
											)}
										</Box>
									</PopoverContent>
								</Popover>
								{suggestError && (
									<Text fontSize="xs" color="fg.error">
										{suggestError}
									</Text>
								)}
								{suggestEmpty && !suggestLoading && (
									<Text fontSize="xs" color="fg.secondary">
										No related tags found for this selection.
									</Text>
								)}
								{suggestLoading && (
									<Box display="flex" flexDirection="column" gap="4">
										<Text fontSize="xs" color="fg.secondary" fontWeight="600">
											Suggested
										</Text>
										<Box
											display="flex"
											flexWrap="wrap"
											gap="4"
											alignItems="center"
										>
											{[1, 2, 3, 4].map((i) => (
												<Skeleton
													key={i}
													h="24"
													style={{
														width: `${60 + i * 24}px`,
														borderRadius: "4px",
													}}
													className="opal-skeleton-shimmer"
												/>
											))}
										</Box>
									</Box>
								)}
								{!suggestLoading && suggestedSlugs.length > 0 && (
									<Box display="flex" flexDirection="column" gap="4">
										<Text fontSize="xs" color="fg.secondary" fontWeight="600">
											Suggested
										</Text>
										<Box
											display="flex"
											flexWrap="wrap"
											gap="4"
											alignItems="center"
										>
											{suggestedSlugs.map((slug) => (
												<Badge key={slug} variant="subtle">
													<Box display="flex" alignItems="center" gap="4">
														<span>{getDisplayName(slug)}</span>
														<button
															type="button"
															onClick={() =>
																handleAddSuggestedTag(slug)
															}
															style={{
																background: "none",
																border: "none",
																cursor: "pointer",
																padding: 0,
																display: "flex",
																alignItems: "center",
																fontSize: "14px",
																fontWeight: "500",
																lineHeight: 1,
																color: "inherit",
															}}
															aria-label={`Add ${getDisplayName(slug)}`}
														>
															+
														</button>
													</Box>
												</Badge>
											))}
											<Button
												appearance="subtle"
												size="sm"
												onClick={handleAddAllSuggested}
												aria-label="Add all suggested tags to selected items"
											>
												Add all
											</Button>
										</Box>
									</Box>
								)}
								{tags.length > 0 && (
									<Disclosure
										open={batchTagsExpanded}
										onOpenChange={setBatchTagsExpanded}
									>
										<DisclosureTrigger asChild>
											<button
												type="button"
												style={{
													display: "flex",
													alignItems: "center",
													gap: "8px",
													cursor: "pointer",
													padding: "8px 0",
													border: "none",
													background: "transparent",
													width: "100%",
												}}
											>
												<Text
													fontSize="xs"
													color="fg.secondary"
													fontWeight="600"
												>
													Batch tags ({tags.length})
												</Text>
												<Box
													style={{
														transform: batchTagsExpanded
															? "rotate(90deg)"
															: "rotate(0deg)",
														transition: "transform 0.2s",
														display: "flex",
														alignItems: "center",
													}}
												>
													<IconChevronRight size={14} />
												</Box>
											</button>
										</DisclosureTrigger>
										<DisclosureContent>
											<Box
												display="flex"
												flexDirection="column"
												gap="8"
												pt="8"
											>
												{tags.map((slug) => {
													const itemsWithTag = items.filter((item) =>
														(item.tags ?? []).includes(slug)
													);
													const count = itemsWithTag.length;
													const isAddedInBatch =
														addedTagsInBatch.includes(slug);
													return (
														<Box
															key={slug}
															display="flex"
															alignItems="center"
															gap="4"
														>
															<Badge
																intent={
																	isAddedInBatch
																		? "success"
																		: "neutral"
																}
																variant={
																	isAddedInBatch
																		? "subtle"
																		: undefined
																}
															>
																<Box
																	display="flex"
																	alignItems="center"
																	gap="4"
																>
																	<span>
																		{getDisplayName(slug)}
																	</span>
																	{!isAddedInBatch && (
																		<Text
																			fontSize="xs"
																			color="fg.secondary"
																			style={{
																				fontWeight: 400,
																			}}
																		>
																			on {count}{" "}
																			{count === 1
																				? "item"
																				: "items"}
																		</Text>
																	)}
																	<button
																		onClick={() =>
																			handleRemoveTag(slug)
																		}
																		style={{
																			background: "none",
																			border: "none",
																			cursor: "pointer",
																			padding: 0,
																			display: "flex",
																			alignItems: "center",
																			fontSize: "14px",
																			fontWeight: "500",
																			lineHeight: 1,
																			color: "inherit",
																		}}
																		aria-label={`Remove tag ${getDisplayName(slug)}`}
																	>
																		×
																	</button>
																</Box>
															</Badge>
														</Box>
													);
												})}
											</Box>
										</DisclosureContent>
									</Disclosure>
								)}
							</Box>
							{/* Tag preview (fills remaining height, scrolls within) */}
							<Box
								display="flex"
								flexDirection="column"
								gap="12"
								flex="1"
								style={{minHeight: 0}}
								overflow="hidden"
							>
								{(() => {
									// Calculate summary stats
									const initial = initialTagsRef.current;
									const tagsBeingAdded = tags.filter((s) => !initial.includes(s));
									const tagsBeingRemoved = initial.filter(
										(s) => !tags.includes(s)
									);
									const itemsWithChanges = items.filter((item) => {
										const itemTags = item.tags ?? [];
										const hasRemovals = initial.some(
											(s) => itemTags.includes(s) && !tags.includes(s)
										);
										const hasAdditions = tags.some(
											(s) => !itemTags.includes(s)
										);
										return hasRemovals || hasAdditions;
									});

									return (
										(tagsBeingAdded.length > 0 ||
											tagsBeingRemoved.length > 0) && (
											<Alert
												intent="information"
												rounded="md"
												style={{flexShrink: 0}}
											>
												<Box display="flex" flexDirection="column" gap="4">
													<Text fontSize="sm" fontWeight="600">
														Summary of changes
													</Text>
													<Text fontSize="sm">
														{itemsWithChanges.length} of {items.length}{" "}
														{items.length === 1 ? "item" : "items"} will
														be modified
														{tagsBeingAdded.length > 0 &&
															` • Adding ${tagsBeingAdded.length} tag${tagsBeingAdded.length === 1 ? "" : "s"}`}
														{tagsBeingRemoved.length > 0 &&
															` • Removing ${tagsBeingRemoved.length} tag${tagsBeingRemoved.length === 1 ? "" : "s"}`}
													</Text>
												</Box>
											</Alert>
										)
									);
								})()}
								<Text
									fontSize="sm"
									fontWeight="600"
									color="fg.default"
									style={{flexShrink: 0}}
								>
									Tag preview
								</Text>
								<Box
									display="flex"
									flexDirection="column"
									gap="8"
									flex="1"
									style={{minHeight: 0}}
									overflow="auto"
								>
									{items
										.slice(0, items.length > 20 ? 15 : items.length)
										.map((item) => {
											const itemTags = item.tags ?? [];
											// Union of item's current tags and batch selection: show removed, kept, and added
											const allSlugsForItem = Array.from(
												new Set([...itemTags, ...tags])
											);
											const hasAnyTags = allSlugsForItem.length > 0;
											return (
												<Box
													key={item.id}
													display="flex"
													flexDirection="column"
													gap="6"
													px="12"
													py="10"
													rounded="sm"
													style={{
														backgroundColor:
															"var(--ax-colors-bg-subtle)",
														border: "1px solid var(--ax-colors-border-tertiary)",
													}}
												>
													<Box
														display="flex"
														alignItems="center"
														gap="6"
														style={{minWidth: 0}}
													>
														<Box
															style={{
																flexShrink: 0,
																color: "var(--ax-colors-fg-secondary)",
															}}
														>
															{getIconForType(item.baseType)}
														</Box>
														<span
															title={String(item.name ?? item.id)}
															style={{
																fontSize: "14px",
																fontWeight: 600,
																lineHeight: 1.3,
																color: "var(--ax-colors-fg-default)",
																overflow: "hidden",
																textOverflow: "ellipsis",
																whiteSpace: "nowrap",
																minWidth: 0,
															}}
														>
															{item.name ?? item.id}
														</span>
													</Box>
													{hasAnyTags ? (
														<Box display="flex" flexWrap="wrap" gap="6">
															{allSlugsForItem.map((slug) => {
																const wasOnItem =
																	itemTags.includes(slug);
																const isInBatch =
																	tags.includes(slug);
																const isRemoved =
																	wasOnItem && !isInBatch; // removed from batch → red + strikethrough
																const willBeAdded =
																	!wasOnItem && isInBatch;
																const isNewTag =
																	willBeAdded &&
																	addedTagsInBatch.includes(slug); // new in this batch → green
																const canRemove = isInBatch; // remove from batch; pill stays and shows red + strikethrough

																// Calculate tooltip content
																const tooltipContent = isRemoved
																	? `Will remove from all ${items.length} ${items.length === 1 ? "item" : "items"}`
																	: isNewTag
																		? `Will add to all ${items.length} ${items.length === 1 ? "item" : "items"}`
																		: `Common to all items`;

																return (
																	<Tooltip
																		key={slug}
																		content={tooltipContent}
																	>
																		<Badge
																			intent={
																				isRemoved
																					? "danger"
																					: isNewTag
																						? "success"
																						: "neutral"
																			}
																			variant={
																				isRemoved ||
																				isNewTag
																					? "subtle"
																					: undefined
																			}
																			style={
																				isRemoved
																					? {
																							textDecoration:
																								"line-through",
																						}
																					: undefined
																			}
																		>
																			<Box
																				display="flex"
																				alignItems="center"
																				gap="4"
																			>
																				<span>
																					{getDisplayName(
																						slug
																					)}
																				</span>
																				{canRemove && (
																					<button
																						type="button"
																						onClick={(
																							e
																						) => {
																							e.stopPropagation();
																							handleRemoveTag(
																								slug
																							);
																						}}
																						aria-label={`Remove ${getDisplayName(slug)} from batch`}
																						style={{
																							background:
																								"none",
																							border: "none",
																							cursor: "pointer",
																							padding: 0,
																							display:
																								"flex",
																							alignItems:
																								"center",
																							justifyContent:
																								"center",
																							fontSize:
																								"14px",
																							lineHeight: 1,
																							color: "inherit",
																							opacity: 0.8,
																						}}
																					>
																						×
																					</button>
																				)}
																			</Box>
																		</Badge>
																	</Tooltip>
																);
															})}
														</Box>
													) : (
														<Text fontSize="xs" color="fg.tertiary">
															No tags
														</Text>
													)}
												</Box>
											);
										})}
									{items.length > 20 && (
										<Text
											fontSize="xs"
											color="fg.tertiary"
											style={{paddingLeft: "4px"}}
										>
											… and {items.length - 15} more items
										</Text>
									)}
								</Box>
							</Box>
							{/* Apply / Back */}
							<Box
								display="flex"
								alignItems="center"
								gap="8"
								mt="8"
								style={{
									flexShrink: 0,
									paddingTop: "16px",
									borderTop: "1px solid var(--ax-colors-border-tertiary)",
								}}
							>
								<Text fontSize="xs" color="fg.secondary" style={{flex: 1}}>
									Changes apply to all selected items.
								</Text>
								<Button
									appearance="subtle"
									size="md"
									onClick={() => exitBatchEdit(false)}
								>
									Back
								</Button>
								<Button appearance="primary" size="md" onClick={handleApply}>
									Apply
								</Button>
							</Box>
						</>
					)}

					{isCategoryBatchEditMode && (
						<>
							{/* Categories */}
							<Box
								display="flex"
								flexDirection="column"
								gap="8"
								style={{flexShrink: 0}}
							>
								<Text fontSize="sm" fontWeight="600" color="fg.default">
									Categories
								</Text>
								<Popover
									open={
										newCategory.length > 0 &&
										categoryAutocompleteOptions.length > 0
									}
									onOpenChange={() => {}}
								>
									<PopoverTrigger asChild>
										<Box>
											<Input
												value={newCategory}
												onChange={(e) => setNewCategory(e.target.value)}
												onKeyPress={(e) => {
													if (
														e.key === "Enter" &&
														categoryAutocompleteOptions.length > 0
													) {
														handleAddCategory(
															categoryAutocompleteOptions[0].value
														);
													}
												}}
												placeholder="Search..."
												size="md"
											/>
										</Box>
									</PopoverTrigger>
									<PopoverContent
										side="bottom"
										sideOffset={4}
										align="start"
										style={{width: "var(--radix-popover-trigger-width)"}}
										onOpenAutoFocus={(e) => e.preventDefault()}
										onCloseAutoFocus={(e) => e.preventDefault()}
									>
										<Box
											display="flex"
											flexDirection="column"
											gap="0"
											py="2"
											style={{maxHeight: "200px"}}
											overflow="auto"
										>
											{categoryAutocompleteOptions.map(
												(option: AutocompleteOption, index: number) => (
													<Box
														key={option.value}
														display="flex"
														alignItems="center"
														gap="8"
														px="8"
														py="6"
														rounded="sm"
														cursor="pointer"
														transition="colors"
														bg={
															categoriesHoveredIndex === index
																? "bg.secondary"
																: "transparent"
														}
														onClick={() =>
															handleAddCategory(option.value)
														}
														onMouseEnter={() =>
															setCategoriesHoveredIndex(index)
														}
														onMouseLeave={() =>
															setCategoriesHoveredIndex(null)
														}
													>
														{option.isSelected && (
															<IconCheck
																size={14}
																style={{flexShrink: 0}}
															/>
														)}
														<Text
															fontSize="sm"
															color="fg.default"
															style={{
																marginLeft: option.isSelected
																	? 0
																	: undefined,
															}}
														>
															{option.label}
														</Text>
													</Box>
												)
											)}
										</Box>
									</PopoverContent>
								</Popover>
								{categories.length > 0 && (
									<Disclosure
										open={batchCategoriesExpanded}
										onOpenChange={setBatchCategoriesExpanded}
									>
										<DisclosureTrigger asChild>
											<button
												type="button"
												style={{
													display: "flex",
													alignItems: "center",
													gap: "8px",
													cursor: "pointer",
													padding: "8px 0",
													border: "none",
													background: "transparent",
													width: "100%",
												}}
											>
												<Text
													fontSize="xs"
													color="fg.secondary"
													fontWeight="600"
												>
													Batch categories ({categories.length})
												</Text>
												<Box
													style={{
														transform: batchCategoriesExpanded
															? "rotate(90deg)"
															: "rotate(0deg)",
														transition: "transform 0.2s",
														display: "flex",
														alignItems: "center",
													}}
												>
													<IconChevronRight size={14} />
												</Box>
											</button>
										</DisclosureTrigger>
										<DisclosureContent>
											<Box
												display="flex"
												flexDirection="column"
												gap="8"
												pt="8"
											>
												{categories.map((slug) => {
													const itemsWithCategory = items.filter((item) =>
														(item.categories ?? []).includes(slug)
													);
													const count = itemsWithCategory.length;
													const isAddedInBatch =
														addedCategoriesInBatch.includes(slug);
													return (
														<Box
															key={slug}
															display="flex"
															alignItems="center"
															gap="4"
														>
															<Badge
																intent={
																	isAddedInBatch
																		? "success"
																		: "neutral"
																}
																variant={
																	isAddedInBatch
																		? "subtle"
																		: undefined
																}
															>
																<Box
																	display="flex"
																	alignItems="center"
																	gap="4"
																>
																	<span>
																		{getCategoryDisplayName(
																			slug
																		)}
																	</span>
																	{!isAddedInBatch && (
																		<Text
																			fontSize="xs"
																			color="fg.secondary"
																			style={{
																				fontWeight: 400,
																			}}
																		>
																			on {count}{" "}
																			{count === 1
																				? "item"
																				: "items"}
																		</Text>
																	)}
																	<button
																		onClick={() =>
																			handleRemoveCategory(
																				slug
																			)
																		}
																		style={{
																			background: "none",
																			border: "none",
																			cursor: "pointer",
																			padding: 0,
																			display: "flex",
																			alignItems: "center",
																			fontSize: "14px",
																			fontWeight: "500",
																			lineHeight: "1",
																			color: "inherit",
																		}}
																		aria-label={`Remove category ${getCategoryDisplayName(slug)}`}
																	>
																		×
																	</button>
																</Box>
															</Badge>
														</Box>
													);
												})}
											</Box>
										</DisclosureContent>
									</Disclosure>
								)}
							</Box>
							{/* Category preview (fills remaining height, scrolls within) */}
							<Box
								display="flex"
								flexDirection="column"
								gap="12"
								flex="1"
								style={{minHeight: 0}}
								overflow="hidden"
							>
								<Text
									fontSize="sm"
									fontWeight="600"
									color="fg.default"
									style={{flexShrink: 0}}
								>
									Category preview
								</Text>
								<Box
									display="flex"
									flexDirection="column"
									gap="8"
									flex="1"
									style={{minHeight: 0}}
									overflow="auto"
								>
									{items
										.slice(0, items.length > 20 ? 15 : items.length)
										.map((item) => {
											const itemCategories = item.categories ?? [];
											const allSlugsForItem = Array.from(
												new Set([...itemCategories, ...categories])
											);
											const hasAnyCategories = allSlugsForItem.length > 0;
											return (
												<Box
													key={item.id}
													display="flex"
													flexDirection="column"
													gap="6"
													px="12"
													py="10"
													rounded="sm"
													style={{
														backgroundColor:
															"var(--ax-colors-bg-subtle)",
														border: "1px solid var(--ax-colors-border-tertiary)",
													}}
												>
													<Box
														display="flex"
														alignItems="center"
														gap="6"
														style={{minWidth: 0}}
													>
														<Box
															style={{
																flexShrink: 0,
																color: "var(--ax-colors-fg-secondary)",
															}}
														>
															{getIconForType(item.baseType)}
														</Box>
														<span
															title={String(item.name ?? item.id)}
															style={{
																fontSize: "14px",
																fontWeight: 600,
																lineHeight: 1.3,
																color: "var(--ax-colors-fg-default)",
																overflow: "hidden",
																textOverflow: "ellipsis",
																whiteSpace: "nowrap",
																minWidth: 0,
															}}
														>
															{item.name ?? item.id}
														</span>
													</Box>
													{hasAnyCategories ? (
														<Box display="flex" flexWrap="wrap" gap="6">
															{allSlugsForItem.map((slug) => {
																const wasOnItem =
																	itemCategories.includes(slug);
																const isInBatch =
																	categories.includes(slug);
																const isRemoved =
																	wasOnItem && !isInBatch;
																const willBeAdded =
																	!wasOnItem && isInBatch;
																const isNewCategory =
																	willBeAdded &&
																	addedCategoriesInBatch.includes(
																		slug
																	);
																const isMissingOnThisItem =
																	willBeAdded && !isNewCategory;
																return (
																	<Badge
																		key={slug}
																		intent={
																			isRemoved
																				? "danger"
																				: isNewCategory
																					? "success"
																					: isMissingOnThisItem
																						? "warning"
																						: "neutral"
																		}
																		variant={
																			isRemoved ||
																			isNewCategory ||
																			isMissingOnThisItem
																				? "subtle"
																				: undefined
																		}
																		style={
																			isRemoved
																				? {
																						textDecoration:
																							"line-through",
																					}
																				: undefined
																		}
																	>
																		{getCategoryDisplayName(
																			slug
																		)}
																	</Badge>
																);
															})}
														</Box>
													) : (
														<Text fontSize="xs" color="fg.tertiary">
															No categories
														</Text>
													)}
												</Box>
											);
										})}
									{items.length > 20 && (
										<Text
											fontSize="xs"
											color="fg.tertiary"
											style={{paddingLeft: "4px"}}
										>
											… and {items.length - 15} more items
										</Text>
									)}
								</Box>
							</Box>
							{/* Apply / Back */}
							<Box
								display="flex"
								alignItems="center"
								gap="8"
								mt="8"
								style={{
									flexShrink: 0,
									paddingTop: "16px",
									borderTop: "1px solid var(--ax-colors-border-tertiary)",
								}}
							>
								<Text fontSize="xs" color="fg.secondary" style={{flex: 1}}>
									Changes apply to all selected items.
								</Text>
								<Button
									appearance="subtle"
									size="md"
									onClick={() => exitCategoryBatchEdit(false)}
								>
									Back
								</Button>
								<Button
									appearance="primary"
									size="md"
									onClick={handleApplyCategories}
								>
									Apply
								</Button>
							</Box>
						</>
					)}
				</Box>
			) : (
				/* Summary view */
				<Box
					flex="1"
					overflow="auto"
					display="flex"
					flexDirection="column"
					gap="16"
					px="24"
					py="24"
				>
					{lastSummary && (
						<Box
							py="8"
							px="12"
							rounded="sm"
							style={{
								backgroundColor: "var(--ax-colors-bg-subtle)",
								border: "1px solid var(--ax-colors-border-tertiary)",
							}}
						>
							<Text fontSize="xs" color="fg.secondary">
								{lastSummary}
							</Text>
						</Box>
					)}
					{/* Preview - Stacked Icon for Multiple Selection */}
					<Box
						display="flex"
						alignItems="center"
						justifyContent="center"
						style={{
							borderRadius: "4px",
							backgroundColor: "var(--ax-colors-bg-subtle)",
							height: "180px",
							color: "var(--ax-colors-fg-secondary)",
						}}
					>
						<IconStack2 size={80} />
					</Box>

					{/* Asset Information */}
					<Disclosure defaultOpen>
						<DisclosureTrigger chevronPosition="start">
							<Text asChild fontSize="sm" fontWeight="600" color="fg.default">
								<span>Asset Information</span>
							</Text>
						</DisclosureTrigger>
						<DisclosureContent asChild>
							<Box
								display="flex"
								flexDirection="column"
								gap="12"
								mt="8"
								style={{paddingLeft: "20px"}}
							>
								<Box display="flex" flexDirection="column" gap="4">
									<Text
										fontSize="xs"
										color="fg.secondary"
										style={{lineHeight: "14px", letterSpacing: "0.06px"}}
									>
										Last updated date range
									</Text>
									<Text fontSize="sm" color="fg.default">
										{metadata.dateRange.earliest} - {metadata.dateRange.latest}
									</Text>
								</Box>

								<Box display="flex" flexDirection="column" gap="4">
									<Text
										fontSize="xs"
										color="fg.secondary"
										style={{lineHeight: "14px", letterSpacing: "0.06px"}}
									>
										Alt text
									</Text>
									<Box display="flex" gap="8" alignItems="center">
										<Text fontSize="sm" color="fg.default">
											Multiple
										</Text>
										<Text
											fontSize="xs"
											style={{
												color: "#002ccc",
												cursor: "pointer",
												textDecoration: "underline",
											}}
										>
											Show all
										</Text>
									</Box>
								</Box>

								<Box display="flex" flexDirection="column" gap="4">
									<Text
										fontSize="xs"
										color="fg.secondary"
										style={{lineHeight: "14px", letterSpacing: "0.06px"}}
									>
										Total file size
									</Text>
									<Text fontSize="sm" color="fg.default">
										{metadata.totalFileSize}
									</Text>
								</Box>
							</Box>
						</DisclosureContent>
					</Disclosure>

					{/* Tags */}
					<Disclosure defaultOpen>
						<DisclosureTrigger
							chevronPosition="start"
							addonAfter={
								items.length >= 2 ? (
									<Button
										appearance="default"
										size="sm"
										fontWeight="500"
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											enterBatchEdit();
										}}
										aria-label="Batch edit"
									>
										Batch edit
									</Button>
								) : undefined
							}
						>
							<Text asChild fontSize="sm" fontWeight="600" color="fg.default">
								<span>Tags</span>
							</Text>
						</DisclosureTrigger>
						<DisclosureContent asChild>
							<Box
								display="flex"
								flexDirection="column"
								gap="8"
								mt="8"
								style={{paddingLeft: "20px"}}
							>
								{/* Applied tags only (read-only); edit via Batch edit */}
								<Box display="flex" flexDirection="column" gap="8">
									<Box display="flex" flexDirection="column" gap="8">
										{visibleTags.map((slug) => {
											const itemsWithTag = items.filter((item) =>
												(item.tags ?? []).includes(slug)
											);
											const count = itemsWithTag.length;
											const isHoverOpen = hoveredTagSlug === slug;
											const clearCloseTimeout = () => {
												if (hoverCloseTimeoutRef.current) {
													clearTimeout(hoverCloseTimeoutRef.current);
													hoverCloseTimeoutRef.current = null;
												}
											};
											const scheduleClose = () => {
												clearCloseTimeout();
												hoverCloseTimeoutRef.current = setTimeout(
													() => setHoveredTagSlug(null),
													150
												);
											};
											return (
												<Box
													key={slug}
													display="flex"
													alignItems="center"
													flexWrap="wrap"
												>
													<Popover
														open={isHoverOpen}
														onOpenChange={(open) =>
															!open && setHoveredTagSlug(null)
														}
													>
														<PopoverTrigger asChild>
															<Box
																display="inline-flex"
																onMouseEnter={() => {
																	clearCloseTimeout();
																	setHoveredTagSlug(slug);
																}}
																onMouseLeave={scheduleClose}
															>
																<Badge intent="neutral">
																	<Box
																		display="flex"
																		alignItems="center"
																		gap="4"
																	>
																		<span>
																			{getDisplayName(slug)}
																		</span>
																		<Text
																			fontSize="xs"
																			color="fg.secondary"
																			style={{
																				fontWeight: 400,
																			}}
																		>
																			on {count}{" "}
																			{count === 1
																				? "item"
																				: "items"}
																		</Text>
																		{isBatchEditMode && (
																			<button
																				onClick={() =>
																					handleRemoveTag(
																						slug
																					)
																				}
																				style={{
																					background:
																						"none",
																					border: "none",
																					cursor: "pointer",
																					padding: "0",
																					display: "flex",
																					alignItems:
																						"center",
																					fontSize:
																						"14px",
																					fontWeight:
																						"500",
																					lineHeight: "1",
																					color: "inherit",
																				}}
																				aria-label={`Remove tag ${getDisplayName(slug)}`}
																			>
																				×
																			</button>
																		)}
																	</Box>
																</Badge>
															</Box>
														</PopoverTrigger>
														<PopoverContent
															side="bottom"
															sideOffset={4}
															align="start"
															style={{
																width: "240px",
																maxHeight: "280px",
															}}
															onMouseEnter={clearCloseTimeout}
															onMouseLeave={scheduleClose}
														>
															<Box
																display="flex"
																flexDirection="column"
																py="2"
																px="2"
																style={{
																	maxHeight: "260px",
																	overflow: "auto",
																}}
															>
																<Text
																	fontSize="xs"
																	color="fg.secondary"
																	mb="2"
																	style={{paddingLeft: "4px"}}
																>
																	{count}{" "}
																	{count === 1 ? "item" : "items"}{" "}
																	with this tag
																</Text>
																{itemsWithTag.map((item) => (
																	<Text
																		key={item.id}
																		fontSize="sm"
																		color="fg.default"
																		style={{
																			padding: "6px 8px",
																			borderRadius: "4px",
																			whiteSpace: "nowrap",
																			overflow: "hidden",
																			textOverflow:
																				"ellipsis",
																		}}
																	>
																		{item.name ?? item.id}
																	</Text>
																))}
															</Box>
														</PopoverContent>
													</Popover>
												</Box>
											);
										})}
									</Box>
									{hasMoreTags && (
										<Button
											appearance="subtle"
											size="sm"
											onClick={() => setTagsExpanded(!tagsExpanded)}
											aria-expanded={tagsExpanded}
										>
											{tagsExpanded
												? "Show less"
												: `Show ${hiddenCount} more`}
										</Button>
									)}
								</Box>
							</Box>
						</DisclosureContent>
					</Disclosure>

					{/* Categories */}
					<Disclosure defaultOpen>
						<DisclosureTrigger
							chevronPosition="start"
							addonAfter={
								items.length >= 2 ? (
									<Button
										appearance="default"
										size="sm"
										fontWeight="500"
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											enterCategoryBatchEdit();
										}}
										aria-label="Batch edit categories"
									>
										Batch edit
									</Button>
								) : undefined
							}
						>
							<Text asChild fontSize="sm" fontWeight="600" color="fg.default">
								<span>Categories</span>
							</Text>
						</DisclosureTrigger>
						<DisclosureContent asChild>
							<Box
								display="flex"
								flexDirection="column"
								gap="8"
								mt="8"
								style={{paddingLeft: "20px"}}
							>
								<Box display="flex" flexDirection="column" gap="8">
									<Box display="flex" flexDirection="column" gap="8">
										{visibleCategories.length > 0 ? (
											visibleCategories.map((slug) => {
												const itemsWithCategory = items.filter((item) =>
													(item.categories ?? []).includes(slug)
												);
												const count = itemsWithCategory.length;
												const isHoverOpen = hoveredCategorySlug === slug;
												const clearCloseTimeout = () => {
													if (categoryHoverCloseTimeoutRef.current) {
														clearTimeout(
															categoryHoverCloseTimeoutRef.current
														);
														categoryHoverCloseTimeoutRef.current = null;
													}
												};
												const scheduleClose = () => {
													clearCloseTimeout();
													categoryHoverCloseTimeoutRef.current =
														setTimeout(
															() => setHoveredCategorySlug(null),
															150
														);
												};
												return (
													<Box
														key={slug}
														display="flex"
														alignItems="center"
														flexWrap="wrap"
													>
														<Popover
															open={isHoverOpen}
															onOpenChange={(open) =>
																!open &&
																setHoveredCategorySlug(null)
															}
														>
															<PopoverTrigger asChild>
																<Box
																	display="inline-flex"
																	onMouseEnter={() => {
																		clearCloseTimeout();
																		setHoveredCategorySlug(
																			slug
																		);
																	}}
																	onMouseLeave={scheduleClose}
																>
																	<Badge intent="neutral">
																		<Box
																			display="flex"
																			alignItems="center"
																			gap="4"
																		>
																			<span>
																				{getCategoryDisplayName(
																					slug
																				)}
																			</span>
																			<Text
																				fontSize="xs"
																				color="fg.secondary"
																				style={{
																					fontWeight: 400,
																				}}
																			>
																				on {count}{" "}
																				{count === 1
																					? "item"
																					: "items"}
																			</Text>
																			{isCategoryBatchEditMode && (
																				<button
																					onClick={() =>
																						handleRemoveCategory(
																							slug
																						)
																					}
																					style={{
																						background:
																							"none",
																						border: "none",
																						cursor: "pointer",
																						padding:
																							"0",
																						display:
																							"flex",
																						alignItems:
																							"center",
																						fontSize:
																							"14px",
																						fontWeight:
																							"500",
																						lineHeight:
																							"1",
																						color: "inherit",
																					}}
																					aria-label={`Remove category ${getCategoryDisplayName(slug)}`}
																				>
																					×
																				</button>
																			)}
																		</Box>
																	</Badge>
																</Box>
															</PopoverTrigger>
															<PopoverContent
																side="bottom"
																sideOffset={4}
																align="start"
																style={{
																	width: "240px",
																	maxHeight: "280px",
																}}
																onMouseEnter={clearCloseTimeout}
																onMouseLeave={scheduleClose}
															>
																<Box
																	display="flex"
																	flexDirection="column"
																	py="2"
																	px="2"
																	style={{
																		maxHeight: "260px",
																		overflow: "auto",
																	}}
																>
																	<Text
																		fontSize="xs"
																		color="fg.secondary"
																		mb="2"
																		style={{paddingLeft: "4px"}}
																	>
																		{count}{" "}
																		{count === 1
																			? "item"
																			: "items"}{" "}
																		with this category
																	</Text>
																	{itemsWithCategory.map(
																		(item) => (
																			<Text
																				key={item.id}
																				fontSize="sm"
																				color="fg.default"
																				style={{
																					padding:
																						"6px 8px",
																					borderRadius:
																						"4px",
																					whiteSpace:
																						"nowrap",
																					overflow:
																						"hidden",
																					textOverflow:
																						"ellipsis",
																				}}
																			>
																				{item.name ??
																					item.id}
																			</Text>
																		)
																	)}
																</Box>
															</PopoverContent>
														</Popover>
													</Box>
												);
											})
										) : (
											<Text fontSize="xs" color="fg.tertiary">
												No categories
											</Text>
										)}
									</Box>
									{hasMoreCategories && (
										<Button
											appearance="subtle"
											size="sm"
											onClick={() =>
												setCategoriesExpanded(!categoriesExpanded)
											}
											aria-expanded={categoriesExpanded}
										>
											{categoriesExpanded
												? "Show less"
												: `Show ${hiddenCategoriesCount} more`}
										</Button>
									)}
								</Box>
							</Box>
						</DisclosureContent>
					</Disclosure>

					{/* Asset Types */}
					<Disclosure defaultOpen>
						<DisclosureTrigger chevronPosition="start">
							<Text asChild fontSize="sm" fontWeight="600" color="fg.default">
								<span>Asset types</span>
							</Text>
						</DisclosureTrigger>
						<DisclosureContent asChild>
							<Box
								display="flex"
								flexDirection="column"
								gap="8"
								mt="8"
								style={{paddingLeft: "20px"}}
							>
								{metadata.typeDistribution.Page > 0 && (
									<Box
										display="flex"
										gap="8"
										alignItems="center"
										color="fg.secondary"
									>
										<IconFile size={16} />
										<Text fontSize="sm" color="fg.default">
											Pages ({metadata.typeDistribution.Page})
										</Text>
									</Box>
								)}
								{metadata.typeDistribution.Media > 0 && (
									<Box
										display="flex"
										gap="8"
										alignItems="center"
										color="fg.secondary"
									>
										<IconImage size={16} />
										<Text fontSize="sm" color="fg.default">
											Media ({metadata.typeDistribution.Media})
										</Text>
									</Box>
								)}
								{metadata.typeDistribution.Product > 0 && (
									<Box
										display="flex"
										gap="8"
										alignItems="center"
										color="fg.secondary"
									>
										<IconShoppingBag size={16} />
										<Text fontSize="sm" color="fg.default">
											Products ({metadata.typeDistribution.Product})
										</Text>
									</Box>
								)}
								{metadata.typeDistribution.Block > 0 && (
									<Box
										display="flex"
										gap="8"
										alignItems="center"
										color="fg.secondary"
									>
										<IconBlocks size={16} />
										<Text fontSize="sm" color="fg.default">
											Blocks ({metadata.typeDistribution.Block})
										</Text>
									</Box>
								)}
							</Box>
						</DisclosureContent>
					</Disclosure>
				</Box>
			)}
		</Box>
	);
}
