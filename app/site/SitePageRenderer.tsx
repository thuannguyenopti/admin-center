"use client";

import React from "react";
import type {Outline} from "@/app/db/initialData";
import {getContentType} from "@/app/db/initialData";
import {BlockRegistry} from "@/app/components/vb/blocks";
import {getDisplayTemplateClasses} from "@/app/components/vb/blocks/displayTemplateRenderer";
import StrideColumnGrid from "./StrideColumnGrid";
import "./StrideGrid.css";

/**
 * Read-only renderer for published pages.
 * Renders the outline tree (sections → rows → columns → elements)
 * using the block registry — no editor overlays, no drag/drop, no selection.
 *
 * This is the "customer website" side, so it uses raw HTML + Tailwind (not Axiom).
 */

const SECTION_SPACING_MAP: Record<string, string> = {
	'exp-landing-page': 'space-y-0',   // Sections control their own spacing
	'ct-page': 'space-y-0',            // Sections control their own spacing
	'default': 'space-y-0'
};

type EleMap = Record<string, {type: string; properties: any}>;

function isAsideOutline(o: any): boolean {
	if (!o || typeof o !== "object") return false;
	if (o.role === "aside") return true;
	if (o.isAside === true) return true;
	const t = (o.title ?? "").toString().trim().toLowerCase();
	return t === "aside" || t === "sidebar";
}

function renderOutlineTree(outline: Outline, isMobile = false) {
	return outline.tree.map((section: any, sindex: number) => {
		const hasBgImage = !!section.bgImage;
		const noPadding = section.noPadding === true;

		// Get display template classes for section
		const templateClasses = section.displayTemplateKey
			? getDisplayTemplateClasses(
					section.displayTemplateKey,
					section.displaySettings || [],
					{hasBgImage}
			  )
			: "";

		// Check if this section contains a hero block
		const hasHeroBlock = (section.children || []).some((row: any) =>
			(row.children || []).some((col: any) =>
				(col.elements || []).some((element: any) => {
					const ele = outline.elements[element.id];
					return ele && ele.type === "ct-hero";
				})
			)
		);

		// Count app preview blocks in this section
		let appPreviewCount = 0;
		(section.children || []).forEach((row: any) => {
			(row.children || []).forEach((col: any) => {
				(col.elements || []).forEach((element: any) => {
					const ele = outline.elements[element.id];
					if (ele && ele.type === "ct-app-preview") {
						appPreviewCount++;
					}
				});
			});
		});

		const hasAppPreview = appPreviewCount > 0;
		// Showcase sections have multiple app previews (apply mask to section)
		const isShowcaseSection = appPreviewCount > 1;
		// Community sections have single app preview (apply mask to column)
		const isCommunitySection = appPreviewCount === 1;

		// Add bottom margin to hero sections
		const heroBottomMargin = hasHeroBlock ? "mb-[100px]" : "";

		// App preview section padding - showcase needs more top padding to avoid clipping
		const appPreviewPadding = isShowcaseSection
			? "md:pt-180 pt-6 pb-20"
			: hasAppPreview
			? "md:pt-40 pt-20 pb-20"
			: "";

		// Add negative margins for showcase overlap effect
		const showcaseMargins = isShowcaseSection
			? "md:-mt-120 mt-6 md:-mb-100 -mb-20"
			: "";

		return (
			<section
				key={section.id ?? sindex}
				className={`${
					hasBgImage ? "relative min-h-[500px] flex items-center rounded-stride-lg" : ""
				} ${heroBottomMargin} ${appPreviewPadding} ${showcaseMargins} ${templateClasses}`}
				style={
					hasBgImage
						? {
								backgroundImage: `linear-gradient(rgba(9, 128, 246, 0.8), rgba(9, 128, 246, 0.8)), url(${section.bgImage})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
							}
						: isShowcaseSection
						? {
								WebkitMaskImage: 'linear-gradient(black 60%, transparent 70%)',
								maskImage: 'linear-gradient(black 60%, transparent 70%)',
							}
						: {}
				}
			>
				<div className="w-full">
					{(section.children || []).map((row: any, rIndex: number) => {
						// Check if THIS row contains an app preview (for community row negative margin)
						const rowHasAppPreview = (row.children || []).some((col: any) =>
							(col.elements || []).some((element: any) => {
								const ele = outline.elements[element.id];
								return ele && ele.type === "ct-app-preview";
							})
						);

						return (
							<div
								className={`${hasAppPreview && rowHasAppPreview ? "w-full max-w-[1200px] mx-auto md:flex gap-6 items-start md:-mb-50 mb-6" : hasAppPreview ? "w-full max-w-[1200px] mx-auto md:flex gap-6 items-start" : hasHeroBlock ? `grid ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-flow-col md:auto-cols-fr"}` : `max-w-[1200px] mx-auto grid ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-flow-col md:auto-cols-fr"} gap-6`} ${
									hasBgImage ? "text-white" : "text-[#05051F]"
								}`}
								key={row.id ?? rIndex}
							>
							{(row.children || []).map((col: any, cIndex: number) => {
								const colChildren = col.elements || col.children || [];

								// Check if this column contains an app preview
								const hasAppPreviewInCol = colChildren.some((element: any) => {
									const ele = outline.elements[element.id];
									return ele && ele.type === "ct-app-preview";
								});

								// Only apply column mask for community sections (single app preview)
								const applyColumnMask = isCommunitySection && hasAppPreviewInCol;

								return (
									<div
										key={col.id ?? cIndex}
										className={hasAppPreview ? "basis-0 grow" : ""}
										style={applyColumnMask ? {
											marginTop: '-10%',
											WebkitMaskImage: 'linear-gradient(#000 40%, transparent 75%)',
											maskImage: 'linear-gradient(#000 40%, transparent 75%)',
										} : {}}
									>
										{colChildren.map((element: any, eleIndex: number) => {
											const ele = outline.elements[element.id];
											if (!ele) return null;

											const BlockComponent = BlockRegistry[ele.type];
											if (!BlockComponent) return null;

											return (
												<BlockComponent
													key={element.id ?? eleIndex}
													properties={ele.properties}
													hasBgImage={hasBgImage}
												/>
											);
										})}
									</div>
								);
							})}
						</div>
					);
				})}
				</div>
			</section>
		);
	});
}

export default function SitePageRenderer({
	outlines,
	isMobile = false,
	contentTypeId
}: {
	outlines: Outline[];
	isMobile?: boolean;
	contentTypeId?: string;
}) {
	// Detect if content type supports aside/sidenav outlines
	const contentType = contentTypeId ? getContentType(contentTypeId) : null;
	const hasAsideProperty = contentType?.properties?.some(p => p.id === "asideOutline") ?? false;
	const hasSidenavProperty = contentType?.properties?.some(p => p.id === "sidenavOutline") ?? false;

	// Resolve spacing based on content type
	const sectionSpacing = contentTypeId
		? (SECTION_SPACING_MAP[contentTypeId] ?? SECTION_SPACING_MAP.default)
		: SECTION_SPACING_MAP.default;

	// Separate main and aside outlines
	const mainOutlines = outlines.filter((o) => !isAsideOutline(o));
	const asideOutlines = outlines.filter((o) => isAsideOutline(o));

	// Only show aside if content type supports it AND we have aside outlines
	const hasAside = hasAsideProperty && asideOutlines.length > 0 && mainOutlines.length > 0;
	// Left-sidebar layout for about-style pages
	const hasSidenav = hasSidenavProperty && asideOutlines.length > 0 && mainOutlines.length > 0;

	// Check if first section has a hero block
	const firstSectionHasHero = mainOutlines.length > 0 && mainOutlines[0].tree.length > 0 &&
		(mainOutlines[0].tree[0].children || []).some((row: any) =>
			(row.children || []).some((col: any) =>
				(col.elements || []).some((element: any) => {
					const ele = mainOutlines[0].elements[element.id];
					return ele && ele.type === "ct-hero";
				})
			)
		);

	// Extract hero section if present
	const heroSection = firstSectionHasHero && mainOutlines.length > 0 ? mainOutlines[0].tree[0] : null;
	const heroElements = heroSection && mainOutlines.length > 0 ? mainOutlines[0].elements : {};

	// Remaining sections after hero
	const remainingMainSections = firstSectionHasHero && mainOutlines.length > 0
		? [{...mainOutlines[0], tree: mainOutlines[0].tree.slice(1)}, ...mainOutlines.slice(1)]
		: mainOutlines;

	return (
		<div className="w-full font-stride-sans relative" style={{backgroundColor: "#F2F8FC"}}>
			<StrideColumnGrid />
			{/* Render hero full-width if present */}
			{heroSection && (
				<section
					key={heroSection.id}
					className="mb-[100px]"
				>
					<div className="w-full">
						{(heroSection.children || []).map((row: any, rIndex: number) => (
							<div className="grid grid-cols-1 md:grid-flow-col md:auto-cols-fr" key={row.id ?? rIndex}>
								{(row.children || []).map((col: any, cIndex: number) => {
									const colChildren = col.elements || col.children || [];
									return (
										<div key={col.id ?? cIndex}>
											{colChildren.map((element: any, eleIndex: number) => {
												const ele = heroElements[element.id];
												if (!ele) return null;
												const BlockComponent = BlockRegistry[ele.type];
												if (!BlockComponent) return null;
												return (
													<BlockComponent
														key={element.id ?? eleIndex}
														properties={ele.properties}
													/>
												);
											})}
										</div>
									);
								})}
							</div>
						))}
					</div>
				</section>
			)}

			{/* Remaining content with optional sidebar */}
			{hasSidenav ? (
				<div className={isMobile ? "max-w-[1200px] mx-auto flex flex-col gap-6 px-6 pt-32 pb-20" : "max-w-[1200px] mx-auto px-6 pt-32 pb-20 grid grid-cols-12 gap-6 items-start"}>
					<aside className={isMobile ? "space-y-1" : "hidden lg:block lg:col-span-3 sticky top-32 space-y-1"}>
						{asideOutlines.map((outline) => (
							<div key={outline.id}>{renderOutlineTree(outline, isMobile)}</div>
						))}
					</aside>
					<div className={isMobile ? sectionSpacing : `lg:col-span-8 lg:col-start-5 ${sectionSpacing}`}>
						{remainingMainSections.map((outline) => (
							<div key={outline.id}>{renderOutlineTree(outline, isMobile)}</div>
						))}
					</div>
				</div>
			) : hasAside ? (
				<div className={isMobile ? "max-w-[1200px] mx-auto flex flex-col gap-6 px-6" : "max-w-[1200px] mx-auto px-6 flex flex-col md:grid md:grid-cols-12 gap-6 md:items-start"}>
					<div className={isMobile ? sectionSpacing : `md:col-span-8 ${sectionSpacing}`}>
						{remainingMainSections.map((outline) => (
							<div key={outline.id}>{renderOutlineTree(outline, isMobile)}</div>
						))}
					</div>
					<aside className={isMobile ? "space-y-6" : "md:col-span-4 space-y-6"}>
						{asideOutlines.map((outline) => (
							<div key={outline.id}>{renderOutlineTree(outline, isMobile)}</div>
						))}
					</aside>
				</div>
			) : (
				<div className={firstSectionHasHero ? `max-w-[1200px] mx-auto px-6 mt-6 ${sectionSpacing}` : `max-w-[1200px] mx-auto px-6 ${sectionSpacing}`}>
					{remainingMainSections.map((outline) => (
						<div key={outline.id}>{renderOutlineTree(outline, isMobile)}</div>
					))}
				</div>
			)}
		</div>
	);
}
