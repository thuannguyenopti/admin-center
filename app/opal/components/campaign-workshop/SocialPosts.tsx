"use client";

import { ChannelCard } from "./ChannelCard";
import { SLOT_META, resolveSlotImage, type ImageOverrides, type ImageSlotId } from "./assets";

const CARDS: {
	aspect: string;
	objectPosition: { default: string; updated: string };
	slot: ImageSlotId;
	variant: "hero" | "standard";
	width: number;
}[] = [
	{ slot: "social-linkedin", aspect: "1 / 1", objectPosition: { default: "48% 50%", updated: "50% 50%" }, variant: "hero", width: 532 },
	{ slot: "social-reel", aspect: "9 / 16", objectPosition: { default: "58% 50%", updated: "50% 50%" }, variant: "standard", width: 294 },
	{ slot: "social-facebook", aspect: "16 / 9", objectPosition: { default: "50% 50%", updated: "50% 50%" }, variant: "standard", width: 532 },
];

export function SocialPosts({
	imageOverrides,
	onEdit,
}: {
	imageOverrides: ImageOverrides;
	onEdit: (slot: ImageSlotId) => void;
}) {
	return (
		<section style={{ alignItems: "flex-start", display: "flex", gap: 28, minWidth: "max-content", padding: "4px 0 40px" }}>
			{CARDS.map(({ aspect, objectPosition, slot, variant, width }) => {
				const meta = SLOT_META[slot];
				const isUpdated = Boolean(imageOverrides[slot]);
				return (
					<ChannelCard
						key={slot}
						altText={meta.altText}
						aspectRatio={aspect}
						createdLabel={meta.createdLabel}
						image={resolveSlotImage(slot, imageOverrides)}
						imageAlt={`${meta.title} generated campaign asset`}
						objectPosition={isUpdated ? objectPosition.updated : objectPosition.default}
						onEdit={() => onEdit(slot)}
						title={meta.title}
						variant={variant}
						width={width}
					/>
				);
			})}
		</section>
	);
}
