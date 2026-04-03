"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import type { AssetItem } from "../../types";

export function AssetTooltipContent({ asset }: { asset: AssetItem }) {
	return (
		<Box display="flex" flexDirection="column" style={{ gap: 4, maxWidth: 240 }}>
			<Text color="fg.default.inverse" fontSize="sm" fontWeight="600" style={{ maxWidth: "none" }}>
				{asset.title}
			</Text>
			{asset.metaDescription && (
				<Text color="fg.default.inverse" fontSize="xs" style={{ lineHeight: "16px", maxWidth: "none" }}>
					{asset.metaDescription}
				</Text>
			)}
			{asset.tooltip && (
				<Text
					color="fg.default.inverse"
					fontSize="xs"
					style={{ lineHeight: "16px", maxWidth: "none", opacity: 0.8 }}
				>
					Why suggested: {asset.tooltip}
				</Text>
			)}
		</Box>
	);
}
