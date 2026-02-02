"use client";

import { useRef, useState, useLayoutEffect, useCallback } from "react";
import { Box, Badge, Popover, PopoverTrigger, PopoverContent, Text } from "@optiaxiom/react";
import { useGlobalTags } from "@/app/cms/hooks/useGlobalTags";

const TAGS_COLUMN_MAX_WIDTH = 180;
/** Reserve space for the "+N" rollup badge so we don't overflow */
const ROLLUP_BADGE_RESERVE_PX = 44;

type TagsColumnCellProps = {
  tags: string[];
};

function getDisplayName(slug: string, slugToName: Map<string, string>): string {
  return slugToName.get(slug) ?? slug.replace(/-/g, " ");
}

export default function TagsColumnCell({ tags }: TagsColumnCellProps) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(() => Math.min(2, tags.length));
  const [popoverOpen, setPopoverOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { tags: allTags } = useGlobalTags();
  const slugToName = new Map(allTags.map((t) => [t.slug, t.name]));

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el || tags.length === 0) {
      setVisibleCount(0);
      return;
    }
    const maxWidth = TAGS_COLUMN_MAX_WIDTH - ROLLUP_BADGE_RESERVE_PX;
    const check = () => {
      const children = el.children;
      if (children.length === 0) {
        setVisibleCount(tags.length);
        return;
      }
      let count = 0;
      for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        if (child.offsetLeft + child.offsetWidth <= maxWidth) {
          count = i + 1;
        } else {
          break;
        }
      }
      setVisibleCount(count);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tags, allTags]);

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => setPopoverOpen(false), 150);
  }, [clearCloseTimeout]);

  if (tags.length === 0) {
    return (
      <Text fontSize="sm" color="fg.tertiary">
        —
      </Text>
    );
  }

  const hiddenCount = tags.length - visibleCount;
  const showRollup = hiddenCount > 0;
  const visibleTags = tags.slice(0, visibleCount);

  const displayContent = (
    <Box
      display="flex"
      flexWrap="nowrap"
      gap="6"
      alignItems="center"
      style={{
        maxWidth: TAGS_COLUMN_MAX_WIDTH,
        minHeight: 24,
      }}
    >
      {visibleTags.map((slug) => (
        <Badge key={slug} intent="neutral" style={{ flexShrink: 0 }}>
          {getDisplayName(slug, slugToName)}
        </Badge>
      ))}
      {showRollup && (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Box
              display="inline-flex"
              style={{ flexShrink: 0, cursor: "pointer" }}
              onMouseEnter={() => {
                clearCloseTimeout();
                setPopoverOpen(true);
              }}
              onMouseLeave={scheduleClose}
            >
              <Badge intent="neutral">+{hiddenCount}</Badge>
            </Box>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            sideOffset={4}
            align="start"
            style={{ width: "220px", maxHeight: "280px" }}
            onMouseEnter={clearCloseTimeout}
            onMouseLeave={scheduleClose}
          >
            <Box
              display="flex"
              flexDirection="column"
              py="2"
              px="2"
              style={{ maxHeight: "260px", overflow: "auto" }}
            >
              <Text fontSize="xs" color="fg.secondary" mb="2" style={{ paddingLeft: "4px" }}>
                All tags
              </Text>
              {tags.map((slug) => (
                <Text
                  key={slug}
                  fontSize="sm"
                  color="fg.default"
                  style={{
                    padding: "6px 8px",
                    borderRadius: "4px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {getDisplayName(slug, slugToName)}
                </Text>
              ))}
            </Box>
          </PopoverContent>
        </Popover>
      )}
    </Box>
  );

  return (
    <>
      {/* Hidden measurement container: same badges as display, used only to compute how many fit */}
      <Box
        ref={measureRef}
        aria-hidden
        display="flex"
        flexWrap="nowrap"
        gap="6"
        alignItems="center"
        style={{
          position: "absolute",
          left: -9999,
          width: TAGS_COLUMN_MAX_WIDTH,
          overflow: "hidden",
          visibility: "hidden",
          pointerEvents: "none",
        }}
      >
        {tags.map((slug) => (
          <Badge key={slug} intent="neutral" style={{ flexShrink: 0 }}>
            {getDisplayName(slug, slugToName)}
          </Badge>
        ))}
      </Box>
      {displayContent}
    </>
  );
}
