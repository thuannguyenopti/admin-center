"use client";

import { Box, Disclosure, DisclosureTrigger, DisclosureContent, Button, Checkbox } from "@optiaxiom/react";
import { IconX, IconFile, IconShoppingBag, IconBlocks, IconPhoto } from "@tabler/icons-react";
import { Text } from "@/app/components/Text";
import { ContentItem } from "./page";
import { useDetailsMetadata } from "./useDetailsMetadata";
import MultiSelectDetailsPane from "./MultiSelectDetailsPane";
import Image from "next/image";

interface DetailsPaneProps {
  content?: ContentItem;
  selectedIds?: Set<string>;
  allContent?: ContentItem[];
  onClose: () => void;
}

const getThumbnailImage = (id: string): string | null => {
  const thumbnails: { [key: string]: string } = {
    "1": "https://images.unsplash.com/photo-1634084462412-b54873c0a56d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjB3ZWJzaXRlJTIwZmVhdHVyZXMlMjBwYWdlJTIwZGVzaWduJTIwc2hvd2Nhc2V8ZW58MHwwfHx8MTc2NTc1MDc5MXww&ixlib=rb-4.1.0&q=85",
    "2": "https://images.unsplash.com/photo-1637578371283-d9076f66ba8e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxM3x8Zml0bmVzcyUyMHRyYWluaW5nJTIwd29ya291dCUyMHBsYW5zJTIwaW50ZXJmYWNlJTIwZGVzaWdufGVufDB8MHx8fDE3NjU3NTA3OTF8MA&ixlib=rb-4.1.0&q=85",
    "3": "https://images.pexels.com/photos/19961775/pexels-photo-19961775.jpeg",
    "4": "https://images.pexels.com/photos/4531875/pexels-photo-4531875.jpeg",
    "5": "https://images.pexels.com/photos/8970688/pexels-photo-8970688.jpeg",
    "6": "https://images.unsplash.com/photo-1659823300663-93084f1795d7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHxwcmVtaXVtJTIwc3Vic2NyaXB0aW9uJTIwc2VydmljZSUyMHVwZ3JhZGUlMjBvZmZlcmluZ3xlbnwwfDB8fHwxNzY1NzUxMDQxfDA&ixlib=rb-4.1.0&q=85",
    "7": "https://images.pexels.com/photos/13870890/pexels-photo-13870890.jpeg",
    "8": "https://images.unsplash.com/photo-1759661966728-4a02e3c6ed91?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxkYXNoYm9hcmQlMjBhbmFseXRpY3MlMjBkYXRhJTIwdmlzdWFsaXphdGlvbiUyMG1ldHJpY3N8ZW58MHwwfHx8MTc2NTc1MTA0MXww&ixlib=rb-4.1.0&q=85",
    "9": "https://images.unsplash.com/photo-1756639748717-4fa715709a39?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxjeWNsaW5nJTIwbW91bnRhaW4lMjBiaWtlJTIwYmljeWNsZSUyMGhlcm8lMjBhY3Rpb258ZW58MHwwfHx8MTc2NTc1MTA0Mnww&ixlib=rb-4.1.0&q=85",
    "10": "https://images.pexels.com/photos/8867207/pexels-photo-8867207.jpeg",
    "11": "https://images.unsplash.com/photo-1722890571919-f59b75a92c92?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxjeWNsaW5nJTIwcm91dGUlMjBwbGFubmluZyUyMG1hcCUyMG5hdmlnYXRpb258ZW58MHwwfHx8MTc2NTc1MTA3Nnww&ixlib=rb-4.1.0&q=85",
    "12": "https://images.unsplash.com/photo-1637578371283-d9076f66ba8e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxM3x8Zml0bmVzcyUyMHRyYWluaW5nJTIwd29ya291dCUyMHBsYW5zJTIwaW50ZXJmYWNlJTIwZGVzaWdufGVufDB8MHx8fDE3NjU3NTA3OTF8MA&ixlib=rb-4.1.0&q=85",
    "13": "https://images.unsplash.com/photo-1756639748717-4fa715709a39?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxjeWNsaW5nJTIwbW91bnRhaW4lMjBiaWtlJTIwYmljeWNsZSUyMGhlcm8lMjBhY3Rpb258ZW58MHwwfHx8MTc2NTc1MTA0Mnww&ixlib=rb-4.1.0&q=85",
    "14": "https://images.unsplash.com/photo-1759661966728-4a02e3c6ed91?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxkYXNoYm9hcmQlMjBhbmFseXRpY3MlMjBkYXRhJTIwdmlzdWFsaXphdGlvbiUyMG1ldHJpY3N8ZW58MHwwfHx8MTc2NTc1MTA0MXww&ixlib=rb-4.1.0&q=85",
    "15": "https://images.pexels.com/photos/4531875/pexels-photo-4531875.jpeg",
    "16": "https://images.unsplash.com/photo-1756639748717-4fa715709a39?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxjeWNsaW5nJTIwbW91bnRhaW4lMjBiaWtlJTIwYmljeWNsZSUyMGhlcm8lMjBhY3Rpb258ZW58MHwwfHx8MTc2NTc1MTA0Mnww&ixlib=rb-4.1.0&q=85",
    "17": "https://images.pexels.com/photos/4498478/pexels-photo-4498478.jpeg",
    "18": "https://images.pexels.com/photos/8867207/pexels-photo-8867207.jpeg",
    "19": "https://images.unsplash.com/photo-1722890571919-f59b75a92c92?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxjeWNsaW5nJTIwcm91dGUlMjBwbGFubmluZyUyMG1hcCUyMG5hdmlnYXRpb258ZW58MHwwfHx8MTc2NTc1MTA3Nnww&ixlib=rb-4.1.0&q=85",
    "20": "https://images.unsplash.com/photo-1759661966728-4a02e3c6ed91?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxkYXNoYm9hcmQlMjBhbmFseXRpY3MlMjBkYXRhJTIwdmlzdWFsaXphdGlvbiUyMG1ldHJpY3N8ZW58MHwwfHx8MTc2NTc1MTA0MXww&ixlib=rb-4.1.0&q=85",
  };
  return thumbnails[id] || null;
};

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

export default function DetailsPane({ content, selectedIds, allContent, onClose }: DetailsPaneProps) {
  // Show multi-select view if multiple items selected
  if (selectedIds && selectedIds.size > 1 && allContent) {
    const selectedItems = allContent.filter(item => selectedIds.has(item.id));
    return <MultiSelectDetailsPane items={selectedItems} onClose={onClose} />;
  }

  // Show single-select view
  if (!content) return null;

  const metadata = useDetailsMetadata(content);

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
        {/* Preview Icon/Thumbnail */}
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
          {getThumbnailImage(content.id) ? (
            <Image
              src={getThumbnailImage(content.id)!}
              alt={content.name}
              fill
              style={{ objectFit: "cover" }}
            />
          ) : (
            <Box style={{ display: "flex", alignItems: "center" }}>
              {getIconForType(content.type, 80)}
            </Box>
          )}
        </Box>

        {/* Name with Icon */}
        <Box display="flex" flexDirection="column" gap="8">
          <Text fontSize="xs" color="fg.secondary" style={{ lineHeight: "14px" }}>
            Name
          </Text>
          <Box display="flex" gap="8" alignItems="center">
            <Box style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              {getIconForType(content.type, 16)}
            </Box>
            <Text fontSize="md" fontWeight="600" style={{ wordBreak: "break-word" }}>
              {content.name}
            </Text>
          </Box>
        </Box>

        {/* Dynamic Disclosure Sections */}
        {metadata.sections.map((section, index) => (
          <Disclosure key={index}>
            <DisclosureTrigger>
              {section.title}
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
      </Box>

      {/* Buttons */}
      <Box
        display="flex"
        gap="16"
        px="24"
        py="24"
        style={{ flexShrink: 0, borderTop: "1px solid var(--ax-colors-border-tertiary)" }}
      >
        <Button appearance="subtle" flex="1" style={{ justifyContent: "center" }}>
          View
        </Button>
        <Button appearance="primary" flex="1" style={{ justifyContent: "center" }}>
          Edit
        </Button>
      </Box>
    </Box>
  );
}
