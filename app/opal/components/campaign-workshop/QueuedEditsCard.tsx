"use client";

import { Box, Button } from "@optiaxiom/react";
import { IconTrashCan } from "@optiaxiom/icons";
import { Text } from "@/app/components/Text";
import type { EditPin } from "./CampaignWorkshopCanvas";

// Real queue list pinned to the shared Opal panel (via useLayout().setOpalActionCard)
// once the canvas has at least one open edit pin — replaces CanvasReadyCard until
// the queue is resolved. Matches the Image Gen II Figma list: number, label,
// one-line description, remove control, single Run Now action. No drag handle —
// nothing here is meaningfully reorderable at this scale.
export function QueuedEditsCard({ onRemove, onRunNow, pins }: { onRemove: (id: string) => void; onRunNow: () => void; pins: EditPin[] }) {
	return (
		<Box bg="bg.default" border="1" borderColor="border.tertiary" rounded="md" shadow="sm" display="flex" flexDirection="column" gap="12" mt="8" p="16">
			<Text fontSize="sm" fontWeight="700">
				Queued Image Edits ({pins.length})
			</Text>
			<Box display="flex" flexDirection="column" gap="10">
				{pins.map((pin) => (
					<Box key={pin.id} display="flex" alignItems="start" gap="10">
						<Box bg="bg.page" rounded="full" display="flex" alignItems="center" justifyContent="center" style={{ flexShrink: 0, height: 20, marginTop: 1, width: 20 }}>
							<Text fontSize="xs" fontWeight="700">
								{pin.number}
							</Text>
						</Box>
						<Box style={{ flex: 1, minWidth: 0 }}>
							<Text fontSize="sm" fontWeight="700">
								{pin.label}
							</Text>
							<Text fontSize="xs" color="fg.tertiary" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
								{pin.description}
							</Text>
						</Box>
						<Button appearance="subtle" size="sm" icon={<IconTrashCan size={14} />} aria-label={`Remove edit ${pin.number}`} onClick={() => onRemove(pin.id)} />
					</Box>
				))}
			</Box>
			<Button appearance="primary" size="sm" onClick={onRunNow}>
				Run Now
			</Button>
		</Box>
	);
}
