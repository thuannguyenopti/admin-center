"use client";

import React, { useMemo, useState } from "react";
import { Box, Button, Field, Group, Heading, Input, Text, Textarea } from "@optiaxiom/react";
import { AdaptiveBlockComponentProps } from "../AdaptiveBlockRegistry";

export type AgentInteractiveCardBlockMetadata = {
  blockType: "agent-interactive-card";
  title: string;
  description?: string;
  defaultName?: string;
  defaultGoal?: string;
  defaultAudience?: string;
  toolOptions?: string[];
  defaultTools?: string[];
  submitLabel?: string;
  onSubmit?: (payload: {
    name: string;
    goal: string;
    audience: string;
    tools: string[];
  }) => void;
};

export const AgentInteractiveCardBlock: React.FC<AdaptiveBlockComponentProps> = ({
  metadata,
}) => {
  const card = metadata as AgentInteractiveCardBlockMetadata;
  const [name, setName] = useState(card.defaultName ?? "");
  const [goal, setGoal] = useState(card.defaultGoal ?? "");
  const [audience, setAudience] = useState(card.defaultAudience ?? "");
  const [tools, setTools] = useState<string[]>(card.defaultTools ?? []);

  const toolOptions = useMemo(() => card.toolOptions ?? [], [card.toolOptions]);

  const toggleTool = (tool: string) => {
    setTools((current) =>
      current.includes(tool)
        ? current.filter((item) => item !== tool)
        : [...current, tool]
    );
  };

  const canSubmit = name.trim().length > 0 && goal.trim().length > 0;

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
        <Heading level="4" fontSize="md" fontWeight="500" mb={card.description ? "6" : "0"}>
          {card.title}
        </Heading>
        {card.description ? (
          <Text fontSize="sm" color="fg.tertiary">
            {card.description}
          </Text>
        ) : null}
      </Box>

      <Box display="flex" flexDirection="column" gap="16">
        <Field label="Agent name">
          <Input
            value={name}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
            placeholder="e.g. Opal onboarding guide"
          />
        </Field>

        <Field label="What should it do?">
          <Textarea
            value={goal}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setGoal(event.target.value)}
            placeholder="Describe the agent's main job, outcome, or workflow."
            rows={4}
          />
        </Field>

        <Field label="Who is it for?">
          <Input
            value={audience}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setAudience(event.target.value)}
            placeholder="e.g. Growth marketers ramping onto Opal"
          />
        </Field>

        {toolOptions.length > 0 ? (
          <Field label="Suggested tools">
            <Group gap="8" style={{ flexWrap: "wrap" }}>
              {toolOptions.map((tool) => {
                const selected = tools.includes(tool);
                return (
                  <Button
                    key={tool}
                    appearance={selected ? "primary" : "default"}
                    size="sm"
                    onClick={() => toggleTool(tool)}
                  >
                    {tool}
                  </Button>
                );
              })}
            </Group>
          </Field>
        ) : null}

        <Group justifyContent="flex-end">
          <Button
            appearance="primary"
            disabled={!canSubmit}
            onClick={() =>
              card.onSubmit?.({
                name: name.trim(),
                goal: goal.trim(),
                audience: audience.trim(),
                tools,
              })
            }
          >
            {card.submitLabel ?? "Create draft"}
          </Button>
        </Group>
      </Box>
    </Box>
  );
};
