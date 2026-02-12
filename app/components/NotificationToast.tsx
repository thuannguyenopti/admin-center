"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { Box, Text, Button } from "@optiaxiom/react";
import { IconX, IconAlertCircle, IconCircleCheck, IconAlertTriangle, IconBell, IconPackage, IconPlug, IconUsers, IconSpeakerphone } from "@tabler/icons-react";
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
        return <IconPackage size={18} color="var(--ax-colors-fg-information)" />;
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
    const [toasts, setToasts] = useState<Toast[]>([]);
    const pathname = usePathname();

    const dismiss = useCallback((id: string) => {
        setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
        );
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 300);
    }, []);

    const showToast = useCallback(
        (notification: Notification) => {
            if (!shouldShowToast(notification, pathname)) return;

            const id = `toast-${Date.now()}-${Math.random()}`;
            const toast: Toast = { id, notification, visible: false };

            setToasts((prev) => [...prev.slice(-4), toast]);

            // Animate in
            requestAnimationFrame(() => {
                setToasts((prev) =>
                    prev.map((t) => (t.id === id ? { ...t, visible: true } : t))
                );
            });

            // Auto-dismiss after 5s
            setTimeout(() => dismiss(id), 5000);
        },
        [pathname, dismiss]
    );

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <Box
                className="fixed z-50"
                style={{ top: 16, right: 16 }}
                display="flex"
                flexDirection="column"
                gap="8"
            >
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
                ))}
            </Box>
        </ToastContext.Provider>
    );
}
