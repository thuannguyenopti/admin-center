<<<<<<< HEAD
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
=======
"use client";

import React from "react";

function toText(val: unknown): string {
	if (val == null) return "";
	if (typeof val === "string") return val;
	if (typeof val === "number" || typeof val === "boolean") return String(val);
	if (typeof val === "object") {
		const obj = val as Record<string, any>;
		if (obj.type === "text" && typeof obj.text === "string") return obj.text;
		if (Array.isArray(obj.content)) {
			const separator = obj.type === "doc" ? "\n\n" : "";
			return obj.content.map((node: unknown) => toText(node)).join(separator);
		}
		if (typeof obj.content === "string") return obj.content;
		if (typeof obj.value === "string") return obj.value;
		if (typeof obj.text === "string") return obj.text;
		return "";
	}
	return String(val);
}

export const BlogPostBlock = React.memo(function BlogPostBlock({
	properties,
}: {
	properties: any;
	pageId?: string;
}) {
	const title = toText(properties?.title) || "Untitled Post";
	const category = toText(properties?.category) || "";
	const readingTime = toText(properties?.readingTime) || "";
	const publishDate = toText(properties?.publishDate) || "";
	const rawBody = properties?.body;
	const body = typeof rawBody === "string" ? rawBody : toText(rawBody);
	const featuredImage = properties?.featuredImage;
	const heroLogo = properties?.heroLogo;
	const author = properties?.author;

	const imageUrl = typeof featuredImage === "string"
		? featuredImage
		: featuredImage?.url || featuredImage?.src;

	const logoUrl = typeof heroLogo === "string"
		? heroLogo
		: heroLogo?.url || heroLogo?.src || "";

	const authorName = typeof author === "string" ? author : author?.name || "";
	const authorImage = typeof author === "string" ? "" : author?.image || author?.src || "";

	return (
		<article className="w-full font-stride-sans relative" style={{paddingTop: "100px"}}>
			<div className="max-w-[800px] mx-auto px-6 pb-16">
				{/* Reading time badge */}
				{readingTime && (
					<div className="mb-6">
						<span
							className="inline-block bg-[#202320] text-white uppercase tracking-wider"
							style={{
								fontSize: "13px",
								fontWeight: 700,
								padding: "4px 12px",
								letterSpacing: "0.08em",
							}}
						>
							{readingTime}
						</span>
					</div>
				)}

				{/* Line above title */}
				<div style={{height: "3px", background: "#1C1C1C", marginBottom: "16px"}} />

				{/* Category + Title */}
				<div className="flex mb-4" style={{position: "relative"}}>
					{category && (
						<div
							className="flex-shrink-0"
							style={{
								writingMode: "vertical-rl",
								textOrientation: "mixed",
								transform: "rotate(180deg)",
								fontSize: "11px",
								fontWeight: 700,
								letterSpacing: "0.12em",
								textTransform: "uppercase",
								color: "#0980F6",
								lineHeight: 1,
								paddingTop: "2px",
								position: "absolute",
								left: "-20px",
								top: 0,
							}}
						>
							{category}
						</div>
					)}
					<h1
						className="text-stride-dark"
						style={{
							fontSize: "clamp(28px, 4vw, 48px)",
							fontWeight: 590,
							lineHeight: 1.1,
							letterSpacing: "-0.02em",
						}}
					>
						{title}
					</h1>
				</div>

				{/* Line below title */}
				<div style={{height: "3px", background: "#1C1C1C", marginTop: "16px", marginBottom: "24px"}} />

				{/* Author row */}
				{(authorName || publishDate) && (
					<div className="flex items-center gap-3 mb-8">
						{authorImage && (
							<img
								src={authorImage}
								alt={authorName}
								className="w-8 h-8 rounded-full object-cover"
							/>
						)}
						<div className="flex items-center gap-2">
							{authorName && (
								<span style={{fontSize: "14px", fontWeight: 600, color: "#1C1C1C"}}>
									{authorName}
								</span>
							)}
							{publishDate && (
								<span style={{fontSize: "14px", color: "#6B7280"}}>
									{publishDate}
								</span>
							)}
						</div>
					</div>
				)}

				{/* Hero image with optional logo overlay */}
				{imageUrl && (
					<div className="mb-10 rounded-lg overflow-hidden relative">
						<img
							src={imageUrl}
							alt={title}
							className="w-full object-cover"
							style={{aspectRatio: "16/9"}}
						/>
						{logoUrl && (
							<div className="absolute inset-0 flex items-center justify-center">
								<img
									src={logoUrl}
									alt=""
									style={{maxWidth: "60%", maxHeight: "60%", objectFit: "contain"}}
								/>
							</div>
						)}
					</div>
				)}

				{/* Body content */}
				{body && (
					<div
						className="blog-body"
						style={{
							fontSize: "18px",
							fontWeight: 400,
							lineHeight: 1.55,
							color: "rgb(28, 28, 28)",
							paddingTop: "24px",
						}}
						dangerouslySetInnerHTML={{__html: body}}
					/>
				)}
			</div>

			{/* Blog body styles — regular style tag (not jsx) for reliable rendering */}
			<style dangerouslySetInnerHTML={{__html: `
				.blog-body h2 {
					font-size: 24px;
					font-weight: 600;
					margin-top: 40px;
					margin-bottom: 16px;
					color: #1C1C1C;
				}
				.blog-body h3 {
					font-size: 20px;
					font-weight: 600;
					margin-top: 32px;
					margin-bottom: 12px;
					color: #1C1C1C;
				}
				.blog-body p {
					margin-bottom: 16px;
				}
				.blog-body ul, .blog-body ol {
					margin-bottom: 16px;
					padding-left: 24px;
				}
				.blog-body li {
					margin-bottom: 8px;
				}
				.blog-body blockquote {
					border-left: 3px solid #ABFF44;
					padding-left: 20px;
					margin: 24px 0;
					font-style: italic;
					color: #374151;
				}
				.blog-body strong {
					font-weight: 650;
				}
				.blog-body a {
					color: #0980F6;
					text-decoration: underline;
				}
			`}} />
		</article>
	);
});
>>>>>>> origin/main
