import {Text as AxiomText, type TextProps} from "@optiaxiom/react";

export function Text(props: TextProps) {
	return (
		<AxiomText
			color="fg.default"
			fontSize="md"
			{...props}
		/>
	);
}
