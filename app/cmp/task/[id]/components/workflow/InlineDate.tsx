"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import {IconCalendar} from "@/app/lib/axiom-icons";

export function InlineDate({ label }: { label: string }) {
	return (
		<Box alignItems="center" display="flex" gap="8">
			<Box
				alignItems="center"
				bg="bg.tertiary"
				display="flex"
				justifyContent="center"
				rounded="full"
				style={{ height: 20, width: 20 }}
			>
				<IconCalendar color="var(--ax-colors-fg-secondary)" size={11} />
			</Box>
			<Text
				color="fg.default"
				style={{
					fontSize: 12,
					fontWeight: 600,
					letterSpacing: "0.01px",
					lineHeight: "16px",
					maxWidth: "none",
					textAlign: "center",
					whiteSpace: "nowrap",
				}}
			>
				{label}
			</Text>
		</Box>
	);
}
