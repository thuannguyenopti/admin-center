import { Field, Checkbox } from "@optiaxiom/react";
import { PropertyRendererProps } from "../types";

export const BooleanRenderer: React.FC<PropertyRendererProps> = ({
	property,
	value,
	onChange,
	error,
	mode = "edit",
}) => {
	if (mode === "readonly") {
		return (
			<Field>
				<Checkbox
					checked={value ?? false}
					disabled
				>
					{property.displayName || property.name}
				</Checkbox>
			</Field>
		);
	}

	return (
		<Field label={property.displayName || property.name} error={error} info={property.description}>
			<Checkbox
				checked={value ?? property.defaultValue ?? false}
				onCheckedChange={(checked: boolean) => onChange(checked)}
			>
				{property.displayName || property.name}
			</Checkbox>
		</Field>
	);
};
