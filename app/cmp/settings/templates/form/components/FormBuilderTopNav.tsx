"use client";

import { useState } from "react";
import { Box, Menu, MenuTrigger, MenuContent } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import {
	IconMenu2,
	IconDots,
	IconArrowBackUp,
	IconArrowForwardUp,
} from "@tabler/icons-react";

interface FormBuilderTopNavProps {
	formTitle: string;
	isLibraryOpen: boolean;
	canUndo: boolean;
	canRedo: boolean;
	onToggleLibrary: () => void;
	onTitleChange: (title: string) => void;
	onUndo: () => void;
	onRedo: () => void;
	onSave: () => void;
	onClose: () => void;
}

export function FormBuilderTopNav({
	formTitle,
	isLibraryOpen,
	canUndo,
	canRedo,
	onToggleLibrary,
	onTitleChange,
	onUndo,
	onRedo,
	onSave,
	onClose,
}: FormBuilderTopNavProps) {
	const [isEditingTitle, setIsEditingTitle] = useState(false);

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

			{/* Right: undo/redo + actions */}
			<Box display="flex" alignItems="center" gap="8">
				{/* Undo */}
				<Button
					appearance="subtle"
					icon={<IconArrowBackUp size={18} />}
					onClick={onUndo}
					aria-label="Undo (⌘Z)"
					title="Undo (⌘Z)"
					disabled={!canUndo}
				/>
				{/* Redo */}
				<Button
					appearance="subtle"
					icon={<IconArrowForwardUp size={18} />}
					onClick={onRedo}
					aria-label="Redo (⌘⇧Z)"
					title="Redo (⌘⇧Z)"
					disabled={!canRedo}
				/>

				<Box style={{ width: 1, height: 24, background: "var(--ax-colors-border-tertiary)" }} />

				<Button appearance="default" onClick={onClose}>
					Close
				</Button>
				<Button appearance="default">Show Preview</Button>
				<Button appearance="primary" onClick={onSave}>
					Save
				</Button>
				<Menu
					options={[
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
