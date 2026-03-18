"use client";

import {useState, useMemo} from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import {
	Dialog,
	DialogBody,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
	Field,
	Input,
	Select,
	SelectTrigger,
	SelectContent,
	Box,
	Card,
	CardPreview,
	CardHeader,
	Text,
	Heading,
	SearchInput,
	Group,
	Separator,
	ToggleButton,
	Table,
	TableBody,
	TableHeader,
	TableHeaderCell,
	TableRow,
	TableCell,
	Checkbox,
	Textarea,
} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {
	IconFile,
	IconChevronRight,
	IconChevronDown,
	IconLayoutGrid,
} from "@tabler/icons-react";
import {IconList} from "@optimizely/axiom-icons";
import Item from "@/app/components/Item";
import {Page, ContentType, initialContentTypes} from "@/app/db/initialData";
import {useOpalGeneration} from "@/app/context/OpalGenerationContext";
import usePersistentState from "@/app/usePersistentState";
import {opalActions as initialOpalActions, OpalAction} from "@/app/cms/settings/opal-actions/mockData";

type PageNode = Page & {children: PageNode[]};

interface CreatePageDialogProps {
	children: React.ReactNode;
	pages: Page[];
	preselectedLocation?: string;
	onCreatePage?: (page: Page) => void;
}

const LocationTreeNode = ({
	node,
	level = 0,
	selectedLocation,
	onSelectLocation,
}: {
	node: PageNode;
	level?: number;
	selectedLocation: string | null;
	onSelectLocation: (id: string) => void;
}) => {
	const [expanded, setExpanded] = useState(true);
	const hasChildren = node.children.length > 0;
	const isSelected = selectedLocation === node.id;

	return (
		<Box>
			<Box
				onClick={() => onSelectLocation(node.id)}
				cursor="pointer"
				p="8"
				rounded="sm"
				bg={isSelected ? "bg.accent.subtle" : undefined}
				style={{
					paddingLeft: level * 24 + 8,
				}}
			>
				<Group gap="8" alignItems="center">
					{hasChildren ? (
						<Box
							onClick={(e) => {
								e.stopPropagation();
								setExpanded(!expanded);
							}}
							cursor="pointer"
						>
							{expanded ? (
								<IconChevronDown size={16} />
							) : (
								<IconChevronRight size={16} />
							)}
						</Box>
					) : (
						<Box w="16" />
					)}
					<Item icon={<IconFile size={16} />} title={node.name} />
				</Group>
			</Box>
			{expanded &&
				node.children.map((child) => (
					<LocationTreeNode
						key={child.id}
						node={child}
						level={level + 1}
						selectedLocation={selectedLocation}
						onSelectLocation={onSelectLocation}
					/>
				))}
		</Box>
	);
};

const TemplateCard = ({
	name,
	category,
	onSelect,
	viewMode = "grid",
	isSelected = false,
}: {
	name: string;
	category: string;
	onSelect: () => void;
	viewMode?: "grid" | "list";
	isSelected?: boolean;
}) => {
	if (viewMode === "list") {
		return (
			<Box onClick={onSelect} cursor="pointer">
				<Card>
					<Group gap="12" p="12" alignItems="center">
						<Box
							bg="bg.secondary"
							rounded="sm"
							style={{width: "48px", height: "48px", flexShrink: 0}}
							display="flex"
							alignItems="center"
							justifyContent="center"
						>
							<Text fontSize="xs" color="fg.tertiary">
								Preview
							</Text>
						</Box>
						<Group flexDirection="column" gap="4" style={{flex: 1}}>
							<Text fontSize="md" fontWeight="600">
								{name}
							</Text>
							<Text fontSize="sm" color="fg.secondary">
								{category}
							</Text>
						</Group>
					</Group>
				</Card>
			</Box>
		);
	}

	return (
		<Box onClick={onSelect} cursor="pointer" style={{position: "relative"}}>
			<Card style={{outline: isSelected ? "2px solid var(--border-accent-bold)" : undefined}}>
				<CardPreview bg="bg.secondary" style={{height: "120px", position: "relative"}}>
					<Box
						style={{
							position: "absolute",
							top: "8px",
							right: "8px",
							zIndex: 1,
						}}
						onClick={(e) => {
							e.stopPropagation();
							onSelect();
						}}
					>
						<Checkbox checked={isSelected} />
					</Box>
					<Text fontSize="sm" color="fg.tertiary">
						Preview
					</Text>
				</CardPreview>
				<CardHeader description={category}>{name}</CardHeader>
			</Card>
		</Box>
	);
};

const buildTree = (pages: Page[]) => {
	const map = new Map<string, PageNode>();
	const roots: PageNode[] = [];

	pages.forEach((page) => {
		map.set(page.id, {...page, children: []});
	});

	pages.forEach((page) => {
		const node = map.get(page.id)!;
		if (page.parentId) {
			const parent = map.get(page.parentId);
			if (parent) {
				parent.children.push(node);
			} else {
				roots.push(node);
			}
		} else {
			roots.push(node);
		}
	});

	return roots;
};

const LANGUAGE_OPTIONS = [
	{label: "English", value: "en"},
	{label: "Spanish", value: "es"},
	{label: "French", value: "fr"},
	{label: "German", value: "de"},
];

const CATEGORY_OPTIONS = [
	{label: "Any", value: "any"},
	{label: "Page", value: "Page"},
	{label: "Experience", value: "Experience"},
	{label: "Block", value: "Block"},
];

export function CreatePageDialog({children, pages, preselectedLocation, onCreatePage}: CreatePageDialogProps) {
	const router = useRouter();
	const {setPendingGeneration} = useOpalGeneration();
	const [opalActions] = usePersistentState("opal-actions", initialOpalActions) as [OpalAction[], any];
	const [open, setOpen] = useState(false);
	const [opalDialogOpen, setOpalDialogOpen] = useState(false);
	const [name, setName] = useState("");
	const [language, setLanguage] = useState("en");
	const [selectedLocation, setSelectedLocation] = useState<string | null>(preselectedLocation || null);
	const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
	const [templateSearch, setTemplateSearch] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("any");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [errors, setErrors] = useState<{
		name?: string;
		location?: string;
		template?: string;
	}>({});
	const [opalInstructions, setOpalInstructions] = useState("");
	const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
	const [opalError, setOpalError] = useState<string | undefined>();

	const tree = buildTree(pages);

	// Create root node containing all top-level nodes
	const rootNode: PageNode = {
		id: "root",
		name: "Root",
		parentId: null,
		status: "Published",
		lastModified: new Date().toISOString(),
		contentTypeId: "folder",
		children: tree,
	};

	// Ensure value is always in options
	const languageValue = useMemo(() => {
		return LANGUAGE_OPTIONS.some((o) => o.value === language)
			? language
			: LANGUAGE_OPTIONS[0].value;
	}, [language]);

	// Get templates from content types - filter by Page and Experience base types
	// Templates are now shown immediately, not dependent on location selection
	const templates = initialContentTypes
		.filter((ct) => ct.baseType === "Page" || ct.baseType === "Experience")
		.filter((ct) => categoryFilter === "any" || ct.baseType === categoryFilter)
		.filter((ct) =>
			templateSearch
				? (ct.displayName || ct.name).toLowerCase().includes(templateSearch.toLowerCase())
				: true
		)
		.map((ct) => ({
			id: ct.id,
			name: ct.displayName || ct.name,
			category: ct.baseType,
		}));

	// Get valid locations for the selected template
	const validLocations = useMemo(() => {
		if (!selectedTemplate) return [];

		// Include root as a valid location
		const allLocations = [rootNode, ...pages];

		return allLocations.filter(page => {
			const parentContentType = initialContentTypes.find(
				ct => ct.id === page.contentTypeId
			);

			// If parent has no restrictions, allow any child
			if (!parentContentType?.availableContentTypes ||
				parentContentType.availableContentTypes.length === 0) {
				return true;
			}

			// If parent explicitly disallows all children
			if (parentContentType.availableContentTypes.includes("__none__")) {
				return false;
			}

			// Check if selected template is in parent's allowed types
			return parentContentType.availableContentTypes.includes(selectedTemplate);
		});
	}, [selectedTemplate, pages, rootNode]);

	// Auto-select location if only one valid location exists
	useMemo(() => {
		if (selectedTemplate && validLocations.length === 1 && !selectedLocation) {
			setSelectedLocation(validLocations[0].id);
		}
	}, [selectedTemplate, validLocations, selectedLocation]);

	// Build a filtered tree containing only valid locations
	const filteredLocationTree = useMemo(() => {
		if (!selectedTemplate || validLocations.length <= 1) {
			return rootNode;
		}

		const validLocationIds = new Set(validLocations.map(loc => loc.id));

		const filterTree = (node: PageNode): PageNode | null => {
			// Check if this node is valid
			const isValid = validLocationIds.has(node.id);

			// Recursively filter children
			const filteredChildren = node.children
				.map(child => filterTree(child))
				.filter((child): child is PageNode => child !== null);

			// Include node if it's valid OR has valid descendants
			if (isValid || filteredChildren.length > 0) {
				return {
					...node,
					children: filteredChildren,
				};
			}

			return null;
		};

		return filterTree(rootNode) || rootNode;
	}, [selectedTemplate, validLocations, rootNode]);

	const validateForm = () => {
		const newErrors: {name?: string; location?: string; template?: string} = {};

		if (!name.trim()) {
			newErrors.name = "Page name is required";
		}
		if (!selectedTemplate) {
			newErrors.template = "Please select a template";
		}
		// Location is only required if there are multiple valid locations
		if (selectedTemplate && validLocations.length > 1 && !selectedLocation) {
			newErrors.location = "Please select a location";
		}
		// Show error if no valid locations exist
		if (selectedTemplate && validLocations.length === 0) {
			newErrors.location = "This content type cannot be created anywhere in the current tree";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleCreate = () => {
		if (!validateForm()) {
			return;
		}

		// Get the selected content type to initialize outlines
		const contentType = initialContentTypes.find((ct) => ct.id === selectedTemplate);

		// Initialize outlines based on content type properties
		const initialOutlines: any[] = [];
		if (contentType?.properties) {
			contentType.properties.forEach((prop) => {
				if (prop.type === "outline") {
					initialOutlines.push({
						id: `ol-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
						title: prop.displayName || prop.name,
						tree: [], // Empty tree - no default sections
						elements: {}, // Empty element map
					});
				}
			});
		}

		const newPage: Page = {
			id: `page-${Date.now()}`,
			name: name.trim(),
			parentId: selectedLocation === "root" ? null : selectedLocation,
			status: "Draft",
			lastModified: new Date().toISOString(),
			contentTypeId: selectedTemplate!,
			outlines: initialOutlines.length > 0 ? initialOutlines : undefined,
		};

		console.log("Create page:", newPage);

		if (onCreatePage) {
			onCreatePage(newPage);
		}

		setOpen(false);
		// Reset form
		setName("");
		setLanguage("en");
		setSelectedLocation(null);
		setSelectedTemplate(null);
		setErrors({});

		// Navigate to visual builder
		router.push(`/cms/edit/${newPage.id}`);
	};

	const handleCreateWithOpal = () => {
		if (!validateForm()) {
			return;
		}

		// Open the Opal generation dialog
		setOpalDialogOpen(true);
	};

	const handleOpalConfirm = () => {
		// Validate that either instructions or files are provided
		if (!opalInstructions.trim() && uploadedFiles.length === 0) {
			setOpalError("Please provide instructions or upload at least one file");
			return;
		}

		console.log("Generate with Opal:", {
			name,
			language,
			selectedLocation,
			selectedTemplate,
			instructions: opalInstructions,
			files: uploadedFiles,
		});

		// Create the page with empty structure (will be populated by Opal)
		const newPage: Page = {
			id: `page-${Date.now()}`,
			name: name.trim(),
			parentId: selectedLocation === "root" ? null : selectedLocation,
			status: "Draft",
			lastModified: new Date().toISOString(),
			contentTypeId: selectedTemplate!,
			outlines: [], // Empty - will be populated by Opal
			data: {}, // Empty - will be populated by Opal
			variations: [
				{
					id: "original",
					name: "Original",
					status: "Draft",
					outlines: [],
					data: {},
				},
			],
		};

		if (onCreatePage) {
			onCreatePage(newPage);
		}

		// Store generation context for VB to pick up
		setPendingGeneration({
			pageId: newPage.id,
			instructions: opalInstructions,
			contentTypeId: selectedTemplate!,
			files: uploadedFiles,
		});

		// Close dialogs and reset
		setOpalDialogOpen(false);
		setOpen(false);
		setName("");
		setLanguage("en");
		setSelectedLocation(null);
		setSelectedTemplate(null);
		setOpalInstructions("");
		setUploadedFiles([]);
		setErrors({});
		setOpalError(undefined);

		// Navigate to visual builder - it will detect pending generation and auto-start
		router.push(`/cms/edit/${newPage.id}`);
	};

	const handleOpalBack = () => {
		setOpalDialogOpen(false);
		setOpalError(undefined);
	};

	return (
		<>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>{children}</DialogTrigger>

				<DialogContent style={{maxWidth: "1200px", width: "90vw", maxHeight: "80vh"}}>
					<DialogHeader>Create Page</DialogHeader>

				<DialogBody>
					<Group flexDirection="column" gap="16">
						{/* Name and Language */}
						<Group gap="16">
							<Box style={{flex: 1}}>
								<Field label="Name" required error={errors.name}>
									<Input
										placeholder="Enter page name"
										value={name}
										onChange={(e) => {
											setName(e.target.value);
											if (errors.name) {
												setErrors({...errors, name: undefined});
											}
										}}
									/>
								</Field>
							</Box>
							<Box style={{width: "200px"}}>
								<Field label="Language">
									<Select
										value={languageValue}
										onValueChange={setLanguage}
										options={LANGUAGE_OPTIONS}
									>
										<SelectTrigger />
										<SelectContent />
									</Select>
								</Field>
							</Box>
						</Group>

						{/* Templates and Location */}
						<Group gap="16" style={{minHeight: "400px"}} alignItems={"normal"}>
							{/* Left: Template Selection */}
							<Box style={{flex: 1}} rounded="md">
								<Group flexDirection="column" gap="16">
									{/* Filters Row */}
									<Group gap="12" alignItems="end">
										<Box style={{flex: 1}}>
											<Field label="Search Templates" error={errors.template}>
												<SearchInput
													placeholder="Filter by Name"
													value={templateSearch}
													onChange={(e) => setTemplateSearch(e.target.value)}
												/>
											</Field>
										</Box>
										<Box style={{width: "100px"}}>
											<Field label="Category">
												<Select
													value={categoryFilter}
													onValueChange={setCategoryFilter}
													options={CATEGORY_OPTIONS}
												>
													<SelectTrigger />
													<SelectContent />
												</Select>
											</Field>
										</Box>
										<Group gap="0">
											<ToggleButton
												appearance="subtle"
												pressed={viewMode === "grid"}
												onPressedChange={() => setViewMode("grid")}
												aria-label="Grid view"
											>
												<IconLayoutGrid size={16} />
											</ToggleButton>
											<ToggleButton
												appearance="subtle"
												pressed={viewMode === "list"}
												onPressedChange={() => setViewMode("list")}
												aria-label="List view"
											>
												<IconList size={16} />
											</ToggleButton>
										</Group>
									</Group>

									{/* Templates Grid/List */}
									{viewMode === "grid" ? (
										<Box
											display="grid"
											gap="12"
											style={{
												gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
												maxHeight: "320px",
												overflow: "auto",
											}}
										>
											{templates.map((template) => (
												<TemplateCard
													key={template.id}
													name={template.name}
													category={template.category}
													onSelect={() => {
														setSelectedTemplate(template.id);
														if (errors.template) {
															setErrors({...errors, template: undefined});
														}
													}}
													viewMode={viewMode}
													isSelected={selectedTemplate === template.id}
												/>
											))}
										</Box>
									) : (
										<Box style={{maxHeight: "320px", overflow: "auto"}}>
											<Table>
												<TableHeader>
													<TableRow>
														<TableHeaderCell style={{width: "48px"}}></TableHeaderCell>
														<TableHeaderCell>Preview</TableHeaderCell>
														<TableHeaderCell>Name</TableHeaderCell>
														<TableHeaderCell>Category</TableHeaderCell>
													</TableRow>
												</TableHeader>
												<TableBody>
													{templates.map((template) => (
														<TableRow
															key={template.id}
															onClick={() => {
																setSelectedTemplate(template.id);
																if (errors.template) {
																	setErrors({...errors, template: undefined});
																}
															}}
															cursor="pointer"
															bg={
																selectedTemplate === template.id
																	? "bg.accent.subtle"
																	: undefined
															}
														>
															<TableCell
																onClick={(e) => {
																	e.stopPropagation();
																	setSelectedTemplate(template.id);
																	if (errors.template) {
																		setErrors({...errors, template: undefined});
																	}
																}}
															>
																<Checkbox checked={selectedTemplate === template.id} />
															</TableCell>
															<TableCell>
																<Box
																	bg="bg.secondary"
																	rounded="sm"
																	style={{width: "48px", height: "48px"}}
																	display="flex"
																	alignItems="center"
																	justifyContent="center"
																>
																	<Text fontSize="xs" color="fg.tertiary">
																		Preview
																	</Text>
																</Box>
															</TableCell>
															<TableCell>
																<Text fontSize="md" fontWeight="600">
																	{template.name}
																</Text>
															</TableCell>
															<TableCell>
																<Text fontSize="sm" color="fg.secondary">
																	{template.category}
																</Text>
															</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</Box>
									)}
								</Group>
							</Box>

							{/* Right: Location Selection - Conditional */}
							{selectedTemplate && validLocations.length > 1 && (
								<>
									<Separator orientation="vertical" />

									<Group w="384" flexDirection="column" rounded="md" gap="16">
										<Group flexDirection="column" gap="8" style={{flex: 1}}>
											<Field label="Location" required error={errors.location}>
												<SearchInput placeholder="Search locations..." />
											</Field>
											<Box overflow="auto" style={{maxHeight: "320px"}}>
												<LocationTreeNode
													node={filteredLocationTree}
													selectedLocation={selectedLocation}
													onSelectLocation={(id) => {
														setSelectedLocation(id);
														if (errors.location) {
															setErrors({...errors, location: undefined});
														}
													}}
												/>
											</Box>
										</Group>
									</Group>
								</>
							)}

							{/* Show message if single valid location */}
							{selectedTemplate && validLocations.length === 1 && (
								<>
									<Separator orientation="vertical" />
									<Group w="384" flexDirection="column" rounded="md" gap="16" p="16">
										<Text fontSize="sm" color="fg.secondary">
											This content type can only be created under:
										</Text>
										<Box p="12" rounded="md" bg="bg.secondary">
											<Text fontWeight="600">{validLocations[0].name}</Text>
										</Box>
									</Group>
								</>
							)}

							{/* Show error if no valid locations */}
							{selectedTemplate && validLocations.length === 0 && (
								<>
									<Separator orientation="vertical" />
									<Group w="384" flexDirection="column" rounded="md" gap="16" p="16">
										<Box p="12" rounded="md" bg="bg.error.subtle" style={{border: "1px solid var(--border-error)"}}>
											<Text fontSize="sm" color="fg.error">
												This content type cannot be created anywhere in the current tree. Create a parent page that allows this type first.
											</Text>
										</Box>
									</Group>
								</>
							)}
						</Group>
					</Group>
				</DialogBody>

				<DialogFooter>
					<Group gap="8" justifyContent="space-between" w="full">
						<DialogClose>Cancel</DialogClose>
						<Group gap="8">
							<Button appearance="default" onClick={handleCreate}>
								Create Page
							</Button>
							{opalActions.find((a) => a.id === "system-page-generator")?.enabled && (
								<Button appearance="primary-opal" onClick={handleCreateWithOpal} icon={<Image src="/opal-orb.png" alt="Opal" width={20} height={20} />}>
									Generate Page With Opal
								</Button>
							)}
						</Group>
					</Group>
				</DialogFooter>
			</DialogContent>
		</Dialog>

		{/* Opal Generation Dialog */}
		<Dialog open={opalDialogOpen} onOpenChange={setOpalDialogOpen}>
			<DialogContent style={{maxWidth: "800px", width: "90vw"}}>
				<DialogHeader>Generate Page With Opal</DialogHeader>

				<DialogBody>
					<Group flexDirection="column" gap="20">
						<Text color="fg.secondary">
							Provide instructions, attach images, or both to help Opal generate your page content.
						</Text>

						{opalError && (
							<Box p="12" rounded="md" bg="bg.error.subtle" style={{border: "1px solid var(--border-error)"}}>
								<Text fontSize="sm" color="fg.error">
									{opalError}
								</Text>
							</Box>
						)}

						<Field label="Instructions (optional if files are provided)">
							<Textarea
								placeholder="Describe the page you want to create... (e.g., 'Create a product landing page for a new smartphone with features, pricing, and testimonials')"
								rows={6}
								value={opalInstructions}
								onChange={(e) => {
									setOpalInstructions(e.target.value);
									if (opalError && (e.target.value.trim() || uploadedFiles.length > 0)) {
										setOpalError(undefined);
									}
								}}
							/>
						</Field>

						<Field label="Attachments (optional if instructions are provided)">
							<Box
								p="32"
								rounded="md"
								bg="bg.default.hovered"
								display="flex"
								flexDirection="column"
								alignItems="center"
								justifyContent="center"
								gap="12"
								style={{
									minHeight: "200px",
									border: "1px dashed var(--border-secondary)",
								}}
								onDragOver={(e) => {
									e.preventDefault();
									e.stopPropagation();
								}}
								onDrop={(e) => {
									e.preventDefault();
									e.stopPropagation();
									const files = Array.from(e.dataTransfer.files);
									setUploadedFiles((prev) => {
										const newFiles = [...prev, ...files];
										if (opalError && (opalInstructions.trim() || newFiles.length > 0)) {
											setOpalError(undefined);
										}
										return newFiles;
									});
								}}
							>
								{uploadedFiles.length === 0 ? (
									<>
										<Text fontSize="sm" color="fg.secondary" textAlign="center">
											Drag and drop images here
										</Text>
										<Text fontSize="xs" color="fg.tertiary" textAlign="center">
											Supported formats: JPG, PNG, GIF, WebP
										</Text>
									</>
								) : (
									<Box display="flex" flexDirection="column" gap="8" w="full">
										{uploadedFiles.map((file, index) => (
											<Box
												key={index}
												display="flex"
												alignItems="center"
												justifyContent="space-between"
												p="8"
												rounded="sm"
												bg="bg.default"
												style={{
													border: "1px solid var(--border-secondary)",
												}}
											>
												<Text fontSize="sm">{file.name}</Text>
												<Button
													appearance="subtle"
													size="sm"
													onClick={() => {
														setUploadedFiles((prev) => {
															const newFiles = prev.filter((_, i) => i !== index);
															if (opalError && (opalInstructions.trim() || newFiles.length > 0)) {
																setOpalError(undefined);
															}
															return newFiles;
														});
													}}
												>
													Remove
												</Button>
											</Box>
										))}
									</Box>
								)}
							</Box>
						</Field>
					</Group>
				</DialogBody>

				<DialogFooter>
					<Group gap="8" justifyContent="flex-end" w="full">
						<Button appearance="subtle" onClick={handleOpalBack}>
							Cancel
						</Button>
						<Button appearance="primary-opal" onClick={handleOpalConfirm} icon={<Image src="/opal-orb.png" alt="Opal" width={20} height={20} />}>
							Confirm
						</Button>
					</Group>
				</DialogFooter>
			</DialogContent>
		</Dialog>
		</>
	);
}
