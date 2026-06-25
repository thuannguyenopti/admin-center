"use client";

import {Box} from "@optiaxiom/react";
import {Text} from "./Text";
import {ReactNode} from "react";
import Flow from "@/app/components/Flow";

export default function EmptyList({
	heading,
	body,
	illustration,
	children,
}: {
	heading: string;
	body: string;
	illustration?: ReactNode;
	children?: ReactNode;
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
			{illustration && <Box mb="16">{illustration}</Box>}
			<Flow>
				<Text fontSize="3xl" fontWeight="600">
					{heading}
				</Text>
				<Text fontSize="lg" mb="8">
					{body}
				</Text>
			</Flow>
			{children && <>{children}</>}
		</Box>
	);
}
