"use client";

import { Box, Text as AxiomText } from "@optiaxiom/react";
import {
  IconPen,
  IconArrowsRotate,
  IconCopy,
  IconDownload,
  IconThumbsUp,
  IconThumbsDown,
  IconSparkles,
} from "@optimizely/axiom-icons";
import {
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconFileText,
  IconTools,
} from "@tabler/icons-react";
import { Text } from "../Text";
import { ChatMessage } from "@/app/hooks/useOpalState";
import { ExperimentSummaryBlock } from "./ExperimentSummaryBlock";
import { ExperimentCreationAgentBlock } from "./ExperimentCreationAgentBlock";
import type { ExperimentCreationAgentPayload } from "./experimentCreationAgentTypes";
import type { ExperimentSummaryPayload } from "@/app/web-experimentation/optimizations/[id]/results/types";
import { Button } from "../Button";
import Image from "next/image";

/** Borders / strokes — Opal greys (no product blue accent). */
const OPAL_STEP_BORDER = "var(--opal-border-secondary)";
const OPAL_STEP_DIVIDER = "var(--opal-border-secondary)";
/** Fixed Opal purple for processing UI (see --opal-processing-brand in opalStyles). */
const OPAL_ICON_BRAND = "var(--opal-processing-brand)";
const OPAL_WORKING_LABEL = "var(--opal-processing-brand)";
/** Sparkle chip — same family, slightly softer. */
const OPAL_CHIP_SPARKLE = "var(--opal-processing-brand-muted)";
/** Secondary iconography + chevrons. */
const OPAL_ICON_MUTED = "var(--opal-neutral-600)";

/** Placeholder body for the expanded active step (matches accordion detail treatment in design). */
const OPAL_ACTIVE_STEP_BODY =
  "Next, I'll continue processing this step in the background. Opal will pull signals from your experiment context, summarize results, and surface the next steps in the pipeline.";

type OpalProcessingStepState = "done" | "active" | "pending";

function OpalProcessingStepCard({
  stepLabel,
  state,
}: {
  stepLabel: string;
  state: OpalProcessingStepState;
}) {
  const isActive = state === "active";
  const isDone = state === "done";
  const pending = state === "pending";

  return (
    <Box
      display="flex"
      flexDirection="column"
      w="full"
      style={{
        borderRadius: 10,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: OPAL_STEP_BORDER,
        overflow: "hidden",
        backgroundColor: "transparent",
      }}
    >
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        gap="10"
        px="12"
        py="12"
        style={{ minWidth: 0 }}
      >
        <Box display="flex" flexDirection="row" alignItems="center" gap="12" style={{ minWidth: 0, flex: 1 }}>
          <Box
            style={{
              width: 24,
              height: 24,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isDone ? (
              <Box
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  backgroundColor: OPAL_ICON_BRAND,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconCheck size={12} stroke={3} color="white" aria-hidden />
              </Box>
            ) : isActive ? (
              <Box
                className="opal-loading-spinner"
                role="status"
                aria-label="Loading"
                style={{
                  width: 20,
                  height: 20,
                  flexShrink: 0,
                  border: "2px solid rgba(124, 92, 255, 0.22)",
                  borderTopColor: "var(--opal-processing-brand)",
                  borderRadius: "50%",
                  animation: "spin 0.85s linear infinite",
                }}
              />
            ) : (
              <Box
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "var(--opal-border-secondary)",
                  opacity: 0.75,
                }}
              />
            )}
          </Box>
          <Text
            fontSize="sm"
            fontWeight="500"
            color={pending ? "fg.tertiary" : "fg.default"}
            style={{
              margin: 0,
              lineHeight: 1.4,
              opacity: pending ? 0.55 : 1,
              ...(isActive ? { color: OPAL_ICON_BRAND } : {}),
            }}
          >
            {stepLabel}
          </Text>
        </Box>
        <Box
          className="opal-processing-step-chevron"
          data-expanded={isActive ? "true" : "false"}
          alignItems="center"
          aria-hidden
        >
          <IconChevronRight size={18} stroke={2} color={OPAL_ICON_MUTED} />
        </Box>
      </Box>
      <Box
        className="opal-processing-step-expand"
        data-expanded={isActive ? "true" : "false"}
        w="full"
      >
        <Box className="opal-processing-step-expand__inner" w="full">
          <Box
            className="opal-processing-step-expand__content"
            px="12"
            pb="16"
            pt="0"
            display="flex"
            flexDirection="column"
            gap="12"
            style={{
              borderTop: `1px solid ${OPAL_STEP_DIVIDER}`,
            }}
          >
            <Text fontSize="sm" color="fg.secondary" style={{ margin: 0, lineHeight: 1.65 }}>
              {OPAL_ACTIVE_STEP_BODY}
            </Text>
            <Box display="flex" flexWrap="wrap" gap="8" alignItems="center">
              {(
                [
                  {
                    label: "Stride Business Context",
                    icon: <IconFileText size={14} stroke={1.5} color={OPAL_ICON_MUTED} />,
                  },
                  {
                    label: "@experiment_summary",
                    icon: <IconSparkles size={14} color={OPAL_CHIP_SPARKLE} />,
                  },
                  {
                    label: "search_optimizely_docs",
                    icon: <IconTools size={14} stroke={1.5} color={OPAL_ICON_MUTED} />,
                  },
                ] as const
              ).map((chip) => (
                <Box
                  key={chip.label}
                  display="inline-flex"
                  alignItems="center"
                  gap="6"
                  px="10"
                  py="4"
                  rounded="md"
                  style={{
                    backgroundColor: "transparent",
                    border: `1px solid ${OPAL_STEP_BORDER}`,
                  }}
                >
                  <Box style={{ display: "flex", flexShrink: 0 }}>{chip.icon}</Box>
                  <AxiomText fontSize="xs" color="fg.secondary" style={{ margin: 0, lineHeight: 1.45 }}>
                    {chip.label}
                  </AxiomText>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

type OpalMessageProps = {
  message: ChatMessage;
  onSuggestionClick?: (suggestion: string) => void;
  onSubmitPrompt?: (message: string) => void;
  isOpalLoading?: boolean;
};

function isExperimentCreationPayload(
  message: ChatMessage,
): message is ChatMessage & { type: 'experiment_creation_agent'; payload: ExperimentCreationAgentPayload } {
  return (
    message.type === 'experiment_creation_agent' &&
    message.payload != null &&
    'intro' in message.payload
  );
}

export function OpalMessage({ message, onSuggestionClick, onSubmitPrompt, isOpalLoading }: OpalMessageProps) {
  const isUser = message.role === 'user';
  const isLoading = message.isLoading;
  const isExperimentSummary =
    message.type === 'experiment_summary' && message.payload != null;
  const isExperimentCreation = isExperimentCreationPayload(message);

  const bubbleMaxWidth = isExperimentSummary || isExperimentCreation ? '100%' : '80%';

  /** No outer chat “card” around Working… + step list — only nested step cards show borders. */
  const isProcessingStepsLoading =
    isLoading && (message.loadingSteps?.length ?? 0) > 0;

  return (
    <Box
      display="flex"
      flexDirection="column"
      w="full"
      mb="12"
      gap="8"
      alignItems={isUser ? "end" : "start"}
    >
      <Box
        display="flex"
        flexDirection="row"
        alignItems="start"
        gap="8"
        style={{
          maxWidth: bubbleMaxWidth,
        }}
      >
        <Box
          p={
            isExperimentSummary || isExperimentCreation
              ? "16"
              : isProcessingStepsLoading
                ? "0"
                : "12"
          }
          style={{
            flex: 1,
            backgroundColor: isUser
              ? "var(--opal-bg-user)"
              : isProcessingStepsLoading
                ? "transparent"
                : "var(--opal-bg-primary)",
            color: isUser ? "var(--opal-text-user)" : "var(--opal-text-body)",
            border: isUser
              ? undefined
              : isProcessingStepsLoading
                ? "none"
                : "1px solid var(--opal-border-secondary)",
            borderRadius: isProcessingStepsLoading ? 0 : "12px",
            boxShadow:
              isUser ? undefined : isProcessingStepsLoading ? "none" : "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          {isLoading ? (
            <Box display="flex" flexDirection="column" alignItems="stretch" gap="12" w="full">
              {message.loadingSteps && message.loadingSteps.length > 0 ? (
                <>
                  <Box display="flex" alignItems="center" gap="6">
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      style={{ margin: 0, color: OPAL_WORKING_LABEL }}
                    >
                      Working…
                    </Text>
                    <IconChevronDown size={16} stroke={1.75} color={OPAL_ICON_BRAND} aria-hidden />
                  </Box>
                  <Box display="flex" flexDirection="column" gap="10" w="full">
                    {message.loadingStepIndex !== undefined
                      ? message.loadingSteps.map((step, i) => {
                          const len = message.loadingSteps!.length;
                          const idx = message.loadingStepIndex!;
                          const done = i < idx || idx >= len;
                          const active = i === idx && idx < len;
                          const state: OpalProcessingStepState = done
                            ? "done"
                            : active
                              ? "active"
                              : "pending";
                          return (
                            <OpalProcessingStepCard key={`${step}-${i}`} stepLabel={step} state={state} />
                          );
                        })
                      : message.loadingSteps.map((step, i) => (
                          <OpalProcessingStepCard key={`${step}-${i}`} stepLabel={step} state="pending" />
                        ))}
                  </Box>
                </>
              ) : (
                <Box display="flex" alignItems="center" gap="8">
                  <Box
                    className="opal-loading-spinner"
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid currentColor",
                      borderTopColor: "currentColor",
                      opacity: 0.3,
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  <Text fontSize="sm" style={{ margin: 0 }}>
                    Opal is thinking...
                  </Text>
                </Box>
              )}
            </Box>
          ) : isExperimentCreation && message.payload ? (
            <ExperimentCreationAgentBlock
              payload={message.payload}
              onSubmitPrompt={onSubmitPrompt ?? (() => {})}
              disabled={isOpalLoading === true}
            />
          ) : isExperimentSummary && message.payload ? (
            <ExperimentSummaryBlock
              payload={message.payload as ExperimentSummaryPayload}
              onSuggestionClick={onSuggestionClick}
            />
          ) : (
            <Text
              fontSize="sm"
              style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {message.content}
            </Text>
          )}
        </Box>
        {isUser && (
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <Image
              src="/avatar-user.png"
              alt="User avatar"
              width={20}
              height={20}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}
      </Box>
      {!isExperimentSummary && !isExperimentCreation && (
        <Text fontSize="xs" color="fg.tertiary" style={{ margin: 0 }}>
          {formatTimestamp(message.timestamp)}
        </Text>
      )}
      {isExperimentSummary && (
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          gap="8"
          style={{
            marginTop: 16,
            marginBottom: 16,
            maxWidth: bubbleMaxWidth,
          }}
        >
          <Button
            appearance="subtle"
            size="sm"
            onClick={() => { }}
            icon={<IconPen size={16} color="var(--opal-neutral-600)" />}
            style={{ color: "var(--opal-neutral-600)" }}
          >
            Edit in Canvas
          </Button>
          <Button
            appearance="subtle"
            size="sm"
            onClick={() => { }}
            icon={<IconArrowsRotate size={16} color="var(--opal-neutral-600)" />}
            aria-label="Refresh"
            style={{ color: "var(--opal-neutral-600)" }}
          />
          <Button
            appearance="subtle"
            size="sm"
            onClick={() => { }}
            icon={<IconCopy size={16} color="var(--opal-neutral-600)" />}
            aria-label="Copy"
            style={{ color: "var(--opal-neutral-600)" }}
          />
          <Button
            appearance="subtle"
            size="sm"
            onClick={() => { }}
            icon={<IconDownload size={16} color="var(--opal-neutral-600)" />}
            aria-label="Download"
            style={{ color: "var(--opal-neutral-600)" }}
          />
          <Button
            appearance="subtle"
            size="sm"
            onClick={() => { }}
            icon={<IconThumbsUp size={16} color="var(--opal-neutral-600)" />}
            aria-label="Thumbs up"
            style={{ color: "var(--opal-neutral-600)" }}
          />
          <Button
            appearance="subtle"
            size="sm"
            onClick={() => { }}
            icon={<IconThumbsDown size={16} color="var(--opal-neutral-600)" />}
            aria-label="Thumbs down"
            style={{ color: "var(--opal-neutral-600)" }}
          />
        </Box>
      )}
      {isExperimentSummary &&
        message.payload &&
        "suggestionChips" in message.payload &&
        message.payload.suggestionChips &&
        message.payload.suggestionChips.length > 0 && (
        <Box
          display="flex"
          flexDirection="column"
          gap="6"
          style={{
            alignSelf: "start",
            maxWidth: bubbleMaxWidth,
            marginTop: 8,
          }}
        >
          <AxiomText fontSize="sm" fontWeight="400" color="fg.default" style={{ margin: 0 }}>
            What would you like to do next?
          </AxiomText>
          <AxiomText
            fontSize="sm"
            fontWeight="400"
            color="fg.secondary"
            style={{ marginTop: 16, marginBottom: 8, marginLeft: 0, marginRight: 0 }}
          >
            Suggested:
          </AxiomText>
          <Box display="flex" flexDirection="column" gap="6">
            {(message.payload as ExperimentSummaryPayload).suggestionChips!.map((chip: string, i: number) => (
              <Button
                key={i}
                appearance="subtle"
                size="sm"
                onClick={() => onSuggestionClick?.(chip)}
                style={{
                  justifyContent: "start",
                  height: 38,
                  width: "fit-content",
                  alignSelf: "start",
                  background: "var(--opal-bg-suggest)",
                  border: "1px solid var(--ax-colors-border-secondary)",
                }}
              >
                {chip}
              </Button>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

  return new Date(timestamp).toLocaleDateString();
}