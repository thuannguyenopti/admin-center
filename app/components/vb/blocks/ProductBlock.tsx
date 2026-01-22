"use client";

import React from "react";
import { getProperty } from "./utils";

export function ProductBlock({ properties, hasBgImage }: { properties: any; hasBgImage?: boolean }) {
    const name = getProperty(properties, "name", "Name") || "Product";
    const price = getProperty(properties, "price", "Price") || "";
    const description = getProperty(properties, "description", "Description") || "";

    return (
        <div
            className={hasBgImage ? "bg-white/10 border border-white/20 rounded-[12px] p-4 backdrop-blur-sm" : "bg-white border border-gray-200 rounded-[12px] p-4 shadow-sm"}
        >
            <div className="flex items-baseline justify-between gap-2 mb-2">
                <h3 className={hasBgImage ? "text-white text-lg font-semibold" : "text-gray-900 text-lg font-semibold"}>{name}</h3>
                {price ? <span className={hasBgImage ? "text-white/80 text-sm" : "text-gray-700 text-sm"}>{price}</span> : null}
            </div>
            <p className={hasBgImage ? "text-white/80 text-sm leading-relaxed" : "text-gray-600 text-sm leading-relaxed"}>{description}</p>
        </div>
    );
}
