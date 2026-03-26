import { Field, Input, Text } from "@optiaxiom/react";
import { PropertyRendererProps } from "../types";

export const UrlRenderer: React.FC<PropertyRendererProps> = ({
	property,
	value,
	onChange,
	error,
	mode = "edit",
}) => {
	if (mode === "readonly") {
		return (
			<Field label={property.displayName || property.name}>
				<Text>{value ? <a href={value} target="_blank" rel="noopener noreferrer">{value}</a> : "—"}</Text>
			</Field>
		);
	}

	return (
		<Field label={property.displayName || property.name} error={error} description={property.description}>
			<Input
				type="url"
				placeholder={`Enter ${property.displayName || property.name}`}
				value={value ?? property.defaultValue ?? ""}
				onChange={(e: any) => onChange(e.target.value)}
				maxLength={property.validation?.maxLength}
				required={property.required}
			/>
		</Field>
	);
};
