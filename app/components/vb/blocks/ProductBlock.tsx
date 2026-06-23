"use client";

import React from "react";
import { getProperty } from "./utils";

export const ProductBlock = React.memo(function ProductBlock({ properties, hasBgImage }: { properties: any; hasBgImage?: boolean }) {
    const name = getProperty(properties, "name", "Name") || "Product";
    const price = getProperty(properties, "price", "Price") || "";
    const description = getProperty(properties, "description", "Description") || "";

    return (
        <div
            className={hasBgImage ? "bg-white/10 border border-white/20 rounded-stride-lg p-4 backdrop-blur-sm" : "bg-white border border-stride-dark/10 rounded-stride-lg p-4 shadow-sm"}
        >
            <div className="flex items-baseline justify-between gap-2 mb-2">
                <h3 className={hasBgImage ? "text-white text-stride-lg font-stride-semibold font-stride-sans" : "text-stride-dark text-stride-lg font-stride-semibold font-stride-sans"}>{name}</h3>
                {price ? <span className={hasBgImage ? "text-white/80 text-stride-base font-stride-sans" : "text-stride-dark/80 text-stride-base font-stride-sans"}>{price}</span> : null}
            </div>
            <p className={hasBgImage ? "text-white/80 text-stride-base leading-relaxed font-stride-sans" : "text-stride-dark/70 text-stride-base leading-relaxed font-stride-sans"}>{description}</p>
        </div>
    );
});
