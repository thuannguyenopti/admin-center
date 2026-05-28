"use client";

import React from "react";
import { getProperty } from "./utils";
import { getDisplayTemplateClasses } from "./displayTemplateRenderer";

export const ButtonBlock = React.memo(function ButtonBlock({ properties, hasBgImage }: { properties: any, hasBgImage?: boolean }) {
    const label = getProperty(properties, "label", "Label") || "";

    // Get display template
    const displayTemplateKey = getProperty(properties, "displayTemplateKey", "Display Template") || "primaryButton";
    const displaySettings = getProperty(properties, "displaySettings", "Display Settings") || [];

    // Use display template renderer for button styling
    const buttonClasses = getDisplayTemplateClasses(
        displayTemplateKey,
        displaySettings,
        { hasBgImage }
    );

    return (
        <div className="mt-6">
            <div className={`inline-block cursor-pointer ${buttonClasses}`}>
                {label}
            </div>
        </div>
    );
});
