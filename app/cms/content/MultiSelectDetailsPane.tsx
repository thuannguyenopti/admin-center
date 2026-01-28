"use client";

import { Box, Disclosure, DisclosureTrigger, DisclosureContent, Button, Input, Badge, Popover, PopoverTrigger, PopoverContent } from "@optiaxiom/react";
import { IconX, IconStack2, IconFile, IconPhoto, IconShoppingBag, IconBlocks, IconPlus, IconCheck } from "@tabler/icons-react";
import { Text } from "@/app/components/Text";
import { ContentItem } from "./page";
import { useMultiSelectMetadata } from "./useMultiSelectMetadata";
import Image from "next/image";
import { useState } from "react";
import { useGlobalTags } from "../hooks/useGlobalTags";

interface MultiSelectDetailsPaneProps {
  items: ContentItem[];
  onClose: () => void;
}

export default function MultiSelectDetailsPane({ items, onClose }: MultiSelectDetailsPaneProps) {
  const metadata = useMultiSelectMetadata(items);
  
  // Get global tags from centralized repository
  const { tagNames: availableTags, addTag: addGlobalTag, tagExists } = useGlobalTags();
  
  const [tags, setTags] = useState<string[]>(metadata.tags);
  const [newTag, setNewTag] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddTag = (tagValue: string) => {
    if (tagValue.trim() && !tags.includes(tagValue)) {
      // If tag doesn't exist in global repository, add it
      if (!tagExists(tagValue)) {
        addGlobalTag(tagValue);
      }
      // Add to current items' tags
      setTags([...tags, tagValue]);
      setNewTag("");
    }
  };

  // Filter available tags based on input
  const filteredTags = availableTags
    .filter(tag => !newTag || tag.toLowerCase().includes(newTag.toLowerCase()));

  // Create options for autocomplete dropdown
  const autocompleteOptions = filteredTags.map(tag => ({
    label: tag,
    value: tag,
    isSelected: tags.includes(tag)
  }));

  // Add custom tag option if input doesn't match any available tag
  if (newTag.trim() && !availableTags.includes(newTag)) {
    autocompleteOptions.push({
      label: `+ Add "${newTag}" tag`,
      value: newTag,
      isSelected: false
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
        <Text fontSize="lg" fontWeight="400">
          {metadata.count} items selected
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
          <DisclosureTrigger>
            Asset Information
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
          <DisclosureTrigger>
            Tags
          </DisclosureTrigger>
          <DisclosureContent asChild>
            <Box
              display="flex"
              flexDirection="column"
              gap="8"
              mt="8"
              style={{ paddingLeft: "20px" }}
            >
              {/* Tags Display */}
              <Box
                display="flex"
                flexWrap="wrap"
                gap="8"
              >
                {tags.map(tag => (
                  <Badge key={tag} intent="neutral">
                    <Box display="flex" alignItems="center" gap="4">
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
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
                        aria-label={`Remove tag ${tag}`}
                      >
                        ×
                      </button>
                    </Box>
                  </Badge>
                ))}
              </Box>

              {/* Add Tag Input with Custom Autocomplete */}
              <Popover 
                open={newTag.length > 0 && autocompleteOptions.length > 0}
                onOpenChange={() => {}}
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
                    gap="2"
                    p="4"
                    style={{ maxHeight: "200px" }}
                    overflow="auto"
                  >
                    {autocompleteOptions.map((option, index) => (
                      <Box
                        key={option.value}
                        display="flex"
                        alignItems="center"
                        gap="8"
                        px="12"
                        py="8"
                        rounded="sm"
                        cursor="pointer"
                        transition="colors"
                        bg={hoveredIndex === index ? "bg.secondary" : "transparent"}
                        onClick={() => handleAddTag(option.value)}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        {option.isSelected && (
                          <IconCheck size={16} color="var(--ax-colors-fg-secondary)" />
                        )}
                        {!option.isSelected && <Box w="16" />}
                        <Text fontSize="sm" color="fg.default">
                          {option.label}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                </PopoverContent>
              </Popover>
            </Box>
          </DisclosureContent>
        </Disclosure>

        {/* Asset Types */}
        <Disclosure defaultOpen>
          <DisclosureTrigger>
            Asset types
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
    </Box>
  );
}
