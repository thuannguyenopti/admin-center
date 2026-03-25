"use client";

import { Box, Badge } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import { IconLink, IconRefresh, IconX } from "@tabler/icons-react";

interface ConnectionStatusProps {
	instanceId?: string;
	syncStatus?: "synced" | "out-of-sync" | "manual-override";
	lastSyncedAt?: string;
	onSync?: () => void;
	onDisconnect?: () => void;
}

export default function ConnectionStatus({
	instanceId,
	syncStatus,
	lastSyncedAt,
	onSync,
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

			<Box display="flex" gap="8">
				{onSync && (
					<Button size="sm" appearance="subtle" icon={<IconRefresh size={14} />} onClick={onSync}>
						Sync Now
					</Button>
				)}
				{onDisconnect && (
					<Button size="sm" appearance="subtle" icon={<IconX size={14} />} onClick={onDisconnect}>
						Disconnect
					</Button>
				)}
			</Box>
		</Box>
	);
}
