"use client";

import React from "react";
import { Box, Text, Heading } from "@optiaxiom/react";
import { DISPLAY_TEMPLATES } from "./blocks/displayTemplates";
import { getTemplatesByContentType, getTemplatesByBaseType, getTemplateByKey } from "./blocks/displayTemplateUtils";

type Props = {
  currentEle: string;
  elementType?: string;
  properties?: any;
  onBack: () => void;
  onStyleChange: (templateKey: string) => void;
  onSettingChange?: (settingKey: string, value: string) => void;
  outlineTitle?: string;
  isSectionMode?: boolean;
  sectionType?: string;
};

export default function StyleEditor({
  currentEle,
  elementType,
  properties,
  onBack,
  onStyleChange,
  onSettingChange,
  outlineTitle,
  isSectionMode = false,
  sectionType,
}: Props) {
  // Get available display templates for this element type or section
  const templates = isSectionMode
    ? getTemplatesByBaseType("section")
    : getTemplatesByContentType(elementType || "");

  // Get current template key
  const currentTemplate = properties?.displayTemplateKey ||
    (templates.find(t => t.isDefault)?.key) ||
    "defaultHeading";

  // Get current template definition
  const currentTemplateObj = getTemplateByKey(currentTemplate);

  // Get current display settings
  const displaySettings = properties?.displaySettings || [];

  console.log("[StyleEditor] Debug:", {
    isSectionMode,
    sectionType,
    elementType,
    currentTemplate,
    currentTemplateObj,
    displaySettings,
    hasOnSettingChange: !!onSettingChange,
    settingsCount: currentTemplateObj ? Object.keys(currentTemplateObj.settings).length : 0,
    willRenderSettings: !!(currentTemplateObj && Object.keys(currentTemplateObj.settings).length > 0 && onSettingChange),
  });

  // Log each setting being rendered
  if (currentTemplateObj && Object.keys(currentTemplateObj.settings).length > 0) {
    console.log("[StyleEditor] Settings object:", currentTemplateObj.settings);
    Object.entries(currentTemplateObj.settings).forEach(([key, setting]) => {
      const currentValue = displaySettings.find((s: any) => s.key === key)?.value ||
                          currentTemplateObj.defaultSettings[key] || "";
      console.log("[StyleEditor] Rendering setting:", {
        key,
        displayName: setting.displayName,
        editor: setting.editor,
        currentValue,
        hasChoices: !!(setting as any).choices,
      });
    });
  }

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
              key={template.key}
              value={template.key}
              style={{
                padding: "8px 12px"
              }}
            >
              {template.displayName}
            </option>
          ))}
        </select>

        {/* Show description of selected template */}
        {templates.find((t) => t.key === currentTemplate)?.description && (
          <Text fontSize="sm" color="fg.secondary" mt="8">
            {templates.find((t) => t.key === currentTemplate)?.description}
          </Text>
        )}
      </div>

      {/* Template Settings */}
      {currentTemplateObj && Object.keys(currentTemplateObj.settings).length > 0 && onSettingChange && (
        <Box mt="16" pt="16" borderT="1" borderColor="border.tertiary">
          <Text fontSize="sm" fontWeight="600" mb="12">Settings</Text>
          {Object.entries(currentTemplateObj.settings)
            .sort(([, a], [, b]) => a.sortOrder - b.sortOrder)
            .map(([settingKey, setting]) => {
              const currentValue = displaySettings.find((s: any) => s.key === settingKey)?.value ||
                                   currentTemplateObj.defaultSettings[settingKey] || "";

              return (
                <div key={settingKey} className="pr-1 py-2">
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
                    {setting.displayName}
                  </label>

                  {setting.editor === "select" && setting.choices && (
                    <>
                      {console.log("[StyleEditor] Rendering select for:", settingKey, "currentValue:", currentValue)}
                      <select
                        value={currentValue}
                        onChange={(e) => {
                          console.log("[StyleEditor] Setting onChange fired:", settingKey, "->", e.target.value);
                          if (onSettingChange) {
                            console.log("[StyleEditor] Calling onSettingChange");
                            onSettingChange(settingKey, e.target.value);
                          } else {
                            console.error("[StyleEditor] onSettingChange is not defined!");
                          }
                        }}
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
                      {Object.entries(setting.choices)
                        .sort(([, a], [, b]) => a.sortOrder - b.sortOrder)
                        .map(([choiceKey, choice]) => (
                          <option key={choiceKey} value={choiceKey}>
                            {choice.displayName}
                          </option>
                        ))}
                    </select>
                    </>
                  )}

                  {setting.editor === "checkbox" && (
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={currentValue === "true"}
                        onChange={(e) => onSettingChange(settingKey, e.target.checked ? "true" : "false")}
                        style={{ cursor: "pointer" }}
                      />
                      <Text fontSize="sm" color="fg.secondary">
                        {setting.displayName}
                      </Text>
                    </label>
                  )}
                </div>
              );
            })}
        </Box>
      )}

      {/* Template Details */}
      <Box mt="16" pt="16" borderT="1" borderColor="border.tertiary">
        <Text fontSize="sm" fontWeight="600" mb="8">Template Details</Text>
        {templates.map((template) => (
          <Box
            key={template.key}
            py="8"
            px="12"
            mb="8"
            rounded="md"
            bg={currentTemplate === template.key ? "bg.accent.subtle" : "transparent"}
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => onStyleChange(template.key)}
          >
            <Text fontWeight="600" fontSize="sm" mb="4">{template.displayName}</Text>
            <Text fontSize="xs" color="fg.secondary">{template.description || "No description"}</Text>
          </Box>
        ))}
      </Box>
    </div>
  );
}
