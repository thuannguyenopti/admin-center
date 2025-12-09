import {Text as AxiomText, type TextProps} from "@optiaxiom/react";

export function Text(props: TextProps) {
	return (
		<AxiomText
			maxW="lg"
			{...props}
		/>
	);
}
