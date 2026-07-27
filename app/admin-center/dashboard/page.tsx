"use client";

import { useMemo, useState } from "react";
import { Badge, Box, Heading, Link, Text } from "@optiaxiom/react";
import {
  IconUser,
  IconRobot,
  IconGrid,
  IconEnvelopeOpen,
  IconUsers,
  IconWavePulse,
  IconChartColumn,
} from "@optiaxiom/icons";

import { NotificationsPanel } from "./components/NotificationsPanel";
import { DashboardSidebar } from "./components/DashboardSidebar";
import { USERS } from "../user-management/users/data";
import { AGENTS_SUMMARY, PRODUCTS_SUMMARY, SEATS } from "./data";

// ── Shared sub-components ─────────────────────────────────────────────────────

function ProgressBar({ pct }: { pct: number }) {
  const capped = Math.min(100, pct);
  return (
    <Box rounded="full" bg="bg.tertiary" style={{ height: 6, width: "100%", overflow: "hidden" }}>
      <Box
        style={{
          height: "100%",
          width: `${capped}%`,
          background:
            pct >= 95
              ? "var(--ax-colors-fg-error)"
              : pct >= 80
                ? "var(--ax-colors-fg-warning)"
                : "var(--ax-colors-fg-accent-strong)",
          transition: "width 200ms ease",
        }}
      />
    </Box>
  );
}

// ── Usage & billing card ──────────────────────────────────────────────────────

type UsageStatus = "on-track" | "overage" | "warning";

type UsageCardProps = {
  icon: React.ReactNode;
  label: string;
  primary: string;
  detail: string;
  pct: number;
  status: UsageStatus;
  footerLabel: string;
  footerText: string;
  href?: string;
};

function UsageCard({ icon, label, primary, detail, pct, status, footerLabel, footerText, href }: UsageCardProps) {
  const badge = {
    "on-track": { text: "ON TRACK", intent: "success" as const },
    "overage":  { text: "OVERAGE",  intent: "danger"  as const },
    "warning":  { text: "WATCH USAGE", intent: "warning" as const },
  }[status];

  const inner = (
    <Box p="20" rounded="md" border="1" borderColor="border.tertiary" bg="bg.default" style={{ height: "100%" }}>
      <Box display="flex" alignItems="center" gap="8" mb="12">
        <Box color="fg.tertiary" display="inline-flex">{icon}</Box>
        <Text fontSize="sm" color="fg.tertiary">{label}</Text>
      </Box>
      <Box display="flex" gap="10" mb="10" style={{ alignItems: "baseline" }}>
        <Text style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
          {primary}
        </Text>
        <Text fontSize="sm" color="fg.secondary">{detail}</Text>
      </Box>
      <Box mb="10">
        <ProgressBar pct={pct} />
      </Box>
      <Box mb="16">
        <Badge intent={badge.intent} variant="strong">
          {badge.text}
        </Badge>
      </Box>
      <Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)", margin: "0 -20px 12px" }} />
      <Text fontSize="sm" color="fg.tertiary" mb="2">{footerLabel}</Text>
      <Text fontSize="sm" color="fg.secondary">{footerText}</Text>
    </Box>
  );

  if (!href) return inner;
  return (
    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
      {inner}
    </Link>
  );
}

// ── User stat card ────────────────────────────────────────────────────────────

type UserStatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  badgeText?: string;
  badgeIntent?: "danger" | "warning" | "success" | "neutral";
  helper?: string;
  href?: string;
};

function UserStatCard({ icon, label, value, badgeText, badgeIntent = "danger", helper, href }: UserStatCardProps) {
  const inner = (
    <Box p="16" rounded="md" border="1" borderColor="border.tertiary" bg="bg.default" style={{ height: "100%" }}>
      <Box display="flex" justifyContent="space-between" alignItems="start" mb="8">
        <Text fontSize="sm" color="fg.tertiary">{label}</Text>
        <Box
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          rounded="full"
          bg="bg.accent.subtle"
          color="fg.accent"
          style={{ width: 28, height: 28, flexShrink: 0 }}
        >
          {icon}
        </Box>
      </Box>
      <Text style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums" }} mb="10">
        {value}
      </Text>
      {badgeText && (
        <Box mb="6">
          <Badge intent={badgeIntent} variant="strong">{badgeText}</Badge>
        </Box>
      )}
      {helper && <Text fontSize="sm" color="fg.tertiary">{helper}</Text>}
    </Box>
  );

  if (!href) return inner;
  return (
    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
      {inner}
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

// Mock MAU data (Experimentation)
const MAU_USED = 6_330_000;
const MAU_TOTAL = 12_000_000;
const MAU_PCT = Math.round((MAU_USED / MAU_TOTAL) * 100);

const OPAL_USED = 8200;
const OPAL_TOTAL = 15000;
const OPAL_PCT = Math.round((OPAL_USED / OPAL_TOTAL) * 100);

const SEAT_PCT = Math.round((SEATS.used / SEATS.total) * 100);

export default function AdminCenterDashboardPage() {
  const userStats = useMemo(() => {
    const total = USERS.length;
    const inactive = USERS.filter(
      (u) => u.activationStatus === "Password Expired" || u.activationStatus === "N/A",
    ).length;
    const pending = USERS.filter((u) => u.activationStatus === "N/A").length;
    return { total, inactive, pending };
  }, []);

  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <Box>
      <Box
        display="grid"
        gap="24"
        style={{ gridTemplateColumns: "1fr 264px", alignItems: "start" }}
      >
        {/* ── Main content ─────────────────────────────────────────── */}
        <Box>
          <Box mb="24">
            <Heading level="2">Dashboard</Heading>
            <Text color="fg.secondary" fontSize="md">
              Overview of users, access, and billing for your organization.
            </Text>
          </Box>

          {/* Usage & billing */}
          <Box mb="32">
            <Heading level="4" mb="16">Usage &amp; billing</Heading>
            <Box
              display="grid"
              gap="16"
              style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
            >
              <UsageCard
                icon={<IconChartColumn size={14} />}
                label="Opal credits"
                primary={`${OPAL_PCT}%`}
                detail={`${(OPAL_USED / 1000).toFixed(1)}K of ${(OPAL_TOTAL / 1000).toFixed(0)}K used`}
                pct={OPAL_PCT}
                status="on-track"
                footerLabel="Usage across"
                footerText="2 groups • 4 Virtual Teammates"
                href="/admin-center/settings/usage-billing?tab=Opal"
              />
              <UsageCard
                icon={<IconWavePulse size={14} />}
                label="Experimentation MAU"
                primary={`${MAU_PCT}%`}
                detail={`${(MAU_USED / 1_000_000).toFixed(2)}M of ${(MAU_TOTAL / 1_000_000).toFixed(0)}M used`}
                pct={MAU_PCT}
                status="on-track"
                footerLabel="Projected usage"
                footerText="10.74M • 90% of contract limit"
                href="/admin-center/settings/usage-billing"
              />
              <UsageCard
                icon={<IconUsers size={14} />}
                label="Collaboration seats"
                primary={`${SEATS.used} / ${SEATS.total}`}
                detail={`${SEATS.used - SEATS.total} over limit`}
                pct={SEAT_PCT}
                status="overage"
                footerLabel="13 inactive users"
                footerText="No activity in the past 90 days"
                href="/admin-center/settings/usage-billing"
              />
            </Box>
          </Box>

          {/* User management overview */}
          <Box mb="32">
            <Heading level="4" mb="16">User management overview</Heading>
            <Box
              display="grid"
              gap="16"
              style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
            >
              <UserStatCard
                icon={<IconUser size={14} />}
                label="Total Users"
                value={userStats.total}
                badgeText={userStats.inactive > 0 ? `${userStats.inactive} INACTIVES` : undefined}
                badgeIntent="danger"
                href="/admin-center/user-management/users"
              />
              <UserStatCard
                icon={<IconEnvelopeOpen size={14} />}
                label="Pending Invites"
                value={userStats.pending}
                helper="Awaiting activation"
                href="/admin-center/user-management/users"
              />
              <UserStatCard
                icon={<IconRobot size={14} />}
                label="VTs created"
                value={AGENTS_SUMMARY.count}
                helper={AGENTS_SUMMARY.delta ? `+${AGENTS_SUMMARY.delta} this month` : undefined}
                href={AGENTS_SUMMARY.href}
              />
              <UserStatCard
                icon={<IconGrid size={14} />}
                label="Products"
                value={PRODUCTS_SUMMARY.count}
                helper="Across your org"
                href="/admin-center/access-setup/product-access"
              />
            </Box>
          </Box>
        </Box>

        {/* ── Right sidebar ─────────────────────────────────────────── */}
        <DashboardSidebar onNotifClick={() => setNotifOpen(true)} />
      </Box>

      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </Box>
  );
}
