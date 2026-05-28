"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "../Text";
import { opalTypography } from "@/app/styles/opalTypography";

type OpalSuggestionsProps = {
  onSuggestionClick: (suggestion: string) => void;
  type?: 'default' | 'cms' | 'image-gen';
};

const defaultSuggestions = [
  {
    title: "What's new in Optimizely?",
    description: "Get a summary of the latest product updates and features.",
    enhancedPrompt: "What are the most recent product updates and new features introduced to the Optimizely platform in the last few months?"
  },
  {
    title: "How can I improve my conversion rate?",
    description: "Best practices and strategies for high-performing experiments.",
    enhancedPrompt: "I want to improve the conversion rate of my current project. Can you suggest some best practices and common strategies used in high-performing Optimizely experiments?"
  },
  {
    title: "How do I create a new experiment?",
    description: "Step-by-step guide from hypothesis to launch.",
    enhancedPrompt: "Can you provide a step-by-step guide on how to create a new A/B test or experiment within the Optimizely platform, from hypothesis to launch?"
  },
];

const cmsSuggestions = [
  {
    title: "Optimize this page for SEO",
    description: "Analyze content and suggest improvements for organic search visibility.",
    enhancedPrompt: "I want to optimize the current CMS page for search engines. Please analyze the content, headings, and meta structure, and provide specific recommendations to improve its organic search visibility."
  },
  {
    title: "Optimize for generative AI answers",
    description: "Make this page more likely to be cited by AI search engines.",
    enhancedPrompt: "How can I make this page more likely to be cited by generative AI search engines like Perplexity or Google SGE? Please analyze the structure and suggest improvements for clarity and directness."
  },
  {
    title: "Generate alt text for images",
    description: "Improve accessibility and SEO with descriptive alt text.",
    enhancedPrompt: "I need descriptive alt text for the images on this CMS page to improve accessibility and SEO. Please identify the key images and suggest concise, accurate alt text for each."
  },
];

const imageGenSuggestions = [
  {
    title: "Create a triathlon hero image",
    description: "Dynamic poster with clean copy space and premium athletic photography.",
    enhancedPrompt: "Create a new dynamic image for a triathlon poster with clean copy space, premium athletic photography, and a Stride-style endurance brand feel."
  },
  {
    title: "Generate a spring race social visual",
    description: "Premium paid social image for Stride's spring race season.",
    enhancedPrompt: "Generate a premium paid social image for Stride's spring race season with an athlete in motion, bright natural light, and room for campaign headlines."
  },
  {
    title: "Make an event poster concept",
    description: "Bold event poster with dramatic hero athlete and brand-safe colors.",
    enhancedPrompt: "Create a bold event poster concept for a Stride endurance launch with a dramatic hero athlete, brand-safe colors, and a clean title area."
  },
];

const ISLAND_GRADIENT = "linear-gradient(135deg, #f5f3ff 0%, #e5efff 60%, #ddd6fe 100%)";

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
          color: '#4f576e',
        }}
      >
        Suggestions:
      </Text>
      <Box display="flex" flexDirection="column" gap="8" w="full">
        {suggestions.map((item, index) => (
          <Box
            key={index}
            onClick={() => onSuggestionClick(item.enhancedPrompt)}
            style={{
              cursor: 'pointer',
              background: ISLAND_GRADIENT,
              border: '1px solid #ddd6fe',
              borderRadius: '8px',
              padding: '8px 16px',
              width: '100%',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#a78bfa';
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(124,58,237,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#ddd6fe';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <p style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '24px',
              letterSpacing: '-0.154px',
              color: '#262b37',
              fontFamily: 'Inter, sans-serif',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {item.title}
            </p>
            <p style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '22.4px',
              letterSpacing: '-0.21px',
              color: '#262b37',
              fontFamily: 'Inter, sans-serif',
            }}>
              {item.description}
            </p>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
