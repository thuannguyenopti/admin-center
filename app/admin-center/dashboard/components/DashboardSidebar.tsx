"use client";

import { Badge, Box, Button, Heading, Link, Text } from "@optiaxiom/react";
import { IconArrowRight, IconCircleDollar } from "@optiaxiom/icons";
import { UNREAD_NOTIFICATION_COUNT } from "./NotificationsPanel";

const SUBSCRIPTION = {
  status: "ACTIVE" as const,
  contractEndDate: "Dec 31, 2026",
  products: [
    { name: "Opal", metric: "Credits" },
    { name: "Experimentation", metric: "MAU" },
    { name: "Collaboration", metric: "Seats" },
  ],
};

type Props = { onNotifClick: () => void };

export function DashboardSidebar({ onNotifClick }: Props) {
  return (
    <Box display="flex" flexDirection="column" gap="16">
      {/* Notifications */}
      <Box
        p="16"
        rounded="md"
        border="1"
        borderColor="border.tertiary"
        bg="bg.default"
        display="flex"
        alignItems="center"
        gap="12"
        cursor="pointer"
        onClick={onNotifClick}
      >
        <Box
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          rounded="full"
          style={{
            width: 36,
            height: 36,
            flexShrink: 0,
            position: "relative",
            backgroundColor: "rgba(255, 93, 82, 0.16)",
            color: "rgba(143, 71, 100, 1)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
          {UNREAD_NOTIFICATION_COUNT > 0 && (
            <Box
              rounded="full"
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                minWidth: 18,
                height: 18,
                padding: "0 5px",
                background: "var(--ax-colors-fg-error)",
                color: "var(--ax-colors-fg-white)",
                fontSize: 10,
                fontWeight: 700,
                lineHeight: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid var(--ax-colors-bg-default)",
              }}
            >
              {UNREAD_NOTIFICATION_COUNT > 9 ? "9+" : UNREAD_NOTIFICATION_COUNT}
            </Box>
          )}
        </Box>
        <Box flex="1">
          <Text fontWeight="600" fontSize="sm">
            {UNREAD_NOTIFICATION_COUNT > 0
              ? `${UNREAD_NOTIFICATION_COUNT} new notification${UNREAD_NOTIFICATION_COUNT === 1 ? "" : "s"}`
              : "You're all caught up"}
          </Text>
          <Text fontSize="sm" color="fg.tertiary">
            {UNREAD_NOTIFICATION_COUNT > 0
              ? "Click to view recent activity."
              : "No new notifications."}
          </Text>
        </Box>
        <IconArrowRight size={16} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
      </Box>

      {/* Subscription summary */}
      <Box p="16" rounded="md" border="1" borderColor="border.tertiary" bg="bg.default">
        <Text fontSize="sm" color="fg.tertiary" mb="4">Your Org contract</Text>
        <Heading level="4" mb="8">Subscription summary</Heading>
        <Box mb="16">
          <Badge intent="success" variant="strong">ACTIVE</Badge>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb="12">
          <Text fontSize="sm" color="fg.tertiary">Contract end date</Text>
          <Text fontSize="sm" fontWeight="500">{SUBSCRIPTION.contractEndDate}</Text>
        </Box>

        <Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)" }} mb="12" />

        <Box display="flex" justifyContent="space-between" alignItems="center" mb="8">
          <Text fontSize="sm" fontWeight="500" color="fg.secondary">Products</Text>
          <Text fontSize="sm" fontWeight="500" color="fg.secondary">Billing metric</Text>
        </Box>
        {SUBSCRIPTION.products.map((p) => (
          <Box key={p.name} display="flex" justifyContent="space-between" alignItems="center" mb="6">
            <Text fontSize="sm">{p.name}</Text>
            <Text fontSize="sm" color="fg.tertiary">{p.metric}</Text>
          </Box>
        ))}

        <Box display="flex" gap="8" mt="16">
          <Button appearance="default" size="sm" style={{ flex: 1 }}>Upgrade</Button>
          <Button
            appearance="subtle"
            size="sm"
            icon={<IconCircleDollar />}
            style={{ flex: 1 }}
          >
            View billing
          </Button>
        </Box>
      </Box>

      {/* Invite promo */}
      <Link
        href="/admin-center/user-management/users"
        style={{ textDecoration: "none", display: "block" }}
      >
        <Box rounded="md" style={{ lineHeight: 0, overflow: "hidden" }}>
          <img
            src="/admin-center-opal-invite-banner.png"
            alt="Invite multiple users with Opal. Try now."
            width={618}
            height={140}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </Box>
      </Link>
    </Box>
  );
}
