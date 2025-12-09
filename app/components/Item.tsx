import {Box} from "@optiaxiom/react";
import {Text} from "./Text";
import {ReactNode} from "react";

type ItemProps = {
	icon: ReactNode;
	title: string;
	description?: string;
};

export default function Item({icon, title, description}: ItemProps) {
	return (
		<Box
			display="flex"
			flexDirection="row"
			alignItems="start"
			gap="8"
		>
			<Box
				w="16"
				pt="2"
			>
				{icon}
			</Box>
			<Box
				display="flex"
				flexDirection="column"
			>
				<Text>{title}</Text>
				{description && (
					<Text
						fontSize="sm"
						color="fg.secondary"
					>
						{description}
					</Text>
				)}
			</Box>
		</Box>
	);
}
