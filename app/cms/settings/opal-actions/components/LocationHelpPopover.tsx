"use client";

import React from "react";
import {Box, Text, Button, Popover, PopoverTrigger, PopoverContent, Badge} from "@optiaxiom/react";
import {IconHelp} from "@tabler/icons-react";
import {LocationId} from "../types";

interface LocationHelpPopoverProps {
	locationId: LocationId;
}

export const LocationHelpPopover: React.FC<LocationHelpPopoverProps> = ({locationId}) => {
	// Determine which area should be highlighted based on location
	const isToolbarLocation = ["toolbar-improve", "toolbar-page", "toolbar-context"].includes(locationId);
	const isOutlineLocation = locationId === "outline-section";
	const isPropertyLocation = [
		"property-text",
		"property-image",
		"property-number",
		"property-datetime",
		"property-reference",
		"property-editor",
	].includes(locationId);
	const isAssetLocation = locationId === "asset-panel";

	// Get location-specific info
	const getLocationInfo = () => {
		switch (locationId) {
			case "toolbar-improve":
				return {name: "Toolbar Improve Button", description: "Actions in the Improve dropdown menu"};
			case "toolbar-page":
				return {name: "Page", description: "Page-level context menu actions"};
			case "toolbar-context":
				return {name: "Toolbar Context Menu", description: "Three-dot menu actions"};
			case "outline-section":
				return {name: "Section", description: "Section context menu in outline tree"};
			case "property-text":
				return {name: "Text", description: "Text property editor actions"};
			case "property-image":
				return {name: "Image", description: "Image property editor actions"};
			case "property-number":
				return {name: "Number", description: "Number property editor actions"};
			case "property-datetime":
				return {name: "Date/Time", description: "DateTime property editor actions"};
			case "property-reference":
				return {name: "Reference", description: "Reference property editor actions"};
			case "property-editor":
				return {name: "Property Editor", description: "Generic actions for text/longstring/xhtmlstring properties"};
			case "asset-panel":
				return {name: "Asset Panel", description: "Asset management context menu"};
			default:
				return {name: "Location", description: "CMS interface location"};
		}
	};

	const locationInfo = getLocationInfo();

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button appearance="subtle" size="sm" icon={<IconHelp size={14} />} aria-label="Location help" />
			</PopoverTrigger>

			<PopoverContent align="start" style={{width: "540px", maxHeight: "500px", overflow: "auto"}}>
				<Box p="16" display="flex" flexDirection="column" gap="16">
					{/* Header */}
					<Box>
						<Text fontWeight="600" fontSize="md">
							{locationInfo.name}
						</Text>
						<Text fontSize="sm" color="fg.secondary">
							{locationInfo.description}
						</Text>
					</Box>

					{/* Visual CMS Mockup */}
					<Box border="1" borderColor="border.secondary" rounded="md" overflow="hidden">
						{/* Top Menu */}
						<Box bg="bg.tertiary" borderB="1" borderColor="border.secondary" p="4">
							<Text fontSize="xs" color="fg.secondary">
								Top Menu
							</Text>
						</Box>

						{/* Main Layout */}
						<Box display="flex" style={{minHeight: "180px"}}>
							{/* Left: Main Navigation */}
							<Box
								style={{flexBasis: "32px", flexGrow: 0, flexShrink: 0}}
								bg="bg.tertiary"
								borderR="1"
								borderColor="border.secondary"
								p="4"
							>
								<Text fontSize="xs" color="fg.secondary" style={{writingMode: "vertical-rl", transform: "rotate(180deg)"}}>
									Nav
								</Text>
							</Box>

							{/* Center: Content Area */}
							<Box flex="1" display="flex" flexDirection="column">
								{/* Toolbar */}
								<Box
									bg={isToolbarLocation ? "bg.accent.subtle" : "bg.secondary"}
									borderB="1"
									borderColor={isToolbarLocation ? "border.accent" : "border.secondary"}
									p="6"
									display="flex"
									alignItems="center"
									justifyContent="center"
								>
									{isToolbarLocation && (
										<Box
											style={{width: "12px", height: "12px", borderRadius: "50%"}}
											bg="bg.accent"
										/>
									)}
								</Box>

								{/* Content with Outline */}
								<Box display="flex" flex="1">
									{/* Outline */}
									<Box
										style={{flexBasis: "100px", flexGrow: 0, flexShrink: 0}}
										bg={isOutlineLocation ? "bg.accent.subtle" : "bg.secondary"}
										borderR="1"
										borderColor={isOutlineLocation ? "border.accent" : "border.secondary"}
										p="6"
										display="flex"
										alignItems="center"
										justifyContent="center"
									>
										{isOutlineLocation && (
											<Box
												style={{width: "12px", height: "12px", borderRadius: "50%"}}
												bg="bg.accent"
											/>
										)}
									</Box>

									{/* Main Content Area */}
									<Box flex="1" display="flex" flexDirection="column">
										<Box flex="1" bg="bg.page" p="6">
											<Text fontSize="xs" color="fg.secondary">
												Content
											</Text>
										</Box>

										{/* Properties */}
										<Box
											bg={isPropertyLocation ? "bg.accent.subtle" : "bg.secondary"}
											borderT="1"
											borderColor={isPropertyLocation ? "border.accent" : "border.secondary"}
											p="6"
											display="flex"
											alignItems="center"
											justifyContent="center"
										>
											{isPropertyLocation && (
												<Box
													style={{width: "12px", height: "12px", borderRadius: "50%"}}
													bg="bg.accent"
												/>
											)}
										</Box>
									</Box>
								</Box>
							</Box>

							{/* Right: Assets Panel */}
							<Box
								style={{flexBasis: "100px", flexGrow: 0, flexShrink: 0}}
								borderL="1"
								borderColor={isAssetLocation ? "border.accent" : "border.secondary"}
								bg={isAssetLocation ? "bg.accent.subtle" : "bg.secondary"}
								p="6"
								display="flex"
								alignItems="center"
								justifyContent="center"
							>
								{isAssetLocation && (
									<Box
										style={{width: "12px", height: "12px", borderRadius: "50%"}}
										bg="bg.accent"
									/>
								)}
							</Box>
						</Box>
					</Box>
				</Box>
			</PopoverContent>
		</Popover>
	);
};
