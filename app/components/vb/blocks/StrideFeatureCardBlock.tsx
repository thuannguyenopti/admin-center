"use client";

import React from "react";
import { getProperty } from "./utils";

export const FeatureCardBlock = React.memo(function StrideFeatureCardBlock({
	properties,
}: {
	properties: any;
}) {
	// Get properties from CMS
	const icon = getProperty(properties, "icon", "Icon") || "/stride-icons/sticky-note.svg";
	const label = getProperty(properties, "label", "Label") || "Feature";
	const description = getProperty(properties, "description", "Description") || "Feature description";
	const style = getProperty(properties, "style", "Style") || "regular";

	// Check if icon is an SVG path or emoji
	const isIconSvg = icon.includes('.svg') || icon.includes('/');
	const isCompact = style === "compact";

	if (isCompact) {
		// Compact style: no background, smaller font, tighter spacing
		return (
			<div className="flex flex-col items-start w-full">
				{/* Icon + Label row */}
				<div className="flex items-center gap-2 w-full pt-4">
					{isIconSvg ? (
						<img src={icon} alt="" width="16" height="16" style={{ flexShrink: 0 }} />
					) : (
						<span className="text-base" style={{ flexShrink: 0 }}>{icon}</span>
					)}
					<p className="flex-1 text-stride-base font-stride-medium font-stride-sans text-stride-dark">
						{label}
					</p>
				</div>

				{/* Description */}
				<div className="w-full pt-2">
					<p className="text-stride-base font-stride-medium font-stride-sans text-stride-dark">
						{description}
					</p>
				</div>
			</div>
		);
	}

	// Regular style: frosted glass background, larger text
	return (
		<div
			className="flex flex-col gap-2 items-start overflow-hidden rounded-[24px] p-6 w-full h-full"
			style={{
				backdropFilter: 'blur(2px)',
				backgroundColor: 'rgba(0, 0, 0, 0.02)',
				border: '1px solid rgba(0, 0, 0, 0.03)',
			}}
		>
			{/* Icon + Label row */}
			<div className="flex items-center gap-2 w-full pt-4">
				{isIconSvg ? (
					<img src={icon} alt="" width="24" height="24" style={{ flexShrink: 0 }} />
				) : (
					<span className="text-2xl" style={{ flexShrink: 0 }}>{icon}</span>
				)}
				<p className="flex-1 text-lg font-stride-medium font-stride-sans text-stride-dark">
					{label}
				</p>
			</div>

			{/* Description */}
			<div className="w-full pt-6">
				<p className="text-lg font-stride-medium font-stride-sans text-stride-dark">
					{description}
				</p>
			</div>
		</div>
	);
});
