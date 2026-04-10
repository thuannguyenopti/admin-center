"use client";

import { Badge, Box, Button, Card, CardHeader, Separator, Tooltip } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { IconBrowser, IconFileText, IconPencil, IconRefresh, IconTrash } from "@tabler/icons-react";
import type { ChannelDefinition } from "./channelDefinitions";
import { ChannelIcon } from "./ChannelIcon";

export type ContentItem = {
	id: string;
	name: string;
	locale?: string;
	type: "page" | "instance";
};

type ChannelCardProps = {
	channelDef: ChannelDefinition;
	contentItems: ContentItem[];
	onEdit: () => void;
	onRemove: () => void;
};

export function ChannelCard({ channelDef, contentItems, onEdit, onRemove }: ChannelCardProps) {
	return (
		<Card>
			<CardHeader
				addonBefore={<ChannelIcon icon={channelDef.icon} size={18} />}
				description={`${contentItems.length} content selected`}
				addonAfter={
					<>
						<Tooltip content="Sync">
							<Button appearance="subtle" size="sm" icon={<IconRefresh size={16} />} />
						</Tooltip>
						<Tooltip content="Edit">
							<Button appearance="subtle" size="sm" icon={<IconPencil size={16} />} onClick={onEdit} />
						</Tooltip>
						<Tooltip content="Remove">
							<Button appearance="subtle" size="sm" icon={<IconTrash size={16} />} onClick={onRemove} />
						</Tooltip>
					</>
				}
			>
				Sending to {channelDef.name}
			</CardHeader>

			<Box display="flex" flexDirection="column" gap="12" p="16" pt="0">

				{/* Content list */}
				{contentItems.length > 0 && (
					<Box display="flex" flexDirection="column" gap="8">
						{contentItems.map((item) => (
							<Card key={item.id}>
								<CardHeader
									addonBefore={item.type === "page" ? <IconBrowser size={16} /> : <IconFileText size={16} />}
									addonAfter={<Badge>{item.locale || "EN"}</Badge>}
								>
									{item.name}
								</CardHeader>
							</Card>
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
