"use client";

import React from "react";

interface BlogPostHeaderProps {
	title: string;
	subtitle?: string;
	featuredImage?: any;
}

export const BlogPostHeader = React.memo(function BlogPostHeader({
	title,
	subtitle,
	featuredImage,
}: BlogPostHeaderProps) {
	// Extract image URL from ContentReference or direct URL
	const imageUrl = typeof featuredImage === "string"
		? featuredImage
		: featuredImage?.url || featuredImage?.src;

	return (
		<header>
			{/* Featured image - full width within card */}
			{imageUrl && (
				<div className="w-full aspect-[21/9] bg-gray-100 overflow-hidden">
					<img
						src={imageUrl}
						alt={title}
						className="w-full h-full object-cover"
					/>
				</div>
			)}

			{/* Title and subtitle */}
			<div className="px-8 md:px-12 pt-8 pb-4">
				<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
					{title}
				</h1>
				{subtitle && (
					<p className="text-xl text-gray-600 leading-relaxed">
						{subtitle}
					</p>
				)}
			</div>
		</header>
	);
});
