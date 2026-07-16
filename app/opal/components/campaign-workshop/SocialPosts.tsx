"use client";

import { ChannelCard } from "./ChannelCard";
import { SLOT_META, resolveSlotImage, type ImageOverrides, type ImageSlotId } from "./assets";

const CARDS: {
	aspect: string;
	objectPosition: string;
	slot: ImageSlotId;
	variant: "hero" | "standard";
	width: number;
}[] = [
	{ slot: "social-linkedin", aspect: "1 / 1", objectPosition: "50% 50%", variant: "hero", width: 532 },
	{ slot: "social-reel", aspect: "9 / 16", objectPosition: "50% 45%", variant: "standard", width: 303 },
	{ slot: "social-facebook", aspect: "16 / 9", objectPosition: "50% 50%", variant: "standard", width: 532 },
];

export function SocialPosts({
	imageOverrides,
	onEdit,
	onEditText,
	textOverrides,
}: {
	imageOverrides: ImageOverrides;
	onEdit: (slot: ImageSlotId) => void;
	onEditText: (fieldId: string, value: string) => void;
	textOverrides: Partial<Record<string, string>>;
}) {
	return (
		<section style={{ alignItems: "flex-start", display: "flex", gap: 28, minWidth: "max-content", padding: "4px 0 40px" }}>
			{CARDS.map(({ aspect, objectPosition, slot, variant, width }) => {
				const meta = SLOT_META[slot];
				const text = (id: string, fallback: string) => textOverrides[id] ?? fallback;
				return (
					<ChannelCard
						key={slot}
						altText={text(`${slot}-alt`, meta.altText)}
						aspectRatio={aspect}
						createdLabel={meta.createdLabel}
						image={resolveSlotImage(slot, imageOverrides)}
						imageAlt={`${meta.title} generated campaign asset`}
						objectPosition={objectPosition}
						onAltTextChange={(next) => onEditText(`${slot}-alt`, next)}
						onEdit={() => onEdit(slot)}
						onTitleChange={(next) => onEditText(`${slot}-title`, next)}
						title={text(`${slot}-title`, meta.title)}
						variant={variant}
						width={width}
					/>
				);
			})}
		</section>
	);
}
