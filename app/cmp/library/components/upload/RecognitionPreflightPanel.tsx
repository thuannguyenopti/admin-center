"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Badge, Box, Button, Input, Text } from "@optiaxiom/react";
import {
	IconArrowsLeftRight,
	IconCheck,
	IconLink,
	IconShieldCheck,
	IconTag,
	IconUserGroup,
	IconUserPlus,
	IconUserXmark,
} from "@optimizely/axiom-icons";
import type { OpalRecommendation } from "@/app/shared/types/opal";
import { AiBanner, AiBannerOrb } from "../AiBanner";
import type { UploadAsset, UploadFace } from "./types";

const RECOMMENDATION_BADGE: Record<OpalRecommendation, { label: string; intent: "success" | "warning" | "danger" }> = {
	approve: { label: "Recommend approve", intent: "success" },
	flag: { label: "Needs review", intent: "warning" },
	reject: { label: "Recommend reject", intent: "danger" },
};

type Props = {
	asset: UploadAsset;
	onStatusChange: (message: string) => void;
};

export function RecognitionPreflightPanel({ asset, onStatusChange }: Props) {
	const [namedFaces, setNamedFaces] = useState<Record<string, string>>({});
	const [draftNames, setDraftNames] = useState<Record<string, string>>({});
	const [removedFaces, setRemovedFaces] = useState<Set<string>>(() => new Set());
	const [acceptedTags, setAcceptedTags] = useState(true);
	const visibleFaces = asset.faces.filter((face) => !removedFaces.has(face.id));

	const setDraftName = (faceId: string, value: string) => {
		setDraftNames((current) => ({ ...current, [faceId]: value }));
	};

	const confirmFaceName = (face: UploadFace) => {
		const nextName = draftNames[face.id]?.trim();
		if (!nextName) return;
		setNamedFaces((current) => ({ ...current, [face.id]: nextName }));
		onStatusChange(`${nextName} will be applied when this asset uploads.`);
	};

	return (
		<Box display="flex" flexDirection="column" gap="16">
			<AiBanner>
				<AiBannerOrb />
				<Box display="flex" flex="1" flexDirection="column" gap="2">
					<Text fontSize="sm" fontWeight="600">
						Opal preflight scan
					</Text>
					<Text color="fg.secondary" fontSize="sm">
						{asset.summary}
					</Text>
				</Box>
				<Box style={{ flexShrink: 0 }}>
					<Badge intent={RECOMMENDATION_BADGE[asset.recommendation].intent}>
						{RECOMMENDATION_BADGE[asset.recommendation].label}
					</Badge>
				</Box>
			</AiBanner>

			<Box display="flex" flexDirection="column" gap="8">
				<SectionTitle icon={<IconShieldCheck size={15} />} title="Brand compliance" />
				{asset.brandFlags.length === 0 ? (
					<Box bg="bg.default" border="1" borderColor="border.tertiary" p="10" rounded="md">
						<Box alignItems="center" display="flex" gap="8">
							<IconCheck size={13} style={{ color: "var(--ax-colors-fg-success)", flexShrink: 0 }} />
							<Text fontSize="sm" fontWeight="600">No brand issues detected</Text>
						</Box>
						<Text color="fg.secondary" fontSize="sm" style={{ marginTop: 4 }}>
							Colour palette, logo usage, and typography all within Stride guidelines. Score {asset.brandScore}/100.
						</Text>
					</Box>
				) : (
					asset.brandFlags.map((flag, i) => (
						<Box
							key={i}
							bg="bg.default"
							border="1"
							borderColor={flag.severity === "high" ? "border.error" : "border.warning"}
							p="10"
							rounded="md"
						>
							<Box alignItems="center" display="flex" gap="8" justifyContent="space-between">
								<Badge intent={flag.severity === "high" ? "danger" : "warning"}>{flag.category}</Badge>
								<Text color="fg.tertiary" fontSize="sm">Score {asset.brandScore}/100</Text>
							</Box>
							<Text color="fg.secondary" fontSize="sm" style={{ marginTop: 6 }}>
								{flag.detail}
							</Text>
						</Box>
					))
				)}
			</Box>

			{asset.status === "duplicate" || asset.status === "similar" ? (
				<Box display="flex" flexDirection="column" gap="8">
					<SectionTitle icon={<IconLink size={15} />} title="Library match" />
					<Box bg="bg.default" border="1" borderColor="border.tertiary" p="10" rounded="md">
						<Text fontSize="sm" fontWeight="600">
							{asset.duplicateOf ?? asset.similarTo}
						</Text>
						<Text color="fg.secondary" fontSize="sm">
							{asset.status === "duplicate"
								? "Exact visual match. Recommended: skip upload and preserve the existing asset."
								: "Similar composition. Recommended: upload as a variant so campaign history stays connected."}
						</Text>
						<Box display="flex" flexWrap="wrap" gap="6" mt="10">
							<Button
								appearance="default"
								size="sm"
								icon={<IconCheck size={12} />}
								iconPosition="start"
								onClick={() =>
									onStatusChange(
										asset.status === "duplicate"
											? "Duplicate will be skipped and metadata merged into the existing asset."
											: "Similar asset will upload as a linked variant.",
									)
								}
							>
								Use recommendation
							</Button>
							<Button
								appearance="default"
								size="sm"
								icon={<IconArrowsLeftRight size={12} />}
								iconPosition="start"
								onClick={() => onStatusChange("Upload will continue as a separate asset.")}
							>
								Upload separately
							</Button>
						</Box>
					</Box>
				</Box>
			) : null}

			<Box display="flex" flexDirection="column" gap="8">
				<SectionTitle icon={<IconUserGroup size={15} />} title="Detected people" />
				{visibleFaces.map((face) => {
					const confirmedName = namedFaces[face.id];
					const isUnknown = face.status === "unknown" && !confirmedName;
					return (
						<Box
							key={face.id}
							bg="bg.default"
							border="1"
							borderColor={isUnknown ? "border.warning" : "border.tertiary"}
							display="flex"
							flexDirection="column"
							gap="8"
							p="10"
							rounded="md"
						>
							<Box alignItems="center" display="flex" gap="10">
								<Box
									bg="bg.secondary"
									rounded="full"
									style={{ height: 40, overflow: "hidden", width: 40 }}
								>
									<img
										alt=""
										src={face.image}
										style={{
											display: "block",
											height: "100%",
											objectFit: "cover",
											width: "100%",
										}}
									/>
								</Box>
								<Box display="flex" flex="1" flexDirection="column" gap="2">
									<Text fontSize="sm" fontWeight="600">
										{confirmedName ?? face.name}
									</Text>
									<Box alignItems="center" display="flex" gap="6">
										<Badge intent={face.status === "known" || confirmedName ? "success" : "warning"}>
											{face.confidencePct}% match
										</Badge>
										<Text color="fg.secondary" fontSize="sm">
											{face.status === "known" || confirmedName ? "will tag person" : "needs a name"}
										</Text>
									</Box>
								</Box>
								<Button
									appearance="subtle"
									size="sm"
									icon={<IconUserXmark size={13} />}
									aria-label={`Remove ${face.name}`}
									onClick={() => {
										setRemovedFaces((current) => new Set([...current, face.id]));
										onStatusChange(`${face.name} removed from upload metadata.`);
									}}
								/>
							</Box>
							{isUnknown ? (
								<Box alignItems="center" display="flex" gap="6">
									<Input
										placeholder="Name this person before upload..."
										size="md"
										value={draftNames[face.id] ?? ""}
										onChange={(event) => setDraftName(face.id, event.target.value)}
										onKeyDown={(event) => {
											if (event.key === "Enter") confirmFaceName(face);
										}}
									/>
									<Button
										appearance="default"
										size="sm"
										icon={<IconUserPlus size={12} />}
										iconPosition="start"
										disabled={!draftNames[face.id]?.trim()}
										onClick={() => confirmFaceName(face)}
									>
										Name
									</Button>
								</Box>
							) : null}
						</Box>
					);
				})}
			</Box>

			<Box display="flex" flexDirection="column" gap="8">
				<SectionTitle icon={<IconTag size={15} />} title="Objects and smart tags" />
				<Box display="flex" flexWrap="wrap" gap="6">
					{asset.objects.map((object) => (
						<Badge key={object.id} intent="neutral">
							{object.label} {object.confidencePct}%
						</Badge>
					))}
				</Box>
				<Box display="flex" flexWrap="wrap" gap="6">
					{asset.tags.map((tag) => (
						<Badge key={tag} intent={acceptedTags ? "success" : "neutral"}>
							{tag}
						</Badge>
					))}
				</Box>
				<Button
					appearance="default"
					size="sm"
					icon={<IconCheck size={12} />}
					iconPosition="start"
					onClick={() => {
						setAcceptedTags((current) => !current);
						onStatusChange(
							acceptedTags
								? "Smart tags will stay suggestions only."
								: "Smart tags will be applied during upload.",
						);
					}}
				>
					{acceptedTags ? "Apply tags on upload" : "Keep tags suggested"}
				</Button>
			</Box>
		</Box>
	);
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
	return (
		<Box alignItems="center" display="flex" gap="8">
			<Box style={{ color: "var(--ax-colors-fg-secondary)" }}>{icon}</Box>
			<Text fontSize="sm" fontWeight="600">
				{title}
			</Text>
		</Box>
	);
}
