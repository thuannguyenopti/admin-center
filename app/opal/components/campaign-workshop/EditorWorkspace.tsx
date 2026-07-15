"use client";

import { Box, Button, ToggleButton } from "@optiaxiom/react";
import {
	IconChevronDown,
	IconXmark,
	IconEraser,
	IconHighlighter,
	IconSquare,
} from "@optiaxiom/icons";
import { Text } from "@/app/components/Text";
import { OpalPanel } from "./OpalPanel";
import { SLOT_META, resolveSlotImage, type ImageOverrides, type ImageSlotId } from "./assets";

const DEFAULT_SLOT: ImageSlotId = "social-linkedin";

export function EditorWorkspace({
	confirmMode,
	editingSlot,
	imageOverrides,
	onConfirm,
	onGenerate,
	onRevise,
}: {
	confirmMode: boolean;
	editingSlot: ImageSlotId | null;
	imageOverrides: ImageOverrides;
	onConfirm: (target: "current" | "all") => void;
	onGenerate: () => void;
	onRevise: () => void;
}) {
	const slot = editingSlot ?? DEFAULT_SLOT;
	const meta = SLOT_META[slot];
	const image = confirmMode ? meta.updatedImage : resolveSlotImage(slot, imageOverrides);

	return (
		<Box style={{ display: "flex", height: "100%", minHeight: 0 }}>
			<Box style={{ background: "var(--ax-colors-bg-page)", display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
				<Box bg="bg.default" borderB="1" borderColor="border.tertiary" display="flex" alignItems="center" gap="8" px="16" style={{ height: 52 }}>
					<ToggleButton size="sm" appearance="subtle" pressed={false}>
						Elements
					</ToggleButton>
					<ToggleButton size="sm" appearance="subtle" pressed icon={<IconHighlighter size={16} />}>
						Brush
					</ToggleButton>
					<Button appearance="subtle" size="sm" icon={<IconSquare size={16} />} aria-label="Rectangle" />
					<Button appearance="subtle" size="sm" icon={<IconEraser size={16} />} aria-label="Eraser" />
					<Button appearance="subtle" size="sm">
						Clear
					</Button>
					<input aria-label="Brush size" type="range" min={1} max={100} defaultValue={42} style={{ width: 120 }} />
					<Button appearance="subtle" size="sm" icon={<IconChevronDown size={14} />} iconPosition="end">
						Channels
					</Button>
					<Button appearance="subtle" size="sm" icon={<IconChevronDown size={14} />} iconPosition="end">
						1:1
					</Button>
				</Box>
				<Box display="flex" alignItems="center" justifyContent="center" style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 24 }}>
					<Box style={{ height: "min(724px, calc(100vh - 150px))", position: "relative", width: "min(500px, calc((100vh - 150px) * 0.69))" }}>
						<img alt={`${meta.title} editor`} src={image} style={{ borderRadius: 4, display: "block", height: "100%", objectFit: "cover", width: "100%" }} />
						{!confirmMode && (
							<div style={{ background: "rgba(56, 123, 246, 0.26)", border: "2px solid rgba(255,255,255,0.88)", borderRadius: "44%", height: "30%", left: "29%", position: "absolute", top: "27%", width: "42%" }} />
						)}
						{!confirmMode && (
							<Box bg="bg.default" border="1" borderColor="border.secondary" rounded="md" shadow="md" p="12" style={{ left: "50%", position: "absolute", top: "36%", transform: "translateX(-50%)", width: 348 }}>
								<Box display="flex" alignItems="center" justifyContent="space-between" style={{ marginBottom: 8 }}>
									<Text fontSize="sm" fontWeight="700">
										{meta.title}
									</Text>
									<IconXmark size={15} />
								</Box>
								<textarea
									defaultValue="Change the image to a more epic running theme"
									style={{ border: "1px solid var(--ax-colors-border-secondary)", borderRadius: 6, color: "var(--ax-colors-fg-default)", fontFamily: "inherit", fontSize: 13, height: 76, lineHeight: "19px", padding: 9, resize: "none", width: "100%" }}
								/>
								<Box display="flex" gap="8" justifyContent="flex-end" style={{ marginTop: 10 }}>
									<Button appearance="subtle" size="sm">
										Remove
									</Button>
									<Button appearance="subtle" size="sm">
										Enlarge
									</Button>
									<Button appearance="primary" size="sm" icon={<IconChevronDown size={14} />} iconPosition="end" onClick={onGenerate}>
										Add to Queue
									</Button>
								</Box>
							</Box>
						)}
					</Box>
				</Box>
			</Box>
			<OpalPanel
				editingSlot={slot}
				mode={confirmMode ? "confirm" : "edit"}
				onConfirm={onConfirm}
				onRevise={onRevise}
				onRun={onGenerate}
			/>
		</Box>
	);
}
