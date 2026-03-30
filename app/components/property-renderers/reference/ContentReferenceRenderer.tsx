"use client";

import { Box, Card } from "@optiaxiom/react";
import { PropertyRendererProps } from "../types";
import { PropertyRenderer } from "../PropertyRenderer";
import { Property } from "@/app/db/initialData";
import { MediaImageRenderer } from "./MediaImageRenderer";

export const ContentReferenceRenderer: React.FC<PropertyRendererProps> = ({
	property,
	value,
	onChange,
	enableAI = true,
	context,
	mode = "edit",
}) => {
	// Get the referenced content type
	const referencedTypeId = property.allowedTypes?.[0];
	if (!referencedTypeId) {
		console.warn(`ContentReference property ${property.id} has no allowedTypes`);
		return null;
	}

	const referencedType = context?.runtimeContentTypes?.find(ct => ct.id === referencedTypeId);
	if (!referencedType) {
		console.warn(`Referenced content type ${referencedTypeId} not found`);
		return null;
	}

	// Handle Media types (like ct-image) - delegate to shared Media renderer
	if (referencedType.baseType === "Media") {
		return (
			<MediaImageRenderer
				property={property}
				value={value}
				onChange={onChange}
				mode={mode}
			/>
		);
	}

	// Handle Block types - render properties inline in a Card
	if (referencedType.baseType === "Block") {
		const blockData = (typeof value === "object" && value !== null) ? value : {};
		const blockProperties = referencedType.properties || [];

		// Group block properties by groupName
		const blockGroups: Record<string, Property[]> = {};
		blockProperties.forEach((blockProp) => {
			const groupName = blockProp.groupName || "Properties";
			if (!blockGroups[groupName]) {
				blockGroups[groupName] = [];
			}
			blockGroups[groupName].push(blockProp);
		});

		// Sort properties within each group
		Object.keys(blockGroups).forEach((groupName) => {
			blockGroups[groupName].sort((a, b) => (a.order || 0) - (b.order || 0));
		});

		return (
			<Box display="flex" flexDirection="column" gap="12" w="full">
				<Card w="full">
					<Box display="flex" flexDirection="column" gap="16">
						{Object.entries(blockGroups).map(([groupName, groupProps]) => (
							<Box key={groupName} display="flex" flexDirection="column" gap="12">
								{groupProps.map((blockProp) => {
									const blockPropValue = blockData[blockProp.id];
									return (
										<PropertyRenderer
											key={blockProp.id}
											property={blockProp}
											value={blockPropValue}
											onChange={(newVal) => onChange({ ...blockData, [blockProp.id]: newVal })}
											context={context}
											enableAI={enableAI}
											mode={mode}
										/>
									);
								})}
							</Box>
						))}
					</Box>
				</Card>
			</Box>
		);
	}

	// Page type or other - not yet implemented
	console.warn(`ContentReference to baseType ${referencedType.baseType} not yet supported`);
	return null;
};
