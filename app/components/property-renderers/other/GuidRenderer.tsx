import { Field, Input, Text } from "@optiaxiom/react";
import { PropertyRendererProps } from "../types";

export const GuidRenderer: React.FC<PropertyRendererProps> = ({
	property,
	value,
	onChange,
	error,
	mode = "edit",
}) => {
	if (mode === "readonly") {
		return (
			<Field label={property.displayName || property.name}>
				<Text fontFamily="mono" fontSize="sm">{value || "—"}</Text>
			</Field>
		);
	}

	return (
		<Field label={property.displayName || property.name} error={error} info={property.description}>
			<Input
				placeholder={`Enter ${property.displayName || property.name}`}
				value={value ?? property.defaultValue ?? ""}
				onChange={(e: any) => onChange(e.target.value)}
				required={property.required}
				fontFamily="mono"
			/>
		</Field>
	);
};
