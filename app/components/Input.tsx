import {Input as AxiomInput, type InputProps} from "@optiaxiom/react";

export function Input(props: InputProps) {
	return (
		<AxiomInput
			size="lg"
			{...props}
		/>
	);
}
