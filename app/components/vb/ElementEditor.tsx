"use client";

import React, { Fragment, useEffect, useRef } from "react";
import { Box, Field, Text, Input as AxiomInput, Checkbox, Heading, Textarea } from "@optiaxiom/react";
import { BLOCK_SCHEMAS } from "./blocks/schemas";
import { AIInputField } from "@/app/components/ai/AIInputField";
import { AITextArea } from "@/app/components/ai/AITextArea";
import { FieldWithAIActions } from "./FieldWithAIActions";
import { usePropertyEditorActions } from "@/app/hooks/usePropertyEditorActions";
import { PropertyType } from "@/app/cms/settings/opal-actions/mockData";

type Props = {
  currentEle: string;
  elementType: string;
  properties?: any;
  onBack: () => void;
  onInputChange: (value: any, keyOrIndex: string | number) => void;
  outlineTitle?: string;
};

const Input: React.FC<{ label: string; placeholder?: string; value: any; onChange: any; propertyType?: PropertyType }> = ({
  label,
  placeholder,
  value,
  onChange,
  propertyType = "String",
}) => {
  const aiActions = usePropertyEditorActions(propertyType, value || "", (suggestion: string) => {
    onChange(suggestion);
  });

  return (
    <div className=" pr-1 py-2">
      <FieldWithAIActions label={label} aiActions={aiActions}>
        <AIInputField
          placeholder={placeholder || ""}
          value={value || ""}
          onChange={(e: any) => onChange(e.currentTarget.value)}
          enableAutoComplete={true}
        />
      </FieldWithAIActions>
    </div>
  );
};

const renderMarkdown = (val: string) => {
  const escaped = (val || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/\n/g, "<br/>");
};

const isTipTapDoc = (val: any) => val && typeof val === "object" && val.type === "doc";

const tiptapToMarkdown = (val: any): string => {
  if (!isTipTapDoc(val)) return typeof val === "string" ? val : "";
  const paragraphs = (val.content || []).map((p: any) => {
    if (!p || p.type !== "paragraph") return "";
    return (p.content || []).map((node: any) => {
      if (!node || node.type !== "text") return "";
      let text = node.text || "";
      const marks = node.marks || [];
      marks.forEach((m: any) => {
        if (!m || !m.type) return;
        if (m.type === "bold" || m.type === "strong") text = `**${text}**`;
        if (m.type === "italic" || m.type === "em") text = `*${text}*`;
        if (m.type === "link" && m.attrs?.href) text = `[${text}](${m.attrs.href})`;
      });
      return text;
    }).join("");
  }).join("\n");
  return paragraphs;
};

const markdownToTipTap = (text: string) => {
  const lines = (text || "").split(/\n/);
  const paragraphFromLine = (line: string) => {
    const tokens = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^\)]+\))/g).filter(Boolean);
    const content = tokens.map((tok) => {
      // link
      const linkMatch = tok.match(/^\[(.+)\]\((.+)\)$/);
      if (linkMatch) {
        return {
          type: "text",
          text: linkMatch[1],
          marks: [{ type: "link", attrs: { href: linkMatch[2] } }],
        };
      }
      // bold
      const boldMatch = tok.match(/^\*\*(.+)\*\*$/);
      if (boldMatch) {
        return { type: "text", text: boldMatch[1], marks: [{ type: "bold" }] };
      }
      // italic
      const italicMatch = tok.match(/^\*(.+)\*$/);
      if (italicMatch) {
        return { type: "text", text: italicMatch[1], marks: [{ type: "italic" }] };
      }
      // plain
      return { type: "text", text: tok };
    });
    return { type: "paragraph", content };
  };

  return {
    type: "doc",
    content: lines.map(paragraphFromLine),
  };
};

const RichTextInput: React.FC<{ label: string; value: any; onChange: any; propertyType?: PropertyType }> = ({ label, value, onChange, propertyType = "XhtmlString" }) => {
  const markdownValue = isTipTapDoc(value) ? tiptapToMarkdown(value) : (value || "");
  const aiActions = usePropertyEditorActions(propertyType, markdownValue, (suggestion: string) => {
    onChange(markdownToTipTap(suggestion));
  });

  return (
    <div className="pr-1 py-2">
      <FieldWithAIActions label={label} aiActions={aiActions}>
        <AITextArea
          value={markdownValue}
          onChange={(e: any) => onChange(markdownToTipTap(e.currentTarget.value))}
          rows={4}
          enableAutoComplete={true}
        />
      </FieldWithAIActions>
    </div>
  );
};

export default function ElementEditor({
  currentEle,
  elementType,
  properties,
  onBack,
  onInputChange,
  outlineTitle,
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Don’t focus when “closed”
    if (!currentEle || currentEle === "none") return;

    // Match your slide duration (you use `duration-300`)
    const SLIDE_MS = 300;

    const t = window.setTimeout(() => {
      const root = rootRef.current;
      if (!root) return;

      const selector = [
        'input:not([type="hidden"]):not([disabled])',
        "textarea:not([disabled])",
        "select:not([disabled])",
        '[tabindex]:not([tabindex="-1"])',
      ].join(",");

      const el = root.querySelector(selector) as any;
      if (!el) return;

      // Prevent scroll-jank during/after transform animations
      try {
        el.focus?.({ preventScroll: true });
      } catch {
        el.focus?.();
      }

      // Optional: select text if it’s a real input/textarea
      /*if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        try {
          el.select?.();
        } catch { }
      }*/
    }, SLIDE_MS);

    return () => window.clearTimeout(t);
  }, [currentEle]);

  return (
    <div ref={rootRef} className="pl-6 pr-6 flex-none w-full pt-4">
      <Text fontSize="sm" fontWeight="400" color="fg.accent" onClick={onBack} className="cursor-pointer">
        {"<-"} {outlineTitle || "Outline"}
      </Text>

      <Box display="flex" alignItems="center" justifyContent="space-between" gap="8" pr="0" py="4">
        <Heading level="4">{elementType}</Heading>

        <Box display="flex" alignItems="center" gap="8">
          <Box color="fg.default">
            <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 14.5C11.3125 14.5 13.4375 13.2812 14.625 11.25C15.7812 9.25 15.7812 6.78125 14.625 4.75C13.4375 2.75 11.3125 1.5 9 1.5C6.65625 1.5 4.53125 2.75 3.34375 4.75C2.1875 6.78125 2.1875 9.25 3.34375 11.25C4.53125 13.2812 6.65625 14.5 9 14.5ZM9 0C11.8438 0 14.4688 1.53125 15.9062 4C17.3438 6.5 17.3438 9.53125 15.9062 12C14.4688 14.5 11.8438 16 9 16C6.125 16 3.5 14.5 2.0625 12C0.625 9.53125 0.625 6.5 2.0625 4C3.5 1.53125 6.125 0 9 0ZM10 8C10 8.5625 9.53125 9 9 9C8.4375 9 8 8.5625 8 8C8 7.46875 8.4375 7 9 7C9.53125 7 10 7.46875 10 8ZM12 7C12.5312 7 13 7.46875 13 8C13 8.5625 12.5312 9 12 9C11.4375 9 11 8.5625 11 8C11 7.46875 11.4375 7 12 7ZM7 8C7 8.5625 6.53125 9 6 9C5.4375 9 5 8.5625 5 8C5 7.46875 5.4375 7 6 7C6.53125 7 7 7.46875 7 8Z" fill="currentColor" />
            </svg>
          </Box>
        </Box>
      </Box>

      {/* Production-Aligned Schema-Driven Properties */}
      {(() => {
        const schema = BLOCK_SCHEMAS[elementType];
        if (!schema) return null;

        return Object.entries(schema.properties).map(([key, def]) => {
          const propData = properties ? properties[key] : null;
          const value = propData ? propData.value : (def.default ?? "");

          // Map schema type to PropertyType
          const getPropertyType = (schemaType: string): PropertyType => {
            switch (schemaType) {
              case "text":
                return "String";
              case "textarea":
                return "LongString";
              case "richtext":
                return "XhtmlString";
              case "link":
                return "Url";
              default:
                return "String";
            }
          };

          return (
            <Fragment key={key}>
              {(def.type === "text" || def.type === "textarea" || def.type === "link") && (
                <Input
                  label={def.label}
                  value={value}
                  onChange={(val: any) => onInputChange(val, key)}
                  propertyType={getPropertyType(def.type)}
                />
              )}
              {def.type === "richtext" && (
                <RichTextInput
                  label={def.label}
                  value={value}
                  onChange={(val: any) => onInputChange(val, key)}
                  propertyType="XhtmlString"
                />
              )}
              {def.type === "checkbox" && (
                <div className="p-6 pr-0 py-2">
                  <Checkbox
                    checked={value === true || value === "true"}
                    onChange={(e: any) => onInputChange(e.currentTarget.checked, key)}
                  >
                    {def.label}
                  </Checkbox>
                </div>
              )}
            </Fragment>
          );
        });
      })()}

      {/* Fallback for properties not in schema but present in data */}
      {properties &&
        Object.entries(properties).map(([key, prop]: [string, any]) => {
          const schema = BLOCK_SCHEMAS[elementType];
          if (schema && schema.properties[key]) return null;

          return (
            <Fragment key={key}>
              {(!prop.type || prop.type === "text") && (
                <Input
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  placeholder={prop.placeholder}
                  value={prop.value}
                  onChange={(val: any) => onInputChange(val, key)}
                />
              )}
              {prop.type === "richtext" && (
                <RichTextInput
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={prop.value}
                  onChange={(val: any) => onInputChange(val, key)}
                />
              )}
              {prop.type === "checkbox" && (
                <div className="p-6 pr-0 py-2">
                  <Checkbox
                    checked={prop.value === "true" ? true : false}
                    onChange={(e: any) => onInputChange(e.currentTarget.checked ? "true" : "false", key)}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Checkbox>
                </div>
              )}
            </Fragment>
          );
        })}
    </div>
  );
}
