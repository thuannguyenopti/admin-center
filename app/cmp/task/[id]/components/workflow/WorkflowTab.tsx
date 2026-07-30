"use client";

import {Box} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import type {ReactNode} from "react";

export function WorkflowTab({active = false, children}: {active?: boolean; children: ReactNode}) {
	return (
		<Box
			style={{
				borderBottom: active
					? "2px solid var(--ax-colors-fg-default)"
					: "2px solid transparent",
				paddingBottom: 10,
			}}
		>
			<Text
				color={active ? "fg.default" : "fg.tertiary"}
				style={{fontSize: 14, fontWeight: 500, lineHeight: "20px", maxWidth: "none"}}
			>
				{children}
			</Text>
		</Box>
	);
}
