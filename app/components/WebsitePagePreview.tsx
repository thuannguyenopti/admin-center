<<<<<<< HEAD
"use client";

import React from "react";
import type { Page } from "@/app/db/initialData";
import type { Outline } from "@/app/db/initialData";
import StrideHeader from "@/app/site/StrideHeader";
import SitePageRenderer from "@/app/site/SitePageRenderer";
import PropertyBasedPageRenderer from "@/app/site/PropertyBasedPageRenderer";

type WebsitePagePreviewProps = {
	page: Page;
	outlines?: Outline[];
};

/**
 * Renders a page as it would appear on the live website,
 * including the Stride header and proper background.
 *
 * Used in:
 * - CMP content tab (full-size page preview)
 * - CMP publishing view (scaled-down thumbnail)
 */
export default function WebsitePagePreview({ page, outlines }: WebsitePagePreviewProps) {
	const resolvedOutlines = outlines ?? page.outlines ?? [];
	const hasOutlines = resolvedOutlines.length > 0;

	const pageData = page.data;
	const isPropertyBasedPage =
		!hasOutlines &&
		pageData &&
		Object.keys(pageData).length > 0 &&
		page.contentTypeId;

	return (
		<div className="min-h-full bg-[#F3F4F6] flex flex-col">
			<StrideHeader isMobile={false} />
			{hasOutlines ? (
				<SitePageRenderer outlines={resolvedOutlines} />
			) : isPropertyBasedPage ? (
				<PropertyBasedPageRenderer
					contentTypeId={page.contentTypeId}
					properties={pageData}
					pageId={page.id}
				/>
			) : (
				<div className="flex-1 flex items-center justify-center py-32">
					<p className="text-gray-400 text-lg">This page has no content yet.</p>
				</div>
			)}
		</div>
	);
}
=======
"use client";

import React from "react";
import type { Page } from "@/app/db/initialData";
import type { Outline } from "@/app/db/initialData";
import StrideHeader from "@/app/site/StrideHeader";
import SitePageRenderer from "@/app/site/SitePageRenderer";
import PropertyBasedPageRenderer from "@/app/site/PropertyBasedPageRenderer";

type WebsitePagePreviewProps = {
	page: Page;
	outlines?: Outline[];
};

/**
 * Renders a page as it would appear on the live website,
 * including the Stride header and proper background.
 *
 * Used in:
 * - CMP content tab (full-size page preview)
 * - CMP publishing view (scaled-down thumbnail)
 */
export default function WebsitePagePreview({ page, outlines }: WebsitePagePreviewProps) {
	const resolvedOutlines = outlines ?? page.outlines ?? [];
	const hasOutlines = resolvedOutlines.length > 0;

	const pageData = page.data;
	const isPropertyBasedPage =
		!hasOutlines &&
		pageData &&
		Object.keys(pageData).length > 0 &&
		page.contentTypeId;

	return (
		<div className="min-h-full bg-[#F3F4F6] flex flex-col">
			<StrideHeader isMobile={false} />
			{hasOutlines ? (
				<SitePageRenderer outlines={resolvedOutlines} />
			) : isPropertyBasedPage ? (
				<PropertyBasedPageRenderer
					contentTypeId={page.contentTypeId}
					properties={pageData}
					pageId={page.id}
				/>
			) : (
				<div className="flex-1 flex items-center justify-center py-32">
					<p className="text-gray-400 text-lg">This page has no content yet.</p>
				</div>
			)}
		</div>
	);
}
>>>>>>> origin/main
