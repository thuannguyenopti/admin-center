import { Box, Heading, Text } from "@optiaxiom/react";

export function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			rounded="xl"
			p="20"
			shadow="sm"
		>
			<Heading level="4" fontWeight="700" mb="16">{title}</Heading>
			<Box display="grid" gap="12">{children}</Box>
		</Box>
	);
}

export function Label({ children }: { children: React.ReactNode }) {
	return (
		<Text
			fontSize="xs"
			fontWeight="700"
			color="fg.secondary"
			style={{ textTransform: "uppercase", letterSpacing: 0.2 }}
		>
			{children}
		</Text>
	);
}
