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
			shadow="sm"
			style={{
				position: "relative",
				overflow: "hidden",
				display: "flex",
				minHeight: 304,
				background:
					"linear-gradient(115deg, var(--ax-colors-bg-default) 0%, var(--ax-colors-bg-default) 48%, var(--ax-colors-bg-secondary) 100%)",
			}}
		>
			<Box
				display="flex"
				flexDirection="column"
				gap="20"
				p="32"
				style={{
					width: "50%",
					flexShrink: 0,
					position: "relative",
					zIndex: 4,
					background:
						"linear-gradient(to right, var(--ax-colors-bg-default) 0%, var(--ax-colors-bg-default) 82%, transparent 100%)",
				}}
			>
				<Box style={{ width: "fit-content" }}>
					<Box bg="bg.success.subtle" rounded="full" style={{ padding: "3px 10px" }}>
						<Text
							color="fg.success.strong"
							style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0 }}
						>
							ACTIVE PACK
						</Text>
					</Box>
				</Box>

				<Box display="flex" flexDirection="column" gap="8">
					<Text
						fontWeight="700"
						style={{ fontSize: 26, lineHeight: 1.18, color: "var(--ax-colors-fg-default)" }}
					>
						{pack.name}
					</Text>
					<Text color="fg.secondary" style={{ fontSize: 14, lineHeight: 1.6 }}>
						{pack.description}
					</Text>
				</Box>

				<Box style={{ height: 1, width: "88%", background: "var(--ax-colors-border-tertiary)" }} />

				<Box display="flex" gap="32" style={{ maxWidth: 430 }}>
					<Box display="flex" flexDirection="column" gap="6">
						<Text
							color="fg.tertiary"
							style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0, textTransform: "uppercase" }}
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
							style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0, textTransform: "uppercase" }}
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

				<Box alignItems="center" display="flex" gap="24">
					<Box alignItems="center" display="flex" gap="6">
						<IconGrid2 style={{ color: "var(--ax-colors-fg-tertiary)", height: 14, width: 14, flexShrink: 0 }} />
						<Text style={{ fontSize: 13, color: "var(--ax-colors-fg-secondary)", fontWeight: 500 }}>
							{pack.templateCount} Templates
						</Text>
					</Box>
					<Box alignItems="center" display="flex" gap="6">
						<IconCalendarDays style={{ color: "var(--ax-colors-fg-tertiary)", height: 14, width: 14, flexShrink: 0 }} />
						<Text color="fg.secondary" style={{ fontSize: 13 }}>
							Updated {updatedLabel}
						</Text>
					</Box>
				</Box>

				<Box style={{ marginTop: "auto" }}>
					<Button
						appearance="primary"
						size="lg"
						icon={<IconArrowRight />}
						iconPosition="end"
						onClick={() => router.push(`/opal/brand-packs/${pack.id}`)}
					>
						View Brand
					</Button>
				</Box>
			</Box>

			<Box
				style={{
					position: "absolute",
					top: 0,
					bottom: 0,
					left: "41%",
					width: 160,
					background: "linear-gradient(to right, var(--ax-colors-bg-default), transparent)",
					zIndex: 3,
					pointerEvents: "none",
				}}
			/>

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
				<Box
					style={{
						height: 252,
						position: "relative",
						width: "min(58vw, 560px)",
					}}
				>
				{/* Left partial card */}
				{t1 && (
					<Box
						border="1"
						borderColor="border.tertiary"
						shadow="sm"
						style={{
							position: "absolute",
							left: "clamp(28px, 13%, 72px)",
							top: 42,
							width: 214,
							borderRadius: 14,
							overflow: "hidden",
							opacity: 0.72,
							transform: "scale(0.9)",
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
						border="1"
						borderColor="border.tertiary"
						shadow="lg"
						style={{
							left: "50%",
							position: "absolute",
							top: 0,
							transform: "translateX(-50%)",
							width: 252,
							borderRadius: 16,
							overflow: "hidden",
							background: "var(--ax-colors-bg-default)",
							flexShrink: 0,
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
						border="1"
						borderColor="border.tertiary"
						shadow="sm"
						style={{
							position: "absolute",
							right: "clamp(28px, 13%, 72px)",
							top: 42,
							width: 214,
							borderRadius: 14,
							overflow: "hidden",
							opacity: 0.72,
							transform: "scale(0.9)",
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
			</Box>

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
							width: i === 0 ? 8 : 6,
							height: i === 0 ? 8 : 6,
							borderRadius: 999,
							background: i === 0 ? "var(--ax-colors-bg-accent)" : "var(--ax-colors-border-secondary)",
						}}
					/>
				))}
			</Box>
		</Box>
	);
}
