"use client";

import { Box, Field, Input, Textarea } from "@optiaxiom/react";
import { IconCalendar } from "@optimizely/axiom-icons";

export function UploadMetadataPanel() {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			gap="16"
			overflow="auto"
			p="20"
			rounded="lg"
			style={{ width: 392 }}
		>
			<Field info="Used as the shared title for selected assets." label="Title" required>
				<Input placeholder="Enter title" size="lg" />
			</Field>
			<Field info="Credit owner or source before upload." label="Attribution" required>
				<Input placeholder="Enter attribution" size="lg" />
			</Field>
			<Field
				description="Form note"
				info="Used for DAM search and accessibility context."
				label="Description"
				required
			>
				<Textarea
					resize="vertical"
					defaultValue="Race day upload with AI-recognized people, sports objects, and duplicate handling."
				/>
			</Field>
			<Field description="All assets must have an expiry date before uploading." label="Asset Expiry Date">
				<Input
					addonBefore={<IconCalendar size={15} />}
					readOnly
					size="lg"
					value="Set expiry date"
				/>
			</Field>
		</Box>
	);
}
