"use client";

import React from "react";
import { getProperty } from "./utils";

export function HeadingBlock({ properties, hasBgImage }: { properties: any, hasBgImage?: boolean }) {
    const text = getProperty(properties, "text", "Text");
    return (
        <h1 className={`font-bold leading-tight ${hasBgImage ? "text-4xl mb-6" : "text-3xl mb-4 text-center"}`}>
            {text || <>&nbsp;</>}
        </h1>
    );
}
