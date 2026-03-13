"use client";

import {useState, useMemo} from "react";
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
import {Page} from "@/app/db/initialData";

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
	{label: "Basic", value: "basic"},
	{label: "Marketing", value: "marketing"},
	{label: "Content", value: "content"},
	{label: "E-commerce", value: "ecommerce"},
];

export function CreatePageDialog({children, pages, preselectedLocation, onCreatePage}: CreatePageDialogProps) {
	const [open, setOpen] = useState(false);
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

	// Mock templates - these would come from your CMS configuration
	const templates = selectedLocation
		? [
				{id: "blank", name: "Blank Page", category: "Basic"},
				{id: "landing", name: "Landing Page", category: "Marketing"},
				{id: "article", name: "Article", category: "Content"},
				{id: "product", name: "Product Page", category: "E-commerce"},
		  ]
		: [];

	const validateForm = () => {
		const newErrors: {name?: string; location?: string; template?: string} = {};

		if (!name.trim()) {
			newErrors.name = "Page name is required";
		}
		if (!selectedLocation) {
			newErrors.location = "Please select a location";
		}
		if (!selectedTemplate) {
			newErrors.template = "Please select a template";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleCreate = () => {
		if (!validateForm()) {
			return;
		}

		const newPage: Page = {
			id: `page-${Date.now()}`,
			name: name.trim(),
			parentId: selectedLocation === "root" ? null : selectedLocation,
			status: "Draft",
			lastModified: new Date().toISOString(),
			contentTypeId: selectedTemplate!,
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
	};

	const handleCreateWithOpal = () => {
		if (!validateForm()) {
			return;
		}

		console.log("Create with Opal:", {name, language, selectedLocation});
		setOpen(false);
		// Reset form
		setName("");
		setLanguage("en");
		setSelectedLocation(null);
		setSelectedTemplate(null);
		setErrors({});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent style={{maxWidth: "1200px", width: "90vw", maxHeight: "80vh"}}>
				<DialogHeader>Create Page</DialogHeader>

				<DialogBody>
					<Group flexDirection="column" gap="16">
						

						{/* Location and Templates */}
						<Group gap="16" style={{minHeight: "400px"}} alignItems={"normal"}>

							{/* Left: Location Tree - Fixed width */}

							<Group w="384" flexDirection="column" rounded="md" gap="16">
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
										value={languageValue}
										onValueChange={setLanguage}
										options={LANGUAGE_OPTIONS}
									>
										<SelectTrigger />
										<SelectContent />
									</Select>
								</Field>
								<Group flexDirection="column" gap="8" style={{flex: 1}}>
									<Field label="Search" error={errors.location}>
										<SearchInput placeholder="Search locations..." />
									</Field>
									<Box overflow="auto" style={{maxHeight: "240px"}}>
										<LocationTreeNode
											node={rootNode}
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

							<Separator orientation="vertical" />

							{/* Right: Templates - Takes remaining space */}
							<Box style={{flex: 1}} rounded="md">
								{!selectedLocation ? (
									<Group
										flexDirection="column"
										alignItems="center"
										justifyContent="center"
										h="full"
										gap="8"
									>
										<Text fontSize="sm" color="fg.secondary" textAlign="center">
											Select a location to view available templates
										</Text>
									</Group>
								) : (
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
								)}
							</Box>
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
							<Button appearance="primary-opal" onClick={handleCreateWithOpal}>
								Generate Page With Opal
							</Button>
						</Group>
					</Group>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
