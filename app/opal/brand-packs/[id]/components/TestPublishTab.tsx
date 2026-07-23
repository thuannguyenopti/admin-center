"use client";

import { useState } from "react";
import { Box, Button, Text, Textarea } from "@optiaxiom/react";
import { IconCheck, IconSparkles } from "@optimizely/axiom-icons";
import type { BrandPack } from "../../types";

type TestPublishTabProps = {
	pack: BrandPack;
};

type CheckItem = {
	id: string;
	label: string;
	description: string;
	passed: boolean;
	blocking: boolean;
};

function segmentColor(item: CheckItem): string {
	if (item.passed) return "var(--ax-colors-fg-success)";
	if (item.blocking) return "#DC2626";
	return "var(--ax-colors-border-default)";
}

function statusLabel(item: CheckItem): string {
	if (item.passed) return "Ready";
	if (item.blocking) return "Required";
	return "Optional";
}

function statusColor(item: CheckItem): string {
	if (item.passed) return "var(--ax-colors-fg-success)";
	if (item.blocking) return "#DC2626";
	return "var(--ax-colors-fg-tertiary)";
}

function ReadinessBar({ checks }: { checks: CheckItem[] }) {
	const passed = checks.filter((c) => c.passed).length;
	const total = checks.length;

	return (
		<Box display="flex" flexDirection="column" gap="12">
			{/* Score */}
			<Box alignItems="center" display="flex" justifyContent="space-between">
				<Text fontWeight="600" style={{ fontSize: 14 }}>Readiness check</Text>
				<Text color="fg.tertiary" fontSize="sm">
					{passed} of {total} ready
				</Text>
			</Box>

			{/* Segmented bar */}
			<Box display="flex" gap="4">
				{checks.map((check) => (
					<Box
						key={check.id}
						rounded="sm"
						style={{
							background: segmentColor(check),
							flex: 1,
							height: 12,
							transition: "background 0.3s",
						}}
					/>
				))}
			</Box>

			{/* Labels under each segment */}
			<Box display="flex" gap="4">
				{checks.map((check) => (
					<Box
						key={check.id}
						display="flex"
						flexDirection="column"
						gap="2"
						style={{ flex: 1, textAlign: "center" }}
					>
						<Text
							style={{
								fontSize: 11,
								fontWeight: 500,
								lineHeight: 1.3,
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
							}}
						>
							{check.label}
						</Text>
						<Text style={{ color: statusColor(check), fontSize: 10, fontWeight: 600 }}>
							{statusLabel(check)}
						</Text>
					</Box>
				))}
			</Box>

			{/* Description row for failed items */}
			{checks.some((c) => !c.passed) && (
				<Box
					display="flex"
					flexDirection="column"
					gap="6"
					rounded="lg"
					style={{
						background: "var(--ax-colors-bg-secondary)",
						marginTop: 4,
						padding: "10px 14px",
					}}
				>
					{checks.filter((c) => !c.passed).map((check) => (
						<Box key={check.id} alignItems="start" display="flex" gap="8">
							<Box
								rounded="full"
								style={{
									background: check.blocking ? "#DC2626" : "var(--ax-colors-border-default)",
									flexShrink: 0,
									height: 6,
									marginTop: 5,
									width: 6,
								}}
							/>
							<Box>
								<Text style={{ color: check.blocking ? "#DC2626" : "var(--ax-colors-fg-secondary)", fontSize: 12, fontWeight: 500 }}>
									{check.label}
								</Text>
								<Text color="fg.tertiary" style={{ fontSize: 11 }}>{check.description}</Text>
							</Box>
						</Box>
					))}
				</Box>
			)}
		</Box>
	);
}

export function TestPublishTab({ pack }: TestPublishTabProps) {
	const [published, setPublished] = useState(false);
	const [testing, setTesting] = useState(false);
	const [testResult, setTestResult] = useState<string | null>(null);
	const [prompt, setPrompt] = useState("");

	const hasColors = pack.colors.length > 0;
	const hasTypography = !!pack.typography.heading;
	const hasLogo = pack.assets.some((a) => a.type === "logo");
	const hasToneKeywords = pack.toneKeywords.length > 0;
	const hasBrandBrief = pack.brandBrief.length > 20;

	const checks: CheckItem[] = [
		{
			id: "colours",
			label: "Colours",
			description: `${pack.colors.length} colour${pack.colors.length !== 1 ? "s" : ""} configured`,
			passed: hasColors,
			blocking: true,
		},
		{
			id: "typography",
			label: "Typography",
			description: hasTypography
				? `${pack.typography.heading} · ${pack.typography.body}`
				: "Add at least one typeface",
			passed: hasTypography,
			blocking: true,
		},
		{
			id: "tone",
			label: "Tone of Voice",
			description: hasToneKeywords
				? pack.toneKeywords.join(", ")
				: "Add keywords to guide Opal's language",
			passed: hasToneKeywords,
			blocking: true,
		},
		{
			id: "logo",
			label: "Logo",
			description: hasLogo
				? `${pack.assets.filter((a) => a.type === "logo").length} logo file${pack.assets.filter((a) => a.type === "logo").length !== 1 ? "s" : ""}`
				: "A logo improves output quality",
			passed: hasLogo,
			blocking: false,
		},
		{
			id: "brief",
			label: "Brand Brief",
			description: hasBrandBrief
				? "Brand narrative present"
				: "Write a brief to improve accuracy",
			passed: hasBrandBrief,
			blocking: false,
		},
	];

	const blocking = checks.filter((c) => c.blocking && !c.passed);
	const canPublish = blocking.length === 0;

	const handleTest = () => {
		if (!prompt.trim()) return;
		setTesting(true);
		setTestResult(null);
		setTimeout(() => {
			setTesting(false);
			setTestResult(
				`Acme Corporation is proud to introduce our latest innovation — built on years of precision engineering and deep customer insight. Designed for those who expect more, it delivers exactly that.\n\nClean lines. Purposeful design. Real results.\n\nLearn more at acme.com`
			);
		}, 2200);
	};

	return (
		<Box display="flex" flexDirection="column" gap="20" style={{ maxWidth: 680 }}>
			{/* Readiness card */}
			<Box
				bg="bg.default"
				border="1"
				borderColor="border.tertiary"
				p="20"
				rounded="xl"
				shadow="sm"
			>
				<ReadinessBar checks={checks} />
			</Box>

			{/* Test with Opal */}
			<Box
				bg="bg.default"
				border="1"
				borderColor="border.tertiary"
				display="flex"
				flexDirection="column"
				gap="16"
				p="20"
				rounded="xl"
				shadow="sm"
			>
				<Box display="flex" flexDirection="column" gap="4">
					<Text fontWeight="600" style={{ fontSize: 14 }}>Test with Opal</Text>
					<Text color="fg.secondary" fontSize="sm">
						Write a prompt and generate sample content using this brand pack
					</Text>
				</Box>

				<Textarea
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					placeholder="e.g. Write a short LinkedIn post announcing our new product launch, focusing on performance and design…"
					rows={4}
					style={{ lineHeight: 1.6 }}
				/>

				<Box alignItems="center" display="flex" gap="12">
					<Button
						appearance="primary"
						size="sm"
						icon={<IconSparkles />}
						onClick={handleTest}
						style={{ opacity: prompt.trim() ? 1 : 0.5, cursor: prompt.trim() ? "pointer" : "default" }}
					>
						{testing ? "Generating…" : "Run test generation"}
					</Button>
					{testing && (
						<Text color="fg.tertiary" fontSize="xs">This will take a moment…</Text>
					)}
				</Box>

				{testResult && (
					<Box
						display="flex"
						flexDirection="column"
						gap="8"
						rounded="lg"
						style={{
							background: "var(--ax-colors-bg-secondary)",
							border: "1px solid var(--ax-colors-border-tertiary)",
							padding: "14px 16px",
						}}
					>
						<Text color="fg.tertiary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
							Generated output
						</Text>
						<Text color="fg.secondary" fontSize="sm" style={{ lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
							{testResult}
						</Text>
					</Box>
				)}
			</Box>

			{/* Publish */}
			<Box
				bg={canPublish ? "bg.default" : "bg.secondary"}
				border="1"
				borderColor="border.tertiary"
				display="flex"
				flexDirection="column"
				gap="16"
				p="20"
				rounded="xl"
				shadow={canPublish ? "sm" : undefined}
			>
				{published ? (
					<Box alignItems="center" display="flex" gap="12">
						<Box
							alignItems="center"
							bg="bg.success.subtle"
							display="flex"
							justifyContent="center"
							rounded="full"
							style={{ flexShrink: 0, height: 32, width: 32 }}
						>
							<IconCheck size={14} style={{ color: "var(--ax-colors-fg-success-strong)" }} />
						</Box>
						<Box display="flex" flexDirection="column" gap="2">
							<Text fontWeight="600" style={{ color: "var(--ax-colors-fg-success)", fontSize: 14 }}>
								Published
							</Text>
							<Text color="fg.tertiary" fontSize="xs">
								This brand pack is active and available to Opal
							</Text>
						</Box>
					</Box>
				) : (
					<>
						<Box display="flex" flexDirection="column" gap="4">
							<Text fontWeight="600" style={{ fontSize: 14 }}>
								{canPublish ? "Ready to publish" : "Complete required items to publish"}
							</Text>
							<Text color="fg.secondary" fontSize="sm">
								{canPublish
									? "Once published, Opal will use this brand pack for all matching content generation."
									: `${blocking.length} required item${blocking.length !== 1 ? "s" : ""} must be completed before publishing.`}
							</Text>
						</Box>
						<Box>
							<Button
								appearance={canPublish ? "primary" : "default"}
								size="md"
								onClick={() => canPublish && setPublished(true)}
								style={{ cursor: canPublish ? "pointer" : "default", opacity: canPublish ? 1 : 0.5 }}
							>
								Publish brand pack
							</Button>
						</Box>
					</>
				)}
			</Box>
		</Box>
	);
}
