"use client";

import React from "react";
import usePersistentState from "@/app/usePersistentState";
import {initialPages, Page} from "@/app/db/initialData";
import {findHomepage} from "./resolveSlug";
import StrideHeader from "./StrideHeader";
import StrideFooter from "./StrideFooter";
import SitePageRenderer from "./SitePageRenderer";
import SmoothScrollProvider from "@/app/components/SmoothScrollProvider";

/**
 * /site — renders the published Homepage.
 */
export default function SiteHomePage() {
	const [pages, , isHydrated] = usePersistentState("pages_v7", initialPages) as [
		Page[],
		any,
		boolean,
	];

	if (!isHydrated) {
		return (
			<div className="min-h-screen flex items-center justify-center font-stride-sans" style={{background: "#F2F8FC"}}>
				<p className="text-stride-dark/60">Loading...</p>
			</div>
		);
	}

	const homepage = findHomepage(pages);

	if (!homepage) {
		return (
			<div className="min-h-screen font-stride-sans" style={{background: "#F2F8FC"}}>
				<StrideHeader />
				<div className="flex flex-col items-center justify-center py-32 px-8">
					<h1 className="text-stride-4xl font-stride-bold text-stride-dark mb-4">No published homepage</h1>
					<p className="text-stride-dark/60 text-stride-lg">
						The homepage hasn&apos;t been published yet.
					</p>
				</div>
				<StrideFooter />
			</div>
		);
	}

	const originalVariation = homepage.variations?.find((v) => v.id === "original");
	const outlines = originalVariation?.outlines ?? homepage.outlines ?? [];

	return (
		<>
			<SmoothScrollProvider />
			<div className="min-h-screen font-stride-sans relative" style={{background: "#F2F8FC"}}>
				<StrideHeader editPageId={homepage.id} />
				{outlines.length > 0 ? (
					<SitePageRenderer outlines={outlines} />
				) : (
					<div className="flex-1 flex items-center justify-center py-32">
						<p className="text-stride-dark/50 text-stride-lg">The homepage has no content yet.</p>
					</div>
				)}
				<StrideFooter />
			</div>
		</>
	);
}
