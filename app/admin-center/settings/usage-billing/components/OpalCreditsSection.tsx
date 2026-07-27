"use client";

import { useState } from "react";
import { Badge, Box, Button, Heading, Text } from "@optiaxiom/react";
import { IconPlus, IconSparkles } from "@optiaxiom/icons";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { GroupDetailPanel, type GroupPanelData } from "./GroupDetailPanel";

// ── Data ─────────────────────────────────────────────────────────────────────

const CREDIT_USED = 8200;
const CREDIT_TOTAL = 15000;
const CREDIT_PCT = Math.round((CREDIT_USED / CREDIT_TOTAL) * 100);

type CreditGroup = {
  id: string;
  name: string;
  subtitle: string;
  members: number;
  assigned: number;
  consumed: number;
};

const CREDIT_GROUPS: CreditGroup[] = [
  { id: "g1", name: "Experimentation - Editor",                                          subtitle: "An automatically generated group for all users in this Organization.", members: 12, assigned: 2500, consumed: 1575 },
  { id: "g2", name: "Marketing - Account",                                               subtitle: "An automatically generated group for all users in this Organization.", members: 12, assigned: 2500, consumed: 1575 },
  { id: "g3", name: "Experimentation - Editor",        subtitle: "An automatically generated group for all users in this Organization.", members: 12, assigned: 2500, consumed: 2250 },
  { id: "g4", name: "Experimentation - Editor",        subtitle: "An automatically generated group for all users in this Organization.", members: 12, assigned: 2500, consumed: 1575 },
  { id: "g5", name: "Experimentation - Editor",        subtitle: "An automatically generated group for all users in this Organization.", members: 8,  assigned: 2000, consumed: 1600 },
  { id: "g6", name: "Experimentation -Editor",        subtitle: "An automatically generated group for all users in this Organization.", members: 6,  assigned: 1500, consumed: 945  },
  { id: "g7", name: "Experimentation - Editor",        subtitle: "An automatically generated group for all users in this Organization.", members: 10, assigned: 2000, consumed: 1260 },
];

type VTAgent = {
  id: string;
  name: string;
  color: string;
  vtCreated: number;
  creditsConsumed: number;
  totalCost: number;
};

const VT_AGENTS: VTAgent[] = [
  { id: "vt1", name: "Chief of Staff",      color: "#f59e0b", vtCreated: 12, creditsConsumed: 2000, totalCost: 2500 },
  { id: "vt2", name: "Content Producer",    color: "#3b82f6", vtCreated: 12, creditsConsumed: 2000, totalCost: 2500 },
  { id: "vt3", name: "Campaign Strategist", color: "#8b5cf6", vtCreated: 12, creditsConsumed: 2000, totalCost: 2500 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupBarColor(pct: number) {
  if (pct >= 90) return "var(--ax-colors-fg-error)";
  if (pct >= 75) return "var(--ax-colors-fg-warning)";
  return "var(--ax-colors-fg-accent-strong)";
}

function GroupBar({ consumed, assigned }: { consumed: number; assigned: number }) {
  const pct = Math.min(100, Math.round((consumed / assigned) * 100));
  return (
    <Box display="flex" alignItems="center" gap="8">
      <Box
        rounded="full"
        style={{ width: 100, height: 6, background: "var(--ax-colors-bg-tertiary)", overflow: "hidden", flexShrink: 0 }}
      >
        <Box style={{ height: "100%", width: `${pct}%`, background: groupBarColor(pct), transition: "width 200ms ease" }} />
      </Box>
      <Text fontSize="sm" style={{ color: groupBarColor(pct), fontVariantNumeric: "tabular-nums", minWidth: 28 }}>
        {pct}%
      </Text>
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function OpalCreditsSection() {
  const [selectedGroup, setSelectedGroup] = useState<GroupPanelData | null>(null);

  const openGroup = (g: CreditGroup) =>
    setSelectedGroup({ id: g.id, name: g.name, assigned: g.assigned, consumed: g.consumed, members: g.members });

  return (
    <Box>
      {/* Credit Summary */}
      <Box mb="32">
        <Box display="flex" alignItems="center" justifyContent="space-between" mb="16">
          <Heading level="4">Credit Summary</Heading>
          <Box display="flex" gap="8">
            <Button appearance="default" size="md" icon={<IconSparkles />}>
              Forecast usage
            </Button>
            <Button appearance="default" size="md" icon={<IconPlus />}>
              Add credits
            </Button>
          </Box>
        </Box>

        <Box
          p="20"
          rounded="md"
          border="1"
          borderColor="border.tertiary"
          bg="bg.default"
        >
          <Text fontSize="sm" color="fg.tertiary" mb="8">Credit usage</Text>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb="10">
            <Box display="flex" gap="10" style={{ alignItems: "baseline" }}>
              <Text style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                {CREDIT_PCT}%
              </Text>
              <Text fontSize="sm" color="fg.secondary">
                {CREDIT_USED.toLocaleString()} of {CREDIT_TOTAL.toLocaleString()} credits used
              </Text>
            </Box>
            <Text fontSize="sm" color="fg.tertiary">Resets August 1, 2026</Text>
          </Box>
          <Box
            rounded="full"
            bg="bg.tertiary"
            mb="10"
            style={{ height: 8, width: "100%", overflow: "hidden" }}
          >
            <Box
              style={{
                height: "100%",
                width: `${CREDIT_PCT}%`,
                background: "var(--ax-colors-fg-accent-strong)",
                transition: "width 200ms ease",
              }}
            />
          </Box>
          <Badge intent="success" variant="subtle">ON TRACK</Badge>
        </Box>
      </Box>

      {/* Credit allocation by group */}
      <Box mb="32">
        <Box display="flex" alignItems="center" justifyContent="space-between" mb="4">
          <Box>
            <Heading level="4">Credit allocation by group</Heading>
            <Text fontSize="sm" color="fg.tertiary" mt="2">Allocate credits and track usage across groups.</Text>
          </Box>
          <Button appearance="default" size="md" icon={<IconPlus />}>Add group</Button>
        </Box>

        <Box mt="16" rounded="md" border="1" borderColor="border.tertiary" bg="bg.default" style={{ overflow: "hidden" }}>
          <Table>
            <thead>
              <Tr>
                <Th>Group name</Th>
                <Th style={{ width: 90 }}>Members</Th>
                <Th style={{ width: 100 }}>Allocated</Th>
                <Th style={{ width: 100 }}>Used</Th>
                <Th style={{ width: 180 }}>Usage</Th>
                <Th style={{ width: 60 }} />
              </Tr>
            </thead>
            <tbody>
              {CREDIT_GROUPS.map((g) => (
                <Tr key={g.id} onClick={() => openGroup(g)} suppressActiveStyle style={{ cursor: "pointer" }}>
                  <Td type="raw">
                    <Text fontSize="sm" fontWeight="500">{g.name}</Text>
                    <Text fontSize="sm" color="fg.tertiary">{g.subtitle}</Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm" style={{ fontVariantNumeric: "tabular-nums" }}>{g.members}</Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm" style={{ fontVariantNumeric: "tabular-nums" }}>{g.assigned.toLocaleString()}</Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm" style={{ fontVariantNumeric: "tabular-nums" }}>{g.consumed.toLocaleString()}</Text>
                  </Td>
                  <Td type="raw">
                    <GroupBar consumed={g.consumed} assigned={g.assigned} />
                  </Td>
                  <Td type="raw">
                    <Text fontSize="sm" color="fg.accent">Manage</Text>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Box>
      </Box>

      <GroupDetailPanel key={selectedGroup?.id} group={selectedGroup} onClose={() => setSelectedGroup(null)} />

      {/* Virtual Teammates Usage */}
      <Box mb="24">
        <Box mb="4">
          <Heading level="4">Virtual Teammates Usage</Heading>
          <Text fontSize="sm" color="fg.tertiary" mt="2">Allocate credits and track usage across groups.</Text>
        </Box>

        <Box mt="16" rounded="md" border="1" borderColor="border.tertiary" bg="bg.default" style={{ overflow: "hidden" }}>
          <Table>
            <thead>
              <Tr>
                <Th>Virtual Teammates enabled</Th>
                <Th style={{ width: 140 }}>Total VT created</Th>
                <Th style={{ width: 180 }}>Total credits consumed</Th>
                <Th style={{ width: 100 }}>Total cost</Th>
                <Th style={{ width: 60 }} />
              </Tr>
            </thead>
            <tbody>
              {VT_AGENTS.map((vt) => (
                <Tr key={vt.id}>
                  <Td type="raw">
                    <Box display="flex" alignItems="center" gap="10">
                      <Box
                        rounded="sm"
                        style={{
                          width: 28,
                          height: 28,
                          flexShrink: 0,
                          background: vt.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          color: "#fff",
                          fontWeight: 700,
                        }}
                      >
                        {vt.name.charAt(0)}
                      </Box>
                      <Text fontSize="sm" fontWeight="500">{vt.name}</Text>
                    </Box>
                  </Td>
                  <Td>
                    <Text fontSize="sm" style={{ fontVariantNumeric: "tabular-nums" }}>{vt.vtCreated}</Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm" style={{ fontVariantNumeric: "tabular-nums" }}>{vt.creditsConsumed.toLocaleString()}</Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm" style={{ fontVariantNumeric: "tabular-nums" }}>${vt.totalCost.toLocaleString()}</Text>
                  </Td>
                  <Td type="raw">
                    <Text fontSize="sm" color="fg.accent">Manage</Text>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
}
