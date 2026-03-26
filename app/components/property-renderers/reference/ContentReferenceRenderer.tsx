"use client";

import { Box, Field, Input, Card, Button } from "@optiaxiom/react";
import { PropertyRendererProps } from "../types";
import { AIInputField } from "@/app/components/ai/AIInputField";
import { PropertyRenderer } from "../PropertyRenderer";
import { Property } from "@/app/db/initialData";

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

	// Handle Media types (like ct-image) - render as image preview
	if (referencedType.baseType === "Media") {
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
