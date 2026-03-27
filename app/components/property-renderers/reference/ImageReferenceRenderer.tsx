"use client";

import { Box, Field, Card, CardPreview, CardImage, CardHeader, Button, Menu, MenuTrigger, MenuContent, EllipsisMenuButton, Input } from "@optiaxiom/react";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { PropertyRendererProps } from "../types";
import { useState } from "react";
import Image from "next/image";
import AbstractDialog from "@/app/components/AbstractDialog";

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
	const [showUrlDialog, setShowUrlDialog] = useState(false);
	const [urlInput, setUrlInput] = useState("");

	const handleSelectImage = () => {
		setUrlInput("");
		setShowUrlDialog(true);
	};

	const handleEditImage = () => {
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

			{/* Image URL Dialog */}
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
