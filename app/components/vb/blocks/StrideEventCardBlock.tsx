"use client";

import React from "react";
import { getProperty } from "./utils";

export const EventCardBlock = React.memo(function StrideEventCardBlock({
	properties,
}: {
	properties: any;
}) {
	const title = getProperty(properties, "title", "Title") || "Event";
	const date = getProperty(properties, "date", "Date") || "";
	const location = getProperty(properties, "location", "Location") || "";
	const description = getProperty(properties, "description", "Description") || "";

	const formattedDate = date
		? new Date(date).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
		  })
		: "";

	return (
		<a href="#" className="block h-full no-underline">
			<div
				className="p-6 h-full rounded-2xl transition-colors border border-black/5 hover:border-black/10"
				style={{
					backdropFilter: 'blur(3px)',
					backgroundColor: 'rgba(0, 0, 0, 0.02)',
				}}
			>
				{formattedDate && (
					<p
						className="mb-2 text-stride-blue uppercase"
						style={{
							fontFamily: "'Space Mono', monospace",
							fontSize: '12px',
							fontWeight: '600',
							letterSpacing: '0.05em',
						}}
					>
						{formattedDate}
					</p>
				)}

				<h3
					className="text-stride-dark mb-2"
					style={{
						fontFamily: "'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
						fontSize: '20px',
						fontWeight: '700',
						lineHeight: '1.3',
						letterSpacing: '-0.01em',
					}}
				>
					{title}
				</h3>

				{location && (
					<p
						className="mb-4 flex gap-1 items-center text-stride-dark/60"
						style={{
							fontSize: '14px',
							lineHeight: '1.55',
						}}
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
							<circle cx="12" cy="10" r="3" />
						</svg>
						{location}
					</p>
				)}

				<p
					className="text-stride-dark/80 font-stride-sans"
					style={{
						fontSize: '14px',
						lineHeight: '1.55',
					}}
				>
					{description}
				</p>
			</div>
		</a>
	);
});
