<<<<<<< HEAD
import { Field, Select, SelectTrigger, SelectContent, Input } from "@optiaxiom/react";
import { PropertyRendererProps } from "../types";

export const SelectOneRenderer: React.FC<PropertyRendererProps> = ({
	property,
	value,
	onChange,
	error,
	mode = "edit",
}) => {
	const options = property.options || [];

	if (mode === "readonly") {
		const selectedOption = options.find((opt) => opt.value === value);
		return (
			<Field label={property.displayName || property.name}>
				<Input value={selectedOption?.label || value || ""} disabled />
			</Field>
		);
	}

	return (
		<Field label={property.displayName || property.name} error={error} info={property.description}>
			<Select value={value ?? property.defaultValue} onValueChange={(newValue) => onChange(newValue)} options={options}>
				<SelectTrigger />
				<SelectContent />
			</Select>
		</Field>
	);
};
=======
import { Field, Select, SelectTrigger, SelectContent, Input } from "@optiaxiom/react";
import { PropertyRendererProps } from "../types";

export const SelectOneRenderer: React.FC<PropertyRendererProps> = ({
	property,
	value,
	onChange,
	error,
	mode = "edit",
}) => {
	const options = property.options || [];

	if (mode === "readonly") {
		const selectedOption = options.find((opt) => opt.value === value);
		return (
			<Field label={property.displayName || property.name}>
				<Input value={selectedOption?.label || value || ""} disabled />
			</Field>
		);
	}

	return (
		<Field label={property.displayName || property.name} error={error} info={property.description}>
			<Select value={value ?? property.defaultValue} onValueChange={(newValue) => onChange(newValue)} options={options}>
				<SelectTrigger />
				<SelectContent />
			</Select>
		</Field>
	);
};
>>>>>>> origin/main
