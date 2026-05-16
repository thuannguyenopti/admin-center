"use client";

import React from "react";
import { getProperty } from "./utils";
import { getTemplateClasses } from "./templateUtils";

export const ButtonBlock = React.memo(function ButtonBlock({ properties, hasBgImage }: { properties: any, hasBgImage?: boolean }) {
    const label = getProperty(properties, "label", "Label") || "";

    // Use template system for button styling
    const buttonClasses = getTemplateClasses("ct-button", properties, { hasBgImage });

    return (
        <div className={`my-8 ${!hasBgImage ? "text-center" : ""}`}>
            <div className={`inline-block cursor-pointer ${buttonClasses}`}>
                {label}
            </div>
        </div>
    );
});
