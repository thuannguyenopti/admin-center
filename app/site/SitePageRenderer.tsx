"use client";

import React from "react";
import type {Outline} from "@/app/db/initialData";
import {BlockRegistry} from "@/app/components/vb/blocks";

/**
 * Read-only renderer for published pages.
 * Renders the outline tree (sections → rows → columns → elements)
 * using the block registry — no editor overlays, no drag/drop, no selection.
 *
 * This is the "customer website" side, so it uses raw HTML + Tailwind (not Axiom).
 */

type EleMap = Record<string, {type: string; properties: any}>;

function isAsideOutline(o: any): boolean {
	if (!o || typeof o !== "object") return false;
	if (o.role === "aside") return true;
	if (o.isAside === true) return true;
	const t = (o.title ?? "").toString().trim().toLowerCase();
	return t === "aside" || t === "sidebar";
}

function renderOutlineTree(outline: Outline) {
	return outline.tree.map((section: any, sindex: number) => {
		const hasBgImage = !!section.bgImage;

		return (
			<section
				key={section.id ?? sindex}
				className={`mb-6 last:mb-0 overflow-hidden rounded-[10px] ${
					hasBgImage ? "relative min-h-[500px] flex items-center" : "bg-white shadow-sm"
				}`}
				style={
					hasBgImage
						? {
								backgroundImage: `linear-gradient(rgba(25, 75, 255, 0.8), rgba(25, 75, 255, 0.8)), url(${section.bgImage})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
							}
						: {}
				}
			>
				<div
					className={
						hasBgImage ? "relative z-10 w-full p-12 md:p-20" : "w-full p-8 md:p-12"
					}
				>
					{(section.children || []).map((row: any, rIndex: number) => (
						<div
							className={`grid grid-flow-col auto-cols-fr gap-4 ${
								hasBgImage ? "text-white" : "text-[#05051F]"
							}`}
							key={row.id ?? rIndex}
						>
							{(row.children || []).map((col: any, cIndex: number) => {
								const colChildren = col.elements || col.children || [];

								return (
									<div key={col.id ?? cIndex}>
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
					))}
				</div>
			</section>
		);
	});
}

export default function SitePageRenderer({outlines}: {outlines: Outline[]}) {
	const mainOutlines = outlines.filter((o) => !isAsideOutline(o));
	const asideOutlines = outlines.filter((o) => isAsideOutline(o));
	const hasAside = asideOutlines.length > 0 && mainOutlines.length > 0;

	return (
		<div className="w-full p-6 md:p-6 flex-1" style={{background: "#F3F4F6"}}>
			{hasAside ? (
				<div className="grid grid-cols-[minmax(0,1fr)_minmax(0,340px)] gap-6 items-start">
					<div className="space-y-6">
						{mainOutlines.map((outline) => (
							<div key={outline.id}>{renderOutlineTree(outline)}</div>
						))}
					</div>
					<aside className="space-y-6">
						{asideOutlines.map((outline) => (
							<div key={outline.id}>{renderOutlineTree(outline)}</div>
						))}
					</aside>
				</div>
			) : (
				<div className="space-y-6">
					{[...mainOutlines, ...asideOutlines].map((outline) => (
						<div key={outline.id}>{renderOutlineTree(outline)}</div>
					))}
				</div>
			)}
		</div>
	);
}
