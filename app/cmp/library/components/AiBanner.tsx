"use client";

import { type ReactNode, useState } from "react";
import { Box, Button, Text } from "@optiaxiom/react";
import { IconXmark } from "@optimizely/axiom-icons";

// ─── Gradient ────────────────────────────────────────────────────────────────
// Matches Figma node 668-8624 (Opal-Library--Rebrand).
// Radial gradient: purple → blue → teal → green, 20 % opacity, over bg.default.
// The ellipse is anchored at the top-left corner and sweeps to the right edge.
const GRADIENT =
	"radial-gradient(ellipse 120% 80% at -5% -5%, rgba(186,158,245,.20) 0%, rgba(168,184,240,.17) 54.67%, rgba(144,210,187,.155) 77.34%, rgba(119,236,133,.14) 100%)";

// ─── Generic container ───────────────────────────────────────────────────────
type BannerProps = {
	children: ReactNode;
	className?: string;
	alignItems?: "center" | "start";
};

export function AiBanner({ children, className, alignItems = "center" }: BannerProps) {
	return (
		<Box
			alignItems={alignItems}
			color="fg.default"
			display="flex"
			gap="12"
			px="12"
			py="12"
			rounded="md"
			className={className}
			style={{
				background: `${GRADIENT}, var(--ax-colors-bg-default)`,
				minHeight: 48,
			}}
		>
			{children}
		</Box>
	);
}

// ─── Opal orb avatar ─────────────────────────────────────────────────────────
export function AiBannerOrb({ size = 20 }: { size?: number }) {
	return (
		<Box
			alignItems="center"
			display="flex"
			justifyContent="center"
			style={{ flexShrink: 0, height: size, overflow: "hidden", width: size }}
		>
			<img
				alt=""
				src="/opal-orb.png"
				style={{ display: "block", height: "100%", width: "100%" }}
			/>
		</Box>
	);
}

// ─── Default variant ─────────────────────────────────────────────────────────
// Use for AI suggestions, recognition snapshots, informational Opal messages.
type DefaultProps = {
	title?: string;
	children: ReactNode;
	link?: { label: string; href?: string; onClick?: () => void };
	dismissible?: boolean;
	onDismiss?: () => void;
	actions?: ReactNode;
};

export function OpalAlert({ title, children, link, dismissible = false, onDismiss, actions }: DefaultProps) {
	const [dismissed, setDismissed] = useState(false);
	if (dismissed) return null;

	const handleDismiss = () => {
		setDismissed(true);
		onDismiss?.();
	};

	return (
		<Box
			color="fg.default"
			display="flex"
			gap="8"
			px="12"
			py="12"
			rounded="md"
			style={{
				background: `${GRADIENT}, var(--ax-colors-bg-default)`,
				minHeight: 48,
			}}
		>
			{/* Opal icon */}
			<Box style={{ flexShrink: 0, paddingTop: 2 }}>
				<AiBannerOrb size={20} />
			</Box>

			{/* Text content */}
			<Box display="flex" flex="1" flexDirection="column" gap="4" style={{ minWidth: 0, paddingTop: 2 }}>
				{title && (
					<Text fontSize="sm" fontWeight="600" color="fg.default">
						{title}
					</Text>
				)}
				<Box color="fg.default" fontSize="sm">
					{children}
				</Box>
				{link && (
					<Box alignItems="center" display="flex" gap="4">
						<Box
							asChild
							color="fg.default"
							fontSize="sm"
							style={{ textDecoration: "underline", cursor: "pointer" }}
						>
							<span
								role={link.onClick ? "button" : undefined}
								tabIndex={link.onClick ? 0 : undefined}
								onClick={link.onClick}
								onKeyDown={(e) => {
									if (link.onClick && (e.key === "Enter" || e.key === " ")) {
										e.preventDefault();
										link.onClick();
									}
								}}
							>
								{link.label}
							</span>
						</Box>
					</Box>
				)}
				{actions && (
					<Box alignItems="center" display="flex" gap="8" pt="4">
						{actions}
					</Box>
				)}
			</Box>

			{/* Dismiss */}
			{dismissible && (
				<Box style={{ flexShrink: 0 }}>
					<Button
						appearance="subtle"
						size="sm"
						icon={<IconXmark size={14} />}
						aria-label="Dismiss"
						onClick={handleDismiss}
					/>
				</Box>
			)}
		</Box>
	);
}

// ─── CTA variant ─────────────────────────────────────────────────────────────
// Inline action button alongside the message. Single-line, items centered.
type CtaProps = {
	children: ReactNode;
	buttonLabel: string;
	onButtonClick?: () => void;
	dismissible?: boolean;
	onDismiss?: () => void;
};

export function OpalAlertCta({ children, buttonLabel, onButtonClick, dismissible = false, onDismiss }: CtaProps) {
	const [dismissed, setDismissed] = useState(false);
	if (dismissed) return null;

	const handleDismiss = () => {
		setDismissed(true);
		onDismiss?.();
	};

	return (
		<Box
			alignItems="center"
			color="fg.default"
			display="flex"
			gap="12"
			px="12"
			py="12"
			rounded="md"
			style={{
				background: `${GRADIENT}, var(--ax-colors-bg-default)`,
				minHeight: 48,
			}}
		>
			{/* Opal icon */}
			<AiBannerOrb size={20} />

			{/* Text */}
			<Box color="fg.default" display="flex" flex="1" fontSize="sm" style={{ minWidth: 0 }}>
				{children}
			</Box>

			{/* Inline CTA button — default appearance, sm */}
			<Button
				appearance="default"
				size="sm"
				onClick={onButtonClick}
				style={{ flexShrink: 0 }}
			>
				{buttonLabel}
			</Button>

			{/* Dismiss */}
			{dismissible && (
				<Button
					appearance="subtle"
					size="sm"
					icon={<IconXmark size={14} />}
					aria-label="Dismiss"
					style={{ flexShrink: 0 }}
					onClick={handleDismiss}
				/>
			)}
		</Box>
	);
}
