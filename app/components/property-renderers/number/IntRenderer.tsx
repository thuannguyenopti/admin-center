import { Field, Input } from "@optiaxiom/react";
import { PropertyRendererProps } from "../types";

export const IntRenderer: React.FC<PropertyRendererProps> = ({
	property,
	value,
	onChange,
	error,
	mode = "edit",
}) => {
	if (mode === "readonly") {
		return (
			<Field label={property.displayName || property.name}>
				<Input type="number" value={value ?? ""} disabled />
			</Field>
		);
	}

	return (
		<Field label={property.displayName || property.name} error={error} info={property.description}>
			<Input
				type="number"
				placeholder={`Enter ${property.displayName || property.name}`}
				value={value ?? property.defaultValue ?? ""}
				onChange={(e: any) => onChange(e.target.value ? Number(e.target.value) : null)}
				min={property.validation?.min}
				max={property.validation?.max}
				required={property.required}
			/>
		</Field>
	);
};
