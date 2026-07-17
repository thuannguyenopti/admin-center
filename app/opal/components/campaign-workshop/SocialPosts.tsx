"use client";

import { Text } from "@/app/components/Text";
import { EditableImage } from "./EditableImage";
import { SLOT_META, resolveSlotImage, type ImageOverrides, type ImageSlotId } from "./assets";

const CARDS: {
	aspect: string;
	caption: string;
	label: string;
	objectPosition: string;
	slot: ImageSlotId;
	width: number;
}[] = [
	{ slot: "social-linkedin", aspect: "1 / 1", caption: "LinkedIn · 1:1", label: "the LinkedIn photo", objectPosition: "50% 50%", width: 340 },
	{ slot: "social-reel", aspect: "9 / 16", caption: "Reel · 9:16", label: "the Reel photo", objectPosition: "50% 45%", width: 220 },
	{ slot: "social-facebook", aspect: "16 / 9", caption: "Facebook · 16:9", label: "the Facebook photo", objectPosition: "50% 50%", width: 340 },
];

export function SocialPosts({
	imageOverrides,
	onQueueEdit,
	onRemoveQueuedEdit,
	queuedEdits,
}: {
	imageOverrides: ImageOverrides;
	onQueueEdit: (slot: ImageSlotId, description: string) => void;
	onRemoveQueuedEdit: (slot: ImageSlotId) => void;
	queuedEdits: Partial<Record<ImageSlotId, { description: string }>>;
}) {
	return (
		<section style={{ alignItems: "flex-start", display: "flex", gap: 28, minWidth: "max-content", padding: "4px 0 40px" }}>
			{CARDS.map(({ aspect, caption, label, objectPosition, slot, width }) => {
				const meta = SLOT_META[slot];
				return (
					<div key={slot} style={{ width }}>
						<EditableImage
							slot={slot}
							aspectRatio={aspect}
							image={resolveSlotImage(slot, imageOverrides)}
							imageAlt={meta.altText}
							label={label}
							objectPosition={objectPosition}
							onQueueEdit={onQueueEdit}
							onRemoveQueuedEdit={onRemoveQueuedEdit}
							queuedEdit={queuedEdits[slot]}
						/>
						<Text fontSize="sm" color="fg.tertiary" style={{ marginTop: 8 }}>
							{caption}
						</Text>
					</div>
				);
			})}
		</section>
	);
}
