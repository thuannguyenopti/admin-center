"use client";

import { Badge, Box, Heading } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { IconCheck, IconCopy, IconLink, IconPlus } from "@optimizely/axiom-icons";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { DamBreadcrumb } from "../components/DamBreadcrumb";
import type { DropZoneLink } from "./data";
import { getAllDropZones, subscribeDropZones } from "./dropZones";
import { getSubmissionsForZone } from "./submissions";

function DropZoneRow({ link }: { link: DropZoneLink }) {
	const [copied, setCopied] = useState(false);
	const submissionCount = getSubmissionsForZone(link.id).length;
	// Real internal route, not a cosmetic domain — resolves correctly wherever this
	// prototype is actually deployed (localhost, PR preview, or production).
	const url = typeof window !== "undefined" ? `${window.location.origin}/dam/drop-zone/${link.token}` : `/dam/drop-zone/${link.token}`;

	return (
		<Box display="flex" alignItems="center" gap="16" px="20" py="16">
			<Box display="flex" flexDirection="column" gap="4" style={{ flex: 1, minWidth: 0 }}>
				<Box display="flex" alignItems="center" gap="8">
					<Text color="fg.default" fontWeight="500" fontSize="md">{link.name}</Text>
					<Badge intent={link.status === "active" ? "success" : "neutral"}>
						{link.status === "active" ? "Active" : "Expired"}
					</Badge>
				</Box>
				<Text color="fg.tertiary" fontSize="sm">
					/dam/drop-zone/{link.token} · {submissionCount} submission{submissionCount === 1 ? "" : "s"} · expires {link.expiresAt}
				</Text>
			</Box>
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
				{copied ? "Copied" : "Copy link"}
			</Button>
		</Box>
	);
}

export default function DropZoneListPage() {
	const router = useRouter();
	const dropZones = useSyncExternalStore(subscribeDropZones, getAllDropZones, getAllDropZones);

	return (
		<Box display="flex" flexDirection="column" style={{ height: "100%" }}>
			<DamBreadcrumb segments={[{ label: "DAM" }, { label: "Drop Zone" }]} />

			<Box display="flex" alignItems="start" justifyContent="space-between" gap="24" px="32" py="24" borderB="1" borderColor="border.secondary" style={{ flexShrink: 0 }}>
				<Box display="flex" flexDirection="column" gap="4">
					<Heading level="1" fontSize="xl">Drop Zone</Heading>
					<Text color="fg.secondary" fontSize="md">
						Branded upload links for external contributors — no DAM account required.
					</Text>
				</Box>
				<Button appearance="primary" size="md" icon={<IconPlus size={16} />} onClick={() => router.push("/dam/drop-zone/new")}>
					New link
				</Button>
			</Box>

			<Box style={{ flex: 1, overflowY: "auto" }}>
				{dropZones.length === 0 ? (
					<Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap="16" style={{ minHeight: 300 }}>
						<Box
							alignItems="center"
							bg="bg.accent.subtle"
							display="flex"
							justifyContent="center"
							rounded="full"
							style={{ width: 64, height: 64 }}
						>
							<IconLink size={28} style={{ color: "var(--ax-colors-fg-accent-strong)" }} />
						</Box>
						<Text color="fg.secondary" fontSize="md">No Drop Zone links yet.</Text>
					</Box>
				) : (
					dropZones.map((link, i) => (
						<Box key={link.id} borderB={i < dropZones.length - 1 ? "1" : undefined} borderColor="border.tertiary">
							<DropZoneRow link={link} />
						</Box>
					))
				)}
			</Box>
		</Box>
	);
}
