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
			asChild
			display="flex"
			flexDirection="row"
			alignItems="start"
			gap="8"
		>
			<span>
				<Box
					w="16"
					pt="2"
					asChild
				>
					<span>{icon}</span>
				</Box>
				<Box
					asChild
					display="flex"
					flexDirection="column"
				>
					<span>
						<span>{title}</span>
						{description && (
							<Text
								asChild
								fontSize="sm"
								color="fg.secondary"
							>
								<span>{description}</span>
							</Text>
						)}
					</span>
				</Box>
			</span>
		</Box>
	);
}
