"use client";

import { Badge, Box, Button, Heading, Input, Text } from "@optiaxiom/react";
import {
	IconCheck,
	IconLink,
	IconUserPlus,
	IconUserSlash,
	IconXmark,
} from "@optimizely/axiom-icons";
import { AiBanner, AiBannerOrb } from "../../components/AiBanner";
import type { PersonItem } from "../../components/people/types";
import type { UnknownFace } from "../data";

type FaceBox = UnknownFace["faceBox"];

type Props = {
	current: UnknownFace;
	draftName: string;
	manualBox: FaceBox | null;
	matchedPerson: PersonItem | null;
	referenceImages: string[];
	onAcceptSuggestion: () => void;
	onChangeDraftName: (value: string) => void;
	onConfirmName: () => void;
	onDismiss: () => void;
	onSkip: () => void;
};

export function ReviewDecisionPanel({
	current,
	draftName,
	manualBox,
	matchedPerson,
	referenceImages,
	onAcceptSuggestion,
	onChangeDraftName,
	onConfirmName,
	onDismiss,
	onSkip,
}: Props) {
	const trimmedName = draftName.trim();
	const hasReferencePreview = trimmedName.length > 0;

	return (
		<Box display="flex" flexDirection="column" gap="16">
			<Box display="flex" flexDirection="column" gap="4">
				<Text fontSize="sm" color="fg.secondary" fontWeight="600">
					Detection metadata
				</Text>
				<Box display="flex" gap="20" pt="4">
					<MetaStat label="Detected in" value={`${current.detectedIn} assets`} />
					<MetaStat label="First seen" value={current.firstSeen} />
				</Box>
			</Box>

			{current.suggestedName ? (
				<AiBanner alignItems="start">
					<AiBannerOrb />
					<Box display="flex" flex="1" flexDirection="column" gap="12">
						<Box display="flex" flexDirection="column" gap="6">
							<Text fontSize="sm" fontWeight="600" color="fg.accent">
								Opal suggestion
							</Text>
							<Box alignItems="center" display="flex" gap="8">
								<Heading level="3" fontSize="xl" style={{ margin: 0 }}>
									{current.suggestedName}
								</Heading>
								<Badge intent="success">
									{current.suggestionConfidencePct}% match
								</Badge>
							</Box>
							<Text fontSize="md" color="fg.secondary">
								Check the reference set before applying this name across matching
								assets.
							</Text>
						</Box>

						{current.otherAppearances && current.otherAppearances.length > 0 ? (
							<ReferenceStrip images={current.otherAppearances} label="Suggested references" />
						) : null}

						<Button
							appearance="default-opal"
							size="md"
							icon={<IconCheck size={14} />}
							iconPosition="start"
							style={{ width: "100%" }}
							onClick={onAcceptSuggestion}
						>
							Accept &amp; tag {current.detectedIn} assets
						</Button>
					</Box>
				</AiBanner>
			) : (
				<Box
					alignItems="center"
					bg="bg.secondary"
					display="flex"
					gap="10"
					p="12"
					rounded="md"
				>
					<IconUserSlash size={16} style={{ color: "var(--ax-colors-fg-secondary)" }} />
					<Text fontSize="md" color="fg.secondary">
						No confident match found. Add a name to create or update a person profile.
					</Text>
				</Box>
			)}

			<Box
				bg="bg.default"
				border="1"
				borderColor={manualBox ? "border.accent" : "border.tertiary"}
				display="flex"
				flexDirection="column"
				gap="12"
				p="16"
				rounded="md"
				style={{
					boxShadow: manualBox ? "0 0 0 1px var(--ax-colors-border-accent)" : undefined,
				}}
			>
				<Box display="flex" flexDirection="column" gap="4">
					<Text fontSize="sm" color="fg.secondary" fontWeight="600">
						Manual tag
					</Text>
					<Text fontSize="md" color="fg.secondary">
						{manualBox
							? "Face selected. Name it here, then review references before saving."
							: "Click any face in the image, or name the current detection below."}
					</Text>
				</Box>

				<Box display="flex" gap="8">
					<Input
						placeholder="Type a person's name..."
						size="lg"
						value={draftName}
						onChange={(e) => onChangeDraftName(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") onConfirmName();
						}}
						style={{ flex: 1 }}
					/>
					<Button
						appearance="default"
						size="lg"
						icon={<IconUserPlus size={16} />}
						iconPosition="start"
						onClick={onConfirmName}
						disabled={!trimmedName}
					>
						Name it
					</Button>
				</Box>

				{hasReferencePreview ? (
					<Box
						bg="bg.secondary"
						display="flex"
						flexDirection="column"
						gap="10"
						p="12"
						rounded="md"
					>
						<Box display="flex" flexDirection="column" gap="2">
							<Text fontSize="md" fontWeight="600">
								{matchedPerson
									? `Existing person: ${matchedPerson.name}`
									: `New person profile: ${trimmedName}`}
							</Text>
							<Text fontSize="sm" color="fg.secondary">
								{matchedPerson
									? `${matchedPerson.appearsInAssets} known assets are available to compare before assigning.`
									: "Opal will start a new face group and queue similar references for review."}
							</Text>
						</Box>
						<ReferenceStrip images={referenceImages} label="Reference images" />
					</Box>
				) : null}
			</Box>

			<Box display="flex" gap="6" pt="4">
				<Button
					appearance="subtle"
					size="md"
					icon={<IconXmark size={14} />}
					iconPosition="start"
					onClick={onDismiss}
				>
					Dismiss detection
				</Button>
				<Box style={{ flex: 1 }} />
				<Button
					appearance="subtle"
					size="md"
					icon={<IconLink size={14} />}
					iconPosition="start"
				>
					Merge with existing
				</Button>
				<Button appearance="subtle" size="md" onClick={onSkip}>
					Skip for now
				</Button>
			</Box>
		</Box>
	);
}

function MetaStat({ label, value }: { label: string; value: string }) {
	return (
		<Box display="flex" flexDirection="column" gap="2">
			<Text fontSize="sm" color="fg.tertiary">
				{label}
			</Text>
			<Text fontSize="md" fontWeight="500">
				{value}
			</Text>
		</Box>
	);
}

function ReferenceStrip({ images, label }: { images: string[]; label: string }) {
	return (
		<Box display="flex" flexDirection="column" gap="6">
			<Text fontSize="sm" color="fg.secondary" fontWeight="500">
				{label}
			</Text>
			<Box display="flex" gap="8" overflow="auto" pb="2">
				{images.slice(0, 5).map((url, i) => (
					<Box
						key={`${url}-${i}`}
						bg="bg.default"
						border="1"
						borderColor="border.tertiary"
						rounded="md"
						style={{
							width: 64,
							height: 64,
							overflow: "hidden",
							flexShrink: 0,
						}}
					>
						<img
							alt=""
							src={url}
							style={{
								display: "block",
								height: "100%",
								width: "100%",
								objectFit: "cover",
							}}
						/>
					</Box>
				))}
			</Box>
		</Box>
	);
}
