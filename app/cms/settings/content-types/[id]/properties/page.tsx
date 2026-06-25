"use client";

import {
	Box,
	Card,
	SearchInput,
	Menu,
	MenuTrigger,
	LabelMenuButton,
	MenuContent,
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogAction,
	AlertDialogCancel,
} from "@optiaxiom/react";
import {Flex} from "@/app/components/Flex";
import {Text} from "@/app/components/Text";
import {Button} from "@/app/components/Button";
import {IconGripVertical, IconChevronDown, IconDots, IconPlus} from "@tabler/icons-react";
import {
	initialContentTypes,
	initialPages,
	Property,
	PropertyType,
	ContentType,
	Page,
} from "@/app/db/initialData";
import {useParams} from "next/navigation";
import {use, useState, useCallback, useMemo, useRef, useEffect} from "react";
import {Aside} from "@/app/context/LayoutContext";
import ConfigurePropertyPane from "../../ConfigurePropertyPane";
import usePersistentState from "@/app/usePersistentState";

// Type category grouping - Text, Number, etc.
type TypeCategory =
	| "Text"
	| "Number"
	| "Boolean"
	| "Date/Time"
	| "Reference"
	| "Selection"
	| "Content"
	| "Outline"
	| "Link"
	| "Block"
	| "Other";

const getTypeCategory = (
	type: PropertyType,
	allowedTypes?: string[],
	allContentTypes?: ContentType[]
): TypeCategory => {
	const textTypes = ["String", "LongString", "XhtmlString", "text", "textarea", "richtext"];
	const numberTypes = ["Int", "Double"];
	const booleanTypes = ["Boolean", "checkbox"];
	const dateTypes = ["DateTime"];
	const referenceTypes = [
		"ContentReference",
		"PageReference",
		"ImageReference",
		"VideoReference",
		"reference",
	];
	const selectionTypes = ["SelectOne", "SelectMany"];
	const contentTypes = ["ContentArea"];
	const outlineTypes = ["outline"];
	const linkTypes = ["Url", "LinkItem", "LinkItemCollection", "link"];
	const otherTypes = ["Guid"];

	// Check if ContentReference with allowedTypes pointing to Block content types
	if (type === "ContentReference" && allowedTypes && allowedTypes.length > 0 && allContentTypes) {
		const referencedType = allContentTypes.find((ct) => ct.id === allowedTypes[0]);
		if (referencedType && referencedType.baseType === "Block") {
			return "Block";
		}
	}

	// Check for legacy block types (seo, address)
	if (type === "seo" || type === "address") {
		return "Block";
	}

	if (textTypes.includes(type)) return "Text";
	if (numberTypes.includes(type)) return "Number";
	if (booleanTypes.includes(type)) return "Boolean";
	if (dateTypes.includes(type)) return "Date/Time";
	if (referenceTypes.includes(type)) return "Reference";
	if (selectionTypes.includes(type)) return "Selection";
	if (contentTypes.includes(type)) return "Content";
	if (outlineTypes.includes(type)) return "Outline";
	if (linkTypes.includes(type)) return "Link";
	if (otherTypes.includes(type)) return "Other";
	return "Other";
};

// Get specific type label within a category
const getSpecificTypeLabel = (
	type: PropertyType,
	allowedTypes?: string[],
	allContentTypes?: ContentType[]
): string => {
	// If it's a block (ContentReference with block allowedTypes), show the block type name
	if (type === "ContentReference" && allowedTypes && allowedTypes.length > 0 && allContentTypes) {
		const referencedType = allContentTypes.find((ct) => ct.id === allowedTypes[0]);
		if (referencedType && referencedType.baseType === "Block") {
			return referencedType.displayName;
		}
	}

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
		LinkItem: "Link",
		LinkItemCollection: "Link Collection",
		link: "Link",
		PageReference: "Page Reference",
		ImageReference: "Image Reference",
		VideoReference: "Video Reference",
		SelectOne: "Selection (single)",
		SelectMany: "Selection (multiple)",
		reference: "Reference",
		address: "Address",
		outline: "Outline",
		seo: "SEO",
		Guid: "GUID",
	};
	return typeLabels[type] || type;
};

// Get display label showing category + specific type
const getPropertyTypeLabel = (
	type: PropertyType,
	allowedTypes?: string[],
	allContentTypes?: ContentType[]
): string => {
	const category = getTypeCategory(type, allowedTypes, allContentTypes);
	const specific = getSpecificTypeLabel(type, allowedTypes, allContentTypes);
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
	const [savedContentTypes, setContentTypes] = usePersistentState(
		"contentTypes",
		initialContentTypes
	) as [ContentType[], (value: ContentType[]) => void];

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
	const [dropIndicator, setDropIndicator] = useState<{
		propertyId: string;
		position: "before" | "after";
	} | null>(null);

	// Ref to track newly added property for scrolling
	const newlyAddedPropertyIdRef = useRef<string | null>(null);

	// Track which property IDs are newly created (not yet saved)
	const [newPropertyIds, setNewPropertyIds] = useState<Set<string>>(new Set());

	// Remove property confirm dialog state
	const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
	const [propertyToRemove, setPropertyToRemove] = useState<Property | null>(null);

	// Find content items using this content type
	const contentItemsUsingType = useMemo(() => {
		return initialPages.filter((page: Page) => page.contentTypeId === id);
	}, [id]);

	// Use key to force re-render of Aside when property changes
	const selectedProperty = contentType?.properties.find(
		(p: Property) => p.id === selectedPropertyId
	);

	// Scroll to newly added property after layout stabilizes
	useEffect(() => {
		if (newlyAddedPropertyIdRef.current) {
			const propertyId = newlyAddedPropertyIdRef.current;
			newlyAddedPropertyIdRef.current = null;

			// Use longer timeout to allow Aside to fully open and layout to stabilize
			const timeoutId = setTimeout(() => {
				const element = document.querySelector(`[data-property-id="${propertyId}"]`);
				if (element instanceof HTMLElement) {
					element.scrollIntoView({behavior: "smooth", block: "end"});
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
	const handleAddProperty = useCallback(
		(type: PropertyType, groupName: string = "Content") => {
			if (!contentTypes || !contentType) return;

			const displayName = `New ${getSpecificTypeLabel(type)}`;
			const newProperty: Property = {
				id: generatePropertyId(),
				name: displayName
					.trim()
					.toLowerCase()
					.replace(/[^a-z0-9\s]/g, "")
					.replace(/\s+/g, "_")
					.replace(/_+/g, "_")
					.replace(/^_|_$/g, ""),
				displayName,
				type,
				groupName,
				order: contentType.properties.length + 1,
			};

			const updatedContentTypes = contentTypes.map((ct: ContentType) =>
				ct.id === id ? {...ct, properties: [...ct.properties, newProperty]} : ct
			);

			setContentTypes(updatedContentTypes);
			setSelectedPropertyId(newProperty.id);
			newlyAddedPropertyIdRef.current = newProperty.id;
			setNewPropertyIds((prev) => new Set(prev).add(newProperty.id));
		},
		[contentTypes, contentType, id, setContentTypes]
	);

	// Update property
	const handleSaveProperty = useCallback(
		(updatedProperty: Property) => {
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
			setNewPropertyIds((prev) => {
				const next = new Set(prev);
				next.delete(updatedProperty.id);
				return next;
			});
			setSelectedPropertyId(null);
		},
		[contentTypes, contentType, id, setContentTypes]
	);

	// Remove property handler
	const handleRemoveProperty = useCallback(
		(property: Property) => {
			if (contentItemsUsingType.length > 0) {
				// Has content instances — show confirmation dialog
				setPropertyToRemove(property);
				setRemoveConfirmOpen(true);
			} else {
				// No content instances — remove directly
				confirmRemoveProperty(property.id);
			}
		},
		[contentItemsUsingType]
	);

	const confirmRemoveProperty = useCallback(
		(propertyId: string) => {
			if (!contentTypes || !contentType) return;

			const updatedContentTypes = contentTypes.map((ct: ContentType) =>
				ct.id === id
					? {...ct, properties: ct.properties.filter((p) => p.id !== propertyId)}
					: ct
			);

			setContentTypes(updatedContentTypes);
			if (selectedPropertyId === propertyId) {
				setSelectedPropertyId(null);
			}
			setNewPropertyIds((prev) => {
				const next = new Set(prev);
				next.delete(propertyId);
				return next;
			});
			setRemoveConfirmOpen(false);
			setPropertyToRemove(null);
		},
		[contentTypes, contentType, id, setContentTypes, selectedPropertyId]
	);

	// Drag and drop handlers
	const handleDragStart = useCallback((propertyId: string) => {
		setDraggedPropertyId(propertyId);
	}, []);

	const handleDragOver = useCallback(
		(e: React.DragEvent, propertyId: string, isFirst: boolean) => {
			e.preventDefault();
			if (draggedPropertyId === propertyId) return;
			const rect = e.currentTarget.getBoundingClientRect();
			const midY = rect.top + rect.height / 2;
			// Only use "before" on the very first item; otherwise always use "after"
			const position = isFirst && e.clientY < midY ? "before" : "after";
			setDropIndicator({propertyId, position});
		},
		[draggedPropertyId]
	);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();

			if (!draggedPropertyId || !dropIndicator || !contentTypes || !contentType) return;
			if (draggedPropertyId === dropIndicator.propertyId) return;

			const properties = [...contentType.properties];
			const draggedIndex = properties.findIndex((p) => p.id === draggedPropertyId);
			let dropIndex = properties.findIndex((p) => p.id === dropIndicator.propertyId);

			if (draggedIndex === -1 || dropIndex === -1) return;

			// Remove dragged item
			const [draggedProperty] = properties.splice(draggedIndex, 1);

			// Recalculate drop index after removal
			dropIndex = properties.findIndex((p) => p.id === dropIndicator.propertyId);
			const insertIndex = dropIndicator.position === "after" ? dropIndex + 1 : dropIndex;
			properties.splice(insertIndex, 0, draggedProperty);

			// Update order values
			const reorderedProperties = properties.map((p, index) => ({
				...p,
				order: index + 1,
			}));

			const updatedContentTypes = contentTypes.map((ct: ContentType) =>
				ct.id === id ? {...ct, properties: reorderedProperties} : ct
			);

			setContentTypes(updatedContentTypes);
			setDraggedPropertyId(null);
			setDropIndicator(null);
		},
		[draggedPropertyId, dropIndicator, contentTypes, contentType, id, setContentTypes]
	);

	const handleDragEnd = useCallback(() => {
		setDraggedPropertyId(null);
		setDropIndicator(null);
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
			<Box
				flex="1"
				onDragOver={(e: React.DragEvent) => e.preventDefault()}
				onDrop={(e: React.DragEvent) => handleDrop(e)}
				onDragLeave={(e: React.DragEvent) => {
					// Only clear if actually leaving the container (not entering a child)
					if (!e.currentTarget.contains(e.relatedTarget as Node)) {
						setDropIndicator(null);
					}
				}}
			>
				<Text color="fg.secondary" mb="24">
					Manage properties for this content type. Use property groups to organise your
					properties.
				</Text>

				{/* Filter and Add Property */}
				<Flex gap="8" mb="24" alignItems="center">
					<SearchInput
						size="lg"
						placeholder="Filter by name"
						value={searchFilter}
						onChange={(e) => setSearchFilter(e.target.value)}
						style={{maxWidth: "280px"}}
					/>
					<Menu
						options={[
							{label: "All", execute: () => setFilterGroup("All")},
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
					<Box flex="1" /> <AddPropertyMenu onAddProperty={handleAddProperty} />
				</Flex>

				{/* Property Groups */}
				{Object.entries(groupedProperties).map(([groupName, properties]) => (
					<Box key={groupName} mb="24">
						<Text fontWeight="600" fontSize="sm" mb="12" color="fg.secondary">
							{groupName}
						</Text>
						<Flex flexDirection="column" gap="8">
							{properties.map((property, index) => (
								<PropertyCard
									key={property.id}
									property={property}
									contentTypes={contentTypes}
									isSelected={selectedPropertyId === property.id}
									isDragging={draggedPropertyId === property.id}
									showDropBefore={
										dropIndicator?.propertyId === property.id &&
										dropIndicator.position === "before"
									}
									showDropAfter={
										dropIndicator?.propertyId === property.id &&
										dropIndicator.position === "after"
									}
									onSelect={() => handleSelectProperty(property.id)}
									onDragStart={() => handleDragStart(property.id)}
									onDragOver={(e) => handleDragOver(e, property.id, index === 0)}
									onDrop={(e) => handleDrop(e)}
									onDragEnd={handleDragEnd}
									onRemove={() => handleRemoveProperty(property)}
								/>
							))}
						</Flex>
					</Box>
				))}

				{filteredProperties.length === 0 && (
					<Box
						p="24"
						style={{textAlign: "center"}}
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
						isNew={newPropertyIds.has(selectedProperty.id)}
					/>
				</Aside>
			)}

			{/* Remove Property Confirm Dialog */}
			<AlertDialog open={removeConfirmOpen} onOpenChange={setRemoveConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>Remove Property</AlertDialogHeader>
					<AlertDialogBody>
						<Box>
							<Text mb="12">
								Are you sure you want to remove the property{" "}
								<strong>
									{propertyToRemove?.displayName || propertyToRemove?.name}
								</strong>
								? This will affect {contentItemsUsingType.length} content{" "}
								{contentItemsUsingType.length === 1 ? "item" : "items"} using this
								content type:
							</Text>
							<Box
								p="12"
								rounded="md"
								bg="bg.secondary"
								style={{maxHeight: "200px", overflowY: "auto"}}
							>
								{contentItemsUsingType.map((item) => (
									<Text key={item.id} fontSize="sm" py="4">
										{item.name}
									</Text>
								))}
							</Box>
						</Box>
					</AlertDialogBody>
					<AlertDialogFooter>
						<AlertDialogCancel />
						<AlertDialogAction
							appearance="danger"
							onClick={() =>
								propertyToRemove && confirmRemoveProperty(propertyToRemove.id)
							}
						>
							Remove
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

// Add Property Menu with grouped type options
function AddPropertyMenu({
	onAddProperty,
}: {
	onAddProperty: (type: PropertyType, groupName?: string) => void;
}) {
	const addPropertyOptions = [
		// Main type categories - sub-type can be selected in the property editor
		{label: "Text", execute: () => onAddProperty("String")},
		{label: "Block", execute: () => onAddProperty("ContentReference")},
		{label: "Content", execute: () => onAddProperty("ContentArea")},
		{label: "Outline", execute: () => onAddProperty("outline")},
		{label: "Date/Time", execute: () => onAddProperty("DateTime")},
		{label: "Link", execute: () => onAddProperty("LinkItem")},
		{label: "Number", execute: () => onAddProperty("Int")},
		{label: "Choice", execute: () => onAddProperty("SelectOne")},
		{label: "Guid", execute: () => onAddProperty("Guid")},
	];

	return (
		<Menu options={addPropertyOptions}>
			<MenuTrigger asChild>
				<Button
					appearance="primary"
					icon={<IconPlus />}
					addonAfter={<IconChevronDown size={20} />}
					h="40"
				>
					Add Property
				</Button>
			</MenuTrigger>
			<MenuContent />
		</Menu>
	);
}

// Drop position indicator line (centered in the 8px gap between cards)
const INSERT_BAR_BASE: React.CSSProperties = {
	height: "2px",
	backgroundColor: "var(--ax-colors-border-focus)",
	borderRadius: "2px",
	pointerEvents: "none",
};

const INSERT_BAR_BEFORE: React.CSSProperties = {
	...INSERT_BAR_BASE,
	marginTop: "-5px",
	marginBottom: "3px",
};

const INSERT_BAR_AFTER: React.CSSProperties = {
	...INSERT_BAR_BASE,
	marginTop: "3px",
	marginBottom: "-5px",
};

// Property Card Component using Axiom Card
interface PropertyCardProps {
	property: Property;
	contentTypes?: ContentType[];
	isSelected?: boolean;
	isDragging?: boolean;
	showDropBefore?: boolean;
	showDropAfter?: boolean;
	onSelect?: () => void;
	onDragStart?: () => void;
	onDragOver?: (e: React.DragEvent) => void;
	onDrop?: (e: React.DragEvent) => void;
	onDragEnd?: () => void;
	onRemove?: () => void;
}

function PropertyCard({
	property,
	contentTypes,
	isSelected,
	isDragging,
	showDropBefore,
	showDropAfter,
	onSelect,
	onDragStart,
	onDragOver,
	onDrop,
	onDragEnd,
	onRemove,
}: PropertyCardProps) {
	const typeCategory = getTypeCategory(property.type, property.allowedTypes, contentTypes);
	const specificType = getSpecificTypeLabel(property.type, property.allowedTypes, contentTypes);

	return (
		<div onDragOver={onDragOver} onDrop={onDrop}>
			{showDropBefore && <div style={INSERT_BAR_BEFORE} />}
			<Card
				data-property-id={property.id}
				p="12"
				cursor="pointer"
				onClick={onSelect}
				draggable
				onDragStart={onDragStart}
				onDragEnd={onDragEnd}
				borderColor={isSelected ? "border.accent" : undefined}
				style={{
					transition:
						"border-color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease",
					boxShadow: isSelected ? "0 0 0 1px var(--ax-color-border-accent)" : undefined,
					opacity: isDragging ? 0.4 : 1,
				}}
			>
				<Flex alignItems="center" gap="12" w="full">
					{/* Drag Handle */}
					<Box
						color="fg.tertiary"
						style={{cursor: "grab"}}
						onMouseDown={(e) => e.stopPropagation()}
					>
						<IconGripVertical size={16} />
					</Box>

					{/* Property Info */}
					<Box flex="1">
						<Text fontWeight="500">{property.displayName || property.name}</Text>
						<Text color="fg.tertiary" fontSize="sm">
							{typeCategory} · {specificType}
							{property.required && (
								<span style={{color: "var(--ax-color-fg-error)"}}> *</span>
							)}
						</Text>
					</Box>

					{/* Actions */}
					<Menu options={[{label: "Remove", execute: () => onRemove?.()}]}>
						<MenuTrigger asChild>
							<Button
								appearance="subtle"
								size="sm"
								aria-label="More options"
								icon={<IconDots size={16} />}
								onClick={(e) => e.stopPropagation()}
							/>
						</MenuTrigger>
						<MenuContent />
					</Menu>
				</Flex>
			</Card>
			{showDropAfter && <div style={INSERT_BAR_AFTER} />}
		</div>
	);
}
