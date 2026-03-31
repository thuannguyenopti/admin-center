"use client";

import React from "react";
import { getProperty } from "./utils";
import { BlogPostHeader } from "./BlogPostHeader";
import { BlogPostBody } from "./BlogPostBody";
import { BlogPostAuthor } from "./BlogPostAuthor";

export const BlogPostBlock = React.memo(function BlogPostBlock({
	properties,
	pageId,
}: {
	properties: any;
	pageId?: string;
}) {
	// Extract properties - handle both {value} format and flat format
	const title = properties?.title?.value || properties?.title || "Untitled Post";
	const subtitle = properties?.subtitle?.value || properties?.subtitle;
	const body = properties?.body?.value || properties?.body || "";
	const featuredImage = properties?.featuredImage?.value || properties?.featuredImage;
	const author = properties?.author?.value || properties?.author;

	return (
		<article className="w-full py-12">
			<div className="max-w-4xl mx-auto px-6">
				{/* White content card */}
				<div className="bg-white rounded-lg shadow-sm overflow-hidden">
					{/* Header section with featured image, title, subtitle */}
					<BlogPostHeader
						title={title}
						subtitle={subtitle}
						featuredImage={featuredImage}
					/>

					{/* Body content */}
					<div className="px-8 md:px-12 py-8">
						<BlogPostBody body={body} />
					</div>

					{/* Author section */}
					{author && (
						<div className="px-8 md:px-12 pb-8">
							<BlogPostAuthor author={author} />
						</div>
					)}
				</div>
			</div>
		</article>
	);
});
