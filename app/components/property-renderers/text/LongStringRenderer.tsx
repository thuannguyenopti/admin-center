<<<<<<< HEAD
import { Field, Textarea } from "@optiaxiom/react";
import { PropertyRendererProps } from "../types";

export const LongStringRenderer: React.FC<PropertyRendererProps> = ({
	property,
	value,
	onChange,
	error,
	mode = "edit",
}) => {
	if (mode === "readonly") {
		return (
			<Field label={property.displayName || property.name}>
				<Textarea
					value={value ?? ""}
					disabled
					rows={3}
				/>
			</Field>
		);
	}

	return (
		<Field label={property.displayName || property.name} error={error} info={property.description}>
			<Textarea
				placeholder={`Enter ${property.displayName || property.name}`}
				value={value ?? property.defaultValue ?? ""}
				onChange={(e: any) => onChange(e.target.value)}
				maxLength={property.validation?.maxLength}
				required={property.required}
				rows={3}
			/>
		</Field>
	);
};
=======
import { Field, Textarea } from "@optiaxiom/react";
import { PropertyRendererProps } from "../types";

export const LongStringRenderer: React.FC<PropertyRendererProps> = ({
	property,
	value,
	onChange,
	error,
	mode = "edit",
}) => {
	if (mode === "readonly") {
		return (
			<Field label={property.displayName || property.name}>
				<Textarea
					value={value ?? ""}
					disabled
					rows={3}
				/>
			</Field>
		);
	}

	return (
		<Field label={property.displayName || property.name} error={error} info={property.description}>
			<Textarea
				placeholder={`Enter ${property.displayName || property.name}`}
				value={value ?? property.defaultValue ?? ""}
				onChange={(e: any) => onChange(e.target.value)}
				maxLength={property.validation?.maxLength}
				required={property.required}
				rows={3}
			/>
		</Field>
	);
};
>>>>>>> origin/main
