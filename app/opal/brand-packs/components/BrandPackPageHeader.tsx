"use client";

import { Box, Button, Text } from "@optiaxiom/react";
import { IconArrowLeft } from "@optimizely/axiom-icons";
import type { ReactNode } from "react";

type BrandPackPageHeaderProps = {
	actions?: ReactNode;
	maxWidth?: number;
	onBack: () => void;
	subtitle?: ReactNode;
	title: ReactNode;
};

export function BrandPackPageHeader({
	actions,
	maxWidth = 1240,
	onBack,
	subtitle,
	title,
}: BrandPackPageHeaderProps) {
	return (
		<Box
			alignItems="center"
			display="flex"
			gap="16"
			justifyContent="space-between"
			style={{ margin: "0 auto", maxWidth, width: "100%" }}
		>
			<Box alignItems="center" display="flex" gap="12" style={{ minWidth: 0 }}>
				<Button
					appearance="subtle"
					aria-label="Back to brand packs"
					icon={<IconArrowLeft />}
					onClick={onBack}
					size="sm"
				/>
				<Box display="flex" flexDirection="column" gap="2" style={{ minWidth: 0 }}>
					<Box alignItems="center" display="flex" gap="8" style={{ minWidth: 0, flexWrap: "wrap" }}>
						{typeof title === "string" ? (
							<Text fontWeight="700" style={{ fontSize: 20, lineHeight: 1.2 }}>
								{title}
							</Text>
						) : (
							title
						)}
					</Box>
					{subtitle &&
						(typeof subtitle === "string" ? (
							<Text color="fg.secondary" fontSize="xs">
								{subtitle}
							</Text>
						) : (
							subtitle
						))}
				</Box>
			</Box>

			{actions && (
				<Box alignItems="center" display="flex" gap="8" style={{ flexShrink: 0 }}>
					{actions}
				</Box>
			)}
		</Box>
	);
}
