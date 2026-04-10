"use client";

import { useMemo, useState } from "react";
import { Box, Button, Menu, MenuContent, type MenuOption, MenuTrigger } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { IconPlus } from "@tabler/icons-react";
import type { ContentInstance } from "@/app/db/cmpInitialData";
import type { Page } from "@/app/db/initialData";
import type { PublishingChannel, TaskTab } from "../../types";
import { PageHeader } from "../shared/PageHeader";
import { channelDefinitions, getChannelDef } from "./channelDefinitions";
import { ChannelCard, type ContentItem } from "./ChannelCard";
import { EditChannelDialog } from "./EditChannelDialog";

type PublishingPageProps = {
	activeTab: TaskTab;
	channels: PublishingChannel[];
	contentInstances: ContentInstance[];
	onAddChannel: (channelTypeId: string) => void;
	onEditChannel: (channelId: string, contentIds: string[]) => void;
	onRemoveChannel: (channelId: string) => void;
	onTabChange: (tab: string) => void;
	pages: Page[];
	taskTitle: string;
};

/** Extract a display name from a content instance */
function getInstanceName(instance: ContentInstance): string {
	const f = instance.fields;
	return (
		f.headline ||
		f.title ||
		f.subject_line ||
		f.message ||
		f.name ||
		instance.modelDisplayName
	);
}

// Pre-build group objects for each unique channel group
const channelGroups = (() => {
	const groups: Record<string, MenuOption["group"]> = {};
	for (const def of channelDefinitions) {
		if (!groups[def.group]) {
			groups[def.group] = { label: def.group, separator: true };
		}
	}
	return groups;
})();

export function PublishingPage({
	activeTab,
	channels,
	contentInstances,
	onAddChannel,
	onEditChannel,
	onRemoveChannel,
	onTabChange,
	pages,
	taskTitle,
}: PublishingPageProps) {
	const [editingChannelId, setEditingChannelId] = useState<string | null>(null);

	// Build unified content item list from instances + pages
	const allContentItems: ContentItem[] = useMemo(() => {
		const items: ContentItem[] = [];
		for (const instance of contentInstances) {
			items.push({
				id: instance.id,
				name: getInstanceName(instance),
				locale: "EN",
			});
		}
		for (const page of pages) {
			items.push({
				id: page.id,
				name: page.name,
				locale: "EN",
			});
		}
		return items;
	}, [contentInstances, pages]);

	const contentById = useMemo(() => {
		const map = new Map<string, ContentItem>();
		for (const item of allContentItems) {
			map.set(item.id, item);
		}
		return map;
	}, [allContentItems]);

	// Channel IDs already added — exclude from dropdown
	const addedChannelTypeIds = useMemo(
		() => new Set(channels.map((ch) => ch.channelTypeId)),
		[channels],
	);

	// Build grouped menu options using Axiom's group API
	const menuOptions: MenuOption[] = useMemo(() => {
		return channelDefinitions
			.filter((def) => !addedChannelTypeIds.has(def.id))
			.map((def) => ({
				label: def.name,
				group: channelGroups[def.group],
				execute: () => onAddChannel(def.id),
			}));
	}, [addedChannelTypeIds, onAddChannel]);

	const editingChannel = channels.find((ch) => ch.id === editingChannelId);
	const editingChannelDef = editingChannel ? getChannelDef(editingChannel.channelTypeId) : undefined;

	return (
		<Box display="flex" flexDirection="column" h="full">
			<PageHeader activeTab={activeTab} onTabChange={onTabChange} taskTitle={taskTitle} />

			<Box p="24" display="flex" flexDirection="column" gap="16" flex="1">
				{/* Toolbar */}
				<Box display="flex" alignItems="center" justifyContent="flex-end">
					<Menu options={menuOptions} inputVisible="always">
						<MenuTrigger asChild>
							<Button appearance="primary" size="sm" icon={<IconPlus size={16} />}>
								Add Channel
							</Button>
						</MenuTrigger>
						<MenuContent />
					</Menu>
				</Box>

				{/* Channel cards */}
				{channels.length === 0 ? (
					<Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap="8" pt="64">
						<Text color="fg.tertiary" fontSize="md">
							No publishing channels configured
						</Text>
						<Text color="fg.tertiary" fontSize="sm">
							Click &quot;Add Channel&quot; to set up where your content will be published.
						</Text>
					</Box>
				) : (
					<Box display="flex" flexDirection="column" gap="16">
						{channels.map((channel) => {
							const def = getChannelDef(channel.channelTypeId);
							if (!def) return null;

							const items = channel.selectedContentIds
								.map((id) => contentById.get(id))
								.filter(Boolean) as ContentItem[];

							return (
								<ChannelCard
									key={channel.id}
									channelDef={def}
									contentItems={items}
									onEdit={() => setEditingChannelId(channel.id)}
									onRemove={() => onRemoveChannel(channel.id)}
								/>
							);
						})}
					</Box>
				)}
			</Box>

			{/* Edit channel dialog */}
			{editingChannel && editingChannelDef && (
				<EditChannelDialog
					open={!!editingChannelId}
					onClose={() => setEditingChannelId(null)}
					channelDef={editingChannelDef}
					allContent={allContentItems}
					selectedIds={editingChannel.selectedContentIds}
					onSave={(ids) => onEditChannel(editingChannel.id, ids)}
				/>
			)}
		</Box>
	);
}
