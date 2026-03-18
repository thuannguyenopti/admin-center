"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
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
	type MenuOption,
} from "@optiaxiom/react";
import { PillMenu, PillMenuTrigger, PillMenuContent } from "@optiaxiom/react/unstable";
import { IconChevronRight } from "@tabler/icons-react";
import { useGlobalTags } from "@/app/cms/hooks/useGlobalTags";
import { useGlobalCategories } from "@/app/cms/hooks/useGlobalCategories";
import { getThumbnailForContent } from "@/app/cms/content/contentThumbnails";
import { initialContentTypes, Property } from "@/app/db/initialData";

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

export type PropertySection = string;

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
	{ id: "content-settings", label: "Content Settings" },
	{ id: "geo-seo", label: "GEO & SEO" },
	{ id: "categories-tags", label: "Categories & Tags" },
];

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
	// Load content type definition
	const contentType = useMemo(() => {
		if (!contentTypeId) return null;
		return initialContentTypes.find((ct) => ct.id === contentTypeId) || null;
	}, [contentTypeId]);

	// Group properties by groupName for dynamic sections
	const propertyGroups = useMemo(() => {
		if (!contentType) return {};

		const groups: Record<string, Property[]> = {};

		// Filter out outline properties (they're handled separately in the outline tree)
		const nonOutlineProps = contentType.properties.filter((p) => p.type !== "outline");

		nonOutlineProps.forEach((prop) => {
			const groupName = prop.groupName || "Other";
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

	// Generate navigation items dynamically from property groups
	const dynamicNavigationItems = useMemo(() => {
		const groupNames = Object.keys(propertyGroups);
		if (groupNames.length === 0) return navigationItems; // Fallback to static

		return groupNames.map((groupName) => ({
			id: groupName.toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, ""),
			label: groupName,
		}));
	}, [propertyGroups]);

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

		switch (prop.type) {
			case "String":
			case "text":
				return (
					<Field key={prop.id} label={prop.displayName || prop.name} description={prop.description}>
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
					<Field key={prop.id} label={prop.displayName || prop.name} description={prop.description}>
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
					<Field key={prop.id} label={prop.displayName || prop.name} description={prop.description}>
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
					<Field key={prop.id} label={prop.displayName || prop.name} description={prop.description}>
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
	const renderSectionContent = () => {
		// If we have a content type, render properties dynamically
		if (contentType && effectiveSection !== "menu") {
			const sectionId = effectiveSection;
			const groupName = dynamicNavigationItems.find((item) => item.id === sectionId)?.label;

			if (groupName && propertyGroups[groupName]) {
				const properties = propertyGroups[groupName];

				return (
					<Box display="flex" flexDirection="column" gap="12">
						{/* Special handling for Categories & Tags section - show suggestions UI */}
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
			}
		}

		// Fallback to hardcoded sections for backward compatibility
		switch (effectiveSection) {
			case "content-settings":
				return (
					<Box display="flex" flexDirection="column" gap="8">
						<Field label="Content Type">
							<Input2 placeholder="Enter content type" />
						</Field>
						<Field label="Status">
							<Select
								value="draft"
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
						{dynamicNavigationItems.map((item) => (
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
