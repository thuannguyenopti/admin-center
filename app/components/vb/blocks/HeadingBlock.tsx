"use client";

import React from "react";
import { getProperty } from "./utils";
import { getTemplateClasses } from "./templateUtils";

export const HeadingBlock = React.memo(function HeadingBlock({ properties, hasBgImage }: { properties: any, hasBgImage?: boolean }) {
    const text = getProperty(properties, "text", "Text");
    const variant = getProperty(properties, "variant", "Variant");
    const isStat = variant === "stat";

    // Get and validate heading level
    const levelValue = getProperty(properties, "level", "h2");
    const validLevels = ["h1", "h2", "h3", "h4", "h5", "h6"];
    const level = validLevels.includes(levelValue) ? levelValue : "h2";

    // Spacing is independent of template
    const spacingClass = isStat ? "mt-0 mb-0" : hasBgImage ? "mb-6" : "mb-4 text-center";

    // Use template system for styling (unless it's a stat variant, which has special styling)
    let styleClasses: string;
    if (isStat) {
        // Keep backward compatibility for stat variant
        const sizeClass = hasBgImage ? "text-4xl" : "text-3xl";
        styleClasses = `font-bold leading-tight ${sizeClass}`;
    } else {
        // Use template system
        styleClasses = getTemplateClasses("ct-heading", properties, { hasBgImage });
    }

    // Render the correct semantic heading tag based on level property
    const Tag = level as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

    return (
        <Tag className={`${styleClasses} ${spacingClass}`}>
            {text || <>&nbsp;</>}
        </Tag>
    );
});
