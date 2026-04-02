"use client";

import { Text } from "@/app/components/Text";

export function PreviewLabel({ children }: { children: string }) {
	return (
		<Text color="fg.tertiary" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
			{children}
		</Text>
	);
}
