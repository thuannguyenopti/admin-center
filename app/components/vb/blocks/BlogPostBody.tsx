"use client";

import React from "react";

interface BlogPostBodyProps {
	body: string;
}

export const BlogPostBody = React.memo(function BlogPostBody({
	body,
}: BlogPostBodyProps) {
	if (!body) {
		return (
			<div className="text-gray-400 text-center py-8">
				No content available.
			</div>
		);
	}

	return (
		<div
			className="prose prose-lg max-w-none prose-headings:font-semibold prose-h2:text-3xl prose-h3:text-2xl prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic"
			dangerouslySetInnerHTML={{ __html: body }}
		/>
	);
});
