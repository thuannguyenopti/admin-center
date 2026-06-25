"use client";

import {useMemo, useState, useCallback, useEffect} from "react";
import {
	Alert,
	Box,
	Heading,
	Field,
	Input,
	Textarea,
	Checkbox,
	Separator,
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogAction,
	AlertDialogCancel,
} from "@optiaxiom/react";
import {Flex} from "@/app/components/Flex";
import {Text} from "@/app/components/Text";
import {Button} from "@/app/components/Button";
import {
	initialContentTypes,
	initialPages,
	ContentType,
	CompositionDisplayAs,
	Page,
} from "@/app/db/initialData";
import {useParams, useRouter} from "next/navigation";
import {use} from "react";
import usePersistentState from "@/app/usePersistentState";
import {Footer} from "@/app/context/LayoutContext";
import Flow from "@/app/components/Flow";
import {LinkStyle} from "@/app/components/LinkStyle";

export default function ContentTypeSettingsPage() {
	const params = useParams();
	const router = useRouter();
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

	// Local form state
	const [name, setName] = useState(contentType?.name || "");
	const [displayName, setDisplayName] = useState(contentType?.displayName || "");
	const [description, setDescription] = useState(contentType?.description || "");
	const [sortOrder, setSortOrder] = useState(contentType?.sortOrder ?? 0);
	const [isAvailable, setIsAvailable] = useState(contentType?.isAvailable ?? true);
	const [availableForComposition, setAvailableForComposition] = useState(
		contentType?.availableForComposition ?? false
	);
	const [compositionDisplayAs, setCompositionDisplayAs] = useState<CompositionDisplayAs[]>(
		contentType?.compositionDisplayAs ?? []
	);
	const [componentDocsUrl, setComponentDocsUrl] = useState(contentType?.componentDocsUrl ?? "");

	// Registry artifact mapping
	const [generatedArtifacts] = usePersistentState("opal:artifacts:generated", []) as [
		Array<{id: string; previewText?: string}>,
		unknown,
		boolean,
	];

	const registryMapping = useMemo(() => {
		const artifact = generatedArtifacts.find((a) => a.id === "stride-cms-registry-artifact");
		if (!artifact?.previewText) return null;
		try {
			const parsed = JSON.parse(artifact.previewText) as {
				registry?: Record<string, {"cms element type"?: string; "storybook url"?: string}>;
			};
			if (!parsed.registry) return null;
			for (const [name, entry] of Object.entries(parsed.registry)) {
				if (entry["cms element type"] === id) {
					return {name, storybookUrl: entry["storybook url"] ?? null};
				}
			}
		} catch {}
		return null;
	}, [generatedArtifacts, id]);

	// Delete dialog
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	// Sync form with contentType on mount and when contentType changes
	useEffect(() => {
		if (contentType) {
			setName(contentType.name || "");
			setDisplayName(contentType.displayName || "");
			setDescription(contentType.description || "");
			setSortOrder(contentType.sortOrder ?? 0);
			setIsAvailable(contentType.isAvailable ?? true);
			setAvailableForComposition(contentType.availableForComposition ?? false);
			setCompositionDisplayAs(contentType.compositionDisplayAs ?? []);
			setComponentDocsUrl(contentType.componentDocsUrl ?? "");
		}
	}, [contentType]);

	// Check if form has unsaved changes
	const hasChanges = useMemo(() => {
		if (!contentType) return false;
		return (
			name !== (contentType.name || "") ||
			displayName !== (contentType.displayName || "") ||
			description !== (contentType.description || "") ||
			sortOrder !== (contentType.sortOrder ?? 0) ||
			isAvailable !== (contentType.isAvailable ?? true) ||
			availableForComposition !== (contentType.availableForComposition ?? false) ||
			JSON.stringify(compositionDisplayAs) !==
				JSON.stringify(contentType.compositionDisplayAs ?? []) ||
			componentDocsUrl !== (contentType.componentDocsUrl ?? "")
		);
	}, [
		contentType,
		name,
		displayName,
		description,
		sortOrder,
		isAvailable,
		availableForComposition,
		compositionDisplayAs,
		componentDocsUrl,
	]);

	// Content items using this content type
	const contentItemsUsingType = useMemo(() => {
		return initialPages.filter((page: Page) => page.contentTypeId === id);
	}, [id]);

	// Toggle composition display option
	const toggleDisplayAs = useCallback((option: CompositionDisplayAs) => {
		setCompositionDisplayAs((prev) =>
			prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
		);
	}, []);

	// Save handler
	const handleSave = useCallback(() => {
		if (!contentTypes || !contentType) return;

		const updatedContentTypes = contentTypes.map((ct: ContentType) =>
			ct.id === id
				? {
						...ct,
						name: name.trim() || ct.name,
						displayName: displayName.trim() || name.trim() || ct.name,
						description: description.trim() || undefined,
						sortOrder,
						isAvailable,
						availableForComposition,
						compositionDisplayAs: availableForComposition ? compositionDisplayAs : [],
						componentDocsUrl: availableForComposition
							? componentDocsUrl.trim() || undefined
							: undefined,
						modifiedAt: new Date().toISOString(),
					}
				: ct
		);

		setContentTypes(updatedContentTypes);
	}, [
		contentTypes,
		contentType,
		id,
		name,
		displayName,
		description,
		sortOrder,
		isAvailable,
		availableForComposition,
		compositionDisplayAs,
		componentDocsUrl,
		setContentTypes,
	]);

	// Delete handler
	const handleDelete = useCallback(() => {
		if (!contentTypes) return;

		const updatedContentTypes = contentTypes.filter((ct: ContentType) => ct.id !== id);
		setContentTypes(updatedContentTypes);
		setDeleteDialogOpen(false);
		router.push("/cms/settings/content-types");
	}, [contentTypes, id, setContentTypes, router]);

	if (!contentType) {
		return (
			<Box flex="1">
				<Text color="fg.error">Content type not found</Text>
			</Box>
		);
	}

	const ctDisplayLabel = contentType.displayName;

	return (
		<>
			<Flow maxW="lg">
				{registryMapping && (
					<Alert intent="information">
						<Flow>
							{registryMapping.name} is mapped to this type in the{" "}
							<LinkStyle href="/opal/artifacts?openArtifactId=stride-cms-registry-artifact">
								Component Registry
							</LinkStyle>
							{registryMapping.storybookUrl && (
								<>
									{" · "}
									<LinkStyle href={registryMapping.storybookUrl} external>
										View in Storybook
									</LinkStyle>
								</>
							)}
						</Flow>
					</Alert>
				)}

				{/* Content Type Details */}
				<Heading level="4">Content Type Details</Heading>
				<Field label="Name" required>
					<Input value={name} onChange={(e) => setName(e.target.value)} disabled />
				</Field>
				<Field label="Display name">
					<Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
				</Field>
				<Field label="Description">
					<Textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						rows={3}
					/>
				</Field>
				<Field label="Sort index">
					<Input
						type="number"
						value={String(sortOrder)}
						onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
					/>
				</Field>
				<Field>
					<Checkbox
						checked={isAvailable}
						onCheckedChange={(checked) => setIsAvailable(checked === true)}
					>
						Available in edit view
					</Checkbox>
				</Field>
				<Field>
					<Checkbox
						checked={availableForComposition}
						onCheckedChange={(checked) => setAvailableForComposition(checked === true)}
					>
						Available for composition in Visual Builder
					</Checkbox>
				</Field>

				{/* Display as sub-options */}
				<Field label="Display as" required ml="32">
					<Flex flexDirection="column" gap="8">
						<Box>
							<Checkbox
								checked={compositionDisplayAs.includes("Section")}
								onCheckedChange={() => toggleDisplayAs("Section")}
								disabled={!availableForComposition}
								description="The block will be displayed as a section."
								aria-describedby="section-description"
							>
								Section
							</Checkbox>
						</Box>
						<Box>
							<Checkbox
								checked={compositionDisplayAs.includes("Element")}
								onCheckedChange={() => toggleDisplayAs("Element")}
								disabled={!availableForComposition}
								description="The block will be displayed as an element."
								aria-describedby="element-description"
							>
								Element
							</Checkbox>
						</Box>
						<Box>
							<Checkbox
								checked={compositionDisplayAs.includes("FormElement")}
								onCheckedChange={() => toggleDisplayAs("FormElement")}
								disabled={!availableForComposition}
								description="The block will be displayed as a form element."
								aria-describedby="form-element-description"
							>
								Form element
							</Checkbox>
						</Box>
					</Flex>
				</Field>

				<Separator />

				{/* Delete Content Type */}
				<Heading level="4">Delete Content Type</Heading>
				<Text color="fg.secondary">
					This will permanently remove &apos;{ctDisplayLabel}&apos; content type and
					cannot be undone.
				</Text>
				<Button appearance="danger" onClick={() => setDeleteDialogOpen(true)}>
					Delete Content Type
				</Button>
			</Flow>

			{/* Fixed Save Footer */}
			<Footer>
				<Button appearance="primary" onClick={handleSave} disabled={!hasChanges}>
					Save
				</Button>
			</Footer>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>Delete Content Type</AlertDialogHeader>
					<AlertDialogBody>
						{contentItemsUsingType.length > 0 ? (
							<Box>
								<Text mb="12">
									Are you sure you want to delete{" "}
									<strong>{ctDisplayLabel}</strong>? This content type is used by{" "}
									{contentItemsUsingType.length} content{" "}
									{contentItemsUsingType.length === 1 ? "item" : "items"}:
								</Text>
								<Box
									p="12"
									rounded="md"
									bg="bg.secondary"
									style={{maxHeight: "200px", overflowY: "auto"}}
								>
									{contentItemsUsingType.map((item) => (
										<Text key={item.id} fontSize="sm" py="4">
											{item.name}
										</Text>
									))}
								</Box>
							</Box>
						) : (
							<Text>
								Are you sure you want to permanently delete{" "}
								<strong>{ctDisplayLabel}</strong>? This action cannot be undone.
							</Text>
						)}
					</AlertDialogBody>
					<AlertDialogFooter>
						<AlertDialogCancel />
						<AlertDialogAction appearance="danger" onClick={handleDelete}>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
