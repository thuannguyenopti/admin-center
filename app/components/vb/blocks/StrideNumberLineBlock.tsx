"use client";

import React from "react";
import { getProperty } from "./utils";

export const NumberLineBlock = React.memo(function StrideNumberLineBlock({
	properties,
	hasBgImage
}: {
	properties: any;
	hasBgImage?: boolean;
}) {
	const number = getProperty(properties, "number", "Number") || "";

	return (
		<div className="flex flex-col items-start relative w-full" style={{ gap: "16px", paddingBottom: "32px" }}>
			{/* Number Badge - 20px x 18px (or empty placeholder to maintain height) */}
			<div
				style={{
					width: number ? "20px" : "0",
					height: "18px",
					background: number ? (hasBgImage ? "rgba(255, 255, 255, 0.9)" : "#1C1C1C") : "transparent",
					color: hasBgImage ? "#1C1C1C" : "#F2F8FC",
					fontFamily: "'Space Mono', monospace",
					fontWeight: "700",
					fontSize: "12px",
					letterSpacing: "0.6px",
					textTransform: "uppercase",
					textAlign: "center",
					lineHeight: "18px",
				}}
			>
				{number}
			</div>

			{/* Horizontal Line - 3px height, full width */}
			<div
				className="w-full"
				style={{
					height: "3px",
					background: hasBgImage ? "rgba(255, 255, 255, 0.2)" : "#1C1C1C",
				}}
			/>
		</div>
	);
});
