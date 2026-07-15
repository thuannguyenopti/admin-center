"use client";

import { useState } from "react";
import { Box, Text, Badge, Button } from "@optiaxiom/react";
import { IconSearch, IconArrowUpRightFromSquare, IconShareNodes, IconDownload, IconEllipsisSolid } from "@optiaxiom/icons";
import { ARTIFACTS, ARTIFACT_TYPES, STATUS_LABEL, type Artifact } from "../data";

const STATUS_COLOR: Record<Artifact["status"], string> = {
  draft:     "var(--ax-colors-fg-tertiary)",
  review:    "#f59e0b",
  approved:  "var(--ax-colors-fg-success-strong)",
  published: "var(--ax-colors-fg-information-strong)",
};

const STATUS_BG: Record<Artifact["status"], string> = {
  draft:     "var(--ax-colors-bg-tertiary)",
  review:    "#fef3c7",
  approved:  "var(--ax-colors-bg-success-subtle)",
  published: "var(--ax-colors-bg-information-subtle)",
};

export function ArtifactsView() {
  const [selectedType, setSelectedType] = useState("All");
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const filtered = ARTIFACTS.filter((a) => {
    const matchType = selectedType === "All" || a.type === selectedType;
    const matchQuery =
      !query ||
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.author.toLowerCase().includes(query.toLowerCase());
    return matchType && matchQuery;
  });

  const needsReview = ARTIFACTS.filter((a) => a.status === "review").length;

  return (
    <Box
      display="flex"
      flexDirection="column"
      style={{ height: "100%", background: "var(--ax-colors-bg-default)" }}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px="16"
        style={{ height: 56, flexShrink: 0, borderBottom: "1px solid var(--ax-colors-border-secondary)" }}
      >
        <Box display="flex" alignItems="center" gap="8">
          <Text fontWeight="700" color="fg.default" style={{ fontSize: 20 }}>
            Artifacts
          </Text>
          {needsReview > 0 && (
            <Badge intent="warning">{needsReview} to review</Badge>
          )}
        </Box>
        <Button
          appearance="subtle"
          size="sm"
          icon={<IconSearch style={{ width: 18, height: 18 }} />}
          aria-label="Search artifacts"
          style={{ width: 40, height: 40, padding: 0 }}
        />
      </Box>

      {/* ── Search ──────────────────────────────────────────────────── */}
      <Box px="12" pt="10" pb="6" style={{ flexShrink: 0 }}>
        <Box
          display="flex"
          alignItems="center"
          gap="8"
          style={{
            background: "var(--ax-colors-bg-secondary)",
            borderRadius: 12,
            padding: "8px 12px",
            boxShadow: searchFocused ? "0 0 0 2px var(--ax-colors-border-focus)" : "none",
            transition: "box-shadow 0.15s",
          }}
        >
          <IconSearch style={{ width: 15, height: 15, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search artifacts…"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: "inherit",
              fontSize: 15,
              color: "var(--ax-colors-fg-default)",
            }}
          />
          {query && (
            <Box onClick={() => setQuery("")} style={{ fontSize: 12, color: "var(--ax-colors-fg-tertiary)", cursor: "pointer", padding: "0 4px" }}>
              ✕
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Type filter chips ────────────────────────────────────────── */}
      <Box
        style={{
          flexShrink: 0,
          overflowX: "auto",
          paddingBottom: 10,
          paddingLeft: 12,
          paddingRight: 12,
          display: "flex",
          gap: 8,
          scrollbarWidth: "none",
        }}
      >
        {ARTIFACT_TYPES.map((type) => {
          const isActive = selectedType === type;
          return (
            <Box
              key={type}
              onClick={() => setSelectedType(type)}
              style={{
                flexShrink: 0,
                padding: "5px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                background: isActive
                  ? "var(--ax-colors-fg-accent-strong)"
                  : "var(--ax-colors-bg-secondary)",
                color: isActive
                  ? "white"
                  : "var(--ax-colors-fg-secondary)",
                border: isActive ? "none" : "1px solid var(--ax-colors-border-secondary)",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              {type}
            </Box>
          );
        })}
      </Box>

      {/* ── Artifact list ────────────────────────────────────────────── */}
      <Box style={{ flex: 1, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <Box display="flex" alignItems="center" justifyContent="center" pt="48">
            <Text color="fg.tertiary" fontSize="md">No artifacts found</Text>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap="2" px="12" pt="4" pb="24">
            {filtered.map((artifact, i) => (
              <ArtifactCard
                key={artifact.id}
                artifact={artifact}
                delay={i * 25}
                isExpanded={activeCard === artifact.id}
                onToggle={() => setActiveCard(activeCard === artifact.id ? null : artifact.id)}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

function ArtifactCard({
  artifact,
  delay,
  isExpanded,
  onToggle,
}: {
  artifact: Artifact;
  delay: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <Box
      className="mobile-bubble-stagger"
      style={{
        animationDelay: `${delay}ms`,
        borderRadius: 14,
        border: "1px solid var(--ax-colors-border-secondary)",
        background: "var(--ax-colors-bg-default)",
        overflow: "hidden",
        transition: "box-shadow 0.18s ease",
        boxShadow: isExpanded ? "0 4px 20px rgba(0,0,0,0.08)" : "none",
      }}
    >
      {/* Card row */}
      <Box
        display="flex"
        alignItems="center"
        gap="12"
        p="12"
        onClick={onToggle}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        style={{
          cursor: "pointer",
          transform: pressed ? "scale(0.99)" : "scale(1)",
          transition: "transform 0.1s ease",
        }}
      >
        {/* Thumbnail or type icon */}
        <Box
          style={{
            width: 52,
            height: 52,
            borderRadius: 10,
            overflow: "hidden",
            flexShrink: 0,
            background: "var(--ax-colors-bg-secondary)",
          }}
        >
          {artifact.thumbnail ? (
            <img
              src={artifact.thumbnail}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <Box
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              📄
            </Box>
          )}
        </Box>

        {/* Content */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text
            fontWeight="500"
            color="fg.default"
            style={{
              fontSize: 14,
              lineHeight: 1.35,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              marginBottom: 6,
            }}
          >
            {artifact.title}
          </Text>
          <Box display="flex" alignItems="center" gap="6" style={{ flexWrap: "wrap" }}>
            {/* Status chip */}
            <Box
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: STATUS_COLOR[artifact.status],
                background: STATUS_BG[artifact.status],
                borderRadius: 6,
                padding: "2px 7px",
                whiteSpace: "nowrap",
              }}
            >
              {STATUS_LABEL[artifact.status]}
            </Box>
            {/* Author dot */}
            <Box style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {artifact.isVAU && artifact.authorColor ? (
                <Box
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: artifact.authorColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 8,
                    color: "white",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {artifact.author[0]}
                </Box>
              ) : null}
              <Text fontSize="sm" color="fg.tertiary" style={{ fontSize: 12 }}>
                {artifact.author} · {artifact.updatedAt}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Chevron */}
        <Box
          style={{
            color: "var(--ax-colors-fg-tertiary)",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          ›
        </Box>
      </Box>

      {/* Expanded actions */}
      {isExpanded && (
        <Box
          style={{
            borderTop: "1px solid var(--ax-colors-border-secondary)",
            padding: "12px 14px",
            display: "flex",
            gap: 8,
            background: "var(--ax-colors-bg-secondary)",
          }}
        >
          {artifact.status === "review" ? (
            <Button
              appearance="primary"
              size="sm"
              icon={<IconArrowUpRightFromSquare />}
              style={{ flex: 1, borderRadius: 10, fontSize: 13 }}
            >
              Open to review
            </Button>
          ) : (
            <Button
              appearance="default"
              size="sm"
              icon={<IconArrowUpRightFromSquare />}
              style={{ flex: 1, borderRadius: 10, fontSize: 13 }}
            >
              Open
            </Button>
          )}
          <Button
            appearance="default"
            size="sm"
            icon={<IconShareNodes />}
            aria-label="Share"
            style={{ width: 40, height: 36, padding: 0, borderRadius: 10, flexShrink: 0 }}
          />
          <Button
            appearance="default"
            size="sm"
            icon={<IconDownload />}
            aria-label="Download"
            style={{ width: 40, height: 36, padding: 0, borderRadius: 10, flexShrink: 0 }}
          />
          <Button
            appearance="default"
            size="sm"
            icon={<IconEllipsisSolid />}
            aria-label="More"
            style={{ width: 40, height: 36, padding: 0, borderRadius: 10, flexShrink: 0 }}
          />
        </Box>
      )}
    </Box>
  );
}
