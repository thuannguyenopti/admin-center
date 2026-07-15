"use client";

import { useState } from "react";
import { Box, Text, Avatar, Button } from "@optiaxiom/react";
import { IconSearch } from "@optiaxiom/icons";
import { DMS, GROUPS, THREADS } from "../data";

type Props = {
  onClose: () => void;
  onSelect: (id: string) => void;
};

export function GlobalSearchPane({ onClose, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const q = query.toLowerCase();

  const peopleResults = q.length >= 1
    ? DMS.filter((d) => d.name.toLowerCase().includes(q))
    : [];

  const spaceResults = q.length >= 1
    ? GROUPS.filter((g) => g.name.toLowerCase().includes(q))
    : [];

  const messageResults = q.length >= 2
    ? Object.entries(THREADS).flatMap(([convId, msgs]) =>
        msgs
          .filter((m) => m.text.toLowerCase().includes(q))
          .slice(0, 2)
          .map((m) => {
            const dm = DMS.find((d) => d.id === convId);
            const group = GROUPS.find((g) => g.id === convId);
            return { convId, text: m.text, convName: dm?.name ?? group?.name ?? convId };
          }),
      ).slice(0, 6)
    : [];

  const hasResults = peopleResults.length + spaceResults.length + messageResults.length > 0;

  return (
    <Box
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        background: "var(--ax-colors-bg-default)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Search bar */}
      <Box
        display="flex"
        alignItems="center"
        gap="8"
        px="12"
        style={{
          height: 56,
          flexShrink: 0,
          borderBottom: "1px solid var(--ax-colors-border-secondary)",
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          gap="8"
          style={{
            flex: 1,
            background: "var(--ax-colors-bg-secondary)",
            borderRadius: 10,
            padding: "8px 12px",
            boxShadow: focused ? "0 0 0 2px var(--ax-colors-border-focus)" : "none",
            transition: "box-shadow 0.15s",
          }}
        >
          <IconSearch style={{ width: 15, height: 15, color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search messages, people, spaces…"
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
        </Box>
        <Button appearance="subtle" size="sm" onClick={onClose} style={{ flexShrink: 0 }}>
          Cancel
        </Button>
      </Box>

      {/* Results */}
      <Box style={{ flex: 1, overflowY: "auto" }}>
        {!query && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            style={{ paddingTop: 80, gap: 10 }}
          >
            <IconSearch style={{ width: 36, height: 36, color: "var(--ax-colors-fg-tertiary)", opacity: 0.5 }} />
            <Text color="fg.tertiary" style={{ fontSize: 15 }}>Search everything</Text>
          </Box>
        )}

        {query && !hasResults && (
          <Box display="flex" alignItems="center" justifyContent="center" style={{ paddingTop: 80 }}>
            <Text color="fg.tertiary" style={{ fontSize: 15 }}>No results for "{query}"</Text>
          </Box>
        )}

        {peopleResults.length > 0 && (
          <Section label="People">
            {peopleResults.map((dm) => (
              <ResultRow key={dm.id} onClick={() => onSelect(dm.id)}>
                <Avatar name={dm.name} style={{ width: 34, height: 34, flexShrink: 0 }} />
                <Box style={{ minWidth: 0 }}>
                  <Text fontWeight="500" color="fg.default" style={{ fontSize: 14 }}>{dm.name}</Text>
                  {dm.isVAU && (
                    <Text color="fg.tertiary" style={{ fontSize: 12 }}>Virtual Teammate</Text>
                  )}
                </Box>
              </ResultRow>
            ))}
          </Section>
        )}

        {spaceResults.length > 0 && (
          <Section label="Spaces">
            {spaceResults.map((g) => (
              <ResultRow key={g.id} onClick={() => onSelect(g.id)}>
                <Box
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: "var(--ax-colors-bg-secondary)",
                    border: "1px solid var(--ax-colors-border-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 18,
                  }}
                >
                  {g.emoji}
                </Box>
                <Box style={{ minWidth: 0 }}>
                  <Text fontWeight="500" color="fg.default" style={{ fontSize: 14 }}>{g.name}</Text>
                  <Text color="fg.tertiary" style={{ fontSize: 12 }}>{g.members}</Text>
                </Box>
              </ResultRow>
            ))}
          </Section>
        )}

        {messageResults.length > 0 && (
          <Section label="Messages">
            {messageResults.map(({ convId, text, convName }, i) => (
              <ResultRow key={i} onClick={() => onSelect(convId)}>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text color="fg.tertiary" style={{ fontSize: 12, marginBottom: 2 }}>{convName}</Text>
                  <Text
                    color="fg.default"
                    style={{
                      fontSize: 14,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {text}
                  </Text>
                </Box>
              </ResultRow>
            ))}
          </Section>
        )}
      </Box>
    </Box>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box style={{ paddingTop: 12, paddingBottom: 4 }}>
      <Text
        color="fg.tertiary"
        fontWeight="600"
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          paddingLeft: 16,
          paddingRight: 16,
          marginBottom: 4,
          display: "block",
        }}
      >
        {label}
      </Text>
      {children}
    </Box>
  );
}

function ResultRow({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      gap="12"
      px="16"
      py="10"
      onClick={onClick}
      style={{
        cursor: "pointer",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--ax-colors-bg-secondary)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
    >
      {children}
    </Box>
  );
}
