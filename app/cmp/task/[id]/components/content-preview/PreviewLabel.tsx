"use client";

import { Text } from "@/app/components/Text";

export function PreviewLabel({ children }: { children: string }) {
	return (
		<Text color="fg.secondary" fontSize="md" fontWeight="600">
			{children}
		</Text>
	);
}
