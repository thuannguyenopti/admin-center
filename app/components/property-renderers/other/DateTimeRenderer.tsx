import { Field, Input, Text } from "@optiaxiom/react";
import { PropertyRendererProps } from "../types";

export const DateTimeRenderer: React.FC<PropertyRendererProps> = ({
	property,
	value,
	onChange,
	error,
	mode = "edit",
}) => {
	// Convert value to datetime-local format (yyyy-MM-ddTHH:mm)
	const toDateTimeLocal = (val: any): string => {
		if (!val) return "";
		try {
			const date = new Date(val);
			if (isNaN(date.getTime())) return "";

			// Format: yyyy-MM-ddTHH:mm
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			const hours = String(date.getHours()).padStart(2, '0');
			const minutes = String(date.getMinutes()).padStart(2, '0');

			return `${year}-${month}-${day}T${hours}:${minutes}`;
		} catch {
			return "";
		}
	};

	if (mode === "readonly") {
		return (
			<Field label={property.displayName || property.name}>
				<Text>{value ? new Date(value).toLocaleString() : "—"}</Text>
			</Field>
		);
	}

	const dateTimeValue = toDateTimeLocal(value ?? property.defaultValue);

	return (
		<Field label={property.displayName || property.name} error={error} info={property.description}>
			<Input
				type="datetime-local"
				value={dateTimeValue}
				onChange={(e: any) => onChange(e.target.value)}
				required={property.required}
			/>
		</Field>
	);
};
