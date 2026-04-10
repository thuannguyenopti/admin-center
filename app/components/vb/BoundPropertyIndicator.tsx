"use client";

import { Tooltip } from "@optiaxiom/react";
import { IconLink } from "@tabler/icons-react";

export default function BoundPropertyIndicator() {
	return (
		<Tooltip content="Data-bound from connected content" auto>
			<span style={{ display: "inline-flex", cursor: "default", color: "var(--ax-color-fg-accent)" }}>
				<IconLink size={14} />
			</span>
		</Tooltip>
	);
}
