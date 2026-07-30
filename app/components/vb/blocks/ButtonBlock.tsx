<<<<<<< HEAD
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
=======
"use client";

import React from "react";
import {getProperty} from "./utils";

const buttonBase =
	"box-border rounded-md inline-flex hover:-translate-y-0.5 hover:duration-100 items-center justify-center px-6 py-3 text-sm font-semibold uppercase tracking-wider";

const BUTTON_VARIANTS: Record<string, string> = {
	primaryButton: `${buttonBase} border-2 border-[#0980F6] bg-[#0980F6] text-white`,
	outlineButton: `${buttonBase} border-2 border-black text-black`,
	subtleButton:
		"inline-flex items-center px-3 py-2 text-sm font-medium uppercase tracking-wider text-[#0980F6] underline-offset-2 hover:underline",
	blueFullWidthButton:
		"w-full bg-[#0980F6] hover:bg-[#0668C4] text-white px-6 py-4 rounded-xl text-sm uppercase tracking-wider font-semibold transition-colors mt-2 text-center block",
};

export const ButtonBlock = React.memo(function ButtonBlock({
	properties,
}: {
	properties: any;
	hasBgImage?: boolean;
}) {
	const label = getProperty(properties, "label", "Label") || "";
	const displayTemplateKey =
		getProperty(properties, "displayTemplateKey", "Display Template") || "primaryButton";

	const buttonClasses = BUTTON_VARIANTS[displayTemplateKey] ?? BUTTON_VARIANTS.primaryButton;

	return (
		<button type="button" className={buttonClasses}>
			{label}
		</button>
	);
});
>>>>>>> origin/main
