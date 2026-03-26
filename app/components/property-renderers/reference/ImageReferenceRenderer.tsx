"use client";

import { Box, Field, Input, Card, Button } from "@optiaxiom/react";
import { PropertyRendererProps } from "../types";
import { AIInputField } from "@/app/components/ai/AIInputField";

/**
 * Renderer for ImageReference property type (legacy)
 * This is the same as ContentReference to ct-image Media type
 */
export const ImageReferenceRenderer: React.FC<PropertyRendererProps> = ({
	property,
	value,
	onChange,
	enableAI = true,
	mode = "edit",
}) => {
	const imageUrl = value ?? property.defaultValue ?? "";

	if (mode === "readonly") {
		return (
			<Field label={property.displayName || property.name} info={property.description}>
				{imageUrl ? (
					<Card w="full" p="8">
						<Box
							style={{
								width: "100%",
								height: "200px",
								backgroundImage: `url(${imageUrl})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
								borderRadius: "4px",
							}}
						/>
					</Card>
				) : (
					<Box color="fg.tertiary">No image</Box>
				)}
			</Field>
		);
	}

	return (
		<Field label={property.displayName || property.name} info={property.description}>
			<Card w="full" p="8">
				{imageUrl ? (
					<Box
						style={{
							width: "100%",
							height: "200px",
							backgroundImage: `url(${imageUrl})`,
							backgroundSize: "cover",
							backgroundPosition: "center",
							borderRadius: "4px",
						}}
					/>
				) : (
					<Box
						display="flex"
						alignItems="center"
						justifyContent="center"
						style={{
							width: "100%",
							height: "200px",
							border: "1px dashed var(--border-tertiary)",
							borderRadius: "4px",
						}}
					>
						<Button size="md">
							Select Image
						</Button>
					</Box>
				)}
			</Card>
		</Field>
	);
};
