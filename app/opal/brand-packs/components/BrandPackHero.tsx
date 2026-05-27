"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Text } from "@optiaxiom/react";
import {
	IconArrowRight,
	IconCalendarDays,
	IconGrid2,
	IconShareNodes,
	IconBolt,
} from "@optimizely/axiom-icons";
import type { BrandPack } from "../types";

type BrandPackHeroProps = {
	pack: BrandPack;
};

export function BrandPackHero({ pack }: BrandPackHeroProps) {
	const router = useRouter();

	const t0 = pack.templates[0];
	const t1 = pack.templates[1];
	const t2 = pack.templates[2];

	const channels = pack.channels.join(" • ");
	const tone = pack.toneKeywords.slice(0, 2).join(" • ");
	const updatedLabel = new Date(pack.updatedAt).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			rounded="xl"
			style={{
				boxShadow: "var(--ax-boxShadow-sm)",
				position: "relative",
				overflow: "hidden",
				display: "flex",
				minHeight: 320,
			}}
		>
			{/* ── LEFT — text content, always on top ── */}
			<Box
				display="flex"
				flexDirection="column"
				gap="24"
				p="32"
				style={{
					width: "52%",
					flexShrink: 0,
					position: "relative",
					zIndex: 4,
					background: "var(--ax-colors-bg-default)",
				}}
			>
				{/* ACTIVE PACK badge */}
				<Box style={{ width: "fit-content" }}>
					<Box bg="bg.accent.subtle" rounded="full" style={{ padding: "3px 10px" }}>
						<Text
							color="fg.accent"
							style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}
						>
							ACTIVE PACK
						</Text>
					</Box>
				</Box>

				{/* Pack name + description */}
				<Box display="flex" flexDirection="column" gap="8">
					<Text
						fontWeight="700"
						style={{ fontSize: 28, lineHeight: 1.15, color: "var(--ax-colors-fg-default)" }}
					>
						{pack.name}
					</Text>
					<Text color="fg.secondary" style={{ fontSize: 14, lineHeight: 1.6 }}>
						{pack.description}
					</Text>
				</Box>

				{/* Divider */}
				<Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)" }} />

				{/* Channels + Tone */}
				<Box display="flex" gap="40">
					<Box display="flex" flexDirection="column" gap="6">
						<Text
							color="fg.tertiary"
							style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}
						>
							Channels
						</Text>
						<Box alignItems="center" display="flex" gap="6">
							<IconShareNodes style={{ color: "var(--ax-colors-fg-tertiary)", height: 13, width: 13, flexShrink: 0 }} />
							<Text style={{ fontSize: 13, color: "var(--ax-colors-fg-default)", fontWeight: 500 }}>
								{channels}
							</Text>
						</Box>
					</Box>
					<Box display="flex" flexDirection="column" gap="6">
						<Text
							color="fg.tertiary"
							style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}
						>
							Tone
						</Text>
						<Box alignItems="center" display="flex" gap="6">
							<IconBolt style={{ color: "var(--ax-colors-fg-tertiary)", height: 13, width: 13, flexShrink: 0 }} />
							<Text style={{ fontSize: 13, color: "var(--ax-colors-fg-default)", fontWeight: 500 }}>
								{tone}
							</Text>
						</Box>
					</Box>
				</Box>

				{/* Count + date */}
				<Box alignItems="center" display="flex" gap="24">
					<Box alignItems="center" display="flex" gap="6">
						<IconGrid2 style={{ color: "var(--ax-colors-fg-tertiary)", height: 14, width: 14, flexShrink: 0 }} />
						<Text style={{ fontSize: 13, color: "var(--ax-colors-fg-default)", fontWeight: 600 }}>
							{pack.templateCount} Templates
						</Text>
					</Box>
					<Box alignItems="center" display="flex" gap="6">
						<IconCalendarDays style={{ color: "var(--ax-colors-fg-tertiary)", height: 14, width: 14, flexShrink: 0 }} />
						<Text color="fg.tertiary" style={{ fontSize: 13 }}>
							Updated {updatedLabel}
						</Text>
					</Box>
				</Box>

				{/* CTA */}
				<Box style={{ marginTop: "auto" }}>
					<Button
						appearance="primary"
						size="md"
						icon={<IconArrowRight />}
						iconPosition="end"
						onClick={() => router.push(`/opal/brand-packs/${pack.id}`)}
					>
						Manage Pack
					</Button>
				</Box>
			</Box>

			{/* ── RIGHT — cards floating over white, no panel ── */}
			{/* Wide fade so cards never bleed over text */}
			<Box
				style={{
					position: "absolute",
					top: 0,
					bottom: 0,
					left: "38%",
					width: 140,
					background: "linear-gradient(to right, var(--ax-colors-bg-default), transparent)",
					zIndex: 3,
					pointerEvents: "none",
				}}
			/>

			{/* Carousel — starts well after the text column ends */}
			<Box
				style={{
					position: "absolute",
					top: 0,
					right: 0,
					bottom: 0,
					left: "46%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					overflow: "hidden",
					paddingBottom: 32,
				}}
			>
				{/* Left partial card */}
				{t1 && (
					<Box
						style={{
							position: "absolute",
							left: -70,
							width: 230,
							borderRadius: 14,
							overflow: "hidden",
							boxShadow: "var(--ax-boxShadow-sm)",
							opacity: 0.6,
							transform: "scale(0.92)",
						}}
					>
						<img
							alt={t1.name}
							src={t1.thumb}
							style={{ display: "block", width: "100%", aspectRatio: "1", objectFit: "cover" }}
						/>
					</Box>
				)}

				{/* Center — dominant floating card */}
				{t0 && (
					<Box
						style={{
							width: 270,
							borderRadius: 18,
							overflow: "hidden",
							boxShadow: "0 20px 60px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.1)",
							background: "var(--ax-colors-bg-default)",
							flexShrink: 0,
							position: "relative",
							zIndex: 2,
						}}
					>
						<img
							alt={t0.name}
							src={t0.thumb}
							style={{ display: "block", width: "100%", aspectRatio: "1", objectFit: "cover" }}
						/>
					</Box>
				)}

				{/* Right partial card */}
				{t2 && (
					<Box
						style={{
							position: "absolute",
							right: -40,
							width: 230,
							borderRadius: 14,
							overflow: "hidden",
							boxShadow: "var(--ax-boxShadow-sm)",
							opacity: 0.6,
							transform: "scale(0.92)",
						}}
					>
						<img
							alt={t2.name}
							src={t2.thumb}
							style={{ display: "block", width: "100%", aspectRatio: "1", objectFit: "cover" }}
						/>
					</Box>
				)}
			</Box>

			{/* Pagination dots — bottom-center of right half */}
			<Box
				alignItems="center"
				display="flex"
				gap="6"
				style={{
					position: "absolute",
					bottom: 20,
					right: "25%",
					transform: "translateX(50%)",
					zIndex: 3,
				}}
			>
				{[0, 1, 2].map((i) => (
					<Box
						key={i}
						style={{
							width: i === 0 ? 20 : 6,
							height: 6,
							borderRadius: 999,
							background: i === 0 ? "var(--ax-colors-fg-default)" : "var(--ax-colors-border-secondary)",
						}}
					/>
				))}
			</Box>
		</Box>
	);
}
