"use client";

import React from "react";
import { Box, Button, Group, Heading, Text } from "@optiaxiom/react";
import { IconX } from "@tabler/icons-react";
import { AdaptiveBlockComponentProps } from "../AdaptiveBlockRegistry";

export type AgentSurveyOption = {
  id: string;
  label: string;
  description?: string;
  prefix?: string;
  icon?: React.ReactNode;
};

export type AgentQuestionSurveyBlockMetadata = {
  blockType: "agent-question-survey";
  title: string;
  progressLabel?: string;
  options: AgentSurveyOption[];
  customOption?: {
    label: string;
    buttonLabel?: string;
    icon?: React.ReactNode;
    onSelect?: () => void;
  };
  onSelect?: (option: AgentSurveyOption) => void;
  onDismiss?: () => void;
};

export const AgentQuestionSurveyBlock: React.FC<AdaptiveBlockComponentProps> = ({
  metadata,
}) => {
  const survey = metadata as AgentQuestionSurveyBlockMetadata;

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
      <Group justifyContent="space-between" alignItems="center" mb="16">
        <Heading level="4" fontSize="md" fontWeight="500">
          {survey.title}
        </Heading>
        <Group gap="8" alignItems="center">
          {survey.progressLabel ? (
            <Text fontSize="sm" color="fg.tertiary">
              {survey.progressLabel}
            </Text>
          ) : null}
          {survey.onDismiss ? (
            <Button
              appearance="subtle"
              onClick={survey.onDismiss}
              aria-label="Close survey"
            >
              <IconX size={14} />
            </Button>
          ) : null}
        </Group>
      </Group>

      <Box display="flex" flexDirection="column" gap="0">
        {survey.options.map((option, index) => (
          <Box key={option.id}>
            <button
              type="button"
              onClick={() => survey.onSelect?.(option)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px",
                border: "none",
                background: "transparent",
                borderRadius: "8px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <Box
                bg="bg.secondary"
                color="fg.default"
                rounded="md"
                h="32"
                display="flex"
                alignItems="center"
                justifyContent="center"
                style={{ minWidth: 32 }}
              >
                {option.prefix ?? `${index + 1}`}
              </Box>
              <Text fontSize="sm" color="fg.default">
                {option.label}
              </Text>
            </button>
            {index < survey.options.length - 1 ? (
              <Box borderB="1" borderColor="border.tertiary" />
            ) : null}
          </Box>
        ))}

        {survey.customOption ? (
          <>
            <Box borderB="1" borderColor="border.tertiary" />
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap="12"
              p="16"
            >
              <Group gap="12" alignItems="center">
                <Box
                  bg="bg.secondary"
                  color="fg.secondary"
                  rounded="md"
                  h="32"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  style={{ minWidth: 32 }}
                >
                  {survey.customOption.icon ?? "?"}
                </Box>
                <Text fontSize="sm" color="fg.tertiary">
                  {survey.customOption.label}
                </Text>
              </Group>
              <Button appearance="default" size="sm" onClick={survey.customOption.onSelect}>
                {survey.customOption.buttonLabel ?? "Skip"}
              </Button>
            </Box>
          </>
        ) : null}
      </Box>
    </Box>
  );
};
