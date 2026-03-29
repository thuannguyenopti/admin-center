"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Box, Button, Text } from "@optiaxiom/react";
import { DetailsPanel, DetailsPanelBody, DetailsPanelHeader, DetailsPanelFooter } from "@optiaxiom/react/unstable";
import { IconX } from "@tabler/icons-react";

type ResizableDetailsTrayProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    headerAfter?: ReactNode;
    defaultWidth?: number;
    minWidth?: number;
    maxWidth?: number;
    insetPadding?: string;
    bodyPadding?: "0" | "2" | "4" | "6" | "8" | "10" | "12" | "16" | "20" | "24" | "32" | "40" | "48" | "64" | "80";
    bodyOverflowY?: "auto" | "hidden";
};

export function ResizableDetailsTray({
    isOpen,
    onClose,
    title,
    children,
    footer,
    headerAfter,
    defaultWidth = 400,
    minWidth = 320,
    maxWidth = 640,
    insetPadding = "12px 12px 12px 0",
    bodyPadding = "16",
    bodyOverflowY = "auto",
}: ResizableDetailsTrayProps) {
    const [panelWidth, setPanelWidth] = useState(defaultWidth);
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        setPanelWidth(defaultWidth);
    }, [defaultWidth]);

    const handleResizeStart = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        const startX = event.clientX;
        const startWidth = panelWidth;
        setIsResizing(true);
        document.body.style.userSelect = "none";
        document.body.style.cursor = "col-resize";

        const handlePointerMove = (moveEvent: PointerEvent) => {
            const nextWidth = Math.min(
                maxWidth,
                Math.max(minWidth, startWidth - (moveEvent.clientX - startX))
            );
            setPanelWidth(nextWidth);
        };

        const handlePointerUp = () => {
            setIsResizing(false);
            document.body.style.userSelect = "";
            document.body.style.cursor = "";
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
    }, [maxWidth, minWidth, panelWidth]);

    return (
        <Box
            style={{
                width: isOpen ? `${panelWidth + 24}px` : "0px",
                height: isOpen ? "calc(100vh - 57px)" : "0px",
                transition: isResizing ? "none" : "width 0.3s ease-in-out",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                flexShrink: 0,
                padding: isOpen ? insetPadding : "0",
                minHeight: 0,
                position: "relative",
            }}
        >
            {isOpen && (
                <>
                    <Box
                        role="separator"
                        aria-orientation="vertical"
                        aria-label={`Resize ${title}`}
                        onPointerDown={handleResizeStart}
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: 0,
                            transform: "translate(-50%, -50%)",
                            width: "14px",
                            height: "56px",
                            borderRadius: "8px",
                            border: "1px solid var(--ax-colors-border-secondary)",
                            background: "var(--ax-colors-bg-default)",
                            cursor: "col-resize",
                            zIndex: 2,
                        }}
                    />
                    <DetailsPanel w="full" h="full" style={{ height: "100%" }}>
                        <DetailsPanelHeader
                            addonAfter={
                                <Box display="flex" alignItems="center" gap="8">
                                    {headerAfter}
                                    <Button
                                        appearance="subtle"
                                        size="sm"
                                        icon={<IconX size={16} />}
                                        aria-label={`Close ${title}`}
                                        onClick={onClose}
                                    />
                                </Box>
                            }
                        >
                            <Text fontWeight="600" fontSize="md">
                                {title}
                            </Text>
                        </DetailsPanelHeader>
                        <DetailsPanelBody p={bodyPadding} overflowY={bodyOverflowY}>
                            {children}
                        </DetailsPanelBody>
                        {footer ? <DetailsPanelFooter>{footer}</DetailsPanelFooter> : null}
                    </DetailsPanel>
                </>
            )}
        </Box>
    );
}
