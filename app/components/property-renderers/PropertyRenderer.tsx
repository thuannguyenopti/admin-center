import { PropertyRendererProps } from "./types";
import { getRendererForProperty } from "./PropertyRendererRegistry";

/**
 * Main PropertyRenderer - dispatches to appropriate renderer based on property type
 */
export const PropertyRenderer: React.FC<PropertyRendererProps> = (props) => {
	const { property, context } = props;

	const RendererComponent = getRendererForProperty(property, context);

	if (!RendererComponent) {
		console.warn(`No renderer found for property type: ${property.type}`);
		return null;
	}

	return <RendererComponent {...props} />;
};
