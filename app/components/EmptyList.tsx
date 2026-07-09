"use client";

import {Box, Heading} from "@optiaxiom/react";
import {Text} from "./Text";
import {ReactNode} from "react";
import Flow from "@/app/components/Flow";

export default function EmptyList({
	heading,
	body,
	children,
	title,
	image,
}: {
	heading: string;
	body: string;
	children?: ReactNode;
	title?: string;
	image?: string;
}) {
	return (
		<Box
			w="full"
			flex="1"
			textAlign="center"
			display="flex"
			flexDirection="column"
			gap="16"
			alignItems="center"
			justifyContent="center"
			style={{height: "60vh"}}
		>
			{image && <img src={image} alt={title} style={{width: "200px"}} />}
			<Flow>
				{title && <Text>{title}</Text>}
				<Heading level="2" mt="4">
					{heading}
				</Heading>
				<Text mb="8">{body}</Text>
			</Flow>
			{children && <>{children}</>}
		</Box>
	);
}
