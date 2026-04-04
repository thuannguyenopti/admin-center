"use client";

import { useState, useEffect, useRef } from "react";
import { Box, Text, Button, Textarea } from "@optiaxiom/react";
import { IconXmark } from "@optimizely/axiom-icons";
import Image from "next/image";

interface EnhancePopoverProps {
    anchorEl: HTMLElement | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (query: string) => void;
}

export function EnhancePopover({ anchorEl, isOpen, onClose, onSubmit }: EnhancePopoverProps) {
    const [query, setQuery] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const popoverRef = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    // Position below the anchor button
    useEffect(() => {
        if (!isOpen || !anchorEl) return;
        const rect = anchorEl.getBoundingClientRect();
        setPosition({
            top: rect.bottom + 8,
            left: rect.right - 300, // right-align with button, 300px wide
        });
        setTimeout(() => textareaRef.current?.focus(), 50);
    }, [isOpen, anchorEl]);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handlePointerDown = (e: PointerEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(e.target as Node) &&
                !anchorEl?.contains(e.target as Node)
            ) {
                onClose();
            }
        };
        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, [isOpen, anchorEl, onClose]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSend = () => {
        const trimmed = query.trim();
        if (!trimmed) return;
        onSubmit(trimmed);
        setQuery("");
        onClose();
    };

    return (
        <div
            ref={popoverRef}
            style={{
                position: "fixed",
                top: position.top,
                left: Math.max(8, position.left),
                width: 300,
                zIndex: 1000,
                borderRadius: 12,
                background: "radial-gradient(circle at 10% 20%, rgba(245,243,255,1) 0%, rgba(229,239,255,1) 61%, rgba(221,214,254,1) 85%)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
                border: "1px solid rgba(99,102,241,0.15)",
            }}
        >
            <Box
                display="flex"
                flexDirection="column"
                gap="8"
                style={{ padding: "12px 18px 14px" }}
            >
                {/* Header */}
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap="8">
                        <Image src="/opal-orb.png" alt="Opal" width={18} height={18} />
                        <Text fontWeight="600" fontSize="md" style={{ color: "#080736" }}>
                            Ask Opal to help you build
                        </Text>
                    </Box>
                    <Button
                        appearance="subtle"
                        size="sm"
                        icon={<IconXmark size={14} />}
                        aria-label="Close"
                        onClick={onClose}
                    />
                </Box>

                {/* Textarea */}
                <Textarea
                    ref={textareaRef}
                    resize="none"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Describe the agent you want to build, what it should do, or where you're stuck..."
                    style={{ minHeight: 88 }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
                    }}
                />

                {/* Footer */}
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Text fontSize="sm" color="fg.tertiary">
                        ⌘↵ to send
                    </Text>
                    <Button
                        appearance="primary"
                        size="sm"
                        disabled={!query.trim()}
                        onClick={handleSend}
                    >
                        Send
                    </Button>
                </Box>
            </Box>
        </div>
    );
}
