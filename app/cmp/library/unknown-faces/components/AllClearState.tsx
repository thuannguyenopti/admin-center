"use client";

import { Box, Button, Heading, Text } from "@optiaxiom/react";
import { IconCheck } from "@optimizely/axiom-icons";

type Props = {
	onBack: () => void;
};

export function AllClearState({ onBack }: Props) {
	return (
		<Box
			className="axiom-v3-recognition"
			alignItems="center"
			display="flex"
			flexDirection="column"
			gap="16"
			justifyContent="center"
			py="80"
		>
			<Box
				alignItems="center"
				bg="bg.accent.subtle"
				display="flex"
				justifyContent="center"
				rounded="full"
				style={{ width: 72, height: 72 }}
			>
				<IconCheck size={36} style={{ color: "var(--ax-colors-fg-accent)" }} />
			</Box>
			<Heading level="2" fontSize="xl" style={{ margin: 0 }}>
				All faces resolved
			</Heading>
			<Text color="fg.secondary" fontSize="sm">
				Every detected face has a name or has been dismissed. New uploads will queue
				here automatically.
			</Text>
			<Button
				appearance="primary"
				size="md"
				onClick={onBack}
			>
				Back to people
			</Button>
		</Box>
	);
}
