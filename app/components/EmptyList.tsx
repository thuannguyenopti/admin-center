"use client";

import {Box, Heading} from "@optiaxiom/react";
import {Text} from "./Text";
import {ReactNode} from "react";
import Flow from "@/app/components/Flow";

export default function EmptyList({
	heading,
	body,
	children,
}: {
	heading: string;
	body: string;
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
			<Box
				style={{
					width: 600,
					height: 600,
					position: "absolute",
					background: "radial-gradient(rgba(99,102,241,0.18) 0%, rgba(99,102,241,0) 50%)",
				}}
			/>
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
