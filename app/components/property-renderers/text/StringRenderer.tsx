import { Field, Input, Textarea, Text } from "@optiaxiom/react";
import { PropertyRendererProps } from "../types";

export const StringRenderer: React.FC<PropertyRendererProps> = ({
	property,
	value,
	onChange,
	error,
	mode = "edit",
}) => {
	// Check displayAs field (defaults to input for String type)
	const useTextarea = property.displayAs === "textarea";

	if (mode === "readonly") {
		return (
			<Field label={property.displayName || property.name}>
				<Text>{value || "—"}</Text>
			</Field>
		);
	}

	return (
		<Field label={property.displayName || property.name} error={error} description={property.description}>
			{useTextarea ? (
				<Textarea
					placeholder={`Enter ${property.displayName || property.name}`}
					value={value ?? property.defaultValue ?? ""}
					onChange={(e: any) => onChange(e.target.value)}
					maxLength={property.validation?.maxLength}
					required={property.required}
					rows={3}
				/>
			) : (
				<Input
					placeholder={`Enter ${property.displayName || property.name}`}
					value={value ?? property.defaultValue ?? ""}
					onChange={(e: any) => onChange(e.target.value)}
					maxLength={property.validation?.maxLength}
					required={property.required}
				/>
			)}
		</Field>
	);
};
