"use client";

import { Box } from "@optiaxiom/react";
import { IconSparkles } from "@optiaxiom/icons";
import { Text } from "@/app/components/Text";
import { StatusTile } from "./MessageCards";

// Static completion card pinned to the real, shared Opal panel (via
// useLayout().setOpalActionCard) whenever the campaign canvas is open —
// announces that the agent finished generating the suite. No action buttons:
// review and editing happen on the canvas itself, not in the chat.
export function CanvasReadyCard() {
	return (
		<Box bg="bg.default" border="1" borderColor="border.tertiary" rounded="md" shadow="sm" display="flex" flexDirection="column" gap="12" mt="8" p="16">
			<Box display="flex" alignItems="center" gap="10">
				<Box bg="bg.page" rounded="md" display="flex" alignItems="center" justifyContent="center" style={{ height: 30, width: 30 }} color="fg.success">
					<IconSparkles size={15} />
				</Box>
				<Box>
					<Text fontSize="sm" fontWeight="700">
						Campaign suite ready for review
					</Text>
					<Text fontSize="xs" color="fg.tertiary">
						Boston Marathon 2026 · Stride
					</Text>
				</Box>
			</Box>
			<Box display="grid" gap="8" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
				<StatusTile label="Blog" value="Built" />
				<StatusTile label="Social" value="3 assets" />
				<StatusTile label="Email" value="Ready" />
			</Box>
		</Box>
	);
}
