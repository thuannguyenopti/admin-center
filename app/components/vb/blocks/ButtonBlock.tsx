"use client";

import React from "react";
import { getProperty } from "./utils";

export function ButtonBlock({ properties, hasBgImage }: { properties: any, hasBgImage?: boolean }) {
    const label = getProperty(properties, "label", "Label") || "";
    const isJoinNow = label === "Join Now";

    return (
        <div className={`mt-6 ${!hasBgImage ? "text-center" : ""}`}>
            <div className={`rounded-[10px] px-10 py-4 text-center font-bold inline-block transition-all cursor-pointer ${isJoinNow ? "bg-[#194BFF] text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30" : "bg-white text-[#194BFF] border border-gray-200 hover:bg-gray-50"}`}>
                {label}
            </div>
        </div>
    );
}
