"use client";

/**
 * PanelShell — shared slide-out panel chrome for all admin-center panels.
 *
 * Manages: portal, backdrop, scroll-lock, Escape-to-close, header, footer.
 * Callers supply: title, optional subHeader (tabs / stepper), footer buttons, and children.
 */

import { type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Box, Button, Heading } from "@optiaxiom/react";
import { IconXmark } from "@optiaxiom/icons";

const DEFAULT_WIDTH = 700;

export type PanelShellProps = {
  open: boolean;
  onClose: () => void;
  /** Panel heading — can be a string or a ReactNode (e.g. heading + badge). */
  title: ReactNode;
  /** aria-label for the dialog element. Falls back to string title if omitted. */
  ariaLabel?: string;
  /**
   * Optional row rendered between the header and the content area
   * (e.g. a tab bar or a step progress row).
   * PanelShell adds px="24" and borderB="1" automatically.
   */
  subHeader?: ReactNode;
  /**
   * Footer action buttons. PanelShell renders them right-aligned inside
   * the standard footer bar. Pass a fragment with Cancel + Save (or Back +
   * Continue, etc.).
   */
  footer: ReactNode;
  children: ReactNode;
  width?: number;
};

export function PanelShell({
  open,
  onClose,
  title,
  ariaLabel,
  subHeader,
  footer,
  children,
  width = DEFAULT_WIDTH,
}: PanelShellProps) {
  // Keep a stable ref so the effect doesn't need onClose in its deps
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const label =
    ariaLabel ?? (typeof title === "string" ? title : undefined);

  return createPortal(
    <>
      {/* Backdrop */}
      <Box
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          background: "var(--ax-colors-bg-overlay)",
        }}
      />

      {/* Panel */}
      <Box
        role="dialog"
        aria-modal="true"
        aria-label={label}
        bg="bg.default"
        display="flex"
        flexDirection="column"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width,
          maxWidth: "100vw",
          zIndex: 1001,
          boxShadow: "var(--ax-shadows-xl)",
        }}
      >
        {/* ── Header ── */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          px="24"
          py="20"
          borderB="1"
          borderColor="border.tertiary"
        >
          {typeof title === "string" ? (
            <Heading level="2">{title}</Heading>
          ) : (
            title
          )}
          <Button
            appearance="subtle"
            size="md"
            icon={<IconXmark size={20} />}
            aria-label="Close"
            onClick={onClose}
          />
        </Box>

        {/* ── Sub-header (tabs / stepper) ── */}
        {subHeader && (
          <Box px="24" borderB="1" borderColor="border.tertiary">
            {subHeader}
          </Box>
        )}

        {/* ── Scrollable content ── */}
        <Box flex="1" overflow="auto" px="24" py="20">
          {children}
        </Box>

        {/* ── Footer ── */}
        <Box
          display="flex"
          justifyContent="end"
          gap="12"
          px="24"
          py="16"
          borderT="1"
          borderColor="border.tertiary"
          bg="bg.page"
        >
          {footer}
        </Box>
      </Box>
    </>,
    document.body,
  );
}
