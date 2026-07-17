"use client";

import { Box, Button, SegmentedControl, SegmentedControlItem, Text } from "@optiaxiom/react";
import {IconArrowBackUp, IconCopy, IconDownload, IconXmark} from "@/app/lib/axiom-icons";

export function CanvasToolbar({
	canvasMode,
	setCanvasMode,
	saveState,
	packSelected,
	onClose,
	onGeneratePack,
}: {
	canvasMode: "generate" | "edit";
	setCanvasMode: (mode: "generate" | "edit") => void;
	saveState: string;
	packSelected: boolean;
	onClose: () => void;
	onGeneratePack: () => void;
}) {
	return (
		<Box
			display="flex"
			alignItems="center"
			justifyContent="space-between"
			style={{ flexWrap: "wrap", rowGap: 12, padding: "14px 24px", flexShrink: 0 }}
			borderB="1"
			borderColor="border.tertiary"
			bg="bg.default"
		>
			<Box display="flex" alignItems="center" gap="8">
				<SegmentedControl
					value={canvasMode}
					onValueChange={(value: string) => setCanvasMode(value as "generate" | "edit")}
				>
					<SegmentedControlItem value="generate">Generate</SegmentedControlItem>
					<SegmentedControlItem value="edit">Edit</SegmentedControlItem>
				</SegmentedControl>
				<Text color="fg.secondary" fontSize="sm">{saveState}.</Text>
			</Box>

			<Box display="flex" alignItems="center" gap="12">
				<Button
					appearance={packSelected ? "primary" : "default"}
					disabled={!packSelected}
					onClick={onGeneratePack}
				>
					Generate pack
				</Button>
				<Button appearance="default">Add to task</Button>
				<Button appearance="default">Add to library</Button>
				<Button appearance="default" icon={<IconDownload size={16} />}>Download</Button>
				<Button appearance="subtle" icon={<IconArrowBackUp size={18} />} aria-label="Undo" />
				<Button appearance="subtle" icon={<IconCopy size={18} />} aria-label="Copy" />
				<Button appearance="subtle" icon={<IconXmark size={18} />} aria-label="Close canvas" onClick={onClose} />
			</Box>
		</Box>
	);
}
