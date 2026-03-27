"use client";

import { Box, Field, Card, Button } from "@optiaxiom/react";
import { PropertyRendererProps } from "../types";
import { useState } from "react";

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
	const [isHovering, setIsHovering] = useState(false);

	const handleSelectImage = () => {
		// For now, show a simple prompt to enter URL
		// TODO: In the future, this could open an asset library modal
		const url = window.prompt("Enter image URL:");
		if (url) {
			onChange(url);
		}
	};

	const handleChangeImage = () => {
		setShowUrlInput(true);
	};

	const handleSaveUrl = () => {
		onChange(urlInput);
		setShowUrlInput(false);
	};

	const handleCancelUrl = () => {
		setUrlInput(imageUrl);
		setShowUrlInput(false);
	};

	if (mode === "readonly") {
		return (
			<Field label={property.displayName || property.name} info={property.description}>
				{imageUrl ? (
					<Box style={{ maxWidth: "400px" }}>
						<Card p="0">
							<Box
								style={{
									width: "100%",
									height: "200px",
									backgroundImage: `url(${imageUrl})`,
									backgroundSize: "cover",
									backgroundPosition: "center",
									borderRadius: "4px",
								}}
							/>
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
				<Card p="0">
				{showUrlInput ? (
					<Box display="flex" flexDirection="column" gap="8" alignItems="center">
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
					<Box
						onMouseEnter={() => setIsHovering(true)}
						onMouseLeave={() => setIsHovering(false)}
						style={{
							position: "relative",
							width: "100%",
							height: "200px",
							borderRadius: "4px",
							overflow: "hidden",
						}}
					>
						<Box
							style={{
								width: "100%",
								height: "100%",
								backgroundImage: `url(${imageUrl})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
							}}
						/>
						{isHovering && (
							<Box
								display="flex"
								alignItems="center"
								justifyContent="center"
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									background: "rgba(0, 0, 0, 0.5)",
								}}
							>
								<Button size="md" onClick={handleChangeImage}>
									Change Image
								</Button>
							</Box>
						)}
					</Box>
				) : (
					<Box
						display="flex"
						alignItems="center"
						justifyContent="center"
						style={{
							width: "100%",
							height: "200px",
							border: "1px dashed var(--border-tertiary)",
							borderRadius: "4px",
						}}
					>
						<Button size="md" onClick={handleSelectImage}>
							Select Image
						</Button>
					</Box>
				)}
			</Card>
			</Box>
		</Field>
	);
};
