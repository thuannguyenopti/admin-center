<<<<<<< HEAD
"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { Box, Text, Button } from "@optiaxiom/react";
import { toaster } from "@optiaxiom/react";
import { IconX, IconAlertCircle, IconCircleCheck, IconAlertTriangle, IconBell, IconPlug, IconUsers, IconSpeakerphone } from "@tabler/icons-react";
import { IconAgent } from "@optimizely/axiom-icons";
import { useRouter, usePathname } from "next/navigation";
import type { Notification } from "@/app/opal/notifications/mockData";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Toast {
    id: string;
    notification: Notification;
    visible: boolean;
}

interface ToastContextValue {
    showToast: (notification: Notification) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useNotificationToast() {
    const ctx = useContext(ToastContext);
    if (!ctx)
        throw new Error(
            "useNotificationToast must be used within NotificationToastProvider"
        );
    return ctx;
}

// ── Toast Item ────────────────────────────────────────────────────────────────

function getToastIcon(n: Notification) {
    if (n.executionStatus === "failed" || n.guardrailStatus === "terminated")
        return <IconAlertCircle size={18} color="var(--ax-colors-fg-error)" />;
    if (n.guardrailStatus === "warning" || n.guardrailStatus === "triggered")
        return <IconAlertTriangle size={18} color="var(--ax-colors-fg-warning)" />;
    if (n.category === "directory")
        return <IconAgent size={18} color="var(--ax-colors-fg-information)" />;
    if (n.category === "tools")
        return <IconPlug size={18} color="var(--ax-colors-fg-tertiary)" />;
    if (n.category === "collaboration")
        return <IconUsers size={18} color="var(--ax-colors-fg-accent)" />;
    if (n.category === "system")
        return <IconSpeakerphone size={18} color="var(--ax-colors-fg-tertiary)" />;
    if (n.executionStatus === "success")
        return <IconCircleCheck size={18} color="var(--ax-colors-fg-success)" />;
    return <IconBell size={18} color="var(--ax-colors-fg-tertiary)" />;
}

function shouldShowToast(notification: Notification, currentPath: string): boolean {
    if (
        notification.type === "agent_execution_chat" &&
        currentPath.includes("/opal/chat")
    ) {
        return false;
    }
    if (
        notification.executionId &&
        currentPath.includes(notification.executionId)
    ) {
        return false;
    }
    if (currentPath.includes("/opal/notifications")) {
        return false;
    }
    return true;
}

function ToastItem({
    toast,
    onDismiss,
}: {
    toast: Toast;
    onDismiss: (id: string) => void;
}) {
    const router = useRouter();


    return (
        <Box
            p="16"
            bg="bg.default"
            border="1"
            borderColor="border.tertiary"
            rounded="md"
            shadow="lg"
            display="flex"
            gap="12"
            alignItems="start"
            className={`cursor-pointer transition-all duration-300 ${toast.visible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
                }`}
            style={{ width: 400 }}
            onClick={() => {
                onDismiss(toast.id);
                router.push(toast.notification.deepLink);
            }}
        >
            <Box pt="2" style={{ flexShrink: 0 }}>
                {getToastIcon(toast.notification)}
            </Box>
            <Box flex="1" style={{ minWidth: 0 }}>
                <Box className="line-clamp-1" fontWeight="600" fontSize="sm">
                    {toast.notification.title}
                </Box>
                <Box className="line-clamp-2" fontSize="sm" color="fg.secondary" mt="2">
                    {toast.notification.message}
                </Box>
            </Box>
            <Button
                appearance="subtle"
                size="sm"
                icon={<IconX size={14} />}
                aria-label="Dismiss"
                onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(toast.id);
                }}
            />
        </Box>
    );
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function NotificationToastProvider({
    children,
}: {
    children: ReactNode;
}) {
    const pathname = usePathname();

    const showToast = useCallback(
        (notification: Notification) => {
            if (!shouldShowToast(notification, pathname)) return;

            let intent: "success" | "danger" | "warning" | "information" | "neutral" = "neutral";

            if (notification.executionStatus === "failed" || notification.guardrailStatus === "terminated") {
                intent = "danger";
            } else if (notification.guardrailStatus === "warning" || notification.guardrailStatus === "triggered") {
                intent = "warning";
            } else if (notification.category === "directory" || notification.category === "system") {
                intent = "information";
            } else if (notification.executionStatus === "success") {
                intent = "success";
            }

            toaster.create(notification.title, {
                intent,
                action: notification.actionRequired ? "Take Action" : "View Details",
                onAction: () => {
                    window.location.href = notification.deepLink;
                }
            });
        },
        [pathname]
    );

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
        </ToastContext.Provider>
    );
}
=======
"use client";

import {createContext, useContext, useState, useCallback, useEffect, type ReactNode} from "react";
import {Box, Text, Button} from "@optiaxiom/react";
import {toaster} from "@optiaxiom/react";
import {
	IconXmark,
	IconCircleExclamation,
	IconCircleCheck,
	IconTriangleExclamation,
	IconBell,
	IconPlug,
	IconUsers,
	IconMegaphone,
} from "@/app/lib/axiom-icons";
import {IconAgent} from "@optimizely/axiom-icons";
import {useRouter, usePathname} from "next/navigation";
import type {Notification} from "@/app/opal/notifications/mockData";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Toast {
	id: string;
	notification: Notification;
	visible: boolean;
}

interface ToastContextValue {
	showToast: (notification: Notification) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useNotificationToast() {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error("useNotificationToast must be used within NotificationToastProvider");
	return ctx;
}

// ── Toast Item ────────────────────────────────────────────────────────────────

function getToastIcon(n: Notification) {
	if (n.executionStatus === "failed" || n.guardrailStatus === "terminated")
		return <IconCircleExclamation size={18} color="var(--ax-colors-fg-error)" />;
	if (n.guardrailStatus === "warning" || n.guardrailStatus === "triggered")
		return <IconTriangleExclamation size={18} color="var(--ax-colors-fg-warning)" />;
	if (n.category === "directory")
		return <IconAgent size={18} color="var(--ax-colors-fg-information)" />;
	if (n.category === "tools") return <IconPlug size={18} color="var(--ax-colors-fg-tertiary)" />;
	if (n.category === "collaboration")
		return <IconUsers size={18} color="var(--ax-colors-fg-information)" />;
	if (n.category === "system")
		return <IconMegaphone size={18} color="var(--ax-colors-fg-tertiary)" />;
	if (n.executionStatus === "success")
		return <IconCircleCheck size={18} color="var(--ax-colors-fg-success)" />;
	return <IconBell size={18} color="var(--ax-colors-fg-tertiary)" />;
}

function shouldShowToast(notification: Notification, currentPath: string): boolean {
	if (notification.type === "agent_execution_chat" && currentPath.includes("/opal/chat")) {
		return false;
	}
	if (notification.executionId && currentPath.includes(notification.executionId)) {
		return false;
	}
	if (currentPath.includes("/opal/notifications")) {
		return false;
	}
	return true;
}

function ToastItem({toast, onDismiss}: {toast: Toast; onDismiss: (id: string) => void}) {
	const router = useRouter();

	return (
		<Box
			p="16"
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			rounded="md"
			shadow="lg"
			display="flex"
			gap="12"
			alignItems="start"
			className={`cursor-pointer transition-all duration-300 ${
				toast.visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
			}`}
			style={{width: 400}}
			onClick={() => {
				onDismiss(toast.id);
				router.push(toast.notification.deepLink);
			}}
		>
			<Box pt="2" style={{flexShrink: 0}}>
				{getToastIcon(toast.notification)}
			</Box>
			<Box flex="1" style={{minWidth: 0}}>
				<Box className="line-clamp-1" fontWeight="600" fontSize="sm">
					{toast.notification.title}
				</Box>
				<Box className="line-clamp-2" fontSize="sm" color="fg.secondary" mt="2">
					{toast.notification.message}
				</Box>
			</Box>
			<Button
				appearance="subtle"
				size="sm"
				icon={<IconXmark size={14} />}
				aria-label="Dismiss"
				onClick={(e) => {
					e.stopPropagation();
					onDismiss(toast.id);
				}}
			/>
		</Box>
	);
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function NotificationToastProvider({children}: {children: ReactNode}) {
	const pathname = usePathname();

	const showToast = useCallback(
		(notification: Notification) => {
			if (!shouldShowToast(notification, pathname)) return;

			let intent: "success" | "danger" | "warning" | "information" | "neutral" = "neutral";

			if (
				notification.executionStatus === "failed" ||
				notification.guardrailStatus === "terminated"
			) {
				intent = "danger";
			} else if (
				notification.guardrailStatus === "warning" ||
				notification.guardrailStatus === "triggered"
			) {
				intent = "warning";
			} else if (
				notification.category === "directory" ||
				notification.category === "system"
			) {
				intent = "information";
			} else if (notification.executionStatus === "success") {
				intent = "success";
			}

			toaster.create(notification.title, {
				intent,
				action: notification.actionRequired ? "Take Action" : "View Details",
				onAction: () => {
					window.location.href = notification.deepLink;
				},
			});
		},
		[pathname]
	);

	return <ToastContext.Provider value={{showToast}}>{children}</ToastContext.Provider>;
}
>>>>>>> origin/main
