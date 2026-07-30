"use client";

import { Box, Button, Link, Text } from "@optiaxiom/react";
import { IconXmark, IconPopOut } from "@/app/lib/axiom-icons";
<<<<<<< HEAD
import Image from "next/image";
=======
>>>>>>> origin/main
import { useState, type ReactNode } from "react";

// Opal brand gradient at 20% opacity blended over white
const BG = `radial-gradient(ellipse at 100% 50%,
  rgba(186,158,245,0.20) 0%,
  rgba(168,184,240,0.17) 55%,
  rgba(144,210,187,0.155) 77%,
  rgba(119,236,133,0.14) 100%)`;

export type OpalAlertProps = {
  /** "Default" = stacked layout with optional title + link. "CTA" = single-row with action button. */
  type?: "Default" | "CTA";
  title?: string;
  body: string;
  /** Default variant: optional link below body text */
  link?: { label: string; href: string };
  /** CTA variant: action button rendered inline */
  action?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
};

export function OpalAlert({
  type = "Default",
  title,
  body,
  link,
  action,
  dismissible = true,
  onDismiss,
}: OpalAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const isCTA = type === "CTA";

  return (
    <Box
      display="flex"
      alignItems={isCTA ? "center" : "start"}
      gap="8"
      rounded="lg"
      style={{
        minHeight: 48,
        padding: isCTA ? "12px" : "12px 8px 12px 12px",
        backgroundColor: "white",
        backgroundImage: BG,
      }}
    >
      {/* Main content row */}
      <Box
        display="flex"
        alignItems={isCTA ? "center" : "start"}
        gap="12"
        style={{ flex: 1, paddingTop: 2, paddingBottom: 2 }}
      >
        {/* Opal orb */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="start"
          style={{
            width: 20,
            flexShrink: 0,
            paddingTop: 2,
            paddingBottom: 2,
            justifyContent: isCTA ? "center" : "flex-start",
          }}
        >
<<<<<<< HEAD
          <Image src="/opal-orb.png" alt="" width={20} height={20} />
=======
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/opal-icon-nav.png" alt="" width={20} height={20} style={{ display: "block" }} />
>>>>>>> origin/main
        </Box>

        {/* Text area */}
        {isCTA ? (
          <Box display="flex" alignItems="center" gap="48" style={{ flex: 1 }}>
            <Text
              style={{
                flex: 1,
                fontSize: 14,
                fontWeight: 500,
                lineHeight: 1.43,
                letterSpacing: "0.28px",
                color: "var(--ax-colors-fg-default)",
              }}
            >
              {body}
            </Text>
            {action}
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap="4" style={{ flex: 1 }}>
            {title && (
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: 1.43,
                  letterSpacing: "0.28px",
                  color: "var(--ax-colors-fg-default)",
                  whiteSpace: "nowrap",
                }}
              >
                {title}
              </Text>
            )}
            <Text
              style={{
                fontSize: 14,
                fontWeight: 500,
                lineHeight: 1.43,
                letterSpacing: "0.28px",
                color: "var(--ax-colors-fg-default)",
              }}
            >
              {body}
            </Text>
            {link && (
              <Link href={link.href}>
                <Box asChild display="inline-flex" alignItems="center" gap="4">
                  <span>{link.label}<IconPopOut size={12} /></span>
                </Box>
              </Link>
            )}
          </Box>
        )}
      </Box>

      {/* Dismiss button */}
      {dismissible && (
        <Button
          appearance="subtle"
          size="sm"
          icon={<IconXmark />}
          aria-label="Dismiss alert"
          onClick={() => {
            setDismissed(true);
            onDismiss?.();
          }}
        />
      )}
    </Box>
  );
}
