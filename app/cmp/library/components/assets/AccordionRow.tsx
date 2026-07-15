"use client";

import { useState } from "react";
import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { IconChevronDown, IconChevronRight } from "@optimizely/axiom-icons";

/**
 * Metadata disclosure row for AssetFocusPanel — matches Figma's compact list-item
 * treatment (chevron + label, ~40px row, 4px gap between instances) rather than
 * bordered/padded sections, since the panel now owns its own outer padding.
 */
export function AccordionRow({
	title,
	defaultOpen,
	children,
}: {
	title: string;
	defaultOpen?: boolean;
	children: React.ReactNode;
}) {
	const [open, setOpen] = useState(!!defaultOpen);
	return (
		<Box>
			<Box
				alignItems="center"
				display="flex"
				gap="8"
				role="button"
				tabIndex={0}
				style={{ cursor: "pointer", minHeight: 40 }}
				onClick={() => setOpen((v) => !v)}
				onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((v) => !v); } }}
			>
				{open ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
				<Text color="fg.default" fontSize="md" fontWeight="500">{title}</Text>
			</Box>
			{open && <Box style={{ paddingLeft: 22, paddingBottom: 12 }}>{children}</Box>}
		</Box>
	);
}
