"use client";

import React from "react";
import { BlockRegistry } from "@/app/components/vb/blocks";
import StrideColumnGrid from "./StrideColumnGrid";

interface PropertyBasedPageRendererProps {
	contentTypeId: string;
	properties: Record<string, any>;
	pageId: string;
}

export default function PropertyBasedPageRenderer({
	contentTypeId,
	properties,
	pageId,
}: PropertyBasedPageRendererProps) {
	const BlockComponent = BlockRegistry[contentTypeId];

	if (!BlockComponent) {
		console.warn(`No renderer found for content type: ${contentTypeId}`);
		return (
			<div className="flex-1 flex items-center justify-center py-32">
				<p className="text-gray-400 text-lg">
					No renderer available for this content type.
				</p>
			</div>
		);
	}

	return (
		<div className="flex-1 w-full font-stride-sans relative" style={{backgroundColor: "#F2F8FC"}}>
			<StrideColumnGrid />
			<BlockComponent properties={properties} pageId={pageId} />
		</div>
	);
}
