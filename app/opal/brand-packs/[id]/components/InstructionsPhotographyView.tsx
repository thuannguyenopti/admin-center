"use client";

import { Box, Button, Text } from "@optiaxiom/react";
import { EditablePanel } from "./EditablePanel";

const PANELS = [
	{
		title: "Photography Style",
		defaultContent:
			"Brand photography should feel authentic, energetic, and aspirational. Prioritise real moments over staged compositions.\n\n✓ Shoot in natural or controlled lighting that reflects the brand's energy.\n✓ Use a consistent colour grade aligned to the brand palette — warm tones with high contrast.\n✓ Feature diverse subjects that reflect the brand's audience.\n\n✕ Don't use overly staged or stock-style imagery.\n✕ Don't apply heavy filters that desaturate or flatten the image.\n✕ Don't crop at awkward points — give subjects breathing room.",
	},
	{
		title: "Composition Principles",
		defaultContent:
			"Use the rule of thirds to create dynamic, engaging compositions. Place key subjects at intersecting grid points.\n\nLeave negative space for text overlays when images will be used in marketing materials.\n\nFor hero images, ensure the main subject occupies at least 60% of the frame.",
	},
	{
		title: "Colour Grading",
		defaultContent:
			"All photography should pass through the approved colour grading LUT before publishing.\n\nTarget values: shadows slightly lifted (not pure black), mid-tones warm (+10 temperature), highlights slightly desaturated.\n\nDo not use auto-correction presets from stock photo services — always apply the brand grade.",
	},
	{
		title: "Usage Rights",
		defaultContent:
			"All photography must be either brand-owned, licensed through an approved stock provider, or sourced via a contracted photographer with a work-for-hire agreement.\n\nDocument all image licences in the DAM system before uploading to any channel.\n\nNever use social media screenshots or screenshots of competitor campaigns in brand materials.",
	},
];

export function InstructionsPhotographyView() {
	return (
		<Box style={{ flex: 1, overflowY: "auto", padding: "28px 40px", scrollbarWidth: "none" }}>
			<Box alignItems="center" display="flex" justifyContent="space-between" mb="24" style={{ flexShrink: 0 }}>
				<Box>
					<Text fontWeight="700" style={{ color: "var(--ax-colors-fg-default)", fontSize: 20, marginBottom: 4 }}>
						Photography
					</Text>
					<Text color="fg.secondary" style={{ fontSize: 14 }}>
						Brand photography style, composition, and usage guidelines.
					</Text>
				</Box>
				<Button appearance="subtle" size="md">
					<Box asChild alignItems="center" display="inline-flex" gap="8">
						<span>
							<img alt="" height={14} src="/opal-icon-nav.png" style={{ display: "block", flexShrink: 0 }} width={14} />
							Edit with Opal
						</span>
					</Box>
				</Button>
			</Box>
			<Box display="flex" flexDirection="column" gap="16">
				{PANELS.map((p) => (
					<EditablePanel key={p.title} defaultContent={p.defaultContent} title={p.title} />
				))}
			</Box>
		</Box>
	);
}
