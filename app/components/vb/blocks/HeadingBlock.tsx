"use client";

import React from "react";
import { getProperty } from "./utils";
import { getDisplayTemplateClasses } from "./displayTemplateRenderer";

export const HeadingBlock = React.memo(function HeadingBlock({ properties, hasBgImage }: { properties: any, hasBgImage?: boolean }) {

    const text = getProperty(properties, "text", "Text");
    const variant = getProperty(properties, "variant", "Variant");
    const accent = getProperty(properties, "accent", "Accent Text") || "";
    const isStat = variant === "stat";

    // Get and validate heading level
    const levelValue = getProperty(properties, "level", "h2");
    const validLevels = ["h1", "h2", "h3", "h4", "h5", "h6"];
    const level = validLevels.includes(levelValue) ? levelValue : "h2";

    // Get display template
    const displayTemplateKey = getProperty(properties, "displayTemplateKey", "Display Template") || "defaultHeading";
    const displaySettings = getProperty(properties, "displaySettings", "Display Settings") || [];

    // Map template to Stride CSS classes using display template system
    let styleClasses: string;
    if (isStat) {
        // Keep backward compatibility for stat variant
        const sizeClass = hasBgImage ? "text-4xl" : "text-3xl";
        styleClasses = `font-bold leading-tight ${sizeClass}`;
    } else {
        // Use display template renderer
        styleClasses = getDisplayTemplateClasses(
            displayTemplateKey,
            displaySettings,
            { hasBgImage }
        );
    }

    // Spacing
    const spacingClass = isStat ? "" : "mb-4";

    // Render the correct semantic heading tag based on level property
    const Tag = level as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    const finalClassName = `${styleClasses} ${spacingClass}`;

    // If accent text is provided, wrap in a container with absolutely positioned accent
    if (accent) {
        return (
            <div className="relative w-full" style={{ marginBottom: "32px" }}>
                {/* Rotated Accent Text - absolutely positioned to the left, aligned with heading top */}
                <div
                    style={{
                        position: "absolute",
                        left: "-8px",
                        top: "10px",
                        transform: "rotate(90deg)",
                        transformOrigin: "left top",
                        whiteSpace: "nowrap",
                        fontFamily: "'Space Mono', monospace",
                        fontWeight: "700",
                        fontSize: "12px",
                        letterSpacing: "0.6px",
                        textTransform: "uppercase",
                        color: hasBgImage ? "rgba(255, 255, 255, 0.9)" : "#0980F6",
                        lineHeight: "1",
                    }}
                >
                    {accent}
                </div>

                {/* Main Heading */}
                <Tag className={finalClassName}>
                    {text || <>&nbsp;</>}
                </Tag>
            </div>
        );
    }

    // Standard heading without accent
    return (
        <Tag className={finalClassName}>
            {text || <>&nbsp;</>}
        </Tag>
    );
});
