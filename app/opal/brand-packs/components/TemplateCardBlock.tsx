"use client";

/**
 * TemplateCardBlock — AdaptiveBlock that renders a brand-pack template
 * as a rich card inside the Opal chat thread.
 *
 * Register once (module-level side-effect) so OpalMessage can look it up
 * via getAdaptiveBlockComponent("template_card").
 */

import { registerAdaptiveBlock, type AdaptiveBlockComponentProps } from "@/app/components/ai/AdaptiveBlockRegistry";
import { Box, Text } from "@optiaxiom/react";

type TemplateCardMeta = {
	template: {
		id: string;
		name: string;
		thumb: string;
		format: string;
		ratio: string;
		channel: string;
	};
};

function TemplateCardBlock({ metadata }: AdaptiveBlockComponentProps) {
	const { template } = metadata as TemplateCardMeta;

	return (
		<Box
			display="flex"
			alignItems="center"
			gap="12"
			style={{
				background: "var(--ax-colors-bg-secondary)",
				border: "1px solid var(--ax-colors-border-tertiary)",
				borderRadius: 12,
				padding: "10px 14px",
				maxWidth: 320,
			}}
		>
			{/* Thumbnail */}
			<Box
				overflow="hidden"
				style={{
					borderRadius: 8,
					flexShrink: 0,
					height: 52,
					width: 78,
				}}
			>
				<img
					src={template.thumb}
					alt={template.name}
					style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
				/>
			</Box>

			{/* Info */}
			<Box display="flex" flexDirection="column" gap="2" style={{ minWidth: 0 }}>
				<Text
					fontWeight="600"
					style={{
						fontSize: 13,
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
						color: "var(--ax-colors-fg-default)",
					}}
				>
					{template.name}
				</Text>
				<Text
					style={{
						fontSize: 11,
						color: "var(--ax-colors-fg-tertiary)",
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{template.format} · {template.ratio} · {template.channel}
				</Text>
				<Box
					display="inline-flex"
					alignItems="center"
					gap="4"
					style={{
						background: "linear-gradient(135deg, #ABFF44 0%, #00C9A7 60%, #2979FF 100%)",
						borderRadius: 999,
						padding: "1px 8px",
						marginTop: 2,
						width: "fit-content",
					}}
				>
					<Text style={{ fontSize: 10, fontWeight: 700, color: "#1a2e1a", letterSpacing: "0.03em" }}>
						TEMPLATE SELECTED
					</Text>
				</Box>
			</Box>
		</Box>
	);
}

// Register at module load time — runs once when this file is imported
registerAdaptiveBlock("template_card", TemplateCardBlock);

export { TemplateCardBlock };
