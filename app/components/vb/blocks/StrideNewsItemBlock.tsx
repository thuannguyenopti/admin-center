"use client";

import React from "react";
import { getProperty } from "./utils";

export const NewsItemBlock = React.memo(function StrideNewsItemBlock({
	properties,
}: {
	properties: any;
}) {
	const title = getProperty(properties, "title", "Title") || "News";
	const date = getProperty(properties, "date", "Date") || "";
	const summary = getProperty(properties, "summary", "Summary") || "";
	const image = getProperty(properties, "image", "Image") || "";

	const formattedDate = date
		? new Date(date).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
		  })
		: "";

	return (
		<article className="group flex gap-6 mb-10">
			{image && (
				<div className="grow basis-0">
					<img
						src={image}
						alt={title}
						className="mb-4 rounded-lg object-cover max-h-60 w-full border border-black/5"
					/>
				</div>
			)}
			<div className="grow basis-0">
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
				<a href="#" className="no-underline">
					<h3
						className="text-stride-dark group-hover:text-stride-blue transition-colors cursor-pointer mb-2"
						style={{
							fontFamily: "'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
							fontSize: '24px',
							fontWeight: '700',
							lineHeight: '1.3',
							letterSpacing: '-0.01em',
						}}
					>
						{title}
					</h3>
				</a>
				<p
					className="text-stride-dark/80 font-stride-sans max-w-2xl"
					style={{
						fontSize: '16px',
						lineHeight: '1.6',
					}}
				>
					{summary}
				</p>
			</div>
		</article>
	);
});
