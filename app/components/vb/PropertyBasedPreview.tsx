"use client";

import React, {useEffect, useState, useRef} from "react";
import PreviewWrapper from "./PreviewWrapper";
import type {PreviewSettings} from "./PreviewSettings";
import {BlockRegistry} from "./blocks";
import StrideHeaderContent from "../../site/StrideHeaderContent";
import {IconMenu2, IconX} from "@tabler/icons-react";

const MOBILE_BP = 1024;

export default function PropertyBasedPreview({
	contentTypeId,
	properties,
	preview,
}: {
	contentTypeId: string;
	properties: Record<string, any>;
	preview: PreviewSettings;
}) {
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const [viewportW, setViewportW] = useState<number>(() => {
		return preview.mode === "responsive" ? 0 : preview.width;
	});

	useEffect(() => {
		if (preview.mode !== "responsive") {
			setViewportW(preview.width);
			return;
		}

		const el = scrollRef.current;
		if (!el) return;

		const update = () => setViewportW(el.clientWidth);
		update();

		const ro = new ResizeObserver(update);
		ro.observe(el);
		return () => ro.disconnect();
	}, [preview.mode, preview.width]);

	const isMobileViewport = viewportW > 0 && viewportW <= MOBILE_BP;
	const BlockComponent = BlockRegistry[contentTypeId];

	if (!BlockComponent) {
		return (
			<PreviewWrapper
				mode={preview.mode}
				width={preview.width}
				maxWidth={preview.maxWidth}
				height="fill"
				className="h-full min-h-0"
				contentRef={scrollRef}
			>
				{/* Header */}
				<div className="w-full bg-white px-4 md:px-8 py-4 md:py-5 flex items-center justify-between border-b border-gray-100 shrink-0 sticky top-0 z-50 shadow-sm">
					<StrideHeaderContent
						isMobile={isMobileViewport}
						menuIcon={<IconMenu2 size={24} />}
						closeIcon={<IconX size={24} />}
					/>
				</div>

				{/* Empty state */}
				<div className="flex-1 flex items-center justify-center py-32 bg-[#F3F4F6]">
					<p className="text-gray-400 text-lg">
						No preview available for this content type.
					</p>
				</div>
			</PreviewWrapper>
		);
	}

	return (
		<PreviewWrapper
			mode={preview.mode}
			width={preview.width}
			maxWidth={preview.maxWidth}
			height="fill"
			className="h-full min-h-0"
			contentRef={scrollRef}
		>
			{/* Header */}
			<div className="w-full bg-white px-4 md:px-8 py-4 md:py-5 flex items-center justify-between border-b border-gray-100 shrink-0 sticky top-0 z-50 shadow-sm">
				<StrideHeaderContent
					isMobile={isMobileViewport}
					menuIcon={<IconMenu2 size={24} />}
					closeIcon={<IconX size={24} />}
				/>
			</div>

			{/* Content */}
			<div className="flex-1 bg-[#F3F4F6]">
				<BlockComponent properties={properties} />
			</div>
		</PreviewWrapper>
	);
}
