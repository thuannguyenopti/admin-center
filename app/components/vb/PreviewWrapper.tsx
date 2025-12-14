"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
    width?: number | "responsive";
    maxWidth?: number;
    height?: number | "auto" | "fill";
    scaleToFit?: boolean;
    forceScrollbar?: boolean;
    children?: React.ReactNode;
    contentRef?: React.Ref<HTMLDivElement>;
    className?: string;
    style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLDivElement>;

export default function PreviewWrapper({
    width = "responsive",
    maxWidth = 1100,
    height = "fill",
    scaleToFit = false,
    forceScrollbar = false,
    children,
    contentRef,
    className,
    style,
    ...rest
}: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [scale, setScale] = useState(1);

    const fill = height === "fill";
    const designWidth = typeof width === "number" ? width : maxWidth;

    useEffect(() => {
        if (!scaleToFit || typeof width !== "number") return;

        const el = containerRef.current;
        if (!el) return;

        const ro = new ResizeObserver(() => {
            const avail = el.getBoundingClientRect().width;
            const next = Math.min(1, avail / designWidth);
            setScale(next);
        });

        ro.observe(el);
        return () => ro.disconnect();
    }, [scaleToFit, width, designWidth]);

    const isResponsive = width === "responsive";

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                height: fill ? "100%" : undefined,   // ✅ crucial
                minHeight: 0,                        // ✅ crucial
            }}
        >
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: fill ? "100%" : undefined, // ✅ crucial
                    minHeight: 0,                      // ✅ crucial
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <div
                    style={
                        isResponsive
                            ? {
                                width: "100%",
                                maxWidth: `${maxWidth}px`,
                                height: fill ? "100%" : undefined, // ✅ crucial
                                minHeight: 0,                      // ✅ crucial
                            }
                            : {
                                width: `${designWidth}px`,
                                height: fill ? "100%" : undefined, // ✅ crucial
                                minHeight: 0,                      // ✅ crucial
                                transform: scaleToFit ? `scale(${scale})` : undefined,
                                transformOrigin: scaleToFit ? "top left" : undefined,
                            }
                    }
                >
                    <div
                        ref={contentRef}
                        style={{
                            width: "100%",
                            height:
                                height === "fill"
                                    ? "100%"
                                    : height === "auto"
                                        ? "auto"
                                        : `${height}px`,
                            minHeight: 0, // ✅ crucial for nested flex/grid
                            overflowY: forceScrollbar ? "scroll" : "auto",
                            overflowX: "hidden",
                            WebkitOverflowScrolling: "touch",
                            ...style,
                        }}
                        {...rest}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
