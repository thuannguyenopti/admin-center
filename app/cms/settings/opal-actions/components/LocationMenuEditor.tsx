"use client";

import React, {useState, useEffect, useCallback} from "react";
import {Box, Text, Button, Checkbox, Field} from "@optiaxiom/react";
import {IconX, IconPlus, IconHelp, IconGripVertical, IconTrash} from "@tabler/icons-react";
import {LocationMenu, LocationId} from "../types";
import {availableAgents} from "../mockData";

interface LocationMenuEditorProps {
	location: LocationMenu;
	onClose: () => void;
	onSave: (location: LocationMenu) => void;
}

export const LocationMenuEditor: React.FC<LocationMenuEditorProps> = ({
	location,
	onClose,
	onSave,
}) => {
	const [editedLocation, setEditedLocation] = useState<LocationMenu>(location);

	// Update local state when location prop changes
	useEffect(() => {
		setEditedLocation(location);
	}, [location]);

	const handleSave = useCallback(() => {
		onSave(editedLocation);
		onClose();
	}, [editedLocation, onSave, onClose]);

	return (
		<Box
			display="flex"
			flexDirection="column"
			h="full"
		>

			{/* Header */}
			<Box
				p="24"
				pb="16"
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				style={{flexShrink: 0}}
			>
				<Text fontWeight="600" fontSize="lg">
					Edit Opal Action
				</Text>
				<Button
					appearance="subtle"
					size="sm"
					icon={<IconX size={16} />}
					onClick={onClose}
					aria-label="Close"
				/>
			</Box>

			{/* Body (scrollable) */}
			<Box flex="1" overflow="auto" px="24" pb="24">
				<Box display="flex" flexDirection="column" gap="16">
					{/* Location field */}
					<Field label="Location">
						<Box display="flex" alignItems="center" gap="8">
							<Text fontSize="sm">{location.name}</Text>
							<Button
								appearance="subtle"
								size="sm"
								icon={<IconHelp size={14} />}
								aria-label="Help"
							/>
						</Box>
					</Field>

					{/* Enabled checkbox */}
					<Box>
						<Checkbox
							checked={editedLocation.enabled}
							onChange={(e) =>
								setEditedLocation((prev) => ({
									...prev,
									enabled: e.currentTarget.checked,
								}))
							}
						>
							Enabled
						</Checkbox>
					</Box>

					{/* Actions buttons */}
					<Box display="flex" gap="8">
						<Button size="sm" appearance="default" icon={<IconPlus size={16} />}>
							Add Agent
						</Button>
						<Button size="sm" appearance="default" icon={<IconPlus size={16} />}>
							Add Group
						</Button>
					</Box>

					{/* Groups and agents section */}
					<Box>
						{editedLocation.groups.length === 0 ? (
							<Box
								p="24"
								border="1"
								borderColor="border.secondary"
								rounded="md"
								bg="bg.secondary"
								display="flex"
								flexDirection="column"
								alignItems="center"
								gap="8"
							>
								<Text color="fg.secondary" textAlign="center">
									No agents yet
								</Text>
								<Text fontSize="sm" color="fg.tertiary" textAlign="center">
									Add agents or groups to organize this location's menu
								</Text>
							</Box>
						) : (
							<Box display="flex" flexDirection="column" gap="16">
								{editedLocation.groups
									.sort((a, b) => a.order - b.order)
									.map((group) => (
										<Box
											key={group.id}
											p="16"
											border="1"
											borderColor="border.secondary"
											rounded="md"
											bg="bg.secondary"
											display="flex"
											flexDirection="column"
											gap="12"
										>
											{/* Group header */}
											<Text fontSize="sm" fontWeight="600" color="fg.default">
												{group.name}
											</Text>

											{/* Agent cards */}
											<Box display="flex" flexDirection="column" gap="8">
												{group.agents.map((agentId) => {
													const agent = availableAgents.find((a) => a.id === agentId);
													return (
														<Box
															key={agentId}
															p="12"
															border="1"
															borderColor="border.secondary"
															rounded="md"
															bg="bg.default"
															display="flex"
															alignItems="center"
															justifyContent="space-between"
														>
															<Box display="flex" alignItems="center" gap="12">
																<IconGripVertical size={20} color="var(--ax-colors-fg-tertiary)" />
																<Text fontSize="md">{agent?.name || agentId}</Text>
															</Box>
															<Button
																appearance="subtle"
																size="sm"
																icon={<IconTrash size={20} />}
																aria-label="Remove agent"
															/>
														</Box>
													);
												})}
											</Box>
										</Box>
									))}
							</Box>
						)}
					</Box>
				</Box>
			</Box>

			{/* Footer (sticky) */}
			<Box
				px="24"
				pb="24"
				pt="16"
				borderT="1"
				borderColor="border.secondary"
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				style={{flexShrink: 0}}
			>
				<Text fontSize="sm" color="fg.error">
					* Required Field
				</Text>
				<Box display="flex" gap="8">
					<Button appearance="subtle" onClick={onClose}>
						Cancel
					</Button>
					<Button appearance="primary" onClick={handleSave}>
						Save
					</Button>
				</Box>
			</Box>
		</Box>
	);
};
