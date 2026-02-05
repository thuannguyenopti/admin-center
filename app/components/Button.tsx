import {Button as AxiomButton, type ButtonProps} from "@optiaxiom/react";
import {useState} from "react";

export function Button(props: ButtonProps) {
	const isDangerOutline = props.appearance === "danger-outline";
	const [isHovered, setIsHovered] = useState(false);
	const [isPressed, setIsPressed] = useState(false);

	return (
		<AxiomButton
			size="lg"
			borderColor={isDangerOutline ? "border.error" : undefined}
			color={isDangerOutline ? "fg.error" : undefined}
			{...props}
			onMouseEnter={(e) => {
				setIsHovered(true);
				props.onMouseEnter?.(e);
			}}
			onMouseLeave={(e) => {
				setIsHovered(false);
				props.onMouseLeave?.(e);
			}}
			onMouseDown={(e) => {
				setIsPressed(true);
				props.onMouseDown?.(e);
			}}
			onMouseUp={(e) => {
				setIsPressed(false);
				props.onMouseUp?.(e);
			}}
			style={{
				...(props.appearance === undefined &&
					isHovered &&
					!isPressed && {backgroundColor: "var(--ax-colors-bg-secondary)"}),
				...props.style,
			}}
		/>
	);
}
