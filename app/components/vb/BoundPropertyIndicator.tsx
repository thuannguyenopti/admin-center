"use client";

import { Box, Tooltip } from "@optiaxiom/react";
import { IconLink } from "@tabler/icons-react";

export default function BoundPropertyIndicator() {
	return (
		<Tooltip content="Data-bound from connected content" auto>
			<Box display="inline-flex" cursor="default" color="fg.accent">
				<IconLink size={14} />
			</Box>
		</Tooltip>
	);
}
