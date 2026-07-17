"use client";

import { Box, Button } from "@optiaxiom/react";
import { IconSearch, IconPaperPlaneTop, IconTrashCan } from "@optiaxiom/icons";
import { Text } from "@/app/components/Text";
import { SLOT_META, resolveSlotImage, type ImageOverrides, type ImageSlotId } from "./assets";

export function OpalPanel({
	editingSlot,
	imageOverrides,
	mode,
	onOpenWorkflow,
	onRemoveQueuedEdit,
	onRunQueuedEdits,
	queuedEdits,
}: {
	editingSlot: ImageSlotId;
	imageOverrides?: ImageOverrides;
	mode: "canvas" | "context" | "result";
	onOpenWorkflow?: () => void;
	onRemoveQueuedEdit?: (slot: ImageSlotId) => void;
	onRunQueuedEdits?: () => void;
	queuedEdits?: Partial<Record<ImageSlotId, { description: string }>>;
}) {
	const meta = SLOT_META[editingSlot];
	const currentImage = resolveSlotImage(editingSlot, imageOverrides ?? {});
	const queuedEntries = Object.entries(queuedEdits ?? {}) as [ImageSlotId, { description: string }][];

	return (
		<Box bg="bg.default" borderL="1" borderColor="border.tertiary" style={{ display: "flex", flex: "0 0 360px", flexDirection: "column", minHeight: 0 }}>
			<Box borderB="1" borderColor="border.tertiary" display="flex" alignItems="center" justifyContent="space-between" px="16" style={{ height: 56 }}>
				<Box display="flex" alignItems="center" gap="10">
					<img alt="" src="/opal-orb.png" style={{ borderRadius: 8, height: 32, width: 32 }} />
					<Box>
						<Text fontSize="sm" fontWeight="700">
							Opal
						</Text>
						<Text fontSize="xs" color="fg.tertiary">
							Workspace assistant
						</Text>
					</Box>
				</Box>
				<IconSearch size={18} />
			</Box>

			<Box style={{ display: "flex", flex: 1, flexDirection: "column", gap: 14, minHeight: 0, overflow: "auto", padding: 16 }}>
				{mode !== "canvas" && (
					<Box border="1" borderColor="border.tertiary" rounded="md" p="10" display="flex" alignItems="center" gap="10">
						<img alt="Selected asset" src={currentImage} style={{ borderRadius: 6, height: 58, objectFit: "cover", width: 58 }} />
						<Box>
							<Text fontSize="sm" fontWeight="700">
								{meta.title}
							</Text>
							<Text fontSize="xs" color="fg.tertiary">
								Selected asset
							</Text>
						</Box>
					</Box>
				)}

				{queuedEntries.length > 0 && (
					<Box border="1" borderColor="border.tertiary" rounded="md" p="12">
						<Text fontSize="sm" fontWeight="700" style={{ marginBottom: 10 }}>
							Queued Image Edits ({queuedEntries.length})
						</Text>
						<Box display="flex" flexDirection="column" gap="10">
							{queuedEntries.map(([slot, edit]) => (
								<Box key={slot} display="flex" alignItems="start" justifyContent="space-between" gap="8">
									<Box style={{ minWidth: 0 }}>
										<Text fontSize="sm" fontWeight="700">
											{SLOT_META[slot].title}
										</Text>
										<Text fontSize="xs" color="fg.tertiary">
											{edit.description}
										</Text>
									</Box>
									<Button appearance="subtle" size="sm" icon={<IconTrashCan size={14} />} aria-label={`Remove queued edit for ${SLOT_META[slot].title}`} onClick={() => onRemoveQueuedEdit?.(slot)} />
								</Box>
							))}
						</Box>
						<Button appearance="primary" size="sm" style={{ marginTop: 12, width: "100%" }} onClick={onRunQueuedEdits}>
							Run Now
						</Button>
					</Box>
				)}

				{mode === "result" && (
					<>
						<Box bg="bg.page" rounded="md" px="12" py="10" style={{ alignSelf: "flex-end", maxWidth: 240 }}>
							<Text fontSize="sm">Update this image in this task</Text>
						</Box>
						<Text fontSize="md">The selected image has been updated.</Text>
						<Button appearance="subtle" size="sm" style={{ alignSelf: "flex-start" }} onClick={onOpenWorkflow}>
							Open workflow
						</Button>
					</>
				)}
			</Box>

			<Box display="flex" flexDirection="column" gap="8" m="16" style={{ flexShrink: 0 }}>
				<Box border="1" borderColor="border.tertiary" rounded="md" display="flex" alignItems="center" justifyContent="space-between" px="12" style={{ height: 42 }}>
					<Text fontSize="sm" color="fg.tertiary">
						Message Opal
					</Text>
					<IconPaperPlaneTop size={17} />
				</Box>
				{mode === "canvas" && (
					<Box display="flex" gap="8">
						<Box bg="bg.secondary" rounded="sm" px="8" py="2">
							<Text fontSize="xs" fontWeight="700" color="fg.default" style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}>
								Brand Pack
							</Text>
						</Box>
						<Box bg="bg.secondary" rounded="sm" px="8" py="2">
							<Text fontSize="xs" fontWeight="700" color="fg.default" style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}>
								Boston Marathon 2026
							</Text>
						</Box>
					</Box>
				)}
			</Box>
		</Box>
	);
}
