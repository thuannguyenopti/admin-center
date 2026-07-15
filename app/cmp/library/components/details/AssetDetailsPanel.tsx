"use client";

import { useMemo, useState } from "react";
import { Badge, Box, Button, Heading, Text } from "@optiaxiom/react";
import {
	IconDownload,
	IconStar,
	IconTag,
	IconUserGroup,
	IconXmark,
} from "@optimizely/axiom-icons";
import { AiBannerOrb } from "../AiBanner";
import { FaceBoundingBox } from "../people/FaceBoundingBox";
import { DetectedPersonRow } from "./DetectedPersonRow";
import type { AssetDetectionView } from "./types";

type Props = {
	asset: AssetDetectionView;
	onClose: () => void;
	onManageAllTags?: () => void;
};

export function AssetDetailsPanel({ asset, onClose, onManageAllTags }: Props) {
	const [removedPeople, setRemovedPeople] = useState<Set<string>>(() => new Set());
	const [removedObjects, setRemovedObjects] = useState<Set<string>>(() => new Set());
	const [overrides, setOverrides] = useState<Record<string, string>>({});

	const visiblePeople = useMemo(
		() => asset.detectedPeople.filter((p) => !removedPeople.has(p.id)),
		[asset.detectedPeople, removedPeople],
	);
	const visibleObjects = useMemo(
		() => asset.detectedObjects.filter((o) => !removedObjects.has(o.id)),
		[asset.detectedObjects, removedObjects],
	);

	const faceCountLabel =
		visiblePeople.length === 1
			? "1 face"
			: `${visiblePeople.length} faces`;
	const hasSuggestions = visiblePeople.some((p) => p.suggestedName && !p.isNamed && !overrides[p.id]);

	const handleConfirmName = (id: string, name: string) => {
		setOverrides((prev) => ({ ...prev, [id]: name }));
	};

	const handleRemove = (id: string) => {
		setRemovedPeople((prev) => new Set([...prev, id]));
	};

	const acceptAllSuggestions = () => {
		const updates: Record<string, string> = {};
		visiblePeople.forEach((p) => {
			if (p.suggestedName && !p.isNamed) updates[p.id] = p.suggestedName;
		});
		setOverrides((prev) => ({ ...prev, ...updates }));
	};

	return (
		<Box
			className="axiom-v3-recognition"
			display="flex"
			flexDirection="column"
			h="full"
			style={{ width: 380 }}
		>
			{/* Header */}
			<Box
				alignItems="center"
				borderB="1"
				borderColor="border.tertiary"
				display="flex"
				gap="12"
				justifyContent="space-between"
				px="16"
				py="12"
			>
				<Box alignItems="center" display="flex" gap="8" style={{ minWidth: 0 }}>
					<IconStar size={16} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
					<Box display="flex" flexDirection="column" gap="2" style={{ minWidth: 0 }}>
						<Heading
							level="3"
							fontSize="sm"
							style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
						>
							{asset.assetName}
						</Heading>
						<Text fontSize="xs" color="fg.tertiary">
							{asset.lastModified}
						</Text>
					</Box>
				</Box>
				<Button
					appearance="subtle"
					size="sm"
					icon={<IconXmark size={16} />}
					aria-label="Close"
					onClick={onClose}
				/>
			</Box>

			{/* Body */}
			<Box display="flex" flex="1" flexDirection="column" gap="16" overflow="auto" p="16">
				{/* Hero image */}
				<Box
					bg="bg.secondary"
					rounded="md"
					style={{ aspectRatio: "16 / 9", flexShrink: 0, overflow: "hidden", position: "relative" }}
				>
					<img
						alt={asset.assetName}
						src={asset.heroImage}
						style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }}
					/>
					<FaceBoundingBox
						boxes={visiblePeople.map((p) => p.faceBox)}
						cornerStyle="frame"
					/>
				</Box>

				{/* Detected people */}
				{visiblePeople.length > 0 && (
					<Box display="flex" flexDirection="column" gap="10">
						<Box display="flex" flexDirection="column" gap="8">
							<Box alignItems="center" display="flex" gap="8" justifyContent="space-between">
								<Box alignItems="center" display="flex" gap="6">
									<IconUserGroup size={14} style={{ color: "var(--ax-colors-fg-secondary)" }} />
									<Text fontSize="sm" fontWeight="600" color="fg.default">
										{visiblePeople.length === 1 ? "Person in this asset" : "People in this asset"}
									</Text>
								</Box>
								<Badge intent={visiblePeople.length === 1 ? "success" : "information"}>
									{faceCountLabel}
								</Badge>
							</Box>

							{hasSuggestions && (
								<Box
									alignItems="center"
									bg="bg.secondary"
									border="1"
									borderColor="border.tertiary"
									display="flex"
									gap="8"
									px="10"
									py="8"
									rounded="md"
								>
									<AiBannerOrb size={18} />
									<Box display="flex" flex="1" flexDirection="column" gap="2" style={{ minWidth: 0 }}>
										<Text fontSize="xs" fontWeight="600">
											Opal found likely identity matches
										</Text>
										<Text fontSize="xs" color="fg.secondary">
											Review each face before it joins the person library.
										</Text>
									</Box>
									<Button appearance="default" size="sm" onClick={acceptAllSuggestions}>
										Accept all
									</Button>
								</Box>
							)}
						</Box>

						<Box display="flex" flexDirection="column" gap="6">
							{visiblePeople.map((person) => (
								<DetectedPersonRow
									key={person.id}
									person={{
										...person,
										displayName: overrides[person.id] ?? person.displayName,
										isNamed: Boolean(overrides[person.id]) || person.isNamed,
									}}
									heroImage={asset.heroImage}
									variant={visiblePeople.length === 1 ? "featured" : "default"}
									onConfirmName={handleConfirmName}
									onMarkNotThisPerson={handleRemove}
								/>
							))}
						</Box>
					</Box>
				)}

				{/* Detected objects */}
				{visibleObjects.length > 0 && (
					<Box display="flex" flexDirection="column" gap="8">
						<Box alignItems="center" display="flex" gap="6">
							<IconTag size={14} style={{ color: "var(--ax-colors-fg-secondary)" }} />
							<Text fontSize="sm" fontWeight="600" color="fg.default">
								Detected objects
							</Text>
						</Box>
						<Box display="flex" flexWrap="wrap" gap="6">
							{visibleObjects.map((obj) => (
								<Box
									key={obj.id}
									alignItems="center"
									bg="bg.secondary"
									display="inline-flex"
									gap="4"
									px="8"
									py="4"
									rounded="full"
								>
									<Text fontSize="xs" fontWeight="500">
										{obj.label}
									</Text>
									<Text fontSize="xs" color="fg.tertiary">
										{obj.confidencePct}%
									</Text>
									<Button
										appearance="subtle"
										size="sm"
										icon={<IconXmark size={10} />}
										aria-label={`Remove ${obj.label}`}
										onClick={() => setRemovedObjects((prev) => new Set([...prev, obj.id]))}
									/>
								</Box>
							))}
						</Box>
					</Box>
				)}
			</Box>

			{/* Footer */}
			<Box
				alignItems="center"
				borderT="1"
				borderColor="border.tertiary"
				display="flex"
				gap="8"
				p="12"
			>
				<Button
					appearance="default"
					size="md"
					icon={<IconDownload size={14} />}
					aria-label="Download"
				/>
				<Button
					appearance="primary"
					size="md"
					style={{ flex: 1 }}
					onClick={onManageAllTags}
				>
					Manage Tags
				</Button>
			</Box>
		</Box>
	);
}
