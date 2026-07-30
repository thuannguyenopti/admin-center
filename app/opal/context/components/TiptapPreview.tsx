"use client";

import {Box} from "@optiaxiom/react";
import {TiptapEditor} from "@/app/components/Opal/editor/TiptapEditor";

export function TiptapPreview({markdown, fileId}: {markdown: string; fileId: string}) {
	return (
		<Box
			key={fileId}
			style={{
				padding: "24px 28px",
				overflowY: "auto",
				height: "100%",
				boxSizing: "border-box",
			}}
		>
			<TiptapEditor key={fileId} initialMarkdown={markdown} editable={false} />
		</Box>
	);
}
