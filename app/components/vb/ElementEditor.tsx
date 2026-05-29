"use client";

import React, { Fragment, useEffect, useRef, useState, useMemo } from "react";
import { Box, Text, Heading, Menu, MenuTrigger, MenuContent, Separator } from "@optiaxiom/react";
import { IconPalette } from "@tabler/icons-react";
import { initialContentTypes, Property, ContentType } from "@/app/db/initialData";
import { groupPropertiesByGroup } from "./utils/propertyGroups";
import { PropertyRenderer } from "@/app/components/property-renderers";
import usePersistentState from "@/app/usePersistentState";

// Import to register all property renderers
import "@/app/components/property-renderers";

type Props = {
  currentEle: string;
  elementType: string;
  properties?: any;
  onBack: () => void;
  onInputChange: (value: any, keyOrIndex: string | number) => void;
  outlineTitle?: string;
  onOpenStyleEditor?: () => void;
};

export default function ElementEditor({
  currentEle,
  elementType,
  properties,
  onBack,
  onInputChange,
  outlineTitle,
  onOpenStyleEditor,
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Load runtime content types from localStorage (includes user-created properties)
  const [runtimeContentTypes] = usePersistentState("contentTypes", initialContentTypes) as [
    ContentType[],
    any,
  ];

  // Get content type definition and group properties
  const contentType = useMemo(() => {
    return runtimeContentTypes?.find((ct) => ct.id === elementType) || initialContentTypes.find((ct) => ct.id === elementType);
  }, [elementType, runtimeContentTypes]);

  const propertyGroups = useMemo(() => {
    if (!contentType) return {};
    return groupPropertiesByGroup(contentType.properties, true);
  }, [contentType]);

  useEffect(() => {
    // Don't focus when "closed"
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

      // Optional: select text if it's a real input/textarea
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
        <Heading level="4">{contentType?.displayName || contentType?.name || elementType}</Heading>

        <Box display="flex" alignItems="center" gap="8">
          {onOpenStyleEditor && (
            <Menu
              onOpenChange={() => setMenuOpen(!menuOpen)}
              open={menuOpen}
              options={[
                {
                  addon: <IconPalette size={16} />,
                  label: "Style",
                  execute: () => {
                    onOpenStyleEditor();
                    setMenuOpen(false);
                  },
                },
              ]}
            >
              <MenuTrigger
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(true);
                }}
                icon={
                  <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 14.5C11.3125 14.5 13.4375 13.2812 14.625 11.25C15.7812 9.25 15.7812 6.78125 14.625 4.75C13.4375 2.75 11.3125 1.5 9 1.5C6.65625 1.5 4.53125 2.75 3.34375 4.75C2.1875 6.78125 2.1875 9.25 3.34375 11.25C4.53125 13.2812 6.65625 14.5 9 14.5ZM9 0C11.8438 0 14.4688 1.53125 15.9062 4C17.3438 6.5 17.3438 9.53125 15.9062 12C14.4688 14.5 11.8438 16 9 16C6.125 16 3.5 14.5 2.0625 12C0.625 9.53125 0.625 6.5 2.0625 4C3.5 1.53125 6.125 0 9 0ZM10 8C10 8.5625 9.53125 9 9 9C8.4375 9 8 8.5625 8 8C8 7.46875 8.4375 7 9 7C9.53125 7 10 7.46875 10 8ZM12 7C12.5312 7 13 7.46875 13 8C13 8.5625 12.5312 9 12 9C11.4375 9 11 8.5625 11 8C11 7.46875 11.4375 7 12 7ZM7 8C7 8.5625 6.53125 9 6 9C5.4375 9 5 8.5625 5 8C5 7.46875 5.4375 7 6 7C6.53125 7 7 7.46875 7 8Z" fill="currentColor" />
                  </svg>
                }
                aria-label="Element options"
                appearance="subtle"
                size="sm"
                iconPosition="start"
              />
              <MenuContent />
            </Menu>
          )}
        </Box>
      </Box>

      {/* Render properties grouped by groupName */}
      <Box mt="16">
        {(() => {
          // Calculate groups with visible properties
          const groupsWithVisibleProps = Object.entries(propertyGroups).filter(([_, groupProps]) => {
            const visibleProps = groupProps.filter((prop) => {
              return !(prop.id === "template" || prop.type === "SelectOne");
            });
            return visibleProps.length > 0;
          });

          // Only show headers if there are 2 or more groups with visible properties
          const shouldShowHeaders = groupsWithVisibleProps.length > 1;

          // Render properties grouped by groupName
          return Object.entries(propertyGroups).map(([groupName, groupProps]) => {
          // Filter out properties that should be hidden
          const visibleProps = groupProps.filter((prop) => {
            // Skip template property - it's accessed via context menu "Style" option
            return !(prop.id === "template" || prop.type === "SelectOne");
          });

          // Don't render the group at all if no visible properties
          if (visibleProps.length === 0) return null;

          return (
            <Fragment key={groupName}>
              {shouldShowHeaders && (
                <Box mb="12" mt="16">
                  <Heading level="4" fontSize="xs" color="fg.tertiary" mb="8" textTransform="uppercase">
                    {groupName}
                  </Heading>
                  <Separator />
                </Box>
              )}

              {visibleProps.map((prop) => {
                const propData = properties ? properties[prop.id] : null;
                const value = propData != null ? propData : (prop.defaultValue ?? "");

                return (
                  <PropertyRenderer
                    key={prop.id}
                    property={prop}
                    value={value}
                    onChange={(newVal: any) => onInputChange(newVal, prop.id)}
                    enableAI={true}
                    context={{ runtimeContentTypes }}
                  />
                );
              })}
            </Fragment>
          );
        });
      })()}
      </Box>
    </div>
  );
}
