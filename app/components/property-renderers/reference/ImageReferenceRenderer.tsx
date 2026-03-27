"use client";

import { Box, Field, Card, CardPreview, CardImage, CardHeader, Button, Menu, MenuTrigger, MenuContent, EllipsisMenuButton, Input } from "@optiaxiom/react";
import { IconPencil, IconTrash, IconPhoto } from "@tabler/icons-react";
import { PropertyRendererProps } from "../types";
import { useState, useMemo } from "react";
import Image from "next/image";
import AbstractDialog from "@/app/components/AbstractDialog";
import ContentInstancePicker from "@/app/components/ContentInstancePicker";
import { initialContentInstances, ContentInstance } from "@/app/db/cmpInitialData";
import { allImageLibraryInstances } from "@/app/db/imageLibraryData";
import usePersistentState from "@/app/usePersistentState";

/**
 * Renderer for ImageReference property type (legacy)
 * This is the same as ContentReference to ct-image Media type
 */
export const ImageReferenceRenderer: React.FC<PropertyRendererProps> = ({
	property,
	value,
	onChange,
	mode = "edit",
}) => {
	const imageUrl = value ?? property.defaultValue ?? "";
	const [showPicker, setShowPicker] = useState(false);
	const [showUrlDialog, setShowUrlDialog] = useState(false);
	const [urlInput, setUrlInput] = useState("");

	// Load content instances from localStorage
	const [contentInstances] = usePersistentState("cmpContentInstances", initialContentInstances) as [ContentInstance[], any];

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
};
