"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
	Box,
	Button,
	Heading,
	Text,
} from "@optiaxiom/react";
import {
	IconBell,
	IconCircleCheck,
	IconCircleExclamation,
	IconCircleInfo,
	IconTriangleExclamation,
	IconXmark,
} from "@optiaxiom/icons";

const PANEL_WIDTH = 700;

export type NotificationItem = {
	id: string;
	intent: "info" | "success" | "warning" | "danger";
	title: string;
	description: string;
	time: string;
	read?: boolean;
	action?: { label: string; href?: string };
};

export const NOTIFICATIONS: NotificationItem[] = [
	{
		id: "n-1",
		intent: "warning",
		title: "Seat limit exceeded",
		description:
			"You're using 28 of 25 seats. Additional seats will be billed at the per-seat rate.",
		time: "5 min ago",
		action: {
			label: "Upgrade plan",
			href: "/admin-center/settings/usage-billing",
		},
	},
	{
		id: "n-2",
		intent: "info",
		title: "Renewal in 13 days",
		description:
			"Your Growth plan renews on Jun 03, 2026 for $18,000.",
		time: "1 hour ago",
		action: {
			label: "View billing",
			href: "/admin-center/settings/usage-billing",
		},
	},
	{
		id: "n-3",
		intent: "success",
		title: "New SSO connection added",
		description: "Okta SAML 2.0 connection is now active.",
		time: "Yesterday",
		read: true,
		action: {
			label: "Review",
			href: "/admin-center/settings/authentication",
		},
	},
	{
		id: "n-4",
		intent: "danger",
		title: "Failed login attempts detected",
		description:
			"5 failed sign-ins for mason.wilson@protonmail.com in the last hour.",
		time: "Yesterday",
		read: true,
		action: {
			label: "View activity",
			href: "/admin-center/settings/activity-log",
		},
	},
	{
		id: "n-5",
		intent: "info",
		title: "12 password resets pending",
		description: "Users with expired passwords are awaiting reset emails.",
		time: "2 days ago",
		read: true,
		action: {
			label: "Manage users",
			href: "/admin-center/user-management/users",
		},
	},
	{
		id: "n-6",
		intent: "success",
		title: "5 new users activated",
		description: "Recent invites have been accepted and are now active.",
		time: "3 days ago",
		read: true,
	},
];

export const UNREAD_NOTIFICATION_COUNT = NOTIFICATIONS.filter(
	(n) => !n.read,
).length;

function intentIcon(intent: NotificationItem["intent"]) {
	const size = 18;
	if (intent === "success")
		return <IconCircleCheck size={size} color="var(--ax-colors-fg-success)" />;
	if (intent === "warning")
		return (
			<IconTriangleExclamation
				size={size}
				color="var(--ax-colors-fg-warning)"
			/>
		);
	if (intent === "danger")
		return (
			<IconCircleExclamation
				size={size}
				color="var(--ax-colors-fg-error)"
			/>
		);
	return <IconCircleInfo size={size} color="var(--ax-colors-fg-information)" />;
}

export function NotificationsPanel({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const router = useRouter();
	const [items, setItems] = useState<NotificationItem[]>(NOTIFICATIONS);
	const [hoveredId, setHoveredId] = useState<string | null>(null);

	const handleAction = (n: NotificationItem) => {
		if (n.action?.href) {
			router.push(n.action.href);
			onClose();
		}
	};

	const dismiss = (id: string) => {
		setItems((prev) => prev.filter((n) => n.id !== id));
	};
	useEffect(() => {
		if (!open) return;
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
	}, [open, onClose]);

	if (!open || typeof document === "undefined") return null;

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
				aria-label="Notifications"
				bg="bg.default"
				display="flex"
				flexDirection="column"
				style={{
					position: "fixed",
					top: 0,
					right: 0,
					bottom: 0,
					width: PANEL_WIDTH,
					maxWidth: "100vw",
					zIndex: 1001,
					boxShadow: "var(--ax-shadows-xl)",
				}}
			>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					px="24"
					py="20"
					borderB="1"
					borderColor="border.tertiary"
				>
					<Box display="flex" alignItems="center" gap="8">
						<IconBell size={20} color="var(--ax-colors-fg-default)" />
						<Heading level="2">Notifications</Heading>
					</Box>
					<Button
						appearance="subtle"
						size="md"
						icon={<IconXmark size={20} />}
						aria-label="Close"
						onClick={onClose}
					/>
				</Box>

				<Box flex="1" overflow="auto">
					{items.length === 0 ? (
						<Box p="32" textAlign="center">
							<Text color="fg.tertiary">You're all caught up.</Text>
						</Box>
					) : (
						items.map((n, i) => (
							<Box
								key={n.id}
								display="flex"
								gap="12"
								px="24"
								py="16"
								borderB={i === items.length - 1 ? "0" : "1"}
								borderColor="border.tertiary"
								bg={n.read ? "bg.default" : "bg.accent.subtle"}
								onMouseEnter={() => setHoveredId(n.id)}
								onMouseLeave={() =>
									setHoveredId((cur) => (cur === n.id ? null : cur))
								}
								style={{ position: "relative" }}
							>
								<Box style={{ flexShrink: 0, marginTop: 2 }}>
									{intentIcon(n.intent)}
								</Box>
								<Box display="flex" flexDirection="column" gap="8" flex="1">
									<Text
										fontSize="md"
										fontWeight={n.read ? "500" : "600"}
										color="fg.default"
									>
										{n.title}
									</Text>
									<Text fontSize="sm" color="fg.secondary">
										{n.description}
									</Text>
									{n.action && (
										<Box>
											<Button
												appearance={n.read ? "default" : "primary"}
												size="sm"
												onClick={() => handleAction(n)}
											>
												{n.action.label}
											</Button>
										</Box>
									)}
									<Text fontSize="sm" color="fg.tertiary">
										{n.time}
									</Text>
								</Box>
								<Box
									style={{
										position: "absolute",
										top: 8,
										right: 8,
										opacity: hoveredId === n.id ? 1 : 0,
										transition: "opacity 120ms ease",
										pointerEvents: hoveredId === n.id ? "auto" : "none",
									}}
								>
									<Button
										appearance="subtle"
										size="sm"
										icon={<IconXmark size={16} />}
										aria-label={`Dismiss ${n.title}`}
										onClick={() => dismiss(n.id)}
									/>
								</Box>
							</Box>
						))
					)}
				</Box>

				<Box
					display="flex"
					justifyContent="space-between"
					gap="12"
					px="24"
					py="16"
					borderT="1"
					borderColor="border.tertiary"
					bg="bg.page"
				>
					<Button appearance="subtle">Mark all as read</Button>
					<Button appearance="default" onClick={onClose}>
						Close
					</Button>
				</Box>
			</Box>
		</>,
		document.body,
	);
}
