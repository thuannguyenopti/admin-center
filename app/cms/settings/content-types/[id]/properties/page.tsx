"use client";

import { Box, Card, SearchInput, Menu, MenuTrigger, LabelMenuButton, MenuContent } from "@optiaxiom/react";
import { Flex } from "@/app/components/Flex";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import { IconGripVertical, IconChevronDown } from "@tabler/icons-react";
import { initialContentTypes, Property, PropertyType, ContentType } from "@/app/db/initialData";
import { useParams } from "next/navigation";
import { use, useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Aside } from "@/app/context/LayoutContext";
import ConfigurePropertyPane from "../../ConfigurePropertyPane";
import usePersistentState from "@/app/usePersistentState";

// Type category grouping - Text, Number, etc.
type TypeCategory = "Text" | "Number" | "Boolean" | "Date/Time" | "Reference" | "Selection" | "Content" | "Other";

const getTypeCategory = (type: PropertyType): TypeCategory => {
	const textTypes = ["String", "LongString", "XhtmlString", "text", "textarea", "richtext"];
	const numberTypes = ["Int", "Double"];
	const booleanTypes = ["Boolean", "checkbox"];
	const dateTypes = ["DateTime"];
	const referenceTypes = ["ContentReference", "PageReference", "ImageReference", "VideoReference", "reference", "Url"];
	const selectionTypes = ["SelectOne", "SelectMany"];
	const contentTypes = ["ContentArea", "LinkItemCollection", "outline"];

	if (textTypes.includes(type)) return "Text";
	if (numberTypes.includes(type)) return "Number";
	if (booleanTypes.includes(type)) return "Boolean";
	if (dateTypes.includes(type)) return "Date/Time";
	if (referenceTypes.includes(type)) return "Reference";
	if (selectionTypes.includes(type)) return "Selection";
	if (contentTypes.includes(type)) return "Content";
	return "Other";
};

// Get specific type label within a category
const getSpecificTypeLabel = (type: PropertyType): string => {
	const typeLabels: Record<string, string> = {
		String: "String (<=255)",
		LongString: "String (>255)",
		XhtmlString: "XHTML String",
		text: "String (<=255)",
		textarea: "String (>255)",
		richtext: "XHTML String",
		Int: "Integer",
		Double: "Decimal",
		Boolean: "Boolean",
		checkbox: "Boolean",
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
		reference: "Reference",
		address: "Address",
		outline: "Outline",
		seo: "SEO",
	};
	return typeLabels[type] || type;
};

// Get display label showing category + specific type
const getPropertyTypeLabel = (type: PropertyType): string => {
	const category = getTypeCategory(type);
	const specific = getSpecificTypeLabel(type);
	return `${category} · ${specific}`;
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
	Object.keys(groups).forEach((key) => {
		groups[key].sort((a, b) => (a.order || 0) - (b.order || 0));
	});
	return groups;
};

// Get unique property groups from content type
const getPropertyGroups = (properties: Property[]): string[] => {
	const groups = new Set<string>();
	properties.forEach((prop) => {
		groups.add(prop.groupName || "Content");
	});
	return Array.from(groups);
};

// Generate unique ID for new properties
const generatePropertyId = (): string => {
	return `prop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default function PropertiesPage() {
	const params = useParams();
	const resolvedParams = params instanceof Promise ? use(params) : params;
	const id = (resolvedParams?.id ?? "") as string;

	// Use persistent state for content types
	const [savedContentTypes, setContentTypes] = usePersistentState("contentTypes", initialContentTypes) as [ContentType[], (value: ContentType[]) => void];
	
	// Merge saved content types with initial data to include any new content types
	const contentTypes = useMemo(() => {
		if (!savedContentTypes) return initialContentTypes;
		
		// Create a map of saved content types
		const savedMap = new Map(savedContentTypes.map((ct) => [ct.id, ct]));
		
		// Add any content types from initialContentTypes that don't exist in saved
		initialContentTypes.forEach((ct) => {
			if (!savedMap.has(ct.id)) {
				savedMap.set(ct.id, ct);
			}
		});
		
		return Array.from(savedMap.values());
	}, [savedContentTypes]);

	const contentType = contentTypes?.find((ct) => ct.id === id);

	const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
	const [filterGroup, setFilterGroup] = useState<string>("All");
	const [searchFilter, setSearchFilter] = useState<string>("");
	const [draggedPropertyId, setDraggedPropertyId] = useState<string | null>(null);
	const [dragOverPropertyId, setDragOverPropertyId] = useState<string | null>(null);

	// Ref to track newly added property for scrolling
	const newlyAddedPropertyIdRef = useRef<string | null>(null);

	// Use key to force re-render of Aside when property changes
	const selectedProperty = contentType?.properties.find((p: Property) => p.id === selectedPropertyId);

	// Scroll to newly added property after layout stabilizes
	useEffect(() => {
		if (newlyAddedPropertyIdRef.current) {
			const propertyId = newlyAddedPropertyIdRef.current;
			newlyAddedPropertyIdRef.current = null;
			
			// Use longer timeout to allow Aside to fully open and layout to stabilize
			const timeoutId = setTimeout(() => {
				const element = document.querySelector(`[data-property-id="${propertyId}"]`);
				if (element instanceof HTMLElement) {
					element.scrollIntoView({ behavior: "smooth", block: "end" });
					// Add a highlight effect
					element.style.outline = "2px solid var(--ax-color-border-accent)";
					setTimeout(() => {
						element.style.outline = "";
					}, 1500);
				}
			}, 300);
			
			return () => clearTimeout(timeoutId);
		}
	}, [contentType?.properties]);

	// Handle property selection - toggle if same property clicked
	const handleSelectProperty = (propertyId: string) => {
		setSelectedPropertyId(propertyId);
	};

	// Add new property
	const handleAddProperty = useCallback((type: PropertyType, groupName: string = "Content") => {
		if (!contentTypes || !contentType) return;

		const newProperty: Property = {
			id: generatePropertyId(),
			name: `New ${getSpecificTypeLabel(type)}`,
			displayName: `New ${getSpecificTypeLabel(type)}`,
			type,
			groupName,
			order: contentType.properties.length + 1,
		};

		const updatedContentTypes = contentTypes.map((ct: ContentType) =>
			ct.id === id
				? { ...ct, properties: [...ct.properties, newProperty] }
				: ct
		);

		setContentTypes(updatedContentTypes);
		setSelectedPropertyId(newProperty.id);
		newlyAddedPropertyIdRef.current = newProperty.id;
	}, [contentTypes, contentType, id, setContentTypes]);

	// Update property
	const handleSaveProperty = useCallback((updatedProperty: Property) => {
		if (!contentTypes || !contentType) return;

		const updatedContentTypes = contentTypes.map((ct: ContentType) =>
			ct.id === id
				? {
					...ct,
					properties: ct.properties.map((p) =>
						p.id === updatedProperty.id ? updatedProperty : p
					),
				}
				: ct
		);

		setContentTypes(updatedContentTypes);
		setSelectedPropertyId(null);
	}, [contentTypes, contentType, id, setContentTypes]);

	// Drag and drop handlers
	const handleDragStart = useCallback((propertyId: string) => {
		setDraggedPropertyId(propertyId);
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent, propertyId: string) => {
		e.preventDefault();
		setDragOverPropertyId(propertyId);
	}, []);

	const handleDrop = useCallback((e: React.DragEvent, dropPropertyId: string) => {
		e.preventDefault();

		if (!draggedPropertyId || !contentTypes || !contentType) return;
		if (draggedPropertyId === dropPropertyId) return;

		const properties = [...contentType.properties];
		const draggedIndex = properties.findIndex((p) => p.id === draggedPropertyId);
		const dropIndex = properties.findIndex((p) => p.id === dropPropertyId);

		if (draggedIndex === -1 || dropIndex === -1) return;

		// Remove dragged item and insert at new position
		const [draggedProperty] = properties.splice(draggedIndex, 1);
		properties.splice(dropIndex, 0, draggedProperty);

		// Update order values
		const reorderedProperties = properties.map((p, index) => ({
			...p,
			order: index + 1,
		}));

		const updatedContentTypes = contentTypes.map((ct: ContentType) =>
			ct.id === id ? { ...ct, properties: reorderedProperties } : ct
		);

		setContentTypes(updatedContentTypes);
		setDraggedPropertyId(null);
		setDragOverPropertyId(null);
	}, [draggedPropertyId, contentTypes, contentType, id, setContentTypes]);

	const handleDragEnd = useCallback(() => {
		setDraggedPropertyId(null);
		setDragOverPropertyId(null);
	}, []);

	if (!contentType) {
		return (
			<Box flex="1">
				<Text color="fg.error">Content type not found</Text>
			</Box>
		);
	}

	const propertyGroups = getPropertyGroups(contentType.properties);

	// Filter properties
	let filteredProperties = contentType.properties;
	if (filterGroup !== "All") {
		filteredProperties = filteredProperties.filter(
			(p: Property) => (p.groupName || "Content") === filterGroup
		);
	}
	if (searchFilter) {
		const search = searchFilter.toLowerCase();
		filteredProperties = filteredProperties.filter(
			(p: Property) =>
				p.name.toLowerCase().includes(search) ||
				(p.displayName && p.displayName.toLowerCase().includes(search))
		);
	}

	const groupedProperties = groupProperties(filteredProperties);

	return (
		<>
			<Box flex="1" p="24">
				<Text color="fg.secondary" mb="24">
					Manage properties for this content type. Use property groups to organise your properties.
				</Text>

				{/* Filter and Add Property */}
				<Flex gap="8" mb="24" alignItems="center">
					<SearchInput
						size="lg"
						placeholder="Filter by name"
						value={searchFilter}
						onChange={(e) => setSearchFilter(e.target.value)}
						style={{ maxWidth: "280px" }}
					/>

					<Menu
						options={[
							{ label: "All", execute: () => setFilterGroup("All") },
							...propertyGroups.map((g) => ({
								label: g,
								execute: () => setFilterGroup(g),
							})),
						]}
					>
						<MenuTrigger asChild>
							<LabelMenuButton label="Property Group" h="40">
								{filterGroup}
							</LabelMenuButton>
						</MenuTrigger>
						<MenuContent />
					</Menu>
					<Box flex="1" />					<AddPropertyMenu onAddProperty={handleAddProperty} />
				</Flex>

				{/* Property Groups */}
				{Object.entries(groupedProperties).map(([groupName, properties]) => (
					<Box key={groupName} mb="24">
						<Text fontWeight="600" fontSize="sm" mb="12" color="fg.secondary">
							{groupName}
						</Text>
						<Flex flexDirection="column" gap="8">
							{properties.map((property) => (
								<PropertyCard
									key={property.id}
									property={property}
									isSelected={selectedPropertyId === property.id}
									isDragging={draggedPropertyId === property.id}
									isDragOver={dragOverPropertyId === property.id}
									onSelect={() => handleSelectProperty(property.id)}
									onDragStart={() => handleDragStart(property.id)}
									onDragOver={(e) => handleDragOver(e, property.id)}
									onDrop={(e) => handleDrop(e, property.id)}
									onDragEnd={handleDragEnd}
								/>
							))}
						</Flex>
					</Box>
				))}

				{filteredProperties.length === 0 && (
					<Box
						p="24"
						style={{ textAlign: "center" }}
						border="1"
						borderColor="border.secondary"
						rounded="md"
						bg="bg.default"
					>
						<Text color="fg.secondary">
							{contentType.properties.length === 0
								? 'No properties defined. Click "Add Property" to create one.'
								: "No properties match your filter."}
						</Text>
					</Box>
				)}
			</Box>

			{/* Right Sidebar - Property Inspector via Aside */}
			{selectedProperty && (
				<Aside key={selectedPropertyId}>
					<ConfigurePropertyPane
						property={selectedProperty}
						onClose={() => setSelectedPropertyId(null)}
						onSave={handleSaveProperty}
					/>
				</Aside>
			)}
		</>
	);
}

// Add Property Menu with grouped type options
function AddPropertyMenu({ onAddProperty }: { onAddProperty: (type: PropertyType, groupName?: string) => void }) {
	const addPropertyOptions = [
		// Main type categories - sub-type can be selected in the property editor
		{ label: "Text", execute: () => onAddProperty("String") },
		{ label: "Number", execute: () => onAddProperty("Int") },
		{ label: "Boolean", execute: () => onAddProperty("Boolean") },
		{ label: "Date/Time", execute: () => onAddProperty("DateTime") },
		{ label: "Choice", execute: () => onAddProperty("SelectOne") },
		{ label: "Reference", execute: () => onAddProperty("ContentReference") },
		{ label: "Content Area", execute: () => onAddProperty("ContentArea") },
	];

	return (
		<Menu options={addPropertyOptions}>
			<MenuTrigger asChild>
				<Button appearance="primary">
					<Flex alignItems="center" gap="4">
						Add Property
						<IconChevronDown size={16} />
					</Flex>
				</Button>
			</MenuTrigger>
			<MenuContent />
		</Menu>
	);
}

// Property Card Component using Axiom Card
interface PropertyCardProps {
	property: Property;
	isSelected?: boolean;
	isDragging?: boolean;
	isDragOver?: boolean;
	onSelect?: () => void;
	onDragStart?: () => void;
	onDragOver?: (e: React.DragEvent) => void;
	onDrop?: (e: React.DragEvent) => void;
	onDragEnd?: () => void;
}

function PropertyCard({
	property,
	isSelected,
	isDragging,
	isDragOver,
	onSelect,
	onDragStart,
	onDragOver,
	onDrop,
	onDragEnd,
}: PropertyCardProps) {
	const typeCategory = getTypeCategory(property.type);
	const specificType = getSpecificTypeLabel(property.type);

	return (
		<Card
			data-property-id={property.id}
			p="12"
			cursor="pointer"
			onClick={onSelect}
			draggable
			onDragStart={onDragStart}
			onDragOver={onDragOver}
			onDrop={onDrop}
			onDragEnd={onDragEnd}
			borderColor={isSelected ? "border.accent" : isDragOver ? "border.accent" : undefined}
			style={{
				transition: "border-color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease, transform 0.15s ease",
				boxShadow: isSelected ? "0 0 0 1px var(--ax-color-border-accent)" : undefined,
				opacity: isDragging ? 0.5 : 1,
				transform: isDragOver ? "translateY(2px)" : undefined,
			}}
		>
			<Flex alignItems="center" gap="12" w="full">
				{/* Drag Handle */}
				<Box
					color="fg.tertiary"
					style={{ cursor: "grab" }}
					onMouseDown={(e) => e.stopPropagation()}
				>
					<IconGripVertical size={16} />
				</Box>

				{/* Property Info */}
				<Box flex="1">
					<Text fontWeight="500">{property.displayName || property.name}</Text>
					<Text color="fg.tertiary" fontSize="sm">
						{typeCategory} · {specificType}
					{property.required && <span style={{ color: "var(--ax-color-fg-error)" }}> *</span>}
					</Text>
				</Box>

				{/* Actions */}
				<Button
					appearance="subtle"
					size="sm"
					aria-label="More options"
					onClick={(e) => e.stopPropagation()}
				>
					•••
				</Button>
			</Flex>
		</Card>
	);
}
