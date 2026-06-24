"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Box, Button, EllipsisMenuButton, Menu, MenuContent, MenuTrigger, Text } from "@optiaxiom/react";
import { IconCircleExclamation, IconComments } from "@optiaxiom/icons";
import Image from "next/image";
import { type VAU } from "@/app/opal/data/vaus";

const CAPTION = {
	fontFamily: "Roboto Mono, monospace",
	fontSize: 10,
	fontWeight: 400,
	lineHeight: "1.25",
	letterSpacing: "0.36px",
	textTransform: "uppercase" as const,
};

const NEEDS_REVIEW_IDS = new Set(["frank"]);

const ELLIPSIS_OPTIONS = [
	{ label: "Pause" },
	{ label: "Delete", intent: "danger" as const },
];

export function VAUCard({ vau, onSelect }: { vau: VAU; onSelect: (vau: VAU) => void }) {
	const router = useRouter();
	const [hovered, setHovered] = useState(false);
	const needsReview = NEEDS_REVIEW_IDS.has(vau.id);
	const maxTags = 3;
	const visibleTags = vau.tags.slice(0, maxTags);
	const extraTagCount = vau.tags.length - visibleTags.length;

	return (
		<Box
			bg="bg.default"
			style={{
				border: "1px solid var(--ax-colors-border-secondary)",
				borderRadius: 12,
				padding: 20,
				cursor: "pointer",
				display: "flex",
				flexDirection: "column",
				gap: 12,
				boxShadow: hovered
					? "0 0 0 1.5px #A1AC8D, 0 2px 8px rgba(0,0,0,0.06)"
					: "none",
				transition: "box-shadow 0.15s ease",
			}}
			onClick={() => router.push(`/opal/virtual-teammates/${vau.id}`)}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{/* Header */}
			<Box display="flex" alignItems="start" gap="12">
				<Box
					style={{
						width: 64,
						height: 64,
						minWidth: 64,
						borderRadius: 8,
						overflow: "hidden",
						backgroundColor: vau.avatarBg,
						flexShrink: 0,
					}}
				>
					<Image
						src={vau.avatar}
						alt={vau.name}
						width={64}
						height={64}
						unoptimized
						style={{ width: "100%", height: "100%", objectFit: "cover" }}
					/>
				</Box>
				<Box display="flex" flexDirection="column" gap="4" style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
					<Box display="flex" alignItems="start" justifyContent="space-between" gap="8">
						<Text
							style={{
								fontFamily: "var(--ax-font-family-headings, 'VC Nudge', sans-serif)",
								fontSize: 20,
								fontWeight: 600,
								lineHeight: "1.1",
								letterSpacing: "0.4px",
								color: "var(--ax-colors-fg-default)",
							}}
						>
							{vau.name}
						</Text>
						<Box style={{ flexShrink: 0 }}>
							<Badge intent="success" variant="subtle">Active</Badge>
						</Box>
					</Box>
					{vau.characterName && (
						<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)" }}>
							{vau.characterName}
						</span>
					)}
				</Box>
			</Box>

			{/* Description */}
			<Text
				fontSize="sm"
				color="fg.secondary"
				style={{
					lineHeight: "1.5",
					display: "-webkit-box",
					WebkitLineClamp: 3,
					WebkitBoxOrient: "vertical",
					overflow: "hidden",
				}}
			>
				{vau.description}
			</Text>

			{/* Tags */}
			<Box display="flex" alignItems="center" gap="4" style={{ flexWrap: "nowrap", overflow: "hidden" }}>
				{visibleTags.map((tag) => (
					<Badge key={tag.label} intent="neutral" variant="subtle">
						{tag.label}
					</Badge>
				))}
				{extraTagCount > 0 && (
					<Badge intent="neutral" variant="subtle">+{extraTagCount}</Badge>
				)}
			</Box>

			{/* Footer */}
			<Box
				display="flex"
				alignItems="center"
				justifyContent="flex-end"
				gap="8"
				onClick={(e) => e.stopPropagation()}
			>
				{needsReview && (
					<Button
						appearance="danger"
						size="md"
						addonAfter={<IconCircleExclamation />}
						onClick={(e) => {
							e.stopPropagation();
							router.push(`/opal/virtual-teammates/${vau.id}`);
						}}
					>
						Needs review
					</Button>
				)}
				<Button
					appearance="default"
					size="md"
					addonAfter={<IconComments />}
					onClick={(e) => {
						e.stopPropagation();
						router.push("/opal/im");
					}}
				>
					Chat
				</Button>
				<Menu options={ELLIPSIS_OPTIONS}>
					<MenuTrigger asChild>
						<EllipsisMenuButton appearance="subtle" size="md" aria-label="More options" />
					</MenuTrigger>
					<MenuContent />
				</Menu>
			</Box>
		</Box>
	);
}
