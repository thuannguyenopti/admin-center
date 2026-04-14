"use client";

import { useState } from "react";
import {
	Badge,
	Box,
	Button,
	Checkbox,
	Dialog,
	DialogBody,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	Separator,
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import type { ChannelDefinition } from "./channelDefinitions";
import { ChannelIcon } from "./ChannelIcon";
import type { ContentItem } from "./ChannelCard";

type EditChannelDialogProps = {
	open: boolean;
	onClose: () => void;
	channelDef: ChannelDefinition;
	allContent: ContentItem[];
	selectedIds: string[];
	isPublished?: boolean;
	onSave: (contentIds: string[]) => void;
};

export function EditChannelDialog({
	open,
	onClose,
	channelDef,
	allContent,
	selectedIds,
	isPublished = false,
	onSave,
}: EditChannelDialogProps) {
	const [localSelected, setLocalSelected] = useState<Set<string>>(new Set(selectedIds));

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			setLocalSelected(new Set(selectedIds));
		} else {
			onClose();
		}
	};

	const toggleItem = (id: string) => {
		setLocalSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const deselectAll = () => setLocalSelected(new Set());

	const handleSave = () => {
		onSave(Array.from(localSelected));
		onClose();
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<Box display="flex" alignItems="center" gap="8">
						<ChannelIcon icon={channelDef.icon} size={18} />
						{channelDef.name}
					</Box>
				</DialogHeader>
				<DialogBody>
					<Box display="flex" flexDirection="column" gap="12">
						<Box display="flex" alignItems="center" justifyContent="space-between">
							<Text fontSize="sm" color="fg.secondary">
								Posting to {channelDef.name}
							</Text>
							<Button appearance="subtle" size="sm" onClick={deselectAll}>
								Deselect All
							</Button>
						</Box>

						<Separator />

						<Box display="flex" flexDirection="column" gap="8">
							{allContent.map((item) => (
								<Checkbox
									key={item.id}
									checked={localSelected.has(item.id)}
									onCheckedChange={() => toggleItem(item.id)}
								>
									{item.name}
								</Checkbox>
							))}
						</Box>

						<Separator />

						<Box display="flex" alignItems="center" justifyContent="space-between">
							<Box display="flex" alignItems="center" gap="8">
								{isPublished ? (
									<Badge intent="success">Published</Badge>
								) : (
									<>
										<Badge intent="neutral">Pending</Badge>
										<Text fontSize="xs" color="fg.tertiary">
											Will publish upon task completion
										</Text>
									</>
								)}
							</Box>
							<Text fontSize="sm" fontWeight="600">
								{localSelected.size} assets selected
							</Text>
						</Box>
					</Box>
				</DialogBody>
				<DialogFooter>
					<DialogClose asChild>
						<Button appearance="subtle">Cancel</Button>
					</DialogClose>
					<Button appearance="primary" onClick={handleSave}>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
