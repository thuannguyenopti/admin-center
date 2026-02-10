"use client";

import { useMemo, useState, useCallback } from "react";
import {
	Box,
	Heading,
	SearchInput,
	Menu,
	MenuTrigger,
	LabelMenuButton,
	MenuContent,
	Flex,
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
	Separator,
	Link,
} from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { Text } from "@/app/components/Text";
import { initialContentTypes, ContentType, Property, MediaType } from "@/app/db/initialData";
import { useRouter } from "next/navigation";
import { IconChevronDown } from "@tabler/icons-react";
import {
	IconFilePlus,
	IconFile,
	IconLayoutGrid,
	IconPhoto,
	IconBox,
	IconColumns,
	IconCloudDownload,
} from "@tabler/icons-react";

const MEDIA_TYPE_OPTIONS: { label: MediaType; extensions: string }[] = [
	{ label: "Image", extensions: "jpg, png, webp, svg" },
	{ label: "Video", extensions: "mp4, avi, mov, wmv, webm" },
	{ label: "Audio", extensions: "mp3, wav, AAC, FLAC" },
	{ label: "Documents", extensions: "pdf, epub, txt, docx, rtf, xls" },
	{ label: "Archives", extensions: "zip, rar, tar.gz" },
	{ label: "Web Files", extensions: "html, htm, css, js, aspx" },
	{ label: "Program Files", extensions: "exe, dmg, dll, bat, deb, iso" },
];
import usePersistentState from "@/app/usePersistentState";

type BaseType = ContentType["baseType"];

const BASE_TYPE_OPTIONS: { label: string; value: BaseType; icon: React.ReactNode; description: string }[] = [
	{ label: "Page Type", value: "Page", icon: <IconFile size={20} />, description: "Content that can be displayed with a template and unique URL." },
	{ label: "Block Type", value: "Block", icon: <IconLayoutGrid size={20} />, description: "Re-usable content that can be displayed with a template. But it has no URL." },
	{ label: "Media Type", value: "Media", icon: <IconPhoto size={20} />, description: "Content that contains a media file, either from a DAM or uploaded in CMS." },
	{ label: "Experience Type", value: "Experience", icon: <IconColumns size={20} />, description: "Lorem ipsum" },
	{ label: "Product Type", value: "Product", icon: <IconBox size={20} />, description: "Lorem ipsum" },
];

const generateContentTypeId = (): string => {
	return `ct-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
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

export default function ContentTypesSettings() {
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState<string | null>(null);
	const [accessFilter, setAccessFilter] = useState<string | null>(null);

	// Dialog state
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogBaseType, setDialogBaseType] = useState<BaseType>("Page");
	const [dialogName, setDialogName] = useState("");
	const [dialogDisplayName, setDialogDisplayName] = useState("");
	const [dialogDescription, setDialogDescription] = useState("");
	const [dialogExtensions, setDialogExtensions] = useState("");
	const [dialogMediaType, setDialogMediaType] = useState<MediaType | null>(null);
	const [nameManuallyEdited, setNameManuallyEdited] = useState(false);
	const [showNameField, setShowNameField] = useState(false);

	// Persistent content types
	const [savedContentTypes, setContentTypes] = usePersistentState("contentTypes", initialContentTypes) as [ContentType[], (value: ContentType[]) => void];

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
		{ label: "Everyone", value: "Everyone" },
		{ label: "Admins", value: "Admins" },
	];
	const onAccessLevelChange = (value: string) => {
		setAccessFilter(value);
	};

	const currentAccessLevel = accessLevelOptions.find((opt) => opt.value === accessFilter) || accessLevelOptions[0];

	const typeOptions = [
		{ label: "All Types", value: null },
		{ label: "Page", value: "Page" },
		{ label: "Experience", value: "Experience" },
		{ label: "Block", value: "Block" },
		{ label: "Product", value: "Product" },
		{ label: "Media", value: "Media" },
	];
	const onTypesChange = (value: string | null) => {
		setTypeFilter(value);
	};
	const currentType = typeOptions.find((opt) => opt.value === typeFilter) || typeOptions[0];

	const filtered = useMemo(() => {
		return contentTypes.filter((ct) => {
			if (search && !ct.name.toLowerCase().includes(search.toLowerCase())) return false;
			if (typeFilter) {
				if (ct.baseType !== typeFilter) return false;
			}
			if (accessFilter) {
				if (accessFilter !== "Everyone") return false;
			}
			return true;
		});
	}, [contentTypes, search, typeFilter, accessFilter]);

	const handleRowClick = (contentType: ContentType) => {
		router.push(`/cms/settings/content-types/${contentType.id}/properties`);
	};

	const openCreateDialog = useCallback((baseType: BaseType) => {
		setDialogBaseType(baseType);
		setDialogName("");
		setDialogDisplayName("");
		setDialogDescription("");
		setDialogExtensions("");
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
			...(dialogBaseType === "Media" && dialogMediaType ? { mediaType: dialogMediaType } : {}),
			description: dialogDescription.trim() || undefined,
			properties: [],
			modifiedAt: new Date().toISOString(),
		};

		const updated = [...contentTypes, newContentType];
		setContentTypes(updated);
		setDialogOpen(false);
		router.push(`/cms/settings/content-types/${newContentType.id}/properties`);
	}, [dialogName, dialogDisplayName, dialogBaseType, dialogDescription, contentTypes, setContentTypes, router]);

	const baseTypeLabel = BASE_TYPE_OPTIONS.find((o) => o.value === dialogBaseType)?.label || dialogBaseType;

	return (
		<>
			<Box display="flex" alignItems="center" gap="8" mb="16">
				<SearchInput size="lg" placeholder="Filter by name" value={search} onChange={(e: any) => setSearch(e.target.value)} />

				{/* Type Filter */}
				<Menu options={typeOptions.map((opt) => ({ label: opt.label, execute: () => onTypesChange(opt.value) }))}>
					<MenuTrigger asChild>
						<LabelMenuButton label="Base Type" h="40">
							{currentType?.label}
						</LabelMenuButton>
					</MenuTrigger>
					<MenuContent />
				</Menu>

				{/* Access Level Filter */}
				<Menu options={accessLevelOptions.map((opt) => ({ label: opt.label, execute: () => onAccessLevelChange(opt.value) }))}>
					<MenuTrigger asChild>
						<LabelMenuButton label="Access Level" h="40">
							{currentAccessLevel?.label}
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
							execute: () => { },
						},
						...BASE_TYPE_OPTIONS.map((opt) => ({
							label: opt.label,
							execute: () => openCreateDialog(opt.value),
						})),
						{
							label: "Connect From Graph",
							execute: () => { },
						},
					]}
				>
					<MenuTrigger asChild>
						<Button appearance="primary">
							<Flex flexDirection="row" alignItems="center" gap="4">
								Create Content Type
								<IconChevronDown size={16} />
							</Flex>
						</Button>
					</MenuTrigger>
					<MenuContent />
				</Menu>
			</Box>

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
								style={{ cursor: "pointer" }}
							>
								<Td type="header">{ct.displayName || ct.name}</Td>
								<Td>{ct.baseType}</Td>
								<Td>{ct.modifiedAt ? new Date(ct.modifiedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Jan 13, 2024"}</Td>
								<Td>Everyone</Td>
								<Td type="button" data={() => console.log('actions for', ct.id)}>
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
									{dialogDisplayName.trim()
										? <>Name: {autoName} (<Link asChild><button onClick={() => setShowNameField(true)}>change</button></Link>)</>
										: <>Name generated from Display Name (<Link asChild><button onClick={() => setShowNameField(true)}>change</button></Link>)</>
									}
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
										onValueChange={(value) => setDialogMediaType(value as MediaType)}
										options={MEDIA_TYPE_OPTIONS.map((opt) => ({ label: `${opt.label} (${opt.extensions})`, value: opt.label }))}
									>
										<SelectTrigger placeholder="Select media type" />
										<SelectContent />
									</Select>
								</Field>
							)}
						</Flex>
					</DialogBody>
					<DialogFooter>
						<Flex flexDirection="row" w="full" justifyContent="space-between" alignItems="center">
							<Text color="fg.error" fontSize="sm">* Required Field</Text>
							<Flex flexDirection="row" gap="8">
								<DialogClose appearance="subtle" size="lg">Cancel</DialogClose>
								<Button
									appearance="primary"
									size="lg"
									onClick={handleCreate}
									disabled={!dialogDisplayName.trim() || (dialogBaseType === "Media" && !dialogMediaType)}
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
