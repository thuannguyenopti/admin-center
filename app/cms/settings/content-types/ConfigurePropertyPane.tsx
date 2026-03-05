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
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { IconX } from "@tabler/icons-react";
import { Property, PropertyType } from "@/app/db/initialData";
import { useState, useEffect } from "react";

interface ConfigurePropertyPaneProps {
	property: Property;
	onClose: () => void;
	onSave?: (property: Property) => void;
	/** Whether this property was just created and hasn't been saved yet */
	isNew?: boolean;
}

// Type categories and their sub-types
type TypeCategory = "Text" | "Number" | "Boolean" | "Date/Time" | "Reference" | "Selection" | "Content" | "Other";

const typeCategories: { value: TypeCategory; label: string }[] = [
	{ value: "Text", label: "Text" },
	{ value: "Number", label: "Number" },
	{ value: "Boolean", label: "Boolean" },
	{ value: "Date/Time", label: "Date/Time" },
	{ value: "Reference", label: "Reference" },
	{ value: "Selection", label: "Selection" },
	{ value: "Content", label: "Content" },
	{ value: "Other", label: "Other" },
];

const subTypesByCategory: Record<TypeCategory, { value: PropertyType; label: string }[]> = {
	Text: [
		{ value: "String", label: "String (≤255)" },
		{ value: "LongString", label: "String (>255)" },
		{ value: "XhtmlString", label: "XHTML String" },
	],
	Number: [
		{ value: "Int", label: "Integer" },
		{ value: "Double", label: "Decimal" },
	],
	Boolean: [
		{ value: "Boolean", label: "Boolean" },
	],
	"Date/Time": [
		{ value: "DateTime", label: "Date/Time" },
	],
	Reference: [
		{ value: "ContentReference", label: "Content Reference" },
		{ value: "PageReference", label: "Page Reference" },
		{ value: "ImageReference", label: "Image Reference" },
		{ value: "VideoReference", label: "Video Reference" },
		{ value: "Url", label: "URL" },
		{ value: "LinkItem", label: "Link Item" },
		{ value: "link", label: "Link (legacy)" },
	],
	Selection: [
		{ value: "SelectOne", label: "Selection (single)" },
		{ value: "SelectMany", label: "Selection (multiple)" },
	],
	Content: [
		{ value: "ContentArea", label: "Content Area" },
		{ value: "LinkItemCollection", label: "Link Collection" },
	],
	Other: [
		{ value: "address", label: "Address" },
		{ value: "outline", label: "Outline" },
		{ value: "seo", label: "SEO" },
	],
};

// Get category from property type
const getCategoryFromType = (type: PropertyType): TypeCategory => {
	const textTypes = ["String", "LongString", "XhtmlString", "text", "textarea", "richtext"];
	const numberTypes = ["Int", "Double"];
	const booleanTypes = ["Boolean", "checkbox"];
	const dateTypes = ["DateTime"];
	const referenceTypes = ["ContentReference", "PageReference", "ImageReference", "VideoReference", "reference", "Url", "LinkItem", "link"];
	const selectionTypes = ["SelectOne", "SelectMany"];
	const contentTypes = ["ContentArea", "LinkItemCollection"];

	if (textTypes.includes(type)) return "Text";
	if (numberTypes.includes(type)) return "Number";
	if (booleanTypes.includes(type)) return "Boolean";
	if (dateTypes.includes(type)) return "Date/Time";
	if (referenceTypes.includes(type)) return "Reference";
	if (selectionTypes.includes(type)) return "Selection";
	if (contentTypes.includes(type)) return "Content";
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
	const normalizedType = normalizeType(property.type);
	const [displayName, setDisplayName] = useState(property.displayName || property.name);
	const [systemName, setSystemName] = useState(property.name);
	const [nameManuallyEdited, setNameManuallyEdited] = useState(!!property.name && property.displayName ? property.name !== toSystemName(property.displayName) : false);
	const [showNameField, setShowNameField] = useState(false);
	const [typeCategory, setTypeCategory] = useState<TypeCategory>(getCategoryFromType(normalizedType));
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

	// Reset state when property changes
	useEffect(() => {
		const normalized = normalizeType(property.type);
		setDisplayName(property.displayName || property.name);
		setSystemName(property.name);
		setNameManuallyEdited(!!property.name && property.displayName ? property.name !== toSystemName(property.displayName) : false);
		setShowNameField(false);
		setTypeCategory(getCategoryFromType(normalized));
		setPropertyType(normalized);
		setRequired(property.required || false);
		setSearchable(property.searchable || false);
		setCultureSpecific(property.cultureSpecific || false);
		setDescription(property.description || "");
		setMaxLength(property.validation?.maxLength?.toString() || "");
		setPattern(property.validation?.pattern || "");
		setDefaultValueType(property.defaultValue !== undefined ? "custom" : "none");
	}, [property]);

	// When category changes, reset to first sub-type of that category
	const handleCategoryChange = (category: TypeCategory) => {
		setTypeCategory(category);
		const subTypes = subTypesByCategory[category];
		if (subTypes && subTypes.length > 0) {
			setPropertyType(subTypes[0].value);
		}
	};

	const handleSave = () => {
		if (onSave) {
			const finalName = nameManuallyEdited ? systemName.trim() : toSystemName(displayName);
			onSave({
				...property,
				name: finalName || toSystemName(displayName),
				displayName: displayName.trim(),
				type: propertyType,
				required,
				searchable,
				cultureSpecific,
				description,
				validation: maxLength || pattern ? {
					...(maxLength ? { maxLength: parseInt(maxLength, 10) } : {}),
					...(pattern ? { pattern } : {}),
				} : undefined,
			});
		}
	};

	const subTypeOptions = subTypesByCategory[typeCategory] || [];
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
					icon={<IconX size={18} />}
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
							value={propertyType}
							onValueChange={(value) => setPropertyType(value as PropertyType)}
							options={subTypeOptions}
						>
							<SelectTrigger w="full">
								{selectedSubTypeLabel}
							</SelectTrigger>
							<SelectContent />
						</Select>
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
						value={property.groupName || "Content"}
						options={[
							{ value: "Content", label: "Content" },
							{ value: "Settings", label: "Settings" },
							{ value: "SEO", label: "SEO" },
							{ value: "Social", label: "Social" },
							{ value: "Basic", label: "Basic" },
						]}
					>
						<SelectTrigger w="full">
							{property.groupName || "Content"}
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
						<Button appearance="primary" onClick={handleSave} disabled={!displayName.trim()}>
							Save
						</Button>
					</Flex>
				</Flex>
			</Box>
		</Box>
	);
}
