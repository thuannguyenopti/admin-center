"use client";

import { Box, Badge } from "@optiaxiom/react";
import { Text } from "../Text";
import { opalTypography } from "@/app/styles/opalTypography";

type OpalSuggestionsProps = {
  onSuggestionClick: (suggestion: string) => void;
  type?: 'default' | 'cms' | 'image-gen';
};

const defaultSuggestions = [
  {
    title: "What's new in Optimizely?",
    enhancedPrompt: "What are the most recent product updates and new features introduced to the Optimizely platform in the last few months?"
  },
  {
    title: "How can I improve my conversion rate?",
    enhancedPrompt: "I want to improve the conversion rate of my current project. Can you suggest some best practices and common strategies used in high-performing Optimizely experiments?"
  },
  {
    title: "Tell me about the latest product updates",
    enhancedPrompt: "Please provide a detailed summary of the latest Optimizely product releases, focusing on CMS and Experimentation features."
  },
  {
    title: "How do I create a new experiment?",
    enhancedPrompt: "Can you provide a step-by-step guide on how to create a new A/B test or experiment within the Optimizely platform, from hypothesis to launch?"
  },
];

const cmsSuggestions = [
  {
    title: "Optimize this page for SEO",
    enhancedPrompt: "I want to optimize the current CMS page for search engines. Please analyze the content, headings, and meta structure, and provide specific recommendations to improve its organic search visibility."
  },
  {
    title: "Optimize for generative AI answers",
    enhancedPrompt: "How can I make this page more likely to be cited by generative AI search engines like Perplexity or Google SGE? Please analyze the structure and suggest improvements for clarity and directness."
  },
  {
    title: "Generate alt text for images",
    enhancedPrompt: "I need descriptive alt text for the images on this CMS page to improve accessibility and SEO. Please identify the key images and suggest concise, accurate alt text for each."
  },
  {
    title: "Add tags and categories for metadata",
    enhancedPrompt: "Based on the content of this CMS page, what are the most relevant tags and categories I should add to the metadata? Please suggest a list of 5-7 items that would help with internal search and organization."
  },
];

const imageGenSuggestions = [
  {
    title: "Create a triathlon hero image",
    enhancedPrompt: "Create a new dynamic image for a triathlon poster with clean copy space, premium athletic photography, and a Stride-style endurance brand feel."
  },
  {
    title: "Generate a spring race social visual",
    enhancedPrompt: "Generate a premium paid social image for Stride's spring race season with an athlete in motion, bright natural light, and room for campaign headlines."
  },
  {
    title: "Make an event poster concept",
    enhancedPrompt: "Create a bold event poster concept for a Stride endurance launch with a dramatic hero athlete, brand-safe colors, and a clean title area."
  },
  {
    title: "Create a product-forward campaign image",
    enhancedPrompt: "Create a premium campaign image that balances athletic action with product focus for Stride, keeping the composition suitable for social and event use."
  },
];

export function OpalSuggestions({ onSuggestionClick, type = 'default' }: OpalSuggestionsProps) {
  const suggestions =
    type === 'cms'
      ? cmsSuggestions
      : type === 'image-gen'
        ? imageGenSuggestions
        : defaultSuggestions;

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
      <Box display="flex" flexDirection="row" flexWrap="wrap" gap="8" w="full">
        {suggestions.map((item, index) => (
          <Box
            key={index}
            onClick={() => onSuggestionClick(item.enhancedPrompt)}
            style={{
              cursor: 'pointer',
              padding: '6px 12px',
              background: 'var(--opal-bg-suggest)',
              border: '1px solid var(--opal-border-secondary)',
              borderRadius: '6px',
              color: 'var(--opal-text-primary)',
              transition: 'all 0.2s ease',
              width: 'fit-content',
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
                fontSize: '13px',
                whiteSpace: 'nowrap',
              }}
            >
              {item.title}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
