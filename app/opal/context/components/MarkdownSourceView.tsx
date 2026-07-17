"use client";

import dynamic from "next/dynamic";
import {Box} from "@optiaxiom/react";
import {useCollabDoc} from "@/app/components/Opal/editor/useCollabDoc";

const CodeMirrorEditor = dynamic(
	() => import("@/app/components/Opal/editor/CodeMirrorEditor").then((m) => m.CodeMirrorEditor),
	{ssr: false}
);

export function MarkdownSourceView({markdown}: {markdown: string}) {
	const collabDoc = useCollabDoc(markdown);
	return (
		<Box style={{height: "100%", overflow: "hidden"}}>
			<CodeMirrorEditor collabDoc={collabDoc} language="markdown" darkMode={false} />
		</Box>
	);
}
