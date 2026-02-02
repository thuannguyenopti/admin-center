"use client";

import { Box, Disclosure, DisclosureTrigger, DisclosureContent, Button, Checkbox, Input, Badge, Popover, PopoverTrigger, PopoverContent } from "@optiaxiom/react";
import { IconX, IconFile, IconShoppingBag, IconBlocks, IconPhoto, IconEye, IconPencil, IconCheck } from "@tabler/icons-react";
import { Text } from "@/app/components/Text";
import { ContentItem } from "./page";
import { useDetailsMetadata } from "./useDetailsMetadata";
import MultiSelectDetailsPane from "./MultiSelectDetailsPane";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useGlobalTags } from "../hooks/useGlobalTags";
import type { Tag } from "../settings/tags/types";
import { getThumbnailForContent } from "./contentThumbnails";

interface DetailsPaneProps {
  content?: ContentItem;
  selectedIds?: Set<string>;
  selectedItems?: ContentItem[];
  allContent?: ContentItem[];
  detailsPaneTags: string[] | null;
  setDetailsPaneTags: (tags: string[] | null) => void;
  onTagsChange?: (contentId: string, tags: string[]) => void;
  onTagsChangeBatch?: (updates: Array<{ id: string; tags: string[] }>) => void;
  onClose: () => void;
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
  onTagsChange,
  onTagsChangeBatch,
  onClose,
}: DetailsPaneProps) {
  // Show multi-select view when 2+ items selected
  if (selectedIds && selectedIds.size > 1 && allContent) {
    const multiItems = allContent.filter((item) => selectedIds.has(item.id));
    return (
      <MultiSelectDetailsPane
        items={multiItems}
        controlledTags={detailsPaneTags}
        setControlledTags={setDetailsPaneTags}
        onTagsChange={onTagsChange}
        onTagsChangeBatch={onTagsChangeBatch}
        onClose={onClose}
      />
    );
  }

  // Show single-select view (1 item or pane opened with 1 selected)
  if (!content) return null;

  const metadata = useDetailsMetadata(content);

  // Get global tags from centralized repository (full Tag[] for slug ↔ name mapping)
  const { tags: globalTags, addTag: addGlobalTag, tagExists } = useGlobalTags();

  // Helpers: slug ↔ display name (UnifiedContentItem uses slugs)
  const getTagBySlug = (slug: string): Tag | undefined =>
    globalTags.find((t: Tag) => t.slug === slug);
  const getDisplayName = (slug: string): string => getTagBySlug(slug)?.name ?? slug;
  const getSlugByName = (name: string): string => {
    const t = globalTags.find((tag: Tag) => tag.name.toLowerCase() === name.toLowerCase());
    return t?.slug ?? name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  };

  // Use lifted tag state (same as multi-select so 1↔2 switch preserves edits)
  const tags = detailsPaneTags ?? content.tags ?? [];
  const setTags = (next: string[] | ((prev: string[]) => string[])) => {
    setDetailsPaneTags(typeof next === "function" ? next(tags) : next);
  };
  const [newTag, setNewTag] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tagsExpanded, setTagsExpanded] = useState(false);

  const TAGS_INITIAL_VISIBLE = 10;
  const visibleTags = tagsExpanded ? tags : tags.slice(0, TAGS_INITIAL_VISIBLE);
  const hasMoreTags = tags.length > TAGS_INITIAL_VISIBLE;
  const hiddenCount = tags.length - TAGS_INITIAL_VISIBLE;

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

  // Persist tag changes (debounced) for single item
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!onTagsChange || !content?.id) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onTagsChange(content.id, tags);
      debounceRef.current = null;
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [tags, content?.id, onTagsChange]);

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
                      placeholder="Add tag..."
                      size="md"
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

              <Box display="flex" flexDirection="column" gap="8">
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
