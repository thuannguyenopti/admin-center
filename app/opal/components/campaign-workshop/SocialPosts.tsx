"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { EditableImage } from "./EditableImage";
import { EditableText } from "./EditableText";
import { SLOT_META, resolveSlotImage, type ImageOverrides, type ImageSlotId } from "./assets";

const CARDS: {
	aspect: string;
	caption: string;
	defaultPostCopy: string;
	label: string;
	objectPosition: string;
	slot: ImageSlotId;
	width: number;
}[] = [
	{
		slot: "social-linkedin",
		aspect: "1 / 1",
		caption: "LinkedIn · 1:1",
		defaultPostCopy:
			"Boston is more than a race day — it's months of quiet training turned into one electric mile. Proud to fuel every Stride runner toeing the line this April.",
		label: "LinkedIn Photo",
		objectPosition: "50% 50%",
		width: 340,
	},
	{
		slot: "social-reel",
		aspect: "9 / 16",
		caption: "Reel · 9:16",
		defaultPostCopy: "Race week starts now. Lace up. 🏁 #BostonMarathon2026",
		label: "Reel Photo",
		objectPosition: "50% 45%",
		width: 220,
	},
	{
		slot: "social-facebook",
		aspect: "16 / 9",
		caption: "Facebook · 16:9",
		defaultPostCopy:
			"From Hopkinton to Boylston, every mile has a crowd behind it. Tag a runner you're cheering on this Boston Marathon.",
		label: "Facebook Photo",
		objectPosition: "50% 50%",
		width: 340,
	},
];

export function SocialPosts({
	imageOverrides,
	onEditText,
	textOverrides,
}: {
	imageOverrides: ImageOverrides;
	onEditText: (fieldId: string, value: string) => void;
	textOverrides: Partial<Record<string, string>>;
}) {
	const text = (id: string, fallback: string) => textOverrides[id] ?? fallback;

	return (
		<section style={{ alignItems: "flex-start", display: "flex", gap: 28, minWidth: "max-content", padding: "4px 0 40px" }}>
			{CARDS.map(({ aspect, caption, defaultPostCopy, label, objectPosition, slot, width }) => {
				const meta = SLOT_META[slot];
				const fieldId = `${slot}-caption`;
				return (
					<div key={slot} style={{ width }}>
						<EditableImage
							aspectRatio={aspect}
							image={resolveSlotImage(slot, imageOverrides)}
							imageAlt={meta.altText}
							label={label}
							objectPosition={objectPosition}
						/>
						<Box data-edit-label={`${label} Caption`} style={{ marginTop: 10 }}>
							<EditableText
								ariaLabel={`${label} caption`}
								multiline
								value={text(fieldId, defaultPostCopy)}
								onChange={(v) => onEditText(fieldId, v)}
								style={{ color: "var(--ax-colors-fg-default)", fontSize: 14, lineHeight: "20px" }}
							/>
						</Box>
						<Text fontSize="sm" color="fg.tertiary" style={{ marginTop: 6 }}>
							{caption}
						</Text>
					</div>
				);
			})}
		</section>
	);
}
