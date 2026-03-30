"use client";

import { Box, Field, Input, Card, Button, CardPreview, CardImage, CardHeader, Menu, MenuTrigger, MenuContent, EllipsisMenuButton } from "@optiaxiom/react";
import { IconPencil, IconTrash, IconPhoto } from "@tabler/icons-react";
import { PropertyRendererProps } from "../types";
import { AIInputField } from "@/app/components/ai/AIInputField";
import { PropertyRenderer } from "../PropertyRenderer";
import { Property } from "@/app/db/initialData";
import { useState, useMemo } from "react";
import Image from "next/image";
import ContentInstancePicker from "@/app/components/ContentInstancePicker";
import AbstractDialog from "@/app/components/AbstractDialog";
import { initialContentInstances, ContentInstance } from "@/app/db/cmpInitialData";
import { allImageLibraryInstances } from "@/app/db/imageLibraryData";
import usePersistentState from "@/app/usePersistentState";

export const ContentReferenceRenderer: React.FC<PropertyRendererProps> = ({
	property,
	value,
	onChange,
	enableAI = true,
	context,
	mode = "edit",
}) => {
	const [showPicker, setShowPicker] = useState(false);
	const [showUrlDialog, setShowUrlDialog] = useState(false);
	const [urlInput, setUrlInput] = useState("");

	// Load content instances from localStorage
	const [contentInstances] = usePersistentState("cmpContentInstances", initialContentInstances) as [ContentInstance[], any];

	// Get the referenced content type
	const referencedTypeId = property.allowedTypes?.[0];
	if (!referencedTypeId) {
		console.warn(`ContentReference property ${property.id} has no allowedTypes`);
		return null;
	}

	const referencedType = context?.runtimeContentTypes?.find(ct => ct.id === referencedTypeId);
	if (!referencedType) {
		console.warn(`Referenced content type ${referencedTypeId} not found`);
		return null;
	}

	// Handle Media types (like ct-image) - render as image preview
	if (referencedType.baseType === "Media") {
		const imageUrl = value ?? property.defaultValue ?? "";

		// Filter instances that have image fields
		const getImageUrl = (instance: ContentInstance): string | null => {
			const imageFields = ["featured_image", "hero_image", "background_image", "thumbnail", "image"];
			for (const field of imageFields) {
				const value = instance.fields[field];
				if (value && typeof value === "string" && (value.startsWith("http") || value.startsWith("/"))) {
					return value;
				}
			}
			return null;
		};

		// Combine all image sources and filter for images only
		const instancesWithImages = useMemo(() => {
			// Combine:
			// 1. Content instances from localStorage (only ct-image types)
			// 2. ImageSelector images (side panel images)
			// 3. Stock images (CMP stock library)
			const allInstances = [
				...contentInstances,
				...allImageLibraryInstances,
			];

			// Filter to only dedicated image content types
			// Exclude blog posts, articles, components, etc. that happen to have image fields
			return allInstances.filter(i => {
				// Only include if it's a dedicated image content type
				const isImageContentType = i.modelId === "ct-image" || i.modelId === "ct-image-block";
				// And has an actual image URL
				const hasImageUrl = getImageUrl(i) !== null;
				return isImageContentType && hasImageUrl;
			});
		}, [contentInstances]);

		const handleSelectImage = () => {
			setShowPicker(true);
		};

		const handleImageSelected = (instance: ContentInstance | ContentInstance[]) => {
			// Single select mode - extract image URL from selected instance
			if (!Array.isArray(instance)) {
				const imgUrl = getImageUrl(instance);
				if (imgUrl) {
					onChange(imgUrl);
				}
			}
			setShowPicker(false);
		};

		const handleEditImage = () => {
			setShowPicker(true);
		};

		const handleEnterUrl = () => {
			setUrlInput(imageUrl);
			setShowUrlDialog(true);
		};

		const handleRemoveImage = () => {
			onChange("");
		};

		const handleSaveUrl = () => {
			if (urlInput.trim()) {
				onChange(urlInput.trim());
			}
			setShowUrlDialog(false);
			setUrlInput("");
		};

		const handleCancelUrl = () => {
			setShowUrlDialog(false);
			setUrlInput("");
		};

		// Extract filename from URL
		const getImageName = (url: string) => {
			if (!url) return "";
			try {
				const urlObj = new URL(url);
				const pathname = urlObj.pathname;
				const parts = pathname.split('/');
				return parts[parts.length - 1] || "Image";
			} catch {
				return "Image";
			}
		};

		if (mode === "readonly") {
			return (
				<Field label={property.displayName || property.name} info={property.description}>
					{imageUrl ? (
						<Box style={{ maxWidth: "400px" }}>
							<Card>
								<CardPreview h="224">
									<CardImage asChild>
										<Image
											src={imageUrl}
											alt={property.displayName || property.name}
											fill
											unoptimized
											style={{
												objectFit: "cover",
											}}
										/>
									</CardImage>
								</CardPreview>
								<CardHeader>
									{getImageName(imageUrl)}
								</CardHeader>
							</Card>
						</Box>
					) : (
						<Box color="fg.tertiary">No image</Box>
					)}
				</Field>
			);
		}

		return (
			<>
				<Field label={property.displayName || property.name} info={property.description}>
					<Box style={{ maxWidth: "400px" }}>
						<Card>
							{imageUrl ? (
								<>
									<CardPreview
										h="224"
										style={{ cursor: "pointer" }}
										onClick={handleEditImage}
									>
										<CardImage asChild>
											<Image
												src={imageUrl}
												alt={property.displayName || property.name}
												fill
												unoptimized
												style={{
													objectFit: "cover",
												}}
											/>
										</CardImage>
									</CardPreview>
									<CardHeader
										addonAfter={
											<Menu
												options={[
													{ addon: <IconPhoto />, label: "Select from Library", execute: handleEditImage },
													{ addon: <IconPencil />, label: "Enter URL", execute: handleEnterUrl },
													{ addon: <IconTrash />, intent: "danger", label: "Remove", execute: handleRemoveImage },
												]}
											>
												<MenuTrigger asChild>
													<EllipsisMenuButton
														appearance="subtle"
														aria-label="actions"
														size="sm"
													/>
												</MenuTrigger>
												<MenuContent align="end" />
											</Menu>
										}
									>
										{getImageName(imageUrl)}
									</CardHeader>
								</>
							) : (
								<CardPreview
									h="224"
									display="flex"
									alignItems="center"
									justifyContent="center"
									style={{
										border: "1px dashed var(--border-tertiary)",
									}}
								>
									<Button size="md" onClick={handleSelectImage}>
										Select Image
									</Button>
								</CardPreview>
							)}
						</Card>
					</Box>
				</Field>

				{/* Image Picker Dialog */}
				<ContentInstancePicker
					open={showPicker}
					onClose={() => setShowPicker(false)}
					instances={instancesWithImages}
					onSelect={handleImageSelected}
					multiSelect={false}
					title="Select Image"
					description="Choose an image from the content library."
					primaryActionText="Select"
				/>

				{/* Manual URL Input Dialog */}
				<AbstractDialog
					title={imageUrl ? "Edit Image URL" : "Add Image URL"}
					description="Enter the URL of the image you want to use."
					open={showUrlDialog}
					setOpen={handleCancelUrl}
					footerPrimaryText="Save"
					footerPrimaryAction={handleSaveUrl}
					footerAppearance="primary"
					blockPrimaryAction={!urlInput.trim()}
				>
					<Box pt="16">
						<Input
							placeholder="https://example.com/image.jpg"
							value={urlInput}
							onChange={(e: any) => setUrlInput(e.target.value)}
							autoFocus
						/>
					</Box>
				</AbstractDialog>
			</>
		);
	}

	// Handle Block types - render properties inline in a Card
	if (referencedType.baseType === "Block") {
		const blockData = (typeof value === "object" && value !== null) ? value : {};
		const blockProperties = referencedType.properties || [];

		// Group block properties by groupName
		const blockGroups: Record<string, Property[]> = {};
		blockProperties.forEach((blockProp) => {
			const groupName = blockProp.groupName || "Properties";
			if (!blockGroups[groupName]) {
				blockGroups[groupName] = [];
			}
			blockGroups[groupName].push(blockProp);
		});

		// Sort properties within each group
		Object.keys(blockGroups).forEach((groupName) => {
			blockGroups[groupName].sort((a, b) => (a.order || 0) - (b.order || 0));
		});

		return (
			<Box display="flex" flexDirection="column" gap="12" w="full">
				<Card w="full">
					<Box display="flex" flexDirection="column" gap="16">
						{Object.entries(blockGroups).map(([groupName, groupProps]) => (
							<Box key={groupName} display="flex" flexDirection="column" gap="12">
								{groupProps.map((blockProp) => {
									const blockPropValue = blockData[blockProp.id];
									return (
										<PropertyRenderer
											key={blockProp.id}
											property={blockProp}
											value={blockPropValue}
											onChange={(newVal) => onChange({ ...blockData, [blockProp.id]: newVal })}
											context={context}
											enableAI={enableAI}
											mode={mode}
										/>
									);
								})}
							</Box>
						))}
					</Box>
				</Card>
			</Box>
		);
	}

	// Page type or other - not yet implemented
	console.warn(`ContentReference to baseType ${referencedType.baseType} not yet supported`);
	return null;
};
