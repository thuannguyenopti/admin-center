"use client";

import React, { useLayoutEffect, useMemo, useRef, useState } from "react";

type PreviewMode = "fixed" | "scale" | "responsive";

type Props = {
    mode?: PreviewMode;
    width?: number;           // design width for fixed/scale
    maxWidth?: number;        // clamp for responsive
    height?: number | "auto" | "fill";
    allowUpscale?: boolean;

    children?: React.ReactNode;
    contentRef?: React.Ref<HTMLDivElement>;
    className?: string;
    style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLDivElement>;

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
    return (value: T) => {
        refs.forEach((ref) => {
            if (!ref) return;
            if (typeof ref === "function") ref(value);
            else (ref as any).current = value;
        });
    };
}

export default function PreviewWrapper({
    mode = "responsive",
    width = 1100,
    maxWidth,
    height = "fill",
    allowUpscale = false,
    children,
    contentRef,
    className,
    style,
    ...rest
}: Props) {
    const viewportRef = useRef<HTMLDivElement | null>(null); // ✅ measure THIS (always 100%)
    const scrollRef = useRef<HTMLDivElement | null>(null);   // ✅ actual scroll container
    const innerRef = useRef<HTMLDivElement | null>(null);    // ✅ unscaled content height

    const [scale, setScale] = useState(1);
    const [scaledH, setScaledH] = useState<number | null>(null);

    const fill = height === "fill";

    // 1) compute scale from the viewport width (NOT the scaled content)
    useLayoutEffect(() => {
        if (mode !== "scale") {
            setScale(1);
            return;
        }

        const el = viewportRef.current;
        if (!el) return;

        const update = () => {
            const avail = el.clientWidth;       // ✅ true viewport width
            const raw = avail / width;
            setScale(allowUpscale ? raw : Math.min(1, raw));
        };

        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, [mode, width, allowUpscale]);

    // 2) make scroll height match scaled content (so scrolling stays correct)
    useLayoutEffect(() => {
        if (mode !== "scale") {
            setScaledH(null);
            return;
        }

        const el = innerRef.current;
        if (!el) return;

        const update = () => {
            const unscaled = el.scrollHeight;     // transform doesn't change this (good!)
            setScaledH(unscaled * scale);
        };

        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, [mode, scale]);

    const mergedScrollRef = useMemo(
        () => mergeRefs<HTMLDivElement>(scrollRef as any, contentRef as any),
        [contentRef]
    );

    // ✅ scroller is always the viewport width
    const scrollerStyle: React.CSSProperties = {
        width: "100%",
        height: fill ? "100%" : height === "auto" ? "auto" : `${height}px`,
        minHeight: 0,
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        ...style,
    };

    let body: React.ReactNode;

    if (mode === "scale") {
        const scaledW = width * scale;

        body = (
            <div
                style={{
                    width: `${scaledW}px`,
                    height: scaledH != null ? `${scaledH}px` : "auto",
                    margin: "0 auto",          // centered, but width == avail so no gutters
                    position: "relative",
                }}
            >
                <div
                    ref={innerRef}
                    style={{
                        width: `${width}px`,
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                        position: "absolute",
                        top: 0,
                        left: 0,
                    }}
                >
                    {children}
                </div>
            </div>
        );
    } else if (mode === "fixed") {
        body = (
            <div
                style={{
                    width: `${width}px`,
                    margin: "0 auto",
                    minHeight: fill ? "100%" : undefined,
                    display: fill ? "flex" : undefined,
                    flexDirection: fill ? "column" : undefined,
                }}
            >
                {children}
            </div>
        );
    } else {
        body = (
            <div
                style={{
                    width: "100%",
                    maxWidth: maxWidth ? `${maxWidth}px` : undefined,
                    margin: "0 auto",
                    minHeight: fill ? "100%" : undefined,
                    display: fill ? "flex" : undefined,
                    flexDirection: fill ? "column" : undefined,
                }}
            >
                {children}
            </div>
        );
    }

    return (
        <div
            ref={viewportRef}
            className={className}
            style={{ width: "100%", height: fill ? "100%" : undefined, minHeight: 0, minWidth: 0 }}
        >
            <div ref={mergedScrollRef} style={scrollerStyle} {...rest}>
                {body}
            </div>
        </div>
    );
}
