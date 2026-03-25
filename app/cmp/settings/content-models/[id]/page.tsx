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
} from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { FieldEditorAccordion } from "@/app/components/FieldEditorAccordion";
import { useRouter, useParams } from "next/navigation";
import usePersistentState from "@/app/usePersistentState";
import {
	IconText,
	IconAlignLeft,
	IconHashtag,
	IconCheck,
	IconCalendar,
	IconCircleDot,
	IconLink,
	IconLocationDot,
	IconCode,
	IconImage,
	IconGripVertical,
} from "@/app/lib/axiom-icons";
import { ContentType, initialContentTypes } from "@/app/db/initialData";

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
	{ label: "Text Field", value: "text", icon: <IconText size={24} /> },
	{ label: "Rich Text Field", value: "richText", icon: <IconAlignLeft size={24} /> },
	{ label: "Boolean", value: "boolean", icon: <IconCheck size={24} /> },
	{ label: "Datetime", value: "datetime", icon: <IconCalendar size={24} /> },
	{ label: "Number", value: "number", icon: <IconHashtag size={24} /> },
	{ label: "Library Asset", value: "libraryAsset", icon: <IconImage size={24} /> },
	{ label: "Content Type Reference", value: "contentReference", icon: <IconLink size={24} /> },
	{ label: "Choice", value: "choice", icon: <IconCircleDot size={24} /> },
	{ label: "URL", value: "url", icon: <IconLink size={24} /> },
	{ label: "Location", value: "location", icon: <IconLocationDot size={24} /> },
	{ label: "JSON", value: "json", icon: <IconCode size={24} /> },
];

// Get icon for field type
const getFieldTypeIcon = (type: string) => {
	const fieldType = FIELD_TYPES.find((ft) => ft.value === type);
	return fieldType?.icon || <IconText size={20} />;
};

export default function ContentModelDetailPage() {
	const router = useRouter();
	const params = useParams();
	const contentModelId = params.id as string;

	const [contentTypes, setContentTypes] = usePersistentState("contentTypes", initialContentTypes) as [
		ContentType[],
		(value: ContentType[]) => void,
	];

	const contentModel = contentTypes.find((model: ContentType) => model.id === contentModelId);

	const [activeTab, setActiveTab] = useState("details");
	const [displayName, setDisplayName] = useState("");
	const [apiIdentifier, setApiIdentifier] = useState("");
	const [version, setVersion] = useState("_v1");
	const [description, setDescription] = useState("");
	const [defaultLocale, setDefaultLocale] = useState("en-US");
	const [modelType, setModelType] = useState<"component" | "content">("component");
	const [coverImage, setCoverImage] = useState("");
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const titleInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (contentModel) {
			setDisplayName(contentModel.displayName);
			setApiIdentifier(contentModel.apiIdentifier || contentModel.name);
			setVersion(contentModel.version || "_v1");
			setDescription(contentModel.description || "");
			setDefaultLocale(contentModel.defaultLocale || "en-US");
			setModelType(contentModel.modelType || "component");
			setCoverImage(contentModel.coverImage || "");
		}
	}, [contentModel]);

	const handleTitleClick = () => {
		setIsEditingTitle(true);
	};

	const handleTitleBlur = () => {
		setIsEditingTitle(false);
		handleSave();
	};

	const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			setIsEditingTitle(false);
			handleSave();
		}
	};

	// Focus input when editing starts
	useEffect(() => {
		if (isEditingTitle && titleInputRef.current) {
			titleInputRef.current.focus();
			titleInputRef.current.select();
		}
	}, [isEditingTitle]);

	const handleSave = () => {
		const updatedModels = contentTypes.map((model: ContentType) => {
			if (model.id === contentModelId) {
				return {
					...model,
					displayName,
					apiIdentifier,
					version,
					description,
					defaultLocale,
					modelType,
					coverImage,
					modifiedAt: new Date().toISOString(),
				};
			}
			return model;
		});
		setContentTypes(updatedModels);
	};

	const handleAddField = () => {
		// TODO: Implement field addition dialog
		console.log("Add field clicked");
	};

	const handleDone = () => {
		handleSave();
		router.push("/cmp/settings/content-models");
	};

	if (!contentModel) {
		return (
			<Box p="24">
				<Box
					display="flex"
					flexDirection="column"
					alignItems="center"
					justifyContent="center"
					gap="16"
					style={{ minHeight: "60vh" }}
				>
					<Text fontSize="md" color="fg.secondary">
						Content model not found
					</Text>
					<Button appearance="default" onClick={() => router.push("/cmp/settings/content-models")}>
						Back to Templates
					</Button>
				</Box>
			</Box>
		);
	}

	return (
		<Box p="24">
			<Box mb="24">
				<Breadcrumb
					mb="16"
					items={[
						{ href: "/cmp/settings/content-models", label: "Templates" },
						{ label: contentModel.displayName },
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
						fontSize="lg"
						fontWeight="500"
						mb="16"
						onClick={handleTitleClick}
						style={{ cursor: "pointer" }}
						className="hover:text-fg-secondary"
					>
						{displayName}
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
										<IconImage size={32} color="var(--ax-colors-fg-tertiary)" />
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
											onChange={(e) => setApiIdentifier(e.target.value)}
											onBlur={handleSave}
											flex="1"
										/>
										<Group alignItems="center" gap="8">
											<Text fontSize="sm" color="fg.secondary">
												Version:
											</Text>
											<Input
												value={version}
												onChange={(e) => setVersion(e.target.value)}
												onBlur={handleSave}
												style={{ width: "80px" }}
											/>
											<Button appearance="subtle" size="sm" icon={<IconLink size={16} />} aria-label="Copy link" />
										</Group>
									</Group>
								</Field>

								<Field label="Description" info="Optional">
									<Textarea
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										onBlur={handleSave}
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
											execute: () => {
												setDefaultLocale(opt.value);
												handleSave();
											},
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
											handleSave();
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

							{contentModel.properties && contentModel.properties.length > 0 ? (
								<Group flexDirection="column" gap="8">
									{contentModel.properties.map((property: any, index: number) => (
										<FieldEditorAccordion
											key={property.id}
											icon={
												<>
													<Box color="fg.tertiary" style={{ cursor: "grab" }}>
														<IconGripVertical size={20} />
													</Box>
													<Box color="fg.secondary">{getFieldTypeIcon(property.type)}</Box>
												</>
											}
											title={property.displayName || property.name}
										>
											<Group flexDirection="column" gap="16">
															<Field label="Display Name">
																<Input
																	value={property.displayName || ""}
																	onChange={(e) => {
																		const updatedModels = contentTypes.map((model: ContentType) => {
																			if (model.id === contentModelId) {
																				const updatedProperties = [...model.properties];
																				updatedProperties[index] = {
																					...updatedProperties[index],
																					displayName: e.target.value,
																				};
																				return {
																					...model,
																					properties: updatedProperties,
																					modifiedAt: new Date().toISOString(),
																				};
																			}
																			return model;
																		});
																		setContentTypes(updatedModels);
																	}}
																/>
															</Field>
															<Field label="Field Name">
																<Input
																	value={property.name || ""}
																	onChange={(e) => {
																		const updatedModels = contentTypes.map((model: ContentType) => {
																			if (model.id === contentModelId) {
																				const updatedProperties = [...model.properties];
																				updatedProperties[index] = {
																					...updatedProperties[index],
																					name: e.target.value,
																				};
																				return {
																					...model,
																					properties: updatedProperties,
																					modifiedAt: new Date().toISOString(),
																				};
																			}
																			return model;
																		});
																		setContentTypes(updatedModels);
																	}}
																/>
															</Field>
															<Field label="Description" info="Optional">
																<Textarea
																	value={property.description || ""}
																	onChange={(e) => {
																		const updatedModels = contentTypes.map((model: ContentType) => {
																			if (model.id === contentModelId) {
																				const updatedProperties = [...model.properties];
																				updatedProperties[index] = {
																					...updatedProperties[index],
																					description: e.target.value,
																				};
																				return {
																					...model,
																					properties: updatedProperties,
																					modifiedAt: new Date().toISOString(),
																				};
																			}
																			return model;
																		});
																		setContentTypes(updatedModels);
																	}}
																	rows={3}
																/>
															</Field>
															<Group gap="16" alignItems="center">
																<Switch
																	checked={property.required || false}
																	onCheckedChange={(checked) => {
																		const updatedModels = contentTypes.map((model: ContentType) => {
																			if (model.id === contentModelId) {
																				const updatedProperties = [...model.properties];
																				updatedProperties[index] = {
																					...updatedProperties[index],
																					required: checked,
																				};
																				return {
																					...model,
																					properties: updatedProperties,
																					modifiedAt: new Date().toISOString(),
																				};
																			}
																			return model;
																		});
																		setContentTypes(updatedModels);
																	}}
																/>
																<Text fontSize="sm">Required</Text>
															</Group>
															<Group gap="16" alignItems="center">
																<Switch
																	checked={(property as any).list || false}
																	onCheckedChange={(checked) => {
																		const updatedModels = contentTypes.map((model: ContentType) => {
																			if (model.id === contentModelId) {
																				const updatedProperties = [...model.properties];
																				updatedProperties[index] = {
																					...updatedProperties[index],
																					list: checked,
																				} as any;
																				return {
																					...model,
																					properties: updatedProperties,
																					modifiedAt: new Date().toISOString(),
																				};
																			}
																			return model;
																		});
																		setContentTypes(updatedModels);
																	}}
																/>
																<Text fontSize="sm">Allow multiple values</Text>
															</Group>
															<Group gap="16" alignItems="center">
																<Switch
																	checked={property.cultureSpecific || false}
																	onCheckedChange={(checked) => {
																		const updatedModels = contentTypes.map((model: ContentType) => {
																			if (model.id === contentModelId) {
																				const updatedProperties = [...model.properties];
																				updatedProperties[index] = {
																					...updatedProperties[index],
																					cultureSpecific: checked,
																				};
																				return {
																					...model,
																					properties: updatedProperties,
																					modifiedAt: new Date().toISOString(),
																				};
																			}
																			return model;
																		});
																		setContentTypes(updatedModels);
																	}}
																/>
																<Text fontSize="sm">Localized</Text>
															</Group>
											</Group>
										</FieldEditorAccordion>
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
		</Box>
	);
}
