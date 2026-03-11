"use client";

import React from "react";
import { getProperty } from "./utils";

export const InputBlock = React.memo(function InputBlock({ properties, hasBgImage }: { properties: any, hasBgImage?: boolean }) {
    const tooltip = getProperty(properties, "tooltip", "Tooltip");
    const label = getProperty(properties, "label", "Label");
    const placeholder = getProperty(properties, "placeholder", "Placeholder");
    const required = getProperty(properties, "required", "Required");

    return (
        <div className="group relative mt-4">
            {tooltip && (
                <div className="text-sm group-hover:opacity-100 group-hover:scale-100 group-hover:delay-1000 delay-0 group-hover:visible group-hover:-translate-y-2 opacity-0 text-center invisible absolute left-1/2 -translate-x-1/2 bottom-10 scale-90 shadow-lg transition-[.3s] px-2 py-1 rounded-md bg-[#000] text-white">
                    {tooltip}
                </div>
            )}
            {label && (
                <label className={`block text-sm font-medium mb-1.5 ${hasBgImage ? "text-white/70" : "text-gray-600"}`}>
                    {label}{required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
            )}
            <input
                type="text"
                placeholder={placeholder || undefined}
                required={required}
                className={`border rounded-[10px] p-3 w-full transition-colors focus:outline-none focus:border-blue-500 ${hasBgImage ? "bg-white/10 border-white/20 text-white placeholder:text-white/30" : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"}`}
            />
        </div>
    );
});
