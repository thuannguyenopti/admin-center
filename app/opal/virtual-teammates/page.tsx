"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Box,
  Heading,
  Text,
  LabelMenuButton,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@optiaxiom/react";
import { Input } from "@/app/components/Input";
import {
  IconSearch,
  IconChevronDown,
  IconCircleCheck,
} from "@optiaxiom/icons";
import { VAUS } from "@/app/opal/data/vaus";
import { VAUCard } from "./VAUCard";

// ── Browse sidebar ─────────────────────────────────────────────────────────────

const BROWSE_ITEMS = [
  { label: "Virtual Teammates", count: VAUS.filter((v) => !v.isCandidate).length },
  { label: "Agents",            count: 48 },
  { label: "Connectors",        count: 28 },
  { label: "Skills",            count: 30 },
];

function NavRow({
  active,
  icon,
  children,
  addonAfter,
  onClick,
}: {
  active?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  addonAfter?: React.ReactNode;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const highlighted = active || hovered;
  return (
    <Box
      display="flex"
      alignItems="center"
      gap="12"
      style={{
        height: 40,
        borderRadius: 8,
        padding: "8px 12px",
        cursor: "pointer",
        background: highlighted ? "var(--ax-colors-bg-secondary)" : "transparent",
        transition: "background 0.1s ease",
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon && (
        <Box style={{ width: 16, height: 16, flexShrink: 0, color: active ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </Box>
      )}
      <Text
        fontSize="md"
        color={active ? "fg.default" : "fg.secondary"}
        style={{ flex: 1, fontWeight: 500 }}
      >
        {children}
      </Text>
      {addonAfter}
    </Box>
  );
}


// ── Filter dropdown ───────────────────────────────────────────────────────────

function FilterDropdown({ label, options }: { label: string; options: string[] }) {
  const [selected, setSelected] = useState("All");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <LabelMenuButton label={label}>{selected}</LabelMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {options.map((opt) => (
          <DropdownMenuItem key={opt} onClick={() => setSelected(opt)}>
            {opt}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function VirtualTeammatesPage() {
  const [query, setQuery] = useState("");
  const [activeNavItem, setActiveNavItem] = useState("Virtual Teammates");
  const router = useRouter();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = VAUS.filter((vau) => !vau.isCandidate);
    if (!q) return base;
    return base.filter(
      (vau) =>
        vau.name.toLowerCase().includes(q) ||
        vau.templateName.toLowerCase().includes(q) ||
        vau.description.toLowerCase().includes(q) ||
        vau.tags.some((t) => t.label.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <Box display="flex" style={{ height: "100%", minHeight: 0, overflow: "hidden" }}>
      {/* ── Browse Directory panel ── */}
      <Box
        style={{
          width: 272,
          minWidth: 272,
          flexShrink: 0,
          minHeight: 0,
          borderLeft: "1px solid var(--ax-colors-border-secondary)",
          borderRight: "1px solid var(--ax-colors-border-secondary)",
          background: "var(--ax-colors-bg-default)",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          padding: "16px 0",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        {/* Browse Directory section header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          style={{ padding: "12px 12px 4px" }}
        >
          <Text
            color="fg.tertiary"
            style={{ fontSize: 12, letterSpacing: "0.24px", lineHeight: "1.33" }}
          >
            Browse Directory
          </Text>
          <IconChevronDown style={{ color: "var(--ax-colors-fg-tertiary)", width: 14, height: 14 }} />
        </Box>

        {BROWSE_ITEMS.map((item) => {
          const isActive = activeNavItem === item.label;
          return (
          <NavRow
            key={item.label}
            active={isActive}
            onClick={() => setActiveNavItem(item.label)}
            addonAfter={<Badge intent="information" variant="subtle">{item.count}</Badge>}
          >
            {item.label}
          </NavRow>
          );
        })}

        {/* Divider */}
        <Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", margin: "4px 0" }} />

        {/* Quick Filters section header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          style={{ padding: "12px 12px 4px" }}
        >
          <Text
            color="fg.tertiary"
            style={{ fontSize: 12, letterSpacing: "0.24px", lineHeight: "1.33" }}
          >
            Quick Filters
          </Text>
          <IconChevronDown style={{ color: "var(--ax-colors-fg-tertiary)", width: 14, height: 14 }} />
        </Box>

        <NavRow icon={<IconCircleCheck style={{ width: 16, height: 16 }} />}>
          Installed
        </NavRow>
      </Box>

      {/* ── Main content ── */}
      <Box
        display="flex"
        flexDirection="column"
        style={{ flex: 1, minHeight: 0, overflowY: "auto", background: "#F9FCF8" }}
      >
        <Box display="flex" flexDirection="column" style={{ padding: "16px 40px" }}>
        <Heading level="1" mb="4">Directory</Heading>
        <Text color="fg.secondary" fontSize="md" mb="32">
          Meet your new favorite coworkers. They do the boring stuff. You get the glory.
        </Text>

        <>
            {/* Search + filters */}
            <Box display="flex" alignItems="center" gap="8" mb="24">
              <Box style={{ flex: 1, maxWidth: 264 }}>
                <Input
                  placeholder="Enter name or description"
                  addonBefore={<IconSearch />}
                  value={query}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                />
              </Box>
              <FilterDropdown
                label="Responsibility"
                options={[
                  "All",
                  "Analytics",
                  "Brand & Creative",
                  "Campaign Strategy",
                  "Content",
                  "Copywriting",
                  "Demand Generation",
                  "Email Marketing",
                  "Paid Media",
                  "Reporting",
                  "SEO",
                  "Social Media",
                ]}
              />
              <FilterDropdown label="Active Status" options={["All", "Installed", "Not Installed"]} />
            </Box>

            {/* Card grid */}
            {filtered.length === 0 ? (
              <Text color="fg.tertiary">No teammates match your search.</Text>
            ) : (
              <Box
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                {filtered.map((vau) => (
                  <VAUCard
                    key={vau.id}
                    vau={vau}
                    onSelect={(v) => router.push(`/opal/virtual-teammates/${v.id}?hire=true`)}
                  />
                ))}
              </Box>
            )}
        </>
        </Box>
      </Box>
    </Box>
  );
}
