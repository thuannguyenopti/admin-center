<<<<<<< HEAD
"use client";

import { Box, Badge } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import { IconLink, IconXmark as IconX } from "@optimizely/axiom-icons";

interface ConnectionStatusProps {
	instanceId?: string;
	syncStatus?: "synced" | "out-of-sync" | "manual-override";
	lastSyncedAt?: string;
	onDisconnect?: () => void;
	onSync?: () => void;
}

export default function ConnectionStatus({
	instanceId,
	syncStatus,
	lastSyncedAt,
	onDisconnect,
}: ConnectionStatusProps) {
	if (!instanceId) return null;

	const getBadgeIntent = () => {
		switch (syncStatus) {
			case "synced":
				return "success";
			case "out-of-sync":
				return "warning";
			case "manual-override":
				return "neutral";
			default:
				return "neutral";
		}
	};

	const getStatusLabel = () => {
		switch (syncStatus) {
			case "synced":
				return "Synced";
			case "out-of-sync":
				return "Out of sync";
			case "manual-override":
				return "Manual override";
			default:
				return "Connected";
		}
	};

	return (
		<Box p="12" bg="bg.accent.subtle" rounded="md" mb="16" border="1" borderColor="border.secondary">
			<Box display="flex" alignItems="center" gap="8" mb="8">
				<IconLink size={16} />
				<Text fontSize="sm" fontWeight="600">
					Connected to CMP Content
				</Text>
				<Badge intent={getBadgeIntent()} variant="subtle">
					{getStatusLabel()}
				</Badge>
			</Box>

			<Text fontSize="xs" color="fg.secondary" mb="12">
				Instance: {instanceId}
				{lastSyncedAt && (
					<>
						{" • "}
						Last synced: {new Date(lastSyncedAt).toLocaleString()}
					</>
				)}
			</Text>

			{onDisconnect && (
				<Button size="sm" appearance="subtle" icon={<IconX size={14} />} onClick={onDisconnect}>
					Disconnect
				</Button>
			)}
		</Box>
	);
}
=======
"use client";

import { Box, Badge } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import { IconLink, IconXmark as IconX } from "@optimizely/axiom-icons";

interface ConnectionStatusProps {
	instanceId?: string;
	syncStatus?: "synced" | "out-of-sync" | "manual-override";
	lastSyncedAt?: string;
	onDisconnect?: () => void;
	onSync?: () => void;
}

export default function ConnectionStatus({
	instanceId,
	syncStatus,
	lastSyncedAt,
	onDisconnect,
}: ConnectionStatusProps) {
	if (!instanceId) return null;

	const getBadgeIntent = () => {
		switch (syncStatus) {
			case "synced":
				return "success";
			case "out-of-sync":
				return "warning";
			case "manual-override":
				return "neutral";
			default:
				return "neutral";
		}
	};

	const getStatusLabel = () => {
		switch (syncStatus) {
			case "synced":
				return "Synced";
			case "out-of-sync":
				return "Out of sync";
			case "manual-override":
				return "Manual override";
			default:
				return "Connected";
		}
	};

	return (
		<Box p="12" bg="bg.information.subtle" rounded="md" mb="16" border="1" borderColor="border.secondary">
			<Box display="flex" alignItems="center" gap="8" mb="8">
				<IconLink size={16} />
				<Text fontSize="sm" fontWeight="600">
					Connected to CMP Content
				</Text>
				<Badge intent={getBadgeIntent()} variant="subtle">
					{getStatusLabel()}
				</Badge>
			</Box>

			<Text fontSize="xs" color="fg.secondary" mb="12">
				Instance: {instanceId}
				{lastSyncedAt && (
					<>
						{" • "}
						Last synced: {new Date(lastSyncedAt).toLocaleString()}
					</>
				)}
			</Text>

			{onDisconnect && (
				<Button size="sm" appearance="subtle" icon={<IconX size={14} />} onClick={onDisconnect}>
					Disconnect
				</Button>
			)}
		</Box>
	);
}
>>>>>>> origin/main
