"use client";

import { Box, Field, Heading, Input, Textarea } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { IconCheck, IconCopy, IconSparkles } from "@optimizely/axiom-icons";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DamBreadcrumb } from "../../components/DamBreadcrumb";
import { getOpalBriefSuggestion, type OpalBriefSuggestion } from "../data";
import { addDropZone } from "../dropZones";

type Phase = "brief" | "review" | "created";

const FILE_TYPE_OPTIONS = ["JPG", "PNG", "RAW", "MP4", "PDF"];

const BREADCRUMB = [
	{ label: "DAM", href: "/dam/drop-zone" },
	{ label: "Drop Zone", href: "/dam/drop-zone" },
	{ label: "New" },
];

export default function NewDropZonePage() {
	const router = useRouter();
	const [phase, setPhase] = useState<Phase>("brief");
	const [creatorName, setCreatorName] = useState("");
	const [creatorEmail, setCreatorEmail] = useState("");
	const [brief, setBrief] = useState("");
	const [suggestion, setSuggestion] = useState<OpalBriefSuggestion | null>(null);
	const [campaignTag, setCampaignTag] = useState("");
	const [expiresAt, setExpiresAt] = useState("");
	const [maxFileSizeMb, setMaxFileSizeMb] = useState(50);
	const [fileTypes, setFileTypes] = useState<string[]>([]);
	const [copied, setCopied] = useState(false);

	function analyzeBrief() {
		const s = getOpalBriefSuggestion(brief);
		setSuggestion(s);
		setCampaignTag(s.campaignTag);
		setExpiresAt(s.expiresAt);
		setMaxFileSizeMb(s.maxFileSizeMb);
		setFileTypes(s.allowedFileTypes);
		setPhase("review");
	}

	const token = campaignTag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-+|-+$)/g, "") || "campaign";
	// Real internal route, not a cosmetic domain — resolves correctly wherever this
	// prototype is actually deployed (localhost, PR preview, or production), matching
	// the same pattern used for the copy-link action in ../page.tsx.
	const url = typeof window !== "undefined" ? `${window.location.origin}/dam/drop-zone/${token}` : `/dam/drop-zone/${token}`;

	function createDropZone() {
		if (!suggestion) return;
		addDropZone({
			token,
			name: campaignTag,
			brief,
			campaign: campaignTag,
			expiresAt,
			allowedFileTypes: fileTypes,
			maxFileSizeMb,
			requiredFields: suggestion.requiredFields,
			creatorName: creatorName.trim(),
			creatorEmail: creatorEmail.trim(),
		});
		setPhase("created");
	}

	if (phase === "created") {
		return (
			<Box display="flex" flexDirection="column" style={{ height: "100%" }}>
				<DamBreadcrumb segments={BREADCRUMB} />
				<Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap="16" style={{ flex: 1, textAlign: "center" }}>
					<Box alignItems="center" bg="bg.success.subtle" display="flex" justifyContent="center" rounded="full" style={{ width: 56, height: 56 }}>
						<IconCheck size={26} style={{ color: "var(--ax-colors-fg-success)" }} />
					</Box>
					<Box display="flex" flexDirection="column" gap="4">
						<Text color="fg.default" fontWeight="600" fontSize="lg">Drop Zone link created</Text>
						<Text color="fg.secondary" fontSize="md">Share this link with external contributors.</Text>
					</Box>
					<Box bg="bg.secondary" display="flex" alignItems="center" gap="12" px="16" py="10" rounded="md" style={{ marginTop: 8 }}>
						<Text color="fg.default" fontSize="md" style={{ fontFamily: "monospace" }}>{url}</Text>
						<Button
							appearance="subtle"
							size="sm"
							icon={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
							onClick={() => {
								navigator.clipboard?.writeText(url);
								setCopied(true);
								setTimeout(() => setCopied(false), 1500);
							}}
						>
							{copied ? "Copied" : "Copy"}
						</Button>
					</Box>
					<Button appearance="default" size="md" onClick={() => router.push("/dam/drop-zone")} style={{ marginTop: 8 }}>
						Back to Drop Zone
					</Button>
				</Box>
			</Box>
		);
	}

	return (
		<Box display="flex" flexDirection="column" style={{ height: "100%" }}>
			<DamBreadcrumb segments={BREADCRUMB} />
			<Box style={{ flex: 1, overflowY: "auto" }}>
				<Box display="flex" flexDirection="column" gap="24" style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px" }}>
					<Box display="flex" flexDirection="column" gap="4">
						<Heading level="1" fontSize="xl">New Drop Zone link</Heading>
						<Text color="fg.secondary" fontSize="md">
							Describe the campaign brief — OPAL reads it and suggests the link configuration.
						</Text>
					</Box>

					<Box display="flex" gap="16">
						<Box style={{ flex: 1 }}>
							<Field label="Your name" required>
								<Input size="lg" value={creatorName} onChange={(e) => setCreatorName(e.target.value)} disabled={phase === "review"} />
							</Field>
						</Box>
						<Box style={{ flex: 1 }}>
							<Field label="Your email" required>
								<Input size="lg" type="email" value={creatorEmail} onChange={(e) => setCreatorEmail(e.target.value)} disabled={phase === "review"} />
							</Field>
						</Box>
					</Box>

					<Field label="Campaign brief" required>
						<Textarea
							placeholder="e.g. Collecting finish-line and crowd-energy footage from the Autumn Series races for the highlights reel..."
							resize="vertical"
							rows={5}
							value={brief}
							onChange={(e) => setBrief(e.target.value)}
							disabled={phase === "review"}
						/>
					</Field>

					{phase === "brief" && (
						<Button
							appearance="primary"
							size="md"
							icon={<IconSparkles size={16} />}
							disabled={!brief.trim() || !creatorName.trim() || !creatorEmail.trim()}
							onClick={analyzeBrief}
							style={{ alignSelf: "flex-start" }}
						>
							Analyze brief
						</Button>
					)}

					{phase === "review" && suggestion && (
						<>
							<Box bg="bg.accent.subtle" display="flex" alignItems="start" gap="8" px="16" py="12" rounded="md">
								<IconSparkles size={14} style={{ color: "var(--ax-colors-fg-accent)", flexShrink: 0, marginTop: 2 }} />
								<Text color="fg.default" fontSize="sm">
									OPAL suggested the configuration below from your brief. Review and adjust before creating the link.
								</Text>
							</Box>

							<Field label="Campaign tag" required>
								<Input size="lg" value={campaignTag} onChange={(e) => setCampaignTag(e.target.value)} />
							</Field>

							<Field label="Link expires" info="OPAL suggested this from the campaign timeline in your brief.">
								<Input size="lg" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
							</Field>

							<Field label="Allowed file types">
								<Box display="flex" gap="8" style={{ flexWrap: "wrap" }}>
									{FILE_TYPE_OPTIONS.map((type) => {
										const active = fileTypes.includes(type);
										return (
											<Button
												key={type}
												appearance={active ? "primary" : "default"}
												size="sm"
												onClick={() =>
													setFileTypes((prev) =>
														active ? prev.filter((t) => t !== type) : [...prev, type],
													)
												}
											>
												{type}
											</Button>
										);
									})}
								</Box>
							</Field>

							<Field label="Max file size (MB)">
								<Input
									size="lg"
									type="number"
									value={maxFileSizeMb}
									onChange={(e) => setMaxFileSizeMb(Number(e.target.value) || 0)}
								/>
							</Field>

							<Field label="Required submitter fields" info="OPAL pre-selected these based on the brief context.">
								<Box display="flex" flexDirection="column" gap="6">
									{suggestion.requiredFields.map((field) => (
										<Box key={field} display="flex" alignItems="center" gap="8">
											<IconCheck size={13} style={{ color: "var(--ax-colors-fg-success)" }} />
											<Text color="fg.secondary" fontSize="sm">{field}</Text>
										</Box>
									))}
								</Box>
							</Field>

							<Box display="flex" gap="8">
								<Button appearance="primary" size="md" onClick={createDropZone}>
									Create Drop Zone link
								</Button>
								<Button appearance="default" size="md" onClick={() => setPhase("brief")}>
									Back
								</Button>
							</Box>
						</>
					)}
				</Box>
			</Box>
		</Box>
	);
}
