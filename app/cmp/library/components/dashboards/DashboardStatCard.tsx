"use client";

import { Box, Tooltip } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { IconCircleInfo } from "@optimizely/axiom-icons";
import type { StatSpec } from "./data";

export function DashboardStatCard({ size = "lg", stat }: { size?: "lg" | "sm"; stat: StatSpec }) {
	return (
		<Box bg="bg.default" border="1" borderColor="border.tertiary" display="flex" flexDirection="column" gap="6" p={size === "lg" ? "20" : "16"} rounded="lg">
			<Text color="fg.default" fontSize={size === "lg" ? "2xl" : "xl"} fontWeight="700">{stat.value}</Text>
			<Box alignItems="center" display="flex" gap="4">
				<Text color="fg.tertiary" fontSize="sm">{stat.label}</Text>
				{stat.info && (
					<Tooltip content={stat.info}>
						<span className="inline-flex" style={{ color: "var(--ax-colors-fg-tertiary)" }}>
							<IconCircleInfo size={12} />
						</span>
					</Tooltip>
				)}
			</Box>
		</Box>
	);
}
