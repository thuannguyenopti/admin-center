"use client";

import React from "react";
import { Box, Button, Group, Heading, Text } from "@optiaxiom/react";
import { AdaptiveBlockComponentProps } from "../AdaptiveBlockRegistry";

export type AgentDisplayCardItem = {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  ctaLabel?: string;
  ctaAppearance?: "primary" | "default" | "subtle";
  onCta?: () => void;
};

export type AgentDisplayCardBlockMetadata = {
  blockType: "agent-display-card";
  eyebrow?: string;
  title: string;
  description?: string;
  items: AgentDisplayCardItem[];
  footerText?: string;
  footerLinkLabel?: string;
  onFooterClick?: () => void;
};

export const AgentDisplayCardBlock: React.FC<AdaptiveBlockComponentProps> = ({
  metadata,
}) => {
  const card = metadata as AgentDisplayCardBlockMetadata;

  return (
    <Box
      bg="bg.default"
      border="1"
      borderColor="border.default"
      rounded="xl"
      p="20"
      w="full"
      style={{ maxWidth: 800 }}
    >
      <Box mb="16">
        {card.eyebrow ? (
          <Text fontSize="sm" color="fg.secondary" mb="4">
            {card.eyebrow}
          </Text>
        ) : null}
        <Heading level="4" fontSize="md" fontWeight="500" mb={card.description ? "6" : "0"}>
          {card.title}
        </Heading>
        {card.description ? (
          <Text fontSize="sm" color="fg.tertiary">
            {card.description}
          </Text>
        ) : null}
      </Box>

      <Box display="flex" flexDirection="column" gap="0">
        {card.items.map((item, index) => (
          <Box key={item.id}>
            <Group justifyContent="space-between" alignItems="center" py="12" gap="16">
              <Group gap="12" alignItems="center">
                <Box
                  border="1"
                  borderColor="border.tertiary"
                  rounded="xl"
                  h="40"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  style={{ minWidth: 40 }}
                >
                  {item.icon ?? item.title.charAt(0)}
                </Box>
                <Box>
                  <Text fontWeight="600">{item.title}</Text>
                  <Text fontSize="xs" color="fg.tertiary">
                    {item.description}
                  </Text>
                </Box>
              </Group>
              {item.ctaLabel ? (
                <Button
                  appearance={item.ctaAppearance ?? "primary"}
                  size="sm"
                  onClick={item.onCta}
                >
                  {item.ctaLabel}
                </Button>
              ) : null}
            </Group>
            {index < card.items.length - 1 ? (
              <Box borderB="1" borderColor="border.tertiary" />
            ) : null}
          </Box>
        ))}
      </Box>

      {card.footerText || card.footerLinkLabel ? (
        <>
          <Box borderB="1" borderColor="border.tertiary" mt="8" />
          <Group gap="6" alignItems="center" pt="12">
            {card.footerText ? (
              <Text fontSize="sm" color="fg.tertiary">
                {card.footerText}
              </Text>
            ) : null}
            {card.footerLinkLabel ? (
              <Button appearance="subtle" size="sm" onClick={card.onFooterClick}>
                {card.footerLinkLabel}
              </Button>
            ) : null}
          </Group>
        </>
      ) : null}
    </Box>
  );
};
