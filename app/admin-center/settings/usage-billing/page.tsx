"use client";

import { useState } from "react";
import {
  Badge,
  Box,
  Heading,
  Text,
} from "@optiaxiom/react";
import { IconUsers, IconWavePulse } from "@optiaxiom/icons";

import { Table, Tr, Th, Td } from "@/app/components/Table";
import { OpalCreditsSection } from "./components/OpalCreditsSection";

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = "Opal credits" | "Seats" | "MAU";
const TABS: Tab[] = ["Opal credits", "Seats", "MAU"];

// ── Data ──────────────────────────────────────────────────────────────────────

type SeatRow = { product: string; instance: string; total: number; used: number };

const SEAT_ROWS: SeatRow[] = [
  { product: "CMS",                   instance: "Production", total: 12, used: 11 },
  { product: "CMS",                   instance: "Sandbox",    total: 8,  used: 5  },
  { product: "CMP",                   instance: "Production", total: 10, used: 9  },
  { product: "Opal",                  instance: "Production", total: 15, used: 12 },
  { product: "Web Experimentation",   instance: "Production", total: 6,  used: 4  },
  { product: "Frontend Hosting",      instance: "Staging",    total: 5,  used: 2  },
];

const SEAT_USED  = SEAT_ROWS.reduce((s, r) => s + r.used,  0);
const SEAT_TOTAL = SEAT_ROWS.reduce((s, r) => s + r.total, 0);

const MAU_USED  = 6_330_000;
const MAU_TOTAL = 12_000_000;
const MAU_PCT   = Math.round((MAU_USED / MAU_TOTAL) * 100);

// ── Shared components ─────────────────────────────────────────────────────────

function ProgressBar({ pct }: { pct: number }) {
  const capped = Math.min(100, pct);
  return (
    <Box rounded="full" bg="bg.tertiary" style={{ height: 8, width: "100%", overflow: "hidden" }}>
      <Box
        style={{
          height: "100%",
          width: `${capped}%`,
          background:
            pct >= 95 ? "var(--ax-colors-fg-error)"
            : pct >= 80 ? "var(--ax-colors-fg-warning)"
            : "var(--ax-colors-fg-accent-strong)",
          transition: "width 200ms ease",
        }}
      />
    </Box>
  );
}

// ── Tab content: Seats ────────────────────────────────────────────────────────

function SeatsTab() {
  const seatPct = Math.round((SEAT_USED / SEAT_TOTAL) * 100);
  return (
    <Box>
      {/* Summary card */}
      <Box p="20" mb="24" rounded="md" border="1" borderColor="border.tertiary" bg="bg.default">
        <Box display="flex" alignItems="center" gap="8" mb="8">
          <Box color="fg.tertiary" display="inline-flex"><IconUsers size={14} /></Box>
          <Text fontSize="sm" color="fg.tertiary">Collaboration seats</Text>
        </Box>
        <Box display="flex" gap="10" mb="10" style={{ alignItems: "baseline" }}>
          <Text style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {SEAT_USED} / {SEAT_TOTAL}
          </Text>
          <Text fontSize="sm" color="fg.secondary">{SEAT_USED - SEAT_TOTAL} over limit</Text>
        </Box>
        <ProgressBar pct={seatPct} />
        <Box mt="10">
          <Badge intent="danger" variant="strong">OVERAGE</Badge>
        </Box>
      </Box>

      {/* Seat detail table */}
      <Heading level="4" mb="12">Seat detail</Heading>
      <Box rounded="md" border="1" borderColor="border.tertiary" bg="bg.default" style={{ overflow: "hidden" }}>
        <Table>
          <thead>
            <Tr>
              <Th>Product</Th>
              <Th>Instance</Th>
              <Th style={{ width: 100 }}>Total</Th>
              <Th style={{ width: 80 }}>Used</Th>
              <Th style={{ width: 80 }}>Available</Th>
              <Th style={{ width: 180 }}>Utilization</Th>
            </Tr>
          </thead>
          <tbody>
            {SEAT_ROWS.map((r, i) => {
              const pct = Math.round((r.used / r.total) * 100);
              return (
                <Tr key={i}>
                  <Td>{r.product}</Td>
                  <Td>{r.instance}</Td>
                  <Td>{r.total}</Td>
                  <Td>{r.used}</Td>
                  <Td>{Math.max(0, r.total - r.used)}</Td>
                  <Td type="raw">
                    <Box display="flex" alignItems="center" gap="8" style={{ minWidth: 160 }}>
                      <Box style={{ flex: 1 }}><ProgressBar pct={pct} /></Box>
                      <Text fontSize="sm" color="fg.tertiary" style={{ fontVariantNumeric: "tabular-nums" }}>{pct}%</Text>
                    </Box>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </Box>
    </Box>
  );
}

// ── Tab content: MAU ──────────────────────────────────────────────────────────

function MAUTab() {
  return (
    <Box>
      <Box p="20" rounded="md" border="1" borderColor="border.tertiary" bg="bg.default">
        <Box display="flex" alignItems="center" gap="8" mb="8">
          <Box color="fg.tertiary" display="inline-flex"><IconWavePulse size={14} /></Box>
          <Text fontSize="sm" color="fg.tertiary">Experimentation MAU</Text>
        </Box>
        <Box display="flex" gap="10" mb="10" style={{ alignItems: "baseline" }}>
          <Text style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {MAU_PCT}%
          </Text>
          <Text fontSize="sm" color="fg.secondary">
            {(MAU_USED / 1_000_000).toFixed(2)}M of {(MAU_TOTAL / 1_000_000).toFixed(0)}M used
          </Text>
        </Box>
        <ProgressBar pct={MAU_PCT} />
        <Box mt="10">
          <Badge intent="success" variant="strong">ON TRACK</Badge>
        </Box>
        <Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)", margin: "16px -20px 12px" }} />
        <Text fontSize="sm" color="fg.tertiary" mb="2">Projected usage</Text>
        <Text fontSize="sm" color="fg.secondary">10.74M · 90% of contract limit</Text>
      </Box>
    </Box>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UsageBillingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Opal credits");

  return (
    <Box>
      {/* Page heading */}
      <Box mb="24">
        <Heading level="2">Usage &amp; Billing</Heading>
      </Box>

      {/* Tabs */}
      <Box display="flex" gap="24" borderB="1" borderColor="border.tertiary" mb="24">
        {TABS.map((tab) => (
          <Box
            key={tab}
            pb="12"
            cursor="pointer"
            borderB={activeTab === tab ? "2" : "0"}
            onClick={() => setActiveTab(tab)}
            style={activeTab === tab ? { borderBottomColor: "var(--ax-colors-fg-default)" } : {}}
          >
            <Text
              fontWeight={activeTab === tab ? "500" : "400"}
              color={activeTab === tab ? "fg.default" : "fg.tertiary"}
            >
              {tab}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Tab content */}
      <Box mb="40">
        {activeTab === "Opal credits" && <OpalCreditsSection />}
        {activeTab === "Seats"        && <SeatsTab />}
        {activeTab === "MAU"          && <MAUTab />}
      </Box>
    </Box>
  );
}
