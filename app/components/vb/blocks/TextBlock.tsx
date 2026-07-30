<<<<<<< HEAD
"use client";

import React from "react";
import { getProperty } from "./utils";
import { getTemplateClasses } from "./templateUtils";

export const TextBlock = React.memo(function TextBlock({ properties, hasBgImage }: { properties: any, hasBgImage?: boolean }) {
    const textValue = getProperty(properties, "text", "Text") || "";
    const variant = getProperty(properties, "variant", "Variant");
    const isStat = variant === "stat";

    // Special handling for Hero Badge
    if (textValue.includes("●")) {
        return (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-[10px] border border-white/20 mb-6">
                <span className="text-green-400 text-xs">●</span>
                <span className="text-white text-xs font-medium uppercase tracking-wider">{textValue.replace("●", "").trim()}</span>
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
                            <span className="text-3xl md:text-4xl font-bold text-white">{val}</span>
                            <span className="text-xs text-white/60 uppercase tracking-widest mt-1">{labelParts.join(" ")}</span>
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
                    <button key={i} className={`px-8 py-3 rounded-[10px] font-bold transition-all ${i === 0 ? "bg-white text-[#194BFF] hover:bg-gray-100" : "border-2 border-white text-white hover:bg-white/10"}`}>
                        {btn}
                    </button>
                ))}
            </div>
        );
    }

    // Default paragraph - use template system
    let styleClasses: string;
    let spacingAndLayoutClasses: string;

    if (isStat) {
        // Keep backward compatibility for stat variant
        styleClasses = "leading-relaxed mt-0 mb-0 text-white/80";
        spacingAndLayoutClasses = "";
    } else {
        // Use template system for styling
        styleClasses = getTemplateClasses("ct-text", properties, { hasBgImage });
        // Spacing and layout are independent of template
        spacingAndLayoutClasses = hasBgImage ? "mb-8 max-w-2xl" : "mb-4 text-center max-w-3xl mx-auto";
    }

    return (
        <p className={`${styleClasses} ${spacingAndLayoutClasses}`}>
            {textValue || <>&nbsp;</>}
        </p>
    );
});
=======
"use client";

import React from "react";
import {getProperty} from "./utils";

type StyleCtx = {hasBgImage?: boolean};
type VariantFn = (s: Record<string, string>, ctx: StyleCtx) => string;

const TEXT_VARIANTS: Record<string, VariantFn> = {
	defaultText: (s, {hasBgImage}) => {
		const size =
			s.size === "small"
				? "text-sm"
				: s.size === "large"
					? "text-stride-lg md:text-stride-xl"
					: "text-lg";
		const weight =
			s.emphasis === "subtle"
				? "font-stride-normal"
				: s.emphasis === "bold"
					? "font-stride-semibold"
					: "font-stride-medium";
		const color = hasBgImage ? "text-white/90" : "text-stride-dark/70";
		return `font-stride-sans leading-relaxed ${size} ${weight} ${color}`;
	},
	prominentText: (s, {hasBgImage}) => {
		const weight = s.emphasis === "bold" ? "font-stride-semibold" : "font-stride-medium";
		const color = hasBgImage ? "text-white" : "text-stride-dark";
		return `font-stride-sans leading-relaxed text-xl ${weight} ${color}`;
	},
	subtleText: (s, {hasBgImage}) => {
		const weight = s.emphasis === "normal" ? "font-stride-medium" : "font-stride-normal";
		const color = hasBgImage ? "text-white/70" : "text-stride-dark/60";
		return `font-stride-sans leading-relaxed text-sm ${weight} ${color}`;
	},
	accentText: () =>
		"text-xs uppercase font-stride-semibold tracking-wider font-stride-sans text-[#0980F6]",
};

export const TextBlock = React.memo(function TextBlock({
	properties,
	hasBgImage,
}: {
	properties: any;
	hasBgImage?: boolean;
}) {
	const textValue = getProperty(properties, "text", "Text") || "";
	const variant = getProperty(properties, "variant", "Variant");
	const isStat = variant === "stat";

	if (textValue.includes("●")) {
		return (
			<div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-stride-lg border border-white/20 mb-6">
				<span className="text-green-400 text-xs">●</span>
				<span className="text-white text-xs font-stride-medium font-stride-sans uppercase tracking-wider">
					{textValue.replace("●", "").trim()}
				</span>
			</div>
		);
	}

	if (textValue.includes("|")) {
		const stats = textValue.split("|");
		return (
			<div className={`flex flex-wrap gap-8 md:gap-16 mt-12 ${!hasBgImage ? "justify-center" : ""}`}>
				{stats.map((stat: string, i: number) => {
					const [val, ...labelParts] = stat.trim().split(" ");
					return (
						<div key={i} className="flex flex-col">
							<span className="text-stride-3xl md:text-stride-4xl font-stride-bold font-stride-sans text-white">
								{val}
							</span>
							<span className="text-xs text-white/60 font-stride-sans uppercase tracking-widest mt-1">
								{labelParts.join(" ")}
							</span>
						</div>
					);
				})}
			</div>
		);
	}

	if (textValue.includes("[") && textValue.includes("]")) {
		const buttons = textValue.match(/\[(.*?)\]/g)?.map((b: string) => b.slice(1, -1)) || [];
		return (
			<div className="flex flex-wrap gap-4 mb-8">
				{buttons.map((btn: string, i: number) => (
					<button
						key={i}
						type="button"
						className={`px-8 py-3 rounded-stride-lg font-stride-bold font-stride-sans text-stride-base transition-all ${
							i === 0
								? "bg-white text-stride-blue hover:bg-stride-light/90"
								: "border-2 border-white text-white hover:bg-white/10"
						}`}
					>
						{btn}
					</button>
				))}
			</div>
		);
	}

	let styleClasses: string;
	let spacingClasses: string;

	if (isStat) {
		styleClasses = "leading-relaxed mt-0 mb-0 text-white/80";
		spacingClasses = "";
	} else {
		const displayTemplateKey =
			getProperty(properties, "displayTemplateKey", "Display Template") || "defaultText";
		const displaySettings: Array<{key: string; value: string}> =
			getProperty(properties, "displaySettings", "Display Settings") || [];
		const settingsMap = Object.fromEntries(displaySettings.map((s) => [s.key, s.value]));

		const variantFn = TEXT_VARIANTS[displayTemplateKey] ?? TEXT_VARIANTS.defaultText;
		styleClasses = variantFn(settingsMap, {hasBgImage});
		spacingClasses = hasBgImage ? "mb-8 max-w-2xl" : "mb-4 max-w-3xl";
	}

	return <p className={`${styleClasses} ${spacingClasses}`}>{textValue || <>&nbsp;</>}</p>;
});
>>>>>>> origin/main
