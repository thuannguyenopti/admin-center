"use client";

import {Box, Heading} from "@optiaxiom/react";
import {Text} from "./Text";
import {ReactNode} from "react";

export default function EmptyList({
	heading,
	body,
	children,
}: {
	heading: string;
	body: string;
	children: ReactNode;
}) {
	return (
		<Box
			w="full"
			h="384"
			textAlign="center"
			display="flex"
			flexDirection="column"
			gap="16"
			alignItems="center"
			justifyContent="center"
		>
			<Box>
				<Heading level="4">{heading}</Heading>
				<Text>{body}</Text>
			</Box>
			{children}
		</Box>
	);
}
