"use client";

import { useState } from "react";
import { Box, Button, Text } from "@optiaxiom/react";
import { IconCheck, IconSparkles, IconTriangleExclamation as IconWarning } from "@optimizely/axiom-icons";
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

function CheckRow({ item }: { item: CheckItem }) {
	return (
		<Box
			alignItems="start"
			display="flex"
			gap="12"
			py="12"
			style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}
		>
			{/* Status icon */}
			<Box
				alignItems="center"
				display="flex"
				justifyContent="center"
				rounded="full"
				style={{
					background: item.passed
						? "var(--ax-colors-bg-success-subtle)"
						: item.blocking
						? "rgba(220, 38, 38, 0.08)"
						: "var(--ax-colors-bg-secondary)",
					flexShrink: 0,
					height: 28,
					width: 28,
				}}
			>
				{item.passed ? (
					<IconCheck size={13} style={{ color: "var(--ax-colors-fg-success)" }} />
				) : item.blocking ? (
					<IconWarning size={13} style={{ color: "#DC2626" }} />
				) : (
					<span
						style={{
							color: "var(--ax-colors-fg-tertiary)",
							fontSize: 13,
							fontWeight: 500,
						}}
					>
						–
					</span>
				)}
			</Box>

			{/* Text */}
			<Box display="flex" flexDirection="column" gap="2" style={{ flex: 1 }}>
				<Text
					fontWeight="500"
					style={{
						color: item.passed
							? "var(--ax-colors-fg-default)"
							: item.blocking
							? "#DC2626"
							: "var(--ax-colors-fg-secondary)",
						fontSize: 14,
					}}
				>
					{item.label}
				</Text>
				<Text color="fg.tertiary" fontSize="xs">
					{item.description}
				</Text>
			</Box>

			{/* Status text */}
			<Text
				fontSize="xs"
				fontWeight="500"
				style={{
					color: item.passed
						? "var(--ax-colors-fg-success)"
						: item.blocking
						? "#DC2626"
						: "var(--ax-colors-fg-tertiary)",
					flexShrink: 0,
				}}
			>
				{item.passed ? "Ready" : item.blocking ? "Required" : "Optional"}
			</Text>
		</Box>
	);
}

export function TestPublishTab({ pack }: TestPublishTabProps) {
	const [published, setPublished] = useState(false);
	const [testing, setTesting] = useState(false);

	const hasColors = pack.colors.length > 0;
	const hasTypography = !!pack.typography.heading;
	const hasLogo = pack.assets.some((a) => a.type === "logo");
	const hasToneKeywords = pack.toneKeywords.length > 0;
	const hasBrandBrief = pack.brandBrief.length > 20;

	const checks: CheckItem[] = [
		{
			id: "colours",
			label: "Color palette defined",
			description: `${pack.colors.length} color${pack.colors.length !== 1 ? "s" : ""} configured`,
			passed: hasColors,
			blocking: true,
		},
		{
			id: "typography",
			label: "Typography configured",
			description: hasTypography
				? `Heading: ${pack.typography.heading}, Body: ${pack.typography.body}`
				: "Add at least one typeface",
			passed: hasTypography,
			blocking: true,
		},
		{
			id: "tone",
			label: "Tone of voice keywords",
			description: hasToneKeywords
				? pack.toneKeywords.join(", ")
				: "Add keywords to guide Opal's language",
			passed: hasToneKeywords,
			blocking: true,
		},
		{
			id: "logo",
			label: "Logo asset uploaded",
			description: hasLogo
				? `${pack.assets.filter((a) => a.type === "logo").length} logo file${pack.assets.filter((a) => a.type === "logo").length !== 1 ? "s" : ""}`
				: "A logo improves branded output quality",
			passed: hasLogo,
			blocking: false,
		},
		{
			id: "brief",
			label: "Brand brief written",
			description: hasBrandBrief
				? "Brand narrative is present"
				: "Write a brief to improve content accuracy",
			passed: hasBrandBrief,
			blocking: false,
		},
	];

	const blocking = checks.filter((c) => c.blocking && !c.passed);
	const canPublish = blocking.length === 0;
	const passed = checks.filter((c) => c.passed).length;
	const total = checks.length;

	const handleTest = () => {
		setTesting(true);
		setTimeout(() => setTesting(false), 2200);
	};

	return (
		<Box display="flex" flexDirection="column" gap="20" style={{ maxWidth: 680 }}>
			{/* Readiness card */}
			<Box
				bg="bg.default"
				border="1"
				borderColor="border.tertiary"
				display="flex"
				flexDirection="column"
				gap="0"
				overflow="hidden"
				rounded="xl"
				shadow="sm"
			>
				{/* Header */}
				<Box
					alignItems="center"
					display="flex"
					gap="16"
					justifyContent="space-between"
					p="20"
					style={{ borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}
				>
					<Box display="flex" flexDirection="column" gap="4">
						<Text fontWeight="600" style={{ fontSize: 14 }}>
							Readiness check
						</Text>
						<Text color="fg.tertiary" fontSize="xs">
							{passed} of {total} items ready
						</Text>
					</Box>

					{/* Progress bar */}
					<Box
						bg="bg.secondary"
						rounded="full"
						style={{ height: 6, overflow: "hidden", width: 120 }}
					>
						<Box
							rounded="full"
							style={{
								background: canPublish
									? "var(--ax-colors-fg-success)"
									: "var(--ax-colors-bg-accent)",
								height: "100%",
								transition: "width 0.4s ease",
								width: `${(passed / total) * 100}%`,
							}}
						/>
					</Box>
				</Box>

				{/* Check list */}
				<Box p="20" style={{ paddingTop: 8 }}>
					{checks.map((item) => (
						<CheckRow key={item.id} item={item} />
					))}
					{/* Remove bottom border from last item */}
					<Box style={{ marginBottom: -1 }} />
				</Box>
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
						Generate sample content using this brand pack before publishing
					</Text>
				</Box>
				<Box alignItems="center" display="flex" gap="12">
					<Button
						appearance="subtle"
						size="sm"
						icon={<IconSparkles />}
						onClick={handleTest}
						style={{ color: testing ? "var(--ax-colors-fg-accent)" : undefined }}
					>
						{testing ? "Generating sample…" : "Run test generation"}
					</Button>
					{testing && (
						<Text color="fg.tertiary" fontSize="xs">
							This will take a moment…
						</Text>
					)}
				</Box>
			</Box>

			{/* Publish / status */}
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
							<IconCheck size={14} style={{ color: "var(--ax-colors-fg-success)" }} />
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
								style={{ opacity: canPublish ? 1 : 0.5, cursor: canPublish ? "pointer" : "default" }}
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
