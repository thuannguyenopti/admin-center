"use client";

import { Box, Tooltip } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { IconLink } from "@tabler/icons-react";

export default function BoundPropertyIndicator() {
	return (
		<Tooltip content="This property is data-bound from connected content" auto>
			<Box
				display="inline-flex"
				alignItems="center"
				gap="4"
				mb="4"
				style={{ cursor: "default" }}
			>
				<IconLink size={14} color="var(--ax-color-fg-accent)" />
				<Text fontSize="xs" color="fg.accent">
					Data-bound
				</Text>
			</Box>
		</Tooltip>
	);
}
