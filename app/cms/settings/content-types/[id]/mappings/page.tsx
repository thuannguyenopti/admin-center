"use client";

import React, { use, useState, useCallback, useMemo } from "react";
import { Box, toaster, Select, SelectTrigger, SelectContent, Field, Input, Textarea, Heading, Separator } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import {
	initialContentTypes,
	ContentType,
	ContentTypeMapping,
	PropertyMapping,
} from "@/app/db/initialData";
import { useParams, useRouter } from "next/navigation";
import usePersistentState from "@/app/usePersistentState";
import { Footer } from "@/app/context/LayoutContext";
import AbstractDialog from "@/app/components/AbstractDialog";
import { generateSuggestedMapping, areTypesCompatible, findIncomingMappings } from "@/app/lib/contentTypeMapping";
import { IconPlus } from "@tabler/icons-react";

// Helper to get display name with fallback to name
const getDisplayName = (item: { displayName?: string; name: string }): string => {
	return item.displayName || item.name;
};

// Helper to expand target properties - shows nested properties for Block-type ContentReferences
const expandTargetProperties = (properties: any[], contentTypes: ContentType[]) => {
	const expanded: any[] = [];

	properties.forEach(prop => {
		// Check if this is a ContentReference with allowedTypes pointing to Block types
		if (prop.type === "ContentReference" && prop.allowedTypes && prop.allowedTypes.length > 0) {
			// Check if ALL allowed types are Block types
			const allBlockTypes = prop.allowedTypes.every((allowedTypeId: string) => {
				const referencedType = contentTypes.find(ct => ct.id === allowedTypeId);
				return referencedType?.baseType === "Block";
			});

			if (allBlockTypes) {
				// Expand to show nested properties from the first allowed block type
				const blockTypeId = prop.allowedTypes[0];
				const blockType = contentTypes.find(ct => ct.id === blockTypeId);

				if (blockType?.properties) {
					blockType.properties.forEach(nestedProp => {
						expanded.push({
							...nestedProp,
							id: `${prop.id}.${nestedProp.id}`,  // Nested ID like "author.name"
							displayName: `${getDisplayName(prop)} / ${getDisplayName(nestedProp)}`,
							name: `${prop.name} / ${nestedProp.name}`,
							_parentProperty: prop.id,  // Track parent for reference
							_isNested: true
						});
					});
				}
			} else {
				// Not a block type, show as-is
				expanded.push(prop);
			}
		} else {
			// Not a ContentReference or no allowedTypes, show as-is
			expanded.push(prop);
		}
	});

	return expanded;
};

// Memoized component for each property mapping row
const PropertyMappingRow = React.memo(({
	targetProp,
	sourceProperties,
	contentTypes,
	existingMapping,
	onMappingChange,
}: {
	targetProp: any;
	sourceProperties: any[];
	contentTypes: ContentType[];
	existingMapping?: PropertyMapping;
	onMappingChange: (targetPropertyId: string, sourcePropertyId: string | null) => void;
}) => {
	const sourcePropertyId = existingMapping?.sourcePropertyId || "";

	// Create source options with "No mapping" option and nested properties
	const sourceOptions = useMemo(() => {
		const options: Array<{ label: string; value: string }> = [
			{ label: "No mapping", value: "" }
		];

		sourceProperties.forEach(p => {
			// Add the main property
			options.push({
				label: `${getDisplayName(p)} (${p.type})`,
				value: p.id,
			});

			// If property has allowedTypes (references/blocks), add nested properties
			if (p.allowedTypes && p.allowedTypes.length > 0) {
				// For each allowed content type, add its properties as nested options
				p.allowedTypes.forEach((allowedTypeId: string) => {
					const referencedType = contentTypes.find(ct => ct.id === allowedTypeId);
					if (referencedType?.properties) {
						referencedType.properties.forEach(nestedProp => {
							options.push({
								label: `${getDisplayName(p)} / ${getDisplayName(nestedProp)} (${nestedProp.type})`,
								value: `${p.id}.${nestedProp.id}`,
							});
						});
					}
				});
			}
		});

		return options;
	}, [sourceProperties, contentTypes]);

	// Validate that the value exists in options
	const validatedSourcePropertyId = useMemo(() => {
		return sourceOptions.some(opt => opt.value === sourcePropertyId)
			? sourcePropertyId
			: "";
	}, [sourcePropertyId, sourceOptions]);

	return (
		<Box display="flex" gap="8" alignItems="center" p="12" bg="bg.secondary" rounded="md">
			<Box flex="1">
				<Select
					value={validatedSourcePropertyId}
					options={sourceOptions}
					onValueChange={(value: string) => {
						onMappingChange(targetProp.id, value === "" ? null : value);
					}}
				>
					<SelectTrigger placeholder="Select property" w="full" />
					<SelectContent />
				</Select>
			</Box>
			<Text color="fg.secondary">→</Text>
			<Box flex="1">
				<Input
					value={`${getDisplayName(targetProp)} (${targetProp.type})`}
					disabled
				/>
			</Box>
		</Box>
	);
});

PropertyMappingRow.displayName = 'PropertyMappingRow';

// Incoming Mappings Section - shows which content types map TO this type
const IncomingMappingsSection = React.memo(({
	contentTypeId,
	contentTypes,
}: {
	contentTypeId: string;
	contentTypes: ContentType[];
}) => {
	const router = useRouter();

	const incomingMappings = useMemo(
		() => findIncomingMappings(contentTypeId, contentTypes),
		[contentTypeId, contentTypes]
	);

	if (incomingMappings.length === 0) {
		return (
			<Box p="32" textAlign="center" bg="bg.secondary" rounded="md">
				<Text color="fg.secondary">
					No content types currently map to this type.
				</Text>
			</Box>
		);
	}

	return (
		<Table>
			<thead>
				<Tr>
					<Th>Source Content Type</Th>
					<Th>Properties Mapped</Th>
					<Th style={{ width: "120px" }}>Actions</Th>
				</Tr>
			</thead>
			<tbody>
				{incomingMappings.map(({ mapping, sourceType }) => (
					<Tr key={`${sourceType.id}-${mapping.id}`}>
						<Td type="header">
							{sourceType.displayName || sourceType.name}
						</Td>
						<Td>
							{mapping.propertyMappings.length} mapped
						</Td>
						<Td>
							<Button
								appearance="subtle"
								size="sm"
								onClick={() => {
									router.push(
										`/cms/settings/content-types/${sourceType.id}/mappings`
									);
								}}
							>
								View Source
							</Button>
						</Td>
					</Tr>
				))}
			</tbody>
		</Table>
	);
});

IncomingMappingsSection.displayName = 'IncomingMappingsSection';

export default function MappingsPage() {
	const params = useParams();
	const resolvedParams = params instanceof Promise ? use(params) : params;
	const id = (resolvedParams?.id ?? "") as string;

	// Persistent content types
	const [savedContentTypes, setContentTypes] = usePersistentState(
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

	const contentType = contentTypes?.find((ct) => ct.id === id);

	// Dialog states
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [editingMapping, setEditingMapping] = useState<ContentTypeMapping | null>(null);
	const [deletingMapping, setDeletingMapping] = useState<ContentTypeMapping | null>(null);

	// Form state for mapping
	const [formName, setFormName] = useState("");
	const [formDisplayName, setFormDisplayName] = useState("");
	const [formDescription, setFormDescription] = useState("");
	const [formTargetTypeId, setFormTargetTypeId] = useState("");
	const [formPropertyMappings, setFormPropertyMappings] = useState<PropertyMapping[]>([]);

	// Get eligible target content types (exclude self)
	const eligibleTargetTypes = useMemo(() => {
		return contentTypes.filter(ct => ct.id !== id);
	}, [contentTypes, id]);

	const resetForm = useCallback(() => {
		setFormName("");
		setFormDisplayName("");
		setFormDescription("");
		setFormTargetTypeId("");
		setFormPropertyMappings([]);
	}, []);

	const openCreateDialog = useCallback(() => {
		resetForm();
		setIsCreateDialogOpen(true);
	}, [resetForm]);

	const openEditDialog = useCallback((mapping: ContentTypeMapping) => {
		setEditingMapping(mapping);
		setFormName(mapping.name);
		setFormDisplayName(mapping.displayName || "");
		setFormDescription(mapping.description || "");
		setFormTargetTypeId(mapping.targetContentTypeId);
		setFormPropertyMappings(mapping.propertyMappings);
		setIsEditDialogOpen(true);
	}, []);

	const openDeleteDialog = useCallback((mapping: ContentTypeMapping) => {
		setDeletingMapping(mapping);
		setIsDeleteDialogOpen(true);
	}, []);

	const handleCreate = useCallback(() => {
		if (!contentType || !formTargetTypeId) return;

		const targetType = contentTypes.find(ct => ct.id === formTargetTypeId);
		if (!targetType) return;

		// Auto-generate name, display name, and description
		const autoName = `to_${targetType.name.toLowerCase()}`;
		const autoDisplayName = `To ${getDisplayName(targetType)}`;
		const autoDescription = `Map ${getDisplayName(contentType)} fields to ${getDisplayName(targetType)}`;

		const newMapping: ContentTypeMapping = {
			id: `mapping-${Date.now()}`,
			name: autoName,
			displayName: autoDisplayName,
			description: autoDescription,
			sourceContentTypeId: contentType.id,
			targetContentTypeId: formTargetTypeId,
			propertyMappings: formPropertyMappings,
			createdAt: new Date().toISOString(),
		};

		const updatedContentTypes = contentTypes.map((ct) => {
			if (ct.id === id) {
				return {
					...ct,
					mappings: [...(ct.mappings || []), newMapping],
					modifiedAt: new Date().toISOString(),
				};
			}
			return ct;
		});

		setContentTypes(updatedContentTypes);
		setIsCreateDialogOpen(false);
		resetForm();
		toaster.create("Mapping created successfully", { intent: "success" });
	}, [contentType, contentTypes, id, formTargetTypeId, formPropertyMappings, setContentTypes, resetForm]);

	const handleEdit = useCallback(() => {
		if (!editingMapping || !contentType || !formName.trim() || !formTargetTypeId) return;

		const updatedContentTypes = contentTypes.map((ct) => {
			if (ct.id === id) {
				return {
					...ct,
					mappings: (ct.mappings || []).map((mapping) =>
						mapping.id === editingMapping.id
							? {
									...mapping,
									name: formName,
									displayName: formDisplayName || formName,
									description: formDescription,
									targetContentTypeId: formTargetTypeId,
									propertyMappings: formPropertyMappings,
									modifiedAt: new Date().toISOString(),
								}
							: mapping
					),
					modifiedAt: new Date().toISOString(),
				};
			}
			return ct;
		});

		setContentTypes(updatedContentTypes);
		setIsEditDialogOpen(false);
		setEditingMapping(null);
		resetForm();
		toaster.create("Mapping updated successfully", { intent: "success" });
	}, [editingMapping, contentType, contentTypes, id, formName, formDisplayName, formDescription, formTargetTypeId, formPropertyMappings, setContentTypes, resetForm]);

	const handleDelete = useCallback(() => {
		if (!deletingMapping || !contentType) return;

		const updatedContentTypes = contentTypes.map((ct) => {
			if (ct.id === id) {
				return {
					...ct,
					mappings: (ct.mappings || []).filter((mapping) => mapping.id !== deletingMapping.id),
					modifiedAt: new Date().toISOString(),
				};
			}
			return ct;
		});

		setContentTypes(updatedContentTypes);
		setIsDeleteDialogOpen(false);
		setDeletingMapping(null);
		toaster.create("Mapping deleted successfully", { intent: "success" });
	}, [deletingMapping, contentType, contentTypes, id, setContentTypes]);

	const handleGenerateSuggestions = useCallback(() => {
		if (!contentType || !formTargetTypeId) return;

		const targetType = contentTypes.find(ct => ct.id === formTargetTypeId);
		if (!targetType) return;

		const suggestions = generateSuggestedMapping(contentType, targetType);
		setFormPropertyMappings(suggestions);
		toaster.create(`Generated ${suggestions.length} suggested mappings`, { intent: "success" });
	}, [contentType, contentTypes, formTargetTypeId]);

	const handlePropertyMappingChange = useCallback((targetPropertyId: string, sourcePropertyId: string | null) => {
		if (sourcePropertyId === null) {
			// Remove mapping if "No mapping" selected
			setFormPropertyMappings(prev =>
				prev.filter(m => m.targetPropertyId !== targetPropertyId)
			);
		} else {
			// Add or update mapping
			setFormPropertyMappings(prev => {
				const existing = prev.find(m => m.targetPropertyId === targetPropertyId);
				if (existing) {
					// Update existing
					return prev.map(m =>
						m.targetPropertyId === targetPropertyId
							? { ...m, sourcePropertyId }
							: m
					);
				} else {
					// Add new
					return [...prev, {
						id: `prop-mapping-${Date.now()}-${targetPropertyId}`,
						sourcePropertyId,
						targetPropertyId,
						transformation: "direct" as const,
					}];
				}
			});
		}
	}, []);

	if (!contentType) {
		return (
			<Box flex="1">
				<Text color="fg.error">Content type not found</Text>
			</Box>
		);
	}

	const mappings = contentType.mappings || [];
	const targetType = contentTypes.find(ct => ct.id === formTargetTypeId);

	// Create options array for target type select
	const targetTypeOptions = useMemo(() => [
		{ label: "Select target type", value: "" },
		...eligibleTargetTypes.map(ct => ({
			label: getDisplayName(ct),
			value: ct.id,
		}))
	], [eligibleTargetTypes]);

	// Ensure value is always valid
	const validatedTargetTypeId = useMemo(() => {
		return targetTypeOptions.some(opt => opt.value === formTargetTypeId)
			? formTargetTypeId
			: "";
	}, [formTargetTypeId, targetTypeOptions]);

	return (
		<>
			<Box style={{ maxWidth: "900px" }}>
				{/* Page Description */}
				<Text color="fg.secondary" mb="24">
					Define how this content type's properties map to other content types for transformations, imports, and migrations.
				</Text>

				{/* OUTGOING MAPPINGS SECTION */}
				<Box mb="48">
					<Box display="flex" justifyContent="space-between" alignItems="center" mb="16">
						<Heading level="4">Outgoing Mappings</Heading>
						<Button
							appearance="primary"
							icon={<IconPlus size={16} />}
							onClick={openCreateDialog}
						>
							Create Mapping
						</Button>
					</Box>

					<Text color="fg.secondary" fontSize="sm" mb="16">
						Mappings that transform this content type's data to other types.
					</Text>

					{mappings.length === 0 ? (
						<Box p="32" textAlign="center" bg="bg.secondary" rounded="md">
							<Text color="fg.secondary">
								No outgoing mappings defined yet. Create your first mapping to get started.
							</Text>
						</Box>
					) : (
						<Table>
							<thead>
								<Tr>
									<Th>Name</Th>
									<Th>Target Type</Th>
									<Th>Properties Mapped</Th>
									<Th style={{ width: "120px" }}>Actions</Th>
								</Tr>
							</thead>
							<tbody>
								{mappings.map((mapping) => {
									const targetType = contentTypes.find(ct => ct.id === mapping.targetContentTypeId);
									return (
										<Tr key={mapping.id}>
											<Td type="header">{mapping.displayName || mapping.name}</Td>
											<Td>{targetType ? getDisplayName(targetType) : "Unknown"}</Td>
											<Td>{mapping.propertyMappings.length} mapped</Td>
											<Td>
												<Box display="flex" gap="8">
													<Button
														appearance="subtle"
														size="sm"
														onClick={() => openEditDialog(mapping)}
													>
														Edit
													</Button>
													<Button
														appearance="subtle"
														size="sm"
														onClick={() => openDeleteDialog(mapping)}
													>
														Delete
													</Button>
												</Box>
											</Td>
										</Tr>
									);
								})}
							</tbody>
						</Table>
					)}
				</Box>

				{/* SEPARATOR */}
				<Separator mb="48" />

				{/* INCOMING MAPPINGS SECTION */}
				<Box>
					<Heading level="4" mb="16">Incoming Mappings</Heading>

					<Text color="fg.secondary" fontSize="sm" mb="16">
						Content types that can be transformed into this type.
					</Text>

					<IncomingMappingsSection
						contentTypeId={id}
						contentTypes={contentTypes}
					/>
				</Box>
			</Box>

			{/* Create/Edit Dialog */}
			<AbstractDialog
				title={editingMapping ? "Edit Mapping" : "Create Mapping"}
				description={editingMapping ? "Edit property mapping settings." : "Select target content type to create field mappings."}
				open={isCreateDialogOpen || isEditDialogOpen}
				setOpen={isCreateDialogOpen ? setIsCreateDialogOpen : setIsEditDialogOpen}
				footerPrimaryText={editingMapping ? "Save" : "Create"}
				footerPrimaryAction={editingMapping ? handleEdit : handleCreate}
				footerAppearance="primary"
				blockPrimaryAction={editingMapping ? (!formName.trim() || !formTargetTypeId) : !formTargetTypeId}
				size="lg"
			>
				<Box display="flex" flexDirection="column" gap="16" pt="16">
					{editingMapping && (
						<>
							<Field label="Name" required>
								<Input
									placeholder="To Article"
									value={formName}
									onChange={(e: any) => setFormName(e.target.value)}
									autoFocus
								/>
							</Field>

							<Field label="Display Name">
								<Input
									placeholder="Migrate to Article"
									value={formDisplayName}
									onChange={(e: any) => setFormDisplayName(e.target.value)}
								/>
							</Field>

							<Field label="Description">
								<Textarea
									placeholder="Convert blog posts to new article format"
									value={formDescription}
									onChange={(e: any) => setFormDescription(e.target.value)}
									rows={2}
								/>
							</Field>
						</>
					)}

					<Field label="Target Content Type" required>
						<Select
							value={validatedTargetTypeId}
							options={targetTypeOptions}
							onValueChange={(value: string) => {
								setFormTargetTypeId(value);

								// Auto-generate suggested mappings when a target type is selected
								if (value && contentType) {
									const targetType = contentTypes.find(ct => ct.id === value);
									if (targetType) {
										const suggestions = generateSuggestedMapping(contentType, targetType);
										setFormPropertyMappings(suggestions);
									} else {
										setFormPropertyMappings([]);
									}
								} else {
									setFormPropertyMappings([]);
								}
							}}
						>
							<SelectTrigger w="full" />
							<SelectContent />
						</Select>
					</Field>

					{formTargetTypeId && targetType && (
						<>
							<Box display="flex" justifyContent="space-between" alignItems="center" mt="16">
								<Text fontSize="md" fontWeight="600">Property Mappings</Text>
								<Button
									appearance="subtle"
									size="sm"
									onClick={handleGenerateSuggestions}
								>
									Generate Suggestions
								</Button>
							</Box>

							{targetType.properties.length === 0 ? (
								<Box p="16" textAlign="center" bg="bg.secondary" rounded="md">
									<Text color="fg.secondary" fontSize="sm">
										Target content type has no properties.
									</Text>
								</Box>
							) : (
								<Box display="flex" flexDirection="column" gap="8">
									{/* Column Headers */}
									<Box display="flex" gap="8" alignItems="center" px="12">
										<Box flex="1">
											<Text fontSize="sm" fontWeight="600" color="fg.secondary">Source Property</Text>
										</Box>
										<Box w="24"></Box>
										<Box flex="1">
											<Text fontSize="sm" fontWeight="600" color="fg.secondary">Target Property</Text>
										</Box>
									</Box>

									{/* Property Rows */}
									{expandTargetProperties(targetType.properties, contentTypes).map((targetProp) => {
										const existingMapping = formPropertyMappings.find(m => m.targetPropertyId === targetProp.id);
										return (
											<PropertyMappingRow
												key={targetProp.id}
												targetProp={targetProp}
												sourceProperties={contentType.properties}
												contentTypes={contentTypes}
												existingMapping={existingMapping}
												onMappingChange={handlePropertyMappingChange}
											/>
										);
									})}
								</Box>
							)}
						</>
					)}
				</Box>
			</AbstractDialog>

			{/* Delete Dialog */}
			<AbstractDialog
				isAlert
				title="Delete Mapping"
				description="Are you sure you want to delete this mapping?"
				open={isDeleteDialogOpen}
				setOpen={setIsDeleteDialogOpen}
				footerPrimaryText="Delete"
				footerPrimaryAction={handleDelete}
				footerSecondaryText="Cancel"
				size="sm"
			>
				<Text>
					You are about to delete "{deletingMapping?.displayName || deletingMapping?.name}". This action cannot be
					undone.
				</Text>
			</AbstractDialog>
		</>
	);
}
