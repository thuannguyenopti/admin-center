"use client";

import React from "react";
import { Box, Text, Heading } from "@optiaxiom/react";
import { getAvailableTemplates } from "./blocks/templateUtils";

type Props = {
  currentEle: string;
  elementType: string;
  properties?: any;
  onBack: () => void;
  onStyleChange: (templateId: string) => void;
  outlineTitle?: string;
};

export default function StyleEditor({
  currentEle,
  elementType,
  properties,
  onBack,
  onStyleChange,
  outlineTitle,
}: Props) {
  // Get available templates for this element type
  const templates = getAvailableTemplates(elementType);

  // Get current template value
  const currentTemplate = properties?.template?.value || "default";

  if (templates.length === 0) {
    return (
      <div className="pl-6 pr-6 flex-none w-full pt-4">
        <Text fontSize="sm" fontWeight="400" color="fg.accent" onClick={onBack} className="cursor-pointer">
          {"<-"} {outlineTitle || "Outline"}
        </Text>
        <Box py="4">
          <Text color="fg.secondary">No styles available for this element type.</Text>
        </Box>
      </div>
    );
  }

  return (
    <div className="pl-6 pr-6 flex-none w-full pt-4">
      <Text fontSize="sm" fontWeight="400" color="fg.accent" onClick={onBack} className="cursor-pointer">
        {"<-"} {outlineTitle || "Outline"}
      </Text>

      <Box display="flex" alignItems="center" justifyContent="space-between" gap="8" pr="0" py="4">
        <Heading level="4">Style</Heading>
      </Box>

      <div className="pr-1 py-2">
        <label
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: "500",
            lineHeight: "1.25rem",
            color: "var(--ax-colors-fg-default)",
            marginBottom: "8px"
          }}
        >
          Template
        </label>
        <select
          value={currentTemplate}
          onChange={(e) => onStyleChange(e.target.value)}
          style={{
            width: "100%",
            height: "36px",
            padding: "8px 12px",
            fontSize: "0.875rem",
            lineHeight: "1.25rem",
            border: "1px solid var(--ax-colors-border-default)",
            borderRadius: "6px",
            backgroundColor: "var(--ax-colors-bg-default)",
            color: "var(--ax-colors-fg-default)",
            cursor: "pointer",
            outline: "none",
            fontFamily: "inherit"
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--ax-colors-border-accent)";
            e.target.style.boxShadow = "0 0 0 3px var(--ax-colors-bg-accent-subtle)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--ax-colors-border-default)";
            e.target.style.boxShadow = "none";
          }}
        >
          {templates.map((template) => (
            <option
              key={template.id}
              value={template.id}
              style={{
                padding: "8px 12px"
              }}
            >
              {template.label}
            </option>
          ))}
        </select>

        {/* Show description of selected template */}
        {templates.find((t) => t.id === currentTemplate)?.description && (
          <Text fontSize="sm" color="fg.secondary" mt="8">
            {templates.find((t) => t.id === currentTemplate)?.description}
          </Text>
        )}
      </div>

      {/* Preview of semantic tags */}
      <Box mt="16" pt="16" borderT="1" borderColor="border.tertiary">
        <Text fontSize="sm" fontWeight="600" mb="8">Template Details</Text>
        {templates.map((template) => (
          <Box
            key={template.id}
            py="8"
            px="12"
            mb="8"
            rounded="md"
            bg={currentTemplate === template.id ? "bg.accent.subtle" : "transparent"}
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => onStyleChange(template.id)}
          >
            <Text fontWeight="600" fontSize="sm" mb="4">{template.label}</Text>
            <Text fontSize="xs" color="fg.secondary">{template.description}</Text>
          </Box>
        ))}
      </Box>
    </div>
  );
}
