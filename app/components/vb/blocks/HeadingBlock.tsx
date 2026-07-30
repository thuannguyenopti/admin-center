<<<<<<< HEAD
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
=======
"use client";

import React from "react";
import {getProperty} from "./utils";

const HEADING_CLASSES: Record<string, string> = {
	h1Heading: "text-5xl md:text-6xl font-stride-bold tracking-tight leading-none",
	h2Heading: "text-3xl md:text-4xl font-stride-bold tracking-tight leading-tight",
	h3Heading: "text-2xl font-stride-semibold tracking-tight leading-snug",
	h4Heading: "text-xl font-stride-semibold tracking-tight leading-snug",
};

export const HeadingBlock = React.memo(function HeadingBlock({
	properties,
	hasBgImage,
}: {
	properties: any;
	hasBgImage?: boolean;
}) {
	const text = getProperty(properties, "text", "Text");
	const accent = getProperty(properties, "accent", "Accent Text") || "";

	const levelValue = getProperty(properties, "level", "h2");
	const validLevels = ["h1", "h2", "h3", "h4", "h5", "h6"];
	const level = validLevels.includes(levelValue) ? levelValue : "h2";

	const displayTemplateKey =
		getProperty(properties, "displayTemplateKey", "Display Template") || "h1Heading";

	const sizeClasses = HEADING_CLASSES[displayTemplateKey] ?? HEADING_CLASSES.h1Heading;
	const colorClass = hasBgImage ? "text-white" : "text-stride-dark";
	const finalClassName = `font-stride-sans ${sizeClasses} ${colorClass} mb-4`;

	const Tag = level as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

	if (accent) {
		return (
			<div className="relative w-full" style={{marginBottom: "32px"}}>
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
				<Tag className={finalClassName}>{text || <>&nbsp;</>}</Tag>
			</div>
		);
	}

	return <Tag className={finalClassName}>{text || <>&nbsp;</>}</Tag>;
});
>>>>>>> origin/main
