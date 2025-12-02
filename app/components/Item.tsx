import {Box, Text} from "@optiaxiom/react";
import {ReactNode} from "react";

type ItemProps = {
	icon: ReactNode;
	title: string;
};

export default function Item({icon, title}: ItemProps) {
	return (
		<Box
			display="flex"
			flexDirection="row"
			alignItems="center"
			gap="8"
		>
			{icon}
			<Text fontSize="md">{title}</Text>
		</Box>
	);
}
