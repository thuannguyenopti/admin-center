"use client";

import { Box, Disclosure, DisclosureTrigger, DisclosureContent, Button, Checkbox, Input, Badge, Popover, PopoverTrigger, PopoverContent, Tooltip, Skeleton } from "@optiaxiom/react";
import { IconX, IconFile, IconShoppingBag, IconBlocks, IconPhoto, IconEye, IconPencil, IconCheck, IconSparkles } from "@tabler/icons-react";
import { Text } from "@/app/components/Text";
import { ContentItem } from "./page";
import { useDetailsMetadata } from "./useDetailsMetadata";
import MultiSelectDetailsPane from "./MultiSelectDetailsPane";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useGlobalTags } from "../hooks/useGlobalTags";
import { useGlobalCategories } from "../hooks/useGlobalCategories";
import type { Tag } from "../settings/tags/types";
import { getThumbnailForContent } from "./contentThumbnails";

interface DetailsPaneProps {
  content?: ContentItem;
  selectedIds?: Set<string>;
  selectedItems?: ContentItem[];
  allContent?: ContentItem[];
  detailsPaneTags: string[] | null;
  setDetailsPaneTags: (tags: string[] | null) => void;
  detailsPaneCategories: string[] | null;
  setDetailsPaneCategories: (categories: string[] | null) => void;
  onTagsChange?: (contentId: string, tags: string[]) => void;
  onTagsChangeBatch?: (updates: Array<{ id: string; tags: string[] }>) => void;
  onCategoriesChange?: (contentId: string, categories: string[]) => void;
  onCategoriesChangeBatch?: (updates: Array<{ id: string; categories: string[] }>) => void;
  onClose: () => void;
  onBatchEditModeChange?: (mode: { tags: boolean; categories: boolean }) => void;
}

const getIconForType = (type: ContentItem["baseType"], size: number = 16) => {
  switch (type) {
    case "Page":
    case "Experience":
      return <IconFile size={size} />;
    case "Product":
      return <IconShoppingBag size={size} />;
    case "Block":
      return <IconBlocks size={size} />;
    case "Media":
      return <IconPhoto size={size} />;
  }
};

export default function DetailsPane({
  content,
  selectedIds,
  selectedItems = [],
  allContent,
  detailsPaneTags,
  setDetailsPaneTags,
  detailsPaneCategories,
  setDetailsPaneCategories,
  onTagsChange,
  onTagsChangeBatch,
  onCategoriesChange,
  onCategoriesChangeBatch,
  onClose,
  onBatchEditModeChange,
}: DetailsPaneProps) {
  // Show multi-select view when 2+ items selected
  if (selectedIds && selectedIds.size > 1 && allContent) {
    const multiItems = allContent.filter((item) => selectedIds.has(item.id));
    return (
      <MultiSelectDetailsPane
        items={multiItems}
        controlledTags={detailsPaneTags}
        setControlledTags={setDetailsPaneTags}
        controlledCategories={detailsPaneCategories}
        setControlledCategories={setDetailsPaneCategories}
        onTagsChange={onTagsChange}
        onTagsChangeBatch={onTagsChangeBatch}
        onCategoriesChange={onCategoriesChange}
        onCategoriesChangeBatch={onCategoriesChangeBatch}
        onClose={onClose}
        onBatchEditModeChange={onBatchEditModeChange}
      />
    );
  }

  // Show single-select view (1 item or pane opened with 1 selected)
  if (!content) return null;

  const metadata = useDetailsMetadata(content);

  // Get global tags and categories from centralized repositories
  const { tags: globalTags, addTag: addGlobalTag, tagExists } = useGlobalTags();
  const { categories: globalCategoriesFull, categoriesWithSlugs: globalCategories, addCategory: addGlobalCategory, categoryExists } = useGlobalCategories();

  // Helpers: slug ↔ display name (UnifiedContentItem uses slugs)
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

  // Use lifted tag state (same as multi-select so 1↔2 switch preserves edits)
  const tags = detailsPaneTags ?? content.tags ?? [];
  const setTags = (next: string[] | ((prev: string[]) => string[])) => {
    setDetailsPaneTags(typeof next === "function" ? next(tags) : next);
  };
  const [newTag, setNewTag] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoriesHoveredIndex, setCategoriesHoveredIndex] = useState<number | null>(null);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestedSlugs, setSuggestedSlugs] = useState<string[]>([]);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [suggestEmpty, setSuggestEmpty] = useState(false);
  const [suggestCategoriesLoading, setSuggestCategoriesLoading] = useState(false);
  const [suggestedCategorySlugs, setSuggestedCategorySlugs] = useState<string[]>([]);
  const [suggestCategoryError, setSuggestCategoryError] = useState<string | null>(null);
  const [suggestCategoryEmpty, setSuggestCategoryEmpty] = useState(false);

  const TAGS_INITIAL_VISIBLE = 10;
  const visibleTags = tagsExpanded ? tags : tags.slice(0, TAGS_INITIAL_VISIBLE);
  const hasMoreTags = tags.length > TAGS_INITIAL_VISIBLE;
  const hiddenCount = tags.length - TAGS_INITIAL_VISIBLE;

  // Categories: same pattern as tags (lifted state, slug ↔ name from global repo)
  const categories = detailsPaneCategories ?? content.categories ?? [];
  const setCategories = (next: string[] | ((prev: string[]) => string[])) => {
    setDetailsPaneCategories(typeof next === "function" ? next(categories) : next);
  };
  const getCategoryBySlug = (slug: string): { name: string; slug: string } | undefined =>
    globalCategories.find((c) => c.slug === slug);
  const categorySlugToDisplayName = (slug: string): string =>
    getCategoryBySlug(slug)?.name ?? slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  const getCategorySlugByName = (name: string): string => {
    const c = globalCategories.find((cat) => cat.name.toLowerCase() === name.toLowerCase());
    return c?.slug ?? nameToSlug(name);
  };
  const CATEGORIES_INITIAL_VISIBLE = 10;
  const visibleCategories = categoriesExpanded ? categories : categories.slice(0, CATEGORIES_INITIAL_VISIBLE);
  const hasMoreCategories = categories.length > CATEGORIES_INITIAL_VISIBLE;
  const hiddenCategoriesCount = categories.length - CATEGORIES_INITIAL_VISIBLE;

  const handleRemoveTag = (slugToRemove: string) => {
    const next = tags.filter((slug) => slug !== slugToRemove);
    setTags(next);
    if (onTagsChange && content?.id) {
      onTagsChange(content.id, next);
    }
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
    const next = [...tags, slug];
    setTags(next);
    if (onTagsChange && content?.id) {
      onTagsChange(content.id, next);
    }
    setNewTag("");
  };

  const nameToSlug = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const handleSuggestTags = async () => {
    if (!content?.name) return;
    setSuggestLoading(true);
    setSuggestError(null);
    setSuggestEmpty(false);
    setSuggestedSlugs([]);
    try {
      const imageUrl = getThumbnailForContent({
        id: content.id,
        name: content.name,
        baseType: content.baseType,
      });
      const payload: any = {
        itemName: content.name,
        contentTypeId: content.contentTypeId,
        imageUrl,
      };
      if (globalTags.length > 0) {
        payload.tagTaxonomy = globalTags.map((t: Tag) => ({ name: t.name, slug: t.slug }));
      }
      const res = await fetch("/api/tags/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setSuggestError(data.error || "Tag suggestion isn't available");
        return;
      }
      const existingSlugs: string[] = data.suggestedSlugs ?? [];
      const newNames: string[] = data.suggestedNewNames ?? [];
      newNames.forEach((name: string) => {
        if (name.trim() && !tagExists(name)) addGlobalTag(name.trim());
      });
      const newSlugs = newNames.map((n: string) => nameToSlug(n)).filter(Boolean);
      const merged = Array.from(
        new Set([...existingSlugs, ...newSlugs])
      );
      const notAlreadyApplied = merged.filter((s: string) => !tags.includes(s));
      setSuggestedSlugs(notAlreadyApplied);
      setSuggestEmpty(notAlreadyApplied.length === 0);
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

  const handleRemoveCategory = (slugToRemove: string) => {
    const next = categories.filter((slug) => slug !== slugToRemove);
    setCategories(next);
    if (onCategoriesChange && content?.id) {
      onCategoriesChange(content.id, next);
    }
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
    const next = [...categories, slug];
    setCategories(next);
    if (onCategoriesChange && content?.id) {
      onCategoriesChange(content.id, next);
    }
    setNewCategory("");
  };

  const handleSuggestCategories = async () => {
    if (!content?.name) return;
    setSuggestCategoriesLoading(true);
    setSuggestCategoryError(null);
    setSuggestCategoryEmpty(false);
    setSuggestedCategorySlugs([]);
    try {
      const payload: any = { itemName: content.name };
      if (globalCategoriesFull.length > 0) {
        payload.categoryTaxonomy = globalCategoriesFull.map((c: { id: string; name: string; slug: string; parentId: string | null }) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          parentId: c.parentId ?? null,
        }));
      }
      const res = await fetch("/api/categories/suggest-for-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setSuggestCategoryError(data.error || "Category suggestion isn't available");
        return;
      }
      const slugs: string[] = data.suggestedSlugs ?? [];
      const notAlreadyApplied = slugs.filter((s: string) => !categories.includes(s));
      setSuggestedCategorySlugs(notAlreadyApplied);
      setSuggestCategoryEmpty(notAlreadyApplied.length === 0);
    } catch {
      setSuggestCategoryError("Category suggestion isn't available");
    } finally {
      setSuggestCategoriesLoading(false);
    }
  };

  const handleAddSuggestedCategory = (slug: string) => {
    handleAddCategory(slug);
    setSuggestedCategorySlugs((prev) => prev.filter((s) => s !== slug));
  };

  const handleAddAllSuggestedCategories = () => {
    const combined = [...categories];
    suggestedCategorySlugs.forEach((slug) => {
      if (!combined.includes(slug)) combined.push(slug);
    });
    setCategories(combined);
    setSuggestedCategorySlugs([]);
  };

  // Tag changes are persisted immediately when user edits tags (not on selection changes)

  // Filter global tags by input (by name)
  const filteredTags = globalTags.filter(
    (tag: Tag) => !newTag || tag.name.toLowerCase().includes(newTag.toLowerCase())
  );

  // Autocomplete options: value = slug for existing, value = name for custom
  const autocompleteOptions = filteredTags.map((tag: Tag) => ({
    label: tag.name,
    value: tag.slug,
    isSelected: tags.includes(tag.slug),
  }));

  const customTagName = newTag.trim();
  const hasCustomOption =
    customTagName && !globalTags.some((t: Tag) => t.name.toLowerCase() === customTagName.toLowerCase());
  if (hasCustomOption) {
    autocompleteOptions.push({
      label: `+ Add "${customTagName}" tag`,
      value: customTagName,
      isSelected: tags.some(s => getDisplayName(s) === customTagName),
    });
  }

  // Category autocomplete options
  const filteredCategories = globalCategories.filter(
    (c) => !newCategory || c.name.toLowerCase().includes(newCategory.toLowerCase())
  );
  const categoryAutocompleteOptions = filteredCategories.map((c) => ({
    label: c.name,
    value: c.slug,
    isSelected: categories.includes(c.slug),
  }));
  const customCategoryName = newCategory.trim();
  const hasCustomCategoryOption =
    customCategoryName && !globalCategories.some((c) => c.name.toLowerCase() === customCategoryName.toLowerCase());
  if (hasCustomCategoryOption) {
    categoryAutocompleteOptions.push({
      label: `+ Add "${customCategoryName}" category`,
      value: customCategoryName,
      isSelected: categories.some((s) => categorySlugToDisplayName(s) === customCategoryName),
    });
  }

  // Category changes are persisted immediately when user edits categories

  return (
    <Box
      display="flex"
      flexDirection="column"
      h="full"
      overflow="hidden"
      style={{
        width: "316px",
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px="24"
        py="24"
        style={{ flexShrink: 0, borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}
      >
        <Text fontSize="lg" fontWeight="600">
          Details
        </Text>
        <Button
          appearance="subtle"
          size="sm"
          onClick={onClose}
          aria-label="Close details pane"
          icon={<IconX size={16} />}
        />
      </Box>

      {/* Content */}
      <Box
        flex="1"
        overflow="auto"
        display="flex"
        flexDirection="column"
        gap="16"
        px="24"
        py="24"
      >
        {/* Item (thumbnail + name) – disclosable like other metadata */}
        <Disclosure defaultOpen>
          <DisclosureTrigger chevronPosition="start">
            <Text asChild fontSize="sm" fontWeight="600" color="fg.default">
              <span>Item</span>
            </Text>
          </DisclosureTrigger>
          <DisclosureContent asChild>
            <Box display="flex" flexDirection="column" gap="12" mt="8" style={{ paddingLeft: "20px" }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                style={{
                  borderRadius: "4px",
                  backgroundColor: "var(--ax-colors-bg-subtle)",
                  height: "180px",
                  color: "var(--ax-colors-fg-secondary)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Image
                  src={getThumbnailForContent({ id: content.id, name: content.name, baseType: content.baseType })}
                  alt={content.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </Box>
              <Box display="flex" flexDirection="column" gap="8">
                <Text fontSize="xs" color="fg.secondary" fontWeight="600" style={{ lineHeight: "14px" }}>
                  Name
                </Text>
                <Box display="flex" gap="8" alignItems="center">
                  <Box style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                    {getIconForType(content.baseType, 16)}
                  </Box>
                  <Text fontSize="md" fontWeight="600" style={{ wordBreak: "break-word" }}>
                    {content.name}
                  </Text>
                </Box>
              </Box>
            </Box>
          </DisclosureContent>
        </Disclosure>

        {/* Dynamic Disclosure Sections */}
        {metadata.sections.map((section, index) => (
          <Disclosure key={index}>
            <DisclosureTrigger chevronPosition="start">
              <Text asChild fontSize="sm" fontWeight="600" color="fg.default">
                <span>{section.title}</span>
              </Text>
            </DisclosureTrigger>
            <DisclosureContent asChild>
              <Box
                display="flex"
                flexDirection="column"
                gap="8"
                mt="8"
                style={{ paddingLeft: "20px" }}
              >
                {/* Properties */}
                {section.properties && (
                  <Box display="flex" flexDirection="column" gap="12">
                    {section.properties.map((prop, propIndex) => (
                      <Box key={propIndex} display="flex" flexDirection="column" gap="4">
                        <Text
                          fontSize="xs"
                          color="fg.secondary"
                          style={{ lineHeight: "14px", letterSpacing: "0.06px" }}
                        >
                          {prop.label}
                        </Text>
                        <Text fontSize="sm" color="fg.default">
                          {prop.value}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Items with Checkboxes or Icons */}
                {section.items && (
                  <Box display="flex" flexDirection="column" gap="8">
                    {section.items.map((item, itemIndex) => (
                      <Box key={itemIndex} display="flex" gap="8" alignItems="center">
                        {item.checked !== undefined ? (
                          <>
                            <Checkbox checked={item.checked ?? false} />
                            <Text fontSize="sm" color="fg.default">
                              {item.label}
                            </Text>
                          </>
                        ) : (
                          <>
                            {item.icon && (
                              <Box style={{ display: "flex", alignItems: "center", color: "var(--ax-colors-fg-secondary)" }}>
                                {item.icon}
                              </Box>
                            )}
                            <Text fontSize="sm" color="fg.default">
                              {item.label}
                            </Text>
                          </>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </DisclosureContent>
          </Disclosure>
        ))}

        {/* Tags */}
        <Disclosure defaultOpen>
          <DisclosureTrigger chevronPosition="start">
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
              style={{ paddingLeft: "20px" }}
            >
              <Popover
                open={newTag.length > 0 && autocompleteOptions.length > 0}
                onOpenChange={() => { }}
              >
                <PopoverTrigger asChild>
                  <Box>
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && autocompleteOptions.length > 0) {
                          handleAddTag(autocompleteOptions[0].value);
                        }
                      }}
                      placeholder="Search..."
                      size="md"
                      addonAfter={
                        <Tooltip content="Generate tag suggestions for this content using Opal">
                          <Button
                            appearance="default-opal"
                            size="sm"
                            rounded="sm"
                            px="8"
                            className="opalGenerateButton"
                            icon={<IconSparkles />}
                            onClick={(e) => {
                              e.preventDefault();
                              handleSuggestTags();
                            }}
                            disabled={suggestLoading}
                            loading={suggestLoading}
                            aria-label="Suggest tags with Opal"
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
                    {autocompleteOptions.map((option: { value: string; label: string; isSelected: boolean }, index: number) => (
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
                        onClick={() => handleAddTag(option.value)}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        {option.isSelected && (
                          <IconCheck size={14} style={{ flexShrink: 0 }} />
                        )}
                        <Text fontSize="sm" color="fg.default" style={{ marginLeft: option.isSelected ? 0 : undefined }}>
                          {option.label}
                        </Text>
                      </Box>
                    ))}
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
                  No related tags found for this content.
                </Text>
              )}
              {suggestLoading && (
                <Box display="flex" flexDirection="column" gap="4">
                  <Text fontSize="xs" color="fg.secondary" fontWeight="600">
                    Suggested
                  </Text>
                  <Box display="flex" flexWrap="wrap" gap="4" alignItems="center">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton
                        key={i}
                        h="24"
                        style={{ width: `${60 + i * 24}px`, borderRadius: '4px' }}
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
                  <Box display="flex" flexWrap="wrap" gap="4" alignItems="center">
                    {suggestedSlugs.map((slug) => (
                      <Badge
                        key={slug}
                        variant="subtle"
                        style={{
                          backgroundColor: "var(--ax-colors-bg-accent-subtle)",
                          color: "var(--ax-colors-fg-accent)",
                        }}
                      >
                        <Box display="flex" alignItems="center" gap="4">
                          <span>{getDisplayName(slug)}</span>
                          <button
                            type="button"
                            onClick={() => handleAddSuggestedTag(slug)}
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
                      aria-label="Add all suggested tags"
                    >
                      Add all
                    </Button>
                  </Box>
                </Box>
              )}

              <Box display="flex" flexDirection="column" gap="8">
                {suggestedSlugs.length > 0 && tags.length > 0 && (
                  <Text fontSize="xs" color="fg.secondary" fontWeight="600">
                    Existing
                  </Text>
                )}
                <Box display="flex" flexWrap="wrap" gap="8">
                  {visibleTags.map((slug) => (
                    <Badge key={slug} intent="neutral">
                      <Box display="flex" alignItems="center" gap="4">
                        <span>{getDisplayName(slug)}</span>
                        <button
                          onClick={() => handleRemoveTag(slug)}
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
                          aria-label={`Remove tag ${getDisplayName(slug)}`}
                        >
                          ×
                        </button>
                      </Box>
                    </Badge>
                  ))}
                </Box>
                {hasMoreTags && (
                  <Button
                    appearance="subtle"
                    size="sm"
                    onClick={() => setTagsExpanded(!tagsExpanded)}
                    aria-expanded={tagsExpanded}
                  >
                    {tagsExpanded ? "Show less" : `Show ${hiddenCount} more`}
                  </Button>
                )}
              </Box>
            </Box>
          </DisclosureContent>
        </Disclosure>

        {/* Categories */}
        <Disclosure defaultOpen>
          <DisclosureTrigger chevronPosition="start">
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
              style={{ paddingLeft: "20px" }}
            >
              <Popover
                open={newCategory.length > 0 && categoryAutocompleteOptions.length > 0}
                onOpenChange={() => {}}
              >
                <PopoverTrigger asChild>
                  <Box>
                    <Input
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && categoryAutocompleteOptions.length > 0) {
                          handleAddCategory(categoryAutocompleteOptions[0].value);
                        }
                      }}
                      placeholder="Search..."
                      size="md"
                      addonAfter={
                        <Tooltip content="Generate category suggestions for this content using Opal">
                          <Button
                            appearance="default-opal"
                            size="sm"
                            rounded="sm"
                            px="8"
                            className="opalGenerateButton"
                            icon={<IconSparkles />}
                            onClick={(e) => {
                              e.preventDefault();
                              handleSuggestCategories();
                            }}
                            disabled={suggestCategoriesLoading}
                            loading={suggestCategoriesLoading}
                            aria-label="Suggest categories with Opal"
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
                    {categoryAutocompleteOptions.map((option: { value: string; label: string; isSelected: boolean }, index: number) => (
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
                        bg={categoriesHoveredIndex === index ? "bg.secondary" : "transparent"}
                        onClick={() => handleAddCategory(option.value)}
                        onMouseEnter={() => setCategoriesHoveredIndex(index)}
                        onMouseLeave={() => setCategoriesHoveredIndex(null)}
                      >
                        {option.isSelected && (
                          <IconCheck size={14} style={{ flexShrink: 0 }} />
                        )}
                        <Text fontSize="sm" color="fg.default" style={{ marginLeft: option.isSelected ? 0 : undefined }}>
                          {option.label}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                </PopoverContent>
              </Popover>
              {suggestCategoryError && (
                <Text fontSize="xs" color="fg.error">
                  {suggestCategoryError}
                </Text>
              )}
              {suggestCategoryEmpty && !suggestCategoriesLoading && (
                <Text fontSize="xs" color="fg.secondary">
                  No related categories found for this content.
                </Text>
              )}
              {suggestCategoriesLoading && (
                <Box display="flex" flexDirection="column" gap="4">
                  <Text fontSize="xs" color="fg.secondary" fontWeight="600">
                    Suggested
                  </Text>
                  <Box display="flex" flexWrap="wrap" gap="4" alignItems="center">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton
                        key={i}
                        h="24"
                        style={{ width: `${60 + i * 24}px`, borderRadius: "4px" }}
                        className="opal-skeleton-shimmer"
                      />
                    ))}
                  </Box>
                </Box>
              )}
              {!suggestCategoriesLoading && suggestedCategorySlugs.length > 0 && (
                <Box display="flex" flexDirection="column" gap="4">
                  <Text fontSize="xs" color="fg.secondary" fontWeight="600">
                    Suggested
                  </Text>
                  <Box display="flex" flexWrap="wrap" gap="4" alignItems="center">
                    {suggestedCategorySlugs.map((slug) => (
                      <Badge
                        key={slug}
                        variant="subtle"
                        style={{
                          backgroundColor: "var(--ax-colors-bg-accent-subtle)",
                          color: "var(--ax-colors-fg-accent)",
                        }}
                      >
                        <Box display="flex" alignItems="center" gap="4">
                          <span>{categorySlugToDisplayName(slug)}</span>
                          <button
                            type="button"
                            onClick={() => handleAddSuggestedCategory(slug)}
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
                            aria-label={`Add ${categorySlugToDisplayName(slug)}`}
                          >
                            +
                          </button>
                        </Box>
                      </Badge>
                    ))}
                    <Button
                      appearance="subtle"
                      size="sm"
                      onClick={handleAddAllSuggestedCategories}
                      aria-label="Add all suggested categories"
                    >
                      Add all
                    </Button>
                  </Box>
                </Box>
              )}

              <Box display="flex" flexDirection="column" gap="8">
                <Box display="flex" flexWrap="wrap" gap="8">
                  {visibleCategories.map((slug) => (
                    <Badge key={slug} intent="neutral">
                      <Box display="flex" alignItems="center" gap="4">
                        <span>{categorySlugToDisplayName(slug)}</span>
                        <button
                          onClick={() => handleRemoveCategory(slug)}
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
                          aria-label={`Remove category ${categorySlugToDisplayName(slug)}`}
                        >
                          ×
                        </button>
                      </Box>
                    </Badge>
                  ))}
                </Box>
                {hasMoreCategories && (
                  <Button
                    appearance="subtle"
                    size="sm"
                    onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                    aria-expanded={categoriesExpanded}
                  >
                    {categoriesExpanded ? "Show less" : `Show ${hiddenCategoriesCount} more`}
                  </Button>
                )}
              </Box>
            </Box>
          </DisclosureContent>
        </Disclosure>
      </Box>

      {/* Buttons */}
      <Box
        display="flex"
        gap="16"
        px="24"
        py="24"
        style={{ flexShrink: 0, borderTop: "1px solid var(--ax-colors-border-tertiary)" }}
      >
        <Button appearance="default" flex="1" style={{ justifyContent: "center" }} addonBefore={<IconEye size={16} />}>
          View
        </Button>
        <Button appearance="primary" flex="1" style={{ justifyContent: "center" }} addonBefore={<IconPencil size={16} />}>
          Edit
        </Button>
      </Box>
    </Box>
  );
}
