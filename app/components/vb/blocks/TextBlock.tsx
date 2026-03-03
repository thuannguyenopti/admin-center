"use client";

import React from "react";
import { getProperty } from "./utils";

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

    return (
        <p className={`leading-relaxed ${isStat ? "mt-0 mb-0 text-white/80" : hasBgImage ? "text-lg text-white/90 mb-8 max-w-2xl" : "text-base text-gray-500 mb-4 text-center max-w-3xl mx-auto"}`}>
            {textValue || <>&nbsp;</>}
        </p>
    );
});
