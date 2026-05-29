"use client";

import { Box, Text } from "@optiaxiom/react";
import { ColorPalette } from "../../components/ColorSwatchBar";
import type { BrandPack } from "../../types";

type OverviewTabProps = {
	pack: BrandPack;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<Text
			color="fg.secondary"
			fontSize="xs"
			fontWeight="600"
			style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}
		>
			{children}
		</Text>
	);
}

function OverviewCard({ children }: { children: React.ReactNode }) {
	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			gap="16"
			p="24"
			rounded="xl"
			shadow="sm"
		>
			{children}
		</Box>
	);
}

export function OverviewTab({ pack }: OverviewTabProps) {
	return (
		<Box display="grid" gap="16" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
			{/* Colors */}
			<OverviewCard>
				<SectionLabel>Color Palette</SectionLabel>
				<ColorPalette colors={pack.colors} size="lg" />
				<Box display="flex" flexDirection="column" gap="8">
					{pack.colors.map((color) => (
						<Box key={color.hex} alignItems="center" display="flex" gap="12">
							<Box
								rounded="md"
								style={{
									background: color.hex,
									border: "1px solid rgba(0,0,0,0.08)",
									height: 24,
									width: 24,
									flexShrink: 0,
								}}
							/>
							<Box display="flex" flexDirection="column" gap="2">
								<Text fontWeight="500" style={{ fontSize: 13 }}>
									{color.name}
								</Text>
								<Text color="fg.tertiary" fontSize="xs">
									{color.hex} · {color.role}
								</Text>
							</Box>
						</Box>
					))}
				</Box>
			</OverviewCard>

			{/* Typography */}
			<OverviewCard>
				<SectionLabel>Typography</SectionLabel>
				<Box display="flex" flexDirection="column" gap="20">
					<Box display="flex" flexDirection="column" gap="6">
						<Text color="fg.tertiary" fontSize="xs">Heading</Text>
						<Text fontWeight="700" style={{ fontSize: 32, lineHeight: 1 }}>
							{pack.typography.heading}
						</Text>
						<Text color="fg.secondary" style={{ fontSize: 13 }}>
							ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
							abcdefghijklmnopqrstuvwxyz<br />
							0123456789
						</Text>
					</Box>
					<Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)" }} />
					<Box display="flex" flexDirection="column" gap="6">
						<Text color="fg.tertiary" fontSize="xs">Body</Text>
						<Text fontWeight="400" style={{ fontSize: 15 }}>
							The quick brown fox jumps over the lazy dog.
						</Text>
						<Text color="fg.secondary" fontSize="xs">
							{pack.typography.body} Regular · 15px / 24px
						</Text>
					</Box>
					{pack.typography.mono && (
						<>
							<Box style={{ height: 1, background: "var(--ax-colors-border-tertiary)" }} />
							<Box display="flex" flexDirection="column" gap="6">
								<Text color="fg.tertiary" fontSize="xs">Monospace</Text>
								<Text style={{ fontFamily: "monospace", fontSize: 13 }}>
									const brand = "stride";
								</Text>
								<Text color="fg.secondary" fontSize="xs">{pack.typography.mono}</Text>
							</Box>
						</>
					)}
				</Box>
			</OverviewCard>

			{/* Tone of Voice */}
			<OverviewCard>
				<SectionLabel>Tone of Voice</SectionLabel>
				<Box display="flex" gap="8" style={{ flexWrap: "wrap" }}>
					{pack.toneKeywords.map((kw) => (
						<Box
							key={kw}
							bg="bg.accent.subtle"
							rounded="full"
							style={{ padding: "6px 14px" }}
						>
							<Text color="fg.accent" fontWeight="500" style={{ fontSize: 13 }}>
								{kw}
							</Text>
						</Box>
					))}
				</Box>
				<Box display="flex" flexDirection="column" gap="4">
					<Text color="fg.tertiary" fontSize="xs">Channels</Text>
					<Box display="flex" gap="6" style={{ flexWrap: "wrap" }}>
						{pack.channels.map((ch) => (
							<Box key={ch} bg="bg.secondary" rounded="full" style={{ padding: "4px 10px" }}>
								<Text color="fg.secondary" fontSize="xs" fontWeight="500">{ch}</Text>
							</Box>
						))}
					</Box>
				</Box>
			</OverviewCard>

			{/* Stats */}
			<OverviewCard>
				<SectionLabel>Pack Details</SectionLabel>
				<Box display="flex" flexDirection="column" gap="12">
					{[
						{ label: "Templates", value: String(pack.templateCount) },
						{ label: "Assets", value: String(pack.assets.length) },
						{ label: "Created by", value: pack.createdBy },
						{ label: "Last updated", value: new Date(pack.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
						...(pack.sourceFigma ? [{ label: "Source", value: "Figma library" }] : []),
						...(pack.sourceUrl ? [{ label: "Source", value: pack.sourceUrl }] : []),
					].map(({ label, value }) => (
						<Box key={label} alignItems="start" display="flex" justifyContent="space-between" gap="12">
							<Text color="fg.secondary" fontSize="sm">{label}</Text>
							<Text fontSize="sm" fontWeight="500" style={{ textAlign: "right", maxWidth: 200, wordBreak: "break-all" }}>
								{value}
							</Text>
						</Box>
					))}
				</Box>
			</OverviewCard>
		</Box>
	);
}
