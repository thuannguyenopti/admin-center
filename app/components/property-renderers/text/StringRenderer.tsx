import { Badge, Box, Field, Input, Textarea, Text } from "@optiaxiom/react";
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
		// Handle array values (e.g., tags, keywords) as pills
		if (Array.isArray(value)) {
			return (
				<Field label={property.displayName || property.name}>
					<Box alignItems="center" display="flex" flexWrap="wrap" gap="8">
						{value.map((tag: string, i: number) => (
							<Badge key={i} intent="neutral">{tag}</Badge>
						))}
					</Box>
				</Field>
			);
		}

		return (
			<Field label={property.displayName || property.name}>
				<Text>{value || "—"}</Text>
			</Field>
		);
	}

	return (
		<Field label={property.displayName || property.name} error={error} info={property.description}>
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
