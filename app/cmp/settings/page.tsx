"use client";

import {Box, Heading} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {IconGear} from "@/app/lib/axiom-icons";

export default function CMPSettingsPage() {
	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			gap="16"
			style={{
				minHeight: "60vh",
			}}
		>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="center"
				bg="bg.information.subtle"
				color="fg.information"
				style={{
					width: "80px",
					height: "80px",
					borderRadius: "50%",
				}}
			>
				<IconGear size={40} stroke={1.5} />
			</Box>

			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				gap="16"
				textAlign="center"
				style={{maxWidth: "552px"}}
			>
				<Heading
					level="2"
					fontSize="2xl"
					fontWeight="500"
					style={{
						letterSpacing: "-0.60px",
					}}
				>
					CMP Settings
				</Heading>

				<Text
					fontSize="md"
					color="fg.secondary"
					style={{
						letterSpacing: "-0.20px",
						lineHeight: "24px",
					}}
				>
					Select a setting category from the navigation to configure your Content
					Marketing Platform.
				</Text>
			</Box>
		</Box>
	);
}
