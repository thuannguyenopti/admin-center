"use client";

import { Box, Button, Heading, Progress, Text } from "@optiaxiom/react";
import { IconArrowLeft } from "@optimizely/axiom-icons";

type Props = {
	completed: number;
	total: number;
	onBack: () => void;
};

export function ReviewHeader({ completed, total, onBack }: Props) {
	const progress = total > 0 ? (completed / total) * 100 : 0;

	return (
		<Box alignItems="start" display="flex" gap="16" justifyContent="space-between">
			<Box display="flex" flexDirection="column" gap="8">
				<Box alignItems="center" display="flex" gap="6">
					<Button
						appearance="subtle"
						size="sm"
						icon={<IconArrowLeft size={14} />}
						onClick={onBack}
					>
						Library
					</Button>
					<Text fontSize="xs" color="fg.tertiary">
						/
					</Text>
					<Text fontSize="xs" color="fg.secondary">
						People
					</Text>
					<Text fontSize="xs" color="fg.tertiary">
						/
					</Text>
					<Text fontSize="xs" color="fg.secondary">
						Unnamed faces
					</Text>
				</Box>
				<Heading level="1" fontSize="2xl">
					Resolve unnamed faces
				</Heading>
				<Text color="fg.secondary" fontSize="md">
					Review Opal matches, or click directly on the image to tag a face
					manually.
				</Text>
			</Box>
			<Box
				alignItems="center"
				bg="bg.secondary"
				display="flex"
				gap="12"
				px="16"
				py="10"
				rounded="lg"
			>
				<Box display="flex" flexDirection="column" gap="2">
					<Text fontSize="sm" color="fg.secondary">
						Progress
					</Text>
					<Text fontSize="md" fontWeight="600">
						{completed} of {total} resolved
					</Text>
				</Box>
				<Box style={{ width: 140 }}>
					<Progress value={progress} />
				</Box>
			</Box>
		</Box>
	);
}
