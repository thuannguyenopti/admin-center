"use client";

import { Box, Disclosure, DisclosureTrigger, DisclosureContent, Button, Input } from "@optiaxiom/react";
import { IconX, IconStack2 } from "@tabler/icons-react";
import { Text } from "@/app/components/Text";
import { ContentItem } from "./page";
import { useMultiSelectMetadata } from "./useMultiSelectMetadata";
import Image from "next/image";
import { useState } from "react";

interface MultiSelectDetailsPaneProps {
  items: ContentItem[];
  onClose: () => void;
}

export default function MultiSelectDetailsPane({ items, onClose }: MultiSelectDetailsPaneProps) {
  const metadata = useMultiSelectMetadata(items);
  const [tags, setTags] = useState<string[]>(metadata.tags);
  const [newTag, setNewTag] = useState("");

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

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
                style={{
                  backgroundColor: "var(--ax-colors-bg-subtle)",
                  padding: "8px",
                  borderRadius: "4px",
                }}
              >
                {tags.map(tag => (
                  <Box
                    key={tag}
                    display="flex"
                    alignItems="center"
                    gap="4"
                    style={{
                      backgroundColor: "var(--ax-colors-bg-default)",
                      padding: "6px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                    }}
                  >
                    <span style={{ color: "white" }}>{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "0",
                        display: "flex",
                        alignItems: "center",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "500",
                        lineHeight: "1",
                      }}
                      aria-label={`Remove tag ${tag}`}
                    >
                      ×
                    </button>
                  </Box>
                ))}
              </Box>

              {/* Add Tag Input */}
              <Box display="flex" gap="4">
                <Input
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === "Enter") {
                      handleAddTag();
                    }
                  }}
                  placeholder="Add tag..."
                  size="md"
                />
                <Button
                  size="sm"
                  onClick={handleAddTag}
                >
                  Add
                </Button>
              </Box>
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
                <Box display="flex" gap="8" alignItems="center">
                  <span style={{ fontSize: "14px" }}>📄</span>
                  <Text fontSize="sm" color="fg.default">
                    Pages ({metadata.typeDistribution.Page})
                  </Text>
                </Box>
              )}
              {metadata.typeDistribution.Image > 0 && (
                <Box display="flex" gap="8" alignItems="center">
                  <span style={{ fontSize: "14px" }}>🖼️</span>
                  <Text fontSize="sm" color="fg.default">
                    Images ({metadata.typeDistribution.Image})
                  </Text>
                </Box>
              )}
              {metadata.typeDistribution.Product > 0 && (
                <Box display="flex" gap="8" alignItems="center">
                  <span style={{ fontSize: "14px" }}>🛍️</span>
                  <Text fontSize="sm" color="fg.default">
                    Products ({metadata.typeDistribution.Product})
                  </Text>
                </Box>
              )}
              {metadata.typeDistribution.Block > 0 && (
                <Box display="flex" gap="8" alignItems="center">
                  <span style={{ fontSize: "14px" }}>📦</span>
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
