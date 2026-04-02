"use client";

import type { ContentInstance } from "@/app/db/cmpInitialData";
import type { ContentType } from "@/app/db/initialData";
import { ArticlePreview } from "./ArticlePreview";
import { BlogPostPreview } from "./BlogPostPreview";
import { DefaultContentPreview } from "./DefaultContentPreview";

export interface ContentPreviewProps {
	instance: ContentInstance;
	contentModel: ContentType;
}

const templateRegistry: Record<string, React.FC<ContentPreviewProps>> = {
	"cm-article": ArticlePreview,
	"cm-blog-post": BlogPostPreview,
};

const richTextStyles = `
.preview-rich-text {
	color: var(--ax-colors-fg-default);
	font-family: Inter, sans-serif;
	font-size: 14px;
	letter-spacing: -0.1px;
	line-height: 20px;
}
.preview-rich-text h2 {
	font-size: 24px;
	font-weight: 600;
	line-height: 32px;
	letter-spacing: -0.4px;
	margin: 0 0 12px;
}
.preview-rich-text h3 {
	font-size: 18px;
	font-weight: 600;
	line-height: 26px;
	letter-spacing: -0.2px;
	margin: 12px 0 8px;
}
.preview-rich-text p,
.preview-rich-text ul,
.preview-rich-text ol,
.preview-rich-text blockquote {
	margin: 0 0 12px;
}
.preview-rich-text ul {
	list-style-type: disc;
	padding-left: 22px;
}
.preview-rich-text ol {
	list-style-type: decimal;
	padding-left: 22px;
}
.preview-rich-text li {
	margin: 0 0 8px;
}
`;

export function ContentPreviewRenderer({ instance, contentModel }: ContentPreviewProps) {
	const Template = templateRegistry[instance.modelId];

	return (
		<>
			<style>{richTextStyles}</style>
			{Template ? (
				<Template instance={instance} contentModel={contentModel} />
			) : (
				<DefaultContentPreview instance={instance} contentModel={contentModel} />
			)}
		</>
	);
}
