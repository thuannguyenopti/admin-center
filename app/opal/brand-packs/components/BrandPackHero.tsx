"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Text } from "@optiaxiom/react";
import { IconArrowUpRightFromSquare, IconCheck } from "@optimizely/axiom-icons";
import { ColorPalette } from "./ColorSwatchBar";
import type { BrandPack } from "../types";

type BrandPackHeroProps = {
	pack: BrandPack;
};

export function BrandPackHero({ pack }: BrandPackHeroProps) {
	const router = useRouter();
	const thumbs = pack.templates.slice(0, 3);
	const heroThumb = pack.templates[0];

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
			borderColor="border.tertiary"
			overflow="hidden"
			rounded="xl"
			shadow="sm"
		>
			{/* Hero template at natural ratio, capped at 200px; supporting strip below */}
			{heroThumb && (
				<>
					<Box
						overflow="hidden"
						style={{ position: "relative", paddingTop: `min(${ratioPaddingTop(heroThumb.ratio)}, 200px)` }}
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
					{thumbs.length > 1 && (
						<Box
							display="grid"
							style={{
								gridTemplateColumns: `repeat(${thumbs.length - 1}, 1fr)`,
								height: 60,
								borderTop: "1px solid var(--ax-colors-border-tertiary)",
							}}
						>
							{thumbs.slice(1).map((t) => (
								<Box key={t.id} style={{ height: 60, overflow: "hidden", borderRight: "1px solid var(--ax-colors-border-tertiary)" }}>
									<img
										alt={t.name}
										src={t.thumb}
										style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }}
									/>
								</Box>
							))}
						</Box>
					)}
				</>
			)}

			<Box
				alignItems="center"
				display="flex"
				gap="24"
				justifyContent="space-between"
				p="20"
				style={{ flexWrap: "wrap" }}
			>
				{/* Left: name + ACTIVE badge */}
				<Box display="flex" flexDirection="column" gap="4">
					<Box alignItems="center" display="flex" gap="8">
						<Text fontWeight="700" style={{ fontSize: 17 }}>
							{pack.name}
						</Text>
						<Box
							alignItems="center"
							bg="bg.accent"
							display="inline-flex"
							gap="4"
							rounded="full"
							style={{ padding: "2px 10px" }}
						>
							<IconCheck size={10} style={{ color: "var(--ax-colors-fg-default-inverse)" }} />
							<Text style={{ color: "var(--ax-colors-fg-default-inverse)", fontSize: 11, fontWeight: 600 }}>
								ACTIVE
							</Text>
						</Box>
					</Box>
					<Text color="fg.secondary" fontSize="sm">
						{pack.typography.heading} · {pack.templateCount} templates · {pack.channels.join(", ")}
					</Text>
				</Box>

				{/* Center: color palette + meta */}
				<Box alignItems="center" display="flex" gap="16">
					<ColorPalette colors={pack.colors} size="sm" />
					<Box style={{ width: 1, height: 32, background: "var(--ax-colors-border-tertiary)" }} />
					<Box display="flex" flexDirection="column" gap="2">
						<Text color="fg.tertiary" fontSize="xs" fontWeight="600" style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
							Typography
						</Text>
						<Text fontWeight="500" style={{ fontSize: 13 }}>
							{pack.typography.heading}
						</Text>
					</Box>
					<Box style={{ width: 1, height: 32, background: "var(--ax-colors-border-tertiary)" }} />
					<Box display="flex" flexDirection="column" gap="2">
						<Text color="fg.tertiary" fontSize="xs" fontWeight="600" style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
							Tone
						</Text>
						<Text fontWeight="500" style={{ fontSize: 13 }}>
							{pack.toneKeywords.slice(0, 2).join(", ")}
						</Text>
					</Box>
				</Box>

				{/* Right: CTA */}
				<Button
					appearance="default"
					size="sm"
					icon={<IconArrowUpRightFromSquare />}
					iconPosition="end"
					onClick={() => router.push(`/opal/brand-packs/${pack.id}`)}
				>
					Manage
				</Button>
			</Box>
		</Box>
	);
}
