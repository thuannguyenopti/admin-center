"use client";

import { Box, Button, Text } from "@optiaxiom/react";
import { IconUserCheck, IconUserPlus } from "@optimizely/axiom-icons";
import { AiBanner, AiBannerOrb } from "../AiBanner";

type Props = {
	namedCount: number;
	totalAssets: number;
	unnamedCount: number;
	onOpenUnknownInbox?: () => void;
};

export function RecognitionSnapshot({
	namedCount,
	totalAssets,
	unnamedCount,
	onOpenUnknownInbox,
}: Props) {
	return (
		<AiBanner>
			<AiBannerOrb />
			<Box display="flex" flexDirection="column" gap="2" style={{ minWidth: 0 }}>
				<Text color="fg.default" fontSize="sm" fontWeight="600">
					Recognition snapshot
				</Text>
				<Text color="fg.secondary" fontSize="sm">
					{namedCount} named people across {totalAssets.toLocaleString()} tagged assets{" · "}
					<Box asChild color="fg.success.strong" fontWeight="600">
						<span>{unnamedCount} unnamed faces waiting for review</span>
					</Box>
				</Text>
			</Box>
			<Box style={{ flex: 1 }} />
			<Button
				appearance="default"
				icon={<IconUserCheck size={14} />}
				iconPosition="start"
				size="sm"
			>
				Review suggestions
			</Button>
			<Button
				appearance="default-opal"
				icon={<IconUserPlus size={14} />}
				iconPosition="start"
				size="sm"
				onClick={onOpenUnknownInbox}
			>
				Resolve unnamed ({unnamedCount})
			</Button>
		</AiBanner>
	);
}
