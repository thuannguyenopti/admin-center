"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
	Box,
	Field,
	Text,
	Input as Input2,
	Select,
	SelectTrigger,
	SelectContent,
	Textarea,
	type MenuOption,
	SegmentedControl,
	SegmentedControlItem,
	Heading,
	Separator,
	Card,
} from "@optiaxiom/react";
import { PillMenu, PillMenuTrigger, PillMenuContent } from "@optiaxiom/react/unstable";
import { useGlobalTags } from "@/app/cms/hooks/useGlobalTags";
import { useGlobalCategories } from "@/app/cms/hooks/useGlobalCategories";
import { getThumbnailForContent } from "@/app/cms/content/contentThumbnails";
import { initialContentTypes, Property, type ContentType } from "@/app/db/initialData";
import usePersistentState from "@/app/usePersistentState";

export type PageProperties = {
	seoTitle?: string;
	keywords?: string;
	description?: string;
	meta?: string;
	categories?: string[];
	tags?: string[];
};

export type PropertySection = string;

type Props = {
	value: PageProperties;
	onChange: (patch: Partial<PageProperties>) => void;
	/** @deprecated No longer used in single-pane design */
	activeSection?: PropertySection;
	/** @deprecated No longer used in single-pane design */
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

// PillMenu wrapper component for categories/tags
function PillMenuSelect({
	label,
	placeholder,
	selectedItems,
	availableItems,
	onToggle,
	onCreateNew,
}: {
	label: string;
	placeholder: string;
	selectedItems: string[];
	availableItems: { name: string; slug: string }[];
	onToggle: (slug: string) => void;
	onCreateNew?: (name: string) => void;
}) {
	const [inputValue, setInputValue] = useState("");

	const options = useMemo(() => {
		const filtered = availableItems.filter((item) =>
			!inputValue || item.name.toLowerCase().includes(inputValue.toLowerCase())
		);

		const menuOptions: MenuOption[] = filtered.map((item) => ({
			execute: () => onToggle(item.slug),
			label: item.name,
			multi: true,
			selected: () => selectedItems.includes(item.slug),
		}));

		// Add "Create new" option if search doesn't match existing
		if (inputValue.trim() && onCreateNew) {
			const inputMatchesExisting = availableItems.some(
				(item) => item.name.toLowerCase() === inputValue.toLowerCase()
			);
			if (!inputMatchesExisting) {
				menuOptions.push({
					execute: () => {
						onCreateNew(inputValue);
						setInputValue("");
					},
					label: `Create "${inputValue}"`,
					multi: false,
					selected: () => false,
				});
			}
		}

		return menuOptions;
	}, [availableItems, selectedItems, inputValue, onToggle, onCreateNew]);

	return (
		<Field label={label}>
			<PillMenu
				options={options}
				placeholder={placeholder}
				inputValue={inputValue}
				onInputValueChange={setInputValue}
			>
				<PillMenuTrigger>{label}</PillMenuTrigger>
				<PillMenuContent />
			</PillMenu>
		</Field>
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
	// Load runtime content types from localStorage (includes user-created properties)
	const [runtimeContentTypes] = usePersistentState("contentTypes", initialContentTypes) as [
		ContentType[],
		any,
	];

	// Load content type definition from runtime state
	const contentType = useMemo(() => {
		if (!contentTypeId) return null;
		return runtimeContentTypes?.find((ct) => ct.id === contentTypeId) || null;
	}, [contentTypeId, runtimeContentTypes]);

	// Group properties by groupName for dynamic sections
	const contentTypePropertyGroups = useMemo(() => {
		if (!contentType) return {};

		const groups: Record<string, Property[]> = {};

		// Filter out outline properties (they're handled separately in the outline tree)
		const nonOutlineProps = contentType.properties.filter((p) => p.type !== "outline");

		nonOutlineProps.forEach((prop) => {
			// Use "Content" as default group for properties without groupName
			const groupName = prop.groupName || "Content";

			if (!groups[groupName]) {
				groups[groupName] = [];
			}
			groups[groupName].push(prop);
		});

		// Sort properties within each group by order
		Object.keys(groups).forEach((groupName) => {
			groups[groupName].sort((a, b) => (a.order || 0) - (b.order || 0));
		});

		return groups;
	}, [contentType]);

	// Generate filter items from property groups
	const filterItems = useMemo(() => {
		const groupNames = Object.keys(contentTypePropertyGroups);
		if (groupNames.length === 0) return [{ id: "all", label: "All" }];

		// Always include "All" as first option
		const items = [{ id: "all", label: "All" }];

		// Add each group as a filter option
		groupNames.forEach((groupName) => {
			items.push({
				id: groupName.toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, ""),
				label: groupName,
			});
		});

		return items;
	}, [contentTypePropertyGroups]);

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

	// Filter state for property groups
	const [activeFilter, setActiveFilter] = useState<string>("all");

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

	const handleToggleCategory = (slug: string) => {
		if (selectedCategories.includes(slug)) {
			handleRemoveCategory(slug);
		} else {
			handleAddCategory(slug);
		}
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

	const handleToggleTag = (slug: string) => {
		if (selectedTags.includes(slug)) {
			handleRemoveTag(slug);
		} else {
			handleAddTag(slug);
		}
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

	// Render a single property field based on its definition
	const renderPropertyField = (prop: Property) => {
		const propValue = (value as any)[prop.id];

		// Handle ContentReference to Block types (local blocks)
		if (prop.type === "ContentReference" && prop.allowedTypes && prop.allowedTypes.length > 0) {
			// Check if this references a Block type (use runtime content types)
			const referencedTypeId = prop.allowedTypes[0];
			const referencedType = runtimeContentTypes?.find(ct => ct.id === referencedTypeId);

			// Always render Block types as inline Cards, even if data doesn't exist yet
			if (referencedType && referencedType.baseType === "Block") {
				// Ensure propValue is an object (initialize if undefined)
				const blockData = (typeof propValue === "object" && propValue !== null) ? propValue : {};
				// This is a local block - render its properties inline
				const blockProperties = referencedType.properties || [];

				// Group block properties by their groupName
				const blockGroups: Record<string, Property[]> = {};
				blockProperties.forEach((blockProp) => {
					const groupName = blockProp.groupName || "Properties";
					if (!blockGroups[groupName]) {
						blockGroups[groupName] = [];
					}
					blockGroups[groupName].push(blockProp);
				});

				// Sort properties within each group
				Object.keys(blockGroups).forEach((groupName) => {
					blockGroups[groupName].sort((a, b) => (a.order || 0) - (b.order || 0));
				});

				return (
					<Box key={prop.id} display="flex" flexDirection="column" gap="12" w="full">
						<Text fontSize="sm" fontWeight="600" color="fg.default">
							{prop.displayName || prop.name}
						</Text>
						<Card w="full">
							<Box display="flex" flexDirection="column" gap="16" w="full">
									{Object.keys(blockGroups).map((groupName, groupIndex) => (
										<Box key={groupName} display="flex" flexDirection="column" gap="12" w="full">
											{Object.keys(blockGroups).length > 1 && (
												<>
													<Text fontSize="xs" fontWeight="600" color="fg.tertiary" textTransform="uppercase">
														{groupName}
													</Text>
													{groupIndex < Object.keys(blockGroups).length - 1 && <Separator />}
												</>
											)}
											{blockGroups[groupName].map((blockProp) => {
												const blockPropValue = blockData[blockProp.id];

												// Render different field types for block properties
												if (blockProp.type === "String" || blockProp.type === "text") {
													return (
														<Field
															key={blockProp.id}
															label={blockProp.displayName || blockProp.name}
														>
															<Input2
																placeholder={`Enter ${blockProp.displayName || blockProp.name}`}
																value={blockPropValue ?? ""}
																onChange={(e: any) => {
																	onChange({
																		[prop.id]: {
																			...blockData,
																			[blockProp.id]: e.target.value
																		}
																	});
																}}
															/>
														</Field>
													);
												} else if (blockProp.type === "LongString" || blockProp.type === "textarea") {
													return (
														<Field
															key={blockProp.id}
															label={blockProp.displayName || blockProp.name}
														>
															<Textarea
																placeholder={`Enter ${blockProp.displayName || blockProp.name}`}
																rows={3}
																value={blockPropValue ?? ""}
																onChange={(e: any) => {
																	onChange({
																		[prop.id]: {
																			...blockData,
																			[blockProp.id]: e.target.value
																		}
																	});
																}}
															/>
														</Field>
													);
												} else if (blockProp.type === "Url") {
													return (
														<Field
															key={blockProp.id}
															label={blockProp.displayName || blockProp.name}
														>
															<Input2
																type="url"
																placeholder={`Enter ${blockProp.displayName || blockProp.name}`}
																value={blockPropValue ?? ""}
																onChange={(e: any) => {
																	onChange({
																		[prop.id]: {
																			...blockData,
																			[blockProp.id]: e.target.value
																		}
																	});
																}}
															/>
														</Field>
													);
												}

												// Default fallback for other types
												return (
													<Field
														key={blockProp.id}
														label={blockProp.displayName || blockProp.name}
														description={blockProp.description}
													>
														<Input2
															placeholder={`Enter ${blockProp.displayName || blockProp.name}`}
															value={blockPropValue ?? ""}
															onChange={(e: any) => {
																onChange({
																	[prop.id]: {
																		...blockData,
																		[blockProp.id]: e.target.value
																	}
																});
															}}
														/>
													</Field>
												);
											})}
										</Box>
									))}
								</Box>
						</Card>
					</Box>
				);
			}
		}

		switch (prop.type) {
			case "String":
			case "text":
				return (
					<Field key={prop.id} label={prop.displayName || prop.name}>
						<Input2
							placeholder={`Enter ${prop.displayName || prop.name}`}
							value={propValue ?? prop.defaultValue ?? ""}
							onChange={(e: any) => onChange({ [prop.id]: e.target.value })}
						/>
					</Field>
				);

			case "LongString":
			case "textarea":
				return (
					<Field key={prop.id} label={prop.displayName || prop.name}>
						<Textarea
							placeholder={`Enter ${prop.displayName || prop.name}`}
							rows={3}
							value={propValue ?? prop.defaultValue ?? ""}
							onChange={(e: any) => onChange({ [prop.id]: e.target.value })}
						/>
					</Field>
				);

			case "SelectOne":
				return (
					<Field key={prop.id} label={prop.displayName || prop.name}>
						<Select
							value={propValue ?? prop.defaultValue}
							onValueChange={(newValue) => onChange({ [prop.id]: newValue })}
							options={prop.options || []}
						>
							<SelectTrigger />
							<SelectContent />
						</Select>
					</Field>
				);

			case "SelectMany":
				// Handle categories and tags specially with PillMenu
				if (prop.id === "categories") {
					return (
						<PillMenuSelect
							key={prop.id}
							label={prop.displayName || prop.name}
							placeholder={`Search ${prop.displayName || prop.name}...`}
							selectedItems={selectedCategories}
							availableItems={categoriesWithSlugs}
							onToggle={handleToggleCategory}
							onCreateNew={handleCreateCategory}
						/>
					);
				} else if (prop.id === "tags") {
					return (
						<PillMenuSelect
							key={prop.id}
							label={prop.displayName || prop.name}
							placeholder={`Search ${prop.displayName || prop.name}...`}
							selectedItems={selectedTags}
							availableItems={tagsWithSlugs}
							onToggle={handleToggleTag}
							onCreateNew={handleCreateTag}
						/>
					);
				}
				return null;

			case "seo":
				// SEO block is handled separately - skip for now
				return null;

			default:
				return (
					<Field key={prop.id} label={prop.displayName || prop.name}>
						<Input2
							placeholder={`Enter ${prop.displayName || prop.name}`}
							value={propValue ?? ""}
							onChange={(e: any) => onChange({ [prop.id]: e.target.value })}
						/>
					</Field>
				);
		}
	};

	// Render section-specific content
	// Legacy fallback for backward compatibility (when no contentType)
	const renderSectionContent = () => {
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
				<PillMenuSelect
					label="Categories"
					placeholder="Search categories..."
					selectedItems={selectedCategories}
					availableItems={categoriesWithSlugs}
					onToggle={handleToggleCategory}
					onCreateNew={handleCreateCategory}
				/>
				<PillMenuSelect
					label="Tags"
					placeholder="Search tags..."
					selectedItems={selectedTags}
					availableItems={tagsWithSlugs}
					onToggle={handleToggleTag}
					onCreateNew={handleCreateTag}
				/>
			</Box>
		);
	};

	// Render properties filtered by active filter
	const renderFilteredContent = () => {
		if (!contentType) {
			// Fallback to legacy hardcoded sections for backward compatibility
			return renderSectionContent();
		}

		const groupNames = Object.keys(contentTypePropertyGroups);

		// Determine which groups to show based on filter
		const groupsToShow = activeFilter === "all"
			? groupNames
			: groupNames.filter(name => {
					const groupId = name.toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, "");
					return groupId === activeFilter;
				});

		if (groupsToShow.length === 0) {
			return (
				<Box p="24" display="flex" justifyContent="center">
					<Text color="fg.tertiary">No properties in this group</Text>
				</Box>
			);
		}

		return (
			<Box display="flex" flexDirection="column" gap="32">
				{groupsToShow.map((groupName) => {
					const properties = contentTypePropertyGroups[groupName];
					const showHeader = activeFilter === "all"; // Only show headers when viewing all

					return (
						<Box key={groupName} display="flex" flexDirection="column" gap="12">
							{showHeader && (
								<Box mb="4">
									<Heading level="4" fontSize="sm" color="fg.tertiary" mb="8">
										{groupName}
									</Heading>
									<Separator />
								</Box>
							)}

							{/* Special handling for Categories & Tags section */}
							{groupName === "Categories & Tags" && (
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
							)}

							{properties.map((prop) => renderPropertyField(prop))}
						</Box>
					);
				})}
			</Box>
		);
	};

	return (
		<Box display="flex" flexDirection="column" h="full" overflow="hidden">
			{/* Filter Bar - Sticky */}
			<Box
				bg="bg.default"
				px="24"
				pt="16"
				pb="16"
				borderB="1"
				borderColor="border.tertiary"
				style={{ position: "sticky", top: 0, zIndex: 10 }}
			>
				<SegmentedControl
					value={activeFilter}
					onValueChange={setActiveFilter}
					size="md"
				>
					{filterItems.map((item) => (
						<SegmentedControlItem key={item.id} value={item.id}>
							{item.label}
						</SegmentedControlItem>
					))}
				</SegmentedControl>
			</Box>

			{/* Content Area - Scrollable */}
			<Box
				overflow="auto"
				px="24"
				py="16"
				style={{ flex: 1 }}
			>
				{renderFilteredContent()}
			</Box>
		</Box>
	);
}
