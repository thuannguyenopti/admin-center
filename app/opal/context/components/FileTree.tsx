"use client";

import {useState, useRef} from "react";
import {Box, Text, Checkbox, Button, Menu, MenuTrigger, MenuContent} from "@optiaxiom/react";
import {
	IconAngleDown,
	IconFile,
	IconFolder,
	IconFolderOpen,
	IconEllipsisSolid,
	IconPen,
	IconDownload,
	IconLock,
	IconTrashCan,
} from "@optiaxiom/icons";
import {type FileNode} from "../data/fileTree";
import {FileTreeItem} from "./FileTreeItem";

const FILE_TREE_ROW_STYLES = `
.ft-row { position: relative; }
.ft-row .ft-menu-btn { opacity: 0; pointer-events: none; }
.ft-row:hover .ft-menu-btn { opacity: 1; pointer-events: auto; }
.ft-folder-drop { background: var(--ax-colors-bg-default-pressed) !important; outline: 2px solid var(--ax-colors-border-default); outline-offset: -1px; border-radius: 6px; }
`;

export function FileTree({
	tree,
	selectedId,
	onSelect,
	expandedFolders,
	onToggleFolder,
	bulkMode,
	selectedFiles,
	onToggleFile,
	onToggleFolderSelect,
	onEditFile,
	onDropToFolder,
	onDeleteFile,
}: {
	tree: FileNode[];
	selectedId: string;
	onSelect: (id: string) => void;
	expandedFolders: Set<string>;
	onToggleFolder: (id: string) => void;
	bulkMode: boolean;
	selectedFiles: Set<string>;
	onToggleFile: (id: string) => void;
	onToggleFolderSelect: (childIds: string[]) => void;
	onEditFile: (id: string) => void;
	onDropToFolder: (fileId: string, targetFolderId: string) => void;
	onDeleteFile: (id: string) => void;
}) {
	const [draggingId, setDraggingId] = useState<string | null>(null);
	const [dropFolderId, setDropFolderId] = useState<string | null>(null);
	const draggingIdRef = useRef<string | null>(null);

	return (
		<>
			<style>{FILE_TREE_ROW_STYLES}</style>
			<Box display="flex" flexDirection="column" gap="4">
				{tree.map((node) => {
					const childIds = node.children?.map((c) => c.id) ?? [];
					const checkedCount = childIds.filter((id) => selectedFiles.has(id)).length;
					const allChecked = childIds.length > 0 && checkedCount === childIds.length;
					const someChecked = checkedCount > 0 && !allChecked;
					const isDropTarget = dropFolderId === node.id;

					return (
						<Box key={node.id}>
							{/* Folder row */}
							<Box
								display="flex"
								alignItems="center"
								gap="4"
								py="4"
								pl="4"
								pr="4"
								rounded="md"
								className={`ft-row${isDropTarget ? " ft-folder-drop" : ""}`}
								style={{cursor: "pointer"}}
								onClick={() => onToggleFolder(node.id)}
								onDragOver={(e) => {
									e.preventDefault();
									e.stopPropagation();
									setDropFolderId(node.id);
								}}
								onDragLeave={(e) => {
									e.stopPropagation();
									setDropFolderId(null);
								}}
								onDrop={(e) => {
									e.preventDefault();
									e.stopPropagation();
									if (draggingIdRef.current) {
										onDropToFolder(draggingIdRef.current, node.id);
									}
									setDropFolderId(null);
									setDraggingId(null);
									draggingIdRef.current = null;
								}}
							>
								{bulkMode && (
									<span
										onClick={(e) => {
											e.stopPropagation();
											onToggleFolderSelect(childIds);
										}}
									>
										<Checkbox
											size="sm"
											checked={allChecked}
											indeterminate={someChecked}
											onChange={() => onToggleFolderSelect(childIds)}
										/>
									</span>
								)}
								<IconAngleDown
									size={14}
									color="var(--ax-colors-fg-tertiary)"
									style={{
										transform: expandedFolders.has(node.id)
											? "rotate(0deg)"
											: "rotate(-90deg)",
										transition: "transform 0.15s",
										flexShrink: 0,
									}}
								/>
								{expandedFolders.has(node.id) ? (
									<IconFolderOpen
										size={16}
										color="var(--ax-colors-fg-tertiary)"
										style={{flexShrink: 0}}
									/>
								) : (
									<IconFolder
										size={16}
										color="var(--ax-colors-fg-tertiary)"
										style={{flexShrink: 0}}
									/>
								)}
								<Text
									fontSize="md"
									color="fg.default"
									style={{flex: 1, minWidth: 0}}
								>
									{node.label}
								</Text>
								<Menu
									options={[
										{
											label: "Add File",
											addon: <IconFile size={16} />,
										},
										{
											label: "Add Folder",
											addon: <IconFolder size={16} />,
										},
										{
											label: "Rename",
											addon: <IconPen size={16} />,
											group: {label: "edit", hidden: true, separator: true},
										},
										{
											label: "Download",
											addon: <IconDownload size={16} />,
											group: {label: "edit", hidden: true, separator: true},
										},
										{
											label: "Manage Permissions",
											addon: <IconLock size={16} />,
											group: {
												label: "permissions",
												hidden: true,
												separator: true,
											},
										},
										{
											label: "Delete",
											addon: <IconTrashCan size={16} />,
											intent: "danger",
											execute: () => onDeleteFile(node.id),
											group: {label: "danger", hidden: true, separator: true},
										},
									]}
								>
									<MenuTrigger asChild>
										<Button
											onClick={(e) => e.stopPropagation()}
											appearance="subtle"
											size="sm"
											icon={<IconEllipsisSolid size={16} />}
											aria-label="Folder actions"
										/>
									</MenuTrigger>
									<MenuContent align="end" />
								</Menu>
							</Box>

							{/* Child file rows */}
							{node.children &&
								expandedFolders.has(node.id) &&
								node.children.map((child) => (
									<FileTreeItem
										key={child.id}
										child={child}
										selectedId={selectedId}
										draggingId={draggingId}
										bulkMode={bulkMode}
										selectedFiles={selectedFiles}
										onSelect={onSelect}
										onToggleFile={onToggleFile}
										onEditFile={onEditFile}
										onDeleteFile={onDeleteFile}
										onDragStart={(id) => {
											setDraggingId(id);
											draggingIdRef.current = id;
										}}
										onDragEnd={() => {
											setDraggingId(null);
											setDropFolderId(null);
											draggingIdRef.current = null;
										}}
									/>
								))}
						</Box>
					);
				})}
			</Box>
		</>
	);
}
