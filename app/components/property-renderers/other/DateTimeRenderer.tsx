import { Field, Input, Text } from "@optiaxiom/react";
import { PropertyRendererProps } from "../types";

export const DateTimeRenderer: React.FC<PropertyRendererProps> = ({
	property,
	value,
	onChange,
	error,
	mode = "edit",
}) => {
	if (mode === "readonly") {
		return (
			<Field label={property.displayName || property.name}>
				<Text>{value ? new Date(value).toLocaleString() : "—"}</Text>
			</Field>
		);
	}

	return (
		<Field label={property.displayName || property.name} error={error} info={property.description}>
			<Input
				type="datetime-local"
				value={value ?? property.defaultValue ?? ""}
				onChange={(e: any) => onChange(e.target.value)}
				required={property.required}
			/>
		</Field>
	);
};
