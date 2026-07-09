"use client";

import { Box, Flex, Button, Badge, Disclosure, DisclosureTrigger, DisclosureContent } from "@optiaxiom/react";
import {IconXmark, IconGripVertical, IconChevronRight, IconPlus} from "@/app/lib/axiom-icons";
import { Text } from "@/app/components/Text";
import { ContentType, Property, PropertyType } from "@/app/db/initialData";

interface ContentTypeDetailsPaneProps {
	contentType: ContentType;
	onClose: () => void;
	onPropertySelect?: (property: Property) => void;
	selectedPropertyId?: string | null;
}

// Helper to get human-readable type label
const getPropertyTypeLabel = (type: PropertyType): string => {
	const typeLabels: Record<string, string> = {
		String: "String (<=255)",
		LongString: "String (>255)",
		XhtmlString: "XHTML String (>255)",
		Int: "Integer",
		Double: "Decimal",
		Boolean: "Boolean",
		DateTime: "Date/Time",
		ContentReference: "Content Reference",
		ContentArea: "Content Area",
		Url: "URL",
		LinkItemCollection: "Link Collection",
		PageReference: "Page Reference",
		ImageReference: "Image Reference",
		VideoReference: "Video Reference",
		SelectOne: "Selection (single)",
		SelectMany: "Selection (multiple)",
		// Legacy types
		text: "String (<=255)",
		textarea: "String (>255)",
		richtext: "XHTML String (>255)",
		reference: "Content Reference",
		address: "Address",
		outline: "Outline",
		checkbox: "Boolean",
		seo: "SEO",
	};
	return typeLabels[type] || type;
};

// Group properties by groupName
const groupProperties = (properties: Property[]): Record<string, Property[]> => {
	const groups: Record<string, Property[]> = {};
	properties.forEach((prop) => {
		const groupName = prop.groupName || "Content";
		if (!groups[groupName]) {
			groups[groupName] = [];
		}
		groups[groupName].push(prop);
	});
	// Sort properties within each group by order
	Object.keys(groups).forEach((key) => {
		groups[key].sort((a, b) => (a.order || 0) - (b.order || 0));
	});
	return groups;
};

export default function ContentTypeDetailsPane({
	contentType,
	onClose,
	onPropertySelect,
	selectedPropertyId,
}: ContentTypeDetailsPaneProps) {
	const propertyGroups = groupProperties(contentType.properties);

	return (
		<Box
			display="flex"
			flexDirection="column"
			h="full"
			bg="bg.default"
			borderL="1"
			borderColor="border.secondary"
		>
			{/* Header */}
			<Box
				px="16"
				py="12"
				borderB="1"
				borderColor="border.secondary"
				display="flex"
				alignItems="start"
				justifyContent="space-between"
			>
				<Box>
					<Text color="fg.tertiary" fontSize="sm">
						← Content Types
					</Text>
					<Text fontWeight="600" fontSize="xl" mt="4">
						{contentType.displayName || contentType.name}
					</Text>
					{contentType.groupName && (
						<Text color="fg.tertiary" fontSize="sm" mt="2">
							{contentType.groupName}
						</Text>
					)}
				</Box>
				<Button
					appearance="subtle"
					icon={<IconXmark size={18} />}
					onClick={onClose}
					aria-label="Close"
					size="sm"
				/>
			</Box>

			{/* Content */}
			<Box flex="1" overflow="auto" p="16">
				{/* Properties Section */}
				<Box mb="24">
					<Flex justifyContent="space-between" alignItems="center" mb="16">
						<Box>
							<Text fontWeight="600" fontSize="lg">
								Properties
							</Text>
							<Text color="fg.secondary" fontSize="sm" mt="4">
								Manage properties for this content type. Use property groups to organise your properties.
							</Text>
						</Box>
					</Flex>

					{/* Filter and Add Property */}
					<Flex gap="8" mb="16" alignItems="center">
						<Box flex="1">
							{/* Placeholder for filter - can add SearchInput later */}
						</Box>
						<Button appearance="primary" icon={<IconPlus size={16} />}>
							Add Property
						</Button>
					</Flex>

					{/* Property Groups */}
					{Object.entries(propertyGroups).map(([groupName, properties]) => (
						<Box key={groupName} mb="16">
							<Disclosure defaultOpen>
								<Box
									rounded="md"
									border="1"
									borderColor="border.secondary"
									overflow="hidden"
								>
									<DisclosureTrigger asChild>
										<button
											style={{
												display: "flex",
												alignItems: "center",
												gap: "8px",
												width: "100%",
												padding: "12px",
												background: "var(--ax-color-bg-default)",
												cursor: "pointer",
												textAlign: "left",
												border: "none",
											}}
										>
											<Text fontWeight="500" color="fg.secondary" fontSize="sm">
												Property Group: {groupName}
											</Text>
										</button>
									</DisclosureTrigger>
									<DisclosureContent>
										<Box>
											{properties.map((property) => (
												<PropertyRow
													key={property.id}
													property={property}
													isSelected={selectedPropertyId === property.id}
													onSelect={() => onPropertySelect?.(property)}
												/>
											))}
										</Box>
									</DisclosureContent>
								</Box>
							</Disclosure>
						</Box>
					))}

					{contentType.properties.length === 0 && (
						<Box
							p="24"
							style={{ textAlign: "center" }}
							border="1"
							borderColor="border.secondary"
							rounded="md"
						>
							<Text color="fg.secondary">
								No properties defined. Click "Add Property" to create one.
							</Text>
						</Box>
					)}
				</Box>
			</Box>

			{/* Footer */}
			<Box
				px="16"
				py="12"
				borderT="1"
				borderColor="border.secondary"
				display="flex"
				justifyContent="space-between"
				alignItems="center"
			>
				<Text color="fg.error" fontSize="sm">
					* Required Field
				</Text>
				<Flex gap="8">
					<Button appearance="subtle" onClick={onClose}>
						Cancel
					</Button>
					<Button appearance="primary" disabled>
						Save
					</Button>
				</Flex>
			</Box>
		</Box>
	);
}

// Property Row Component
interface PropertyRowProps {
	property: Property;
	isSelected?: boolean;
	onSelect?: () => void;
}

function PropertyRow({ property, isSelected, onSelect }: PropertyRowProps) {
	return (
		<Box
			px="12"
			py="10"
			display="flex"
			alignItems="center"
			gap="12"
			borderT="1"
			borderColor="border.secondary"
			bg={isSelected ? "bg.page" : "bg.default"}
			cursor="pointer"
			onClick={onSelect}
			style={{
				transition: "background-color 0.15s ease",
			}}
			onMouseEnter={(e) => {
				if (!isSelected) {
					(e.currentTarget as HTMLElement).style.backgroundColor = "var(--ax-color-bg-page)";
				}
			}}
			onMouseLeave={(e) => {
				if (!isSelected) {
					(e.currentTarget as HTMLElement).style.backgroundColor = "";
				}
			}}
		>
			{/* Drag Handle */}
			<Box color="fg.tertiary" style={{ cursor: "grab" }}>
				<IconGripVertical size={16} />
			</Box>

			{/* Property Info */}
			<Box flex="1">
				<Text fontWeight="500">{property.displayName || property.name}</Text>
				<Text color="fg.tertiary" fontSize="sm">
					Type: {getPropertyTypeLabel(property.type)}
				</Text>
			</Box>

			{/* Actions */}
			<Flex gap="8" alignItems="center">
				<Button
					appearance="subtle"
					size="sm"
					aria-label="More options"
				>
					•••
				</Button>
				<Box color="fg.tertiary">
					<IconChevronRight size={16} />
				</Box>
			</Flex>
		</Box>
	);
}
