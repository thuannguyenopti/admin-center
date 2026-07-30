"use client";

import React, {useMemo, useState, useCallback} from "react";
import {
	Box,
	SearchInput,
	Menu,
	MenuTrigger,
	LabelMenuButton,
	MenuContent,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogBody,
	DialogFooter,
	DialogClose,
	Field,
	Input,
	Select,
	SelectTrigger,
	SelectContent,
	Textarea,
	Link,
	Badge,
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@optiaxiom/react";
import {Flex} from "@/app/components/Flex";
import {Button} from "@/app/components/Button";
import {Table, Tr, Th, Td} from "@/app/components/Table";
import {Text} from "@/app/components/Text";
import {
	initialContentTypes,
	ContentType,
	MediaType,
} from "@/app/db/initialData";
import {useRouter} from "next/navigation";
import {IconChevronDown, IconBox, IconUpload, IconBlocks, IconSection, IconCloudDownload, IconPlus} from "@/app/lib/axiom-icons";
import {IconFile, IconImage, IconColumns3, IconPaintRoller} from "@optimizely/axiom-icons";

const MEDIA_TYPE_OPTIONS: {label: MediaType; extensions: string}[] = [
	{label: "Image", extensions: "jpg, png, webp, svg"},
	{label: "Video", extensions: "mp4, avi, mov, wmv, webm"},
	{label: "Audio", extensions: "mp3, wav, AAC, FLAC"},
	{label: "Documents", extensions: "pdf, epub, txt, docx, rtf, xls"},
	{label: "Archives", extensions: "zip, rar, tar.gz"},
	{label: "Web Files", extensions: "html, htm, css, js, aspx"},
	{label: "Program Files", extensions: "exe, dmg, dll, bat, deb, iso"},
];
import usePersistentState from "@/app/usePersistentState";
import {toIsolatedStoryUrl, deriveVariantStoryUrl, iframeStyleForTileSize} from "@/app/components/PreviewCard";
import {STORY_SIZES} from "@/app/components/vb/storySizes";
import {BLOCK_SCHEMAS} from "@/app/components/vb/blocks/schemas";

type BaseType = ContentType["baseType"];

const BASE_TYPE_OPTIONS: {
	label: string;
	value: BaseType;
	icon: React.ReactNode;
	description: string;
}[] = [
	{
		label: "Page Type",
		value: "Page",
		icon: <IconFile size={16} />,
		description: "Content that can be displayed with a template and unique URL.",
	},
	{
		label: "Block Type",
		value: "Block",
		icon: <IconBlocks size={16} />,
		description: "Re-usable content that can be displayed with a template. But it has no URL.",
	},
	{
		label: "Section Type",
		value: "Section",
		icon: <IconSection size={16} />,
		description: "Structural content used to organize and group other content types.",
	},
	{
		label: "Media Type",
		value: "Media",
		icon: <IconImage size={16} />,
		description: "Content that contains a media file, either from a DAM or uploaded in CMS.",
	},
	{
		label: "Experience Type",
		value: "Experience",
		icon: <IconColumns3 size={16} />,
		description: "Personalized content experiences with A/B testing and targeting.",
	},
	{
		label: "Product Type",
		value: "Product",
		icon: <IconBox size={16} />,
		description: "Product catalog items with variants and pricing.",
	},
];

const generateContentTypeId = (): string => {
	return `ct-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
};

function ElementGridCard({
	ct,
	storybookUrl,
	onClick,
}: {
	ct: ContentType;
	storybookUrl: string | null;
	onClick: () => void;
}) {
	const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
	const [popoverOpen, setPopoverOpen] = useState(false);

	const styleList = useMemo(() => {
		if (!BLOCK_SCHEMAS[ct.id]) return [];
		const baseLabel = BLOCK_SCHEMAS[ct.id]?.displayLabel ?? "default";
		const variants = Object.entries(BLOCK_SCHEMAS)
			.filter(([, s]) => s.variantOf === ct.id)
			.map(([id, s]) => ({id, label: s.displayLabel ?? s.templateValue ?? id}));
		if (!variants.length) return [];
		return [{id: ct.id, label: baseLabel}, ...variants];
	}, [ct.id]);

	const hasStyles = styleList.length > 1;

	const activeIframeUrl = useMemo(() => {
		if (!storybookUrl) return null;
		const base = toIsolatedStoryUrl(storybookUrl);
		if (!selectedStyle) return base;
		const templateValue = BLOCK_SCHEMAS[selectedStyle]?.templateValue;
		return templateValue ? deriveVariantStoryUrl(base, templateValue) : base;
	}, [storybookUrl, selectedStyle]);

	const handleWheel = useCallback(
		(e: React.WheelEvent) => {
			if (!hasStyles) return;
			const activeId = selectedStyle ?? ct.id;
			const idx = styleList.findIndex((s) => s.id === activeId);
			const dir = e.deltaY > 0 ? 1 : -1;
			const next = styleList[(idx + dir + styleList.length) % styleList.length];
			setSelectedStyle(next.id === ct.id ? null : next.id);
		},
		[hasStyles, selectedStyle, styleList, ct.id]
	);

	return (
		<Box
			rounded="md"
			onClick={onClick}
			onWheel={handleWheel}
			style={{
				border: "1px solid var(--ax-colors-border-default)",
				overflow: "hidden",
				cursor: "pointer",
				background: "var(--ax-colors-bg-default)",
			}}
		>
			<Box
				px="10"
				py="8"
				style={{borderBottom: "1px solid var(--ax-colors-border-default)"}}
			>
				<Text
					fontSize="sm"
					fontWeight="600"
					style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}
				>
					{ct.displayName}
				</Text>
			</Box>
			<Box
				style={{
					position: "relative",
					height: 220,
					background: "var(--ax-colors-bg-page)",
				}}
			>
				{activeIframeUrl ? (
					<iframe
						src={activeIframeUrl}
						title={ct.displayName}
						style={iframeStyleForTileSize(200, 220, STORY_SIZES[ct.id])}
					/>
				) : (
					<Box
						display="flex"
						alignItems="center"
						justifyContent="center"
						style={{height: "100%"}}
					>
						<IconBlocks size={32} style={{color: "var(--ax-colors-fg-tertiary)"}} />
					</Box>
				)}
				{hasStyles && (
					<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
						<PopoverTrigger asChild>
							<Button
								size="sm"
								appearance="subtle"
								icon={<IconPaintRoller />}
								aria-label="Select style"
								style={{position: "absolute", bottom: 8, right: 8}}
								onClick={(e: React.MouseEvent) => e.stopPropagation()}
							/>
						</PopoverTrigger>
						<PopoverContent
							side="bottom"
							align="end"
							sideOffset={4}
							onClick={(e: React.MouseEvent) => e.stopPropagation()}
							style={{padding: 4, width: "auto", maxWidth: "none"}}
						>
							{styleList.map((s) => {
								const isActive = selectedStyle ? s.id === selectedStyle : s.id === ct.id;
								return (
									<Text
										key={s.id}
										fontSize="md"
										onClick={() => {
											setSelectedStyle(s.id === ct.id ? null : s.id);
											setPopoverOpen(false);
										}}
										style={{
											padding: "8px 12px",
											cursor: "pointer",
											borderRadius: 6,
											minWidth: 140,
											whiteSpace: "nowrap",
											color: "var(--ax-colors-fg-default)",
											background: isActive
												? "var(--ax-colors-bg-default-pressed)"
												: undefined,
										}}
										className="hover:bg-[var(--ax-colors-bg-default-hovered)]"
									>
										{s.label}
									</Text>
								);
							})}
						</PopoverContent>
					</Popover>
				)}
			</Box>
		</Box>
	);
}

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

export default function ContentTypesSettings() {
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState<string | null>(null);
	const [accessFilter, setAccessFilter] = useState<string | null>(null);
	const [sourceFilter, setSourceFilter] = useState<string | null>(null);

	// Dialog state
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogBaseType, setDialogBaseType] = useState<BaseType>("Page");
	const [dialogName, setDialogName] = useState("");
	const [dialogDisplayName, setDialogDisplayName] = useState("");
	const [dialogDescription, setDialogDescription] = useState("");
	const [dialogMediaType, setDialogMediaType] = useState<MediaType | null>(null);
	const [nameManuallyEdited, setNameManuallyEdited] = useState(false);
	const [showNameField, setShowNameField] = useState(false);

	// Persistent content types
	const [savedContentTypes, setContentTypes] = usePersistentState(
		"contentTypes",
		initialContentTypes
	) as [ContentType[], (value: ContentType[]) => void];
	const [generatedArtifacts] = usePersistentState("opal:artifacts:generated", []) as [any[]];

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

	const accessLevelOptions = [
		{label: "Everyone", value: "Everyone"},
		{label: "Admins", value: "Admins"},
	];
	const onAccessLevelChange = (value: string) => {
		setAccessFilter(value);
	};

	const currentAccessLevel =
		accessLevelOptions.find((opt) => opt.value === accessFilter) || accessLevelOptions[0];

	const typeOptions = [
		{label: "All Types", value: null},
		{label: "Page", value: "Page"},
		{label: "Experience", value: "Experience"},
		{label: "Block", value: "Block"},
		{label: "Section", value: "Section"},
		{label: "Product", value: "Product"},
		{label: "Media", value: "Media"},
		{label: "Elements", value: "Elements"},
	];
	const onTypesChange = (value: string | null) => {
		setTypeFilter(value);
	};
	const currentType = typeOptions.find((opt) => opt.value === typeFilter) || typeOptions[0];

	const sourceOptions = [
		{label: "All Sources", value: null},
		{label: "CMS", value: "cms"},
		{label: "CMP", value: "cmp"},
	];
	const onSourceChange = (value: string | null) => {
		setSourceFilter(value);
	};
	const currentSource =
		sourceOptions.find((opt) => opt.value === sourceFilter) || sourceOptions[0];

	const filtered = useMemo(() => {
		return contentTypes.filter((ct) => {
			// Source filter
			if (sourceFilter) {
				const ctSource = ct.source || "cms"; // Treat undefined as "cms"
				if (ctSource !== sourceFilter) return false;
			}

			if (search && !ct.name.toLowerCase().includes(search.toLowerCase())) return false;

			// Type filter (including Elements)
			if (typeFilter === "Elements") {
				if (!ct.availableForComposition || !ct.compositionDisplayAs?.includes("Element")) {
					return false;
				}
			} else if (typeFilter) {
				if (ct.baseType !== typeFilter) return false;
			}

			if (accessFilter) {
				if (accessFilter !== "Everyone") return false;
			}
			return true;
		});
	}, [contentTypes, search, typeFilter, accessFilter, sourceFilter]);

	const storybookLinksByName = useMemo(() => {
		const registryArtifact = Array.isArray(generatedArtifacts)
			? generatedArtifacts.find((artifact) => artifact?.id === "stride-cms-registry-artifact")
			: null;

		if (!registryArtifact?.previewText || typeof registryArtifact.previewText !== "string") {
			return new Map<string, string>();
		}

		try {
			const parsed = JSON.parse(registryArtifact.previewText) as {
				registry?: Record<string, {"storybook url"?: string}>;
			};

			if (!parsed.registry || typeof parsed.registry !== "object") {
				return new Map<string, string>();
			}

			const normalize = (value: string) =>
				value
					.trim()
					.toLowerCase()
					.replace(/[^a-z0-9]/g, "");
			return new Map(
				Object.entries(parsed.registry)
					.filter(([, entry]) => typeof entry?.["storybook url"] === "string")
					.map(([name, entry]) => [normalize(name), entry["storybook url"] as string])
			);
		} catch {
			return new Map<string, string>();
		}
	}, [generatedArtifacts]);

	const getStorybookUrl = useCallback(
		(contentType: ContentType) => {
			const normalize = (value: string) =>
				value
					.trim()
					.toLowerCase()
					.replace(/[^a-z0-9]/g, "");
			const candidates = [
				contentType.displayName,
				contentType.name,
				contentType.displayName?.replace(/\s+Page$/i, ""),
				contentType.displayName?.replace(/\s+Block$/i, ""),
				contentType.name?.replace(/_?page$/i, ""),
				contentType.name?.replace(/_?block$/i, ""),
			].filter((value): value is string => Boolean(value));

			for (const candidate of candidates) {
				const key = normalize(candidate);
				const exact = storybookLinksByName.get(key);
				if (exact) return exact;
				// Prefix match (e.g. "hero" → "herodefault", "heading" → "headingh1")
				const prefixMatches = [...storybookLinksByName.entries()].filter(([k]) => k.startsWith(key));
				if (prefixMatches.length > 0) {
					prefixMatches.sort(([a], [b]) =>
						a.endsWith("default") ? -1 : b.endsWith("default") ? 1 : a.localeCompare(b),
					);
					return prefixMatches[0][1];
				}
			}

			return null;
		},
		[storybookLinksByName]
	);

	const handleRowClick = (contentType: ContentType) => {
		router.push(`/cms/settings/content-types/${contentType.id}/properties`);
	};

	const openCreateDialog = useCallback((baseType: BaseType) => {
		setDialogBaseType(baseType);
		setDialogName("");
		setDialogDisplayName("");
		setDialogDescription("");
		setDialogMediaType(null);
		setNameManuallyEdited(false);
		setShowNameField(false);
		setDialogOpen(true);
	}, []);

	const autoName = nameManuallyEdited ? dialogName : toSystemName(dialogDisplayName);

	const handleCreate = useCallback(() => {
		if (!dialogDisplayName.trim()) return;

		const finalName = nameManuallyEdited ? dialogName.trim() : toSystemName(dialogDisplayName);

		const newContentType: ContentType = {
			id: generateContentTypeId(),
			name: finalName || toSystemName(dialogDisplayName),
			displayName: dialogDisplayName.trim(),
			baseType: dialogBaseType,
			...(dialogBaseType === "Media" && dialogMediaType ? {mediaType: dialogMediaType} : {}),
			description: dialogDescription.trim() || undefined,
			properties: [],
			modifiedAt: new Date().toISOString(),
		};

		const updated = [...contentTypes, newContentType];
		setContentTypes(updated);
		setDialogOpen(false);
		router.push(`/cms/settings/content-types/${newContentType.id}/properties`);
	}, [
		dialogName,
		dialogDisplayName,
		dialogBaseType,
		dialogDescription,
		contentTypes,
		setContentTypes,
		router,
	]);

	const baseTypeLabel =
		BASE_TYPE_OPTIONS.find((o) => o.value === dialogBaseType)?.label || dialogBaseType;

	return (
		<>
			<Box display="flex" alignItems="center" gap="8" mb="16">
				<SearchInput
					size="lg"
					placeholder="Filter by name"
					value={search}
					onChange={(e: any) => setSearch(e.target.value)}
				/>

				{/* Type Filter */}
				<Menu
					options={typeOptions.map((opt) => ({
						label: opt.label,
						execute: () => onTypesChange(opt.value),
					}))}
				>
					<MenuTrigger asChild>
						<LabelMenuButton label="Type" h="40">
							{currentType?.label}
						</LabelMenuButton>
					</MenuTrigger>
					<MenuContent />
				</Menu>

				{/* Access Level Filter */}
				<Menu
					options={accessLevelOptions.map((opt) => ({
						label: opt.label,
						execute: () => onAccessLevelChange(opt.value),
					}))}
				>
					<MenuTrigger asChild>
						<LabelMenuButton label="Access Level" h="40">
							{currentAccessLevel?.label}
						</LabelMenuButton>
					</MenuTrigger>
					<MenuContent />
				</Menu>

				{/* Source Filter */}
				<Menu
					options={sourceOptions.map((opt) => ({
						label: opt.label,
						execute: () => onSourceChange(opt.value),
					}))}
				>
					<MenuTrigger asChild>
						<LabelMenuButton label="Source" h="40">
							{currentSource?.label}
						</LabelMenuButton>
					</MenuTrigger>
					<MenuContent />
				</Menu>

				<Box flex="1" />

				{/* Create Content Type Dropdown */}
				<Menu
					options={[
						{
							label: "Generate from File(s)…",
							addon: <IconUpload size={16} />,
							description: "Generate content types from uploaded files",
							execute: () => {},
						},
						...BASE_TYPE_OPTIONS.map((opt) => ({
							label: opt.label,
							addon: opt.icon,
							description: opt.description,
							execute: () => openCreateDialog(opt.value),
						})),
						{
							label: "Connect From Graph",
							addon: <IconCloudDownload size={16} />,
							description: "Import content types from a knowledge graph",
							execute: () => {},
						},
					]}
				>
					<MenuTrigger asChild>
						<Button
							appearance="primary"
							icon={<IconPlus />}
							addonAfter={<IconChevronDown size={20} />}
							h="40"
						>
							Create Content Type
						</Button>
					</MenuTrigger>
					<MenuContent />
				</Menu>
			</Box>

			{typeFilter === "Elements" ? (
				filtered.length === 0 ? (
					<Box mt="16">
						<Text color="fg.secondary">No elements found.</Text>
					</Box>
				) : (
					<Box
						mt="16"
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
							gap: "16px",
						}}
					>
						{filtered.map((ct) => (
							<ElementGridCard
								key={ct.id}
								ct={ct}
								storybookUrl={getStorybookUrl(ct)}
								onClick={() => handleRowClick(ct)}
							/>
						))}
					</Box>
				)
			) : (
				<>
					<Table>
						<thead>
							<Tr>
								<Th>Display Name</Th>
								<Th>Base Type</Th>
								<Th>Modified</Th>
								<Th>Access Level</Th>
								<Th />
							</Tr>
						</thead>
						<tbody>
							{filtered.map((ct) => {
								return (
									<Tr
										key={ct.id}
										onClick={() => handleRowClick(ct)}
										style={{cursor: "pointer"}}
									>
										<Td type="header">
											<Box display="flex" alignItems="center" gap="8">
												{ct.displayName}
												{ct.source === "cmp" && (
													<Badge intent="neutral" variant="subtle">
														CMP
													</Badge>
												)}
											</Box>
										</Td>
										<Td>{ct.baseType}</Td>
										<Td>
											{ct.modifiedAt
												? new Date(ct.modifiedAt).toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
														year: "numeric",
													})
												: "Jan 13, 2024"}
										</Td>
										<Td>Everyone</Td>
										<Td type="button" data={() => console.log("actions for", ct.id)}>
											<></>
										</Td>
									</Tr>
								);
							})}
						</tbody>
					</Table>

					{filtered.length === 0 && (
						<Box mt="16">
							<Text color="fg.secondary">No content types found.</Text>
						</Box>
					)}
				</>
			)}

			{/* Create Content Type Dialog */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent size="md">
					<DialogHeader>Create {baseTypeLabel}</DialogHeader>
					<DialogBody>
						<Flex flexDirection="column" gap="24">
							<Box>
								<Field label="Display Name" required>
									<Input
										value={dialogDisplayName}
										onChange={(e) => {
											setDialogDisplayName(e.target.value);
											if (!nameManuallyEdited) {
												setDialogName(toSystemName(e.target.value));
											}
										}}
										placeholder=""
									/>
								</Field>
								<Text fontSize="sm" color="fg.tertiary" mt="4">
									{dialogDisplayName.trim() ? (
										<>
											Name: {autoName} (
											<Link asChild>
												<button onClick={() => setShowNameField(true)}>
													change
												</button>
											</Link>
											)
										</>
									) : (
										<>
											Name generated from Display Name (
											<Link asChild>
												<button onClick={() => setShowNameField(true)}>
													change
												</button>
											</Link>
											)
										</>
									)}
								</Text>
							</Box>

							{showNameField && (
								<Field label="Name">
									<Input
										value={nameManuallyEdited ? dialogName : autoName}
										onChange={(e) => {
											setDialogName(e.target.value);
											setNameManuallyEdited(true);
										}}
										placeholder=""
									/>
								</Field>
							)}

							<Field label="Description">
								<Textarea
									value={dialogDescription}
									onChange={(e) => setDialogDescription(e.target.value)}
									placeholder=""
									rows={4}
								/>
							</Field>

							{dialogBaseType === "Media" && (
								<Field label="Media Type" required>
									<Select
										value={dialogMediaType ?? ""}
										onValueChange={(value) =>
											setDialogMediaType(value as MediaType)
										}
										options={MEDIA_TYPE_OPTIONS.map((opt) => ({
											label: `${opt.label} (${opt.extensions})`,
											value: opt.label,
										}))}
									>
										<SelectTrigger placeholder="Select media type" />
										<SelectContent />
									</Select>
								</Field>
							)}
						</Flex>
					</DialogBody>
					<DialogFooter>
						<Flex
							flexDirection="row"
							w="full"
							justifyContent="space-between"
							alignItems="center"
						>
							<Text color="fg.error" fontSize="sm">
								* Required Field
							</Text>
							<Flex flexDirection="row" gap="8">
								<DialogClose appearance="subtle" size="lg">
									Cancel
								</DialogClose>
								<Button
									appearance="primary"
									size="lg"
									onClick={handleCreate}
									disabled={
										!dialogDisplayName.trim() ||
										(dialogBaseType === "Media" && !dialogMediaType)
									}
								>
									Create {baseTypeLabel}
								</Button>
							</Flex>
						</Flex>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
