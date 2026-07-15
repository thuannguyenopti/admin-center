"use client";

import { useMemo, useState } from "react";
import {
	Box,
	Button,
	Checkbox,
	Dialog,
	DialogBody,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	Text,
} from "@optiaxiom/react";
import {
	IconUpload,
	IconUserGroup,
} from "@optimizely/axiom-icons";
import { uploadAssets } from "./data";
import { RecognitionPreflightPanel } from "./RecognitionPreflightPanel";
import { UploadAssetCard } from "./UploadAssetCard";
import { UploadMetadataPanel } from "./UploadMetadataPanel";
import { UploadPeoplePanel } from "./UploadPeoplePanel";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function UploadRecognitionDialog({ open, onOpenChange }: Props) {
	const [activeAssetId, setActiveAssetId] = useState(uploadAssets[0]?.id);
	const [assignedFaceNames, setAssignedFaceNames] = useState<Record<string, string>>({});
	const [bulkName, setBulkName] = useState("");
	const [draggedAssetId, setDraggedAssetId] = useState<string | null>(null);
	const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(
		() => new Set(uploadAssets.map((asset) => asset.id)),
	);
	const [autoComplete, setAutoComplete] = useState(false);
	const [statusMessage, setStatusMessage] = useState(
		"Opal will scan for duplicates, similar assets, people, objects, and tags before upload.",
	);
	const activeAsset = useMemo(
		() => uploadAssets.find((asset) => asset.id === activeAssetId) ?? uploadAssets[0],
		[activeAssetId],
	);
	const duplicateCount = uploadAssets.filter((asset) => asset.status === "duplicate").length;
	const unknownFaceCount = uploadAssets.flatMap((asset) => asset.faces).filter(
		(face) => face.status === "unknown" && !assignedFaceNames[face.id],
	).length;
	const selectedCount = selectedAssetIds.size;
	const selectedAssets = uploadAssets.filter((asset) => selectedAssetIds.has(asset.id));
	const selectedFaces = selectedAssets.flatMap((asset) => asset.faces);
	const selectedUnnamedFaces = selectedFaces.filter(
		(face) => face.status === "unknown" && !assignedFaceNames[face.id],
	);
	const knownNames = Array.from(
		new Set(
			uploadAssets
				.flatMap((asset) => asset.faces)
				.map((face) => assignedFaceNames[face.id] ?? (face.status === "known" ? face.name : null))
				.filter(Boolean) as string[],
		),
	);

	const toggleAssetSelection = (assetId: string) => {
		setSelectedAssetIds((current) => {
			const next = new Set(current);
			if (next.has(assetId)) {
				next.delete(assetId);
			} else {
				next.add(assetId);
			}
			return next;
		});
	};

	const setAllSelected = () => {
		setSelectedAssetIds(
			selectedCount === uploadAssets.length
				? new Set()
				: new Set(uploadAssets.map((asset) => asset.id)),
		);
	};

	const applyBulkName = () => {
		const name = bulkName.trim();
		if (!name || selectedUnnamedFaces.length === 0) return;
		setAssignedFaceNames((current) => {
			const next = { ...current };
			selectedUnnamedFaces.forEach((face) => {
				next[face.id] = name;
			});
			return next;
		});
		setBulkName("");
		setStatusMessage(`${selectedUnnamedFaces.length} selected faces named ${name}.`);
	};

	const selectUnnamedAssets = () => {
		setSelectedAssetIds(
			new Set(
				uploadAssets
					.filter((asset) =>
						asset.faces.some((face) => face.status === "unknown" && !assignedFaceNames[face.id]),
					)
					.map((asset) => asset.id),
			),
		);
	};

	const assignDraggedAssetToName = (name: string) => {
		if (!draggedAssetId) return;
		const draggedAsset = uploadAssets.find((asset) => asset.id === draggedAssetId);
		if (!draggedAsset) return;
		const unknownFaces = draggedAsset.faces.filter((face) => face.status === "unknown");
		if (unknownFaces.length === 0) return;
		setAssignedFaceNames((current) => {
			const next = { ...current };
			unknownFaces.forEach((face) => {
				next[face.id] = name;
			});
			return next;
		});
		setSelectedAssetIds((current) => new Set([...current, draggedAssetId]));
		setDraggedAssetId(null);
		setStatusMessage(`${draggedAsset.title} assigned to ${name}.`);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="axiom-v3-recognition cmp-upload-dialog"
				size="lg"
				style={{
					display: "flex",
					flexDirection: "column",
					height: "82vh",
					maxHeight: 820,
					maxWidth: 1120,
					width: "calc(100vw - 96px)",
				}}
			>
				<DialogHeader
					addonAfter={
						<Button
							appearance="subtle"
							size="sm"
							icon={<IconUserGroup size={14} />}
							iconPosition="start"
							onClick={() => setStatusMessage("Add Assets opens the native file picker in production.")}
						>
							Add Assets
						</Button>
					}
				>
					<Box alignItems="center" display="flex" gap="24">
						<Text fontSize="lg" fontWeight="600">
							Upload {uploadAssets.length} Assets
						</Text>
						<Checkbox
							checked={selectedCount === uploadAssets.length}
							indeterminate={selectedCount > 0 && selectedCount < uploadAssets.length}
							onCheckedChange={setAllSelected}
						>
							Select All
						</Checkbox>
					</Box>
				</DialogHeader>

				<DialogBody
					flex="1"
					overflow="hidden"
					p="0"
					style={{ minHeight: 0 }}
				>
					<Box
						display="flex"
						gap="24"
						p="24"
						style={{
							height: "100%",
							minHeight: 0,
							width: "100%",
						}}
					>
					<Box display="flex" flex="1" flexDirection="column" gap="16" overflow="auto" pr="4" style={{ minWidth: 0 }}>
						<Box
							bg="bg.default"
							border="1"
							borderColor="border.tertiary"
							display="flex"
							flexDirection="column"
							gap="4"
							p="16"
							rounded="md"
						>
							<Text fontSize="sm" fontWeight="600">
								Recognition preflight
							</Text>
							<Text color="fg.secondary" fontSize="sm">
								{statusMessage} {duplicateCount} duplicate and {unknownFaceCount} unnamed faces found.
							</Text>
						</Box>

						<UploadPeoplePanel
							bulkName={bulkName}
							draggedAssetId={draggedAssetId}
							knownNames={knownNames}
							selectedAssetCount={selectedCount}
							selectedFaceCount={selectedFaces.length}
							unnamedFaceCount={unknownFaceCount}
							onApplyName={applyBulkName}
							onAssignDraggedAsset={assignDraggedAssetToName}
							onBulkNameChange={setBulkName}
							onSelectUnnamedAssets={selectUnnamedAssets}
						/>

						<Box
							display="grid"
							gap="20"
							style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
						>
							{uploadAssets.map((asset) => (
								<UploadAssetCard
									key={asset.id}
									asset={asset}
									active={asset.id === activeAsset.id}
									selected={selectedAssetIds.has(asset.id)}
									onOpen={() => setActiveAssetId(asset.id)}
									onSelect={() => toggleAssetSelection(asset.id)}
									onDragStart={() => setDraggedAssetId(asset.id)}
									onDragEnd={() => setDraggedAssetId(null)}
								/>
							))}
						</Box>
					</Box>

					<Box display="flex" flexDirection="column" gap="16" overflow="auto" style={{ width: 392, flexShrink: 0 }}>
						<RecognitionPreflightPanel asset={activeAsset} onStatusChange={setStatusMessage} />
						<UploadMetadataPanel />
					</Box>
					</Box>
				</DialogBody>

				<DialogFooter>
					<Checkbox
						checked={autoComplete}
						description="If selected, known people and approved smart tags apply automatically after preflight."
						onCheckedChange={(checked) => setAutoComplete(Boolean(checked))}
					>
						Auto-complete once assets are uploaded
					</Checkbox>
					<Box flex="1" />
					<DialogClose appearance="default" size="lg">
						Cancel
					</DialogClose>
					<DialogClose
						appearance="primary"
						size="lg"
						icon={<IconUpload size={14} />}
						iconPosition="start"
						onClick={() => setStatusMessage(`${selectedCount} assets queued for upload.`)}
					>
						Upload
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
