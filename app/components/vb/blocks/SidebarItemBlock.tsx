"use client";

import React from "react";
import { getProperty } from "./utils";

export const SidebarItemBlock = React.memo(function SidebarItemBlock({
	properties,
}: {
	properties: any;
}) {
	const title = getProperty(properties, "title", "Title") || "";
	const description = getProperty(properties, "description", "Description") || "";
	const href = getProperty(properties, "href", "Href") || "#";

	return (
		<div className="relative group cursor-pointer mb-6">
			<a
				href={href}
				className="z-0 transition translate-y-2 border border-black/5 group-hover:translate-y-0 absolute -inset-4 group-hover:opacity-100 opacity-0 bg-black/5 rounded-lg"
				style={{ backdropFilter: 'blur(3px)' }}
			/>
			<h4
				className="relative z-10 font-stride-sans text-stride-dark/80 group-hover:text-stride-dark transition-colors"
				style={{
					fontSize: '18px',
					fontWeight: '500',
					lineHeight: '1.4',
					marginBottom: '4px',
				}}
			>
				{title}
			</h4>
			<p
				className="relative z-10 text-stride-dark/50 font-stride-sans"
				style={{
					fontSize: '14px',
					lineHeight: '1.55',
				}}
			>
				{description}
			</p>
		</div>
	);
});
