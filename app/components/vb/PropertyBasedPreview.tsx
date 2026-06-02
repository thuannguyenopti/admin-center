"use client";

import React, {useEffect, useState, useRef} from "react";
import {Box} from "@optiaxiom/react";
import PreviewWrapper from "./PreviewWrapper";
import type {PreviewSettings} from "./PreviewSettings";
import {BlockRegistry} from "./blocks";
import StrideHeaderContent from "../../site/StrideHeaderContent";
import StrideHeaderWrapper from "../../site/StrideHeaderWrapper";
import StrideFooter from "../../site/StrideFooter";
import StrideColumnGrid from "../../site/StrideColumnGrid";
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

	return (
		<Box
			bg="bg.tertiary"
			mt="8"
			mr="8"
			rounded="xl"
			className="grow"
			border="1"
			borderColor="border.tertiary"
			style={{
				height: "100%",
				minHeight: 0,
				overflow: "hidden",
				zIndex: 50,
				boxShadow: "inset 0 0 40px rgba(0,0,0,0.1), 0 20px 70px 0px rgba(0,0,0,0.05), 0 1px 1px 0 rgba(0,0,0,0.01)",
			}}
		>
			<PreviewWrapper
				mode={preview.mode}
				width={preview.width}
				maxWidth={preview.maxWidth}
				height="fill"
				className="h-full min-h-0"
				contentRef={scrollRef}
			>
				<div className="relative w-full h-full flex flex-col">
					{/* Header — same transparent style as site */}
					<StrideHeaderWrapper positioning="absolute" useMaxWidth={true}>
						<StrideHeaderContent
							isMobile={isMobileViewport}
							menuIcon={<IconMenu2 size={24} />}
							closeIcon={<IconX size={24} />}
						/>
					</StrideHeaderWrapper>

					{/* Content */}
					<div className="w-full font-stride-sans relative" style={{background: "#F2F8FC"}}>
						<StrideColumnGrid />
						{BlockComponent ? (
							<BlockComponent properties={properties} />
						) : (
							<div className="flex-1 flex items-center justify-center py-32">
								<p className="text-gray-400 text-lg">
									No preview available for this content type.
								</p>
							</div>
						)}
					</div>

					<StrideFooter />
				</div>
			</PreviewWrapper>
		</Box>
	);
}
