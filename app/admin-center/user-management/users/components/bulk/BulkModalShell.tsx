"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Box, Button, Heading } from "@optiaxiom/react";
import { IconXmark } from "@optiaxiom/icons";

const PANEL_WIDTH = 700;

/**
 * Shell shared by the bulk-management actions.
 * ✕ close top-right · scrollable body · sticky footer (see spec 2.1.3 "Shared Patterns").
 *
 * - variant="panel" → right slide-in panel (full height).
 * - variant="modal" → centered dialog (use for short confirmations like reset password).
 */
export function BulkModalShell({
	title,
	onClose,
	footer,
	children,
	variant = "modal",
	width = 640,
	height = "min(680px, 90vh)",
}: {
	title: string;
	onClose: () => void;
	footer: ReactNode;
	children: ReactNode;
	variant?: "modal" | "panel";
	/** Centered-modal width (ignored for panel variant). */
	width?: number;
	/** Centered-modal height. Use "auto" for short confirmation/error dialogs. */
	height?: number | string;
}) {
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prev;
		};
	}, [onClose]);

	if (typeof document === "undefined") return null;

	const isPanel = variant === "panel";

	const containerStyle: React.CSSProperties = isPanel
		? {
				position: "fixed",
				top: 0,
				right: 0,
				bottom: 0,
				width: PANEL_WIDTH,
				maxWidth: "100vw",
				zIndex: 1001,
				boxShadow: "var(--ax-shadows-xl)",
			}
		: {
				position: "fixed",
				top: "50%",
				left: "50%",
				transform: "translate(-50%, -50%)",
				width,
				maxWidth: "calc(100vw - 32px)",
				height,
				maxHeight: "90vh",
				zIndex: 1001,
				boxShadow: "var(--ax-shadows-xl)",
				overflow: "hidden",
			};

	return createPortal(
		<>
			<Box
				onClick={onClose}
				style={{
					position: "fixed",
					inset: 0,
					zIndex: 1000,
					background: "var(--ax-colors-bg-overlay)",
				}}
			/>
			<Box
				role="dialog"
				aria-modal="true"
				aria-label={title}
				bg="bg.default"
				display="flex"
				flexDirection="column"
				rounded={isPanel ? undefined : "lg"}
				style={containerStyle}
			>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					px="24"
					py="20"
					borderB={isPanel ? "1" : "0"}
					borderColor="border.tertiary"
				>
					<Heading level="2">{title}</Heading>
					<Button
						appearance="subtle"
						size="md"
						icon={<IconXmark size={20} />}
						aria-label="Close"
						onClick={onClose}
					/>
				</Box>

				<Box flex="1" overflow="auto" px="24" pb="24" pt={isPanel ? "20" : "0"}>
					{children}
				</Box>

				<Box
					display="flex"
					alignItems="center"
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
