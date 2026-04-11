"use client";

import { Box } from "@optiaxiom/react";
import { richTextContentStyles } from "../../constants";

export function BriefBody({ content }: { content: string }) {
	return (
		<>
			<style>{richTextContentStyles}</style>
			<Box style={{ maxWidth: "none" }}>
				<div className="brief-rich-content" dangerouslySetInnerHTML={{ __html: content }} />
			</Box>
		</>
	);
}
