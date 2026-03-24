"use client";

import { useState, useEffect, useRef } from "react";
import {
	Box,
	Breadcrumb,
	Heading,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
	Field,
	Input,
	Textarea,
	Group,
	Switch,
	Menu,
	MenuTrigger,
	MenuContent,
	LabelMenuButton,
	Card,
	CardHeader,
	Disclosure,
	DisclosureContent,
	DisclosureTrigger,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogBody,
	DialogFooter,
	DialogClose,
} from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { useRouter } from "next/navigation";
import usePersistentState from "@/app/usePersistentState";
import {
	IconLetterT,
	IconAlignLeft,
	IconHash,
	IconCheck,
	IconCalendar,
	IconFileText,
	IconCircleDot,
	IconLink,
	IconMapPin,
	IconCode,
	IconPhoto,
	IconGripVertical,
} from "@tabler/icons-react";
import { ContentType } from "@/app/db/initialData";

type CmpContentModel = {
	id: string;
	name: string;
	displayName: string;
	baseType: string;
	description?: string;
	properties: any[];
	modifiedAt: string;
	modifiedBy: string;
	isActive?: boolean;
	apiIdentifier?: string;
	version?: string;
	defaultLocale?: string;
	modelType?: "component" | "content";
	coverImage?: string;
};

type BaseType = ContentType["baseType"];

const LOCALE_OPTIONS = [
	{ label: "English (US)", value: "en-US" },
	{ label: "English (UK)", value: "en-GB" },
	{ label: "Spanish", value: "es-ES" },
	{ label: "French", value: "fr-FR" },
	{ label: "German", value: "de-DE" },
	{ label: "Italian", value: "it-IT" },
	{ label: "Portuguese", value: "pt-PT" },
	{ label: "Japanese", value: "ja-JP" },
	{ label: "Chinese (Simplified)", value: "zh-CN" },
	{ label: "Swedish", value: "sv-SE" },
];

const FIELD_TYPES = [
	{ label: "Text", value: "text", icon: <IconLetterT size={24} /> },
	{ label: "Long Text", value: "longText", icon: <IconAlignLeft size={24} /> },
	{ label: "Number", value: "number", icon: <IconHash size={24} /> },
	{ label: "Boolean", value: "boolean", icon: <IconCheck size={24} /> },
	{ label: "Date & Time", value: "datetime", icon: <IconCalendar size={24} /> },
	{ label: "Rich Text", value: "richText", icon: <IconFileText size={24} /> },
	{ label: "Choice", value: "choice", icon: <IconCircleDot size={24} /> },
	{ label: "URL", value: "url", icon: <IconLink size={24} /> },
	{ label: "Location", value: "location", icon: <IconMapPin size={24} /> },
	{ label: "JSON Object", value: "json", icon: <IconCode size={24} /> },
	{ label: "Library Asset", value: "libraryAsset", icon: <IconPhoto size={24} /> },
	{ label: "Content Reference", value: "contentReference", icon: <IconLink size={24} /> },
];

// Get icon for field type
const getFieldTypeIcon = (type: string) => {
	const fieldType = FIELD_TYPES.find((ft) => ft.value === type);
	return fieldType?.icon || <IconLetterT size={20} />;
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

const generateContentModelId = (): string => {
	return `cm-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
};

export default function NewContentModelPage() {
	const router = useRouter();

	const [cmpContentModels, setCmpContentModels] = usePersistentState("cmpContentModels", []) as [
		CmpContentModel[],
		(value: CmpContentModel[]) => void,
	];

	const [activeTab, setActiveTab] = useState("details");
	const [displayName, setDisplayName] = useState("");
	const [name, setName] = useState("");
	const [apiIdentifier, setApiIdentifier] = useState("");
	const [version, setVersion] = useState("_v1");
	const [description, setDescription] = useState("");
	const [defaultLocale, setDefaultLocale] = useState("en-US");
	const [baseType] = useState<BaseType>("Page");
	const [modelType, setModelType] = useState<"component" | "content">("component");
	const [coverImage, setCoverImage] = useState("");
	const [nameManuallyEdited, setNameManuallyEdited] = useState(false);
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [properties, setProperties] = useState<any[]>([]);
	const titleInputRef = useRef<HTMLInputElement>(null);

	// Add Field Dialog state
	const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
	const [fieldDialogStep, setFieldDialogStep] = useState(1);
	const [selectedFieldType, setSelectedFieldType] = useState("");
	const [fieldDisplayName, setFieldDisplayName] = useState("");
	const [fieldName, setFieldName] = useState("");
	const [fieldDescription, setFieldDescription] = useState("");
	const [fieldRequired, setFieldRequired] = useState(false);
	const [fieldList, setFieldList] = useState(false);
	const [fieldLocalized, setFieldLocalized] = useState(false);
	const [fieldNameManuallyEdited, setFieldNameManuallyEdited] = useState(false);

	// Auto-generate name from display name
	useEffect(() => {
		if (!nameManuallyEdited && displayName) {
			const systemName = toSystemName(displayName);
			setName(systemName);
			setApiIdentifier(systemName);
		}
	}, [displayName, nameManuallyEdited]);

	// Auto-generate field name from field display name
	useEffect(() => {
		if (!fieldNameManuallyEdited && fieldDisplayName) {
			setFieldName(toSystemName(fieldDisplayName));
		}
	}, [fieldDisplayName, fieldNameManuallyEdited]);

	const handleAddField = () => {
		setIsFieldDialogOpen(true);
		setFieldDialogStep(1);
	};

	const handleFieldTypeSelect = (type: string) => {
		setSelectedFieldType(type);
		setFieldDialogStep(2);
	};

	const handleFieldDialogClose = () => {
		setIsFieldDialogOpen(false);
		setFieldDialogStep(1);
		setSelectedFieldType("");
		setFieldDisplayName("");
		setFieldName("");
		setFieldDescription("");
		setFieldRequired(false);
		setFieldList(false);
		setFieldLocalized(false);
		setFieldNameManuallyEdited(false);
	};

	const handleFieldBack = () => {
		setFieldDialogStep(1);
		setSelectedFieldType("");
	};

	const handleFieldAdd = () => {
		const newField = {
			id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
			name: fieldName || toSystemName(fieldDisplayName),
			displayName: fieldDisplayName,
			type: selectedFieldType,
			description: fieldDescription,
			required: fieldRequired,
			list: fieldList,
			localized: fieldLocalized,
		};

		setProperties([...properties, newField]);
		handleFieldDialogClose();
	};

	const handleDone = () => {
		if (!displayName.trim()) {
			alert("Display name is required");
			return;
		}

		const newContentModel: CmpContentModel = {
			id: generateContentModelId(),
			name: name || toSystemName(displayName),
			displayName: displayName,
			baseType: baseType,
			description: description,
			properties: properties,
			modifiedAt: new Date().toISOString(),
			modifiedBy: "Current User",
			isActive: true,
			apiIdentifier: apiIdentifier,
			version: version,
			defaultLocale: defaultLocale,
			modelType: modelType,
			coverImage: coverImage,
		};

		setCmpContentModels([...cmpContentModels, newContentModel]);
		router.push("/cmp/settings/content-models");
	};

	const handleTitleClick = () => {
		setIsEditingTitle(true);
	};

	const handleTitleBlur = () => {
		setIsEditingTitle(false);
	};

	const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			setIsEditingTitle(false);
		}
	};

	// Focus input when editing starts
	useEffect(() => {
		if (isEditingTitle && titleInputRef.current) {
			titleInputRef.current.focus();
			titleInputRef.current.select();
		}
	}, [isEditingTitle]);

	return (
		<Box p="24">
			<Box mb="24">
				<Breadcrumb
					mb="16"
					items={[
						{ href: "/cmp/settings/content-models", label: "Templates" },
						{ label: "New Content Model" },
					]}
				/>

				{isEditingTitle ? (
					<Input
						ref={titleInputRef}
						value={displayName}
						onChange={(e) => setDisplayName(e.target.value)}
						onBlur={handleTitleBlur}
						onKeyDown={handleTitleKeyDown}
						fontSize="lg"
						fontWeight="500"
						mb="16"
						style={{
							border: "none",
							padding: 0,
							height: "auto",
						}}
					/>
				) : (
					<Heading
						level="3"
						mb="16"
						onClick={handleTitleClick}
						style={{ cursor: "pointer" }}
						className="hover:text-fg-secondary"
					>
						{displayName || "Untitled Content Model"}
					</Heading>
				)}

				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList>
						<TabsTrigger value="details">Details</TabsTrigger>
						<TabsTrigger value="fields">Fields</TabsTrigger>
					</TabsList>

					<TabsContent value="details">
						<Box mt="24" style={{ maxWidth: "600px" }}>
							<Group flexDirection="column" gap="24">
								<Field label="Display Name" required>
									<Input
										value={displayName}
										onChange={(e) => setDisplayName(e.target.value)}
										placeholder="e.g., Landing Page"
										autoFocus
									/>
								</Field>

								<Box>
									<Text fontSize="sm" fontWeight="500" mb="8" color="fg.secondary">
										Cover Image
									</Text>
									<Box
										display="flex"
										alignItems="center"
										justifyContent="center"
										flexDirection="column"
										gap="8"
										p="32"
										rounded="md"
										border="1"
										borderColor="border.tertiary"
										bg="bg.secondary"
										style={{ cursor: "pointer" }}
									>
										<IconPhoto size={32} color="var(--ax-colors-fg-tertiary)" />
										<Text fontSize="sm" fontWeight="500" color="fg.default">
											Add Cover Image
										</Text>
										<Text fontSize="xs" color="fg.tertiary">
											400 x 360 px
										</Text>
									</Box>
								</Box>

								<Field label="API Identifier">
									<Group gap="8" alignItems="center">
										<Input
											value={apiIdentifier}
											onChange={(e) => {
												setApiIdentifier(e.target.value);
												setNameManuallyEdited(true);
											}}
											flex="1"
											placeholder="e.g., landing_page"
										/>
										<Group alignItems="center" gap="8">
											<Text fontSize="sm" color="fg.secondary">
												Version:
											</Text>
											<Input
												value={version}
												onChange={(e) => setVersion(e.target.value)}
												style={{ width: "80px" }}
											/>
											<Button appearance="subtle" size="sm" icon={<IconLink size={16} />} />
										</Group>
									</Group>
								</Field>

								<Field label="Description" info="Optional">
									<Textarea
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										placeholder="Add a description..."
										rows={4}
									/>
									<Text fontSize="xs" color="fg.tertiary" mt="4">
										{description.length}/250
									</Text>
								</Field>

								<Field label="Default Locale" info="Optional">
									<Menu
										options={LOCALE_OPTIONS.map((opt) => ({
											label: opt.label,
											execute: () => setDefaultLocale(opt.value),
											...(defaultLocale === opt.value && { selected: true }),
										}))}
									>
										<MenuTrigger asChild>
											<LabelMenuButton label="">
												{LOCALE_OPTIONS.find((opt) => opt.value === defaultLocale)?.label || "Select locale"}
											</LabelMenuButton>
										</MenuTrigger>
										<MenuContent />
									</Menu>
								</Field>

								<Group gap="16" alignItems="center">
									<Text fontSize="sm" fontWeight="500">
										What's the model type?
									</Text>
									<Text fontSize="sm" color="fg.secondary">
										Component Type
									</Text>
									<Switch
										checked={modelType === "content"}
										onCheckedChange={(checked) => {
											setModelType(checked ? "content" : "component");
										}}
									/>
									<Text fontSize="sm" color="fg.secondary">
										Content Type
									</Text>
								</Group>
							</Group>

							<Group justifyContent="flex-end" alignItems="center" mt="32" pt="24" borderT="1" borderColor="border.tertiary">
								<Button appearance="primary" onClick={handleDone}>
									Done
								</Button>
							</Group>
						</Box>
					</TabsContent>

					<TabsContent value="fields">
						<Box mt="24">
							<Group justifyContent="flex-end" mb="16">
								<Button appearance="default" onClick={handleAddField}>
									Add Field
								</Button>
							</Group>

							{properties && properties.length > 0 ? (
								<Group flexDirection="column" gap="8">
									{properties.map((property: any, index: number) => (
										<Card key={property.id}>
											<Disclosure>
												<DisclosureTrigger chevronPosition="end">
													<Group gap="12" w="full" alignItems="center">
														<Box color="fg.tertiary" style={{ cursor: "grab" }}>
															<IconGripVertical size={20} />
														</Box>
														<Box color="fg.secondary">
															{getFieldTypeIcon(property.type)}
														</Box>
														<Text fontSize="md" fontWeight="500">
															{property.displayName || property.name}
														</Text>
													</Group>
												</DisclosureTrigger>
												<DisclosureContent>
													<Box p="16" borderT="1" borderColor="border.tertiary">
														<Group flexDirection="column" gap="16">
															<Field label="Display Name">
																<Input
																	value={property.displayName || ""}
																	onChange={(e) => {
																		const updatedProperties = [...properties];
																		updatedProperties[index] = {
																			...updatedProperties[index],
																			displayName: e.target.value,
																		};
																		setProperties(updatedProperties);
																	}}
																/>
															</Field>
															<Field label="Field Name">
																<Input
																	value={property.name || ""}
																	onChange={(e) => {
																		const updatedProperties = [...properties];
																		updatedProperties[index] = {
																			...updatedProperties[index],
																			name: e.target.value,
																		};
																		setProperties(updatedProperties);
																	}}
																/>
															</Field>
															<Field label="Description" info="Optional">
																<Textarea
																	value={property.description || ""}
																	onChange={(e) => {
																		const updatedProperties = [...properties];
																		updatedProperties[index] = {
																			...updatedProperties[index],
																			description: e.target.value,
																		};
																		setProperties(updatedProperties);
																	}}
																	rows={3}
																/>
															</Field>
															<Group gap="16" alignItems="center">
																<Switch
																	checked={property.required || false}
																	onCheckedChange={(checked) => {
																		const updatedProperties = [...properties];
																		updatedProperties[index] = {
																			...updatedProperties[index],
																			required: checked,
																		};
																		setProperties(updatedProperties);
																	}}
																/>
																<Text fontSize="sm">Required</Text>
															</Group>
															<Group gap="16" alignItems="center">
																<Switch
																	checked={property.list || false}
																	onCheckedChange={(checked) => {
																		const updatedProperties = [...properties];
																		updatedProperties[index] = {
																			...updatedProperties[index],
																			list: checked,
																		};
																		setProperties(updatedProperties);
																	}}
																/>
																<Text fontSize="sm">Allow multiple values</Text>
															</Group>
															<Group gap="16" alignItems="center">
																<Switch
																	checked={property.localized || false}
																	onCheckedChange={(checked) => {
																		const updatedProperties = [...properties];
																		updatedProperties[index] = {
																			...updatedProperties[index],
																			localized: checked,
																		};
																		setProperties(updatedProperties);
																	}}
																/>
																<Text fontSize="sm">Localized</Text>
															</Group>
														</Group>
													</Box>
												</DisclosureContent>
											</Disclosure>
										</Card>
									))}
								</Group>
							) : (
								<Box
									display="flex"
									flexDirection="column"
									alignItems="center"
									justifyContent="center"
									py="64"
									rounded="md"
									border="1"
									borderColor="border.tertiary"
									bg="bg.secondary"
								>
									<Text fontSize="md" color="fg.secondary">
										No fields yet
									</Text>
								</Box>
							)}

							<Group justifyContent="flex-end" alignItems="center" mt="32" pt="24" borderT="1" borderColor="border.tertiary">
								<Button appearance="primary" onClick={handleDone}>
									Done
								</Button>
							</Group>
						</Box>
					</TabsContent>
				</Tabs>
			</Box>

			{/* Add Field Dialog */}
			<Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
				<DialogContent size="md">
					<DialogHeader>
						{fieldDialogStep === 1 ? "Select Field Type" : `Add ${FIELD_TYPES.find(t => t.value === selectedFieldType)?.label} Field`}
					</DialogHeader>
					<DialogBody>
						{fieldDialogStep === 1 ? (
							<Box
								display="grid"
								gap="12"
								style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
							>
								{FIELD_TYPES.map((type) => (
									<Box
										key={type.value}
										p="16"
										border="1"
										borderColor="border.tertiary"
										rounded="md"
										display="flex"
										flexDirection="column"
										alignItems="center"
										justifyContent="center"
										gap="8"
										style={{ cursor: "pointer" }}
										className="hover:bg-bg-secondary"
										onClick={() => handleFieldTypeSelect(type.value)}
									>
										<Box color="fg.secondary">
											{type.icon}
										</Box>
										<Text fontSize="sm" fontWeight="500" textAlign="center">
											{type.label}
										</Text>
									</Box>
								))}
							</Box>
						) : (
							<Group flexDirection="column" gap="16">
								<Field label="Display Name" required>
									<Input
										value={fieldDisplayName}
										onChange={(e) => setFieldDisplayName(e.target.value)}
										placeholder="e.g., Hero Title"
										autoFocus
									/>
								</Field>

								<Field label="Field Name">
									<Input
										value={fieldName}
										onChange={(e) => {
											setFieldName(e.target.value);
											setFieldNameManuallyEdited(true);
										}}
										placeholder="e.g., hero_title"
									/>
								</Field>

								<Field label="Description" info="Optional">
									<Textarea
										value={fieldDescription}
										onChange={(e) => setFieldDescription(e.target.value)}
										placeholder="Add a description for editors..."
										rows={3}
									/>
								</Field>

								<Group gap="16" alignItems="center">
									<Switch
										checked={fieldRequired}
										onCheckedChange={setFieldRequired}
									/>
									<Text fontSize="sm">Required field</Text>
								</Group>

								<Group gap="16" alignItems="center">
									<Switch
										checked={fieldList}
										onCheckedChange={setFieldList}
									/>
									<Text fontSize="sm">Allow multiple values</Text>
								</Group>

								<Group gap="16" alignItems="center">
									<Switch
										checked={fieldLocalized}
										onCheckedChange={setFieldLocalized}
									/>
									<Text fontSize="sm">Localized (translatable)</Text>
								</Group>
							</Group>
						)}
					</DialogBody>
					<DialogFooter>
						<Group w="full" justifyContent="space-between">
							<Box>
								{fieldDialogStep === 2 && (
									<Button appearance="subtle" onClick={handleFieldBack}>
										Back
									</Button>
								)}
							</Box>
							<Group gap="8">
								<DialogClose asChild>
									<Button appearance="subtle" onClick={handleFieldDialogClose}>
										Cancel
									</Button>
								</DialogClose>
								{fieldDialogStep === 2 && (
									<Button
										appearance="primary"
										onClick={handleFieldAdd}
										disabled={!fieldDisplayName.trim()}
									>
										Add
									</Button>
								)}
							</Group>
						</Group>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
