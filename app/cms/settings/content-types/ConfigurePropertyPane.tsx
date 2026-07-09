"use client";

import {
	Box,
	Flex,
	Button,
	Input,
	Checkbox,
	Select,
	SelectTrigger,
	SelectContent,
	Field,
	Heading,
	Separator,
	RadioGroup,
	Radio,
	Link,
	toaster,
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import {IconXmark} from "@/app/lib/axiom-icons";
import { Property, PropertyType, initialContentTypes, ContentType } from "@/app/db/initialData";
import { useState, useEffect, useMemo } from "react";
import usePersistentState from "@/app/usePersistentState";
import type { PropertyGroup } from "@/app/cms/settings/edit-tabs/page";

interface ConfigurePropertyPaneProps {
	property: Property;
	onClose: () => void;
	onSave?: (property: Property) => void;
	/** Whether this property was just created and hasn't been saved yet */
	isNew?: boolean;
}

// Type categories and their sub-types
type TypeCategory = "Text" | "Block" | "Content" | "Outline" | "Date/Time" | "Link" | "Number" | "Boolean" | "Selection" | "Other";

const typeCategories: { value: TypeCategory; label: string }[] = [
	{ value: "Text", label: "Text" },
	{ value: "Block", label: "Block" },
	{ value: "Content", label: "Content" },
	{ value: "Outline", label: "Outline" },
	{ value: "Date/Time", label: "Date/Time" },
	{ value: "Link", label: "Link" },
	{ value: "Number", label: "Number" },
	{ value: "Boolean", label: "Boolean" },
	{ value: "Selection", label: "Selection" },
	{ value: "Other", label: "Other" },
];

const subTypesByCategory: Record<TypeCategory, { value: PropertyType; label: string }[]> = {
	Text: [
		{ value: "String", label: "String (≤255)" },
		{ value: "LongString", label: "String (>255)" },
		{ value: "XhtmlString", label: "XHTML String" },
	],
	Block: [],  // Will be populated dynamically from content types
	Content: [
		{ value: "ContentArea", label: "Content Area" },
		{ value: "ContentReference", label: "Content Reference" },
	],
	Outline: [
		{ value: "outline", label: "Outline" },
	],
	"Date/Time": [
		{ value: "DateTime", label: "Date/Time" },
	],
	Link: [
		{ value: "Url", label: "URL" },
		{ value: "LinkItem", label: "Link" },
		{ value: "LinkItemCollection", label: "Link Collection" },
	],
	Number: [
		{ value: "Int", label: "Integer" },
		{ value: "Double", label: "Decimal" },
	],
	Boolean: [
		{ value: "Boolean", label: "Boolean" },
	],
	Selection: [
		{ value: "SelectOne", label: "Selection (single)" },
		{ value: "SelectMany", label: "Selection (multiple)" },
	],
	Other: [
		{ value: "Guid", label: "GUID" },
	],
};

// Get category from property type
const getCategoryFromType = (type: PropertyType, allowedTypes?: string[], allContentTypes?: ContentType[]): TypeCategory => {
	const textTypes = ["String", "LongString", "XhtmlString", "text", "textarea", "richtext"];
	const numberTypes = ["Int", "Double"];
	const booleanTypes = ["Boolean", "checkbox"];
	const dateTypes = ["DateTime"];
	const linkTypes = ["Url", "LinkItem", "LinkItemCollection", "link"];
	const selectionTypes = ["SelectOne", "SelectMany"];
	const contentTypes = ["ContentArea"];
	const outlineTypes = ["outline"];
	const otherTypes = ["Guid"];

	// Check if ContentReference with allowedTypes pointing to Block content types
	if (type === "ContentReference" && allowedTypes && allowedTypes.length > 0 && allContentTypes) {
		const referencedType = allContentTypes.find(ct => ct.id === allowedTypes[0]);
		if (referencedType && referencedType.baseType === "Block") {
			return "Block";
		}
		return "Content"; // ContentReference but not a block
	}

	// Check for legacy block types (seo, address) - treat as blocks
	if (type === "seo" || type === "address") {
		return "Block";
	}

	if (textTypes.includes(type)) return "Text";
	if (numberTypes.includes(type)) return "Number";
	if (booleanTypes.includes(type)) return "Boolean";
	if (dateTypes.includes(type)) return "Date/Time";
	if (linkTypes.includes(type)) return "Link";
	if (selectionTypes.includes(type)) return "Selection";
	if (contentTypes.includes(type)) return "Content";
	if (outlineTypes.includes(type)) return "Outline";
	if (otherTypes.includes(type)) return "Other";
	return "Other";
};

// Normalize legacy types to standard types
const normalizeType = (type: PropertyType): PropertyType => {
	const typeMap: Partial<Record<PropertyType, PropertyType>> = {
		text: "String",
		textarea: "LongString",
		richtext: "XhtmlString",
		checkbox: "Boolean",
		reference: "ContentReference",
		link: "Url",
	};
	return typeMap[type] || type;
};

// Convert display name to a system-safe name (snake_case, no special chars)
const toSystemName = (displayName: string): string => {
	return displayName
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, "")
		.replace(/\s+/g, "_")
		.replace(/_+/g, "_")
		.replace(/^_|_$/g, "");
};

export default function ConfigurePropertyPane({
	property,
	onClose,
	onSave,
	isNew = false,
}: ConfigurePropertyPaneProps) {
	// Load property groups from settings
	const initialPropertyGroups: PropertyGroup[] = [
		{
			id: "content-settings",
			name: "ContentSettings",
			displayName: "Content Settings",
			sortIndex: 10,
			accessLevel: "Read",
			fromCode: false,
		},
		{
			id: "geo-seo",
			name: "GeoSeo",
			displayName: "GEO & SEO",
			sortIndex: 20,
			accessLevel: "Read",
			fromCode: false,
		},
		{
			id: "categories-tags",
			name: "CategoriesTags",
			displayName: "Categories & Tags",
			sortIndex: 30,
			accessLevel: "Read",
			fromCode: false,
		},
	];

	const [propertyGroups] = usePersistentState(
		"propertyGroups",
		initialPropertyGroups
	) as [PropertyGroup[], (value: PropertyGroup[]) => void];

	// Load content types for block selection
	const [savedContentTypes] = usePersistentState(
		"contentTypes",
		initialContentTypes
	) as [ContentType[], (value: ContentType[]) => void];

	const contentTypes = useMemo(() => {
		if (!savedContentTypes) return initialContentTypes;
		const savedMap = new Map(savedContentTypes.map((ct) => [ct.id, ct]));
		initialContentTypes.forEach((ct) => {
			if (!savedMap.has(ct.id)) {
				savedMap.set(ct.id, ct);
			}
		});
		return Array.from(savedMap.values());
	}, [savedContentTypes]);

	// Convert property groups to select options
	const propertyGroupOptions = useMemo(() => {
		return [...propertyGroups]
			.sort((a, b) => a.sortIndex - b.sortIndex)
			.map((group) => ({
				value: group.displayName,
				label: group.displayName,
			}));
	}, [propertyGroups]);

	// Generate block type options from content types
	const blockTypeOptions = useMemo(() => {
		return contentTypes
			.filter(ct => ct.baseType === "Block")
			.map(ct => ({
				value: ct.id,
				label: ct.displayName,
			}))
			.sort((a, b) => a.label.localeCompare(b.label));
	}, [contentTypes]);

	// Generate reference type options (for Content Reference)
	const referenceTypeOptions = useMemo(() => {
		const options: { value: string; label: string }[] = [
			{ value: "Any", label: "Any" }
		];

		// Add all content types
		contentTypes.forEach(ct => {
			options.push({
				value: ct.id,
				label: ct.displayName || ct.name,
			});
		});

		return options;
	}, [contentTypes]);

	// Get all selectable content types (for allowed/restricted types)
	const selectableContentTypes = useMemo(() => {
		return contentTypes.map(ct => ({
			value: ct.id,
			label: ct.displayName || ct.name,
		}));
	}, [contentTypes]);

	// Merge static subtypes with dynamic block types
	const getSubTypeOptions = (category: TypeCategory) => {
		if (category === "Block") {
			return blockTypeOptions;
		}
		return subTypesByCategory[category] || [];
	};

	const normalizedType = normalizeType(property.type);
	const [displayName, setDisplayName] = useState(property.displayName || property.name);
	const [systemName, setSystemName] = useState(property.name);
	const [nameManuallyEdited, setNameManuallyEdited] = useState(!!property.name && property.displayName ? property.name !== toSystemName(property.displayName) : false);
	const [showNameField, setShowNameField] = useState(false);
	const [typeCategory, setTypeCategory] = useState<TypeCategory>(getCategoryFromType(normalizedType, property.allowedTypes, contentTypes));
	const [propertyType, setPropertyType] = useState<PropertyType>(normalizedType);
	const [required, setRequired] = useState(property.required || false);
	const [searchable, setSearchable] = useState(property.searchable || false);
	const [cultureSpecific, setCultureSpecific] = useState(property.cultureSpecific || false);
	const [description, setDescription] = useState(property.description || "");
	const [maxLength, setMaxLength] = useState<string>(property.validation?.maxLength?.toString() || "");
	const [pattern, setPattern] = useState(property.validation?.pattern || "");
	const [defaultValueType, setDefaultValueType] = useState<string>(
		property.defaultValue !== undefined ? "custom" : "none"
	);
	const [groupName, setGroupName] = useState(property.groupName || (propertyGroupOptions.length > 0 ? propertyGroupOptions[0].value : "Other"));
	const [selectedBlockType, setSelectedBlockType] = useState<string>(
		property.allowedTypes && property.allowedTypes.length > 0 ? property.allowedTypes[0] : ""
	);
	// Content Reference specific states
	const [referenceType, setReferenceType] = useState<string>(
		property.type === "ContentReference" && property.allowedTypes && property.allowedTypes.length === 1
			? property.allowedTypes[0]
			: "Any"
	);
	const [allowedContentTypes, setAllowedContentTypes] = useState<string[]>(
		property.allowedTypes && property.allowedTypes.length > 1 ? property.allowedTypes : []
	);
	const [restrictedContentTypes, setRestrictedContentTypes] = useState<string[]>(
		property.restrictedTypes || []
	);

	// Reset state when property changes
	useEffect(() => {
		const normalized = normalizeType(property.type);
		setDisplayName(property.displayName || property.name);
		setSystemName(property.name);
		setNameManuallyEdited(!!property.name && property.displayName ? property.name !== toSystemName(property.displayName) : false);
		setShowNameField(false);
		setTypeCategory(getCategoryFromType(normalized, property.allowedTypes, contentTypes));
		setPropertyType(normalized);
		setRequired(property.required || false);
		setSearchable(property.searchable || false);
		setCultureSpecific(property.cultureSpecific || false);
		setDescription(property.description || "");
		setMaxLength(property.validation?.maxLength?.toString() || "");
		setPattern(property.validation?.pattern || "");
		setDefaultValueType(property.defaultValue !== undefined ? "custom" : "none");
		setGroupName(property.groupName || (propertyGroupOptions.length > 0 ? propertyGroupOptions[0].value : "Other"));
		setSelectedBlockType(property.allowedTypes && property.allowedTypes.length > 0 ? property.allowedTypes[0] : "");
		setReferenceType(
			property.type === "ContentReference" && property.allowedTypes && property.allowedTypes.length === 1
				? property.allowedTypes[0]
				: "Any"
		);
		setAllowedContentTypes(property.allowedTypes && property.allowedTypes.length > 1 ? property.allowedTypes : []);
		setRestrictedContentTypes(property.restrictedTypes || []);
	}, [property, propertyGroupOptions, contentTypes]);

	// Check if any changes have been made
	const hasChanges = useMemo(() => {
		const currentName = nameManuallyEdited ? systemName.trim() : toSystemName(displayName);
		const originalName = property.name;
		const originalDisplayName = property.displayName || property.name;
		const originalType = normalizeType(property.type);
		const originalRequired = property.required || false;
		const originalSearchable = property.searchable || false;
		const originalCultureSpecific = property.cultureSpecific || false;
		const originalDescription = property.description || "";
		const originalMaxLength = property.validation?.maxLength?.toString() || "";
		const originalPattern = property.validation?.pattern || "";
		const originalGroupName = property.groupName || (propertyGroupOptions.length > 0 ? propertyGroupOptions[0].value : "Other");
		const originalBlockType = property.allowedTypes && property.allowedTypes.length > 0 ? property.allowedTypes[0] : "";
		const originalReferenceType = property.type === "ContentReference" && property.allowedTypes && property.allowedTypes.length === 1 ? property.allowedTypes[0] : "Any";
		const originalAllowedTypes = property.allowedTypes && property.allowedTypes.length > 1 ? property.allowedTypes : [];
		const originalRestrictedTypes = property.restrictedTypes || [];

		// Helper to compare arrays
		const arraysEqual = (a: string[], b: string[]) => {
			if (a.length !== b.length) return false;
			const sortedA = [...a].sort();
			const sortedB = [...b].sort();
			return sortedA.every((val, idx) => val === sortedB[idx]);
		};

		return (
			displayName.trim() !== originalDisplayName ||
			currentName !== originalName ||
			propertyType !== originalType ||
			required !== originalRequired ||
			searchable !== originalSearchable ||
			cultureSpecific !== originalCultureSpecific ||
			description !== originalDescription ||
			maxLength !== originalMaxLength ||
			pattern !== originalPattern ||
			groupName !== originalGroupName ||
			(typeCategory === "Block" && selectedBlockType !== originalBlockType) ||
			(propertyType === "ContentReference" && typeCategory === "Content" && (
				referenceType !== originalReferenceType ||
				!arraysEqual(allowedContentTypes, originalAllowedTypes) ||
				!arraysEqual(restrictedContentTypes, originalRestrictedTypes)
			))
		);
	}, [
		displayName,
		systemName,
		nameManuallyEdited,
		propertyType,
		required,
		searchable,
		cultureSpecific,
		description,
		maxLength,
		pattern,
		groupName,
		selectedBlockType,
		referenceType,
		allowedContentTypes,
		restrictedContentTypes,
		typeCategory,
		property,
		propertyGroupOptions,
	]);

	// When category changes, reset to first sub-type of that category
	const handleCategoryChange = (category: TypeCategory) => {
		setTypeCategory(category);
		const subTypes = getSubTypeOptions(category);
		if (subTypes && subTypes.length > 0) {
			// For Block category, set to ContentReference and store the block type in allowedTypes
			if (category === "Block") {
				setPropertyType("ContentReference");
				setSelectedBlockType(blockTypeOptions.length > 0 ? blockTypeOptions[0].value : "");
			} else {
				setPropertyType(subTypes[0].value as PropertyType);
			}
		}
	};

	const handleSave = () => {
		if (onSave) {
			const finalName = nameManuallyEdited ? systemName.trim() : toSystemName(displayName);

			// Determine allowedTypes based on type category
			let allowedTypes: string[] | undefined = undefined;
			let restrictedTypes: string[] | undefined = undefined;

			if (typeCategory === "Block" && selectedBlockType) {
				allowedTypes = [selectedBlockType];
			} else if (propertyType === "ContentReference" && typeCategory === "Content") {
				if (referenceType === "Any") {
					allowedTypes = allowedContentTypes.length > 0 ? allowedContentTypes : undefined;
					restrictedTypes = restrictedContentTypes.length > 0 ? restrictedContentTypes : undefined;
				} else {
					allowedTypes = [referenceType];
				}
			}

			onSave({
				...property,
				name: finalName || toSystemName(displayName),
				displayName: displayName.trim(),
				type: propertyType,
				required,
				searchable,
				cultureSpecific,
				description,
				groupName,
				allowedTypes,
				restrictedTypes,
				validation: maxLength || pattern ? {
					...(maxLength ? { maxLength: parseInt(maxLength, 10) } : {}),
					...(pattern ? { pattern } : {}),
				} : undefined,
			});
			toaster.create(`Property "${displayName.trim()}" saved successfully`, { intent: "success" });
			onClose();
		}
	};

	const subTypeOptions = getSubTypeOptions(typeCategory);
	const selectedSubTypeLabel = subTypeOptions.find(opt => opt.value === propertyType)?.label || propertyType;
	const isTextType = ["String", "LongString", "XhtmlString", "text", "textarea", "richtext"].includes(propertyType);
	const autoName = nameManuallyEdited ? systemName : toSystemName(displayName);

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
				alignItems="center"
				justifyContent="space-between"
			>
				<Heading level="4">Configure Property</Heading>
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
				{/* System Name Field - always visible & disabled for existing, toggleable for new */}
				{(!isNew || showNameField) && (
					<Field label="Name" required mb="16">
						<Input
							value={nameManuallyEdited ? systemName : autoName}
							onChange={(e) => {
								setSystemName(e.target.value);
								setNameManuallyEdited(true);
							}}
							placeholder="System name"
							disabled={!isNew}
						/>
					</Field>
				)}

				{/* Display Name Field */}
				<Box mb="16">
					<Field label="Display Name" required>
						<Input
							value={displayName}
							onChange={(e) => {
								setDisplayName(e.target.value);
								if (!nameManuallyEdited) {
									setSystemName(toSystemName(e.target.value));
								}
							}}
							placeholder="Property display name"
						/>
					</Field>
					{isNew && !showNameField && (
						<Text fontSize="sm" color="fg.tertiary" mt="4">
							{displayName.trim()
								? <>Name: {autoName} (<Link asChild><button onClick={() => setShowNameField(true)}>change</button></Link>)</>
								: <>Name generated from Display Name (<Link asChild><button onClick={() => setShowNameField(true)}>change</button></Link>)</>
							}
						</Text>
					)}
				</Box>

				{/* Type Field */}
				<Field label="Type" required mb="16">
					<Select
						value={typeCategory}
						onValueChange={(value) => handleCategoryChange(value as TypeCategory)}
						options={typeCategories}
					>
						<SelectTrigger w="full">
							{typeCategory}
						</SelectTrigger>
						<SelectContent />
					</Select>
				</Field>

				{/* Sub-Type Field */}
				{subTypeOptions.length > 1 && (
					<Field label={`${typeCategory} Type`} required mb="16">
						<Select
							value={typeCategory === "Block" ? selectedBlockType : propertyType}
							onValueChange={(value) => {
								if (typeCategory === "Block") {
									setSelectedBlockType(value);
								} else {
									setPropertyType(value as PropertyType);
								}
							}}
							options={subTypeOptions}
						>
							<SelectTrigger w="full">
								{typeCategory === "Block"
									? blockTypeOptions.find(opt => opt.value === selectedBlockType)?.label || "Select block type"
									: selectedSubTypeLabel
								}
							</SelectTrigger>
							<SelectContent />
						</Select>
					</Field>
				)}

				{/* Show Block subtype selector even when there's only one or no option */}
				{typeCategory === "Block" && subTypeOptions.length <= 1 && (
					<Field label="Block Type" required mb="16">
						<Select
							value={selectedBlockType}
							onValueChange={setSelectedBlockType}
							options={blockTypeOptions}
						>
							<SelectTrigger w="full">
								{blockTypeOptions.find(opt => opt.value === selectedBlockType)?.label || "Select block type"}
							</SelectTrigger>
							<SelectContent />
						</Select>
					</Field>
				)}

				{/* Content Reference - Reference Type selector */}
				{propertyType === "ContentReference" && typeCategory === "Content" && (
					<Field label="Reference Type" required mb="16">
						<Select
							value={referenceType}
							onValueChange={setReferenceType}
							options={referenceTypeOptions}
						>
							<SelectTrigger w="full">
								{referenceTypeOptions.find(opt => opt.value === referenceType)?.label || "Any"}
							</SelectTrigger>
							<SelectContent />
						</Select>
					</Field>
				)}

				{/* Content Reference - Allowed Types (when Reference Type is "Any") */}
				{propertyType === "ContentReference" && typeCategory === "Content" && referenceType === "Any" && (
					<Field label="Allowed Content Types" mb="16">
						<Text fontSize="sm" color="fg.secondary" mb="8">
							Configure which content types can be selected (leave empty for all types)
						</Text>
						<Box p="12" bg="bg.secondary" rounded="md">
							<Text fontSize="sm" color="fg.secondary">
								{allowedContentTypes.length > 0
									? `${allowedContentTypes.length} type(s) configured`
									: "All types allowed (multi-select UI to be implemented)"}
							</Text>
						</Box>
					</Field>
				)}

				{/* Content Reference - Restricted Types (when Reference Type is "Any") */}
				{propertyType === "ContentReference" && typeCategory === "Content" && referenceType === "Any" && (
					<Field label="Restricted Content Types" mb="16">
						<Text fontSize="sm" color="fg.secondary" mb="8">
							Configure which content types to exclude from selection
						</Text>
						<Box p="12" bg="bg.secondary" rounded="md">
							<Text fontSize="sm" color="fg.secondary">
								{restrictedContentTypes.length > 0
									? `${restrictedContentTypes.length} type(s) restricted`
									: "No restrictions (multi-select UI to be implemented)"}
							</Text>
						</Box>
					</Field>
				)}

				{/* Text-specific validation */}
				{isTextType && (
					<>
						<Field label="Max Length" mb="16">
							<Input
								type="number"
								value={maxLength}
								onChange={(e) => setMaxLength(e.target.value)}
								placeholder={propertyType === "String" ? "255" : "Unlimited"}
							/>
						</Field>

						<Field label="Regular Expression" mb="16">
							<Input
								value={pattern}
								onChange={(e) => setPattern(e.target.value)}
								placeholder="e.g., ^[a-zA-Z]+$"
							/>
						</Field>
					</>
				)}

				{/* Checkboxes */}
				<Box mb="16">
					<Checkbox
						checked={required}
						onCheckedChange={(checked) => setRequired(checked === true)}
					>
						Is Required
					</Checkbox>
				</Box>

				<Box mb="16">
					<Checkbox
						checked={cultureSpecific}
						onCheckedChange={(checked) => setCultureSpecific(checked === true)}
					>
						Unique value per language
					</Checkbox>
				</Box>

				<Box mb="16">
					<Checkbox
						checked={searchable}
						onCheckedChange={(checked) => setSearchable(checked === true)}
					>
						Searchable
					</Checkbox>
				</Box>

				<Separator my="24" />

				{/* Default value section */}
				<Field label="Default value" mb="16">
					<RadioGroup
						value={defaultValueType}
						onValueChange={setDefaultValueType}
					>
						<Radio value="none">No default value</Radio>
						<Radio value="inherit">Inherits value</Radio>
						<Radio value="custom">Custom</Radio>
					</RadioGroup>
				</Field>

				<Separator my="24" />

				{/* User Interface section */}
				<Heading level="4" mb="16">User Interface</Heading>

				<Box mb="16">
					<Checkbox defaultChecked>
						Display in edit view
					</Checkbox>
				</Box>

				<Field label="Display name" mb="16">
					<Input
						value={displayName}
						onChange={(e) => {
							setDisplayName(e.target.value);
							if (!nameManuallyEdited) {
								setSystemName(toSystemName(e.target.value));
							}
						}}
						placeholder="Display name"
					/>
				</Field>

				<Field label="Help text" mb="16">
					<Input
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Help text for editors"
					/>
				</Field>

				<Field label="Sort index" mb="16">
					<Input
						type="number"
						defaultValue={property.order?.toString() || "0"}
						placeholder="0"
					/>
				</Field>

				<Field label="Property Group" mb="16">
					<Select
						value={groupName}
						onValueChange={(value) => setGroupName(value)}
						options={propertyGroupOptions}
					>
						<SelectTrigger w="full">
							{groupName}
						</SelectTrigger>
						<SelectContent />
					</Select>
				</Field>
			</Box>

			{/* Footer */}
			<Box
				px="16"
				py="12"
				borderT="1"
				borderColor="border.secondary"
			>
				<Flex flexDirection="row" gap="8" justifyContent="space-between" alignItems="center">
					<Box color="fg.error" fontSize="sm">
						* Required Field
					</Box>
					<Flex flexDirection="row" gap="8">
						<Button appearance="subtle" onClick={onClose}>
							Cancel
						</Button>
						<Button appearance="primary" onClick={handleSave} disabled={!displayName.trim() || !hasChanges}>
							Save
						</Button>
					</Flex>
				</Flex>
			</Box>
		</Box>
	);
}
