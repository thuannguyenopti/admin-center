"use client";

import { Badge, Box, Button, Card, Separator, Tooltip } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { IconPencil, IconRefresh, IconTrash } from "@tabler/icons-react";
import type { ChannelDefinition } from "./channelDefinitions";
import { ChannelIcon } from "./ChannelIcon";

export type ContentItem = {
	id: string;
	name: string;
	locale?: string;
};

type ChannelCardProps = {
	channelDef: ChannelDefinition;
	contentItems: ContentItem[];
	onEdit: () => void;
	onRemove: () => void;
};

export function ChannelCard({ channelDef, contentItems, onEdit, onRemove }: ChannelCardProps) {
	return (
		<Card p="16">
			<Box display="flex" flexDirection="column" gap="12">
				{/* Header */}
				<Box display="flex" alignItems="center" justifyContent="space-between">
					<Box display="flex" alignItems="center" gap="8">
						<ChannelIcon icon={channelDef.icon} size={18} />
						<Text fontWeight="600">
							Sending to {channelDef.name}
						</Text>
					</Box>
					<Box display="flex" alignItems="center" gap="4">
						<Tooltip content="Sync">
							<Button appearance="subtle" size="sm" icon={<IconRefresh size={16} />} />
						</Tooltip>
						<Tooltip content="Edit">
							<Button appearance="subtle" size="sm" icon={<IconPencil size={16} />} onClick={onEdit} />
						</Tooltip>
						<Tooltip content="Remove">
							<Button appearance="subtle" size="sm" icon={<IconTrash size={16} />} onClick={onRemove} />
						</Tooltip>
					</Box>
				</Box>

				{/* Content count */}
				<Text fontSize="sm" color="fg.secondary">
					{contentItems.length} content selected
				</Text>

				{/* Content list */}
				{contentItems.length > 0 && (
					<Box display="flex" flexDirection="column" gap="8">
						{contentItems.map((item) => (
							<Box key={item.id} display="flex" alignItems="center" justifyContent="space-between">
								<Text fontSize="sm">
									{item.name}
								</Text>
								<Badge>{item.locale || "EN"}</Badge>
							</Box>
						))}
					</Box>
				)}

				<Separator />

				{/* Footer */}
				<Text fontSize="xs" color="fg.tertiary">
					TO BE PUBLISHED: Upon task completion
				</Text>
			</Box>
		</Card>
	);
}
