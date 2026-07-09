"use client";

import {Box, Text, Checkbox, Button, Menu, MenuTrigger, MenuContent} from "@optiaxiom/react";
import {
	IconEllipsisSolid,
	IconPen,
	IconFile,
	IconDownload,
	IconLock,
	IconTrashCan,
	IconUser,
	IconUsers,
} from "@optiaxiom/icons";
import {type FileNode, getContentTypeIcon} from "../data/fileTree";

export interface FileTreeItemProps {
	child: FileNode;
	selectedId: string;
	draggingId: string | null;
	bulkMode: boolean;
	selectedFiles: Set<string>;
	onSelect: (id: string) => void;
	onToggleFile: (id: string) => void;
	onEditFile: (id: string) => void;
	onDeleteFile: (id: string) => void;
	onDragStart: (id: string) => void;
	onDragEnd: () => void;
}

export function FileTreeItem({
	child,
	selectedId,
	draggingId,
	bulkMode,
	selectedFiles,
	onSelect,
	onToggleFile,
	onEditFile,
	onDeleteFile,
	onDragStart,
	onDragEnd,
}: FileTreeItemProps) {
	const isSelected = child.id === selectedId;
	const isBulkChecked = selectedFiles.has(child.id);
	const OwnerIcon = child.owner === "team" ? IconUsers : IconUser;
	const ContentIcon = getContentTypeIcon(child.contentType);

	return (
		<Box
			className="ft-row hover:bg-[var(--ax-colors-bg-default-hovered)]"
			display="flex"
			alignItems="center"
			gap="6"
			py="4"
			pr="4"
			rounded="md"
			draggable={!bulkMode}
			style={{
				paddingLeft: 22,
				cursor: bulkMode ? "default" : "pointer",
				background: isSelected ? "var(--ax-colors-bg-default-pressed)" : undefined,
				opacity: draggingId === child.id ? 0.4 : 1,
			}}
			onClick={() => !bulkMode && onSelect(child.id)}
			onDragStart={() => onDragStart(child.id)}
			onDragEnd={onDragEnd}
		>
			{bulkMode ? (
				<span
					onClick={(e) => {
						e.stopPropagation();
						onToggleFile(child.id);
					}}
				>
					<Checkbox
						size="sm"
						checked={isBulkChecked}
						onChange={() => onToggleFile(child.id)}
					/>
				</span>
			) : (
				<ContentIcon
					size={16}
					color={
						isSelected ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-tertiary)"
					}
					style={{flexShrink: 0}}
					filled={isSelected}
				/>
			)}
			<Box
				display="flex"
				alignItems="center"
				gap="4"
				style={{flex: 1, minWidth: 0, overflow: "hidden"}}
			>
				<Text
					fontSize="md"
					color="fg.default"
					fontWeight={isSelected ? "500" : "400"}
					style={{
						minWidth: 0,
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{child.label.replace(/\.[^.]+$/, "")}
				</Text>
				{!bulkMode && (
					<OwnerIcon
						size={16}
						color="var(--ax-colors-fg-tertiary)"
						style={{flexShrink: 0}}
					/>
				)}
			</Box>
			<Menu
				options={[
					{
						label: "Rename",
						addon: <IconPen size={16} />,
					},
					{
						label: "Edit",
						addon: <IconFile size={16} />,
						execute: () => onEditFile(child.id),
					},
					{
						label: "Download",
						addon: <IconDownload size={16} />,
					},
					{
						label: "Manage Permissions",
						addon: <IconLock size={16} />,
						group: {label: "permissions", hidden: true, separator: true},
					},
					{
						label: "Delete",
						addon: <IconTrashCan size={16} />,
						intent: "danger",
						execute: () => onDeleteFile(child.id),
						group: {label: "danger", hidden: true, separator: true},
					},
				]}
			>
				<MenuTrigger asChild>
					<Button
						className="ft-menu-btn"
						onClick={(e) => e.stopPropagation()}
						appearance="subtle"
						size="sm"
						icon={<IconEllipsisSolid size={16} />}
						aria-label="File actions"
						style={{
							width: 22,
							height: 22,
							minWidth: 22,
							padding: 0,
						}}
					/>
				</MenuTrigger>
				<MenuContent align="end" />
			</Menu>
		</Box>
	);
}
