"use client";

import {Box, Field} from "@optiaxiom/react";
import {Input} from "@/app/components/Input";

export default function Home() {
	return (
		<Box
			gap="16"
			display="flex"
			flexDirection="column"
		>
			<Field
				label="Application Name"
				required
			>
				<Input defaultValue="Stride" />
			</Field>
			<Field
				label="APP ID"
				required
			>
				<Input defaultValue="moseybank" />
			</Field>
			<Field
				label="Start Page"
				required
			>
				<Input placeholder="Enter text..." />
			</Field>
		</Box>
	);
}
