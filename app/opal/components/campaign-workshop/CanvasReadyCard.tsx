"use client";

import { Badge, Box, Button } from "@optiaxiom/react";
import { IconCircleCheck, IconPenToSquare, IconSparkles } from "@optiaxiom/icons";
import { Text } from "@/app/components/Text";
import { StatusTile } from "./MessageCards";

// Matches the established Opal generated-content card pattern (see
// app/components/Opal/EditorOutputCard.tsx: bordered header with a status
// badge, content area, footer with a primary action) rather than a one-off
// shape — this is the card that's pinned to the real, shared Opal panel while
// canvas is open (via useLayout().setOpalActionCard) AND left behind in the
// real Messages thread once it closes (see messages/page.tsx's onOpenCanvas),
// so onEdit is how you always get back into canvas from either surface.
export function CanvasReadyCard({ onEdit }: { onEdit?: () => void }) {
	return (
		<Box border="1" borderColor="border.secondary" rounded="xl" display="flex" flexDirection="column" mt="8" style={{ background: "var(--ax-colors-bg-default)", overflow: "hidden" }}>
			<Box display="flex" alignItems="center" gap="10" px="16" py="12" borderB="1" borderColor="border.secondary">
				<Box bg="bg.success.subtle" rounded="md" display="flex" alignItems="center" justifyContent="center" style={{ height: 32, width: 32, flexShrink: 0 }}>
					<IconSparkles size={16} style={{ color: "var(--ax-colors-fg-success-strong)" }} />
				</Box>
				<Box flex="1" display="flex" flexDirection="column" gap="2">
					<Text fontSize="md" fontWeight="600" color="fg.default">
						Campaign suite ready for review
					</Text>
					<Text fontSize="xs" color="fg.tertiary">
						Boston Marathon 2026 · Stride
					</Text>
				</Box>
				<Box display="flex" alignItems="center" gap="4">
					<IconCircleCheck size={12} style={{ color: "var(--ax-colors-fg-success)" }} />
					<Badge intent="success" variant="subtle">Ready</Badge>
				</Box>
			</Box>
			<Box display="grid" gap="8" px="16" py="12" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
				<StatusTile label="Blog" value="Built" />
				<StatusTile label="Social" value="3 assets" />
				<StatusTile label="Email" value="Ready" />
			</Box>
			{onEdit && (
				<Box display="flex" justifyContent="flex-end" px="16" py="10" borderT="1" borderColor="border.secondary">
					<Button appearance="primary" size="sm" icon={<IconPenToSquare size={14} />} onClick={onEdit}>
						Edit in Canvas
					</Button>
				</Box>
			)}
		</Box>
	);
}
