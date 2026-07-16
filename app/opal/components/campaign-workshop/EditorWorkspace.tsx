"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { OpalPanel } from "./OpalPanel";
import { IMAGE_LIBRARY, SLOT_META, resolveSlotImage, type ImageOverrides, type ImageSlotId } from "./assets";

const DEFAULT_SLOT: ImageSlotId = "social-linkedin";

// Direct photo picker — replaces the old fixed paint-mask/prompt wizard that
// always resolved to the same one pre-baked "updated" image regardless of
// slot or input. Every real photo in the workshop is a real, distinct
// choice here; picking one commits immediately (Editor interaction model:
// direct manipulation, no confirm step).
export function EditorWorkspace({
	editingSlot,
	imageOverrides,
	onSelectImage,
}: {
	editingSlot: ImageSlotId | null;
	imageOverrides: ImageOverrides;
	onSelectImage: (url: string) => void;
}) {
	const slot = editingSlot ?? DEFAULT_SLOT;
	const meta = SLOT_META[slot];
	const currentImage = resolveSlotImage(slot, imageOverrides);
	const alternatives = IMAGE_LIBRARY.filter((image) => image.src !== currentImage);

	return (
		<Box style={{ display: "flex", height: "100%", minHeight: 0 }}>
			<Box style={{ background: "var(--ax-colors-bg-page)", display: "flex", flex: 1, flexDirection: "column", minHeight: 0, overflow: "auto", padding: 24 }}>
				<Text fontSize="lg" fontWeight="700">
					{meta.title}
				</Text>
				<Text fontSize="sm" color="fg.tertiary" style={{ marginBottom: 20 }}>
					Choose a different photo for this asset
				</Text>

				<Box border="1" borderColor="border.secondary" rounded="md" style={{ marginBottom: 28, maxWidth: 480, overflow: "hidden" }}>
					<img alt={`Current image for ${meta.title}`} src={currentImage} style={{ display: "block", height: "auto", width: "100%" }} />
				</Box>

				<Text fontSize="sm" fontWeight="700" style={{ marginBottom: 12 }}>
					Other photos in this workshop
				</Text>
				<Box display="grid" gap="12" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", maxWidth: 660 }}>
					{alternatives.map((image) => (
						<button
							key={image.id}
							type="button"
							onClick={() => onSelectImage(image.src)}
							style={{
								background: "var(--ax-colors-bg-default)",
								border: "1px solid var(--ax-colors-border-secondary)",
								borderRadius: 8,
								cursor: "pointer",
								overflow: "hidden",
								padding: 0,
								textAlign: "left",
								transition: "border-color 0.15s",
							}}
							onMouseEnter={(event) => {
								event.currentTarget.style.borderColor = "var(--ax-colors-border-accent, var(--ax-colors-fg-default))";
							}}
							onMouseLeave={(event) => {
								event.currentTarget.style.borderColor = "var(--ax-colors-border-secondary)";
							}}
						>
							<img alt={image.label} src={image.src} style={{ aspectRatio: "4 / 3", display: "block", objectFit: "cover", width: "100%" }} />
							<Box p="8">
								<Text fontSize="sm" fontWeight="500">
									{image.label}
								</Text>
							</Box>
						</button>
					))}
				</Box>
			</Box>
			<OpalPanel editingSlot={slot} imageOverrides={imageOverrides} mode="edit" />
		</Box>
	);
}
