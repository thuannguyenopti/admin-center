"use client";

import {Box, Text, Checkbox} from "@optiaxiom/react";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@optiaxiom/react";
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
						isSelected
							? "var(--ax-colors-fg-default)"
							: "var(--ax-colors-fg-tertiary)"
					}
					style={{flexShrink: 0}}
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
			<DropdownMenu>
				<DropdownMenuTrigger
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
				<DropdownMenuContent align="end">
					<DropdownMenuItem>
						<Box display="flex" alignItems="center" gap="8">
							<IconPen size={16} />
							Rename
						</Box>
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => onEditFile(child.id)}>
						<Box display="flex" alignItems="center" gap="8">
							<IconFile size={16} />
							Edit
						</Box>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Box display="flex" alignItems="center" gap="8">
							<IconDownload size={16} />
							Download
						</Box>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem>
						<Box display="flex" alignItems="center" gap="8">
							<IconLock size={16} />
							Manage Permissions
						</Box>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => onDeleteFile(child.id)} intent="danger">
						<Box display="flex" alignItems="center" gap="8">
							<IconTrashCan size={16} />
							Delete
						</Box>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</Box>
	);
}
