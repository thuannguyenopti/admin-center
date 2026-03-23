"use client";

import { useState, useMemo, useEffect } from "react";
import {
	Box,
	Heading,
	SearchInput,
	Menu,
	MenuTrigger,
	MenuContent,
	LabelMenuButton,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogBody,
	DialogFooter,
	DialogClose,
	Field,
	Input,
	Textarea,
	Flex,
	Badge,
	Link,
} from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { contentModelTemplates } from "@/app/db/contentModelTemplates";
import { ContentType } from "@/app/db/initialData";
import { useRouter, useSearchParams } from "next/navigation";
import usePersistentState from "@/app/usePersistentState";
import {
	IconFile,
	IconLayoutGrid,
	IconPhoto,
	IconBox,
	IconColumns,
	IconChevronDown,
} from "@tabler/icons-react";

type CmpContentModel = {
	id: string;
	name: string;
	displayName: string;
	baseType: ContentType["baseType"];
	description?: string;
	properties: any[];
	modifiedAt: string;
	modifiedBy: string;
};

type BaseType = ContentType["baseType"];

const BASE_TYPE_OPTIONS: { label: string; value: BaseType; icon: React.ReactNode }[] = [
	{ label: "Page Type", value: "Page", icon: <IconFile size={20} /> },
	{ label: "Block Type", value: "Block", icon: <IconLayoutGrid size={20} /> },
	{ label: "Media Type", value: "Media", icon: <IconPhoto size={20} /> },
	{ label: "Experience Type", value: "Experience", icon: <IconColumns size={20} /> },
	{ label: "Product Type", value: "Product", icon: <IconBox size={20} /> },
];

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

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			gap="16"
			py="40"
		>
			<Text fontSize="md" color="fg.secondary" mb="8">
				No content models yet
			</Text>
			<Button appearance="primary" onClick={onCreateClick}>
				Create Your First Content Model
			</Button>
		</Box>
	);
}

export default function ContentModelsPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const templateId = searchParams.get("template");
	const isNew = searchParams.get("new");

	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState<string | null>(null);

	// Dialog state
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogDisplayName, setDialogDisplayName] = useState("");
	const [dialogName, setDialogName] = useState("");
	const [dialogDescription, setDialogDescription] = useState("");
	const [dialogBaseType, setDialogBaseType] = useState<BaseType>("Page");
	const [nameManuallyEdited, setNameManuallyEdited] = useState(false);
	const [showNameField, setShowNameField] = useState(false);

	// Persistent content models
	const [cmpContentModels, setCmpContentModels] = usePersistentState("cmpContentModels", []) as [
		CmpContentModel[],
		(value: CmpContentModel[]) => void,
	];

	// Handle template selection from URL
	useEffect(() => {
		if (templateId || isNew) {
			const template = templateId ? contentModelTemplates.find((t) => t.id === templateId) : null;

			if (template) {
				setDialogDisplayName(template.name);
				setDialogName(toSystemName(template.name));
				setDialogDescription(template.description);
				setDialogBaseType(template.baseType);
			} else {
				setDialogDisplayName("");
				setDialogName("");
				setDialogDescription("");
				setDialogBaseType("Page");
			}

			setNameManuallyEdited(false);
			setShowNameField(false);
			setDialogOpen(true);
		}
	}, [templateId, isNew]);

	// Auto-generate name from display name
	useEffect(() => {
		if (!nameManuallyEdited && dialogDisplayName) {
			setDialogName(toSystemName(dialogDisplayName));
		}
	}, [dialogDisplayName, nameManuallyEdited]);

	const filteredContentModels = useMemo(() => {
		return cmpContentModels.filter((model: CmpContentModel) => {
			const searchLower = search.toLowerCase();
			const matchesSearch =
				!search ||
				model.displayName.toLowerCase().includes(searchLower) ||
				model.name.toLowerCase().includes(searchLower);

			const matchesType = !typeFilter || model.baseType === typeFilter;

			return matchesSearch && matchesType;
		});
	}, [cmpContentModels, search, typeFilter]);

	const handleCreate = () => {
		const template = templateId ? contentModelTemplates.find((t) => t.id === templateId) : null;

		const newContentModel: CmpContentModel = {
			id: generateContentModelId(),
			name: dialogName,
			displayName: dialogDisplayName,
			baseType: dialogBaseType,
			description: dialogDescription,
			properties: template?.properties || [],
			modifiedAt: new Date().toISOString(),
			modifiedBy: "Current User",
		};

		setCmpContentModels([...cmpContentModels, newContentModel]);

		// Close dialog and navigate to properties page
		setDialogOpen(false);
		router.push(`/cmp/settings/content-models/${newContentModel.id}/properties`);
	};

	const handleDialogClose = () => {
		setDialogOpen(false);
		// Remove URL params
		router.push("/cmp/settings/content-models");
	};

	const handleCreateClick = () => {
		router.push("/cmp/settings/content-models/templates");
	};

	const selectedTemplate = templateId ? contentModelTemplates.find((t) => t.id === templateId) : null;

	const typeFilterOptions = [
		{ label: "All Types", value: null },
		...BASE_TYPE_OPTIONS.map((opt) => ({ label: opt.label, value: opt.value })),
	];

	const currentTypeLabel =
		typeFilterOptions.find((opt) => opt.value === typeFilter)?.label || "All Types";

	return (
		<Box p="24">
			<Box display="flex" alignItems="center" gap="8" mb="16">
				<SearchInput
					size="lg"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search content models..."
				/>

				<Menu
					options={typeFilterOptions.map((opt) => ({
						label: opt.label,
						execute: () => setTypeFilter(opt.value),
						...(typeFilter === opt.value && { selected: true }),
					}))}
				>
					<MenuTrigger asChild>
						<LabelMenuButton label="Type">{currentTypeLabel}</LabelMenuButton>
					</MenuTrigger>
					<MenuContent />
				</Menu>

				<Box flex="1" />

				<Button appearance="primary" onClick={handleCreateClick}>
					Create Content Model
				</Button>
			</Box>

			{filteredContentModels.length === 0 && !search && !typeFilter ? (
				<EmptyState onCreateClick={handleCreateClick} />
			) : (
				<>
					<Table>
						<thead>
							<tr>
								<Th>Display Name</Th>
								<Th>Base Type</Th>
								<Th>Modified</Th>
								<Th>Modified By</Th>
							</tr>
						</thead>
						<tbody>
							{filteredContentModels.map((model: CmpContentModel) => (
								<Tr
									key={model.id}
									url={`/cmp/settings/content-models/${model.id}/properties`}
								>
									<Td type="header">{model.displayName}</Td>
									<Td>
										<Badge intent="neutral">{model.baseType}</Badge>
									</Td>
									<Td>{new Date(model.modifiedAt).toLocaleDateString()}</Td>
									<Td>{model.modifiedBy}</Td>
								</Tr>
							))}
						</tbody>
					</Table>

					{filteredContentModels.length === 0 && (search || typeFilter) && (
						<Box py="40" textAlign="center">
							<Text fontSize="md" color="fg.secondary">
								No content models match your filters
							</Text>
						</Box>
					)}
				</>
			)}

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent size="md">
					<DialogHeader>
						{selectedTemplate ? `Create from ${selectedTemplate.name}` : "Create Content Model"}
					</DialogHeader>
					<DialogBody>
						<Flex flexDirection="column" gap="16">
							<Field label="Display Name" required>
								<Input
									value={dialogDisplayName}
									onChange={(e) => setDialogDisplayName(e.target.value)}
									placeholder="e.g., Landing Page"
								/>
							</Field>

							{showNameField && (
								<Field label="Name">
									<Input
										value={dialogName}
										onChange={(e) => {
											setDialogName(e.target.value);
											setNameManuallyEdited(true);
										}}
										placeholder="e.g., landing_page"
									/>
								</Field>
							)}

							{!showNameField && (
								<Box>
									<Link
										onClick={() => setShowNameField(true)}
										style={{ cursor: "pointer", fontSize: "14px" }}
									>
										Show technical name
									</Link>
								</Box>
							)}

							<Field label="Description">
								<Textarea
									value={dialogDescription}
									onChange={(e) => setDialogDescription(e.target.value)}
									placeholder="Describe this content model..."
									rows={3}
								/>
							</Field>

							<Field label="Base Type">
								<Box
									p="12"
									rounded="md"
									border="1"
									borderColor="border.tertiary"
									bg="bg.secondary"
								>
									<Flex alignItems="center" gap="8">
										{BASE_TYPE_OPTIONS.find((opt) => opt.value === dialogBaseType)?.icon}
										<Text fontSize="sm" fontWeight="500">
											{BASE_TYPE_OPTIONS.find((opt) => opt.value === dialogBaseType)?.label}
										</Text>
									</Flex>
								</Box>
							</Field>

							{selectedTemplate && (
								<Box>
									<Text fontSize="sm" fontWeight="500" mb="8">
										Template Properties ({selectedTemplate.properties.length})
									</Text>
									<Box
										p="12"
										rounded="md"
										border="1"
										borderColor="border.tertiary"
										bg="bg.secondary"
									>
										<Flex flexDirection="column" gap="4">
											{selectedTemplate.properties.slice(0, 5).map((prop) => (
												<Text key={prop.id} fontSize="sm" color="fg.secondary">
													{prop.displayName || prop.name} ({prop.type})
												</Text>
											))}
											{selectedTemplate.properties.length > 5 && (
												<Text fontSize="sm" color="fg.tertiary">
													+{selectedTemplate.properties.length - 5} more...
												</Text>
											)}
										</Flex>
									</Box>
								</Box>
							)}
						</Flex>
					</DialogBody>
					<DialogFooter>
						<Flex w="full" justifyContent="space-between" alignItems="center">
							<Text fontSize="sm" color="fg.error">
								* Required Field
							</Text>
							<Flex gap="8">
								<DialogClose asChild>
									<Button appearance="subtle" onClick={handleDialogClose}>
										Cancel
									</Button>
								</DialogClose>
								<Button
									appearance="primary"
									onClick={handleCreate}
									disabled={!dialogDisplayName.trim()}
								>
									Create Content Model
								</Button>
							</Flex>
						</Flex>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
