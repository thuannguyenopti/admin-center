"use client";

import React from "react";
import {useParams} from "next/navigation";
import {use} from "react";
import usePersistentState from "@/app/usePersistentState";
import {initialPages, Page} from "@/app/db/initialData";
import {resolveSlugToPage} from "../resolveSlug";
import StrideHeader from "../StrideHeader";
import StrideFooter from "../StrideFooter";
import SitePageRenderer from "../SitePageRenderer";
import PropertyBasedPageRenderer from "../PropertyBasedPageRenderer";
import SmoothScrollProvider from "@/app/components/SmoothScrollProvider";

export default function SiteSlugPage() {
	const params = useParams();
	const resolvedParams = params instanceof Promise ? use(params) : params;
	const slugSegments = (resolvedParams?.slug ?? []) as string[];

	const [pages, , isHydrated] = usePersistentState("pages_v6", initialPages) as [
		Page[],
		any,
		boolean,
	];

	if (!isHydrated) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<p className="text-gray-500">Loading...</p>
			</div>
		);
	}

	const page = resolveSlugToPage(slugSegments, pages);

	if (!page) {
		return (
			<div className="min-h-screen bg-white">
				<StrideHeader />
				<div className="flex flex-col items-center justify-center py-32 px-8">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">Page not found</h1>
					<p className="text-gray-500 text-lg mb-8">
						This page doesn&apos;t exist or hasn&apos;t been published yet.
					</p>
					<a
						href="/site"
						className="text-[#194BFF] font-semibold hover:underline text-lg"
					>
						← Back to homepage
					</a>
				</div>
				<StrideFooter />
			</div>
		);
	}

	// Get the "original" variation's outlines (published content)
	const originalVariation = page.variations?.find((v) => v.id === "original");
	const outlines = originalVariation?.outlines ?? page.outlines ?? [];
	const hasOutlines = outlines && outlines.length > 0;

	// Check if this is a property-based page (has data but no outlines)
	const pageData = originalVariation?.data ?? page.data;
	const isPropertyBasedPage =
		!hasOutlines &&
		pageData &&
		Object.keys(pageData).length > 0 &&
		page.contentTypeId;

	return (
		<>
			<SmoothScrollProvider />
			<div className="min-h-screen flex flex-col" style={{background: "#F2F8FC"}}>
				<StrideHeader editPageId={page.id} />
				{hasOutlines ? (
					<SitePageRenderer outlines={outlines} contentTypeId={page.contentTypeId} />
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
				<StrideFooter />
			</div>
		</>
	);
}
