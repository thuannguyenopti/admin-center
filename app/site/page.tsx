"use client";

import React from "react";
import usePersistentState from "@/app/usePersistentState";
import {initialPages, Page} from "@/app/db/initialData";
import {findHomepage} from "./resolveSlug";
import StrideHeader from "./StrideHeader";
<<<<<<< HEAD
import SitePageRenderer from "./SitePageRenderer";
=======
import StrideFooter from "./StrideFooter";
import SitePageRenderer from "./SitePageRenderer";
import SmoothScrollProvider from "@/app/components/SmoothScrollProvider";
>>>>>>> origin/main

/**
 * /site — renders the published Homepage.
 */
export default function SiteHomePage() {
<<<<<<< HEAD
	const [pages, , isHydrated] = usePersistentState("pages_v5", initialPages) as [
=======
	const [pages, , isHydrated] = usePersistentState("pages_v7", initialPages) as [
>>>>>>> origin/main
		Page[],
		any,
		boolean,
	];

	if (!isHydrated) {
		return (
<<<<<<< HEAD
			<div className="min-h-screen bg-white flex items-center justify-center">
				<p className="text-gray-500">Loading...</p>
=======
			<div className="min-h-screen flex items-center justify-center font-stride-sans" style={{background: "#F2F8FC"}}>
				<p className="text-stride-dark/60">Loading...</p>
>>>>>>> origin/main
			</div>
		);
	}

	const homepage = findHomepage(pages);

	if (!homepage) {
		return (
<<<<<<< HEAD
			<div className="min-h-screen bg-white">
				<StrideHeader />
				<div className="flex flex-col items-center justify-center py-32 px-8">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">No published homepage</h1>
					<p className="text-gray-500 text-lg">
						The homepage hasn&apos;t been published yet.
					</p>
				</div>
=======
			<div className="min-h-screen font-stride-sans" style={{background: "#F2F8FC"}}>
				<StrideHeader />
				<div className="flex flex-col items-center justify-center py-32 px-8">
					<h1 className="text-stride-4xl font-stride-bold text-stride-dark mb-4">No published homepage</h1>
					<p className="text-stride-dark/60 text-stride-lg">
						The homepage hasn&apos;t been published yet.
					</p>
				</div>
				<StrideFooter />
>>>>>>> origin/main
			</div>
		);
	}

	const originalVariation = homepage.variations?.find((v) => v.id === "original");
	const outlines = originalVariation?.outlines ?? homepage.outlines ?? [];

	return (
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
	);
}
