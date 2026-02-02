"use client";

import { Box, Disclosure, DisclosureTrigger, DisclosureContent, Button, Input, Badge, Popover, PopoverTrigger, PopoverContent } from "@optiaxiom/react";
import { IconX, IconStack2, IconFile, IconPhoto, IconShoppingBag, IconBlocks, IconCheck, IconArrowLeft, IconArrowsMaximize, IconArrowsMinimize } from "@tabler/icons-react";
import { Text } from "@/app/components/Text";
import { ContentItem } from "./page";
import { useMultiSelectMetadata } from "./useMultiSelectMetadata";
import { useState, useEffect, useRef } from "react";
import { useGlobalTags } from "../hooks/useGlobalTags";
import type { Tag } from "../settings/tags/types";

type AutocompleteOption = { label: string; value: string; isSelected: boolean };

interface MultiSelectDetailsPaneProps {
  items: ContentItem[];
  controlledTags?: string[] | null;
  setControlledTags?: (tags: string[] | null) => void;
  onTagsChange?: (contentId: string, tags: string[]) => void;
  onTagsChangeBatch?: (updates: Array<{ id: string; tags: string[] }>) => void;
  onClose: () => void;
}

export default function MultiSelectDetailsPane({
  items,
  controlledTags,
  setControlledTags,
  onTagsChange,
  onTagsChangeBatch,
  onClose,
}: MultiSelectDetailsPaneProps) {
  const metadata = useMultiSelectMetadata(items);
  const isControlled = setControlledTags != null;

  // Get global tags (full Tag[] for slug ↔ name mapping)
  const { tags: globalTags, addTag: addGlobalTag, tagExists } = useGlobalTags();

  const getTagBySlug = (slug: string): Tag | undefined =>
    globalTags.find((t: Tag) => t.slug === slug);
  const getDisplayName = (slug: string): string => getTagBySlug(slug)?.name ?? slug;
  const getSlugByName = (name: string): string => {
    const t = globalTags.find((tag: Tag) => tag.name.toLowerCase() === name.toLowerCase());
    return t?.slug ?? name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  };

  // Tags state: controlled from parent (Option 2) or local
  const [localTags, setLocalTags] = useState<string[]>(metadata.tags);
  const tags = isControlled ? (controlledTags ?? metadata.tags) : localTags;
  const setTags = (next: string[] | ((prev: string[]) => string[])) => {
    const value = typeof next === "function" ? next(tags) : next;
    if (isControlled) setControlledTags(value);
    else setLocalTags(value);
  };

  const [newTag, setNewTag] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [hoveredTagSlug, setHoveredTagSlug] = useState<string | null>(null);
  const [isBatchEditMode, setIsBatchEditMode] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [lastSummary, setLastSummary] = useState<string | null>(null);
  const initialTagsRef = useRef<string[]>([]);
  const hoverCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (hoverCloseTimeoutRef.current) clearTimeout(hoverCloseTimeoutRef.current);
  }, []);

  // When controlled and parent passes null, init from union
  useEffect(() => {
    if (isControlled && controlledTags === null && setControlledTags && items.length > 0) {
      setControlledTags(metadata.tags);
    }
  }, [isControlled, controlledTags, setControlledTags, items.length, metadata.tags.join(",")]);

  // Sync tags when selection changes (new union) — only when not controlled
  useEffect(() => {
    if (!isControlled) setLocalTags(metadata.tags);
  }, [isControlled, metadata.tags.join(","), metadata.count]);

  // Clear last summary when selection count changes
  useEffect(() => {
    setLastSummary(null);
  }, [metadata.count]);

  const TAGS_INITIAL_VISIBLE = 10;
  const visibleTags = tagsExpanded ? tags : tags.slice(0, TAGS_INITIAL_VISIBLE);
  const hasMoreTags = tags.length > TAGS_INITIAL_VISIBLE;
  const hiddenCount = tags.length - TAGS_INITIAL_VISIBLE;

  // Tags added in this batch (not in initial set when batch edit started)
  const addedTagsInBatch = isBatchEditMode
    ? tags.filter((slug) => !initialTagsRef.current.includes(slug))
    : [];

  const enterBatchEdit = () => {
    initialTagsRef.current = [...tags];
    setIsBatchEditMode(true);
    setIsPanelExpanded(true);
    setLastSummary(null);
  };
  const exitBatchEdit = (apply: boolean) => {
    if (!apply) setTags(metadata.tags);
    setIsBatchEditMode(false);
    setIsPanelExpanded(false);
  };
  const handleApply = () => {
    if (!onTagsChangeBatch || items.length === 0) return;
    const initial = initialTagsRef.current;
    const removed = initial.filter((s) => !tags.includes(s));
    const added = tags.filter((s) => !initial.includes(s));
    onTagsChangeBatch(items.map((item) => ({ id: item.id, tags })));
    const parts: string[] = [];
    removed.forEach((slug) => {
      const count = items.filter((i) => (i.tags ?? []).includes(slug)).length;
      parts.push(`Removed ${getDisplayName(slug)} from ${count} ${count === 1 ? "item" : "items"}`);
    });
    if (added.length > 0) {
      parts.push(`Added ${added.map((s) => getDisplayName(s)).join(", ")} to ${items.length} ${items.length === 1 ? "item" : "items"}`);
    }
    setLastSummary(parts.length > 0 ? parts.join(". ") : `Updated tags on ${items.length} ${items.length === 1 ? "item" : "items"}`);
    exitBatchEdit(true);
  };

  // Persist tag set to all selected items in one batch (only when NOT in batch-edit mode and NOT controlled)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isControlled || isBatchEditMode || items.length === 0) return;
    const persist = onTagsChangeBatch ?? onTagsChange;
    if (!persist) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (onTagsChangeBatch) {
        onTagsChangeBatch(items.map((item) => ({ id: item.id, tags })));
      } else if (onTagsChange) {
        items.forEach((item) => onTagsChange(item.id, tags));
      }
      debounceRef.current = null;
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [isControlled, tags, items, onTagsChange, onTagsChangeBatch, isBatchEditMode]);

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
    customTagName && !globalTags.some((t: Tag) => t.name.toLowerCase() === customTagName.toLowerCase());
  if (hasCustomOption) {
    autocompleteOptions.push({
      label: `+ Add "${customTagName}" tag`,
      value: customTagName,
      isSelected: tags.some((s) => getDisplayName(s) === customTagName),
    });
  }

  const paneWidth = isPanelExpanded ? "480px" : "316px";

  return (
    <Box
      display="flex"
      flexDirection="column"
      h="full"
      overflow="hidden"
      style={{ width: paneWidth, transition: "width 0.2s ease" }}
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
        <Box display="flex" alignItems="center" gap="8">
          {isBatchEditMode && (
            <Button
              appearance="subtle"
              size="sm"
              onClick={() => exitBatchEdit(false)}
              aria-label="Back to summary"
              icon={<IconArrowLeft size={16} />}
            />
          )}
          <Text fontSize="lg" fontWeight="600">
            {metadata.count} items selected
          </Text>
        </Box>
        <Box display="flex" alignItems="center" gap="4">
          {isBatchEditMode && (
            <Button
              appearance="subtle"
              size="sm"
              onClick={() => setIsPanelExpanded(!isPanelExpanded)}
              aria-label={isPanelExpanded ? "Collapse panel" : "Expand panel"}
              icon={isPanelExpanded ? <IconArrowsMinimize size={16} /> : <IconArrowsMaximize size={16} />}
            />
          )}
          <Button
            appearance="subtle"
            size="sm"
            onClick={onClose}
            aria-label="Close details pane"
            icon={<IconX size={16} />}
          />
        </Box>
      </Box>

      {/* Batch-edit view (pane takeover) */}
      {isBatchEditMode ? (
        <Box
          flex="1"
          display="flex"
          flexDirection="column"
          gap="16"
          px="24"
          py="24"
          overflow="hidden"
          style={{ minHeight: 0 }}
        >
          {/* Tags on selection */}
          <Box display="flex" flexDirection="column" gap="8" style={{ flexShrink: 0 }}>
            <Text fontSize="sm" fontWeight="600" color="fg.default">
              Tags on selection
            </Text>
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
                <Box display="flex" flexDirection="column" gap="0" py="2" style={{ maxHeight: "200px" }} overflow="auto">
                  {autocompleteOptions.map((option: AutocompleteOption, index: number) => (
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
                      {option.isSelected && <IconCheck size={14} style={{ flexShrink: 0 }} />}
                      <Text fontSize="sm" color="fg.default" style={{ marginLeft: option.isSelected ? 0 : undefined }}>
                        {option.label}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </PopoverContent>
            </Popover>
            <Box display="flex" flexDirection="column" gap="8">
              {tags.map((slug) => {
                const itemsWithTag = items.filter((item) => (item.tags ?? []).includes(slug));
                const count = itemsWithTag.length;
                const isAddedInBatch = addedTagsInBatch.includes(slug);
                return (
                  <Box key={slug} display="flex" alignItems="center" gap="4">
                    <Badge intent={isAddedInBatch ? "success" : "neutral"} variant={isAddedInBatch ? "subtle" : undefined}>
                      <Box display="flex" alignItems="center" gap="4">
                        <span>{getDisplayName(slug)}</span>
                        <Text fontSize="xs" color="fg.secondary" style={{ fontWeight: 400 }}>
                          on {count} {count === 1 ? "item" : "items"}
                        </Text>
                        <button
                          onClick={() => handleRemoveTag(slug)}
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
          </Box>
          {/* Tags by item (fills remaining height, scrolls within) */}
          <Box
            display="flex"
            flexDirection="column"
            gap="12"
            flex="1"
            style={{ minHeight: 0 }}
            overflow="hidden"
          >
            <Text fontSize="sm" fontWeight="600" color="fg.default" style={{ flexShrink: 0 }}>
              Tags by item
            </Text>
            <Box
              display="flex"
              flexDirection="column"
              gap="8"
              flex="1"
              style={{ minHeight: 0 }}
              overflow="auto"
            >
              {items.slice(0, items.length > 20 ? 15 : items.length).map((item) => {
                const itemTags = item.tags ?? [];
                // Union of item's current tags and batch selection: show removed, kept, and added
                const allSlugsForItem = Array.from(new Set([...itemTags, ...tags]));
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
                      backgroundColor: "var(--ax-colors-bg-subtle)",
                      border: "1px solid var(--ax-colors-border-tertiary)",
                    }}
                  >
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
                        display: "block",
                        minWidth: 0,
                      }}
                    >
                      {item.name ?? item.id}
                    </span>
                    {hasAnyTags ? (
                      <Box display="flex" flexWrap="wrap" gap="6">
                        {allSlugsForItem.map((slug) => {
                          const wasOnItem = itemTags.includes(slug);
                          const isInBatch = tags.includes(slug);
                          const isRemoved = wasOnItem && !isInBatch; // user removed this tag from batch → danger subtle + strikethrough
                          const willBeAdded = !wasOnItem && isInBatch; // tag in batch but not on this item
                          const isNewTag = willBeAdded && addedTagsInBatch.includes(slug); // added from autocomplete → success subtle
                          const isMissingOnThisItem = willBeAdded && !isNewTag; // other items have it, this item doesn't → warning subtle
                          return (
                            <Badge
                              key={slug}
                              intent={
                                isRemoved ? "danger" : isNewTag ? "success" : isMissingOnThisItem ? "warning" : "neutral"
                              }
                              variant={isRemoved || isNewTag || isMissingOnThisItem ? "subtle" : undefined}
                              style={isRemoved ? { textDecoration: "line-through" } : undefined}
                            >
                              {getDisplayName(slug)}
                            </Badge>
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
                <Text fontSize="xs" color="fg.tertiary" style={{ paddingLeft: "4px" }}>
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
            style={{ flexShrink: 0, paddingTop: "16px", borderTop: "1px solid var(--ax-colors-border-tertiary)" }}
          >
            <Text fontSize="xs" color="fg.secondary" style={{ flex: 1 }}>
              Changes apply to all selected items.
            </Text>
            <Button appearance="subtle" size="md" onClick={() => exitBatchEdit(false)}>
              Back
            </Button>
            <Button appearance="primary" size="md" onClick={handleApply}>
              Apply
            </Button>
          </Box>
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
              style={{ backgroundColor: "var(--ax-colors-bg-subtle)", border: "1px solid var(--ax-colors-border-tertiary)" }}
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
                style={{ paddingLeft: "20px" }}
              >
                <Box display="flex" flexDirection="column" gap="4">
                  <Text
                    fontSize="xs"
                    color="fg.secondary"
                    style={{ lineHeight: "14px", letterSpacing: "0.06px" }}
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
                    style={{ lineHeight: "14px", letterSpacing: "0.06px" }}
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
                    style={{ lineHeight: "14px", letterSpacing: "0.06px" }}
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
                style={{ paddingLeft: "20px" }}
              >
                {/* Add Tag Input with Custom Autocomplete (above tags) */}
                <Popover
                  open={newTag.length > 0 && autocompleteOptions.length > 0}
                  onOpenChange={() => { }}
                >
                  <PopoverTrigger asChild>
                    <Box>
                      <Input
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        onKeyPress={e => {
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
                      {autocompleteOptions.map((option: AutocompleteOption, index: number) => (
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

                {/* Tags Display — "on N items" + hover popover on pill */}
                <Box
                  display="flex"
                  flexDirection="column"
                  gap="8"
                >
                  <Box
                    display="flex"
                    flexDirection="column"
                    gap="8"
                  >
                    {visibleTags.map((slug) => {
                      const itemsWithTag = items.filter((item) => (item.tags ?? []).includes(slug));
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
                        hoverCloseTimeoutRef.current = setTimeout(() => setHoveredTagSlug(null), 150);
                      };
                      return (
                        <Box key={slug} display="flex" alignItems="center" flexWrap="wrap">
                          <Popover open={isHoverOpen} onOpenChange={(open) => !open && setHoveredTagSlug(null)}>
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
                                  <Box display="flex" alignItems="center" gap="4">
                                    <span>{getDisplayName(slug)}</span>
                                    <Text fontSize="xs" color="fg.secondary" style={{ fontWeight: 400 }}>
                                      on {count} {count === 1 ? "item" : "items"}
                                    </Text>
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
                              </Box>
                            </PopoverTrigger>
                            <PopoverContent
                              side="bottom"
                              sideOffset={4}
                              align="start"
                              style={{ width: "240px", maxHeight: "280px" }}
                              onMouseEnter={clearCloseTimeout}
                              onMouseLeave={scheduleClose}
                            >
                              <Box
                                display="flex"
                                flexDirection="column"
                                py="2"
                                px="2"
                                style={{ maxHeight: "260px", overflow: "auto" }}
                              >
                                <Text fontSize="xs" color="fg.secondary" mb="2" style={{ paddingLeft: "4px" }}>
                                  {count} {count === 1 ? "item" : "items"} with this tag
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
                                      textOverflow: "ellipsis",
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
                      {tagsExpanded ? "Show less" : `Show ${hiddenCount} more`}
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
                style={{ paddingLeft: "20px" }}
              >
                {metadata.typeDistribution.Page > 0 && (
                  <Box display="flex" gap="8" alignItems="center" color="fg.secondary">
                    <IconFile size={16} />
                    <Text fontSize="sm" color="fg.default">
                      Pages ({metadata.typeDistribution.Page})
                    </Text>
                  </Box>
                )}
                {metadata.typeDistribution.Media > 0 && (
                  <Box display="flex" gap="8" alignItems="center" color="fg.secondary">
                    <IconPhoto size={16} />
                    <Text fontSize="sm" color="fg.default">
                      Media ({metadata.typeDistribution.Media})
                    </Text>
                  </Box>
                )}
                {metadata.typeDistribution.Product > 0 && (
                  <Box display="flex" gap="8" alignItems="center" color="fg.secondary">
                    <IconShoppingBag size={16} />
                    <Text fontSize="sm" color="fg.default">
                      Products ({metadata.typeDistribution.Product})
                    </Text>
                  </Box>
                )}
                {metadata.typeDistribution.Block > 0 && (
                  <Box display="flex" gap="8" alignItems="center" color="fg.secondary">
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
