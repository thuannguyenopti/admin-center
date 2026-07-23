"use client";

import { useState } from "react";
import { Badge, Box, Button, Text } from "@optiaxiom/react";
import { IconPlus } from "@optimizely/axiom-icons";
import type { BrandAsset, BrandPack } from "../../types";
import { UploadZone } from "./NewTabShared";

type LogoEntry = { asset: BrandAsset; darkBg: boolean };

type Props = { pack: BrandPack; onSave: () => void };

export function LogosSection({ pack, onSave }: Props) {
	const logos = pack.assets.filter((a) => a.type === "logo");
	const [entries, setEntries] = useState<LogoEntry[]>(
		logos.map((a, i) => ({ asset: a, darkBg: i % 2 === 0 }))
	);
	const [isDragOver, setIsDragOver] = useState(false);

	const toggleBg = (id: string) => {
		setEntries((prev) => prev.map((e) => (e.asset.id === id ? { ...e, darkBg: !e.darkBg } : e)));
	};

	return (
		<Box
			bg="bg.default"
			display="flex"
			flexDirection="column"
			id="section-logos"
			overflow="hidden"
			rounded="xl"
			style={{ border: "1px solid rgba(0,0,0,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
		>
			{/* Header bar */}
			<Box alignItems="center" display="flex" justifyContent="space-between" p="24" pb="20">
				<Text color="fg.secondary" fontSize="sm">
					{entries.length} {entries.length === 1 ? "logo" : "logos"}
				</Text>
				<Button appearance="primary" icon={<IconPlus />} size="sm">
					Upload logo
				</Button>
			</Box>

			{/* Logo grid */}
			{entries.length > 0 && (
				<Box
					display="grid"
					gap="16"
					px="24"
					style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
				>
					{entries.map((entry) => (
						<LogoCard
							key={entry.asset.id}
							entry={entry}
							onToggleBg={() => toggleBg(entry.asset.id)}
						/>
					))}
				</Box>
			)}

			{/* Upload zone */}
			<Box p="24" pt="16">
				<UploadZone
					accept="image/svg+xml,image/png,image/jpeg,image/webp"
					hint="SVG, PNG, or WebP. Classify questionable artwork after upload."
					isDragOver={isDragOver}
					label="Drop logo files here"
					onBrowse={() => {}}
					onDragLeave={() => setIsDragOver(false)}
					onDragOver={() => setIsDragOver(true)}
					onDrop={() => { setIsDragOver(false); onSave(); }}
				/>
			</Box>
		</Box>
	);
}

function LogoCard({ entry, onToggleBg }: { entry: LogoEntry; onToggleBg: () => void }) {
	return (
		<Box
			display="flex"
			flexDirection="column"
			overflow="hidden"
			rounded="xl"
			style={{ border: "1px solid rgba(0,0,0,0.1)" }}
		>
			{/* Thumbnail — click to toggle bg */}
			<Box
				alignItems="center"
				display="flex"
				justifyContent="center"
				onClick={onToggleBg}
				style={{
					background: entry.darkBg ? "#1a1a1a" : "var(--ax-colors-bg-secondary)",
					cursor: "pointer",
					height: 160,
					transition: "background 0.2s",
				}}
				title="Click to toggle background"
			>
				<img
					alt={entry.asset.name}
					src={entry.asset.url}
					style={{ maxHeight: 96, maxWidth: "70%", objectFit: "contain" }}
				/>
			</Box>

			{/* Footer */}
			<Box display="flex" flexDirection="column" gap="8" p="12">
				<Text fontWeight="600" style={{ fontSize: 13 }}>
					{entry.asset.name}
				</Text>
				<Box alignItems="center" display="flex" justifyContent="space-between">
					<Box display="flex" gap="6">
						<Badge intent="neutral" variant="subtle" style={{ fontSize: 10 }}>SVG</Badge>
						<Badge intent="success" variant="subtle" style={{ fontSize: 10 }}>LOGO</Badge>
					</Box>
					<Box display="flex" gap="12">
						<Text
							color="fg.tertiary"
							fontSize="xs"
							style={{ cursor: "pointer", textDecoration: "underline" }}
						>
							View
						</Text>
						<Text
							color="fg.tertiary"
							fontSize="xs"
							style={{ cursor: "pointer", textDecoration: "underline" }}
						>
							Download
						</Text>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
