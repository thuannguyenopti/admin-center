"use client";

import React from "react";
import { BlogPostHeader } from "./BlogPostHeader";
import { BlogPostBody } from "./BlogPostBody";
import { BlogPostAuthor } from "./BlogPostAuthor";

/** Safely extract a string from a value that might be a structured object */
function toText(val: unknown): string {
	if (val == null) return "";
	if (typeof val === "string") return val;
	if (typeof val === "number" || typeof val === "boolean") return String(val);
	if (typeof val === "object") {
		const obj = val as Record<string, any>;
		// Handle ProseMirror/TipTap rich text documents: {type: "doc", content: [...]}
		if (obj.type === "text" && typeof obj.text === "string") return obj.text;
		if (Array.isArray(obj.content)) {
			const separator = obj.type === "doc" ? "\n\n" : "";
			return obj.content.map((node: unknown) => toText(node)).join(separator);
		}
		// Handle simple wrappers: {content: "..."} or {value: "..."}
		if (typeof obj.content === "string") return obj.content;
		if (typeof obj.value === "string") return obj.value;
		if (typeof obj.text === "string") return obj.text;
		return "";
	}
	return String(val);
}

export const BlogPostBlock = React.memo(function BlogPostBlock({
	properties,
	pageId,
}: {
	properties: any;
	pageId?: string;
}) {
	// Extract properties - handle both {value} format and flat format
	const rawTitle = properties?.title?.value || properties?.title;
	const rawSubtitle = properties?.subtitle?.value || properties?.subtitle;
	const rawBody = properties?.body?.value || properties?.body;
	const featuredImage = properties?.featuredImage?.value || properties?.featuredImage;
	const author = properties?.author?.value || properties?.author;

	const title = toText(rawTitle) || "Untitled Post";
	const subtitle = toText(rawSubtitle) || undefined;
	const body = toText(rawBody);

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
