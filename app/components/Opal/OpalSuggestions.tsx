"use client";

import { Box, Badge } from "@optiaxiom/react";
import { Text } from "../Text";
import { opalTypography } from "@/app/styles/opalTypography";

import { useOpalContext } from "@/app/context/OpalContext";

type OpalSuggestionsProps = {
  onSuggestionClick: (suggestion: string) => void;
  type?: 'default' | 'cms' | 'cms-edit' | 'cms-content' | 'connect' | 'agent-setup';
};

const agentSetupSuggestions = [
  {
    title: "Write a clear prompt template",
    enhancedPrompt: "I'm setting up a new agent. Can you help me write a comprehensive prompt template that clearly defines its role, tone, and constraints for maximum reliability?"
  },
  {
    title: "Configure agent variables",
    enhancedPrompt: "I want to make my agent dynamic using variables. What are the best practices for defining variables and how can I reference them effectively in my prompt template?"
  },
  {
    title: "Suggest tools for this agent",
    enhancedPrompt: "Based on the purpose of this agent, which Optimizely tools (CMS, Experimentation, or External APIs) should I connect to give it the most relevant capabilities?"
  },
  {
    title: "Test agent response quality",
    enhancedPrompt: "I've drafted a prompt for my agent. Can you help me design a set of test cases to verify its performance across different user scenarios?"
  },
];

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

const cmsEditSuggestions = [
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
    title: "Rewrite this in a more professional tone",
    enhancedPrompt: "Please review the text content of this page and suggest a rewrite that maintains the core message but uses a more professional and authoritative tone."
  },
];

const cmsContentSuggestions = [
  {
    title: "Find underperforming pages",
    enhancedPrompt: "Check my CMS content list and identify pages that have high bounce rates or low engagement based on available performance data."
  },
  {
    title: "Suggest new content ideas",
    enhancedPrompt: "Based on my existing content library, what are some trending topics or gaps in my content strategy that I should address next?"
  },
  {
    title: "Audit content for accessibility",
    enhancedPrompt: "I want to run a quick accessibility audit across my recent content. What are the top things I should check for to ensure compliance?"
  },
];

const connectSuggestions = [
  {
    title: "Check data integration health",
    enhancedPrompt: "How are my current data integrations performing in the Connect Platform? Are there any errors or sync delays I should be aware of?"
  },
  {
    title: "Optimize audience sync",
    enhancedPrompt: "What's the best way to optimize my audience synchronization between CMS and the Connect Platform to ensure real-time personalization?"
  },
];

export function OpalSuggestions({ onSuggestionClick, type }: OpalSuggestionsProps) {
  const opalContext = useOpalContext();
  const path = opalContext?.currentPage?.path || "";

  // Determine suggestions based on path if type isn't explicitly provided
  const getSuggestions = () => {
    if (type) {
      if (type === 'cms-edit') return cmsEditSuggestions;
      if (type === 'cms-content') return cmsContentSuggestions;
      if (type === 'connect') return connectSuggestions;
      if (type === 'cms') return cmsEditSuggestions;
      if (type === 'agent-setup') return agentSetupSuggestions;
      return defaultSuggestions;
    }

    if (path.includes('opal/agents/setup')) return agentSetupSuggestions;
    if (path.startsWith('/cms/edit')) return cmsEditSuggestions;
    if (path.startsWith('/cms/content')) return cmsContentSuggestions;
    if (path.startsWith('/connect')) return connectSuggestions;
    if (path.startsWith('/cms')) return cmsEditSuggestions; // Fallback for general CMS

    return defaultSuggestions;
  };

  const suggestions = getSuggestions();

  return (
    <Box display="flex" flexDirection="column" gap="8" w="full">
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