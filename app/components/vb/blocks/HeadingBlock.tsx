"use client";

import React from "react";
import { getProperty } from "./utils";

export function HeadingBlock({ properties, hasBgImage }: { properties: any, hasBgImage?: boolean }) {
    const text = getProperty(properties, "text", "Text");
    const variant = getProperty(properties, "variant", "Variant");
    const isStat = variant === "stat";

    const sizeClass = hasBgImage ? "text-4xl" : "text-3xl";
    const spacingClass = isStat ? "mt-0 mb-0" : hasBgImage ? "mb-6" : "mb-4 text-center";

    return (
        <h1 className={`font-bold leading-tight ${sizeClass} ${spacingClass}`}>
            {text || <>&nbsp;</>}
        </h1>
    );
}
