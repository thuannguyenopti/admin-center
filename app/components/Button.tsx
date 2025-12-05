import {Button as AxiomButton, type ButtonProps} from "@optiaxiom/react";

export function Button(props: ButtonProps) {
	return (
		<AxiomButton
			size="lg"
			{...props}
		/>
	);
}
