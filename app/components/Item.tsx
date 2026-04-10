import {Box} from "@optiaxiom/react";
import {Text} from "./Text";
import {ReactNode} from "react";

type ItemProps = {
	icon: ReactNode;
	title: string;
	description?: string;
	endAdornment?: ReactNode;
};

export default function Item({icon, title, description, endAdornment}: ItemProps) {
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
						<Box asChild display="flex" alignItems="center" gap="4">
							<span>
								<span>{title}</span>
								{endAdornment}
							</span>
						</Box>
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
