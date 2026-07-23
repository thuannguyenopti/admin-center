"use client";

import { Box, Button, Text } from "@optiaxiom/react";
import { EditablePanel } from "./EditablePanel";

const PANELS = [
	{
		title: "Logo Usage",
		defaultContent:
			"Always use the approved logo files from the brand asset library. Do not recreate the logo.\n\n✓ Use on white or light backgrounds with adequate clear space.\n✓ Maintain the correct proportions — never stretch or distort.\n✓ Use the dark variant on light backgrounds and the light variant on dark or coloured backgrounds.\n\n✕ Don't add drop shadows, outlines, or effects to the logo.\n✕ Don't place the logo on a busy pattern or image without sufficient contrast.\n✕ Don't use old or unapproved logo versions.",
	},
	{
		title: "Clear Space",
		defaultContent:
			"The minimum clear space around the logo is equal to the height of the brand mark's cap height (X).\n\nAlways maintain this clear space on all sides. No text, graphics, or other elements should enter this zone.\n\nFor digital placements, use a minimum of 16px margin. For print, scale the clear space proportionally.",
	},
	{
		title: "Minimum Sizes",
		defaultContent:
			"Digital: 80px wide (horizontal logo), 32px (icon mark only).\nPrint: 25mm wide (horizontal logo), 10mm (icon mark only).\n\nBelow these sizes, switch to the simplified icon mark variant. Never use the full wordmark at very small scales where legibility is compromised.",
	},
	{
		title: "Brand Devices & Co-Branding",
		defaultContent:
			"When placing the logo alongside partner logos, maintain equal visual weight and clear space between marks.\n\nDo not combine the logo with other brand wordmarks in a single lockup without approval.\n\nFor event materials and sponsorships, refer to the co-branding guidelines deck for approved lockup configurations.",
	},
];

export function InstructionsLogoView() {
	return (
		<Box style={{ flex: 1, overflowY: "auto", padding: "28px 40px", scrollbarWidth: "none" }}>
			<Box alignItems="center" display="flex" justifyContent="space-between" mb="24" style={{ flexShrink: 0 }}>
				<Box>
					<Text fontWeight="700" style={{ color: "var(--ax-colors-fg-default)", fontSize: 20, marginBottom: 4 }}>
						Logo & Devices
					</Text>
					<Text color="fg.secondary" style={{ fontSize: 14 }}>
						Guidelines for correct logo usage, clear space, and co-branding.
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
