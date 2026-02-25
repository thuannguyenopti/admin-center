"use client";

import React from "react";
import usePersistentState from "@/app/usePersistentState";
import {initialPages, Page} from "@/app/db/initialData";
import {findHomepage} from "./resolveSlug";
import StrideHeader from "./StrideHeader";
import SitePageRenderer from "./SitePageRenderer";

/**
 * /site — renders the published Homepage.
 */
export default function SiteHomePage() {
	const [pages, , isHydrated] = usePersistentState("pages_v3", initialPages) as [
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

	const homepage = findHomepage(pages);

	if (!homepage) {
		return (
			<div className="min-h-screen bg-white">
				<StrideHeader />
				<div className="flex flex-col items-center justify-center py-32 px-8">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">No published homepage</h1>
					<p className="text-gray-500 text-lg">
						The homepage hasn&apos;t been published yet.
					</p>
				</div>
			</div>
		);
	}

	const originalVariation = homepage.variations?.find((v) => v.id === "original");
	const outlines = originalVariation?.outlines ?? homepage.outlines ?? [];

	return (
		<div className="min-h-screen bg-[#F3F4F6] flex flex-col">
			<StrideHeader editPageId={homepage.id} />
			{outlines.length > 0 ? (
				<SitePageRenderer outlines={outlines} />
			) : (
				<div className="flex-1 flex items-center justify-center py-32">
					<p className="text-gray-400 text-lg">The homepage has no content yet.</p>
				</div>
			)}
		</div>
	);
}
