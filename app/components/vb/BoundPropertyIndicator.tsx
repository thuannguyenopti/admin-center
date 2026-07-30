"use client";

import {Box, Tooltip} from "@optiaxiom/react";
import {IconLink} from "@/app/lib/axiom-icons";

export default function BoundPropertyIndicator() {
	return (
		<Tooltip content="Data-bound from connected content" auto>
			<Box display="inline-flex" cursor="default" color="fg.secondary">
				<IconLink size={14} />
			</Box>
		</Tooltip>
	);
}
