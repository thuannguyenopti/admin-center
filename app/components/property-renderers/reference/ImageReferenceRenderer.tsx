"use client";

import { PropertyRendererProps } from "../types";
import { MediaImageRenderer } from "./MediaImageRenderer";

/**
 * Renderer for ImageReference property type (legacy)
 * This is the same as ContentReference to ct-image Media type
 * Delegates to the shared MediaImageRenderer
 */
export const ImageReferenceRenderer: React.FC<PropertyRendererProps> = ({
	property,
	value,
	onChange,
	mode = "edit",
}) => {
	return (
		<MediaImageRenderer
			property={property}
			value={value}
			onChange={onChange}
			mode={mode}
		/>
	);
};
