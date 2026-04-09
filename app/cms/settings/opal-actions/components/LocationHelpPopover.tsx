"use client";

import React from "react";
import {Box, Text, Button, Popover, PopoverTrigger, PopoverContent, Badge} from "@optiaxiom/react";
import {IconHelp} from "@tabler/icons-react";

export const LocationHelpPopover: React.FC = () => {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button appearance="subtle" size="sm" icon={<IconHelp size={14} />} aria-label="Location help" />
			</PopoverTrigger>

			<PopoverContent align="start" style={{width: "420px", maxHeight: "500px", overflow: "auto"}}>
				<Box p="16" display="flex" flexDirection="column" gap="16">
					{/* Header */}
					<Box>
						<Text fontWeight="600" fontSize="md">
							Location Reference
						</Text>
						<Text fontSize="sm" color="fg.secondary">
							Where agents appear in the CMS interface
						</Text>
					</Box>

					{/* Visual CMS Mockup */}
					<Box border="1" borderColor="border.secondary" rounded="md" overflow="hidden">
						{/* Toolbar Section */}
						<Box bg="bg.information.subtle" borderB="1" borderColor="border.secondary" p="8">
							<Text fontSize="xs" fontWeight="600" color="fg.secondary" mb="4">
								TOOLBAR
							</Text>
							<Box display="flex" gap="4" flexWrap="wrap">
								<Badge intent="information" variant="strong">
									Improve Button
								</Badge>
								<Badge intent="information" variant="strong">
									Page
								</Badge>
								<Badge intent="information" variant="strong">
									Context Menu
								</Badge>
							</Box>
						</Box>

						{/* Content Area */}
						<Box display="flex" style={{minHeight: "120px"}}>
							{/* Left: Outline */}
							<Box
								style={{flexBasis: "100px", flexGrow: 0, flexShrink: 0}}
								bg="bg.warning.subtle"
								borderR="1"
								borderColor="border.secondary"
								p="8"
							>
								<Text fontSize="xs" fontWeight="600" color="fg.secondary" mb="4">
									OUTLINE
								</Text>
								<Badge intent="warning" variant="strong">
									Section
								</Badge>
							</Box>

							{/* Right: Properties */}
							<Box flex="1" bg="bg.success.subtle" p="8">
								<Text fontSize="xs" fontWeight="600" color="fg.secondary" mb="4">
									PROPERTIES
								</Text>
								<Box display="flex" flexDirection="column" gap="4">
									<Box display="flex" gap="4" flexWrap="wrap">
										<Badge intent="success" variant="strong">
											Text
										</Badge>
										<Badge intent="success" variant="strong">
											Image
										</Badge>
										<Badge intent="success" variant="strong">
											Number
										</Badge>
									</Box>
									<Box display="flex" gap="4" flexWrap="wrap">
										<Badge intent="success" variant="strong">
											Date/Time
										</Badge>
										<Badge intent="success" variant="strong">
											Reference
										</Badge>
									</Box>
									<Badge intent="success" variant="strong">
										Property Editor
									</Badge>
								</Box>
							</Box>
						</Box>

						{/* Asset Panel */}
						<Box bg="bg.secondary" borderT="1" borderColor="border.secondary" p="8">
							<Text fontSize="xs" fontWeight="600" color="fg.secondary" mb="4">
								ASSET PANEL
							</Text>
							<Badge intent="neutral" variant="strong">
								Asset Panel
							</Badge>
						</Box>
					</Box>

					{/* Location Descriptions */}
					<Box display="flex" flexDirection="column" gap="8">
						<Text fontSize="sm" fontWeight="600">
							Location Details
						</Text>

						{/* Toolbar Locations */}
						<Box>
							<Text fontSize="xs" fontWeight="600" color="fg.information">
								Toolbar
							</Text>
							<Box display="flex" flexDirection="column" gap="4" mt="4" ml="8">
								<Box>
									<Text fontSize="xs" fontWeight="500">
										Improve Button
									</Text>
									<Text fontSize="xs" color="fg.secondary">
										Actions in the Improve dropdown menu
									</Text>
								</Box>
								<Box>
									<Text fontSize="xs" fontWeight="500">
										Page
									</Text>
									<Text fontSize="xs" color="fg.secondary">
										Page-level context menu actions
									</Text>
								</Box>
								<Box>
									<Text fontSize="xs" fontWeight="500">
										Context Menu
									</Text>
									<Text fontSize="xs" color="fg.secondary">
										Three-dot menu actions
									</Text>
								</Box>
							</Box>
						</Box>

						{/* Outline Locations */}
						<Box>
							<Text fontSize="xs" fontWeight="600" color="fg.warning">
								Outline
							</Text>
							<Box ml="8" mt="4">
								<Text fontSize="xs" fontWeight="500">
									Section
								</Text>
								<Text fontSize="xs" color="fg.secondary">
									Section context menu in outline tree
								</Text>
							</Box>
						</Box>

						{/* Property Locations */}
						<Box>
							<Text fontSize="xs" fontWeight="600" color="fg.success">
								Properties
							</Text>
							<Box display="flex" flexDirection="column" gap="4" mt="4" ml="8">
								<Box>
									<Text fontSize="xs" fontWeight="500">
										Text / Image / Number / Date/Time / Reference
									</Text>
									<Text fontSize="xs" color="fg.secondary">
										Type-specific property editor actions
									</Text>
								</Box>
								<Box>
									<Text fontSize="xs" fontWeight="500">
										Property Editor
									</Text>
									<Text fontSize="xs" color="fg.secondary">
										Generic actions for text/longstring/xhtmlstring properties
									</Text>
								</Box>
							</Box>
						</Box>

						{/* Panel Locations */}
						<Box>
							<Text fontSize="xs" fontWeight="600" color="fg.secondary">
								Panels
							</Text>
							<Box ml="8" mt="4">
								<Text fontSize="xs" fontWeight="500">
									Asset Panel
								</Text>
								<Text fontSize="xs" color="fg.secondary">
									Asset management context menu
								</Text>
							</Box>
						</Box>
					</Box>
				</Box>
			</PopoverContent>
		</Popover>
	);
};
