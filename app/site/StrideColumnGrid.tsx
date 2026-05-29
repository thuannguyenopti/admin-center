"use client";

import React from "react";

/**
 * Pure CSS column grid decoration for Stride pages.
 * Matches the reference implementation from stride-web.
 * 6 flex-grow divs with gap-6 (24px) and dashed borders create the visual grid.
 * Positioned absolutely to allow transparent sections to show through.
 */
export default function StrideColumnGrid() {
	return (
		<div className="absolute inset-0 pointer-events-none overflow-hidden">
			<div
				className="mx-auto flex justify-between gap-6 px-6"
				style={{
					maxWidth: "1200px",
					height: "100%",
				}}
			>
				{Array.from({ length: 6 }).map((_, i) => (
					<div
						key={i}
						className="grow border border-y-0 border-dashed"
						style={{
							borderColor: "rgba(28, 28, 28, 0.15)",
						}}
					/>
				))}
			</div>
		</div>
	);
}
