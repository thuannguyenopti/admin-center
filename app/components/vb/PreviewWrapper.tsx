"use client";

import React, { useEffect, useRef, useState } from "react";

type PreviewMode = "fixed" | "scale" | "responsive";

type Props = {
    mode?: PreviewMode;

    // "design" width used for fixed/scale modes
    width?: number;

    // responsive mode width: fill container, but clamp if you want
    maxWidth?: number; // optional clamp for responsive

    height?: number | "auto" | "fill";
    allowUpscale?: boolean;

    children?: React.ReactNode;
    contentRef?: React.Ref<HTMLDivElement>;
    className?: string;
    style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLDivElement>;

export default function PreviewWrapper({
    mode = "responsive",
    width = 1100,
    maxWidth, // only used in responsive mode
    height = "fill",
    allowUpscale = false,
    children,
    contentRef,
    className,
    style,
    ...rest
}: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [scale, setScale] = useState(1);

    const fill = height === "fill";

    useEffect(() => {
        if (mode !== "scale") {
            setScale(1);
            return;
        }

        const el = containerRef.current;
        if (!el) return;

        const ro = new ResizeObserver(() => {
            const avail = el.clientWidth;
            const raw = avail / width;
            const next = allowUpscale ? raw : Math.min(1, raw);
            setScale(next);
        });

        ro.observe(el);
        return () => ro.disconnect();
    }, [mode, width, allowUpscale]);

    // scroll container width
    const scrollWidth =
        mode === "responsive"
            ? "100%"
            : mode === "scale"
                ? `${Math.max(1, Math.floor(width * scale))}px`
                : `${width}px`;

    // what we actually render inside the scroller
    const inner =
        mode === "scale" ? (
            <div style={{ width: `${width}px`, transform: `scale(${scale})`, transformOrigin: "top left" }}>
                {children}
            </div>
        ) : mode === "fixed" ? (
            <div style={{ width: `${width}px` }}>{children}</div>
        ) : (
            // responsive = let content reflow to available width
            <div style={{ width: "100%", maxWidth: maxWidth ? `${maxWidth}px` : undefined, margin: "0 auto" }}>
                {children}
            </div>
        );

    return (
        <div
            ref={containerRef}
            className={className}
            style={{ width: "100%", height: fill ? "100%" : undefined, minHeight: 0, display: "flex", justifyContent: "center" }}
        >
            {/* ✅ scroll container */}
            <div
                ref={contentRef as any}
                style={{
                    width: scrollWidth,
                    height: height === "fill" ? "100%" : height === "auto" ? "auto" : `${height}px`,
                    minHeight: 0,
                    overflowY: "auto",
                    overflowX: "hidden",
                    WebkitOverflowScrolling: "touch",
                    ...(mode === "responsive" && maxWidth ? { maxWidth: `${maxWidth}px` } : null),
                    ...style,
                }}
                {...rest}
            >
                {inner}
            </div>
        </div>
    );
}
