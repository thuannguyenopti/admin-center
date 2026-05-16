"use client";

import {useState, useMemo, useEffect, useCallback} from "react";
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
	ToggleButton,
	Table,
	TableBody,
	TableHeader,
	TableHeaderCell,
	TableRow,
	TableCell,
	Checkbox,
	Textarea,
	Menu,
	MenuTrigger,
	MenuContent,
} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {
	IconFile,
	IconChevronRight,
	IconChevronDown,
	IconGrid,
	IconList,
	IconUpload,
	IconImages,
	IconXmark,
	IconClock,
} from "@optimizely/axiom-icons";
import Item from "@/app/components/Item";
import {Page, ContentType, initialContentTypes, canCreateChildType} from "@/app/db/initialData";
import {useOpalGeneration} from "@/app/context/OpalGenerationContext";
import ContentInstancePicker from "@/app/components/ContentInstancePicker";
import {imageSelectorInstances} from "@/app/db/imageLibraryData";
import {ContentInstance} from "@/app/db/cmpInitialData";

type PageNode = Page & {children: PageNode[]};

interface CreatePageDialogProps {
	children: React.ReactNode;
	pages: Page[];
	preselectedLocation?: string;
	onCreatePage?: (page: Page, navigate?: boolean) => void;
}

const StepIndicator = ({currentStep}: {currentStep: 'template' | 'location' | 'content'}) => {
	const isStep1Active = currentStep === 'template';
	const isStep2Active = currentStep === 'location';
	const isStep3Active = currentStep === 'content';
	const isStep1Complete = currentStep === 'location' || currentStep === 'content';
	const isStep2Complete = currentStep === 'content';

	return (
		<Box display="flex" alignItems="center" justifyContent="flex-start" gap="12" mb="0">
			{/* Step 1 */}
			<Box display="flex" alignItems="center" gap="8">
				<Box
					w="32"
					h="32"
					rounded="full"
					bg={isStep1Active || isStep1Complete ? "bg.accent" : "bg.tertiary"}
					display="flex"
					alignItems="center"
					justifyContent="center"
				>
					<Text fontSize="sm" fontWeight="600" color={isStep1Active || isStep1Complete ? "fg.default.inverse" : "fg.secondary"}>
						1
					</Text>
				</Box>
				<Text fontSize="md" fontWeight={isStep1Active ? '600' : '400'} color={isStep1Complete && !isStep1Active ? "fg.secondary" : undefined}>
					Template
				</Text>
			</Box>

			{/* Connecting line 1-2 */}
			<Box w="64" bg={isStep1Complete ? "bg.accent" : "bg.tertiary"} style={{height: '2px'}} />

			{/* Step 2 */}
			<Box display="flex" alignItems="center" gap="8">
				<Box
					w="32"
					h="32"
					rounded="full"
					bg={isStep2Active || isStep2Complete ? "bg.accent" : "bg.tertiary"}
					display="flex"
					alignItems="center"
					justifyContent="center"
				>
					<Text fontSize="sm" fontWeight="600" color={isStep2Active || isStep2Complete ? "fg.default.inverse" : "fg.secondary"}>
						2
					</Text>
				</Box>
				<Text fontSize="md" fontWeight={isStep2Active ? '600' : '400'} color={!isStep2Active && !isStep2Complete ? "fg.secondary" : undefined}>
					Location
				</Text>
			</Box>

			{/* Connecting line 2-3 */}
			<Box w="64" bg={isStep2Complete ? "bg.accent" : "bg.tertiary"} style={{height: '2px'}} />

			{/* Step 3 */}
			<Box display="flex" alignItems="center" gap="8">
				<Box
					w="32"
					h="32"
					rounded="full"
					bg={isStep3Active ? "bg.accent" : "bg.tertiary"}
					display="flex"
					alignItems="center"
					justifyContent="center"
				>
					<Text fontSize="sm" fontWeight="600" color={isStep3Active ? "fg.default.inverse" : "fg.secondary"}>
						3
					</Text>
				</Box>
				<Text fontSize="md" fontWeight={isStep3Active ? '600' : '400'} color={isStep3Active ? undefined : "fg.secondary"}>
					Content
				</Text>
			</Box>
		</Box>
	);
};

const LocationTreeNode = ({
	node,
	level = 0,
	selectedLocation,
	onSelectLocation,
	validLocationIds = [],
}: {
	node: PageNode;
	level?: number;
	selectedLocation: string | null;
	onSelectLocation: (id: string) => void;
	validLocationIds?: string[];
}) => {
	const [expanded, setExpanded] = useState(true);
	const hasChildren = node.children.length > 0;
	const isSelected = selectedLocation === node.id;
	const isValid = validLocationIds.length === 0 || validLocationIds.includes(node.id);

	return (
		<Box>
			<Box
				onClick={() => isValid && onSelectLocation(node.id)}
				cursor={isValid ? "pointer" : undefined}
				p="8"
				rounded="sm"
				bg={isSelected ? "bg.accent.subtle" : undefined}
				style={{
					paddingLeft: level * 24 + 8,
					opacity: isValid ? 1 : 0.5,
					cursor: isValid ? "pointer" : "not-allowed",
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
						validLocationIds={validLocationIds}
					/>
				))}
		</Box>
	);
};

const TemplateCard = ({
	name,
	onSelect,
	viewMode = "grid",
	isSelected = false,
}: {
	name: string;
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
				<CardHeader>{name}</CardHeader>
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

export function CreatePageDialog({children, pages, preselectedLocation, onCreatePage}: CreatePageDialogProps) {
	const {setPendingGeneration} = useOpalGeneration();
	const [open, setOpen] = useState(false);
	const [step, setStep] = useState<'template' | 'location' | 'content'>('template');
	const [name, setName] = useState("");
	const [language, setLanguage] = useState("en");
	const [selectedLocation, setSelectedLocation] = useState<string | null>(preselectedLocation || null);
	const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
	const [templateSearch, setTemplateSearch] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [errors, setErrors] = useState<{
		name?: string;
		location?: string;
		template?: string;
	}>({});
	const [generateWithOpal, setGenerateWithOpal] = useState(true);
	const [opalInstructions, setOpalInstructions] = useState("");
	const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
	const [opalError, setOpalError] = useState<string | undefined>();
	const [imagePickerOpen, setImagePickerOpen] = useState(false);
	const [promptHistory, setPromptHistory] = useState<string[]>([]);

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

	// Get templates from content types - filter by Page and Experience base types, exclude CMP
	const templates = initialContentTypes
		.filter((ct) => ct.baseType === "Page" || ct.baseType === "Experience")
		.filter((ct) => ct.source !== "cmp")
		.filter((ct) => categoryFilter === "all" || !ct.groupName || ct.groupName === categoryFilter)
		.filter((ct) =>
			templateSearch
				? (ct.displayName || ct.name).toLowerCase().includes(templateSearch.toLowerCase())
				: true
		)
		.map((ct) => ({
			id: ct.id,
			name: ct.displayName || ct.name,
			category: ct.groupName || "Uncategorized",
		}));

	// Generate category options from unique groupName values (exclude CMP)
	const categoryOptions = useMemo(() => {
		const pageAndExpTypes = initialContentTypes.filter(
			(ct) => (ct.baseType === "Page" || ct.baseType === "Experience") && ct.source !== "cmp"
		);
		const uniqueGroups = new Set(
			pageAndExpTypes.map((ct) => ct.groupName || "Uncategorized")
		);
		return [
			{label: "All", value: "all"},
			...Array.from(uniqueGroups).sort().map((group) => ({
				label: group,
				value: group,
			})),
		];
	}, []);

	// Group templates by category when "all" is selected
	const groupedTemplates = useMemo(() => {
		if (categoryFilter !== "all") {
			return null;
		}
		const groups: Record<string, typeof templates> = {};
		templates.forEach((template) => {
			const group = template.category;
			if (!groups[group]) {
				groups[group] = [];
			}
			groups[group].push(template);
		});
		return groups;
	}, [templates, categoryFilter]);

	// Get valid locations for the selected template
	const validLocations = useMemo(() => {
		if (!selectedTemplate) return [];

		// Include root as a valid location
		const allLocations = [rootNode, ...pages];

		return allLocations.filter(page => {
			// Use helper function to check if child can be created under parent
			return canCreateChildType(page.contentTypeId, selectedTemplate);
		});
	}, [selectedTemplate, pages, rootNode]);

	// Auto-select location when entering step 2
	useEffect(() => {
		if (step === 'location' && selectedTemplate && validLocations.length === 1 && !selectedLocation) {
			setSelectedLocation(validLocations[0].id);
		}
	}, [step, selectedTemplate, validLocations, selectedLocation]);

	// Load prompt history from localStorage
	useEffect(() => {
		const saved = localStorage.getItem('create_page_prompt_history');
		if (saved) {
			try {
				setPromptHistory(JSON.parse(saved));
			} catch (e) {
				console.warn('[CreatePageDialog] Failed to parse prompt history:', e);
			}
		}
	}, []);

	// Save prompt to history
	const saveToHistory = useCallback((prompt: string) => {
		const trimmed = prompt.trim();
		if (!trimmed) return;

		const MAX_HISTORY = 20;
		setPromptHistory(prev => {
			const updated = [
				trimmed,
				...prev.filter(p => p !== trimmed)
			].slice(0, MAX_HISTORY);
			localStorage.setItem('create_page_prompt_history', JSON.stringify(updated));
			return updated;
		});
	}, []);

	// Get valid location IDs for disabling invalid nodes
	const validLocationIds = useMemo(() => {
		return validLocations.map(loc => loc.id);
	}, [validLocations]);

	const validateStep1 = () => {
		const newErrors: {template?: string} = {};

		if (!selectedTemplate) {
			newErrors.template = "Please select a template";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const validateStep2 = () => {
		const newErrors: {location?: string} = {};

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

	const validateStep3 = () => {
		const newErrors: {name?: string} = {};

		if (!name.trim()) {
			newErrors.name = "Page name is required";
		}

		// If generating with Opal, validate instructions or files
		if (generateWithOpal && !opalInstructions.trim() && uploadedFiles.length === 0) {
			setOpalError("Please provide instructions or upload at least one file");
			return false;
		}

		setErrors(newErrors);
		setOpalError(undefined);
		return Object.keys(newErrors).length === 0;
	};

	const handleNext = () => {
		if (step === 'template' && validateStep1()) {
			setStep('location');
		} else if (step === 'location' && validateStep2()) {
			setStep('content');
		}
	};

	const handleBack = () => {
		if (step === 'location') {
			setStep('template');
		} else if (step === 'content') {
			setStep('location');
		}
	};

	const handleCreate = () => {
		if (!validateStep3()) {
			return;
		}

		if (generateWithOpal) {
			// Create page with empty structure for Opal to populate
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

			// Store generation context for VB to pick up
			setPendingGeneration({
				pageId: newPage.id,
				instructions: opalInstructions,
				contentTypeId: selectedTemplate!,
				files: uploadedFiles,
			});

			// Save prompt to history
			if (opalInstructions.trim()) {
				saveToHistory(opalInstructions);
			}

			console.log("Generate with Opal:", {
				name,
				language,
				selectedLocation,
				selectedTemplate,
				instructions: opalInstructions,
				files: uploadedFiles,
			});

			// Reset form
			setOpen(false);
			setName("");
			setLanguage("en");
			setSelectedLocation(null);
			setSelectedTemplate(null);
			setStep('template');
			setOpalInstructions("");
			setUploadedFiles([]);
			setErrors({});
			setOpalError(undefined);
			setGenerateWithOpal(true);

			// Create page and navigate
			if (onCreatePage) {
				onCreatePage(newPage, true);
			}
		} else {
			// Regular page creation with initialized outlines
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

			// Reset form
			setOpen(false);
			setName("");
			setLanguage("en");
			setSelectedLocation(null);
			setSelectedTemplate(null);
			setStep('template');
			setErrors({});
			setGenerateWithOpal(true);

			// Create page and navigate
			if (onCreatePage) {
				onCreatePage(newPage, true);
			}
		}
	};

	const handleSelectFromLibrary = async (instances: ContentInstance | ContentInstance[]) => {
		const selectedInstances = Array.isArray(instances) ? instances : [instances];

		// Convert image URLs to File objects
		const imageFiles = await Promise.all(
			selectedInstances.map(async (instance) => {
				const imageUrl = instance.fields.image as string;
				if (!imageUrl) return null;

				try {
					// Fetch the image
					const response = await fetch(imageUrl);
					const blob = await response.blob();

					// Create a File from the blob
					const fileName = instance.fields.title || `image-${instance.id}.jpg`;
					const file = new File([blob], fileName as string, { type: blob.type });
					return file;
				} catch (error) {
					console.error('Error loading image:', error);
					return null;
				}
			})
		);

		// Filter out any failed downloads and add to uploaded files
		const validFiles = imageFiles.filter((f): f is File => f !== null);
		setUploadedFiles((prev) => {
			const newFiles = [...prev, ...validFiles];
			if (opalError && (opalInstructions.trim() || newFiles.length > 0)) {
				setOpalError(undefined);
			}
			return newFiles;
		});

		setImagePickerOpen(false);
	};

	const handleDialogOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (!newOpen) {
			// Reset to step 1 when dialog closes
			setStep('template');
		}
	};

	return (
		<>
			<Dialog open={open} onOpenChange={handleDialogOpenChange}>
				<DialogTrigger asChild>{children}</DialogTrigger>

				<DialogContent size="md" overflowY="hidden">

					<DialogHeader>
						<Group flexDirection="column" gap="16">Create Page
							<StepIndicator currentStep={step} />
						</Group>
					</DialogHeader>

				<DialogBody maxH="lg" overflow="auto">
					{/* Step 1: Template Selection */}
					{step === 'template' && (
						<Group flexDirection="column" gap="16">
							{/* Template Selection */}
							<Box rounded="md">
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
													options={categoryOptions}
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
												<IconGrid size={16} />
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
										<Box display="flex" flexDirection="column" gap="24">
											{groupedTemplates ? (
												// Grouped view when "All" is selected
												Object.entries(groupedTemplates).sort(([a], [b]) => a.localeCompare(b)).map(([groupName, groupTemplates]) => (
													<Box key={groupName}>
														<Text fontSize="sm" fontWeight="600" color="fg.secondary" mb="12">
															{groupName}
														</Text>
														<Box
															display="grid"
															gap="12"
															style={{
																gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
															}}
														>
															{groupTemplates.map((template) => (
																<TemplateCard
																	key={template.id}
																	name={template.name}
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
													</Box>
												))
											) : (
												// Ungrouped view for specific category
												<Box
													display="grid"
													gap="12"
													style={{
														gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
													}}
												>
													{templates.map((template) => (
														<TemplateCard
															key={template.id}
															name={template.name}
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
											)}
										</Box>
									) : (
										<Box>
											<Table>
												<TableHeader>
													<TableRow>
														<TableHeaderCell style={{width: "48px"}}></TableHeaderCell>
														<TableHeaderCell>Preview</TableHeaderCell>
														<TableHeaderCell>Name</TableHeaderCell>
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
														</TableRow>
													))}
												</TableBody>
											</Table>
										</Box>
									)}
								</Group>
							</Box>
						</Group>
					)}

					{/* Step 2: Location Selection */}
					{step === 'location' && (
						<Group flexDirection="column" gap="16">
							{/* Selected Template Summary */}
							<Box p="16" bg="bg.secondary" rounded="md">
								<Text fontSize="sm" color="fg.secondary" mb="4">
									Selected Template
								</Text>
								<Text fontSize="md" fontWeight="600">
									{templates.find(t => t.id === selectedTemplate)?.name}
								</Text>
								<Text fontSize="sm" color="fg.secondary">
									{templates.find(t => t.id === selectedTemplate)?.category}
								</Text>
							</Box>

							{/* Location Selection */}
							{validLocations.length > 1 && (
								<Group flexDirection="column" gap="16">
									<Field label="Location" required error={errors.location}>
										<SearchInput placeholder="Search locations..." />
									</Field>
									<Box>
										<LocationTreeNode
											node={rootNode}
											selectedLocation={selectedLocation}
											onSelectLocation={(id) => {
												setSelectedLocation(id);
												if (errors.location) {
													setErrors({...errors, location: undefined});
												}
											}}
											validLocationIds={validLocationIds}
										/>
									</Box>
								</Group>
							)}

							{/* Show message if single valid location */}
							{validLocations.length === 1 && (
								<Box p="16" rounded="md" bg="bg.secondary">
									<Text fontSize="sm" color="fg.secondary" mb="8">
										This content type can only be created under:
									</Text>
									<Text fontWeight="600">{validLocations[0].name}</Text>
								</Box>
							)}

							{/* Show error if no valid locations */}
							{validLocations.length === 0 && (
								<Box p="16" rounded="md" bg="bg.error.subtle" style={{border: "1px solid var(--border-error)"}}>
									<Text fontSize="sm" color="fg.error">
										This content type cannot be created anywhere in the current tree. Create a parent page that allows this type first.
									</Text>
								</Box>
							)}
						</Group>
					)}

					{/* Step 3: Content */}
					{step === 'content' && (
						<Group flexDirection="column" gap="16">
							{/* Name and Language */}
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
							<Field label="Language">
								<Select
									value={language}
									onValueChange={setLanguage}
									options={LANGUAGE_OPTIONS}
								>
									<SelectTrigger />
									<SelectContent />
								</Select>
							</Field>

							{/* Generate with Opal Checkbox */}
							<Box display="flex" alignItems="center" gap="8" mt="8">
								<Checkbox
									checked={generateWithOpal}
									onCheckedChange={(checked) => setGenerateWithOpal(checked as boolean)}
								/>
								<Text fontSize="md" fontWeight="500">Generate with Opal</Text>
							</Box>

							{/* Conditional Opal Fields */}
							{generateWithOpal && (
								<Group flexDirection="column" gap="16" mt="8">
									{opalError && (
										<Box p="12" rounded="md" bg="bg.error.subtle" style={{border: "1px solid var(--border-error)"}}>
											<Text fontSize="sm" color="fg.error">
												{opalError}
											</Text>
										</Box>
									)}

									<Box style={{ position: 'relative' }}>
										{/* Prompt History - Absolutely positioned */}
										{promptHistory.length > 0 && (
											<Box style={{ position: 'absolute', top: '-4px', right: '0', zIndex: 1 }}>
												<Menu
													options={promptHistory.slice(0, 10).map((prompt) => ({
														label: prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt,
														execute: () => {
															setOpalInstructions(prompt);
															if (opalError && prompt.trim()) {
																setOpalError(undefined);
															}
														},
													}))}
												>
													<MenuTrigger
														appearance="subtle"
														size="sm"
														icon={<IconClock size={14} />}
														iconPosition="start"
													>
														Recent
													</MenuTrigger>
													<MenuContent />
												</Menu>
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
								</Box>

								<Field label="Attachments (optional if instructions are provided)">
										<Group flexDirection="column" gap="12">
											{/* Upload and Library buttons */}
											<Box display="flex" gap="8">
												<Button
													appearance="default"
													icon={<IconUpload />}
													onClick={() => {
														const input = document.createElement('input');
														input.type = 'file';
														input.accept = 'image/jpeg,image/png,image/gif,image/webp';
														input.multiple = true;
														input.onchange = (e) => {
															const files = Array.from((e.target as HTMLInputElement).files || []);
															setUploadedFiles((prev) => {
																const newFiles = [...prev, ...files];
																if (opalError && (opalInstructions.trim() || newFiles.length > 0)) {
																	setOpalError(undefined);
																}
																return newFiles;
															});
														};
														input.click();
													}}
												>
													Upload Images
												</Button>
												<Button
													appearance="default"
													icon={<IconImages />}
													onClick={() => setImagePickerOpen(true)}
												>
													Select from Library
												</Button>
											</Box>

											{/* Drag & Drop Area or Image Grid */}
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
													const allFiles = Array.from(e.dataTransfer.files);
													// Filter to only image files
													const imageFiles = allFiles.filter((file) => file.type.startsWith("image/"));

													// Warn about rejected files
													if (imageFiles.length < allFiles.length) {
														const rejectedCount = allFiles.length - imageFiles.length;
														console.warn(`[CreatePageDialog] Rejected ${rejectedCount} non-image file(s). Only image files are supported.`);
													}

													setUploadedFiles((prev) => {
														const newFiles = [...prev, ...imageFiles];
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
													<Box display="grid" gap="12" w="full" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
														{uploadedFiles.map((file, index) => {
															const imageUrl = URL.createObjectURL(file);
															return (
																<Box key={index} style={{ position: "relative" }}>
																	<Card>
																		<CardPreview style={{ height: "120px", position: "relative" }}>
																			<Image
																				src={imageUrl}
																				alt={file.name}
																				fill
																				style={{ objectFit: "cover" }}
																				onLoad={() => URL.revokeObjectURL(imageUrl)}
																			/>
																			<Box
																				style={{
																					position: "absolute",
																					top: "8px",
																					right: "8px",
																					zIndex: 1,
																				}}
																			>
																				<Button
																					appearance="subtle"
																					size="sm"
																					icon={<IconXmark />}
																					aria-label="Remove image"
																					onClick={() => {
																						setUploadedFiles((prev) => {
																							const newFiles = prev.filter((_, i) => i !== index);
																							if (opalError && (opalInstructions.trim() || newFiles.length > 0)) {
																								setOpalError(undefined);
																							}
																							return newFiles;
																						});
																					}}
																					style={{
																						backgroundColor: "var(--ax-colors-bg-default)",
																						boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
																					}}
																				/>
																			</Box>
																		</CardPreview>
																		<CardHeader>
																			<Text fontSize="xs" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
																				{file.name}
																			</Text>
																		</CardHeader>
																	</Card>
																</Box>
															);
														})}
													</Box>
												)}
											</Box>
										</Group>
									</Field>
								</Group>
							)}
						</Group>
					)}
				</DialogBody>

				<DialogFooter>
					{step === 'template' && (
						<Group gap="8" justifyContent="space-between" w="full">
							<DialogClose>Cancel</DialogClose>
							<Button appearance="primary" onClick={handleNext}>
								Next
							</Button>
						</Group>
					)}
					{step === 'location' && (
						<Group gap="8" justifyContent="space-between" w="full">
							<Button appearance="subtle" onClick={handleBack}>
								Back
							</Button>
							<Button appearance="primary" onClick={handleNext} disabled={validLocations.length === 0}>
								Next
							</Button>
						</Group>
					)}
					{step === 'content' && (
						<Group gap="8" justifyContent="space-between" w="full">
							<Button appearance="subtle" onClick={handleBack}>
								Back
							</Button>
							{generateWithOpal ? (
								<Button
									appearance="primary-opal"
									onClick={handleCreate}
									icon={<Image src="/opal-orb.png" alt="Opal" width={20} height={20} />}
								>
									Generate Page
								</Button>
							) : (
								<Button appearance="primary" onClick={handleCreate}>
									Create Page
								</Button>
							)}
						</Group>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>

		{/* Image Library Picker */}
		<ContentInstancePicker
			open={imagePickerOpen}
			onClose={() => setImagePickerOpen(false)}
			instances={imageSelectorInstances}
			onSelect={handleSelectFromLibrary}
			multiSelect={true}
			title="Select Images"
			description="Choose images from the library to use as reference."
			primaryActionText="Add Images"
		/>
		</>
	);
}
