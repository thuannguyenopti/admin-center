"use client";

import React from "react";
import { getProperty } from "./utils";
import { getDisplayTemplateClasses } from "./displayTemplateRenderer";

export const TextBlock = React.memo(function TextBlock({ properties, hasBgImage }: { properties: any, hasBgImage?: boolean }) {
    const textValue = getProperty(properties, "text", "Text") || "";
    const variant = getProperty(properties, "variant", "Variant");
    const isStat = variant === "stat";

    // Special handling for Hero Badge
    if (textValue.includes("●")) {
        return (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-stride-lg border border-white/20 mb-6">
                <span className="text-green-400 text-xs">●</span>
                <span className="text-white text-xs font-stride-medium font-stride-sans uppercase tracking-wider">{textValue.replace("●", "").trim()}</span>
            </div>
        );
    }

    // Special handling for Stats (Hero or Footer)
    if (textValue.includes("|")) {
        const stats = textValue.split("|");
        return (
            <div className={`flex flex-wrap gap-8 md:gap-16 mt-12 ${!hasBgImage ? "justify-center" : ""}`}>
                {stats.map((stat: string, i: number) => {
                    const [val, ...labelParts] = stat.trim().split(" ");
                    return (
                        <div key={i} className="flex flex-col">
                            <span className="text-stride-3xl md:text-stride-4xl font-stride-bold font-stride-sans text-white">{val}</span>
                            <span className="text-xs text-white/60 font-stride-sans uppercase tracking-widest mt-1">{labelParts.join(" ")}</span>
                        </div>
                    );
                })}
            </div>
        );
    }

    // Special handling for CTA Row
    if (textValue.includes("[") && textValue.includes("]")) {
        const buttons = textValue.match(/\[(.*?)\]/g)?.map((b: string) => b.slice(1, -1)) || [];
        return (
            <div className="flex flex-wrap gap-4 mb-8">
                {buttons.map((btn: string, i: number) => (
                    <button key={i} className={`px-8 py-3 rounded-stride-lg font-stride-bold font-stride-sans text-stride-base transition-all ${i === 0 ? "bg-white text-stride-blue hover:bg-stride-light/90" : "border-2 border-white text-white hover:bg-white/10"}`}>
                        {btn}
                    </button>
                ))}
            </div>
        );
    }

    // Default paragraph - use display template system
    let styleClasses: string;
    let spacingAndLayoutClasses: string;

    if (isStat) {
        // Keep backward compatibility for stat variant
        styleClasses = "leading-relaxed mt-0 mb-0 text-white/80";
        spacingAndLayoutClasses = "";
    } else {
        // Get display template
        const displayTemplateKey = getProperty(properties, "displayTemplateKey", "Display Template") || "defaultText";
        const displaySettings = getProperty(properties, "displaySettings", "Display Settings") || [];

        // Use display template renderer for styling
        styleClasses = getDisplayTemplateClasses(
            displayTemplateKey,
            displaySettings,
            { hasBgImage }
        );
        // Spacing and layout are independent of template
        spacingAndLayoutClasses = hasBgImage ? "mb-8 max-w-2xl" : "mb-4 max-w-3xl";
    }

    return (
        <p className={`${styleClasses} ${spacingAndLayoutClasses}`}>
            {textValue || <>&nbsp;</>}
        </p>
    );
});
