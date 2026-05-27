"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Text } from "@optiaxiom/react";
import {
	IconArrowUpRightFromSquare,
	IconCopy,
	IconEllipsisStroke as IconEllipsis,
	IconPaintRoller,
} from "@optimizely/axiom-icons";
import { StatusBadge } from "./StatusBadge";
import type { BrandPack } from "../types";

type BrandPackCardProps = {
	pack: BrandPack;
};

export function BrandPackCard({ pack }: BrandPackCardProps) {
	const router = useRouter();
	const [hovered, setHovered] = useState(false);

	const isActive = pack.status === "active";
	const isArchived = pack.status === "archived";
	const thumbs = pack.templates.slice(0, 3);
	const heroThumb = pack.templates[0];

	/** Convert ratio string to CSS padding-top % for intrinsic-size boxes */
	const ratioPaddingTop = (ratio: string): string => {
		const map: Record<string, string> = {
			"1:1": "100%", "4:5": "125%", "4:3": "75%",
			"16:9": "56.25%", "9:16": "177.78%", "Story": "177.78%",
		};
		return map[ratio] ?? "56.25%";
	};

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor={isActive ? "border.accent" : "border.tertiary"}
			display="flex"
			flexDirection="column"
			overflow="hidden"
			rounded="xl"
			style={{
				boxShadow: hovered && !isArchived ? "var(--ax-boxShadow-md)" : "var(--ax-boxShadow-sm)",
				cursor: "pointer",
				opacity: isArchived ? 0.65 : 1,
				transform: hovered && !isArchived ? "translateY(-2px)" : "none",
				transition: "box-shadow 0.18s ease, transform 0.18s ease, opacity 0.15s ease",
			}}
			onClick={() => router.push(`/opal/brand-packs/${pack.id}`)}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{/* Hero thumbnail at natural aspect ratio + 2-thumb strip below */}
			{heroThumb ? (
				<Box overflow="hidden" style={{ position: "relative" }}>
					{/* Main hero image — natural aspect ratio, max 220px tall */}
					<Box
						overflow="hidden"
						style={{
							position: "relative",
							paddingTop: `min(${ratioPaddingTop(heroThumb.ratio)}, 220px)`,
						}}
					>
						<img
							alt={heroThumb.name}
							src={heroThumb.thumb}
							style={{
								bottom: 0,
								display: "block",
								height: "100%",
								left: 0,
								objectFit: "cover",
								position: "absolute",
								right: 0,
								top: 0,
								width: "100%",
							}}
						/>
					</Box>
					{/* Supporting strip — remaining templates at 56px */}
					{thumbs.length > 1 && (
						<Box
							display="grid"
							style={{
								gridTemplateColumns: `repeat(${thumbs.length - 1}, 1fr)`,
								height: 52,
								borderTop: "1px solid var(--ax-colors-border-tertiary)",
							}}
						>
							{thumbs.slice(1).map((t) => (
								<Box
									key={t.id}
									style={{
										height: 52,
										overflow: "hidden",
										borderRight: "1px solid var(--ax-colors-border-tertiary)",
									}}
								>
									<img
										alt={t.name}
										src={t.thumb}
										style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }}
									/>
								</Box>
							))}
						</Box>
					)}
				</Box>
			) : (
				<Box
					alignItems="center"
					bg="bg.secondary"
					display="flex"
					justifyContent="center"
					style={{ height: 120 }}
				>
					<IconPaintRoller style={{ color: "var(--ax-colors-fg-tertiary)" }} />
				</Box>
			)}

			{/* Card body */}
			<Box display="flex" flexDirection="column" gap="10" p="16">
				{/* Header row */}
				<Box alignItems="start" display="flex" gap="8" justifyContent="space-between">
					<Box display="flex" flexDirection="column" gap="2" style={{ minWidth: 0 }}>
						<Text
							fontWeight="600"
							style={{
								fontSize: 14,
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
							}}
						>
							{pack.name}
						</Text>
						<Text color="fg.tertiary" fontSize="xs">
							{pack.typography.heading} · {pack.templateCount} templates
						</Text>
					</Box>
					<StatusBadge status={pack.status} />
				</Box>

				{/* Channel tags */}
				<Box display="flex" gap="4" style={{ flexWrap: "wrap" }}>
					{pack.channels.map((ch) => (
						<Box
							key={ch}
							bg="bg.secondary"
							rounded="full"
							style={{ padding: "2px 8px" }}
						>
							<Text color="fg.secondary" fontSize="xs">
								{ch}
							</Text>
						</Box>
					))}
				</Box>

				{/* Footer */}
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Text color="fg.tertiary" fontSize="xs">
						Updated {new Date(pack.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
					</Text>
					{hovered && !isArchived && (
						<Box alignItems="center" display="flex" gap="4">
							<Button
								appearance="subtle"
								size="sm"
								icon={<IconCopy />}
								aria-label="Duplicate pack"
								onClick={(e) => e.stopPropagation()}
							/>
							<Button
								appearance="subtle"
								size="sm"
								icon={<IconArrowUpRightFromSquare />}
								aria-label="Open pack"
								onClick={(e) => {
									e.stopPropagation();
									router.push(`/opal/brand-packs/${pack.id}`);
								}}
							/>
							<Button
								appearance="subtle"
								size="sm"
								icon={<IconEllipsis />}
								aria-label="More options"
								onClick={(e) => e.stopPropagation()}
							/>
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	);
}

export function NewBrandPackCard({ onClick }: { onClick: () => void }) {
	const [hovered, setHovered] = useState(false);

	return (
		<Box
			alignItems="center"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			gap="12"
			justifyContent="center"
			rounded="xl"
			style={{
				boxShadow: hovered ? "var(--ax-boxShadow-sm)" : "none",
				borderStyle: "dashed",
				cursor: "pointer",
				minHeight: 220,
				padding: "32px 24px",
				transform: hovered ? "translateY(-2px)" : "none",
				transition: "box-shadow 0.18s ease, transform 0.18s ease",
			}}
			onClick={onClick}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<Box
				alignItems="center"
				bg={hovered ? "bg.accent.subtle" : "bg.secondary"}
				display="flex"
				justifyContent="center"
				rounded="xl"
				style={{
					height: 48,
					width: 48,
					transition: "background 0.18s ease",
				}}
			>
				<IconPaintRoller style={{ color: hovered ? "var(--ax-colors-fg-accent)" : "var(--ax-colors-fg-secondary)" }} />
			</Box>
			<Box display="flex" flexDirection="column" gap="4" style={{ textAlign: "center" }}>
				<Text fontWeight="600" style={{ fontSize: 14 }}>
					New Brand Pack
				</Text>
				<Text color="fg.secondary" fontSize="xs">
					Opal · Figma · Manual
				</Text>
			</Box>
		</Box>
	);
}
