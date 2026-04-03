"use client";

import type { ReactNode } from "react";
import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";

export function MetadataRow({
	icon,
	label,
	link = false,
}: {
	icon: ReactNode;
	label: string;
	link?: boolean;
}) {
	return (
		<Box alignItems="center" display="flex" gap="10">
			<Box alignItems="center" bg="bg.secondary" display="flex" justifyContent="center" rounded="full" style={{ height: 22, width: 22 }}>
				{icon}
			</Box>
			<Text color={link ? "fg.accent" : "fg.default"} fontSize="sm">{label}</Text>
		</Box>
	);
}
