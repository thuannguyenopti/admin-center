"use client";

import { Box, Field, Card, CardPreview, CardImage, CardHeader, Button, Menu, MenuTrigger, MenuContent, EllipsisMenuButton } from "@optiaxiom/react";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { PropertyRendererProps } from "../types";
import { useState } from "react";
import Image from "next/image";

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
	const [showUrlInput, setShowUrlInput] = useState(false);
	const [urlInput, setUrlInput] = useState(imageUrl);

	const handleSelectImage = () => {
		// For now, show a simple prompt to enter URL
		// TODO: In the future, this could open an asset library modal
		const url = window.prompt("Enter image URL:");
		if (url) {
			onChange(url);
		}
	};

	const handleEditImage = () => {
		setShowUrlInput(true);
	};

	const handleRemoveImage = () => {
		onChange("");
	};

	const handleSaveUrl = () => {
		onChange(urlInput);
		setShowUrlInput(false);
	};

	const handleCancelUrl = () => {
		setUrlInput(imageUrl);
		setShowUrlInput(false);
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
		<Field label={property.displayName || property.name} info={property.description}>
			<Box style={{ maxWidth: "400px" }}>
				<Card>
				{showUrlInput ? (
					<Box display="flex" flexDirection="column" gap="8" alignItems="center" p="16">
						<input
							type="text"
							value={urlInput}
							onChange={(e) => setUrlInput(e.target.value)}
							placeholder="Enter image URL..."
							style={{
								width: "100%",
								padding: "8px",
								borderRadius: "4px",
								border: "1px solid var(--border-default)",
							}}
						/>
						<Box display="flex" gap="8">
							<Button size="md" onClick={handleSaveUrl}>
								Save
							</Button>
							<Button size="md" appearance="subtle" onClick={handleCancelUrl}>
								Cancel
							</Button>
						</Box>
					</Box>
				) : imageUrl ? (
					<>
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
						<CardHeader
							addonAfter={
								<Menu
									options={[
										{ addon: <IconPencil />, label: "Edit", execute: handleEditImage },
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
	);
};
