"use client";

import { useEffect, useRef } from "react";

interface SelectionTooltipProps {
    x: number;
    y: number;
    onAskOpal: () => void;
    onClose: () => void;
}

export function SelectionTooltip({ x, y, onAskOpal, onClose }: SelectionTooltipProps) {
    const tooltipRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handlePointerDown = (e: PointerEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, [onClose]);

    return (
        <div
            ref={tooltipRef}
            style={{
                position: "fixed",
                top: y - 48,
                left: x,
                transform: "translateX(-50%)",
                zIndex: 2000,
                background: "var(--ax-colors-bg-default-inverse)",
                color: "var(--ax-colors-fg-default-inverse)",
                borderRadius: "var(--ax-borderRadius-md)",
                padding: "8px 12px",
                fontSize: "14px",
                fontWeight: 500,
                lineHeight: 1,
                boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                whiteSpace: "nowrap",
                cursor: "pointer",
                userSelect: "none",
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onAskOpal}
        >
            Ask Opal
            {/* Caret pointing down toward selection */}
            <div style={{
                position: "absolute",
                bottom: -5,
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "5px solid var(--ax-colors-bg-default-inverse)",
            }} />
        </div>
    );
}
