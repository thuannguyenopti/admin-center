"use client";

import React from "react";
import { getProperty } from "./utils";

export const AppPreviewBlock = React.memo(function StrideAppPreviewBlock({
	properties,
}: {
	properties: any;
}) {
	const appImage = getProperty(properties, "appImage", "App Image") || "/stride-hero/app1.png";
	const style = getProperty(properties, "style", "Style") || "community";
	const containerMarginTop = getProperty(properties, "containerMarginTop", "Container Margin Top") || "0";
	const lenisSpeed = getProperty(properties, "lenisSpeed", "Lenis Speed") || "1";

	// Showcase style - for overlapping cards with special scaling and parallax
	if (style === "showcase") {
		return (
			<div
				className="w-full relative md:mt-0"
				style={{
					aspectRatio: '1/2.02',
					marginTop: `${containerMarginTop}%`,
				}}
				data-lenis-parallax
				data-lenis-speed={lenisSpeed}
			>
				<img
					src={appImage}
					alt="App preview"
					className="absolute -left-[32.9%] !max-w-[166%] md:-top-[10%]"
				/>
			</div>
		);
	}

	// Community style - simple full-width image
	return (
		<img
			src={appImage}
			alt="App preview"
			className="object-cover object-top mt-6 aspect-square"
		/>
	);
});
