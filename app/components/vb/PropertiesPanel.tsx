"use client";

import React, { useState, useRef, useEffect } from "react";
import {
	Box,
	Button,
	Field,
	Text,
	Input as Input2,
	Select,
	SelectTrigger,
	SelectContent,
	Textarea,
	Badge,
	Popover,
	PopoverAnchor,
	PopoverContent,
	Input,
} from "@optiaxiom/react";
import { IconChevronRight, IconCheck, IconX } from "@tabler/icons-react";
import { useGlobalTags } from "@/app/cms/hooks/useGlobalTags";
import { useGlobalCategories } from "@/app/cms/hooks/useGlobalCategories";
import { getThumbnailForContent } from "@/app/cms/content/contentThumbnails";

export type PageProperties = {
	seoTitle?: string;
	keywords?: string;
	description?: string;
	meta?: string;
	campaignMode?: "no" | "yes";
	someOtherSetting?: "setting1" | "setting2";
	categories?: string[];
	tags?: string[];
};

export type PropertySection = "menu" | "content-settings" | "geo-seo" | "categories-tags";

type Props = {
	value: PageProperties;
	onChange: (patch: Partial<PageProperties>) => void;
	activeSection?: PropertySection;
	onSectionChange?: (section: PropertySection) => void;
	/** Page context for Generate (tags suggest); when provided, Generate uses page name and optional thumbnail. */
	pageName?: string;
	pageId?: string;
	contentTypeId?: string;
	/** Register with parent so header sparkles can trigger generate. Call with null on unmount. */
	onRegisterGenerateTrigger?: (trigger: (() => void) | null) => void;
	/** Notify parent when generate is loading (for header button spinner). */
	onGenerateLoadingChange?: (loading: boolean) => void;
};

export const navigationItems = [
	{ id: "content-settings" as const, label: "Content settings" },
	{ id: "geo-seo" as const, label: "GEO & SEO" },
	{ id: "categories-tags" as const, label: "Categories & Tags" },
];

const SHIMMER_INSET = 2;

function ShimmerFieldWrapper({
	children,
	loading,
}: {
	children: React.ReactNode;
	loading: boolean;
}) {
	if (!loading) return <>{children}</>;
	return (
		<Box style={{ position: "relative", width: "100%" }}>
			{children}
			<Box
				className="opal-skeleton-shimmer"
				style={{
					position: "absolute",
					top: SHIMMER_INSET,
					left: SHIMMER_INSET,
					right: SHIMMER_INSET,
					bottom: SHIMMER_INSET,
					pointerEvents: "none",
					borderRadius: "4px",
				}}
			/>
		</Box>
	);
}

// Autocomplete input component for categories/tags
function AutocompleteMultiSelect({
	label,
	placeholder,
	selectedItems,
	availableItems,
	onAdd,
	onRemove,
	onCreateNew,
	itemExists,
	getItemLabel,
	loading = false,
}: {
	label: string;
	placeholder: string;
	selectedItems: string[];
	availableItems: { name: string; slug: string }[];
	onAdd: (slug: string) => void;
	onRemove: (slug: string) => void;
	onCreateNew?: (name: string) => void;
	itemExists: (name: string) => boolean;
	getItemLabel: (slug: string) => string | undefined;
	loading?: boolean;
}) {
	const [inputValue, setInputValue] = useState("");
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [itemsExpanded, setItemsExpanded] = useState(false);

	const INITIAL_VISIBLE = 10;
	const visibleItems = itemsExpanded ? selectedItems : selectedItems.slice(0, INITIAL_VISIBLE);
	const hasMoreItems = selectedItems.length > INITIAL_VISIBLE;
	const hiddenCount = selectedItems.length - INITIAL_VISIBLE;

	// Filter available items based on input
	const filteredItems = availableItems.filter(
		(item) => !inputValue || item.name.toLowerCase().includes(inputValue.toLowerCase())
	);

	// Create options for autocomplete dropdown
	const autocompleteOptions = filteredItems.map((item) => ({
		label: item.name,
		value: item.slug,
		isSelected: selectedItems.includes(item.slug),
	}));

	// Add custom item option if input doesn't match any available item
	const inputMatchesExisting = availableItems.some(
		(item) => item.name.toLowerCase() === inputValue.toLowerCase()
	);
	if (inputValue.trim() && !inputMatchesExisting && onCreateNew) {
		autocompleteOptions.push({
			label: `+ Add "${inputValue}"`,
			value: `__new__${inputValue}`,
			isSelected: false,
		});
	}

	const handleSelect = (option: { value: string; label: string }) => {
		if (option.value.startsWith("__new__")) {
			const newName = option.value.replace("__new__", "");
			onCreateNew?.(newName);
			// After creating, we need to wait for the item to be added
			// The parent component should handle this
		} else {
			if (selectedItems.includes(option.value)) {
				onRemove(option.value);
			} else {
				onAdd(option.value);
			}
		}
		setInputValue("");
		setIsOpen(false);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && autocompleteOptions.length > 0) {
			handleSelect(autocompleteOptions[0]);
		}
	};

	return (
		<Box display="flex" flexDirection="column" gap="8">
			<Text fontSize="sm" fontWeight="500" color="fg.default">
				{label}
			</Text>

			{/* Selected Items Display (Show more / Show less) */}
			{selectedItems.length > 0 && (
				<Box display="flex" flexDirection="column" gap="8">
					<Box display="flex" flexWrap="wrap" gap="6">
						{visibleItems.map((slug) => {
							const displayLabel = getItemLabel(slug) || slug;
							return (
								<Badge key={slug} intent="neutral">
									<Box display="flex" alignItems="center" gap="4">
										<span>{displayLabel}</span>
										<button
											onClick={() => onRemove(slug)}
											style={{
												background: "none",
												border: "none",
												cursor: "pointer",
												padding: "0",
												display: "flex",
												alignItems: "center",
												fontSize: "14px",
												fontWeight: "500",
												lineHeight: "1",
												color: "inherit",
											}}
											aria-label={`Remove ${displayLabel}`}
										>
											<IconX size={12} />
										</button>
									</Box>
								</Badge>
							);
						})}
					</Box>
					{hasMoreItems && (
						<Button
							appearance="subtle"
							size="sm"
							onClick={() => setItemsExpanded(!itemsExpanded)}
							aria-expanded={itemsExpanded}
						>
							{itemsExpanded ? "Show less" : `Show ${hiddenCount} more`}
						</Button>
					)}
				</Box>
			)}

			{/* Autocomplete Input */}
			<Popover
				modal={false}
				open={isOpen && autocompleteOptions.length > 0}
				onOpenChange={setIsOpen}
			>
				<PopoverAnchor asChild>
					<Box style={{ width: "100%" }}>
						<ShimmerFieldWrapper loading={loading}>
							<Input
								value={inputValue}
								onChange={(e) => {
									setInputValue(e.target.value);
									setIsOpen(true);
								}}
								onFocus={() => setIsOpen(true)}
								onKeyPress={handleKeyPress}
								placeholder={placeholder}
								size="md"
							/>
						</ShimmerFieldWrapper>
					</Box>
				</PopoverAnchor>
				<PopoverContent
					side="bottom"
					sideOffset={4}
					align="start"
					style={{ width: "var(--radix-popover-trigger-width)" }}
					onOpenAutoFocus={(e) => e.preventDefault()}
					onCloseAutoFocus={(e) => e.preventDefault()}
				>
					<Box
						display="flex"
						flexDirection="column"
						gap="0"
						py="2"
						style={{ maxHeight: "200px" }}
						overflow="auto"
					>
						{autocompleteOptions.length === 0 ? (
							<Box px="8" py="6">
								<Text fontSize="sm" color="fg.secondary">
									No results found
								</Text>
							</Box>
						) : (
							autocompleteOptions.map((option, index) => (
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
									bg={hoveredIndex === index ? "bg.secondary" : "transparent"}
									onClick={() => handleSelect(option)}
									onMouseEnter={() => setHoveredIndex(index)}
									onMouseLeave={() => setHoveredIndex(null)}
								>
									{option.isSelected && (
										<IconCheck size={14} style={{ flexShrink: 0 }} />
									)}
									<Text
										fontSize="sm"
										color={
											option.value.startsWith("__new__")
												? "fg.accent"
												: "fg.default"
										}
										style={{ marginLeft: option.isSelected ? 0 : undefined }}
									>
										{option.label}
									</Text>
								</Box>
							))
						)}
					</Box>
				</PopoverContent>
			</Popover>
		</Box>
	);
}

function nameToSlug(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/g, "");
}

export default function PropertiesPanel({
	value,
	onChange,
	activeSection = "menu",
	onSectionChange,
	pageName,
	pageId,
	contentTypeId,
	onRegisterGenerateTrigger,
	onGenerateLoadingChange,
}: Props) {
	// Get global tags and categories from CMS settings
	const { tags: allTags, tagNames: availableTagNames, addTag, tagExists } = useGlobalTags();
	const {
		categories: allCategories,
		categoryNames: availableCategoryNames,
		addCategory,
		categoryExists,
		getCategoryNameBySlug,
	} = useGlobalCategories();

	// Generate (tags/categories suggest) state — only used in categories-tags section
	const [suggestLoading, setSuggestLoading] = useState(false);
	const [suggestError, setSuggestError] = useState<string | null>(null);
	const [noTagSuggestions, setNoTagSuggestions] = useState(false);
	const [noCategorySuggestions, setNoCategorySuggestions] = useState(false);

	// When parent doesn't control section (no onSectionChange), keep local section so menu clicks work
	const [localSection, setLocalSection] = useState<PropertySection>("menu");
	const isControlled = onSectionChange != null;
	const effectiveSection = isControlled ? (activeSection ?? "menu") : localSection;

	const handleSectionChange = (section: PropertySection) => {
		if (onSectionChange) onSectionChange(section);
		else setLocalSection(section);
	};

	// Categories handlers
	const selectedCategories = value.categories || [];
	const categoriesWithSlugs = allCategories.map((cat: any) => ({ name: cat.name, slug: cat.slug }));

	const handleAddCategory = (slug: string) => {
		if (!selectedCategories.includes(slug)) {
			onChange({ categories: [...selectedCategories, slug] });
		}
	};

	const handleRemoveCategory = (slug: string) => {
		onChange({ categories: selectedCategories.filter((s) => s !== slug) });
	};

	const handleCreateCategory = (name: string) => {
		addCategory(name);
		// Generate slug from name
		const slug = name
			.toLowerCase()
			.trim()
			.replace(/\s+/g, "-")
			.replace(/[^a-z0-9-]/g, "");
		// Add to selected after a brief delay to allow state to update
		setTimeout(() => {
			onChange({ categories: [...selectedCategories, slug] });
		}, 50);
	};

	// Tags handlers
	const selectedTags = value.tags || [];
	const tagsWithSlugs = allTags.map((tag: any) => ({ name: tag.name, slug: tag.slug }));

	const handleAddTag = (slug: string) => {
		if (!selectedTags.includes(slug)) {
			onChange({ tags: [...selectedTags, slug] });
		}
	};

	const handleRemoveTag = (slug: string) => {
		onChange({ tags: selectedTags.filter((s) => s !== slug) });
	};

	const handleCreateTag = (name: string) => {
		addTag(name);
		// Generate slug from name
		const slug = name
			.toLowerCase()
			.trim()
			.replace(/\s+/g, "-")
			.replace(/[^a-z0-9-]/g, "");
		// Add to selected after a brief delay to allow state to update
		setTimeout(() => {
			onChange({ tags: [...selectedTags, slug] });
		}, 50);
	};

	const getTagNameBySlug = (slug: string): string | undefined => {
		const tag = allTags.find((t: any) => t.slug === slug);
		return tag?.name;
	};

	const handleGenerate = async () => {
		const hasTags = allTags.length > 0;
		const hasCategories = allCategories.length > 0;
		if (!hasTags && !hasCategories) {
			setSuggestError("Add tags or categories in Settings first to use Generate.");
			return;
		}
		setSuggestLoading(true);
		setSuggestError(null);
		setNoTagSuggestions(false);
		setNoCategorySuggestions(false);
		const itemName = (pageName || "Page").trim();
		const imageUrl =
			pageId != null || pageName != null
				? getThumbnailForContent({
					id: pageId ?? "",
					name: pageName ?? "Page",
					baseType: "Page",
				})
				: undefined;
		const categoryTaxonomy = allCategories.map((c: any) => ({
			id: c.id,
			name: c.name,
			slug: c.slug,
			parentId: c.parentId ?? null,
		}));
		try {
			const [tagsRes, categoriesRes] = await Promise.all([
				hasTags
					? fetch("/api/tags/suggest", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							itemName,
							contentTypeId: contentTypeId ?? undefined,
							tagTaxonomy: allTags.map((t: any) => ({ name: t.name, slug: t.slug })),
							imageUrl,
						}),
					})
					: Promise.resolve(null),
				hasCategories
					? fetch("/api/categories/suggest-for-item", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ itemName, categoryTaxonomy }),
					})
					: Promise.resolve(null),
			]);

			let nextTags = value.tags || [];
			let nextCategories = value.categories || [];
			let errorMessage: string | null = null;
			let emptyTagSuggestions = false;
			let emptyCategorySuggestions = false;

			if (hasTags && tagsRes) {
				const data = await tagsRes.json().catch(() => ({}));
				if (!tagsRes.ok) {
					errorMessage = (data as { error?: string }).error || "Tag suggestion failed.";
				} else {
					const existingSlugs: string[] = (data as { suggestedSlugs?: string[] }).suggestedSlugs ?? [];
					const newNames: string[] = (data as { suggestedNewNames?: string[] }).suggestedNewNames ?? [];
					newNames.forEach((name: string) => {
						if (name.trim() && !tagExists(name)) addTag(name.trim());
					});
					const newSlugs = newNames.map((n: string) => nameToSlug(n)).filter(Boolean);
					const mergedSlugs = Array.from(new Set([...existingSlugs, ...newSlugs]));
					emptyTagSuggestions = mergedSlugs.length === 0;
					nextTags = Array.from(new Set([...nextTags, ...mergedSlugs]));
				}
			}

			if (hasCategories && categoriesRes && !errorMessage) {
				const data = await categoriesRes.json().catch(() => ({}));
				if (!categoriesRes.ok) {
					errorMessage = (data as { error?: string }).error || "Category suggestion failed.";
				} else {
					const suggestedSlugs: string[] = (data as { suggestedSlugs?: string[] }).suggestedSlugs ?? [];
					emptyCategorySuggestions = suggestedSlugs.length === 0;
					nextCategories = Array.from(new Set([...nextCategories, ...suggestedSlugs]));
				}
			}

			if (errorMessage) {
				setSuggestError(errorMessage);
				return;
			}

			setNoTagSuggestions(hasTags && emptyTagSuggestions);
			setNoCategorySuggestions(hasCategories && emptyCategorySuggestions);
			onChange({ tags: nextTags, categories: nextCategories });
		} catch (e) {
			const message = e instanceof Error ? e.message : "Generate failed. Check the console.";
			setSuggestError(message);
			console.error("Properties Generate error:", e);
		} finally {
			setSuggestLoading(false);
		}
	};

	// Expose generate to parent (e.g. header sparkles button)
	const generateRef = useRef(handleGenerate);
	generateRef.current = handleGenerate;
	useEffect(() => {
		onRegisterGenerateTrigger?.(() => generateRef.current());
		return () => onRegisterGenerateTrigger?.(null);
	}, [onRegisterGenerateTrigger]);

	useEffect(() => {
		onGenerateLoadingChange?.(suggestLoading);
	}, [suggestLoading, onGenerateLoadingChange]);

	// Render section-specific content
	const renderSectionContent = () => {
		switch (effectiveSection) {
			case "content-settings":
				return (
					<Box display="flex" flexDirection="column" gap="8">
						<Field label="Content Type">
							<Input2 placeholder="Enter content type" />
						</Field>
						<Field label="Status">
							<Select
								options={[
									{ label: "Draft", value: "draft" },
									{ label: "Published", value: "published" },
								]}
							>
								<SelectTrigger>Draft</SelectTrigger>
								<SelectContent />
							</Select>
						</Field>
					</Box>
				);

			case "geo-seo":
				return (
					<Box display="flex" flexDirection="column" gap="8">
						<Field label="Title">
							<Input2
								placeholder="Enter page title"
								value={value.seoTitle ?? ""}
								onChange={(e: any) => onChange({ seoTitle: e.target.value })}
							/>
						</Field>
						<Field label="Keywords">
							<Input2
								placeholder="Enter keywords"
								value={value.keywords ?? ""}
								onChange={(e: any) => onChange({ keywords: e.target.value })}
							/>
						</Field>
						<Field label="Description">
							<Textarea
								placeholder="Enter description"
								rows={3}
								value={value.description ?? ""}
								onChange={(e: any) => onChange({ description: e.target.value })}
							/>
						</Field>
						<Field label="Meta">
							<Textarea
								placeholder="Enter meta information"
								rows={3}
								value={value.meta ?? ""}
								onChange={(e: any) => onChange({ meta: e.target.value })}
							/>
						</Field>
					</Box>
				);

			case "categories-tags":
				return (
					<Box display="flex" flexDirection="column" gap="20">
						<Box display="flex" flexDirection="column" gap="8">
							{suggestError && (
								<Text fontSize="xs" color="fg.error">
									{suggestError}
								</Text>
							)}
							{!suggestError && noTagSuggestions && (
								<Text fontSize="xs" color="fg.secondary">
									No suggestions for tags.
								</Text>
							)}
							{!suggestError && noCategorySuggestions && (
								<Text fontSize="xs" color="fg.secondary">
									No suggestions for categories.
								</Text>
							)}
						</Box>
						<AutocompleteMultiSelect
							label="Categories"
							placeholder="Search categories..."
							selectedItems={selectedCategories}
							availableItems={categoriesWithSlugs}
							onAdd={handleAddCategory}
							onRemove={handleRemoveCategory}
							onCreateNew={handleCreateCategory}
							itemExists={categoryExists}
							getItemLabel={getCategoryNameBySlug}
							loading={suggestLoading}
						/>

						<AutocompleteMultiSelect
							label="Tags"
							placeholder="Search tags..."
							selectedItems={selectedTags}
							availableItems={tagsWithSlugs}
							onAdd={handleAddTag}
							onRemove={handleRemoveTag}
							onCreateNew={handleCreateTag}
							itemExists={tagExists}
							getItemLabel={getTagNameBySlug}
							loading={suggestLoading}
						/>
					</Box>
				);

			default:
				return null;
		}
	};

	return (
		<div className="h-full overflow-hidden">
			<div
				className="flex w-[200%] h-full transition-transform duration-300 ease-out will-change-transform"
				style={{
					transform: effectiveSection === "menu" ? "translateX(0%)" : "translateX(-50%)",
				}}
			>
				{/* PANE 1: Properties Menu */}
				<div className="min-w-[50%] w-[50%] h-full flex flex-col">
					<Box display="flex" flexDirection="column" w="full">
						{navigationItems.map((item) => (
							<Box
								key={item.id}
								pl="24"
								pr="12"
								py="8"
								w="full"
								display="flex"
								alignItems="center"
								justifyContent="space-between"
								cursor="pointer"
								className="hover:bg-[var(--ax-colors-bg-default-hovered)] transition-colors"
								onClick={() => handleSectionChange(item.id)}
								style={{
									fontSize: "14px",
								}}
							>
								<Text fontSize="sm">{item.label}</Text>
								<IconChevronRight
									size={16}
									style={{
										opacity: 0.6,
										flexShrink: 0,
									}}
								/>
							</Box>
						))}
					</Box>
				</div>

				{/* PANE 2: Property Subsection Detail */}
				<div className="min-w-[50%] w-[50%] h-full flex flex-col">
					{/* Section content */}
					<Box px="24" py="16" style={{ overflowY: "auto", flex: 1 }}>
						{renderSectionContent()}
					</Box>
				</div>
			</div>
		</div>
	);
}
