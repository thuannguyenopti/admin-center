"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Box, Menu, MenuTrigger, MenuContent, Switch } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import {
	IconMenu2,
	IconDots,
	IconArrowBackUp,
	IconArrowForwardUp,
	IconAlertTriangle,
	IconCode,
} from "@tabler/icons-react";
import { useLayout } from "@/app/context/LayoutContext";

interface FormBuilderTopNavProps {
	formTitle: string;
	isLibraryOpen: boolean;
	canUndo: boolean;
	canRedo: boolean;
	conflictCount: number;
	onToggleLibrary: () => void;
	onTitleChange: (title: string) => void;
	onUndo: () => void;
	onRedo: () => void;
	isActive: boolean;
	onSave: () => void;
	onViewIssues: () => void;
	onShowPreview: () => void;
	onToggleActive: () => void;
	onEditDetails: () => void;
	onClose: () => void;
}

export function FormBuilderTopNav({
	formTitle,
	isLibraryOpen,
	canUndo,
	canRedo,
	conflictCount,
	onToggleLibrary,
	onTitleChange,
	onUndo,
	onRedo,
	isActive,
	onSave,
	onViewIssues,
	onShowPreview,
	onToggleActive,
	onEditDetails,
	onClose,
}: FormBuilderTopNavProps) {
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const pathname = usePathname();
	const { codePanelControls } = useLayout();

	return (
		<Box
			h="56"
			style={{ height: "56px" }}
			px="16"
			borderB="1"
			borderColor="border.tertiary"
			display="flex"
			alignItems="center"
			justifyContent="space-between"
			bg="bg.default"
		>
			{/* Left: sidebar toggle + title */}
			<Box display="flex" alignItems="center" gap="16">
				<Button
					icon={<IconMenu2 />}
					appearance={isLibraryOpen ? "default" : "subtle"}
					aria-label="Toggle Component Library"
					onClick={onToggleLibrary}
				/>
				{isEditingTitle ? (
					<input
						value={formTitle}
						onChange={(e) => onTitleChange(e.target.value)}
						onBlur={() => setIsEditingTitle(false)}
						onKeyDown={(e) => {
							if (e.key === "Enter") setIsEditingTitle(false);
						}}
						autoFocus
						style={{
							border: "none",
							outline: "none",
							fontSize: "18px",
							fontWeight: 600,
							color: "var(--ax-colors-fg-default)",
							background: "transparent",
							minWidth: "160px",
						}}
					/>
				) : (
					<Text
						fontSize="lg"
						fontWeight="600"
						color="fg.default"
						style={{ cursor: "text" }}
						onClick={() => setIsEditingTitle(true)}
					>
						{formTitle}
					</Text>
				)}
			</Box>

			{/* Right: undo/redo + conflict indicator + actions */}
			<Box display="flex" alignItems="center" gap="8">
				<Button
					appearance="subtle"
					icon={<IconArrowBackUp size={18} />}
					onClick={onUndo}
					aria-label="Undo (⌘Z)"
					title="Undo (⌘Z)"
					disabled={!canUndo}
				/>
				<Button
					appearance="subtle"
					icon={<IconArrowForwardUp size={18} />}
					onClick={onRedo}
					aria-label="Redo (⌘⇧Z)"
					title="Redo (⌘⇧Z)"
					disabled={!canRedo}
				/>

				<Button
					appearance="subtle"
					icon={<IconCode size={18} />}
					onClick={() => codePanelControls?.openPanel(pathname)}
					aria-label="Source code"
					title="Source code"
				/>

				<Box style={{ width: 1, height: 24, background: "var(--ax-colors-border-tertiary)" }} />

				{/* Non-disruptive conflict indicator */}
				{conflictCount > 0 && (
					<Button
						appearance="subtle"
						color="fg.warning.strong"
						icon={<IconAlertTriangle size={14} />}
						onClick={onViewIssues}
					>
						{conflictCount} issue{conflictCount === 1 ? "" : "s"} found
					</Button>
				)}

				<Button appearance="default" onClick={onClose}>
					Close
				</Button>
				<Button appearance="default" onClick={onShowPreview}>Show Preview</Button>
				<Button appearance="primary" onClick={onSave}>
					Save
				</Button>
				<Box display="flex" alignItems="center" gap="8">
					<Switch checked={isActive} onCheckedChange={onToggleActive} />
					<Text fontSize="sm" color="fg.secondary">Active</Text>
				</Box>
				<Menu
					options={[
						{ label: "Edit Details",    execute: onEditDetails },
						{ label: "Duplicate",       execute: () => {} },
						{ label: "Export",          execute: () => {} },
						{ label: "Delete template", execute: () => {} },
					]}
				>
					<MenuTrigger asChild>
						<Button
							appearance="subtle"
							icon={<IconDots />}
							aria-label="More options"
						/>
					</MenuTrigger>
					<MenuContent />
				</Menu>
			</Box>
		</Box>
	);
}
