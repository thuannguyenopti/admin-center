"use client";
import NotificationCatalog from "../opal/notification-catalog/NotificationCatalog";

/**
 * Bare export route — no app shell, no Template wrapper, no scrollable container.
 * Used for full-page Figma capture of the notification catalog.
 * Route: /notification-export
 */
export default function NotificationExportPage() {
    return <NotificationCatalog />;
}
