"use client";

import { Box, Badge } from "@optiaxiom/react";
import { Text } from "../Text";
import { opalTypography } from "@/app/styles/opalTypography";

type OpalSuggestionsProps = {
  onSuggestionClick: (suggestion: string) => void;
};

const suggestions = [
  "Suggestion",
  "Suggestion Medium",
  "Suggestion prompt goes to two lines here",
  "Suggestion long text 2 lines would look like this that wraps and truncate to 2 lines",
];

export function OpalSuggestions({ onSuggestionClick }: OpalSuggestionsProps) {
  return (
    <Box display="flex" flexDirection="column" gap="8" w="full">
      <Text
        style={{ 
          ...opalTypography.label,
          margin: 0,
          color: 'var(--opal-text-label)',
        }}
      >
        Suggestions:
      </Text>
      <Box display="flex" flexDirection="column" gap="12" w="full">
        {suggestions.map((suggestion, index) => (
          <Box
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            style={{
              cursor: 'pointer',
              padding: '10px 16px',
              background: 'var(--opal-bg-suggest)',
              border: '1px solid var(--opal-border-secondary)',
              borderRadius: '6px',
              color: 'var(--opal-text-primary)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--opal-bg-suggest-hover)';
              e.currentTarget.style.borderColor = 'var(--opal-border-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--opal-bg-suggest)';
              e.currentTarget.style.borderColor = 'var(--opal-border-secondary)';
            }}
          >
            <Text
              style={{
                ...opalTypography.body,
                margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {suggestion}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}