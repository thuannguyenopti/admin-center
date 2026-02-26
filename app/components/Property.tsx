import {Box, Badge} from "@optiaxiom/react";
import {Text} from "./Text";
import {ReactNode} from "react";

type ItemProps = {
	type?: "text" | "badge";
	title: string;
	description: string;
	data?: any;
};

export default function Property({title, description, type = "text", data}: ItemProps) {
	const renderTypes = (label: string | undefined) => ({
		text: () => <Text fontSize="md">{label}</Text>,
		badge: () => <Badge intent={data.intent || "default"}>{label}</Badge>,
	});

	return (
		<Box>
			<Text color="fg.tertiary" fontSize="sm" mb="2">
				{title}
			</Text>
			{renderTypes(description)[type]()}
		</Box>
	);
}
