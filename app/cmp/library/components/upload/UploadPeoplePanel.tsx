"use client";

import { Box, Button, Input, Text } from "@optiaxiom/react";
import { IconCheck, IconUserGroup } from "@optimizely/axiom-icons";

type Props = {
	bulkName: string;
	draggedAssetId: string | null;
	knownNames: string[];
	selectedAssetCount: number;
	selectedFaceCount: number;
	unnamedFaceCount: number;
	onApplyName: () => void;
	onAssignDraggedAsset: (name: string) => void;
	onBulkNameChange: (name: string) => void;
	onSelectUnnamedAssets: () => void;
};

export function UploadPeoplePanel({
	bulkName,
	draggedAssetId,
	knownNames,
	selectedAssetCount,
	selectedFaceCount,
	unnamedFaceCount,
	onApplyName,
	onAssignDraggedAsset,
	onBulkNameChange,
	onSelectUnnamedAssets,
}: Props) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			gap="12"
			p="16"
			rounded="md"
		>
			<Box alignItems="start" display="flex" gap="16" justifyContent="space-between">
				<Box display="flex" flexDirection="column" gap="4">
					<Box alignItems="center" display="flex" gap="8">
						<IconUserGroup size={16} style={{ color: "var(--ax-colors-fg-accent)" }} />
						<Text fontSize="sm" fontWeight="600">
							People found
						</Text>
					</Box>
					<Text color="fg.secondary" fontSize="sm">
						{selectedAssetCount} selected assets contain {selectedFaceCount} faces. {unnamedFaceCount} still need a name.
					</Text>
				</Box>
				<Button appearance="default" size="sm" onClick={onSelectUnnamedAssets}>
					Select unnamed
				</Button>
			</Box>

			<Box
				border="1"
				borderColor={draggedAssetId ? "border.accent" : "border.tertiary"}
				display="flex"
				flexDirection="column"
				gap="4"
				p="10"
				rounded="md"
				style={{ cursor: draggedAssetId ? "copy" : "default" }}
				onDragOver={(event) => {
					if (draggedAssetId) event.preventDefault();
				}}
				onDrop={(event) => {
					event.preventDefault();
					if (knownNames[0]) {
						onAssignDraggedAsset(knownNames[0]);
					}
				}}
			>
				<Text color="fg.secondary" fontSize="xs">
					Known people
				</Text>
				<Text fontSize="sm" fontWeight="600">
					{knownNames.length > 0 ? knownNames.join(", ") : "No known people yet"}
				</Text>
				<Text color={unnamedFaceCount > 0 ? "fg.accent" : "fg.secondary"} fontSize="sm">
					{unnamedFaceCount > 0 ? `${unnamedFaceCount} unnamed faces` : "All faces named"}
				</Text>
			</Box>

			<Box
				display="grid"
				gap="10"
				style={{ gridTemplateColumns: "minmax(220px, 1fr) auto" }}
			>
				<Input
					placeholder="Name faces in selected assets..."
					size="md"
					value={bulkName}
					onChange={(event) => onBulkNameChange(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter" && bulkName.trim()) {
							onApplyName();
						}
					}}
				/>
				<Button
					appearance="primary"
					disabled={!bulkName.trim() || selectedFaceCount === 0}
					icon={<IconCheck size={14} />}
					iconPosition="start"
					size="md"
					onClick={onApplyName}
				>
					Apply name
				</Button>
			</Box>
		</Box>
	);
}
