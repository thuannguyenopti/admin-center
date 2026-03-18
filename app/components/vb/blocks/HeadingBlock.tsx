"use client";

import React from "react";
import { getProperty } from "./utils";
import { getTemplateClasses } from "./templateUtils";

export const HeadingBlock = React.memo(function HeadingBlock({ properties, hasBgImage }: { properties: any, hasBgImage?: boolean }) {
    const text = getProperty(properties, "text", "Text");
    const variant = getProperty(properties, "variant", "Variant");
    const isStat = variant === "stat";

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

    return (
        <h1 className={`${styleClasses} ${spacingClass}`}>
            {text || <>&nbsp;</>}
        </h1>
    );
});
