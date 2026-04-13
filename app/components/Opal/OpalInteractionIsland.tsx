"use client";

import { Box, Text as AxiomText } from "@optiaxiom/react";
import { Button } from "../Button";

type OpalInteractionIslandProps = {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
};

export function OpalInteractionIsland({
  suggestions,
  onSuggestionClick,
}: OpalInteractionIslandProps) {
  if (suggestions.length === 0) return null;

  return (
    <Box
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        zIndex: 40,
        padding: "16px 20px",
        backgroundColor: "var(--opal-bg-primary)",
        border: "1px solid var(--opal-border-primary)",
        borderRadius: "12px",
        boxShadow: "0px 6px 18px rgba(9, 30, 66, 0.04), 0px 6px 12px rgba(9, 30, 66, 0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        maxWidth: 360,
      }}
    >
      <AxiomText
        fontSize="sm"
        fontWeight="400"
        color="fg.default"
        style={{ margin: 0 }}
      >
        What would you like to do next?
      </AxiomText>
      <AxiomText
        fontSize="xs"
        color="fg.tertiary"
        style={{ margin: 0 }}
      >
        Suggestions:
      </AxiomText>
      <Box display="flex" flexDirection="column" gap="8">
        {suggestions.map((chip, i) => (
          <Button
            key={i}
            appearance="subtle"
            size="sm"
            onClick={() => onSuggestionClick(chip)}
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
  );
}
